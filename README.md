# Aurix — Growth System Builder

Website chuyên sâu cho agency marketing Aurix. Frontend sinh tĩnh (SSG) để đạt tốc độ và SEO tối đa, backend Node thuần không phụ thuộc gói ngoài.

**Công nghệ • Giải pháp • Tăng trưởng**

---

## Chạy dự án

Yêu cầu: **Node.js 22.5 trở lên** (dự án dùng `node:sqlite`).

Không cần `npm install` để chạy — website và máy chủ **không phụ thuộc gói ngoài nào**. Toàn bộ ảnh và phông đã được dựng sẵn trong `public/`.

```bash
npm run dev
```

Mặc định chạy ở `http://localhost:4477`.

| Lệnh | Việc nó làm |
| --- | --- |
| `npm run dev` | Build rồi chạy máy chủ — lệnh dùng hằng ngày |
| `npm run build` | Sinh toàn bộ HTML tĩnh vào `public/`, kèm sitemap, robots, manifest, favicon |
| `npm run check` | Build rồi kiểm định — dùng cho CI |
| `npm start` | Chạy máy chủ (dùng HTML đã build sẵn) |
| `npm run audit` | Kiểm định SEO, liên kết, tài nguyên, khả năng tiếp cận |
| `npm run assets` | Tải phông và tối ưu ảnh (xem mục Tài nguyên bên dưới) |
| `npm run doctor` | Kiểm tra cấu hình, lược đồ, tài khoản — chạy trước mỗi lần deploy |
| `npm run user:create` | Tạo tài khoản nội bộ đầu tiên |
| `npm run routes` | Liệt kê toàn bộ tuyến API kèm quyền yêu cầu |
| `npm run backup` | Sao lưu cơ sở dữ liệu |

Toàn bộ lệnh vận hành nằm trong một công cụ duy nhất — `node server/cli.js` (xem `node server/cli.js help`). Đây cũng là cách vận hành hệ thống qua SSH khi đã lên hosting.

`npm run assets` **chỉ cần chạy lại khi thêm hoặc đổi ảnh nguồn** — kết quả đã được lưu sẵn trong `public/assets/`. Lệnh này cần `sharp`:

```bash
npm install
```

Đây là phụ thuộc **chỉ dùng lúc dựng tài nguyên**. Máy chủ và trang web khi chạy vẫn hoàn toàn không cần gói ngoài nào.

### Biến môi trường

Cấu hình đọc theo thứ tự: giá trị mặc định trong `server/core/config.js` → tệp `.env` ở gốc dự án → biến môi trường của tiến trình. Chép `.env.example` thành `.env` rồi điền — tệp đó mô tả đầy đủ từng biến.

Bốn biến quan trọng nhất khi lên môi trường thật:

| Biến | Ý nghĩa |
| --- | --- |
| `AURIX_SESSION_SECRET` | **Bắt buộc.** Ký cookie phiên. Thiếu là máy chủ từ chối khởi động |
| `AURIX_IP_SALT` | **Bắt buộc.** Muối băm IP. Không cố định thì giới hạn tần suất reset mỗi lần deploy |
| `AURIX_ORIGIN` | Tên miền thật — dùng cho canonical, sitemap và kiểm tra CSRF |
| `AURIX_TRUST_PROXY` | Số lớp reverse proxy phía trước. Khai sai là vô hiệu hoá giới hạn tần suất |

```bash
node server/cli.js secret   # sinh giá trị cho hai biến bí mật
node server/cli.js doctor   # kiểm tra toàn bộ cấu hình trước khi chạy
```

---


## Cấu trúc

```
site/            Nguồn nội dung và template (không phục vụ trực tiếp)
  data/          Nội dung: dịch vụ, dự án, ngành, khung A.U.R.I.X, bộ câu hỏi
  layouts/       Khung HTML gốc — SEO, JSON-LD, header, footer
  pages/         Từng loại trang
  lib/ui.js      Hàm render dùng chung
scripts/
  build.js       Trình sinh trang tĩnh
  audit.js       Bộ kiểm định chất lượng
  images.js      Sinh AVIF/WebP đáp ứng + ảnh mạng xã hội
  fonts.js       Tải và tự host phông chữ
public/          Thư mục được phục vụ
  assets/opt/    Ảnh đã tối ưu + manifest.json  (sinh tự động)
  assets/fonts/  Phông tự host              (sinh tự động)
  css/fonts.css  @font-face                 (sinh tự động)
server/
  server.js      Điểm khởi động: kiểm cấu hình, mở cổng, tắt máy êm
  app.js         Lắp ráp: thứ tự các tầng và danh sách module
  cli.js         Công cụ dòng lệnh vận hành
  core/          config, router, context, static, logger, errors
  security/      rbac, password, session, csrf, guard, headers, ratelimit
  modules/       Một tệp = một nhóm điểm cuối (thêm tệp là có tính năng)
  services/      Nghiệp vụ: leads, users, settings, audit
  db/            Kết nối + migration đánh số
  console/       Giao diện bảng điều khiển (theme, page, app)
  lib/           scoring, mailer, smtp, validate, truy vấn dữ liệu
deploy/          systemd, nginx, Dockerfile, deploy.sh, sổ tay vận hành
legacy/          Bản website cũ, giữ lại để tham chiếu
```

