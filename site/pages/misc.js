import { layout } from '../layouts/base.js';
import { site, cta } from '../data/site.js';
import { framework } from '../data/framework.js';
import { services } from '../data/services.js';
import { projects, process, differentiators, testimonials, industries, stats } from '../data/content.js';
import { esc, attr, map, sectionHead, btn, ARROW, CHECK, picture, shorten, firstSentence } from '../lib/ui.js';
import { crumbs } from './service.js';
import { ctaBand, projectCard } from './home.js';
import { teamSection } from './company.js';

const pageHero = ({ eyebrow, title, lead, crumb }) => `
<section class="hero page-hero">
  <div class="wrap">
    ${crumbs([{ name: 'Trang chủ', url: '/' }, { name: crumb || eyebrow }])}
    <div class="page-intro">
      <p class="eyebrow">${esc(eyebrow)}</p>
      <h1 class="page-title">${title}</h1>
      ${lead ? `<p class="lead">${lead}</p>` : ''}
    </div>
  </div>
</section>`;

/* ========== Phương pháp A.U.R.I.X ========== */
export function methodPage() {
  const body = `
${pageHero({
  eyebrow: 'Phương pháp',
  title: 'Phương pháp A.U.R.I.X',
  lead: framework.promise
})}

<section style="padding-top:0">
  <div class="wrap">
    <h2 class="sr-only">Năm tầng của khung A.U.R.I.X</h2>
    <ol class="method-list">
      ${map(framework.layers, (l, i) => `
      <li id="tang-${attr(l.key)}" data-reveal style="--delay:${i * 60}ms">
        <span class="m-letter" aria-hidden="true">${l.letter}</span>
        <div class="m-body">
          <p class="m-name">${esc(l.title)} · ${esc(l.vi)}</p>
          <h3>${esc(l.headline)}</h3>
          <p>${esc(firstSentence(l.desc))}</p>
          <a class="link-arrow" href="${attr(l.service)}">Dịch vụ liên quan ${ARROW}</a>
        </div>
        <p class="m-metric"><b>${esc(l.metricDelta)}</b><span>${esc(l.metric)}</span></p>
      </li>`)}
    </ol>
  </div>
</section>

<section class="quote-band">
  <div class="wrap wrap-narrow">
    <p data-reveal>“${esc(framework.principle)}”</p>
  </div>
</section>

<section>
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Nguyên tắc', title: 'Bốn điều Aurix không đánh đổi' })}
    <div class="grid g-4">
      ${map([
        { t: 'Đo trước khi sửa', d: 'Không thay đổi gì khi chưa có số nền để so.' },
        { t: 'Sửa chỗ đắt nhất trước', d: 'Mỗi điểm mất khách được quy ra tiền rồi xếp hạng.' },
        { t: 'Một bảng số chung', d: 'Marketing, bán hàng và kế toán cùng nhìn một nguồn.' },
        { t: 'Bàn giao để tự chạy', d: 'Quy trình được viết thành tài liệu và đào tạo lại.' }
      ], (p, i) => `
      <article class="card pillar" data-reveal style="--delay:${i * 80}ms">
        <span class="flow-n">0${i + 1}</span>
        <h3>${esc(p.t)}</h3>
        <p>${esc(p.d)}</p>
      </article>`)}
    </div>
  </div>
</section>

<section class="bg-alt">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Quy trình', title: 'Bốn bước triển khai' })}
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
</section>

${ctaBand()}`;

  return layout({
    url: '/phuong-phap/',
    title: 'Phương pháp A.U.R.I.X | Aurix',
    description: 'A.U.R.I.X là khung năm tầng Aurix dùng để xây hệ thống tăng trưởng: Adapt, Unify, Reach, Ignite, Xpand. Mỗi tầng gắn với một chỉ số đo được.',
    breadcrumbs: [{ name: 'Trang chủ', url: '/' }, { name: 'Phương pháp', url: '/phuong-phap/' }],
    body
  });
}

