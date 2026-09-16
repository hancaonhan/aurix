/**
 * Aurix — Kiểm định chất lượng site đã build.
 * Soát SEO, liên kết nội bộ, tài nguyên, cấu trúc dữ liệu và khả năng tiếp cận.
 *
 *   node scripts/audit.js
 */
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = join(ROOT, 'public');
const SITE_ORIGIN = (await import('../site/data/site.js')).site.origin;

const problems = [];
const warnings = [];
const fail = (page, msg) => problems.push(`${page} — ${msg}`);
const warn = (page, msg) => warnings.push(`${page} — ${msg}`);

/* ---------- Thu thập trang ---------- */
async function walk(dir, out = []) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (['assets', 'css', 'js'].includes(e.name) && dir === PUBLIC) continue;
      await walk(p, out);
    } else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const exists = async p => { try { await stat(p); return true; } catch { return false; } };

const pick = (html, re) => { const m = re.exec(html); return m ? m[1] : null; };
const all = (html, re) => [...html.matchAll(re)].map(m => m[1]);

/* ---------- Chạy ---------- */
const files = await walk(PUBLIC);
const titles = new Map();
const descs = new Map();
const canons = new Map();

console.log(`\n  Kiểm định ${files.length} trang…\n`);

for (const file of files) {
  const rel = '/' + file.slice(PUBLIC.length + 1).replace(/\\/g, '/').replace(/index\.html$/, '');
  const html = await readFile(file, 'utf8');

  /* --- Thẻ SEO cơ bản --- */
  const title = pick(html, /<title>([^<]*)<\/title>/);
  const desc = pick(html, /<meta name="description" content="([^"]*)"/);
  const canon = pick(html, /<link rel="canonical" href="([^"]*)"/);
  const noindex = /content="noindex/.test(html);

  if (!title) fail(rel, 'thiếu thẻ title');
  else {
    if (title.length > 65) warn(rel, `title dài ${title.length} ký tự (nên dưới 65)`);
    if (title.length < 20) warn(rel, `title ngắn ${title.length} ký tự`);
    if (titles.has(title)) fail(rel, `title trùng với ${titles.get(title)}`);
    titles.set(title, rel);
  }

  if (!desc) fail(rel, 'thiếu meta description');
  else {
    if (desc.length > 165) warn(rel, `description dài ${desc.length} ký tự (nên dưới 165)`);
    if (desc.length < 70) warn(rel, `description ngắn ${desc.length} ký tự`);
    if (descs.has(desc)) fail(rel, `description trùng với ${descs.get(desc)}`);
    descs.set(desc, rel);
  }

  if (!canon) fail(rel, 'thiếu thẻ canonical');
  else if (!noindex) {
    if (canons.has(canon)) fail(rel, `canonical trùng với ${canons.get(canon)}`);
    canons.set(canon, rel);
  }

  if (!/<html lang="vi">/.test(html)) fail(rel, 'thiếu thuộc tính lang trên thẻ html');
  if (!/<meta property="og:image"/.test(html)) fail(rel, 'thiếu og:image');
  if (!/<meta name="viewport"/.test(html)) fail(rel, 'thiếu thẻ viewport');

  /* --- Cấu trúc tiêu đề --- */
  const h1s = all(html, /<h1[^>]*>([\s\S]*?)<\/h1>/g);
  if (h1s.length === 0) fail(rel, 'không có thẻ h1');
  if (h1s.length > 1) fail(rel, `có ${h1s.length} thẻ h1 (chỉ nên có 1)`);

  /* --- Dữ liệu có cấu trúc --- */
  const ld = pick(html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!ld) fail(rel, 'thiếu JSON-LD');
  else {
    try {
      const parsed = JSON.parse(ld.replace(/\\u003c/g, '<'));
      if (!parsed['@graph']?.length) fail(rel, 'JSON-LD không có @graph');
    } catch (e) {
      fail(rel, `JSON-LD không phân tích được: ${e.message}`);
    }
  }

  /* --- Ảnh --- */
  for (const m of html.matchAll(/<img\b([^>]*)>/g)) {
    const tag = m[1];
    const src = pick(tag, /src="([^"]*)"/);
    if (!/alt="/.test(tag)) fail(rel, `ảnh thiếu alt: ${src}`);
    if (!/width="/.test(tag) || !/height="/.test(tag)) warn(rel, `ảnh thiếu width/height: ${src}`);
    if (src?.startsWith('/') && !(await exists(join(PUBLIC, decodeURIComponent(src))))) {
      fail(rel, `ảnh không tồn tại: ${src}`);
    }
  }
  // Kiểm tra MỌI kích thước trong srcset, không chỉ cái đầu tiên
  const srcsets = [
    ...all(html, /<source[^>]*srcset="([^"]*)"/g),
    ...all(html, /<link[^>]*imagesrcset="([^"]*)"/g)
  ];
  for (const set of srcsets) {
    for (const candidate of set.split(',')) {
      const p = candidate.trim().split(/\s+/)[0];
      if (!p || !p.startsWith('/')) continue;
      if (!(await exists(join(PUBLIC, decodeURIComponent(p))))) {
        fail(rel, `nguồn ảnh không tồn tại: ${p}`);
      }
    }
    if (/\s\d+w/.test(set) && !/sizes="/.test(html)) {
      warn(rel, 'srcset có mô tả bề rộng nhưng trang thiếu thuộc tính sizes');
    }
  }

  // Ảnh dùng picture phải khai báo cả AVIF lẫn WebP để không phụ thuộc một định dạng
  for (const m of html.matchAll(/<picture>([\s\S]*?)<\/picture>/g)) {
    const inner = m[1];
    if (inner.includes('/assets/opt/') && !inner.includes('image/avif')) {
      warn(rel, 'ảnh đã tối ưu nhưng thiếu nguồn AVIF');
    }
  }

  // og:image phải là JPEG hoặc PNG — nhiều nền tảng mạng xã hội không đọc WebP/AVIF
  const og = pick(html, /<meta property="og:image" content="([^"]*)"/);
  if (og && /\.(webp|avif)$/i.test(og)) {
    fail(rel, `og:image dùng định dạng mạng xã hội không đọc được: ${og}`);
  }
  if (og?.startsWith(SITE_ORIGIN)) {
    const p = og.slice(SITE_ORIGIN.length);
    if (!(await exists(join(PUBLIC, decodeURIComponent(p))))) fail(rel, `og:image không tồn tại: ${p}`);
  }

  /* --- Liên kết nội bộ --- */
  for (const href of all(html, /<a\b[^>]*href="([^"]*)"/g)) {
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    const clean = href.split('#')[0].split('?')[0];
    if (!clean) continue;
    const target = clean.endsWith('/') ? join(PUBLIC, clean, 'index.html') : join(PUBLIC, clean);
    if (!(await exists(target))) fail(rel, `liên kết hỏng: ${href}`);
  }

  /* --- Tài nguyên CSS/JS --- */
  for (const href of [...all(html, /<link[^>]*href="(\/[^"]*)"/g), ...all(html, /<script[^>]*src="(\/[^"]*)"/g)]) {
    const clean = href.split('?')[0];
    if (!(await exists(join(PUBLIC, clean)))) fail(rel, `tài nguyên không tồn tại: ${href}`);
  }

  /* --- Khả năng tiếp cận --- */
  if (!/class="skip-link"/.test(html)) warn(rel, 'thiếu liên kết bỏ qua điều hướng');
  if (!/<main\b/.test(html)) fail(rel, 'thiếu thẻ main');
  for (const m of html.matchAll(/<button\b([^>]*)>([\s\S]{0,80}?)<\/button>/g)) {
    const [, attrs, inner] = m;
    const hasText = inner.replace(/<[^>]*>/g, '').trim().length > 0;
    if (!hasText && !/aria-label=/.test(attrs)) fail(rel, 'nút không có nhãn cho trình đọc màn hình');
  }
}

