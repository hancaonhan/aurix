/*
 * Bài viết — mục Kiến thức.
 *
 * Mỗi bài phải trả lời một câu hỏi khách hàng thật sự gõ vào Google TRƯỚC KHI
 * họ biết tới Aurix. Đó là cửa vào từ tìm kiếm.
 *
 * Quy tắc viết:
 *   · Một bài, một câu hỏi. Không gộp.
 *   · Đưa ra con số và cách tính, để người đọc tự làm được.
 *   · Không bán hàng trong ba phần đầu. Chỉ dẫn tới dịch vụ khi đã trả lời xong.
 *
 * Cấu trúc dữ liệu một bài:
 *   slug, title, seoTitle, excerpt, seoDesc, date, updated, readMinutes,
 *   topic   — một trong TOPIC_ORDER bên dưới, dùng để lọc ở trang danh sách
 *   layer   — tầng A.U.R.I.X mà bài thuộc về
 *   level   — Nền tảng | Thực hành | Nâng cao | Chiến lược
 *   related — slug các dịch vụ liên quan
 *   body    — mảng khối: p, h2, h3, list, steps, table, formula, note, quote, faq, cta
 *
 * Thêm bài mới: thêm vào tệp chủ đề tương ứng trong thư mục articles/ rồi chạy
 * `npm run build`. Muốn mở chủ đề mới thì thêm tệp và khai báo ở TOPIC_ORDER.
 */

import { doLuong } from './articles/do-luong.js';
import { chuyenDoi } from './articles/chuyen-doi.js';
import { website } from './articles/website.js';
import { quangCao } from './articles/quang-cao.js';
import { noiDung } from './articles/noi-dung.js';
import { giuKhach } from './articles/giu-khach.js';
import { vanHanh } from './articles/van-hanh.js';
import { chienLuoc } from './articles/chien-luoc.js';

/** Thứ tự chủ đề hiển thị trên thanh lọc — đi từ nền móng ra ngoài. */
export const TOPIC_ORDER = [
  'Đo lường',
  'Chuyển đổi',
  'Website',
  'Quảng cáo',
  'Nội dung',
  'Giữ khách',
  'Vận hành',
  'Chiến lược'
];

/** Mô tả ngắn từng chủ đề, dùng ở trang danh sách. */
export const TOPIC_NOTE = {
  'Đo lường':  'Con số thật của bạn là bao nhiêu và tính thế nào.',
  'Chuyển đổi': 'Khoảng cách giữa có thông tin khách và khách trả tiền.',
  'Website':    'Trang web như một công cụ bán hàng, không phải danh thiếp.',
  'Quảng cáo':  'Tiền vào nền tảng và điều gì quyết định nó quay về.',
  'Nội dung':   'Thứ khách đọc, xem và tin trước khi nhắn tin cho bạn.',
  'Giữ khách':  'Phần doanh thu rẻ nhất: những người đã từng trả tiền.',
  'Vận hành':   'Quy trình, công cụ và con người phía sau mọi con số.',
  'Chiến lược': 'Những quyết định định hình mọi con số phía sau.'
};

const ALL = [
  ...doLuong, ...chuyenDoi, ...website, ...quangCao,
  ...noiDung, ...giuKhach, ...vanHanh, ...chienLuoc
];

/* ---------- Soát lỗi dữ liệu ngay lúc build ---------- */
{
  const seen = new Set();
  for (const a of ALL) {
    if (seen.has(a.slug)) throw new Error(`Bài viết trùng slug: ${a.slug}`);
    seen.add(a.slug);
    if (!TOPIC_ORDER.includes(a.topic)) {
      throw new Error(`Bài "${a.slug}" có chủ đề lạ: ${a.topic}`);
    }
  }
}

/** Mới nhất lên trước. */
export const articles = [...ALL].sort((a, b) => b.date.localeCompare(a.date));

export const articleBySlug = Object.fromEntries(articles.map(a => [a.slug, a]));

/** Chủ đề có bài, theo đúng thứ tự đã định. */
export const topics = TOPIC_ORDER.filter(t => articles.some(a => a.topic === t));

/** Số bài theo từng chủ đề. */
export const topicCount = Object.fromEntries(
  topics.map(t => [t, articles.filter(a => a.topic === t).length])
);

/**
 * Bài liên quan: ưu tiên cùng chủ đề, sau đó cùng tầng A.U.R.I.X,
 * cuối cùng lấp bằng bài mới nhất. Luôn trả về đủ số lượng yêu cầu.
 */
export function relatedArticles(current, count = 3) {
  const pool = articles.filter(a => a.slug !== current.slug);
  const score = a =>
    (a.topic === current.topic ? 2 : 0) + (a.layer === current.layer ? 1 : 0);
  return [...pool]
    .sort((a, b) => score(b) - score(a) || b.date.localeCompare(a.date))
    .slice(0, count);
}

/** Bài trước và bài sau trong cùng chủ đề, dùng cho điều hướng cuối bài. */
export function neighbours(current) {
  const sameTopic = articles.filter(a => a.topic === current.topic);
  const i = sameTopic.findIndex(a => a.slug === current.slug);
  return {
    prev: i > 0 ? sameTopic[i - 1] : null,
    next: i > -1 && i < sameTopic.length - 1 ? sameTopic[i + 1] : null
  };
}
