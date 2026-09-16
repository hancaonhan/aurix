/* Công cụ Chẩn đoán Hệ thống Tăng trưởng — điều khiển luồng câu hỏi và hiển thị kết quả */
import { wireForm, setStatus } from './form.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

const root = $('#dx');
if (root) init();

function init() {
  const steps = $$('.dx-step', root);
  const total = steps.length;
  const fill = $('#dxFill');
  const cur = $('#dxCur');
  const track = $('.dx-track', root);
  const answers = {};
  let idx = 0;
  let result = null;

  const progress = () => {
    const pct = ((idx + 1) / total) * 100;
    fill.style.width = `${pct}%`;
    cur.textContent = String(idx + 1);
    track.setAttribute('aria-valuenow', String(idx + 1));
  };

  const show = n => {
    steps[idx].classList.remove('is-on');
    idx = n;
    steps[idx].classList.add('is-on');
    progress();
    // Đưa câu hỏi vào tầm nhìn mà không giật trang
    const top = root.getBoundingClientRect().top + scrollY - 96;
    scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
    steps[idx].querySelector('.dx-q')?.focus?.();
  };

  for (const [i, step] of steps.entries()) {
    const qid = step.dataset.qid;
    const next = $('[data-next]', step);
    const back = $('[data-back]', step);

    for (const opt of $$('.dx-opt', step)) {
      opt.addEventListener('click', () => {
        for (const o of $$('.dx-opt', step)) o.setAttribute('aria-pressed', 'false');
        opt.setAttribute('aria-pressed', 'true');
        answers[qid] = opt.dataset.value;
        next.removeAttribute('disabled');
        // Tự sang câu kế tiếp sau một nhịp ngắn, trừ câu cuối
        if (i < total - 1) setTimeout(() => show(i + 1), reduced ? 0 : 320);
      });
    }

    next.addEventListener('click', () => {
      if (answers[qid] === undefined) return;
      if (i < total - 1) show(i + 1);
      else submit();
    });

    back?.addEventListener('click', () => show(Math.max(0, i - 1)));
  }

  progress();

  async function submit() {
    $('#dxSteps').style.display = 'none';
    $('#dxCalc').classList.add('is-on');

    let data;
    try {
      const res = await fetch('/api/diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });
      data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'lỗi');
    } catch {
      $('#dxCalc').classList.remove('is-on');
      $('#dxSteps').style.display = '';
      const last = steps[total - 1];
      let err = $('.form-status', last);
      if (!err) {
        err = document.createElement('div');
        err.className = 'form-status';
        err.setAttribute('role', 'status');
        last.append(err);
      }
      setStatus(err, 'err', 'Không tính được kết quả lúc này. Vui lòng thử lại sau giây lát.');
      return;
    }

    result = data.result;
    // Giữ trạng thái "đang tính" một nhịp để kết quả có trọng lượng
    setTimeout(() => {
      $('#dxCalc').classList.remove('is-on');
      render(result);
      $('#dxResult').classList.add('is-on');
      const top = root.getBoundingClientRect().top + scrollY - 96;
      scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
    }, reduced ? 0 : 900);
  }

  function render(r) {
    // Vòng điểm. Giá trị cuối được đặt ngay, chuyển tiếp do CSS lo — nếu khung
    // hình bị treo (tab ẩn, chuyển động bị tắt) người dùng vẫn thấy đúng số.
    const arc = $('#dxArc');
    const C = 2 * Math.PI * 85;
    arc.style.strokeDasharray = String(C);
    arc.style.strokeDashoffset = String(C);
    void arc.getBoundingClientRect();          // ép tính lại bố cục để CSS bắt được thay đổi
    arc.style.strokeDashoffset = String(C * (1 - r.overall / 100));

    // Đếm điểm — đặt số đúng trước, rồi mới chạy hiệu ứng đè lên
    const scoreEl = $('#dxScore');
    scoreEl.textContent = String(r.overall);
    if (!reduced && r.overall > 0) {
      const t0 = performance.now();
      const tick = now => {
        const p = Math.min(1, (now - t0) / 1500);
        scoreEl.textContent = String(Math.round(r.overall * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
        else scoreEl.textContent = String(r.overall);
      };
      requestAnimationFrame(tick);
    }

    $('#dxTier').textContent = r.tier.label;
    $('#dxHeadline').textContent = r.tier.headline;
    $('#dxBody').textContent = r.tier.body;

    // Bảng điểm từng tầng
    $('#dxLayers').innerHTML = r.layers.map(l => `
      <div class="dx-layer" data-state="${l.state}">
        <span class="lt" aria-hidden="true">${l.letter}</span>
        <div>
          <div class="ln">${escapeHtml(l.name)}</div>
          <div class="lbar"><i data-w="${l.score}"></i></div>
        </div>
        <div class="lv">${l.score}/100</div>
      </div>`).join('');
    void $('#dxLayers').getBoundingClientRect();
    for (const bar of $$('#dxLayers .lbar i')) bar.style.width = `${bar.dataset.w}%`;

    // Ước tính thất thoát
    if (r.leak.monthlyMillions > 0) {
      $('#dxLeakVal').textContent = `~ ${r.leak.display} / tháng`;
      $('#dxLeakNote').textContent =
        `Tương đương khoảng ${r.leak.yearlyDisplay} mỗi năm. Con số này là ước tính dựa trên khoảng cách giữa hệ thống của bạn và chuẩn ngành, tính trên mức doanh thu bạn cung cấp. Nó không thay thế một buổi kiểm toán thực tế.`;
    } else {
      $('#dxLeak').style.display = 'none';
    }

    // Khuyến nghị
    $('#dxRecs').innerHTML = r.recommendations.map(rec => `
      <article class="dx-rec">
        <span class="i" aria-hidden="true"><span class="spark"></span></span>
        <div>
          <h4>${rec.priority}. ${escapeHtml(rec.title)}</h4>
          <p>${escapeHtml(rec.body)}</p>
          <p style="margin-top:10px"><a href="${rec.service}">Dịch vụ liên quan: ${escapeHtml(rec.serviceName)} →</a></p>
        </div>
      </article>`).join('');
  }

  // Gửi thông tin để nhận báo cáo đầy đủ
  wireForm({
    formId: 'dxForm',
    statusId: 'dxStatus',
    submitId: 'dxSubmit',
    endpoint: '/api/lead',
    extra: () => ({
      source: 'diagnostic',
      industry: answers.industry || '',
      diagnostic: { answers, score: result?.overall ?? null, tier: result?.tier?.key ?? null }
    })
  });

  $('#dxRestart')?.addEventListener('click', () => { location.reload(); });
}

function escapeHtml(s = '') {
  return String(s).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}
