/** Tiện ích HTTP: phản hồi, đọc thân request, giới hạn tần suất, xác thực. */
import { createHash, randomUUID } from 'node:crypto';

/* ---------- Phản hồi ---------- */
export function json(res, status, payload, headers = {}) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
    ...headers
  });
  res.end(body);
}

export function text(res, status, body, headers = {}) {
  res.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    ...headers
  });
  res.end(body);
}

/* ---------- Đọc thân request JSON, có giới hạn dung lượng ---------- */
const MAX_BODY = 64 * 1024;

export function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', c => {
      size += c.length;
      if (size > MAX_BODY) { reject(new Error('PAYLOAD_TOO_LARGE')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      if (!chunks.length) return resolve({});
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); }
      catch { reject(new Error('INVALID_JSON')); }
    });
    req.on('error', reject);
  });
}

/* ---------- Danh tính khách (ẩn danh hoá IP) ---------- */
const SALT = process.env.AURIX_IP_SALT || randomUUID();

export function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd) return fwd.split(',')[0].trim();
  return req.socket.remoteAddress || '0.0.0.0';
}

export const hashIp = ip => createHash('sha256').update(SALT + ip).digest('hex').slice(0, 32);

/* ---------- Giới hạn tần suất (cửa sổ trượt trong bộ nhớ) ---------- */
const buckets = new Map();

/**
 * @returns {{ ok: boolean, retryAfter: number }}
 */
export function rateLimit(key, { max = 10, windowMs = 60_000 } = {}) {
  const now = Date.now();
  let hits = buckets.get(key);
  if (!hits) { hits = []; buckets.set(key, hits); }

  while (hits.length && hits[0] <= now - windowMs) hits.shift();

  if (hits.length >= max) {
    return { ok: false, retryAfter: Math.ceil((hits[0] + windowMs - now) / 1000) };
  }
  hits.push(now);
  return { ok: true, retryAfter: 0 };
}

// Dọn bộ nhớ định kỳ để không rò rỉ
setInterval(() => {
  const cutoff = Date.now() - 10 * 60_000;
  for (const [k, hits] of buckets) {
    while (hits.length && hits[0] <= cutoff) hits.shift();
    if (!hits.length) buckets.delete(k);
  }
}, 5 * 60_000).unref();

/* ---------- So sánh chuỗi chống dò thời gian ---------- */
export function safeEqual(a = '', b = '') {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/* ---------- Tiêu đề bảo mật ---------- */
export function securityHeaders({ https = false } = {}) {
  const csp = [
    "default-src 'self'",
    "script-src 'self'",
    // Phông chữ được tự host nên không cần cho phép nguồn bên ngoài nào
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self'",
    "img-src 'self' data:",
    "connect-src 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "object-src 'none'"
  ].join('; ');

  return {
    'Content-Security-Policy': csp,
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), interest-cohort=()',
    'X-Frame-Options': 'DENY',
    ...(https ? { 'Strict-Transport-Security': 'max-age=31536000; includeSubDomains' } : {})
  };
}
