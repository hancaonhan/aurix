/*
 * Chủ đề: Giữ khách.
 * Phần doanh thu rẻ nhất: những người đã từng trả tiền cho bạn.
 */

export const giuKhach = [
  {
    slug: 'khach-cu-quay-lai',
    title: 'Doanh thu rẻ nhất nằm trong danh sách khách cũ',
    seoTitle: 'Cách tăng tỉ lệ khách hàng quay lại cho ngành dịch vụ',
    excerpt: 'Chi phí để một khách cũ quay lại thường bằng một phần năm chi phí tìm khách mới. Vậy mà gần như toàn bộ ngân sách marketing vẫn đổ vào người lạ.',
    seoDesc: 'Cách xây dựng hệ thống đưa khách hàng cũ quay lại: phân nhóm theo thời gian, nội dung nhắc phù hợp và cách đo tỉ lệ quay lại theo nhóm.',
    date: '2027-01-27',
    updated: '2027-01-27',
    readMinutes: 7,
    topic: 'Giữ khách',
    layer: 'X',
    level: 'Nền tảng',
    related: ['he-thong-marketing', 'sieu-chuyen-doi'],
    body: [
      { type: 'p', text: 'Khi Aurix xem lại dữ liệu của một khách hàng mới, câu hỏi đầu tiên không phải về quảng cáo mà là: trong số khách đã từng trả tiền, bao nhiêu phần trăm quay lại trong mười hai tháng. Câu trả lời thường nằm dưới ba mươi phần trăm, và gần như luôn không ai theo dõi con số này.' },

      { type: 'h2', text: 'Vì sao khách không quay lại' },
      { type: 'p', text: 'Lý do phổ biến nhất không phải là không hài lòng. Theo trải nghiệm làm việc với các doanh nghiệp dịch vụ, ba lý do lớn nhất theo thứ tự là:' },
      { type: 'list', items: [
        'Họ quên. Không có gì nhắc, và cuộc sống thì bận.',
        'Họ không biết bạn còn làm dịch vụ nào khác. Rất nhiều khách chỉ biết đúng thứ họ đã dùng.',
        'Lần cuối gặp không có bước tiếp theo nào được đặt ra.'
      ]},
      { type: 'p', text: 'Cả ba đều là vấn đề hệ thống, không phải vấn đề chất lượng dịch vụ. Và cả ba đều sửa được mà gần như không tốn tiền.' },

      { type: 'h2', text: 'Chia danh sách theo thời gian' },
      { type: 'table', head: ['Nhóm', 'Lần cuối sử dụng', 'Nên gửi gì'], rows: [
        ['Đang hoạt động', 'Dưới 3 tháng', 'Nhắc lịch định kỳ, gợi ý dịch vụ bổ sung'],
        ['Nguội dần', '3 – 6 tháng', 'Nhắc mốc thời gian nên quay lại, kèm lý do chuyên môn'],
        ['Nguội', '6 – 12 tháng', 'Thông tin về điều mới, kèm ưu đãi quay lại'],
        ['Đã mất', 'Trên 12 tháng', 'Một tin nhắn hỏi thăm thật lòng, không bán gì']
      ]},
      { type: 'note', tone: 'tip', text: 'Nhóm cuối cùng thường cho tỉ lệ phản hồi bất ngờ cao, với điều kiện tin nhắn không bán gì cả. Một câu hỏi thăm chân thành sau một năm tạo ra nhiều cuộc hẹn hơn mọi mã giảm giá.' },

      { type: 'h2', text: 'Ba việc làm trước' },
      { type: 'steps', items: [
        { t: 'Đặt bước tiếp theo ngay khi kết thúc lần này', d: 'Trước khi khách rời đi, hẹn luôn mốc thời gian nên quay lại và ghi vào hệ thống. Đây là việc rẻ nhất và hiệu quả nhất.' },
        { t: 'Dựng lịch nhắc tự động theo loại dịch vụ', d: 'Mỗi dịch vụ có chu kỳ riêng. Nhắc đúng lúc thì là chăm sóc, nhắc sai lúc thì là làm phiền.' },
        { t: 'Mỗi tháng gửi một thông tin hữu ích, không bán', d: 'Giữ cho tên bạn còn trong đầu khách, để khi nhu cầu xuất hiện thì bạn là lựa chọn đầu tiên.' }
      ]},

      { type: 'h2', text: 'Con số cần theo dõi' },
      { type: 'p', text: 'Một con số duy nhất, tính theo nhóm khách bắt đầu cùng một tháng: trong số khách đến lần đầu vào tháng đó, bao nhiêu phần trăm quay lại sau sáu tháng và sau mười hai tháng. Theo dõi theo cách này cho thấy xu hướng thật, trong khi con số tổng luôn bị che bởi dòng khách mới.' },

      { type: 'cta', text: 'Tăng tỉ lệ quay lại thêm mười điểm phần trăm thường mang lại nhiều lợi nhuận hơn tăng ngân sách quảng cáo hai mươi phần trăm.' }
    ]
  },

  {
    slug: 'khach-gioi-thieu-khach',
    title: 'Biến lời giới thiệu tình cờ thành một kênh có thật',
    seoTitle: 'Xây dựng kênh khách hàng giới thiệu cho ngành dịch vụ',
    excerpt: 'Hầu hết doanh nghiệp dịch vụ đều có khách được giới thiệu, và hầu hết đều không biết mình có bao nhiêu. Đó là dấu hiệu của một kênh chưa được xây.',
    seoDesc: 'Cách xây dựng chương trình khách hàng giới thiệu cho doanh nghiệp dịch vụ: thời điểm đề nghị, cách thiết kế phần thưởng và cách đo lường.',
    date: '2027-02-03',
    updated: '2027-02-03',
    readMinutes: 6,
    topic: 'Giữ khách',
    layer: 'X',
    level: 'Thực hành',
    related: ['he-thong-marketing'],
    body: [
      { type: 'p', text: 'Khách được giới thiệu thường chốt nhanh hơn, mặc cả ít hơn và ở lại lâu hơn. Đây là nhóm khách tốt nhất mà bạn có thể có. Vậy mà rất ít doanh nghiệp làm gì đó có hệ thống để tạo ra thêm nhóm này.' },

      { type: 'h2', text: 'Vì sao khách hài lòng vẫn không giới thiệu' },
      { type: 'list', items: [
        'Không ai đề nghị họ làm vậy.',
        'Họ không biết nên nói gì với bạn bè, vì mô tả dịch vụ của bạn bằng lời họ thấy khó.',
        'Không có cách nào tiện để giới thiệu ngay lúc nghĩ tới.',
        'Họ ngại người được giới thiệu cảm thấy bị làm phiền.'
      ]},
      { type: 'p', text: 'Bốn rào cản này đều nhỏ, và đều gỡ được bằng thiết kế chứ không phải bằng tiền thưởng lớn.' },

      { type: 'h2', text: 'Ba thời điểm nên đề nghị' },
      { type: 'table', head: ['Thời điểm', 'Vì sao hiệu quả'], rows: [
        ['Ngay sau khoảnh khắc thấy kết quả', 'Cảm xúc đang ở đỉnh'],
        ['Khi khách chủ động khen', 'Họ vừa tự nói ra điều tích cực'],
        ['Sau lần sử dụng thứ ba', 'Đã hình thành thói quen và niềm tin']
      ]},

      { type: 'h2', text: 'Thiết kế phần thưởng' },
      { type: 'p', text: 'Sai lầm phổ biến là thưởng tiền cho người giới thiệu. Với ngành dịch vụ ở Việt Nam, điều đó có thể khiến lời giới thiệu trở nên khó nói vì nghe như đang bán bạn bè.' },
      { type: 'steps', items: [
        { t: 'Thưởng cho cả hai phía', d: 'Người giới thiệu và người được giới thiệu cùng nhận. Như vậy việc giới thiệu trở thành một món quà thay vì một giao dịch.' },
        { t: 'Ưu tiên giá trị dịch vụ hơn tiền mặt', d: 'Một buổi chăm sóc thêm, một lần nâng cấp gói. Giá trị cảm nhận cao hơn chi phí thật của bạn.' },
        { t: 'Giữ mọi thứ đơn giản tới mức nói được trong một câu', d: 'Nếu phải giải thích điều kiện, chương trình sẽ không lan.' }
      ]},

      { type: 'note', tone: 'tip', text: 'Việc hiệu quả nhất lại không tốn gì: đưa cho khách đúng câu chữ để họ dùng. Một tin nhắn mẫu dài hai câu mà họ chỉ cần chuyển tiếp sẽ tạo ra nhiều lời giới thiệu hơn bất kỳ mức thưởng nào.' },

      { type: 'h2', text: 'Đo lường' },
      { type: 'p', text: 'Ghi lại nguồn giới thiệu ngay tại khâu tiếp nhận, và ghi cả tên người giới thiệu. Hai con số cần theo dõi: tỉ lệ khách mới đến từ giới thiệu, và số lời giới thiệu trung bình trên mỗi khách hàng. Con số thứ hai mới cho biết chương trình có tác dụng hay không.' },

      { type: 'cta', text: 'Một kênh không được đo thì không được quản, và một kênh không được quản thì sẽ không lớn lên.' }
    ]
  },

  {
    slug: 'cham-soc-sau-ban',
    title: 'Chuỗi tin nhắn sau bán hàng nên nói gì',
    seoTitle: 'Chuỗi chăm sóc khách hàng sau bán qua Zalo và email',
    excerpt: 'Phần lớn doanh nghiệp im lặng sau khi nhận tiền, rồi ba tháng sau gửi một mã giảm giá. Sáu mốc nên nhắn, và nên nhắn gì ở mỗi mốc.',
    seoDesc: 'Cấu trúc chuỗi chăm sóc khách hàng sau bán cho doanh nghiệp dịch vụ: nội dung từng mốc thời gian, nhịp gửi và cách tránh bị coi là làm phiền.',
    date: '2027-02-10',
    updated: '2027-02-10',
    readMinutes: 6,
    topic: 'Giữ khách',
    layer: 'X',
    level: 'Thực hành',
    related: ['he-thong-marketing', 'phu-song-da-kenh'],
    body: [
      { type: 'p', text: 'Khoảng thời gian ngay sau khi khách trả tiền là lúc họ cởi mở nhất và cũng là lúc dễ hối hận nhất. Đa số doanh nghiệp bỏ trống khoảng thời gian đó, rồi xuất hiện trở lại vài tháng sau với một lời chào bán.' },

      { type: 'h2', text: 'Một chuỗi mẫu cho ngành dịch vụ' },
      { type: 'table', head: ['Thời điểm', 'Nội dung', 'Mục đích'], rows: [
        ['Ngay sau khi chốt', 'Xác nhận, nhắc lại những gì sẽ diễn ra', 'Giảm lo lắng'],
        ['Trước buổi hẹn 1 ngày', 'Nhắc giờ, địa chỉ, cần chuẩn bị gì', 'Giảm vắng mặt'],
        ['Sau buổi hẹn 1 ngày', 'Hỏi thăm, hướng dẫn chăm sóc tại nhà', 'Tăng kết quả thật'],
        ['Sau 1 tuần', 'Hỏi cảm nhận, xin đánh giá nếu tích cực', 'Thu bằng chứng'],
        ['Sau 1 tháng', 'Một thông tin hữu ích, không bán', 'Duy trì quan hệ'],
        ['Trước mốc nên quay lại 1 tuần', 'Nhắc mốc và đề nghị đặt lịch', 'Tạo doanh thu lặp lại']
      ]},

      { type: 'h2', text: 'Nguyên tắc để không bị coi là làm phiền' },
      { type: 'list', items: [
        'Mỗi tin nhắn phải có ích ngay cả khi khách không mua gì thêm.',
        'Tỉ lệ ba trên một: ba tin hữu ích cho một tin có đề nghị mua.',
        'Viết như một người nhắn cho một người, không như một thương hiệu phát thanh.',
        'Luôn có cách dừng nhận tin, và tôn trọng nó ngay lập tức.'
      ]},

      { type: 'note', tone: 'warn', text: 'Đừng gửi cùng một chuỗi cho mọi dịch vụ. Một người vừa làm dịch vụ nhanh và một người đang trong liệu trình dài cần hai nhịp hoàn toàn khác nhau. Gửi sai nhịp gây phản tác dụng mạnh hơn không gửi gì.' },

      { type: 'h2', text: 'Chọn kênh nào' },
      { type: 'p', text: 'Ở Việt Nam, tin nhắn qua ứng dụng nhắn tin phổ biến có tỉ lệ mở cao hơn hẳn email với nhóm khách dịch vụ. Nhưng email vẫn hữu ích cho nội dung dài và cho việc gửi hồ sơ, hoá đơn. Cách làm thực dụng: dùng tin nhắn cho mọi thứ cần đọc ngay, dùng email cho mọi thứ cần lưu lại.' },

      { type: 'faq', items: [
        { q: 'Doanh nghiệp nhỏ có cần phần mềm tự động không?', a: 'Chưa cần ngay. Một bảng tính với cột ngày và một người phụ trách gửi mỗi sáng đã chạy được chuỗi này. Hãy tự động hoá khi số lượng vượt quá khả năng làm tay, không phải trước đó.' },
        { q: 'Gửi bao nhiêu là quá nhiều?', a: 'Không có con số cố định. Hãy theo dõi tỉ lệ người yêu cầu dừng nhận tin. Dưới một phần trăm mỗi lần gửi là bình thường; vượt hẳn lên là dấu hiệu bạn đang gửi quá dày hoặc nội dung không đủ hữu ích.' }
      ]},

      { type: 'cta', text: 'Chuỗi chăm sóc là thứ bạn dựng một lần và nó chạy cho mọi khách hàng về sau.' }
    ]
  }
];
