import { layout } from '../layouts/base.js';
import { site, cta } from '../data/site.js';
import { framework } from '../data/framework.js';
import { services } from '../data/services.js';
import { projects, process, differentiators, testimonials, industries, stats } from '../data/content.js';
import { esc, attr, map, sectionHead, btn, ARROW, CHECK, picture, shorten } from '../lib/ui.js';
import { ctaBand, projectCard } from './home.js';
import { teamSection } from './company.js';

const pageHero = ({ eyebrow, title, lead }) => `
<section class="hero" style="padding-block:clamp(120px,15vh,166px) clamp(40px,5vw,62px)">
  <div class="hero-aurora" aria-hidden="true"></div>
  <div class="wrap wrap-narrow" style="text-align:center">
    <p class="eyebrow" style="justify-content:center"><span class="spark" aria-hidden="true"></span>${esc(eyebrow)}</p>
    <h1 style="font-size:clamp(34px,5.4vw,62px)">${title}</h1>
    ${lead ? `<p class="lead" style="margin:24px auto 0">${lead}</p>` : ''}
  </div>
</section>`;

/* ========== Phương pháp A.U.R.I.X ========== */
export function methodPage() {
  const body = `
${pageHero({
  eyebrow: 'Phương pháp độc quyền',
  title: '<span class="serif gold-text">A.U.R.I.X</span> — cách chúng tôi biến marketing thành một cỗ máy',
  lead: framework.promise
})}

<section style="padding-top:0">
  <div class="wrap">
    <h2 class="sr-only">Năm tầng của khung A.U.R.I.X</h2>
    <div class="layers" data-reveal>
      ${map(framework.layers, l => `
      <article class="layer" id="tang-${attr(l.key)}">
        <div>
          <div class="layer-letter" aria-hidden="true">${l.letter}</div>
          <div class="layer-vi">${esc(l.title)} · ${esc(l.vi)}</div>
        </div>
        <div>
          <h3>${esc(l.headline)}</h3>
          <p>${esc(l.desc)}</p>
          <p style="margin-top:12px"><a class="link-arrow" href="${attr(l.service)}" style="font-size:14px">Dịch vụ liên quan ${ARROW}</a></p>
        </div>
        <div class="layer-metric">
          <div class="d">${esc(l.metricDelta)}</div>
          <div class="m">${esc(l.metric)}</div>
        </div>
      </article>`)}
    </div>
    <p class="serif" data-reveal style="margin-top:32px;font-size:clamp(18px,2.2vw,25px);color:var(--gold-300);text-align:center;font-style:italic">“${esc(framework.principle)}”</p>
  </div>
</section>

<section>
  <div class="wrap">
    ${sectionHead({
      eyebrow: 'Nguyên tắc',
      title: 'Bốn nguyên tắc chúng tôi không đánh đổi',
      lead: 'Đây là những điều Aurix giữ nguyên kể cả khi khách hàng muốn làm nhanh hơn.'
    })}
    <div class="grid g-2">
      ${map([
        { t: 'Đo trước khi sửa', d: 'Không một thay đổi nào được thực hiện trước khi có số nền. Nếu không đo được trạng thái trước, không thể chứng minh trạng thái sau tốt hơn.' },
        { t: 'Sửa chỗ đắt nhất trước', d: 'Mọi điểm rò rỉ đều được quy ra số tiền mất mỗi tháng, rồi xếp hạng. Chúng tôi không sửa cái dễ, chúng tôi sửa cái đắt.' },
        { t: 'Một nguồn sự thật', d: 'Khi marketing, bán hàng và kế toán nhìn ba con số khác nhau, mọi cuộc họp đều là tranh luận. Hệ thống phải hội tụ về một bảng số duy nhất.' },
        { t: 'Bàn giao để tự chạy', d: 'Mỗi quy trình đều được viết thành tài liệu và đào tạo. Aurix xây hệ thống cho bạn sở hữu, không phải cho bạn phụ thuộc.' }
      ], (p, i) => `
      <article class="card" data-reveal style="--delay:${i * 80}ms">
        <div class="serif gold-text" style="font-size:15px;letter-spacing:.14em;margin-bottom:12px">0${i + 1}</div>
        <h3 style="font-size:20px">${esc(p.t)}</h3>
        <p>${esc(p.d)}</p>
      </article>`)}
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Quy trình triển khai', title: 'Từ chẩn đoán tới nhịp tối ưu liên tục' })}
    <div class="steps" data-reveal>
      ${map(process, p => `
      <article class="step">
        <div class="n" aria-hidden="true">${esc(p.step)}</div>
        <div><h3>${esc(p.name)}</h3><p>${esc(p.desc)}</p></div>
        <div class="meta"><b>${esc(p.duration)}</b>${esc(p.output)}</div>
      </article>`)}
    </div>
  </div>
</section>

${ctaBand()}`;

  return layout({
    url: '/phuong-phap/',
    title: 'Phương pháp A.U.R.I.X — Khung xây hệ thống tăng trưởng của Aurix',
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
  title: 'Hệ thống chúng tôi đã xây, và con số chúng đã tạo ra',
  lead: 'Mỗi dự án dưới đây là một cỗ máy hoàn chỉnh: chiến lược, thiết kế, kỹ thuật và dữ liệu. Không có dự án nào chỉ là một website.'
})}

