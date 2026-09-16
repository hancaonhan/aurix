import { layout } from '../layouts/base.js';
import { site, cta } from '../data/site.js';
import { framework } from '../data/framework.js';
import { services } from '../data/services.js';
import { industries, projects, process, differentiators, testimonials, faq, stats } from '../data/content.js';
import { esc, attr, map, sectionHead, btn, ARROW, CHECK, faqList, picture } from '../lib/ui.js';
import { articles } from '../data/articles.js';
import { articleCard } from './article.js';

/* ---------- Hero ---------- */
function hero() {
  return `
<section class="hero" id="hero">
  <div class="hero-aurora" aria-hidden="true"></div>
  <div class="wrap hero-grid">
    <div>
      <p class="ctx-badge" id="ctxBadge" data-default="Hệ thống tăng trưởng cho doanh nghiệp dịch vụ cao cấp">
        <span class="pulse" aria-hidden="true"></span>
        <span id="ctxLabel">Hệ thống tăng trưởng cho doanh nghiệp dịch vụ cao cấp</span>
      </p>

      <h1 id="heroLine" data-default="Chúng tôi không chạy quảng cáo. Chúng tôi xây &lt;em&gt;cỗ máy tăng trưởng&lt;/em&gt;.">Chúng tôi không chạy quảng cáo. Chúng tôi xây <em>cỗ máy tăng trưởng</em>.</h1>

      <p class="lead" id="heroSub" data-default="Aurix hợp nhất bản sắc thương hiệu, hạ tầng dữ liệu, kênh tiếp cận, trang chuyển đổi và quy trình bán hàng thành một hệ thống duy nhất — nơi mỗi đồng ngân sách đều truy vết được tới doanh thu.">Aurix hợp nhất bản sắc thương hiệu, hạ tầng dữ liệu, kênh tiếp cận, trang chuyển đổi và quy trình bán hàng thành một hệ thống duy nhất — nơi mỗi đồng ngân sách đều truy vết được tới doanh thu.</p>

      <div class="hero-actions">
        ${btn({ href: cta.primary.href, label: 'Chẩn đoán hệ thống miễn phí', size: 'lg' })}
        ${btn({ href: '/du-an/', label: 'Xem dự án', variant: 'ghost', size: 'lg', arrow: false })}
      </div>

      <p class="hero-trust">
        <span><b>120+</b> dự án đã triển khai</span>
        <span><b>6</b> ngành dịch vụ cao cấp</span>
        <span><b>94%</b> khách hàng tiếp tục năm thứ hai</span>
      </p>
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
      <div class="float-stat fs-2">
        <div class="v">98%</div>
        <div class="l">Dữ liệu khớp doanh thu</div>
      </div>
    </div>
  </div>
</section>

<section class="industry-bar" aria-labelledby="ibLabel">
  <div class="wrap">
    <div class="inner">
      <span class="label" id="ibLabel">
        <span class="spark" aria-hidden="true"></span>
        Xem Aurix làm gì cho ngành của bạn:
      </span>
      <button class="chip" type="button" data-industry="" aria-pressed="true">Tất cả</button>
      ${map(industries, i => `<button class="chip" type="button" data-industry="${attr(i.key)}" aria-pressed="false">${esc(i.label)}</button>`)}
    </div>
  </div>
</section>`;
}

