/**
 * Ứng dụng SMTP tối giản — node:net + node:tls, không phụ thuộc gói ngoài.
 *
 * Hỗ trợ: TLS ngầm định (cổng 465), STARTTLS (cổng 587), AUTH LOGIN và AUTH PLAIN.
 * Đủ dùng cho Google Workspace, Microsoft 365 và phần lớn hosting email Việt Nam.
 */
import net from 'node:net';
import tls from 'node:tls';

const CRLF = '\r\n';

/** Bọc một socket thành giao diện đọc theo dòng phản hồi SMTP. */
function conversation(socket, timeoutMs) {
  let buffer = '';
  let waiting = null;

  socket.setEncoding('utf8');
  socket.setTimeout(timeoutMs);

  const fail = err => {
    if (waiting) { waiting.reject(err); waiting = null; }
  };

  socket.on('data', chunk => {
    buffer += chunk;
    if (!waiting) return;
    // Phản hồi kết thúc khi gặp dòng dạng "250 xxx" (dấu cách, không phải dấu gạch)
    const m = /^(\d{3})(?: [^\r\n]*)?\r\n$|(?:^|\r\n)(\d{3}) [^\r\n]*\r\n$/.exec(buffer);
    if (!m) return;
    const code = Number(m[1] || m[2]);
    const text = buffer;
    buffer = '';
    const w = waiting;
    waiting = null;
    w.resolve({ code, text });
  });

  socket.on('error', fail);
  socket.on('timeout', () => { socket.destroy(); fail(new Error('SMTP: hết thời gian chờ')); });
  socket.on('close', () => fail(new Error('SMTP: kết nối đóng đột ngột')));

  return {
    /** Chờ một phản hồi, kiểm tra mã trả về nằm trong danh sách mong đợi. */
    read(expect) {
      return new Promise((resolve, reject) => {
        waiting = { resolve, reject };
        // Nếu dữ liệu đã nằm sẵn trong bộ đệm thì kích hoạt lại bộ xử lý
        if (buffer) socket.emit('data', '');
      }).then(res => {
        if (expect && !expect.includes(res.code)) {
          throw new Error(`SMTP: máy chủ trả về ${res.code} — ${res.text.trim()}`);
        }
        return res;
      });
    },
    send(line) {
      socket.write(line + CRLF);
    },
    async cmd(line, expect) {
      this.send(line);
      return this.read(expect);
    }
  };
}

const b64 = s => Buffer.from(String(s), 'utf8').toString('base64');

/**
 * Lấy địa chỉ trần từ chuỗi kiểu `Tên <a@b.com>`.
 *
 * Giao thức SMTP chỉ nhận địa chỉ trần trong `MAIL FROM:` và `RCPT TO:` (RFC 5321);
 * đưa cả tên hiển thị vào sẽ thành `MAIL FROM:<Tên <a@b.com>>` và máy chủ trả
 * `555 5.5.2 Syntax error`. Tên hiển thị thuộc về tiêu đề thư, không thuộc giao thức.
 */
const bareAddr = s => {
  const v = String(s ?? '').trim();
  const m = v.match(/<([^<>]+)>\s*$/);
  return (m ? m[1] : v).trim();
};

/**
 * Gửi một email qua SMTP.
 * @param {object} cfg   { host, port, user, pass, secure, timeoutMs }
 * @param {object} mail  { from, fromName, to, subject, text, html, replyTo }
 */
export async function smtpSend(cfg, mail) {
  const { host, port, user, pass, secure = port === 465, timeoutMs = 15000 } = cfg;

  const socket = secure
    ? tls.connect({ host, port, servername: host })
    : net.connect({ host, port });

  await new Promise((resolve, reject) => {
    socket.once(secure ? 'secureConnect' : 'connect', resolve);
    socket.once('error', reject);
    socket.setTimeout(timeoutMs, () => { socket.destroy(); reject(new Error('SMTP: không kết nối được')); });
  });

  let conv = conversation(socket, timeoutMs);
  let active = socket;

  try {
    await conv.read([220]);
    let greeting = await conv.cmd(`EHLO aurix`, [250]);

    // Nâng cấp lên TLS nếu máy chủ hỗ trợ và ta chưa ở trong TLS
    if (!secure && /STARTTLS/i.test(greeting.text)) {
      await conv.cmd('STARTTLS', [220]);
      const upgraded = tls.connect({ socket, host, servername: host });
      await new Promise((resolve, reject) => {
        upgraded.once('secureConnect', resolve);
        upgraded.once('error', reject);
      });
      active = upgraded;
      conv = conversation(upgraded, timeoutMs);
      greeting = await conv.cmd(`EHLO aurix`, [250]);
    }

    // Xác thực
    if (user && pass) {
      if (/AUTH[ =-][^\r\n]*PLAIN/i.test(greeting.text)) {
        await conv.cmd(`AUTH PLAIN ${b64(`\0${user}\0${pass}`)}`, [235]);
      } else {
        await conv.cmd('AUTH LOGIN', [334]);
        await conv.cmd(b64(user), [334]);
        await conv.cmd(b64(pass), [235]);
      }
    }

    const fromAddr = bareAddr(mail.from || user);
    await conv.cmd(`MAIL FROM:<${fromAddr}>`, [250]);
    for (const rcpt of [].concat(mail.to)) {
      await conv.cmd(`RCPT TO:<${bareAddr(rcpt)}>`, [250, 251]);
    }
    await conv.cmd('DATA', [354]);

    conv.send(buildMessage({ ...mail, from: fromAddr }));
    conv.send('.');
    await conv.read([250]);

    await conv.cmd('QUIT', [221]).catch(() => {});
    return { ok: true };
  } finally {
    active.destroy();
    if (active !== socket) socket.destroy();
  }
}

/** Mã hoá tiêu đề theo RFC 2047 để giữ dấu tiếng Việt. */
const encodeHeader = s =>
  /^[\x20-\x7E]*$/.test(s) ? s : `=?UTF-8?B?${b64(s)}?=`;

/** Dấu chấm đầu dòng phải được nhân đôi, nếu không SMTP sẽ hiểu là kết thúc thư. */
const dotStuff = s => s.replace(/\r?\n/g, CRLF).replace(/^\./gm, '..');

function buildMessage(mail) {
  const boundary = `aurix-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  const fromHeader = mail.fromName
    ? `${encodeHeader(mail.fromName)} <${mail.from}>`
    : mail.from;

  const headers = [
    `From: ${fromHeader}`,
    `To: ${[].concat(mail.to).join(', ')}`,
    mail.replyTo ? `Reply-To: ${mail.replyTo}` : null,
    `Subject: ${encodeHeader(mail.subject)}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${boundary}@aurix>`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`
  ].filter(Boolean);

  const body = [
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    dotStuff(mail.text || ''),
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    dotStuff(mail.html || ''),
    '',
    `--${boundary}--`
  ];

  return headers.join(CRLF) + CRLF + CRLF + body.join(CRLF);
}
