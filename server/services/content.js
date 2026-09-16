/**
 * Quản trị nội dung website.
 *
 * Mọi thứ hiển thị trên aurixvietnam.vn — dịch vụ, dự án, ngành, quy trình, cảm
 * nhận khách hàng, câu hỏi thường gặp, gói dịch vụ, đội ngũ, câu hỏi chẩn đoán,
 * thông tin thương hiệu — đều sửa, thêm và xoá được từ bảng điều khiển.
 *
 * Cách hoạt động: dữ liệu gốc vẫn nằm trong `site/data/*.js` và vẫn đi kèm mã
 * nguồn; bảng `content` chỉ ghi phần khác biệt, rồi `site/lib/overlay.js` hoà
 * hai lớp lại lúc dựng trang. Ba điều có được từ cách này:
 *
 *   1. Hoàn tác được — bỏ bản sửa là nội dung gốc trở lại y nguyên.
 *   2. Website vẫn đầy đủ khi cơ sở dữ liệu trống (máy mới, sau khi khôi phục).
 *   3. Vẫn là HTML tĩnh sinh sẵn, nên không mất một chút tốc độ hay SEO nào.
 *
 * Sửa xong phải **xuất bản** để dựng lại HTML tĩnh — xem `publish()` bên dưới.
 */
import { spawn } from 'node:child_process';
import { join } from 'node:path';
import db from '../db/index.js';
import { err } from '../core/errors.js';
import log from '../core/logger.js';
import { ROOT } from '../core/config.js';
import { overlay, overlayObject, overlayValue, invalidateOverlay } from '../../site/lib/overlay.js';

import * as content from '../../site/data/content.js';
import * as services from '../../site/data/services.js';
import * as company from '../../site/data/company.js';
import * as diagnostic from '../../site/data/diagnostic.js';
import { RAW_site as siteRaw, RAW_nav as navRaw, RAW_cta as ctaRaw } from '../../site/data/site.js';
import { RAW_framework as frameworkRaw } from '../../site/data/framework.js';
import { RAW_industryDetail as industryDetailRaw } from '../../site/data/industry-detail.js';

/**
 * Danh mục bộ sưu tập sửa được.
 *
 * `fields` chỉ liệt kê những trường hay sửa, để dựng biểu mẫu gọn gàng; mọi
 * trường còn lại — kể cả cấu trúc lồng nhiều tầng như `service.solution.pillars`
 * — vẫn sửa được qua ô JSON nâng cao trong cùng màn hình. Cố ý không mô hình
 * hoá hết hai mươi lược đồ lồng nhau thành biểu mẫu: làm vậy sẽ khoá cứng cấu
 * trúc nội dung, đúng thứ cần giữ mềm nhất.
 *
 * Thêm bộ sưu tập mới: bọc mảng gốc bằng `overlay()` trong `site/data/`, rồi
 * thêm một mục ở đây. Không cần migration, không cần sửa API.
 */
const text = (name, label) => ({ name, label, type: 'text' });
const area = (name, label) => ({ name, label, type: 'textarea' });

