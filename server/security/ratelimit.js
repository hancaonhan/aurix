/**
 * Giới hạn tần suất — cửa sổ trượt trong bộ nhớ.
 *
 * Đủ dùng cho một tiến trình duy nhất, đúng với mô hình triển khai hiện tại.
 * Khi chạy nhiều tiến trình, thay phần lưu trữ bên dưới bằng Redis mà không
 * phải sửa nơi gọi: giao diện `hit()` giữ nguyên.
 */
const buckets = new Map();

/**
 * @returns {{ ok: boolean, retryAfter: number, remaining: number }}
 */
export function hit(key, { max = 10, windowMs = 60_000 } = {}) {
  const now = Date.now();
  let times = buckets.get(key);
  if (!times) { times = []; buckets.set(key, times); }

  while (times.length && times[0] <= now - windowMs) times.shift();

  if (times.length >= max) {
    return { ok: false, retryAfter: Math.ceil((times[0] + windowMs - now) / 1000), remaining: 0 };
  }
  times.push(now);
  return { ok: true, retryAfter: 0, remaining: max - times.length };
}

/** Xoá bộ đếm của một khoá — dùng sau khi đăng nhập thành công. */
export function reset(key) { buckets.delete(key); }

/** Số khoá đang theo dõi — dùng cho điểm cuối trạng thái hệ thống. */
export const size = () => buckets.size;

setInterval(() => {
  const cutoff = Date.now() - 15 * 60_000;
  for (const [k, times] of buckets) {
    while (times.length && times[0] <= cutoff) times.shift();
    if (!times.length) buckets.delete(k);
  }
}, 5 * 60_000).unref();