**Sửa nội dung ở `site/data/`, không sửa trực tiếp trong `public/`** — mọi thứ trong `public/*.html` sẽ bị ghi đè ở lần build kế tiếp.

---

## Bốn dịch vụ và khung A.U.R.I.X

Mỗi dịch vụ là một tầng trong khung phương pháp độc quyền:

| Tầng | Tên | Dịch vụ |
| --- | --- | --- |
| **A** | Adapt — Thích ứng | Web Cá nhân hoá |
| **U** | Unify — Hợp nhất | Xây hệ thống Marketing |
| **R** | Reach — Tiếp cận | Xây hệ thống Marketing |
| **I** | Ignite — Kích hoạt | Landing Page |
| **X** | Xpand — Nhân bản | Siêu chuyển đổi |

Khung này được định nghĩa một chỗ duy nhất tại `site/data/framework.js` và dùng lại ở trang chủ, trang phương pháp, trang dịch vụ và bộ chấm điểm chẩn đoán.

---

## Hai tính năng tạo khác biệt

### 1. Lớp cá nhân hoá (bản demo sống của dịch vụ "Web Cá nhân hoá")

Trang chủ tự đổi tiêu đề, mô tả, huy hiệu ngữ cảnh và chỉ số chứng minh theo ngành của người xem.

- **Phía máy chủ:** `GET /?nganh=spa` trả về HTML đã lắp sẵn nội dung cho ngành spa — không cần JavaScript, không nhấp nháy nội dung.
- **Phía trình duyệt:** người dùng bấm chọn ngành trên dải nút, nội dung đổi tức thì và lựa chọn được ghi nhớ cho lần sau.

Thử: `http://localhost:4477/?nganh=spa`, `?nganh=fitness`, `?nganh=giao-duc`, `?nganh=nha-khoa`, `?nganh=du-lich`, `?nganh=bat-dong-san`

**Đây là cá nhân hoá, không phải che giấu nội dung với máy tìm kiếm.** Bản mặc định là bản đầy đủ mà Googlebot nhận được, thẻ canonical luôn trỏ về đường dẫn sạch, và bản cá nhân hoá được gắn `Cache-Control: private`.

### 2. Chẩn đoán Hệ thống Tăng trưởng (`/chan-doan/`)

Mười một câu hỏi, chấm điểm phía máy chủ theo năm tầng A.U.R.I.X, trả về:

- Điểm hệ thống 0–100 (trung bình có trọng số, **bị phạt theo tầng yếu nhất** — hệ thống mạnh bằng mắt xích yếu nhất)
- Bảng điểm từng tầng kèm trạng thái yếu / trung bình / tốt
- Ước tính số tiền thất thoát mỗi tháng và mỗi năm
- Ba việc cần làm, xếp theo thứ tự ưu tiên, gắn tới dịch vụ tương ứng

Mô hình ước tính thất thoát được giữ **bảo thủ có chủ đích**: trần tối đa 22% doanh thu (`LEAK_CAP` trong `server/lib/scoring.js`). Một con số phóng đại sẽ phản tác dụng trước ban điều hành doanh nghiệp cao cấp.

Bộ câu hỏi nằm ở `site/data/diagnostic.js` và được **dùng chung** cho cả giao diện lẫn bộ chấm điểm — một nguồn sự thật, không thể lệch nhau.

---

## Backend

Máy chủ Node thuần, **không phụ thuộc gói ngoài nào**: `node:http` + `node:sqlite` + `node:crypto` + `node:zlib`.

### Kiến trúc

Mỗi tầng có đúng một việc, và mỗi thứ chỉ được định nghĩa ở một chỗ:

