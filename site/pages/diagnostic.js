import { layout } from '../layouts/base.js';
import { site } from '../data/site.js';
import { questions } from '../data/diagnostic.js';
import { industries } from '../data/content.js';
import { esc, attr, map, sectionHead, btn, ARROW } from '../lib/ui.js';

function stepHtml(q, i) {
  return `
  <div class="dx-step${i === 0 ? ' is-on' : ''}" data-step="${i}" data-qid="${attr(q.id)}"${q.type === 'context' ? ' data-context="1"' : ''} role="group" aria-labelledby="dxq-${i}">
    <h2 class="dx-q" id="dxq-${i}">${esc(q.q)}</h2>
    ${q.hint ? `<p class="dx-hint">${esc(q.hint)}</p>` : ''}
    <div class="dx-opts">
      ${map(q.options, o => `
      <button class="dx-opt" type="button" data-value="${attr(String(o.v))}" aria-pressed="false">
        <span class="mark" aria-hidden="true"></span>
        <span>${esc(o.label)}</span>
      </button>`)}
    </div>
    <div class="dx-nav">
      ${i > 0 ? '<button class="dx-back" type="button" data-back>← Quay lại</button>' : ''}
      ${btn({ label: i === questions.length - 1 ? 'Xem kết quả' : 'Tiếp tục', attrs: 'type="button" data-next disabled' })}
    </div>
  </div>`;
}

