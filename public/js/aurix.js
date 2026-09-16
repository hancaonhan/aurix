/* ==========================================================================
   AURIX — Lớp tương tác lõi
   Không phụ thuộc thư viện ngoài. Mọi hiệu ứng đều tôn trọng prefers-reduced-motion.
   ========================================================================== */

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------- 1. Thanh điều hướng ---------- */
function initHeader() {
  const header = $('#siteHeader');
  const toggle = $('#navToggle');
  const links = $('#navLinks');
  if (!header) return;

  const onScroll = () => header.classList.toggle('is-stuck', scrollY > 24);
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.setAttribute('aria-label', open ? 'Mở menu' : 'Đóng menu');
      links.classList.toggle('is-open', !open);
    });
    // Đóng menu khi chọn một liên kết
    links.addEventListener('click', e => {
      if (e.target.closest('a')) {
        toggle.setAttribute('aria-expanded', 'false');
        links.classList.remove('is-open');
      }
    });
    addEventListener('keydown', e => {
      if (e.key === 'Escape' && links.classList.contains('is-open')) {
        toggle.setAttribute('aria-expanded', 'false');
        links.classList.remove('is-open');
        toggle.focus();
      }
    });
  }
}

/* ---------- 2. Thanh tiến trình đọc ---------- */
function initProgress() {
  const bar = $('#progress');
  if (!bar || reduced) return;
  let ticking = false;
  const update = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    ticking = false;
  };
  addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
}

/* ---------- 3. Hiệu ứng xuất hiện khi cuộn ---------- */
function initReveal() {
  const items = $$('[data-reveal]');
  if (!items.length) return;
  if (reduced || !('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver((entries, obs) => {
    for (const en of entries) {
      if (en.isIntersecting) { en.target.classList.add('is-in'); obs.unobserve(en.target); }
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  items.forEach(el => io.observe(el));
}

/* ---------- 4. Đếm số ---------- */
function initCounters() {
  const els = $$('[data-count]');
  if (!els.length) return;
  const run = el => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const dec = parseInt(el.dataset.decimals || '0', 10);
    const final = target.toFixed(dec).replace('.', ',') + suffix;
    // Đặt giá trị cuối trước: nếu khung hình bị treo, con số vẫn đúng
    el.textContent = final;
    if (reduced) return;
    const dur = 1600;
    const t0 = performance.now();
    const tick = now => {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(dec).replace('.', ',') + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = final;
    };
    requestAnimationFrame(tick);
  };
  if (!('IntersectionObserver' in window)) { els.forEach(run); return; }
  const io = new IntersectionObserver((entries, obs) => {
    for (const en of entries) if (en.isIntersecting) { run(en.target); obs.unobserve(en.target); }
  }, { threshold: 0.5 });
  els.forEach(el => io.observe(el));
}

/* ---------- 5. Câu hỏi thường gặp ---------- */
function initFaq() {
  for (const btn of $$('.faq-q')) {
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      // Đóng các mục khác trong cùng nhóm
      const group = btn.closest('.faq-list');
      if (group && !open) {
        for (const other of $$('.faq-q[aria-expanded="true"]', group)) {
          other.setAttribute('aria-expanded', 'false');
        }
      }
      btn.setAttribute('aria-expanded', String(!open));
    });
  }
}

/* ---------- 6. Hào quang vàng theo con trỏ trên thẻ ---------- */
function initCardGlow() {
  if (reduced || matchMedia('(hover: none)').matches) return;
  const cards = $$('.card');
  for (const card of cards) {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  }
}

/* ---------- 7. Thanh hành động nổi trên di động ---------- */
function initMobileBar() {
  const bar = $('#mobileBar');
  if (!bar) return;
  const onScroll = () => bar.classList.toggle('is-on', scrollY > innerHeight * 0.6);
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });
}

/* ==========================================================================
   8. LỚP CÁ NHÂN HOÁ — bản demo sống của dịch vụ "Web Cá nhân hoá"
   ========================================================================== */

const PKEY = 'aurix.industry';

function readContext() {
  const p = new URLSearchParams(location.search);
  // Ưu tiên: tham số URL → lựa chọn đã lưu → suy đoán từ nguồn giới thiệu
  return p.get('nganh') || p.get('industry') || localStorage.getItem(PKEY) || '';
}

