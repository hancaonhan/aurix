/**
 * Bộ chạy migration.
 *
 * Kết nối nằm ở `db/pool.js`; tệp này chỉ lo đưa lược đồ lên bản mới nhất.
 * Lược đồ được mô tả bằng các migration đánh số trong `server/db/migrations.js`:
 * mỗi migration chạy đúng một lần, được ghi lại trong bảng `schema_migrations`.
 * Nâng cấp lược đồ = thêm một mục vào mảng đó, không sửa mục đã chạy.
 *
 * Khác bản SQLite cũ: PostgreSQL cho phép bọc DDL trong giao dịch, nên mỗi
 * migration chạy trọn vẹn hoặc không chạy gì cả — không còn tình trạng nửa vời
 * khi câu lệnh thứ ba trong một migration thất bại.
 */
import { all, run, tx } from './pool.js';
import log from '../core/logger.js';
import { MIGRATIONS } from './migrations.js';

/**
 * Chạy mọi migration chưa áp dụng. Trả về danh sách tên đã chạy.
 *
 * **Không tự chạy lúc nạp module** — khác bản SQLite cũ. Điểm vào nào cần cơ sở
 * dữ liệu thì tự gọi: `server/server.js` lúc khởi động, `server/cli.js` ở các
 * lệnh chạm dữ liệu. Nhờ vậy `scripts/build.js` nạp được tầng nội dung mà không
 * cần cơ sở dữ liệu nào — dựng trang tĩnh trên máy chưa có `.env` vẫn chạy.
 */
export async function migrate({ quiet = false } = {}) {
  await run(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id         INTEGER     PRIMARY KEY,
      name       TEXT        NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  const rows = await all(`SELECT id FROM schema_migrations`);
  const done = new Set(rows.map(r => r.id));
  const applied = [];

  for (const m of MIGRATIONS) {
    if (done.has(m.id)) continue;
    try {
      await tx(async t => {
        await t.run(m.sql);
        await t.run(`INSERT INTO schema_migrations (id, name) VALUES ($1, $2)`, [m.id, m.name]);
      });
      applied.push(m.name);
      if (!quiet) log.info('Đã áp dụng migration', { id: m.id, name: m.name });
    } catch (e) {
      log.error('Migration thất bại', { id: m.id, name: m.name, error: e.message });
      throw e;
    }
  }
  return applied;
}

/**
 * Số hiệu migration mới nhất **theo mã nguồn** — không cần chạm cơ sở dữ liệu.
 *
 * Dùng cho `/api/health` và `/api/version`: hai điểm cuối này bị nền tảng gọi
 * liên tục, nên chúng không được phụ thuộc vào cơ sở dữ liệu. Nếu có, một nhịp
 * CSDL chậm sẽ làm health check thất bại và Vibe Host khởi động lại container
 * một cách vô cớ.
 */
export const SCHEMA_VERSION = MIGRATIONS.at(-1)?.id ?? 0;

/** Trạng thái lược đồ đầy đủ — có truy vấn CSDL. Dùng cho CLI và bảng điều khiển. */
export async function schemaStatus() {
  const rows = await all(`SELECT id, name, applied_at FROM schema_migrations ORDER BY id`);
  return {
    applied: rows,
    pending: MIGRATIONS.filter(m => !rows.some(r => r.id === m.id)).map(m => ({ id: m.id, name: m.name })),
    latest: MIGRATIONS.at(-1)?.id ?? 0
  };
}

export { all, one, run, tx, query, close, getPool, isOpen } from './pool.js';
