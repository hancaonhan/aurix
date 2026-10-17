/**
 * Quên mật khẩu / đặt mật khẩu mới — chạy trên trình duyệt.
 * Mã đặt lại nằm sau dấu # của link trong thư: #t=<mã>
 */
const body = document.getElementById('resetBody');
const form = document.getElementById('resetForm');
const token = new URLSearchParams(location.hash.slice(1)).get('t');

const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function post(path, data) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(data)
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.ok === false) throw new Error(json.error || 'Có lỗi xảy ra. Vui lòng thử lại.');
  return json;
}

function done(html) {
  body.innerHTML = `<p style="text-align:center;margin:8px 0 18px">${html}</p>
    <a class="btn primary" href="/bang-dieu-khien">Về trang đăng nhập</a>`;
}

function showError(msg) {
  let el = body.querySelector('.err');
  if (!el) { el = document.createElement('div'); el.className = 'err'; body.prepend(el); }
  el.textContent = msg;
}

if (token) {
  // Bước 2: đặt mật khẩu mới. Xoá mã khỏi thanh địa chỉ để không lộ khi chụp màn hình.
  history.replaceState(null, '', location.pathname);
  body.innerHTML = `
    <p class="muted" style="text-align:center;margin:0 0 18px">Chọn mật khẩu mới, ít nhất 12 ký tự.</p>
    <div class="field">
      <label for="pw1">Mật khẩu mới</label>
      <input id="pw1" type="password" autocomplete="new-password" minlength="12" required autofocus>
    </div>
    <div class="field">
      <label for="pw2">Nhập lại mật khẩu mới</label>
      <input id="pw2" type="password" autocomplete="new-password" minlength="12" required>
    </div>
    <button class="btn primary" type="submit">Lưu mật khẩu</button>`;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const pw1 = form.querySelector('#pw1').value;
    const pw2 = form.querySelector('#pw2').value;
    if (pw1 !== pw2) return showError('Hai lần nhập mật khẩu chưa khớp.');
    const btn = form.querySelector('button');
    btn.disabled = true; btn.textContent = 'Đang lưu…';
    try {
      const r = await post('/api/auth/reset', { token, password: pw1 });
      done(esc(r.message));
    } catch (err) {
      showError(err.message);
      btn.disabled = false; btn.textContent = 'Lưu mật khẩu';
    }
  });
} else {
  // Bước 1: nhập email để nhận link
  body.innerHTML = `
    <p class="muted" style="text-align:center;margin:0 0 18px">Nhập email tài khoản. Aurix gửi link đặt lại mật khẩu vào hộp thư đó.</p>
    <div class="field">
      <label for="email">Email</label>
      <input id="email" type="email" autocomplete="username" required autofocus>
    </div>
    <button class="btn primary" type="submit">Gửi link đặt lại</button>
    <p style="text-align:center;margin:16px 0 0"><a href="/bang-dieu-khien">Quay lại đăng nhập</a></p>`;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button');
    btn.disabled = true; btn.textContent = 'Đang gửi…';
    try {
      const r = await post('/api/auth/forgot', { email: form.querySelector('#email').value });
      done(esc(r.message));
    } catch (err) {
      showError(err.message);
      btn.disabled = false; btn.textContent = 'Gửi link đặt lại';
    }
  });
}
