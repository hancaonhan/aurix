/**
 * API công khai — những điểm cuối website gọi mà không cần đăng nhập.
 *
 * Nguyên tắc chung cho mọi tuyến ở đây: giới hạn tần suất theo IP đã băm, kiểm
 * tra và làm sạch từng trường, không bao giờ để một dịch vụ chậm (SMTP) làm
 * hỏng phản hồi trả cho khách.
 */
import { validateLead, validateAnswers } from '../lib/validate.js';
import { scoreDiagnostic } from '../lib/scoring.js';
import { saveLead, saveDiagnostic, logEvent } from '../lib/db.js';
import { queueLeadNotification, queueDiagnosticReport, drainOutbox } from '../lib/mailer.js';
import { publicSettings, getSetting } from '../services/settings.js';
import { schemaStatus } from '../db/index.js';
import { err } from '../core/errors.js';
import config from '../core/config.js';

/**
 * Kết quả chẩn đoán gần nhất theo từng khách, giữ tạm để đính vào báo cáo khi
 * họ để lại email ngay sau đó. Hết hạn sau một giờ.
 */
const recentDiagnostics = new Map();
setInterval(() => {
  const cutoff = Date.now() - 3600_000;
  for (const [k, v] of recentDiagnostics) if (v.at < cutoff) recentDiagnostics.delete(k);
}, 600_000).unref();

export function register(router) {
  /* ---------- Sức khoẻ hệ thống ---------- *
   * Cố ý trả về rất ít thông tin: điểm cuối này công khai nên không được tiết
   * lộ phiên bản thư viện, đường dẫn hay trạng thái nội bộ.                  */
  router.get('/api/health', ctx => ctx.json(200, {
    ok: true,
    uptime: Math.round(process.uptime()),
    schema: schemaStatus().latest
  }));

  /* ---------- Tham số site cho frontend ---------- */
  router.get('/api/site', ctx => ctx.json(200,
    { ok: true, site: publicSettings() },
    { 'Cache-Control': 'public, max-age=60' }
  ), { rateLimit: 'api' });

  /* ---------- Chấm điểm chẩn đoán ---------- */
  router.post('/api/diagnostic', async ctx => {
    const body = await ctx.body();
    const answers = validateAnswers(body.answers);
    if (!Object.keys(answers).length) throw err.validation('Chưa có câu trả lời nào.');

    const result = scoreDiagnostic(answers, { leakCapPercent: getSetting('diagnostic.leakCapPercent') });

    try {
      saveDiagnostic({
        industry: result.industry,
        revenue: Number(answers.revenue) || null,
        overall: result.overall,
        tier: result.tier.key,
        layers: result.layers,
        answers,
        leakMonth: result.leak.monthlyMillions,
        ipHash: ctx.ipHash
      });
    } catch (e) {
      // Không lưu được thì vẫn phải trả kết quả cho khách — số liệu nội bộ
      // không quan trọng bằng trải nghiệm của người đang ngồi trước màn hình.
      ctx.log.error('Không lưu được kết quả chẩn đoán', { error: e.message });
    }

    recentDiagnostics.set(ctx.ipHash, { at: Date.now(), result });
    return ctx.json(200, { ok: true, result });
  }, { rateLimit: 'diagnostic', csrf: false });

  /* ---------- Nhận thông tin khách tiềm năng ---------- */
  router.post('/api/lead', async ctx => {
    const body = await ctx.body();
    const v = validateLead(body);

    // Bot rơi vào bẫy trường ẩn: trả về như thành công để không lộ cơ chế.
    if (v.spam) {
      logEvent('spam_blocked', { ipHash: ctx.ipHash });
      return ctx.json(200, { ok: true, message: 'Đã nhận.' });
    }
    if (!v.ok) throw err.validation(v.errors[0]);

    let id;
    try {
      id = saveLead({ ...v.value, ipHash: ctx.ipHash, userAgent: ctx.userAgent });
    } catch (e) {
      ctx.log.error('Không lưu được khách tiềm năng', { error: e.message });
      throw err.internal({ stage: 'saveLead' });
    }

    ctx.log.info('Khách tiềm năng mới', { id, source: v.value.source });
    logEvent('lead_created', { id, source: v.value.source });

    // Thư chỉ được xếp vào hàng đợi ở đây; một tiến trình nền lo việc gửi.
    try {
      queueLeadNotification(v.value, id, { inbox: getSetting('lead.notifyInbox') });
      const cached = recentDiagnostics.get(ctx.ipHash);
      if (v.value.source === 'diagnostic' && cached && getSetting('lead.autoReply')) {
        queueDiagnosticReport(v.value, id, cached.result);
      }
    } catch (e) {
      ctx.log.error('Không xếp được thư vào hàng đợi', { error: e.message });
    }
    setImmediate(() => { drainOutbox().catch(() => {}); });

    return ctx.json(201, {
      ok: true,
      id,
      message: v.value.source === 'diagnostic'
        ? 'Đã nhận. Báo cáo đầy đủ đang được gửi tới email của bạn.'
        : 'Đã nhận. Aurix sẽ liên hệ với bạn trong vòng một ngày làm việc.'
    });
  }, { rateLimit: 'lead', csrf: false });

  /* ---------- Thông tin phiên bản, cho theo dõi triển khai ---------- */
  router.get('/api/version', ctx => ctx.json(200, {
    ok: true,
    name: 'aurix-backend',
    env: config.env,
    schema: schemaStatus().latest
  }));
}
