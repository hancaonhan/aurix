import { overlay } from '../lib/overlay.js';
/*
 * ⚠ DỮ LIỆU MINH HOẠ — CHƯA ĐỐI CHIẾU THỰC TẾ
 *
 * Tên khách hàng, con số kết quả và lời chứng thực trong tệp này do Aurix dựng
 * để minh hoạ bố cục. Phải đối chiếu với hợp đồng và báo cáo thật trước khi
 * công bố, và phải có sự đồng ý của khách hàng trước khi nêu tên họ.
 */

// Ngành nghề — dùng cho lớp cá nhân hoá trên trang chủ
const RAW_industries = [
  {
    key: 'spa',
    label: 'Spa & Thẩm mỹ',
    heroLine: 'Khách cao cấp không so giá. Họ so niềm tin.',
    heroSub: 'Aurix xây hệ thống giúp spa và viện thẩm mỹ thu hút đúng nhóm khách sẵn sàng chi trả, và giữ họ quay lại theo liệu trình.',
    pain: 'Chạy khuyến mãi thì đông khách rẻ, ngừng khuyến mãi thì vắng.',
    proof: { value: '+250%', label: 'Tăng trưởng doanh thu', client: 'Lavie Spa & Wellness' },
    project: 'lavie-spa'
  },
  {
    key: 'nha-khoa',
    label: 'Nha khoa & Y tế',
    heroLine: 'Một ca implant đáng giá bằng hai trăm lượt click.',
    heroSub: 'Aurix thiết kế phễu tập trung vào ca giá trị cao, với bằng chứng chuyên môn đủ mạnh để bệnh nhân dám đặt lịch.',
    pain: 'Lead nhiều nhưng toàn hỏi giá cạo vôi, không ai hỏi ca lớn.',
    proof: { value: '+71%', label: 'Tỉ lệ đặt lịch thành công', client: 'Dental Clinic' },
    project: 'dental'
  },
  {
    key: 'giao-duc',
    label: 'Giáo dục & Đào tạo',
    heroLine: 'Phụ huynh không mua khoá học. Họ mua sự yên tâm.',
    heroSub: 'Aurix dựng hệ thống nuôi dưỡng dài hơi, biến một buổi học thử thành một cam kết trọn khoá.',
    pain: 'Học thử đông, đăng ký chính thức thì rơi quá nửa.',
    proof: { value: '+164%', label: 'Tỉ lệ chuyển từ học thử', client: 'BrightWay Education' },
    project: 'brightway'
  },
  {
    key: 'fitness',
    label: 'Fitness & Thể hình',
    heroLine: 'Bán thẻ năm, không bán buổi tập lẻ.',
    heroSub: 'Aurix tái cấu trúc offer và luồng tư vấn để nâng giá trị hợp đồng trung bình thay vì chạy đua giảm giá.',
    pain: 'Giá trị hợp đồng trung bình thấp, khách bỏ tập sau hai tháng.',
    proof: { value: 'x2,3', label: 'Giá trị hợp đồng trung bình', client: 'FitCore' },
    project: 'fitcore'
  },
  {
    key: 'du-lich',
    label: 'Du lịch & Nghỉ dưỡng',
    heroLine: 'Khách đặt tour cao cấp cần thấy mình trong đó.',
    heroSub: 'Aurix cá nhân hoá trang theo điểm đến và nhóm khách, để mỗi người thấy đúng hành trình dành cho mình.',
    pain: 'Website nhiều tour nhưng khách không biết chọn cái nào.',
    proof: { value: '+96%', label: 'Tỉ lệ để lại thông tin', client: 'Wanderlust Travel' },
    project: 'wanderlust'
  },
  {
    key: 'bat-dong-san',
    label: 'Bất động sản & Nội thất',
    heroLine: 'Một hợp đồng bằng cả quý ngân sách quảng cáo.',
    heroSub: 'Aurix xây hệ thống lọc và nuôi dưỡng khách giá trị cao, để đội sales chỉ gọi những người thật sự sẵn sàng.',
    pain: 'Sales mất phần lớn thời gian cho khách không đủ khả năng chi trả.',
    proof: { value: '−42%', label: 'Chi phí mỗi khách hàng', client: 'Mộc Vị' },
    project: 'moc-vi'
  }
];

