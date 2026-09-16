/* Trang Kiến thức — lọc theo chủ đề và tìm theo từ khoá.
   Chạy hoàn toàn phía trình duyệt trên lưới đã được dựng sẵn, nên không có
   trạng thái chờ. URL được cập nhật để chia sẻ được, không tải lại trang. */

const grid = document.getElementById('artGrid');
if (grid) {
  // Bài mở đầu nằm ngoài lưới nhưng vẫn thuộc phạm vi lọc, để số đếm trên
  // thanh chủ đề luôn khớp với số thẻ hiện ra.
  const feature = document.getElementById('artFeature');
  const cards = [feature, ...grid.querySelectorAll('[data-topic]')].filter(Boolean);
  const chips = [...document.querySelectorAll('[data-topic-filter]')];
  const search = document.getElementById('kbSearch');
  const empty = document.getElementById('artEmpty');
  const note = document.getElementById('kbTopicNote');

  const norm = s => s
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .trim();

  let topic = '';
  let term = '';

  /* Khớp hai vòng: ưu tiên đúng cả dấu, chỉ bỏ dấu khi vòng đầu không ra gì.
     Nhờ vậy gõ "CAC" không khớp nhầm với chữ "các", mà gõ không dấu vẫn tìm được. */
  function matches(card, exact, loose) {
    const raw = (card.dataset.search || '').toLowerCase();
    return exact ? raw.includes(exact) : norm(raw).includes(loose);
  }

  function apply(push) {
    const inTopic = cards.filter(c => !topic || c.dataset.topic === topic);
    const raw = term.trim().toLowerCase();
    const loose = norm(term);

    let hits = inTopic;
    if (raw) {
      hits = inTopic.filter(c => matches(c, raw, ''));
      if (!hits.length) hits = inTopic.filter(c => matches(c, '', loose));
    }

    const keep = new Set(hits);
    let shown = 0;
    for (const card of cards) {
      const match = keep.has(card);
      card.hidden = !match;
      if (match) shown++;
    }

    if (empty) empty.style.display = shown ? 'none' : 'block';

    for (const c of chips) {
      c.setAttribute('aria-pressed', String(c.dataset.topicFilter === topic));
    }

    if (note) {
      const chip = chips.find(c => c.dataset.topicFilter === topic);
      const text = topic && chip ? chip.dataset.note : '';
      note.textContent = text || '';
      note.hidden = !text;
    }

    if (push) {
      const url = new URL(location.href);
      topic ? url.searchParams.set('chu-de', topic) : url.searchParams.delete('chu-de');
      term ? url.searchParams.set('tim', term) : url.searchParams.delete('tim');
      history.replaceState(null, '', url);
    }
  }

  for (const chip of chips) {
    chip.addEventListener('click', () => {
      // Bấm lại chủ đề đang chọn thì bỏ lọc
      topic = chip.dataset.topicFilter === topic ? '' : chip.dataset.topicFilter;
      apply(true);
    });
  }

  if (search) {
    let timer;
    search.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => { term = search.value; apply(true); }, 120);
    });
    search.addEventListener('keydown', e => {
      if (e.key === 'Escape') { search.value = ''; term = ''; apply(true); }
    });
  }

  // Khôi phục trạng thái từ URL
  const params = new URLSearchParams(location.search);
  const t0 = params.get('chu-de') || '';
  const q0 = params.get('tim') || '';
  if (chips.some(c => c.dataset.topicFilter === t0)) topic = t0;
  if (q0 && search) { term = q0; search.value = q0; }
  if (topic || term) apply(false);
}
