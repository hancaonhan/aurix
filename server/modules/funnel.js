/**
 * Đo phễu: điểm nhận sự kiện từ website và báo cáo cho bảng điều khiển.
 */
import { track, report, isKind } from '../services/funnel.js';

// Máy thu thập nội dung không phải khách; đếm vào sẽ làm lệch tỉ lệ chuyển đổi.
const BOT_RE = /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|zalo.*link/i;

export function register(router) {
  /* Trình duyệt gửi bằng navigator.sendBeacon nên không đọc phản hồi; luôn trả
     cùng một phản hồi để không lộ việc sự kiện nào bị bỏ qua và vì sao. */
  router.post('/api/track', async ctx => {
    const body = await ctx.body().catch(() => ({}));
    if (!BOT_RE.test(ctx.userAgent) && isKind(body.k)) await track(body.k, body.p);
    return ctx.json(200, { ok: true });
  }, { rateLimit: 'api', rateLimitKey: 'track', csrf: false });

  router.get('/api/console/funnel', async ctx => ctx.json(200, {
    ok: true,
    ...(await report(ctx.query.days))
  }), { permission: 'stats.read', rateLimit: 'api' });
}
