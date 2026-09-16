/**
 * Truy cập dữ liệu nghiệp vụ — khách tiềm năng, chẩn đoán, sự kiện, hàng đợi thư.
 *
 * Lược đồ không còn được tạo ở đây: nó nằm trong `server/db/migrations.js` và
 * do bộ chạy migration dựng lên. Tệp này chỉ còn các câu truy vấn.
 */
import db, { DB_PATH } from '../db/index.js';

export { db, DB_PATH };

/* ---------- Câu lệnh chuẩn bị sẵn ---------- */
const insertLead = db.prepare(`
  INSERT INTO leads (name, phone, email, company, industry, service, message,
                     source, page, referrer, utm, score, tier, diagnostic, ip_hash, user_agent)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertDiagnostic = db.prepare(`
  INSERT INTO diagnostics (industry, revenue, overall, tier, layers, answers, leak_month, ip_hash)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertEvent = db.prepare(`INSERT INTO events (kind, detail) VALUES (?, ?)`);

export function saveLead(l) {
  const r = insertLead.run(
    l.name, l.phone, l.email, l.company || null, l.industry || null, l.service || null,
    l.message || null, l.source || null, l.page || null, l.referrer || null,
    l.utm ? JSON.stringify(l.utm) : null,
    l.score ?? null, l.tier || null,
    l.diagnostic ? JSON.stringify(l.diagnostic) : null,
    l.ipHash || null, l.userAgent || null
  );
  return Number(r.lastInsertRowid);
}

export function saveDiagnostic(d) {
  const r = insertDiagnostic.run(
    d.industry || null, d.revenue ?? null, d.overall, d.tier || null,
    JSON.stringify(d.layers), JSON.stringify(d.answers), d.leakMonth ?? null, d.ipHash || null
  );
  return Number(r.lastInsertRowid);
}

export function logEvent(kind, detail) {
  try { insertEvent.run(kind, detail ? JSON.stringify(detail) : null); } catch { /* không chặn request */ }
}

export function listLeads({ limit = 100, offset = 0, status } = {}) {
  const sql = status
    ? `SELECT * FROM leads WHERE status = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`
    : `SELECT * FROM leads ORDER BY created_at DESC LIMIT ? OFFSET ?`;
  const stmt = db.prepare(sql);
  return status ? stmt.all(status, limit, offset) : stmt.all(limit, offset);
}

export function stats() {
  const one = sql => db.prepare(sql).get();
  return {
    leadsTotal: one(`SELECT COUNT(*) c FROM leads`).c,
    leadsToday: one(`SELECT COUNT(*) c FROM leads WHERE date(created_at) = date('now')`).c,
    leads7d: one(`SELECT COUNT(*) c FROM leads WHERE created_at >= datetime('now','-7 days')`).c,
    diagnostics: one(`SELECT COUNT(*) c FROM diagnostics`).c,
    avgScore: one(`SELECT ROUND(AVG(overall),1) a FROM diagnostics`).a,
    bySource: db.prepare(`SELECT source, COUNT(*) c FROM leads GROUP BY source ORDER BY c DESC`).all(),
    byIndustry: db.prepare(`SELECT industry, COUNT(*) c FROM leads WHERE industry IS NOT NULL GROUP BY industry ORDER BY c DESC`).all()
  };
}

export function setLeadStatus(id, status) {
  db.prepare(`UPDATE leads SET status = ? WHERE id = ?`).run(status, id);
}


/* ==========================================================================
   Hàng đợi gửi thư
   Email không bao giờ được gửi đồng bộ trong lúc xử lý biểu mẫu: máy chủ thư
   chậm hoặc chết không được phép làm khách mất dữ liệu. Mọi thư vào hàng đợi
   trước, một tiến trình nền rút ra gửi và thử lại khi lỗi.
   ========================================================================== */

const insertMail = db.prepare(`
  INSERT INTO outbox (kind, recipient, subject, html, text, reply_to, lead_id)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

export function queueMail(m) {
  const r = insertMail.run(
    m.kind, [].concat(m.to).join(','), m.subject, m.html, m.text, m.replyTo || null, m.leadId ?? null
  );
  return Number(r.lastInsertRowid);
}

export function dueMail(limit = 10) {
  return db.prepare(`
    SELECT * FROM outbox
    WHERE status = 'pending' AND next_try_at <= datetime('now')
    ORDER BY id LIMIT ?
  `).all(limit);
}

export function markMailSent(id) {
  db.prepare(`UPDATE outbox SET status='sent', sent_at=datetime('now'), last_error=NULL WHERE id=?`).run(id);
}

/** Lùi thời gian thử lại theo cấp số nhân; bỏ cuộc sau 6 lần. */
export function markMailFailed(id, attempts, message) {
  const delayMin = Math.min(60 * 8, Math.pow(3, attempts));
  const giveUp = attempts >= 6;
  db.prepare(`
    UPDATE outbox
    SET attempts = ?, last_error = ?,
        status = ?,
        next_try_at = datetime('now', ?)
    WHERE id = ?
  `).run(attempts, String(message).slice(0, 500), giveUp ? 'failed' : 'pending', `+${delayMin} minutes`, id);
}

export function mailStats() {
  const rows = db.prepare(`SELECT status, COUNT(*) c FROM outbox GROUP BY status`).all();
  return Object.fromEntries(rows.map(r => [r.status, r.c]));
}
