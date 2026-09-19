/**
 * Truy cập dữ liệu nghiệp vụ — khách tiềm năng, chẩn đoán, sự kiện, hàng đợi thư.
 *
 * Lược đồ không được tạo ở đây: nó nằm trong `server/db/migrations.js` và do bộ
 * chạy migration dựng lên. Tệp này chỉ còn các câu truy vấn.
 *
 * Mọi hàm ở đây **bất đồng bộ** — `pg` không có API đồng bộ. Nơi gọi phải `await`.
 */
import { all, one, run } from '../db/index.js';

export { all, one, run };

export async function saveLead(l) {
  const r = await one(`
    INSERT INTO leads (name, phone, email, company, industry, service, message,
                       source, page, referrer, utm, score, tier, diagnostic, ip_hash, user_agent)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    RETURNING id
  `, [
    l.name, l.phone, l.email, l.company || null, l.industry || null, l.service || null,
    l.message || null, l.source || null, l.page || null, l.referrer || null,
    l.utm ? JSON.stringify(l.utm) : null,
    l.score ?? null, l.tier || null,
    l.diagnostic ? JSON.stringify(l.diagnostic) : null,
    l.ipHash || null, l.userAgent || null
  ]);
  return r.id;
}

export async function saveDiagnostic(d) {
  const r = await one(`
    INSERT INTO diagnostics (industry, revenue, overall, tier, layers, answers, leak_month, ip_hash)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id
  `, [
    d.industry || null, d.revenue ?? null, d.overall, d.tier || null,
    JSON.stringify(d.layers), JSON.stringify(d.answers), d.leakMonth ?? null, d.ipHash || null
  ]);
  return r.id;
}

/** Ghi một sự kiện. Không bao giờ ném lỗi — thống kê không được phép làm gãy request. */
export async function logEvent(kind, detail) {
  try {
    await run(`INSERT INTO events (kind, detail) VALUES ($1, $2)`, [kind, detail ? JSON.stringify(detail) : null]);
  } catch { /* bỏ qua */ }
}

export async function listLeads({ limit = 100, offset = 0, status } = {}) {
  return status
    ? all(`SELECT * FROM leads WHERE status = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`, [status, limit, offset])
    : all(`SELECT * FROM leads ORDER BY created_at DESC LIMIT $1 OFFSET $2`, [limit, offset]);
}

export async function stats() {
  /* Gộp các phép đếm một dòng vào một lần đi mạng. Với CSDL ở xa, mỗi truy vấn
     tốn cả trăm mili giây, nên bảy lần gọi riêng sẽ thấy chậm rõ rệt. */
  const s = await one(`
    SELECT
      (SELECT COUNT(*) FROM leads)                                              AS leads_total,
      (SELECT COUNT(*) FROM leads WHERE created_at::date = current_date)        AS leads_today,
      (SELECT COUNT(*) FROM leads WHERE created_at >= now() - interval '7 days') AS leads_7d,
      (SELECT COUNT(*) FROM diagnostics)                                        AS diagnostics,
      (SELECT ROUND(AVG(overall), 1) FROM diagnostics)                          AS avg_score
  `);
  const [bySource, byIndustry] = await Promise.all([
    all(`SELECT source, COUNT(*) c FROM leads GROUP BY source ORDER BY c DESC`),
    all(`SELECT industry, COUNT(*) c FROM leads WHERE industry IS NOT NULL GROUP BY industry ORDER BY c DESC`)
  ]);
  return {
    leadsTotal: s.leads_total,
    leadsToday: s.leads_today,
    leads7d: s.leads_7d,
    diagnostics: s.diagnostics,
    avgScore: s.avg_score,
    bySource,
    byIndustry
  };
}

export async function setLeadStatus(id, status) {
  await run(`UPDATE leads SET status = $1 WHERE id = $2`, [status, id]);
}


/* ==========================================================================
   Hàng đợi gửi thư
   Email không bao giờ được gửi đồng bộ trong lúc xử lý biểu mẫu: máy chủ thư
   chậm hoặc chết không được phép làm khách mất dữ liệu. Mọi thư vào hàng đợi
   trước, một tiến trình nền rút ra gửi và thử lại khi lỗi.
   ========================================================================== */

export async function queueMail(m) {
  const r = await one(`
    INSERT INTO outbox (kind, recipient, subject, html, text, reply_to, lead_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id
  `, [m.kind, [].concat(m.to).join(','), m.subject, m.html, m.text, m.replyTo || null, m.leadId ?? null]);
  return r.id;
}

export async function dueMail(limit = 10) {
  return all(`
    SELECT * FROM outbox
    WHERE status = 'pending' AND next_try_at <= now()
    ORDER BY id LIMIT $1
  `, [limit]);
}

export async function markMailSent(id) {
  await run(`UPDATE outbox SET status='sent', sent_at=now(), last_error=NULL WHERE id=$1`, [id]);
}

/** Lùi thời gian thử lại theo cấp số nhân; bỏ cuộc sau 6 lần. */
export async function markMailFailed(id, attempts, message) {
  const delayMin = Math.min(60 * 8, Math.pow(3, attempts));
  const giveUp = attempts >= 6;
  await run(`
    UPDATE outbox
    SET attempts = $1, last_error = $2,
        status = $3,
        next_try_at = now() + ($4 || ' minutes')::interval
    WHERE id = $5
  `, [attempts, String(message).slice(0, 500), giveUp ? 'failed' : 'pending', String(delayMin), id]);
}

export async function mailStats() {
  const rows = await all(`SELECT status, COUNT(*) c FROM outbox GROUP BY status`);
  return Object.fromEntries(rows.map(r => [r.status, r.c]));
}
