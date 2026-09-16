/*
 * Chủ đề: Đo lường.
 * Những bài trả lời câu hỏi "con số thật của tôi là bao nhiêu, và tính thế nào".
 */

export const doLuong = [
  {
    slug: 'chi-phi-moi-khach-hang',
    title: 'Cách tính chi phí thật để có một khách hàng',
    seoTitle: 'Cách tính chi phí có một khách hàng (CAC)',
    excerpt: 'Phần lớn doanh nghiệp dịch vụ tính sai con số này, và tính sai theo hướng có lợi cho mình. Đây là cách tính đúng, kèm bảng mẫu bạn tự làm được trong một buổi chiều.',
    seoDesc: 'Hướng dẫn tính chi phí thu hút một khách hàng (CAC) cho doanh nghiệp dịch vụ Việt Nam: công thức đầy đủ, những khoản hay bị bỏ sót và ngưỡng an toàn theo ngành.',
    date: '2026-08-12',
    updated: '2026-08-12',
    readMinutes: 8,
    topic: 'Đo lường',
    layer: 'U',
    level: 'Nền tảng',
    related: ['he-thong-marketing'],
    body: [
      { type: 'p', text: 'Khi hỏi một chủ doanh nghiệp dịch vụ "chi phí để có một khách hàng của anh chị là bao nhiêu", câu trả lời thường là ngân sách quảng cáo chia cho số đơn. Con số đó gần như luôn thấp hơn thực tế, và vì nó thấp nên nó khiến mọi quyết định mở rộng sau đó trở nên rủi ro.' },

      { type: 'h2', text: 'Công thức đầy đủ' },
      { type: 'p', text: 'Chi phí thu hút một khách hàng, thường gọi tắt là CAC, phải gồm mọi khoản bạn chi ra để biến một người lạ thành người trả tiền:' },
      { type: 'formula', text: 'CAC = (Quảng cáo + Nội dung + Công cụ + Lương đội marketing và sales + Hoa hồng) ÷ Số khách hàng mới' },
      { type: 'p', text: 'Ba khoản hay bị bỏ sót nhất, xếp theo mức độ nghiêm trọng:' },
      { type: 'list', items: [
        'Lương đội ngũ. Một bạn chạy quảng cáo lương hai mươi triệu, dành một nửa thời gian cho kênh này, là mười triệu mỗi tháng phải tính vào.',
        'Chi phí sản xuất nội dung. Ảnh, video, thiết kế — kể cả khi do người trong công ty làm.',
        'Hoa hồng và thưởng cho sales. Đây là chi phí thu hút khách, không phải chi phí vận hành.'
      ]},

      { type: 'h2', text: 'Ví dụ: một phòng khám nha khoa' },
      { type: 'p', text: 'Giả sử tháng vừa rồi phòng khám chi sáu mươi triệu quảng cáo và có hai mươi ca mới. Cách tính quen thuộc cho ra ba triệu một ca. Nhưng tính đủ:' },
      { type: 'table', head: ['Khoản mục', 'Số tiền'], rows: [
        ['Quảng cáo', '60.000.000 đ'],
        ['Nội dung, hình ảnh', '8.000.000 đ'],
        ['Phần mềm, công cụ', '2.000.000 đ'],
        ['Lương marketing (phần phân bổ)', '12.000.000 đ'],
        ['Lương và hoa hồng tư vấn viên', '18.000.000 đ'],
        ['Tổng', '100.000.000 đ']
      ]},
      { type: 'p', text: 'Chia cho hai mươi ca, chi phí thật là năm triệu một ca, không phải ba triệu. Chênh lệch sáu mươi bảy phần trăm. Nếu giá trị trung bình một ca là sáu triệu, phòng khám này đang gần như hoà vốn chứ không lãi như họ tưởng.' },

      { type: 'h2', text: 'Ngưỡng an toàn' },
      { type: 'p', text: 'Con số CAC chỉ có ý nghĩa khi đặt cạnh giá trị vòng đời khách hàng, tức tổng doanh thu một khách mang lại trong suốt thời gian họ gắn bó. Tỉ lệ được coi là lành mạnh với ngành dịch vụ:' },
      { type: 'table', head: ['Tỉ lệ giá trị vòng đời trên CAC', 'Ý nghĩa'], rows: [
        ['Dưới 1', 'Càng bán càng lỗ. Dừng mở rộng ngay.'],
        ['1 – 2', 'Sống được nhưng không còn tiền để tái đầu tư.'],
        ['3 – 4', 'Vùng lành mạnh. Có thể mở rộng.'],
        ['Trên 5', 'Có thể bạn đang chi quá ít và bỏ lỡ tăng trưởng.']
      ]},

      { type: 'h2', text: 'Vì sao con số này quan trọng hơn bạn nghĩ' },
      { type: 'p', text: 'Khi chưa biết CAC thật, mọi cuộc thảo luận ngân sách đều là tranh cãi cảm tính. Có CAC rồi, câu hỏi đổi từ "có nên tăng ngân sách không" thành "tăng bao nhiêu thì vẫn giữ được tỉ lệ ba lần" — một câu hỏi có đáp án.' },
      { type: 'p', text: 'Và quan trọng hơn: khi bạn đẩy được dữ liệu doanh thu thật ngược về nền tảng quảng cáo, hệ thống của họ bắt đầu tìm những người giống khách hàng đã trả tiền, thay vì tìm người hay bấm. Đó là lúc CAC bắt đầu giảm mà không cần bạn làm gì thêm.' },

      { type: 'faq', items: [
        { q: 'Nên tính CAC theo tháng hay theo quý?', a: 'Theo tháng để theo dõi xu hướng, nhưng ra quyết định mở rộng thì nhìn số trung bình ba tháng. Một tháng lẻ luôn bị nhiễu bởi mùa vụ và bởi độ trễ giữa lúc chi tiền và lúc khách chốt.' },
        { q: 'Khách tự tìm đến qua giới thiệu có tính vào không?', a: 'Nên tách riêng. Trộn chung sẽ làm CAC trông đẹp hơn thực tế và che mất việc kênh trả phí đang hoạt động ra sao. Hãy tính hai con số: CAC trả phí và CAC tổng hợp.' },
        { q: 'Doanh nghiệp mới chưa có đủ dữ liệu thì làm sao?', a: 'Dùng ngưỡng trần thay vì số thực: lấy giá trị vòng đời ước tính chia ba, đó là mức CAC tối đa bạn được phép chi. Chạy trong giới hạn đó cho tới khi có đủ ba tháng dữ liệu.' }
      ]},

      { type: 'cta', text: 'Bài chẩn đoán của Aurix có một câu hỏi riêng về chi phí mỗi khách hàng. Trả lời xong, bạn sẽ thấy tầng nào trong hệ thống đang đẩy con số đó lên.' }
    ]
  },

  {
    slug: 'gia-tri-vong-doi-khach-hang',
    title: 'Giá trị một khách hàng trong suốt thời gian họ ở lại',
    seoTitle: 'Cách tính giá trị vòng đời khách hàng (LTV)',
    excerpt: 'Nếu chỉ nhìn đơn hàng đầu tiên, bạn sẽ luôn thấy quảng cáo đắt. Con số thật nằm ở toàn bộ dòng tiền một khách mang lại, và nó thường gấp ba tới sáu lần đơn đầu.',
    seoDesc: 'Công thức tính giá trị vòng đời khách hàng (LTV) cho doanh nghiệp dịch vụ, cách ước lượng khi chưa đủ dữ liệu lịch sử, và ba đòn bẩy làm con số này tăng.',
    date: '2026-09-09',
    updated: '2026-09-09',
    readMinutes: 7,
    topic: 'Đo lường',
    layer: 'X',
    level: 'Nền tảng',
    related: ['he-thong-marketing'],
    body: [
      { type: 'p', text: 'Hai doanh nghiệp cùng chi năm triệu để có một khách. Một bên thấy đắt và cắt ngân sách. Bên kia thấy rẻ và tăng gấp đôi. Cả hai đều đúng — vì họ đang nhìn hai con số giá trị vòng đời hoàn toàn khác nhau.' },

      { type: 'h2', text: 'Công thức' },
      { type: 'formula', text: 'LTV = Giá trị trung bình mỗi lần mua × Số lần mua mỗi năm × Số năm gắn bó × Biên lợi nhuận gộp' },
      { type: 'p', text: 'Phần nhân với biên lợi nhuận gộp là phần hay bị bỏ. Doanh thu không phải tiền của bạn. Một spa có biên gộp sáu mươi phần trăm thì một khách mang về ba mươi triệu doanh thu chỉ tương đương mười tám triệu để bù chi phí thu hút.' },

      { type: 'h2', text: 'Ví dụ ba ngành' },
      { type: 'table', head: ['Ngành', 'Mỗi lần', 'Lần/năm', 'Số năm', 'Biên gộp', 'LTV'], rows: [
        ['Spa thẩm mỹ', '2,5 tr', '6', '2,5', '60%', '22,5 tr'],
        ['Nha khoa', '6 tr', '1,2', '5', '55%', '19,8 tr'],
        ['Trung tâm tiếng Anh', '18 tr', '1', '2', '45%', '16,2 tr']
      ]},
      { type: 'p', text: 'Ba ngành khác hẳn nhau về cách khách chi tiền, nhưng giá trị vòng đời lại rơi vào cùng một khoảng. Điều đó có nghĩa: mức CAC trần của cả ba, theo tỉ lệ ba lần, đều quanh sáu tới bảy triệu.' },

      { type: 'note', tone: 'warn', text: 'Đừng lấy số của ngành trên mạng rồi áp vào doanh nghiệp mình. Hai phòng khám cùng quận có thể lệch nhau gấp đôi chỉ vì một bên có gói duy trì định kỳ còn bên kia thì không.' },

      { type: 'h2', text: 'Khi chưa có đủ lịch sử' },
      { type: 'p', text: 'Doanh nghiệp mở chưa đầy hai năm không thể biết khách ở lại mấy năm. Cách ước lượng dùng được ngay:' },
      { type: 'steps', items: [
        { t: 'Lấy tỉ lệ rời bỏ theo năm', d: 'Trong số khách của năm ngoái, bao nhiêu phần trăm không quay lại trong mười hai tháng tiếp theo.' },
        { t: 'Lấy nghịch đảo', d: 'Nếu bốn mươi phần trăm rời bỏ mỗi năm, tuổi thọ trung bình là một chia cho 0,4, tức 2,5 năm.' },
        { t: 'Nhân vào công thức', d: 'Dùng 2,5 năm đó thay cho số năm gắn bó. Sai số chấp nhận được, và tốt hơn nhiều so với đoán.' }
      ]},

      { type: 'h2', text: 'Ba đòn bẩy làm giá trị vòng đời tăng' },
      { type: 'p', text: 'Tăng giá trị vòng đời thường rẻ hơn giảm chi phí thu hút, vì bạn đang làm việc với những người đã tin bạn.' },
      { type: 'table', head: ['Đòn bẩy', 'Việc cụ thể', 'Mức tăng thường thấy'], rows: [
        ['Tăng tần suất', 'Nhắc lịch định kỳ tự động, gói theo buổi', '15 – 30%'],
        ['Tăng giá trị mỗi lần', 'Gói kèm, nâng cấp tại điểm chạm phù hợp', '10 – 20%'],
        ['Kéo dài thời gian gắn bó', 'Chăm sóc sau bán, hỏi thăm đúng mốc', '20 – 40%']
      ]},
      { type: 'p', text: 'Ba đòn bẩy này cộng dồn theo phép nhân chứ không phải phép cộng. Tăng mỗi thứ hai mươi phần trăm cho ra giá trị vòng đời gấp 1,73 lần, không phải 1,6 lần.' },

      { type: 'cta', text: 'Biết giá trị vòng đời rồi, bạn có trần ngân sách. Bài chẩn đoán sẽ chỉ ra bạn còn cách trần đó bao xa.' }
    ]
  },

  {
    slug: 'do-luong-khong-can-cookie',
    title: 'Đo lường khi trình duyệt không còn cho bạn theo dấu',
    seoTitle: 'Đo lường marketing thời hậu cookie: cách làm đúng',
    excerpt: 'Bảng quảng cáo báo bốn mươi chuyển đổi, sổ sách ghi hai mươi ba đơn. Không ai nói dối, chỉ là hai hệ thống đang đếm hai thứ khác nhau.',
    seoDesc: 'Cách dựng hệ đo lường trên dữ liệu bên thứ nhất: sự kiện phía máy chủ, mã đánh dấu nguồn và đối chiếu doanh thu thật.',
    date: '2026-09-16',
    updated: '2026-09-16',
    readMinutes: 9,
    topic: 'Đo lường',
    layer: 'U',
    level: 'Nâng cao',
    related: ['he-thong-marketing', 'web-ca-nhan-hoa'],
    body: [
      { type: 'p', text: 'Có một hiện tượng gần như doanh nghiệp nào cũng gặp: bảng quảng cáo báo bốn mươi chuyển đổi, sổ sách ghi hai mươi ba đơn. Không ai nói dối. Hai hệ thống đang đếm hai thứ khác nhau, bằng hai cách đều đã hỏng một phần.' },

      { type: 'h2', text: 'Vì sao số liệu lệch' },
      { type: 'list', items: [
        'Trình duyệt Safari và các trình duyệt riêng tư xoá dấu vết theo dõi sau bảy ngày, có khi sau hai mươi bốn giờ.',
        'Người dùng bấm từ chối trên bảng đồng ý cookie, và phần lớn họ bấm từ chối.',
        'Phần mềm chặn quảng cáo khiến mã đo lường không chạy được.',
        'Khách xem trên điện thoại rồi mua trên máy tính, hoặc gọi điện thay vì điền form — không có đường nào nối hai hành vi lại.'
      ]},
      { type: 'p', text: 'Cộng lại, tỉ lệ mất dấu trong ngành dịch vụ Việt Nam thường ở mức ba mươi tới năm mươi phần trăm. Nghĩa là một phần lớn quyết định ngân sách của bạn đang dựa trên dữ liệu không đầy đủ.' },

      { type: 'h2', text: 'Nguyên tắc: chỉ tin dữ liệu bạn sở hữu' },
      { type: 'p', text: 'Thay vì cố khôi phục việc theo dấu, hãy đổi chỗ đứng: lấy hệ thống của bạn làm gốc sự thật, còn nền tảng quảng cáo chỉ là nơi nhận thông tin.' },
      { type: 'steps', items: [
        { t: 'Gắn mã nguồn vào mọi đường dẫn', d: 'Mỗi quảng cáo, mỗi bài đăng, mỗi mã QR đều mang một mã nguồn riêng trong đường dẫn. Đây là việc rẻ nhất và hiệu quả nhất trong cả danh sách.' },
        { t: 'Lưu mã nguồn cùng lúc với thông tin khách', d: 'Khi khách gửi form hay bấm gọi, ghi mã nguồn đó vào cùng bản ghi. Từ đây bạn biết mỗi khách đến từ đâu, không cần cookie.' },
        { t: 'Ghi sự kiện từ máy chủ', d: 'Gửi sự kiện chuyển đổi từ máy chủ của bạn thay vì từ trình duyệt. Không bị chặn, không phụ thuộc thiết bị.' },
        { t: 'Đối chiếu với doanh thu thật', d: 'Mỗi tháng, ghép danh sách khách đã trả tiền với bảng nguồn. Đây mới là báo cáo dùng để quyết định.' },
        { t: 'Gửi ngược tín hiệu doanh thu', d: 'Đưa giá trị đơn hàng thật quay lại nền tảng quảng cáo. Thuật toán sẽ tìm người giống khách đã trả tiền, thay vì người hay bấm.' }
      ]},

      { type: 'h2', text: 'Bộ mã nguồn tối thiểu' },
      { type: 'p', text: 'Không cần phức tạp. Năm tham số này đủ cho phần lớn nhu cầu của doanh nghiệp dịch vụ:' },
      { type: 'table', head: ['Tham số', 'Trả lời câu hỏi', 'Ví dụ'], rows: [
        ['utm_source', 'Nền tảng nào', 'facebook, google, zalo'],
        ['utm_medium', 'Loại hình gì', 'cpc, organic, qr'],
        ['utm_campaign', 'Chiến dịch nào', 'thang9-trigiam'],
        ['utm_content', 'Mẫu quảng cáo nào', 'video-truoc-sau'],
        ['utm_term', 'Từ khoá hoặc tệp nào', 'nieng-rang-quan7']
      ]},
      { type: 'note', tone: 'tip', text: 'Quy ước đặt tên quan trọng hơn công cụ. Viết thường toàn bộ, không dấu, nối bằng gạch ngang, và ghi quy ước ra một tệp dùng chung. Một đội bốn người đặt tên bốn kiểu sẽ phá hỏng báo cáo nhanh hơn bất kỳ lỗi kỹ thuật nào.' },

      { type: 'h2', text: 'Kênh không có đường dẫn thì sao' },
      { type: 'p', text: 'Khách gọi thẳng, khách nhắn tin, khách đi ngang qua rồi vào. Ba cách xử lý, theo độ chính xác giảm dần:' },
      { type: 'list', items: [
        'Dùng số điện thoại riêng cho từng kênh lớn. Rẻ, chính xác gần như tuyệt đối.',
        'Mã QR riêng cho từng vị trí vật lý, mỗi mã dẫn tới một đường dẫn mang mã nguồn khác nhau.',
        'Hỏi một câu duy nhất khi tiếp nhận: "Anh chị biết bên em qua đâu ạ?" và bắt buộc ghi lại. Không chính xác lắm nhưng còn hơn để trống.'
      ]},

      { type: 'h2', text: 'Thước đo để biết mình đã làm đúng' },
      { type: 'p', text: 'Một con số duy nhất: tỉ lệ khách hàng có nguồn xác định. Dưới sáu mươi phần trăm là hệ đo lường chưa dùng được. Trên tám mươi lăm phần trăm là bạn có thể dựa vào nó để phân bổ ngân sách.' },

      { type: 'cta', text: 'Tầng U trong khung A.U.R.I.X là tầng hợp nhất dữ liệu. Bài chẩn đoán sẽ cho biết tầng này của bạn đang ở mức nào.' }
    ]
  },

  {
    slug: 'bang-dieu-khien-mot-trang',
    title: 'Bảy con số đủ để điều hành tăng trưởng',
    seoTitle: 'Bảng điều khiển marketing: 7 chỉ số cần theo dõi',
    excerpt: 'Không cần hai mươi biểu đồ. Bảy con số, nhìn mỗi tuần một lần, đủ để biết hệ thống đang khoẻ hay đang rò, và rò ở chỗ nào.',
    seoDesc: 'Bảy chỉ số marketing thiết yếu cho doanh nghiệp dịch vụ, ngưỡng cảnh báo của từng chỉ số, và cách đọc chúng cùng nhau để tìm điểm nghẽn.',
    date: '2026-09-23',
    updated: '2026-09-23',
    readMinutes: 6,
    topic: 'Đo lường',
    layer: 'U',
    level: 'Thực hành',
    related: ['he-thong-marketing'],
    body: [
      { type: 'p', text: 'Báo cáo marketing hay mắc một trong hai lỗi: hoặc quá mỏng, chỉ có chi phí và số đơn; hoặc quá dày, hai mươi biểu đồ mà không ai đọc. Bảng điều khiển dùng được phải vừa đủ để nhìn trong ba phút và biết tuần này cần làm gì.' },

      { type: 'h2', text: 'Bảy con số' },
      { type: 'table', head: ['Chỉ số', 'Đo cái gì', 'Ngưỡng cần chú ý'], rows: [
        ['Số khách tiềm năng mới', 'Đầu vào của cả hệ thống', 'Giảm 2 tuần liên tiếp'],
        ['Chi phí mỗi khách tiềm năng', 'Hiệu quả kênh thu hút', 'Tăng trên 20% so với trung bình 3 tháng'],
        ['Tỉ lệ khách tiềm năng đủ điều kiện', 'Chất lượng đầu vào', 'Dưới 50%'],
        ['Thời gian phản hồi trung bình', 'Sức khoẻ khâu tiếp nhận', 'Trên 15 phút trong giờ làm'],
        ['Tỉ lệ chốt', 'Năng lực tư vấn', 'Giảm mà chất lượng đầu vào không đổi'],
        ['Giá trị trung bình mỗi đơn', 'Khả năng nâng giá trị', 'Giảm 3 tháng liên tiếp'],
        ['Tỉ lệ khách quay lại', 'Sức khoẻ dài hạn', 'Dưới mức cùng kỳ năm trước']
      ]},

      { type: 'h2', text: 'Đọc chúng cùng nhau, không đọc rời' },
      { type: 'p', text: 'Sức mạnh của bảng này nằm ở chỗ nhìn hai chỉ số cạnh nhau là ra nguyên nhân:' },
      { type: 'list', items: [
        'Khách tiềm năng tăng nhưng tỉ lệ chốt giảm: đầu vào đang loãng, không phải sales yếu. Kiểm tra tệp nhắm và lời đề nghị.',
        'Tỉ lệ đủ điều kiện cao nhưng tỉ lệ chốt thấp: vấn đề nằm ở khâu tư vấn hoặc ở tốc độ phản hồi.',
        'Chi phí mỗi khách tiềm năng ổn nhưng chi phí mỗi khách hàng tăng: rò rỉ nằm giữa lúc có thông tin và lúc chốt đơn.',
        'Mọi thứ ổn nhưng giá trị mỗi đơn giảm: bạn đang thu hút đúng số lượng nhưng sai phân khúc.'
      ]},

      { type: 'note', tone: 'tip', text: 'Nhịp xem hợp lý: bảy con số này mỗi tuần, so sánh với trung bình bốn tuần gần nhất. Xem theo ngày sẽ chỉ thấy nhiễu và dẫn tới những quyết định hoảng loạn.' },

      { type: 'h2', text: 'Ai nhìn con số nào' },
      { type: 'table', head: ['Vai trò', 'Nhìn gì', 'Nhịp'], rows: [
        ['Chủ doanh nghiệp', 'Chi phí mỗi khách, giá trị vòng đời, tỉ lệ quay lại', 'Hàng tháng'],
        ['Phụ trách marketing', 'Cả bảy chỉ số', 'Hàng tuần'],
        ['Đội tư vấn', 'Thời gian phản hồi, tỉ lệ chốt', 'Hàng ngày']
      ]},

      { type: 'quote', text: 'Chỉ số nào không có người chịu trách nhiệm thì chỉ số đó sẽ không bao giờ cải thiện.', cite: 'Nguyên tắc vận hành của Aurix' },

      { type: 'cta', text: 'Bài chẩn đoán sẽ chấm điểm từng tầng dựa trên chính những con số này.' }
    ]
  },

  {
    slug: 'quy-doi-doanh-thu-ve-kenh',
    title: 'Khách đi qua năm điểm chạm, ghi công cho điểm nào',
    seoTitle: 'Quy doanh thu về kênh: chọn mô hình phân bổ nào',
    excerpt: 'Facebook nhận công, Google cũng nhận công, cộng lại nhiều hơn doanh thu thật. Chọn mô hình phân bổ nào, và phép thử duy nhất kiểm chứng được nó.',
    seoDesc: 'So sánh các mô hình phân bổ doanh thu theo kênh cho doanh nghiệp dịch vụ, ưu nhược điểm từng mô hình và cách kiểm chứng bằng thử nghiệm tắt kênh.',
    date: '2026-09-30',
    updated: '2026-09-30',
    readMinutes: 7,
    topic: 'Đo lường',
    layer: 'U',
    level: 'Nâng cao',
    related: ['phu-song-da-kenh', 'he-thong-marketing'],
    body: [
      { type: 'p', text: 'Một khách hàng điển hình của ngành dịch vụ đi qua bốn tới bảy điểm chạm trước khi trả tiền: thấy video, tìm tên thương hiệu trên Google, đọc đánh giá, nhắn tin hỏi, rồi mới đặt lịch. Câu hỏi "đơn này của kênh nào" vì vậy không có câu trả lời đúng tuyệt đối.' },

      { type: 'h2', text: 'Bốn mô hình, bốn cách nhìn' },
      { type: 'table', head: ['Mô hình', 'Cách chia công', 'Hợp với'], rows: [
        ['Điểm chạm cuối', 'Toàn bộ cho kênh cuối cùng', 'Bán nhanh, chu kỳ dưới 3 ngày'],
        ['Điểm chạm đầu', 'Toàn bộ cho kênh đầu tiên', 'Khi ưu tiên mở rộng tệp mới'],
        ['Chia đều', 'Mỗi điểm chạm phần bằng nhau', 'Chu kỳ dài, nhiều kênh ngang sức'],
        ['Giảm dần theo thời gian', 'Càng gần lúc chốt càng nhiều công', 'Đa số doanh nghiệp dịch vụ']
      ]},
      { type: 'p', text: 'Với ngành dịch vụ có chu kỳ cân nhắc từ một tới bốn tuần, mô hình giảm dần theo thời gian thường phản ánh thực tế sát nhất. Nhưng đừng bỏ nhiều công sức chọn mô hình — điều quan trọng hơn nằm ở phần dưới.' },

      { type: 'h2', text: 'Phép thử duy nhất đáng tin' },
      { type: 'p', text: 'Mọi mô hình phân bổ đều là giả định. Chỉ có một cách kiểm chứng thật: tắt kênh đó đi và xem điều gì xảy ra.' },
      { type: 'steps', items: [
        { t: 'Chọn một kênh nghi ngờ', d: 'Kênh đang nhận nhiều công nhưng bạn không chắc nó tạo ra nhu cầu mới.' },
        { t: 'Tắt hoàn toàn trong hai tuần', d: 'Giữ nguyên mọi kênh khác. Hai tuần đủ dài để vượt qua nhiễu, đủ ngắn để không mất quá nhiều.' },
        { t: 'So tổng doanh thu, không so doanh thu kênh đó', d: 'Nếu tổng giảm đúng bằng phần kênh đó từng nhận, nó thật sự tạo ra nhu cầu. Nếu tổng gần như không đổi, nó chỉ đang nhận công của kênh khác.' },
        { t: 'Bật lại và ghi lại kết luận', d: 'Lặp lại với kênh tiếp theo sau một tháng. Mỗi quý bạn kiểm chứng được hai tới ba kênh.' }
      ]},
      { type: 'note', tone: 'warn', text: 'Đừng tắt kênh thương hiệu — tức quảng cáo hiện ra khi khách gõ đúng tên bạn — để làm phép thử. Kênh này gần như luôn nhận công của kênh khác, nhưng tắt nó thường đồng nghĩa nhường khách cho đối thủ đang đấu giá trên chính tên bạn.' },

      { type: 'h2', text: 'Cách trình bày để không ai cãi nhau' },
      { type: 'p', text: 'Thay vì một bảng duy nhất, Aurix thường dùng hai bảng đặt cạnh nhau: một bảng theo điểm chạm đầu để đánh giá khả năng tạo nhu cầu, một bảng theo điểm chạm cuối để đánh giá khả năng chốt. Kênh nào mạnh ở bảng một mà yếu ở bảng hai thì nhiệm vụ của nó là mở tệp, đừng bắt nó gánh chỉ tiêu doanh số.' },

      { type: 'faq', items: [
        { q: 'Có cần mua công cụ phân bổ chuyên dụng không?', a: 'Với doanh nghiệp dưới một tỉ doanh thu mỗi tháng thì chưa cần. Mã nguồn trên đường dẫn cộng với một bảng tính đối chiếu hàng tháng cho ra kết quả đủ tốt để quyết định.' },
        { q: 'Tổng chuyển đổi các nền tảng báo cộng lại lớn hơn số đơn thật, xử lý sao?', a: 'Đó là chuyện bình thường vì mỗi nền tảng đều tự nhận công. Đừng cộng chúng lại. Chỉ dùng bảng đối chiếu từ dữ liệu của bạn làm con số chính thức.' }
      ]},

      { type: 'cta', text: 'Nếu mỗi cuộc họp ngân sách đều kết thúc bằng tranh cãi kênh nào hiệu quả, vấn đề nằm ở tầng hợp nhất dữ liệu.' }
    ]
  }
];