/* ---------- Vì sao hệ thống rò rỉ ---------- */
function problem() {
  const leaks = [
    { n: '68%', t: 'khách rời trang trong 15 giây đầu', d: 'Vì nội dung không nói đúng điều họ đang tìm. Một website nói chung chung cho mọi người là một website không nói với ai cả.' },
    { n: '41%', t: 'khách tiềm năng không bao giờ được gọi lại', d: 'Dữ liệu nằm rải rác giữa quảng cáo, form, tin nhắn và sổ tay. Không ai biết chắc ai đã được liên hệ.' },
    { n: '73%', t: 'ngân sách đổ vào kênh không ai đo được', d: 'Khi không nối được chi phí với doanh thu thật, mọi quyết định ngân sách đều là phỏng đoán đắt tiền.' }
  ];
  return `
<section id="van-de">
  <div class="wrap">
    ${sectionHead({
      eyebrow: 'Vấn đề thật',
      title: 'Bạn không thiếu khách. Hệ thống của bạn đang <span class="gold-text">rò rỉ</span>.',
      lead: 'Phần lớn doanh nghiệp dịch vụ không thua vì ngân sách quảng cáo. Họ thua ở những mắt xích không ai đo, nằm giữa lúc khách bấm vào và lúc khách trả tiền.'
    })}
    <div class="grid g-3">
      ${map(leaks, (l, i) => `
      <article class="card" data-reveal style="--delay:${i * 90}ms">
        <div class="serif gold-text" style="font-size:46px;line-height:1;margin-bottom:16px">${esc(l.n)}</div>
        <h3 style="font-size:19px">${esc(l.t)}</h3>
        <p>${esc(l.d)}</p>
      </article>`)}
    </div>
  </div>
</section>`;
}

/* ---------- Khung A.U.R.I.X ---------- */
function frameworkSection() {
  return `
<section id="phuong-phap">
  <div class="wrap">
    ${sectionHead({
      eyebrow: 'Phương pháp độc quyền',
      title: '<span class="serif gold-text">A.U.R.I.X</span> — năm tầng của một cỗ máy tăng trưởng',
      lead: framework.promise
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
    <p class="serif" data-reveal style="margin-top:32px;font-size:clamp(18px,2.2vw,25px);color:var(--gold-300);text-align:center;font-style:italic">“${esc(framework.principle)}”</p>
    <p style="margin-top:26px" data-reveal>
      <a class="link-arrow" href="/phuong-phap/">Tìm hiểu đầy đủ phương pháp A.U.R.I.X ${ARROW}</a>
    </p>
  </div>
</section>`;
}

/* ---------- Dịch vụ ---------- */
function servicesSection() {
  return `
<section id="dich-vu">
  <div class="wrap">
    ${sectionHead({
      eyebrow: 'Dịch vụ',
      title: 'Năm tầng. Một cỗ máy.',
      lead: 'Mỗi tầng là một dịch vụ độc lập, và cũng là một mắt xích. Bạn bắt đầu từ tầng đang yếu nhất, nhưng đích đến luôn là cả năm tầng chạy cùng nhau.'
    })}
    <div class="grid g-3">
      ${map(services, (s, i) => `
      <article class="card svc-card" data-reveal style="--delay:${i * 80}ms">
        <div class="sv-letter" aria-hidden="true">${s.layer}</div>
        <p class="sv-kicker">${esc(s.kicker)}</p>
        <h3>${esc(s.name)}</h3>
        <p>${esc(s.tagline)}</p>
        <p style="font-size:15px;color:var(--fg-mute);margin-top:14px">${esc(s.solution.desc.split('.')[0])}.</p>
        <div class="sv-foot">
          <a class="link-arrow" href="/dich-vu/${s.slug}/">Xem chi tiết ${ARROW}</a>
        </div>
      </article>`)}
    </div>
  </div>
</section>`;
}

