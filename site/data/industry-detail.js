import { overlayObject } from '../lib/overlay.js';
/*
 * Nội dung chuyên sâu theo ngành — dùng cho các trang /nganh/<slug>/
 *
 * Tách riêng khỏi content.js để phần này dài ra thoải mái mà không làm rối
 * dữ liệu dùng chung. Khoá `key` phải khớp với `industries` trong content.js.
 *
 * ⚠ Con số trích dẫn ở đây là dữ liệu minh hoạ, xem ghi chú đầu content.js.
 */

const RAW_industryDetail = {
  spa: {
    slug: 'spa-tham-my',
    seoTitle: 'Marketing cho Spa & Thẩm mỹ viện cao cấp',
    seoDesc: 'Aurix xây hệ thống marketing cho spa và viện thẩm mỹ cao cấp: thu hút đúng khách sẵn sàng chi trả, giữ họ theo liệu trình thay vì chạy đua khuyến mãi.',
    challengeTitle: 'Khuyến mãi kéo được khách, nhưng kéo sai loại khách',
    challengeLead: 'Ngành làm đẹp là ngành dễ giảm giá nhất và cũng là ngành bị giảm giá làm hỏng thương hiệu nhanh nhất.',
    challenges: [
      { t: 'Khách săn khuyến mãi không quay lại', d: 'Người đến vì giá sẽ đi vì giá. Họ không mua liệu trình, không giới thiệu bạn bè, và kéo tỉ lệ giữ chân xuống.' },
      { t: 'Niềm tin là rào cản lớn nhất', d: 'Khách sợ hỏng da, sợ tay nghề, sợ quảng cáo thổi phồng. Không giải được nỗi sợ này thì giảm giá bao nhiêu cũng không đủ.' },
      { t: 'Doanh thu phụ thuộc liệu trình', d: 'Lợi nhuận nằm ở lần thứ ba trở đi. Nhưng phần lớn spa chỉ đo được lần thứ nhất.' }
    ],
    byLayer: {
      A: 'Website kể được cảm giác trong phòng trị liệu, không phải bảng giá',
      U: 'Nối lịch hẹn, liệu trình và doanh thu về một nơi để biết khách nào sinh lời',
      R: 'Tìm đúng nhóm khách coi chăm sóc là thói quen, không phải nhóm săn giảm giá',
      I: 'Offer là buổi trải nghiệm có giá trị rõ, không phải phiếu giảm giá',
      X: 'Tối ưu kịch bản tư vấn tại quầy để nâng tỉ lệ chốt liệu trình dài'
    }
  },

  'nha-khoa': {
    slug: 'nha-khoa',
    seoTitle: 'Marketing cho Phòng khám Nha khoa và Y tế',
    seoDesc: 'Aurix thiết kế phễu tập trung vào ca giá trị cao cho phòng khám nha khoa: implant, chỉnh nha, thẩm mỹ răng — với bằng chứng chuyên môn đủ mạnh.',
    challengeTitle: 'Lead thì nhiều, ca lớn thì hiếm',
    challengeLead: 'Vấn đề của phòng khám không phải thiếu người hỏi, mà là người hỏi không đúng loại.',
    challenges: [
      { t: 'Quảng cáo kéo về ca nhỏ', d: 'Nội dung nói về cạo vôi và tẩy trắng thì thu hút người hỏi cạo vôi. Ca implant cần một câu chuyện hoàn toàn khác.' },
      { t: 'Bệnh nhân sợ nhiều hơn tin', d: 'Sợ đau, sợ hỏng, sợ giá ẩn. Ba nỗi sợ này phải được trả lời trước khi bàn tới đặt lịch.' },
      { t: 'Tỉ lệ huỷ lịch cao', d: 'Đặt lịch rồi không đến là mất cả chi phí thu hút lẫn giờ ghế trống của bác sĩ.' }
    ],
    byLayer: {
      A: 'Website đặt chuyên môn bác sĩ và ca thật lên trước, không đặt bảng giá lên trước',
      U: 'Nối quảng cáo với phần mềm quản lý phòng khám để biết kênh nào ra ca lớn',
      R: 'Nội dung và từ khoá tập trung vào ca giá trị cao, không rải đều mọi dịch vụ',
      I: 'Trang đích riêng cho từng loại ca, mỗi trang trả lời đúng nỗi sợ của loại ca đó',
      X: 'Quy trình nhắc lịch và tư vấn trước khi đến để giảm tỉ lệ huỷ'
    }
  },

  'giao-duc': {
    slug: 'giao-duc',
    seoTitle: 'Marketing cho Trung tâm Giáo dục và Đào tạo',
    seoDesc: 'Aurix xây hệ thống nuôi dưỡng phụ huynh dài hơi cho trung tâm giáo dục, biến buổi học thử thành cam kết trọn khoá.',
    challengeTitle: 'Học thử đông, đăng ký chính thức rơi quá nửa',
    challengeLead: 'Phụ huynh không mua khoá học. Họ mua sự yên tâm rằng con mình sẽ khá lên.',
    challenges: [
      { t: 'Quyết định có nhiều người tham gia', d: 'Bố quyết ngân sách, mẹ quyết chất lượng, con quyết có thích hay không. Nội dung phải nói được với cả ba.' },
      { t: 'Chu kỳ cân nhắc rất dài', d: 'Phụ huynh tìm hiểu hàng tháng trước khi quyết. Không có hệ thống nuôi dưỡng thì bạn mất họ vào tay người kiên nhẫn hơn.' },
      { t: 'Bằng chứng khó chứng minh', d: 'Kết quả học tập cần thời gian mới thấy. Trong lúc chờ, bạn phải chứng minh bằng quá trình chứ không bằng lời hứa.' }
    ],
    byLayer: {
      A: 'Website cho phụ huynh thấy lộ trình và cách đo tiến bộ, không chỉ thấy danh sách khoá',
      U: 'Theo dõi phụ huynh từ lần chạm đầu tới lúc đóng học phí, qua nhiều tháng',
      R: 'Nội dung hữu ích cho phụ huynh ngay cả khi họ chưa định đăng ký',
      I: 'Offer là buổi học thử có báo cáo đánh giá năng lực, không phải học thử suông',
      X: 'Kịch bản chăm sóc sau buổi học thử — nơi phần lớn trung tâm đánh rơi khách'
    }
  },

  fitness: {
    slug: 'fitness',
    seoTitle: 'Marketing cho Phòng gym, Yoga và Trung tâm Fitness',
    seoDesc: 'Aurix tái cấu trúc offer và luồng tư vấn cho phòng tập, nâng giá trị hợp đồng trung bình thay vì chạy đua giảm giá thẻ.',
    challengeTitle: 'Bán thẻ rẻ thì đông, nhưng không sống được',
    challengeLead: 'Ngành fitness có chi phí cố định cao và biên lợi nhuận mỏng. Giá trị hợp đồng trung bình quyết định sống còn.',
    challenges: [
      { t: 'Đua giá xuống đáy', d: 'Phòng bên cạnh giảm, bạn giảm theo. Cuối cùng cả khu vực cùng lỗ và không ai xây được thương hiệu.' },
      { t: 'Khách bỏ tập sau hai tháng', d: 'Người bỏ tập không gia hạn, không giới thiệu, và còn nói xấu. Giữ chân là bài toán marketing, không chỉ là bài toán huấn luyện.' },
      { t: 'Tư vấn viên chốt theo cảm hứng', d: 'Cùng một lượng khách tới quầy, người chốt giỏi gấp ba người chốt kém. Khác biệt nằm ở kịch bản, không nằm ở tính cách.' }
    ],
    byLayer: {
      A: 'Website bán sự thay đổi của bản thân, không bán danh sách thiết bị',
      U: 'Nối thẻ hội viên, tần suất đến tập và doanh thu để biết nhóm nào gia hạn',
      R: 'Nhắm theo mục tiêu tập luyện cụ thể, không nhắm theo "người quan tâm thể hình"',
      I: 'Trang đích riêng cho từng mục tiêu: giảm cân, tăng cơ, phục hồi',
      X: 'Chuẩn hoá kịch bản tư vấn tại quầy và quy trình giữ chân trong sáu mươi ngày đầu'
    }
  },

  'du-lich': {
    slug: 'du-lich',
    seoTitle: 'Marketing cho Công ty Du lịch và Khu nghỉ dưỡng',
    seoDesc: 'Aurix cá nhân hoá trải nghiệm theo điểm đến và nhóm khách, giúp công ty du lịch cao cấp tăng tỉ lệ để lại thông tin và giảm chi phí mỗi đơn.',
    challengeTitle: 'Nhiều tour quá, khách không biết chọn cái nào',
    challengeLead: 'Trong du lịch cao cấp, quá nhiều lựa chọn cũng tai hại như quá ít.',
    challenges: [
      { t: 'Khách không thấy mình trong hành trình', d: 'Một gia đình có con nhỏ và một cặp đôi đi tuần trăng mật cần hai câu chuyện khác nhau, dù cùng một điểm đến.' },
      { t: 'Tính mùa vụ khắc nghiệt', d: 'Mùa cao điểm không kịp phục vụ, mùa thấp điểm không có khách. Hệ thống phải nuôi dưỡng khách từ mùa này sang mùa khác.' },
      { t: 'Cạnh tranh với nền tảng đặt phòng lớn', d: 'Không thể thắng họ về giá và độ phủ. Chỉ thắng được bằng am hiểu và dịch vụ riêng.' }
    ],
    byLayer: {
      A: 'Website đổi theo điểm đến và nhóm khách, để mỗi người thấy đúng hành trình của mình',
      U: 'Theo dõi khách qua nhiều mùa, biết ai sắp tới chu kỳ đi lại tiếp theo',
      R: 'Mua từ khoá theo điểm đến và theo mùa, không rải đều quanh năm',
      I: 'Offer là tư vấn lộ trình riêng, không phải danh sách tour có sẵn',
      X: 'Tối ưu luồng từ lúc hỏi tới lúc đặt cọc — nơi rơi rớt nhiều nhất'
    }
  },

  'bat-dong-san': {
    slug: 'bat-dong-san-noi-that',
    seoTitle: 'Marketing cho Bất động sản và Nội thất cao cấp',
    seoDesc: 'Aurix xây hệ thống lọc và chấm điểm khách tiềm năng cho ngành bất động sản và nội thất, để đội sales chỉ dành thời gian cho hồ sơ đủ điều kiện.',
    challengeTitle: 'Sales tiêu phần lớn thời gian cho người không mua',
    challengeLead: 'Giá trị hợp đồng lớn đồng nghĩa chu kỳ dài và nhiều người chỉ đang tham khảo.',
    challenges: [
      { t: 'Không phân biệt được người mua và người xem', d: 'Cùng để lại số, nhưng một người sắp xuống tiền còn một người đang lên ý tưởng cho hai năm nữa.' },
      { t: 'Chu kỳ quyết định tính bằng tháng', d: 'Không có hệ thống nuôi dưỡng thì tới lúc khách sẵn sàng, họ đã quên bạn.' },
      { t: 'Quyết định mang tính thẩm mỹ và cảm xúc', d: 'Bảng thông số không bán được. Khách phải hình dung được mình sống trong đó.' }
    ],
    byLayer: {
      A: 'Website cho khách hình dung được không gian, không chỉ đọc thông số',
      U: 'Chấm điểm khách tiềm năng tự động theo hành vi để sales biết gọi ai trước',
      R: 'Nhắm theo dấu hiệu sắp mua thật, không nhắm theo sở thích chung chung',
      I: 'Offer là buổi tư vấn thiết kế hoặc khảo sát tại chỗ, đủ giá trị để khách bỏ thời gian',
      X: 'Nuôi dưỡng dài hạn cho nhóm chưa sẵn sàng, để không mất họ vào tay đối thủ'
    }
  }
};


