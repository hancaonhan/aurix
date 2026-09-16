/**
 * Lớp cá nhân hoá theo ngành — bản demo sống của dịch vụ "Web Cá nhân hoá".
 *
 * `GET /?nganh=spa` trả về HTML trang chủ đã được lắp lại nội dung ngay trên
 * máy chủ: không nhấp nháy, không cần JavaScript.
 *
 * Đây là cá nhân hoá chứ không phải che giấu nội dung với máy tìm kiếm: bản
 * mặc định vẫn là bản đầy đủ Googlebot nhận được, thẻ canonical luôn trỏ về
 * đường dẫn sạch, và bản cá nhân hoá mang `Cache-Control: private`.
 */
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { liveIndustryByKey } from '../../site/data/content.js';
import { resolveFile, sendFile, sendNotFound, MIME } from '../core/static.js';
import { getSetting } from '../services/settings.js';

export function variantFor(key) {
  const ind = liveIndustryByKey()[key];
  if (!ind) return null;
  return {
    key,
    label: ind.label,
    heroLine: ind.heroLine,
    heroSub: ind.heroSub,
    pain: ind.pain,
    proof: ind.proof,
    project: ind.project
  };
}

const escHtml = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/**
 * Thay phần nội dung của phần tử mang id cho trước.
 *
 * Quét thủ công thay vì dùng biểu thức chính quy, vì thuộc tính có thể chứa dấu
 * ngoặc nhọn (ví dụ data-default chứa thẻ đã mã hoá) và vì phần tử có thể lồng
 * thẻ cùng tên bên trong.
 */
export function replaceInner(html, id, inner) {
  const at = html.indexOf(`id="${id}"`);
  if (at === -1) return html;

  const lt = html.lastIndexOf('<', at);
  if (lt === -1) return html;

  const tagMatch = /^<([a-zA-Z][\w-]*)/.exec(html.slice(lt, at + 1));
  if (!tagMatch) return html;
  const tag = tagMatch[1];

  let i = lt + 1, quote = null, openEnd = -1;
  while (i < html.length) {
    const c = html[i];
    if (quote) { if (c === quote) quote = null; }
    else if (c === '"' || c === "'") quote = c;
    else if (c === '>') { openEnd = i; break; }
    i++;
  }
  if (openEnd === -1) return html;

  const openRe = new RegExp(`<${tag}\\b`, 'gi');
  const closeRe = new RegExp(`</${tag}\\s*>`, 'gi');
  let depth = 1, cursor = openEnd + 1, closeStart = -1;

  while (depth > 0) {
    closeRe.lastIndex = cursor;
    const close = closeRe.exec(html);
    if (!close) return html;

    openRe.lastIndex = cursor;
    let nested = openRe.exec(html);
    while (nested && nested.index < close.index) {
      depth++;
      openRe.lastIndex = nested.index + 1;
      nested = openRe.exec(html);
    }

    depth--;
    cursor = close.index + close[0].length;
    if (depth === 0) closeStart = close.index;
  }
  if (closeStart === -1) return html;

  return html.slice(0, openEnd + 1) + inner + html.slice(closeStart);
}

export function personalizeHome(html, v) {
  const swap = (id, inner) => { html = replaceInner(html, id, inner); };

  swap('ctxLabel', `Aurix cho ngành ${escHtml(v.label)}`);
  swap('heroLine', v.heroLine);
  swap('heroSub', escHtml(v.heroSub));
  swap('floatVal1', escHtml(v.proof.value));
  swap('floatLbl1', escHtml(v.proof.label));

  html = html.replace(
    new RegExp(`(data-industry="${v.key}"[^>]*?)aria-pressed="false"`),
    '$1aria-pressed="true"'
  );
  html = html.replace('data-industry="" aria-pressed="true"', 'data-industry="" aria-pressed="false"');

  return html;
}

/* Bộ đệm bản HTML gốc của trang chủ, làm mới khi tệp đổi (mỗi lần build). */
let homeCache = null;

export async function serveHome(ctx, secHeaders) {
  const { req, res, url } = ctx;
  const key = url.searchParams.get('nganh') || url.searchParams.get('industry');
  const enabled = getSetting('personalize.enabled');
  const v = key && enabled ? variantFor(key) : null;

  const file = await resolveFile('/');
  if (!file) return sendNotFound(req, res, secHeaders);
  if (!v) return sendFile(req, res, file, '/', secHeaders);

  if (!homeCache || homeCache.mtime !== file.st.mtimeMs) {
    homeCache = { mtime: file.st.mtimeMs, html: await readFile(file.full, 'utf8') };
  }

  const body = Buffer.from(personalizeHome(homeCache.html, v), 'utf8');
  const etag = `W/"p-${v.key}-${createHash('sha1').update(body).digest('hex').slice(0, 12)}"`;

  if (req.headers['if-none-match'] === etag) {
    res.writeHead(304, { ETag: etag });
    return res.end();
  }

  res.writeHead(200, {
    'Content-Type': MIME['.html'],
    'Content-Length': body.length,
    'Cache-Control': 'private, max-age=0, must-revalidate',
    ETag: etag,
    Vary: 'Accept-Encoding',
    ...secHeaders
  });
  res.end(req.method === 'HEAD' ? undefined : body);
}

export function register(router) {
  router.get('/api/personalize', ctx => {
    const v = variantFor(ctx.query.nganh || ctx.query.industry || '');
    if (!v) return ctx.json(404, { ok: false, error: 'Không có biến thể cho ngành này.' });
    return ctx.json(200, { ok: true, variant: v }, { 'Cache-Control': 'public, max-age=300' });
  }, { rateLimit: 'api' });
}
