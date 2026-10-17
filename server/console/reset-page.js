/**
 * Trang "Quên mật khẩu" / "Đặt mật khẩu mới" của bảng điều khiển.
 *
 * Một trang cho cả hai bước: không có mã trên URL thì hiện ô nhập email; có mã
 * (phần sau dấu #, nên mã không bao giờ đi vào nhật ký máy chủ hay header
 * Referer) thì hiện ô nhập mật khẩu mới. Không có script nội tuyến.
 */
import { brand, css } from './theme.js';

export function resetPage() {
  return `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow, noarchive">
<meta name="referrer" content="no-referrer">
<meta name="theme-color" content="#012B2B">
<title>Đặt lại mật khẩu — ${brand.name}</title>
<link rel="icon" href="/favicon.png" type="image/png" sizes="48x48">
<style>${css}</style>
</head>
<body>
<div id="app">
  <div class="login">
    <form id="resetForm" novalidate>
      <div class="mark"><img src="/assets/logo-trang-aurix.png" alt="Aurix" width="704" height="191"></div>
      <p class="tag">${brand.console}</p>
      <div id="resetBody"><p class="muted" style="text-align:center">Đang tải…</p></div>
    </form>
  </div>
</div>
<script type="module" src="/bang-dieu-khien/dat-lai.js"></script>
</body>
</html>`;
}
