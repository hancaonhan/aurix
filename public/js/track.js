/* Đo phễu chuyển đổi.
 *
 * Mỗi sự kiện chỉ gửi hai thứ: loại sự kiện và đường dẫn trang. Không cookie,
 * không mã người dùng, không gửi gì khác — máy chủ chỉ cộng bộ đếm theo ngày.
 * Dùng sendBeacon để sự kiện vẫn tới nơi khi người dùng bấm liên kết rời trang.
 */

const sent = new Set();

/** Gửi một sự kiện. `once` = chỉ gửi lần đầu trên trang này. */
export function track(kind, { once = false } = {}) {
  if (once) {
    if (sent.has(kind)) return;
    sent.add(kind);
  }
  const body = JSON.stringify({ k: kind, p: location.pathname });
  try {
    if (navigator.sendBeacon?.('/api/track', new Blob([body], { type: 'application/json' }))) return;
  } catch { /* rơi xuống fetch */ }
  fetch('/api/track', {
    method: 'POST', body, keepalive: true,
    headers: { 'Content-Type': 'application/json' }
  }).catch(() => {});
}

/** Gắn các sự kiện chung cho mọi trang. Gọi một lần từ aurix.js. */
export function initTracking() {
  track('view', { once: true });

  document.addEventListener('click', e => {
    const a = e.target.closest?.('a[href], button');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    if (href.startsWith('tel:')) return track('call');
    if (href.includes('zalo.me')) return track('zalo');
    // Nút kêu gọi: mọi nút chính, và mọi liên kết dẫn tới bài chẩn đoán hay trang liên hệ
    if (a.matches('.btn-primary, .svc-cta') || /^\/(chan-doan|lien-he)\//.test(href)) track('cta');
  }, { capture: true });

  // Bắt đầu điền form: lần đầu con trỏ vào một ô nhập bất kỳ trong form
  document.addEventListener('focusin', e => {
    if (e.target.matches?.('form input:not([type=hidden]):not(.hp), form textarea, form select')) {
      track('form_start', { once: true });
    }
  });
}
