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
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { authenticate, setPassword, getUser, getUserByEmail, countUsers, createUser } from '../services/users.js';
import { resetToken, parseResetToken, verifyResetToken, RESET_TTL_MIN } from '../security/reset-token.js';
import { queuePasswordReset, drainOutbox } from '../lib/mailer.js';
import { resetPage } from '../console/reset-page.js';
import config from '../core/config.js';
import log from '../core/logger.js';
import { verifyPassword } from '../security/password.js';
import { createSession, destroySession, destroyUserSessions, clearCookie, listUserSessions } from '../security/session.js';
import { permissionsOf, ROLES } from '../security/rbac.js';
import { audit } from '../services/audit.js';
import { reset as resetRateLimit } from '../security/ratelimit.js';
import { err } from '../core/errors.js';

const PAGE = '/bang-dieu-khien/quen-mat-khau';
const RESET_JS = join(dirname(fileURLToPath(import.meta.url)), '..', 'console', 'reset.js');
let resetScript = null;

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

    const { cookie, csrfToken } = await createSession({
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
  router.post('/api/auth/logout', async ctx => {
    if (ctx.session) {
      await destroySession(ctx.session.id);
      audit({ actor: ctx.user, action: 'auth.logout', ipHash: ctx.ipHash });
    }
    return ctx.json(200, { ok: true }, { 'Set-Cookie': clearCookie() });
  }, { allowPasswordChange: true });

  /* ---------- Tôi là ai ---------- *
   * Giao diện gọi tuyến này lúc tải để biết đang đăng nhập bằng tài khoản nào
   * và được phép nhìn thấy những mục nào trên thanh điều hướng.             */
  router.get('/api/auth/me', async ctx => {
    if (!ctx.user) return ctx.json(200, { ok: true, user: null });
    return ctx.json(200, {
      ok: true,
      user: profile(ctx.user),
      csrfToken: ctx.session?.csrfToken ?? null,
      sessions: (await listUserSessions(ctx.user.id)).length
    });
  }, { allowPasswordChange: true });

  /* ---------- Tự đổi mật khẩu ---------- */
  router.post('/api/auth/password', async ctx => {
    const { currentPassword, newPassword } = await ctx.body();

    const row = await getUserByEmail(ctx.user.email);
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
    const { cookie, csrfToken } = await createSession({
      userId: ctx.user.id, ipHash: ctx.ipHash, userAgent: ctx.userAgent
    });

    return ctx.json(200, {
      ok: true,
      message: 'Đã đổi mật khẩu. Mọi thiết bị khác đã bị đăng xuất.',
      user: profile(await getUser(ctx.user.id)),
      csrfToken
    }, { 'Set-Cookie': cookie });
  }, { auth: true, allowPasswordChange: true, rateLimit: 'login' });

  /* ---------- Quên mật khẩu: trang + gửi link qua email ----------
   * Phản hồi luôn giống nhau dù email có tài khoản hay không, để không lộ danh
   * sách tài khoản.
   *
   * Tài khoản đầu tiên: khi hệ thống CHƯA có tài khoản nào, yêu cầu cho đúng
   * hộp thư công ty (AURIX_SALES_INBOX) sẽ tạo tài khoản chủ sở hữu rồi gửi link
   * đặt mật khẩu vào hộp thư đó. Ai mở được hộp thư công ty mới đặt được mật
   * khẩu; không cần chạy lệnh trên máy chủ hay chuyển mật khẩu qua tin nhắn.
   * Đã có từ một tài khoản trở lên thì nhánh này không bao giờ chạy nữa. */
  router.get(`${PAGE}`, ctx => ctx.html(200, resetPage(), {
    'X-Robots-Tag': 'noindex, nofollow, noarchive',
    'Referrer-Policy': 'no-referrer'
  }));

  router.get('/bang-dieu-khien/dat-lai.js', async ctx => {
    if (!resetScript || config.isDev) resetScript = await readFile(RESET_JS, 'utf8');
    return ctx.text(200, resetScript, {
      'Content-Type': 'text/javascript; charset=utf-8',
      'Cache-Control': config.isProd ? 'private, max-age=300' : 'no-store'
    });
  });

  router.post('/api/auth/forgot', async ctx => {
    const { email } = await ctx.body();
    const address = String(email || '').trim().toLowerCase().slice(0, 160);
    const generic = {
      ok: true,
      message: `Nếu email này có tài khoản, link đặt lại mật khẩu đã được gửi tới hộp thư. Link hết hạn sau ${RESET_TTL_MIN} phút.`
    };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(address)) return ctx.json(200, generic);

    let row = await getUserByEmail(address);
    let firstOwner = false;

    if (!row && address === String(config.mail.salesInbox || '').toLowerCase() && (await countUsers()) === 0) {
      // Mật khẩu ngẫu nhiên không ai biết; chủ sở hữu đặt mật khẩu thật qua link.
      await createUser({
        email: address,
        name: 'Chủ sở hữu Aurix',
        password: randomBytes(24).toString('base64url'),
        role: 'owner',
        mustChangePassword: false
      });
      row = await getUserByEmail(address);
      firstOwner = true;
      audit({ actor: { email: address }, action: 'auth.bootstrap_owner', ipHash: ctx.ipHash });
      log.info('Đã tạo tài khoản chủ sở hữu đầu tiên, gửi link đặt mật khẩu qua email');
    }

    if (row && row.active) {
      const link = `${config.origin}${PAGE}#t=${resetToken(row)}`;
      await queuePasswordReset({ email: row.email }, link, { minutes: RESET_TTL_MIN, firstOwner });
      setImmediate(() => { drainOutbox().catch(() => {}); });
      audit({ actor: { id: row.id, email: row.email }, action: 'auth.password.reset_request', ipHash: ctx.ipHash });
    }
    return ctx.json(200, generic);
  }, { rateLimit: 'login', rateLimitKey: '/api/auth/forgot', csrf: false });

  /* ---------- Đặt mật khẩu mới bằng link trong thư ---------- */
  router.post('/api/auth/reset', async ctx => {
    const { token, password } = await ctx.body();
    const parsed = parseResetToken(token);
    const user = parsed ? await getUser(parsed.id) : null;
    const row = user ? await getUserByEmail(user.email) : null;

    if (!row || !row.active || !verifyResetToken(parsed, row)) {
      audit({ actor: { id: parsed?.id ?? null }, action: 'auth.password.reset', ipHash: ctx.ipHash, result: 'denied' });
      throw err.validation('Link đã hết hạn hoặc đã được dùng. Hãy yêu cầu link mới.');
    }

    // setPassword kiểm chính sách mật khẩu, mở khoá tài khoản và huỷ mọi phiên cũ.
    await setPassword(row.id, String(password || ''));
    audit({ actor: { id: row.id, email: row.email }, action: 'auth.password.reset', ipHash: ctx.ipHash });
    resetRateLimit(`/api/auth/login:${ctx.ipHash}`);

    return ctx.json(200, { ok: true, message: 'Đã lưu mật khẩu mới. Hãy đăng nhập bằng email và mật khẩu vừa đặt.' });
  }, { rateLimit: 'login', rateLimitKey: '/api/auth/reset', csrf: false });

  /* ---------- Đăng xuất khỏi mọi thiết bị ---------- */
  router.post('/api/auth/logout-all', async ctx => {
    await destroyUserSessions(ctx.user.id);
    audit({ actor: ctx.user, action: 'auth.logout.all', ipHash: ctx.ipHash });
    return ctx.json(200, { ok: true }, { 'Set-Cookie': clearCookie() });
  }, { auth: true, allowPasswordChange: true });
}
