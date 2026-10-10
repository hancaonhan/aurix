/*
 * Ghép hình + tiếng, xuất:
 *   out/aurix-gioi-thieu-1080x1920.mp4   bản đăng mạng xã hội (TikTok, Reels, Facebook)
 *   public/assets/video/aurix-gioi-thieu-v1.mp4  bản website 720x1280, nhẹ
 *   public/assets/video/aurix-gioi-thieu-v1.jpg  ảnh bìa
 *   public/assets/video/aurix-gioi-thieu-v1.vtt  phụ đề cho trình đọc màn hình
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

import { FFMPEG as FF } from './tools.mjs';
const WEB = join(HERE, '..', '..', 'public', 'assets', 'video');
const OUT = join(HERE, 'out');
mkdirSync(WEB, { recursive: true });
mkdirSync(OUT, { recursive: true });
const tl = JSON.parse(readFileSync(join(HERE, 'timeline.json'), 'utf8'));
const run = args => execFileSync(FF, ['-y', '-v', 'error', ...args], { stdio: 'inherit' });
const mb = f => (statSync(f).size / 1048576).toFixed(1) + ' MB';

// Bản đầy đủ: giữ nguyên hình đã nén, thêm tiếng AAC
const full = join(OUT, 'aurix-gioi-thieu-1080x1920.mp4');
run(['-i', join(HERE, 'video-only.mp4'), '-i', join(HERE, 'mix.wav'), '-map', '0:v', '-map', '1:a',
  '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest', '-movflags', '+faststart', full]);
console.log('bản mạng xã hội', mb(full));

// Bản website: 720x1280, nén vừa đủ nét cho khung ~380 điểm ảnh
const web = join(WEB, 'aurix-gioi-thieu-v1.mp4');
run(['-i', full, '-vf', 'scale=720:1280:flags=lanczos', '-c:v', 'libx264', '-preset', 'slow', '-crf', '25',
  '-profile:v', 'high', '-level', '4.0', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', web]);
console.log('bản website', mb(web));

// Ảnh bìa: khung câu hỏi mở đầu (đủ logo, câu hook và bong bóng tin nhắn)
const hook = tl.lines.find(l => l.id === 'hook');
// Lấy trước khi cảnh bắt đầu mờ dần (0,35 giây cuối) để chữ còn rõ nét
const posterT = (hook.end - 0.5).toFixed(2);
run(['-ss', posterT, '-i', full, '-frames:v', '1', '-vf', 'scale=720:1280:flags=lanczos', '-q:v', '4', join(WEB, 'aurix-gioi-thieu-v1.jpg')]);
console.log('ảnh bìa tại', posterT, 's');

// Phụ đề WebVTT theo từng câu
const ts = s => {
  const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), sec = (s % 60).toFixed(3).padStart(6, '0');
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${sec}`;
};
const vtt = 'WEBVTT\n\n' + tl.lines.map((l, i) => `${i + 1}\n${ts(l.start)} --> ${ts(l.end + 0.2)}\n${l.text}\n`).join('\n');
writeFileSync(join(WEB, 'aurix-gioi-thieu-v1.vtt'), vtt);
console.log('phụ đề', tl.lines.length, 'câu');
