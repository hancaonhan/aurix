/**
 * Bộ token giao diện cho bảng điều khiển.
 *
 * Cùng bộ nhận diện với website (BRAND.md) nhưng dùng nền tối: xanh cổ vịt của
 * ảnh nhận diện gốc làm nền, cam làm điểm nhấn. Tách thành tệp riêng để khi
 * thương hiệu đổi màu, chỉ phải sửa một nơi.
 */
export const brand = {
  name: 'Aurix',
  positioning: 'Growth System Builder',
  line: 'Công nghệ • Giải pháp • Tăng trưởng',
  console: 'Bảng điều khiển'
};

export const tokens = `
  /* Nền — dải xanh cổ vịt của ảnh nhận diện gốc, đậm dần (xem BRAND.md).
     Bảng điều khiển giữ nền tối để đọc bảng số lâu không mỏi mắt. */
  --ink-900:#001B1B; --ink-800:#012B2B; --ink-700:#023536;
  --ink-600:#034446; --ink-500:#045152; --ink-400:#046E72;

  /* Cam — chấm chữ i trong logo. Tên biến --gold-* giữ lại để không phải sửa
     mọi quy tắc CSS bên dưới. */
  --gold-400:#FFB779; --gold-300:#F59A3E; --gold-200:#F27A1A; --gold-100:#DE6510;
  --gold-grad:linear-gradient(135deg,#F59A3E 0%,#F27A1A 55%,#DE6510 100%);

  --amber:#F27A1A; --amber-soft:rgba(242,122,26,.16);

  /* Chữ */
  --fg:#F2F7F7; --fg-soft:#B4CBCB; --fg-mute:#82A1A1;

  /* Đường & bề mặt */
  --line:rgba(242,122,26,.22); --line-soft:rgba(242,247,247,.09);
  --surface:rgba(255,255,255,.028); --surface-2:rgba(255,255,255,.05);

  /* Trạng thái */
  --good:#6EE7A8; --info:#7DD3FC; --violet:#A78BFA; --danger:#FF8080; --warn:#FFB35E;

  --font-display:'Be Vietnam Pro','Segoe UI',system-ui,sans-serif;
  --font-serif:'Be Vietnam Pro','Segoe UI',system-ui,sans-serif;
  --radius:18px; --radius-sm:12px;
  --ease:cubic-bezier(.22,1,.36,1);
  --shadow:0 30px 80px -20px rgba(0,0,0,.7);
`;

