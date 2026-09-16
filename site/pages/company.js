import { layout } from '../layouts/base.js';
import { site, cta } from '../data/site.js';
import { packages, priceFactors, team, privacy } from '../data/company.js';
import { process as steps } from '../data/content.js';
import { esc, attr, map, sectionHead, btn, ARROW, CHECK } from '../lib/ui.js';
import { ctaBand } from './home.js';

/* ========== Mức đầu tư ========== */
export function pricingPage() {
  const body = `
<section class="hero" style="padding-block:clamp(120px,15vh,166px) clamp(36px,5vw,54px)">
  <div class="hero-aurora" aria-hidden="true"></div>
  <div class="wrap wrap-narrow" style="text-align:center">
    <p class="eyebrow" style="justify-content:center"><span class="spark" aria-hidden="true"></span>Hợp tác</p>
    <h1 style="font-size:clamp(34px,5.4vw,58px)">Ba cách bắt đầu, tuỳ hệ thống của bạn đang ở đâu</h1>
    <p class="lead" style="margin:24px auto 0">Mỗi hướng hợp tác có phạm vi và thời gian triển khai riêng. Mức đầu tư phụ thuộc vào phạm vi, nên chúng tôi chốt con số cùng bạn sau buổi chẩn đoán.</p>
  </div>
</section>

<section style="padding-top:0">
  <div class="wrap">
    <h2 class="sr-only">Ba hướng hợp tác</h2>
    <div class="grid g-3 pkg-grid">
      ${map(packages, (p, i) => `
      <article class="card pkg${p.popular ? ' pkg-popular' : ''}" data-reveal style="--delay:${i * 80}ms">
        <div class="pkg-head">
          <h3 class="pkg-name">${esc(p.name)}</h3>
          ${p.popular ? '<span class="pkg-flag">Phổ biến nhất</span>' : ''}
        </div>
        <p class="muted" style="font-size:14.5px;margin-bottom:22px">${esc(p.tagline)}</p>

        <p class="pkg-dur">
          <span>Thời gian triển khai</span>
          <b>${esc(p.duration)}</b>
        </p>

        <p style="font-size:14.5px;color:var(--fg-soft);padding-bottom:20px;border-bottom:1px solid var(--line-soft)">${esc(p.forWho)}</p>

        <ul class="pkg-list">
          ${map(p.includes, d => `<li><span>${CHECK}</span><span>${esc(d)}</span></li>`)}
        </ul>

        <p class="muted" style="font-size:13px;margin-top:auto;padding-top:20px;font-style:italic">${esc(p.note)}</p>

        <div class="pkg-cta">
          ${btn({
            href: '/lien-he/',
            label: 'Đăng ký tư vấn',
            variant: p.popular ? 'primary' : 'ghost',
            size: 'sm'
          })}
        </div>
      </article>`)}
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    ${sectionHead({
      eyebrow: 'Điều gì làm con số thay đổi',
      title: 'Bốn yếu tố quyết định mức đầu tư',
      lead: 'Cùng một hướng hợp tác, phạm vi công việc có thể chênh nhau gấp đôi. Bốn yếu tố dưới đây quyết định điều đó, và chúng tôi chốt chúng cùng bạn trong buổi chẩn đoán.'
    })}
    <div class="grid g-2">
      ${map(priceFactors, (f, i) => `
      <article class="card" data-reveal style="--delay:${i * 70}ms">
        <h3 style="font-size:19px">${esc(f.t)}</h3>
        <p>${esc(f.d)}</p>
      </article>`)}
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Cách chúng tôi báo giá', title: 'Bốn bước, không có bước nào là bán hàng', center: true })}
    <div class="steps" data-reveal>
      ${map([
        { step: '01', name: 'Chẩn đoán miễn phí', duration: '45 phút', desc: 'Bạn làm bài chẩn đoán hoặc trao đổi trực tiếp. Chúng tôi chỉ ra điểm rò rỉ và ước tính mức thất thoát.', output: 'Báo cáo chẩn đoán' },
        { step: '02', name: 'Chốt phạm vi', duration: '1 tuần', desc: 'Hai bên thống nhất tầng nào làm trước, làm tới đâu, ai chịu trách nhiệm phần nào.', output: 'Bản mô tả phạm vi công việc' },
        { step: '03', name: 'Báo giá cố định', duration: '2 ngày', desc: 'Một con số, không phát sinh. Nếu phạm vi thay đổi giữa chừng, chúng tôi báo lại trước khi làm.', output: 'Hợp đồng và lịch thanh toán' },
        { step: '04', name: 'Bắt đầu', duration: '', desc: 'Thanh toán theo mốc bàn giao, không thanh toán trọn gói trước.', output: 'Lịch triển khai chi tiết' }
      ], p => `
      <article class="step">
        <div class="n" aria-hidden="true">${esc(p.step)}</div>
        <div><h3>${esc(p.name)}</h3><p>${esc(p.desc)}</p></div>
        <div class="meta">${p.duration ? `<b>${esc(p.duration)}</b>` : ''}${esc(p.output)}</div>
      </article>`)}
    </div>
    <p class="muted" style="text-align:center;margin-top:30px;font-size:14.5px" data-reveal>
      Nếu sau buổi chẩn đoán chúng tôi thấy quy mô của bạn chưa phù hợp, chúng tôi sẽ nói thẳng và giới thiệu hướng khác.
    </p>
  </div>
</section>

${ctaBand({
  title: 'Con số chính xác cho trường hợp của bạn nằm sau buổi chẩn đoán',
  lead: 'Bốn mươi lăm phút, miễn phí, không ràng buộc. Kết thúc buổi đó bạn có báo cáo điểm rò rỉ dù có hợp tác hay không.'
})}`;

  return layout({
    url: '/dau-tu/',
    title: 'Hợp tác và mức đầu tư | Aurix',
    description: 'Ba hướng hợp tác với Aurix: Khởi động, Hệ thống và Đồng hành. Phạm vi công việc, thời gian triển khai và cách Aurix chốt mức đầu tư sau buổi chẩn đoán.',
    breadcrumbs: [{ name: 'Trang chủ', url: '/' }, { name: 'Mức đầu tư', url: '/dau-tu/' }],
    extraCss: ['/css/company.css'],
    schema: [{
      '@type': 'OfferCatalog',
      '@id': `${site.origin}/dau-tu/#catalog`,
      name: 'Gói dịch vụ Aurix',
      // Không khai báo giá: mức đầu tư chỉ chốt sau buổi chẩn đoán.
      itemListElement: packages.map((p, i) => ({
        '@type': 'Offer',
        position: i + 1,
        name: p.name,
        description: p.tagline,
        url: `${site.origin}/lien-he/`,
        seller: { '@id': `${site.origin}/#organization` }
      }))
    }],
    body
  });
}

