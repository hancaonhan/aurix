/*
 * Dựng dòng thời gian từ thời lượng thật của từng đoạn giọng đọc.
 * Ra timeline.json: thời điểm từng câu, từng từ (để phụ đề sáng theo giọng)
 * và khung thời gian từng cảnh. Cả phần hình lẫn phần tiếng đều đọc tệp này.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LINES } from './script.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
import { FFPROBE } from './tools.mjs';

const LEAD = 0.45;        // khoảng lặng đầu video
const GAP_LINE = 0.28;    // nghỉ giữa hai câu cùng cảnh
const GAP_SCENE = 0.75;   // nghỉ khi chuyển cảnh (đủ cho tiếng "vút")
const TAIL = 2.6;         // giữ logo sau câu cuối

const dur = f => Number(execFileSync(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString());

let t = LEAD;
const lines = [];
LINES.forEach((l, i) => {
  if (i > 0) t += LINES[i - 1].scene === l.scene ? GAP_LINE : GAP_SCENE;
  const d = dur(join(HERE, 'voice', `${l.id}.mp3`));
  const raw = JSON.parse(readFileSync(join(HERE, 'voice', `${l.id}.json`), 'utf8'));
  const tokens = l.text.split(/\s+/);
  // Ghép từng chữ của câu với mốc thời gian dịch vụ đọc trả về. Số lượng lệch
  // (số đọc thành chữ, dấu câu) thì chia đều theo độ dài câu.
  const words = tokens.map((w, k) => raw.length === tokens.length
    ? { w, t: t + raw[k].t }
    : { w, t: t + d * (k / tokens.length) });
  lines.push({ ...l, start: t, end: t + d, dur: d, words });
  t += d;
});
const total = Math.ceil((t + TAIL) * 30) / 30;

// Khung cảnh: từ lúc câu đầu tiên của cảnh bắt đầu (lùi một chút để hình vào
// trước tiếng) tới lúc cảnh sau vào.
const scenes = [];
for (const l of lines) {
  const s = scenes.at(-1);
  if (s && s.id === l.scene) s.voiceEnd = l.end;
  else scenes.push({ id: l.scene, in: Math.max(0, l.start - 0.35), voiceStart: l.start, voiceEnd: l.end });
}
scenes.forEach((s, i) => { s.out = i < scenes.length - 1 ? scenes[i + 1].in : total; });

writeFileSync(join(HERE, 'timeline.json'), JSON.stringify({ total, lines, scenes }, null, 1));
console.log('tổng', total.toFixed(2), 'giây');
for (const s of scenes) console.log(s.id.padEnd(9), s.in.toFixed(2), '→', s.out.toFixed(2));
for (const l of lines) {
  const raw = JSON.parse(readFileSync(join(HERE, 'voice', `${l.id}.json`), 'utf8'));
  if (raw.length !== l.text.split(/\s+/).length) console.log('  lệch số từ:', l.id, raw.length, 'mốc /', l.text.split(/\s+/).length, 'chữ');
}