/* ========== Danh sách dự án ========== */
export function projectsIndexPage() {
  const body = `
${pageHero({
  eyebrow: 'Dự án',
  title: 'Dự án tiêu biểu',
  lead: 'Mỗi dự án gồm chiến lược, thiết kế, kỹ thuật và đo lường, kèm số liệu sau khi vận hành.'
})}

<section style="padding-top:0">
  <div class="wrap">
    <div class="industry-bar" style="padding:0;margin-bottom:36px">
      <div class="inner">
        <span class="label">Lọc theo ngành:</span>
        <button class="chip" type="button" data-filter="" aria-pressed="true">Tất cả</button>
        ${map(industries, i => `<button class="chip" type="button" data-filter="${attr(i.key)}" aria-pressed="false">${esc(i.label)}</button>`)}
      </div>
    </div>
    <h2 class="sr-only">Danh sách dự án</h2>
    <div class="grid g-3" id="projGrid">
      ${map(projects, (p, i) => projectCard(p, i))}
    </div>
    <p class="muted" id="projEmpty" style="display:none;text-align:center;padding:40px 0">Chưa có dự án công bố cho ngành này. <a href="/lien-he/" style="color:var(--gold-300)">Liên hệ Aurix</a> để xem hồ sơ năng lực đầy đủ.</p>
  </div>
</section>

${ctaBand({
  title: 'Dự án tiếp theo có thể là của bạn',
  lead: 'Aurix chỉ nhận sáu dự án mỗi quý. Bắt đầu bằng một buổi chẩn đoán để xem hai bên có phù hợp không.'
})}`;

  return layout({
    url: '/du-an/',
    title: 'Dự án tiêu biểu: Hệ thống marketing Aurix đã triển khai',
    description: 'Xem các hệ thống marketing, web cá nhân hoá và landing page Aurix đã xây cho spa, nha khoa, giáo dục, fitness, du lịch và nội thất cao cấp.',
    breadcrumbs: [{ name: 'Trang chủ', url: '/' }, { name: 'Dự án', url: '/du-an/' }],
    extraJs: ['/js/filter.js'],
    schema: [{
      '@type': 'ItemList',
      itemListElement: projects.map((p, i) => ({
        '@type': 'ListItem', position: i + 1, name: `${p.client}: ${p.title}`, url: `${site.origin}/du-an/${p.slug}/`
      }))
    }],
    body
  });
}

