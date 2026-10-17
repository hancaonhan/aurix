/**
 * Gửi thư: mẫu nội dung, hàng đợi và tiến trình nền.
 *
 * Cấu hình bằng biến môi trường. Không đặt gì thì hệ thống chạy ở chế độ nháp:
 * thư vẫn vào hàng đợi và ghi ra màn hình, không mất dữ liệu, chỉ là không gửi đi.
 *
 *   AURIX_SMTP_HOST   ví dụ smtp.gmail.com
 *   AURIX_SMTP_PORT   587 (STARTTLS) hoặc 465 (TLS ngầm định)
 *   AURIX_SMTP_USER   tài khoản đăng nhập
 *   AURIX_SMTP_PASS   mật khẩu ứng dụng
 *   AURIX_MAIL_FROM   địa chỉ người gửi (mặc định lấy theo SMTP_USER)
 *   AURIX_MAIL_TO     nơi nhận thông báo khách mới (mặc định site.email)
 */
import { smtpSend } from './smtp.js';
import { queueMail, dueMail, markMailSent, markMailFailed } from './db.js';
import { site } from '../../site/data/site.js';
import { LAYERS } from '../../site/data/diagnostic.js';
import config from '../core/config.js';

/* Cấu hình lấy từ core/config.js — tên biến cũ (AURIX_SMTP_*) vẫn được chấp
   nhận để không phá các bản triển khai đang chạy. */
const CFG = {
  host: config.mail.host || process.env.AURIX_SMTP_HOST || '',
  port: config.mail.port || Number(process.env.AURIX_SMTP_PORT) || 587,
  user: config.mail.user || process.env.AURIX_SMTP_USER || '',
  pass: config.mail.pass || process.env.AURIX_SMTP_PASS || ''
};

export const MAIL_FROM = config.mail.from || CFG.user || site.email;
export const MAIL_TO = config.mail.salesInbox || process.env.AURIX_MAIL_TO || site.email;
export const mailEnabled = Boolean(CFG.host && CFG.user && CFG.pass);

const esc = (s = '') => String(s ?? '').replace(/[&<>"]/g, c => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]
));

/* ==========================================================================
   Khung thư — bảng lồng nhau và kiểu nội tuyến, vì phần lớn ứng dụng email
   không hiểu flexbox, grid hay biến CSS.
   ========================================================================== */
function shell(title, inner) {
  return `<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:#F5F7F6;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F7F6;padding:28px 12px;">
<tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFFFF;border:1px solid #DDE6E5;border-radius:16px;overflow:hidden;font-family:'Segoe UI',Arial,sans-serif;">
    <tr><td bgcolor="#045152" style="padding:24px 28px;background:#045152;background:linear-gradient(135deg,#046E72,#012B2B);">
      <span style="font-size:22px;font-weight:800;letter-spacing:.08em;color:#FFFFFF;">AURIX</span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#F27A1A;margin-left:4px;vertical-align:top;"></span>
      <span style="display:block;font-size:11px;letter-spacing:.06em;color:#B4D4D4;margin-top:6px;">${esc(site.brandLine)}</span>
    </td></tr>
    <tr><td style="padding:30px 28px;color:#10252A;font-size:15px;line-height:1.7;">
      ${inner}
    </td></tr>
    <tr><td style="padding:20px 28px;border-top:1px solid #ECF1F0;color:#66777C;font-size:12px;line-height:1.6;">
      ${esc(site.legalName)}<br>
      ${esc(site.address.street)}, ${esc(site.address.city)}<br>
      <a href="${site.phoneHref}" style="color:#C4560A;text-decoration:none;">${esc(site.phone)}</a> ·
      <a href="mailto:${esc(site.email)}" style="color:#C4560A;text-decoration:none;">${esc(site.email)}</a>
    </td></tr>
  </table>
</td></tr></table>
</body></html>`;
}

const btn = (href, label) =>
  `<a href="${esc(href)}" style="display:inline-block;background:#F27A1A;color:#FFFFFF;font-weight:700;font-size:15px;text-decoration:none;padding:14px 28px;border-radius:999px;">${esc(label)}</a>`;

const row = (k, v) => v
  ? `<tr><td style="padding:7px 0;color:#66777C;font-size:13px;width:150px;vertical-align:top;">${esc(k)}</td><td style="padding:7px 0;color:#10252A;font-size:14px;">${v}</td></tr>`
  : '';