| Muốn đổi gì | Sửa đúng một tệp |
| --- | --- |
| Tham số vận hành | `server/core/config.js` — không module nào đọc `process.env` trực tiếp |
| Vai trò và quyền | `server/security/rbac.js` |
| Lược đồ cơ sở dữ liệu | `server/db/migrations.js` — **thêm** mục đánh số, không sửa mục cũ |
| Điểm cuối mới | thêm tệp vào `server/modules/`, ghi tên vào `MODULES` trong `server/app.js` |
| Tham số sửa lúc đang chạy | `server/services/settings.js` — thêm một dòng vào `SCHEMA` |
| Bộ sưu tập nội dung sửa được | bọc mảng gốc bằng `overlay()` trong `site/data/`, thêm một mục vào `COLLECTIONS` ở `server/services/content.js` |
| Giao diện bảng điều khiển | `server/console/theme.js` (màu) · `app.js` (màn hình) |

### Bảo mật

| Lớp | Cách làm |
| --- | --- |
| Mật khẩu | scrypt (N=2¹⁵), muối riêng từng tài khoản, tự băm lại khi tham số được nâng cấp |
| Phiên đăng nhập | Lưu phía máy chủ, cơ sở dữ liệu **chỉ giữ băm** của mã phiên; cookie HttpOnly + SameSite=Lax + Secure, có chữ ký HMAC |
| Thu hồi quyền | Khoá tài khoản hoặc đổi vai trò là đăng xuất **ngay** mọi thiết bị — điều mà token tự chứa không làm được |
| CSRF | Hai lớp độc lập: đối chiếu Origin và mã theo phiên gửi qua header |
| Phân quyền | Khai báo trên từng tuyến (`permission: 'leads.write'`), kiểm tập trung ở `security/guard.js` — quên khai báo thì tuyến bị chặn, không phải mở toang |
| Chống dò mật khẩu | Khoá tài khoản tạm thời sau 5 lần sai; đăng nhập luôn tốn một lượt băm kể cả khi email không tồn tại |
| Giới hạn tần suất | Theo IP đã băm, cấu hình riêng từng tuyến |
| Bảo vệ biểu mẫu | Bẫy bot bằng trường ẩn, giới hạn thân request 64 KB, làm sạch và kiểm tra mọi trường |
| Tiêu đề | CSP siết tới `'self'`, HSTS, COOP, CORP, `X-Frame-Options: DENY` |
| Kết xuất CSV | Chặn chèn công thức Excel, và mỗi lần kết xuất đều vào nhật ký kiểm toán |
| Dấu vết | Mọi hành động quản trị được ghi vào `audit_log` kèm người thực hiện và IP đã băm |

### Phân quyền

Năm vai trò, mười lăm quyền dạng `tài-nguyên.hành-động`:

| Vai trò | Phạm vi |
| --- | --- |
| `owner` | Toàn quyền, kể cả quản lý tài khoản và hệ thống |
| `admin` | Toàn bộ nghiệp vụ, không đụng tới hệ thống |
| `sales` | Chỉ thấy khách chưa ai nhận hoặc do chính mình phụ trách |
| `editor` | Toàn bộ nội dung website và xuất bản |
| `viewer` | Chỉ xem |

Phạm vi của `sales` do **tầng nghiệp vụ** áp đặt trong câu truy vấn, không phải do giao diện giấu bớt. Không vai trò nào tạo hay sửa được tài khoản có vai trò cao hơn mình, và chủ sở hữu cuối cùng không thể bị hạ quyền.

`node server/cli.js roles` in ra bảng đầy đủ.

### Quản trị nội dung

Toàn bộ nội dung website sửa, thêm và xoá được ngay trên bảng điều khiển — mười hai bộ sưu tập và sáu khối đơn lẻ:

| Nhóm | Sửa được |
| --- | --- |
| Dịch vụ & Dự án | Dịch vụ · Dự án · Ngành · Nội dung chuyên sâu theo ngành |
| Trang chủ & Phương pháp | Quy trình · Điểm khác biệt · Số liệu nổi bật · Cảm nhận khách hàng · Câu hỏi thường gặp |
| Đầu tư & Công ty | Gói dịch vụ · Yếu tố ảnh hưởng giá · Đội ngũ · Chính sách bảo mật |
| Chẩn đoán | Bộ câu hỏi chẩn đoán |
| Thương hiệu | Thông tin thương hiệu · Khung A.U.R.I.X · Nút kêu gọi hành động · Thanh điều hướng |

**Cách hoạt động — lớp phủ, không thay thế.** Dữ liệu gốc vẫn nằm trong `site/data/*.js` và vẫn đi kèm mã nguồn; bảng `content` chỉ ghi phần khác biệt, rồi [site/lib/overlay.js](site/lib/overlay.js) hoà hai lớp lại lúc dựng trang. Ba điều có được từ cách này:

