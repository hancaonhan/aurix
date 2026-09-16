/**
 * Lớp phủ nội dung.
 *
 * Mỗi bộ sưu tập trong `site/data/` khai báo mảng gốc của mình rồi bọc qua
 * `overlay()`. Kết quả là mảng đã hoà trộn giữa dữ liệu gốc trong mã nguồn và
 * những thay đổi người dùng tạo ra trong bảng điều khiển:
 *
 *   sửa một mục   → dòng `override` chồng lên mục gốc cùng mã
 *   thêm mục mới  → dòng `new`, xếp sau các mục gốc (hoặc theo `position`)
 *   xoá một mục   → dòng `deleted`; mục gốc vẫn còn trong mã, chỉ bị ẩn đi
 *
 * Nhờ vậy nội dung **hoàn tác được**: xoá dòng phủ là bản gốc trở lại y nguyên,
 * và website vẫn đầy đủ ngay cả khi cơ sở dữ liệu trống.
 *
 * Tệp này cố ý chỉ phụ thuộc vào kết nối cơ sở dữ liệu — không kéo theo bất cứ
 * thứ gì của máy chủ, để `scripts/build.js` nạp được mà không khởi động server.
 */
import db from '../../server/db/index.js';

/* Đọc một lượt cho cả tiến trình dựng trang, làm mới sau vài giây khi chạy máy
   chủ. Một trang dựng ra gọi hàm này hàng trăm lần; truy vấn lại mỗi lần là
   lãng phí thuần tuý. */
const TTL_MS = 3000;
let cache = null;
let cachedAt = 0;

function rows() {
  if (cache && Date.now() - cachedAt < TTL_MS) return cache;
  cachedAt = Date.now();
  cache = {};
  try {
    for (const r of db.prepare(`SELECT * FROM content`).all()) {
      (cache[r.collection] ??= []).push(r);
    }
  } catch {
    // Chưa chạy migration (ví dụ lần dựng đầu tiên trên máy mới): coi như không
    // có lớp phủ nào. Nội dung gốc vẫn ra đủ.
    cache = {};
  }
  return cache;
}

/** Buộc đọc lại ngay — gọi sau mỗi thao tác ghi từ bảng điều khiển. */
export function invalidateOverlay() {
  cache = null;
  cachedAt = 0;
}

const parse = s => { try { return s ? JSON.parse(s) : null; } catch { return null; } };

/**
 * @param {string} collection  khoá bộ sưu tập, ví dụ 'projects'
 * @param {Array<object>} raw  mảng gốc khai báo trong site/data
 * @param {string} idField     tên trường định danh, ví dụ 'slug'
 */
export function overlay(collection, raw, idField = 'id') {
  const patches = rows()[collection];
  if (!patches?.length) return raw;

  const byId = new Map(patches.map(p => [p.item_id, p]));
  const out = [];

  // 1. Mục gốc, theo thứ tự gốc, trừ những mục bị ẩn
  for (const item of raw) {
    const id = String(item[idField]);
    const patch = byId.get(id);
    byId.delete(id);
    if (!patch) { out.push({ ...item, __id: id, __source: 'goc' }); continue; }
    if (patch.deleted) continue;

    const data = parse(patch.data);
    out.push({ ...item, ...(data || {}), __id: id, __source: 'da-sua', __position: patch.position });
  }

  // 2. Mục do người dùng thêm mới
  for (const patch of byId.values()) {
    if (patch.deleted) continue;
    const data = parse(patch.data);
    if (!data) continue;
    out.push({ ...data, [idField]: patch.item_id, __id: patch.item_id, __source: 'moi', __position: patch.position });
  }

  // 3. Sắp xếp lại nếu có mục được gán vị trí; mục không gán giữ nguyên chỗ cũ
  if (out.some(i => i.__position != null)) {
    out.forEach((item, i) => { item.__order = item.__position ?? i; });
    out.sort((a, b) => a.__order - b.__order);
    for (const item of out) delete item.__order;
  }

  return out;
}

/**
 * Lớp phủ cho một đối tượng đơn lẻ (site, framework, cta…).
 * Hoà trộn nông một cấp: khoá con của đối tượng gốc được giữ lại nếu bản phủ
 * không nhắc tới, nên sửa một trường không làm mất những trường còn lại.
 */
export function overlayObject(collection, raw) {
  const patch = rows()[collection]?.[0];
  if (!patch || patch.deleted) return raw;
  const data = parse(patch.data);
  if (!data) return raw;

  const merged = { ...raw };
  for (const [k, v] of Object.entries(data)) {
    merged[k] = v && typeof v === 'object' && !Array.isArray(v) && raw[k] && typeof raw[k] === 'object' && !Array.isArray(raw[k])
      ? { ...raw[k], ...v }
      : v;
  }
  return merged;
}

/**
 * Lớp phủ thay nguyên giá trị.
 *
 * Dùng cho những thứ không phải danh sách có mã cũng không phải đối tượng hoà
 * trộn được — điển hình là thanh điều hướng: nó là một mảng lồng nhau mà thứ tự
 * chính là ý nghĩa, nên hoà trộn từng phần sẽ cho ra kết quả khó đoán. Ở đây
 * hoặc dùng bản gốc, hoặc dùng trọn bản người dùng lưu.
 */
export function overlayValue(collection, raw) {
  const patch = rows()[collection]?.[0];
  if (!patch || patch.deleted) return raw;
  const data = parse(patch.data);
  if (data === null || data === undefined) return raw;
  // Bản lưu bọc mảng trong { items: [...] } vì cơ sở dữ liệu chỉ nhận đối tượng
  return Array.isArray(raw) && data && !Array.isArray(data) && Array.isArray(data.items)
    ? data.items
    : data;
}