export const industries = overlay('industries', RAW_industries, 'key');

import { industryDetail, industryFallback } from './industry-detail.js';

// Gộp phần chi tiết vào từng ngành, để trang chỉ phải làm việc với một đối tượng
for (const ind of industries) Object.assign(ind, industryDetail[ind.key] || industryFallback(ind));

export const industryByKey = Object.fromEntries(industries.map(i => [i.key, i]));

// Dự án tiêu biểu
const RAW_projects = [
  {
    slug: 'lavie-spa',
    client: 'Lavie Spa & Wellness',
    industry: 'Spa & Wellness',
    industryKey: 'spa',
    title: 'Hệ thống marketing cho spa cao cấp',
    summary: 'Tái định vị từ spa giảm giá thành thương hiệu chăm sóc cao cấp, xây trọn bộ nhận diện, website và phễu liệu trình.',
    image: '/assets/projects/lavie-spa-aurix.webp',
    imageFallback: '/assets/projects/lavie-spa-aurix.png',
    scope: ['Chiến lược thương hiệu', 'Web cá nhân hoá', 'Hệ thống marketing', 'Nội dung mạng xã hội'],
    results: [
      { value: '+250%', label: 'Tăng trưởng doanh thu' },
      { value: '10.000+', label: 'Khách hàng tin dùng' },
      { value: '4,9/5', label: 'Đánh giá khách hàng' }
    ]
  },
  {
    slug: 'fitcore',
    client: 'FitCore',
    industry: 'Fitness',
    industryKey: 'fitness',
    title: 'Nâng giá trị hợp đồng thay vì giảm giá',
    summary: 'Thiết kế lại offer thẻ hội viên, dựng landing page theo từng nhóm mục tiêu tập luyện và tối ưu kịch bản tư vấn tại quầy.',
    image: '/assets/projects/fitcore-aurix.webp',
    imageFallback: '/assets/projects/fitcore-aurix.png',
    scope: ['Thiết kế offer', 'Landing page', 'Siêu chuyển đổi'],
    results: [
      { value: 'x2,3', label: 'Giá trị hợp đồng trung bình' },
      { value: '+71%', label: 'Tỉ lệ chốt tại quầy' },
      { value: '−41%', label: 'Chi phí mỗi khách tiềm năng' }
    ]
  },
  {
    slug: 'brightway',
    client: 'BrightWay Education',
    industry: 'Giáo dục',
    industryKey: 'giao-duc',
    title: 'Từ buổi học thử tới cam kết trọn khoá',
    summary: 'Xây phễu nuôi dưỡng phụ huynh nhiều chặng, cá nhân hoá theo độ tuổi học sinh và nối toàn bộ dữ liệu về một CRM.',
    image: '/assets/projects/brightway-aurix.webp',
    imageFallback: '/assets/projects/brightway-aurix.png',
    scope: ['Hệ thống marketing', 'Web cá nhân hoá', 'Tự động hoá chăm sóc'],
    results: [
      { value: '+164%', label: 'Tỉ lệ chuyển từ học thử' },
      { value: '98%', label: 'Dữ liệu khớp doanh thu' },
      { value: 'dưới 60s', label: 'Thời gian phản hồi' }
    ]
  },
  {
    slug: 'dental',
    client: 'Dental Clinic',
    industry: 'Nha khoa',
    industryKey: 'nha-khoa',
    title: 'Phễu tập trung vào ca giá trị cao',
    summary: 'Chuyển trọng tâm truyền thông từ dịch vụ phổ thông sang ca implant và chỉnh nha, với bằng chứng chuyên môn nhiều tầng.',
    image: '/assets/projects/dental-aurix.webp',
    imageFallback: '/assets/projects/dental-aurix.png',
    scope: ['Chiến lược nội dung', 'Landing page', 'Hệ thống marketing'],
    results: [
      { value: '+71%', label: 'Tỉ lệ đặt lịch thành công' },
      { value: 'x1,9', label: 'Giá trị ca trung bình' },
      { value: '−38%', label: 'Tỉ lệ huỷ lịch' }
    ]
  },
  {
    slug: 'wanderlust',
    client: 'Wanderlust Travel',
    industry: 'Du lịch',
    industryKey: 'du-lich',
    title: 'Website đổi theo điểm đến khách đang tìm',
    summary: 'Lớp cá nhân hoá đọc từ khoá và nguồn truy cập để hiển thị đúng hành trình, đúng mùa, đúng nhóm khách.',
    image: '/assets/projects/wanderlust-aurix.webp',
    imageFallback: '/assets/projects/wanderlust-aurix.png',
    scope: ['Web cá nhân hoá', 'Siêu chuyển đổi'],
    results: [
      { value: '+96%', label: 'Tỉ lệ để lại thông tin' },
      { value: '+180%', label: 'Thời gian ở lại trang' },
      { value: '−33%', label: 'Chi phí mỗi đơn' }
    ]
  },
  {
    slug: 'moc-vi',
    client: 'Mộc Vị',
    industry: 'Nội thất',
    industryKey: 'bat-dong-san',
    title: 'Lọc khách giá trị cao trước khi sales gọi',
    summary: 'Dựng hệ thống chấm điểm khách tiềm năng tự động, để đội bán hàng chỉ dành thời gian cho hồ sơ đủ điều kiện.',
    image: '/assets/projects/moc-vi-aurix.webp',
    imageFallback: '/assets/projects/moc-vi-aurix.png',
    scope: ['Hệ thống marketing', 'Chấm điểm khách tiềm năng', 'Landing page'],
    results: [
      { value: '−42%', label: 'Chi phí mỗi khách hàng' },
      { value: '+58%', label: 'Tỉ lệ hồ sơ đủ điều kiện' },
      { value: 'x1,6', label: 'Doanh thu mỗi nhân sự sales' }
    ]
  },
  {
    slug: 'lumina',
    client: 'Lumina',
    industry: 'Mỹ phẩm',
    industryKey: 'spa',
    title: 'Thương hiệu mỹ phẩm bước vào phân khúc cao cấp',
    summary: 'Toàn bộ nhận diện, website và hệ thống nội dung được dựng lại quanh một câu chuyện thương hiệu duy nhất.',
    image: '/assets/projects/lumina-aurix.webp',
    imageFallback: '/assets/projects/lumina-aurix.png',
    scope: ['Chiến lược thương hiệu', 'Web cá nhân hoá', 'Nội dung'],
    results: [
      { value: 'x2,1', label: 'Giá trị đơn trung bình' },
      { value: '+134%', label: 'Tỉ lệ khách quay lại' },
      { value: '4,8/5', label: 'Đánh giá khách hàng' }
    ]
  }
];

