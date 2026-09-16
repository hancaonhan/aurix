/**
 * Bảng điều khiển Aurix — ứng dụng phía trình duyệt.
 *
 * Viết bằng JavaScript thuần, không khung nào, không bước dựng: tệp này được
 * phục vụ nguyên trạng. Cùng triết lý với phần còn lại của dự án — không phụ
 * thuộc gói ngoài, sửa là thấy ngay.
 *
 * Về bảo mật phía trình duyệt:
 *   - Mọi văn bản đến từ máy chủ đều đi qua `esc()` trước khi vào HTML.
 *   - Mã CSRF chỉ nằm trong bộ nhớ, không ghi vào localStorage — script lạ đọc
 *     được localStorage, còn biến trong module thì không.
 *   - Thanh điều hướng ẩn mục không có quyền, nhưng đó chỉ là phép lịch sự với
 *     người dùng: quyền thật do máy chủ quyết định ở mọi tuyến.
 */

const app = document.getElementById('app');
const toastBox = document.getElementById('toast');

const state = {
  user: null,
  csrf: null,
  view: 'tong-quan',
  data: {},
  busy: false
};

/* ==========================================================================
   Tiện ích
   ========================================================================== */
const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const money = n => n == null ? '—' : new Intl.NumberFormat('vi-VN').format(n);

const when = s => {
  if (!s) return '—';
  const d = new Date(String(s).replace(' ', 'T') + (String(s).endsWith('Z') ? '' : 'Z'));
  return Number.isNaN(d.getTime()) ? esc(s)
    : d.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
};

const can = p => state.user?.permissions?.includes(p);

function toast(message, kind = 'good') {
  const el = document.createElement('div');
  el.className = kind === 'bad' ? 'bad' : 'good';
  el.textContent = message;
  toastBox.append(el);
  setTimeout(() => el.remove(), kind === 'bad' ? 7000 : 4000);
}

/** Gọi API. Ném Error có `.code` để nơi gọi phân biệt được loại lỗi. */
async function api(path, { method = 'GET', body } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (state.csrf) headers['X-Aurix-CSRF'] = state.csrf;

  const res = await fetch(path, {
    method,
    headers,
    credentials: 'same-origin',
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  if (res.status === 401) {
    state.user = null; state.csrf = null;
    render();
    throw Object.assign(new Error('Phiên đã hết hạn.'), { code: 'AUTH_REQUIRED' });
  }

  const payload = await res.json().catch(() => ({}));
  if (!res.ok || payload.ok === false) {
    throw Object.assign(new Error(payload.error || 'Có lỗi xảy ra.'), { code: payload.code, status: res.status });
  }
  return payload;
}

/* ==========================================================================
   Màn hình đăng nhập
   ========================================================================== */
function loginView(errorMessage = '') {
  app.innerHTML = `
    <div class="login">
      <form id="loginForm" autocomplete="on">
        <div class="mark">Aurix</div>
        <p class="tag">Bảng điều khiển</p>
        ${errorMessage ? `<div class="err">${esc(errorMessage)}</div>` : ''}
        <div class="field">
          <label for="email">Email</label>
          <input id="email" name="email" type="email" autocomplete="username" required autofocus>
        </div>
        <div class="field">
          <label for="password">Mật khẩu</label>
          <input id="password" name="password" type="password" autocomplete="current-password" required>
        </div>
        <button class="btn primary" type="submit">Đăng nhập</button>
        <p class="muted" style="text-align:center;margin:18px 0 0">
          Truy cập được ghi lại trong nhật ký kiểm toán.
        </p>
      </form>
    </div>`;

  document.getElementById('loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const button = e.target.querySelector('button');
    button.disabled = true;
    button.textContent = 'Đang kiểm tra…';
    try {
      const r = await api('/api/auth/login', {
        method: 'POST',
        body: { email: e.target.email.value, password: e.target.password.value }
      });
      state.user = r.user;
      state.csrf = r.csrfToken;
      state.view = r.mustChangePassword ? 'tai-khoan' : 'tong-quan';
      if (r.mustChangePassword) toast('Bạn đang dùng mật khẩu tạm — hãy đổi ngay.', 'bad');
      render();
    } catch (error) {
      loginView(error.message);
    }
  });
}

/* ==========================================================================
   Khung ứng dụng
   ========================================================================== */
const NAV = [
  { key: 'tong-quan',  label: 'Tổng quan',        permission: 'stats.read' },
  { key: 'khach',      label: 'Khách tiềm năng',  permission: 'leads.read' },
  { key: 'noi-dung',   label: 'Nội dung website', permission: 'content.read' },
  { key: 'chan-doan',  label: 'Kết quả chẩn đoán', permission: 'diagnostics.read' },
  { key: 'thu',        label: 'Hàng đợi thư',     permission: 'mail.read' },
  { key: 'cau-hinh',   label: 'Cấu hình site',    permission: 'settings.read' },
  { key: 'nguoi-dung', label: 'Tài khoản',        permission: 'users.read' },
  { key: 'kiem-toan',  label: 'Nhật ký kiểm toán', permission: 'audit.read' },
  { key: 'he-thong',   label: 'Hệ thống',         permission: 'system.read' },
  { key: 'tai-khoan',  label: 'Của tôi',          permission: null }
];

function shell(inner) {
  const items = NAV.filter(n => !n.permission || can(n.permission));
  return `
  <div class="shell">
    <aside class="side">
      <div class="brand">
        <span class="mark">Aurix</span>
        <span class="sub">Bảng điều khiển</span>
      </div>
      <nav class="nav" aria-label="Điều hướng chính">
        ${items.map(n => `
          <button data-view="${n.key}" ${state.view === n.key ? 'aria-current="page"' : ''}>
            <span class="dot"></span>${esc(n.label)}
          </button>`).join('')}
      </nav>
      <div class="foot">
        <b>${esc(state.user.name)}</b>
        <span class="role">${esc(state.user.roleLabel)}</span>
        <button class="btn sm" id="logout" style="margin-top:11px">Đăng xuất</button>
      </div>
    </aside>
    <main>${inner}</main>
  </div>
  <div class="drawer" id="drawer"><div class="scrim"></div><div class="body"></div></div>`;
}

function render() {
  if (!state.user) return loginView();

  app.innerHTML = shell('<div class="empty">Đang tải…</div>');

  app.querySelectorAll('.nav button').forEach(b => {
    b.addEventListener('click', () => { state.view = b.dataset.view; render(); });
  });
  document.getElementById('logout').addEventListener('click', async () => {
    await api('/api/auth/logout', { method: 'POST' }).catch(() => {});
    state.user = null; state.csrf = null;
    render();
  });
  document.getElementById('drawer').querySelector('.scrim')
    .addEventListener('click', closeDrawer);

  // Mật khẩu tạm: chặn mọi màn hình khác cho tới khi đổi xong.
  const view = state.user.mustChangePassword ? 'tai-khoan' : state.view;
  (VIEWS[view] || VIEWS['tong-quan'])(app.querySelector('main'));
}

const main = () => app.querySelector('main');

function fail(el, error) {
  el.innerHTML = `<div class="panel"><p class="muted">Không tải được dữ liệu.</p>
    <p>${esc(error.message)}</p></div>`;
}

/* ==========================================================================
   Ngăn kéo chi tiết
   ========================================================================== */
function openDrawer(html) {
  const d = document.getElementById('drawer');
  d.querySelector('.body').innerHTML = html;
  d.setAttribute('open', '');
  return d.querySelector('.body');
}
function closeDrawer() {
  document.getElementById('drawer').removeAttribute('open');
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });

