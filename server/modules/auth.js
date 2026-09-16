/**
 * Đăng nhập, đăng xuất, đổi mật khẩu.
 *
 * Toàn bộ bảng điều khiển Aurix đứng sau những tuyến này. Vài quyết định có
 * chủ đích:
 *   - Thông điệp lỗi đăng nhập luôn giống nhau dù sai email hay sai mật khẩu:
 *     nói rõ "email không tồn tại" là tặng kẻ tấn công danh sách tài khoản.
 *   - Mã CSRF được trả về trong thân phản hồi, không đặt trong cookie đọc được:
 *     client giữ trong bộ nhớ và gửi lại qua header.
 *   - Đổi mật khẩu sẽ huỷ mọi phiên, kể cả phiên đang thao tác — đúng như kỳ
 *     vọng khi ai đó đổi mật khẩu vì nghi bị lộ.
 */
import { authenticate, setPassword, getUser, getUserByEmail } from '../services/users.js';
import { verifyPassword } from '../security/password.js';
import { createSession, destroySession, destroyUserSessions, clearCookie, listUserSessions } from '../security/session.js';
import { permissionsOf, ROLES } from '../security/rbac.js';
import { audit } from '../services/audit.js';
import { reset as resetRateLimit } from '../security/ratelimit.js';
import { err } from '../core/errors.js';

const profile = user => ({
  ...user,
  roleLabel: ROLES[user.role]?.label ?? user.role,
  permissions: [...permissionsOf(user.role)]
});

export function register(router) {
  /* ---------- Đăng nhập ---------- */
  router.post('/api/auth/login', async ctx => {
    const { email, password } = await ctx.body();

    let user;
    try {
      user = await authenticate({ email, password });
    } catch (e) {
      audit({
        actor: { email: String(email || '').slice(0, 160) },
        action: 'auth.login', ipHash: ctx.ipHash, result: 'denied',
        detail: { code: e.code }
      });
      throw e;
    }

    const { cookie, csrfToken } = createSession({
      userId: user.id, ipHash: ctx.ipHash, userAgent: ctx.userAgent
    });

    resetRateLimit(`/api/auth/login:${ctx.ipHash}`);
    audit({ actor: user, action: 'auth.login', ipHash: ctx.ipHash });

    return ctx.json(200, {
      ok: true,
      user: profile(user),
      csrfToken,
      mustChangePassword: user.mustChangePassword
    }, { 'Set-Cookie': cookie });
  }, { rateLimit: 'login', rateLimitKey: '/api/auth/login', csrf: false });

  /* ---------- Đăng xuất ---------- */
  router.post('/api/auth/logout', ctx => {
    if (ctx.session) {
      destroySession(ctx.session.id);
      audit({ actor: ctx.user, action: 'auth.logout', ipHash: ctx.ipHash });
    }
    return ctx.json(200, { ok: true }, { 'Set-Cookie': clearCookie() });
  }, { allowPasswordChange: true });

  /* ---------- Tôi là ai ---------- *
   * Giao diện gọi tuyến này lúc tải để biết đang đăng nhập bằng tài khoản nào
   * và được phép nhìn thấy những mục nào trên thanh điều hướng.             */
  router.get('/api/auth/me', ctx => {
    if (!ctx.user) return ctx.json(200, { ok: true, user: null });
    return ctx.json(200, {
      ok: true,
      user: profile(ctx.user),
      csrfToken: ctx.session?.csrfToken ?? null,
      sessions: listUserSessions(ctx.user.id).length
    });
  }, { allowPasswordChange: true });

  /* ---------- Tự đổi mật khẩu ---------- */
  router.post('/api/auth/password', async ctx => {
    const { currentPassword, newPassword } = await ctx.body();

    const row = getUserByEmail(ctx.user.email);
    const ok = await verifyPassword(String(currentPassword || ''), row.password_hash);
    if (!ok) {
      audit({ actor: ctx.user, action: 'auth.password.change', ipHash: ctx.ipHash, result: 'denied' });
      throw err.badCredentials('Mật khẩu hiện tại không đúng.');
    }
    if (String(newPassword || '') === String(currentPassword || '')) {
      throw err.validation('Mật khẩu mới phải khác mật khẩu cũ.');
    }

    await setPassword(ctx.user.id, String(newPassword || ''));
    audit({ actor: ctx.user, action: 'auth.password.change', ipHash: ctx.ipHash });

    // setPassword đã huỷ mọi phiên — cấp lại phiên mới cho thiết bị hiện tại để
    // người dùng không bị đá ra ngay giữa chừng.
    const { cookie, csrfToken } = createSession({
      userId: ctx.user.id, ipHash: ctx.ipHash, userAgent: ctx.userAgent
    });

    return ctx.json(200, {
      ok: true,
      message: 'Đã đổi mật khẩu. Mọi thiết bị khác đã bị đăng xuất.',
      user: profile(getUser(ctx.user.id)),
      csrfToken
    }, { 'Set-Cookie': cookie });
  }, { auth: true, allowPasswordChange: true, rateLimit: 'login' });

  /* ---------- Đăng xuất khỏi mọi thiết bị ---------- */
  router.post('/api/auth/logout-all', ctx => {
    destroyUserSessions(ctx.user.id);
    audit({ actor: ctx.user, action: 'auth.logout.all', ipHash: ctx.ipHash });
    return ctx.json(200, { ok: true }, { 'Set-Cookie': clearCookie() });
  }, { auth: true, allowPasswordChange: true });
}