export const projects = overlay('projects', RAW_projects, 'slug');

export const projectBySlug = Object.fromEntries(projects.map(p => [p.slug, p]));

// Quy trình làm việc
const RAW_process = [
  {
    step: '01',
    name: 'Chẩn đoán',
    duration: '1 tuần',
    desc: 'Aurix đo toàn bộ phễu hiện tại, phỏng vấn đội bán hàng và quy từng điểm rò rỉ ra số tiền đang mất mỗi tháng.',
    output: 'Báo cáo chẩn đoán và bảng xếp hạng điểm rò rỉ'
  },
  {
    step: '02',
    name: 'Thiết kế hệ thống',
    duration: '2 – 3 tuần',
    desc: 'Dựng kiến trúc phễu, offer, cấu trúc nội dung và bản đồ dữ liệu. Mọi thứ được chốt trên giấy trước khi chạm vào code.',
    output: 'Bản thiết kế hệ thống và lộ trình triển khai'
  },
  {
    step: '03',
    name: 'Triển khai',
    duration: '4 – 8 tuần',
    desc: 'Thiết kế và dựng website, landing page, lớp cá nhân hoá, hạ tầng đo lường và kịch bản tự động hoá.',
    output: 'Hệ thống chạy thật, có dữ liệu chảy về'
  },
  {
    step: '04',
    name: 'Tối ưu và nhân bản',
    duration: 'Liên tục',
    desc: 'Chu kỳ thử nghiệm hai tuần một lần. Cái nào thắng thì nhân bản sang kênh khác, chi nhánh khác.',
    output: 'Báo cáo tối ưu và thư viện phát hiện tích luỹ'
  }
];

