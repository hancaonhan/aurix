import { layout } from '../layouts/base.js';
import { site } from '../data/site.js';
import {
  articles, topics, topicCount, TOPIC_NOTE,
  relatedArticles, neighbours
} from '../data/articles.js';
import { serviceBySlug } from '../data/services.js';
import { esc, attr, map, sectionHead, btn, faqList, ARROW } from '../lib/ui.js';
import { ctaBand } from './home.js';

const fmtDate = iso => {
  const [y, m, d] = iso.split('-');
  return `${Number(d)}/${Number(m)}/${y}`;
};

const slugify = s => s
  .toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/đ/g, 'd')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

/* ---------- Dựng thân bài từ dữ liệu có cấu trúc ---------- */
function renderBlock(b, i = 0) {
  switch (b.type) {
    case 'h2':
      return `<h2>${esc(b.text)}</h2>`;
    case 'h3':
      return `<h3>${esc(b.text)}</h3>`;
    case 'p':
      return `<p>${esc(b.text)}</p>`;
    case 'list':
      return `<ul class="prose-list">${map(b.items, i => `<li>${esc(i)}</li>`)}</ul>`;
    case 'steps':
      return `<ol class="prose-steps">${map(b.items, s => `
        <li><p class="step-t">${esc(s.t)}</p><p class="step-d">${esc(s.d)}</p></li>`)}</ol>`;
    case 'formula':
      return `<p class="prose-formula">${esc(b.text)}</p>`;
    case 'note':
      return `<aside class="prose-note note-${attr(b.tone || 'tip')}">
        <p class="note-label">${b.tone === 'warn' ? 'Lưu ý' : 'Mẹo'}</p>
        <p>${esc(b.text)}</p>
      </aside>`;
    case 'quote':
      return `<blockquote class="prose-quote">
        <p>${esc(b.text)}</p>
        ${b.cite ? `<cite>${esc(b.cite)}</cite>` : ''}
      </blockquote>`;
    case 'table':
      return `<div class="prose-table-wrap"><table class="prose-table">
        <thead><tr>${map(b.head, h => `<th>${esc(h)}</th>`)}</tr></thead>
        <tbody>${map(b.rows, r => `<tr>${map(r, c => `<td>${esc(c)}</td>`)}</tr>`)}</tbody>
      </table></div>`;
    case 'faq':
      return `<div class="prose-faq">
        <h2 id="cau-hoi-thuong-gap">Câu hỏi thường gặp</h2>
        ${faqList(b.items, `art-faq-${i}`)}
      </div>`;
    case 'cta':
      return `<aside class="prose-cta">
        <p>${esc(b.text)}</p>
        ${btn({ href: '/chan-doan/', label: 'Làm bài chẩn đoán', size: 'sm' })}
      </aside>`;
    default:
      return '';
  }
}

/** Các mốc dùng cho mục lục: tiêu đề cấp hai, cộng khối câu hỏi thường gặp. */
function outline(body) {
  const heads = body
    .filter(b => b.type === 'h2')
    .map(b => ({ id: slugify(b.text), text: b.text }));
  if (body.some(b => b.type === 'faq')) {
    heads.push({ id: 'cau-hoi-thuong-gap', text: 'Câu hỏi thường gặp' });
  }
  return heads;
}

function tableOfContents(body) {
  const heads = outline(body);
  if (heads.length < 3) return '';
  return `<nav class="prose-toc" aria-label="Nội dung bài viết">
    <p class="toc-title">Trong bài này</p>
    <ol>${map(heads, h => `<li><a href="#${attr(h.id)}">${esc(h.text)}</a></li>`)}</ol>
  </nav>`;
}

