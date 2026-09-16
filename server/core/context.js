/**
 * Ngữ cảnh request.
 *
 * Mỗi request được bọc trong một đối tượng duy nhất mang theo mọi thứ handler
 * cần: thông tin người gọi, tham số, thân request, và các hàm trả lời. Handler
 * nhờ vậy không bao giờ phải chạm trực tiếp vào `req`/`res` của Node — muốn đổi
 * tầng HTTP sau này (HTTP/2, một runtime khác) chỉ phải sửa tệp này.
 */
import { createHash, randomUUID } from 'node:crypto';
import config from './config.js';
import { err } from './errors.js';
import log from './logger.js';

/* ---------- Danh tính khách, đã ẩn danh hoá ---------- */
const SALT = config.security.ipSalt;

/**
 * IP thật của khách.
 *
 * Chỉ tin `x-forwarded-for` khi có khai báo số lớp proxy phía trước: nếu tin vô
 * điều kiện, bất kỳ ai cũng giả được IP và vô hiệu hoá toàn bộ giới hạn tần suất.
 * Lấy từ **phải sang trái** đúng số lớp proxy tin cậy.
 */
export function clientIp(req) {
  if (config.trustProxy > 0) {
    const fwd = req.headers['x-forwarded-for'];
    if (typeof fwd === 'string' && fwd) {
      const chain = fwd.split(',').map(s => s.trim()).filter(Boolean);
      const idx = Math.max(0, chain.length - config.trustProxy);
      if (chain[idx]) return chain[idx];
    }
  }
  return req.socket.remoteAddress || '0.0.0.0';
}

export const hashIp = ip => createHash('sha256').update(SALT + ip).digest('hex').slice(0, 32);

/* ---------- Đọc thân request ---------- */
function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', c => {
      size += c.length;
      if (size > limit) {
        // Ngừng đọc nhưng KHÔNG cắt kết nối ngay: phải còn socket để trả về
        // thông báo 413 cho khách. Kết nối được đóng sau khi phản hồi đi xong.
        req.pause();
        reject(err.tooLarge());
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export function createContext(req, res, { url, params = {} }) {
  const requestId = randomUUID().slice(0, 8);
  const ip = clientIp(req);

  const ctx = {
    req,
    res,
    url,
    requestId,
    method: req.method,
    pathname: url.pathname,
    params,
    query: Object.fromEntries(url.searchParams),
    ip,
    ipHash: hashIp(ip),
    userAgent: String(req.headers['user-agent'] || '').slice(0, 300),
    isHttps: req.headers['x-forwarded-proto'] === 'https' || Boolean(req.socket.encrypted),

    /** Được guard điền vào. `user` là null với khách chưa đăng nhập. */
    session: null,
    user: null,
    /** Đặt thành true khi request xác thực bằng khoá API thay vì phiên. */
    viaApiKey: false,

    /** Header sẽ được gắn vào mọi phản hồi của request này. */
    headers: {},
    setHeader(name, value) { ctx.headers[name] = value; return ctx; },

    log: log.child({ rid: requestId }),

    /** Thân request đã phân tích JSON. Gọi nhiều lần vẫn trả về cùng kết quả. */
    async body() {
      if (ctx._body !== undefined) return ctx._body;
      const raw = await readBody(req, config.security.maxBodyBytes);
      if (!raw.length) return (ctx._body = {});

      const type = String(req.headers['content-type'] || '');
      try {
        if (type.includes('application/json')) {
          ctx._body = JSON.parse(raw.toString('utf8'));
        } else if (type.includes('application/x-www-form-urlencoded')) {
          ctx._body = Object.fromEntries(new URLSearchParams(raw.toString('utf8')));
        } else {
          ctx._body = JSON.parse(raw.toString('utf8'));
        }
      } catch {
        throw err.badRequest('Dữ liệu gửi lên không đọc được.');
      }
      if (!ctx._body || typeof ctx._body !== 'object' || Array.isArray(ctx._body)) {
        throw err.badRequest('Dữ liệu gửi lên không hợp lệ.');
      }
      return ctx._body;
    },

    /* ---------- Trả lời ---------- */
    json(status, payload, headers = {}) {
      const body = JSON.stringify(payload);
      res.writeHead(status, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(body),
        'Cache-Control': 'no-store',
        'X-Request-Id': requestId,
        ...ctx.headers,
        ...headers
      });
      res.end(req.method === 'HEAD' ? undefined : body);
    },

    text(status, body, headers = {}) {
      res.writeHead(status, {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Length': Buffer.byteLength(body),
        ...ctx.headers,
        ...headers
      });
      res.end(req.method === 'HEAD' ? undefined : body);
    },

    html(status, body, headers = {}) {
      const buf = Buffer.from(body, 'utf8');
      res.writeHead(status, {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Length': buf.length,
        'Cache-Control': 'no-store',
        ...ctx.headers,
        ...headers
      });
      res.end(req.method === 'HEAD' ? undefined : buf);
    },

    /** Tệp tải về — dùng cho kết xuất CSV. */
    download(status, body, filename, type = 'text/csv; charset=utf-8') {
      const buf = Buffer.from(body, 'utf8');
      res.writeHead(status, {
        'Content-Type': type,
        'Content-Length': buf.length,
        'Content-Disposition': `attachment; filename="${filename.replace(/[^\w.\-]/g, '_')}"`,
        'Cache-Control': 'no-store',
        ...ctx.headers
      });
      res.end(buf);
    },

    redirect(location, status = 302) {
      res.writeHead(status, { Location: location, ...ctx.headers });
      res.end();
    }
  };

  return ctx;
}
