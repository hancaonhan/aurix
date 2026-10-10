/*
 * Đọc kịch bản bằng giọng neural tiếng Việt của Microsoft Edge (dịch vụ "đọc to").
 * Không dùng gói ngoài: WebSocket và crypto có sẵn trong Node.
 * Mỗi dòng ra một tệp MP3 + tệp JSON thời điểm từng từ (để khớp phụ đề).
 *
 *   node tts.mjs            đọc mọi dòng chưa có tệp
 */
import { createHash, randomUUID } from 'node:crypto';
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LINES, VOICE, RATE } from './script.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, 'voice');
mkdirSync(OUT, { recursive: true });

const TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4';
const CHROMIUM = '143.0.3650.75';

/* Mã Sec-MS-GEC: SHA-256 của (số tick Windows làm tròn 5 phút + token), viết hoa. */
function gec() {
  let ticks = Math.floor(Date.now() / 1000) + 11644473600;
  ticks -= ticks % 300;
  const s = (BigInt(ticks) * 10000000n).toString() + TOKEN;
  return createHash('sha256').update(s, 'ascii').digest('hex').toUpperCase();
}

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const stamp = () => new Date().toUTCString().replace('GMT', 'GMT+0000 (Coordinated Universal Time)');

function speak(text) {
  return new Promise((resolve, reject) => {
    const url = 'wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1'
      + `?TrustedClientToken=${TOKEN}&Sec-MS-GEC=${gec()}&Sec-MS-GEC-Version=1-${CHROMIUM}`
      + `&ConnectionId=${randomUUID().replace(/-/g, '')}`;
    const ws = new WebSocket(url, {
      headers: {
        Origin: 'chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold',
        'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${CHROMIUM.split('.')[0]}.0.0.0 Safari/537.36 Edg/${CHROMIUM.split('.')[0]}.0.0.0`
      }
    });
    ws.binaryType = 'arraybuffer';
    const audio = [];
    const words = [];
    const timer = setTimeout(() => { ws.close(); reject(new Error('quá thời gian')); }, 30000);

    ws.onopen = () => {
      ws.send(`X-Timestamp:${stamp()}\r\nContent-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n`
        + JSON.stringify({ context: { synthesis: { audio: {
          metadataoptions: { sentenceBoundaryEnabled: 'false', wordBoundaryEnabled: 'true' },
          outputFormat: 'audio-24khz-96kbitrate-mono-mp3' } } } }));
      const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='vi-VN'>`
        + `<voice name='${VOICE}'><prosody pitch='+0Hz' rate='${RATE}' volume='+0%'>${esc(text)}</prosody></voice></speak>`;
      ws.send(`X-RequestId:${randomUUID().replace(/-/g, '')}\r\nContent-Type:application/ssml+xml\r\n`
        + `X-Timestamp:${stamp()}Z\r\nPath:ssml\r\n\r\n${ssml}`);
    };
    ws.onmessage = ev => {
      if (typeof ev.data === 'string') {
        if (ev.data.includes('Path:audio.metadata')) {
          const body = JSON.parse(ev.data.slice(ev.data.indexOf('\r\n\r\n') + 4));
          for (const m of body.Metadata || []) {
            if (m.Type === 'WordBoundary') {
              words.push({ t: m.Data.Offset / 1e7, d: m.Data.Duration / 1e7, w: m.Data.text.Text });
            }
          }
        } else if (ev.data.includes('Path:turn.end')) {
          clearTimeout(timer);
          ws.close();
          resolve({ audio: Buffer.concat(audio), words });
        }
        return;
      }
      const buf = Buffer.from(ev.data);
      const headLen = buf.readUInt16BE(0);
      const head = buf.subarray(2, 2 + headLen).toString();
      if (head.includes('Path:audio')) audio.push(buf.subarray(2 + headLen));
    };
    ws.onclose = e => { clearTimeout(timer); reject(new Error(`đóng kết nối: mã ${e.code} ${e.reason}`)); };
    ws.onerror = () => {};
  });
}

for (const line of LINES) {
  const mp3 = join(OUT, `${line.id}.mp3`);
  if (existsSync(mp3)) { console.log('có sẵn', line.id); continue; }
  let res;
  for (let k = 1; k <= 5 && !res; k++) {
    try { res = await speak(line.text); }
    catch (e) { console.log('  thử lại', line.id, k, e.message); await new Promise(r => setTimeout(r, 1500 * k)); }
  }
  if (!res) throw new Error('không đọc được ' + line.id);
  const { audio, words } = res;
  if (!audio.length) throw new Error('không nhận được âm thanh cho ' + line.id);
  writeFileSync(mp3, audio);
  writeFileSync(join(OUT, `${line.id}.json`), JSON.stringify(words));
  console.log(line.id, `${(audio.length / 1024).toFixed(0)} KB`, `${words.length} từ`);
}
