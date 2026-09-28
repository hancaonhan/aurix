/**
 * Mã cho phép bổ sung thông tin vào một khách vừa gửi form.
 *
 * Form liên hệ có hai bước: bước 1 lưu tên và số điện thoại ngay (để khách bỏ
 * ngang vẫn không mất số), bước 2 cho khách điền thêm. Bước 2 phải sửa đúng bản
 * ghi vừa tạo — nhưng điểm cuối là công khai, nên không thể chỉ nhận `id`: ai
 * cũng đoán được id và ghi đè thông tin khách khác.
 *
 * Mã = HMAC(id + thời điểm) ký bằng bí mật phiên, sống 2 giờ. Không cần lưu gì
 * trong CSDL.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';
import config from '../core/config.js';

const TTL_MS = 2 * 3600_000;

const sign = (id, ts) => createHmac('sha256', config.security.sessionSecret)
  .update(`lead-details:${id}:${ts}`).digest('base64url');

export function leadToken(id) {
  const ts = Date.now();
  return `${ts}.${sign(id, ts)}`;
}

export function verifyLeadToken(id, token) {
  const [tsRaw, sig] = String(token || '').split('.');
  const ts = Number(tsRaw);
  if (!Number.isInteger(Number(id)) || !Number.isFinite(ts) || !sig) return false;
  if (Date.now() - ts > TTL_MS || ts > Date.now() + 60_000) return false;
  const expected = Buffer.from(sign(Number(id), ts));
  const got = Buffer.from(sig);
  return expected.length === got.length && timingSafeEqual(expected, got);
}
