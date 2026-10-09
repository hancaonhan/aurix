/**
 * Aurix — Dựng tài sản nhận diện từ logo gốc.
 *
 * Nguồn duy nhất: public/assets/logo-toi-aurix.png (chữ #0E3B3D, chấm cam
 * #F27A1A, nền trong suốt) và public/assets/Logo.png (bản trên nền chuyển sắc).
 * Mọi thứ khác sinh ra từ hai tệp đó, nên đổi logo chỉ cần thay hai tệp rồi chạy:
 *
 *   node scripts/brand.js && node scripts/images.js
 *
 * Sinh ra:
 *   public/assets/logo-trang-aurix.png   chữ trắng + chấm cam, cho nền tối
 *   public/favicon.png                   48×48
 *   public/apple-touch-icon.png          180×180
 *   public/favicon.ico                   32×32 (PNG trong vỏ ICO)
 *   public/assets/icon-512.png           biểu tượng ứng dụng (manifest)
 *
 * Chỉ dùng lúc dựng (sharp là phụ thuộc phát triển), không chạy trên máy chủ.
 */
import sharp from 'sharp';
import { join, dirname } from 'node:path';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUB = join(ROOT, 'public');
const DARK_LOGO = join(PUB, 'assets', 'logo-toi-aurix.png');

/** Bảng màu thương hiệu — giữ khớp với :root trong public/css/aurix.css. */
export const BRAND = {
  teal: [0x0E, 0x3B, 0x3D],      // #0E3B3D chữ logo trên nền sáng
  orange: [0xF2, 0x7A, 0x1A],    // #F27A1A chấm chữ i
  gradFrom: '#046E72',           // nền chuyển sắc: góc sáng
  gradMid: '#045152',
  gradTo: '#012B2B'              // góc đậm
};

const isOrange = (r, g, b) => r > 200 && g > 90 && g < 160 && b < 80;

/** Logo trắng: giữ kênh alpha và chấm cam, tô phần chữ thành trắng. */
async function whiteLogo() {
  const { data, info } = await sharp(DARK_LOGO).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    // Bóng đổ mờ quanh chữ tô trắng sẽ thành quầng sáng trên nền tối: bỏ phần
    // alpha thấp, giữ mép khử răng cưa bằng cách giãn dải alpha còn lại.
    data[i + 3] = Math.max(0, Math.min(255, Math.round((data[i + 3] - 110) * 255 / 145)));
    if (isOrange(data[i], data[i + 1], data[i + 2])) continue;
    data[i] = data[i + 1] = data[i + 2] = 255;
  }
  const out = join(PUB, 'assets', 'logo-trang-aurix.png');
  await sharp(data, { raw: info }).png().toFile(out);
  console.log('  logo-trang-aurix.png', `${info.width}×${info.height}`);
}

/** Nền vuông bo góc, chuyển sắc như ảnh nhận diện gốc. */
const tile = size => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${BRAND.gradFrom}"/>
    <stop offset=".45" stop-color="${BRAND.gradMid}"/>
    <stop offset="1" stop-color="${BRAND.gradTo}"/>
  </linearGradient></defs>
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.22)}" fill="url(#g)"/>
  <circle cx="${size * 0.76}" cy="${size * 0.24}" r="${size * 0.085}" fill="rgb(${BRAND.orange})"/>
</svg>`);

/**
 * Biểu tượng: chữ A trắng (cắt từ logo) trên nền chuyển sắc, kèm chấm cam —
 * hai yếu tố dễ nhận ra nhất của logo khi thu nhỏ còn 16–48 điểm ảnh.
 */
async function icon(size, file) {
  const { data, info } = await sharp(DARK_LOGO)
    .extract({ left: 0, top: 0, width: 200, height: 191 })
    .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const x = (i / 4) % info.width, y = Math.floor(i / 4 / info.width);
    // Nét trái của chữ U lấn vào khung cắt: bỏ hẳn phần bên phải, cả đầu vệt chéo.
    if (x >= 184) data[i + 3] = 0;
    data[i + 3] = Math.max(0, Math.min(255, Math.round((data[i + 3] - 110) * 255 / 145)));
    data[i] = data[i + 1] = data[i + 2] = 255;
  }
  const glyphW = Math.round(size * 0.62);
  const glyph = await sharp(data, { raw: info }).resize({ width: glyphW }).png().toBuffer();
  const gh = Math.round(glyphW * 191 / 200);
  await sharp(tile(size))
    .composite([{ input: glyph, left: Math.round(size * 0.17), top: Math.round((size - gh) / 2 + size * 0.04) }])
    .png().toFile(file);
  console.log(' ', file.replace(PUB, 'public').replace(/\\/g, '/'), `${size}×${size}`);
}

/**
 * favicon.ico: trình duyệt và máy tìm kiếm tự gọi đường dẫn này dù trang đã
 * khai PNG. Tệp ICO được phép chứa nguyên một ảnh PNG, nên chỉ cần ghép
 * phần đầu 22 byte (ICONDIR + một ICONDIRENTRY) trước dữ liệu PNG.
 */
async function faviconIco(pngFile) {
  const png = await sharp(pngFile).resize(32, 32).png().toBuffer();
  const head = Buffer.alloc(22);
  head.writeUInt16LE(0, 0);        // dành riêng
  head.writeUInt16LE(1, 2);        // loại: biểu tượng
  head.writeUInt16LE(1, 4);        // số ảnh
  head.writeUInt8(32, 6);          // rộng
  head.writeUInt8(32, 7);          // cao
  head.writeUInt8(0, 8);           // số màu bảng màu (0 = không dùng)
  head.writeUInt8(0, 9);           // dành riêng
  head.writeUInt16LE(1, 10);       // mặt phẳng màu
  head.writeUInt16LE(32, 12);      // bit mỗi điểm ảnh
  head.writeUInt32LE(png.length, 14);
  head.writeUInt32LE(22, 18);      // vị trí dữ liệu ảnh
  await writeFile(join(PUB, 'favicon.ico'), Buffer.concat([head, png]));
  console.log('  public/favicon.ico 32×32');
}

await whiteLogo();
await icon(48, join(PUB, 'favicon.png'));
await faviconIco(join(PUB, 'favicon.png'));
await icon(180, join(PUB, 'apple-touch-icon.png'));
await icon(512, join(PUB, 'assets', 'icon-512.png'));
