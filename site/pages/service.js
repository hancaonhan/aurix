import { layout } from '../layouts/base.js';
import { site, cta } from '../data/site.js';
import { services } from '../data/services.js';
import { esc, attr, map, sectionHead, btn, ARROW, CHECK, faqList, picture, firstSentence } from '../lib/ui.js';
import { ctaBand } from './home.js';

/** Đường dẫn trang, dùng chung cho mọi trang con. */
export function crumbs(items) {
  return `
    <nav class="crumbs" aria-label="Đường dẫn">
      ${items.map((c, i) => i < items.length - 1
        ? `<a href="${attr(c.url)}">${esc(c.name)}</a><span aria-hidden="true">/</span>`
        : `<span aria-current="page">${esc(c.name)}</span>`).join('')}
    </nav>`;
}

/** Lưới thẻ dịch vụ + ô mời chẩn đoán, dùng ở trang chủ và trang danh sách dịch vụ. */
export function serviceGrid(list = services, { withCta = true } = {}) {
  return `
    <div class="grid g-3">
      ${map(list, (s, i) => `
      <a class="card svc-card" href="/dich-vu/${s.slug}/" data-reveal style="--delay:${i * 60}ms">
        <span class="sv-letter" aria-hidden="true">${s.layer}</span>
        <h3>${esc(s.name)}</h3>
        <p>${esc(s.tagline)}</p>
        <span class="sv-more">Xem chi tiết ${ARROW}</span>
      </a>`)}
      ${withCta ? `
      <a class="card svc-card svc-cta" href="${attr(cta.primary.href)}" data-reveal style="--delay:300ms">
        <h3>Chưa biết bắt đầu từ đâu?</h3>
        <p>Làm bài chẩn đoán 8 câu, biết ngay phần nào đang yếu nhất.</p>
        <span class="sv-more">Làm bài chẩn đoán ${ARROW}</span>
      </a>` : ''}
    </div>`;
}

/* ---------- Trang chi tiết một dịch vụ ----------
   Thứ tự: kết quả (số) → vấn đề (3 dòng) → cách làm (4 thẻ ngắn) → bàn giao
   → hỏi đáp → dịch vụ khác. Mỗi thẻ chỉ giữ câu đầu; phần giải thích dài
   nằm trong hỏi đáp cho người cần đọc kỹ. */
