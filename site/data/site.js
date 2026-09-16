import { overlayObject, overlayValue } from '../lib/overlay.js';
// Cấu hình thương hiệu & SEO toàn cục cho Aurix
const RAW_site = {
  name: 'Aurix',
  legalName: 'Aurix Vietnam Co., Ltd',
  brandLine: 'Công nghệ • Giải pháp • Tăng trưởng',
  positioning: 'Growth System Builder',
  origin: process.env.AURIX_ORIGIN || 'https://aurixvietnam.vn',
  locale: 'vi_VN',
  lang: 'vi',
  themeColor: '#0B1220',
  // Thông tin liên hệ — thay bằng dữ liệu thật trước khi go-live
  phone: '0943 434 489',
  phoneHref: 'tel:+84943434489',
  // Dạng E.164 cho dữ liệu có cấu trúc — Google cần dạng này để hiển thị nút gọi
  phoneE164: '+84943434489',
  email: 'admin@aurixvietnam.vn',
  zalo: 'https://zalo.me/0943434489',
  // Toạ độ văn phòng — cần cho schema LocalBusiness và Google Business Profile.
  // ⚠ Toạ độ dưới đây là vị trí đường Nguyễn Khang, cần chỉnh lại cho đúng số nhà.
  geo: { lat: 21.0227, lng: 105.7970 },
  openingHours: 'Mo-Fr 08:30-18:00',
  priceRange: '$$$',
  address: {
    street: '32, Ngõ 87, Nguyễn Khang',
    city: 'Hà Nội',
    country: 'VN'
  },
  // CHƯA THẬT — sameAs sai còn hại hơn không khai báo, thay trước khi go-live
  social: {
    facebook: 'https://facebook.com/aurix.vn',
    linkedin: 'https://linkedin.com/company/aurix-vn',
    youtube: 'https://youtube.com/@aurixvn'
  },
  // Ảnh thương hiệu
  logo: '/assets/logo-trang-aurix.webp',
  logoFallback: '/assets/logo-trang-aurix.png',
  ogImage: '/assets/opt/og-aurix.jpg',
  founded: '2021'
};

export const site = overlayObject('site', RAW_site);

const RAW_nav = [
  { label: 'Dịch vụ', href: '/dich-vu/', children: [
    // Xếp đúng thứ tự A · U · R · I · X — người xem đọc menu là học luôn khung phương pháp
    { label: 'Web Cá nhân hoá', href: '/dich-vu/web-ca-nhan-hoa/', kicker: 'ATTRACT', desc: 'Bản sắc thương hiệu giữ chân người xem.' },
    { label: 'Xây hệ thống Marketing', href: '/dich-vu/he-thong-marketing/', kicker: 'UNIFY', desc: 'Phễu, dữ liệu, CRM và vận hành thành một guồng.' },
    { label: 'Phủ sóng đa kênh', href: '/dich-vu/phu-song-da-kenh/', kicker: 'REACH', desc: 'Đưa thương hiệu đến đúng người sẵn sàng trả tiền.' },
    { label: 'Landing Page', href: '/dich-vu/landing-page/', kicker: 'IGNITE', desc: 'Trang đích được thiết kế để chốt, không để đẹp.' },
    { label: 'Siêu chuyển đổi', href: '/dich-vu/sieu-chuyen-doi/', kicker: 'XPAND', desc: 'Tối ưu liên tục để nhân đôi tỉ lệ chốt.' }
  ]},
  { label: 'Phương pháp', href: '/phuong-phap/' },
  { label: 'Ngành', href: '/nganh/' },
  { label: 'Dự án', href: '/du-an/' },
  { label: 'Kiến thức', href: '/kien-thuc/' },
  { label: 'Đầu tư', href: '/dau-tu/' },
  { label: 'Về Aurix', href: '/ve-aurix/' }
];

export const nav = overlayValue('nav', RAW_nav);

const RAW_cta = {
  primary: { label: 'Nhận chẩn đoán hệ thống', href: '/chan-doan/' },
  secondary: { label: 'Đặt lịch tư vấn', href: '/lien-he/' }
};

export const cta = overlayValue('cta', RAW_cta);

export { RAW_site, RAW_nav, RAW_cta };
