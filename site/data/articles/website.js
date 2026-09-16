/*
 * Chủ đề: Website.
 * Trang web như một công cụ bán hàng, không phải một tấm danh thiếp.
 */

export const website = [
  {
    slug: 'website-dep-nhung-khong-ra-khach',
    title: 'Website đẹp nhưng không ai để lại số điện thoại',
    seoTitle: 'Vì sao website đẹp vẫn không ra khách, và cách sửa',
    excerpt: 'Đẹp và hiệu quả là hai bài toán khác nhau. Một trang có thể đoạt giải thiết kế mà vẫn không tạo ra nổi một cuộc hẹn. Đây là cách tìm ra chỗ hỏng.',
    seoDesc: 'Bảy lý do khiến website đẹp vẫn không tạo ra khách hàng, cách tự kiểm tra từng lý do và thứ tự nên sửa để thấy kết quả nhanh nhất.',
    date: '2026-09-02',
    updated: '2026-09-02',
    readMinutes: 7,
    topic: 'Website',
    layer: 'I',
    level: 'Nền tảng',
    related: ['landing-page', 'web-ca-nhan-hoa'],
    body: [
      { type: 'p', text: 'Câu hỏi hay gặp nhất khi khách hàng tìm tới Aurix: "Website bọn em mới làm xong, đẹp lắm, mà sao không ai liên hệ?" Gần như lần nào nguyên nhân cũng nằm ở một trong bảy chỗ dưới đây, và gần như lần nào nó cũng không phải lỗi thiết kế.' },

      { type: 'h2', text: 'Bảy chỗ nên kiểm tra, theo thứ tự' },
      { type: 'list', items: [
        'Trang không trả lời câu hỏi lớn nhất trong đầu khách trong bốn mươi giây đầu. Khách không cần biết bạn thành lập năm nào, họ cần biết bạn giải quyết được vấn đề của họ hay không.',
        'Lời đề nghị quá lớn so với mức độ tin tưởng hiện tại. "Đăng ký tư vấn" là một cam kết. Một người mới biết bạn ba mươi giây chưa sẵn sàng cho cam kết đó.',
        'Không có bằng chứng nào đủ mạnh. Một người lạ cần thấy con số, ảnh thật, tên thật, chứ không phải tính từ.',
        'Form hỏi quá nhiều. Mỗi trường bạn thêm vào là một phần chuyển đổi mất đi.',
        'Trang tải chậm trên điện thoại. Phần lớn khách vào bằng 4G, không phải bằng máy tính văn phòng.',
        'Không có gì cho người chưa sẵn sàng mua. Phần lớn người xem chưa muốn mua hôm nay, và bạn không cho họ lý do nào để quay lại.',
        'Khách để lại thông tin nhưng không ai gọi kịp. Trang không sai — khâu sau mới sai.'
      ]},

      { type: 'h2', text: 'Cách tự kiểm tra trong ba mươi phút' },
      { type: 'p', text: 'Mở trang chủ trên điện thoại, đặt hẹn giờ bốn mươi giây, rồi đưa cho một người chưa biết gì về công ty bạn. Hết giờ, hỏi họ ba câu:' },
      { type: 'list', items: [
        'Công ty này làm gì?',
        'Họ giúp được ai?',
        'Bước tiếp theo bạn được mời làm là gì?'
      ]},
      { type: 'p', text: 'Nếu người đó trả lời sai hoặc ngập ngừng ở bất kỳ câu nào, vấn đề không nằm ở thiết kế. Nó nằm ở cấu trúc thông điệp, và không có bảng màu nào sửa được điều đó.' },

      { type: 'h2', text: 'Sửa theo thứ tự nào' },
      { type: 'p', text: 'Đừng sửa cả bảy cùng lúc, vì làm vậy thì không biết cái nào có tác dụng. Thứ tự Aurix thường dùng, xếp theo tốc độ cho kết quả:' },
      { type: 'table', head: ['Thứ tự', 'Việc cần làm', 'Thường thấy kết quả sau'], rows: [
        ['1', 'Sửa tốc độ phản hồi sau khi có khách', '1 tuần'],
        ['2', 'Đổi lời đề nghị sang thứ rủi ro thấp hơn', '2 – 3 tuần'],
        ['3', 'Rút gọn form', '2 tuần'],
        ['4', 'Bổ sung bằng chứng có tên thật, số thật', '3 – 4 tuần'],
        ['5', 'Viết lại khối mở đầu', '3 – 4 tuần'],
        ['6', 'Tối ưu tốc độ tải', '4 – 6 tuần'],
        ['7', 'Thiết kế lại toàn trang', '2 – 3 tháng']
      ]},
      { type: 'p', text: 'Để ý rằng việc đắt nhất và mất thời gian nhất — thiết kế lại toàn trang — lại nằm cuối cùng. Phần lớn doanh nghiệp bắt đầu từ đó, và đó là lý do họ tốn nhiều mà đổi thay ít.' },

      { type: 'cta', text: 'Bài chẩn đoán sẽ chỉ ra bạn đang mắc ở chỗ nào trong bảy chỗ trên, và chỗ đó đang tốn bao nhiêu tiền mỗi tháng.' }
    ]
  },

  {
    slug: 'toc-do-tai-trang-thanh-tien',
    title: 'Một giây tải chậm quy ra bao nhiêu tiền',
    seoTitle: 'Tốc độ tải trang ảnh hưởng doanh thu thế nào',
    excerpt: 'Tốc độ trang thường bị coi là chuyện kỹ thuật. Thực ra nó là chuyện tài chính, và có thể quy ra con số cụ thể cho chính doanh nghiệp bạn.',
    seoDesc: 'Cách quy đổi tốc độ tải trang thành doanh thu mất đi, những nguyên nhân làm chậm phổ biến nhất ở website doanh nghiệp Việt Nam và thứ tự nên xử lý.',
    date: '2026-11-04',
    updated: '2026-11-04',
    readMinutes: 7,
    topic: 'Website',
    layer: 'I',
    level: 'Thực hành',
    related: ['landing-page', 'web-ca-nhan-hoa'],
    body: [
      { type: 'p', text: 'Khi Aurix nói với khách hàng rằng trang của họ tải mất 5,2 giây, phản ứng thường là "cũng bình thường mà". Khi nói rằng con số đó đang làm mất khoảng ba mươi phần trăm số người bấm vào quảng cáo, phản ứng khác hẳn.' },

      { type: 'h2', text: 'Phép quy đổi' },
      { type: 'p', text: 'Mỗi giây chậm thêm trong khoảng từ hai tới năm giây làm mất khoảng bảy tới mười hai phần trăm số người ở lại. Với trang đang tải năm giây, rút xuống 2,5 giây thường giữ lại được khoảng một phần tư số lượt truy cập.' },
      { type: 'formula', text: 'Tiền mất mỗi tháng = Ngân sách quảng cáo × Tỉ lệ người rời vì chậm' },
      { type: 'p', text: 'Một doanh nghiệp chi tám mươi triệu quảng cáo mỗi tháng, mất một phần tư lượt truy cập vì tốc độ, đang đốt hai mươi triệu mỗi tháng cho những người chưa từng nhìn thấy nội dung trang.' },

      { type: 'h2', text: 'Năm nguyên nhân phổ biến nhất' },
      { type: 'table', head: ['Nguyên nhân', 'Mức độ ảnh hưởng', 'Công sức sửa'], rows: [
        ['Ảnh chưa nén, tải nguyên kích thước gốc', 'Rất lớn', 'Thấp'],
        ['Quá nhiều mã theo dõi và tiện ích bên thứ ba', 'Lớn', 'Thấp'],
        ['Phông chữ tải chặn hiển thị', 'Trung bình', 'Thấp'],
        ['Giao diện dựng sẵn cồng kềnh', 'Lớn', 'Cao'],
        ['Máy chủ đặt xa hoặc gói lưu trữ yếu', 'Trung bình', 'Trung bình']
      ]},
      { type: 'note', tone: 'tip', text: 'Ba nguyên nhân đầu chiếm phần lớn vấn đề và đều sửa được trong một ngày làm việc. Hãy làm hết ba cái đó trước khi bàn tới việc đổi nền tảng hay viết lại trang.' },

      { type: 'h2', text: 'Ảnh: chỗ dễ thắng nhất' },
      { type: 'steps', items: [
        { t: 'Xuất ảnh đúng kích thước hiển thị', d: 'Một ảnh hiển thị rộng 600 điểm ảnh không cần tệp gốc rộng 4000 điểm ảnh.' },
        { t: 'Dùng định dạng hiện đại', d: 'WebP hoặc AVIF thường nhẹ hơn JPEG từ ba mươi tới bảy mươi phần trăm ở cùng chất lượng thị giác.' },
        { t: 'Chỉ tải ngay phần khách nhìn thấy', d: 'Ảnh nằm dưới màn hình đầu nên tải trì hoãn.' },
        { t: 'Khai báo kích thước cho mọi ảnh', d: 'Không làm vậy thì trang nhảy bố cục khi ảnh về, và khách bấm nhầm.' }
      ]},

      { type: 'h2', text: 'Đo ở đâu cho đúng' },
      { type: 'p', text: 'Đừng đo bằng máy tính văn phòng nối mạng dây. Hãy đo ở điều kiện giống khách thật: điện thoại tầm trung, mạng 4G, vào giờ cao điểm buổi tối. Chênh lệch giữa hai cách đo thường gấp ba lần.' },
      { type: 'p', text: 'Ba mốc đáng nhớ: dưới 2,5 giây cho phần nội dung chính hiện ra là tốt; từ 2,5 tới 4 giây là cần cải thiện; trên 4 giây là đang mất tiền mỗi ngày.' },

      { type: 'cta', text: 'Tốc độ là thứ hiếm hoi trong marketing mà bạn sửa một lần và hưởng mãi.' }
    ]
  },

  {
    slug: 'trang-dich-vu-can-gi',
    title: 'Cấu trúc một trang dịch vụ bán được hàng',
    seoTitle: 'Trang dịch vụ cần những phần nào để ra khách',
    excerpt: 'Người đọc có một trình tự câu hỏi khá cố định trong đầu. Chín phần của trang dịch vụ, xếp đúng theo trình tự đó.',
    seoDesc: 'Bộ khung chín phần cho trang dịch vụ của doanh nghiệp Việt Nam: thứ tự các khối, nội dung mỗi khối cần trả lời và những lỗi thường gặp.',
    date: '2026-11-11',
    updated: '2026-11-11',
    readMinutes: 8,
    topic: 'Website',
    layer: 'I',
    level: 'Thực hành',
    related: ['landing-page', 'sieu-chuyen-doi'],
    body: [
      { type: 'p', text: 'Một trang dịch vụ tốt không sáng tạo về cấu trúc. Nó sáng tạo về nội dung bên trong một cấu trúc đã biết là hiệu quả, vì người đọc có một trình tự câu hỏi khá cố định trong đầu.' },

      { type: 'h2', text: 'Chín phần, theo đúng thứ tự câu hỏi của khách' },
      { type: 'table', head: ['Phần', 'Trả lời câu hỏi nào trong đầu khách'], rows: [
        ['1. Khối mở đầu', 'Đây có đúng chỗ tôi cần không?'],
        ['2. Vấn đề', 'Họ có hiểu tình cảnh của tôi không?'],
        ['3. Cách làm', 'Họ giải quyết bằng cách nào?'],
        ['4. Bằng chứng', 'Đã ai giống tôi làm và thành công chưa?'],
        ['5. Quy trình', 'Nếu đồng ý thì chuyện gì xảy ra tiếp theo?'],
        ['6. Chi phí', 'Tôi phải bỏ ra bao nhiêu?'],
        ['7. Ai không phù hợp', 'Họ có nhận bừa mọi người không?'],
        ['8. Câu hỏi thường gặp', 'Còn mấy điều tôi vẫn băn khoăn'],
        ['9. Lời mời hành động', 'Giờ tôi làm gì?']
      ]},

      { type: 'h2', text: 'Ba phần hay bị làm hỏng nhất' },
      { type: 'h3', text: 'Khối mở đầu' },
      { type: 'p', text: 'Lỗi thường gặp là viết về mình: "Chúng tôi là đơn vị hàng đầu trong lĩnh vực…". Khối mở đầu phải nói được ba điều trong một câu: bạn giúp ai, giúp đạt tới đâu, và bằng cách gì khác biệt. Nếu đối thủ có thể dán câu đó lên trang của họ mà không sai chỗ nào, câu đó chưa dùng được.' },

      { type: 'h3', text: 'Chi phí' },
      { type: 'p', text: 'Giấu giá là bản năng tự nhiên, và nó khiến bạn mất đúng nhóm khách tốt nhất — nhóm biết mình muốn gì và không thích phải hỏi. Nếu không thể đưa giá chính xác, hãy đưa khoảng giá kèm những yếu tố quyết định khách rơi vào đâu trong khoảng đó.' },

      { type: 'h3', text: 'Ai không phù hợp' },
      { type: 'p', text: 'Phần này gần như không ai làm, và nó là phần tạo ra nhiều niềm tin nhất. Nói thẳng rằng bạn không phù hợp với nhóm nào chứng minh rằng bạn có tiêu chuẩn, đồng thời lọc bớt những cuộc gọi vô ích cho đội tư vấn.' },

      { type: 'note', tone: 'warn', text: 'Đừng đặt toàn bộ chín phần lên một trang dài rồi để nút liên hệ ở tận cuối. Hãy rải lời mời hành động sau phần bằng chứng, sau phần chi phí và ở cuối trang. Khách sẵn sàng ở những thời điểm khác nhau.' },

      { type: 'h2', text: 'Kiểm tra trước khi đăng' },
      { type: 'list', items: [
        'Đọc to phần mở đầu. Nếu nghe như một thông cáo báo chí thì viết lại.',
        'Đếm số tính từ không có số liệu đi kèm. Mỗi cái là một câu chưa chứng minh được.',
        'Xem trang trên điện thoại. Nếu phải cuộn quá ba lần mới thấy lời mời hành động đầu tiên, hãy đưa nó lên sớm hơn.',
        'Đưa cho một người trong ngành khác đọc và hỏi họ giá khoảng bao nhiêu. Nếu họ không đoán được, phần chi phí chưa rõ.'
      ]},

      { type: 'cta', text: 'Các trang dịch vụ của chính Aurix được dựng theo đúng bộ khung này. Bạn có thể mở ra xem như một ví dụ.' }
    ]
  },

  {
    slug: 'ca-nhan-hoa-theo-nguon',
    title: 'Cùng một trang, khác người xem, khác nội dung',
    seoTitle: 'Cá nhân hoá website theo nguồn truy cập: cách bắt đầu',
    excerpt: 'Người đến từ quảng cáo niềng răng và người gõ tên bạn trên Google đang tìm hai thứ khác nhau. Cho họ xem cùng một trang là lãng phí một nửa nỗ lực.',
    seoDesc: 'Hướng dẫn cá nhân hoá nội dung website theo nguồn truy cập, ngành nghề và hành vi: bắt đầu từ đâu, cần dữ liệu gì và cách đo hiệu quả.',
    date: '2026-11-18',
    updated: '2026-11-18',
    readMinutes: 7,
    topic: 'Website',
    layer: 'R',
    level: 'Nâng cao',
    related: ['web-ca-nhan-hoa', 'landing-page'],
    body: [
      { type: 'p', text: 'Một người bấm vào quảng cáo về niềng răng trong suốt đang ở giữa một câu hỏi rất cụ thể. Đưa họ về trang chủ liệt kê mười hai dịch vụ là bắt họ tự đi tìm lại thứ vừa khiến họ quan tâm. Phần lớn sẽ không tìm.' },

      { type: 'h2', text: 'Ba mức cá nhân hoá' },
      { type: 'table', head: ['Mức', 'Dựa trên', 'Công sức', 'Mức cải thiện thường thấy'], rows: [
        ['Theo nguồn truy cập', 'Mã nguồn trên đường dẫn', 'Thấp', '15 – 30%'],
        ['Theo ngành hoặc nhu cầu', 'Lựa chọn của khách hoặc trang đã xem', 'Trung bình', '20 – 40%'],
        ['Theo lịch sử tương tác', 'Dữ liệu đã có về khách', 'Cao', '30 – 60%']
      ]},
      { type: 'p', text: 'Gần như mọi doanh nghiệp nên bắt đầu từ mức một, và phần lớn không cần đi xa hơn mức hai.' },

      { type: 'h2', text: 'Bắt đầu với bốn khối' },
      { type: 'p', text: 'Không cần dựng lại cả trang cho từng nhóm. Chỉ bốn khối này thay đổi là đủ để khách thấy trang đang nói với mình:' },
      { type: 'steps', items: [
        { t: 'Tiêu đề chính', d: 'Nhắc lại đúng điều khách vừa bấm vào. Người đến từ quảng cáo niềng răng phải thấy chữ niềng răng.' },
        { t: 'Ảnh minh hoạ', d: 'Ảnh đúng dịch vụ, đúng nhóm khách. Một ảnh sai nhóm tuổi phá vỡ sự tin cậy nhanh hơn mọi câu chữ.' },
        { t: 'Bằng chứng', d: 'Đưa lên trước những ca cùng dịch vụ, cùng khu vực nếu có.' },
        { t: 'Lời mời hành động', d: 'Cụ thể theo nhu cầu: "Nhận nhận định về ca niềng của bạn" thay vì "Đăng ký tư vấn".' }
      ]},

      { type: 'note', tone: 'warn', text: 'Cá nhân hoá phải dựa trên điều khách đã tự bộc lộ, không phải điều bạn suy đoán về họ. Đoán sai gây khó chịu, và khiến khách cảm thấy bị theo dõi nhiều hơn là được phục vụ.' },

      { type: 'h2', text: 'Ba điều cần chuẩn bị trước' },
      { type: 'list', items: [
        'Mã nguồn nhất quán trên mọi đường dẫn quảng cáo. Không có nó thì không có gì để dựa vào.',
        'Nội dung dự phòng cho người không thuộc nhóm nào. Luôn có nhóm này, và họ thường chiếm phần lớn.',
        'Cách đo tách riêng từng nhóm, nếu không bạn sẽ không biết bản nào thắng.'
      ]},

      { type: 'h2', text: 'Cạm bẫy kỹ thuật' },
      { type: 'p', text: 'Nếu nội dung chỉ được thay sau khi trang đã hiển thị, khách sẽ thấy chữ nhảy và công cụ tìm kiếm chỉ đọc được bản mặc định. Cách làm đúng là quyết định nội dung trước khi trang được gửi về trình duyệt, hoặc ít nhất giữ nguyên phần nội dung dành cho công cụ tìm kiếm.' },

      { type: 'faq', items: [
        { q: 'Cá nhân hoá có ảnh hưởng tới thứ hạng tìm kiếm không?', a: 'Không, nếu nội dung cốt lõi của trang giữ nguyên và bạn không hiển thị cho công cụ tìm kiếm một thứ khác với những gì người dùng thấy. Vấn đề chỉ phát sinh khi hai bản khác nhau hoàn toàn.' },
        { q: 'Doanh nghiệp nhỏ có đáng làm không?', a: 'Đáng, ở mức một. Chỉ cần thay tiêu đề theo chiến dịch quảng cáo là đã có phần lớn lợi ích, và việc này không đòi hỏi hệ thống phức tạp.' }
      ]},

      { type: 'cta', text: 'Trang bạn đang đọc cũng đổi nội dung theo ngành. Thử thêm tham số nganh vào đường dẫn để xem.' }
    ]
  }
];