/* ---------- Trang một bài viết ---------- */
export function articlePage(a) {
  const url = `/kien-thuc/${a.slug}/`;
  const others = relatedArticles(a, 3);
  const { prev, next } = neighbours(a);
  const relatedServices = (a.related || []).map(s => serviceBySlug[s]).filter(Boolean);
  const faqBlock = a.body.find(b => b.type === 'faq');

  // Gắn id vào tiêu đề cấp hai để mục lục nhảy được
  const bodyHtml = a.body.map((b, i) =>
    b.type === 'h2'
      ? `<h2 id="${attr(slugify(b.text))}">${esc(b.text)}</h2>`
      : renderBlock(b, i)
  ).join('\n');

  const body = `
<article>
<section class="hero" style="padding-block:clamp(118px,14vh,156px) clamp(28px,4vw,44px)">
  <div class="hero-aurora" aria-hidden="true"></div>
  <div class="wrap wrap-narrow">
    <nav aria-label="Đường dẫn" style="margin-bottom:24px;font-size:13.5px;color:var(--fg-mute)">
      <a href="/" style="color:inherit">Trang chủ</a><span aria-hidden="true"> / </span>
      <a href="/kien-thuc/" style="color:inherit">Kiến thức</a><span aria-hidden="true"> / </span>
      <a href="/kien-thuc/?chu-de=${encodeURIComponent(a.topic)}" style="color:var(--gold-300)">${esc(a.topic)}</a>
    </nav>
    <p class="eyebrow"><span class="spark" aria-hidden="true"></span>${esc(a.topic)}${a.level && a.level !== a.topic ? ` · ${esc(a.level)}` : ''}</p>
    <h1 style="font-size:clamp(30px,4.6vw,52px)">${esc(a.title)}</h1>
    <p class="lead" style="margin-top:20px">${esc(a.excerpt)}</p>
    <p class="article-meta">
      <time datetime="${attr(a.date)}">${fmtDate(a.date)}</time>
      <span aria-hidden="true">·</span>
      <span>${a.readMinutes} phút đọc</span>
      <span aria-hidden="true">·</span>
      <span>Tầng ${esc(a.layer)} trong khung A.U.R.I.X</span>
    </p>
  </div>
</section>

<section style="padding-top:0">
  <div class="wrap wrap-narrow">
    ${tableOfContents(a.body)}
    <div class="prose">
      ${bodyHtml}
    </div>

    ${relatedServices.length ? `
    <div class="prose-services">
      <p class="eyebrow"><span class="spark" aria-hidden="true"></span>Dịch vụ liên quan</p>
      <div class="grid g-2">
        ${map(relatedServices, s => `
        <a class="card svc-card" href="/dich-vu/${s.slug}/" style="min-height:auto">
          <div class="sv-letter" aria-hidden="true">${s.layer}</div>
          <h3 style="font-size:19px">${esc(s.name)}</h3>
          <p style="font-size:15px">${esc(s.tagline)}</p>
          <div class="sv-foot"><span class="link-arrow">Xem chi tiết ${ARROW}</span></div>
        </a>`)}
      </div>
    </div>` : ''}

    ${prev || next ? `
    <nav class="art-nav" aria-label="Bài khác cùng chủ đề">
      ${prev ? `<a class="art-nav-item" href="/kien-thuc/${prev.slug}/">
        <span class="dir">← Bài mới hơn · ${esc(a.topic)}</span>
        <span class="t">${esc(prev.title)}</span></a>` : '<span></span>'}
      ${next ? `<a class="art-nav-item next" href="/kien-thuc/${next.slug}/">
        <span class="dir">Bài cũ hơn · ${esc(a.topic)} →</span>
        <span class="t">${esc(next.title)}</span></a>` : '<span></span>'}
    </nav>` : ''}
  </div>
</section>
</article>

<section>
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Đọc tiếp', title: 'Bài viết liên quan', center: true })}
    <div class="grid g-3">${map(others, articleCard)}</div>
  </div>
</section>

${ctaBand()}`;

  const schema = [{
    '@type': 'Article',
    '@id': `${site.origin}${url}#article`,
    headline: a.title,
    description: a.seoDesc,
    url: site.origin + url,
    datePublished: a.date,
    dateModified: a.updated || a.date,
    inLanguage: 'vi-VN',
    articleSection: a.topic,
    wordCount: a.body.reduce((n, b) => n + String(b.text || (b.items || b.rows || []).join(' ')).split(/\s+/).length, 0),
    author: { '@id': `${site.origin}/#organization` },
    publisher: { '@id': `${site.origin}/#organization` },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${site.origin}${url}#webpage` }
  }];

  if (faqBlock) {
    schema.push({
      '@type': 'FAQPage',
      '@id': `${site.origin}${url}#faq`,
      mainEntity: faqBlock.items.map(f => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a }
      }))
    });
  }

  return layout({
    url,
    title: `${a.seoTitle} | Aurix`,
    description: a.seoDesc,
    ogType: 'article',
    breadcrumbs: [
      { name: 'Trang chủ', url: '/' },
      { name: 'Kiến thức', url: '/kien-thuc/' },
      { name: a.title, url }
    ],
    extraCss: ['/css/prose.css'],
    schema,
    body
  });
}

