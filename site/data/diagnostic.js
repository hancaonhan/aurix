import { overlay } from '../lib/overlay.js';
// Bộ câu hỏi Chẩn đoán Hệ thống Tăng trưởng.
// Dùng chung cho frontend (render) và backend (chấm điểm) — một nguồn sự thật.

export const LAYERS = {
  adapt: { letter: 'A', name: 'Attract — Bản sắc & Giữ chân', service: '/dich-vu/web-ca-nhan-hoa/' },
  unify: { letter: 'U', name: 'Unify — Dữ liệu & Đo lường', service: '/dich-vu/he-thong-marketing/' },
  reach: { letter: 'R', name: 'Reach — Kênh tiếp cận & Ngân sách', service: '/dich-vu/phu-song-da-kenh/' },
  ignite: { letter: 'I', name: 'Ignite — Offer & Trang đích', service: '/dich-vu/landing-page/' },
  xpand: { letter: 'X', name: 'Xpand — Chốt sale & Tối ưu', service: '/dich-vu/sieu-chuyen-doi/' }
};

/**
 * score: 0 (rò rỉ nặng) → 1 (tốt)
 * Câu hỏi ngữ cảnh (context) không tính điểm, chỉ dùng để cá nhân hoá kết quả.
 */
const RAW_questions = [
  {
    id: 'industry',
    type: 'context',
    q: 'Doanh nghiệp của bạn hoạt động trong ngành nào?',
    hint: 'Aurix sẽ đối chiếu kết quả của bạn với chuẩn ngành tương ứng.',
    options: [
      { v: 'spa', label: 'Spa, thẩm mỹ, chăm sóc sắc đẹp' },
      { v: 'nha-khoa', label: 'Nha khoa, phòng khám, y tế' },
      { v: 'giao-duc', label: 'Giáo dục, trung tâm đào tạo' },
      { v: 'fitness', label: 'Fitness, yoga, thể hình' },
      { v: 'du-lich', label: 'Du lịch, nghỉ dưỡng, khách sạn' },
      { v: 'bat-dong-san', label: 'Bất động sản, nội thất, xây dựng' },
      { v: 'khac', label: 'Ngành dịch vụ khác' }
    ]
  },
  {
    id: 'revenue',
    type: 'context',
    q: 'Doanh thu trung bình mỗi tháng của bạn khoảng bao nhiêu?',
    hint: 'Con số này chỉ dùng để ước tính mức thất thoát. Aurix không lưu kèm danh tính nếu bạn không để lại liên hệ.',
    options: [
      { v: 200, label: 'Dưới 300 triệu đồng' },
      { v: 500, label: '300 triệu – 800 triệu đồng' },
      { v: 1500, label: '800 triệu – 2 tỉ đồng' },
      { v: 3500, label: '2 tỉ – 5 tỉ đồng' },
      { v: 8000, label: 'Trên 5 tỉ đồng' }
    ]
  },
  {
    id: 'personalization',
    layer: 'adapt',
    weight: 1,
    q: 'Website của bạn có thay đổi nội dung theo từng nhóm khách không?',
    hint: 'Ví dụ: khách đến từ quảng cáo tìm kiếm thấy nội dung khác khách vào trực tiếp.',
    options: [
      { v: 'none', label: 'Không. Mọi người thấy đúng một nội dung.', score: 0 },
      { v: 'manual', label: 'Có vài trang riêng, nhưng phải làm thủ công.', score: 0.4 },
      { v: 'basic', label: 'Có phân nhóm cơ bản theo chiến dịch.', score: 0.7 },
      { v: 'full', label: 'Có lớp cá nhân hoá tự động theo hành vi.', score: 1 }
    ]
  },
  {
    id: 'bounce',
    layer: 'adapt',
    weight: 0.8,
    q: 'Khách ở lại trang chủ của bạn trung bình bao lâu?',
    hint: 'Nếu chưa đo được, hãy chọn phương án cuối.',
    options: [
      { v: 'short', label: 'Dưới 20 giây', score: 0.1 },
      { v: 'mid', label: 'Khoảng 20 – 60 giây', score: 0.5 },
      { v: 'long', label: 'Trên 1 phút', score: 1 },
      { v: 'unknown', label: 'Chúng tôi không đo được chỉ số này', score: 0.15 }
    ]
  },
  {
    id: 'attribution',
    layer: 'unify',
    weight: 1.2,
    q: 'Bạn có biết chính xác kênh nào tạo ra doanh thu không?',
    hint: 'Không phải kênh nào tạo ra click, mà kênh nào tạo ra tiền vào tài khoản.',
    options: [
      { v: 'no', label: 'Không. Chúng tôi chia ngân sách theo cảm tính.', score: 0 },
      { v: 'partial', label: 'Biết số lead theo kênh, nhưng không biết doanh thu.', score: 0.4 },
      { v: 'mostly', label: 'Biết phần lớn, còn vài kênh chưa rõ.', score: 0.75 },
      { v: 'full', label: 'Truy vết được tới từng đơn hàng.', score: 1 }
    ]
  },
  {
    id: 'crm',
    layer: 'unify',
    weight: 1,
    q: 'Dữ liệu khách tiềm năng của bạn đang nằm ở đâu?',
    hint: 'Từ lúc khách để lại thông tin tới lúc thành khách hàng.',
    options: [
      { v: 'scattered', label: 'Rải rác: tin nhắn, bảng tính, sổ tay, điện thoại cá nhân.', score: 0 },
      { v: 'sheet', label: 'Tập trung trong một bảng tính chung.', score: 0.35 },
      { v: 'crm-basic', label: 'Có CRM nhưng đội chưa cập nhật đầy đủ.', score: 0.65 },
      { v: 'crm-full', label: 'CRM đầy đủ, mọi trạng thái đều được ghi nhận.', score: 1 }
    ]
  },
  {
    id: 'cac',
    layer: 'reach',
    weight: 1,
    q: 'Chi phí để có một khách hàng mới đang thay đổi thế nào?',
    hint: 'So với cùng kỳ năm ngoái.',
    options: [
      { v: 'up-fast', label: 'Tăng mạnh, càng ngày càng đắt.', score: 0.1 },
      { v: 'up', label: 'Tăng nhẹ.', score: 0.45 },
      { v: 'flat', label: 'Gần như không đổi.', score: 0.8 },
      { v: 'unknown', label: 'Chúng tôi chưa tính được con số này.', score: 0 }
    ]
  },
  {
    id: 'landing',
    layer: 'ignite',
    weight: 1.2,
    q: 'Trong 100 người vào trang đích, bao nhiêu người để lại thông tin?',
    hint: 'Chuẩn ngành dịch vụ cao cấp là khoảng 5 tới 12 người.',
    options: [
      { v: 'low', label: 'Dưới 2 người', score: 0.1 },
      { v: 'mid', label: 'Khoảng 2 – 5 người', score: 0.45 },
      { v: 'good', label: 'Khoảng 5 – 10 người', score: 0.85 },
      { v: 'high', label: 'Trên 10 người', score: 1 },
      { v: 'unknown', label: 'Chúng tôi không đo được', score: 0.1 }
    ]
  },
  {
    id: 'offer',
    layer: 'ignite',
    weight: 0.9,
    q: 'Lời đề nghị trên trang đích của bạn là gì?',
    hint: 'Điều bạn mời khách làm ở bước đầu tiên.',
    options: [
      { v: 'contact', label: '“Liên hệ ngay” hoặc “Đăng ký tư vấn”.', score: 0.2 },
      { v: 'discount', label: 'Một chương trình giảm giá.', score: 0.45 },
      { v: 'value', label: 'Một buổi trải nghiệm hoặc kiểm tra miễn phí có giá trị rõ ràng.', score: 0.9 },
      { v: 'tiered', label: 'Nhiều lời đề nghị khác nhau theo mức độ sẵn sàng của khách.', score: 1 }
    ]
  },
  {
    id: 'speed',
    layer: 'xpand',
    weight: 1.3,
    q: 'Sau khi khách để lại thông tin, bao lâu thì có người liên hệ?',
    hint: 'Đây thường là điểm rò rỉ đắt nhất mà không ai nhìn thấy.',
    options: [
      { v: 'instant', label: 'Dưới 5 phút, kể cả ngoài giờ.', score: 1 },
      { v: 'hour', label: 'Trong vòng một giờ, trong giờ hành chính.', score: 0.7 },
      { v: 'day', label: 'Trong ngày hôm đó.', score: 0.35 },
      { v: 'later', label: 'Hôm sau hoặc muộn hơn.', score: 0 }
    ]
  },
  {
    id: 'testing',
    layer: 'xpand',
    weight: 1,
    q: 'Bạn có chạy thử nghiệm để cải thiện tỉ lệ chuyển đổi không?',
    hint: 'Thử nghiệm có kiểm soát, không phải đổi rồi xem cảm giác.',
    options: [
      { v: 'never', label: 'Không bao giờ.', score: 0 },
      { v: 'rare', label: 'Thỉnh thoảng, khi thấy số tụt.', score: 0.35 },
      { v: 'quarterly', label: 'Vài lần mỗi quý.', score: 0.7 },
      { v: 'always', label: 'Liên tục, có lịch và có tài liệu ghi nhận.', score: 1 }
    ]
  }
];

export const questions = overlay('questions', RAW_questions, 'id');

export const scored = questions.filter(q => q.type !== 'context');
export const totalSteps = questions.length;

export const RAW = { questions: RAW_questions };
