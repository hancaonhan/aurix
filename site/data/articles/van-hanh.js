/*
 * Chủ đề: Vận hành.
 * Quy trình, công cụ và con người phía sau mọi con số marketing.
 */

export const vanHanh = [
  {
    slug: 'crm-cho-doanh-nghiep-nho',
    title: 'Khi nào một bảng tính không còn đủ',
    seoTitle: 'Chọn phần mềm quản lý khách hàng cho doanh nghiệp nhỏ',
    excerpt: 'Một bảng tính được duy trì tử tế còn tốt hơn phần mềm đắt tiền mà không ai nhập liệu. Bốn dấu hiệu cho biết bảng tính của bạn đã hết cỡ.',
    seoDesc: 'Bốn dấu hiệu cho thấy doanh nghiệp cần phần mềm quản lý khách hàng, tiêu chí chọn thực dụng và những sai lầm khi triển khai.',
    date: '2027-02-17',
    updated: '2027-02-17',
    readMinutes: 6,
    topic: 'Vận hành',
    layer: 'U',
    level: 'Thực hành',
    related: ['he-thong-marketing'],
    body: [
      { type: 'p', text: 'Lời khuyên "phải có phần mềm quản lý khách hàng" được lặp lại nhiều đến mức nó trở thành phản xạ. Thực tế, một bảng tính được duy trì tử tế tốt hơn một phần mềm đắt tiền mà không ai nhập dữ liệu.' },

      { type: 'h2', text: 'Bốn dấu hiệu bảng tính đã hết cỡ' },
      { type: 'list', items: [
        'Có nhiều hơn hai người cùng cần cập nhật, và các bản sao bắt đầu lệch nhau.',
        'Bạn không trả lời được câu hỏi "khách này đã được liên hệ mấy lần rồi" trong vòng mười giây.',
        'Có khách rơi qua khe: không ai gọi vì mỗi người tưởng người kia đã gọi.',
        'Bạn muốn nhắc tự động theo mốc thời gian mà phải nhớ bằng đầu.'
      ]},
      { type: 'p', text: 'Một dấu hiệu thì chưa cần vội. Từ hai trở lên thì chi phí của việc không có hệ thống đã vượt chi phí của hệ thống.' },

      { type: 'h2', text: 'Tiêu chí chọn, theo thứ tự quan trọng' },
      { type: 'table', head: ['Tiêu chí', 'Vì sao đứng ở vị trí này'], rows: [
        ['Đội ngũ chịu dùng', 'Hệ thống không ai nhập liệu là hệ thống vô dụng'],
        ['Ghi được nguồn khách', 'Không có nó thì mọi phân tích kênh đều mù'],
        ['Nhắc việc tự động', 'Đây là nơi phần mềm thắng bảng tính rõ nhất'],
        ['Kết nối với kênh nhắn tin đang dùng', 'Giảm việc chép tay qua lại'],
        ['Xuất dữ liệu dễ dàng', 'Để không bị mắc kẹt khi muốn đổi']
      ]},
      { type: 'note', tone: 'warn', text: 'Đừng chọn theo danh sách tính năng. Phần mềm nhiều tính năng nhất thường là phần mềm đội ngũ bỏ dùng sau sáu tuần. Hãy cho hai nhân viên dùng thử hai lựa chọn trong một tuần và chọn cái họ ít phàn nàn hơn.' },

      { type: 'h2', text: 'Ba sai lầm khi triển khai' },
      { type: 'steps', items: [
        { t: 'Chuyển toàn bộ dữ liệu cũ vào ngay', d: 'Dữ liệu cũ thường bẩn và không ai dùng. Hãy bắt đầu với khách mới, chuyển dần khách cũ đang hoạt động.' },
        { t: 'Tạo quá nhiều trường bắt buộc', d: 'Mỗi trường bắt buộc là một lý do để nhân viên bỏ qua hệ thống. Bắt đầu với năm trường.' },
        { t: 'Không định nghĩa các giai đoạn bằng hành động', d: 'Giai đoạn phải là điều đã xảy ra, không phải cảm nhận. "Đã gửi báo giá" là giai đoạn tốt; "quan tâm cao" thì không.' }
      ]},

      { type: 'cta', text: 'Công cụ chỉ khuếch đại quy trình sẵn có. Quy trình lộn xộn cộng phần mềm mới thì ra sự lộn xộn đắt tiền hơn.' }
    ]
  },

  {
    slug: 'quy-trinh-ban-hang-bon-buoc',
    title: 'Quy trình bán hàng viết ra được trên một trang giấy',
    seoTitle: 'Xây dựng quy trình bán hàng cho doanh nghiệp dịch vụ',
    excerpt: 'Hỏi ba tư vấn viên cùng một câu, nhận ba câu trả lời khác nhau. Khi đó tỉ lệ chốt của bạn không phải một con số, mà là ba con số bị trộn lẫn.',
    seoDesc: 'Cách xây dựng quy trình bán hàng bốn bước cho doanh nghiệp dịch vụ: định nghĩa giai đoạn, tiêu chí chuyển giai đoạn và cách huấn luyện đội ngũ.',
    date: '2027-02-24',
    updated: '2027-02-24',
    readMinutes: 7,
    topic: 'Vận hành',
    layer: 'X',
    level: 'Thực hành',
    related: ['sieu-chuyen-doi', 'he-thong-marketing'],
    body: [
      { type: 'p', text: 'Một dấu hiệu dễ nhận ra: hỏi ba tư vấn viên cùng một câu — "sau khi khách hỏi giá thì bước tiếp theo là gì" — và nhận ba câu trả lời khác nhau. Khi đó tỉ lệ chốt của doanh nghiệp không phải một con số mà là ba con số bị trộn lẫn.' },

      { type: 'h2', text: 'Bốn bước, mỗi bước một mục tiêu duy nhất' },
      { type: 'table', head: ['Bước', 'Mục tiêu duy nhất', 'Xong khi nào'], rows: [
        ['1. Tiếp nhận', 'Liên hệ được và xác định nhu cầu', 'Đã nói chuyện và biết khách cần gì'],
        ['2. Đủ điều kiện', 'Xác định có phục vụ được không', 'Đã trả lời được 3 câu hỏi lọc'],
        ['3. Đề xuất', 'Đưa phương án và mức đầu tư', 'Khách đã nhận báo giá cụ thể'],
        ['4. Chốt', 'Nhận cam kết hoặc lời từ chối rõ ràng', 'Đã có lịch hoặc đã biết lý do không']
      ]},
      { type: 'p', text: 'Điểm quan trọng nằm ở cột cuối. Mỗi bước phải kết thúc bằng một sự kiện quan sát được, không phải bằng một cảm nhận. Nhờ vậy hai người khác nhau nhìn cùng một hồ sơ sẽ xếp nó vào cùng một bước.' },

      { type: 'h2', text: 'Ba câu hỏi lọc' },
      { type: 'p', text: 'Bước hai thường bị bỏ qua, và đó là lý do đội tư vấn tốn hàng giờ cho những người không bao giờ mua. Ba câu hỏi đủ cho phần lớn ngành dịch vụ:' },
      { type: 'steps', items: [
        { t: 'Vấn đề hiện tại cụ thể là gì', d: 'Nghe kỹ câu trả lời. Người mô tả được vấn đề rõ ràng là người đã suy nghĩ nghiêm túc.' },
        { t: 'Đã từng thử cách nào chưa', d: 'Cho biết mức độ cấp thiết và cả kỳ vọng của khách.' },
        { t: 'Mong muốn giải quyết trong khoảng thời gian nào', d: 'Phân biệt người đang tìm hiểu và người đang cần.' }
      ]},
      { type: 'note', tone: 'tip', text: 'Không hỏi thẳng về ngân sách ở cuộc gọi đầu. Thay vào đó hãy nêu khoảng giá của bạn rồi quan sát phản ứng. Cách này cho cùng thông tin mà không làm khách thấy bị đánh giá.' },

      { type: 'h2', text: 'Quy trình chỉ sống khi được huấn luyện' },
      { type: 'list', items: [
        'Viết quy trình ra một trang duy nhất, dán ở nơi làm việc.',
        'Mỗi tuần nghe lại hai cuộc gọi thật cùng cả đội, nhận xét theo đúng bốn bước.',
        'Đo tỉ lệ chuyển giữa từng bước, không chỉ đo tỉ lệ chốt cuối cùng. Chỗ rơi rụng lớn nhất sẽ hiện ra ngay.',
        'Cập nhật quy trình mỗi quý dựa trên những gì thật sự hiệu quả, không phải dựa trên lý thuyết.'
      ]},

      { type: 'h2', text: 'Con số cần nhìn' },
      { type: 'p', text: 'Tỉ lệ chuyển giữa các bước quan trọng hơn tỉ lệ chốt tổng. Nếu chín mươi phần trăm khách qua được bước một nhưng chỉ ba mươi phần trăm qua được bước hai, vấn đề nằm ở chất lượng đầu vào. Nếu bước ba sang bước bốn rơi mạnh, vấn đề nằm ở cách đề xuất hoặc ở giá.' },

      { type: 'cta', text: 'Quy trình rõ ràng biến kết quả bán hàng từ chuyện may rủi thành chuyện quản lý được.' }
    ]
  },

  {
    slug: 'thue-ngoai-hay-tu-lam',
    title: 'Tự làm, thuê người, hay thuê đơn vị bên ngoài',
    seoTitle: 'Nên tự làm marketing hay thuê ngoài: cách quyết định',
    excerpt: 'Marketing không phải một việc mà là sáu bảy việc, nên câu trả lời hiếm khi là thuê hết hoặc làm hết. Phân chia thế nào theo từng ngưỡng quy mô.',
    seoDesc: 'Khung quyết định tự làm hay thuê ngoài từng phần việc marketing theo quy mô doanh nghiệp, kèm chi phí tham khảo và dấu hiệu chọn sai.',
    date: '2027-03-03',
    updated: '2027-03-03',
    readMinutes: 7,
    topic: 'Vận hành',
    layer: 'A',
    level: 'Chiến lược',
    related: ['he-thong-marketing'],
    body: [
      { type: 'p', text: 'Câu hỏi này thường được đặt sai: "nên tự làm hay thuê ngoài". Marketing không phải một việc mà là sáu bảy việc khác nhau, và câu trả lời đúng gần như luôn là kết hợp.' },

      { type: 'h2', text: 'Nguyên tắc phân chia' },
      { type: 'p', text: 'Giữ trong nhà những việc cần hiểu biết sâu về khách hàng và cần lặp lại hàng ngày. Thuê ngoài những việc cần kỹ năng chuyên sâu nhưng làm theo đợt.' },
      { type: 'table', head: ['Phần việc', 'Khuyến nghị', 'Vì sao'], rows: [
        ['Trả lời tin nhắn, gọi khách', 'Trong nhà', 'Hiểu dịch vụ và quyết định được ngay'],
        ['Quay nội dung hằng ngày', 'Trong nhà', 'Cần tần suất và sự tự nhiên'],
        ['Dựng website và hệ thống đo lường', 'Thuê ngoài', 'Làm theo đợt, cần chuyên môn sâu'],
        ['Chiến lược và cấu trúc chiến dịch', 'Thuê ngoài rồi chuyển giao', 'Cần kinh nghiệm nhiều ngành'],
        ['Vận hành quảng cáo hằng ngày', 'Tuỳ quy mô', 'Dưới 50 triệu mỗi tháng thì thuê ngoài rẻ hơn']
      ]},

      { type: 'h2', text: 'Ba ngưỡng quy mô' },
      { type: 'steps', items: [
        { t: 'Dưới 30 triệu ngân sách mỗi tháng', d: 'Chủ doanh nghiệp tự nắm phần chiến lược, thuê ngoài phần kỹ thuật theo dự án. Chưa nên tuyển người toàn thời gian.' },
        { t: 'Từ 30 tới 100 triệu mỗi tháng', d: 'Tuyển một người điều phối trong nhà, thuê ngoài phần chuyên môn sâu. Người này giữ dữ liệu và quy trình.' },
        { t: 'Trên 100 triệu mỗi tháng', d: 'Đội trong nhà cho vận hành hằng ngày, thuê ngoài cho việc dựng hệ thống và cho những lần cần góc nhìn từ bên ngoài.' }
      ]},

      { type: 'note', tone: 'warn', text: 'Sai lầm tốn kém nhất là thuê một bạn mới ra trường làm toàn bộ marketing với lương thấp. Bạn không tiết kiệm được gì vì ngân sách quảng cáo bị chi sai sẽ lớn hơn nhiều so với khoản chênh lệch lương.' },

      { type: 'h2', text: 'Dấu hiệu đang chọn sai' },
      { type: 'list', items: [
        'Thuê ngoài mà bạn không thể tự truy cập tài khoản quảng cáo và dữ liệu của mình. Đây là dấu hiệu cảnh báo nghiêm trọng nhất.',
        'Báo cáo chỉ có chỉ số nền tảng, không có chỉ số doanh thu.',
        'Người trong nhà dành phần lớn thời gian làm việc lặt vặt mà không ai nắm được bức tranh tổng.',
        'Mỗi lần muốn thay đổi một dòng chữ trên website đều phải chờ nhiều ngày.'
      ]},

      { type: 'h2', text: 'Điều nên giữ lại bằng mọi giá' },
      { type: 'p', text: 'Dù thuê ai, ba thứ này phải đứng tên bạn và bạn phải có quyền quản trị cao nhất: tài khoản quảng cáo, tên miền và dữ liệu khách hàng. Mất quyền kiểm soát ba thứ đó nghĩa là mất khả năng thay đổi đối tác, và điều này xảy ra thường xuyên hơn người ta tưởng.' },

      { type: 'cta', text: 'Aurix dựng hệ thống rồi chuyển giao, vì hệ thống chỉ có giá trị khi bạn tự vận hành được nó.' }
    ]
  }
];