/* ==========================================================================
   Màn hình
   ========================================================================== */
const VIEWS = {};

/* ---------- Tổng quan ---------- */
VIEWS['tong-quan'] = async el => {
  try {
    const { summary: s } = await api('/api/console/stats');
    const peak = Math.max(1, ...s.daily.map(d => d.c));

    el.innerHTML = `
      <div class="head">
        <div><h1>Tổng quan</h1><p class="lede">Ba mươi ngày gần nhất.</p></div>
      </div>
      <div class="cards">
        ${card(s.leadsToday, 'Khách mới hôm nay')}
        ${card(s.leads7d, 'Bảy ngày qua')}
        ${card(s.leads30d, 'Ba mươi ngày qua')}
        ${card(s.leadsTotal, 'Tổng khách tiềm năng')}
        ${card(s.won, 'Đã chốt')}
        ${card(s.avgScore ?? '—', 'Điểm chẩn đoán trung bình')}
      </div>
      <div class="grid2">
        <div class="panel">
          <h2>Khách mới theo ngày</h2>
          ${s.daily.length ? s.daily.map(d => `
            <div style="display:flex;align-items:center;gap:11px;margin-bottom:7px">
              <span class="muted" style="width:82px">${esc(d.d)}</span>
              <span class="bar" style="flex:1"><i style="width:${Math.round(d.c / peak * 100)}%"></i></span>
              <span class="num" style="width:26px;text-align:right">${d.c}</span>
            </div>`).join('') : '<p class="muted">Chưa có dữ liệu.</p>'}
        </div>
        <div class="panel">
          <h2>Theo nguồn</h2>
          ${breakdown(s.bySource, 'source')}
          <h2 style="margin-top:24px">Theo ngành</h2>
          ${breakdown(s.byIndustry, 'industry')}
        </div>
      </div>`;
  } catch (e) { fail(el, e); }
};

const card = (value, label) =>
  `<div class="card"><div class="v">${esc(value)}</div><div class="l">${esc(label)}</div></div>`;

function breakdown(rows, key) {
  if (!rows.length) return '<p class="muted">Chưa có dữ liệu.</p>';
  const total = rows.reduce((a, r) => a + r.c, 0) || 1;
  return rows.map(r => `
    <div style="display:flex;align-items:center;gap:11px;margin-bottom:7px">
      <span style="width:130px">${esc(r[key] || 'không rõ')}</span>
      <span class="bar" style="flex:1"><i style="width:${Math.round(r.c / total * 100)}%"></i></span>
      <span class="num" style="width:30px;text-align:right">${r.c}</span>
    </div>`).join('');
}

/* ---------- Khách tiềm năng ---------- */
const leadFilters = { status: '', q: '', offset: 0, limit: 50 };

VIEWS['khach'] = async el => {
  try {
    const params = new URLSearchParams(
      Object.entries(leadFilters).filter(([, v]) => v !== '' && v !== null)
    );
    const r = await api('/api/console/leads?' + params);
    state.data.statuses = r.statuses;

    el.innerHTML = `
      <div class="head">
        <div>
          <h1>Khách tiềm năng</h1>
          <p class="lede">${r.total} bản ghi${leadFilters.q ? ` khớp với “${esc(leadFilters.q)}”` : ''}.</p>
        </div>
        ${can('leads.export') ? `<a class="btn" href="/api/console/leads.csv?${params}">Kết xuất CSV</a>` : ''}
      </div>
      <div class="panel">
        <div class="row">
          <div><label for="q">Tìm kiếm</label>
            <input id="q" placeholder="Tên, điện thoại, email, công ty" value="${esc(leadFilters.q)}"></div>
          <div class="shrink" style="min-width:190px"><label for="st">Trạng thái</label>
            <select id="st">
              <option value="">Tất cả</option>
              ${Object.entries(r.statuses).map(([k, v]) =>
                `<option value="${k}" ${leadFilters.status === k ? 'selected' : ''}>${esc(v.label)}</option>`).join('')}
            </select></div>
        </div>
      </div>
      <div class="tw">
        <table>
          <thead><tr>
            <th>Thời điểm</th><th>Họ tên</th><th>Liên hệ</th><th>Ngành</th>
            <th>Nguồn</th><th>Điểm</th><th>Trạng thái</th><th>Phụ trách</th>
          </tr></thead>
          <tbody>
            ${r.rows.length ? r.rows.map(rowHtml).join('')
              : '<tr><td colspan="8"><div class="empty">Chưa có khách tiềm năng nào khớp bộ lọc.</div></td></tr>'}
          </tbody>
        </table>
      </div>
      ${pager(r)}`;

    el.querySelector('#q').addEventListener('change', e => {
      leadFilters.q = e.target.value.trim(); leadFilters.offset = 0; VIEWS['khach'](main());
    });
    el.querySelector('#st').addEventListener('change', e => {
      leadFilters.status = e.target.value; leadFilters.offset = 0; VIEWS['khach'](main());
    });
    el.querySelectorAll('[data-lead]').forEach(tr => {
      tr.addEventListener('click', () => leadDrawer(tr.dataset.lead));
    });
    el.querySelectorAll('[data-page]').forEach(b => {
      b.addEventListener('click', () => {
        leadFilters.offset = Number(b.dataset.page); VIEWS['khach'](main());
      });
    });
  } catch (e) { fail(el, e); }
};

function rowHtml(l) {
  const st = state.data.statuses[l.status] || { label: l.status, tone: 'mute' };
  const scoreTone = l.score == null ? '' : l.score < 40 ? 'style="color:var(--danger)"'
    : l.score < 70 ? 'style="color:var(--warn)"' : 'style="color:var(--good)"';
  return `<tr data-lead="${l.id}" style="cursor:pointer">
    <td class="num muted">${when(l.createdAt)}</td>
    <td><b>${esc(l.name)}</b>${l.company ? `<div class="muted">${esc(l.company)}</div>` : ''}</td>
    <td><div>${esc(l.phone)}</div><div class="muted">${esc(l.email || '')}</div></td>
    <td>${esc(l.industry || '—')}</td>
    <td class="muted">${esc(l.source || '—')}</td>
    <td class="num" ${scoreTone}><b>${l.score ?? '—'}</b></td>
    <td><span class="pill t-${st.tone}">${esc(st.label)}</span></td>
    <td class="muted">${esc(l.assigneeName || 'chưa giao')}</td>
  </tr>`;
}

