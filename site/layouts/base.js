import { site, nav, cta } from '../data/site.js';
import { services } from '../data/services.js';
import { esc, attr, map, ARROW, preloadFor, picture } from '../lib/ui.js';

// Mã phiên bản build — gắn vào CSS/JS để cache dài hạn mà không bị cũ
export const BUILD = process.env.AURIX_BUILD || Date.now().toString(36);

const CRITICAL = `
:root{--ink-800:#0B1220;--gold-300:#E8C468;--fg:#F4F6FA}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:#0B1220;color:#F4F6FA;font-family:'Be Vietnam Pro','Segoe UI',system-ui,sans-serif;font-size:17px;line-height:1.72}
.site-header{position:fixed;inset:0 0 auto;z-index:100}
.nav{display:flex;align-items:center;gap:28px;height:80px;max-width:1240px;margin-inline:auto;padding-inline:clamp(20px,5vw,64px)}
.brand img{height:38px;width:auto;display:block}
.hero{padding-block:clamp(130px,17vh,190px) clamp(70px,9vw,110px)}
h1{font-size:clamp(34px,4.7vw,62px);line-height:1.14;letter-spacing:-.04em;margin:0;font-weight:800}
img{max-width:100%;display:block;height:auto}
`.replace(/\s*\n\s*/g, '');

function navHtml(current) {
  return map(nav, item => {
    if (!item.children) {
      const active = current === item.href;
      return `<li><a class="nav-link" href="${attr(item.href)}"${active ? ' aria-current="page"' : ''}>${esc(item.label)}</a></li>`;
    }
    const active = current.startsWith('/dich-vu/');
    return `<li class="has-menu">
      <a class="nav-link" href="${attr(item.href)}"${active ? ' aria-current="page"' : ''}>${esc(item.label)}
        <svg class="chev" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><path d="M6 8.5 1.5 4h9L6 8.5Z"/></svg>
      </a>
      <ul class="submenu">${map(item.children, c => {
        const svc = services.find(s => c.href.includes(s.slug));
        return `<li><a href="${attr(c.href)}">
          <span class="sm-letter" aria-hidden="true">${svc ? svc.layer : 'A'}</span>
          <span><span class="sm-title">${esc(c.label)}</span><span class="sm-desc">${esc(c.desc)}</span></span>
        </a></li>`;
      })}</ul>
    </li>`;
  });
}

function headerHtml(current) {
  return `
<header class="site-header" id="siteHeader">
  <nav class="nav wrap" aria-label="Điều hướng chính">
    <a class="brand" href="/" aria-label="Aurix — Trang chủ">
      ${picture({
        src: site.logoFallback,
        alt: `Aurix — ${site.brandLine}`,
        width: 150, height: 41,
        loading: 'eager', fetchpriority: 'high'
      })}
    </a>
    <button class="nav-toggle" id="navToggle" aria-expanded="false" aria-controls="navLinks" aria-label="Mở menu">
      <span></span><span></span><span></span>
    </button>
    <ul class="nav-links" id="navLinks">${navHtml(current)}</ul>
    <a class="btn btn-primary btn-sm nav-cta" href="${attr(cta.primary.href)}">${esc(cta.primary.label)}${ARROW}</a>
  </nav>
</header>`;
}

