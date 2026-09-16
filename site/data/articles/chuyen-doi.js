/*
 * Chủ đề: Chuyển đổi.
 * Khoảng cách giữa "có thông tin khách" và "khách trả tiền".
 */

export const chuyenDoi = [
  {
    slug: 'toc-do-phan-hoi-khach-hang',
    title: 'Điểm rò rỉ đắt nhất nằm ở mười lăm phút đầu tiên',
    seoTitle: 'Tốc độ phản hồi ảnh hưởng tỉ lệ chốt thế nào',
    excerpt: 'Không nằm ở quảng cáo, không nằm ở website. Điểm mất tiền lớn nhất của phần lớn doanh nghiệp dịch vụ nằm ở khoảng thời gian giữa lúc khách để lại số và lúc có người gọi lại.',
    seoDesc: 'Vì sao thời gian phản hồi khách tiềm năng quyết định tỉ lệ chốt nhiều hơn cả ngân sách quảng cáo, và cách rút thời gian đó xuống dưới năm phút.',
    date: '2026-08-26',
    updated: '2026-08-26',
    readMinutes: 6,
    topic: 'Chuyển đổi',
    layer: 'X',
    level: 'Nền tảng',
    related: ['sieu-chuyen-doi'],
    body: [
      { type: 'p', text: 'Trong bài chẩn đoán của Aurix, câu hỏi về tốc độ phản hồi có trọng số cao nhất. Không phải ngẫu nhiên. Đây là điểm rò rỉ đắt nhất mà hầu như không ai nhìn thấy, vì nó không nằm trong bất kỳ báo cáo quảng cáo nào.' },

      { type: 'h2', text: 'Vì sao năm phút lại là ranh giới' },
      { type: 'p', text: 'Một người vừa để lại số điện thoại là người đang ở đỉnh của ý định. Họ vừa đọc xong, vừa thuyết phục xong chính mình, và đang mở lòng. Trạng thái đó không kéo dài.' },
      { type: 'list', items: [
        'Sau năm phút, họ quay lại việc đang làm dở.',
        'Sau một giờ, họ đã xem thêm hai ba đối thủ khác.',
        'Sang hôm sau, họ không còn nhớ đã để lại thông tin ở đâu, và cuộc gọi của bạn trở thành cuộc gọi làm phiền.'
      ]},
      { type: 'p', text: 'Điều đáng nói là chi phí để có được người đó đã chi rồi. Bạn đã trả tiền quảng cáo, đã làm website, đã viết nội dung. Toàn bộ khoản đầu tư đó bốc hơi trong lúc chờ ai đó rảnh tay.' },

      { type: 'h2', text: 'Ba chỗ thường làm chậm' },
      { type: 'table', head: ['Nguyên nhân', 'Cách xử lý'], rows: [
        ['Khách để lại thông tin ngoài giờ hành chính', 'Tin nhắn tự động trong ba mươi giây, xác nhận đã nhận và hẹn giờ gọi cụ thể'],
        ['Không ai biết có khách mới', 'Thông báo đẩy về điện thoại người trực, không chờ ai mở email'],
        ['Không rõ ai chịu trách nhiệm gọi', 'Phân công luân phiên tự động, có hạn giờ và có người giám sát']
      ]},

      { type: 'h2', text: 'Một phép tính đơn giản' },
      { type: 'p', text: 'Giả sử mỗi tháng bạn có một trăm khách để lại thông tin, tỉ lệ chốt hiện tại là mười phần trăm, giá trị trung bình mười triệu. Doanh thu một trăm triệu.' },
      { type: 'p', text: 'Rút thời gian phản hồi từ "trong ngày" xuống "dưới năm phút" thường nâng tỉ lệ chốt lên mười lăm tới mười tám phần trăm với ngành dịch vụ. Lấy mốc thấp nhất là mười lăm: doanh thu thành một trăm năm mươi triệu.' },
      { type: 'formula', text: 'Thêm 50 triệu mỗi tháng — không tốn thêm một đồng quảng cáo nào.' },
      { type: 'p', text: 'Đây là lý do Aurix luôn xử lý tầng này trước khi bàn tới việc tăng ngân sách. Nó rẻ nhất và nhanh nhất.' },

      { type: 'cta', text: 'Nếu bạn chưa đo được thời gian phản hồi trung bình của đội mình, đó chính là câu trả lời.' }
    ]
  },

  {
    slug: 'form-bao-nhieu-truong',
    title: 'Mỗi ô bạn thêm vào form là một phần khách bạn mất',
    seoTitle: 'Form nên có bao nhiêu trường để tối ưu chuyển đổi',
    excerpt: 'Ba ô hay bảy ô không phải chuyện thẩm mỹ. Mỗi ô thêm vào là đổi số lượng lấy chất lượng, và vùng tối ưu hẹp hơn bạn tưởng.',
    seoDesc: 'Hướng dẫn thiết kế form thu thập khách tiềm năng: số trường tối ưu, thứ tự câu hỏi, cách hỏi điều kiện lọc mà không làm giảm tỉ lệ điền.',
    date: '2026-10-07',
    updated: '2026-10-07',
    readMinutes: 6,
    topic: 'Chuyển đổi',
    layer: 'I',
    level: 'Thực hành',
    related: ['sieu-chuyen-doi', 'landing-page'],
    body: [
      { type: 'p', text: 'Có hai phe trong mọi cuộc họp về form. Phe marketing muốn ít ô để nhiều người điền. Phe bán hàng muốn nhiều ô để lọc bớt khách không nghiêm túc. Cả hai đều có lý, và cả hai đều đang tranh luận sai câu hỏi.' },

      { type: 'h2', text: 'Câu hỏi đúng là gì' },
      { type: 'p', text: 'Không phải "bao nhiêu ô" mà là "mỗi ô này giúp ai". Một ô chỉ đáng giữ nếu nó thoả một trong hai điều kiện: đội tư vấn thật sự dùng nó để chuẩn bị cho cuộc gọi, hoặc nó loại được một nhóm khách mà bạn chắc chắn không phục vụ.' },
      { type: 'p', text: 'Mọi ô còn lại chỉ tồn tại vì "để cho đầy đủ". Chúng là ô nên bỏ.' },

      { type: 'h2', text: 'Đánh đổi có thể tính được' },
      { type: 'p', text: 'Kinh nghiệm chung của ngành dịch vụ: mỗi ô thêm vào làm giảm khoảng bảy tới mười phần trăm số người hoàn tất. Nhưng chất lượng đầu vào tăng lên. Xem một ví dụ với một nghìn lượt xem trang:' },
      { type: 'table', head: ['Số ô', 'Số người điền', 'Tỉ lệ đủ điều kiện', 'Khách đủ điều kiện'], rows: [
        ['2 ô', '90', '35%', '31'],
        ['4 ô', '74', '55%', '41'],
        ['6 ô', '61', '68%', '41'],
        ['8 ô', '50', '72%', '36']
      ]},
      { type: 'p', text: 'Vùng tối ưu nằm ở bốn tới sáu ô, và nó khá phẳng. Điều đó có nghĩa: đừng dành cả tuần tranh cãi giữa bốn và năm ô. Hãy dành tuần đó để sửa những thứ có ảnh hưởng lớn hơn.' },

      { type: 'h2', text: 'Thứ tự quan trọng ngang số lượng' },
      { type: 'steps', items: [
        { t: 'Hỏi thứ dễ trước', d: 'Tên và số điện thoại. Người đã bắt đầu điền có xu hướng điền nốt.' },
        { t: 'Hỏi thứ khiến khách thấy được phục vụ tốt hơn', d: '"Anh chị quan tâm dịch vụ nào" nghe như đang chuẩn bị cho họ, không như đang tra hỏi.' },
        { t: 'Hỏi thứ nhạy cảm cuối cùng', d: 'Ngân sách, quy mô, thời điểm. Và nếu được, hãy để chúng ở dạng không bắt buộc.' }
      ]},

      { type: 'note', tone: 'tip', text: 'Một mẹo rẻ tiền mà hiệu quả: chuyển câu hỏi lọc từ ô nhập chữ sang nút chọn. Bấm một cái dễ hơn gõ rất nhiều, nên tỉ lệ hoàn tất gần như không giảm mà bạn vẫn có thông tin lọc.' },

      { type: 'h2', text: 'Những ô gần như luôn nên bỏ' },
      { type: 'list', items: [
        'Email, nếu kênh liên lạc chính của bạn là điện thoại hoặc Zalo.',
        'Địa chỉ, khi bạn chưa cần giao gì tới đó.',
        'Ô "lời nhắn" để trống. Chín trên mười người bỏ qua, một người còn lại viết "tư vấn giúp em".',
        'Ô xác nhận không phải người máy, trừ khi bạn đang thật sự bị làm phiền. Nó làm mất nhiều khách thật hơn là chặn được khách giả.'
      ]},

      { type: 'faq', items: [
        { q: 'Có nên chia form thành nhiều bước không?', a: 'Có, khi số ô từ năm trở lên. Chia thành hai bước với bước đầu chỉ hỏi tên và số điện thoại thường nâng tỉ lệ hoàn tất mười tới hai mươi phần trăm, vì khách đã cam kết ở bước một.' },
        { q: 'Form ngắn làm khách kém chất lượng, đội sales phàn nàn thì sao?', a: 'Chuyển việc lọc từ form sang cuộc gọi đầu tiên, dùng một kịch bản ba câu hỏi. Lọc bằng người luôn chính xác hơn lọc bằng ô nhập, và không làm mất khách tốt.' }
      ]},

      { type: 'cta', text: 'Tầng I trong khung A.U.R.I.X là tầng biến lượt xem thành cuộc hẹn. Bài chẩn đoán sẽ chỉ ra tầng này của bạn đang rò ở đâu.' }
    ]
  },

  {
    slug: 'loi-de-nghi-rui-ro-thap',
    title: 'Vì sao "đăng ký tư vấn" là lời đề nghị quá lớn',
    seoTitle: 'Thiết kế lời đề nghị rủi ro thấp để tăng chuyển đổi',
    excerpt: 'Người mới biết bạn ba mươi giây chưa sẵn sàng cho một cuộc hẹn. Đổi lời đề nghị sang thứ nhỏ hơn thường là thay đổi rẻ nhất mang lại kết quả lớn nhất.',
    seoDesc: 'Cách thiết kế lời đề nghị rủi ro thấp cho doanh nghiệp dịch vụ: thang mức độ cam kết, ví dụ theo ngành và cách đo hiệu quả trong hai tuần.',
    date: '2026-10-14',
    updated: '2026-10-14',
    readMinutes: 7,
    topic: 'Chuyển đổi',
    layer: 'I',
    level: 'Thực hành',
    related: ['landing-page', 'sieu-chuyen-doi'],
    body: [
      { type: 'p', text: 'Hầu hết trang dịch vụ ở Việt Nam kết thúc bằng cùng một nút: đăng ký tư vấn. Nút đó yêu cầu khách đồng ý cho một người lạ gọi điện, trong khi họ mới biết bạn được nửa phút. Đó là một cam kết lớn, và phần lớn người xem chọn không cam kết.' },

      { type: 'h2', text: 'Thang mức độ cam kết' },
      { type: 'p', text: 'Mọi lời đề nghị đều nằm trên một thang từ nhẹ tới nặng. Việc của bạn là chọn bậc thấp hơn bậc bạn đang dùng.' },
      { type: 'table', head: ['Bậc', 'Lời đề nghị', 'Khách phải cho đi'], rows: [
        ['1', 'Xem bảng giá tham khảo', 'Không gì cả'],
        ['2', 'Làm bài kiểm tra ngắn, nhận kết quả', 'Vài phút'],
        ['3', 'Nhận báo giá qua tin nhắn', 'Số điện thoại'],
        ['4', 'Đặt lịch khám thử miễn phí', 'Thời gian và sự có mặt'],
        ['5', 'Đăng ký tư vấn qua điện thoại', 'Quyền được gọi bất cứ lúc nào']
      ]},
      { type: 'p', text: 'Phần lớn doanh nghiệp chỉ có bậc năm trên trang. Thêm một lối vào ở bậc hai hoặc ba thường nâng tổng số khách tiềm năng lên hai tới ba lần, vì nó đón cả nhóm chưa sẵn sàng nói chuyện.' },

      { type: 'h2', text: 'Ví dụ theo ngành' },
      { type: 'table', head: ['Ngành', 'Lời đề nghị rủi ro thấp'], rows: [
        ['Nha khoa', 'Gửi ảnh răng, nhận nhận định sơ bộ trong 24 giờ'],
        ['Spa thẩm mỹ', 'Bài kiểm tra loại da, kèm gợi ý liệu trình phù hợp'],
        ['Giáo dục', 'Bài kiểm tra trình độ trực tuyến, có kết quả ngay'],
        ['Bất động sản', 'Bảng so sánh giá ba dự án cùng khu vực'],
        ['Fitness', 'Buổi tập thử không cần đăng ký trước']
      ]},

      { type: 'note', tone: 'warn', text: 'Lời đề nghị rủi ro thấp không có nghĩa là quà tặng vô nghĩa. Một tệp "cẩm nang mười điều cần biết" mà ai cũng tải rồi quên không lọc được ai. Thứ đáng làm phải cho khách biết thêm điều gì đó về chính tình huống của họ.' },

      { type: 'h2', text: 'Giữ hai lối vào cùng lúc' },
      { type: 'p', text: 'Đừng bỏ lời đề nghị nặng. Nhóm khách đang gấp cần một đường đi thẳng. Cấu trúc thường dùng:' },
      { type: 'steps', items: [
        { t: 'Nút chính, màu nổi bật', d: 'Lời đề nghị rủi ro thấp. Đây là lối cho đa số.' },
        { t: 'Nút phụ, viền mảnh', d: 'Gọi ngay hoặc đặt lịch. Lối cho người đã quyết định.' },
        { t: 'Một đường dẫn tiếp nối', d: 'Sau khi khách nhận kết quả bài kiểm tra, mời họ bước lên bậc cao hơn. Lúc này họ đã có lý do.' }
      ]},

      { type: 'h2', text: 'Cách đo trong hai tuần' },
      { type: 'p', text: 'Đừng đánh giá bằng số lượt bấm. Hãy theo dõi ba con số cùng lúc: tổng số khách tiềm năng, tỉ lệ đủ điều kiện, và số cuộc hẹn thật sự diễn ra. Lời đề nghị nhẹ hơn sẽ luôn làm con số đầu tăng; nó chỉ thật sự thắng khi con số thứ ba cũng tăng.' },

      { type: 'cta', text: 'Bài chẩn đoán của Aurix chính là một lời đề nghị bậc hai. Bạn có thể xem nó như một ví dụ sống để tham khảo.' }
    ]
  },

  {
    slug: 'kich-ban-tu-van-zalo',
    title: 'Kịch bản nhắn tin biến người hỏi giá thành người đặt lịch',
    seoTitle: 'Kịch bản tư vấn Zalo và tin nhắn cho doanh nghiệp dịch vụ',
    excerpt: 'Khách nhắn "giá bao nhiêu". Câu trả lời của bạn trong ba mươi giây tiếp theo quyết định họ đặt lịch hay biến mất.',
    seoDesc: 'Kịch bản trả lời tin nhắn khách hàng qua Zalo và mạng xã hội: cách xử lý câu hỏi về giá, bốn bước dẫn tới đặt lịch và những câu nên tránh.',
    date: '2026-10-21',
    updated: '2026-10-21',
    readMinutes: 7,
    topic: 'Chuyển đổi',
    layer: 'X',
    level: 'Thực hành',
    related: ['sieu-chuyen-doi', 'phu-song-da-kenh'],
    body: [
      { type: 'p', text: 'Ở ngành dịch vụ Việt Nam, phần lớn cuộc trò chuyện bán hàng bắt đầu bằng ba chữ: "giá bao nhiêu". Và phần lớn cuộc trò chuyện kết thúc ngay sau khi bạn trả lời đúng ba chữ đó bằng một con số.' },

      { type: 'h2', text: 'Vì sao trả lời thẳng con số lại hỏng' },
      { type: 'p', text: 'Không phải vì giá cao. Mà vì một con số đứng một mình không có gì để so sánh. Khách nhận con số, không biết nó đắt hay rẻ, nên làm việc duy nhất họ có thể làm: đi hỏi chỗ khác. Bạn vừa biến mình thành một dòng trong bảng so giá.' },
      { type: 'p', text: 'Nhưng né tránh còn tệ hơn. Câu "anh chị để lại số em tư vấn ạ" là cách nhanh nhất để mất khách, vì nó nói rằng bạn đang giấu gì đó.' },

      { type: 'h2', text: 'Cấu trúc bốn bước' },
      { type: 'steps', items: [
        { t: 'Trả lời khoảng giá thật, ngay lập tức', d: '"Dạ khoảng từ 8 tới 15 triệu tuỳ tình trạng ạ." Có con số là có sự tin cậy. Khoảng giá giữ được sự linh hoạt mà vẫn thành thật.' },
        { t: 'Giải thích điều gì quyết định khách rơi vào đâu', d: '"Chênh lệch chủ yếu do số lượng và tình trạng hiện tại ạ." Câu này biến con số thành thông tin, và cho khách lý do để nói tiếp.' },
        { t: 'Hỏi một câu duy nhất', d: '"Tình trạng hiện tại của mình thế nào ạ, chị gửi em xem thử được không?" Một câu, không phải ba. Mỗi câu hỏi thêm là một cơ hội để khách dừng.' },
        { t: 'Đề nghị bước tiếp theo cụ thể, có thời gian', d: '"Chiều nay 4 giờ hoặc sáng mai 9 giờ em giữ chỗ cho mình nhé?" Hai lựa chọn cụ thể dễ trả lời hơn một câu hỏi mở.' }
      ]},

      { type: 'h2', text: 'Những câu nên bỏ khỏi từ điển' },
      { type: 'table', head: ['Câu hay dùng', 'Vấn đề', 'Thay bằng'], rows: [
        ['Inbox em tư vấn ạ', 'Khách đang inbox rồi', 'Trả lời thẳng khoảng giá'],
        ['Bên em tốt nhất thị trường', 'Không kiểm chứng được', 'Một con số hoặc một ca cụ thể'],
        ['Chị cho em xin số điện thoại', 'Đòi trước khi cho', 'Hỏi về tình trạng của khách trước'],
        ['Dạ vâng ạ', 'Kết thúc hội thoại', 'Luôn kết bằng một câu hỏi']
      ]},

      { type: 'note', tone: 'tip', text: 'Quy tắc đơn giản cho cả đội: mỗi tin nhắn bạn gửi đi phải kết thúc bằng một câu hỏi hoặc một lựa chọn. Hội thoại chết ở chính tin nhắn không có gì để trả lời.' },

      { type: 'h2', text: 'Đo bằng gì' },
      { type: 'list', items: [
        'Tỉ lệ hội thoại có từ bốn lượt trao đổi trở lên. Đây là chỉ báo sớm nhất cho thấy kịch bản có hiệu quả.',
        'Tỉ lệ hội thoại dẫn tới một cuộc hẹn có ngày giờ cụ thể.',
        'Thời gian phản hồi tin nhắn đầu tiên, tính theo phút.'
      ]},

      { type: 'cta', text: 'Nếu mỗi tư vấn viên đang trả lời theo một kiểu, đó không phải vấn đề con người mà là vấn đề hệ thống.' }
    ]
  },

  {
    slug: 'dat-lich-online',
    title: 'Đặt lịch trực tuyến: nơi mất khách mà không ai đếm',
    seoTitle: 'Tối ưu quy trình đặt lịch trực tuyến cho ngành dịch vụ',
    excerpt: 'Khách đã muốn đến, đã bấm vào đặt lịch, rồi bỏ giữa chừng. Chỗ rò này không xuất hiện trên báo cáo nào cả, nhưng thường chiếm một phần ba số cuộc hẹn lẽ ra đã có.',
    seoDesc: 'Những lỗi phổ biến trong quy trình đặt lịch trực tuyến của doanh nghiệp dịch vụ và cách sửa để giảm tỉ lệ bỏ giữa chừng cùng tỉ lệ vắng mặt.',
    date: '2026-10-28',
    updated: '2026-10-28',
    readMinutes: 6,
    topic: 'Chuyển đổi',
    layer: 'I',
    level: 'Thực hành',
    related: ['sieu-chuyen-doi', 'web-ca-nhan-hoa'],
    body: [
      { type: 'p', text: 'Có một loại khách hàng đáng tiếc hơn mọi loại khác: người đã quyết định đến, đã bấm nút đặt lịch, rồi bỏ dở ở bước thứ ba. Bạn đã trả tiền để thuyết phục họ, và mất họ vì một giao diện.' },

      { type: 'h2', text: 'Năm chỗ khách hay bỏ dở' },
      { type: 'table', head: ['Chỗ bỏ dở', 'Nguyên nhân thật', 'Cách sửa'], rows: [
        ['Bước chọn dịch vụ', 'Danh sách hai mươi mục, khách không biết mình thuộc mục nào', 'Gom thành 3 – 5 nhóm, mô tả theo nhu cầu chứ không theo tên kỹ thuật'],
        ['Bước chọn giờ', 'Chỉ còn khung giờ hành chính', 'Mở thêm khung tối và cuối tuần, dù chỉ vài chỗ'],
        ['Bước điền thông tin', 'Bắt tạo tài khoản', 'Cho đặt lịch không cần tài khoản'],
        ['Bước xác nhận', 'Không biết có thành công hay chưa', 'Màn hình xác nhận rõ ràng kèm tin nhắn trong 30 giây'],
        ['Sau khi đặt', 'Quên mất cuộc hẹn', 'Nhắc trước 24 giờ và trước 2 giờ']
      ]},

      { type: 'h2', text: 'Quy tắc ba lần chạm' },
      { type: 'p', text: 'Từ lúc bấm nút đặt lịch tới lúc xong, khách không nên phải chạm quá ba lần trên điện thoại: chọn dịch vụ, chọn giờ, xác nhận tên và số. Mọi thứ khác nên hỏi sau, hoặc hỏi lúc khách tới.' },

      { type: 'h2', text: 'Vấn đề vắng mặt' },
      { type: 'p', text: 'Đặt lịch dễ thì tỉ lệ vắng mặt tăng, đó là đánh đổi có thật. Nhưng đừng giải quyết bằng cách làm việc đặt lịch khó hơn. Ba cách rẻ hơn:' },
      { type: 'list', items: [
        'Tin nhắn nhắc trước hai giờ, có nút xác nhận hoặc đổi lịch chỉ bằng một lần chạm. Đây là biện pháp hiệu quả nhất.',
        'Cho phép đổi lịch dễ dàng. Người đổi lịch vẫn là khách; người ngại đổi lịch sẽ im lặng bỏ.',
        'Với dịch vụ giá trị cao, đặt cọc một khoản nhỏ có thể hoàn lại. Chỉ nên dùng khi giá trị đủ lớn để chịu được phần khách rơi rụng.'
      ]},

      { type: 'note', tone: 'tip', text: 'Hãy tự đặt lịch trên chính hệ thống của mình, bằng điện thoại, dùng mạng 4G, vào lúc chín giờ tối. Đa số chủ doanh nghiệp chưa từng làm việc này, và đa số phát hiện ít nhất hai lỗi trong năm phút.' },

      { type: 'faq', items: [
        { q: 'Nên dùng phần mềm đặt lịch có sẵn hay tự làm?', a: 'Dùng phần mềm có sẵn cho tới khi nó cản trở việc bạn muốn làm — chẳng hạn không gắn được mã nguồn hoặc không đẩy được dữ liệu về hệ thống của bạn. Lúc đó mới tính chuyện làm riêng.' },
        { q: 'Có nên hiển thị luôn lịch trống trên trang chủ không?', a: 'Có, và đây là một trong những thay đổi cho kết quả nhanh nhất. Nhìn thấy khung giờ cụ thể khiến việc đặt lịch trở nên có thật thay vì là một ý định.' }
      ]},

      { type: 'cta', text: 'Mỗi cuộc hẹn mất ở khâu này đều đã được trả tiền đầy đủ ở khâu trước.' }
    ]
  }
];