/* ========== Chi tiết dự án ========== */
export function projectPage(p) {
  const url = `/du-an/${p.slug}/`;
  const related = projects.filter(o => o.slug !== p.slug).slice(0, 3);

  const body = `
<section class="hero page-hero">
  <div class="wrap">
    ${crumbs([{ name: 'Trang chủ', url: '/' }, { name: 'Dự án', url: '/du-an/' }, { name: p.client }])}
    <div class="page-intro">
      <p class="eyebrow">${esc(p.client)} · ${esc(p.industry)}</p>
      <h1 class="page-title">${esc(p.title)}</h1>
      <p class="lead">${esc(p.summary)}</p>
    </div>
  </div>
</section>

<section class="band-stats" style="padding-top:0">
  <div class="wrap">
    <div class="stat-row" style="grid-template-columns:repeat(${p.results.length},1fr)" data-reveal>
      ${map(p.results, r => `<div class="stat"><div class="v">${esc(r.value)}</div><div class="l">${esc(r.label)}</div></div>`)}
    </div>
  </div>
</section>

<section style="padding-top:0">
  <div class="wrap" data-reveal>
    ${picture({
      src: p.image, fallback: p.imageFallback,
      alt: `Toàn bộ hệ thống nhận diện và giao diện ${p.client} do Aurix thiết kế`,
      width: 1240, height: 1240, cls: 'proj-shot', loading: 'eager',
      // Ở đây ảnh chiếm trọn bề ngang khung, khác hẳn lúc nằm trong lưới dự án
      sizes: '(max-width: 1304px) calc(100vw - 2 * clamp(20px, 5vw, 64px)), 1240px'
    })}
  </div>
</section>

<section class="bg-alt">
  <div class="wrap split">
    ${sectionHead({ eyebrow: 'Phạm vi', title: 'Aurix đã làm gì' })}
    <ul class="check-list">
      ${map(p.scope, x => `<li>${CHECK}<span>${esc(x)}</span></li>`)}
    </ul>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="head-row">
      ${sectionHead({ eyebrow: 'Dự án khác', title: 'Cùng cách làm, ngành khác' })}
      <a class="link-arrow" href="/du-an/">Tất cả dự án ${ARROW}</a>
    </div>
    <div class="grid g-3">${map(related, (r, i) => projectCard(r, i))}</div>
  </div>
</section>

${ctaBand()}`;

  return layout({
    url,
    title: `Dự án ${p.client}: ngành ${p.industry.toLowerCase()} | Aurix`,
    description: shorten(`${p.summary} Kết quả: ${p.results.map(r => `${r.value} ${r.label.toLowerCase()}`).join(', ')}.`, 160),
    breadcrumbs: [
      { name: 'Trang chủ', url: '/' },
      { name: 'Dự án', url: '/du-an/' },
      { name: p.client, url }
    ],
    schema: [{
      '@type': 'CreativeWork',
      '@id': `${site.origin}${url}#project`,
      name: `${p.client}: ${p.title}`,
      description: p.summary,
      url: site.origin + url,
      image: site.origin + p.imageFallback,
      creator: { '@id': `${site.origin}/#organization` },
      about: p.industry
    }],
    body
  });
}

/* ========== Về Aurix ========== */
export function aboutPage() {
  const body = `
${pageHero({
  eyebrow: 'Về Aurix',
  title: 'Về Aurix',
  lead: 'Đội ngũ chiến lược, thiết kế, kỹ thuật và dữ liệu làm việc cùng một phòng, cho doanh nghiệp dịch vụ tại Việt Nam.'
})}

<section style="padding-top:0">
  <div class="wrap" data-reveal>
    ${picture({
      src: '/assets/aurix-team.webp', fallback: '/assets/aurix-team.png',
      alt: 'Toàn bộ đội ngũ Aurix tại văn phòng',
      width: 1536, height: 1024, cls: 'proj-shot', loading: 'eager'
    })}
  </div>
</section>

<section class="band-stats" style="padding-top:0">
  <div class="wrap">
    <div class="stat-row" data-reveal>
      ${map(stats, x => `
      <div class="stat">
        <div class="v" data-count="${x.value}" data-suffix="${attr(x.suffix)}"${x.decimals ? ` data-decimals="${x.decimals}"` : ''}>0${esc(x.suffix)}</div>
        <div class="l">${esc(x.label)}</div>
      </div>`)}
    </div>
  </div>
</section>

<section class="bg-alt">
  <div class="wrap split">
    <div>
      ${sectionHead({ eyebrow: 'Cách làm việc', title: 'Làm ít dự án, làm tới nơi' })}
      <p class="lead" style="margin-top:16px">Một chiến dịch có thể may mắn. Một hệ thống thì cho kết quả lặp lại được, đo được và bàn giao được.</p>
    </div>
    <ul class="check-list">
      ${map(differentiators, d => `<li>${CHECK}<span>${esc(d.title)}</span></li>`)}
    </ul>
  </div>
</section>

${teamSection()}

<section class="bg-alt">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Ngành', title: 'Các ngành Aurix phục vụ' })}
    <div class="grid g-3">
      ${map(industries, (ind, i) => `
      <a class="card ind-card" href="/nganh/${ind.slug}/" data-reveal style="--delay:${i * 70}ms">
        <h3>${esc(ind.label)}</h3>
        <p class="proof-num"><b>${esc(ind.proof.value)}</b><span>${esc(ind.proof.label)}</span></p>
      </a>`)}
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Khách hàng nói', title: 'Lời chứng thực' })}
    <div class="grid g-3">
      ${map(testimonials, (t, i) => `
      <figure class="card quote-card" data-reveal style="--delay:${i * 80}ms">
        <blockquote>“${esc(t.quote)}”</blockquote>
        <figcaption>
          ${picture({ src: t.image, alt: `${t.name}, ${t.role} tại ${t.company}`, width: 54, height: 54, cls: 'avt' })}
          <span><cite>${esc(t.name)}</cite><span class="role">${esc(t.role)}, ${esc(t.company)}</span></span>
        </figcaption>
      </figure>`)}
    </div>
  </div>
</section>

${ctaBand()}`;

  return layout({
    url: '/ve-aurix/',
    title: 'Về Aurix: Agency xây hệ thống tăng trưởng',
    description: 'Aurix là đội ngũ chiến lược, thiết kế, kỹ thuật và dữ liệu xây hệ thống marketing cho doanh nghiệp dịch vụ cao cấp tại Việt Nam. Mỗi quý chỉ nhận sáu dự án.',
    breadcrumbs: [{ name: 'Trang chủ', url: '/' }, { name: 'Về Aurix', url: '/ve-aurix/' }],
    // Thẻ đội ngũ dùng chung kiểu với trang Mức đầu tư
    extraCss: ['/css/company.css'],
    body
  });
}