export const process = overlay('process', RAW_process, 'step');

// Điểm khác biệt
const RAW_differentiators = [
  {
    title: 'Chúng tôi bán hệ thống, không bán giờ công',
    desc: 'Aurix không tính tiền theo số bài đăng hay số chiến dịch. Chúng tôi chịu trách nhiệm về một cỗ máy hoàn chỉnh và về những con số nó tạo ra.'
  },
  {
    title: 'Mỗi quý chỉ nhận sáu dự án',
    desc: 'Một hệ thống tăng trưởng cần đội ngũ cao cấp bám sát. Chúng tôi giới hạn số lượng để giữ chất lượng, và từ chối những dự án không phù hợp.'
  },
  {
    title: 'Công nghệ tự xây, không lắp ghép công cụ',
    desc: 'Lớp cá nhân hoá, hạ tầng đo lường và bảng điều khiển của Aurix do chính đội kỹ thuật của chúng tôi phát triển, tuỳ biến theo từng khách hàng.'
  },
  {
    title: 'Bàn giao để bạn tự chạy',
    desc: 'Mọi quy trình đều được viết lại thành tài liệu và đào tạo cho đội nội bộ. Thành công của Aurix là ngày bạn không cần Aurix mỗi ngày nữa.'
  }
];

export const differentiators = overlay('differentiators', RAW_differentiators, 'title');

// Đánh giá khách hàng
const RAW_testimonials = [
  {
    quote: 'Điều tôi đánh giá cao nhất không phải là website đẹp, mà là Aurix chỉ ra đúng chỗ chúng tôi đang mất tiền — nằm ở mười lăm phút đầu sau khi khách để lại số, không phải ở quảng cáo.',
    name: 'Anh Minh Quân',
    role: 'Nhà sáng lập',
    company: 'FitCore',
    image: '/assets/C.E.O-fitness.png'
  },
  {
    quote: 'Trước đây chúng tôi tranh cãi mỗi tuần về việc kênh nào hiệu quả. Sau khi Aurix dựng xong hệ thống đo lường, cuộc họp marketing rút xuống hai mươi phút vì mọi người cùng nhìn một bảng số.',
    name: 'Chị Ngọc Trâm',
    role: 'Giám đốc điều hành',
    company: 'Lavie Spa & Wellness',
    image: '/assets/C.E.O-a-chau.png'
  },
  {
    quote: 'Chúng tôi đã làm việc với ba agency trước đó. Aurix là đơn vị đầu tiên hỏi về tỉ lệ chốt của đội sales trước khi nói về ngân sách quảng cáo.',
    name: 'Chị Thu Hà',
    role: 'Giám đốc học vụ',
    company: 'BrightWay Education',
    image: '/assets/C.E.O-anh-ngu.png'
  }
];

export const testimonials = overlay('testimonials', RAW_testimonials, 'name');