export function servicePage(s) {
  const others = services.filter(o => o.slug !== s.slug);
  const url = `/dich-vu/${s.slug}/`;

  const body = `
<section class="hero page-hero">
  <div class="wrap">
    ${crumbs([{ name: 'Trang chủ', url: '/' }, { name: 'Dịch vụ', url: '/dich-vu/' }, { name: s.name, url }])}
    <div class="hero-grid">
      <div>
        <p class="eyebrow">${esc(s.kicker)}</p>
        <h1 class="page-title">${esc(s.name)}</h1>
        <p class="lead">${esc(s.tagline)}</p>
        <div class="hero-actions">
          ${btn({ href: cta.primary.href, label: 'Chẩn đoán miễn phí', size: 'lg' })}
          ${btn({ href: '/lien-he/', label: 'Trao đổi trực tiếp', variant: 'ghost', size: 'lg', arrow: false })}
        </div>
      </div>
      <ul class="outcome-list" data-reveal style="--delay:100ms">
        ${map(s.outcomes, o => `<li><b>${esc(o.value)}</b><span>${esc(o.label)}</span></li>`)}
      </ul>
    </div>
  </div>
</section>

<section id="van-de">
  <div class="wrap split">
    ${sectionHead({ eyebrow: 'Vấn đề', title: esc(s.problem.title) })}
    <ol class="point-list">
      ${map(s.problem.points, (p, i) => `<li data-reveal style="--delay:${i * 80}ms">${esc(p)}</li>`)}
    </ol>
  </div>
</section>

<section id="giai-phap" class="bg-alt">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Cách Aurix làm', title: esc(s.solution.title) })}
    <div class="grid g-4">
      ${map(s.solution.pillars, (p, i) => `
      <article class="card pillar" data-reveal style="--delay:${i * 80}ms">
        <span class="flow-n">0${i + 1}</span>
        <h3>${esc(p.title)}</h3>
        <p>${esc(firstSentence(p.desc))}</p>
      </article>`)}
    </div>
  </div>
</section>

<section id="ban-giao">
  <div class="wrap split split-media">
    <div data-reveal>
      ${picture({
        src: s.image,
        alt: s.imageAlt,
        width: 1240, height: 930,
        cls: 'team-img',
        sizes: '(max-width: 980px) calc(100vw - 2 * clamp(20px, 5vw, 64px)), 48vw'
      })}
    </div>
    <div>
      ${sectionHead({ eyebrow: 'Bàn giao', title: 'Bạn nhận được gì' })}
      <ul class="check-list check-list-sm">
        ${map(s.deliverables, d => `<li>${CHECK}<span>${esc(d)}</span></li>`)}
      </ul>
    </div>
  </div>
</section>

<section class="bg-alt">
  <div class="wrap wrap-narrow">
    ${sectionHead({ eyebrow: 'Hỏi đáp', title: `Câu hỏi về ${esc(s.name)}`, center: true })}
    ${faqList(s.faq, `svc-${s.slug}`)}
  </div>
</section>

<section>
  <div class="wrap">
    <div class="head-row">
      ${sectionHead({ eyebrow: 'Dịch vụ khác', title: 'Làm cùng để hiệu quả hơn' })}
      <a class="link-arrow" href="/dich-vu/">Tất cả dịch vụ ${ARROW}</a>
    </div>
    <div class="grid g-4">
      ${map(others, (o, i) => `
      <a class="card mini-link" href="/dich-vu/${o.slug}/" data-reveal style="--delay:${i * 60}ms">
        <span class="sv-letter" aria-hidden="true">${o.layer}</span>
        <span>${esc(o.name)}</span>
      </a>`)}
    </div>
  </div>
</section>

${ctaBand({
  title: `Bạn có cần ${esc(s.name.toLowerCase())} không?`,
  lead: 'Buổi chẩn đoán trả lời câu hỏi đó bằng số liệu của chính bạn.'
})}`;

  return layout({
    url,
    title: `${s.seoTitle} | Aurix`,
    description: s.seoDesc,
    breadcrumbs: [
      { name: 'Trang chủ', url: '/' },
      { name: 'Dịch vụ', url: '/dich-vu/' },
      { name: s.name, url }
    ],
    schema: [
      {
        '@type': 'Service',
        '@id': `${site.origin}${url}#service`,
        name: s.name,
        alternateName: s.tagline,
        description: s.seoDesc,
        url: site.origin + url,
        serviceType: s.name,
        provider: { '@id': `${site.origin}/#organization` },
        areaServed: { '@type': 'Country', name: 'Việt Nam' },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: `Hạng mục bàn giao: ${s.name}`,
          itemListElement: s.deliverables.map(d => ({
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: d }
          }))
        }
      },
      {
        '@type': 'FAQPage',
        '@id': `${site.origin}${url}#faq`,
        mainEntity: s.faq.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a }
        }))
      }
    ],
    body
  });
}

/* ---------- Trang danh sách dịch vụ ---------- */
export function servicesIndexPage() {
  const body = `
<section class="hero page-hero">
  <div class="wrap">
    ${crumbs([{ name: 'Trang chủ', url: '/' }, { name: 'Dịch vụ', url: '/dich-vu/' }])}
    <div class="page-intro">
      <p class="eyebrow">Dịch vụ</p>
      <h1 class="page-title">Dịch vụ marketing của Aurix</h1>
      <p class="lead">Năm dịch vụ, thuê riêng hoặc kết hợp. Thường nên bắt đầu từ phần đang yếu nhất.</p>
    </div>
  </div>
</section>

<section style="padding-top:0">
  <div class="wrap">
    <h2 class="sr-only">Năm dịch vụ theo khung A.U.R.I.X</h2>
    ${serviceGrid()}
    <p style="margin-top:32px" data-reveal>
      <a class="link-arrow" href="/phuong-phap/">Vì sao năm dịch vụ xếp theo thứ tự này ${ARROW}</a>
    </p>
  </div>
</section>

${ctaBand()}`;

  return layout({
    url: '/dich-vu/',
    title: 'Dịch vụ marketing cho doanh nghiệp dịch vụ | Aurix',
    description: 'Năm dịch vụ của Aurix: web cá nhân hoá, xây hệ thống marketing, phủ sóng đa kênh, landing page chuyển đổi cao và tối ưu siêu chuyển đổi.',
    breadcrumbs: [{ name: 'Trang chủ', url: '/' }, { name: 'Dịch vụ', url: '/dich-vu/' }],
    schema: [{
      '@type': 'ItemList',
      itemListElement: services.map((s, i) => ({
        '@type': 'ListItem', position: i + 1, name: s.name, url: `${site.origin}/dich-vu/${s.slug}/`
      }))
    }],
    body
  });
}
