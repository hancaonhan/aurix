/**
 * Nghiệp vụ khách tiềm năng.
 *
 * Tầng này nằm giữa handler HTTP và cơ sở dữ liệu: nó biết về quyền hạn theo
 * phạm vi (nhân viên kinh doanh chỉ thấy khách được giao, trừ khi có quyền
 * rộng hơn), về vòng đời trạng thái, và về việc mọi thay đổi đều phải để lại
 * dấu vết kiểm toán.
 *
 * Mọi hàm chạm cơ sở dữ liệu ở đây **bất đồng bộ**. Nơi gọi phải `await`.
 */
import { all, one, run } from '../db/index.js';
import { err } from '../core/errors.js';
import { can } from '../security/rbac.js';

/** Vòng đời trạng thái. Thêm trạng thái mới chỉ cần khai báo ở đây. */
export const LEAD_STATUSES = {
  new:       { label: 'Mới',            tone: 'info' },
  contacted: { label: 'Đã liên hệ',     tone: 'gold' },
  qualified: { label: 'Đủ điều kiện',   tone: 'violet' },
  won:       { label: 'Đã chốt',        tone: 'good' },
  lost:      { label: 'Không phù hợp',  tone: 'mute' }
};
export const isStatus = s => Object.hasOwn(LEAD_STATUSES, s);

const SORTABLE = new Set(['created_at', 'updated_at', 'score', 'id', 'status']);

/**
 * Danh sách khách tiềm năng, có lọc và phân trang.
 *
 * `viewer` quyết định phạm vi: người chỉ có quyền `leads.read` mà không có
 * `leads.delete` (tức nhân viên kinh doanh) chỉ nhìn thấy khách chưa ai nhận
 * hoặc do chính mình phụ trách.
 */
export async function listLeads({
  limit = 50, offset = 0, status, source, industry, q,
  assignedTo, sort = 'created_at', dir = 'desc', viewer = null, scopeToViewer = false
} = {}) {
  const where = [];
  const args = [];
  /* Postgres đánh số tham số nên phải cấp số theo thứ tự thêm vào. Hàm này trả
     về `$n` tiếp theo và đẩy giá trị vào mảng — giữ hai thứ luôn khớp nhau. */
  const p = v => { args.push(v); return '$' + args.length; };

  if (status && isStatus(status)) where.push(`l.status = ${p(status)}`);
  if (source) where.push(`l.source = ${p(source)}`);
  if (industry) where.push(`l.industry = ${p(industry)}`);
  if (assignedTo === 'none') where.push('l.assigned_to IS NULL');
  else if (assignedTo) where.push(`l.assigned_to = ${p(Number(assignedTo))}`);

  if (q) {
    /* ILIKE, không phải LIKE: `LIKE` của SQLite không phân biệt hoa thường với
       ký tự ASCII, còn của Postgres thì phân biệt. Dùng LIKE ở đây sẽ làm ô tìm
       kiếm im lặng bỏ sót kết quả — một thay đổi hành vi rất khó nhận ra. */
    const like = p(`%${String(q).slice(0, 80)}%`);
    where.push(`(l.name ILIKE ${like} OR l.phone ILIKE ${like} OR l.email ILIKE ${like} OR l.company ILIKE ${like})`);
  }

  if (scopeToViewer && viewer) {
    where.push(`(l.assigned_to = ${p(viewer.id)} OR l.assigned_to IS NULL)`);
  }

  const clause = where.length ? 'WHERE ' + where.join(' AND ') : '';
  const orderCol = SORTABLE.has(sort) ? sort : 'created_at';
  const orderDir = String(dir).toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  const lim = p(Math.min(Number(limit) || 50, 500));
  const off = p(Number(offset) || 0);

  const [rows, total] = await Promise.all([
    all(`
      SELECT l.*, u.name AS assignee_name
      FROM leads l LEFT JOIN users u ON u.id = l.assigned_to
      ${clause}
      ORDER BY l.${orderCol} ${orderDir}
      LIMIT ${lim} OFFSET ${off}
    `, args),
    // Bỏ hai tham số cuối (LIMIT/OFFSET) vì câu đếm không dùng tới chúng.
    one(`SELECT COUNT(*) c FROM leads l ${clause}`, args.slice(0, -2))
  ]);

  return { rows: rows.map(shape), total: total.c, limit: Number(limit), offset: Number(offset) };
}

