/**
 * AURIX — Cấu hình trung tâm.
 *
 * Một nguồn sự thật duy nhất cho mọi tham số vận hành. Mọi module khác đọc
 * `config` chứ không đọc `process.env` trực tiếp — nhờ vậy muốn đổi cách nạp
 * cấu hình (tệp .env, biến hệ thống, kho bí mật) chỉ phải sửa đúng một chỗ.
 *
 * Nạp theo thứ tự ưu tiên tăng dần:
 *   1. giá trị mặc định trong tệp này
 *   2. tệp .env ở gốc dự án (nếu có)
 *   3. biến môi trường của tiến trình
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

/* ---------- Nạp tệp .env (không phụ thuộc gói ngoài) ---------- */
function loadDotenv(file = join(ROOT, '.env')) {
  if (!existsSync(file)) return {};
  const out = {};
  for (let line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    line = line.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

const file = loadDotenv();
const env = key => process.env[key] ?? file[key] ?? undefined;

const str = (key, fallback = '') => {
  const v = env(key);
  return v === undefined || v === '' ? fallback : String(v);
};
const num = (key, fallback) => {
  const v = Number(env(key));
  return Number.isFinite(v) ? v : fallback;
};
const bool = (key, fallback = false) => {
  const v = env(key);
  if (v === undefined || v === '') return fallback;
  return ['1', 'true', 'yes', 'on', 'có'].includes(String(v).toLowerCase());
};
const list = (key, fallback = []) => {
  const v = str(key);
  return v ? v.split(',').map(s => s.trim()).filter(Boolean) : fallback;
};

const NODE_ENV = str('NODE_ENV', 'development');
const isProd = NODE_ENV === 'production';

/* ---------- Bí mật ---------- *
 * Ở môi trường thật, thiếu bí mật là lỗi dừng máy chủ chứ không phải cảnh báo:
 * một khoá ngẫu nhiên mỗi lần khởi động sẽ âm thầm đá mọi người dùng ra ngoài
 * sau mỗi lần deploy, và tệ hơn là che mất việc bí mật chưa được cấu hình.    */
function secret(key) {
  const v = str(key);
  if (v) return v;
  if (isProd) {
    throw new Error(
      `[cấu hình] Thiếu ${key}. Sinh giá trị bằng: node server/cli.js secret, rồi đặt vào .env`
    );
  }
  return randomBytes(32).toString('hex');
}

export const config = {
  env: NODE_ENV,
  isProd,
  isDev: !isProd,

  /* --- Máy chủ --- */
  port: num('PORT', 4477),
  host: str('HOST', '0.0.0.0'),
  origin: str('AURIX_ORIGIN', 'https://aurixvietnam.vn'),
  /** Số lớp reverse proxy đáng tin phía trước. 0 = không tin x-forwarded-for. */
  trustProxy: num('AURIX_TRUST_PROXY', 1),

  /* --- Cơ sở dữ liệu --- */
  /**
   * Chuỗi kết nối PostgreSQL. Vibe Host tự tiêm `DATABASE_URL` vào container
   * (và `POSTGRES_URL` làm tên thứ hai), nên production không cần khai gì; ở máy
   * phát triển thì đặt trong `.env`.
   */
  databaseUrl: str('DATABASE_URL') || str('POSTGRES_URL'),
  /**
   * Bật TLS khi nối tới CSDL. **Mặc định tắt** vì endpoint PostgreSQL của Vibe
   * Host không hỗ trợ TLS — bật lên sẽ nhận `The server does not support SSL
   * connections` và máy chủ không khởi động được.
   *
   * Không tắt TLS ở đây là hạ bảo mật: trong cụm Vibe Host, website và CSDL nói
   * chuyện qua mạng nội bộ nên lưu lượng không ra Internet. Nhưng khi nối từ
   * ngoài qua `n1.tinhgon.xyz` thì đường truyền **không mã hoá** — chỉ dùng để
   * phát triển, và nhớ tắt "Truy cập từ bên ngoài" khi xong.
   *
   * Đổi CSDL sang nhà cung cấp có TLS (Neon, Supabase, RDS…) thì đặt
   * `AURIX_DB_SSL=true`.
   */
  dbSsl: bool('AURIX_DB_SSL', false),
  /** Số kết nối tối đa trong pool. Vibe Host giới hạn 100 cho cả instance. */
  dbPoolMax: num('AURIX_DB_POOL', 10),

  /* --- Lưu trữ tệp --- */
  backupDir: str('AURIX_BACKUP_DIR', join(ROOT, 'server', 'data', 'backups')),

  /* --- Bảo mật --- */
  security: {
    sessionSecret: secret('AURIX_SESSION_SECRET'),
    ipSalt: str('AURIX_IP_SALT') || secret('AURIX_SESSION_SECRET'),
    /** Thời gian sống của phiên đăng nhập (giây). Mặc định 12 giờ. */
    sessionTtl: num('AURIX_SESSION_TTL', 12 * 3600),
    /** Gia hạn phiên khi người dùng còn hoạt động. */
    sessionRolling: bool('AURIX_SESSION_ROLLING', true),
    /** Số lần đăng nhập sai liên tiếp trước khi khoá tài khoản tạm thời. */
    maxLoginAttempts: num('AURIX_MAX_LOGIN_ATTEMPTS', 5),
    lockoutSeconds: num('AURIX_LOCKOUT_SECONDS', 900),
    /** Yêu cầu HTTPS cho cookie phiên. Bật mặc định ở môi trường thật. */
    secureCookies: bool('AURIX_SECURE_COOKIES', isProd),
    /** Origin được phép gọi API từ trình duyệt khác miền. Rỗng = chỉ cùng miền. */
    corsOrigins: list('AURIX_CORS_ORIGINS', []),
    /** Dung lượng tối đa thân request (byte). */
    maxBodyBytes: num('AURIX_MAX_BODY', 64 * 1024),
    /** Mã truy cập cho API máy-với-máy (tích hợp CRM). Rỗng = tắt. */
    apiKeys: list('AURIX_API_KEYS', [])
  },

  /* --- Thư --- */
  mail: {
    enabled: bool('AURIX_MAIL_ENABLED', Boolean(str('SMTP_HOST'))),
    host: str('SMTP_HOST'),
    port: num('SMTP_PORT', 587),
    user: str('SMTP_USER'),
    pass: str('SMTP_PASS'),
    from: str('AURIX_MAIL_FROM', 'Aurix <no-reply@aurixvietnam.vn>'),
    salesInbox: str('AURIX_SALES_INBOX', 'admin@aurixvietnam.vn')
  },

  /* --- Nhật ký --- */
  log: {
    level: str('AURIX_LOG_LEVEL', isProd ? 'info' : 'debug'),
    /** Ghi nhật ký dạng JSON — hợp với hệ thống thu thập log trên hosting. */
    json: bool('AURIX_LOG_JSON', isProd),
    slowMs: num('AURIX_LOG_SLOW_MS', 120)
  },

  /* --- Giới hạn tần suất theo tuyến --- */
  rateLimits: {
    lead: { max: num('RL_LEAD_MAX', 5), windowMs: num('RL_LEAD_WINDOW', 10 * 60_000) },
    diagnostic: { max: num('RL_DX_MAX', 20), windowMs: num('RL_DX_WINDOW', 60_000) },
    login: { max: num('RL_LOGIN_MAX', 10), windowMs: num('RL_LOGIN_WINDOW', 10 * 60_000) },
    api: { max: num('RL_API_MAX', 120), windowMs: num('RL_API_WINDOW', 60_000) }
  }
};

/** Kiểm tra cấu hình trước khi mở cổng. Trả về danh sách cảnh báo. */
export function auditConfig() {
  const warn = [];
  if (!config.databaseUrl) {
    warn.push('DATABASE_URL chưa đặt — máy chủ không nối được cơ sở dữ liệu và sẽ không khởi động.');
  }
  if (config.isProd) {
    if (!config.origin.startsWith('https://')) warn.push('AURIX_ORIGIN nên dùng https ở môi trường thật.');
    if (!config.mail.enabled) warn.push('Chưa cấu hình SMTP — thư thông báo khách tiềm năng sẽ nằm lại trong hàng đợi.');
    if (config.security.sessionSecret.length < 32) warn.push('AURIX_SESSION_SECRET quá ngắn (cần ≥ 32 ký tự).');
    if (!process.env.AURIX_IP_SALT && !file.AURIX_IP_SALT) warn.push('AURIX_IP_SALT chưa đặt — giới hạn tần suất sẽ lệch sau mỗi lần khởi động lại.');
  }
  return warn;
}

export default config;
