/**
 * Phục vụ tệp tĩnh.
 *
 * Website Aurix là HTML sinh sẵn, nên đây là đường đi của phần lớn request:
 * nén Brotli/gzip theo yêu cầu, ETag, 304, và chính sách bộ nhớ đệm khác nhau
 * cho HTML (luôn kiểm lại) và tài nguyên có mã phiên bản (giữ một năm).
 */
import { createReadStream } from 'node:fs';
import { stat, readFile } from 'node:fs/promises';
import { join, extname, normalize, sep } from 'node:path';
import { createGzip, createBrotliCompress, constants as z } from 'node:zlib';
import { pipeline } from 'node:stream/promises';
import { ROOT } from './config.js';

export const PUBLIC_DIR = join(ROOT, 'public');

export const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

const COMPRESSIBLE = new Set(['.html', '.css', '.js', '.mjs', '.json', '.svg', '.xml', '.txt', '.webmanifest']);

export function cacheControl(ext, pathname) {
  if (ext === '.html') return 'public, max-age=0, must-revalidate';
  if (pathname.startsWith('/assets/')) return 'public, max-age=31536000, immutable';
  if (ext === '.css' || ext === '.js' || ext === '.mjs') return 'public, max-age=3600, must-revalidate';
  return 'public, max-age=86400';
}

/** Giải đường dẫn URL thành tệp thật, chặn mọi kiểu thoát thư mục. */
export async function resolveFile(pathname) {
  let decoded;
  try { decoded = decodeURIComponent(pathname); } catch { return null; }
  if (decoded.includes('\0')) return null;

  let rel = normalize(decoded).replace(/^(\.\.[/\\])+/, '');
  if (rel.endsWith('/')) rel += 'index.html';
  else if (!extname(rel)) rel += '/index.html';

  const full = join(PUBLIC_DIR, rel);
  if (!full.startsWith(PUBLIC_DIR + sep) && full !== PUBLIC_DIR) return null;

  try {
    const st = await stat(full);
    return st.isFile() ? { full, st } : null;
  } catch {
    return null;
  }
}

const etagFor = st => `W/"${st.size.toString(16)}-${Math.floor(st.mtimeMs).toString(16)}"`;

export async function sendFile(req, res, { full, st }, pathname, extraHeaders = {}) {
  const ext = extname(full).toLowerCase();
  const etag = etagFor(st);

  const headers = {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Cache-Control': cacheControl(ext, pathname),
    ETag: etag,
    'Last-Modified': st.mtime.toUTCString(),
    Vary: 'Accept-Encoding',
    ...extraHeaders
  };

  if (req.headers['if-none-match'] === etag) {
    res.writeHead(304, { ETag: etag, 'Cache-Control': headers['Cache-Control'] });
    return res.end();
  }

  if (req.method === 'HEAD') {
    res.writeHead(200, { ...headers, 'Content-Length': st.size });
    return res.end();
  }

  const accept = String(req.headers['accept-encoding'] || '');
  const compressible = COMPRESSIBLE.has(ext) && st.size > 1024;

  if (compressible && /\bbr\b/.test(accept)) {
    res.writeHead(200, { ...headers, 'Content-Encoding': 'br' });
    return pipeline(
      createReadStream(full),
      createBrotliCompress({ params: { [z.BROTLI_PARAM_QUALITY]: 5 } }),
      res
    ).catch(() => {});
  }
  if (compressible && /\bgzip\b/.test(accept)) {
    res.writeHead(200, { ...headers, 'Content-Encoding': 'gzip' });
    return pipeline(createReadStream(full), createGzip({ level: 6 }), res).catch(() => {});
  }

  res.writeHead(200, { ...headers, 'Content-Length': st.size });
  return pipeline(createReadStream(full), res).catch(() => {});
}

export async function sendNotFound(req, res, extraHeaders = {}) {
  const file = await resolveFile('/404.html');
  if (!file) {
    const body = 'Không tìm thấy trang.';
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', ...extraHeaders });
    return res.end(body);
  }
  const body = await readFile(file.full);
  res.writeHead(404, {
    'Content-Type': MIME['.html'],
    'Content-Length': body.length,
    'Cache-Control': 'no-store',
    ...extraHeaders
  });
  res.end(req.method === 'HEAD' ? undefined : body);
}
