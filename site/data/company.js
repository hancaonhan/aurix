import { overlayObject } from '../lib/overlay.js';
import { overlay } from '../lib/overlay.js';
/*
 * Gói dịch vụ, đội ngũ và nội dung pháp lý.
 *
 * ⚠ Mức đầu tư và hồ sơ đội ngũ dưới đây là dữ liệu minh hoạ.
 *    Phải thay bằng con số và nhân sự thật trước khi go-live.
 */

/* ---------- Mức đầu tư ----------
   Khách cao cấp muốn tự loại mình ra trước khi gọi. Giấu giá hoàn toàn làm mất
   thời gian của cả hai bên; báo giá cứng thì không trung thực vì phạm vi khác nhau.
   Cách ở giữa: công bố khoảng, và nói rõ điều gì làm con số dịch chuyển. */
const RAW_packages = [
  {
    key: 'khoi-dong',
    name: 'Khởi động',
    tagline: 'Sửa đúng một tầng đang rò rỉ nặng nhất',
    duration: '4 – 6 tuần',
    forWho: 'Doanh nghiệp đã có doanh thu ổn định, biết rõ vấn đề nằm ở đâu và muốn xử lý dứt điểm một chỗ trước.',
    includes: [
      'Chẩn đoán toàn hệ thống và báo cáo điểm rò rỉ',
      'Triển khai trọn vẹn một tầng trong khung A.U.R.I.X',
      'Thiết lập đo lường cho tầng đó',
      'Ba mươi ngày tinh chỉnh sau bàn giao',
      'Tài liệu vận hành và một buổi đào tạo'
    ],
    note: 'Phù hợp nhất khi buổi chẩn đoán cho thấy một tầng yếu hơn hẳn các tầng còn lại.'
  },
  {
    key: 'he-thong',
    name: 'Hệ thống',
    tagline: 'Dựng cỗ máy đủ tầng, từ bản sắc tới chốt sale',
    duration: '3 – 4 tháng',
    popular: true,
    forWho: 'Doanh nghiệp đang chạm trần tăng trưởng, muốn xây một tài sản dùng được nhiều năm thay vì thuê dịch vụ theo tháng.',
    includes: [
      'Toàn bộ phạm vi gói Khởi động',
      'Triển khai cả năm tầng A.U.R.I.X',
      'Website bản sắc riêng và hệ thống landing page',
      'Hạ tầng dữ liệu nối quảng cáo với doanh thu thật',
      'Tự động hoá chăm sóc và quy trình phản hồi tức thì',
      'Bảng điều khiển doanh thu thời gian thực',
      'Chuyển giao và đào tạo cho đội nội bộ'
    ],
    note: 'Đây là gói phần lớn khách hàng của Aurix chọn, và cũng là gói tạo ra khác biệt lớn nhất.'
  },
  {
    key: 'dong-hanh',
    name: 'Đồng hành',
    tagline: 'Vận hành và tối ưu liên tục cùng đội của bạn',
    duration: 'Tối thiểu 1 quý',
    forWho: 'Doanh nghiệp đã có hệ thống và muốn Aurix tiếp tục vận hành kênh, chạy thử nghiệm và tối ưu theo chu kỳ.',
    includes: [
      'Vận hành kênh tiếp cận theo trục nội dung từng quý',
      'Chu kỳ thử nghiệm hai tuần một lần',
      'Tối ưu kịch bản tư vấn và quy trình chốt sale',
      'Báo cáo hiệu quả quy về doanh thu thật',
      'Họp tối ưu cùng ban điều hành hai tuần một lần'
    ],
    note: 'Không nhận riêng lẻ. Chỉ bắt đầu sau khi hệ thống đã dựng xong, dù do Aurix hay do đơn vị khác làm.'
  }
];

export const packages = overlay('packages', RAW_packages, 'key');

/** Những yếu tố làm con số dịch chuyển — nói trước để tránh hiểu nhầm. */
const RAW_priceFactors = [
  { t: 'Số lượng nhóm khách', d: 'Mỗi nhóm khách cần một câu chuyện, một bộ nội dung và một trang đích riêng.' },
  { t: 'Tình trạng dữ liệu hiện có', d: 'Nếu dữ liệu đang rải rác nhiều nơi, phần chuẩn hoá sẽ chiếm thêm thời gian.' },
  { t: 'Số chi nhánh hoặc cơ sở', d: 'Nhiều điểm bán đồng nghĩa nhiều luồng dữ liệu và nhiều quy trình phải đồng bộ.' },
  { t: 'Mức độ tham gia của đội nội bộ', d: 'Đội của bạn làm được càng nhiều phần sản xuất, chi phí dài hạn càng giảm.' }
];

export const priceFactors = overlay('priceFactors', RAW_priceFactors, 't');

/* ---------- Đội ngũ ----------
   Mua dịch vụ cao cấp là mua con người. Một ảnh tập thể không đủ —
   khách cần biết ai sẽ ngồi trong phòng họp với họ. */
