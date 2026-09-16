#!/usr/bin/env node
/**
 * AURIX — Công cụ dòng lệnh vận hành.
 *
 *   node server/cli.js <lệnh> [tham số]
 *
 * Đây là cách vận hành hệ thống trên hosting: mọi việc quản trị đều làm được
 * bằng một lệnh gõ qua SSH, không cần mở giao diện, không cần sửa cơ sở dữ liệu
 * bằng tay. Mỗi lệnh in ra kết quả rõ ràng và trả mã thoát chuẩn (0 thành công,
 * 1 thất bại) để dùng được trong script và CI.
 */
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { copyFileSync, mkdirSync, readdirSync, statSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';

import config, { auditConfig } from './core/config.js';
import db, { migrate, schemaStatus } from './db/index.js';
import * as users from './services/users.js';
import { listAudit, pruneAudit, audit } from './services/audit.js';
import { SCHEMA, allSettings, setSetting } from './services/settings.js';
import { ROLES, PERMISSIONS, permissionsOf } from './security/rbac.js';
import { generatePassword } from './security/password.js';
import { purgeExpiredSessions, destroyUserSessions } from './security/session.js';
import { mailStats } from './lib/db.js';
import { drainOutbox, mailEnabled } from './lib/mailer.js';

const C = {
  gold: '\x1b[38;5;179m', dim: '\x1b[2m', red: '\x1b[31m', green: '\x1b[32m',
  yellow: '\x1b[33m', bold: '\x1b[1m', reset: '\x1b[0m'
};
const say = (...a) => console.log(...a);
const ok = m => say(`${C.green}✓${C.reset} ${m}`);
const bad = m => { console.error(`${C.red}✗${C.reset} ${m}`); process.exitCode = 1; };
const title = m => say(`\n${C.gold}${C.bold}${m}${C.reset}\n${C.dim}${'─'.repeat(m.length)}${C.reset}`);

const [, , command = 'help', ...args] = process.argv;

/** Đọc cờ dạng --key=value hoặc --key value. */
function flag(name, fallback = undefined) {
  const eq = args.find(a => a.startsWith(`--${name}=`));
  if (eq) return eq.slice(name.length + 3);
  const i = args.indexOf(`--${name}`);
  if (i !== -1 && args[i + 1] && !args[i + 1].startsWith('--')) return args[i + 1];
  if (i !== -1) return true;
  return fallback;
}

/**
 * Hỏi một câu. Mật khẩu không hiện lại trên màn hình.
 *
 * Khi đầu vào không phải bàn phím thật — chạy qua SSH không cấp TTY, trong
 * script triển khai, hay trong CI — thì không hỏi mà trả về rỗng ngay: treo im
 * lặng chờ một phím sẽ không bao giờ tới là kiểu hỏng khó chẩn đoán nhất.
 * Nơi gọi tự quyết định: sinh giá trị thay thế, hoặc báo lỗi rõ ràng.
 */
async function ask(question, { secret = false } = {}) {
  if (!stdin.isTTY) return '';

  const rl = createInterface({ input: stdin, output: stdout, terminal: true });
  if (!secret) {
    const answer = await rl.question(question);
    rl.close();
    return answer.trim();
  }
  // Tắt echo thủ công: readline không có chế độ nhập mật khẩu sẵn.
  const onData = () => { stdout.write('\x1b[2K\r' + question); };
  stdout.write(question);
  stdin.on('data', onData);
  const answer = await rl.question('');
  stdin.off('data', onData);
  rl.close();
  stdout.write('\n');
  return answer.trim();
}

const COMMANDS = {

  /* ================= Trợ giúp ================= */
  async help() {
    say(`
${C.gold}${C.bold}AURIX${C.reset} — công cụ vận hành

  ${C.bold}Hệ thống${C.reset}
    doctor                    Kiểm tra cấu hình và tình trạng trước khi chạy thật
    secret                    Sinh một chuỗi bí mật đủ mạnh cho .env
    migrate                   Đưa lược đồ cơ sở dữ liệu lên bản mới nhất
    db:status                 Trạng thái lược đồ và kích thước dữ liệu
    routes                    Liệt kê toàn bộ tuyến API kèm quyền yêu cầu
    backup [--keep=14]        Sao lưu cơ sở dữ liệu, giữ lại N bản gần nhất
    purge:sessions            Xoá phiên đăng nhập đã hết hạn

  ${C.bold}Tài khoản${C.reset}
    user:create [--email= --name= --role= --password=]
    user:list                 Danh sách tài khoản
    user:role <email> <vai-trò>
    user:password <email>     Đặt lại mật khẩu (sinh mật khẩu tạm nếu không nhập)
    user:lock <email>         Khoá tài khoản và đăng xuất mọi thiết bị
    user:unlock <email>       Mở khoá tài khoản
    roles                     Bảng vai trò và quyền

  ${C.bold}Vận hành${C.reset}
    settings:list             Toàn bộ tham số site đang áp dụng
    settings:set <khoá> <giá trị>
    mail:status               Tình trạng hàng đợi thư
    mail:drain                Đẩy hàng đợi thư ngay lập tức
    audit:tail [--limit=50]   Nhật ký kiểm toán gần nhất
    audit:prune [--days=365]  Xoá nhật ký cũ

  ${C.dim}Ví dụ: node server/cli.js user:create --email=an@aurixvietnam.vn --name="Nguyễn An" --role=admin${C.reset}
`);
  },

  /* ================= Hệ thống ================= */
  async doctor() {
    title('Kiểm tra cấu hình');

    const checks = [
      ['Môi trường', config.env, true],
      ['Origin công khai', config.origin, config.isDev || config.origin.startsWith('https://')],
      ['Tệp cơ sở dữ liệu', config.dbPath, true],
      ['Lược đồ', `v${schemaStatus().latest}`, schemaStatus().pending.length === 0],
      ['Bí mật phiên', config.security.sessionSecret ? 'đã đặt' : 'THIẾU', config.security.sessionSecret.length >= 32],
      ['Muối băm IP', process.env.AURIX_IP_SALT ? 'đã đặt' : 'ngẫu nhiên mỗi lần khởi động', Boolean(process.env.AURIX_IP_SALT) || config.isDev],
      ['Cookie Secure', config.security.secureCookies ? 'bật' : 'tắt', config.security.secureCookies || config.isDev],
      ['Lớp proxy tin cậy', String(config.trustProxy), true],
      ['SMTP', mailEnabled ? 'đã cấu hình' : 'chưa cấu hình', mailEnabled || config.isDev],
      ['Tài khoản nội bộ', String(users.countUsers()), users.countUsers() > 0]
    ];

    for (const [label, value, pass] of checks) {
      const mark = pass ? `${C.green}✓${C.reset}` : `${C.yellow}!${C.reset}`;
      say(`  ${mark} ${label.padEnd(22)} ${C.dim}${value}${C.reset}`);
    }

    const warnings = auditConfig();
    if (warnings.length) {
      say('');
      for (const w of warnings) say(`  ${C.yellow}!${C.reset} ${w}`);
    }

    const failed = checks.filter(([, , pass]) => !pass).length;
    say('');
    if (failed) bad(`${failed} hạng mục cần xử lý trước khi chạy thật.`);
    else ok('Mọi hạng mục đều đạt.');
  },

  async secret() {
    say(randomBytes(32).toString('hex'));
  },

  async migrate() {
    const applied = migrate();
    if (applied.length) applied.forEach(n => ok(`Đã áp dụng: ${n}`));
    else ok('Lược đồ đã ở bản mới nhất.');
  },

  async 'db:status'() {
    const s = schemaStatus();
    title('Lược đồ cơ sở dữ liệu');
    for (const m of s.applied) say(`  ${C.green}${String(m.id).padStart(3)}${C.reset}  ${m.name}  ${C.dim}${m.applied_at}${C.reset}`);
    for (const m of s.pending) say(`  ${C.yellow}${String(m.id).padStart(3)}${C.reset}  ${m.name}  ${C.dim}chưa chạy${C.reset}`);

    let size = 0;
    try { size = statSync(config.dbPath).size; } catch { /* chưa có tệp */ }
    const counts = ['leads', 'diagnostics', 'users', 'sessions', 'audit_log', 'outbox']
      .map(t => `${t}=${db.prepare(`SELECT COUNT(*) c FROM ${t}`).get().c}`);

    say(`\n  Tệp    ${config.dbPath}`);
    say(`  Cỡ     ${(size / 1048576).toFixed(2)} MB`);
    say(`  Bảng   ${counts.join('  ')}`);
  },

  async routes() {
    const { router } = await import('./app.js');
    title(`Tuyến API (${router.list().length})`);
    for (const r of router.list()) {
      const need = r.permission ? `${C.gold}${r.permission}${C.reset}`
        : r.auth ? `${C.dim}cần đăng nhập${C.reset}`
        : `${C.dim}công khai${C.reset}`;
      say(`  ${r.method.padEnd(7)} ${r.pattern.padEnd(42)} ${need}`);
    }
  },

  async backup() {
    const keep = Number(flag('keep', 14));
    mkdirSync(config.backupDir, { recursive: true });

    // Ép SQLite gộp WAL vào tệp chính trước khi chép, nếu không bản sao có thể
    // thiếu những giao dịch mới nhất.
    db.exec('PRAGMA wal_checkpoint(TRUNCATE);');

    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const target = join(config.backupDir, `aurix-${stamp}.db`);
    copyFileSync(config.dbPath, target);
    ok(`Đã sao lưu: ${target} (${(statSync(target).size / 1048576).toFixed(2)} MB)`);

    const olds = readdirSync(config.backupDir)
      .filter(f => f.startsWith('aurix-') && f.endsWith('.db'))
      .sort().reverse().slice(keep);
    for (const f of olds) {
      unlinkSync(join(config.backupDir, f));
      say(`  ${C.dim}đã xoá bản cũ: ${f}${C.reset}`);
    }
  },

  async 'purge:sessions'() {
    ok(`Đã xoá ${purgeExpiredSessions()} phiên hết hạn.`);
  },

  /* ================= Tài khoản ================= */
  async 'user:create'() {
    const email = flag('email') || await ask('Email: ');
    const name = flag('name') || await ask('Họ tên: ');

    if (!email || !name) {
      return bad('Thiếu thông tin. Khi chạy không có bàn phím, hãy truyền đủ tham số:\n' +
        '    node server/cli.js user:create --email=... --name="..." --role=owner');
    }
    const role = flag('role') || await ask(`Vai trò (${Object.keys(ROLES).join(', ')}) [viewer]: `) || 'viewer';

    let password = flag('password');
    let generated = false;
    if (!password) {
      password = await ask('Mật khẩu (Enter để sinh tự động): ', { secret: true });
      if (!password) { password = generatePassword(); generated = true; }
    }

    // Tài khoản đầu tiên của hệ thống mặc định là chủ sở hữu, nếu không sẽ
    // không có ai đủ quyền tạo những tài khoản còn lại.
    const first = users.countUsers() === 0;
    const finalRole = first ? 'owner' : role;
    if (first && role !== 'owner') {
      say(`  ${C.yellow}!${C.reset} Đây là tài khoản đầu tiên — tự động đặt vai trò ${C.bold}owner${C.reset}.`);
    }

    const user = await users.createUser({
      email, name, role: finalRole, password, mustChangePassword: generated
    });
    audit({ action: 'user.create', target: `user:${user.id}`, detail: { via: 'cli', role: finalRole } });

    ok(`Đã tạo ${user.email} · ${ROLES[user.role].label}`);
    if (generated) {
      say(`\n  Mật khẩu tạm: ${C.bold}${C.gold}${password}${C.reset}`);
      say(`  ${C.dim}Chỉ hiện một lần. Người dùng phải đổi ngay ở lần đăng nhập đầu tiên.${C.reset}\n`);
    }
  },

  async 'user:list'() {
    const rows = users.listUsers();
    if (!rows.length) return say('  Chưa có tài khoản nào. Tạo bằng: node server/cli.js user:create');
    title(`Tài khoản (${rows.length})`);
    for (const u of rows) {
      const status = !u.active ? `${C.red}đã khoá${C.reset}`
        : u.mustChangePassword ? `${C.yellow}mật khẩu tạm${C.reset}`
        : `${C.green}hoạt động${C.reset}`;
      say(`  ${String(u.id).padStart(3)}  ${u.email.padEnd(32)} ${ROLES[u.role]?.label.padEnd(12) || u.role}  ${status}`);
      say(`       ${C.dim}${u.name} · đăng nhập gần nhất: ${u.lastLoginAt || 'chưa bao giờ'}${C.reset}`);
    }
  },

  async 'user:role'() {
    const [email, role] = args.filter(a => !a.startsWith('--'));
    if (!email || !role) return bad('Cú pháp: user:role <email> <vai-trò>');
    if (!ROLES[role]) return bad(`Vai trò không tồn tại. Chọn một trong: ${Object.keys(ROLES).join(', ')}`);

    const row = users.getUserByEmail(email);
    if (!row) return bad('Không tìm thấy tài khoản.');

    users.updateUser(row.id, { role });
    audit({ action: 'user.update', target: `user:${row.id}`, detail: { via: 'cli', role } });
    ok(`${email} → ${ROLES[role].label}. Tài khoản đã bị đăng xuất khỏi mọi thiết bị.`);
  },

  async 'user:password'() {
    const [email] = args.filter(a => !a.startsWith('--'));
    if (!email) return bad('Cú pháp: user:password <email>');

    const row = users.getUserByEmail(email);
    if (!row) return bad('Không tìm thấy tài khoản.');

    let password = flag('password') || await ask('Mật khẩu mới (Enter để sinh tự động): ', { secret: true });
    const generated = !password;
    if (generated) password = generatePassword();

    await users.setPassword(row.id, password, { mustChange: generated });
    audit({ action: 'user.password.reset', target: `user:${row.id}`, detail: { via: 'cli' } });

    ok(`Đã đổi mật khẩu cho ${email}.`);
    if (generated) say(`\n  Mật khẩu tạm: ${C.bold}${C.gold}${password}${C.reset}\n`);
  },

  async 'user:lock'() {
    const [email] = args.filter(a => !a.startsWith('--'));
    const row = users.getUserByEmail(email || '');
    if (!row) return bad('Không tìm thấy tài khoản.');
    users.updateUser(row.id, { active: false });
    destroyUserSessions(row.id);
    audit({ action: 'user.lock', target: `user:${row.id}`, detail: { via: 'cli' } });
    ok(`Đã khoá ${email} và đăng xuất khỏi mọi thiết bị.`);
  },

  async 'user:unlock'() {
    const [email] = args.filter(a => !a.startsWith('--'));
    const row = users.getUserByEmail(email || '');
    if (!row) return bad('Không tìm thấy tài khoản.');
    users.updateUser(row.id, { active: true });
    audit({ action: 'user.unlock', target: `user:${row.id}`, detail: { via: 'cli' } });
    ok(`Đã mở khoá ${email}.`);
  },

  async roles() {
    title('Vai trò');
    for (const [key, role] of Object.entries(ROLES)) {
      say(`\n  ${C.bold}${role.label}${C.reset} ${C.dim}· ${key}${C.reset}`);
      say(`  ${C.dim}${role.desc}${C.reset}`);
      for (const p of permissionsOf(key)) say(`    ${C.gold}•${C.reset} ${p.padEnd(20)} ${C.dim}${PERMISSIONS[p]}${C.reset}`);
    }
  },

  /* ================= Vận hành ================= */
  async 'settings:list'() {
    const values = allSettings();
    title('Tham số site');
    for (const [key, def] of Object.entries(SCHEMA)) {
      const changed = String(values[key]) !== String(def.default);
      say(`  ${changed ? C.gold : C.dim}${key.padEnd(32)}${C.reset} ${String(values[key])}`);
      if (changed) say(`  ${' '.repeat(32)} ${C.dim}mặc định: ${def.default}${C.reset}`);
    }
  },

  async 'settings:set'() {
    const [key, ...rest] = args.filter(a => !a.startsWith('--'));
    if (!key || !rest.length) return bad('Cú pháp: settings:set <khoá> <giá trị>');
    const value = setSetting(key, rest.join(' '));
    audit({ action: 'settings.update', detail: { via: 'cli', key, to: value } });
    ok(`${key} = ${value}`);
  },

  async 'mail:status'() {
    title('Hàng đợi thư');
    say(`  SMTP    ${mailEnabled ? `${C.green}đã cấu hình${C.reset}` : `${C.yellow}chưa cấu hình (chế độ nháp)${C.reset}`}`);
    const stats = mailStats();
    for (const [status, count] of Object.entries(stats)) say(`  ${status.padEnd(8)}${count}`);
    if (!Object.keys(stats).length) say('  (hàng đợi trống)');
  },

  async 'mail:drain'() {
    const before = mailStats().pending || 0;
    await drainOutbox();
    const after = mailStats().pending || 0;
    ok(`Đã xử lý ${Math.max(0, before - after)} thư. Còn chờ: ${after}.`);
  },

  async 'audit:tail'() {
    const rows = listAudit({ limit: Number(flag('limit', 50)), action: flag('action') });
    title(`Nhật ký kiểm toán (${rows.length})`);
    for (const r of rows.reverse()) {
      const mark = r.result === 'ok' ? `${C.green}✓${C.reset}` : `${C.red}✗${C.reset}`;
      say(`  ${mark} ${C.dim}${r.created_at}${C.reset}  ${(r.actor_email || 'khách').padEnd(28)} ${C.gold}${r.action}${C.reset} ${r.target || ''}`);
      if (r.detail) say(`      ${C.dim}${r.detail}${C.reset}`);
    }
  },

  async 'audit:prune'() {
    const days = Number(flag('days', 365));
    ok(`Đã xoá ${pruneAudit(days)} bản ghi cũ hơn ${days} ngày.`);
  }
};

const run = COMMANDS[command];
if (!run) {
  bad(`Không có lệnh "${command}".`);
  await COMMANDS.help();
  process.exit(1);
}

try {
  await run();
} catch (error) {
  bad(error.message);
  if (process.env.AURIX_DEBUG) console.error(error);
  process.exit(1);
}
process.exit(process.exitCode ?? 0);