/**
 * Chuỗi cho ô tìm kiếm. Ngoài phần mô tả, gộp thêm mọi tiêu đề trong bài và
 * tên các bước, để người đọc tìm được bằng từ khoá nằm giữa bài chứ không chỉ
 * bằng tiêu đề.
 */
function searchIndex(a) {
  const inner = a.body.flatMap(b => {
    if (b.type === 'h2' || b.type === 'h3') return [b.text];
    if (b.type === 'steps') return b.items.map(s => s.t);
    if (b.type === 'faq') return b.items.map(f => f.q);
    return [];
  });
  return [a.title, a.excerpt, a.topic, a.level, a.seoTitle, a.seoDesc, ...inner]
    .filter(Boolean).join(' · ').toLowerCase();
}

/* ---------- Thẻ bài viết ---------- */
export function articleCard(a, i = 0) {
  return `
  <a class="art-card" href="/kien-thuc/${a.slug}/" data-reveal style="--delay:${i * 70}ms"
     data-topic="${attr(a.topic)}" data-search="${attr(searchIndex(a))}">
    <p class="art-topic"><span>${esc(a.topic)}</span>${a.level && a.level !== a.topic ? `<span class="art-level">${esc(a.level)}</span>` : ''}</p>
    <h3>${esc(a.title)}</h3>
    <p class="art-excerpt">${esc(a.excerpt)}</p>
    <p class="art-foot">
      <time datetime="${attr(a.date)}">${fmtDate(a.date)}</time>
      <span aria-hidden="true">·</span>
      <span>${a.readMinutes} phút đọc</span>
      <span class="art-layer" aria-hidden="true">${esc(a.layer)}</span>
    </p>
  </a>`;
}

/** Bài mở đầu, hiển thị rộng ở đầu trang danh sách. */
function featuredCard(a) {
  return `
  <a class="art-feature" href="/kien-thuc/${a.slug}/" data-reveal id="artFeature"
     data-topic="${attr(a.topic)}" data-search="${attr(searchIndex(a))}">
    <div class="af-body">
      <p class="art-topic"><span>Mới nhất</span><span class="art-level">${esc(a.topic)}</span></p>
      <h2>${esc(a.title)}</h2>
      <p class="af-excerpt">${esc(a.excerpt)}</p>
      <p class="art-foot">
        <time datetime="${attr(a.date)}">${fmtDate(a.date)}</time>
        <span aria-hidden="true">·</span>
        <span>${a.readMinutes} phút đọc</span>
      </p>
      <span class="link-arrow">Đọc bài ${ARROW}</span>
    </div>
    <div class="af-side" aria-hidden="true">
      <span class="af-letter">${esc(a.layer)}</span>
      <span class="af-letter-note">Tầng ${esc(a.layer)}<br>A.U.R.I.X</span>
    </div>
  </a>`;
}