/* ========== Liên hệ ========== */
export function contactPage() {
  const body = `
${pageHero({
  eyebrow: 'Liên hệ',
  title: 'Liên hệ Aurix',
  lead: 'Nếu Aurix không phải lựa chọn phù hợp, chúng tôi sẽ nói thẳng và giới thiệu hướng khác.'
})}

<section style="padding-top:0">
  <div class="wrap">
    <div class="grid g-2" style="gap:clamp(32px,5vw,64px);align-items:start">
      <div class="card contact-card">
        <!-- Hai bước: bước 1 lưu tên và số ngay, khách bỏ ngang ở bước 2 vẫn không mất số -->
        <form class="form-grid" id="contactForm" novalidate>
          <p class="step-tag">Bước 1/2</p>
          <h2 class="contact-title">Để lại số, Aurix gọi lại cho bạn</h2>
          <p class="capacity" data-capacity hidden></p>
          <input type="text" class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
          <div class="field">
            <label for="cf-name">Họ và tên <span class="req">*</span></label>
            <input class="input" id="cf-name" name="name" type="text" required autocomplete="name" placeholder="Nguyễn Văn A">
            <span class="field-error">Vui lòng nhập họ tên.</span>
          </div>
          <div class="field">
            <label for="cf-phone">Số điện thoại / Zalo <span class="req">*</span></label>
            <input class="input" id="cf-phone" name="phone" type="tel" required autocomplete="tel" inputmode="tel" placeholder="0901 234 567">
            <span class="field-error">Số điện thoại chưa hợp lệ.</span>
          </div>
          <div class="form-status" id="cf-status" role="status" aria-live="polite"></div>
          ${btn({ label: 'Gửi', size: 'lg', attrs: 'type="submit" id="cf-submit"' })}
          <p class="form-note">Aurix gọi lại trong giờ làm việc. Không chia sẻ thông tin của bạn cho bên thứ ba.</p>
        </form>

        <form class="form-grid" id="contactMore" novalidate hidden>
          <p class="step-ok">✓ Đã nhận số của bạn.</p>
          <p class="step-tag">Bước 2/2 · không bắt buộc</p>
          <h2 class="contact-title">Cho Aurix biết thêm một chút</h2>
          <p class="muted" style="margin:0">Để buổi gọi đi thẳng vào việc của bạn.</p>
          <div class="grid g-2" style="gap:14px">
            <div class="field">
              <label for="cf-industry">Ngành</label>
              <select class="select" id="cf-industry" name="industry">
                <option value="">Chọn ngành</option>
                ${map(industries, i => `<option value="${attr(i.key)}">${esc(i.label)}</option>`)}
                <option value="khac">Ngành khác</option>
              </select>
            </div>
            <div class="field">
              <label for="cf-service">Quan tâm tới</label>
              <select class="select" id="cf-service" name="service">
                <option value="">Chọn dịch vụ</option>
                ${map(services, s => `<option value="${attr(s.slug)}">${esc(s.name)}</option>`)}
                <option value="tong-the">Chưa rõ, cần tư vấn tổng thể</option>
              </select>
            </div>
          </div>
          <div class="grid g-2" style="gap:14px">
            <div class="field">
              <label for="cf-company">Doanh nghiệp</label>
              <input class="input" id="cf-company" name="company" type="text" autocomplete="organization" placeholder="Tên công ty">
            </div>
            <div class="field">
              <label for="cf-email">Email</label>
              <input class="input" id="cf-email" name="email" type="email" autocomplete="email" placeholder="ban@congty.vn">
              <span class="field-error">Email chưa hợp lệ.</span>
            </div>
          </div>
          <div class="field">
            <label for="cf-message">Điều bạn đang gặp phải</label>
            <textarea class="textarea" id="cf-message" name="message" placeholder="Ví dụ: khách hỏi nhiều nhưng chốt ít, không biết kênh nào hiệu quả..."></textarea>
          </div>
          <div class="form-status" id="cf-more-status" role="status" aria-live="polite"></div>
          <div class="step-actions">
            ${btn({ label: 'Gửi thêm', size: 'lg', attrs: 'type="submit" id="cf-more-submit"' })}
            <a class="link-arrow" href="/cam-on/">Bỏ qua</a>
          </div>
        </form>
      </div>

      <div>
        <div class="card" style="margin-bottom:20px">
          <p class="eyebrow" style="margin-bottom:18px">Liên hệ nhanh</p>
          <div class="quick-row">
            <a class="btn btn-primary" href="${attr(site.zalo)}" target="_blank" rel="noopener">Nhắn Zalo</a>
            <a class="btn btn-ghost" href="${attr(site.phoneHref)}">Gọi ${esc(site.phone)}</a>
          </div>
          <div class="grid" style="gap:18px">
            <div><div class="muted" style="font-size:12.5px;margin-bottom:4px">Điện thoại</div><a href="${attr(site.phoneHref)}" style="font-size:18px;color:var(--gold-300);font-weight:600">${esc(site.phone)}</a></div>
            <div><div class="muted" style="font-size:12.5px;margin-bottom:4px">Email</div><a href="mailto:${attr(site.email)}" style="font-size:17px;color:var(--fg)">${esc(site.email)}</a></div>
            <div><div class="muted" style="font-size:12.5px;margin-bottom:4px">Văn phòng</div><span style="font-size:16px;color:var(--fg-soft)">${esc(site.address.street)}, ${esc(site.address.city)}</span></div>
            <div><div class="muted" style="font-size:12.5px;margin-bottom:4px">Giờ làm việc</div><span style="font-size:16px;color:var(--fg-soft)">Thứ 2 – Thứ 6, 8:30 – 18:00</span></div>
          </div>
        </div>

        <div class="card">
          <h3 style="font-size:19px;margin-bottom:12px">Chưa sẵn sàng trao đổi?</h3>
          <p style="font-size:15px">Làm bài chẩn đoán tám câu hỏi. Bạn sẽ nhận ngay bảng điểm hệ thống và ước tính số tiền đang thất thoát mỗi tháng, không cần nói chuyện với ai.</p>
          <p style="margin-top:20px">${btn({ href: '/chan-doan/', label: 'Làm bài chẩn đoán', variant: 'ghost' })}</p>
        </div>
      </div>
    </div>
  </div>
</section>`;

  return layout({
    url: '/lien-he/',
    title: 'Liên hệ Aurix: Đặt lịch tư vấn hệ thống tăng trưởng',
    description: `Liên hệ Aurix để đặt lịch tư vấn xây hệ thống marketing. Điện thoại ${site.phone}, email ${site.email}, văn phòng tại ${site.address.city}.`,
    breadcrumbs: [{ name: 'Trang chủ', url: '/' }, { name: 'Liên hệ', url: '/lien-he/' }],
    extraJs: ['/js/form.js'],
    schema: [{
      '@type': 'ContactPage',
      '@id': `${site.origin}/lien-he/#contactpage`,
      url: `${site.origin}/lien-he/`,
      mainEntity: { '@id': `${site.origin}/#organization` }
    }],
    body
  });
}

