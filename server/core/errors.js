/**
 * Lỗi ứng dụng.
 *
 * Nguyên tắc: người dùng cuối luôn nhận thông điệp tiếng Việt rõ nghĩa và
 * **không** chứa chi tiết kỹ thuật; chi tiết chỉ đi vào nhật ký. Mỗi lỗi mang
 * một mã ổn định để giao diện và các bên tích hợp bắt theo mã, không bắt theo
 * câu chữ — nhờ vậy đổi lời văn không làm hỏng tích hợp.
 */
export class AppError extends Error {
  /**
   * @param {number} status  mã HTTP
   * @param {string} code    mã lỗi ổn định, ví dụ 'AUTH_REQUIRED'
   * @param {string} message thông điệp tiếng Việt cho người dùng
   * @param {object} [meta]  dữ liệu phụ (chỉ ghi nhật ký, không trả về)
   */
  constructor(status, code, message, meta = {}) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.meta = meta;
    this.expose = true;
  }
}

export const err = {
  badRequest: (msg = 'Dữ liệu gửi lên không hợp lệ.', meta) => new AppError(400, 'BAD_REQUEST', msg, meta),
  validation: (msg, meta) => new AppError(422, 'VALIDATION_FAILED', msg, meta),
  unauthorized: (msg = 'Bạn cần đăng nhập để tiếp tục.') => new AppError(401, 'AUTH_REQUIRED', msg),
  badCredentials: (msg = 'Email hoặc mật khẩu không đúng.') => new AppError(401, 'BAD_CREDENTIALS', msg),
  forbidden: (msg = 'Tài khoản của bạn không có quyền thực hiện việc này.') => new AppError(403, 'FORBIDDEN', msg),
  csrf: () => new AppError(403, 'CSRF_FAILED', 'Phiên làm việc đã hết hạn. Vui lòng tải lại trang.'),
  notFound: (msg = 'Không tìm thấy nội dung.') => new AppError(404, 'NOT_FOUND', msg),
  conflict: (msg = 'Dữ liệu đã tồn tại.') => new AppError(409, 'CONFLICT', msg),
  tooLarge: () => new AppError(413, 'PAYLOAD_TOO_LARGE', 'Nội dung gửi lên quá dài.'),
  locked: (msg = 'Tài khoản tạm thời bị khoá do đăng nhập sai nhiều lần.') => new AppError(423, 'ACCOUNT_LOCKED', msg),
  rateLimited: (retryAfter = 60) =>
    Object.assign(new AppError(429, 'RATE_LIMITED', 'Bạn thao tác hơi nhanh. Vui lòng thử lại sau giây lát.'), { retryAfter }),
  internal: (meta) => Object.assign(
    new AppError(500, 'INTERNAL', 'Lỗi hệ thống. Vui lòng thử lại hoặc gọi trực tiếp cho Aurix.', meta),
    { expose: false }
  )
};

export default AppError;
