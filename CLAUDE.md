# Aurix — ghi chú cho Claude

Website + backend của Aurix Vietnam (agency marketing, định vị **Growth System Builder**).
Viết tài liệu, comment, thông điệp lỗi và giao diện **bằng tiếng Việt**.

## Nguyên tắc bất di bất dịch

1. **Hạn chế phụ thuộc runtime.** Máy chủ chạy bằng thư viện chuẩn của Node
   (`node:http`, `node:crypto`, `node:zlib`) cộng **đúng một** phụ thuộc runtime:
   `pg` để nói chuyện với PostgreSQL. `sharp` là phụ thuộc **chỉ dùng lúc dựng
   ảnh**. Đừng đề xuất Express, Prisma, React, hay bất cứ gói nào khác.
   `node:sqlite` đã bị bỏ — xem mục "Cơ sở dữ liệu" bên dưới.
2. **Không sửa `public/*.html`** — sinh từ `site/` bằng `npm run build`, sửa là mất.
   `public/js/*.js` và `public/css/*.css` thì ngược lại: sửa trực tiếp.
3. **Không sửa migration đã chạy** trong `server/db/migrations.js` — thêm mục mới.
4. **Không nới CSP.** Không `unsafe-inline` trong `script-src`, không script nội tuyến.
5. **Quyền khai báo trên tuyến**, không viết `if` kiểm quyền trong handler.

## Sửa gì thì vào đâu

| Việc | Tệp |
| --- | --- |
| Tham số vận hành | `server/core/config.js` (không đọc `process.env` ở nơi khác) |
| Vai trò & quyền | `server/security/rbac.js` |
| Lược đồ dữ liệu | `server/db/migrations.js` (thêm mục đánh số) |
| Điểm cuối API mới | tệp mới trong `server/modules/` + ghi tên vào `MODULES` ở `server/app.js` |
| Tham số sửa lúc chạy | `server/services/settings.js` → `SCHEMA` |
| Nghiệp vụ | `server/services/` |
| Giao diện bảng điều khiển | `server/console/theme.js` (màu) · `server/console/app.js` (màn hình) |
| Nội dung website | `site/data/` rồi `npm run build` — hoặc sửa ngay trên bảng điều khiển |
| Bộ sưu tập nội dung sửa được | `overlay()` trong `site/data/` + `COLLECTIONS` trong `server/services/content.js` |

## Lệnh hay dùng

```bash
npm run dev                        # build + chạy máy chủ ở cổng 4477
node server/cli.js help            # toàn bộ lệnh vận hành
node server/cli.js doctor          # kiểm cấu hình — chạy sau mỗi thay đổi
node server/cli.js routes          # tuyến API + quyền yêu cầu
node scripts/audit.js              # kiểm định SEO/liên kết/ảnh, thoát 1 khi lỗi
```

Sau khi sửa backend, chạy đủ bộ ba trước khi báo xong:

```bash
node server/cli.js doctor && node scripts/audit.js && node server/cli.js migrate
```

## Lớp phủ nội dung

`site/data/*.js` giữ mảng gốc `RAW_x` rồi xuất `x = overlay('x', RAW_x, idField)`. Máy chủ chạy liên tục nên **không** được dùng giá trị đã phủ lúc nạp module — nó đứng yên mãi; tầng dịch vụ phải gọi `overlay()` lại ở mỗi lần đọc (xem `data: () => overlay(...)` trong `server/services/content.js`). Mỗi tệp cũng xuất `RAW` để làm việc đó.

## Bẫy đã gặp

- **Dữ liệu tiếng Việt gửi bằng `curl -d` trên shell này bị hỏng bảng mã.** Kiểm thử
  nội dung có dấu phải qua trình duyệt, đừng kết luận backend hỏng font.
- **Heredoc trong Bash trên máy này nuốt dấu gạch chéo ngược đôi** (`\\` → `\`) và
  `$$` → `$`. Viết tệp JS có regex bằng công cụ Write, đừng dùng `cat <<'EOF'`.
- `pkill -f node` không kill được tiến trình trên Windows; dùng PowerShell
  `Get-CimInstance Win32_Process` + `Stop-Process`.
- Bảng điều khiển dựng DOM bằng `innerHTML`, nên **không** bật
  `require-trusted-types-for 'script'` trong CSP — Chromium sẽ làm trắng trang.
- `/api/site` có `Cache-Control: public, max-age=60`; đổi cấu hình xong phải đợi
  tới một phút mới thấy trên trang đã mở sẵn.

## Triển khai

`deploy/VAN-HANH.md` là sổ tay đầy đủ. Một lệnh triển khai:

```bash
ssh aurix@may-chu 'cd /var/www/aurix && ./deploy/deploy.sh'
```
