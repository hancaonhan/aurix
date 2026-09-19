/**
 * Kết nối PostgreSQL — một pool duy nhất cho cả tiến trình.
 *
 * Đây là tầng thấp nhất: chỉ mở kết nối và cung cấp bốn hàm truy vấn. Không có
 * nghiệp vụ nào ở đây, và `db/index.js` mới là nơi chạy migration.
 *
 * QUY ƯỚC THAM SỐ: PostgreSQL dùng `$1`, `$2`… chứ không dùng `?` như SQLite.
 * Đánh số bắt đầu từ 1 và phải khớp đúng thứ tự trong mảng truyền vào — sai số
 * lượng thì Postgres báo lỗi ngay, không âm thầm bỏ qua.
 */
import pg from 'pg';
import config from '../core/config.js';
import log from '../core/logger.js';

const THIEU_URL =
  'DATABASE_URL chưa đặt. Trên Vibe Host biến này được tiêm tự động khi đã gắn ' +
  'cơ sở dữ liệu vào website; ở máy phát triển thì khai trong tệp .env.';

/* Trả `created_at` về dạng chuỗi ISO thay vì đối tượng Date.
 *
 * Lý do: toàn bộ tầng trên (bảng điều khiển, CSV, API công khai) coi cột thời
 * gian là chuỗi, y như thời SQLite. Chuyển đổi ở một chỗ duy nhất tại đây rẻ hơn
 * nhiều so với sửa mọi nơi hiển thị, và giữ cho JSON trả ra ổn định. */
const TIMESTAMPTZ = 1184;
const TIMESTAMP = 1114;
const asIso = v => (v === null ? null : new Date(v).toISOString().replace('T', ' ').slice(0, 19));
pg.types.setTypeParser(TIMESTAMPTZ, asIso);
pg.types.setTypeParser(TIMESTAMP, asIso);

/* `bigint` và `numeric` mặc định về dạng chuỗi để không mất chính xác. Aurix
   không có số nào vượt Number.MAX_SAFE_INTEGER nên đổi về số cho tiện đếm. */
pg.types.setTypeParser(20, v => (v === null ? null : Number(v)));   // int8
pg.types.setTypeParser(1700, v => (v === null ? null : Number(v))); // numeric

/* Pool được tạo TRỄ, ở lần truy vấn đầu tiên — không phải lúc nạp module.
 *
 * Lý do: `scripts/build.js` nạp `site/lib/overlay.js`, tệp này lại nạp tầng CSDL.
 * Dựng trang tĩnh thì không cần cơ sở dữ liệu nào, nên `npm run build` phải chạy
 * được trên máy chưa có `.env` — tạo pool ngay lúc import sẽ làm nó gãy. */
let _pool = null;

export function getPool() {
  if (_pool) return _pool;
  if (!config.databaseUrl) throw new Error(THIEU_URL);

  _pool = new pg.Pool({
    connectionString: config.databaseUrl,
    max: config.dbPoolMax,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    ssl: config.dbSsl ? { rejectUnauthorized: false } : false
  });

  /* Kết nối trong pool có thể chết vì mạng hoặc vì CSDL khởi động lại. Không bắt
     sự kiện này thì Node coi đó là lỗi chưa xử lý và giết cả tiến trình. */
  _pool.on('error', e => log.error('Kết nối CSDL trong pool bị lỗi', { error: e.message }));
  return _pool;
}

/** Đã mở kết nối chưa — dùng để biết có cần đóng lúc tắt máy chủ không. */
export const isOpen = () => Boolean(_pool);

/** Chạy một câu lệnh, trả về đối tượng kết quả đầy đủ của `pg`. */
export async function query(text, params) {
  const t0 = performance.now();
  try {
    return await getPool().query(text, params);
  } catch (e) {
    // Kèm câu lệnh vào log để lần ra chỗ sai; tham số thì không, vì có thể chứa
    // mật khẩu đã băm hoặc dữ liệu cá nhân.
    log.error('Truy vấn CSDL thất bại', { sql: text.trim().slice(0, 200), error: e.message });
    throw e;
  } finally {
    const ms = performance.now() - t0;
    if (ms > config.log.slowMs) log.warn('Truy vấn chậm', { ms: Math.round(ms), sql: text.trim().slice(0, 120) });
  }
}

/** Mọi dòng. */
export const all = async (text, params) => (await query(text, params)).rows;

/** Dòng đầu tiên, hoặc `undefined` nếu không có dòng nào. */
export const one = async (text, params) => (await query(text, params)).rows[0];

/** Số dòng bị ảnh hưởng — dùng cho INSERT/UPDATE/DELETE. */
export const run = async (text, params) => (await query(text, params)).rowCount;

/**
 * Chạy một hàm trong giao dịch. Ném lỗi → hoàn tác toàn bộ.
 *
 * Hàm nhận vào một đối tượng có `all`/`one`/`run`/`query` dùng **đúng một kết
 * nối**. Bắt buộc phải dùng chúng thay vì hàm cùng tên ở cấp module: gọi hàm
 * cấp module sẽ lấy một kết nối khác trong pool và câu lệnh đó nằm ngoài giao
 * dịch, nên sẽ không được hoàn tác.
 */
export async function tx(fn) {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const scoped = {
      query: (t, p) => client.query(t, p),
      all: async (t, p) => (await client.query(t, p)).rows,
      one: async (t, p) => (await client.query(t, p)).rows[0],
      run: async (t, p) => (await client.query(t, p)).rowCount
    };
    const out = await fn(scoped);
    await client.query('COMMIT');
    return out;
  } catch (e) {
    try { await client.query('ROLLBACK'); } catch { /* kết nối đã đứt */ }
    throw e;
  } finally {
    client.release();
  }
}

/** Đóng pool — gọi khi tắt máy chủ hoặc khi script CLI chạy xong. */
export const close = async () => { if (_pool) { await _pool.end(); _pool = null; } };
