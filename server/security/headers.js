/**
 * Tiêu đề bảo mật HTTP.
 *
 * CSP được siết tới mức `'self'` cho mọi loại tài nguyên: phông chữ đã tự host
 * và trang không gọi tới miền bên thứ ba nào. Khi cần nhúng dịch vụ ngoài
 * (pixel quảng cáo, chat widget), thêm đúng miền đó vào đây — đừng nới thành
 * `*`, và đừng thêm `'unsafe-inline'` vào script-src.
 */
import config from '../core/config.js';

function csp({ nonce = '' } = {}) {
  const scriptSrc = ["'self'"];
  if (nonce) scriptSrc.push(`'nonce-${nonce}'`);

  const directives = [
    "default-src 'self'",
    `script-src ${scriptSrc.join(' ')}`,
    // Style nội tuyến còn cần cho CSS quan trọng nhúng thẳng vào <head>
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self'",
    "img-src 'self' data:",
    `connect-src 'self'${config.security.corsOrigins.length ? ' ' + config.security.corsOrigins.join(' ') : ''}`,
    "form-action 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests"
  ];
  // Không bật `require-trusted-types-for` cho bảng điều khiển: giao diện dựng
  // DOM bằng innerHTML với dữ liệu đã escape thủ công, còn Trusted Types sẽ
  // chặn thẳng mọi phép gán innerHTML trên Chromium và làm trắng cả trang.
  return directives.join('; ');
}

export function securityHeaders({ https = false, admin = false, nonce = '' } = {}) {
  return {
    'Content-Security-Policy': csp({ nonce }),
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=(), interest-cohort=()',
    'X-Frame-Options': 'DENY',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
    ...(https ? { 'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload' } : {}),
    ...(admin ? { 'X-Robots-Tag': 'noindex, nofollow, noarchive' } : {})
  };
}

/** CORS — chỉ mở cho danh sách origin khai báo tường minh, không bao giờ '*'. */
export function corsHeaders(origin) {
  if (!origin || !config.security.corsOrigins.includes(origin)) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Content-Type, X-Aurix-CSRF, X-Aurix-Key',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Max-Age': '600',
    'Vary': 'Origin'
  };
}