function footerHtml() {
  const y = new Date().getFullYear();
  return `
<footer class="site-footer">
  <div class="wrap">
    <div class="footer-grid">
      <div>
        <a class="brand" href="/" aria-label="Aurix — Trang chủ" style="margin-bottom:20px">
          ${picture({ src: site.logoFallback, alt: 'Aurix', width: 150, height: 41 })}
        </a>
        <p class="soft" style="font-size:15px;max-width:34ch">Aurix xây dựng hệ thống tăng trưởng cho doanh nghiệp dịch vụ cao cấp tại Việt Nam.</p>
        <p class="muted" style="font-size:13.5px;margin-top:18px">
          ${esc(site.address.street)}<br>${esc(site.address.city)}
        </p>
      </div>
      <div>
        <h2 class="foot-h">Dịch vụ</h2>
        <ul class="footer-list">${map(services, s => `<li><a href="/dich-vu/${s.slug}/">${esc(s.name)}</a></li>`)}</ul>
      </div>
      <div>
        <h2 class="foot-h">Công ty</h2>
        <ul class="footer-list">
          <li><a href="/phuong-phap/">Phương pháp A.U.R.I.X</a></li>
          <li><a href="/du-an/">Dự án tiêu biểu</a></li>
          <li><a href="/nganh/">Ngành chuyên sâu</a></li>
          <li><a href="/kien-thuc/">Kiến thức</a></li>
          <li><a href="/dau-tu/">Mức đầu tư</a></li>
          <li><a href="/ve-aurix/">Về Aurix</a></li>
          <li><a href="/lien-he/">Liên hệ</a></li>
        </ul>
      </div>
      <div>
        <h2 class="foot-h">Kết nối</h2>
        <ul class="footer-list">
          <li><a href="${attr(site.phoneHref)}">${esc(site.phone)}</a></li>
          <li><a href="mailto:${attr(site.email)}">${esc(site.email)}</a></li>
          <li><a href="${attr(site.social.facebook)}" rel="noopener" target="_blank">Facebook</a></li>
          <li><a href="${attr(site.social.linkedin)}" rel="noopener" target="_blank">LinkedIn</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© ${y} ${esc(site.legalName)}. Bảo lưu mọi quyền.</span>
      <span><a href="/chinh-sach-bao-mat/" style="color:inherit">Chính sách bảo mật</a> · ${esc(site.brandLine)}</span>
    </div>
  </div>
</footer>

<div class="mobile-bar" id="mobileBar">
  <a class="btn btn-ghost" href="${attr(site.phoneHref)}">Gọi ngay</a>
  <a class="btn btn-primary" href="${attr(cta.primary.href)}">Chẩn đoán miễn phí</a>
</div>

<!-- Liên hệ nhanh. Ở Việt Nam khách nhắn Zalo nhiều hơn gửi email rất nhiều. -->
<div class="quick-contact" aria-label="Liên hệ nhanh">
  <a class="qc-btn qc-zalo" href="${attr(site.zalo)}" target="_blank" rel="noopener" aria-label="Nhắn Zalo cho Aurix">
    <svg viewBox="0 0 24 24" aria-hidden="true" width="22" height="22"><path fill="currentColor" d="M12 2C6.5 2 2 5.9 2 10.7c0 2.7 1.4 5.1 3.7 6.7-.1.6-.5 2.1-.6 2.5 0 0-.1.2.1.3.1.1.3 0 .3 0 .4-.1 2.4-1.3 3.2-1.8 1 .2 2.1.4 3.3.4 5.5 0 10-3.9 10-8.7S17.5 2 12 2Z"/></svg>
    <span class="qc-label">Nhắn Zalo</span>
  </a>
  <a class="qc-btn qc-call" href="${attr(site.phoneHref)}" aria-label="Gọi ${attr(site.phone)}">
    <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20"><path fill="currentColor" d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1l-2.3 2.2Z"/></svg>
    <span class="qc-label">${esc(site.phone)}</span>
  </a>
</div>`;
}

/**
 * Dựng một trang HTML hoàn chỉnh.
 */
