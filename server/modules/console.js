/**
 * Phục vụ giao diện bảng điều khiển.
 *
 * Hai tuyến, cả hai đều không chứa dữ liệu: khung HTML và tệp script. Việc
 * xác thực nằm ở các tuyến API mà script gọi — nhờ vậy trang đăng nhập và
 * trang ứng dụng là cùng một tệp tĩnh, không có nhánh nào rẽ theo quyền ở
 * tầng HTML để mà rò rỉ.
 */
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { consolePage } from '../console/page.js';
import config from '../core/config.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const APP_JS = join(HERE, '..', 'console', 'app.js');

export const CONSOLE_PATH = '/bang-dieu-khien';

let scriptCache = null;

export function register(router) {
  router.get(CONSOLE_PATH, ctx => ctx.html(200, consolePage(), {
    'X-Robots-Tag': 'noindex, nofollow, noarchive'
  }));

  router.get(`${CONSOLE_PATH}/app.js`, async ctx => {
    // Ở môi trường phát triển luôn đọc lại tệp: sửa xong tải lại trang là thấy.
    if (!scriptCache || config.isDev) {
      scriptCache = await readFile(APP_JS, 'utf8');
    }
    return ctx.text(200, scriptCache, {
      'Content-Type': 'text/javascript; charset=utf-8',
      'Cache-Control': config.isProd ? 'private, max-age=300' : 'no-store'
    });
  });

  /* Đường dẫn cũ `/admin` chuyển sang bảng điều khiển mới, giữ đường liên kết
     đã lưu của đội ngũ không bị hỏng. */
  router.get('/admin', ctx => ctx.redirect(CONSOLE_PATH, 301));
}