function pager(r) {
  if (r.total <= r.limit) return '';
  const prev = Math.max(0, r.offset - r.limit);
  const next = r.offset + r.limit;
  return `<div class="row" style="margin-top:16px;justify-content:flex-end">
    <button class="btn sm shrink" data-page="${prev}" ${r.offset === 0 ? 'disabled' : ''}>Trước</button>
    <span class="muted shrink">${r.offset + 1}–${Math.min(next, r.total)} / ${r.total}</span>
    <button class="btn sm shrink" data-page="${next}" ${next >= r.total ? 'disabled' : ''}>Sau</button>
  </div>`;
}

async function leadDrawer(id) {
  const { lead: l } = await api(`/api/console/leads/${id}`);
  const editable = can('leads.write');
  const users = can('users.read')
    ? (await api('/api/console/users').catch(() => ({ users: [] }))).users
    : [];

  const body = openDrawer(`
    <div class="head" style="margin-bottom:20px">
      <div><h1>${esc(l.name)}</h1><p class="lede">${esc(l.company || 'Cá nhân')}</p></div>
      <button class="btn sm" id="closeDrawer">Đóng</button>
    </div>
    <dl class="kv">
      <dt>Điện thoại</dt><dd><a href="tel:${esc(l.phone)}">${esc(l.phone)}</a></dd>
      <dt>Email</dt><dd>${l.email ? `<a href="mailto:${esc(l.email)}">${esc(l.email)}</a>` : '—'}</dd>
      <dt>Ngành</dt><dd>${esc(l.industry || '—')}</dd>
      <dt>Quan tâm</dt><dd>${esc(l.service || '—')}</dd>
      <dt>Nguồn</dt><dd>${esc(l.source || '—')} · ${esc(l.page || '')}</dd>
      <dt>Điểm</dt><dd>${l.score ?? '—'}${l.tier ? ` · ${esc(l.tier)}` : ''}</dd>
      <dt>Nhận lúc</dt><dd>${when(l.createdAt)}</dd>
      <dt>Giá trị</dt><dd>${l.valueVnd ? money(l.valueVnd) + ' đ' : '—'}</dd>
    </dl>
    ${l.message ? `<div class="panel"><h2>Lời nhắn</h2><p>${esc(l.message)}</p></div>` : ''}
    ${editable ? `
      <div class="panel">
        <h2>Cập nhật</h2>
        <div class="field"><label for="dStatus">Trạng thái</label>
          <select id="dStatus">${Object.entries(state.data.statuses).map(([k, v]) =>
            `<option value="${k}" ${l.status === k ? 'selected' : ''}>${esc(v.label)}</option>`).join('')}
          </select></div>
        ${users.length ? `<div class="field"><label for="dAssign">Người phụ trách</label>
          <select id="dAssign">
            <option value="">— chưa giao —</option>
            ${users.filter(u => u.active).map(u =>
              `<option value="${u.id}" ${l.assignedTo === u.id ? 'selected' : ''}>${esc(u.name)}</option>`).join('')}
          </select></div>` : `<button class="btn sm" id="dClaim">Tự nhận khách này</button>`}
        <div class="field"><label for="dValue">Giá trị hợp đồng (VND)</label>
          <input id="dValue" type="number" min="0" step="1000000" value="${l.valueVnd ?? ''}"></div>
        <button class="btn primary" id="dSave">Lưu thay đổi</button>
      </div>
      <div class="panel">
        <h2>Ghi chú</h2>
        <div class="field"><textarea id="dNote" rows="3" placeholder="Nội dung trao đổi, lịch hẹn, ghi chú nội bộ…"></textarea></div>
        <button class="btn" id="dAddNote">Thêm ghi chú</button>
        <div id="dNotes" style="margin-top:18px">${notesHtml(l.notes)}</div>
      </div>` : `<div class="panel"><h2>Ghi chú</h2>${notesHtml(l.notes)}</div>`}
    ${can('leads.delete') ? `<button class="btn danger" id="dDelete">Xoá khách tiềm năng này</button>` : ''}
  `);

  body.querySelector('#closeDrawer').addEventListener('click', closeDrawer);

  body.querySelector('#dSave')?.addEventListener('click', async e => {
    e.target.disabled = true;
    try {
      const status = body.querySelector('#dStatus').value;
      if (status !== l.status) {
        await api(`/api/console/leads/${l.id}/status`, { method: 'PATCH', body: { status } });
      }
      const assignEl = body.querySelector('#dAssign');
      if (assignEl) {
        const userId = assignEl.value === '' ? null : Number(assignEl.value);
        if (userId !== l.assignedTo) {
          await api(`/api/console/leads/${l.id}/assign`, { method: 'PATCH', body: { userId } });
        }
      }
      const value = body.querySelector('#dValue').value;
      if (value !== '' && Number(value) !== l.valueVnd) {
        await api(`/api/console/leads/${l.id}/value`, { method: 'PATCH', body: { valueVnd: Number(value) } });
      }
      toast('Đã lưu.');
      closeDrawer();
      VIEWS['khach'](main());
    } catch (error) {
      toast(error.message, 'bad');
      e.target.disabled = false;
    }
  });

  body.querySelector('#dClaim')?.addEventListener('click', async () => {
    try {
      await api(`/api/console/leads/${l.id}/assign`, { method: 'PATCH', body: { userId: state.user.id } });
      toast('Đã nhận khách này.');
      closeDrawer();
      VIEWS['khach'](main());
    } catch (error) { toast(error.message, 'bad'); }
  });

  body.querySelector('#dAddNote')?.addEventListener('click', async () => {
    const field = body.querySelector('#dNote');
    try {
      const r = await api(`/api/console/leads/${l.id}/notes`, { method: 'POST', body: { body: field.value } });
      field.value = '';
      body.querySelector('#dNotes').innerHTML = notesHtml(r.notes);
      toast('Đã thêm ghi chú.');
    } catch (error) { toast(error.message, 'bad'); }
  });

  body.querySelector('#dDelete')?.addEventListener('click', async () => {
    if (!confirm(`Xoá vĩnh viễn khách tiềm năng "${l.name}"? Không thể hoàn tác.`)) return;
    try {
      await api(`/api/console/leads/${l.id}`, { method: 'DELETE' });
      toast('Đã xoá.');
      closeDrawer();
      VIEWS['khach'](main());
    } catch (error) { toast(error.message, 'bad'); }
  });
}