/* ==========================================================================
   1. Thông báo nội bộ khi có khách mới
   ========================================================================== */
export async function queueLeadNotification(lead, id, { inbox } = {}) {
  const dx = lead.score != null
    ? `<tr><td style="padding:7px 0;color:#66777C;font-size:13px;">Điểm chẩn đoán</td><td style="padding:7px 0;"><b style="color:#C4560A;font-size:18px;">${lead.score}/100</b></td></tr>`
    : '';

  const inner = `
    <p style="margin:0 0 6px;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#C4560A;">Khách tiềm năng mới</p>
    <h1 style="margin:0 0 20px;font-size:24px;color:#10252A;">${esc(lead.name)}</h1>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      ${row('Điện thoại', `<a href="tel:${esc(lead.phone)}" style="color:#C4560A;text-decoration:none;font-weight:600;">${esc(lead.phone)}</a>`)}
      ${row('Email', `<a href="mailto:${esc(lead.email)}" style="color:#C4560A;text-decoration:none;">${esc(lead.email)}</a>`)}
      ${row('Doanh nghiệp', esc(lead.company))}
      ${row('Ngành', esc(lead.industry))}
      ${row('Quan tâm', esc(lead.service))}
      ${row('Nguồn', esc(lead.source))}
      ${row('Trang gửi', esc(lead.page))}
      ${dx}
    </table>
    ${lead.message ? `<div style="margin-top:20px;padding:16px 18px;background:#F5F7F6;border-left:3px solid #F27A1A;border-radius:6px;color:#46585D;font-size:14px;">${esc(lead.message)}</div>` : ''}
    <p style="margin:26px 0 0;padding-top:20px;border-top:1px solid #ECF1F0;color:#66777C;font-size:13px;">
      Hệ thống của chính bạn cam kết phản hồi dưới 60 giây. Đồng hồ bắt đầu chạy từ bây giờ.
    </p>
    <p style="margin:20px 0 0;">${btn(`tel:${lead.phone}`, 'Gọi ngay')}</p>`;

  const text = [
    `KHÁCH TIỀM NĂNG MỚI #${id}`, '',
    `Họ tên:       ${lead.name}`,
    `Điện thoại:   ${lead.phone}`,
    `Email:        ${lead.email}`,
    lead.company ? `Doanh nghiệp: ${lead.company}` : '',
    lead.industry ? `Ngành:        ${lead.industry}` : '',
    lead.service ? `Quan tâm:     ${lead.service}` : '',
    `Nguồn:        ${lead.source}`,
    lead.score != null ? `Điểm:         ${lead.score}/100` : '',
    lead.message ? `\nNội dung:\n${lead.message}` : ''
  ].filter(Boolean).join('\n');

  return await queueMail({
    kind: 'lead_notification',
    to: inbox || MAIL_TO,
    replyTo: lead.email,
    subject: `Khách mới: ${lead.name}${lead.company ? ` — ${lead.company}` : ''}`,
    html: shell('Khách tiềm năng mới', inner),
    text,
    leadId: id
  });
}

/* ==========================================================================
   Đặt lại mật khẩu bảng điều khiển
   `firstOwner`: tài khoản chủ sở hữu vừa được tạo, thư mời đặt mật khẩu lần đầu.
   ========================================================================== */