/* ---------- Tính nhất quán của khung A.U.R.I.X ----------
   Khung được khai báo ở ba nơi: framework.js (hiển thị), diagnostic.js (chấm điểm)
   và services.js (trang dịch vụ). Ba nơi lệch nhau là lỗi âm thầm, không ai thấy. */
{
  const { framework } = await import('../site/data/framework.js');
  const { LAYERS } = await import('../site/data/diagnostic.js');
  const { services } = await import('../site/data/services.js');

  const letters = framework.layers.map(l => l.letter).join('');
  if (letters !== 'AURIX') fail('framework.js', `thứ tự tầng là "${letters}", phải là "AURIX"`);

  const slugs = new Set(services.map(s => `/dich-vu/${s.slug}/`));
  for (const [key, meta] of Object.entries(LAYERS)) {
    if (!slugs.has(meta.service)) {
      fail('diagnostic.js', `tầng ${meta.letter} trỏ tới dịch vụ không tồn tại: ${meta.service}`);
    }
    if (!framework.layers.some(l => l.letter === meta.letter)) {
      fail('diagnostic.js', `tầng ${meta.letter} không có trong framework.js`);
    }
  }
  for (const l of framework.layers) {
    if (!slugs.has(l.service)) fail('framework.js', `tầng ${l.letter} trỏ tới dịch vụ không tồn tại: ${l.service}`);
  }
  const svcLetters = services.map(s => s.layer).join('');
  if (svcLetters !== 'AURIX') fail('services.js', `thứ tự dịch vụ là "${svcLetters}", phải là "AURIX"`);
}

/* ---------- Sitemap ---------- */
const sm = await readFile(join(PUBLIC, 'sitemap.xml'), 'utf8');
const locs = all(sm, /<loc>([^<]*)<\/loc>/g);
console.log(`  sitemap.xml: ${locs.length} URL`);
for (const loc of locs) {
  const path = new URL(loc).pathname;
  const target = path.endsWith('/') ? join(PUBLIC, path, 'index.html') : join(PUBLIC, path);
  if (!(await exists(target))) fail('sitemap.xml', `URL không tồn tại: ${path}`);
}

/* ---------- Kết quả ---------- */
const line = '  ' + '─'.repeat(60);
console.log(line);
if (warnings.length) {
  console.log(`\n  CẢNH BÁO (${warnings.length})\n`);
  for (const w of warnings) console.log(`   · ${w}`);
}
if (problems.length) {
  console.log(`\n  LỖI (${problems.length})\n`);
  for (const p of problems) console.log(`   ✗ ${p}`);
  console.log(`\n${line}\n  Kiểm định THẤT BẠI: ${problems.length} lỗi, ${warnings.length} cảnh báo.\n`);
  process.exit(1);
}
console.log(`\n${line}`);
console.log(`  Kiểm định ĐẠT — ${files.length} trang, 0 lỗi, ${warnings.length} cảnh báo.\n`);