/* ---------- Trang danh sách ---------- */
export function articlesIndexPage() {
  const [featured, ...rest] = articles;

  const body = `
<section class="hero" style="padding-block:clamp(120px,15vh,166px) clamp(30px,4vw,44px)">
  <div class="hero-aurora" aria-hidden="true"></div>
  <div class="wrap wrap-narrow" style="text-align:center">
    <p class="eyebrow" style="justify-content:center"><span class="spark" aria-hidden="true"></span>Kiến thức · ${articles.length} bài</p>
    <h1 style="font-size:clamp(34px,5.4vw,58px)">Những câu khách hỏi nhiều nhất, trả lời cho hết</h1>
    <p class="lead" style="margin:24px auto 0">Mỗi bài là một câu hỏi chúng tôi nghe đi nghe lại trong lúc làm việc với khách. Có công thức, có con số, đủ để bạn tự làm.</p>
  </div>
</section>

<section style="padding-top:0;padding-bottom:clamp(24px,3vw,36px)">
  <div class="wrap">
    ${featuredCard(featured)}
  </div>
</section>

<section style="padding-top:0">
  <div class="wrap">
    <div class="kb-bar" data-reveal>
      <div class="kb-chips" role="group" aria-label="Lọc theo chủ đề">
        <button class="chip" type="button" data-topic-filter="" aria-pressed="true">Tất cả <span class="n">${articles.length}</span></button>
        ${map(topics, t => `<button class="chip" type="button" data-topic-filter="${attr(t)}" data-note="${attr(TOPIC_NOTE[t] || '')}" aria-pressed="false">${esc(t)} <span class="n">${topicCount[t]}</span></button>`)}
      </div>
      <div class="kb-search">
        <label class="sr-only" for="kbSearch">Tìm trong bài viết</label>
        <input id="kbSearch" type="search" placeholder="Tìm: CAC, tốc độ phản hồi, bảng giá…" autocomplete="off">
      </div>
    </div>

    <p class="kb-topic-note" id="kbTopicNote" hidden></p>

    <div class="grid g-3" id="artGrid">
      ${map(rest, (a, i) => articleCard(a, i))}
    </div>
    <p class="muted" id="artEmpty" style="display:none;text-align:center;padding:40px 0">Không có bài nào khớp. Thử từ khoá khác hoặc bỏ bộ lọc.</p>
  </div>
</section>

${ctaBand({
  title: 'Đọc xong rồi, muốn biết hệ thống của mình đang ở đâu?',
  lead: 'Bài chẩn đoán áp dụng đúng những nguyên tắc trong các bài viết trên, lên chính số liệu của bạn.'
})}`;

  return layout({
    url: '/kien-thuc/',
    title: 'Kiến thức Marketing cho doanh nghiệp dịch vụ | Aurix',
    description: `${articles.length} bài hướng dẫn thực hành về đo lường, chuyển đổi, quảng cáo và giữ khách cho doanh nghiệp dịch vụ Việt Nam. Có công thức, có số liệu, tự áp dụng được.`,
    breadcrumbs: [{ name: 'Trang chủ', url: '/' }, { name: 'Kiến thức', url: '/kien-thuc/' }],
    extraCss: ['/css/prose.css'],
    extraJs: ['/js/kien-thuc.js'],
    schema: [{
      '@type': 'Blog',
      '@id': `${site.origin}/kien-thuc/#blog`,
      name: 'Kiến thức Aurix',
      url: `${site.origin}/kien-thuc/`,
      inLanguage: 'vi-VN',
      publisher: { '@id': `${site.origin}/#organization` },
      blogPost: articles.map(a => ({
        '@type': 'BlogPosting',
        headline: a.title,
        url: `${site.origin}/kien-thuc/${a.slug}/`,
        datePublished: a.date,
        description: a.excerpt
      }))
    }],
    body
  });
}
