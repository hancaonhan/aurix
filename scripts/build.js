/**
 * Aurix — Trình tạo trang tĩnh.
 * Render mọi trang thành HTML thật trong public/, kèm sitemap, robots và manifest.
 */
import { mkdir, writeFile, rm, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { site } from '../site/data/site.js';
import { services } from '../site/data/services.js';
import { projects, industries } from '../site/data/content.js';
import { articles } from '../site/data/articles.js';

import homePage from '../site/pages/home.js';
import { servicePage, servicesIndexPage } from '../site/pages/service.js';
import { diagnosticPage } from '../site/pages/diagnostic.js';
import { articlePage, articlesIndexPage } from '../site/pages/article.js';
import { industryPage, industriesIndexPage } from '../site/pages/industry.js';
import { pricingPage, privacyPage } from '../site/pages/company.js';
import {
  methodPage, projectsIndexPage, projectPage,
  aboutPage, contactPage, thankYouPage, notFoundPage
} from '../site/pages/misc.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public');

/* ---------- Danh sách trang ---------- */
function collectPages() {
  const pages = [
    { url: '/', html: homePage(), priority: 1.0, changefreq: 'weekly' },
    { url: '/dich-vu/', html: servicesIndexPage(), priority: 0.9, changefreq: 'monthly' },
    { url: '/phuong-phap/', html: methodPage(), priority: 0.8, changefreq: 'monthly' },
    { url: '/du-an/', html: projectsIndexPage(), priority: 0.8, changefreq: 'weekly' },
    { url: '/nganh/', html: industriesIndexPage(), priority: 0.8, changefreq: 'monthly' },
    { url: '/kien-thuc/', html: articlesIndexPage(), priority: 0.8, changefreq: 'weekly' },
    { url: '/ve-aurix/', html: aboutPage(), priority: 0.7, changefreq: 'monthly' },
    { url: '/dau-tu/', html: pricingPage(), priority: 0.9, changefreq: 'monthly' },
    { url: '/chinh-sach-bao-mat/', html: privacyPage(), priority: 0.3, changefreq: 'yearly' },
    { url: '/lien-he/', html: contactPage(), priority: 0.8, changefreq: 'yearly' },
    { url: '/chan-doan/', html: diagnosticPage(), priority: 0.9, changefreq: 'monthly' },
    { url: '/cam-on/', html: thankYouPage(), noindex: true },
    { url: '/404.html', html: notFoundPage(), noindex: true, raw: true }
  ];

  for (const s of services) {
    pages.push({ url: `/dich-vu/${s.slug}/`, html: servicePage(s), priority: 0.9, changefreq: 'monthly' });
  }
  for (const i of industries) {
    pages.push({ url: `/nganh/${i.slug}/`, html: industryPage(i), priority: 0.8, changefreq: 'monthly' });
  }
  for (const a of articles) {
    pages.push({ url: `/kien-thuc/${a.slug}/`, html: articlePage(a), priority: 0.7, changefreq: 'monthly', lastmod: a.updated || a.date });
  }
  for (const p of projects) {
    pages.push({ url: `/du-an/${p.slug}/`, html: projectPage(p), priority: 0.7, changefreq: 'monthly' });
  }
  return pages;
}

/* ---------- Rút gọn HTML (an toàn, không đụng vào pre/script/style) ---------- */
function minify(html) {
  const stash = [];
  const keep = html.replace(/<(pre|textarea|script|style)\b[\s\S]*?<\/\1>/gi, m => {
    stash.push(m);
    return `\u0000${stash.length - 1}\u0000`;
  });

  const out = keep
    .replace(/<!--(?!\[if)[\s\S]*?-->/g, '')   // bỏ chú thích, giữ conditional comment
    .replace(/\n\s*/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .replace(/>\s+</g, '><')
    .trim();

  return out.replace(/\u0000(\d+)\u0000/g, (_, i) => stash[Number(i)]);
}

/* ---------- Tài nguyên phụ ---------- */
function sitemap(pages) {
  // Ngày sửa đổi thật. Đặt ngày build cho mọi trang sẽ khiến công cụ tìm kiếm
  // bỏ qua trường này, vì cả sitemap luôn trông như vừa thay đổi toàn bộ.
  const today = new Date().toISOString().slice(0, 10);
  const urls = pages
    .filter(p => !p.noindex)
    .map(p => `  <url>
    <loc>${site.origin}${p.url}</loc>
    <lastmod>${p.lastmod || today}</lastmod>
    <changefreq>${p.changefreq || 'monthly'}</changefreq>
    <priority>${(p.priority ?? 0.5).toFixed(1)}</priority>
  </url>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

const robots = () => `User-agent: *
Allow: /
Disallow: /cam-on/
Disallow: /api/
Disallow: /admin

Sitemap: ${site.origin}/sitemap.xml
`;

const manifest = () => JSON.stringify({
  name: `${site.name} — ${site.positioning}`,
  short_name: site.name,
  description: 'Aurix xây hệ thống tăng trưởng cho doanh nghiệp dịch vụ cao cấp.',
  start_url: '/',
  display: 'standalone',
  background_color: site.themeColor,
  theme_color: site.themeColor,
  lang: 'vi',
  icons: [
    { src: '/assets/Logo.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' }
  ]
}, null, 2);

// Favicon: tia lửa chữ A của Aurix trên nền navy
const favicon = () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F0D9A0"/>
      <stop offset="50%" stop-color="#D4AF37"/>
      <stop offset="100%" stop-color="#B8861F"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="14" fill="#0B1220"/>
  <path d="M36.2 8 12 40.5h14.3L23.8 56 48 23.4H33.4L36.2 8Z" fill="url(#g)"/>
</svg>
`;

/* ---------- Chạy ---------- */
async function build() {
  const t0 = performance.now();
  const pages = collectPages();

  // Dọn HTML cũ, giữ nguyên assets/css/js
  for (const dir of ['dich-vu', 'du-an', 'kien-thuc', 'nganh', 'dau-tu', 'chinh-sach-bao-mat', 'phuong-phap', 've-aurix', 'lien-he', 'chan-doan', 'cam-on']) {
    const p = join(OUT, dir);
    if (existsSync(p)) await rm(p, { recursive: true, force: true });
  }

  let bytes = 0;
  for (const page of pages) {
    const rel = page.raw ? page.url.slice(1) : join(page.url.slice(1), 'index.html');
    const dest = join(OUT, rel);
    await mkdir(dirname(dest), { recursive: true });
    const html = minify(page.html);
    await writeFile(dest, html, 'utf8');
    bytes += Buffer.byteLength(html);
    console.log(`  ${page.url.padEnd(34)} ${(Buffer.byteLength(html) / 1024).toFixed(1)} KB`);
  }

  await writeFile(join(OUT, 'sitemap.xml'), sitemap(pages), 'utf8');
  await writeFile(join(OUT, 'robots.txt'), robots(), 'utf8');
  await writeFile(join(OUT, 'site.webmanifest'), manifest(), 'utf8');
  await writeFile(join(OUT, 'favicon.svg'), favicon(), 'utf8');

  const ms = (performance.now() - t0).toFixed(0);
  console.log(`\n  ${pages.length} trang · ${(bytes / 1024).toFixed(0)} KB HTML · ${ms}ms`);
  console.log(`  sitemap.xml, robots.txt, site.webmanifest, favicon.svg đã tạo.\n`);
}

build().catch(err => {
  console.error('\nBuild thất bại:\n', err);
  process.exit(1);
});
