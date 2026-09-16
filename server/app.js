/**
 * Lắp ráp ứng dụng.
 *
 * Tệp này là nơi duy nhất biết thứ tự các tầng: tiêu đề bảo mật → CORS →
 * định tuyến API → cổng bảo vệ → handler → tệp tĩnh → 404, và một bộ xử lý lỗi
 * bọc ngoài tất cả.
 *
 * Thêm một nhóm tính năng mới = thêm một tệp vào `server/modules/` rồi ghi tên
 * nó vào mảng MODULES bên dưới. Không có chỗ nào khác phải sửa.
 */
import { extname } from 'node:path';
import Router from './core/router.js';
import { createContext } from './core/context.js';
import { AppError, err } from './core/errors.js';
import config from './core/config.js';
import log from './core/logger.js';
import { resolveFile, sendFile, sendNotFound } from './core/static.js';
import { securityHeaders, corsHeaders } from './security/headers.js';
import { guard } from './security/guard.js';

import * as personalize from './modules/personalize.js';
import * as publicApi from './modules/public-api.js';
import * as auth from './modules/auth.js';
import * as consoleUi from './modules/console.js';
import * as consoleLeads from './modules/console-leads.js';
import * as consoleUsers from './modules/console-users.js';
import * as consoleSystem from './modules/console-system.js';
import * as consoleContent from './modules/console-content.js';

/** Thứ tự đăng ký cũng là thứ tự khớp tuyến khi có trùng lặp. */
const MODULES = [
  publicApi,
  personalize,
  auth,
  consoleUi,
  consoleLeads,
  consoleUsers,
  consoleSystem,
  consoleContent
];

export const router = new Router();
for (const m of MODULES) m.register(router);

const ALLOWED_METHODS = new Set(['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']);

export function createHandler() {
  return async function handle(req, res) {
    const started = process.hrtime.bigint();
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname;

    const isHttps = req.headers['x-forwarded-proto'] === 'https' || Boolean(req.socket.encrypted);
    const isConsole = pathname.startsWith(consoleUi.CONSOLE_PATH) || pathname.startsWith('/api/console');
    const secHeaders = { ...securityHeaders({ https: isHttps, admin: isConsole }), ...corsHeaders(req.headers.origin) };

    res.on('finish', () => {
      const ms = Number(process.hrtime.bigint() - started) / 1e6;
      if (ms > config.log.slowMs || res.statusCode >= 400) {
        log.info('request', { method: req.method, path: pathname, status: res.statusCode, ms: Math.round(ms) });
      }
    });

    let ctx = null;
    try {
      if (!ALLOWED_METHODS.has(req.method)) {
        res.writeHead(405, { ...secHeaders, Allow: [...ALLOWED_METHODS].join(', ') });
        return res.end();
      }

      /* ---------- Tiền kiểm CORS ---------- */
      if (req.method === 'OPTIONS') {
        res.writeHead(204, secHeaders);
        return res.end();
      }

      /* ---------- Tuyến đã đăng ký ---------- */
      const matched = router.match(req.method, pathname)
        // HEAD dùng chung handler với GET; ctx tự bỏ phần thân phản hồi.
        || (req.method === 'HEAD' ? router.match('GET', pathname) : null);

      if (matched) {
        ctx = createContext(req, res, { url, params: matched.params });
        for (const [k, v] of Object.entries(secHeaders)) ctx.setHeader(k, v);

        await guard(ctx, matched.route.options);
        await matched.route.handler(ctx);
        // Lưới an toàn: handler quên trả lời thì vẫn đóng được request.
        if (!res.writableEnded && !res.headersSent) ctx.json(200, { ok: true });
        return;
      }

      /* ---------- Không có tuyến API nào khớp ---------- */
      if (pathname.startsWith('/api/')) {
        ctx = createContext(req, res, { url });
        const methods = router.methodsFor(pathname);
        if (methods.length) {
          return ctx.json(405, { ok: false, code: 'METHOD_NOT_ALLOWED', error: 'Phương thức không được hỗ trợ.' },
            { ...secHeaders, Allow: methods.join(', ') });
        }
        return ctx.json(404, { ok: false, code: 'NOT_FOUND', error: 'Không có điểm cuối này.' }, secHeaders);
      }

      /* ---------- Chuẩn hoá đường dẫn thư mục ---------- */
      if (pathname.length > 1 && !pathname.endsWith('/') && !extname(pathname)) {
        res.writeHead(301, { Location: pathname + '/' + url.search, ...secHeaders });
        return res.end();
      }

      /* ---------- Trang chủ (có lớp cá nhân hoá) ---------- */
      if (pathname === '/' || pathname === '/index.html') {
        ctx = createContext(req, res, { url });
        return await personalize.serveHome(ctx, secHeaders);
      }

      /* ---------- Tệp tĩnh ---------- */
      const file = await resolveFile(pathname);
      if (file) return await sendFile(req, res, file, pathname, secHeaders);

      return await sendNotFound(req, res, secHeaders);
    } catch (error) {
      return respondWithError(error, { req, res, ctx, pathname, secHeaders });
    }
  };
}

/**
 * Dịch lỗi thành phản hồi.
 *
 * Lỗi không phải AppError luôn bị coi là lỗi lập trình: ghi đầy đủ vào nhật ký,
 * nhưng trả ra ngoài đúng một câu chung chung. Thông điệp lỗi chi tiết là quà
 * tặng cho người dò tìm lỗ hổng.
 */
const headersCloseConnection = res => res.setHeader('Connection', 'close');

function respondWithError(error, { req, res, ctx, pathname, secHeaders }) {
  const isApp = error instanceof AppError;
  const status = isApp ? error.status : 500;

  if (!isApp) {
    log.error('Lỗi không lường trước', { path: pathname, error: error?.message, stack: error?.stack });
  } else if (status >= 500) {
    log.error(error.message, { path: pathname, code: error.code, meta: error.meta });
  } else {
    log.debug('Yêu cầu bị từ chối', { path: pathname, code: error.code, status });
  }

  if (res.headersSent || res.writableEnded) return res.end();

  // Thân request quá lớn: đã ngừng đọc, trả lời xong thì đóng kết nối để phần
  // dữ liệu còn lại không tiếp tục chiếm băng thông.
  if (error.code === 'PAYLOAD_TOO_LARGE') {
    res.once('finish', () => req.destroy());
    headersCloseConnection(res);
  }

  const payload = {
    ok: false,
    code: isApp ? error.code : 'INTERNAL',
    error: isApp && error.expose ? error.message : 'Lỗi hệ thống. Vui lòng thử lại sau.'
  };
  const headers = { ...secHeaders };
  if (error.retryAfter) headers['Retry-After'] = String(error.retryAfter);

  const wantsJson = pathname.startsWith('/api/')
    || String(req.headers.accept || '').includes('application/json');

  if (wantsJson) {
    if (ctx) return ctx.json(status, payload, headers);
    const body = JSON.stringify(payload);
    res.writeHead(status, {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(body),
      ...headers
    });
    return res.end(body);
  }

  if (status === 404) return sendNotFound(req, res, headers);

  const body = payload.error;
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8', ...headers });
  res.end(body);
}
