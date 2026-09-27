/**
 * Phễu chuyển đổi của chính website.
 *
 * Chỉ đếm, không theo dấu: mỗi sự kiện cộng 1 vào bộ đếm (ngày, trang, loại).
 * Không lưu IP, cookie hay mã người dùng, nên không cần xin đồng ý cookie và
 * không có dữ liệu cá nhân nào để lộ. Đổi lại, không trả lời được câu hỏi kiểu
 * "người này đã xem những trang nào" — với mục đích tìm chỗ khách rơi thì bộ
 * đếm theo trang là đủ.
 *
 * Mọi hàm chạm CSDL ở đây đều bất đồng bộ.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { all, run } from '../db/index.js';
import { ROOT } from '../core/config.js';

/** Loại sự kiện được nhận, theo thứ tự các bước của phễu. */
export const KINDS = {
  view:       'Xem trang',
  cta:        'Bấm nút kêu gọi',
  calc_use:   'Dùng máy tính thất thoát',
  dx_start:   'Bắt đầu bài chẩn đoán',
  dx_done:    'Xong bài chẩn đoán',
  form_start: 'Bắt đầu điền form',
  lead:       'Gửi thông tin thành công',
  zalo:       'Bấm Zalo',
  call:       'Bấm gọi điện'
};
export const isKind = k => Object.hasOwn(KINDS, k);

const PUBLIC = join(ROOT, 'public');
const PATH_RE = /^\/[a-z0-9\-/]*$/;

/**
 * Chuẩn hoá đường dẫn và chỉ nhận trang có thật. Nếu không kiểm, ai cũng gửi
 * được hàng nghìn đường dẫn bịa ra và làm phình bảng đếm.
 */
export function normalizePath(raw) {
  let p = String(raw || '').split(/[?#]/)[0].toLowerCase().slice(0, 120);
  if (!p.startsWith('/')) return null;
  if (!p.endsWith('/') && !p.endsWith('.html')) p += '/';
  if (!PATH_RE.test(p.replace(/\.html$/, ''))) return null;
  if (p === '/') return p;
  const file = p.endsWith('.html') ? join(PUBLIC, p) : join(PUBLIC, p, 'index.html');
  return existsSync(file) ? p : null;
}

// Ngày theo giờ Việt Nam, để "hôm nay" trên bảng điều khiển khớp với lịch làm việc.
const TODAY = `(now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date`;

/** Cộng một sự kiện. Không bao giờ ném lỗi: đo lường hỏng không được làm hỏng trang. */
export async function track(kind, path) {
  if (!isKind(kind)) return false;
  const p = normalizePath(path);
  if (!p) return false;
  try {
    await run(`
      INSERT INTO funnel_daily (day, path, kind, n) VALUES (${TODAY}, $1, $2, 1)
      ON CONFLICT (day, path, kind) DO UPDATE SET n = funnel_daily.n + 1
    `, [p, kind]);
    return true;
  } catch {
    return false;
  }
}

/** Báo cáo phễu cho N ngày gần nhất (tính cả hôm nay). */
export async function report(days = 30) {
  const d = Math.min(Math.max(Number(days) || 30, 1), 365);
  const since = `${TODAY} - ($1::int - 1)`;

  const [totals, pages, daily] = await Promise.all([
    all(`SELECT kind, SUM(n)::int AS n FROM funnel_daily WHERE day >= ${since} GROUP BY kind`, [d]),
    all(`
      SELECT path,
        COALESCE(SUM(n) FILTER (WHERE kind = 'view'), 0)::int       AS views,
        COALESCE(SUM(n) FILTER (WHERE kind = 'cta'), 0)::int        AS cta,
        COALESCE(SUM(n) FILTER (WHERE kind = 'form_start'), 0)::int AS form_start,
        COALESCE(SUM(n) FILTER (WHERE kind = 'lead'), 0)::int       AS leads
      FROM funnel_daily WHERE day >= ${since}
      GROUP BY path ORDER BY views DESC, leads DESC LIMIT 40
    `, [d]),
    all(`
      SELECT to_char(day, 'YYYY-MM-DD') AS d,
        COALESCE(SUM(n) FILTER (WHERE kind = 'view'), 0)::int AS views,
        COALESCE(SUM(n) FILTER (WHERE kind = 'lead'), 0)::int AS leads
      FROM funnel_daily WHERE day >= ${since}
      GROUP BY day ORDER BY day
    `, [d])
  ]);

  const byKind = Object.fromEntries(Object.keys(KINDS).map(k => [k, 0]));
  for (const t of totals) byKind[t.kind] = t.n;

  return {
    days: d,
    steps: Object.entries(KINDS).map(([key, label]) => ({ key, label, n: byKind[key] })),
    pages,
    daily
  };
}