const notesHtml = notes => notes?.length
  ? notes.map(n => `<div class="note"><div class="meta">${esc(n.author_name || 'hệ thống')} · ${when(n.created_at)}</div>${esc(n.body)}</div>`).join('')
  : '<p class="muted">Chưa có ghi chú nào.</p>';

/* ---------- Kết quả chẩn đoán ---------- */
VIEWS['chan-doan'] = async el => {
  try {
    const r = await api('/api/console/diagnostics?limit=100');
    el.innerHTML = `
      <div class="head"><div><h1>Kết quả chẩn đoán</h1>
        <p class="lede">${r.total} lượt hoàn thành.</p></div></div>
      <div class="tw"><table>
        <thead><tr><th>Thời điểm</th><th>Ngành</th><th>Doanh thu/tháng</th>
          <th>Điểm</th><th>Bậc</th><th>Thất thoát ước tính</th></tr></thead>
        <tbody>${r.rows.length ? r.rows.map(d => `
          <tr>
            <td class="num muted">${when(d.created_at)}</td>
            <td>${esc(d.industry || '—')}</td>
            <td class="num">${d.revenue ? money(d.revenue) + ' tr' : '—'}</td>
            <td class="num"><b>${d.overall}</b></td>
            <td>${esc(d.tier || '—')}</td>
            <td class="num">${d.leak_month ? money(d.leak_month) + ' tr/tháng' : '—'}</td>
          </tr>`).join('') : '<tr><td colspan="6"><div class="empty">Chưa có ai hoàn thành bài chẩn đoán.</div></td></tr>'}
        </tbody></table></div>`;
  } catch (e) { fail(el, e); }
};

/* ---------- Hàng đợi thư ---------- */
VIEWS['thu'] = async el => {
  try {
    const r = await api('/api/console/mail');
    el.innerHTML = `
      <div class="head">
        <div><h1>Hàng đợi thư</h1>
          <p class="lede">${r.enabled ? 'SMTP đang hoạt động.'
            : 'Chưa cấu hình SMTP — thư được xếp hàng và ghi ra nhật ký, không gửi đi.'}</p></div>
        ${can('mail.retry') ? '<button class="btn" id="retry">Gửi lại thư lỗi</button>' : ''}
      </div>
      <div class="cards">
        ${card(r.stats.pending || 0, 'Đang chờ')}
        ${card(r.stats.sent || 0, 'Đã gửi')}
        ${card(r.stats.failed || 0, 'Thất bại')}
      </div>
      <div class="tw"><table>
        <thead><tr><th>Thời điểm</th><th>Loại</th><th>Người nhận</th><th>Tiêu đề</th>
          <th>Trạng thái</th><th>Lần thử</th><th>Lỗi gần nhất</th></tr></thead>
        <tbody>${r.rows.length ? r.rows.map(m => `
          <tr>
            <td class="num muted">${when(m.created_at)}</td>
            <td class="muted">${esc(m.kind)}</td>
            <td>${esc(m.recipient)}</td>
            <td class="msg">${esc(m.subject)}</td>
            <td><span class="pill t-${m.status === 'sent' ? 'good' : m.status === 'failed' ? 'danger' : 'gold'}">${esc(m.status)}</span></td>
            <td class="num">${m.attempts}</td>
            <td class="msg">${esc(m.last_error || '')}</td>
          </tr>`).join('') : '<tr><td colspan="7"><div class="empty">Hàng đợi trống.</div></td></tr>'}
        </tbody></table></div>`;

    el.querySelector('#retry')?.addEventListener('click', async e => {
      e.target.disabled = true;
      try {
        const out = await api('/api/console/mail/retry', { method: 'POST' });
        toast(`Đã đưa ${out.requeued} thư trở lại hàng đợi.`);
        VIEWS['thu'](main());
      } catch (error) { toast(error.message, 'bad'); e.target.disabled = false; }
    });
  } catch (e) { fail(el, e); }
};

/* ---------- Cấu hình site ---------- */
VIEWS['cau-hinh'] = async el => {
  try {
    const { groups } = await api('/api/console/settings');
    const writable = can('settings.write');

    el.innerHTML = `
      <div class="head"><div><h1>Cấu hình site</h1>
        <p class="lede">Có hiệu lực ngay, không cần triển khai lại.</p></div></div>
      ${Object.entries(groups).map(([group, items]) => `
        <div class="panel">
          <h2>${esc(group)}</h2>
          ${items.map(s => field(s, writable)).join('')}
        </div>`).join('')}
      ${writable ? '<button class="btn primary" id="saveSettings">Lưu cấu hình</button>' : ''}`;

    el.querySelector('#saveSettings')?.addEventListener('click', async e => {
      e.target.disabled = true;
      const patch = {};
      el.querySelectorAll('[data-key]').forEach(input => {
        patch[input.dataset.key] = input.type === 'checkbox' ? input.checked : input.value;
      });
      try {
        const r = await api('/api/console/settings', { method: 'PUT', body: patch });
        toast(r.changed ? `Đã lưu ${r.changed} thay đổi.` : 'Không có gì thay đổi.');
      } catch (error) { toast(error.message, 'bad'); }
      e.target.disabled = false;
    });
  } catch (e) { fail(el, e); }
};

function field(s, writable) {
  const disabled = writable ? '' : 'disabled';
  const id = 'f_' + s.key.replace(/\W/g, '_');
  const input = s.type === 'bool'
    ? `<input id="${id}" type="checkbox" data-key="${esc(s.key)}" ${s.value ? 'checked' : ''} ${disabled} style="width:auto">`
    : s.type === 'longtext'
      ? `<textarea id="${id}" rows="4" data-key="${esc(s.key)}" ${disabled}>${esc(s.value)}</textarea>`
      : `<input id="${id}" type="${s.type === 'number' ? 'number' : 'text'}" data-key="${esc(s.key)}" value="${esc(s.value)}" ${disabled}>`;

  return `<div class="field">
    <label for="${id}">${esc(s.label)} <span class="muted">· ${esc(s.key)}</span></label>
    ${input}
    ${s.help ? `<p class="help">${esc(s.help)}</p>` : ''}
  </div>`;
}

