/**
 * Phiên đăng nhập.
 *
 * Chọn phiên lưu phía máy chủ thay vì JWT: bảng điều khiển nội bộ cần thu hồi
 * quyền **tức thì** (khoá tài khoản, đăng xuất mọi thiết bị) — điều mà token
 * tự chứa không làm được nếu chưa hết hạn.
 *
 * Bảo vệ đã cài:
 *   - mã phiên ngẫu nhiên 32 byte, cơ sở dữ liệu chỉ lưu **băm SHA-256**;
 *     lộ tệp .db cũng không mạo danh được phiên nào
 *   - cookie HttpOnly + SameSite=Lax + Secure (ở môi trường HTTPS), có chữ ký
 *     HMAC để loại sớm cookie rác mà không cần chạm cơ sở dữ liệu
 *   - mỗi phiên mang một mã CSRF riêng
 *   - phiên gắn với dấu vân tay trình duyệt; đổi User-Agent thì phiên bị huỷ
 */
import { randomBytes, createHash, createHmac, timingSafeEqual } from 'node:crypto';
import db from '../db/index.js';
import config from '../core/config.js';

export const COOKIE_NAME = 'aurix_sid';

const sha256 = s => createHash('sha256').update(s).digest('hex');
const sign = v => createHmac('sha256', config.security.sessionSecret).update(v).digest('base64url');

/* ---------- Cookie ---------- */
export function parseCookies(header = '') {
  const out = {};
  for (const part of String(header).split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    out[part.slice(0, eq).trim()] = decodeURIComponent(part.slice(eq + 1).trim());
  }
  return out;
}

function serializeCookie(name, value, { maxAge, secure, expire = false } = {}) {
  const bits = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax'
  ];
  if (secure) bits.push('Secure');
  bits.push(expire ? 'Max-Age=0' : `Max-Age=${maxAge}`);
  return bits.join('; ');
}

/* ---------- Câu lệnh chuẩn bị sẵn ---------- */
const stmtInsert = db.prepare(`
  INSERT INTO sessions (id, user_id, expires_at, csrf_token, ip_hash, user_agent)
  VALUES (?, ?, datetime('now', ?), ?, ?, ?)
`);
const stmtFind = db.prepare(`
  SELECT s.*, u.email, u.name AS user_name, u.role, u.active, u.must_change_pw
  FROM sessions s JOIN users u ON u.id = s.user_id
  WHERE s.id = ? AND s.expires_at > datetime('now')
`);
const stmtTouch = db.prepare(`
  UPDATE sessions SET last_seen = datetime('now'), expires_at = datetime('now', ?) WHERE id = ?
`);
const stmtDelete = db.prepare(`DELETE FROM sessions WHERE id = ?`);
const stmtDeleteUser = db.prepare(`DELETE FROM sessions WHERE user_id = ?`);

/**
 * Mở phiên mới.
 * @returns {{ cookie: string, csrfToken: string }} chuỗi Set-Cookie và mã CSRF
 */
export function createSession({ userId, ipHash, userAgent }) {
  const raw = randomBytes(32).toString('base64url');
  const id = sha256(raw);
  const csrfToken = randomBytes(24).toString('base64url');
  const ttl = config.security.sessionTtl;

  stmtInsert.run(id, userId, `+${ttl} seconds`, csrfToken, ipHash || null, fingerprint(userAgent));

  // Giá trị cookie = mã gốc + chữ ký. Chữ ký để loại cookie giả ngay ở tầng
  // HTTP, tiết kiệm một lượt truy vấn cơ sở dữ liệu cho mọi request rác.
  const value = `${raw}.${sign(raw)}`;
  return {
    cookie: serializeCookie(COOKIE_NAME, value, { maxAge: ttl, secure: config.security.secureCookies }),
    csrfToken
  };
}

/** Đọc phiên từ header Cookie. Trả về null nếu không hợp lệ, hết hạn hoặc bị khoá. */
export function readSession(cookieHeader, { userAgent } = {}) {
  const raw = parseCookies(cookieHeader)[COOKIE_NAME];
  if (!raw) return null;

  const dot = raw.lastIndexOf('.');
  if (dot === -1) return null;
  const token = raw.slice(0, dot);
  const mac = raw.slice(dot + 1);

  const expected = sign(token);
  if (mac.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;

  const row = stmtFind.get(sha256(token));
  if (!row) return null;
  if (!row.active) { stmtDeleteUser.run(row.user_id); return null; }

  // Đổi trình duyệt giữa chừng là dấu hiệu cookie bị đánh cắp — huỷ phiên.
  if (row.user_agent && row.user_agent !== fingerprint(userAgent)) {
    stmtDelete.run(row.id);
    return null;
  }

  let refreshed = null;
  if (config.security.sessionRolling) {
    stmtTouch.run(`+${config.security.sessionTtl} seconds`, row.id);
    refreshed = serializeCookie(COOKIE_NAME, raw, {
      maxAge: config.security.sessionTtl, secure: config.security.secureCookies
    });
  }

  return {
    id: row.id,
    csrfToken: row.csrf_token,
    refreshedCookie: refreshed,
    user: {
      id: row.user_id,
      email: row.email,
      name: row.user_name,
      role: row.role,
      active: Boolean(row.active),
      mustChangePassword: Boolean(row.must_change_pw)
    }
  };
}

export function destroySession(sessionId) {
  if (sessionId) stmtDelete.run(sessionId);
}

/** Đăng xuất một tài khoản khỏi mọi thiết bị — dùng khi khoá hoặc đổi mật khẩu. */
export function destroyUserSessions(userId) {
  stmtDeleteUser.run(userId);
}

export function listUserSessions(userId) {
  return db.prepare(`
    SELECT id, created_at, last_seen, expires_at FROM sessions
    WHERE user_id = ? AND expires_at > datetime('now') ORDER BY last_seen DESC
  `).all(userId);
}

export const clearCookie = () =>
  serializeCookie(COOKIE_NAME, '', { secure: config.security.secureCookies, expire: true });

/** Dấu vân tay trình duyệt — băm ngắn, không lưu chuỗi User-Agent đầy đủ. */
const fingerprint = ua => (ua ? sha256(String(ua)).slice(0, 16) : null);

/** Dọn phiên hết hạn. Gọi định kỳ từ server. */
export function purgeExpiredSessions() {
  const r = db.prepare(`DELETE FROM sessions WHERE expires_at <= datetime('now')`).run();
  return Number(r.changes || 0);
}
