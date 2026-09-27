/**
 * Báo khách mới tức thì qua Telegram.
 *
 * Email vẫn là kênh chính và có hàng đợi, gửi lại khi lỗi. Tin Telegram chỉ là
 * lớp báo nhanh cho điện thoại sales: gửi một lần, lỗi thì ghi nhật ký rồi bỏ
 * qua. Không có gì ở đây được phép làm chậm hay làm hỏng phản hồi trả cho khách.
 *
 * Dùng `fetch` có sẵn của Node, không thêm gói nào.
 */
import config from '../core/config.js';
import log from '../core/logger.js';
import { liveIndustryByKey } from '../../site/data/content.js';
import { services } from '../../site/data/services.js';

const { telegramToken, telegramChat } = config.notify;
export const telegramEnabled = Boolean(telegramToken && telegramChat);

/** Nhãn dễ đọc cho nguồn khách. Nguồn lạ thì hiện nguyên giá trị. */
const SOURCE_LABEL = {
  contact: 'Form liên hệ',
  diagnostic: 'Bài chẩn đoán',
  calculator: 'Máy tính thất thoát'
};

// Telegram dùng HTML giản lược: chỉ cần thoát ba ký tự này.
const esc = (s = '') => String(s ?? '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

export function leadMessage(lead, id) {
  const industry = lead.industry ? (liveIndustryByKey()[lead.industry]?.label || lead.industry) : null;
  const service = lead.service ? (services.find(s => s.slug === lead.service)?.name || lead.service) : null;
  const phone = String(lead.phone || '').replace(/[^\d+]/g, '');

  const lines = [
    `🔔 <b>Khách mới #${id}</b> · ${esc(SOURCE_LABEL[lead.source] || lead.source || 'không rõ')}`,
    '',
    `<b>${esc(lead.name)}</b>`,
    phone ? `📞 <a href="tel:${esc(phone)}">${esc(lead.phone)}</a>` : null,
    lead.email ? `✉️ ${esc(lead.email)}` : null,
    lead.company ? `🏢 ${esc(lead.company)}` : null,
    industry ? `Ngành: ${esc(industry)}` : null,
    service ? `Quan tâm: ${esc(service)}` : null,
    lead.score != null ? `Điểm chẩn đoán: <b>${esc(lead.score)}/100</b>` : null,
    lead.message ? `\n${esc(String(lead.message).slice(0, 600))}` : null,
    '',
    `<a href="${esc(config.origin)}/admin">Mở bảng điều khiển</a>`
  ];
  return lines.filter(l => l !== null).join('\n');
}

/**
 * Gửi thông báo. Không bao giờ ném lỗi ra ngoài.
 * @returns {Promise<boolean>} true nếu Telegram nhận tin.
 */
export async function notifyLead(lead, id) {
  if (!telegramEnabled) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegramChat,
        text: leadMessage(lead, id),
        parse_mode: 'HTML',
        disable_web_page_preview: true
      }),
      signal: AbortSignal.timeout(8000)
    });
    if (!res.ok) {
      // Không ghi thân phản hồi: nó có thể lặp lại token trong thông báo lỗi.
      log.warn('Telegram từ chối tin báo khách mới', { status: res.status, id });
      return false;
    }
    return true;
  } catch (e) {
    log.warn('Không gửi được tin Telegram', { error: e.name, id });
    return false;
  }
}
