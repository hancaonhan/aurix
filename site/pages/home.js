import { layout } from '../layouts/base.js';
import { site, cta } from '../data/site.js';
import { services } from '../data/services.js';
import { industries, projects, process, differentiators, testimonials, faq, stats } from '../data/content.js';
import { esc, attr, map, sectionHead, btn, ARROW, CHECK, faqList, picture } from '../lib/ui.js';
import { articles } from '../data/articles.js';
import { calcSection } from './calc.js';

/*
 * Trang chủ. Nguyên tắc bố cục: mỗi mục chỉ có MỘT ý chính và một chỗ để mắt
 * dừng lại (con số, ảnh, hoặc nút). Chữ dài để dành cho trang con; ở đây mỗi
 * mục tối đa một câu dẫn.
 */

/* ---------- Hero ---------- */
function hero() {
  return `
<section class="hero" id="hero">
  <div class="wrap hero-grid">
    <div>
      <p class="ctx-badge" id="ctxBadge" data-default="Agency marketing cho doanh nghiệp dịch vụ">
        <span class="pulse" aria-hidden="true"></span>
        <span id="ctxLabel">Agency marketing cho doanh nghiệp dịch vụ</span>
      </p>

      <h1 id="heroLine" data-default="Marketing ra khách hàng, &lt;mark&gt;đo bằng doanh thu&lt;/mark&gt;.">Marketing ra khách hàng, <mark>đo bằng doanh thu</mark>.</h1>

      <p class="lead" id="heroSub" data-default="Website, quảng cáo và quy trình chăm sóc khách cho spa, nha khoa, giáo dục và fitness.">Website, quảng cáo và quy trình chăm sóc khách cho spa, nha khoa, giáo dục và fitness.</p>

      <div class="hero-actions">
        ${btn({ href: cta.primary.href, label: 'Chẩn đoán miễn phí', size: 'lg' })}
        ${btn({ href: '/du-an/', label: 'Xem dự án', variant: 'ghost', size: 'lg', arrow: false })}
      </div>

      <!-- Con số tổng quan nằm ở dải ngay dưới hero, không lặp lại ở đây -->
    </div>

    <div class="hero-figure" data-reveal style="--delay:120ms">
      ${picture({
        src: '/assets/models/11.png',
        alt: 'Chuyên gia tư vấn của Aurix tại văn phòng',
        width: 1019, height: 1536,
        loading: 'eager', fetchpriority: 'high'
      })}
      <div class="float-stat fs-1" id="floatStat1">
        <div class="v" id="floatVal1">+250%</div>
        <div class="l" id="floatLbl1">Tăng trưởng doanh thu</div>
      </div>
    </div>
  </div>
</section>

<section class="industry-bar" aria-labelledby="ibLabel">
  <div class="wrap">
    <div class="inner">
      <span class="label" id="ibLabel">Ngành của bạn:</span>
      <button class="chip" type="button" data-industry="" aria-pressed="true">Tất cả</button>
      ${map(industries, i => `<button class="chip" type="button" data-industry="${attr(i.key)}" aria-pressed="false">${esc(i.label)}</button>`)}
    </div>
  </div>
</section>`;
}

/* ---------- Con số: bằng chứng đặt ngay dưới hero ---------- */
function statsSection() {
  return `
<section class="band-stats">
  <div class="wrap">
    <div class="stat-row" data-reveal>
      ${map(stats, s => `
      <div class="stat">
        <div class="v" data-count="${s.value}" data-suffix="${attr(s.suffix)}"${s.decimals ? ` data-decimals="${s.decimals}"` : ''}>0${esc(s.suffix)}</div>
        <div class="l">${esc(s.label)}</div>
      </div>`)}
    </div>
  </div>
</section>`;
}

/* ---------- Vấn đề: ba con số, không đoạn văn ---------- */
function problem() {
  const leaks = [
    { n: '68%', t: 'khách rời trang trong 15 giây đầu' },
    { n: '41%', t: 'khách tiềm năng không được gọi lại' },
    { n: '73%', t: 'ngân sách không đo được hiệu quả' }
  ];
  return `
<section id="van-de">
  <div class="wrap split">
    ${sectionHead({
      eyebrow: 'Vấn đề',
      title: 'Khách không mất ở quảng cáo. Khách mất ở <span class="gold-text">những bước sau đó</span>.',
    })}
    <ul class="leak-list">
      ${map(leaks, (l, i) => `
      <li data-reveal style="--delay:${i * 80}ms"><b>${esc(l.n)}</b><span>${esc(l.t)}</span></li>`)}
    </ul>
  </div>
</section>`;
}