export function layout({
  url,                 // '/dich-vu/landing-page/'
  title,               // tiêu đề thẻ title
  description,
  body,
  schema = [],         // mảng đối tượng JSON-LD
  ogImage = site.ogImage,
  ogType = 'website',
  extraCss = [],
  extraJs = [],
  preloadImage,
  noindex = false,
  breadcrumbs = []     // [{name, url}]
}) {
  const canonical = site.origin + url;
  const fullTitle = title.includes('Aurix') ? title : `${title} | Aurix`;

  const graph = [
    {
      '@type': 'Organization',
      '@id': `${site.origin}/#organization`,
      name: site.legalName,
      alternateName: site.name,
      url: site.origin,
      slogan: site.brandLine,
      logo: { '@type': 'ImageObject', url: site.origin + site.logoFallback },
      email: site.email,
      telephone: site.phoneE164,
      foundingDate: site.founded,
      address: {
        '@type': 'PostalAddress',
        streetAddress: site.address.street,
        addressLocality: site.address.city,
        addressCountry: site.address.country
      },
      sameAs: Object.values(site.social)
    },
    // Doanh nghiệp có địa điểm thật. Khai báo riêng để đủ điều kiện lên kết quả
    // tìm kiếm địa phương và bản đồ cho truy vấn kiểu "agency marketing Hà Nội".
    {
      '@type': 'ProfessionalService',
      '@id': `${site.origin}/#localbusiness`,
      name: site.legalName,
      image: site.origin + site.ogImage,
      url: site.origin,
      telephone: site.phoneE164,
      email: site.email,
      priceRange: site.priceRange,
      currenciesAccepted: 'VND',
      address: {
        '@type': 'PostalAddress',
        streetAddress: site.address.street,
        addressLocality: site.address.city,
        addressCountry: site.address.country
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: site.geo.lat,
        longitude: site.geo.lng
      },
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:30',
        closes: '18:00'
      },
      areaServed: { '@type': 'Country', name: 'Việt Nam' },
      parentOrganization: { '@id': `${site.origin}/#organization` }
    },
    {
      '@type': 'WebSite',
      '@id': `${site.origin}/#website`,
      url: site.origin,
      name: site.name,
      inLanguage: 'vi-VN',
      publisher: { '@id': `${site.origin}/#organization` }
    },
    {
      '@type': 'WebPage',
      '@id': `${canonical}#webpage`,
      url: canonical,
      name: fullTitle,
      description,
      inLanguage: 'vi-VN',
      isPartOf: { '@id': `${site.origin}/#website` },
      about: { '@id': `${site.origin}/#organization` }
    },
    ...(breadcrumbs.length ? [{
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((b, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: b.name,
        item: site.origin + b.url
      }))
    }] : []),
    ...schema
  ];

  const jsonLd = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })
    .replace(/</g, '\\u003c');

  return `<!doctype html>
<html lang="${site.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${attr(description)}">
<link rel="canonical" href="${attr(canonical)}">
${noindex ? '<meta name="robots" content="noindex, nofollow">' : '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">'}
<meta name="theme-color" content="${site.themeColor}">
<meta name="author" content="${attr(site.legalName)}">

<meta property="og:type" content="${ogType}">
<meta property="og:site_name" content="${attr(site.name)}">
<meta property="og:locale" content="${site.locale}">
<meta property="og:title" content="${attr(fullTitle)}">
<meta property="og:description" content="${attr(description)}">
<meta property="og:url" content="${attr(canonical)}">
<meta property="og:image" content="${attr(site.origin + ogImage)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${attr(fullTitle)}">
<meta name="twitter:description" content="${attr(description)}">
<meta name="twitter:image" content="${attr(site.origin + ogImage)}">

<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/Logo.png">
<link rel="manifest" href="/site.webmanifest">

${preloadImage ? preloadFor(preloadImage) : ''}

<style>${CRITICAL}</style>

<!-- Phông cho chữ trong màn hình đầu: thân bài 400 và tiêu đề 800.
     Cần cả hai subset vì tiếng Việt trộn ký tự latin và ký tự có dấu. -->
<link rel="preload" as="font" type="font/woff2" href="/assets/fonts/be-vietnam-pro-400-latin.woff2" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="/assets/fonts/be-vietnam-pro-400-vietnamese.woff2" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="/assets/fonts/be-vietnam-pro-800-latin.woff2" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="/assets/fonts/be-vietnam-pro-800-vietnamese.woff2" crossorigin>
<link rel="stylesheet" href="/css/fonts.css?v=${BUILD}">

<link rel="stylesheet" href="/css/aurix.css?v=${BUILD}">
<link rel="stylesheet" href="/css/sections.css?v=${BUILD}">
${map(extraCss, h => `<link rel="stylesheet" href="${attr(h)}?v=${BUILD}">`)}

<script type="application/ld+json">${jsonLd}</script>
</head>
<body>
<a class="skip-link" href="#main">Bỏ qua, tới nội dung chính</a>
<div class="progress" id="progress" aria-hidden="true"></div>
${headerHtml(url)}
<main id="main">
${body}
</main>
${footerHtml()}
<script src="/js/aurix.js?v=${BUILD}" type="module"></script>
${map(extraJs, h => `<script src="${attr(h)}?v=${BUILD}" type="module"></script>`)}
</body>
</html>`;
}
