/**
 * Băm mật khẩu bằng scrypt (node:crypto) — không phụ thuộc gói ngoài.
 *
 * Định dạng lưu trữ, tự mô tả để sau này đổi tham số mà không phá dữ liệu cũ:
 *   scrypt$N$r$p$<muối base64>$<băm base64>
 */
import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);

/** Tham số hiện hành. Tăng N khi máy chủ mạnh hơn; băm cũ vẫn đọc được. */
const PARAMS = { N: 2 ** 15, r: 8, p: 1, keylen: 64 };

export async function hashPassword(plain) {
  const salt = randomBytes(16);
  const { N, r, p, keylen } = PARAMS;
  const key = await scryptAsync(plain.normalize('NFKC'), salt, keylen, { N, r, p, maxmem: 256 * 1024 * 1024 });
  return `scrypt$${N}$${r}$${p}$${salt.toString('base64')}$${key.toString('base64')}`;
}

export async function verifyPassword(plain, stored) {
  try {
    const [scheme, N, r, p, saltB64, hashB64] = String(stored).split('$');
    if (scheme !== 'scrypt') return false;
    const salt = Buffer.from(saltB64, 'base64');
    const expected = Buffer.from(hashB64, 'base64');
    const key = await scryptAsync(plain.normalize('NFKC'), salt, expected.length, {
      N: Number(N), r: Number(r), p: Number(p), maxmem: 256 * 1024 * 1024
    });
    return timingSafeEqual(key, expected);
  } catch {
    return false;
  }
}

/** Băm cũ dùng tham số yếu hơn → nên băm lại lúc người dùng đăng nhập thành công. */
export function needsRehash(stored) {
  const [scheme, N] = String(stored).split('$');
  return scheme !== 'scrypt' || Number(N) < PARAMS.N;
}

/**
 * Chính sách mật khẩu. Cố ý ưu tiên độ dài hơn là ký tự đặc biệt — quy tắc
 * "phải có ký tự lạ" chỉ đẩy người dùng tới những mật khẩu dễ đoán hơn.
 */
const COMMON = new Set(['12345678', 'password', 'matkhau123', 'aurix123', 'qwertyui', '11111111', 'admin123']);

export function checkPasswordPolicy(plain, { email = '' } = {}) {
  const errors = [];
  const pw = String(plain || '');
  if (pw.length < 12) errors.push('Mật khẩu cần ít nhất 12 ký tự.');
  if (pw.length > 200) errors.push('Mật khẩu quá dài.');
  if (COMMON.has(pw.toLowerCase())) errors.push('Mật khẩu này quá phổ biến, hãy chọn chuỗi khác.');
  if (email && pw.toLowerCase().includes(email.split('@')[0].toLowerCase())) {
    errors.push('Mật khẩu không nên chứa tên tài khoản.');
  }
  if (/^(.)\1+$/.test(pw)) errors.push('Mật khẩu không nên là một ký tự lặp lại.');
  return { ok: errors.length === 0, errors };
}

/** Sinh mật khẩu tạm cho tài khoản mới — đọc được, gõ được, đủ mạnh. */
export function generatePassword(words = 4) {
  const bank = ['aurix', 'tang', 'truong', 'he', 'thong', 'chuyen', 'doi', 'khach', 'hang', 'du', 'an', 'kenh', 'phu', 'song', 'chien', 'luoc'];
  const bytes = randomBytes(words + 2);
  const picked = Array.from({ length: words }, (_, i) => bank[bytes[i] % bank.length]);
  return picked.join('-') + '-' + String(bytes[words] * 256 + bytes[words + 1]).padStart(5, '0');
}
