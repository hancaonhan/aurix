import { attr, esc } from '../lib/ui.js';

/*
 * Máy tính "mỗi tháng đang để lọt bao nhiêu".
 *
 * Cố ý dùng phép tính khách tự kiểm được: chốt thêm 5 trong mỗi 100 khách hỏi
 * thì doanh thu tăng bao nhiêu. Không nhân hệ số bí ẩn, không hứa con số —
 * ban điều hành nhìn là hiểu, và tự thay số của mình vào.
 *
 * Số mặc định theo ngành là mức điển hình để thanh kéo bắt đầu ở chỗ hợp lý,
 * không phải số liệu khách hàng.
 */
export const CALC_DEFAULTS = {
  '':             { n: 150, c: 15, v: 5 },
  spa:            { n: 150, c: 15, v: 3 },
  'nha-khoa':     { n: 80,  c: 20, v: 15 },
  'giao-duc':     { n: 120, c: 25, v: 12 },
  fitness:        { n: 200, c: 15, v: 6 },
  'du-lich':      { n: 150, c: 8,  v: 20 },
  'bat-dong-san': { n: 60,  c: 5,  v: 80 }
};

/** Số điểm phần trăm tỉ lệ chốt dùng để minh hoạ. */
export const CALC_LIFT = 5;

const range = ({ id, label, min, max, step, value, unit }) => `
  <div class="calc-field">
    <div class="calc-label">
      <label for="${id}">${esc(label)}</label>
      <output for="${id}" id="${id}-out">${value}${esc(unit)}</output>
    </div>
    <input type="range" id="${id}" name="${id}" min="${min}" max="${max}" step="${step}" value="${value}" data-unit="${attr(unit)}">
  </div>`;

export function calcSection({ industry = '', industryLabel = '', bg = '' } = {}) {
  const d = CALC_DEFAULTS[industry] || CALC_DEFAULTS[''];
  return `
<section id="may-tinh" class="calc${bg ? ' ' + bg : ''}">
  <div class="wrap">
    <div class="calc-box" data-calc data-lift="${CALC_LIFT}" data-industry="${attr(industry)}">
      <div class="calc-inputs">
        <p class="eyebrow">Tự tính trong 10 giây</p>
        <h2>Mỗi tháng bạn đang để lọt bao nhiêu?</h2>
        <p class="calc-hint">Kéo theo số liệu thật của bạn.${industryLabel ? ` Số có sẵn là mức thường gặp ở ngành ${esc(industryLabel.toLowerCase())}.` : ''}</p>
        ${range({ id: 'calc-n', label: 'Khách hỏi mỗi tháng', min: 10, max: 1000, step: 10, value: d.n, unit: '' })}
        ${range({ id: 'calc-c', label: 'Tỉ lệ chốt hiện tại', min: 1, max: 60, step: 1, value: d.c, unit: '%' })}
        ${range({ id: 'calc-v', label: 'Giá trị trung bình mỗi khách', min: 1, max: 200, step: 1, value: d.v, unit: ' triệu' })}
      </div>

      <div class="calc-result" aria-live="polite">
        <p class="calc-now">Doanh thu từ khách hỏi hiện nay: <b id="calc-now">…</b>/tháng</p>
        <p class="calc-gain-label">Nếu chốt thêm ${CALC_LIFT} trong mỗi 100 khách hỏi</p>
        <p class="calc-gain"><b id="calc-gain">…</b><span>mỗi tháng</span></p>
        <p class="calc-year">Tương đương <b id="calc-year">…</b> mỗi năm, không tăng ngân sách quảng cáo.</p>

        <form class="calc-form" id="calcForm" novalidate>
          <p class="calc-form-title">Nhận cách tăng tỉ lệ chốt cho doanh nghiệp bạn</p>
          <input type="text" class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
          <div class="field">
            <label class="sr-only" for="calc-name">Họ và tên</label>
            <input class="input" id="calc-name" name="name" type="text" required autocomplete="name" placeholder="Họ và tên">
            <span class="field-error">Vui lòng nhập họ tên.</span>
          </div>
          <div class="field">
            <label class="sr-only" for="calc-phone">Số điện thoại hoặc Zalo</label>
            <input class="input" id="calc-phone" name="phone" type="tel" required autocomplete="tel" inputmode="tel" placeholder="Số điện thoại / Zalo">
            <span class="field-error">Số điện thoại chưa hợp lệ.</span>
          </div>
          <button class="btn btn-primary" type="submit" id="calc-submit">Gửi cho tôi</button>
          <div class="form-status" id="calc-status" role="status" aria-live="polite"></div>
          <p class="calc-note">Aurix gọi lại trong giờ làm việc. Không gửi quảng cáo.</p>
        </form>
      </div>
    </div>
  </div>
</section>`;
}