/* ---------- Tài khoản nội bộ ---------- */
VIEWS['nguoi-dung'] = async el => {
  try {
    const r = await api('/api/console/users');
    const writable = can('users.write');

    el.innerHTML = `
      <div class="head">
        <div><h1>Tài khoản</h1><p class="lede">${r.users.length} tài khoản nội bộ.</p></div>
        ${writable ? '<button class="btn primary" id="newUser">Tạo tài khoản</button>' : ''}
      </div>
      <div class="tw"><table>
        <thead><tr><th>Họ tên</th><th>Email</th><th>Vai trò</th><th>Trạng thái</th>
          <th>Đăng nhập gần nhất</th>${writable ? '<th></th>' : ''}</tr></thead>
        <tbody>${r.users.map(u => `
          <tr>
            <td><b>${esc(u.name)}</b>${u.mustChangePassword ? ' <span class="pill t-gold">mật khẩu tạm</span>' : ''}</td>
            <td class="muted">${esc(u.email)}</td>
            <td>${writable ? `<select data-role="${u.id}">
                  ${Object.entries(r.roles).map(([k, v]) =>
                    `<option value="${k}" ${u.role === k ? 'selected' : ''}>${esc(v.label)}</option>`).join('')}
                </select>` : esc(r.roles[u.role]?.label || u.role)}</td>
            <td><span class="pill t-${u.active ? 'good' : 'mute'}">${u.active ? 'Hoạt động' : 'Đã khoá'}</span></td>
            <td class="num muted">${when(u.lastLoginAt)}</td>
            ${writable ? `<td class="num">
              <button class="btn sm" data-toggle="${u.id}" data-active="${u.active}">${u.active ? 'Khoá' : 'Mở'}</button>
              <button class="btn sm" data-reset="${u.id}">Đặt lại mật khẩu</button>
            </td>` : ''}
          </tr>`).join('')}
        </tbody></table></div>
      <div class="panel" style="margin-top:22px">
        <h2>Vai trò và quyền</h2>
        ${Object.entries(r.roles).map(([k, v]) => `
          <div style="margin-bottom:14px">
            <b>${esc(v.label)}</b> <span class="muted">· ${esc(k)}</span>
            <div class="muted">${esc(v.desc)}</div>
            <div class="muted" style="margin-top:4px">
              ${v.permissions.includes('*') ? 'Toàn quyền'
                : v.permissions.map(p => esc(r.permissions[p] || p)).join(' · ')}
            </div>
          </div>`).join('')}
      </div>`;

    el.querySelector('#newUser')?.addEventListener('click', () => newUserDrawer(r.roles));

    el.querySelectorAll('[data-role]').forEach(sel => {
      sel.addEventListener('change', async () => {
        try {
          await api(`/api/console/users/${sel.dataset.role}`, { method: 'PATCH', body: { role: sel.value } });
          toast('Đã đổi vai trò. Tài khoản này đã bị đăng xuất khỏi mọi thiết bị.');
        } catch (error) { toast(error.message, 'bad'); VIEWS['nguoi-dung'](main()); }
      });
    });

    el.querySelectorAll('[data-toggle]').forEach(b => {
      b.addEventListener('click', async () => {
        try {
          await api(`/api/console/users/${b.dataset.toggle}`, {
            method: 'PATCH', body: { active: b.dataset.active !== 'true' }
          });
          VIEWS['nguoi-dung'](main());
        } catch (error) { toast(error.message, 'bad'); }
      });
    });

    el.querySelectorAll('[data-reset]').forEach(b => {
      b.addEventListener('click', async () => {
        if (!confirm('Đặt lại mật khẩu? Tài khoản này sẽ bị đăng xuất khỏi mọi thiết bị.')) return;
        try {
          const out = await api(`/api/console/users/${b.dataset.reset}/reset-password`, { method: 'POST' });
          showSecret('Mật khẩu tạm', out.temporaryPassword);
        } catch (error) { toast(error.message, 'bad'); }
      });
    });
  } catch (e) { fail(el, e); }
};

function newUserDrawer(roles) {
  const body = openDrawer(`
    <div class="head" style="margin-bottom:20px">
      <div><h1>Tài khoản mới</h1><p class="lede">Mật khẩu tạm sẽ hiện một lần duy nhất.</p></div>
      <button class="btn sm" id="closeDrawer">Đóng</button>
    </div>
    <div class="field"><label for="nName">Họ tên</label><input id="nName"></div>
    <div class="field"><label for="nEmail">Email</label><input id="nEmail" type="email"></div>
    <div class="field"><label for="nRole">Vai trò</label>
      <select id="nRole">${Object.entries(roles).map(([k, v]) =>
        `<option value="${k}">${esc(v.label)} — ${esc(v.desc)}</option>`).join('')}</select></div>
    <button class="btn primary" id="nCreate">Tạo tài khoản</button>`);

  body.querySelector('#closeDrawer').addEventListener('click', closeDrawer);
  body.querySelector('#nCreate').addEventListener('click', async e => {
    e.target.disabled = true;
    try {
      const out = await api('/api/console/users', {
        method: 'POST',
        body: {
          name: body.querySelector('#nName').value,
          email: body.querySelector('#nEmail').value,
          role: body.querySelector('#nRole').value
        }
      });
      closeDrawer();
      showSecret('Mật khẩu tạm cho ' + out.user.email, out.temporaryPassword);
      VIEWS['nguoi-dung'](main());
    } catch (error) { toast(error.message, 'bad'); e.target.disabled = false; }
  });
}

/** Hiện một bí mật đúng một lần, kèm nút chép. Không ghi vào bất kỳ đâu khác. */
function showSecret(title, secret) {
  const body = openDrawer(`
    <div class="head" style="margin-bottom:20px"><div><h1>${esc(title)}</h1>
      <p class="lede">Chỉ hiển thị lần này. Gửi cho người dùng qua kênh an toàn.</p></div></div>
    <div class="panel"><code style="font-size:19px;color:var(--gold-300);word-break:break-all">${esc(secret)}</code></div>
    <button class="btn" id="copySecret">Chép vào bộ nhớ tạm</button>
    <button class="btn primary" id="doneSecret" style="margin-left:8px">Tôi đã lưu lại</button>`);

  body.querySelector('#copySecret').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(secret); toast('Đã chép.'); }
    catch { toast('Trình duyệt không cho chép — hãy chọn và sao chép thủ công.', 'bad'); }
  });
  body.querySelector('#doneSecret').addEventListener('click', closeDrawer);
}

/* ---------- Nhật ký kiểm toán ---------- */
VIEWS['kiem-toan'] = async el => {
  try {
    const r = await api('/api/console/audit?limit=300');
    el.innerHTML = `
      <div class="head"><div><h1>Nhật ký kiểm toán</h1>
        <p class="lede">Ba trăm hành động gần nhất. Bản ghi không sửa được từ giao diện.</p></div></div>
      <div class="tw"><table>
        <thead><tr><th>Thời điểm</th><th>Người thực hiện</th><th>Hành động</th>
          <th>Đối tượng</th><th>Kết quả</th><th>Chi tiết</th></tr></thead>
        <tbody>${r.rows.length ? r.rows.map(a => `
          <tr>
            <td class="num muted">${when(a.created_at)}</td>
            <td>${esc(a.actor_email || 'khách')}</td>
            <td><code>${esc(a.action)}</code></td>
            <td class="muted">${esc(a.target || '—')}</td>
            <td><span class="pill t-${a.result === 'ok' ? 'good' : 'danger'}">${esc(a.result)}</span></td>
            <td class="msg">${esc(a.detail || '')}</td>
          </tr>`).join('') : '<tr><td colspan="6"><div class="empty">Chưa có bản ghi nào.</div></td></tr>'}
        </tbody></table></div>`;
  } catch (e) { fail(el, e); }
};