const RAW_team = [
  {
    name: 'Chưa công bố',
    role: 'Nhà sáng lập & Giám đốc chiến lược',
    bio: 'Người chịu trách nhiệm định vị và kiến trúc hệ thống cho mọi dự án. Trực tiếp tham gia buổi chẩn đoán của từng khách hàng.',
    focus: 'Chiến lược · Định vị'
  },
  {
    name: 'Chưa công bố',
    role: 'Giám đốc sáng tạo',
    bio: 'Dẫn dắt phần bản sắc thị giác. Chịu trách nhiệm để mỗi website Aurix làm ra không giống bất kỳ website nào khác.',
    focus: 'Thương hiệu · Thiết kế'
  },
  {
    name: 'Chưa công bố',
    role: 'Trưởng bộ phận Dữ liệu',
    bio: 'Dựng hạ tầng đo lường và nối dữ liệu quảng cáo với doanh thu thật. Người bảo đảm mọi con số Aurix báo cáo đều kiểm chứng được.',
    focus: 'Dữ liệu · Đo lường'
  },
  {
    name: 'Chưa công bố',
    role: 'Trưởng bộ phận Tăng trưởng',
    bio: 'Vận hành kênh tiếp cận và chu kỳ thử nghiệm. Chịu trách nhiệm về chi phí mỗi khách hàng của từng dự án.',
    focus: 'Kênh · Tối ưu'
  }
];

export const team = overlay('team', RAW_team, 'name');

/* ---------- Chính sách bảo mật ----------
   Website đang thu thập họ tên, số điện thoại và email qua biểu mẫu.
   Nghị định 13/2023/NĐ-CP yêu cầu thông báo rõ mục đích, phạm vi và quyền của
   chủ thể dữ liệu. Nội dung dưới đây là bản nền, cần luật sư rà trước khi công bố. */
const RAW_privacy = {
  updated: '2026-09-14',
  sections: [
    {
      h: 'Chúng tôi thu thập thông tin gì',
      p: [
        'Khi bạn gửi biểu mẫu liên hệ hoặc làm bài chẩn đoán, Aurix thu thập họ tên, số điện thoại, địa chỉ email, tên doanh nghiệp và ngành nghề mà bạn tự cung cấp.',
        'Hệ thống cũng ghi nhận một số thông tin kỹ thuật: trang bạn gửi biểu mẫu, nguồn truy cập, loại trình duyệt và địa chỉ IP. Địa chỉ IP được băm một chiều trước khi lưu, nghĩa là chúng tôi không thể khôi phục lại địa chỉ gốc.',
        'Câu trả lời trong bài chẩn đoán được lưu để tính điểm. Nếu bạn không để lại thông tin liên hệ, phần câu trả lời đó không gắn với danh tính của bạn.'
      ]
    },
    {
      h: 'Chúng tôi dùng thông tin đó để làm gì',
      p: [
        'Liên hệ tư vấn theo đúng yêu cầu bạn gửi.',
        'Gửi bản báo cáo chẩn đoán tới email bạn cung cấp.',
        'Cải thiện nội dung và trải nghiệm của chính website này.'
      ],
      note: 'Aurix không dùng thông tin của bạn cho mục đích nào khác ngoài ba mục đích trên, và không gửi thư quảng cáo nếu bạn không đồng ý.'
    },
    {
      h: 'Chúng tôi chia sẻ với ai',
      p: [
        'Aurix không bán, không trao đổi và không cho thuê dữ liệu cá nhân của bạn cho bất kỳ bên thứ ba nào.',
        'Dữ liệu chỉ được xử lý bởi nhân sự Aurix có trách nhiệm liên quan, và bởi nhà cung cấp hạ tầng máy chủ mà chúng tôi thuê để vận hành website.'
      ]
    },
    {
      h: 'Chúng tôi giữ trong bao lâu',
      p: [
        'Thông tin liên hệ được giữ trong hai mươi bốn tháng kể từ lần tương tác gần nhất, sau đó xoá tự động.',
        'Nếu hai bên ký hợp đồng, dữ liệu được lưu theo thời hạn quy định của pháp luật về kế toán và hợp đồng.'
      ]
    },
    {
      h: 'Quyền của bạn',
      p: [
        'Bạn có quyền yêu cầu xem, sửa hoặc xoá dữ liệu cá nhân của mình bất cứ lúc nào.',
        'Bạn có quyền rút lại sự đồng ý đã cho, và việc rút lại không ảnh hưởng tới tính hợp pháp của việc xử lý trước đó.',
        'Bạn có quyền khiếu nại tới cơ quan có thẩm quyền nếu cho rằng quyền của mình bị xâm phạm.'
      ],
      note: 'Để thực hiện bất kỳ quyền nào ở trên, gửi email tới địa chỉ liên hệ của Aurix. Chúng tôi phản hồi trong vòng ba ngày làm việc.'
    },
    {
      h: 'Cookie và công cụ đo lường',
      p: [
        'Website này không đặt cookie theo dõi quảng cáo và không nhúng mã của mạng quảng cáo bên thứ ba.',
        'Lựa chọn ngành nghề bạn bấm ở trang chủ được lưu trong bộ nhớ của chính trình duyệt bạn, không gửi về máy chủ kèm danh tính.'
      ]
    }
  ]
};


export const privacy = overlayObject('privacy', RAW_privacy);
export const RAW = { packages: RAW_packages, priceFactors: RAW_priceFactors, team: RAW_team };

export { RAW_privacy };