export const COLLECTIONS = {
  services: {
    label: 'Dịch vụ', group: 'Dịch vụ & Dự án', idField: 'slug',
    help: 'Năm tầng A.U.R.I.X. Đổi slug là đổi đường dẫn — cân nhắc vì liên kết cũ sẽ hỏng.',
    data: () => overlay('services', services.RAW.services, 'slug'),
    fields: [text('slug', 'Slug (đường dẫn)'), text('name', 'Tên dịch vụ'), text('kicker', 'Nhãn tầng'),
      text('layer', 'Tầng (A/U/R/I/X)'), area('tagline', 'Câu định vị'),
      text('seoTitle', 'Tiêu đề SEO'), area('seoDesc', 'Mô tả SEO'), text('image', 'Ảnh')]
  },
  projects: {
    label: 'Dự án', group: 'Dịch vụ & Dự án', idField: 'slug',
    data: () => overlay('projects', content.RAW.projects, 'slug'),
    fields: [text('slug', 'Slug'), text('client', 'Khách hàng'), text('title', 'Tiêu đề'),
      area('summary', 'Tóm tắt'), text('industry', 'Ngành (hiển thị)'), text('industryKey', 'Mã ngành'),
      text('image', 'Ảnh'), text('imageFallback', 'Ảnh dự phòng')]
  },
  industries: {
    label: 'Ngành', group: 'Dịch vụ & Dự án', idField: 'key',
    help: 'Mỗi ngành là một biến thể của lớp cá nhân hoá trang chủ (?nganh=...).',
    data: () => overlay('industries', content.RAW.industries, 'key'),
    fields: [text('key', 'Mã ngành'), text('label', 'Tên hiển thị'), area('heroLine', 'Tiêu đề trang chủ'),
      area('heroSub', 'Mô tả trang chủ'), area('pain', 'Nỗi đau chính'), text('project', 'Dự án tiêu biểu')]
  },

  process: {
    label: 'Quy trình', group: 'Trang chủ & Phương pháp', idField: 'step',
    data: () => overlay('process', content.RAW.process, 'step'),
    fields: [text('step', 'Bước'), text('name', 'Tên bước'), text('duration', 'Thời lượng'),
      area('desc', 'Mô tả'), area('output', 'Kết quả bàn giao')]
  },
  differentiators: {
    label: 'Điểm khác biệt', group: 'Trang chủ & Phương pháp', idField: 'title',
    data: () => overlay('differentiators', content.RAW.differentiators, 'title'),
    fields: [text('title', 'Tiêu đề'), area('desc', 'Mô tả')]
  },
  stats: {
    label: 'Số liệu nổi bật', group: 'Trang chủ & Phương pháp', idField: 'label',
    data: () => overlay('stats', content.RAW.stats, 'label'),
    fields: [text('value', 'Giá trị'), text('suffix', 'Hậu tố'), text('label', 'Nhãn'),
      { name: 'decimals', label: 'Số chữ số thập phân', type: 'number' }]
  },
  testimonials: {
    label: 'Cảm nhận khách hàng', group: 'Trang chủ & Phương pháp', idField: 'name',
    data: () => overlay('testimonials', content.RAW.testimonials, 'name'),
    fields: [area('quote', 'Trích dẫn'), text('name', 'Người nói'), text('role', 'Chức danh'),
      text('company', 'Doanh nghiệp'), text('image', 'Ảnh chân dung')]
  },
  faq: {
    label: 'Câu hỏi thường gặp', group: 'Trang chủ & Phương pháp', idField: 'q',
    help: 'Hiển thị trên trang chủ và được đánh dấu FAQPage trong JSON-LD.',
    data: () => overlay('faq', content.RAW.faq, 'q'),
    fields: [area('q', 'Câu hỏi'), area('a', 'Trả lời')]
  },

  packages: {
    label: 'Gói dịch vụ', group: 'Đầu tư & Công ty', idField: 'key',
    data: () => overlay('packages', company.RAW.packages, 'key'),
    fields: [text('key', 'Mã gói'), text('name', 'Tên gói'), area('tagline', 'Câu định vị'),
      text('duration', 'Thời lượng'), area('forWho', 'Dành cho ai')]
  },
  priceFactors: {
    label: 'Yếu tố ảnh hưởng giá', group: 'Đầu tư & Công ty', idField: 't',
    data: () => overlay('priceFactors', company.RAW.priceFactors, 't'),
    fields: [text('t', 'Yếu tố'), area('d', 'Giải thích')]
  },
  team: {
    label: 'Đội ngũ', group: 'Đầu tư & Công ty', idField: 'name',
    data: () => overlay('team', company.RAW.team, 'name'),
    fields: [text('name', 'Họ tên'), text('role', 'Chức danh'), area('bio', 'Giới thiệu'), text('focus', 'Chuyên môn')]
  },

  questions: {
    label: 'Câu hỏi chẩn đoán', group: 'Chẩn đoán', idField: 'id',
    help: 'Bộ câu hỏi dùng chung cho giao diện và bộ chấm điểm. Sửa `options` hoặc `weight` là đổi cách chấm — kiểm lại kết quả sau khi sửa.',
    data: () => overlay('questions', diagnostic.RAW.questions, 'id'),
    fields: [text('id', 'Mã câu hỏi'), area('q', 'Câu hỏi'), area('hint', 'Gợi ý'),
      text('type', 'Loại'), text('layer', 'Tầng A.U.R.I.X'), { name: 'weight', label: 'Trọng số', type: 'number' }]
  }
};

