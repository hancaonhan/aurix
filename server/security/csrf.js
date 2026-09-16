/**
 * Chống giả mạo yêu cầu liên site (CSRF).
 *
 * Hai lớp độc lập, chỉ cần một lớp đứng vững là tấn công thất bại:
 *   1. Đối chiếu Origin/Referer với origin công khai — chặn được cả trường hợp
 *      trình duyệt cũ không hiểu SameSite.
 *   2. Mã CSRF gắn theo phiên, client gửi lại qua header `X-Aurix-CSRF`.
 *
 * Chỉ áp dụng cho phiên bằng cookie. Request dùng khoá API (máy-với-máy) không
 * bị ảnh hưởng vì trình duyệt không tự đính kèm khoá API.
 */
import { timingSafeEqual } from 'node:crypto';
import config from '../core/config.js';
import { err } from '../core/errors.js';

const UNSAFE = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export const CSRF_HEADER = 'x-aurix-csrf';

export function verifyCsrf(req, session) {
  if (!UNSAFE.has(req.method)) return;

  /* --- Lớp 1: Origin --- */
  const origin = req.headers.origin;
  if (origin) {
    const allowed = new Set([config.origin, ...config.security.corsOrigins]);
    if (config.isDev) {
      allowed.add(`http://localhost:${config.port}`);
      allowed.add(`http://127.0.0.1:${config.port}`);
    }
    if (!allowed.has(origin)) throw err.csrf();
  }

  /* --- Lớp 2: mã theo phiên --- */
  const sent = String(req.headers[CSRF_HEADER] || '');
  const expected = session?.csrfToken || '';
  if (!sent || !expected || sent.length !== expected.length) throw err.csrf();
  if (!timingSafeEqual(Buffer.from(sent), Buffer.from(expected))) throw err.csrf();
}