export async function queuePasswordReset(user, link, { minutes = 60, firstOwner = false } = {}) {
  const title = firstOwner ? 'Kích hoạt tài khoản quản trị' : 'Đặt lại mật khẩu';
  const inner = `
    <p style="margin:0 0 6px;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#C4560A;">Bảng điều khiển Aurix</p>
    <h1 style="margin:0 0 18px;font-size:24px;color:#10252A;">${esc(title)}</h1>
    <p style="margin:0 0 14px;">${firstOwner
      ? `Tài khoản chủ sở hữu <b>${esc(user.email)}</b> vừa được tạo cho website Aurix. Bấm nút bên dưới để đặt mật khẩu và đăng nhập lần đầu.`
      : `Có yêu cầu đặt lại mật khẩu cho tài khoản <b>${esc(user.email)}</b>. Bấm nút bên dưới để chọn mật khẩu mới.`}</p>
    <p style="margin:24px 0;">${btn(link, firstOwner ? 'Đặt mật khẩu' : 'Đặt lại mật khẩu')}</p>
    <p style="margin:0;color:#66777C;font-size:13px;">Link dùng được một lần và hết hạn sau ${minutes} phút.
      Nếu bạn không yêu cầu, hãy bỏ qua thư này — mật khẩu hiện tại vẫn giữ nguyên.</p>`;

  const text = [
    `${title.toUpperCase()} — BẢNG ĐIỀU KHIỂN AURIX`, '',
    `Tài khoản: ${user.email}`,
    `Mở link sau để ${firstOwner ? 'đặt mật khẩu' : 'đặt lại mật khẩu'} (hết hạn sau ${minutes} phút, dùng một lần):`,
    link, '',
    'Nếu bạn không yêu cầu, hãy bỏ qua thư này.'
  ].join('\n');

  return await queueMail({
    kind: 'password_reset',
    to: user.email,
    subject: `${title} — Bảng điều khiển Aurix`,
    html: shell(title, inner),
    text
  });
}

/* ==========================================================================
   2. Báo cáo chẩn đoán gửi cho khách
   ========================================================================== */
export async function queueDiagnosticReport(lead, id, result) {
  if (!result) return null;

  const bars = result.layers.map(l => {
    const color = l.state === 'weak' ? '#FF6B6B' : l.state === 'mid' ? '#F27A1A' : '#046E72';
    return `<tr>
      <td style="padding:9px 0;width:26px;color:#C4560A;font-size:17px;font-weight:700;">${l.letter}</td>
      <td style="padding:9px 0;color:#10252A;font-size:14px;">${esc(LAYERS[l.key]?.name || l.name)}</td>
      <td style="padding:9px 0;width:120px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#ECF1F0;border-radius:4px;">
          <tr><td style="height:6px;width:${l.score}%;background:${color};border-radius:4px;font-size:0;line-height:0;">&nbsp;</td><td style="font-size:0;line-height:0;">&nbsp;</td></tr>
        </table>
      </td>
      <td style="padding:9px 0 9px 12px;width:54px;text-align:right;color:#66777C;font-size:13px;">${l.score}/100</td>
    </tr>`;
  }).join('');

  const recs = result.recommendations.map(r => `
    <div style="margin-bottom:14px;padding:16px 18px;background:#F5F7F6;border-radius:10px;">
      <div style="color:#C4560A;font-size:15px;font-weight:700;margin-bottom:6px;">${r.priority}. ${esc(r.title)}</div>
      <div style="color:#46585D;font-size:14px;line-height:1.65;">${esc(r.body)}</div>
      <div style="margin-top:9px;"><a href="${site.origin}${r.service}" style="color:#C4560A;font-size:13px;text-decoration:none;">Dịch vụ liên quan: ${esc(r.serviceName)} →</a></div>
    </div>`).join('');

  const leak = result.leak.monthlyMillions > 0
    ? `<div style="margin:24px 0;padding:20px 22px;background:#FFF4EA;border:1px solid #F9C99B;border-radius:12px;">
         <div style="font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#C4560A;margin-bottom:8px;">Ước tính thất thoát mỗi tháng</div>
         <div style="font-size:30px;color:#C4560A;font-weight:700;">~ ${esc(result.leak.display)}</div>
         <div style="margin-top:8px;color:#66777C;font-size:13px;">Tương đương khoảng ${esc(result.leak.yearlyDisplay)} mỗi năm.</div>
       </div>`
    : '';

  const inner = `
    <p style="margin:0 0 6px;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#C4560A;">Báo cáo chẩn đoán</p>
    <h1 style="margin:0 0 16px;font-size:24px;color:#10252A;">Chào ${esc(lead.name)},</h1>
    <p style="margin:0 0 22px;color:#46585D;">Đây là kết quả chẩn đoán hệ thống tăng trưởng của bạn, dựa trên câu trả lời vừa rồi.</p>

    <div style="text-align:center;padding:24px;background:#F5F7F6;border-radius:12px;margin-bottom:24px;">
      <div style="font-size:46px;font-weight:700;color:#C4560A;line-height:1;">${result.overall}</div>
      <div style="font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#66777C;margin-top:8px;">Điểm hệ thống</div>
      <div style="margin-top:14px;display:inline-block;padding:6px 16px;border:1px solid #F9C99B;border-radius:99px;color:#C4560A;font-size:12px;font-weight:600;">${esc(result.tier.label)}</div>
    </div>

    <p style="margin:0 0 6px;color:#10252A;font-size:17px;font-weight:600;">${esc(result.tier.headline)}</p>
    <p style="margin:0 0 26px;color:#46585D;">${esc(result.tier.body)}</p>

    <p style="margin:0 0 10px;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#C4560A;">Bảng điểm năm tầng</p>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:8px;">${bars}</table>
    ${leak}

    <p style="margin:0 0 12px;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#C4560A;">Nên làm gì, theo thứ tự</p>
    ${recs}

    <p style="margin:28px 0 0;padding-top:22px;border-top:1px solid #ECF1F0;color:#46585D;">
      Nếu muốn đi sâu hơn, chúng tôi dành bốn mươi lăm phút để soi hệ thống của bạn bằng dữ liệu thật — miễn phí, không ràng buộc.
    </p>
    <p style="margin:20px 0 0;">${btn(`${site.origin}/lien-he/`, 'Đặt lịch chẩn đoán trực tiếp')}</p>`;

  const text = [
    `BÁO CÁO CHẨN ĐOÁN HỆ THỐNG TĂNG TRƯỞNG`, '',
    `Chào ${lead.name},`, '',
    `Điểm hệ thống: ${result.overall}/100 — ${result.tier.label}`,
    result.tier.headline, '',
    'BẢNG ĐIỂM NĂM TẦNG',
    ...result.layers.map(l => `  ${l.letter}  ${LAYERS[l.key]?.name || l.name}: ${l.score}/100`),
    '',
    result.leak.monthlyMillions > 0
      ? `Ước tính thất thoát: ~${result.leak.display}/tháng (${result.leak.yearlyDisplay}/năm)\n` : '',
    'NÊN LÀM GÌ, THEO THỨ TỰ',
    ...result.recommendations.map(r => `  ${r.priority}. ${r.title}\n     ${r.body}`),
    '',
    `Đặt lịch chẩn đoán trực tiếp: ${site.origin}/lien-he/`
  ].filter(Boolean).join('\n');

  return await queueMail({
    kind: 'diagnostic_report',
    to: lead.email,
    replyTo: MAIL_TO,
    subject: `Báo cáo chẩn đoán hệ thống của bạn — ${result.overall}/100`,
    html: shell('Báo cáo chẩn đoán', inner),
    text,
    leadId: id
  });
}

