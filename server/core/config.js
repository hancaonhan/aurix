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

  /* --- Lưu trữ --- */
  dbPath: str('AURIX_DB', join(ROOT, 'server', 'data', 'aurix.db')),
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
  if (config.isProd) {
    if (!config.origin.startsWith('https://')) warn.push('AURIX_ORIGIN nên dùng https ở môi trường thật.');
    if (!config.mail.enabled) warn.push('Chưa cấu hình SMTP — thư thông báo khách tiềm năng sẽ nằm lại trong hàng đợi.');
    if (config.security.sessionSecret.length < 32) warn.push('AURIX_SESSION_SECRET quá ngắn (cần ≥ 32 ký tự).');
    if (!process.env.AURIX_IP_SALT && !file.AURIX_IP_SALT) warn.push('AURIX_IP_SALT chưa đặt — giới hạn tần suất sẽ lệch sau mỗi lần khởi động lại.');
  }
  return warn;
}

export default config;
