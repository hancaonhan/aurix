import { layout } from '../layouts/base.js';
import { site, cta } from '../data/site.js';
import { industries, projects } from '../data/content.js';
import { framework } from '../data/framework.js';
import { services } from '../data/services.js';
import { esc, attr, map, sectionHead, btn, ARROW, firstSentence } from '../lib/ui.js';
import { crumbs } from './service.js';
import { ctaBand, projectCard } from './home.js';
import { calcSection } from './calc.js';

/* ---------- Trang một ngành ---------- */
export function industryPage(ind) {
  const url = `/nganh/${ind.slug}/`;
  const cases = projects.filter(p => p.industryKey === ind.key);
  const others = industries.filter(o => o.key !== ind.key);

  const body = `
<section class="hero page-hero">
  <div class="wrap">
    ${crumbs([{ name: 'Trang chủ', url: '/' }, { name: 'Ngành', url: '/nganh/' }, { name: ind.label, url }])}
    <div class="hero-grid">
      <div>
        <p class="eyebrow">${esc(ind.label)}</p>
        <h1 class="page-title">${esc(ind.heroLine)}</h1>
        <p class="lead">${esc(ind.heroSub)}</p>
        <div class="hero-actions">
          ${btn({ href: cta.primary.href, label: 'Chẩn đoán miễn phí', size: 'lg' })}
          ${btn({ href: '/lien-he/', label: 'Trao đổi trực tiếp', variant: 'ghost', size: 'lg', arrow: false })}
        </div>
      </div>
      <div class="card proof-card" data-reveal style="--delay:100ms">
        <p class="proof-pain">“${esc(ind.pain)}”</p>
        <p class="proof-num"><b>${esc(ind.proof.value)}</b><span>${esc(ind.proof.label)}<br><small>${esc(ind.proof.client)}</small></span></p>
      </div>
    </div>
  </div>
</section>

<section id="thach-thuc">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Thách thức', title: esc(ind.challengeTitle) })}
    <div class="grid g-3">
      ${map(ind.challenges, (c, i) => `
      <article class="card pillar" data-reveal style="--delay:${i * 80}ms">
        <span class="flow-n">0${i + 1}</span>
        <h3>${esc(c.t)}</h3>
        <p>${esc(firstSentence(c.d))}</p>
      </article>`)}
    </div>
  </div>
</section>

${calcSection({ industry: ind.key, industryLabel: ind.label, bg: 'bg-alt' })}

<section id="cach-lam">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Aurix làm gì', title: `Năm việc cho ngành ${esc(ind.label.toLowerCase())}` })}
    <ul class="fit-list">
      ${map(framework.layers, (l, i) => {
        const svc = services.find(s => l.service.includes(s.slug));
        return `
      <li data-reveal style="--delay:${i * 60}ms">
        <span class="sv-letter" aria-hidden="true">${l.letter}</span>
        <p>${esc(ind.byLayer[l.letter])}</p>
        <a class="link-arrow" href="${attr(l.service)}">${esc(svc?.name || 'Xem dịch vụ')} ${ARROW}</a>
      </li>`;
      })}
    </ul>
  </div>
</section>

${cases.length ? `
<section id="du-an" class="bg-alt">
  <div class="wrap">
    <div class="head-row">
      ${sectionHead({ eyebrow: 'Dự án', title: 'Dự án cùng ngành' })}
      <a class="link-arrow" href="/du-an/">Tất cả dự án ${ARROW}</a>
    </div>
    <div class="grid g-3">${map(cases, (p, i) => projectCard(p, i))}</div>
  </div>
</section>` : ''}

<section>
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Ngành khác', title: 'Aurix cũng làm cho' })}
    <div class="grid g-3">
      ${map(others, (o, i) => `
      <a class="card mini-link" href="/nganh/${o.slug}/" data-reveal style="--delay:${i * 60}ms">
        <span>${esc(o.label)}</span>${ARROW}
      </a>`)}
    </div>
  </div>
</section>

${ctaBand({
  title: `Doanh nghiệp ${esc(ind.label.toLowerCase())} của bạn đang mất khách ở đâu?`,
  lead: 'Bài chẩn đoán 8 câu, so với chuẩn của chính ngành này.'
})}`;

  return layout({
    url,
    extraJs: ['/js/calc.js'],
    title: `${ind.seoTitle} | Aurix`,
    description: ind.seoDesc,
    breadcrumbs: [
      { name: 'Trang chủ', url: '/' },
      { name: 'Ngành', url: '/nganh/' },
      { name: ind.label, url }
    ],
    schema: [{
      '@type': 'Service',
      '@id': `${site.origin}${url}#service`,
      name: `Marketing cho ${ind.label}`,
      description: ind.seoDesc,
      url: site.origin + url,
      provider: { '@id': `${site.origin}/#organization` },
      areaServed: { '@type': 'Country', name: 'Việt Nam' },
      audience: { '@type': 'BusinessAudience', name: ind.label }
    }],
    body
  });
}

/* ---------- Trang danh sách ngành ---------- */
export function industriesIndexPage() {
  const body = `
<section class="hero page-hero">
  <div class="wrap">
    ${crumbs([{ name: 'Trang chủ', url: '/' }, { name: 'Ngành', url: '/nganh/' }])}
    <div class="page-intro">
      <p class="eyebrow">Ngành</p>
      <h1 class="page-title">Các ngành Aurix phục vụ</h1>
      <p class="lead">Sáu ngành dịch vụ có giá trị hợp đồng cao, nơi chúng tôi đã làm đủ nhiều để biết khách thường rơi ở đâu.</p>
    </div>
  </div>
</section>

<section style="padding-top:0">
  <div class="wrap">
    <h2 class="sr-only">Các ngành Aurix phục vụ</h2>
    <div class="grid g-3">
      ${map(industries, (i, n) => `
      <a class="card ind-card" href="/nganh/${i.slug}/" data-reveal style="--delay:${n * 70}ms">
        <h3>${esc(i.label)}</h3>
        <p class="proof-num"><b>${esc(i.proof.value)}</b><span>${esc(i.proof.label)}</span></p>
        <span class="sv-more">Xem chi tiết ${ARROW}</span>
      </a>`)}
    </div>
  </div>
</section>

${ctaBand()}`;

  return layout({
    url: '/nganh/',
    title: 'Ngành Aurix phục vụ: Spa, Nha khoa, Giáo dục, Fitness, Du lịch',
    description: 'Aurix xây hệ thống marketing chuyên sâu cho spa, nha khoa, giáo dục, fitness, du lịch và bất động sản, những ngành dịch vụ có giá trị hợp đồng cao.',
    breadcrumbs: [{ name: 'Trang chủ', url: '/' }, { name: 'Ngành', url: '/nganh/' }],
    schema: [{
      '@type': 'ItemList',
      itemListElement: industries.map((i, n) => ({
        '@type': 'ListItem', position: n + 1, name: i.label, url: `${site.origin}/nganh/${i.slug}/`
      }))
    }],
    body
  });
}