// Câu hỏi thường gặp — trang chủ
const RAW_faq = [
  {
    q: 'Aurix khác gì với một agency quảng cáo thông thường?',
    a: 'Agency quảng cáo chịu trách nhiệm cho phần đầu phễu: đưa người lạ tới website. Aurix chịu trách nhiệm cho cả cỗ máy, từ lần chạm đầu tiên tới đồng doanh thu cuối cùng, bao gồm cả tầng tư vấn và tầng dữ liệu mà quảng cáo không chạm tới.'
  },
  {
    q: 'Chi phí hợp tác với Aurix khoảng bao nhiêu?',
    a: 'Mức đầu tư phụ thuộc vào phạm vi công việc, nên chúng tôi chỉ báo giá sau buổi chẩn đoán, khi đã biết chính xác hệ thống của bạn cần gì. Buổi chẩn đoán miễn phí và không ràng buộc. Nếu quy mô chưa phù hợp, chúng tôi sẽ nói thẳng thay vì bán cho bạn một gói không giúp được gì.'
  },
  {
    q: 'Chúng tôi đã có website rồi, có cần làm lại không?',
    a: 'Không nhất thiết. Buổi chẩn đoán sẽ cho biết website hiện tại có phải điểm rò rỉ đắt nhất hay không. Nhiều khách hàng của Aurix giữ nguyên website và chỉ cần sửa tầng offer cùng tầng phản hồi là doanh thu đã thay đổi.'
  },
  {
    q: 'Bao lâu thì thấy kết quả?',
    a: 'Những thay đổi ở tầng offer và tầng phản hồi thường cho kết quả trong ba tới bốn tuần. Hệ thống dữ liệu và phễu hoàn chỉnh cần khoảng ba tháng để chạy ổn định và bắt đầu sinh ra lợi thế tích luỹ.'
  },
  {
    q: 'Aurix có nhận doanh nghiệp nhỏ không?',
    a: 'Chúng tôi phù hợp nhất với doanh nghiệp dịch vụ đã có doanh thu ổn định và đang gặp trần tăng trưởng. Nếu bạn còn đang tìm sản phẩm phù hợp thị trường, một hệ thống marketing đầy đủ là khoản đầu tư quá sớm.'
  },
  {
    q: 'Dữ liệu của chúng tôi có an toàn không?',
    a: 'Mọi hệ thống Aurix triển khai đều đứng tên doanh nghiệp của bạn. Tài khoản quảng cáo, dữ liệu khách hàng, mã nguồn website đều thuộc quyền sở hữu của bạn ngay từ ngày đầu.'
  }
];

export const faq = overlay('faq', RAW_faq, 'q');

// Con số tổng quan
const RAW_stats = [
  { value: 120, suffix: '+', label: 'Dự án đã triển khai' },
  { value: 6, suffix: ' ngành', label: 'Chuyên sâu dịch vụ cao cấp' },
  { value: 2.4, suffix: 'x', label: 'Doanh thu trung bình sau 6 tháng', decimals: 1 },
  { value: 94, suffix: '%', label: 'Khách hàng tiếp tục sang năm thứ hai' }
];

export const stats = overlay('stats', RAW_stats, 'label');

export const RAW = { industries: RAW_industries, projects: RAW_projects, process: RAW_process, differentiators: RAW_differentiators, testimonials: RAW_testimonials, faq: RAW_faq, stats: RAW_stats };

/**
 * Danh sách ngành tính lại ngay tại thời điểm gọi.
 *
 * `industries` ở trên được tính đúng một lần lúc nạp module — đủ cho tiến trình
 * dựng trang, nhưng máy chủ chạy liên tục hàng tuần và phải thấy được thay đổi
 * người dùng vừa lưu trong bảng điều khiển mà không cần khởi động lại.
 */
export function liveIndustries() {
  return overlay('industries', RAW_industries, 'key')
    .map(ind => ({ ...ind, ...(industryDetail[ind.key] || industryFallback(ind)) }));
}

export const liveIndustryByKey = () =>
  Object.fromEntries(liveIndustries().map(i => [i.key, i]));
