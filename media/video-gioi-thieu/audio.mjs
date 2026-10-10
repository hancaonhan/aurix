/*
 * Dựng toàn bộ phần tiếng: giọng đọc đặt đúng dòng thời gian, nhạc nền tổng
 * hợp (không dùng bản nhạc có bản quyền), hiệu ứng âm thanh, tự hạ nhạc khi
 * có giọng, rồi chuẩn hoá mức. Ra mix.wav (48 kHz, stereo, 16-bit).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
import { FFMPEG } from './tools.mjs';
const tl = JSON.parse(readFileSync(join(HERE, 'timeline.json'), 'utf8'));
const SR = 48000;
const N = Math.ceil(tl.total * SR);
const L = new Float32Array(N), R = new Float32Array(N);       // nhạc
const SL = new Float32Array(N), SRb = new Float32Array(N);    // hiệu ứng
const V = new Float32Array(N);                                // giọng (mono)
const scene = Object.fromEntries(tl.scenes.map(s => [s.id, s]));

/* Bộ sinh số ngẫu nhiên cố định — chạy lại ra đúng âm thanh cũ */
let seed = 12345;
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff * 2 - 1; };
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

/* ---------- Giọng đọc ---------- */
for (const l of tl.lines) {
  const raw = execFileSync(FFMPEG, ['-v', 'error', '-i', join(HERE, 'voice', `${l.id}.mp3`), '-f', 'f32le', '-ac', '1', '-ar', String(SR), '-'], { maxBuffer: 1 << 28 });
  const pcm = new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4);
  const at = Math.round(l.start * SR);
  for (let i = 0; i < pcm.length && at + i < N; i++) V[at + i] += pcm[i];
}
let vpk = 0; for (const x of V) vpk = Math.max(vpk, Math.abs(x));
for (let i = 0; i < N; i++) V[i] *= 0.89 / vpk;

/* ---------- Nhạc nền ---------- */
const BPM = 96, BEAT = 60 / BPM, BAR = BEAT * 4;
// Am – F – C – G, mỗi hợp âm một ô nhịp
const CHORDS = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]];
const ROOTS = [45, 41, 48, 43];

/** Độ dày nhạc theo cảnh: 0 = chỉ nền, 1 = thêm trống trầm, 2 = đủ nhịp. */
function level(t) {
  if (t < scene.problem.in) return 0;
  if (t < scene.intro.in) return 1;
  if (t < scene.logo.in - 1.8) return 2;
  return -1;   // đoạn dâng lên trước logo và phần logo: tắt trống
}

function addStereo(i, v, pan = 0) {
  if (i < 0 || i >= N) return;
  L[i] += v * Math.cos((pan + 1) * Math.PI / 4);
  R[i] += v * Math.sin((pan + 1) * Math.PI / 4);
}

// Nền (pad): ba dao động răng cưa lệch nhẹ mỗi nốt, lọc thông thấp một cực
{
  const ph = new Float64Array(9);
  let lpL = 0, lpR = 0;
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const bar = Math.floor(t / BAR);
    const ch = CHORDS[bar % 4];
    const inBar = t - bar * BAR;
    const env = Math.min(1, inBar / 0.35) * (inBar > BAR - 0.25 ? (BAR - inBar) / 0.25 : 1);
    let sL = 0, sR = 0;
    for (let n = 0; n < 3; n++) for (let d = 0; d < 3; d++) {
      const k = n * 3 + d;
      const f = mtof(ch[n] + 12) * Math.pow(2, (d - 1) * 7 / 1200);
      ph[k] = (ph[k] + f / SR) % 1;
      const saw = 2 * ph[k] - 1;
      if (d === 0) sL += saw; else if (d === 2) sR += saw; else { sL += saw * .5; sR += saw * .5; }
    }
    const cut = 0.06 + 0.03 * Math.sin(t * 0.4);           // mở lọc chậm cho có hơi thở
    lpL += cut * (sL - lpL); lpR += cut * (sR - lpR);
    const fadeIn = Math.min(1, t / 1.2), fadeOut = Math.min(1, (tl.total - t) / 2.2);
    const g = 0.055 * env * fadeIn * fadeOut;
    L[i] += lpL * g; R[i] += lpR * g;
  }
}

