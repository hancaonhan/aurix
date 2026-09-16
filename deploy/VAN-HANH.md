# Aurix — Sổ tay vận hành trên hosting

Tài liệu này viết để **dán thẳng lệnh vào terminal**. Mọi việc quản trị đều làm
được bằng một dòng lệnh qua SSH — không cần mở giao diện, không cần sửa cơ sở dữ
liệu bằng tay, và vì vậy cũng **ra lệnh cho Claude làm hộ được**.

Quy ước dưới đây: `aurix@may-chu` là tài khoản SSH, mã nguồn nằm ở `/var/www/aurix`.

---

## 1. Dựng máy chủ lần đầu

Yêu cầu: Ubuntu 22.04 trở lên, **Node.js 22.5+** (dự án dùng `node:sqlite` có sẵn
trong thư viện chuẩn).

```bash
# Tài khoản riêng cho dịch vụ — không chạy bằng root
sudo adduser --system --group --home /var/www/aurix aurix
sudo mkdir -p /var/www/aurix /var/backups/aurix
sudo chown -R aurix:aurix /var/www/aurix /var/backups/aurix

# Mã nguồn
sudo -u aurix git clone <địa-chỉ-kho-mã> /var/www/aurix
cd /var/www/aurix

# Cấu hình
sudo -u aurix cp .env.example .env
sudo -u aurix node server/cli.js secret   # chép giá trị vào AURIX_SESSION_SECRET
sudo -u aurix node server/cli.js secret   # chép giá trị vào AURIX_IP_SALT
sudo -u aurix nano .env

# Kiểm tra trước khi chạy
sudo -u aurix node server/cli.js doctor

# Tài khoản chủ sở hữu đầu tiên
sudo -u aurix node server/cli.js user:create

# Dịch vụ
sudo cp deploy/aurix.service /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable --now aurix

# Reverse proxy + HTTPS
sudo cp deploy/nginx.conf /etc/nginx/sites-available/aurix
sudo ln -s /etc/nginx/sites-available/aurix /etc/nginx/sites-enabled/
sudo certbot --nginx -d aurixvietnam.vn -d www.aurixvietnam.vn
sudo nginx -t && sudo systemctl reload nginx
```

Bảng điều khiển: `https://aurixvietnam.vn/bang-dieu-khien`

---

## 2. Triển khai bản mới

```bash
ssh aurix@may-chu 'cd /var/www/aurix && ./deploy/deploy.sh'
```

Script tự làm theo thứ tự: **sao lưu → lấy mã mới → dựng HTML → kiểm định → migration
→ khởi động lại → kiểm tra sức khoẻ.** Kiểm định thất bại thì dừng và **không**
khởi động lại dịch vụ đang chạy tốt.

Quay lại bản trước:

```bash
ssh aurix@may-chu 'cd /var/www/aurix && git reset --hard HEAD~1 && ./deploy/deploy.sh'
```

---

## 3. Bảng lệnh quản trị

Chạy tại `/var/www/aurix` dưới tài khoản `aurix`.

### Tài khoản và phân quyền

```bash
node server/cli.js user:list
node server/cli.js user:create --email=an@aurixvietnam.vn --name="Nguyễn An" --role=sales
node server/cli.js user:role an@aurixvietnam.vn admin
node server/cli.js user:password an@aurixvietnam.vn     # sinh mật khẩu tạm
node server/cli.js user:lock an@aurixvietnam.vn         # khoá + đăng xuất mọi thiết bị
node server/cli.js user:unlock an@aurixvietnam.vn
node server/cli.js roles                                # bảng vai trò và quyền
```

Năm vai trò: `owner` · `admin` · `sales` · `editor` · `viewer`.

### Cấu hình website (có hiệu lực ngay, không cần deploy)

```bash
node server/cli.js settings:list
node server/cli.js settings:set contact.phone "0943 434 489"
node server/cli.js settings:set banner.enabled true
node server/cli.js settings:set banner.text "Ưu đãi tháng 10 — miễn phí buổi chẩn đoán"
node server/cli.js settings:set personalize.enabled false
```

### Dữ liệu và hệ thống

```bash
node server/cli.js doctor            # kiểm tra toàn bộ cấu hình
node server/cli.js db:status         # lược đồ, kích thước, số bản ghi
node server/cli.js migrate           # đưa lược đồ lên bản mới nhất
node server/cli.js backup --keep=14  # sao lưu, giữ 14 bản gần nhất
node server/cli.js routes            # toàn bộ tuyến API kèm quyền yêu cầu
node server/cli.js purge:sessions
```

### Thư và nhật ký

```bash
node server/cli.js mail:status
node server/cli.js mail:drain                   # đẩy hàng đợi ngay
node server/cli.js audit:tail --limit=100       # ai đã làm gì
node server/cli.js audit:tail --action=auth     # lọc theo nhóm hành động
node server/cli.js audit:prune --days=365
```

### Dịch vụ

```bash
sudo systemctl status aurix
sudo systemctl restart aurix
journalctl -u aurix -f              # nhật ký trực tiếp
journalctl -u aurix -p err -n 100   # chỉ lỗi
```