1. **Hoàn tác được** — mỗi mục có nút *Khôi phục* trả về đúng bản trong mã nguồn.
2. **Website vẫn đầy đủ khi cơ sở dữ liệu trống** — máy mới, hoặc sau khi khôi phục sao lưu.
3. **Vẫn là HTML tĩnh sinh sẵn** — không mất một chút tốc độ hay SEO nào.

Mỗi mục có biểu mẫu cho những trường hay sửa, kèm ô **JSON** cho toàn bộ cấu trúc — kể cả phần lồng nhiều tầng như `service.solution.pillars`. Cố ý không mô hình hoá hết thành biểu mẫu: làm vậy sẽ khoá cứng đúng thứ cần giữ mềm nhất.

Sửa xong bấm **Xuất bản**: máy chủ chạy `build.js` rồi `audit.js` trong tiến trình con và in nhật ký ngay tại chỗ. Kiểm định hỏng thì báo đỏ và website đang chạy không bị đụng tới.

### Bảng điều khiển — `/bang-dieu-khien`

Cùng một hệ thống thiết kế với website: navy sâu, gold khắc, Playfair cho tên thương hiệu, Be Vietnam Pro cho phần còn lại — token màu chép thẳng từ `public/css/aurix.css` sang `server/console/theme.js`.

Mười màn hình: Tổng quan · Khách tiềm năng · Nội dung website · Kết quả chẩn đoán · Hàng đợi thư · Cấu hình site · Tài khoản · Nhật ký kiểm toán · Hệ thống · Của tôi. Thanh điều hướng chỉ hiện mục người dùng có quyền.

Viết bằng JavaScript thuần, không khung, không bước dựng — và **không có script nội tuyến**, nhờ vậy `script-src 'self'` giữ nguyên vẹn.

### API

| Điểm cuối | Phương thức | Quyền |
| --- | --- | --- |
| `/api/health` · `/api/version` | GET | công khai |
| `/api/site` | GET | công khai — tham số hiển thị cho frontend |
| `/api/personalize?nganh=<key>` | GET | công khai |
| `/api/diagnostic` | POST | công khai — chấm điểm → `{ ok, result }` |
| `/api/lead` | POST | công khai — nhận khách tiềm năng |
| `/api/auth/login` · `logout` · `me` · `password` | POST/GET | phiên đăng nhập |
| `/api/console/leads…` | GET/PATCH/POST/DELETE | `leads.*` |
| `/api/console/users…` | GET/POST/PATCH/DELETE | `users.*` |
| `/api/console/content…` | GET/POST/PUT/DELETE | `content.*` |
| `/api/console/settings` | GET/PUT | `settings.*` |
| `/api/console/stats` · `diagnostics` · `mail` · `audit` · `system` | GET | quyền tương ứng |

`node server/cli.js routes` in ra toàn bộ 46 tuyến kèm quyền yêu cầu.

Điểm cuối công khai giữ nguyên hình dạng phản hồi cũ (`{ ok, error, message }`, `{ ok, result }`, `{ ok, variant }`) — frontend hiện tại không phải sửa một dòng nào.

---

## Tài nguyên: ảnh và phông chữ

Hai pipeline này là lý do trang tải nhanh. Cả hai đều **chạy lúc dựng, không chạy lúc phục vụ**.

### Ảnh — `npm run images`

Ảnh gốc trong `public/assets/` là PNG 1,5 – 2,3 MB mỗi tệp. Pipeline sinh AVIF + WebP nhiều kích thước vào `public/assets/opt/` kèm `manifest.json`.

| | Trước | Sau |
| --- | --- | --- |
| 18 ảnh nguồn | 30,9 MB | **1,5 MB** (giảm 95%) |
| Ảnh hero (LCP) | 1 573 KB | **14 KB** ở khổ hiển thị thật |
| Ảnh chân dung 54×54 | 1 738 KB | **9 KB** |

Hàm `picture()` trong [site/lib/ui.js](site/lib/ui.js) đọc manifest và **tự sinh `srcset` cùng `sizes`** — code trang không phải sửa gì. Bề rộng được chọn theo vai trò ảnh (`hero`, `wide`, `card`, `avatar`, `logo`), khai báo ở [scripts/images.js](scripts/images.js).

Thêm ảnh mới: bỏ tệp vào `public/assets/`, khai báo một dòng trong `SOURCES`, chạy `npm run images`. Pipeline bỏ qua ảnh không đổi nên chạy lại rất nhanh; `--force` để làm lại toàn bộ.

