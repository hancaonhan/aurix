/**
 * Số liệu, cấu hình site, hàng đợi thư, nhật ký kiểm toán, trạng thái hệ thống.
 */
import * as leadsService from '../services/leads.js';
import { listAudit } from '../services/audit.js';
import { audit } from '../services/audit.js';
import { grouped, setSettings, allSettings } from '../services/settings.js';
import { mailStats } from '../lib/db.js';
import { all, one, run } from '../db/index.js';
import { mailEnabled, drainOutbox } from '../lib/mailer.js';
import { schemaStatus } from '../db/index.js';
import { size as rateLimitSize } from '../security/ratelimit.js';
import { purgeExpiredSessions } from '../security/session.js';
import config from '../core/config.js';
import { liveIndustries } from '../../site/data/content.js';

export function register(router) {
  /* ---------- Bảng số liệu ---------- */
  router.get('/api/console/stats', async ctx => ctx.json(200, {
    ok: true,
    summary: await leadsService.summary(),
    industries: liveIndustries().map(i => ({ key: i.key, label: i.label }))
  }), { permission: 'stats.read', rateLimit: 'api' });

  /* ---------- Kết quả chẩn đoán ---------- */
  router.get('/api/console/diagnostics', async ctx => {
    const limit = Math.min(Number(ctx.query.limit) || 50, 500);
    const [rows, total] = await Promise.all([
      all(`
        SELECT id, created_at, industry, revenue, overall, tier, leak_month
        FROM diagnostics ORDER BY id DESC LIMIT $1 OFFSET $2
      `, [limit, Number(ctx.query.offset) || 0]),
      one(`SELECT COUNT(*) c FROM diagnostics`)
    ]);
    return ctx.json(200, { ok: true, rows, total: total.c });
  }, { permission: 'diagnostics.read' });

  /* ---------- Cấu hình site ---------- */
  router.get('/api/console/settings', ctx =>
    ctx.json(200, { ok: true, groups: grouped() }), { permission: 'settings.read' });

  router.put('/api/console/settings', async ctx => {
    const patch = await ctx.body();
    /* `allSettings()` trả về đối tượng đệm; `setSettings` nạp lại đệm thành một
       đối tượng MỚI, nên `before` vẫn giữ nguyên giá trị cũ để so sánh. */
    const before = allSettings();
    const after = await setSettings(patch, ctx.user.id);

    // Ghi lại đúng những khoá đã thực sự đổi giá trị, kèm giá trị cũ — đây là
    // thứ cần có khi ai đó hỏi "hôm qua ai tắt lớp cá nhân hoá".
    const changed = Object.keys(patch).filter(k => before[k] !== after[k])
      .map(k => ({ key: k, from: before[k], to: after[k] }));
    if (changed.length) {
      audit({ actor: ctx.user, action: 'settings.update', detail: { changed }, ipHash: ctx.ipHash });
    }

    return ctx.json(200, { ok: true, groups: grouped(), changed: changed.length });
  }, { permission: 'settings.write' });

  /* ---------- Hàng đợi thư ---------- */
  router.get('/api/console/mail', async ctx => {
    const [rows, stats] = await Promise.all([
      all(`
        SELECT id, created_at, kind, recipient, subject, status, attempts, last_error, sent_at
        FROM outbox ORDER BY id DESC LIMIT 100
      `),
      mailStats()
    ]);
    return ctx.json(200, { ok: true, enabled: mailEnabled, stats, rows });
  }, { permission: 'mail.read' });

  router.post('/api/console/mail/retry', async ctx => {
    // Đưa mọi thư đã bỏ cuộc trở lại hàng đợi rồi đẩy ngay một lượt.
    const requeued = await run(`
      UPDATE outbox SET status='pending', attempts=0, next_try_at=now() WHERE status='failed'
    `) || 0;
    audit({ actor: ctx.user, action: 'mail.retry', detail: { count: requeued }, ipHash: ctx.ipHash });
    await drainOutbox().catch(() => {});
    return ctx.json(200, { ok: true, requeued, stats: await mailStats() });
  }, { permission: 'mail.retry' });

  /* ---------- Nhật ký kiểm toán ---------- */
  router.get('/api/console/audit', async ctx => ctx.json(200, {
    ok: true,
    rows: await listAudit({
      limit: Math.min(Number(ctx.query.limit) || 200, 1000),
      offset: Number(ctx.query.offset) || 0,
      action: ctx.query.action,
      actorId: ctx.query.actorId ? Number(ctx.query.actorId) : undefined
    })
  }), { permission: 'audit.read' });

  /* ---------- Trạng thái hệ thống ---------- *
   * Chỉ mở cho quyền `system.read`: những con số ở đây (đường dẫn tệp, kích
   * thước cơ sở dữ liệu) có ích cho người vận hành và cũng có ích cho kẻ tấn
   * công, nên không bao giờ nằm ở điểm cuối công khai.                       */
  router.get('/api/console/system', async ctx => {
    /* Kích thước cơ sở dữ liệu giờ hỏi chính Postgres, không còn đo tệp trên
       đĩa — CSDL nằm ở một dịch vụ khác, máy chủ web không thấy tệp nào. */
    let dbSize = null;
    let dbHost = null;
    try {
      const r = await one(`
        SELECT pg_database_size(current_database()) AS bytes,
               inet_server_addr()::text AS host,
               current_setting('server_version') AS version
      `);
      dbSize = r.bytes;
      dbHost = { host: r.host, version: r.version };
    } catch { /* không nối được CSDL */ }

    const mem = process.memoryUsage();
    return ctx.json(200, {
      ok: true,
      system: {
        env: config.env,
        node: process.version,
        uptimeSeconds: Math.round(process.uptime()),
        memoryMb: Math.round(mem.rss / 1048576),
        database: dbHost,
        dbSizeMb: dbSize === null ? null : Number((dbSize / 1048576).toFixed(2)),
        schema: await schemaStatus(),
        rateLimitBuckets: rateLimitSize(),
        mailEnabled,
        activeSessions: (await one(`SELECT COUNT(*) c FROM sessions WHERE expires_at > now()`)).c,
        trustProxy: config.trustProxy,
        origin: config.origin
      }
    });
  }, { permission: 'system.read' });

  /* ---------- Dọn dẹp thủ công ---------- */
  router.post('/api/console/system/purge-sessions', async ctx => {
    const n = await purgeExpiredSessions();
    audit({ actor: ctx.user, action: 'system.purge.sessions', detail: { removed: n }, ipHash: ctx.ipHash });
    return ctx.json(200, { ok: true, removed: n });
  }, { permission: 'system.write' });
}
