/**
 * Nhật ký có cấu trúc.
 * Ở môi trường phát triển: một dòng gọn, có màu, dễ đọc bằng mắt.
 * Ở môi trường thật: JSON một dòng — hợp với mọi trình thu thập log trên hosting.
 */
import config from './config.js';

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40, silent: 99 };
const threshold = LEVELS[config.log.level] ?? LEVELS.info;

const COLOR = {
  debug: '\x1b[90m', info: '\x1b[36m', warn: '\x1b[33m', error: '\x1b[31m',
  gold: '\x1b[38;5;179m', dim: '\x1b[2m', reset: '\x1b[0m'
};

function emit(level, msg, fields) {
  if (LEVELS[level] < threshold) return;

  if (config.log.json) {
    process.stdout.write(JSON.stringify({
      t: new Date().toISOString(), level, msg, ...fields
    }) + '\n');
    return;
  }

  const time = new Date().toTimeString().slice(0, 8);
  const tail = fields && Object.keys(fields).length
    ? ' ' + COLOR.dim + Object.entries(fields).map(([k, v]) =>
        `${k}=${typeof v === 'object' ? JSON.stringify(v) : v}`).join(' ') + COLOR.reset
    : '';
  process.stdout.write(`${COLOR.dim}${time}${COLOR.reset} ${COLOR[level]}${level.padEnd(5)}${COLOR.reset} ${msg}${tail}\n`);
}

export const log = {
  debug: (msg, f) => emit('debug', msg, f),
  info: (msg, f) => emit('info', msg, f),
  warn: (msg, f) => emit('warn', msg, f),
  error: (msg, f) => emit('error', msg, f),

  /** Nhánh nhật ký gắn sẵn ngữ cảnh — ví dụ log.child({ module: 'leads' }). */
  child(base) {
    return {
      debug: (m, f) => emit('debug', m, { ...base, ...f }),
      info: (m, f) => emit('info', m, { ...base, ...f }),
      warn: (m, f) => emit('warn', m, { ...base, ...f }),
      error: (m, f) => emit('error', m, { ...base, ...f })
    };
  },

  /** Khối tiêu đề lúc khởi động — chỉ dùng ở chế độ người đọc. */
  banner(lines) {
    if (config.log.json) return;
    process.stdout.write('\n');
    for (const l of lines) process.stdout.write('  ' + l + '\n');
    process.stdout.write('\n');
  },
  c: COLOR
};

export default log;