async function applyPersonalization(key, { save = false, announce = false } = {}) {
  const badge = $('#ctxLabel');
  const line = $('#heroLine');
  const sub = $('#heroSub');
  if (!line) return;                       // không phải trang chủ

  // Cập nhật trạng thái nút chọn
  for (const chip of $$('[data-industry]')) {
    chip.setAttribute('aria-pressed', String(chip.dataset.industry === key));
  }

  if (!key) {
    if (badge) badge.textContent = $('#ctxBadge').dataset.default;
    line.innerHTML = line.dataset.default;
    sub.textContent = sub.dataset.default;
    if (save) localStorage.removeItem(PKEY);
    return;
  }

  let data;
  try {
    const res = await fetch(`/api/personalize?nganh=${encodeURIComponent(key)}`, {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error('bad status');
    data = await res.json();
  } catch {
    return;  // lỗi mạng thì giữ nguyên nội dung mặc định
  }
  if (!data || !data.ok) return;

  const v = data.variant;
  if (badge) badge.textContent = `Aurix cho ngành ${v.label}`;
  line.innerHTML = v.heroLine;
  sub.textContent = v.heroSub;

  const fv = $('#floatVal1'), fl = $('#floatLbl1');
  if (fv && v.proof) { fv.textContent = v.proof.value; fl.textContent = v.proof.label; }

  if (save) localStorage.setItem(PKEY, key);
  if (announce) {
    line.animate?.(
      [{ opacity: 0.35, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }],
      { duration: reduced ? 1 : 450, easing: 'cubic-bezier(.22,1,.36,1)' }
    );
  }
}

function initPersonalization() {
  const chips = $$('[data-industry]');
  if (!chips.length) return;

  const initial = readContext();
  if (initial) applyPersonalization(initial, { save: false });

  for (const chip of chips) {
    chip.addEventListener('click', () => {
      applyPersonalization(chip.dataset.industry, { save: true, announce: true });
    });
  }
}


/* ---------- Tham số site lấy từ máy chủ ----------
   Số điện thoại và băng-rôn khuyến mãi được đội ngũ sửa trong bảng điều khiển,
   không phải sửa mã rồi dựng lại trang. Trang vẫn hiển thị đầy đủ và đúng khi
   lời gọi này thất bại: giá trị trong HTML tĩnh là giá trị mặc định, phần dưới
   đây chỉ chồng lên khi có gì đó thực sự khác. */
async function initSiteSettings() {
  let site;
  try {
    const res = await fetch('/api/site', { headers: { Accept: 'application/json' } });
    if (!res.ok) return;
    ({ site } = await res.json());
  } catch {
    return;  // lỗi mạng thì giữ nguyên nội dung tĩnh
  }
  if (!site) return;

  // Số điện thoại — cập nhật cả nhãn hiển thị lẫn liên kết gọi
  if (site.contact?.phone) {
    const digits = site.contact.phone.replace(/[^0-9+]/g, '');
    for (const a of $$('a[href^="tel:"]')) {
      a.href = 'tel:' + (digits.startsWith('+') ? digits : '+84' + digits.replace(/^0/, ''));
      if (a.dataset.phoneLabel !== undefined || /^[0-9\s.+()-]+$/.test(a.textContent.trim())) {
        a.textContent = site.contact.phone;
      }
    }
  }
  if (site.contact?.zalo) for (const a of $$('a[href*="zalo.me"]')) a.href = site.contact.zalo;

  // Băng-rôn thông báo — chỉ dựng khi thực sự có chương trình đang chạy
  if (site.banner?.text && !$('#siteBanner')) {
    const el = document.createElement('a');
    el.id = 'siteBanner';
    el.href = site.banner.href || '/lien-he/';
    el.textContent = site.banner.text;
    el.setAttribute('role', 'note');
    el.style.cssText = 'display:block;padding:9px 20px;text-align:center;font-size:13.5px;' +
      'background:linear-gradient(135deg,#F0D9A0,#D4AF37,#B8861F);color:#1A1204;' +
      'font-weight:600;text-decoration:none;position:relative;z-index:60';
    document.body.prepend(el);
  }
}

/* ---------- Khởi động ---------- */
function boot() {
  initHeader();
  initProgress();
  initReveal();
  initCounters();
  initFaq();
  initCardGlow();
  initMobileBar();
  initPersonalization();
  initSiteSettings();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}

export { $, $$, reduced };
