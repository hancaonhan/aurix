import { questions, LAYERS } from '../../site/data/diagnostic.js';
import { industryByKey } from '../../site/data/content.js';

const qById = Object.fromEntries(questions.map(q => [q.id, q]));

/**
 * Phần doanh thu có thể phục hồi ứng với mỗi tầng khi tầng đó ở mức 0 điểm.
 * Tổng tối đa 26% doanh thu — giữ ước tính ở mức bảo thủ, có thể bảo vệ được
 * trước ban điều hành. Một con số phóng đại sẽ phản tác dụng.
 */
const RECOVERABLE = { adapt: 0.035, unify: 0.05, reach: 0.05, ignite: 0.06, xpand: 0.065 };

/** Trần an toàn mặc định: không bao giờ báo thất thoát quá 22% doanh thu.
 *  Có thể chỉnh trong bảng điều khiển (tham số diagnostic.leakCapPercent). */
const LEAK_CAP = 0.22;

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

/**
 * Chấm điểm một bộ câu trả lời.
 * @param {Record<string,string|number>} answers  { questionId: optionValue }
 * @returns {{ overall:number, tier:object, layers:Array, leak:object, recommendations:Array, industry:string|null }}
 */
export function scoreDiagnostic(answers = {}, { leakCapPercent } = {}) {
  const leakCap = Number.isFinite(Number(leakCapPercent)) ? Number(leakCapPercent) / 100 : LEAK_CAP;
  // Điểm từng tầng
  const acc = {};
  for (const key of Object.keys(LAYERS)) acc[key] = { sum: 0, weight: 0 };

  for (const q of questions) {
    if (q.type === 'context') continue;
    const raw = answers[q.id];
    const opt = q.options.find(o => String(o.v) === String(raw));
    if (!opt) continue;                       // chưa trả lời → không tính
    const w = q.weight ?? 1;
    acc[q.layer].sum += opt.score * w;
    acc[q.layer].weight += w;
  }

  const layers = Object.entries(LAYERS).map(([key, meta]) => {
    const a = acc[key];
    const score = a.weight ? Math.round((a.sum / a.weight) * 100) : 50;
    return {
      key,
      letter: meta.letter,
      name: meta.name,
      service: meta.service,
      score,
      state: score < 45 ? 'weak' : score < 72 ? 'mid' : 'good'
    };
  });

  // Điểm tổng — trung bình có trọng số, tầng yếu bị phạt thêm
  const avg = layers.reduce((s, l) => s + l.score, 0) / layers.length;
  const weakest = Math.min(...layers.map(l => l.score));
  const overall = clamp(Math.round(avg * 0.78 + weakest * 0.22), 0, 100);

  // Ước tính thất thoát mỗi tháng (đơn vị: triệu đồng)
  const revenue = Number(answers.revenue) || 0;
  let leakM = 0;
  for (const l of layers) {
    const gap = (100 - l.score) / 100;
    leakM += revenue * RECOVERABLE[l.key] * gap;
  }
  leakM = Math.round(Math.min(leakM, revenue * leakCap));

  // Khuyến nghị: hai tầng yếu nhất
  const ranked = [...layers].sort((a, b) => a.score - b.score);
  const recommendations = ranked.slice(0, 3).map((l, i) => ({
    priority: i + 1,
    layer: l.key,
    letter: l.letter,
    title: RECS[l.key].title,
    body: RECS[l.key].body,
    service: l.service,
    serviceName: RECS[l.key].serviceName
  }));

  const tier = tierFor(overall);
  const industryKey = typeof answers.industry === 'string' ? answers.industry : null;
  const industry = industryKey && industryByKey[industryKey] ? industryByKey[industryKey] : null;

  return {
    overall,
    tier,
    layers,
    leak: {
      monthlyMillions: leakM,
      yearlyMillions: leakM * 12,
      revenueMillions: revenue,
      display: formatVnd(leakM),
      yearlyDisplay: formatVnd(leakM * 12)
    },
    recommendations,
    industry: industryKey,
    industryLabel: industry ? industry.label : null,
    answeredCount: questions.filter(q => q.type !== 'context' && answers[q.id] !== undefined).length
  };
}