// Gảy rải hợp âm (pluck) nốt móc đơn, có tiếng vọng
const ARP = [0, 1, 2, 1, 2, 0, 1, 2];
for (let s = 0; s * BEAT / 2 < tl.total - 2; s++) {
  const t0 = s * BEAT / 2;
  const bar = Math.floor(t0 / BAR);
  const lv = level(t0);
  const note = CHORDS[bar % 4][ARP[s % 8]] + 24 + (lv >= 2 && s % 8 === 7 ? 12 : 0);
  const f = mtof(note);
  const amp = (lv <= 0 ? 0.05 : lv === 1 ? 0.06 : 0.075) * (s % 2 ? 0.8 : 1);
  const pan = s % 2 ? 0.35 : -0.35;
  for (const [delay, g, p] of [[0, 1, pan], [BEAT * 0.75, 0.32, -pan], [BEAT * 1.5, 0.12, pan]]) {
    const at = Math.round((t0 + delay) * SR);
    for (let j = 0; j < SR * 0.5; j++) {
      const tt = j / SR;
      const e = Math.exp(-tt / 0.13) * Math.min(1, tt / 0.004);
      const v = (Math.sin(2 * Math.PI * f * tt) + 0.25 * Math.sin(4 * Math.PI * f * tt)) * e * amp * g;
      addStereo(at + j, v, p);
    }
  }
}

// Trống và bass
for (let b = 0; b * BEAT < tl.total; b++) {
  const t0 = b * BEAT;
  const lv = level(t0);
  if (lv < 1) continue;
  const at = Math.round(t0 * SR);
  const beatInBar = b % 4;
  // Trống trầm: phách 1 và 3 (đủ nhịp thì cả bốn phách)
  if (lv === 2 || beatInBar % 2 === 0) {
    let ph = 0;
    for (let j = 0; j < SR * 0.35; j++) {
      const tt = j / SR;
      const f = 45 + 85 * Math.exp(-tt / 0.03);
      ph += f / SR;
      const v = Math.sin(2 * Math.PI * ph) * Math.exp(-tt / 0.16) * (lv === 2 ? 0.34 : 0.26);
      addStereo(at + j, v, 0);
    }
  }
  // Vỗ tay phách 2 và 4
  if (lv === 2 && beatInBar % 2 === 1) {
    let prev = 0;
    for (let j = 0; j < SR * 0.18; j++) {
      const n = rnd(); const hp = n - prev; prev = n;
      addStereo(at + j, hp * Math.exp(-j / SR / 0.05) * 0.09, 0.1);
    }
  }
  // Hi-hat móc đơn nghịch phách
  if (lv === 2) {
    const ah = Math.round((t0 + BEAT / 2) * SR);
    let prev = 0;
    for (let j = 0; j < SR * 0.05; j++) {
      const n = rnd(); const hp = n - prev; prev = n;
      addStereo(ah + j, hp * Math.exp(-j / SR / 0.012) * 0.045, 0.3);
    }
  }
  // Bass gốc hợp âm, nhún sau trống trầm
  const bar = Math.floor(t0 / BAR);
  const f = mtof(ROOTS[bar % 4] - 12);
  for (let j = 0; j < SR * BEAT; j++) {
    const tt = j / SR;
    const pump = Math.min(1, tt / 0.09);
    const v = Math.sin(2 * Math.PI * f * (t0 + tt)) * pump * Math.exp(-tt / 0.9) * 0.16;
    addStereo(at + j, v, 0);
  }
}

// Hợp âm kết khi logo hiện: ngân dài rồi tắt dần
{
  const t0 = scene.logo.in;
  const notes = [45, 57, 60, 64, 69, 76];
  const at = Math.round(t0 * SR);
  for (let j = 0; at + j < N; j++) {
    const tt = j / SR;
    const e = Math.min(1, tt / 0.02) * Math.exp(-tt / 2.4) * Math.min(1, (tl.total - t0 - tt) / 1.5);
    let v = 0;
    notes.forEach((m, k) => { v += Math.sin(2 * Math.PI * mtof(m) * tt + k) / (1 + k * 0.4); });
    addStereo(at + j, v * e * 0.05, 0);
  }
}