/* ---------- Hệ thống ---------- */
VIEWS['he-thong'] = async el => {
  try {
    const { system: s } = await api('/api/console/system');
    el.innerHTML = `
      <div class="head"><div><h1>Hệ thống</h1><p class="lede">Trạng thái tiến trình đang chạy.</p></div></div>
      <div class="cards">
        ${card(s.env, 'Môi trường')}
        ${card(Math.round(s.uptimeSeconds / 3600) + ' giờ', 'Thời gian chạy')}
        ${card(s.memoryMb + ' MB', 'Bộ nhớ')}
        ${card(s.dbSizeMb + ' MB', 'Cơ sở dữ liệu')}
        ${card(s.activeSessions, 'Phiên đang hoạt động')}
        ${card(s.schema.latest, 'Phiên bản lược đồ')}
      </div>
      <div class="grid2">
        <div class="panel">
          <h2>Cấu hình đang áp dụng</h2>
          <dl class="kv">
            <dt>Node</dt><dd>${esc(s.node)}</dd>
            <dt>Origin</dt><dd>${esc(s.origin)}</dd>
            <dt>Tệp dữ liệu</dt><dd>${esc(s.dbPath)}</dd>
            <dt>Lớp proxy tin cậy</dt><dd>${s.trustProxy}</dd>
            <dt>SMTP</dt><dd>${s.mailEnabled ? 'đã cấu hình' : 'chưa cấu hình'}</dd>
            <dt>Khoá giới hạn tần suất</dt><dd>${s.rateLimitBuckets}</dd>
          </dl>
          ${can('system.write') ? '<button class="btn" id="purge">Dọn phiên hết hạn</button>' : ''}
        </div>
        <div class="panel">
          <h2>Lược đồ cơ sở dữ liệu</h2>
          ${s.schema.applied.map(m => `<div style="margin-bottom:7px">
            <span class="pill t-good">${m.id}</span> ${esc(m.name)}
            <div class="muted">${when(m.applied_at)}</div></div>`).join('')}
          ${s.schema.pending.length
            ? `<p class="pill t-danger">Còn ${s.schema.pending.length} migration chưa chạy</p>`
            : '<p class="muted">Đã ở bản mới nhất.</p>'}
        </div>
      </div>`;

    el.querySelector('#purge')?.addEventListener('click', async e => {
      e.target.disabled = true;
      try {
        const out = await api('/api/console/system/purge-sessions', { method: 'POST' });
        toast(`Đã dọn ${out.removed} phiên hết hạn.`);
      } catch (error) { toast(error.message, 'bad'); }
      e.target.disabled = false;
    });
  } catch (e) { fail(el, e); }
};

/* ---------- Tài khoản của tôi ---------- */
VIEWS['tai-khoan'] = el => {
  const u = state.user;
  el.innerHTML = `
    <div class="head"><div><h1>Tài khoản của tôi</h1>
      <p class="lede">${esc(u.email)} · ${esc(u.roleLabel)}</p></div></div>
    ${u.mustChangePassword
      ? '<div class="panel" style="border-color:rgba(255,179,94,.4)"><b>Bạn đang dùng mật khẩu tạm.</b><p class="muted">Đổi mật khẩu để mở khoá các màn hình còn lại.</p></div>'
      : ''}
    <div class="panel" style="max-width:480px">
      <h2>Đổi mật khẩu</h2>
      <div class="field"><label for="pOld">Mật khẩu hiện tại</label>
        <input id="pOld" type="password" autocomplete="current-password"></div>
      <div class="field"><label for="pNew">Mật khẩu mới</label>
        <input id="pNew" type="password" autocomplete="new-password">
        <p class="help">Tối thiểu 12 ký tự. Ưu tiên một cụm từ dài dễ nhớ hơn là chuỗi ký tự lạ.</p></div>
      <div class="field"><label for="pNew2">Nhập lại mật khẩu mới</label>
        <input id="pNew2" type="password" autocomplete="new-password"></div>
      <button class="btn primary" id="pSave">Đổi mật khẩu</button>
    </div>
    <div class="panel" style="max-width:480px">
      <h2>Quyền của bạn</h2>
      <p class="muted">${u.permissions.map(esc).join(' · ') || 'Không có quyền nào.'}</p>
      <button class="btn" id="logoutAll" style="margin-top:12px">Đăng xuất khỏi mọi thiết bị</button>
    </div>`;

  el.querySelector('#pSave').addEventListener('click', async e => {
    const nw = el.querySelector('#pNew').value;
    if (nw !== el.querySelector('#pNew2').value) return toast('Hai ô mật khẩu mới chưa khớp.', 'bad');
    e.target.disabled = true;
    try {
      const r = await api('/api/auth/password', {
        method: 'POST',
        body: { currentPassword: el.querySelector('#pOld').value, newPassword: nw }
      });
      state.user = r.user;
      state.csrf = r.csrfToken;
      state.view = 'tong-quan';
      toast(r.message);
      render();
    } catch (error) { toast(error.message, 'bad'); e.target.disabled = false; }
  });

  el.querySelector('#logoutAll').addEventListener('click', async () => {
    await api('/api/auth/logout-all', { method: 'POST' }).catch(() => {});
    state.user = null; state.csrf = null;
    render();
  });
};

/* ---------- Nội dung website ----------
   Sửa, thêm, xoá mọi mục hiển thị trên website. Biểu mẫu được sinh ra từ mô tả
   trường do máy chủ trả về, nên thêm một bộ sưu tập mới ở backend là màn hình
   này tự có, không phải viết thêm giao diện.                                  */
const contentState = { collection: null, singleton: null };

