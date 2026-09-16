/**
 * Tài khoản nội bộ.
 *
 * Toàn bộ quy tắc về danh tính nằm ở đây, không rải rác trong handler: tạo,
 * đổi mật khẩu, khoá tạm thời sau nhiều lần sai, vô hiệu hoá. Handler chỉ gọi
 * và dịch kết quả thành phản hồi HTTP.
 */
import db from '../db/index.js';
import config from '../core/config.js';
import { err } from '../core/errors.js';
import { hashPassword, verifyPassword, needsRehash, checkPasswordPolicy } from '../security/password.js';
import { isRole } from '../security/rbac.js';
import { destroyUserSessions } from '../security/session.js';

const PUBLIC_COLUMNS = `id, email, name, role, active, must_change_pw, created_at, last_login_at, locked_until`;

const shape = r => r && {
  id: r.id,
  email: r.email,
  name: r.name,
  role: r.role,
  active: Boolean(r.active),
  mustChangePassword: Boolean(r.must_change_pw),
  createdAt: r.created_at,
  lastLoginAt: r.last_login_at,
  lockedUntil: r.locked_until
};

export const countUsers = () => db.prepare(`SELECT COUNT(*) c FROM users`).get().c;

export const listUsers = () =>
  db.prepare(`SELECT ${PUBLIC_COLUMNS} FROM users ORDER BY id`).all().map(shape);

export const getUser = id =>
  shape(db.prepare(`SELECT ${PUBLIC_COLUMNS} FROM users WHERE id = ?`).get(id));

export const getUserByEmail = email =>
  db.prepare(`SELECT * FROM users WHERE email = ? COLLATE NOCASE`).get(String(email).trim());

export async function createUser({ email, name, password, role = 'viewer', mustChangePassword = true }) {
  email = String(email || '').trim().toLowerCase();
  name = String(name || '').trim().slice(0, 120);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw err.validation('Email chưa hợp lệ.');
  if (name.length < 2) throw err.validation('Họ tên chưa hợp lệ.');
  if (!isRole(role)) throw err.validation('Vai trò không tồn tại.');

  const policy = checkPasswordPolicy(password, { email });
  if (!policy.ok) throw err.validation(policy.errors[0]);

  if (getUserByEmail(email)) throw err.conflict('Email này đã có tài khoản.');

  const hash = await hashPassword(password);
  const r = db.prepare(`
    INSERT INTO users (email, name, password_hash, role, must_change_pw) VALUES (?, ?, ?, ?, ?)
  `).run(email, name, hash, role, mustChangePassword ? 1 : 0);

  return getUser(Number(r.lastInsertRowid));
}

export function updateUser(id, { name, role, active }) {
  const current = db.prepare(`SELECT * FROM users WHERE id = ?`).get(id);
  if (!current) throw err.notFound('Không tìm thấy tài khoản.');
  if (role !== undefined && !isRole(role)) throw err.validation('Vai trò không tồn tại.');

  // Không cho phép hạ cấp hoặc khoá chủ sở hữu cuối cùng — nếu không sẽ không
  // còn ai vào được bảng điều khiển và phải sửa trực tiếp cơ sở dữ liệu.
  const owners = db.prepare(`SELECT COUNT(*) c FROM users WHERE role='owner' AND active=1`).get().c;
  const losingOwner = current.role === 'owner' && ((role !== undefined && role !== 'owner') || active === false);
  if (losingOwner && owners <= 1) {
    throw err.validation('Đây là chủ sở hữu duy nhất còn hoạt động — không thể hạ quyền hoặc khoá.');
  }

  db.prepare(`
    UPDATE users SET
      name       = COALESCE(?, name),
      role       = COALESCE(?, role),
      active     = COALESCE(?, active),
      updated_at = datetime('now')
    WHERE id = ?
  `).run(
    name === undefined ? null : String(name).trim().slice(0, 120),
    role === undefined ? null : role,
    active === undefined ? null : (active ? 1 : 0),
    id
  );

  // Khoá hoặc đổi vai trò phải có hiệu lực ngay, không đợi phiên hết hạn.
  if (active === false || (role !== undefined && role !== current.role)) destroyUserSessions(id);

  return getUser(id);
}

export async function setPassword(id, plain, { mustChange = false } = {}) {
  const u = db.prepare(`SELECT email FROM users WHERE id = ?`).get(id);
  if (!u) throw err.notFound('Không tìm thấy tài khoản.');

  const policy = checkPasswordPolicy(plain, { email: u.email });
  if (!policy.ok) throw err.validation(policy.errors[0]);

  db.prepare(`
    UPDATE users SET password_hash = ?, must_change_pw = ?, failed_count = 0, locked_until = NULL,
                     updated_at = datetime('now')
    WHERE id = ?
  `).run(await hashPassword(plain), mustChange ? 1 : 0, id);

  destroyUserSessions(id);
}

export function deleteUser(id) {
  const u = db.prepare(`SELECT role FROM users WHERE id = ?`).get(id);
  if (!u) throw err.notFound('Không tìm thấy tài khoản.');
  if (u.role === 'owner') throw err.validation('Không xoá được tài khoản chủ sở hữu. Hãy hạ quyền trước.');
  destroyUserSessions(id);
  db.prepare(`DELETE FROM users WHERE id = ?`).run(id);
}

/**
 * Xác thực đăng nhập.
 *
 * Luôn tốn một lượt băm kể cả khi email không tồn tại, để thời gian phản hồi
 * không tiết lộ email nào đã đăng ký.
 */
const DUMMY_HASH = 'scrypt$32768$8$1$AAAAAAAAAAAAAAAAAAAAAA==$' + 'AAAA';

export async function authenticate({ email, password }) {
  const user = getUserByEmail(email || '');

  if (user?.locked_until && new Date(user.locked_until.replace(' ', 'T') + 'Z') > new Date()) {
    throw err.locked('Tài khoản tạm thời bị khoá do đăng nhập sai nhiều lần. Vui lòng thử lại sau.');
  }

  const ok = await verifyPassword(String(password || ''), user?.password_hash || DUMMY_HASH);

  if (!user || !ok) {
    if (user) registerFailure(user);
    throw err.badCredentials();
  }
  if (!user.active) throw err.forbidden('Tài khoản đã bị vô hiệu hoá.');

  db.prepare(`
    UPDATE users SET failed_count = 0, locked_until = NULL, last_login_at = datetime('now') WHERE id = ?
  `).run(user.id);

  // Tham số băm đã được nâng cấp kể từ lần đặt mật khẩu → băm lại âm thầm.
  if (needsRehash(user.password_hash)) {
    hashPassword(String(password))
      .then(h => db.prepare(`UPDATE users SET password_hash = ? WHERE id = ?`).run(h, user.id))
      .catch(() => {});
  }

  return getUser(user.id);
}

function registerFailure(user) {
  const count = user.failed_count + 1;
  const lock = count >= config.security.maxLoginAttempts;
  const until = lock
    ? new Date(Date.now() + config.security.lockoutSeconds * 1000).toISOString().slice(0, 19).replace('T', ' ')
    : null;
  db.prepare(`UPDATE users SET failed_count = ?, locked_until = ? WHERE id = ?`)
    .run(lock ? 0 : count, until, user.id);
}
