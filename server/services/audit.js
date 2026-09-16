/**
 * Nhật ký kiểm toán — ai đã làm gì, lúc nào.
 *
 * Ghi lại mọi hành động có khả năng thay đổi dữ liệu hoặc quyền hạn. Đây là
 * thứ duy nhất trả lời được câu hỏi "vì sao khách này bị đổi trạng thái" sáu
 * tháng sau. Ghi nhật ký không bao giờ được làm hỏng request: mọi lỗi ở đây
 * đều bị nuốt và chỉ in ra console.
 */
import db from '../db/index.js';
import log from '../core/logger.js';

const stmt = db.prepare(`
  INSERT INTO audit_log (actor_id, actor_email, action, target, detail, ip_hash, result)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

/**
 * @param {object} o
 * @param {{id?: number, email?: string}} [o.actor]  người thực hiện
 * @param {string} o.action   ví dụ 'lead.status.change'
 * @param {string} [o.target] đối tượng bị tác động, ví dụ 'lead:42'
 * @param {object} [o.detail] dữ liệu phụ — tránh đưa dữ liệu cá nhân vào đây
 * @param {'ok'|'denied'|'error'} [o.result]
 */
export function audit({ actor, action, target, detail, ipHash, result = 'ok' }) {
  try {
    stmt.run(
      actor?.id ?? null,
      actor?.email ?? null,
      action,
      target ?? null,
      detail ? JSON.stringify(detail).slice(0, 2000) : null,
      ipHash ?? null,
      result
    );
  } catch (e) {
    log.warn('Không ghi được nhật ký kiểm toán', { action, error: e.message });
  }
}

export function listAudit({ limit = 200, offset = 0, action, actorId } = {}) {
  const where = [];
  const args = [];
  if (action) { where.push('action LIKE ?'); args.push(action + '%'); }
  if (actorId) { where.push('actor_id = ?'); args.push(actorId); }
  const clause = where.length ? 'WHERE ' + where.join(' AND ') : '';
  return db.prepare(
    `SELECT * FROM audit_log ${clause} ORDER BY id DESC LIMIT ? OFFSET ?`
  ).all(...args, limit, offset);
}

/** Xoá nhật ký cũ hơn N ngày — gọi từ CLI, không tự chạy. */
export function pruneAudit(days = 365) {
  const r = db.prepare(`DELETE FROM audit_log WHERE created_at < datetime('now', ?)`).run(`-${days} days`);
  return Number(r.changes || 0);
}