/** Đối tượng đơn lẻ — sửa trực tiếp, không thêm/xoá. */
export const SINGLETONS = {
  site: {
    label: 'Thông tin thương hiệu', group: 'Thương hiệu', data: () => overlayObject('site', siteRaw),
    help: 'Tên, điện thoại, email, địa chỉ, mạng xã hội — dùng cho SEO và dữ liệu có cấu trúc.',
    fields: [text('name', 'Tên'), text('legalName', 'Tên pháp nhân'), text('brandLine', 'Câu thương hiệu'),
      text('positioning', 'Định vị'), text('phone', 'Điện thoại'), text('phoneE164', 'Điện thoại E.164'),
      text('email', 'Email'), text('zalo', 'Zalo'), text('founded', 'Năm thành lập')]
  },
  framework: {
    label: 'Khung A.U.R.I.X', group: 'Thương hiệu', data: () => overlayObject('framework', frameworkRaw),
    help: 'Định nghĩa một chỗ, dùng lại ở trang chủ, phương pháp, dịch vụ và bộ chấm điểm.',
    fields: []
  },
  cta: { label: 'Nút kêu gọi hành động', group: 'Thương hiệu', data: () => overlayValue('cta', ctaRaw), fields: [] },
  nav: { label: 'Thanh điều hướng', group: 'Thương hiệu', data: () => overlayValue('nav', navRaw), fields: [] },
  privacy: { label: 'Chính sách bảo mật', group: 'Thương hiệu', data: () => overlayObject('privacy', company.RAW_privacy ?? company.privacy), fields: [] },
  industryDetail: {
    label: 'Nội dung chuyên sâu theo ngành', group: 'Dịch vụ & Dự án', data: () => overlayObject('industryDetail', industryDetailRaw),
    help: 'Nội dung dài của từng trang /nganh/. Ngành mới thêm mà chưa có khối ở đây vẫn ra trang được nhờ bản dự phòng — thêm khối vào đây để viết chuyên sâu.',
    fields: []
  }
};

/* ==========================================================================
   Đọc
   ========================================================================== */
const patchesOf = collection =>
  Object.fromEntries(db.prepare(`SELECT * FROM content WHERE collection = ?`).all(collection)
    .map(r => [r.item_id, r]));

export function listCollections() {
  return {
    collections: Object.fromEntries(Object.entries(COLLECTIONS).map(([key, c]) => [key, {
      label: c.label, group: c.group, idField: c.idField, help: c.help ?? null,
      count: c.data().length,
      changed: db.prepare(`SELECT COUNT(*) c FROM content WHERE collection = ?`).get(key).c
    }])),
    singletons: Object.fromEntries(Object.entries(SINGLETONS).map(([key, c]) => [key, {
      label: c.label, group: c.group, help: c.help ?? null,
      changed: db.prepare(`SELECT COUNT(*) c FROM content WHERE collection = ?`).get(key).c > 0
    }]))
  };
}

export function listItems(key) {
  const def = COLLECTIONS[key];
  if (!def) throw err.notFound('Không có bộ sưu tập này.');

  const patches = patchesOf(key);
  const items = def.data().map(item => {
    const id = String(item[def.idField]);
    // `__source` do lớp phủ gắn vào; mục chưa từng bị đụng tới thì không có.
    return { id, source: item.__source ?? 'goc', data: strip(item) };
  });

  // Mục gốc đã bị ẩn — vẫn liệt kê để khôi phục lại được
  for (const [id, p] of Object.entries(patches)) {
    if (p.deleted) items.push({ id, source: 'da-xoa', data: null });
  }

  return {
    key, label: def.label, idField: def.idField, help: def.help ?? null,
    fields: def.fields, items
  };
}

