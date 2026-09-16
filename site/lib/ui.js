// Tiện ích render HTML dùng chung cho toàn bộ trang
import { existsSync, readFileSync } from 'node:fs';
import { join as joinPath, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const PUBLIC = joinPath(dirname(fileURLToPath(import.meta.url)), '..', '..', 'public');

/* ---------- Manifest ảnh đã tối ưu (do scripts/images.js sinh ra) ---------- */
const MANIFEST_PATH = joinPath(PUBLIC, 'assets', 'opt', 'manifest.json');

const IMAGES = (() => {
  try { return JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')); }
  catch { return {}; }
})();

if (!Object.keys(IMAGES).length) {
  console.warn('  ⚠ Chưa có manifest ảnh tối ưu. Chạy: node scripts/images.js');
}

/** Thuộc tính sizes mặc định theo vai trò ảnh trên trang. */
const SIZES = {
  hero:   '(max-width: 980px) 92vw, 44vw',
  wide:   '(max-width: 980px) 92vw, 48vw',
  card:   '(max-width: 620px) 92vw, (max-width: 960px) 46vw, 30vw',
  board:  '(max-width: 620px) 92vw, (max-width: 960px) 46vw, 30vw',
  avatar: '54px',
  logo:   '150px'
};

/** Ảnh nguồn có thể được khai báo bằng .webp hoặc .png — thử cả hai khi tra manifest. */
function lookup(src) {
  if (IMAGES[src]) return IMAGES[src];
  for (const ext of ['.png', '.webp', '.jpg']) {
    const alt = src.replace(/\.(png|webp|jpe?g)$/, ext);
    if (IMAGES[alt]) return IMAGES[alt];
  }
  return null;
}

const srcset = (paths, widths) =>
  paths.map((p, i) => `${p} ${widths[i]}w`).join(', ');

/** Trả về ảnh dự phòng .png/.jpg cho một .webp, chỉ khi tệp đó có thật. */
export function fallbackFor(src) {
  if (!src.endsWith('.webp')) return null;
  for (const ext of ['.png', '.jpg', '.jpeg']) {
    const cand = src.replace(/\.webp$/, ext);
    if (existsSync(joinPath(PUBLIC, decodeURIComponent(cand)))) return cand;
  }
  return null;
}

export const esc = (s = '') => String(s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

export const attr = (s = '') => esc(s);

/** Nối mảng, bỏ qua giá trị rỗng */
export const join = (arr, sep = '\n') => arr.filter(Boolean).join(sep);

/** Lặp mảng thành HTML */
export const map = (arr, fn) => arr.map(fn).join('\n');

/** Tiêu đề mục có nhãn vàng */
export function sectionHead({ eyebrow, title, lead, center = false, id }) {
  return `
    <div class="section-head${center ? ' center' : ''}"${id ? ` id="${attr(id)}"` : ''} data-reveal>
      ${eyebrow ? `<p class="eyebrow"><span class="spark" aria-hidden="true"></span>${esc(eyebrow)}</p>` : ''}
      <h2>${title}</h2>
      ${lead ? `<p class="lead">${lead}</p>` : ''}
    </div>`;
}

/** Nút có mũi tên */
export function btn({ href, label, variant = 'primary', size = '', arrow = true, attrs = '' }) {
  const cls = `btn btn-${variant}${size ? ` btn-${size}` : ''}`;
  const inner = `${esc(label)}${arrow ? ARROW : ''}`;
  return href
    ? `<a class="${cls}" href="${attr(href)}" ${attrs}>${inner}</a>`
    : `<button class="${cls}" ${attrs}>${inner}</button>`;
}

export const ARROW = `<svg class="arrow" width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10m0 0-4-4m4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export const CHECK = `<svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8.4l3.2 3.2L13 4.8" stroke="#D4AF37" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/** Khối câu hỏi thường gặp — có thể mở rộng, không cần JS để đọc nội dung */
export function faqList(items, idPrefix = 'faq') {
  return `<div class="faq-list">${map(items, (f, i) => `
    <div class="faq-item" data-reveal style="--delay:${i * 40}ms">
      <button class="faq-q" type="button" aria-expanded="false" aria-controls="${idPrefix}-${i}">
        <span>${esc(f.q)}</span>
        <span class="ic" aria-hidden="true"></span>
      </button>
      <div class="faq-a" id="${idPrefix}-${i}" role="region"><div><p>${esc(f.a)}</p></div></div>
    </div>`)}</div>`;
}

/**
 * Ảnh đáp ứng. Nếu ảnh đã được tối ưu, tự phát sinh AVIF + WebP nhiều kích thước;
 * nếu chưa, trả về thẻ img thường. Luôn có width/height để trang không nhảy bố cục.
 */
export function picture({ src, fallback = null, alt, width, height, cls = '', loading = 'lazy', sizes, fetchpriority }) {
  const opt = lookup(src);

  if (opt) {
    // Giữ đúng tỉ lệ gốc kể cả khi trang truyền vào kích thước khác
    const w = width || opt.width;
    const h = height || Math.round(w / opt.ratio);
    const sz = sizes || SIZES[opt.role] || '100vw';

    return `<picture>` +
      `<source type="image/avif" srcset="${attr(srcset(opt.avif, opt.widths))}" sizes="${attr(sz)}">` +
      `<source type="image/webp" srcset="${attr(srcset(opt.webp, opt.widths))}" sizes="${attr(sz)}">` +
      `<img src="${attr(opt.fallback)}" alt="${attr(alt)}" width="${w}" height="${h}" ` +
      `loading="${loading}" decoding="async"` +
      `${fetchpriority ? ` fetchpriority="${fetchpriority}"` : ''}` +
      `${cls ? ` class="${attr(cls)}"` : ''}>` +
      `</picture>`;
  }

  // Chưa tối ưu: giữ hành vi cũ
  const isWebp = src.endsWith('.webp');
  if (isWebp && !fallback) fallback = fallbackFor(src);
  const img = `<img src="${attr(isWebp && fallback ? fallback : src)}" alt="${attr(alt)}"${width ? ` width="${width}"` : ''}${height ? ` height="${height}"` : ''} loading="${loading}" decoding="async"${fetchpriority ? ` fetchpriority="${fetchpriority}"` : ''}${cls ? ` class="${attr(cls)}"` : ''}${sizes ? ` sizes="${attr(sizes)}"` : ''}>`;
  if (!isWebp) return img;
  return `<picture><source srcset="${attr(src)}" type="image/webp">${img}</picture>`;
}

/**
 * Thẻ preload cho ảnh LCP.
 * Preload đúng định dạng mà <picture> sẽ chọn, nếu không sẽ tải trùng hai tệp.
 * <picture> xếp AVIF trước nên ta preload AVIF; trình duyệt không đọc được AVIF sẽ
 * bỏ qua thẻ này nhờ thuộc tính type, và vẫn được ưu tiên bởi fetchpriority trên img.
 */
export function preloadFor(src) {
  const opt = lookup(src);
  if (!opt) return `<link rel="preload" as="image" href="${attr(src)}" fetchpriority="high">`;
  const sz = SIZES[opt.role] || '100vw';
  return `<link rel="preload" as="image" type="image/avif" ` +
    `imagesrcset="${attr(srcset(opt.avif, opt.widths))}" ` +
    `imagesizes="${attr(sz)}" fetchpriority="high">`;
}

/** Đường dẫn ảnh đã tối ưu, dùng cho preload LCP và thẻ og:image. */
export function optimized(src, width) {
  const opt = lookup(src);
  if (!opt) return src;
  if (!width) return opt.fallback;
  const i = opt.widths.findIndex(w => w >= width);
  return opt.webp[i === -1 ? opt.webp.length - 1 : i];
}

/** Cắt chuỗi tại ranh giới từ, không vượt quá max ký tự. */
export function shorten(str, max) {
  const t = String(str).trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const sp = cut.lastIndexOf(' ');
  return (sp > max * 0.6 ? cut.slice(0, sp) : cut).replace(/[.,;:—–-]$/, '') + '…';
}