/* ---------- Con số ---------- */
function statsSection() {
  return `
<section style="padding-block:0">
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

/* ---------- Dự án tiêu biểu ---------- */
function projectsSection() {
  const featured = projects.slice(0, 3);
  return `
<section id="du-an">
  <div class="wrap">
    ${sectionHead({
      eyebrow: 'Dự án tiêu biểu',
      title: 'Kết quả, không phải bộ sưu tập ảnh đẹp',
      lead: 'Mỗi dự án dưới đây là một hệ thống hoàn chỉnh, kèm con số đo được sau khi vận hành.'
    })}
    <div class="grid g-3" id="projGrid">
      ${map(featured, (p, i) => projectCard(p, i))}
    </div>
    <p style="margin-top:36px" data-reveal>
      <a class="link-arrow" href="/du-an/">Xem toàn bộ dự án ${ARROW}</a>
    </p>
  </div>
</section>`;
}

export function projectCard(p, i = 0) {
  return `
  <a class="proj" href="/du-an/${p.slug}/" data-reveal style="--delay:${i * 80}ms" data-industry-key="${attr(p.industryKey)}">
    <div class="proj-media">
      <span class="proj-tag">${esc(p.industry)}</span>
      ${picture({ src: p.image, fallback: p.imageFallback, alt: `Dự án ${p.client} do Aurix thực hiện`, width: 1240, height: 930 })}
    </div>
    <div class="proj-body">
      <p class="proj-client">${esc(p.client)}</p>
      <h3>${esc(p.title)}</h3>
      <p style="font-size:15px;color:var(--fg-soft)">${esc(p.summary)}</p>
      <div class="proj-results">
        ${map(p.results.slice(0, 3), r => `<div><div class="v">${esc(r.value)}</div><div class="l">${esc(r.label)}</div></div>`)}
      </div>
    </div>
  </a>`;
}

/* ---------- Quy trình ---------- */
function processSection() {
  return `
<section id="quy-trinh">
  <div class="wrap">
    ${sectionHead({
      eyebrow: 'Cách chúng tôi làm việc',
      title: 'Bốn bước, không có bước nào là "để xem sao"',
      lead: 'Mỗi bước có đầu ra cụ thể mà bạn cầm được trên tay, kể cả khi bạn quyết định dừng lại sau bước đầu tiên.'
    })}
    <div class="steps" data-reveal>
      ${map(process, p => `
      <article class="step">
        <div class="n" aria-hidden="true">${esc(p.step)}</div>
        <div>
          <h3>${esc(p.name)}</h3>
          <p>${esc(p.desc)}</p>
        </div>
        <div class="meta">
          <b>${esc(p.duration)}</b>
          ${esc(p.output)}
        </div>
      </article>`)}
    </div>
  </div>
</section>`;
}

/* ---------- Khác biệt ---------- */
function differenceSection() {
  return `
<section id="khac-biet">
  <div class="wrap">
    <div class="grid g-2" style="align-items:center;gap:clamp(32px,5vw,72px)">
      <div>
        ${sectionHead({
          eyebrow: 'Vì sao chọn Aurix',
          title: 'Chúng tôi từ chối nhiều hơn nhận',
          lead: 'Aurix không phải lựa chọn rẻ nhất, và cũng không cố gắng trở thành như vậy. Chúng tôi phù hợp với những doanh nghiệp muốn xây một tài sản, không phải thuê một dịch vụ theo tháng.'
        })}
        <div class="grid" style="gap:20px">
          ${map(differentiators, (d, i) => `
          <div data-reveal style="--delay:${i * 70}ms;display:grid;grid-template-columns:20px 1fr;gap:14px">
            <span style="padding-top:5px">${CHECK}</span>
            <div>
              <h3 style="font-size:17px;margin-bottom:5px">${esc(d.title)}</h3>
              <p style="font-size:15px;color:var(--fg-soft);margin:0">${esc(d.desc)}</p>
            </div>
          </div>`)}
        </div>
      </div>
      <div data-reveal style="--delay:140ms">
        ${picture({
          src: '/assets/aurix-team.webp',
          fallback: '/assets/aurix-team.png',
          alt: 'Đội ngũ Aurix tại văn phòng',
          width: 1536, height: 1024,
          cls: 'team-img'
        })}
        <style>.team-img{border-radius:20px;border:1px solid var(--line);box-shadow:var(--shadow)}</style>
        <p class="muted" style="font-size:13.5px;margin-top:16px;text-align:center">Đội ngũ Aurix — chiến lược, thiết kế, kỹ thuật và dữ liệu trong cùng một phòng.</p>
      </div>
    </div>
  </div>
</section>`;
}

/* ---------- Khách hàng nói ---------- */
function testimonialsSection() {
  return `
<section id="khach-hang">
  <div class="wrap">
    ${sectionHead({
      eyebrow: 'Khách hàng nói',
      title: 'Điều họ nhắc tới không phải là website đẹp',
      center: true
    })}
    <div class="grid g-3">
      ${map(testimonials, (t, i) => `
      <figure class="card" style="margin:0" data-reveal style="--delay:${i * 90}ms">
        <div class="quote" style="grid-template-columns:1fr">
          <blockquote>“${esc(t.quote)}”</blockquote>
          <figcaption style="display:flex;align-items:center;gap:14px">
            ${picture({ src: t.image, alt: `${t.name}, ${t.role} tại ${t.company}`, width: 64, height: 64, cls: 'avt' })}
            <span>
              <cite>${esc(t.name)}</cite>
              <span class="role">${esc(t.role)} · ${esc(t.company)}</span>
            </span>
          </figcaption>
        </div>
      </figure>`)}
    </div>
    <style>.avt{width:54px;height:54px;border-radius:50%;object-fit:cover;object-position:top center;border:1px solid var(--line);flex:none}</style>
  </div>
</section>`;
}

/* ---------- Câu hỏi thường gặp ---------- */
/* ---------- Kiến thức ----------
   Ba bài mới nhất. Với khách đang cân nhắc, thư viện bài viết là bằng chứng
   chuyên môn rẻ nhất và kiểm chứng được ngay; nó cũng là đường dẫn nội bộ đưa
   người đọc vào phần nội dung sâu của site. */
function knowledgeSection() {
  const latest = articles.slice(0, 3);
  return `
<section>
  <div class="wrap">
    ${sectionHead({
      eyebrow: `Kiến thức · ${articles.length} bài`,
      title: 'Chúng tôi viết ra cách mình làm việc',
      lead: 'Mỗi bài trả lời một câu hỏi khách hỏi thật, kèm công thức và con số. Bạn áp dụng được ngay, kể cả khi chưa làm việc với Aurix.',
      center: true
    })}
    <div class="grid g-3">${map(latest, (a, i) => articleCard(a, i))}</div>
    <p style="text-align:center;margin-top:36px" data-reveal>
      ${btn({ href: '/kien-thuc/', label: `Xem cả ${articles.length} bài`, variant: 'ghost' })}
    </p>
  </div>
</section>`;
}

function faqSection() {
  return `
<section id="cau-hoi">
  <div class="wrap wrap-narrow">
    ${sectionHead({ eyebrow: 'Câu hỏi thường gặp', title: 'Những điều khách hàng hỏi trước khi ký', center: true })}
    ${faqList(faq, 'home-faq')}
  </div>
</section>`;
}

/* ---------- Kêu gọi hành động ---------- */
export function ctaBand({
  title = 'Bắt đầu bằng một buổi chẩn đoán, không phải một bản báo giá',
  lead = 'Trong bốn mươi lăm phút, Aurix sẽ chỉ ra chính xác hệ thống của bạn đang rò rỉ ở đâu và điều đó đang tốn bao nhiêu tiền mỗi tháng. Miễn phí, không ràng buộc.'
} = {}) {
  return `
<section>
  <div class="wrap">
    <div class="cta-band" data-reveal>
      <p class="eyebrow" style="justify-content:center"><span class="spark" aria-hidden="true"></span>Bước tiếp theo</p>
      <h2>${title}</h2>
      <p class="lead">${lead}</p>
      <div class="hero-actions">
        ${btn({ href: cta.primary.href, label: cta.primary.label, size: 'lg' })}
        ${btn({ href: cta.secondary.href, label: cta.secondary.label, variant: 'ghost', size: 'lg', arrow: false })}
      </div>
      <p class="muted" style="font-size:13px;margin-top:26px">Mỗi quý Aurix chỉ nhận sáu dự án mới.</p>
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
    title: 'Aurix | Xây hệ thống Marketing cho thương hiệu cao cấp',
    description: 'Aurix xây cỗ máy tăng trưởng cho doanh nghiệp dịch vụ cao cấp: web cá nhân hoá, landing page chuyển đổi cao, hệ thống marketing đo được và tối ưu siêu chuyển đổi.',
    preloadImage: '/assets/models/11.png',
    schema,
    body: [
      hero(),
      problem(),
      frameworkSection(),
      servicesSection(),
      statsSection(),
      projectsSection(),
      processSection(),
      differenceSection(),
      testimonialsSection(),
      knowledgeSection(),
      faqSection(),
      ctaBand()
    ].join('\n')
  });
}
