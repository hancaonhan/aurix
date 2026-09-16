/*
 * Chủ đề: Quảng cáo.
 * Tiền vào nền tảng và điều gì quyết định nó quay về.
 */

export const quangCao = [
  {
    slug: 'ngan-sach-quang-cao-bao-nhieu',
    title: 'Ngân sách quảng cáo nên là bao nhiêu',
    seoTitle: 'Xác định ngân sách quảng cáo cho doanh nghiệp dịch vụ',
    excerpt: 'Câu trả lời không phải một tỉ lệ phần trăm doanh thu. Nó là kết quả của ba con số bạn đã có sẵn, và có thể tính trong mười lăm phút.',
    seoDesc: 'Cách tính ngân sách quảng cáo dựa trên mục tiêu doanh thu, giá trị vòng đời khách hàng và tỉ lệ chốt, kèm mức sàn tối thiểu để dữ liệu có ý nghĩa.',
    date: '2026-11-25',
    updated: '2026-11-25',
    readMinutes: 7,
    topic: 'Quảng cáo',
    layer: 'A',
    level: 'Nền tảng',
    related: ['phu-song-da-kenh', 'he-thong-marketing'],
    body: [
      { type: 'p', text: 'Lời khuyên phổ biến nhất về ngân sách quảng cáo là "khoảng mười phần trăm doanh thu". Con số đó vô dụng vì nó không quan tâm bạn đang bán gì, biên lợi nhuận bao nhiêu, và đang muốn tăng trưởng hay giữ nguyên.' },

      { type: 'h2', text: 'Tính ngược từ mục tiêu' },
      { type: 'p', text: 'Cách đúng là đi ngược: từ số khách hàng bạn muốn, qua tỉ lệ chốt, ra số khách tiềm năng cần, rồi nhân với chi phí mỗi khách tiềm năng.' },
      { type: 'formula', text: 'Ngân sách = (Số khách hàng mục tiêu ÷ Tỉ lệ chốt) × Chi phí mỗi khách tiềm năng' },
      { type: 'p', text: 'Ví dụ một phòng khám muốn thêm ba mươi ca mỗi tháng, tỉ lệ chốt hai mươi phần trăm, chi phí mỗi khách tiềm năng ba trăm nghìn:' },
      { type: 'table', head: ['Bước', 'Phép tính', 'Kết quả'], rows: [
        ['Khách tiềm năng cần', '30 ÷ 0,20', '150'],
        ['Ngân sách', '150 × 300.000 đ', '45.000.000 đ'],
        ['Chi phí mỗi ca', '45 tr ÷ 30', '1.500.000 đ'],
        ['Kiểm tra so với giá trị vòng đời 19,8 tr', '19,8 ÷ 1,5', '13 lần — an toàn']
      ]},
      { type: 'p', text: 'Tỉ lệ mười ba lần ở dòng cuối nói rằng phòng khám này đang chi quá ít. Họ có thể chấp nhận chi phí mỗi ca cao gấp bốn lần mà vẫn lành mạnh, nghĩa là còn nhiều dư địa để mở rộng.' },

      { type: 'h2', text: 'Mức sàn: dưới ngưỡng này thì đừng chạy' },
      { type: 'p', text: 'Có một ngưỡng tối thiểu ít người nói tới. Dưới ngưỡng đó, quảng cáo không đủ dữ liệu để học, và bạn chỉ đang trả tiền cho sự ngẫu nhiên.' },
      { type: 'list', items: [
        'Mỗi nhóm quảng cáo cần khoảng ba mươi tới năm mươi chuyển đổi mỗi tháng để thuật toán tối ưu được.',
        'Nhân ngược lại: nếu chi phí mỗi khách tiềm năng là ba trăm nghìn, mức sàn cho một nhóm là khoảng mười lăm triệu mỗi tháng.',
        'Ngân sách nhỏ thì chạy ít nhóm, đừng chia nhỏ ra nhiều nhóm. Một nhóm có dữ liệu tốt hơn năm nhóm đều mù.'
      ]},

      { type: 'note', tone: 'warn', text: 'Nếu tổng ngân sách của bạn dưới mức sàn của một nhóm duy nhất, quảng cáo trả phí chưa phải kênh phù hợp lúc này. Hãy dồn sức vào tìm kiếm địa phương, giới thiệu và nội dung trước.' },

      { type: 'h2', text: 'Chia ngân sách thế nào' },
      { type: 'table', head: ['Mục đích', 'Tỉ lệ gợi ý', 'Vì sao'], rows: [
        ['Kênh đã chứng minh hiệu quả', '70%', 'Giữ dòng khách ổn định'],
        ['Mở rộng kênh hoặc tệp mới', '20%', 'Chuẩn bị cho quý sau'],
        ['Thử nghiệm thật sự mới', '10%', 'Chấp nhận mất để học được']
      ]},
      { type: 'p', text: 'Doanh nghiệp bỏ hẳn phần mười phần trăm thử nghiệm thường ổn định trong sáu tháng rồi đột ngột gặp khó khi kênh chính đắt lên, vì lúc đó họ không có gì thay thế.' },

      { type: 'cta', text: 'Bài chẩn đoán sẽ ước lượng mức trần ngân sách an toàn dựa trên chính số liệu của bạn.' }
    ]
  },

  {
    slug: 'khi-nao-tang-ngan-sach',
    title: 'Tăng ngân sách lúc nào và tăng bao nhiêu một lần',
    seoTitle: 'Khi nào nên tăng ngân sách quảng cáo và tăng thế nào',
    excerpt: 'Quảng cáo đang tốt, gấp đôi ngân sách, hiệu quả sụt. Chuyện này xảy ra với gần như mọi doanh nghiệp, và nó có quy luật.',
    seoDesc: 'Quy tắc tăng ngân sách quảng cáo an toàn: điều kiện trước khi tăng, biên độ mỗi lần, dấu hiệu cần dừng và cách xử lý khi hiệu quả giảm.',
    date: '2026-12-02',
    updated: '2026-12-02',
    readMinutes: 6,
    topic: 'Quảng cáo',
    layer: 'X',
    level: 'Thực hành',
    related: ['phu-song-da-kenh'],
    body: [
      { type: 'p', text: 'Có một kịch bản lặp lại đến mức có thể đoán trước: tháng này quảng cáo chạy tốt, chủ doanh nghiệp quyết định gấp đôi ngân sách, và tháng sau chi phí mỗi khách tăng bốn mươi phần trăm. Kết luận thường là "quảng cáo hết hiệu quả". Kết luận đó sai.' },

      { type: 'h2', text: 'Vì sao tăng đột ngột lại làm hỏng' },
      { type: 'list', items: [
        'Hệ thống quảng cáo quay lại giai đoạn học khi ngân sách thay đổi mạnh, và trong giai đoạn đó nó chi tiền để dò tìm.',
        'Tệp khách sẵn sàng nhất đã được tiếp cận rồi. Tiền thêm vào buộc phải đi tìm nhóm xa hơn, và nhóm đó luôn đắt hơn.',
        'Đội tư vấn không tăng năng lực kịp. Số khách tiềm năng tăng gấp đôi mà vẫn hai người trực thì tốc độ phản hồi chậm lại, tỉ lệ chốt giảm, và mọi con số trông như lỗi của quảng cáo.'
      ]},

      { type: 'h2', text: 'Ba điều kiện trước khi tăng' },
      { type: 'steps', items: [
        { t: 'Chi phí mỗi khách hàng ổn định trong ít nhất ba tuần', d: 'Không phải ba ngày đẹp. Ổn định nghĩa là dao động dưới mười lăm phần trăm.' },
        { t: 'Còn cách trần ít nhất ba mươi phần trăm', d: 'Trần là mức chi phí mỗi khách mà tại đó tỉ lệ với giá trị vòng đời còn bằng ba. Không còn khoảng đệm thì không nên tăng.' },
        { t: 'Khâu tiếp nhận chịu được thêm tải', d: 'Hỏi thẳng đội tư vấn: thêm năm mươi phần trăm số khách thì có giữ được thời gian phản hồi dưới năm phút không.' }
      ]},

      { type: 'h2', text: 'Biên độ an toàn' },
      { type: 'table', head: ['Mức tăng mỗi lần', 'Giãn cách', 'Rủi ro'], rows: [
        ['15 – 20%', '4 – 5 ngày', 'Thấp, hệ thống gần như không phải học lại'],
        ['30 – 50%', '7 ngày', 'Trung bình, chấp nhận được khi dữ liệu dày'],
        ['Trên 100%', '—', 'Cao, gần như luôn kéo theo giai đoạn học lại']
      ]},
      { type: 'p', text: 'Tăng hai mươi phần trăm mỗi năm ngày cho ra mức tăng gấp đôi sau khoảng ba tuần, gần như không gây xáo trộn. Cùng đích đến, khác hẳn rủi ro.' },

      { type: 'note', tone: 'tip', text: 'Tăng ngân sách trên nhóm đang thắng chứ không tạo nhóm mới sao chép nhóm cũ. Nhóm mới bắt đầu lại từ số không, còn nhóm cũ đã có dữ liệu học tích luỹ.' },

      { type: 'h2', text: 'Khi nào nên dừng lại' },
      { type: 'p', text: 'Dấu hiệu rõ ràng nhất là chi phí mỗi khách hàng tăng nhanh hơn tốc độ tăng ngân sách. Tăng ngân sách ba mươi phần trăm mà chi phí mỗi khách tăng bốn mươi phần trăm nghĩa là bạn đã chạm trần của tệp hiện tại. Lúc đó việc cần làm không phải là chi thêm, mà là mở tệp mới, đổi thông điệp, hoặc sửa phần chuyển đổi để chịu được chi phí cao hơn.' },

      { type: 'cta', text: 'Trần ngân sách của bạn nằm ở đâu phụ thuộc vào tầng chuyển đổi. Sửa tầng đó xong, trần tự nâng lên.' }
    ]
  },

  {
    slug: 'chi-phi-quang-cao-tang-dan',
    title: 'Vì sao quảng cáo mỗi năm một đắt, và làm gì với nó',
    seoTitle: 'Chi phí quảng cáo tăng: nguyên nhân và cách ứng phó',
    excerpt: 'Cùng một mẫu quảng cáo, cùng tệp khách, năm nay đắt hơn năm ngoái ba mươi phần trăm. Không phải cảm giác, cũng không phải lỗi của bạn.',
    seoDesc: 'Phân tích nguyên nhân chi phí quảng cáo tăng theo thời gian và bốn hướng ứng phó bền vững cho doanh nghiệp dịch vụ Việt Nam.',
    date: '2026-12-09',
    updated: '2026-12-09',
    readMinutes: 7,
    topic: 'Quảng cáo',
    layer: 'A',
    level: 'Nền tảng',
    related: ['phu-song-da-kenh', 'he-thong-marketing'],
    body: [
      { type: 'p', text: 'Giá mỗi nghìn lượt hiển thị ở Việt Nam đã tăng đều trong nhiều năm, và không có dấu hiệu dừng lại. Doanh nghiệp nào coi đây là chuyện tạm thời sẽ liên tục bị bất ngờ; doanh nghiệp nào coi đây là điều kiện nền sẽ dựng hệ thống chịu được nó.' },

      { type: 'h2', text: 'Ba nguyên nhân thật' },
      { type: 'list', items: [
        'Số người mua quảng cáo tăng nhanh hơn số giờ người dùng dành cho nền tảng. Đây là đấu giá, và số người đấu ngày càng đông.',
        'Dữ liệu nhắm mục tiêu kém chính xác hơn trước do các thay đổi về quyền riêng tư, nên nền tảng cần nhiều lượt hiển thị hơn để tìm đúng người.',
        'Người dùng quen với quảng cáo hơn, nên tỉ lệ phản hồi tự nhiên giảm theo thời gian.'
      ]},
      { type: 'p', text: 'Không nguyên nhân nào trong ba cái này nằm trong tầm kiểm soát của bạn. Vì thế mọi nỗ lực chỉ để "chạy quảng cáo giỏi hơn" đều có trần rất thấp.' },

      { type: 'h2', text: 'Bốn hướng ứng phó, xếp theo độ bền' },
      { type: 'table', head: ['Hướng', 'Tác dụng', 'Độ bền'], rows: [
        ['Tối ưu mẫu quảng cáo và tệp nhắm', 'Giảm chi phí 10 – 20%', 'Vài tháng'],
        ['Tăng tỉ lệ chuyển đổi sau khi khách vào trang', 'Chịu được chi phí cao hơn', 'Nhiều năm'],
        ['Tăng giá trị vòng đời khách hàng', 'Nâng trần chi phí cho phép', 'Nhiều năm'],
        ['Xây kênh không phụ thuộc đấu giá', 'Giảm dần tỉ trọng quảng cáo', 'Vĩnh viễn']
      ]},
      { type: 'p', text: 'Hướng đầu tiên là thứ mọi người làm và là thứ có tác dụng ngắn nhất. Ba hướng còn lại khó hơn, chậm hơn, và là lý do một số doanh nghiệp vẫn lãi khi đối thủ kêu quảng cáo đắt.' },

      { type: 'h2', text: 'Phép tính cho thấy vì sao chuyển đổi quan trọng hơn' },
      { type: 'p', text: 'Giả sử chi phí mỗi lượt truy cập tăng ba mươi phần trăm, từ 5.000 lên 6.500 đồng. Với tỉ lệ chuyển đổi hai phần trăm, chi phí mỗi khách tiềm năng tăng từ 250.000 lên 325.000 đồng.' },
      { type: 'formula', text: 'Nâng tỉ lệ chuyển đổi từ 2% lên 2,6% đưa chi phí mỗi khách tiềm năng trở lại đúng 250.000 đồng.' },
      { type: 'p', text: 'Nâng tỉ lệ chuyển đổi thêm 0,6 điểm phần trăm là việc trong tầm tay: sửa lời đề nghị, rút gọn form, tăng tốc trang. Còn việc hạ giá đấu thầu thì không nằm trong tay bạn.' },

      { type: 'note', tone: 'tip', text: 'Mỗi quý, hãy hỏi một câu: nếu chi phí quảng cáo tăng thêm năm mươi phần trăm vào tháng sau, doanh nghiệp còn lãi không. Câu trả lời cho biết bạn đang phụ thuộc đến mức nào.' },

      { type: 'cta', text: 'Kênh không phụ thuộc đấu giá là thứ mất thời gian nhất để xây. Vì vậy nên bắt đầu từ hôm nay chứ không phải khi đã khó.' }
    ]
  },

  {
    slug: 'quang-cao-tot-nhung-khong-ra-don',
    title: 'Quảng cáo chỉ số đẹp nhưng cuối tháng không thấy tiền',
    seoTitle: 'Quảng cáo nhiều tương tác nhưng không ra đơn: chẩn đoán',
    excerpt: 'Lượt xem cao, giá mỗi lượt bấm rẻ, bình luận nhiều. Và doanh thu không nhúc nhích. Chỗ đứt gãy luôn nằm ở một trong bốn khâu.',
    seoDesc: 'Quy trình chẩn đoán khi quảng cáo có chỉ số tốt nhưng không tạo doanh thu: kiểm tra từng khâu trong phễu và xác định điểm đứt gãy thật sự.',
    date: '2026-12-16',
    updated: '2026-12-16',
    readMinutes: 7,
    topic: 'Quảng cáo',
    layer: 'A',
    level: 'Thực hành',
    related: ['sieu-chuyen-doi', 'he-thong-marketing'],
    body: [
      { type: 'p', text: 'Báo cáo quảng cáo đẹp và doanh thu không tăng là tình huống gây ức chế nhất, vì không có gì rõ ràng để sửa. Nhưng nó luôn có nguyên nhân, và nguyên nhân đó nằm ở đúng một trong bốn khâu.' },

      { type: 'h2', text: 'Đi lần lượt bốn khâu' },
      { type: 'steps', items: [
        { t: 'Khâu tiếp cận: đúng người chưa', d: 'Xem phân bố tuổi, giới tính và khu vực của người tương tác. Nếu phần lớn nằm ngoài nhóm khách thật của bạn, quảng cáo đang mua sự chú ý rẻ tiền chứ không phải nhu cầu.' },
        { t: 'Khâu trang đích: người vào có ở lại không', d: 'So tỉ lệ rời ngay và thời gian trên trang giữa nhóm từ quảng cáo và nhóm tự nhiên. Chênh lệch lớn nghĩa là quảng cáo hứa một đằng, trang nói một nẻo.' },
        { t: 'Khâu thu thập: người ở lại có để lại thông tin không', d: 'Nếu tỉ lệ dưới một phần trăm với lưu lượng đúng nhóm, vấn đề nằm ở lời đề nghị hoặc ở form.' },
        { t: 'Khâu tiếp nhận: có thông tin rồi thì sao', d: 'Đo thời gian phản hồi và tỉ lệ gọi lại thành công. Đây là nơi rò rỉ lớn nhất và ít bị soi nhất.' }
      ]},

      { type: 'h2', text: 'Bốn triệu chứng, bốn nguyên nhân' },
      { type: 'table', head: ['Triệu chứng', 'Nguyên nhân thường gặp'], rows: [
        ['Nhiều bình luận, ít người vào trang', 'Nội dung gây tò mò nhưng không tạo nhu cầu'],
        ['Nhiều lượt vào, rời ngay dưới 10 giây', 'Trang không khớp với lời hứa trong quảng cáo'],
        ['Ở lại lâu, không để lại thông tin', 'Lời đề nghị quá nặng hoặc thiếu bằng chứng'],
        ['Có thông tin, không chốt được', 'Chậm phản hồi hoặc sai nhóm khách ngay từ đầu']
      ]},

      { type: 'note', tone: 'warn', text: 'Cẩn thận với quảng cáo tối ưu theo lượt tương tác. Nó sẽ tìm rất giỏi những người thích bình luận, và những người đó hiếm khi là người sẵn sàng trả tiền. Hãy tối ưu theo sự kiện gần với doanh thu nhất mà bạn có đủ dữ liệu.' },

      { type: 'h2', text: 'Một phép thử nhanh' },
      { type: 'p', text: 'Lấy hai mươi số điện thoại gần nhất từ quảng cáo và gọi thử trong vòng năm phút sau khi họ để lại thông tin. Nếu tỉ lệ chốt của hai mươi cuộc gọi đó cao hẳn so với bình thường, vấn đề của bạn nằm ở khâu tiếp nhận chứ không phải ở quảng cáo. Phép thử này mất một buổi và trả lời được câu hỏi mà báo cáo không trả lời được.' },

      { type: 'cta', text: 'Quảng cáo hiếm khi là nguyên nhân gốc. Nó chỉ là nơi hậu quả hiện ra rõ nhất.' }
    ]
  }
];