/* ========== Đội ngũ ========== */
export function teamSection() {
  return `
<section id="doi-ngu">
  <div class="wrap">
    ${sectionHead({
      eyebrow: 'Đội ngũ',
      title: 'Ai sẽ ngồi trong phòng họp với bạn',
      lead: 'Aurix không có mô hình bán hàng một người rồi bàn giao cho người khác làm. Người bạn gặp ở buổi chẩn đoán là người theo dự án tới cuối.',
      center: true
    })}
    <div class="grid g-4">
      ${map(team, (m, i) => `
      <article class="card team-card" data-reveal style="--delay:${i * 70}ms">
        <div class="team-avatar" aria-hidden="true"><span class="spark"></span></div>
        <h3 style="font-size:17px;margin-bottom:5px">${esc(m.name)}</h3>
        <p class="team-role">${esc(m.role)}</p>
        <p style="font-size:14.5px;margin:14px 0 0">${esc(m.bio)}</p>
        <p class="team-focus">${esc(m.focus)}</p>
      </article>`)}
    </div>
  </div>
</section>`;
}

/* ========== Chính sách bảo mật ========== */
export function privacyPage() {
  const body = `
<section class="hero" style="padding-block:clamp(118px,14vh,150px) clamp(28px,4vw,40px)">
  <div class="hero-aurora" aria-hidden="true"></div>
  <div class="wrap wrap-narrow">
    <p class="eyebrow"><span class="spark" aria-hidden="true"></span>Pháp lý</p>
    <h1 style="font-size:clamp(30px,4.4vw,48px)">Chính sách bảo vệ dữ liệu cá nhân</h1>
    <p class="lead" style="margin-top:20px">Chính sách này mô tả cách Aurix thu thập, sử dụng và bảo vệ thông tin cá nhân bạn cung cấp qua website, theo Nghị định 13/2023/NĐ-CP.</p>
    <p class="article-meta"><time datetime="${attr(privacy.updated)}">Cập nhật ${privacy.updated.split('-').reverse().map(Number).join('/')}</time></p>
  </div>
</section>

<section style="padding-top:0">
  <div class="wrap wrap-narrow">
    <div class="prose">
      ${map(privacy.sections, s => `
        <h2>${esc(s.h)}</h2>
        ${s.p.length > 1 && s.h !== 'Chúng tôi thu thập thông tin gì'
          ? `<ul class="prose-list">${map(s.p, t => `<li>${esc(t)}</li>`)}</ul>`
          : map(s.p, t => `<p>${esc(t)}</p>`)}
        ${s.note ? `<p class="prose-formula" style="font-family:var(--font-body);font-size:15px;text-align:left">${esc(s.note)}</p>` : ''}
      `)}

      <h2>Liên hệ về dữ liệu</h2>
      <p>Mọi yêu cầu liên quan tới dữ liệu cá nhân, gửi tới:</p>
      <p>
        ${esc(site.legalName)}<br>
        ${esc(site.address.street)}, ${esc(site.address.city)}<br>
        <a href="mailto:${attr(site.email)}" style="color:var(--gold-300)">${esc(site.email)}</a> ·
        <a href="${attr(site.phoneHref)}" style="color:var(--gold-300)">${esc(site.phone)}</a>
      </p>
    </div>
  </div>
</section>`;

  return layout({
    url: '/chinh-sach-bao-mat/',
    title: 'Chính sách bảo vệ dữ liệu cá nhân | Aurix',
    description: 'Cách Aurix thu thập, sử dụng, lưu trữ và bảo vệ dữ liệu cá nhân của khách hàng theo Nghị định 13/2023/NĐ-CP, cùng quyền của chủ thể dữ liệu.',
    breadcrumbs: [{ name: 'Trang chủ', url: '/' }, { name: 'Chính sách bảo mật', url: '/chinh-sach-bao-mat/' }],
    extraCss: ['/css/prose.css'],
    body
  });
}