/* ---------- Hiệu ứng âm thanh ---------- */
function sfx(i, v, pan = 0) {
  if (i < 0 || i >= N) return;
  SL[i] += v * Math.cos((pan + 1) * Math.PI / 4);
  SRb[i] += v * Math.sin((pan + 1) * Math.PI / 4);
}
/** Tiếng "vút": nhiễu lọc thông thấp quét lên rồi xuống, lia trái sang phải. */
function whoosh(t, len = 0.65, gain = 0.35) {
  const at = Math.round((t - len * 0.55) * SR);
  let lp = 0, lp2 = 0;
  for (let j = 0; j < len * SR; j++) {
    const p = j / (len * SR);
    const bell = Math.sin(Math.PI * p) ** 2;
    const cut = 0.01 + 0.25 * bell;
    lp += cut * (rnd() - lp); lp2 += cut * (lp - lp2);
    sfx(at + j, lp2 * bell * gain * 3, -0.8 + 1.6 * p);
  }
}
/** Tiếng "tách": nốt ngắn trượt xuống + tiếng gõ. */
function tick(t, f = 1250, gain = 0.16) {
  const at = Math.round(t * SR);
  for (let j = 0; j < SR * 0.12; j++) {
    const tt = j / SR;
    const v = Math.sin(2 * Math.PI * f * tt * (1 - tt * 2)) * Math.exp(-tt / 0.03) * gain + (j < 60 ? rnd() * 0.08 : 0);
    sfx(at + j, v, 0.1);
  }
}
/** Tiếng "bụp" của bong bóng tin nhắn. */
function bloop(t, gain = 0.18) {
  const at = Math.round(t * SR);
  let ph = 0;
  for (let j = 0; j < SR * 0.09; j++) {
    const tt = j / SR;
    ph += (480 + 900 * tt / 0.09) / SR;
    sfx(at + j, Math.sin(2 * Math.PI * ph) * Math.sin(Math.PI * tt / 0.09) * gain, -0.2);
  }
}
/** Dâng lên trước logo rồi nện trầm. */
function riseAndHit(tHit) {
  const len = 1.7, at = Math.round((tHit - len) * SR);
  let lp = 0, ph = 0;
  for (let j = 0; j < len * SR; j++) {
    const p = j / (len * SR);
    lp += (0.02 + 0.3 * p) * (rnd() - lp);
    ph += (180 + 900 * p * p) / SR;
    sfx(at + j, (lp * 1.6 + Math.sin(2 * Math.PI * ph) * 0.35) * p * p * 0.22, 0);
  }
  const ah = Math.round(tHit * SR);
  let ph2 = 0, lp2 = 0;
  for (let j = 0; j < SR * 1.6; j++) {
    const tt = j / SR;
    ph2 += (38 + 60 * Math.exp(-tt / 0.08)) / SR;
    lp2 += 0.08 * (rnd() - lp2);
    sfx(ah + j, Math.sin(2 * Math.PI * ph2) * Math.exp(-tt / 0.55) * 0.55 + lp2 * Math.exp(-tt / 0.18) * 0.5, 0);
  }
}

const line = Object.fromEntries(tl.lines.map(l => [l.id, l]));
const wordT = (id, re) => (line[id].words.find(w => re.test(w.w)) || line[id].words[0]).t;
for (const s of tl.scenes.slice(1)) if (s.id !== 'logo') whoosh(s.in + 0.05);
[0.15, 0.47, 0.79].forEach(t => bloop(t));
[/chậm/, /trễ/, /^đo/].forEach(re => tick(wordT('prob2', re) - 0.25, 980));
[/^spa/, /^nha/, /^giáo/, /^fitness/].forEach(re => tick(wordT('intro', re) - 0.08, 1400, 0.12));
for (let i = 1; i <= 5; i++) tick(line['svc' + i].start - 0.2, 1100 + i * 60);
tick(wordT('cta1', /^bốn/) - 0.1, 900, 0.2);
riseAndHit(scene.logo.in + 0.05);

