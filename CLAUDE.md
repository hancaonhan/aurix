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
| Kết nối CSDL, giao dịch | `server/db/pool.js` |
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

## Cơ sở dữ liệu

PostgreSQL 16, nối qua `pg` từ `server/db/pool.js`. Bốn điều cần biết:

1. **Mọi hàm chạm CSDL đều bất đồng bộ.** Quên một `await` thì không có lỗi nào
   hiện ra — hàm trả về `Promise`, rồi `.length` là `undefined`, `.c` là
   `undefined`, và mã chạy tiếp như bình thường với dữ liệu sai.
2. **Tham số là `$1`, `$2`…** chứ không phải `?`. Sai số lượng thì Postgres báo
   ngay, nên lỗi này an toàn hơn lỗi trên.
3. **Hai chỗ cố ý giữ đọc đồng bộ:** `allSettings()` và `overlay()`. Chúng được
   gọi hàng trăm lần giữa lúc dựng HTML, nên phục vụ từ đệm, nạp lúc khởi động,
   làm mới ở chế độ nền. Đừng biến chúng thành `async`.
4. **`LIKE` của Postgres phân biệt hoa thường.** Tìm kiếm do người dùng nhập thì
   phải dùng `ILIKE`, nếu không kết quả bị bỏ sót mà không báo lỗi gì.

Máy phát triển dùng database `aurix_dev`; website thật dùng `csdl_chung`. Cả hai
nằm trong cùng một instance PostgreSQL trên Vibe Host. **Đừng trỏ `.env` ở máy
vào `csdl_chung`** — chạy thử sẽ ghi vào dữ liệu khách hàng thật.

Sao lưu là bản kết xuất JSON, không phải `pg_dump` (container không có sẵn):

```bash
node server/cli.js backup                             # kết xuất ra server/data/backups/
node server/cli.js db:restore --file=<tệp> [--yes]    # XOÁ dữ liệu hiện có rồi nạp lại
```

## Lớp phủ nội dung

`site/data/*.js` giữ mảng gốc `RAW_x` rồi xuất `x = overlay('x', RAW_x, idField)`. Máy chủ chạy liên tục nên **không** được dùng giá trị đã phủ lúc nạp module — nó đứng yên mãi; tầng dịch vụ phải gọi `overlay()` lại ở mỗi lần đọc (xem `data: () => overlay(...)` trong `server/services/content.js`). Mỗi tệp cũng xuất `RAW` để làm việc đó.

## Bẫy đã gặp

- **Dữ liệu tiếng Việt gửi bằng `curl -d` trên shell này bị hỏng bảng mã.** Kiểm thử
  nội dung có dấu phải qua trình duyệt, đừng kết luận backend hỏng font.
- **Heredoc trong Bash trên máy này nuốt dấu gạch chéo ngược đôi** (`\\` → `\`) và
  `$$` → `$`. Viết tệp JS có regex bằng công cụ Write, đừng dùng `cat <<'EOF'`.
  Điều này áp cho cả `node -e "…"`: template literal có dấu backtick bên trong
  sẽ bị Bash diễn giải, sinh ra tệp sai mà không báo lỗi gì.
- **Node trên Windows hiểu `/tmp` thành `D:\tmp`** — thư mục không tồn tại. Dùng
  đường dẫn tuyệt đối hoặc thư mục tạm của phiên làm việc.
- **Vibe Host có nút "AI gợi ý biến" đọc `.env.example` rồi tự điền lại biến.**
  Nó từng dựng lại `AURIX_DB` trỏ vào đường dẫn VPS và làm container crash. Kiểm
  danh sách biến trước khi lưu, và giữ `.env.example` luôn khớp thực tế.
- **Biến nào có mặt trong `.env.example` mà để TRỐNG thì auto-config của Vibe
  Host coi là bắt buộc và chặn triển khai** (`auto-config thiếu env: ...`). Thêm
  biến mới vào tệp đó thì cho luôn giá trị mặc định dùng được, hoặc nhớ khai
  trên bảng điều khiển trước khi deploy.
- **IP nhà mạng đổi thì mất kết nối CSDL từ máy phát triển.** Danh sách IP ở tab
  "Truy cập từ bên ngoài" của CSDL trên Vibe Host chặn im lặng — `pg` treo tới
  hết thời gian chờ rồi báo `Connection terminated due to connection timeout`.
  Đó là dấu hiệu IP đã đổi, không phải lỗi trong mã.
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