/** CSS của bảng điều khiển. Dùng đúng phông đã tự host trong public/css/fonts.css. */
export const css = `
@import url('/css/fonts.css');

:root{${tokens}}
*,*::before,*::after{box-sizing:border-box}
body{margin:0;background:var(--ink-800);color:var(--fg);
  font-family:var(--font-display);font-size:15px;line-height:1.62;
  -webkit-font-smoothing:antialiased}
a{color:var(--gold-300);text-decoration:none}
a:hover{text-decoration:underline}
button{font-family:inherit}

/* ---------- Bố cục ---------- */
.shell{display:grid;grid-template-columns:248px 1fr;min-height:100vh}
.side{background:var(--ink-900);border-right:1px solid var(--line-soft);
  padding:24px 18px;display:flex;flex-direction:column;gap:6px;position:sticky;top:0;height:100vh;overflow-y:auto}
.brand{display:flex;flex-direction:column;gap:2px;margin-bottom:26px;padding:0 8px}
/* Logo trắng chấm cam — bản dành cho nền tối, do scripts/brand.js sinh ra */
.brand .mark{display:block;line-height:0}
.brand .mark img{height:28px;width:auto}
.brand .sub{font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--fg-mute)}
.nav{display:flex;flex-direction:column;gap:2px}
.nav button{display:flex;align-items:center;gap:10px;width:100%;text-align:left;
  background:none;border:0;color:var(--fg-soft);padding:10px 12px;border-radius:10px;
  font-size:14px;cursor:pointer;transition:background .18s var(--ease),color .18s var(--ease)}
.nav button:hover{background:var(--surface);color:var(--fg)}
.nav button[aria-current="page"]{background:var(--surface-2);color:var(--gold-300);font-weight:600}
.nav .dot{width:5px;height:5px;border-radius:50%;background:currentColor;opacity:.75}
.side .foot{margin-top:auto;padding-top:18px;border-top:1px solid var(--line-soft);font-size:12.5px;color:var(--fg-mute)}
.side .foot b{display:block;color:var(--fg);font-weight:600;font-size:13.5px}
.side .foot .role{color:var(--gold-300);font-size:11.5px;letter-spacing:.08em;text-transform:uppercase}

main{padding:30px 34px 80px;max-width:1500px;min-width:0}
.head{display:flex;flex-wrap:wrap;gap:14px;align-items:flex-end;justify-content:space-between;
  padding-bottom:18px;border-bottom:1px solid var(--line-soft);margin-bottom:26px}
h1{margin:0;font-size:23px;font-weight:600;letter-spacing:-.02em}
h2{margin:0 0 14px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--gold-300)}
.lede{color:var(--fg-mute);font-size:13.5px;margin:4px 0 0}

/* ---------- Thành phần ---------- */
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(168px,1fr));gap:13px;margin-bottom:28px}
.card{padding:19px;border:1px solid var(--line-soft);border-radius:var(--radius-sm);background:var(--ink-700)}
.card .v{font-size:29px;font-weight:600;line-height:1.1;color:var(--gold-300);font-variant-numeric:tabular-nums}
.card .l{font-size:12px;color:var(--fg-mute);margin-top:7px}
.panel{border:1px solid var(--line-soft);border-radius:var(--radius);background:var(--ink-700);
  padding:22px;margin-bottom:22px}
.grid2{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:18px}

.tw{overflow-x:auto;border:1px solid var(--line-soft);border-radius:var(--radius-sm);background:var(--ink-700)}
table{width:100%;border-collapse:collapse;font-size:13.5px}
th{text-align:left;padding:12px 14px;font-size:10.5px;letter-spacing:.11em;text-transform:uppercase;
  color:var(--fg-mute);border-bottom:1px solid var(--line-soft);font-weight:600;white-space:nowrap}
td{padding:12px 14px;border-bottom:1px solid rgba(244,246,250,.045);vertical-align:top}
tbody tr:last-child td{border-bottom:0}
tbody tr:hover td{background:rgba(255,255,255,.022)}
td.num{font-variant-numeric:tabular-nums;white-space:nowrap}

.pill{display:inline-block;padding:3px 10px;border-radius:99px;font-size:11px;
  border:1px solid var(--line-soft);white-space:nowrap}
.t-info{color:var(--info);border-color:rgba(125,211,252,.32)}
.t-gold{color:var(--gold-300);border-color:rgba(232,196,104,.32)}
.t-violet{color:var(--violet);border-color:rgba(167,139,250,.32)}
.t-good{color:var(--good);border-color:rgba(110,231,168,.32)}
.t-mute{color:var(--fg-mute)}
.t-danger{color:var(--danger);border-color:rgba(255,128,128,.32)}

.btn{display:inline-flex;align-items:center;gap:7px;padding:8px 15px;border-radius:10px;
  border:1px solid var(--line);background:var(--surface);color:var(--fg);
  font-size:13px;font-weight:500;cursor:pointer;transition:all .18s var(--ease)}
.btn:hover{background:var(--surface-2);border-color:var(--gold-200)}
.btn.primary{background:var(--gold-grad);border-color:transparent;color:#fff;font-weight:700}
.btn.primary:hover{filter:brightness(1.07)}
.btn.danger{color:var(--danger);border-color:rgba(255,128,128,.3)}
.btn:disabled{opacity:.45;cursor:not-allowed}
.btn.sm{padding:5px 10px;font-size:12px;border-radius:8px}

input,select,textarea{background:var(--ink-600);color:var(--fg);border:1px solid var(--line-soft);
  border-radius:9px;padding:9px 11px;font-size:13.5px;font-family:inherit;width:100%}
input:focus,select:focus,textarea:focus{outline:2px solid var(--gold-200);outline-offset:1px;border-color:transparent}
label{display:block;font-size:12px;color:var(--fg-mute);margin-bottom:5px}
.field{margin-bottom:15px}
.field .help{font-size:12px;color:var(--fg-mute);margin-top:5px}
.row{display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end}
.row>*{flex:1 1 150px}
.row .shrink{flex:0 0 auto}
input[type=checkbox]{width:17px;height:17px;accent-color:var(--gold-200)}

.empty{padding:54px 20px;text-align:center;color:var(--fg-mute)}
.muted{color:var(--fg-mute);font-size:12.5px}
.msg{max-width:320px;color:var(--fg-soft);font-size:12.5px}
.bar{height:6px;border-radius:99px;background:var(--surface-2);overflow:hidden}
.bar i{display:block;height:100%;background:var(--gold-grad)}

/* ---------- Thông báo nổi ---------- */
.toast{position:fixed;right:22px;bottom:22px;z-index:60;display:flex;flex-direction:column;gap:9px;max-width:380px}
.toast div{padding:12px 16px;border-radius:11px;border:1px solid var(--line);
  background:var(--ink-600);box-shadow:var(--shadow);font-size:13.5px;animation:rise .3s var(--ease)}
.toast .bad{border-color:rgba(255,128,128,.4);color:#FFD9D9}
.toast .good{border-color:rgba(110,231,168,.4)}
@keyframes rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}

/* ---------- Ngăn kéo chi tiết ---------- */
.drawer{position:fixed;inset:0;z-index:50;display:none}
.drawer[open]{display:block}
.drawer .scrim{position:absolute;inset:0;background:rgba(7,12,21,.72);backdrop-filter:blur(3px)}
.drawer .body{position:absolute;right:0;top:0;bottom:0;width:min(560px,100%);background:var(--ink-700);
  border-left:1px solid var(--line);padding:26px;overflow-y:auto;animation:slide .3s var(--ease)}
@keyframes slide{from{transform:translateX(24px);opacity:0}to{transform:none;opacity:1}}
.kv{display:grid;grid-template-columns:120px 1fr;gap:8px 14px;font-size:13.5px;margin-bottom:20px}
.kv dt{color:var(--fg-mute);font-size:12.5px}
.kv dd{margin:0;word-break:break-word}
.note{border-left:2px solid var(--line);padding:9px 0 9px 13px;margin-bottom:11px}
.note .meta{font-size:11.5px;color:var(--fg-mute);margin-bottom:3px}

/* ---------- Đăng nhập ---------- */
.login{min-height:100vh;display:grid;place-items:center;padding:24px;
  background:radial-gradient(1200px 600px at 50% -10%,rgba(4,110,114,.35),transparent 60%),var(--ink-900)}
.login form{width:100%;max-width:392px;border:1px solid var(--line);border-radius:var(--radius);
  background:var(--ink-700);padding:34px;box-shadow:var(--shadow)}
.login .mark{line-height:0;text-align:center;margin-bottom:12px}
.login .mark img{height:40px;width:auto;display:inline-block}
.login .tag{text-align:center;font-size:10.5px;letter-spacing:.24em;text-transform:uppercase;
  color:var(--fg-mute);margin-bottom:28px}
.login .btn{width:100%;justify-content:center;margin-top:8px}
.login .err{background:rgba(255,128,128,.1);border:1px solid rgba(255,128,128,.35);color:#FFD9D9;
  padding:10px 13px;border-radius:9px;font-size:13px;margin-bottom:16px}

@media (max-width:900px){
  .shell{grid-template-columns:1fr}
  .side{position:static;height:auto;flex-direction:row;flex-wrap:wrap;align-items:center;gap:10px}
  .brand{margin:0 16px 0 0}
  .nav{flex-direction:row;flex-wrap:wrap}
  .side .foot{margin:0;padding:0;border:0;width:100%}
  main{padding:22px 16px 60px}
}
`;
