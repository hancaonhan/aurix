/**
 * Khung HTML của bảng điều khiển.
 *
 * Trang này cố ý rất mỏng: nó chỉ nạp CSS thương hiệu và một tệp script duy
 * nhất. Toàn bộ dữ liệu đi qua API đã được phân quyền — HTML trả về không chứa
 * sẵn dữ liệu nào, nên không có đường rò rỉ qua khung trang.
 *
 * Không có script nội tuyến: nhờ vậy `script-src 'self'` giữ được nguyên vẹn,
 * không cần `unsafe-inline` cũng không cần nonce.
 */
import { brand, css } from './theme.js';

export function consolePage() {
  return `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow, noarchive">
<meta name="referrer" content="same-origin">
<meta name="theme-color" content="#0B1220">
<title>${brand.name} — ${brand.console}</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<style>${css}</style>
</head>
<body>
<div id="app" aria-live="polite">
  <div class="login"><form><div class="mark">${brand.name}</div>
  <p class="tag">${brand.console}</p><p class="muted" style="text-align:center">Đang tải…</p></form></div>
</div>
<div class="toast" id="toast" role="status" aria-live="polite"></div>
<script type="module" src="/bang-dieu-khien/app.js"></script>
</body>
</html>`;
}