export function getSingleton(key) {
  const def = SINGLETONS[key];
  if (!def) throw err.notFound('Không có mục này.');
  return { key, label: def.label, help: def.help ?? null, fields: def.fields, data: strip(def.data()) };
}

/** Bỏ các khoá nội bộ do lớp phủ gắn vào trước khi trả ra ngoài. */
function strip(item) {
  if (Array.isArray(item)) return item.map(strip);
  if (!item || typeof item !== 'object') return item;
  const out = {};
  for (const [k, v] of Object.entries(item)) if (!k.startsWith('__')) out[k] = v;
  return out;
}

/* ==========================================================================
   Ghi
   ========================================================================== */
const MAX_BYTES = 200_000;

function validate(data) {
  if (!data || typeof data !== 'object') throw err.validation('Nội dung phải là một đối tượng.');
  const json = JSON.stringify(data);
  if (json.length > MAX_BYTES) throw err.validation('Nội dung quá dài (tối đa 200 KB một mục).');
  return json;
}

const stmtUpsert = db.prepare(`
  INSERT INTO content (collection, item_id, data, origin, deleted, position, updated_by)
  VALUES (?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(collection, item_id) DO UPDATE SET
    data = excluded.data, origin = excluded.origin, deleted = excluded.deleted,
    position = COALESCE(excluded.position, content.position),
    updated_at = datetime('now'), updated_by = excluded.updated_by
`);

/** Sửa một mục có sẵn, hoặc sửa tiếp một mục đã thêm mới. */
export function saveItem(key, itemId, data, actorId = null) {
  const def = COLLECTIONS[key];
  if (!def) throw err.notFound('Không có bộ sưu tập này.');

  const json = validate(data);
  const exists = def.data().some(i => String(i[def.idField]) === String(itemId));
  const current = db.prepare(`SELECT origin FROM content WHERE collection = ? AND item_id = ?`)
    .get(key, String(itemId));

  if (!exists && !current) throw err.notFound('Không tìm thấy mục này.');

  stmtUpsert.run(key, String(itemId), json, current?.origin ?? 'override', 0, null, actorId);
  invalidateOverlay();
  return listItems(key);
}

export function createItem(key, data, actorId = null) {
  const def = COLLECTIONS[key];
  if (!def) throw err.notFound('Không có bộ sưu tập này.');

  const id = String(data?.[def.idField] ?? '').trim();
  if (!id) throw err.validation(`Trường "${def.idField}" là bắt buộc và dùng làm mã của mục.`);
  if (id.length > 200) throw err.validation('Mã mục quá dài.');

  const taken = def.data().some(i => String(i[def.idField]) === id)
    || db.prepare(`SELECT 1 FROM content WHERE collection = ? AND item_id = ?`).get(key, id);
  if (taken) throw err.conflict(`Đã có mục mang mã "${id}".`);

  const json = validate(data);
  const last = db.prepare(`SELECT MAX(position) p FROM content WHERE collection = ?`).get(key).p;

  stmtUpsert.run(key, id, json, 'new', 0, (last ?? def.data().length) + 1, actorId);
  invalidateOverlay();
  return listItems(key);
}

/**
 * Xoá một mục.
 *
 * Mục người dùng tự thêm thì xoá hẳn dòng. Mục gốc trong mã nguồn thì chỉ đánh
 * dấu ẩn — mã nguồn là bản chuẩn, không được phép bị một thao tác trên giao
 * diện làm sai lệch, và nhờ vậy lúc nào cũng khôi phục lại được.
 */
export function deleteItem(key, itemId, actorId = null) {
  const def = COLLECTIONS[key];
  if (!def) throw err.notFound('Không có bộ sưu tập này.');

  const id = String(itemId);
  const patch = db.prepare(`SELECT origin FROM content WHERE collection = ? AND item_id = ?`).get(key, id);
  const exists = def.data().some(i => String(i[def.idField]) === id);

  if (!exists && !patch) throw err.notFound('Không tìm thấy mục này.');

  // `origin` là thứ duy nhất phân biệt được mục do người dùng thêm với mục có
  // sẵn trong mã nguồn: danh sách từ def.data() đã hoà cả hai lớp, nên không
  // dùng nó để phán đoán được.
  if (patch?.origin === 'new') {
    db.prepare(`DELETE FROM content WHERE collection = ? AND item_id = ?`).run(key, id);
  } else {
    stmtUpsert.run(key, id, null, patch?.origin ?? 'override', 1, null, actorId);
  }

  invalidateOverlay();
  return listItems(key);
}

