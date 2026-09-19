/**
 * AURIX — Điểm khởi động máy chủ.
 *
 *   node server/server.js
 *
 * Tệp này cố ý chỉ làm ba việc: kiểm tra cấu hình, mở cổng, và tắt máy cho êm.
 * Mọi logic nằm ở `server/app.js` và các module — nhờ vậy có thể nạp ứng dụng
 * trong bài kiểm thử hoặc trong một runtime khác mà không khởi động máy chủ.
 */
import { createServer } from 'node:http';
import config, { auditConfig } from './core/config.js';
import log from './core/logger.js';
import { createHandler, router } from './app.js';
import { migrate, SCHEMA_VERSION, close as closeDb } from './db/index.js';
import { countUsers } from './services/users.js';
import { refreshOverlay } from '../site/lib/overlay.js';
import { purgeExpiredSessions } from './security/session.js';
import { startMailWorker, mailEnabled } from './lib/mailer.js';
import { CONSOLE_PATH } from './modules/console.js';

/* ---------- Kiểm tra trước khi mở cổng ---------- *
 * Lược đồ phải xong TRƯỚC khi nhận request đầu tiên, và lớp phủ nội dung phải
 * được nạp trước khi dựng trang đầu tiên — `overlay()` đọc đồng bộ từ đệm nên
 * đệm rỗng sẽ cho ra trang thiếu nội dung đã sửa. `await` cấp cao nhất dùng
 * được vì Aurix là ESM.                                                     */
await migrate();
await refreshOverlay();
for (const warning of auditConfig()) log.warn(warning);

const users = await countUsers();

const server = createServer(createHandler());

// Giữ kết nối lâu hơn thời gian chờ mặc định của hầu hết reverse proxy, để
// proxy là bên chủ động đóng — tránh lỗi 502 ngẫu nhiên lúc tải cao.
server.keepAliveTimeout = 65_000;
server.headersTimeout = 70_000;
server.requestTimeout = 30_000;

server.listen(config.port, config.host, () => {
  const url = `http://localhost:${config.port}`;
  const c = log.c;

  log.banner([
    `${c.gold}AURIX${c.reset} — Growth System Builder`,
    '─'.repeat(52),
    `Website          ${url}`,
    `Cá nhân hoá      ${url}/?nganh=spa`,
    `Chẩn đoán        ${url}/chan-doan/`,
    `Bảng điều khiển  ${url}${CONSOLE_PATH}`,
    '─'.repeat(52),
    `Môi trường       ${config.env}`,
    `Lược đồ          v${SCHEMA_VERSION}`,
    `Tuyến API        ${router.list().length}`,
    `Tài khoản        ${users}${users ? '' : c.reset + '  ← chưa có ai! chạy: node server/cli.js user:create'}`,
    `Thư              ${mailEnabled ? 'SMTP đã cấu hình' : 'chế độ nháp (chưa có SMTP)'}`,
    '─'.repeat(52)
  ]);

  startMailWorker();
});

/* Dọn phiên hết hạn mỗi giờ. `unref` để tác vụ này không giữ tiến trình sống. */
setInterval(async () => {
  const removed = await purgeExpiredSessions();
  if (removed) log.debug('Đã dọn phiên hết hạn', { removed });
}, 3600_000).unref();

/* ---------- Tắt máy cho êm ---------- *
 * Ngừng nhận kết nối mới, để request đang chạy hoàn tất, rồi mới thoát. Nếu
 * quá 8 giây thì thoát cứng — quá trình triển khai không được treo vô hạn.  */
let shuttingDown = false;
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    if (shuttingDown) process.exit(1);
    shuttingDown = true;
    log.info('Đang dừng máy chủ…');
    // Đóng pool sau khi request cuối đã xong: `pg` giữ socket mở nên không đóng
    // thì tiến trình treo tới lúc bị giết cứng.
    server.close(async () => {
      await closeDb().catch(() => {});
      log.info('Đã dừng.');
      process.exit(0);
    });
    setTimeout(() => process.exit(0), 8000).unref();
  });
}

process.on('unhandledRejection', reason => {
  log.error('Promise bị từ chối mà không ai bắt', { reason: String(reason) });
});
process.on('uncaughtException', error => {
  log.error('Ngoại lệ không ai bắt', { error: error.message, stack: error.stack });
  // Tiến trình sau một ngoại lệ không bắt được là tiến trình ở trạng thái không
  // xác định: thoát để trình quản lý tiến trình khởi động lại một bản sạch.
  server.close(() => process.exit(1));
  setTimeout(() => process.exit(1), 3000).unref();
});