/* ---------- Trộn: hạ nhạc khi có giọng ---------- */
const duck = new Float32Array(N);
{
  let env = 0;
  const att = 1 - Math.exp(-1 / (0.02 * SR)), rel = 1 - Math.exp(-1 / (0.35 * SR));
  for (let i = 0; i < N; i++) {
    const a = Math.abs(V[i]);
    env += (a > env ? att : rel) * (a - env);
    duck[i] = 1 - 0.6 * Math.min(1, env / 0.12);
  }
}
const OUTL = new Float32Array(N), OUTR = new Float32Array(N);
const MUSIC = 1.0, SFX = 0.9, VOICE = 1.0;
for (let i = 0; i < N; i++) {
  OUTL[i] = L[i] * MUSIC * duck[i] + SL[i] * SFX + V[i] * VOICE;
  OUTR[i] = R[i] * MUSIC * duck[i] + SRb[i] * SFX + V[i] * VOICE;
}
// Chuẩn hoá đỉnh về −1 dBFS, cắt mềm phòng đỉnh nhọn
let pk = 0; for (let i = 0; i < N; i++) pk = Math.max(pk, Math.abs(OUTL[i]), Math.abs(OUTR[i]));
const g = 0.89 / pk;
const pcm = Buffer.alloc(N * 4);
for (let i = 0; i < N; i++) {
  pcm.writeInt16LE(Math.round(Math.tanh(OUTL[i] * g) * 32767), i * 4);
  pcm.writeInt16LE(Math.round(Math.tanh(OUTR[i] * g) * 32767), i * 4 + 2);
}
const head = Buffer.alloc(44);
head.write('RIFF', 0); head.writeUInt32LE(36 + pcm.length, 4); head.write('WAVE', 8);
head.write('fmt ', 12); head.writeUInt32LE(16, 16); head.writeUInt16LE(1, 20); head.writeUInt16LE(2, 22);
head.writeUInt32LE(SR, 24); head.writeUInt32LE(SR * 4, 28); head.writeUInt16LE(4, 32); head.writeUInt16LE(16, 34);
head.write('data', 36); head.writeUInt32LE(pcm.length, 40);
writeFileSync(join(HERE, 'mix.wav'), Buffer.concat([head, pcm]));
console.log('mix.wav', (tl.total).toFixed(2), 's, hệ số chuẩn hoá', g.toFixed(2));

/* ---------- Đo đạc để kiểm tra cân bằng (không nghe được thì phải đo) ---------- */
const rms = (arr, a, b) => { let s = 0; for (let i = a; i < b; i++) s += arr[i] * arr[i]; return Math.sqrt(s / Math.max(1, b - a)); };
const db = x => (20 * Math.log10(x + 1e-12)).toFixed(1);
let vS = 0, mS = 0, xS = 0, n = 0;
for (const l of tl.lines) {
  const a = Math.round(l.start * SR), b = Math.round(l.end * SR);
  vS += rms(V, a, b) ** 2;
  let m = 0; for (let i = a; i < b; i++) m += (L[i] * duck[i]) ** 2; mS += m / (b - a);
  let x = 0; for (let i = a; i < b; i++) x += SL[i] ** 2; xS += x / (b - a);
  n++;
}
console.log('khi có giọng — giọng', db(Math.sqrt(vS / n)), 'dB | nhạc', db(Math.sqrt(mS / n)), 'dB | hiệu ứng', db(Math.sqrt(xS / n)), 'dB');
const gap = [Math.round(0 * SR), Math.round(0.4 * SR)];
const s0 = scene.services.in, s1 = scene.services.out;
console.log('nhạc phần dịch vụ (chưa hạ):', db(rms(L, Math.round(s0 * SR), Math.round(s1 * SR))), 'dB');