/* ---------- Dịch vụ: năm thẻ + một thẻ mời chẩn đoán ---------- */
function servicesSection() {
  return `
<section id="dich-vu">
  <div class="wrap">
    <div class="head-row">
      ${sectionHead({ eyebrow: 'Dịch vụ', title: 'Năm việc Aurix làm cho bạn' })}
      <a class="link-arrow" href="/phuong-phap/">Phương pháp A.U.R.I.X ${ARROW}</a>
    </div>
    <div class="grid g-3">
      ${map(services, (s, i) => `
      <a class="card svc-card" href="/dich-vu/${s.slug}/" data-reveal style="--delay:${i * 60}ms">
        <span class="sv-letter" aria-hidden="true">${s.layer}</span>
        <h3>${esc(s.name)}</h3>
        <p>${esc(s.tagline)}</p>
        <span class="sv-more">Xem chi tiết ${ARROW}</span>
      </a>`)}
      <a class="card svc-card svc-cta" href="${attr(cta.primary.href)}" data-reveal style="--delay:300ms">
        <h3>Chưa biết bắt đầu từ đâu?</h3>
        <p>Làm bài chẩn đoán 8 câu, biết ngay phần nào đang yếu nhất.</p>
        <span class="sv-more">Làm bài chẩn đoán ${ARROW}</span>
      </a>
    </div>
  </div>
</section>`;
}

/* ---------- Dự án ---------- */
function projectsSection() {
  const featured = projects.slice(0, 3);
  return `
<section id="du-an">
  <div class="wrap">
    <div class="head-row">
      ${sectionHead({ eyebrow: 'Dự án', title: 'Kết quả sau khi vận hành' })}
      <a class="link-arrow" href="/du-an/">Tất cả dự án ${ARROW}</a>
    </div>
    <div class="grid g-3" id="projGrid">
      ${map(featured, (p, i) => projectCard(p, i))}
    </div>
  </div>
</section>`;
}

export function projectCard(p, i = 0) {
  const [main, ...rest] = p.results;
  return `
  <a class="proj" href="/du-an/${p.slug}/" data-reveal style="--delay:${i * 80}ms" data-industry-key="${attr(p.industryKey)}">
    <div class="proj-media">
      <span class="proj-tag">${esc(p.industry)}</span>
      ${picture({ src: p.image, fallback: p.imageFallback, alt: `Dự án ${p.client} do Aurix thực hiện`, width: 1240, height: 930 })}
    </div>
    <div class="proj-body">
      <p class="proj-client">${esc(p.client)}</p>
      <h3>${esc(p.title)}</h3>
      ${main ? `<p class="proj-main"><b>${esc(main.value)}</b><span>${esc(main.label)}</span></p>` : ''}
      <div class="proj-results">
        ${map(rest.slice(0, 2), r => `<div><div class="v">${esc(r.value)}</div><div class="l">${esc(r.label)}</div></div>`)}
      </div>
    </div>
  </a>`;
}

/* ---------- Quy trình: bốn cột, mỗi cột một dòng ---------- */
function processSection() {
  return `
<section id="quy-trinh" class="bg-alt">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Quy trình', title: 'Bốn bước, có đầu ra rõ ràng', center: true })}
    <ol class="flow">
      ${map(process, (p, i) => `
      <li data-reveal style="--delay:${i * 80}ms">
        <span class="flow-n">${esc(p.step)}</span>
        <h3>${esc(p.name)}</h3>
        <p class="flow-time">${esc(p.duration)}</p>
        <p>${esc(p.output)}</p>
      </li>`)}
    </ol>
  </div>
</section>`;
}

/* ---------- Vì sao chọn Aurix: ảnh + bốn dòng ---------- */
function differenceSection() {
  return `
<section id="khac-biet">
  <div class="wrap split split-media">
    <div data-reveal>
      ${picture({
        src: '/assets/aurix-team.webp',
        fallback: '/assets/aurix-team.png',
        alt: 'Đội ngũ Aurix tại văn phòng',
        width: 1536, height: 1024,
        cls: 'team-img'
      })}
    </div>
    <div>
      ${sectionHead({ eyebrow: 'Vì sao chọn Aurix', title: 'Làm ít dự án, làm tới nơi' })}
      <ul class="check-list">
        ${map(differentiators, d => `<li>${CHECK}<span>${esc(d.title)}</span></li>`)}
      </ul>
      <p style="margin-top:28px">${btn({ href: '/ve-aurix/', label: 'Về Aurix', variant: 'ghost' })}</p>
    </div>
  </div>
</section>`;
}

