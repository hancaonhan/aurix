# Bộ nhận diện Aurix

Nguồn gốc: `public/assets/Logo.png` (logo trên nền chuyển sắc) và
`public/assets/logo-toi-aurix.png` (logo chữ xanh trên nền trong suốt).
Mọi màu và tài sản dưới đây lấy từ hai tệp này.

## Logo

| Tệp | Dùng ở đâu |
| --- | --- |
| `assets/logo-toi-aurix.png` | Nền sáng: đầu trang website |
| `assets/logo-trang-aurix.png` | Nền tối: chân trang, bảng điều khiển |
| `assets/Logo.png` | Ảnh nhận diện đầy đủ, nguồn của ảnh chia sẻ mạng xã hội |
| `favicon.ico`, `favicon.png`, `apple-touch-icon.png`, `assets/icon-512.png` | Biểu tượng: chữ A trắng + chấm cam trên nền chuyển sắc |

- Chấm trên chữ i **luôn màu cam**, kể cả trên logo trắng.
- Không đổi màu chữ logo ngoài hai bản xanh và trắng; không đặt logo xanh lên nền tối.
- Khoảng trống quanh logo tối thiểu bằng chiều cao chữ U.

Logo trắng, favicon và biểu tượng **sinh tự động** từ logo xanh. Thay logo thì
chỉ thay `logo-toi-aurix.png` và `Logo.png`, rồi chạy:

```bash
npm run brand && node scripts/images.js && npm run build
```

## Màu

| Vai trò | Mã | Biến CSS |
| --- | --- | --- |
| Xanh chữ logo — tiêu đề, nút chính | `#0E3B3D` | `--brand` |
| Xanh sáng (đầu dải chuyển sắc) — hover, liên kết | `#046E72` | `--brand-2` |
| Xanh đậm (cuối dải chuyển sắc) | `#012B2B` | `--brand-deep` |
| Nền xanh nhạt — ô nhấn trên nền trắng | `#E6F1F0` | `--brand-soft` |
| Cam chấm chữ i — điểm nhấn, nút trên nền tối | `#F27A1A` | `--gold-200` |
| Cam đậm — **chữ** cam trên nền trắng (đủ tương phản 4.5:1) | `#C4560A` | `--gold-300` |
| Chữ thân | `#10252A` | `--fg` |

Dải chuyển sắc thương hiệu (nền khối tối, giống ảnh nhận diện):

```css
--brand-grad: linear-gradient(135deg, #046E72 0%, #045152 45%, #012B2B 100%);
```

Tên biến `--gold-*` là di sản từ bảng màu cũ, giữ lại để không phải sửa hàng
trăm quy tắc; nghĩa hiện tại là **cam**.

### Nguyên tắc dùng màu

- Nền trang trắng, xen kẽ `#F5F7F6` để tách mục. Khối cần dừng mắt (kêu gọi
  hành động, chân trang, kết quả máy tính, câu nguyên tắc) dùng dải chuyển sắc.
- Cam là điểm nhấn, không phải màu nền lớn: một nút, một con số, một chấm.
  Mỗi màn hình tối đa một khối cam.
- Chữ cam trên nền trắng dùng `#C4560A`, không dùng `#F27A1A` (chỉ đạt ~2.9:1).

## Khẩu hiệu

**Công nghệ • Giải pháp • Tăng trưởng** — chấm ngăn giữa màu cam. Trên website
dùng `brandLineHtml()` trong `site/layouts/base.js` để giữ đúng kiểu này.

## Chữ

Be Vietnam Pro, tự host trong `public/css/fonts.css`. Tiêu đề 700–800, thân
bài 400. Không dùng chữ có chân hay chữ nghiêng làm điểm nhấn.

## Áp dụng ở đâu

- Website: `public/css/aurix.css` (`:root`) và `public/css/sections.css`
- Bảng điều khiển (nền tối): `server/console/theme.js`
- Thư gửi khách và sales: `server/lib/mailer.js` (màu viết cứng vì ứng dụng
  email không hiểu biến CSS)
- Ảnh chia sẻ mạng xã hội: `scripts/images.js` → `buildOgImage()`
