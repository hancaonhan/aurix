/**
 * Tài khoản nội bộ.
 *
 * Toàn bộ quy tắc về danh tính nằm ở đây, không rải rác trong handler: tạo,
 * đổi mật khẩu, khoá tạm thời sau nhiều lần sai, vô hiệu hoá. Handler chỉ gọi
 * và dịch kết quả thành phản hồi HTTP.
 *
 * Mọi hàm ở đây **bất đồng bộ** — `pg` không có API đồng bộ. Nơi gọi phải `await`.
 */
import { all, one, run } from '../db/index.js';
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

export const countUsers = async () => (await one(`SELECT COUNT(*) c FROM users`)).c;

export const listUsers = async () =>
  (await all(`SELECT ${PUBLIC_COLUMNS} FROM users ORDER BY id`)).map(shape);

export const getUser = async id =>
  shape(await one(`SELECT ${PUBLIC_COLUMNS} FROM users WHERE id = $1`, [id]));

/* Tra theo email không phân biệt hoa thường. Dùng `lower(email)` cả hai phía để
   index duy nhất `idx_users_email` (đặt trên biểu thức) được dùng tới. */
export const getUserByEmail = email =>
  one(`SELECT * FROM users WHERE lower(email) = lower($1)`, [String(email).trim()]);

export async function createUser({ email, name, password, role = 'viewer', mustChangePassword = true }) {
  email = String(email || '').trim().toLowerCase();
  name = String(name || '').trim().slice(0, 120);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw err.validation('Email chưa hợp lệ.');
  if (name.length < 2) throw err.validation('Họ tên chưa hợp lệ.');
  if (!isRole(role)) throw err.validation('Vai trò không tồn tại.');

  const policy = checkPasswordPolicy(password, { email });
  if (!policy.ok) throw err.validation(policy.errors[0]);

  if (await getUserByEmail(email)) throw err.conflict('Email này đã có tài khoản.');

  const hash = await hashPassword(password);
  const r = await one(`
    INSERT INTO users (email, name, password_hash, role, must_change_pw)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
  `, [email, name, hash, role, mustChangePassword]);

  return getUser(r.id);
}

export async function updateUser(id, { name, role, active }) {
  const current = await one(`SELECT * FROM users WHERE id = $1`, [id]);
  if (!current) throw err.notFound('Không tìm thấy tài khoản.');
  if (role !== undefined && !isRole(role)) throw err.validation('Vai trò không tồn tại.');

  // Không cho phép hạ cấp hoặc khoá chủ sở hữu cuối cùng — nếu không sẽ không
  // còn ai vào được bảng điều khiển và phải sửa trực tiếp cơ sở dữ liệu.
  const { c: owners } = await one(`SELECT COUNT(*) c FROM users WHERE role='owner' AND active`);
  const losingOwner = current.role === 'owner' && ((role !== undefined && role !== 'owner') || active === false);
  if (losingOwner && owners <= 1) {
    throw err.validation('Đây là chủ sở hữu duy nhất còn hoạt động — không thể hạ quyền hoặc khoá.');
  }

  await run(`
    UPDATE users SET
      name       = COALESCE($1, name),
      role       = COALESCE($2, role),
      active     = COALESCE($3, active),
      updated_at = now()
    WHERE id = $4
  `, [
    name === undefined ? null : String(name).trim().slice(0, 120),
    role === undefined ? null : role,
    active === undefined ? null : Boolean(active),
    id
  ]);

  // Khoá hoặc đổi vai trò phải có hiệu lực ngay, không đợi phiên hết hạn.
  if (active === false || (role !== undefined && role !== current.role)) await destroyUserSessions(id);

  return getUser(id);
}

export async function setPassword(id, plain, { mustChange = false } = {}) {
  const u = await one(`SELECT email FROM users WHERE id = $1`, [id]);
  if (!u) throw err.notFound('Không tìm thấy tài khoản.');

  const policy = checkPasswordPolicy(plain, { email: u.email });
  if (!policy.ok) throw err.validation(policy.errors[0]);

  await run(`
    UPDATE users SET password_hash = $1, must_change_pw = $2, failed_count = 0, locked_until = NULL,
                     updated_at = now()
    WHERE id = $3
  `, [await hashPassword(plain), Boolean(mustChange), id]);

  await destroyUserSessions(id);
}

export async function deleteUser(id) {
  const u = await one(`SELECT role FROM users WHERE id = $1`, [id]);
  if (!u) throw err.notFound('Không tìm thấy tài khoản.');
  if (u.role === 'owner') throw err.validation('Không xoá được tài khoản chủ sở hữu. Hãy hạ quyền trước.');
  await destroyUserSessions(id);
  await run(`DELETE FROM users WHERE id = $1`, [id]);
}

/**
 * Xác thực đăng nhập.
 *
 * Luôn tốn một lượt băm kể cả khi email không tồn tại, để thời gian phản hồi
 * không tiết lộ email nào đã đăng ký.
 */
const DUMMY_HASH = 'scrypt$32768$8$1$AAAAAAAAAAAAAAAAAAAAAA==$' + 'AAAA';

export async function authenticate({ email, password }) {
  const user = await getUserByEmail(email || '');

  if (user?.locked_until && new Date(String(user.locked_until).replace(' ', 'T') + 'Z') > new Date()) {
    throw err.locked('Tài khoản tạm thời bị khoá do đăng nhập sai nhiều lần. Vui lòng thử lại sau.');
  }

  const ok = await verifyPassword(String(password || ''), user?.password_hash || DUMMY_HASH);

  if (!user || !ok) {
    if (user) await registerFailure(user);
    throw err.badCredentials();
  }
  if (!user.active) throw err.forbidden('Tài khoản đã bị vô hiệu hoá.');

  await run(`
    UPDATE users SET failed_count = 0, locked_until = NULL, last_login_at = now() WHERE id = $1
  `, [user.id]);

  // Tham số băm đã được nâng cấp kể từ lần đặt mật khẩu → băm lại âm thầm.
  if (needsRehash(user.password_hash)) {
    hashPassword(String(password))
      .then(h => run(`UPDATE users SET password_hash = $1 WHERE id = $2`, [h, user.id]))
      .catch(() => {});
  }

  return getUser(user.id);
}

async function registerFailure(user) {
  const count = user.failed_count + 1;
  const lock = count >= config.security.maxLoginAttempts;
  const until = lock
    ? new Date(Date.now() + config.security.lockoutSeconds * 1000).toISOString()
    : null;
  await run(`UPDATE users SET failed_count = $1, locked_until = $2 WHERE id = $3`,
    [lock ? 0 : count, until, user.id]);
}
