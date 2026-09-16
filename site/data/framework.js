import { overlayObject } from '../lib/overlay.js';
// A.U.R.I.X Growth OS — bộ khung phương pháp độc quyền, là tài sản thương hiệu
// 5 tầng, mỗi tầng gắn với một dịch vụ và một chỉ số đo được.
const RAW_framework = {
  code: 'A.U.R.I.X',
  name: 'Aurix Growth OS',
  promise: 'Năm tầng của một cỗ máy tăng trưởng, xếp đúng thứ tự phải làm. Thiếu một tầng, cả hệ thống rò rỉ.',
  // Câu này giải thích vì sao Reach đứng thứ ba chứ không đứng đầu —
  // và vì sao Aurix không nhận chạy quảng cáo lẻ.
  principle: 'Đừng mua traffic khi chưa có nơi đón và chưa có thước đo.',
  layers: [
    {
      letter: 'A',
      key: 'attract',
      title: 'Attract',
      vi: 'Thu hút & Giữ chân',
      headline: 'Bản sắc thương hiệu giữ người ta ở lại',
      desc: 'Một website mang đúng bản sắc riêng của thương hiệu, không mượn mẫu của ai. Khách ở lại lâu hơn, nhớ lâu hơn và tin trước khi bạn kịp bán.',
      metric: 'Thời gian ở lại trang',
      metricDelta: '+180%',
      service: '/dich-vu/web-ca-nhan-hoa/'
    },
    {
      letter: 'U',
      key: 'unify',
      title: 'Unify',
      vi: 'Hợp nhất',
      headline: 'Một nguồn sự thật cho mọi con số',
      desc: 'Website, quảng cáo, CRM, tổng đài và doanh thu nối về một nơi. Bạn biết chính xác đồng nào sinh ra đơn nào.',
      metric: 'Dữ liệu khớp doanh thu',
      metricDelta: '98%',
      service: '/dich-vu/he-thong-marketing/'
    },
    {
      letter: 'R',
      key: 'reach',
      title: 'Reach',
      vi: 'Tiếp cận',
      headline: 'Đúng người, đúng lúc, đúng giá',
      desc: 'Chỉ mở kênh sau khi đã có bản sắc để thể hiện và thước đo để kiểm chứng. Ngân sách dồn về đúng nhóm sinh ra doanh thu, không rải mỏng theo trào lưu.',
      metric: 'Chi phí mỗi khách tiềm năng',
      metricDelta: '−36%',
      service: '/dich-vu/phu-song-da-kenh/'
    },
    {
      letter: 'I',
      key: 'ignite',
      title: 'Ignite',
      vi: 'Kích hoạt',
      headline: 'Trang đích được thiết kế để chốt',
      desc: 'Offer, cấu trúc thuyết phục, bằng chứng niềm tin và form ma sát thấp. Mỗi pixel phải trả lời một lý do từ chối.',
      metric: 'Tỉ lệ điền form',
      metricDelta: '+164%',
      service: '/dich-vu/landing-page/'
    },
    {
      letter: 'X',
      key: 'xpand',
      title: 'Xpand',
      vi: 'Nhân bản',
      headline: 'Tối ưu không dừng, nhân bản cái thắng',
      desc: 'Thử nghiệm liên tục trên offer, tiêu đề, luồng tư vấn. Cái nào thắng thì nhân bản sang kênh khác, chi nhánh khác, thị trường khác.',
      metric: 'Doanh thu mỗi khách truy cập',
      metricDelta: '×2,3',
      service: '/dich-vu/sieu-chuyen-doi/'
    }
  ]
};


export const framework = overlayObject('framework', RAW_framework);
export { RAW_framework };