---

## 4. Ra lệnh cho Claude sửa trực tiếp trên hosting

Backend được thiết kế để **sửa được từ xa an toàn**: mọi thứ đội ngũ cần đổi đều
nằm sau một lệnh CLI hoặc một tệp duy nhất, không rải rác.

### Cách nói với Claude

Mở Claude Code ngay tại thư mục dự án (máy cá nhân hoặc SSH vào máy chủ) rồi nói
bằng tiếng Việt, ví dụ:

| Muốn gì | Nói với Claude |
| --- | --- |
| Đổi số điện thoại hiển thị | "Đổi số điện thoại hiển thị thành 0987 654 321" |
| Thêm tài khoản cho nhân viên | "Tạo tài khoản sales cho chị Lan, email lan@aurixvietnam.vn" |
| Bật khuyến mãi | "Bật băng-rôn với nội dung ưu đãi tháng 10" |
| Thêm một quyền mới | "Thêm quyền `reports.read` và gán cho vai trò editor" |
| Thêm một điểm cuối API | "Thêm API trả về danh sách khách đã chốt trong tháng" |
| Thêm một cột dữ liệu | "Thêm trường ngày hẹn gặp cho khách tiềm năng" |
| Xem chuyện gì đang hỏng | "Xem nhật ký máy chủ 100 dòng gần nhất và giải thích" |

### Vì sao sửa được mà không sợ vỡ

| Việc muốn sửa | Chỉ phải chạm vào |
| --- | --- |
| Tham số vận hành | `server/core/config.js` — một nguồn duy nhất, không đọc `process.env` rải rác |
| Vai trò và quyền | `server/security/rbac.js` — thêm một dòng vào `PERMISSIONS` và `ROLES` |
| Lược đồ cơ sở dữ liệu | `server/db/migrations.js` — **thêm** một mục đánh số, không sửa mục cũ |
| Điểm cuối API mới | thêm tệp vào `server/modules/`, ghi tên vào `MODULES` trong `server/app.js` |
| Tham số sửa lúc chạy | `server/services/settings.js` — thêm một dòng vào `SCHEMA`, không cần migration |
| Giao diện bảng điều khiển | `server/console/theme.js` (màu sắc) và `server/console/app.js` (màn hình) |
| Nội dung website | `site/data/` rồi chạy `npm run build` |

Sau khi Claude sửa, luôn chạy bộ ba này trước khi khởi động lại:

```bash
node server/cli.js doctor && node scripts/audit.js && node server/cli.js migrate
```

### Ranh giới an toàn

Có vài việc CLI **cố tình không làm được**, và Claude cũng không nên vượt qua:

- Không có lệnh nào in ra mật khẩu đã lưu — chỉ có `user:password` **đặt lại**.
- Không có lệnh xoá hàng loạt khách tiềm năng; xoá từng bản ghi phải qua bảng
  điều khiển và được ghi vào nhật ký kiểm toán.
- `.env` không nằm trong kho mã. Đổi bí mật là việc làm thủ công trên máy chủ.
- Mọi hành động quản trị đều để lại dấu vết: `node server/cli.js audit:tail`.

---

## 5. Sao lưu và khôi phục

Đặt lịch sao lưu hằng đêm:

```bash
sudo -u aurix crontab -e
# 0 2 * * * cd /var/www/aurix && /usr/bin/node server/cli.js backup --keep=30
```

Khôi phục:

```bash
sudo systemctl stop aurix
sudo -u aurix cp /var/backups/aurix/aurix-<dấu-thời-gian>.db /var/www/aurix/server/data/aurix.db
sudo -u aurix rm -f /var/www/aurix/server/data/aurix.db-wal /var/www/aurix/server/data/aurix.db-shm
sudo systemctl start aurix && node server/cli.js db:status
```

Nên chép bản sao lưu ra khỏi máy chủ (`rsync`, S3, Google Drive) — bản sao nằm
cùng ổ đĩa với bản gốc không cứu được gì khi ổ đĩa hỏng.

---

## 6. Sự cố thường gặp

| Hiện tượng | Nguyên nhân hay gặp | Xử lý |
| --- | --- | --- |
| Dịch vụ không lên | Thiếu `AURIX_SESSION_SECRET` ở `NODE_ENV=production` | `node server/cli.js doctor` |
| Đăng nhập xong bị đá ra ngay | `AURIX_SECURE_COOKIES=true` nhưng đang vào bằng HTTP | Bật HTTPS, hoặc tắt cờ đó khi thử nghiệm |
| Giới hạn tần suất chặn nhầm cả văn phòng | `AURIX_TRUST_PROXY` khai sai nên mọi người chung một IP | Đặt đúng số lớp proxy |
| Thư không gửi | Chưa cấu hình SMTP | `node server/cli.js mail:status`, điền `SMTP_*` rồi `mail:drain` |
| Lỗi CSRF liên tục | `AURIX_ORIGIN` không khớp tên miền thật | Sửa `.env` rồi khởi động lại |
| Quên mật khẩu chủ sở hữu | — | `node server/cli.js user:password <email>` |
