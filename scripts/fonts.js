/**
 * Aurix — Tự host phông chữ.
 *
 * Tải woff2 từ Google Fonts, chỉ giữ các subset thật sự cần (vietnamese + latin),
 * rồi sinh public/css/fonts.css trỏ tới tệp cục bộ.
 *
 * Vì sao tự host:
 *   · Bỏ hai lần bắt tay DNS/TLS tới fonts.googleapis.com và fonts.gstatic.com
 *   · Bỏ subset latin-ext — trang tiếng Việt không dùng tới
 *   · Tự kiểm soát cache, và thắt chặt được Content-Security-Policy
 *
 *   node scripts/fonts.js
 */
import { mkdir, writeFile, readdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FONT_DIR = join(ROOT, 'public', 'assets', 'fonts');
const CSS_OUT = join(ROOT, 'public', 'css', 'fonts.css');

/** Subset cần giữ. Bỏ latin-ext: đó là ký tự Đông Âu, trang này không dùng. */
const KEEP_SUBSETS = new Set(['vietnamese', 'latin']);

const FAMILIES = [
  { name: 'Be Vietnam Pro', spec: 'Be+Vietnam+Pro:ital,wght@0,400;0,600;0,700;0,800' },
  { name: 'Playfair Display', spec: 'Playfair+Display:ital,wght@0,500;1,500' }
];

// Google trả woff2 khi nhận User-Agent của trình duyệt hiện đại
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/**
 * Tách các khối @font-face. Google ghi tên subset trong comment ngay trước mỗi khối.
 */
function parseFaces(css) {
  const faces = [];
  const re = /\/\*\s*([\w-]+)\s*\*\/\s*@font-face\s*\{([^}]*)\}/g;
  let m;
  while ((m = re.exec(css))) {
    const [, subset, block] = m;
    const get = re2 => (re2.exec(block) || [])[1];
    faces.push({
      subset,
      family: get(/font-family:\s*'([^']+)'/),
      style: get(/font-style:\s*(\w+)/) || 'normal',
      weight: get(/font-weight:\s*(\d+)/) || '400',
      unicodeRange: get(/unicode-range:\s*([^;]+)/)?.trim(),
      url: get(/url\(([^)]+)\)\s*format\('woff2'\)/)
    });
  }
  return faces;
}

async function run() {
  await mkdir(FONT_DIR, { recursive: true });
  await mkdir(dirname(CSS_OUT), { recursive: true });

  // Dọn phông cũ để không còn tệp thừa
  if (existsSync(FONT_DIR)) {
    for (const f of await readdir(FONT_DIR)) {
      if (f.endsWith('.woff2')) await rm(join(FONT_DIR, f));
    }
  }

  console.log('\n  Tải và tự host phông chữ\n');

  const blocks = [];
  let total = 0;
  let skipped = 0;

  for (const family of FAMILIES) {
    const url = `https://fonts.googleapis.com/css2?family=${family.spec}&display=swap`;
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!res.ok) throw new Error(`Không tải được CSS của ${family.name}: ${res.status}`);

    const faces = parseFaces(await res.text());
    if (!faces.length) throw new Error(`Không đọc được @font-face nào cho ${family.name}`);

    for (const face of faces) {
      if (!KEEP_SUBSETS.has(face.subset)) { skipped++; continue; }
      if (!face.url) continue;

      const italic = face.style === 'italic';
      const filename = `${slug(face.family)}-${face.weight}${italic ? 'i' : ''}-${face.subset}.woff2`;

      const bin = await fetch(face.url, { headers: { 'User-Agent': UA } });
      if (!bin.ok) throw new Error(`Không tải được ${face.url}`);
      const buf = Buffer.from(await bin.arrayBuffer());
      await writeFile(join(FONT_DIR, filename), buf);

      total += buf.length;
      console.log(`  ${filename.padEnd(44)} ${(buf.length / 1024).toFixed(0).padStart(4)} KB`);

      blocks.push(`@font-face {
  font-family: '${face.family}';
  font-style: ${face.style};
  font-weight: ${face.weight};
  font-display: swap;
  src: url('/assets/fonts/${filename}') format('woff2');
  unicode-range: ${face.unicodeRange};
}`);
    }
  }

  const header = `/* Phông chữ tự host — sinh bởi scripts/fonts.js. Không sửa tay.
   Chỉ giữ subset vietnamese và latin. */\n\n`;
  await writeFile(CSS_OUT, header + blocks.join('\n\n') + '\n', 'utf8');

  const line = '  ' + '─'.repeat(60);
  console.log(`\n${line}`);
  console.log(`  ${blocks.length} tệp phông · ${(total / 1024).toFixed(0)} KB · bỏ qua ${skipped} subset không dùng`);
  console.log(`  CSS: public/css/fonts.css\n`);
}

run().catch(err => {
  console.error('\n  Tải phông thất bại:\n', err.message);
  process.exit(1);
});
