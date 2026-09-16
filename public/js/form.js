/* Xác thực và gửi biểu mẫu — dùng chung cho trang liên hệ và form trong bài chẩn đoán */

const VN_PHONE = /^(?:\+?84|0)(?:3|5|7|8|9)\d{8}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateField(input) {
  const field = input.closest('.field');
  const v = input.value.trim();
  let ok = true;

  if (input.hasAttribute('required') && !v) ok = false;
  else if (input.type === 'email' && v && !EMAIL.test(v)) ok = false;
  else if (input.type === 'tel' && v && !VN_PHONE.test(v.replace(/[\s.\-()]/g, ''))) ok = false;

  if (field) field.classList.toggle('has-error', !ok);
  input.setAttribute('aria-invalid', String(!ok));

  // Nối ô nhập với dòng báo lỗi, nếu không trình đọc màn hình chỉ báo "không hợp lệ"
  // mà không đọc được lý do.
  const msg = field?.querySelector('.field-error');
  if (msg) {
    if (!msg.id) msg.id = `${input.id || input.name}-loi`;
    if (ok) input.removeAttribute('aria-describedby');
    else input.setAttribute('aria-describedby', msg.id);
  }
  return ok;
}

export function validateForm(form) {
  let ok = true;
  let firstBad = null;
  for (const input of form.querySelectorAll('input[required], input[type=email], input[type=tel]')) {
    if (!validateField(input)) { ok = false; firstBad ||= input; }
  }
  firstBad?.focus();
  return ok;
}

export function readForm(form) {
  const data = {};
  for (const [k, v] of new FormData(form).entries()) data[k] = typeof v === 'string' ? v.trim() : v;
  return data;
}

export function setStatus(el, kind, msg) {
  if (!el) return;
  el.className = `form-status ${kind}`;
  el.textContent = msg;
}

/**
 * Gắn hành vi gửi cho một biểu mẫu.
 * @param {object} o
 * @param {string} o.formId
 * @param {string} o.statusId
 * @param {string} o.submitId
 * @param {string} o.endpoint
 * @param {() => object} [o.extra]  dữ liệu bổ sung gửi kèm
 * @param {(res:object) => void} [o.onSuccess]
 */
export function wireForm({ formId, statusId, submitId, endpoint, extra, onSuccess }) {
  const form = document.getElementById(formId);
  if (!form) return;
  const status = document.getElementById(statusId);
  const submit = document.getElementById(submitId);

  // Xoá lỗi ngay khi người dùng sửa
  form.addEventListener('input', e => {
    const f = e.target.closest?.('.field');
    if (f?.classList.contains('has-error')) validateField(e.target);
  });
  form.addEventListener('blur', e => {
    if (e.target.matches?.('input')) validateField(e.target);
  }, true);

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateForm(form)) {
      setStatus(status, 'err', 'Vui lòng kiểm tra lại các trường được đánh dấu.');
      return;
    }

    const payload = {
      ...readForm(form),
      ...(extra ? extra() : {}),
      page: location.pathname,
      referrer: document.referrer || '',
      utm: Object.fromEntries(
        [...new URLSearchParams(location.search)].filter(([k]) => k.startsWith('utm_') || k === 'nganh')
      )
    };

    submit?.setAttribute('aria-busy', 'true');
    setStatus(status, 'ok', 'Đang gửi…');

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json.ok) {
        setStatus(status, 'err', json.error || 'Không gửi được. Vui lòng thử lại hoặc gọi trực tiếp cho chúng tôi.');
        return;
      }

      setStatus(status, 'ok', json.message || 'Đã nhận. Aurix sẽ liên hệ trong một ngày làm việc.');
      form.reset();
      onSuccess?.(json);
    } catch {
      setStatus(status, 'err', 'Mất kết nối. Vui lòng thử lại hoặc gọi trực tiếp cho chúng tôi.');
    } finally {
      submit?.removeAttribute('aria-busy');
    }
  });
}

// Tự gắn cho biểu mẫu liên hệ nếu có trên trang
wireForm({
  formId: 'contactForm',
  statusId: 'cf-status',
  submitId: 'cf-submit',
  endpoint: '/api/lead',
  extra: () => ({ source: 'contact' }),
  onSuccess: () => { setTimeout(() => { location.href = '/cam-on/'; }, 900); }
});
