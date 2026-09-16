import { layout } from '../layouts/base.js';
import { site, cta } from '../data/site.js';
import { services } from '../data/services.js';
import { framework } from '../data/framework.js';
import { esc, attr, map, sectionHead, btn, ARROW, CHECK, faqList, picture } from '../lib/ui.js';
import { ctaBand } from './home.js';

/* ---------- Trang chi tiết một dịch vụ ---------- */
export function servicePage(s) {
  const others = services.filter(o => o.slug !== s.slug);
  const url = `/dich-vu/${s.slug}/`;

  const body = `
<section class="hero" style="padding-block:clamp(120px,15vh,166px) clamp(46px,6vw,70px)">
  <div class="hero-aurora" aria-hidden="true"></div>
  <div class="wrap">
    <nav aria-label="Đường dẫn" style="margin-bottom:26px;font-size:13.5px;color:var(--fg-mute)">
      <a href="/" style="color:inherit">Trang chủ</a>
      <span aria-hidden="true"> / </span>
      <a href="/dich-vu/" style="color:inherit">Dịch vụ</a>
      <span aria-hidden="true"> / </span>
      <span style="color:var(--gold-300)">${esc(s.name)}</span>
    </nav>

    <div class="hero-grid" style="grid-template-columns:1.05fr 0.95fr">
      <div>
        <p class="eyebrow"><span class="spark" aria-hidden="true"></span>${esc(s.kicker)}</p>
        <h1 style="font-size:clamp(34px,5.4vw,62px)">${esc(s.name)}</h1>
        <p class="lead" style="margin-top:22px;font-size:clamp(18px,2.1vw,23px);color:var(--fg)">${esc(s.tagline)}</p>
        <div class="hero-actions">
          ${btn({ href: cta.primary.href, label: 'Nhận chẩn đoán cho dịch vụ này', size: 'lg' })}
          ${btn({ href: '/lien-he/', label: 'Trao đổi trực tiếp', variant: 'ghost', size: 'lg', arrow: false })}
        </div>
      </div>
      <div data-reveal style="--delay:100ms">
        <div class="stat-row" style="grid-template-columns:1fr">
          ${map(s.outcomes, o => `
          <div class="stat" style="text-align:left;padding:22px 26px">
            <div class="v" style="font-size:clamp(28px,3.4vw,38px)">${esc(o.value)}</div>
            <div class="l" style="margin-top:6px">${esc(o.label)}</div>
          </div>`)}
        </div>
      </div>
    </div>
  </div>
</section>

<section id="van-de" style="padding-top:clamp(40px,5vw,64px)">
  <div class="wrap">
    <div class="grid g-2" style="gap:clamp(32px,5vw,68px);align-items:start">
      <div>
        ${sectionHead({ eyebrow: 'Vấn đề', title: esc(s.problem.title) })}
      </div>
      <div class="grid" style="gap:16px">
        ${map(s.problem.points, (p, i) => `
        <div class="card" data-reveal style="--delay:${i * 80}ms;padding:22px 24px">
          <p style="margin:0;font-size:16px">${esc(p)}</p>
        </div>`)}
      </div>
    </div>
  </div>
</section>

<section id="giai-phap">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Cách Aurix xử lý', title: esc(s.solution.title), lead: esc(s.solution.desc) })}
    <div class="grid g-2">
      ${map(s.solution.pillars, (p, i) => `
      <article class="card" data-reveal style="--delay:${i * 80}ms">
        <div class="serif gold-text" style="font-size:15px;letter-spacing:.14em;margin-bottom:12px">0${i + 1}</div>
        <h3 style="font-size:20px">${esc(p.title)}</h3>
        <p>${esc(p.desc)}</p>
      </article>`)}
    </div>
  </div>
</section>

<section id="ban-giao">
  <div class="wrap">
    <div class="grid g-2" style="gap:clamp(32px,5vw,68px);align-items:start">
      <div data-reveal>
        ${picture({
          src: s.image,
          alt: s.imageAlt,
          width: 1240, height: 930,
          cls: 'svc-shot',
          // Một trong hai cột của lưới g-2, không phải ô nhỏ trong lưới 3 cột
          sizes: '(max-width: 620px) calc(100vw - 2 * clamp(20px, 5vw, 64px)), 48vw'
        })}
        <style>.svc-shot{border-radius:20px;border:1px solid var(--line);box-shadow:var(--shadow)}</style>
      </div>
      <div>
        ${sectionHead({ eyebrow: 'Bạn nhận được gì', title: 'Danh sách bàn giao cụ thể' })}
        <ul style="list-style:none;padding:0;margin:0;display:grid;gap:14px">
          ${map(s.deliverables, (d, i) => `
          <li data-reveal style="--delay:${i * 50}ms;display:grid;grid-template-columns:20px 1fr;gap:13px;align-items:start">
            <span style="padding-top:5px">${CHECK}</span>
            <span style="font-size:15.5px;color:var(--fg-soft)">${esc(d)}</span>
          </li>`)}
        </ul>
      </div>
    </div>
  </div>
</section>

<section>
  <div class="wrap wrap-narrow">
    ${sectionHead({ eyebrow: 'Câu hỏi thường gặp', title: `Về ${esc(s.name)}`, center: true })}
    ${faqList(s.faq, `svc-${s.slug}`)}
  </div>
</section>

<section>
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Các tầng còn lại', title: 'Hệ thống chỉ mạnh khi đủ tầng', center: true })}
    <div class="grid g-2">
      ${map(others, (o, i) => `
      <a class="card svc-card" href="/dich-vu/${o.slug}/" data-reveal style="--delay:${i * 80}ms;min-height:auto">
        <div class="sv-letter" aria-hidden="true">${o.layer}</div>
        <h3 style="font-size:19px">${esc(o.name)}</h3>
        <p style="font-size:15px">${esc(o.tagline)}</p>
        <div class="sv-foot"><span class="link-arrow">Xem chi tiết ${ARROW}</span></div>
      </a>`)}
    </div>
  </div>
</section>

${ctaBand({
  title: `Hệ thống của bạn có cần ${esc(s.name.toLowerCase())} không?`,
  lead: 'Buổi chẩn đoán sẽ trả lời chính xác câu hỏi đó bằng dữ liệu của chính bạn, chứ không bằng một bản báo giá.'
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
          name: `Hạng mục bàn giao — ${s.name}`,
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
<section class="hero" style="padding-block:clamp(120px,15vh,166px) clamp(40px,5vw,60px)">
  <div class="hero-aurora" aria-hidden="true"></div>
  <div class="wrap wrap-narrow" style="text-align:center">
    <p class="eyebrow" style="justify-content:center"><span class="spark" aria-hidden="true"></span>Dịch vụ</p>
    <h1 style="font-size:clamp(34px,5.4vw,62px)">Năm tầng của một <em class="serif">cỗ máy tăng trưởng</em></h1>
    <p class="lead" style="margin:24px auto 0">Bạn có thể bắt đầu từ tầng đang rò rỉ nặng nhất. Nhưng đích đến luôn là một hệ thống đủ tầng, nơi mỗi tầng khuếch đại tầng còn lại.</p>
  </div>
</section>

<section style="padding-top:0">
  <div class="wrap">
    <h2 class="sr-only">Năm dịch vụ theo khung A.U.R.I.X</h2>
    <div class="grid" style="gap:20px">
      ${map(services, (s, i) => `
      <a class="card" href="/dich-vu/${s.slug}/" data-reveal style="--delay:${i * 70}ms;display:grid;grid-template-columns:78px 1fr 200px;gap:clamp(20px,3vw,40px);align-items:center">
        <div class="sv-letter" style="margin:0" aria-hidden="true">${s.layer}</div>
        <div>
          <p class="sv-kicker">${esc(s.kicker)}</p>
          <h3 style="font-size:23px;margin-bottom:8px">${esc(s.name)}</h3>
          <p style="font-size:15.5px;margin:0">${esc(s.tagline)}</p>
        </div>
        <div style="text-align:right">
          <div class="serif gold-text" style="font-size:30px;line-height:1">${esc(s.outcomes[0].value)}</div>
          <div class="muted" style="font-size:12.5px;margin-top:6px">${esc(s.outcomes[0].label)}</div>
        </div>
      </a>`)}
    </div>
    <style>@media(max-width:820px){#main .card[href^="/dich-vu/"]{grid-template-columns:60px 1fr!important}#main .card[href^="/dich-vu/"]>div:last-child{grid-column:2;text-align:left!important}}</style>
  </div>
</section>

<section>
  <div class="wrap">
    ${sectionHead({
      eyebrow: 'Phương pháp',
      title: 'Mỗi dịch vụ là một tầng trong <span class="gold-text serif">A.U.R.I.X</span>',
      center: true
    })}
    <div class="layers" data-reveal>
      ${map(framework.layers, l => `
      <article class="layer">
        <div>
          <div class="layer-letter" aria-hidden="true">${l.letter}</div>
          <div class="layer-vi">${esc(l.title)} · ${esc(l.vi)}</div>
        </div>
        <div>
          <h3>${esc(l.headline)}</h3>
          <p>${esc(l.desc)}</p>
        </div>
        <div class="layer-metric">
          <div class="d">${esc(l.metricDelta)}</div>
          <div class="m">${esc(l.metric)}</div>
        </div>
      </article>`)}
    </div>
  </div>
</section>

${ctaBand()}`;

  return layout({
    url: '/dich-vu/',
    title: 'Dịch vụ Marketing cao cấp | Aurix',
    description: 'Bốn dịch vụ lõi của Aurix: Web cá nhân hoá, Landing Page chuyển đổi cao, Xây hệ thống Marketing tổng thể và chương trình tối ưu Siêu chuyển đổi.',
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
