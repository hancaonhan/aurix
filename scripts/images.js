/**
 * Aurix — Tối ưu ảnh.
 *
 * Sinh AVIF + WebP nhiều kích thước cho từng ảnh nguồn, ghi ra public/assets/opt/
 * kèm manifest. Trình dựng trang đọc manifest và tự phát sinh srcset — code trang
 * không phải sửa gì.
 *
 *   node scripts/images.js          chỉ xử lý ảnh mới hoặc đã đổi
 *   node scripts/images.js --force  xử lý lại toàn bộ
 */
import { mkdir, writeFile, readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = join(ROOT, 'public', 'assets');
const OUT = join(ASSETS, 'opt');
// Ảnh gốc: nằm ngoài public/ nên không đi kèm bản dựng khi triển khai.
const SOURCE_DIR = join(ROOT, 'assets-goc');
const MANIFEST = join(OUT, 'manifest.json');
const FORCE = process.argv.includes('--force');

/**
 * Bề rộng cần sinh, theo vai trò của ảnh trên trang.
 * Chọn theo kích thước hiển thị thật, nhân 2 cho màn hình mật độ cao.
 */
const ROLES = {
  hero:   [480, 720, 960, 1280],
  wide:   [640, 960, 1280, 1600],
  card:   [320, 480, 640, 960],
  // Ảnh bộ nhận diện dự án: lưới 3 cột dùng bản nhỏ, trang chi tiết dùng bản 1240
  board:  [320, 480, 640, 960, 1240],
  avatar: [72, 128, 192],
  logo:   [150, 300]
};

/** Ảnh nguồn và vai trò tương ứng. */
const SOURCES = [
  { src: '/assets/logo-trang-aurix.png', role: 'logo' },
  { src: '/assets/models/11.png', role: 'hero' },
  { src: '/assets/aurix-team.png', role: 'wide' },
  { src: '/assets/aurix-difference.png', role: 'wide' },
  { src: '/assets/aurix-marketing-funnel.png', role: 'wide' },
  { src: '/assets/after-fitness.png', role: 'wide' },
  { src: '/assets/after-edu.png', role: 'wide' },
  { src: '/assets/C.E.O-a-chau.png', role: 'avatar' },
  { src: '/assets/C.E.O-fitness.png', role: 'avatar' },
  { src: '/assets/C.E.O-anh-ngu.png', role: 'avatar' },
  ...['brightway', 'dental', 'fitcore', 'lavie-spa', 'lumina', 'moc-vi', 'wanderlust']
    .map(n => ({ src: `/assets/projects/${n}-aurix.png`, role: 'board' }))
];

// Ảnh chỉ có bản .webp, không có .png nguồn
const WEBP_ONLY = [
  { src: '/assets/aurix-giap-phap-marketing-dich-vu.webp', role: 'wide' }
];

const fmtKB = b => `${(b / 1024).toFixed(0)} KB`;

async function loadManifest() {
  if (FORCE || !existsSync(MANIFEST)) return {};
  try { return JSON.parse(await readFile(MANIFEST, 'utf8')); } catch { return {}; }
}

/**
 * Tìm tệp gốc của một ảnh.
 * Ảnh gốc nằm ngoài public/ để không bị xuất bản kèm bản dựng — chúng nặng
 * hàng chục MB và chỉ là đầu vào cho bước tối ưu. Vẫn dò trong public/ cho vài
 * tệp buộc phải ở đó, như logo dùng làm biểu tượng ứng dụng.
 */
function resolveSource(src) {
  const rel = decodeURIComponent(src).replace(/^\/assets\//, '');
  const candidates = [
    join(SOURCE_DIR, rel),
    join(ROOT, 'public', decodeURIComponent(src))
  ];
  return candidates.find(existsSync) || null;
}

async function processOne(entry, manifest, stats) {
  const { src, role } = entry;
  const abs = resolveSource(src);
  if (!abs) {
    console.log(`  ✗ không tìm thấy: ${src}`);
    return;
  }

  const st = await stat(abs);
  // Vai trò nằm trong dấu vân tay: đổi vai trò là đổi bộ bề rộng cần sinh,
  // nên phải xử lý lại dù tệp nguồn không đổi.
  const fingerprint = `${st.size}-${Math.floor(st.mtimeMs)}-${role}-${ROLES[role].join('.')}`;

  // Bỏ qua nếu đã xử lý và tệp nguồn không đổi
  if (manifest[src]?.fingerprint === fingerprint) {
    stats.skipped++;
    return;
  }

  const image = sharp(abs, { failOn: 'none' });
  const meta = await image.metadata();
  const name = basename(src, extname(src)).replace(/[^\w.-]+/g, '-');

  // Không phóng to quá kích thước gốc
  const widths = ROLES[role].filter(w => w <= meta.width).slice();
  if (!widths.length || widths[widths.length - 1] < meta.width * 0.9) {
    const capped = Math.min(meta.width, ROLES[role][ROLES[role].length - 1]);
    if (!widths.includes(capped)) widths.push(capped);
  }

  const variants = { avif: [], webp: [] };
  let savedFrom = st.size;
  let largest = 0;

  for (const w of widths) {
    const resized = sharp(abs, { failOn: 'none' }).resize({ width: w, withoutEnlargement: true });

    const webpPath = join(OUT, `${name}-${w}.webp`);
    const webpInfo = await resized.clone().webp({ quality: 80, effort: 5 }).toFile(webpPath);
    variants.webp.push({ w, path: `/assets/opt/${name}-${w}.webp`, bytes: webpInfo.size });

    const avifPath = join(OUT, `${name}-${w}.avif`);
    const avifInfo = await resized.clone().avif({ quality: 58, effort: 4 }).toFile(avifPath);
    variants.avif.push({ w, path: `/assets/opt/${name}-${w}.avif`, bytes: avifInfo.size });

    largest = Math.max(largest, webpInfo.size);
  }

  manifest[src] = {
    fingerprint,
    role,
    width: meta.width,
    height: meta.height,
    ratio: +(meta.width / meta.height).toFixed(4),
    widths,
    avif: variants.avif.map(v => v.path),
    webp: variants.webp.map(v => v.path),
    // Bản lớn nhất dùng làm ảnh dự phòng cho <img>
    fallback: variants.webp[variants.webp.length - 1].path
  };

  stats.done++;
  stats.before += savedFrom;
  stats.after += largest;
  console.log(`  ${basename(src).padEnd(34)} ${fmtKB(savedFrom).padStart(8)} → ${fmtKB(largest).padStart(7)} (${widths.join('/')})`);
}

/**
 * Ảnh chia sẻ mạng xã hội: 1200x630 JPEG.
 * Facebook, Zalo và LinkedIn không đọc được AVIF, và WebP thì tuỳ nơi — JPEG là
 * định dạng duy nhất chắc chắn hiển thị ở mọi chỗ.
 */
async function buildOgImage() {
  const source = resolveSource('/assets/aurix-team.png');
  if (!source) return;

  const dest = join(OUT, 'og-aurix.jpg');
  const info = await sharp(source, { failOn: 'none' })
    .resize({ width: 1200, height: 630, fit: 'cover', position: 'attention' })
    .jpeg({ quality: 82, mozjpeg: true, progressive: true })
    .toFile(dest);

  console.log(`\n  Ảnh chia sẻ mạng xã hội  1200x630  ${fmtKB(info.size)}  →  /assets/opt/og-aurix.jpg`);
}

async function run() {
  await mkdir(OUT, { recursive: true });
  const manifest = await loadManifest();
  const stats = { done: 0, skipped: 0, before: 0, after: 0 };

  console.log(`\n  Tối ưu ảnh${FORCE ? ' (xử lý lại toàn bộ)' : ''}\n`);

  for (const entry of [...SOURCES, ...WEBP_ONLY]) {
    await processOne(entry, manifest, stats);
  }

  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2), 'utf8');
  await buildOgImage();

  const line = '  ' + '─'.repeat(60);
  console.log(`\n${line}`);
  if (stats.done) {
    const pct = ((1 - stats.after / stats.before) * 100).toFixed(1);
    console.log(`  ${stats.done} ảnh đã xử lý · ${fmtKB(stats.before)} → ${fmtKB(stats.after)} (giảm ${pct}%)`);
  }
  if (stats.skipped) console.log(`  ${stats.skipped} ảnh không đổi, bỏ qua.`);
  console.log(`  Manifest: public/assets/opt/manifest.json\n`);
}

run().catch(err => {
  console.error('\n  Tối ưu ảnh thất bại:\n', err);
  process.exit(1);
});
