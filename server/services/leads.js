/**
 * Nghiệp vụ khách tiềm năng.
 *
 * Tầng này nằm giữa handler HTTP và cơ sở dữ liệu: nó biết về quyền hạn theo
 * phạm vi (nhân viên kinh doanh chỉ thấy khách được giao, trừ khi có quyền
 * rộng hơn), về vòng đời trạng thái, và về việc mọi thay đổi đều phải để lại
 * dấu vết kiểm toán.
 */
import db from '../db/index.js';
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
export function listLeads({
  limit = 50, offset = 0, status, source, industry, q,
  assignedTo, sort = 'created_at', dir = 'desc', viewer = null, scopeToViewer = false
} = {}) {
  const where = [];
  const args = [];

  if (status && isStatus(status)) { where.push('l.status = ?'); args.push(status); }
  if (source) { where.push('l.source = ?'); args.push(source); }
  if (industry) { where.push('l.industry = ?'); args.push(industry); }
  if (assignedTo === 'none') where.push('l.assigned_to IS NULL');
  else if (assignedTo) { where.push('l.assigned_to = ?'); args.push(Number(assignedTo)); }

  if (q) {
    where.push('(l.name LIKE ? OR l.phone LIKE ? OR l.email LIKE ? OR l.company LIKE ?)');
    const like = `%${String(q).slice(0, 80)}%`;
    args.push(like, like, like, like);
  }

  if (scopeToViewer && viewer) {
    where.push('(l.assigned_to = ? OR l.assigned_to IS NULL)');
    args.push(viewer.id);
  }

  const clause = where.length ? 'WHERE ' + where.join(' AND ') : '';
  const orderCol = SORTABLE.has(sort) ? sort : 'created_at';
  const orderDir = String(dir).toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  const rows = db.prepare(`
    SELECT l.*, u.name AS assignee_name
    FROM leads l LEFT JOIN users u ON u.id = l.assigned_to
    ${clause}
    ORDER BY l.${orderCol} ${orderDir}
    LIMIT ? OFFSET ?
  `).all(...args, Math.min(Number(limit) || 50, 500), Number(offset) || 0);

  const total = db.prepare(`SELECT COUNT(*) c FROM leads l ${clause}`).get(...args).c;

  return { rows: rows.map(shape), total, limit: Number(limit), offset: Number(offset) };
}

export function getLead(id) {
  const row = db.prepare(`
    SELECT l.*, u.name AS assignee_name
    FROM leads l LEFT JOIN users u ON u.id = l.assigned_to WHERE l.id = ?
  `).get(Number(id));
  if (!row) throw err.notFound('Không tìm thấy khách tiềm năng này.');
  return { ...shape(row), notes: listNotes(row.id) };
}

/** Chỉ người phụ trách, hoặc người có quyền xoá (quản trị trở lên), mới sửa được. */
export function assertCanEdit(lead, viewer) {
  if (can(viewer, 'leads.delete')) return;
  if (lead.assignedTo && lead.assignedTo !== viewer.id) {
    throw err.forbidden('Khách tiềm năng này do người khác phụ trách.');
  }
}

export function setStatus(id, status) {
  if (!isStatus(status)) throw err.validation('Trạng thái không hợp lệ.');
  const r = db.prepare(`UPDATE leads SET status = ?, updated_at = datetime('now') WHERE id = ?`)
    .run(status, Number(id));
  if (!r.changes) throw err.notFound('Không tìm thấy khách tiềm năng này.');
}

export function assign(id, userId) {
  if (userId !== null) {
    const u = db.prepare(`SELECT id FROM users WHERE id = ? AND active = 1`).get(Number(userId));
    if (!u) throw err.validation('Người phụ trách không tồn tại hoặc đã bị khoá.');
  }
  const r = db.prepare(`UPDATE leads SET assigned_to = ?, updated_at = datetime('now') WHERE id = ?`)
    .run(userId === null ? null : Number(userId), Number(id));
  if (!r.changes) throw err.notFound('Không tìm thấy khách tiềm năng này.');
}

export function setValue(id, valueVnd) {
  const v = Number(valueVnd);
  if (!Number.isFinite(v) || v < 0 || v > 1e12) throw err.validation('Giá trị hợp đồng không hợp lệ.');
  db.prepare(`UPDATE leads SET value_vnd = ?, updated_at = datetime('now') WHERE id = ?`)
    .run(Math.round(v), Number(id));
}

export function deleteLead(id) {
  const r = db.prepare(`DELETE FROM leads WHERE id = ?`).run(Number(id));
  if (!r.changes) throw err.notFound('Không tìm thấy khách tiềm năng này.');
}

/* ---------- Ghi chú ---------- */
export function addNote(leadId, { body, author }) {
  const text = String(body || '').trim().slice(0, 4000);
  if (text.length < 2) throw err.validation('Ghi chú quá ngắn.');
  const r = db.prepare(`
    INSERT INTO lead_notes (lead_id, author_id, author_name, body) VALUES (?, ?, ?, ?)
  `).run(Number(leadId), author?.id ?? null, author?.name ?? null, text);
  db.prepare(`UPDATE leads SET updated_at = datetime('now') WHERE id = ?`).run(Number(leadId));
  return Number(r.lastInsertRowid);
}

export const listNotes = leadId =>
  db.prepare(`SELECT id, created_at, author_name, body FROM lead_notes WHERE lead_id = ? ORDER BY id DESC`)
    .all(Number(leadId));

/* ---------- Kết xuất ---------- */
/** CSV có BOM UTF-8 để Excel bản tiếng Việt mở không bị vỡ dấu. */
export function exportCsv(filters = {}) {
  const { rows } = listLeads({ ...filters, limit: 5000, offset: 0 });
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
export function summary() {
  const one = sql => db.prepare(sql).get();
  return {
    leadsTotal: one(`SELECT COUNT(*) c FROM leads`).c,
    leadsToday: one(`SELECT COUNT(*) c FROM leads WHERE date(created_at) = date('now')`).c,
    leads7d: one(`SELECT COUNT(*) c FROM leads WHERE created_at >= datetime('now','-7 days')`).c,
    leads30d: one(`SELECT COUNT(*) c FROM leads WHERE created_at >= datetime('now','-30 days')`).c,
    won: one(`SELECT COUNT(*) c FROM leads WHERE status='won'`).c,
    wonValue: one(`SELECT COALESCE(SUM(value_vnd),0) v FROM leads WHERE status='won'`).v,
    diagnostics: one(`SELECT COUNT(*) c FROM diagnostics`).c,
    avgScore: one(`SELECT ROUND(AVG(overall),1) a FROM diagnostics`).a,
    byStatus: db.prepare(`SELECT status, COUNT(*) c FROM leads GROUP BY status`).all(),
    bySource: db.prepare(`SELECT source, COUNT(*) c FROM leads GROUP BY source ORDER BY c DESC`).all(),
    byIndustry: db.prepare(`SELECT industry, COUNT(*) c FROM leads WHERE industry IS NOT NULL GROUP BY industry ORDER BY c DESC LIMIT 10`).all(),
    daily: db.prepare(`
      SELECT date(created_at) d, COUNT(*) c FROM leads
      WHERE created_at >= datetime('now','-30 days') GROUP BY d ORDER BY d
    `).all()
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