Script cũng sinh `og-aurix.jpg` 1200×630 cho thẻ chia sẻ mạng xã hội — **JPEG chứ không phải WebP/AVIF**, vì Facebook, Zalo và LinkedIn không đọc được hai định dạng kia. Bộ kiểm định sẽ báo lỗi nếu `og:image` trỏ tới WebP hoặc AVIF.

### Phông chữ — `npm run fonts`

Phông được **tự host**, không gọi Google Fonts. Script tải woff2 rồi sinh `public/css/fonts.css`.

Lợi ích: bỏ hai lần bắt tay DNS/TLS tới miền bên ngoài, bỏ subset `latin-ext` mà tiếng Việt không dùng, và cho phép siết `Content-Security-Policy` xuống còn `'self'` — trang hiện **không gọi tới bất kỳ miền bên thứ ba nào**.

Phông đang dùng: Be Vietnam Pro 400/600/700/800 và Playfair Display 500 + 500 nghiêng, mỗi trọng lượng hai subset `vietnamese` và `latin` — 12 tệp, 189 KB, cache một năm.

Mỗi trọng lượng thêm vào tốn khoảng 34 KB, nên hãy cân nhắc trước khi mở rộng bảng chữ.

---

## SEO và hiệu năng

Đã có sẵn:

- HTML tĩnh thật cho mọi trang — không dựng nội dung bằng JavaScript
- Tiêu đề, mô tả, canonical **không trùng lặp** trên toàn site (kiểm định tự động bắt buộc)
- JSON-LD `@graph`: Organization, WebSite, WebPage, BreadcrumbList, Service, FAQPage, CreativeWork, WebApplication
- Open Graph và Twitter Card đầy đủ
- CSS quan trọng nhúng thẳng vào `<head>`, phần còn lại tải sau
- Nén Brotli và gzip theo yêu cầu, ETag, `304 Not Modified`
- Ảnh AVIF + WebP đáp ứng, có `width`/`height` nên **CLS bằng 0**
- Preload đúng định dạng `<picture>` sẽ chọn, nên không tải trùng tệp nào
- Không một request nào tới miền bên thứ ba
- Tài nguyên gắn mã phiên bản build để cache an toàn
- `sitemap.xml`, `robots.txt`, `site.webmanifest`, favicon SVG sinh tự động
- Tiêu đề bảo mật: CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`
- Khả năng tiếp cận: liên kết bỏ qua điều hướng, mốc ARIA, nhãn cho mọi nút, bẫy tiêu điểm bàn phím, tôn trọng `prefers-reduced-motion`

Chạy `node scripts/audit.js` sau mỗi lần build. Bộ kiểm định **thất bại** (mã thoát 1) khi có liên kết hỏng, ảnh thiếu, thẻ SEO trùng, thiếu `h1`, JSON-LD sai cú pháp hoặc ảnh thiếu `alt` — phù hợp để gắn vào CI.

---

## Trước khi đưa lên môi trường thật

Hướng dẫn đầy đủ: **[deploy/VAN-HANH.md](deploy/VAN-HANH.md)** — dựng máy chủ, triển khai, bảng lệnh quản trị, sao lưu, xử lý sự cố.

- [ ] Chép `.env.example` thành `.env`, đặt `AURIX_SESSION_SECRET` và `AURIX_IP_SALT` (sinh bằng `node server/cli.js secret`)
- [ ] Đặt `AURIX_ORIGIN` đúng tên miền và `AURIX_TRUST_PROXY` đúng số lớp proxy
- [ ] Chạy `node server/cli.js doctor` — phải xanh hết
- [ ] Tạo tài khoản chủ sở hữu: `node server/cli.js user:create`
- [ ] Thay thông tin liên hệ thật trong `site/data/site.js` (điện thoại, email, địa chỉ, mạng xã hội hiện đang là giá trị mẫu)
- [ ] Đối chiếu lại toàn bộ số liệu trong `site/data/content.js` và `services.js` với kết quả thật của từng dự án
- [ ] Đặt máy chủ sau reverse proxy có HTTPS (`deploy/nginx.conf`) và chạy bằng systemd (`deploy/aurix.service`)
- [ ] Cấu hình SMTP, kiểm tra bằng `node server/cli.js mail:status`
- [ ] Đặt lịch sao lưu hằng đêm: `node server/cli.js backup --keep=30`
- [ ] Chép bản sao lưu ra khỏi máy chủ (bản sao cùng ổ đĩa không cứu được gì khi ổ hỏng)
