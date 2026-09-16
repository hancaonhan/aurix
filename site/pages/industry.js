import { layout } from '../layouts/base.js';
import { site, cta } from '../data/site.js';
import { industries, projects } from '../data/content.js';
import { framework } from '../data/framework.js';
import { services } from '../data/services.js';
import { esc, attr, map, sectionHead, btn, ARROW, CHECK, picture } from '../lib/ui.js';
import { ctaBand, projectCard } from './home.js';

/* ---------- Trang một ngành ---------- */
export function industryPage(ind) {
  const url = `/nganh/${ind.slug}/`;
  const cases = projects.filter(p => p.industryKey === ind.key);
  const others = industries.filter(o => o.key !== ind.key);

  const body = `
<section class="hero" style="padding-block:clamp(120px,15vh,166px) clamp(40px,5vw,62px)">
  <div class="hero-aurora" aria-hidden="true"></div>
  <div class="wrap">
    <nav aria-label="Đường dẫn" style="margin-bottom:26px;font-size:13.5px;color:var(--fg-mute)">
      <a href="/" style="color:inherit">Trang chủ</a><span aria-hidden="true"> / </span>
      <a href="/nganh/" style="color:inherit">Ngành</a><span aria-hidden="true"> / </span>
      <span style="color:var(--gold-300)">${esc(ind.label)}</span>
    </nav>

    <div class="hero-grid" style="grid-template-columns:1.05fr 0.95fr">
      <div>
        <p class="eyebrow"><span class="spark" aria-hidden="true"></span>${esc(ind.label)}</p>
        <h1 style="font-size:clamp(32px,5vw,56px)">${esc(ind.heroLine)}</h1>
        <p class="lead" style="margin-top:22px">${esc(ind.heroSub)}</p>
        <div class="hero-actions">
          ${btn({ href: cta.primary.href, label: 'Chẩn đoán cho ngành này', size: 'lg' })}
          ${btn({ href: '/lien-he/', label: 'Trao đổi trực tiếp', variant: 'ghost', size: 'lg', arrow: false })}
        </div>
      </div>
      <div data-reveal style="--delay:100ms">
        <div class="card" style="padding:clamp(26px,3.4vw,38px)">
          <p class="eyebrow" style="margin-bottom:16px"><span class="spark" aria-hidden="true"></span>Nỗi đau điển hình</p>
          <p style="font-size:clamp(17px,2vw,20px);color:var(--fg);margin:0 0 24px">“${esc(ind.pain)}”</p>
          <div style="padding-top:20px;border-top:1px solid var(--line-soft);display:flex;align-items:baseline;gap:14px">
            <span class="serif gold-text" style="font-size:32px;line-height:1">${esc(ind.proof.value)}</span>
            <span class="muted" style="font-size:13.5px">${esc(ind.proof.label)}<br><span style="font-size:12px">${esc(ind.proof.client)}</span></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section id="thach-thuc" style="padding-top:clamp(36px,5vw,58px)">
  <div class="wrap">
    ${sectionHead({
      eyebrow: 'Vì sao ngành này khó',
      title: esc(ind.challengeTitle),
      lead: esc(ind.challengeLead)
    })}
    <div class="grid g-3">
      ${map(ind.challenges, (c, i) => `
      <article class="card" data-reveal style="--delay:${i * 80}ms">
        <div class="serif gold-text" style="font-size:15px;letter-spacing:.14em;margin-bottom:12px">0${i + 1}</div>
        <h3 style="font-size:19px">${esc(c.t)}</h3>
        <p>${esc(c.d)}</p>
      </article>`)}
    </div>
  </div>
</section>

<section id="cach-lam">
  <div class="wrap">
    ${sectionHead({
      eyebrow: 'Aurix làm gì cho ngành này',
      title: `Năm tầng, áp dụng cho ${esc(ind.label)}`,
      lead: 'Khung A.U.R.I.X giữ nguyên. Chỉ cách áp dụng vào từng tầng là khác nhau theo ngành.'
    })}
    <div class="layers" data-reveal>
      ${map(framework.layers, l => {
        const note = ind.byLayer[l.letter];
        return `
      <article class="layer">
        <div>
          <div class="layer-letter" aria-hidden="true">${l.letter}</div>
          <div class="layer-vi">${esc(l.title)} · ${esc(l.vi)}</div>
        </div>
        <div>
          <h3>${esc(note)}</h3>
          <p style="margin-top:8px"><a class="link-arrow" href="${attr(l.service)}" style="font-size:14px">${esc(services.find(s => l.service.includes(s.slug))?.name || 'Xem dịch vụ')} ${ARROW}</a></p>
        </div>
        <div class="layer-metric">
          <div class="d">${esc(l.metricDelta)}</div>
          <div class="m">${esc(l.metric)}</div>
        </div>
      </article>`;
      })}
    </div>
  </div>
</section>

${cases.length ? `
<section id="du-an">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Dự án trong ngành', title: 'Chúng tôi đã làm việc này rồi', center: true })}
    <div class="grid g-3">${map(cases, (p, i) => projectCard(p, i))}</div>
  </div>
</section>` : ''}

<section>
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Ngành khác', title: 'Aurix cũng làm cho', center: true })}
    <div class="grid g-3">
      ${map(others, (o, i) => `
      <a class="card" href="/nganh/${o.slug}/" data-reveal style="--delay:${i * 60}ms">
        <h3 style="font-size:18px;margin-bottom:8px">${esc(o.label)}</h3>
        <p style="font-size:14.5px;margin:0">${esc(o.pain)}</p>
      </a>`)}
    </div>
  </div>
</section>

${ctaBand({
  title: `Hệ thống ${esc(ind.label.toLowerCase())} của bạn đang rò rỉ ở đâu?`,
  lead: 'Bài chẩn đoán đối chiếu câu trả lời của bạn với chuẩn của chính ngành này, và quy điểm rò rỉ ra số tiền mỗi tháng.'
})}`;

  return layout({
    url,
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
<section class="hero" style="padding-block:clamp(120px,15vh,166px) clamp(36px,5vw,56px)">
  <div class="hero-aurora" aria-hidden="true"></div>
  <div class="wrap wrap-narrow" style="text-align:center">
    <p class="eyebrow" style="justify-content:center"><span class="spark" aria-hidden="true"></span>Ngành chuyên sâu</p>
    <h1 style="font-size:clamp(34px,5.4vw,58px)">Chúng tôi đi sâu, không đi rộng</h1>
    <p class="lead" style="margin:24px auto 0">Aurix tập trung vào những ngành dịch vụ có giá trị hợp đồng cao và chu kỳ ra quyết định dài — nơi một hệ thống tốt tạo ra khác biệt lớn nhất, và nơi chúng tôi đã đủ số lần lặp để biết chỗ nào thường rò rỉ.</p>
  </div>
</section>

<section style="padding-top:0">
  <div class="wrap">
    <h2 class="sr-only">Các ngành Aurix phục vụ</h2>
    <div class="grid g-2">
      ${map(industries, (i, n) => `
      <a class="card" href="/nganh/${i.slug}/" data-reveal style="--delay:${n * 70}ms;display:grid;gap:16px">
        <div>
          <h3 style="font-size:22px;margin-bottom:10px">${esc(i.label)}</h3>
          <p style="font-size:15.5px;margin:0 0 12px">${esc(i.heroLine)}</p>
          <p class="muted" style="font-size:14.5px;margin:0">“${esc(i.pain)}”</p>
        </div>
        <div style="padding-top:18px;border-top:1px solid var(--line-soft);display:flex;align-items:center;justify-content:space-between;gap:16px">
          <span style="display:flex;align-items:baseline;gap:10px">
            <span class="serif gold-text" style="font-size:24px;line-height:1">${esc(i.proof.value)}</span>
            <span class="muted" style="font-size:12.5px">${esc(i.proof.label)}</span>
          </span>
          <span class="link-arrow" style="font-size:14px">Xem chi tiết ${ARROW}</span>
        </div>
      </a>`)}
    </div>
  </div>
</section>

${ctaBand()}`;

  return layout({
    url: '/nganh/',
    title: 'Ngành Aurix phục vụ — Spa, Nha khoa, Giáo dục, Fitness, Du lịch',
    description: 'Aurix xây hệ thống marketing chuyên sâu cho spa, nha khoa, giáo dục, fitness, du lịch và bất động sản — những ngành dịch vụ có giá trị hợp đồng cao.',
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
