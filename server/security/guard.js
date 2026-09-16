/**
 * Cổng bảo vệ — xác thực và phân quyền cho từng tuyến.
 *
 * Mọi tuyến đều đi qua đây một lần, trước handler. Điều quan trọng về mặt an
 * toàn: quyền được kiểm tra **tập trung theo khai báo của tuyến**, không phải
 * bằng mấy dòng `if` rải trong từng handler — quên một dòng `if` là mở toang một
 * điểm cuối, còn quên khai báo `permission` thì tuyến vẫn bị mặc định chặn.
 */
import { timingSafeEqual } from 'node:crypto';
import config from '../core/config.js';
import { err } from '../core/errors.js';
import { readSession } from './session.js';
import { verifyCsrf } from './csrf.js';
import { can } from './rbac.js';
import { hit } from './ratelimit.js';
import { audit } from '../services/audit.js';

/**
 * Tuỳ chọn tuyến:
 *   auth: true              bắt buộc đăng nhập
 *   permission: 'leads.read' bắt buộc quyền (kéo theo auth)
 *   apiKey: true            cho phép thay phiên bằng khoá API máy-với-máy
 *   csrf: false             bỏ kiểm CSRF (chỉ dùng cho biểu mẫu công khai)
 *   rateLimit: {max, windowMs} | 'lead' | 'api'
 */
export async function guard(ctx, options = {}) {
  /* ---------- Giới hạn tần suất ---------- */
  const rl = typeof options.rateLimit === 'string'
    ? config.rateLimits[options.rateLimit]
    : options.rateLimit;
  if (rl) {
    const bucket = `${options.rateLimitKey || ctx.pathname}:${ctx.ipHash}`;
    const r = hit(bucket, rl);
    ctx.setHeader('X-RateLimit-Remaining', String(r.remaining));
    if (!r.ok) {
      ctx.setHeader('Retry-After', String(r.retryAfter));
      throw err.rateLimited(r.retryAfter);
    }
  }

  const needsAuth = Boolean(options.auth || options.permission);

  /* ---------- Khoá API máy-với-máy ---------- */
  if (options.apiKey && config.security.apiKeys.length) {
    const key = String(ctx.req.headers['x-aurix-key'] || '');
    if (key && matchesAnyKey(key)) {
      ctx.viaApiKey = true;
      // Khoá API mang quyền của một "người dùng máy" cố định, và chỉ đọc.
      ctx.user = { id: 0, email: 'api-key', name: 'Tích hợp', role: 'viewer', active: true };
      if (options.permission && !can(ctx.user, options.permission)) {
        throw err.forbidden('Khoá API không có quyền thực hiện việc này.');
      }
      return;
    }
  }

  /* ---------- Phiên đăng nhập ---------- */
  const session = readSession(ctx.req.headers.cookie, { userAgent: ctx.userAgent });
  if (session) {
    ctx.session = session;
    ctx.user = session.user;
    if (session.refreshedCookie) ctx.setHeader('Set-Cookie', session.refreshedCookie);
  }

  if (needsAuth && !ctx.user) throw err.unauthorized();

  /* ---------- CSRF ---------- *
   * Chỉ áp cho request dùng cookie: khoá API không bị trình duyệt tự đính kèm
   * nên không có bề mặt tấn công CSRF.                                      */
  if (ctx.session && options.csrf !== false) {
    verifyCsrf(ctx.req, ctx.session);
  }

  /* ---------- Quyền ---------- */
  if (options.permission && !can(ctx.user, options.permission)) {
    audit({
      actor: ctx.user, action: 'access.denied', target: ctx.pathname,
      detail: { permission: options.permission }, ipHash: ctx.ipHash, result: 'denied'
    });
    throw err.forbidden();
  }

  /* ---------- Buộc đổi mật khẩu ---------- *
   * Tài khoản đang mang mật khẩu tạm chỉ được gọi đúng những tuyến cần thiết
   * để tự đổi mật khẩu; mọi tuyến khác bị chặn cho tới khi đổi xong.         */
  if (ctx.user?.mustChangePassword && options.allowPasswordChange !== true) {
    throw Object.assign(err.forbidden('Bạn cần đổi mật khẩu trước khi tiếp tục.'), {
      code: 'PASSWORD_CHANGE_REQUIRED'
    });
  }
}

function matchesAnyKey(key) {
  const given = Buffer.from(key);
  return config.security.apiKeys.some(k => {
    const expected = Buffer.from(k);
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
}