/* ========== Cảm ơn ========== */
export function thankYouPage() {
  const body = `
${pageHero({
  eyebrow: 'Đã nhận',
  title: 'Cảm ơn bạn. Chúng tôi đã nhận được thông tin.',
  lead: 'Một chuyên gia của Aurix sẽ liên hệ trong vòng một ngày làm việc. Trong lúc chờ, đây là vài thứ đáng xem.'
})}

<section style="padding-top:0">
  <div class="wrap">
    <div class="grid g-3">
      ${map([
        { t: 'Phương pháp A.U.R.I.X', d: 'Năm tầng công việc và cách chúng tôi đo từng tầng.', h: '/phuong-phap/' },
        { t: 'Dự án tiêu biểu', d: 'Những hệ thống Aurix đã xây và con số chúng tạo ra.', h: '/du-an/' },
        { t: 'Bài chẩn đoán', d: 'Tám câu hỏi để biết hệ thống của bạn đang rò rỉ ở tầng nào.', h: '/chan-doan/' }
      ], (c, i) => `
      <a class="card svc-card" href="${attr(c.h)}" data-reveal style="--delay:${i * 80}ms;min-height:auto">
        <h3 style="font-size:20px">${esc(c.t)}</h3>
        <p>${esc(c.d)}</p>
        <span class="sv-more">Xem ngay ${ARROW}</span>
      </a>`)}
    </div>
  </div>
</section>`;

  return layout({
    url: '/cam-on/',
    title: 'Cảm ơn bạn đã liên hệ Aurix',
    description: 'Aurix đã nhận được yêu cầu của bạn và sẽ phản hồi trong vòng một ngày làm việc.',
    noindex: true,
    body
  });
}

/* ========== 404 ========== */
export function notFoundPage() {
  const body = `
${pageHero({
  eyebrow: 'Lỗi 404',
  title: 'Trang này không tồn tại',
  lead: 'Có thể đường dẫn đã thay đổi, hoặc bạn gõ nhầm một ký tự. Dưới đây là những lối đi chính.'
})}
<section style="padding-top:0">
  <div class="wrap">
    <div class="grid g-4">
      ${map([
        { t: 'Trang chủ', h: '/' },
        { t: 'Dịch vụ', h: '/dich-vu/' },
        { t: 'Dự án', h: '/du-an/' },
        { t: 'Liên hệ', h: '/lien-he/' }
      ], c => `<a class="card" href="${attr(c.h)}" style="text-align:center"><h3 style="font-size:18px;margin:0">${esc(c.t)}</h3></a>`)}
    </div>
  </div>
</section>`;

  return layout({
    url: '/404.html',
    title: 'Không tìm thấy trang | Aurix',
    description: 'Trang bạn tìm không tồn tại hoặc đã đổi địa chỉ. Quay lại trang chủ Aurix hoặc xem dịch vụ, dự án và bài viết.',
    noindex: true,
    body
  });
}
