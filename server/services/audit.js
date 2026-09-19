/**
 * Nhật ký kiểm toán — ai đã làm gì, lúc nào.
 *
 * Ghi lại mọi hành động có khả năng thay đổi dữ liệu hoặc quyền hạn. Đây là
 * thứ duy nhất trả lời được câu hỏi "vì sao khách này bị đổi trạng thái" sáu
 * tháng sau. Ghi nhật ký không bao giờ được làm hỏng request: mọi lỗi ở đây
 * đều bị nuốt và chỉ in ra console.
 */
import { all, run } from '../db/index.js';
import log from '../core/logger.js';

const SQL_INSERT = `
  INSERT INTO audit_log (actor_id, actor_email, action, target, detail, ip_hash, result)
  VALUES ($1, $2, $3, $4, $5, $6, $7)
`;

/**
 * Ghi một dòng nhật ký.
 *
 * **Không trả về Promise và không cần `await`.** Đây là lựa chọn có ý thức: hàm
 * này được gọi từ hàng chục handler, và nhật ký chậm hay lỗi không được phép
 * làm request chậm theo hoặc gãy. Câu lệnh được bắn đi rồi bỏ đó; lỗi chỉ ghi
 * cảnh báo. Cần chắc chắn dòng nhật ký đã xuống đĩa thì dùng `auditSync()`.
 *
 * @param {object} o
 * @param {{id?: number, email?: string}} [o.actor]  người thực hiện
 * @param {string} o.action   ví dụ 'lead.status.change'
 * @param {string} [o.target] đối tượng bị tác động, ví dụ 'lead:42'
 * @param {object} [o.detail] dữ liệu phụ — tránh đưa dữ liệu cá nhân vào đây
 * @param {'ok'|'denied'|'error'} [o.result]
 */
export function audit(o) {
  auditSync(o).catch(e => log.warn('Không ghi được nhật ký kiểm toán', { action: o?.action, error: e.message }));
}

/** Như `audit()` nhưng trả về Promise — dùng khi cần chờ ghi xong. */
export async function auditSync({ actor, action, target, detail, ipHash, result = 'ok' }) {
  await run(SQL_INSERT, [
    actor?.id ?? null,
    actor?.email ?? null,
    action,
    target ?? null,
    detail ? JSON.stringify(detail).slice(0, 2000) : null,
    ipHash ?? null,
    result
  ]);
}

export function listAudit({ limit = 200, offset = 0, action, actorId } = {}) {
  const where = [];
  const args = [];
  if (action) { where.push(`action LIKE $${args.length + 1}`); args.push(action + '%'); }
  if (actorId) { where.push(`actor_id = $${args.length + 1}`); args.push(actorId); }
  const clause = where.length ? 'WHERE ' + where.join(' AND ') : '';
  return all(
    `SELECT * FROM audit_log ${clause} ORDER BY id DESC LIMIT $${args.length + 1} OFFSET $${args.length + 2}`,
    [...args, limit, offset]
  );
}

/** Xoá nhật ký cũ hơn N ngày — gọi từ CLI, không tự chạy. */
export async function pruneAudit(days = 365) {
  return (await run(
    `DELETE FROM audit_log WHERE created_at < now() - ($1 || ' days')::interval`,
    [String(days)]
  )) || 0;
}