export async function getLead(id) {
  const row = await one(`
    SELECT l.*, u.name AS assignee_name
    FROM leads l LEFT JOIN users u ON u.id = l.assigned_to WHERE l.id = $1
  `, [Number(id)]);
  if (!row) throw err.notFound('Không tìm thấy khách tiềm năng này.');
  return { ...shape(row), notes: await listNotes(row.id) };
}

/** Chỉ người phụ trách, hoặc người có quyền xoá (quản trị trở lên), mới sửa được. */
export function assertCanEdit(lead, viewer) {
  if (can(viewer, 'leads.delete')) return;
  if (lead.assignedTo && lead.assignedTo !== viewer.id) {
    throw err.forbidden('Khách tiềm năng này do người khác phụ trách.');
  }
}

export async function setStatus(id, status) {
  if (!isStatus(status)) throw err.validation('Trạng thái không hợp lệ.');
  const n = await run(`UPDATE leads SET status = $1, updated_at = now() WHERE id = $2`, [status, Number(id)]);
  if (!n) throw err.notFound('Không tìm thấy khách tiềm năng này.');
}

export async function assign(id, userId) {
  if (userId !== null) {
    const u = await one(`SELECT id FROM users WHERE id = $1 AND active`, [Number(userId)]);
    if (!u) throw err.validation('Người phụ trách không tồn tại hoặc đã bị khoá.');
  }
  const n = await run(`UPDATE leads SET assigned_to = $1, updated_at = now() WHERE id = $2`,
    [userId === null ? null : Number(userId), Number(id)]);
  if (!n) throw err.notFound('Không tìm thấy khách tiềm năng này.');
}

export async function setValue(id, valueVnd) {
  const v = Number(valueVnd);
  if (!Number.isFinite(v) || v < 0 || v > 1e12) throw err.validation('Giá trị hợp đồng không hợp lệ.');
  await run(`UPDATE leads SET value_vnd = $1, updated_at = now() WHERE id = $2`, [Math.round(v), Number(id)]);
}

export async function deleteLead(id) {
  const n = await run(`DELETE FROM leads WHERE id = $1`, [Number(id)]);
  if (!n) throw err.notFound('Không tìm thấy khách tiềm năng này.');
}

/* ---------- Ghi chú ---------- */
export async function addNote(leadId, { body, author }) {
  const text = String(body || '').trim().slice(0, 4000);
  if (text.length < 2) throw err.validation('Ghi chú quá ngắn.');
  const r = await one(`
    INSERT INTO lead_notes (lead_id, author_id, author_name, body) VALUES ($1, $2, $3, $4)
    RETURNING id
  `, [Number(leadId), author?.id ?? null, author?.name ?? null, text]);
  await run(`UPDATE leads SET updated_at = now() WHERE id = $1`, [Number(leadId)]);
  return r.id;
}

export const listNotes = leadId =>
  all(`SELECT id, created_at, author_name, body FROM lead_notes WHERE lead_id = $1 ORDER BY id DESC`,
    [Number(leadId)]);

