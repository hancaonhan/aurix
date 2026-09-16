import { overlay } from '../lib/overlay.js';
const RAW_services = [
  {
    slug: 'web-ca-nhan-hoa',
    layer: 'A',
    kicker: 'Tầng ATTRACT',
    name: 'Web Cá nhân hoá',
    tagline: 'Website mang đúng bản sắc của bạn — và giữ người ta ở lại.',
    seoTitle: 'Thiết kế Web cá nhân hoá theo bản sắc thương hiệu',
    seoDesc: 'Aurix thiết kế website riêng theo bản sắc từng thương hiệu, không dùng mẫu có sẵn. Khách ở lại lâu hơn, nhớ lâu hơn và tin trước khi bạn kịp bán.',
    icon: 'attract',
    image: '/assets/aurix-difference.webp',
    imageAlt: 'Bộ nhận diện và giao diện website riêng do Aurix thiết kế cho thương hiệu',
    problem: {
      title: 'Website của bạn trông giống hệt đối thủ',
      points: [
        'Cùng một bố cục mẫu, cùng kho ảnh, cùng những câu chữ ai cũng viết. Che logo đi thì không ai phân biệt được.',
        'Khách vào, lướt vài giây, không thấy gì đáng nhớ, rồi thoát. Bạn trả tiền quảng cáo để đưa họ tới một nơi không giữ được họ.',
        'Thương hiệu bạn mất nhiều năm xây, nhưng nơi khách gặp bạn đầu tiên lại không kể được câu chuyện đó.'
      ]
    },
    solution: {
      title: 'Bản sắc riêng, dựng thành một trải nghiệm có chủ đích',
      desc: 'Aurix không bắt đầu từ một mẫu có sẵn rồi thay màu. Chúng tôi bắt đầu từ chính thứ làm nên thương hiệu bạn — cách bạn phục vụ, kiểu khách bạn muốn, điều bạn làm tốt hơn người khác — rồi dựng toàn bộ hệ thống thị giác và nhịp trải nghiệm quanh đó.',
      pillars: [
        { title: 'Tìm ra bản sắc thật', desc: 'Phỏng vấn ban điều hành và khách hàng trung thành để tìm điều khiến họ chọn bạn thay vì người khác. Đó mới là thứ đáng đem lên website.' },
        { title: 'Hệ thống thị giác riêng', desc: 'Bảng màu, chữ, ảnh, chuyển động và ngôn ngữ đồ hoạ được dựng riêng. Che logo đi vẫn nhận ra là bạn.' },
        { title: 'Nhịp giữ chân', desc: 'Mỗi màn cuộn có một lý do để người ta cuộn tiếp. Bố cục, chuyển động và bằng chứng được xếp theo đúng nhịp một người lạ dần tin bạn.' },
        { title: 'Nhanh và bền', desc: 'Đẹp mà chậm là mất khách. Trang đạt Core Web Vitals xanh, đọc tốt trên điện thoại, và đội của bạn tự cập nhật được nội dung.' }
      ]
    },
    deliverables: [
      'Nghiên cứu định vị và phỏng vấn ban điều hành',
      'Định hướng sáng tạo và hệ thống thị giác riêng cho thương hiệu',
      'Thiết kế toàn bộ giao diện, không dùng mẫu có sẵn',
      'Viết nội dung theo giọng nói riêng của thương hiệu',
      'Bộ ảnh và đồ hoạ định hướng cho website',
      'Dựng trang tốc độ cao, chuẩn SEO kỹ thuật, Core Web Vitals xanh',
      'Hệ thống quản trị nội dung để đội của bạn tự cập nhật',
      'Bộ quy chuẩn thương hiệu số để dùng tiếp cho mọi kênh khác'
    ],
    outcomes: [
      { value: '+180%', label: 'Thời gian ở lại trang' },
      { value: '−38%', label: 'Tỉ lệ thoát trang chủ' },
      { value: '+96%', label: 'Tỉ lệ để lại thông tin' }
    ],
    faq: [
      { q: 'Khác gì với thiết kế website thông thường?', a: 'Phần lớn đơn vị bắt đầu bằng một giao diện mẫu rồi thay logo và màu. Aurix bắt đầu bằng nghiên cứu định vị, rồi mới dựng hệ thống thị giác riêng. Kết quả là một website chỉ hợp với bạn, đối thủ không sao chép được bằng cách mua cùng một mẫu.' },
      { q: 'Bao lâu thì hoàn thành?', a: 'Thông thường sáu tới tám tuần: hai tuần nghiên cứu và định hướng sáng tạo, ba tới bốn tuần thiết kế và nội dung, một tới hai tuần dựng và kiểm thử.' },
      { q: 'Website có ảnh hưởng tới thứ hạng tìm kiếm không?', a: 'Có, theo hướng tốt. Aurix dựng trang tĩnh tốc độ cao, có dữ liệu có cấu trúc đầy đủ và Core Web Vitals xanh. Đây đều là những yếu tố Google dùng để xếp hạng.' },
      { q: 'Sau khi bàn giao chúng tôi có tự sửa được không?', a: 'Được. Aurix bàn giao hệ thống quản trị nội dung cùng bộ quy chuẩn thương hiệu số, kèm buổi đào tạo cho đội nội bộ. Mã nguồn và tên miền thuộc quyền sở hữu của bạn.' }
    ]
  },
  {
    slug: 'he-thong-marketing',
    layer: 'U',
    kicker: 'Tầng UNIFY',
    name: 'Xây hệ thống Marketing',
    tagline: 'Ngừng mua lượt click. Bắt đầu vận hành một cỗ máy.',
    seoTitle: 'Xây hệ thống Marketing tổng thể',
    seoDesc: 'Aurix hợp nhất website, quảng cáo, nội dung, CRM và doanh thu thành một hệ thống đo được. Mỗi đồng ngân sách truy vết tới từng đơn hàng.',
    icon: 'unify',
    image: '/assets/aurix-giap-phap-marketing-dich-vu.webp',
    imageAlt: 'Sơ đồ giải pháp marketing tổng thể cho ngành dịch vụ của Aurix',
    problem: {
      title: 'Mỗi bộ phận có một con số, không ai có sự thật',
      points: [
        'Quảng cáo báo ba trăm khách tiềm năng. Sales nói chỉ nhận được tám mươi. Kế toán thấy mười hai đơn.',
        'Không ai trả lời được kênh nào thực sự sinh ra doanh thu, nên ngân sách chia theo cảm tính.',
        'Khách để lại số lúc chín giờ tối, mười giờ sáng hôm sau mới có người gọi. Đối thủ đã gọi trước.'
      ]
    },
    solution: {
      title: 'Một guồng máy, một nguồn sự thật',
      desc: 'Aurix dựng toàn bộ đường đi của một khách hàng từ lần chạm đầu tiên tới đồng doanh thu cuối cùng, rồi gắn đo lường vào từng mắt xích. Khi hệ thống chạy, bạn không còn tranh luận bằng cảm giác.',
      pillars: [
        { title: 'Bản đồ phễu và điểm rò rỉ', desc: 'Vẽ toàn bộ hành trình, đo từng bước, chỉ đúng chỗ đang mất tiền.' },
        { title: 'Hạ tầng dữ liệu', desc: 'Gắn thẻ chuẩn hoá, đo phía máy chủ, nối quảng cáo với CRM và doanh thu thật.' },
        { title: 'Tự động hoá chăm sóc', desc: 'Khách để lại thông tin là được phản hồi trong vài giây, được nuôi dưỡng theo kịch bản tới lúc sẵn sàng mua.' },
        { title: 'Nhịp vận hành', desc: 'Báo cáo tuần, họp tối ưu hai tuần một lần, bảng điều khiển thời gian thực cho ban giám đốc.' }
      ]
    },
    deliverables: [
      'Kiểm toán toàn hệ thống marketing hiện tại',
      'Bản đồ phễu và bảng điểm rò rỉ theo từng tầng',
      'Thiết lập đo lường phía máy chủ và chuẩn hoá sự kiện',
      'Kết nối quảng cáo, website, CRM và dữ liệu doanh thu',
      'Kịch bản tự động hoá chăm sóc và phản hồi tức thì',
      'Bảng điều khiển doanh thu theo kênh, thời gian thực',
      'Bộ quy trình và tài liệu vận hành cho đội nội bộ',
      'Đào tạo chuyển giao cho đội marketing và đội bán hàng'
    ],
    outcomes: [
      { value: '98%', label: 'Dữ liệu khớp doanh thu thật' },
      { value: '−42%', label: 'Chi phí mỗi khách hàng' },
      { value: 'dưới 60s', label: 'Thời gian phản hồi khách mới' }
    ],
    faq: [
      { q: 'Doanh nghiệp chúng tôi chưa có CRM thì sao?', a: 'Aurix sẽ chọn và triển khai CRM phù hợp quy mô của bạn, hoặc dựng một lớp quản lý khách tiềm năng gọn nhẹ nếu bạn chưa cần một CRM đầy đủ. Điều quan trọng là dữ liệu có một chỗ để ở.' },
      { q: 'Bao lâu thì hệ thống chạy ổn định?', a: 'Kiểm toán và thiết kế mất ba tới bốn tuần. Triển khai và chuẩn hoá dữ liệu thêm sáu tới tám tuần. Từ tháng thứ ba trở đi hệ thống bước vào nhịp tối ưu liên tục.' },
      { q: 'Aurix có thay thế đội marketing của chúng tôi không?', a: 'Không. Aurix xây hệ thống và huấn luyện đội của bạn vận hành nó. Mục tiêu là bạn không phụ thuộc vào chúng tôi để chạy hằng ngày.' }
    ]
  },
  {
    slug: 'phu-song-da-kenh',
    layer: 'R',
    kicker: 'Tầng REACH',
    name: 'Phủ sóng đa kênh',
    tagline: 'Đúng người, đúng lúc, đúng giá. Không mua lượt xem.',
    seoTitle: 'Phủ sóng đa kênh — Nội dung, quảng cáo và SEO',
    seoDesc: 'Aurix đưa thương hiệu của bạn đến đúng nhóm khách sẵn sàng chi trả, qua nội dung, quảng cáo và tìm kiếm, vận hành dưới một thông điệp và một thước đo duy nhất.',
    icon: 'reach',
    image: '/assets/aurix-marketing-funnel.png',
    imageAlt: 'Sơ đồ phủ sóng đa kênh của Aurix cho thương hiệu dịch vụ',
    problem: {
      title: 'Bạn đang mua lượt xem, không phải mua khách hàng',
      points: [
        'Ngân sách chảy về nơi đông người nhất, chứ không phải nơi có người sẵn sàng trả tiền cho bạn.',
        'Nội dung được sản xuất để lấp đầy lịch đăng bài, không dẫn người xem đi đâu cả.',
        'Mỗi kênh do một người phụ trách, nói một giọng khác nhau. Khách gặp thương hiệu ba lần và tưởng là ba doanh nghiệp.'
      ]
    },
    solution: {
      title: 'Một thông điệp, nhiều kênh, một thước đo',
      desc: 'Aurix chỉ mở kênh sau khi bạn đã có bản sắc để thể hiện và hệ thống để đo. Khi đó mỗi đồng chi ra đều truy vết được, và mỗi kênh đều khuếch đại kênh còn lại thay vì cạnh tranh ngân sách với nhau.',
      pillars: [
        { title: 'Chọn kênh theo khách, không theo trào lưu', desc: 'Chúng tôi tìm nơi nhóm khách giá trị cao của bạn thật sự dành thời gian, rồi dồn lực vào hai tới ba kênh đó thay vì rải mỏng khắp nơi.' },
        { title: 'Một trục nội dung, nhiều định dạng', desc: 'Mỗi quý có một thông điệp trung tâm. Từ đó nhân ra bài dài, video ngắn, bài quảng cáo và nội dung tìm kiếm — cùng một câu chuyện, kể theo cách phù hợp từng nơi.' },
        { title: 'Mua traffic bằng dữ liệu doanh thu', desc: 'Dữ liệu chuyển đổi thật được đẩy ngược về nền tảng quảng cáo, để hệ thống học cách tìm người giống khách hàng đã trả tiền, chứ không phải người hay bấm.' },
        { title: 'Nhịp sản xuất đều đặn', desc: 'Lịch nội dung theo quý, kiểm duyệt theo tuần, báo cáo hiệu quả theo kênh. Không phụ thuộc vào cảm hứng của ai.' }
      ]
    },
    deliverables: [
      'Nghiên cứu nơi nhóm khách mục tiêu thật sự tiêu thụ nội dung',
      'Chiến lược kênh và phân bổ ngân sách theo giá trị từng nhóm',
      'Trục thông điệp theo quý và lịch nội dung chi tiết',
      'Sản xuất nội dung: bài viết, hình ảnh, video ngắn',
      'Thiết lập và vận hành quảng cáo trên các kênh đã chọn',
      'Tối ưu tìm kiếm: từ khoá, nội dung và SEO kỹ thuật',
      'Đẩy dữ liệu chuyển đổi ngược về nền tảng quảng cáo',
      'Báo cáo hiệu quả theo kênh, quy về doanh thu thật'
    ],
    outcomes: [
      { value: 'x3,4', label: 'Khách tiềm năng đủ điều kiện' },
      { value: '−36%', label: 'Chi phí mỗi khách tiềm năng' },
      { value: '2 – 3', label: 'Kênh trọng điểm thay vì rải mỏng' }
    ],
    faq: [
      { q: 'Aurix có nhận chạy quảng cáo riêng lẻ không?', a: 'Không. Chúng tôi chỉ mở kênh khi bạn đã có nơi xứng đáng để đưa khách tới và đã có hệ thống đo lường. Đổ traffic vào một phễu đang rò rỉ chỉ làm bạn mất tiền nhanh hơn, và chúng tôi không muốn bán cho bạn điều đó.' },
      { q: 'Chúng tôi nên bắt đầu với bao nhiêu ngân sách?', a: 'Tuỳ ngành và giá trị đơn hàng trung bình. Aurix sẽ tính ngược từ mục tiêu doanh thu và chi phí mỗi khách hàng hiện tại của bạn để ra con số tối thiểu có ý nghĩa, thay vì đưa một mức chung cho mọi người.' },
      { q: 'Bao lâu thì thấy hiệu quả?', a: 'Quảng cáo tìm kiếm thường cho tín hiệu trong hai tới ba tuần. Nội dung và tối ưu tìm kiếm cần ba tới sáu tháng để tích luỹ, nhưng đó cũng là phần tạo ra lợi thế bền nhất vì đối thủ không mua lại được bằng tiền.' },
      { q: 'Đội nội bộ của chúng tôi có tham gia được không?', a: 'Rất nên. Aurix thường vận hành cùng đội của bạn trong hai quý đầu, rồi chuyển giao dần phần sản xuất nội dung để bạn chủ động về chi phí dài hạn.' }
    ]
  },
  {
    slug: 'landing-page',
    layer: 'I',
    kicker: 'Tầng IGNITE',
    name: 'Landing Page',
    tagline: 'Trang đích được thiết kế để chốt, không phải để đẹp.',
    seoTitle: 'Thiết kế Landing Page chuyển đổi cao',
    seoDesc: 'Aurix thiết kế landing page dựa trên cấu trúc thuyết phục, bằng chứng niềm tin và dữ liệu chuyển đổi thật. Mỗi trang đều đo được.',
    icon: 'ignite',
    image: '/assets/projects/lavie-spa-aurix.webp',
    imageAlt: 'Bộ nhận diện và landing page Lavie Spa do Aurix thiết kế',
    problem: {
      title: 'Trang đẹp nhưng không ai để lại số điện thoại',
      points: [
        'Ngân sách quảng cáo đổ về một trang không trả lời được câu hỏi lớn nhất trong đầu khách.',
        'Form dài mười trường trong khi khách mới chỉ tò mò.',
        'Không có bằng chứng nào đủ mạnh để một người lạ tin trong bốn mươi giây.'
      ]
    },
    solution: {
      title: 'Mỗi khối trên trang trả lời một lý do từ chối',
      desc: 'Aurix không bắt đầu bằng Figma. Chúng tôi bắt đầu bằng danh sách lý do khách hàng của bạn nói không, xếp theo tần suất, rồi thiết kế từng khối để triệt tiêu từng lý do theo đúng thứ tự khách nghĩ tới.',
      pillars: [
        { title: 'Bản đồ phản đối', desc: 'Phỏng vấn sales, đọc hội thoại chốt hỏng, gom lý do từ chối thật thành cấu trúc trang.' },
        { title: 'Offer đáng để đánh đổi', desc: 'Thiết kế lời đề nghị đủ cụ thể và đủ rủi ro thấp để một người lạ dám bước bước đầu tiên.' },
        { title: 'Bằng chứng nhiều tầng', desc: 'Con số, ảnh trước sau, đánh giá có tên thật, giấy phép, bảo chứng. Niềm tin được xếp lớp chứ không dồn một chỗ.' },
        { title: 'Form ma sát thấp', desc: 'Hỏi ít nhất có thể ở bước đầu, hỏi sâu ở bước sau. Mỗi trường bị xoá là một phần trăm chuyển đổi được trả lại.' }
      ]
    },
    deliverables: [
      'Nghiên cứu phản đối và phỏng vấn đội bán hàng',
      'Thiết kế offer và cấu trúc thuyết phục',
      'Thiết kế giao diện riêng theo nhận diện thương hiệu',
      'Viết nội dung bán hàng trọn trang',
      'Dựng trang tốc độ cao, điểm Lighthouse trên 90',
      'Gắn đo lường đầy đủ tới từng nút và từng bước form',
      'Hai phiên bản thử nghiệm A/B cho khối tiêu đề và khối offer',
      'Bàn giao kèm hướng dẫn tự chỉnh sửa'
    ],
    outcomes: [
      { value: '+164%', label: 'Tỉ lệ điền form' },
      { value: '−41%', label: 'Chi phí mỗi khách tiềm năng' },
      { value: 'dưới 1,4s', label: 'Thời gian hiển thị nội dung chính' }
    ],
    faq: [
      { q: 'Bao lâu thì có trang chạy được?', a: 'Thông thường mười bốn ngày làm việc cho một landing page hoàn chỉnh, tính từ lúc chốt offer. Nếu cần gấp cho một đợt khai trương, Aurix có gói rút gọn bảy ngày.' },
      { q: 'Aurix có chạy quảng cáo luôn không?', a: 'Có, nếu bạn muốn. Nhưng chúng tôi cũng bàn giao trang cho đội quảng cáo hiện tại của bạn kèm toàn bộ cấu hình đo lường.' },
      { q: 'Nếu trang không đạt chỉ tiêu thì sao?', a: 'Hợp đồng của Aurix có chu kỳ tối ưu sau bàn giao. Trong ba mươi ngày đầu chúng tôi chịu trách nhiệm tinh chỉnh dựa trên dữ liệu thật, không tính thêm phí.' }
    ]
  },
  {
    slug: 'sieu-chuyen-doi',
    layer: 'X',
    kicker: 'Tầng XPAND',
    name: 'Siêu chuyển đổi',
    tagline: 'Cùng một lượng khách. Gấp đôi doanh thu.',
    seoTitle: 'Tối ưu Siêu chuyển đổi cho doanh nghiệp dịch vụ',
    seoDesc: 'Chương trình tối ưu chuyển đổi liên tục của Aurix: thử nghiệm có kỷ luật trên offer, trang đích và luồng tư vấn để nhân đôi doanh thu trên mỗi khách truy cập.',
    icon: 'xpand',
    image: '/assets/after-fitness.png',
    imageAlt: 'Kết quả tối ưu chuyển đổi cho khách hàng ngành fitness của Aurix',
    problem: {
      title: 'Cách đắt nhất để tăng doanh thu là mua thêm traffic',
      points: [
        'Mỗi phần trăm chuyển đổi tăng thêm là doanh thu gần như không tốn chi phí biến đổi.',
        'Nhưng hầu hết doanh nghiệp thử nghiệm theo cảm hứng, đổi màu nút, rồi kết luận sau ba ngày.',
        'Điểm rò rỉ lớn nhất thường không nằm ở website, mà nằm ở mười lăm phút sau khi khách để lại số.'
      ]
    },
    solution: {
      title: 'Thử nghiệm có kỷ luật, trên đúng điểm đắt tiền nhất',
      desc: 'Siêu chuyển đổi là một chương trình vận hành theo chu kỳ, không phải một lần chỉnh sửa. Mỗi chu kỳ Aurix chọn điểm rò rỉ đắt nhất, đưa ra giả thuyết, chạy thử nghiệm đủ mẫu, và chỉ giữ lại cái thắng có ý nghĩa thống kê.',
      pillars: [
        { title: 'Xếp hạng điểm rò rỉ', desc: 'Tính ra mỗi điểm rò rỉ đang lấy đi bao nhiêu tiền một tháng, rồi sửa từ đắt nhất xuống.' },
        { title: 'Thử nghiệm đủ mẫu', desc: 'Chạy tới ngưỡng có ý nghĩa thống kê. Không kết luận sớm, không tự lừa mình bằng dữ liệu nhiễu.' },
        { title: 'Tối ưu cả tầng con người', desc: 'Kịch bản tư vấn, tốc độ phản hồi, cách xử lý từ chối — thường là tầng sinh lời nhanh nhất.' },
        { title: 'Nhân bản cái thắng', desc: 'Mỗi phát hiện thắng được đưa sang chi nhánh khác, kênh khác, ngành gần kề.' }
      ]
    },
    deliverables: [
      'Phân tích định lượng và định tính toàn phễu',
      'Bảng xếp hạng điểm rò rỉ quy ra tiền mỗi tháng',
      'Lộ trình thử nghiệm theo quý, có ưu tiên rõ ràng',
      'Thiết kế và triển khai từng thử nghiệm',
      'Phân tích ghi hình phiên và bản đồ nhiệt',
      'Tối ưu kịch bản tư vấn và quy trình phản hồi',
      'Báo cáo kết quả và thư viện phát hiện tích luỹ',
      'Họp tối ưu hai tuần một lần cùng ban điều hành'
    ],
    outcomes: [
      { value: 'x2,3', label: 'Doanh thu mỗi khách truy cập' },
      { value: '+71%', label: 'Tỉ lệ khách tiềm năng thành khách hàng' },
      { value: '0đ', label: 'Ngân sách quảng cáo tăng thêm' }
    ],
    faq: [
      { q: 'Chúng tôi cần bao nhiêu traffic để thử nghiệm có ý nghĩa?', a: 'Với thử nghiệm A/B trên trang, khoảng một nghìn phiên mỗi biến thể mỗi tháng là đủ để có kết luận vững. Nếu lưu lượng thấp hơn, Aurix chuyển sang tối ưu định tính và tối ưu tầng tư vấn, nơi mẫu nhỏ vẫn cho kết quả rõ.' },
      { q: 'Chương trình kéo dài bao lâu?', a: 'Cam kết tối thiểu một quý, vì một chu kỳ thử nghiệm tử tế cần sáu tới tám tuần. Phần lớn khách hàng tiếp tục sang quý thứ hai sau khi thấy con số.' },
      { q: 'Aurix có cam kết chỉ tiêu không?', a: 'Chúng tôi cam kết số lượng thử nghiệm, chất lượng phân tích và nhịp làm việc. Cam kết một con số chuyển đổi cụ thể trước khi nhìn dữ liệu là điều không một đơn vị trung thực nào làm được.' }
    ]
  }
];

export const services = overlay('services', RAW_services, 'slug');

export const serviceBySlug = Object.fromEntries(services.map(s => [s.slug, s]));

export const RAW = { services: RAW_services };
