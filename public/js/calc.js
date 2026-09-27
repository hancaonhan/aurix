/* Máy tính "mỗi tháng đang để lọt bao nhiêu" — xem site/pages/calc.js */
import { wireForm } from './form.js';
import { track } from './track.js';

const box = document.querySelector('[data-calc]');
if (box) init(box);

/** 1.234,5 triệu → "1,23 tỷ"; dưới 1.000 triệu giữ đơn vị triệu. */
function money(millions) {
  const nf = (n, d) => new Intl.NumberFormat('vi-VN', { maximumFractionDigits: d }).format(n);
  if (millions >= 1000) return `${nf(millions / 1000, 2)} tỷ`;
  return `${nf(millions, millions < 10 ? 1 : 0)} triệu`;
}

function init(box) {
  const lift = Number(box.dataset.lift) || 5;
  const inputs = ['calc-n', 'calc-c', 'calc-v'].map(id => document.getElementById(id));
  const out = id => document.getElementById(id);
  let last = null;

  function update() {
    for (const i of inputs) out(`${i.id}-out`).textContent = `${new Intl.NumberFormat('vi-VN').format(i.value)}${i.dataset.unit}`;
    const [n, c, v] = inputs.map(i => Number(i.value));
    const now = n * (c / 100) * v;
    // Không cho tỉ lệ chốt vượt 100%
    const gain = n * (Math.min(lift, 100 - c) / 100) * v;
    out('calc-now').textContent = money(now);
    out('calc-gain').textContent = `+${money(gain)}`;
    out('calc-year').textContent = money(gain * 12);
    last = { n, c, v, now, gain };
  }

  for (const i of inputs) {
    i.addEventListener('input', () => { update(); track('calc_use', { once: true }); });
  }
  update();

  wireForm({
    formId: 'calcForm',
    statusId: 'calc-status',
    submitId: 'calc-submit',
    endpoint: '/api/lead',
    extra: () => ({
      source: 'calculator',
      industry: box.dataset.industry || '',
      message: last
        ? `Máy tính: ${last.n} khách hỏi/tháng, chốt ${last.c}%, ${last.v} triệu/khách. `
          + `Doanh thu hiện ${money(last.now)}/tháng; chốt thêm ${lift}/100 khách = +${money(last.gain)}/tháng.`
        : ''
    })
  });
}
