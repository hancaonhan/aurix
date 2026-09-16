/**
 * Tham số site sửa được lúc đang chạy.
 *
 * Đây là lớp "tuỳ biến không cần deploy": những thứ đội ngũ kinh doanh muốn đổi
 * hằng tuần (số điện thoại hiển thị, băng-rôn khuyến mãi, bật/tắt lớp cá nhân
 * hoá) nằm ở đây thay vì nằm trong mã nguồn.
 *
 * Mỗi tham số phải được **khai báo trước** trong SCHEMA: không cho phép ghi
 * khoá tuỳ ý, vì một bảng khoá-giá trị tự do sẽ nhanh chóng thành bãi rác và là
 * một lỗ hổng lưu trữ dữ liệu chưa kiểm tra.
 */
import db from '../db/index.js';
import { err } from '../core/errors.js';

/**
 * type: 'text' | 'longtext' | 'bool' | 'number' | 'url' | 'phone'
 * Thêm tham số mới = thêm một dòng ở đây. Không cần migration.
 */
export const SCHEMA = {
  'contact.phone': {
    label: 'Điện thoại hiển thị', type: 'phone', group: 'Liên hệ',
    default: '0943 434 489', help: 'Hiện ở header, footer và nút gọi nhanh.'
  },
  'contact.zalo': {
    label: 'Liên kết Zalo', type: 'url', group: 'Liên hệ',
    default: 'https://zalo.me/0943434489'
  },
  'contact.email': {
    label: 'Email nhận liên hệ', type: 'text', group: 'Liên hệ',
    default: 'admin@aurixvietnam.vn'
  },
  'banner.enabled': {
    label: 'Bật băng-rôn thông báo', type: 'bool', group: 'Thông báo', default: false
  },
  'banner.text': {
    label: 'Nội dung băng-rôn', type: 'text', group: 'Thông báo', default: '',
    help: 'Để trống nếu không có chương trình nào đang chạy.'
  },
  'banner.href': {
    label: 'Liên kết băng-rôn', type: 'url', group: 'Thông báo', default: '/lien-he/'
  },
  'personalize.enabled': {
    label: 'Bật lớp cá nhân hoá theo ngành', type: 'bool', group: 'Tính năng', default: true,
    help: 'Tắt sẽ khiến mọi khách nhìn thấy bản trang chủ mặc định.'
  },
  'lead.autoReply': {
    label: 'Tự động gửi thư cảm ơn cho khách', type: 'bool', group: 'Tính năng', default: true
  },
  'lead.notifyInbox': {
    label: 'Hòm thư nhận thông báo khách mới', type: 'text', group: 'Tính năng',
    default: 'admin@aurixvietnam.vn'
  },
  'diagnostic.leakCapPercent': {
    label: 'Trần ước tính thất thoát (%)', type: 'number', group: 'Chẩn đoán', default: 22,
    help: 'Con số phóng đại phản tác dụng trước ban điều hành. Khuyến nghị giữ dưới 25.'
  }
};

const stmtGet = db.prepare(`SELECT value FROM settings WHERE key = ?`);
const stmtAll = db.prepare(`SELECT key, value, updated_at FROM settings`);
const stmtSet = db.prepare(`
  INSERT INTO settings (key, value, updated_by) VALUES (?, ?, ?)
  ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now'), updated_by = excluded.updated_by
`);

/* Bộ nhớ đệm trong tiến trình: các giá trị này được đọc ở mọi request nhưng gần
   như không bao giờ đổi, nên đọc cơ sở dữ liệu mỗi lần là lãng phí.
   Ghi qua API thì xoá đệm ngay; ngoài ra đệm vẫn tự hết hạn sau vài giây để một
   lệnh `cli.js settings:set` chạy từ SSH cũng có hiệu lực mà không cần khởi
   động lại máy chủ. */
const CACHE_TTL_MS = 5000;
let cache = null;
let cachedAt = 0;

export function allSettings() {
  if (cache && Date.now() - cachedAt < CACHE_TTL_MS) return cache;
  cachedAt = Date.now();
  const stored = Object.fromEntries(stmtAll.all().map(r => [r.key, r.value]));
  cache = {};
  for (const [key, def] of Object.entries(SCHEMA)) {
    cache[key] = key in stored ? decode(stored[key], def.type) : def.default;
  }
  return cache;
}

export const getSetting = key => allSettings()[key];

export function setSetting(key, value, actorId = null) {
  const def = SCHEMA[key];
  if (!def) throw err.validation(`Tham số "${key}" không tồn tại.`);
  const encoded = encode(value, def, key);
  stmtSet.run(key, encoded, actorId);
  cache = null;
  return decode(encoded, def.type);
}

/** Ghi nhiều tham số một lượt. Sai một tham số thì không ghi tham số nào. */
export function setSettings(patch, actorId = null) {
  const pending = Object.entries(patch).map(([key, value]) => {
    const def = SCHEMA[key];
    if (!def) throw err.validation(`Tham số "${key}" không tồn tại.`);
    return [key, encode(value, def, key)];
  });
  for (const [key, encoded] of pending) stmtSet.run(key, encoded, actorId);
  cache = null;
  return allSettings();
}

/** Trả về tham số theo nhóm — dùng để dựng biểu mẫu trong bảng điều khiển. */
export function grouped() {
  const values = allSettings();
  const out = {};
  for (const [key, def] of Object.entries(SCHEMA)) {
    (out[def.group] ??= []).push({ key, ...def, value: values[key] });
  }
  return out;
}

/** Tham số an toàn để lộ ra frontend công khai (không chứa gì nhạy cảm). */
export function publicSettings() {
  const v = allSettings();
  return {
    contact: { phone: v['contact.phone'], zalo: v['contact.zalo'], email: v['contact.email'] },
    banner: v['banner.enabled'] && v['banner.text']
      ? { text: v['banner.text'], href: v['banner.href'] }
      : null,
    features: { personalize: v['personalize.enabled'] }
  };
}

function encode(value, def, key) {
  switch (def.type) {
    case 'bool':
      return String(value === true || value === 'true' || value === 1 || value === '1');
    case 'number': {
      const n = Number(value);
      if (!Number.isFinite(n)) throw err.validation(`"${def.label}" phải là một con số.`);
      return String(n);
    }
    case 'url': {
      const s = String(value || '').trim().slice(0, 500);
      if (s && !/^(https?:\/\/|\/)/.test(s)) {
        throw err.validation(`"${def.label}" phải là URL đầy đủ hoặc đường dẫn bắt đầu bằng dấu gạch chéo.`);
      }
      return s;
    }
    case 'phone': {
      const s = String(value || '').trim().slice(0, 40);
      if (s && !/^[0-9+().\s-]{8,20}$/.test(s)) throw err.validation(`"${def.label}" chưa hợp lệ.`);
      return s;
    }
    case 'longtext':
      return String(value ?? '').slice(0, 20000);
    default:
      return String(value ?? '').slice(0, 1000);
  }
}

function decode(raw, type) {
  if (type === 'bool') return raw === 'true';
  if (type === 'number') return Number(raw);
  return raw;
}
