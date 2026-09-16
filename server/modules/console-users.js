/**
 * Quản lý tài khoản nội bộ.
 *
 * Quy tắc chống leo thang quyền được áp ở đây, không phải ở giao diện:
 *   - không ai tạo hay sửa được tài khoản có vai trò cao hơn vai trò của mình
 *   - không ai tự đổi vai trò của chính mình
 *   - chủ sở hữu cuối cùng không thể bị hạ quyền hay khoá (kiểm ở tầng dịch vụ)
 */
import * as users from '../services/users.js';
import { ROLES, PERMISSIONS, canManageRole } from '../security/rbac.js';
import { generatePassword } from '../security/password.js';
import { audit } from '../services/audit.js';
import { err } from '../core/errors.js';

export function register(router) {
  /* ---------- Danh sách tài khoản và bảng vai trò ---------- */
  router.get('/api/console/users', ctx => ctx.json(200, {
    ok: true,
    users: users.listUsers(),
    roles: Object.fromEntries(Object.entries(ROLES).map(([k, r]) => [k, {
      label: r.label, desc: r.desc, permissions: r.permissions
    }])),
    permissions: PERMISSIONS
  }), { permission: 'users.read' });

  /* ---------- Tạo tài khoản ---------- *
   * Mật khẩu tạm được sinh ở máy chủ và chỉ hiện **đúng một lần** trong phản
   * hồi này; hệ thống không lưu lại bản rõ ở bất cứ đâu.                     */
  router.post('/api/console/users', async ctx => {
    const { email, name, role = 'viewer', password } = await ctx.body();

    if (!canManageRole(ctx.user.role, role)) {
      throw err.forbidden('Bạn không thể tạo tài khoản có vai trò cao hơn vai trò của mình.');
    }

    const temp = password || generatePassword();
    const user = await users.createUser({ email, name, role, password: temp, mustChangePassword: true });

    audit({
      actor: ctx.user, action: 'user.create', target: `user:${user.id}`,
      detail: { email: user.email, role }, ipHash: ctx.ipHash
    });

    return ctx.json(201, {
      ok: true,
      user,
      temporaryPassword: password ? null : temp,
      message: 'Đã tạo tài khoản. Mật khẩu tạm chỉ hiển thị một lần — hãy gửi cho người dùng qua kênh an toàn.'
    });
  }, { permission: 'users.write' });

  /* ---------- Sửa tài khoản ---------- */
  router.patch('/api/console/users/:id', async ctx => {
    const id = Number(ctx.params.id);
    const target = users.getUser(id);
    if (!target) throw err.notFound('Không tìm thấy tài khoản.');

    const { name, role, active } = await ctx.body();

    if (!canManageRole(ctx.user.role, target.role)) {
      throw err.forbidden('Bạn không thể sửa tài khoản có vai trò ngang hoặc cao hơn.');
    }
    if (role !== undefined && !canManageRole(ctx.user.role, role)) {
      throw err.forbidden('Bạn không thể gán vai trò cao hơn vai trò của mình.');
    }
    if (id === ctx.user.id && role !== undefined && role !== target.role) {
      throw err.forbidden('Không thể tự đổi vai trò của chính mình.');
    }
    if (id === ctx.user.id && active === false) {
      throw err.forbidden('Không thể tự khoá tài khoản của chính mình.');
    }

    const updated = users.updateUser(id, { name, role, active });
    audit({
      actor: ctx.user, action: 'user.update', target: `user:${id}`,
      detail: { name, role, active }, ipHash: ctx.ipHash
    });
    return ctx.json(200, { ok: true, user: updated });
  }, { permission: 'users.write' });

  /* ---------- Đặt lại mật khẩu cho người khác ---------- */
  router.post('/api/console/users/:id/reset-password', async ctx => {
    const id = Number(ctx.params.id);
    const target = users.getUser(id);
    if (!target) throw err.notFound('Không tìm thấy tài khoản.');
    if (!canManageRole(ctx.user.role, target.role)) throw err.forbidden();

    const temp = generatePassword();
    await users.setPassword(id, temp, { mustChange: true });

    audit({ actor: ctx.user, action: 'user.password.reset', target: `user:${id}`, ipHash: ctx.ipHash });

    return ctx.json(200, {
      ok: true,
      temporaryPassword: temp,
      message: 'Đã đặt lại mật khẩu và đăng xuất tài khoản này khỏi mọi thiết bị.'
    });
  }, { permission: 'users.write' });

  /* ---------- Xoá tài khoản ---------- */
  router.delete('/api/console/users/:id', ctx => {
    const id = Number(ctx.params.id);
    if (id === ctx.user.id) throw err.forbidden('Không thể tự xoá tài khoản của chính mình.');

    const target = users.getUser(id);
    if (!target) throw err.notFound('Không tìm thấy tài khoản.');
    if (!canManageRole(ctx.user.role, target.role)) throw err.forbidden();

    users.deleteUser(id);
    audit({
      actor: ctx.user, action: 'user.delete', target: `user:${id}`,
      detail: { email: target.email }, ipHash: ctx.ipHash
    });
    return ctx.json(200, { ok: true });
  }, { permission: 'users.write' });
}
