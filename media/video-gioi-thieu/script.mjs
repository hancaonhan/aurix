/*
 * Kịch bản video giới thiệu Aurix — 9:16, khoảng 60 giây.
 * Mỗi dòng là một đoạn giọng đọc; `scene` là cảnh hình đi kèm, `cap` là phụ đề.
 * Nói thẳng, không hứa con số (số liệu trên website hiện là minh hoạ).
 */
export const VOICE = 'vi-VN-HoaiMyNeural';
export const RATE = '+6%';

export const LINES = [
  { id: 'hook',  scene: 'hook',     text: 'Mỗi tháng có bao nhiêu khách hỏi, nhưng không bao giờ mua?' },
  { id: 'prob1', scene: 'problem',  text: 'Với doanh nghiệp dịch vụ, khách hiếm khi mất ở quảng cáo.' },
  { id: 'prob2', scene: 'problem',  text: 'Họ mất ở những bước sau đó: trang web chậm, gọi lại trễ, và không ai đo được.' },
  { id: 'intro', scene: 'intro',    text: 'Aurix là agency marketing cho spa, nha khoa, giáo dục và fitness.' },
  { id: 'svc0',  scene: 'services', text: 'Chúng tôi làm năm việc.' },
  { id: 'svc1',  scene: 'services', text: 'Website mang đúng bản sắc thương hiệu.' },
  { id: 'svc2',  scene: 'services', text: 'Hệ thống marketing nối quảng cáo với doanh thu.' },
  { id: 'svc3',  scene: 'services', text: 'Quảng cáo đúng người, đúng lúc.' },
  { id: 'svc4',  scene: 'services', text: 'Landing page thiết kế để chốt.' },
  { id: 'svc5',  scene: 'services', text: 'Và tối ưu tỉ lệ chốt, để cùng lượng khách mang về nhiều doanh thu hơn.' },
  { id: 'proof1', scene: 'proof',   text: 'Mọi khoản chi đều có báo cáo, đối chiếu với doanh thu thực tế.' },
  { id: 'proof2', scene: 'proof',   text: 'Bạn biết rõ đồng nào mang về khách nào.' },
  { id: 'cta1',  scene: 'cta',      text: 'Đặt lịch chẩn đoán miễn phí bốn mươi lăm phút trên website Aurix Việt Nam.' },
  { id: 'cta2',  scene: 'logo',     text: 'Aurix. Công nghệ, giải pháp, tăng trưởng.' }
];
