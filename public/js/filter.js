/* Lọc lưới theo thuộc tính — dùng cho trang Dự án.
   Trang Kiến thức có bộ lọc riêng ở /js/kien-thuc.js vì còn thêm ô tìm kiếm.
   Cập nhật URL để chia sẻ được, không tải lại trang. */

const GRIDS = [
  { grid: '#projGrid', attr: 'industryKey', empty: '#projEmpty', param: 'nganh' }
];

for (const cfg of GRIDS) {
  const grid = document.querySelector(cfg.grid);
  if (!grid) continue;

  const chips = [...document.querySelectorAll('[data-filter]')];
  const cards = [...grid.querySelectorAll(`[data-${cfg.attr.replace(/[A-Z]/g, c => '-' + c.toLowerCase())}]`)];
  const empty = cfg.empty ? document.querySelector(cfg.empty) : null;
  if (!chips.length || !cards.length) continue;

  const apply = (key, push) => {
    let shown = 0;
    for (const card of cards) {
      const match = !key || card.dataset[cfg.attr] === key;
      card.hidden = !match;
      if (match) shown++;
    }
    if (empty) empty.style.display = shown ? 'none' : 'block';
    for (const c of chips) c.setAttribute('aria-pressed', String(c.dataset.filter === key));

    if (push) {
      const url = new URL(location.href);
      if (key) url.searchParams.set(cfg.param, key);
      else url.searchParams.delete(cfg.param);
      history.replaceState(null, '', url);
    }
  };

  for (const chip of chips) {
    chip.addEventListener('click', () => apply(chip.dataset.filter, true));
  }

  const initial = new URLSearchParams(location.search).get(cfg.param) || '';
  if (initial && chips.some(c => c.dataset.filter === initial)) apply(initial, false);
}