/* ---------- Kết xuất ---------- */
/** CSV có BOM UTF-8 để Excel bản tiếng Việt mở không bị vỡ dấu. */
export async function exportCsv(filters = {}) {
  const { rows } = await listLeads({ ...filters, limit: 5000, offset: 0 });
  const cols = ['id', 'createdAt', 'name', 'phone', 'email', 'company', 'industry', 'service',
    'source', 'status', 'score', 'tier', 'assigneeName', 'valueVnd', 'message'];
  const head = ['Mã', 'Thời điểm', 'Họ tên', 'Điện thoại', 'Email', 'Công ty', 'Ngành', 'Dịch vụ',
    'Nguồn', 'Trạng thái', 'Điểm', 'Bậc', 'Phụ trách', 'Giá trị (VND)', 'Lời nhắn'];

  // Chặn chèn công thức: Excel diễn giải ô mở đầu bằng dấu bằng, cộng, trừ hay
  // a-còng là công thức — một tệp kết xuất cũng có thể thành mã chạy được.
  const cell = v => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    const safe = /^[=+\-@\t\r]/.test(s) ? String.fromCharCode(39) + s : s;
    return '"' + safe.replace(/"/g, '""') + '"';
  };

  return '﻿' + [head.map(cell).join(','), ...rows.map(r => cols.map(c => cell(r[c])).join(','))].join('\r\n');
}

/* ---------- Số liệu tổng quan ---------- */
export async function summary() {
  /* Tám phép đếm một dòng gộp vào một lần đi mạng. Với CSDL ở xa, tách ra thành
     tám lượt sẽ cộng dồn gần một giây chỉ để mở trang tổng quan. */
  const [s, byStatus, bySource, byIndustry, daily] = await Promise.all([
    one(`
      SELECT
        (SELECT COUNT(*) FROM leads)                                                AS leads_total,
        (SELECT COUNT(*) FROM leads WHERE created_at::date = current_date)          AS leads_today,
        (SELECT COUNT(*) FROM leads WHERE created_at >= now() - interval '7 days')  AS leads_7d,
        (SELECT COUNT(*) FROM leads WHERE created_at >= now() - interval '30 days') AS leads_30d,
        (SELECT COUNT(*) FROM leads WHERE status='won')                             AS won,
        (SELECT COALESCE(SUM(value_vnd),0) FROM leads WHERE status='won')           AS won_value,
        (SELECT COUNT(*) FROM diagnostics)                                          AS diagnostics,
        (SELECT ROUND(AVG(overall),1) FROM diagnostics)                             AS avg_score
    `),
    all(`SELECT status, COUNT(*) c FROM leads GROUP BY status`),
    all(`SELECT source, COUNT(*) c FROM leads GROUP BY source ORDER BY c DESC`),
    all(`SELECT industry, COUNT(*) c FROM leads WHERE industry IS NOT NULL GROUP BY industry ORDER BY c DESC LIMIT 10`),
    all(`
      SELECT created_at::date AS d, COUNT(*) c FROM leads
      WHERE created_at >= now() - interval '30 days' GROUP BY d ORDER BY d
    `)
  ]);

  return {
    leadsTotal: s.leads_total,
    leadsToday: s.leads_today,
    leads7d: s.leads_7d,
    leads30d: s.leads_30d,
    won: s.won,
    wonValue: s.won_value,
    diagnostics: s.diagnostics,
    avgScore: s.avg_score,
    byStatus, bySource, byIndustry,
    // `created_at::date` về dưới dạng Date; bảng điều khiển cần chuỗi YYYY-MM-DD.
    daily: daily.map(r => ({ d: String(r.d).slice(0, 10), c: r.c }))
  };
}

function shape(r) {
  return {
    id: r.id,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    name: r.name,
    phone: r.phone,
    email: r.email,
    company: r.company,
    industry: r.industry,
    service: r.service,
    message: r.message,
    source: r.source,
    page: r.page,
    referrer: r.referrer,
    utm: parse(r.utm),
    score: r.score,
    tier: r.tier,
    diagnostic: parse(r.diagnostic),
    status: r.status,
    assignedTo: r.assigned_to ?? null,
    assigneeName: r.assignee_name ?? null,
    valueVnd: r.value_vnd ?? null
  };
}

const parse = s => { try { return s ? JSON.parse(s) : null; } catch { return null; } };