function tierFor(score) {
  if (score >= 80) return {
    key: 'strong',
    label: 'Hệ thống vững',
    headline: 'Nền tảng của bạn đã tốt. Việc còn lại là nhân bản.',
    body: 'Bạn đã có phần lớn những gì một hệ thống tăng trưởng cần. Giá trị lớn nhất lúc này nằm ở tối ưu liên tục và nhân bản những gì đang thắng sang kênh mới, chi nhánh mới.'
  };
  if (score >= 60) return {
    key: 'solid',
    label: 'Có nền, còn rò rỉ',
    headline: 'Hệ thống chạy được, nhưng đang để tiền chảy ra ở vài mắt xích.',
    body: 'Bạn không cần xây lại từ đầu. Hai tới ba tầng yếu nhất đang kéo toàn bộ hiệu suất xuống, và đó chính là nơi có tỉ suất hoàn vốn cao nhất trong sáu tháng tới.'
  };
  if (score >= 38) return {
    key: 'leaky',
    label: 'Rò rỉ đáng kể',
    headline: 'Bạn đang mua khách hàng đắt hơn mức cần thiết.',
    body: 'Các mắt xích của bạn đang hoạt động rời rạc. Phần lớn ngân sách marketing bị hao hụt trước khi chạm tới doanh thu. Cần xử lý theo thứ tự ưu tiên, không nên làm dàn trải.'
  };
  return {
    key: 'critical',
    label: 'Cần xây lại nền',
    headline: 'Vấn đề không nằm ở ngân sách. Nằm ở hệ thống.',
    body: 'Ở trạng thái này, tăng chi phí quảng cáo sẽ làm thất thoát lớn hơn chứ không tạo thêm doanh thu. Ưu tiên tuyệt đối là dựng nền đo lường và sửa tầng chốt sale trước khi mở rộng.'
  };
}

const RECS = {
  adapt: {
    title: 'Cá nhân hoá trải nghiệm trên website',
    serviceName: 'Web Cá nhân hoá',
    body: 'Website đang nói một câu chung cho mọi nhóm khách. Bắt đầu bằng việc tách ba nhóm khách sinh ra phần lớn doanh thu, rồi làm riêng tiêu đề, bằng chứng và lời kêu gọi cho từng nhóm.'
  },
  unify: {
    title: 'Dựng nền đo lường và hợp nhất dữ liệu',
    serviceName: 'Xây hệ thống Marketing',
    body: 'Chừng nào chưa nối được chi phí với doanh thu thật, mọi quyết định ngân sách đều là phỏng đoán. Đây là việc phải làm trước, vì mọi tối ưu khác đều dựa vào nó.'
  },
  reach: {
    title: 'Tái phân bổ ngân sách theo doanh thu thật',
    serviceName: 'Xây hệ thống Marketing',
    body: 'Chi phí mỗi khách hàng đang tăng vì ngân sách vẫn chảy vào nhóm đối tượng không sinh ra đơn. Khi dữ liệu chuyển đổi được đẩy ngược về nền tảng quảng cáo, chi phí thường giảm rõ trong sáu tới tám tuần.'
  },
  ignite: {
    title: 'Thiết kế lại offer và trang đích',
    serviceName: 'Landing Page',
    body: 'Trang đích đang không trả lời đúng những lý do khiến khách từ chối. Sửa lời đề nghị và cấu trúc thuyết phục thường cho kết quả nhanh nhất, trong vòng ba tới bốn tuần.'
  },
  xpand: {
    title: 'Siết tốc độ phản hồi và tối ưu chốt sale',
    serviceName: 'Siêu chuyển đổi',
    body: 'Điểm rò rỉ đắt nhất của bạn nằm sau khi khách để lại thông tin. Rút thời gian phản hồi xuống dưới năm phút và chuẩn hoá kịch bản tư vấn thường là thay đổi sinh lời nhanh nhất, gần như không tốn chi phí.'
  }
};

function formatVnd(millions) {
  if (!millions || millions < 1) return 'chưa đủ dữ liệu';
  if (millions >= 1000) {
    const ty = millions / 1000;
    return `${ty.toFixed(ty >= 10 ? 0 : 1).replace('.', ',')} tỉ đồng`;
  }
  return `${Math.round(millions)} triệu đồng`;
}

export { qById };