<section style="padding-top:0">
  <div class="wrap">
    <div class="industry-bar" style="padding:0;margin-bottom:36px">
      <div class="inner">
        <span class="label"><span class="spark" aria-hidden="true"></span>Lọc theo ngành:</span>
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
    title: 'Dự án tiêu biểu — Hệ thống marketing Aurix đã triển khai',
    description: 'Xem các hệ thống marketing, web cá nhân hoá và landing page Aurix đã xây cho spa, nha khoa, giáo dục, fitness, du lịch và nội thất cao cấp.',
    breadcrumbs: [{ name: 'Trang chủ', url: '/' }, { name: 'Dự án', url: '/du-an/' }],
    extraJs: ['/js/filter.js'],
    schema: [{
      '@type': 'ItemList',
      itemListElement: projects.map((p, i) => ({
        '@type': 'ListItem', position: i + 1, name: `${p.client} — ${p.title}`, url: `${site.origin}/du-an/${p.slug}/`
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
<section class="hero" style="padding-block:clamp(120px,15vh,166px) clamp(36px,5vw,56px)">
  <div class="hero-aurora" aria-hidden="true"></div>
  <div class="wrap">
    <nav aria-label="Đường dẫn" style="margin-bottom:26px;font-size:13.5px;color:var(--fg-mute)">
      <a href="/" style="color:inherit">Trang chủ</a><span aria-hidden="true"> / </span>
      <a href="/du-an/" style="color:inherit">Dự án</a><span aria-hidden="true"> / </span>
      <span style="color:var(--gold-300)">${esc(p.client)}</span>
    </nav>
    <div class="wrap-narrow" style="padding:0;margin:0">
      <p class="eyebrow"><span class="spark" aria-hidden="true"></span>${esc(p.industry)}</p>
      <h1 style="font-size:clamp(32px,5vw,56px)">${esc(p.title)}</h1>
      <p class="lead" style="margin-top:22px">${esc(p.summary)}</p>
    </div>
    <div class="stat-row" style="margin-top:44px;grid-template-columns:repeat(${p.results.length},1fr)" data-reveal>
      ${map(p.results, r => `<div class="stat"><div class="v">${esc(r.value)}</div><div class="l">${esc(r.label)}</div></div>`)}
    </div>
  </div>
</section>

<section style="padding-top:clamp(30px,4vw,50px)">
  <div class="wrap" data-reveal>
    ${picture({
      src: p.image, fallback: p.imageFallback,
      alt: `Toàn bộ hệ thống nhận diện và giao diện ${p.client} do Aurix thiết kế`,
      width: 1240, height: 1240, cls: 'proj-shot', loading: 'eager',
      // Ở đây ảnh chiếm trọn bề ngang khung, khác hẳn lúc nằm trong lưới dự án
      sizes: '(max-width: 1304px) calc(100vw - 2 * clamp(20px, 5vw, 64px)), 1240px'
    })}
    <style>.proj-shot{border-radius:22px;border:1px solid var(--line);box-shadow:var(--shadow);width:100%}</style>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="grid g-2" style="gap:clamp(32px,5vw,68px);align-items:start">
      <div>
        ${sectionHead({ eyebrow: 'Phạm vi công việc', title: 'Aurix đã làm gì' })}
        <ul style="list-style:none;padding:0;margin:0;display:grid;gap:14px">
          ${map(p.scope, (s, i) => `
          <li data-reveal style="--delay:${i * 60}ms;display:grid;grid-template-columns:20px 1fr;gap:13px;align-items:start">
            <span style="padding-top:5px">${CHECK}</span>
            <span style="font-size:16px;color:var(--fg-soft)">${esc(s)}</span>
          </li>`)}
        </ul>
      </div>
      <div class="card" data-reveal style="--delay:120ms">
        <p class="eyebrow" style="margin-bottom:16px"><span class="spark" aria-hidden="true"></span>Kết quả sau triển khai</p>
        <div class="grid" style="gap:20px">
          ${map(p.results, r => `
          <div style="display:flex;justify-content:space-between;align-items:baseline;gap:16px;padding-bottom:14px;border-bottom:1px solid var(--line-soft)">
            <span style="font-size:15px;color:var(--fg-soft)">${esc(r.label)}</span>
            <span class="serif gold-text" style="font-size:26px;line-height:1;flex:none">${esc(r.value)}</span>
          </div>`)}
        </div>
      </div>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Dự án khác', title: 'Cùng một phương pháp, khác ngành', center: true })}
    <div class="grid g-3">${map(related, (r, i) => projectCard(r, i))}</div>
  </div>
</section>

${ctaBand()}`;

  return layout({
    url,
    title: shorten(`${p.client} — ${p.title}`, 50) + ' | Dự án Aurix',
    description: shorten(`${p.summary} Kết quả: ${p.results.map(r => `${r.value} ${r.label.toLowerCase()}`).join(', ')}.`, 160),
    breadcrumbs: [
      { name: 'Trang chủ', url: '/' },
      { name: 'Dự án', url: '/du-an/' },
      { name: p.client, url }
    ],
    schema: [{
      '@type': 'CreativeWork',
      '@id': `${site.origin}${url}#project`,
      name: `${p.client} — ${p.title}`,
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
  title: 'Chúng tôi là kỹ sư tăng trưởng, không phải xưởng nội dung',
  lead: 'Aurix được lập ra vì một điều đơn giản: phần lớn doanh nghiệp dịch vụ Việt Nam không thiếu ý tưởng marketing. Họ thiếu một hệ thống để những ý tưởng đó tạo ra doanh thu đo được.'
})}

<section style="padding-top:0">
  <div class="wrap" data-reveal>
    ${picture({
      src: '/assets/aurix-team.webp', fallback: '/assets/aurix-team.png',
      alt: 'Toàn bộ đội ngũ Aurix tại văn phòng TP. Hồ Chí Minh',
      width: 1536, height: 1024, cls: 'about-shot', loading: 'eager'
    })}
    <style>.about-shot{border-radius:22px;border:1px solid var(--line);box-shadow:var(--shadow);width:100%}</style>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="stat-row" data-reveal>
      ${map(stats, s => `
      <div class="stat">
        <div class="v" data-count="${s.value}" data-suffix="${attr(s.suffix)}"${s.decimals ? ` data-decimals="${s.decimals}"` : ''}>0${esc(s.suffix)}</div>
        <div class="l">${esc(s.label)}</div>
      </div>`)}
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="grid g-2" style="gap:clamp(32px,5vw,68px);align-items:start">
      <div>
        ${sectionHead({ eyebrow: 'Điều chúng tôi tin', title: 'Marketing là kỹ thuật, không phải may rủi' })}
        <p class="lead" style="font-size:17px">Một chiến dịch có thể may mắn. Một hệ thống thì không cần may mắn — nó tạo ra kết quả lặp lại được, đo được và bàn giao được.</p>
        <p class="lead" style="font-size:17px;margin-top:18px">Vì vậy Aurix đặt chiến lược, thiết kế, kỹ thuật và dữ liệu trong cùng một phòng. Người viết nội dung ngồi cạnh người dựng hạ tầng đo lường, và cả hai cùng nhìn một bảng doanh thu.</p>
      </div>
      <div class="grid" style="gap:20px">
        ${map(differentiators, (d, i) => `
        <div class="card" data-reveal style="--delay:${i * 70}ms;padding:24px 26px">
          <h3 style="font-size:17px;margin-bottom:7px">${esc(d.title)}</h3>
          <p style="font-size:15px;margin:0">${esc(d.desc)}</p>
        </div>`)}
      </div>
    </div>
  </div>
</section>

${teamSection()}

<section>
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Chuyên môn ngành', title: 'Chúng tôi đi sâu, không đi rộng', lead: 'Aurix tập trung vào các ngành dịch vụ có giá trị hợp đồng cao và chu kỳ ra quyết định dài — nơi một hệ thống tốt tạo ra khác biệt lớn nhất.', center: true })}
    <div class="grid g-3">
      ${map(industries, (ind, i) => `
      <article class="card" data-reveal style="--delay:${i * 70}ms">
        <h3 style="font-size:19px;margin-bottom:10px">${esc(ind.label)}</h3>
        <p style="font-size:15px">${esc(ind.pain)}</p>
        <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--line-soft);display:flex;align-items:baseline;gap:12px">
          <span class="serif gold-text" style="font-size:24px;line-height:1">${esc(ind.proof.value)}</span>
          <span class="muted" style="font-size:12.5px">${esc(ind.proof.label)}</span>
        </div>
      </article>`)}
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Khách hàng nói', title: 'Lời chứng thực từ ban điều hành', center: true })}
    <div class="grid g-3">
      ${map(testimonials, (t, i) => `
      <figure class="card" style="margin:0" data-reveal>
        <blockquote class="serif" style="font-style:italic;font-size:17px;line-height:1.62;margin:0 0 18px">“${esc(t.quote)}”</blockquote>
        <figcaption style="display:flex;align-items:center;gap:14px">
          ${picture({ src: t.image, alt: `${t.name}, ${t.role} tại ${t.company}`, width: 54, height: 54, cls: 'avt' })}
          <span><cite style="font-style:normal;font-weight:600;color:var(--gold-300);font-size:14px;display:block">${esc(t.name)}</cite>
          <span class="muted" style="font-size:13px">${esc(t.role)} · ${esc(t.company)}</span></span>
        </figcaption>
      </figure>`)}
    </div>
    <style>.avt{width:54px;height:54px;border-radius:50%;object-fit:cover;object-position:top center;border:1px solid var(--line);flex:none}</style>
  </div>
</section>

${ctaBand()}`;

  return layout({
    url: '/ve-aurix/',
    title: 'Về Aurix — Agency xây hệ thống tăng trưởng',
    description: 'Aurix là đội ngũ chiến lược, thiết kế, kỹ thuật và dữ liệu xây hệ thống marketing cho doanh nghiệp dịch vụ cao cấp tại Việt Nam. Mỗi quý chỉ nhận sáu dự án.',
    breadcrumbs: [{ name: 'Trang chủ', url: '/' }, { name: 'Về Aurix', url: '/ve-aurix/' }],
    body
  });
}

/* ========== Liên hệ ========== */
export function contactPage() {
  const body = `
${pageHero({
  eyebrow: 'Liên hệ',
  title: 'Bắt đầu bằng một cuộc trò chuyện thẳng thắn',
  lead: 'Hãy cho chúng tôi biết bạn đang ở đâu. Nếu Aurix không phải lựa chọn phù hợp, chúng tôi sẽ nói thẳng và giới thiệu hướng khác.'
})}

<section style="padding-top:0">
  <div class="wrap">
    <div class="grid g-2" style="gap:clamp(32px,5vw,64px);align-items:start">
      <div class="card" style="padding:clamp(28px,3.6vw,42px)">
        <h2 style="font-size:26px;margin-bottom:10px">Gửi yêu cầu tư vấn</h2>
        <p class="muted" style="font-size:15px;margin-bottom:28px">Aurix phản hồi trong vòng một ngày làm việc.</p>

        <form class="form-grid" id="contactForm" novalidate>
          <input type="text" class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
          <div class="grid g-2" style="gap:18px">
            <div class="field">
              <label for="cf-name">Họ và tên <span class="req">*</span></label>
              <input class="input" id="cf-name" name="name" type="text" required autocomplete="name" placeholder="Nguyễn Văn A">
              <span class="field-error">Vui lòng nhập họ tên.</span>
            </div>
            <div class="field">
              <label for="cf-phone">Số điện thoại <span class="req">*</span></label>
              <input class="input" id="cf-phone" name="phone" type="tel" required autocomplete="tel" inputmode="tel" placeholder="0901 234 567">
              <span class="field-error">Số điện thoại chưa hợp lệ.</span>
            </div>
          </div>
          <div class="grid g-2" style="gap:18px">
            <div class="field">
              <label for="cf-email">Email <span class="opt">không bắt buộc</span></label>
              <input class="input" id="cf-email" name="email" type="email" autocomplete="email" placeholder="ban@congty.vn">
              <span class="field-error">Email chưa hợp lệ.</span>
            </div>
            <div class="field">
              <label for="cf-company">Doanh nghiệp</label>
              <input class="input" id="cf-company" name="company" type="text" autocomplete="organization" placeholder="Tên công ty">
            </div>
          </div>
          <div class="grid g-2" style="gap:18px">
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
          <div class="field">
            <label for="cf-message">Điều bạn đang gặp phải</label>
            <textarea class="textarea" id="cf-message" name="message" placeholder="Ví dụ: lead nhiều nhưng tỉ lệ chốt thấp, không đo được kênh nào hiệu quả..."></textarea>
          </div>
          <div class="form-status" id="cf-status" role="status" aria-live="polite"></div>
          ${btn({ label: 'Gửi yêu cầu', size: 'lg', attrs: 'type="submit" id="cf-submit"' })}
          <p class="form-note">Bằng việc gửi biểu mẫu, bạn đồng ý để Aurix liên hệ tư vấn. Chúng tôi không chia sẻ thông tin của bạn cho bên thứ ba.</p>
        </form>
      </div>

      <div>
        <div class="card" style="margin-bottom:20px">
          <p class="eyebrow" style="margin-bottom:18px"><span class="spark" aria-hidden="true"></span>Liên hệ nhanh</p>
          <div class="grid" style="gap:18px">
            <div><div class="muted" style="font-size:12.5px;margin-bottom:4px">Điện thoại</div><a href="${attr(site.phoneHref)}" style="font-size:18px;color:var(--gold-300);font-weight:600">${esc(site.phone)}</a></div>
            <div><div class="muted" style="font-size:12.5px;margin-bottom:4px">Email</div><a href="mailto:${attr(site.email)}" style="font-size:17px;color:var(--fg)">${esc(site.email)}</a></div>
            <div><div class="muted" style="font-size:12.5px;margin-bottom:4px">Văn phòng</div><span style="font-size:16px;color:var(--fg-soft)">${esc(site.address.street)}, ${esc(site.address.city)}</span></div>
            <div><div class="muted" style="font-size:12.5px;margin-bottom:4px">Giờ làm việc</div><span style="font-size:16px;color:var(--fg-soft)">Thứ 2 – Thứ 6, 8:30 – 18:00</span></div>
          </div>
        </div>

        <div class="card">
          <h3 style="font-size:19px;margin-bottom:12px">Chưa sẵn sàng trao đổi?</h3>
          <p style="font-size:15px">Làm bài chẩn đoán tám câu hỏi. Bạn sẽ nhận ngay bảng điểm hệ thống và ước tính số tiền đang thất thoát mỗi tháng — không cần nói chuyện với ai.</p>
          <p style="margin-top:20px">${btn({ href: '/chan-doan/', label: 'Làm bài chẩn đoán', variant: 'ghost' })}</p>
        </div>
      </div>
    </div>
  </div>
</section>`;

  return layout({
    url: '/lien-he/',
    title: 'Liên hệ Aurix — Đặt lịch tư vấn hệ thống tăng trưởng',
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
        { t: 'Phương pháp A.U.R.I.X', d: 'Năm tầng của một cỗ máy tăng trưởng, và cách chúng tôi đo từng tầng.', h: '/phuong-phap/' },
        { t: 'Dự án tiêu biểu', d: 'Những hệ thống Aurix đã xây và con số chúng tạo ra.', h: '/du-an/' },
        { t: 'Bài chẩn đoán', d: 'Tám câu hỏi để biết hệ thống của bạn đang rò rỉ ở tầng nào.', h: '/chan-doan/' }
      ], (c, i) => `
      <a class="card svc-card" href="${attr(c.h)}" data-reveal style="--delay:${i * 80}ms;min-height:auto">
        <h3 style="font-size:20px">${esc(c.t)}</h3>
        <p>${esc(c.d)}</p>
        <div class="sv-foot"><span class="link-arrow">Xem ngay ${ARROW}</span></div>
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
    description: 'Trang bạn tìm không tồn tại.',
    noindex: true,
    body
  });
}