/* ==========================================================================
   3. Tiến trình nền
   ========================================================================== */
let running = false;

export async function drainOutbox() {
  if (running) return;
  running = true;
  try {
    const batch = await dueMail(10);
    for (const m of batch) {
      if (!mailEnabled) {
        console.log(`  [thư · chế độ nháp] ${m.kind} → ${m.recipient} · "${m.subject}"`);
        await markMailSent(m.id);
        continue;
      }
      try {
        await smtpSend(CFG, {
          from: MAIL_FROM,
          fromName: 'Aurix',
          to: m.recipient.split(','),
          replyTo: m.reply_to || undefined,
          subject: m.subject,
          html: m.html,
          text: m.text
        });
        await markMailSent(m.id);
        console.log(`  [thư] đã gửi ${m.kind} → ${m.recipient}`);
      } catch (err) {
        const attempts = m.attempts + 1;
        await markMailFailed(m.id, attempts, err.message);
        console.error(`  [thư] lỗi lần ${attempts} — ${m.kind} → ${m.recipient}: ${err.message}`);
      }
    }
  } finally {
    running = false;
  }
}

/** Khởi động vòng lặp gửi thư. Gọi một lần lúc máy chủ lên. */
export function startMailWorker(intervalMs = 20_000) {
  if (!mailEnabled) {
    console.log('  Gửi thư: CHẾ ĐỘ NHÁP — đặt AURIX_SMTP_HOST/USER/PASS để gửi thật.');
  } else {
    console.log(`  Gửi thư: ${CFG.host}:${CFG.port} — thông báo về ${MAIL_TO}`);
  }
  const timer = setInterval(() => { drainOutbox().catch(() => {}); }, intervalMs);
  timer.unref();
  drainOutbox().catch(() => {});
  return timer;
}
