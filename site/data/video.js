/*
 * Video giới thiệu 9:16 trên trang chủ.
 *
 * Tệp nằm dưới /assets/ nên được giữ trong bộ nhớ đệm một năm: thay video thì
 * ĐỔI TÊN tệp (tăng số phiên bản), đừng ghi đè tên cũ.
 * Nguồn dựng (kịch bản, giọng đọc, nhạc) nằm ngoài kho mã; xem ghi chú trong
 * BRAND.md mục Video.
 */
export const introVideo = {
  title: 'Aurix trong 60 giây',
  description: 'Aurix là agency marketing cho spa, nha khoa, giáo dục và fitness: website, hệ thống marketing, quảng cáo, landing page và tối ưu tỉ lệ chốt, đo được tới doanh thu.',
  src: '/assets/video/aurix-gioi-thieu-v1.mp4',
  poster: '/assets/video/aurix-gioi-thieu-v1.jpg',
  captions: '/assets/video/aurix-gioi-thieu-v1.vtt',
  width: 720,
  height: 1280,
  // ISO 8601, dùng cho dữ liệu có cấu trúc VideoObject
  duration: 'PT1M2S',
  uploadDate: '2026-10-10'
};