export function diagnosticPage() {
  const body = `
<section class="hero" style="padding-block:clamp(118px,14vh,158px) clamp(30px,4vw,44px)">
  <div class="hero-aurora" aria-hidden="true"></div>
  <div class="wrap wrap-narrow" style="text-align:center">
    <p class="eyebrow" style="justify-content:center"><span class="spark" aria-hidden="true"></span>Công cụ chẩn đoán</p>
    <h1 style="font-size:clamp(32px,5vw,58px)">Hệ thống của bạn đang <span class="gold-text">rò rỉ ở tầng nào</span>?</h1>
    <p class="lead" style="margin:22px auto 0">Mười một câu hỏi. Kết quả tức thì: bảng điểm năm tầng A.U.R.I.X, ước tính số tiền đang thất thoát mỗi tháng, và thứ tự việc cần làm. Không cần để lại thông tin để xem kết quả.</p>
  </div>
</section>

<section style="padding-top:0">
  <div class="wrap" style="max-width:920px">
    <div class="dx" id="dx">
      <div class="dx-head">
        <span class="n"><b id="dxCur">1</b> / ${questions.length}</span>
        <div class="dx-track" role="progressbar" aria-valuemin="0" aria-valuemax="${questions.length}" aria-valuenow="1" aria-label="Tiến trình chẩn đoán">
          <div class="dx-fill" id="dxFill"></div>
        </div>
      </div>

      <div class="dx-body">
        <div id="dxSteps">
          ${map(questions, stepHtml)}
        </div>

        <div class="dx-calc" id="dxCalc">
          <div class="ring" aria-hidden="true"></div>
          <p>Đang đối chiếu câu trả lời của bạn với chuẩn ngành…</p>
        </div>

        <div class="dx-result" id="dxResult" role="region" aria-live="polite" aria-label="Kết quả chẩn đoán">
          <div class="dx-score">
            <div class="dx-dial">
              <svg viewBox="0 0 190 190" aria-hidden="true">
                <defs>
                  <linearGradient id="dxGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#F0D9A0"/>
                    <stop offset="50%" stop-color="#D4AF37"/>
                    <stop offset="100%" stop-color="#B8861F"/>
                  </linearGradient>
                </defs>
                <circle class="bg" cx="95" cy="95" r="85"/>
                <circle class="fg" id="dxArc" cx="95" cy="95" r="85"/>
              </svg>
              <div class="num"><b id="dxScore">0</b><span>Điểm hệ thống</span></div>
            </div>
            <div class="dx-verdict">
              <span class="dx-tier" id="dxTier">—</span>
              <h3 id="dxHeadline">—</h3>
              <p id="dxBody">—</p>
            </div>
          </div>

          <p class="eyebrow"><span class="spark" aria-hidden="true"></span>Bảng điểm năm tầng</p>
          <div class="dx-layers" id="dxLayers"></div>

          <div class="dx-leak" id="dxLeak">
            <div class="k">Ước tính thất thoát mỗi tháng</div>
            <div class="v" id="dxLeakVal">—</div>
            <p id="dxLeakNote">Con số này là ước tính dựa trên khoảng cách giữa hệ thống của bạn và chuẩn ngành, tính trên mức doanh thu bạn cung cấp. Nó không thay thế một buổi kiểm toán thực tế.</p>
          </div>

          <p class="eyebrow"><span class="spark" aria-hidden="true"></span>Nên làm gì, theo thứ tự</p>
          <div class="dx-recs" id="dxRecs"></div>

          <div class="dx-capture">
            <h3>Nhận bản báo cáo đầy đủ</h3>
            <p class="lead">Aurix sẽ gửi bản phân tích chi tiết cho ngành của bạn, kèm lộ trình xử lý từng tầng theo thứ tự ưu tiên. Nếu phù hợp, chúng tôi sẽ đề nghị một buổi chẩn đoán trực tiếp.</p>
            <form class="form-grid" id="dxForm" novalidate>
              <input type="text" class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
              <div class="field">
                <label for="dx-name">Họ và tên <span class="req">*</span></label>
                <input class="input" id="dx-name" name="name" type="text" required autocomplete="name" placeholder="Nguyễn Văn A">
                <span class="field-error">Vui lòng nhập họ tên.</span>
              </div>
              <div class="field">
                <label for="dx-phone">Số điện thoại <span class="req">*</span></label>
                <input class="input" id="dx-phone" name="phone" type="tel" required autocomplete="tel" inputmode="tel" placeholder="0901 234 567">
                <span class="field-error">Số điện thoại chưa hợp lệ.</span>
              </div>
              <div class="field full">
                <label for="dx-email">Email <span class="req">*</span></label>
                <input class="input" id="dx-email" name="email" type="email" required autocomplete="email" placeholder="ban@congty.vn">
                <span class="field-error">Email chưa hợp lệ.</span>
              </div>
              <div class="field full">
                <label for="dx-company">Doanh nghiệp</label>
                <input class="input" id="dx-company" name="company" type="text" autocomplete="organization" placeholder="Tên công ty">
              </div>
              <div class="field full">
                <div class="form-status" id="dxStatus" role="status" aria-live="polite"></div>
              </div>
              <div class="field full">
                ${btn({ label: 'Gửi báo cáo cho tôi', size: 'lg', attrs: 'type="submit" id="dxSubmit"' })}
                <p class="form-note" style="margin-top:12px">Aurix không gửi thư rác. Bạn có thể yêu cầu xoá dữ liệu bất cứ lúc nào.</p>
              </div>
            </form>
          </div>

          <p style="margin-top:28px;text-align:center">
            <button class="dx-back" type="button" id="dxRestart">↺ Làm lại bài chẩn đoán</button>
          </p>
        </div>
      </div>
    </div>

    <noscript>
      <div class="card" style="margin-top:24px">
        <h3 style="font-size:19px">Công cụ chẩn đoán cần JavaScript</h3>
        <p>Trình duyệt của bạn đang tắt JavaScript nên bài chẩn đoán không chạy được. Bạn vẫn có thể <a href="/lien-he/" style="color:var(--gold-300)">gửi yêu cầu tư vấn</a> và Aurix sẽ chẩn đoán trực tiếp cùng bạn.</p>
      </div>
    </noscript>
  </div>
</section>

<section>
  <div class="wrap">
    ${sectionHead({
      eyebrow: 'Cách bài chẩn đoán hoạt động',
      title: 'Không phải một bài trắc nghiệm cho vui',
      center: true,
      lead: 'Mỗi câu hỏi gắn với một tầng trong khung A.U.R.I.X và có trọng số riêng, dựa trên mức độ ảnh hưởng tới doanh thu mà Aurix quan sát được qua hơn một trăm dự án.'
    })}
    <div class="grid g-3">
      ${map([
        { t: 'Chấm điểm theo tầng', d: 'Câu trả lời được quy về điểm cho từng tầng Adapt, Unify, Reach, Ignite, Xpand — chứ không gộp thành một con số mơ hồ.' },
        { t: 'Phạt tầng yếu nhất', d: 'Một hệ thống mạnh bằng mắt xích yếu nhất của nó, nên điểm tổng bị kéo xuống theo tầng kém nhất chứ không lấy trung bình đơn thuần.' },
        { t: 'Quy ra tiền', d: 'Khoảng cách giữa bạn và chuẩn ngành được nhân với doanh thu để ước tính mức thất thoát mỗi tháng. Đó là con số đáng để hành động.' }
      ], (c, i) => `
      <article class="card" data-reveal style="--delay:${i * 80}ms">
        <h3 style="font-size:19px">${esc(c.t)}</h3>
        <p>${esc(c.d)}</p>
      </article>`)}
    </div>
  </div>
</section>`;

  return layout({
    url: '/chan-doan/',
    title: 'Chẩn đoán hệ thống tăng trưởng miễn phí | Aurix',
    description: 'Trả lời 11 câu hỏi để nhận ngay bảng điểm năm tầng A.U.R.I.X, ước tính số tiền hệ thống marketing của bạn đang thất thoát mỗi tháng và thứ tự việc cần làm.',
    breadcrumbs: [{ name: 'Trang chủ', url: '/' }, { name: 'Chẩn đoán', url: '/chan-doan/' }],
    extraCss: ['/css/diagnostic.css'],
    extraJs: ['/js/diagnostic.js'],
    schema: [{
      '@type': 'WebApplication',
      '@id': `${site.origin}/chan-doan/#app`,
      name: 'Chẩn đoán Hệ thống Tăng trưởng Aurix',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: `${site.origin}/chan-doan/`,
      provider: { '@id': `${site.origin}/#organization` },
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'VND' }
    }],
    body
  });
}
