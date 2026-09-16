/**
 * Kết nối cơ sở dữ liệu và bộ chạy migration.
 *
 * Một kết nối duy nhất cho cả tiến trình (node:sqlite, không gói ngoài).
 * Lược đồ được mô tả bằng các migration đánh số trong `server/db/migrations.js`:
 * mỗi migration chạy đúng một lần, được ghi lại trong bảng `schema_migrations`.
 * Nâng cấp lược đồ = thêm một mục vào mảng đó, không sửa mục đã chạy.
 */
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import config from '../core/config.js';
import log from '../core/logger.js';
import { MIGRATIONS } from './migrations.js';

mkdirSync(dirname(config.dbPath), { recursive: true });

export const db = new DatabaseSync(config.dbPath);

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = NORMAL;
  PRAGMA foreign_keys = ON;
  PRAGMA busy_timeout = 5000;
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    id         INTEGER PRIMARY KEY,
    name       TEXT NOT NULL,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

/** Chạy mọi migration chưa áp dụng. Trả về danh sách tên đã chạy. */
export function migrate({ quiet = false } = {}) {
  const done = new Set(db.prepare(`SELECT id FROM schema_migrations`).all().map(r => r.id));
  const applied = [];

  for (const m of MIGRATIONS) {
    if (done.has(m.id)) continue;
    // node:sqlite chưa cho phép transaction bao quanh nhiều câu lệnh DDL qua
    // exec(), nên mỗi migration tự chịu trách nhiệm idempotent (IF NOT EXISTS).
    try {
      db.exec(m.sql);
      db.prepare(`INSERT INTO schema_migrations (id, name) VALUES (?, ?)`).run(m.id, m.name);
      applied.push(m.name);
      if (!quiet) log.info('Đã áp dụng migration', { id: m.id, name: m.name });
    } catch (e) {
      log.error('Migration thất bại', { id: m.id, name: m.name, error: e.message });
      throw e;
    }
  }
  return applied;
}

/** Trạng thái lược đồ — dùng cho CLI và điểm cuối /api/health chi tiết. */
export function schemaStatus() {
  const rows = db.prepare(`SELECT id, name, applied_at FROM schema_migrations ORDER BY id`).all();
  return {
    applied: rows,
    pending: MIGRATIONS.filter(m => !rows.some(r => r.id === m.id)).map(m => ({ id: m.id, name: m.name })),
    latest: MIGRATIONS.at(-1)?.id ?? 0
  };
}

/** Chạy một hàm trong giao dịch. Ném lỗi → hoàn tác toàn bộ. */
export function tx(fn) {
  db.exec('BEGIN');
  try {
    const out = fn();
    db.exec('COMMIT');
    return out;
  } catch (e) {
    try { db.exec('ROLLBACK'); } catch { /* đã đóng */ }
    throw e;
  }
}

/* Lược đồ được đưa lên bản mới nhất ngay khi nạp module: mọi điểm vào (máy chủ,
   CLI, script) đều chuẩn bị câu lệnh SQL ngay lúc import, nên bảng phải có sẵn
   trước đó. Migration đã áp dụng thì bỏ qua, nên chi phí gần như bằng không. */
migrate({ quiet: true });

export const DB_PATH = config.dbPath;
export default db;
