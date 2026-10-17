/**
 * Mã đặt lại mật khẩu gửi qua email.
 *
 * Không cần bảng riêng: mã = (id, hạn dùng, chữ ký). Chữ ký là HMAC của id,
 * hạn dùng VÀ chuỗi băm mật khẩu hiện tại, ký bằng bí mật phiên. Hệ quả:
 *   - hết hạn sau TTL;
 *   - chỉ dùng được một lần: đặt mật khẩu xong thì chuỗi băm đổi, chữ ký cũ
 *     không còn khớp — kể cả link thứ hai gửi trước đó cũng chết theo;
 *   - đổi AURIX_SESSION_SECRET là vô hiệu hoá mọi link đang lưu hành.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';
import config from '../core/config.js';

export const RESET_TTL_MIN = 60;

const sign = (id, exp, passwordHash) => createHmac('sha256', config.security.sessionSecret)
  .update(`password-reset:${id}:${exp}:${passwordHash}`).digest('base64url');

/** @param {{id:number, password_hash:string}} user  bản ghi đầy đủ từ CSDL */
export function resetToken(user) {
  const exp = Date.now() + RESET_TTL_MIN * 60_000;
  return `${user.id}.${exp}.${sign(user.id, exp, user.password_hash)}`;
}

/** Tách mã thành id; chưa kiểm chữ ký (cần bản ghi người dùng để kiểm). */
export function parseResetToken(token) {
  const m = /^(\d{1,10})\.(\d{13})\.([\w-]{40,50})$/.exec(String(token || ''));
  return m ? { id: Number(m[1]), exp: Number(m[2]), sig: m[3] } : null;
}

export function verifyResetToken(parsed, user) {
  if (!parsed || !user || parsed.id !== user.id || Date.now() > parsed.exp) return false;
  const expected = Buffer.from(sign(user.id, parsed.exp, user.password_hash));
  const got = Buffer.from(parsed.sig);
  return expected.length === got.length && timingSafeEqual(expected, got);
}