VIEWS['noi-dung'] = async el => {
  try {
    const cat = await api('/api/console/content');
    state.data.contentCatalog = cat;

    const groups = {};
    for (const [key, c] of Object.entries(cat.collections)) (groups[c.group] ??= []).push({ key, ...c, kind: 'c' });
    for (const [key, c] of Object.entries(cat.singletons)) (groups[c.group] ??= []).push({ key, ...c, kind: 's' });

    el.innerHTML = `
      <div class="head">
        <div><h1>Nội dung website</h1>
          <p class="lede">Sửa xong nhớ bấm <b>Xuất bản</b> để dựng lại trang tĩnh.</p></div>
        ${can('content.publish') ? '<button class="btn primary" id="publish">Xuất bản</button>' : ''}
      </div>
      <div id="publishLog"></div>
      <div class="grid2">
        <div>
          ${Object.entries(groups).map(([group, items]) => `
            <div class="panel">
              <h2>${esc(group)}</h2>
              ${items.map(i => `
                <button class="btn sm" data-open="${i.kind}:${i.key}"
                        style="width:100%;justify-content:space-between;margin-bottom:7px">
                  <span>${esc(i.label)}</span>
                  <span class="muted">${i.kind === 'c'
                    ? `${i.count} mục${i.changed ? ` · ${i.changed} đã sửa` : ''}`
                    : (i.changed ? 'đã sửa' : 'bản gốc')}</span>
                </button>`).join('')}
            </div>`).join('')}
        </div>
        <div id="contentPane"><div class="panel"><p class="muted">Chọn một mục bên trái để bắt đầu sửa.</p></div></div>
      </div>`;

    el.querySelectorAll('[data-open]').forEach(b => {
      b.addEventListener('click', () => {
        const [kind, key] = b.dataset.open.split(':');
        if (kind === 'c') { contentState.collection = key; contentState.singleton = null; openCollection(key); }
        else { contentState.singleton = key; contentState.collection = null; openSingleton(key); }
      });
    });

    el.querySelector('#publish')?.addEventListener('click', runPublish);

    if (contentState.collection) openCollection(contentState.collection);
    else if (contentState.singleton) openSingleton(contentState.singleton);
  } catch (e) { fail(el, e); }
};

const SOURCE_BADGE = {
  goc: ['mute', 'bản gốc'],
  'da-sua': ['gold', 'đã sửa'],
  moi: ['good', 'mới thêm'],
  'da-xoa': ['danger', 'đã ẩn']
};

async function openCollection(key) {
  const pane = document.getElementById('contentPane');
  if (!pane) return;
  pane.innerHTML = '<div class="panel"><p class="muted">Đang tải…</p></div>';

  let c;
  try { c = await api(`/api/console/content/c/${key}`); }
  catch (e) { return fail(pane, e); }

  const writable = can('content.write');
  const label = item => {
    const f = c.fields.find(f => f.name !== c.idField) ?? c.fields[0];
    return item.data ? (item.data[f?.name] ?? item.id) : item.id;
  };

  pane.innerHTML = `
    <div class="panel">
      <div class="head" style="margin-bottom:16px">
        <div><h1 style="font-size:19px">${esc(c.label)}</h1>
          ${c.help ? `<p class="lede">${esc(c.help)}</p>` : ''}</div>
        ${writable ? '<button class="btn primary" id="newItem">Thêm mục</button>' : ''}
      </div>
      <div class="tw"><table>
        <thead><tr><th>${esc(c.idField)}</th><th>Nội dung</th><th>Trạng thái</th><th></th></tr></thead>
        <tbody>${c.items.map(i => {
          const [tone, text] = SOURCE_BADGE[i.source] ?? ['mute', i.source];
          return `<tr>
            <td><code>${esc(i.id)}</code></td>
            <td class="msg">${esc(String(label(i)).slice(0, 110))}</td>
            <td><span class="pill t-${tone}">${esc(text)}</span></td>
            <td class="num">
              ${i.data && writable ? `<button class="btn sm" data-edit="${esc(i.id)}">Sửa</button>` : ''}
              ${i.data && writable ? `<button class="btn sm danger" data-del="${esc(i.id)}">Xoá</button>` : ''}
              ${i.source !== 'goc' && writable ? `<button class="btn sm" data-restore="${esc(i.id)}">Khôi phục</button>` : ''}
            </td>
          </tr>`;
        }).join('')}</tbody>
      </table></div>
    </div>`;

  const reload = () => openCollection(key);

  pane.querySelector('#newItem')?.addEventListener('click', () => itemEditor(c, null));
  pane.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click',
    () => itemEditor(c, c.items.find(i => i.id === b.dataset.edit))));

  pane.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', async () => {
    if (!confirm(`Ẩn mục "${b.dataset.del}" khỏi website? Có thể khôi phục lại sau.`)) return;
    try {
      await api(`/api/console/content/c/${key}/${encodeURIComponent(b.dataset.del)}`, { method: 'DELETE' });
      toast('Đã ẩn. Bấm Xuất bản để áp dụng lên website.');
      reload();
    } catch (e) { toast(e.message, 'bad'); }
  }));

  pane.querySelectorAll('[data-restore]').forEach(b => b.addEventListener('click', async () => {
    try {
      await api(`/api/console/content/c/${key}/${encodeURIComponent(b.dataset.restore)}/restore`, { method: 'POST' });
      toast('Đã trả về bản gốc trong mã nguồn.');
      reload();
    } catch (e) { toast(e.message, 'bad'); }
  }));
}

/**
 * Trình sửa một mục.
 *
 * Hai lớp cố ý đi cùng nhau: biểu mẫu cho những trường hay sửa, và ô JSON cho
 * toàn bộ cấu trúc. Nội dung Aurix lồng nhiều tầng (dịch vụ có `solution.pillars`,
 * bài viết có mảng khối) — ép hết vào biểu mẫu là khoá cứng đúng thứ cần giữ mềm.
 * Sửa ở biểu mẫu thì JSON tự cập nhật theo, và ngược lại.
 */