/* ---------- Một lời chứng thực, đặt lớn ---------- */
function testimonialSection() {
  const t = testimonials[0];
  if (!t) return '';
  return `
<section id="khach-hang" class="bg-alt">
  <div class="wrap wrap-narrow">
    <figure class="big-quote" data-reveal>
      <blockquote>“${esc(t.quote)}”</blockquote>
      <figcaption>
        ${picture({ src: t.image, alt: `${t.name}, ${t.role} tại ${t.company}`, width: 64, height: 64, cls: 'avt' })}
        <span><cite>${esc(t.name)}</cite><span class="role">${esc(t.role)}, ${esc(t.company)}</span></span>
      </figcaption>
    </figure>
  </div>
</section>`;
}

/* ---------- Kiến thức: ba tiêu đề, không trích đoạn ---------- */
function knowledgeSection() {
  const latest = articles.slice(0, 3);
  return `
<section>
  <div class="wrap">
    <div class="head-row">
      ${sectionHead({ eyebrow: 'Kiến thức', title: 'Bài viết mới' })}
      <a class="link-arrow" href="/kien-thuc/">Cả ${articles.length} bài ${ARROW}</a>
    </div>
    <div class="grid g-3">
      ${map(latest, (a, i) => `
      <a class="card art-mini" href="/kien-thuc/${a.slug}/" data-reveal style="--delay:${i * 70}ms">
        <span class="art-mini-topic">${esc(a.topic)}</span>
        <h3>${esc(a.title)}</h3>
        <span class="art-mini-foot">${a.readMinutes} phút đọc</span>
      </a>`)}
    </div>
  </div>
</section>`;
}

function faqSection() {
  return `
<section id="cau-hoi" class="bg-alt">
  <div class="wrap wrap-narrow">
    ${sectionHead({ eyebrow: 'Hỏi đáp', title: 'Câu hỏi thường gặp', center: true })}
    ${faqList(faq, 'home-faq')}
  </div>
</section>`;
}

/* ---------- Kêu gọi hành động (dùng chung cho mọi trang) ---------- */
export function ctaBand({
  title = 'Đặt lịch chẩn đoán miễn phí',
  lead = '45 phút làm việc trên số liệu thật của bạn. Không tính phí, không ràng buộc.'
} = {}) {
  return `
<section>
  <div class="wrap">
    <div class="cta-band" data-reveal>
      <h2>${title}</h2>
      <p class="lead">${lead}</p>
      <div class="hero-actions">
        ${btn({ href: cta.primary.href, label: cta.primary.label, size: 'lg' })}
        ${btn({ href: cta.secondary.href, label: cta.secondary.label, variant: 'ghost', size: 'lg', arrow: false })}
      </div>
      <!-- Chỉ hiện khi đội ngũ bật "Hiện số suất nhận dự án còn lại" trong cấu hình site -->
      <p class="capacity" data-capacity hidden></p>
    </div>
  </div>
</section>`;
}

/* ---------- Trang ---------- */
export default function homePage() {
  const schema = [
    {
      '@type': 'FAQPage',
      '@id': `${site.origin}/#faq`,
      mainEntity: faq.map(f => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a }
      }))
    },
    {
      '@type': 'ItemList',
      name: 'Dịch vụ của Aurix',
      itemListElement: services.map((s, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Service',
          name: s.name,
          description: s.seoDesc,
          url: `${site.origin}/dich-vu/${s.slug}/`,
          provider: { '@id': `${site.origin}/#organization` },
          areaServed: { '@type': 'Country', name: 'Việt Nam' }
        }
      }))
    }
  ];

  return layout({
    url: '/',
    title: 'Aurix – Agency marketing cho doanh nghiệp dịch vụ tại Việt Nam',
    description: 'Aurix làm marketing cho spa, nha khoa, giáo dục, fitness: thiết kế website, landing page, quảng cáo và hệ thống marketing đo được tới doanh thu.',
    preloadImage: '/assets/models/11.png',
    extraJs: ['/js/calc.js'],
    schema,
    body: [
      hero(),
      statsSection(),
      problem(),
      calcSection({ bg: 'bg-alt' }),
      servicesSection(),
      projectsSection(),
      processSection(),
      differenceSection(),
      testimonialSection(),
      knowledgeSection(),
      faqSection(),
      ctaBand()
    ].join('\n')
  });
}