export const industryDetail = overlayObject('industryDetail', RAW_industryDetail);

/**
 * Bản chi tiết dự phòng cho ngành vừa được thêm từ bảng điều khiển.
 *
 * Không có khối này thì thêm một ngành mới sẽ làm hỏng lượt dựng trang: trang
 * /nganh/<slug>/ cần những trường mà người thêm chưa kịp viết. Ở đây suy ra một
 * bản tối thiểu nhưng đầy đủ và đúng ngữ pháp từ chính dữ liệu đã có, để trang
 * vẫn dùng được ngay; muốn viết chuyên sâu thì sửa mục "Nội dung chuyên sâu
 * theo ngành" trong bảng điều khiển.
 */
export function industryFallback(ind) {
  const label = ind.label || ind.key;
  return {
    slug: slugify(ind.key),
    seoTitle: `Marketing cho ngành ${label}`,
    seoDesc: ind.heroSub || `Aurix xây hệ thống marketing cho ngành ${label}.`,
    challengeTitle: `Vì sao ngành ${label} khó tăng trưởng bền`,
    challengeLead: ind.pain || 'Phễu rời rạc khiến phần lớn nhu cầu thật rơi rụng trước khi tới bước tư vấn.',
    challenges: [
      { t: 'Nhu cầu có nhưng rơi giữa đường', d: ind.pain || 'Khách quan tâm nhưng không ai theo tiếp đúng lúc.' },
      { t: 'Không đo được chỗ mất tiền', d: 'Dữ liệu nằm rải rác nên không ai chỉ ra được khâu nào đang rò rỉ.' },
      { t: 'Cạnh tranh bằng giá', d: 'Thiếu bằng chứng đủ mạnh nên cuộc trò chuyện luôn quay về giá.' }
    ],
    byLayer: {
      A: 'Website kể đúng câu chuyện thương hiệu thay vì chạy theo mẫu có sẵn',
      U: 'Gom dữ liệu khách về một nơi để biết đồng nào sinh ra từ đâu',
      R: 'Tìm đúng nhóm khách sẵn sàng chi trả, không mua lượt xem giá rẻ',
      I: 'Trang đích và lời đề nghị được thiết kế để chốt, không để đẹp',
      X: 'Đo và tối ưu liên tục từng bước trong phễu'
    }
  };
}

const slugify = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/đ/g, 'd').replace(/Đ/g, 'D')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export { RAW_industryDetail };