function itemEditor(c, item) {
  const creating = !item;
  const data = item?.data ? { ...item.data } : {};

  const body = openDrawer(`
    <div class="head" style="margin-bottom:18px">
      <div><h1 style="font-size:19px">${creating ? 'Thêm mục mới' : esc(item.id)}</h1>
        <p class="lede">${esc(c.label)}</p></div>
      <button class="btn sm" id="closeDrawer">Đóng</button>
    </div>
    <div id="ceFields">
      ${c.fields.map(f => {
        const id = 'ce_' + f.name;
        const v = data[f.name] ?? '';
        const input = f.type === 'textarea'
          ? `<textarea id="${id}" data-field="${esc(f.name)}" rows="3">${esc(v)}</textarea>`
          : `<input id="${id}" data-field="${esc(f.name)}" type="${f.type === 'number' ? 'number' : 'text'}" value="${esc(v)}">`;
        return `<div class="field"><label for="${id}">${esc(f.label)}
          <span class="muted">· ${esc(f.name)}</span></label>${input}</div>`;
      }).join('')}
    </div>
    <div class="field">
      <label for="ceJson">Toàn bộ nội dung (JSON)</label>
      <textarea id="ceJson" rows="16" spellcheck="false"
        style="font-family:ui-monospace,Consolas,monospace;font-size:12.5px"></textarea>
      <p class="help">Mọi trường đều sửa được ở đây, kể cả cấu trúc lồng nhiều tầng. Sai cú pháp thì nút lưu sẽ báo.</p>
    </div>
    <button class="btn primary" id="ceSave">${creating ? 'Tạo mục' : 'Lưu thay đổi'}</button>`);

  const jsonBox = body.querySelector('#ceJson');
  const write = () => { jsonBox.value = JSON.stringify(data, null, 2); };
  write();

  body.querySelector('#closeDrawer').addEventListener('click', closeDrawer);

  // Biểu mẫu → JSON
  body.querySelectorAll('[data-field]').forEach(input => {
    input.addEventListener('input', () => {
      const f = c.fields.find(x => x.name === input.dataset.field);
      const raw = input.value;
      if (raw === '') delete data[input.dataset.field];
      else data[input.dataset.field] = f?.type === 'number' ? Number(raw) : raw;
      write();
    });
  });

  // JSON → biểu mẫu
  jsonBox.addEventListener('change', () => {
    let parsed;
    try { parsed = JSON.parse(jsonBox.value); }
    catch { return toast('JSON chưa hợp lệ — chưa đồng bộ lại biểu mẫu.', 'bad'); }
    for (const k of Object.keys(data)) delete data[k];
    Object.assign(data, parsed);
    body.querySelectorAll('[data-field]').forEach(input => {
      input.value = data[input.dataset.field] ?? '';
    });
  });

  body.querySelector('#ceSave').addEventListener('click', async e => {
    let payload;
    try { payload = JSON.parse(jsonBox.value); }
    catch { return toast('JSON chưa hợp lệ. Kiểm tra lại dấu phẩy và ngoặc.', 'bad'); }

    e.target.disabled = true;
    try {
      if (creating) {
        await api(`/api/console/content/c/${c.key}`, { method: 'POST', body: { data: payload } });
      } else {
        await api(`/api/console/content/c/${c.key}/${encodeURIComponent(item.id)}`,
          { method: 'PUT', body: { data: payload } });
      }
      toast('Đã lưu. Bấm Xuất bản để đưa lên website.');
      closeDrawer();
      openCollection(c.key);
    } catch (error) { toast(error.message, 'bad'); e.target.disabled = false; }
  });
}

async function openSingleton(key) {
  const pane = document.getElementById('contentPane');
  if (!pane) return;

  let s;
  try { s = await api(`/api/console/content/s/${key}`); }
  catch (e) { return fail(pane, e); }

  const writable = can('content.write');
  const data = { ...s.data };

  pane.innerHTML = `
    <div class="panel">
      <div class="head" style="margin-bottom:16px">
        <div><h1 style="font-size:19px">${esc(s.label)}</h1>
          ${s.help ? `<p class="lede">${esc(s.help)}</p>` : ''}</div>
        ${writable ? `<button class="btn sm" id="sRestore">Khôi phục bản gốc</button>` : ''}
      </div>
      ${s.fields.map(f => {
        const id = 'sg_' + f.name;
        return `<div class="field"><label for="${id}">${esc(f.label)}
          <span class="muted">· ${esc(f.name)}</span></label>
          <input id="${id}" data-field="${esc(f.name)}" value="${esc(data[f.name] ?? '')}" ${writable ? '' : 'disabled'}></div>`;
      }).join('')}
      <div class="field">
        <label for="sgJson">Toàn bộ nội dung (JSON)</label>
        <textarea id="sgJson" rows="18" spellcheck="false" ${writable ? '' : 'disabled'}
          style="font-family:ui-monospace,Consolas,monospace;font-size:12.5px"></textarea>
      </div>
      ${writable ? '<button class="btn primary" id="sgSave">Lưu thay đổi</button>' : ''}
    </div>`;

  const jsonBox = pane.querySelector('#sgJson');
  const write = () => { jsonBox.value = JSON.stringify(data, null, 2); };
  write();

  pane.querySelectorAll('[data-field]').forEach(input => {
    input.addEventListener('input', () => { data[input.dataset.field] = input.value; write(); });
  });

  pane.querySelector('#sgSave')?.addEventListener('click', async e => {
    let payload;
    try { payload = JSON.parse(jsonBox.value); }
    catch { return toast('JSON chưa hợp lệ.', 'bad'); }
    e.target.disabled = true;
    try {
      await api(`/api/console/content/s/${key}`, { method: 'PUT', body: { data: payload } });
      toast('Đã lưu. Bấm Xuất bản để đưa lên website.');
      openSingleton(key);
    } catch (error) { toast(error.message, 'bad'); e.target.disabled = false; }
  });

  pane.querySelector('#sRestore')?.addEventListener('click', async () => {
    if (!confirm('Bỏ mọi thay đổi và trả về bản gốc trong mã nguồn?')) return;
    try {
      await api(`/api/console/content/c/${key}/${encodeURIComponent(key)}/restore`, { method: 'POST' });
      toast('Đã trả về bản gốc.');
      openSingleton(key);
    } catch (e) { toast(e.message, 'bad'); }
  });
}

/** Dựng lại HTML tĩnh rồi chạy kiểm định, in nhật ký ra ngay tại chỗ. */
async function runPublish() {
  const button = document.getElementById('publish');
  const box = document.getElementById('publishLog');
  button.disabled = true;
  button.textContent = 'Đang xuất bản…';
  box.innerHTML = '<div class="panel"><p class="muted">Đang dựng lại toàn bộ trang tĩnh và kiểm định…</p></div>';

  try {
    const { result } = await api('/api/console/content/publish', { method: 'POST' });
    box.innerHTML = `
      <div class="panel" style="border-color:${result.ok ? 'rgba(110,231,168,.4)' : 'rgba(255,128,128,.45)'}">
        <h2>${result.ok ? 'Đã xuất bản' : 'Xuất bản thất bại ở bước ' + esc(result.step)}</h2>
        <p class="muted">Mất ${result.seconds} giây.</p>
        <pre style="white-space:pre-wrap;font-size:12px;color:var(--fg-soft);max-height:320px;overflow:auto">${esc(result.log)}</pre>
      </div>`;
    toast(result.ok ? 'Website đã được dựng lại.' : 'Xuất bản thất bại — xem nhật ký bên dưới.',
      result.ok ? 'good' : 'bad');
  } catch (e) {
    box.innerHTML = `<div class="panel"><p>${esc(e.message)}</p></div>`;
    toast(e.message, 'bad');
  }
  button.disabled = false;
  button.textContent = 'Xuất bản';
}

/* ==========================================================================
   Khởi động
   ========================================================================== */
(async function boot() {
  try {
    const r = await api('/api/auth/me');
    state.user = r.user;
    state.csrf = r.csrfToken;
    if (r.user?.mustChangePassword) state.view = 'tai-khoan';
  } catch { /* chưa đăng nhập */ }
  render();
})();
