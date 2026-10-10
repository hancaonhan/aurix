/*
 * Dựng hình: Edge chạy ẩn, điều khiển qua giao thức DevTools (CDP) bằng
 * WebSocket có sẵn của Node. Mỗi khung: gọi render(t) rồi chụp màn hình.
 *
 *   node render.mjs stills 2 8 18 30 45 52 58   chụp vài khung xem thử (PNG)
 *   node render.mjs video                        dựng toàn bộ → frames vào ffmpeg
 */
import { spawn } from 'node:child_process';
import { readFileSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
import { EDGE } from './tools.mjs';
import { FFMPEG } from './tools.mjs';
const FPS = 30;
const PORT = 9333;
const tl = JSON.parse(readFileSync(join(HERE, 'timeline.json'), 'utf8'));
const [mode, ...args] = process.argv.slice(2);

const profile = join(HERE, '.edge-profile');
rmSync(profile, { recursive: true, force: true });
const edge = spawn(EDGE, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  '--hide-scrollbars', '--force-device-scale-factor=1', '--window-size=1080,1920',
  '--allow-file-access-from-files', '--disable-gpu-vsync', 'about:blank'], { stdio: 'ignore' });

const sleep = ms => new Promise(r => setTimeout(r, ms));
let target;
for (let i = 0; i < 50 && !target; i++) {
  try { target = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find(x => x.type === 'page'); }
  catch { await sleep(200); }
}
if (!target) throw new Error('không mở được Edge');

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(r => ws.onopen = r);
let seq = 0;
const pending = new Map();
ws.onmessage = ev => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
};
const cdp = (method, params = {}) => new Promise((res, rej) => {
  const id = ++seq;
  pending.set(id, m => m.error ? rej(new Error(method + ': ' + m.error.message)) : res(m.result));
  ws.send(JSON.stringify({ id, method, params }));
});
const evalJs = async expr => {
  const r = await cdp('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
};

await cdp('Emulation.setDeviceMetricsOverride', { width: 1080, height: 1920, deviceScaleFactor: 1, mobile: false });
await cdp('Page.enable');
await cdp('Page.navigate', { url: pathToFileURL(join(HERE, 'render.html')).href });
await sleep(800);
await evalJs(`setTimeline(${JSON.stringify(tl)}); document.fonts.ready.then(() => Promise.all([...document.images].map(i => i.decode().catch(() => 0)))).then(() => document.fonts.size)`);
console.log('phông đã nạp:', await evalJs(`[...document.fonts].filter(f => f.status === 'loaded').length`));

async function shot(t, format = 'jpeg') {
  await evalJs(`render(${t})`);
  const r = await cdp('Page.captureScreenshot', { format, quality: format === 'jpeg' ? 94 : undefined, fromSurface: true });
  return Buffer.from(r.data, 'base64');
}

if (mode === 'stills') {
  mkdirSync(join(HERE, 'stills'), { recursive: true });
  for (const s of args) {
    writeFileSync(join(HERE, 'stills', `t${s}.png`), await shot(Number(s), 'png'));
    console.log('khung', s);
  }
} else if (mode === 'video') {
  const frames = Math.round(tl.total * FPS);
  const out = join(HERE, 'video-only.mp4');
  const ff = spawn(FFMPEG, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = 0; f < frames; f++) {
    const buf = await shot(f / FPS);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 150 === 0) console.log(`khung ${f}/${frames}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  console.log('xong', out, `${((Date.now() - t0) / 1000).toFixed(0)}s`);
}

ws.close();
edge.kill();