/** Bỏ mọi thay đổi của một mục, trả về đúng bản trong mã nguồn. */
export function restoreItem(key, itemId) {
  if (!COLLECTIONS[key] && !SINGLETONS[key]) throw err.notFound('Không có mục này.');
  db.prepare(`DELETE FROM content WHERE collection = ? AND item_id = ?`).run(key, String(itemId));
  invalidateOverlay();
  return COLLECTIONS[key] ? listItems(key) : getSingleton(key);
}

export function saveSingleton(key, data, actorId = null) {
  if (!SINGLETONS[key]) throw err.notFound('Không có mục này.');
  stmtUpsert.run(key, key, validate(data), 'override', 0, null, actorId);
  invalidateOverlay();
  return getSingleton(key);
}

/** Sắp xếp lại: mảng mã mục theo đúng thứ tự mong muốn. */
export function reorder(key, ids, actorId = null) {
  const def = COLLECTIONS[key];
  if (!def) throw err.notFound('Không có bộ sưu tập này.');
  if (!Array.isArray(ids)) throw err.validation('Danh sách thứ tự không hợp lệ.');

  const known = new Set([
    ...def.data().map(i => String(i[def.idField])),
    ...Object.keys(patchesOf(key))
  ]);

  ids.forEach((id, index) => {
    if (!known.has(String(id))) return;
    const patch = db.prepare(`SELECT data, origin, deleted FROM content WHERE collection = ? AND item_id = ?`)
      .get(key, String(id));
    stmtUpsert.run(key, String(id), patch?.data ?? null,
      patch?.origin ?? 'override', patch?.deleted ?? 0, index, actorId);
  });

  invalidateOverlay();
  return listItems(key);
}

/* ==========================================================================
   Xuất bản
   ========================================================================== */
/**
 * Dựng lại toàn bộ HTML tĩnh rồi chạy kiểm định.
 *
 * Website là HTML sinh sẵn — sửa nội dung trong cơ sở dữ liệu chưa đủ, phải
 * dựng lại thì khách mới thấy. Chạy trong tiến trình con để một lỗi lúc dựng
 * không kéo sập máy chủ đang phục vụ.
 */
let publishing = false;

export function publishState() {
  const row = db.prepare(`SELECT MAX(updated_at) t FROM content`).get().t;
  return { running: publishing, lastContentChange: row };
}

export async function publish() {
  if (publishing) throw err.conflict('Đang có một lượt xuất bản chạy dở. Vui lòng đợi.');
  publishing = true;
  const started = Date.now();

  try {
    const build = await run('scripts/build.js');
    if (build.code !== 0) {
      return { ok: false, step: 'build', log: build.out, seconds: secs(started) };
    }
    const audit = await run('scripts/audit.js');
    return {
      ok: audit.code === 0,
      step: audit.code === 0 ? 'done' : 'audit',
      log: build.out + '\n' + audit.out,
      seconds: secs(started)
    };
  } finally {
    publishing = false;
  }
}

const secs = from => Number(((Date.now() - from) / 1000).toFixed(1));

function run(script) {
  return new Promise(resolve => {
    const child = spawn(process.execPath, [join(ROOT, script)], { cwd: ROOT, env: process.env });
    let out = '';
    const take = chunk => {
      out += chunk;
      if (out.length > 60_000) out = out.slice(-60_000);  // chỉ giữ phần đuôi
    };
    child.stdout.on('data', take);
    child.stderr.on('data', take);
    child.on('error', e => resolve({ code: 1, out: `Không chạy được ${script}: ${e.message}` }));
    child.on('close', code => {
      log.info('Xuất bản', { script, code });
      resolve({ code, out: strip_ansi(out) });
    });
  });
}

// eslint-disable-next-line no-control-regex
const strip_ansi = s => s.replace(/\[[0-9;]*m/g, '');
