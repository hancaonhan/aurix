/**
 * Lược đồ cơ sở dữ liệu, dạng migration đánh số.
 *
 * QUY TẮC: đã chạy trên môi trường thật thì **không sửa** mục cũ — thêm mục mới.
 * Mỗi mục phải idempotent (dùng IF NOT EXISTS) để chạy lại không gây lỗi.
 */
export const MIGRATIONS = [
  {
    id: 1,
    name: 'core — khách tiềm năng, chẩn đoán, sự kiện, hàng đợi thư',
    sql: `
      CREATE TABLE IF NOT EXISTS leads (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
        name        TEXT    NOT NULL,
        phone       TEXT    NOT NULL,
        email       TEXT    NOT NULL,
        company     TEXT,
        industry    TEXT,
        service     TEXT,
        message     TEXT,
        source      TEXT,
        page        TEXT,
        referrer    TEXT,
        utm         TEXT,
        score       INTEGER,
        tier        TEXT,
        diagnostic  TEXT,
        status      TEXT    NOT NULL DEFAULT 'new',
        ip_hash     TEXT,
        user_agent  TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_leads_status  ON leads(status);
      CREATE INDEX IF NOT EXISTS idx_leads_source  ON leads(source);

      CREATE TABLE IF NOT EXISTS diagnostics (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
        industry    TEXT,
        revenue     INTEGER,
        overall     INTEGER NOT NULL,
        tier        TEXT,
        layers      TEXT    NOT NULL,
        answers     TEXT    NOT NULL,
        leak_month  INTEGER,
        ip_hash     TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_diag_created ON diagnostics(created_at DESC);

      CREATE TABLE IF NOT EXISTS events (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
        kind        TEXT    NOT NULL,
        detail      TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_events_created ON events(created_at DESC);

      CREATE TABLE IF NOT EXISTS outbox (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
        kind         TEXT    NOT NULL,
        recipient    TEXT    NOT NULL,
        subject      TEXT    NOT NULL,
        html         TEXT    NOT NULL,
        text         TEXT    NOT NULL,
        reply_to     TEXT,
        lead_id      INTEGER,
        status       TEXT    NOT NULL DEFAULT 'pending',
        attempts     INTEGER NOT NULL DEFAULT 0,
        next_try_at  TEXT    NOT NULL DEFAULT (datetime('now')),
        last_error   TEXT,
        sent_at      TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_outbox_due ON outbox(status, next_try_at);
    `
  },

  {
    id: 2,
    name: 'danh tính — tài khoản, phiên đăng nhập, nhật ký kiểm toán',
    sql: `
      CREATE TABLE IF NOT EXISTS users (
        id             INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at     TEXT    NOT NULL DEFAULT (datetime('now')),
        updated_at     TEXT    NOT NULL DEFAULT (datetime('now')),
        email          TEXT    NOT NULL UNIQUE COLLATE NOCASE,
        name           TEXT    NOT NULL,
        password_hash  TEXT    NOT NULL,
        role           TEXT    NOT NULL DEFAULT 'viewer',
        active         INTEGER NOT NULL DEFAULT 1,
        must_change_pw INTEGER NOT NULL DEFAULT 0,
        last_login_at  TEXT,
        failed_count   INTEGER NOT NULL DEFAULT 0,
        locked_until   TEXT
      );
      CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email COLLATE NOCASE);

      CREATE TABLE IF NOT EXISTS sessions (
        id          TEXT    PRIMARY KEY,           -- SHA-256 của mã phiên, không lưu mã gốc
        user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
        last_seen   TEXT    NOT NULL DEFAULT (datetime('now')),
        expires_at  TEXT    NOT NULL,
        csrf_token  TEXT    NOT NULL,
        ip_hash     TEXT,
        user_agent  TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_sessions_user    ON sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

      CREATE TABLE IF NOT EXISTS audit_log (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
        actor_id    INTEGER,
        actor_email TEXT,
        action      TEXT    NOT NULL,
        target      TEXT,
        detail      TEXT,
        ip_hash     TEXT,
        result      TEXT    NOT NULL DEFAULT 'ok'
      );
      CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_audit_actor   ON audit_log(actor_id);
      CREATE INDEX IF NOT EXISTS idx_audit_action  ON audit_log(action);
    `
  },

  {
    id: 3,
    name: 'vận hành bán hàng — ghi chú và người phụ trách khách tiềm năng',
    sql: `
      ALTER TABLE leads ADD COLUMN assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL;
      ALTER TABLE leads ADD COLUMN updated_at  TEXT;
      ALTER TABLE leads ADD COLUMN value_vnd   INTEGER;

      CREATE TABLE IF NOT EXISTS lead_notes (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
        lead_id     INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
        author_id   INTEGER REFERENCES users(id) ON DELETE SET NULL,
        author_name TEXT,
        body        TEXT    NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_notes_lead ON lead_notes(lead_id, created_at DESC);
    `
  },

  {
    id: 4,
    name: 'nội dung động — tham số site sửa được từ bảng điều khiển',
    sql: `
      CREATE TABLE IF NOT EXISTS settings (
        key         TEXT PRIMARY KEY,
        value       TEXT NOT NULL,
        updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
        updated_by  INTEGER REFERENCES users(id) ON DELETE SET NULL
      );
    `
  },

  {
    id: 5,
    name: 'nội dung — lớp phủ cho phép sửa/thêm/xoá mọi mục từ bảng điều khiển',
    sql: `
      -- Lớp phủ nội dung.
      --
      -- Dữ liệu gốc vẫn nằm trong site/data/*.js và vẫn là bản chuẩn đi kèm mã
      -- nguồn. Bảng này chỉ ghi phần KHÁC BIỆT do người dùng tạo ra: sửa một
      -- mục, thêm mục mới, hoặc ẩn một mục có sẵn.
      --
      -- Chọn cách này thay vì nhồi toàn bộ nội dung vào cơ sở dữ liệu vì hai lẽ:
      -- website vẫn khởi động được và vẫn đầy đủ khi tệp dữ liệu trống rỗng, và
      -- mọi thay đổi đều hoàn tác được bằng một nút bấm — xoá dòng phủ là nội
      -- dung gốc trở lại y nguyên.
      CREATE TABLE IF NOT EXISTS content (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        collection  TEXT    NOT NULL,
        item_id     TEXT    NOT NULL,
        data        TEXT,                        -- JSON; NULL khi chỉ đánh dấu xoá
        origin      TEXT    NOT NULL DEFAULT 'override',  -- override | new
        deleted     INTEGER NOT NULL DEFAULT 0,
        position    INTEGER,
        created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
        updated_at  TEXT    NOT NULL DEFAULT (datetime('now')),
        updated_by  INTEGER REFERENCES users(id) ON DELETE SET NULL
      );
      CREATE UNIQUE INDEX IF NOT EXISTS idx_content_item ON content(collection, item_id);
      CREATE INDEX IF NOT EXISTS idx_content_collection ON content(collection);
    `
  }
];

export default MIGRATIONS;
