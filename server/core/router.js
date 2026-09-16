/**
 * Bộ định tuyến tối giản — không phụ thuộc gói ngoài.
 *
 * Thiết kế để dễ mở rộng: mỗi module tính năng tự khai báo tuyến của mình
 * (xem server/modules/*.js), rồi được nạp một lần ở server/app.js. Thêm tính
 * năng mới = thêm một tệp module, không phải sửa bộ định tuyến.
 *
 *   router.get('/api/leads/:id', handler, { auth: true, permission: 'leads.read' })
 *
 * Handler nhận `ctx` (xem core/context.js) và trả về:
 *   - một đối tượng  → phản hồi JSON 200
 *   - `undefined`    → handler đã tự ghi phản hồi
 *   - ném AppError   → bộ xử lý lỗi dịch thành phản hồi chuẩn
 */
export class Router {
  constructor() {
    /** @type {Map<string, Array>} method → danh sách tuyến */
    this.routes = new Map();
    this.middlewares = [];
  }

  /** Middleware chạy trước mọi tuyến, theo thứ tự đăng ký. */
  use(fn) {
    this.middlewares.push(fn);
    return this;
  }

  add(method, pattern, handler, options = {}) {
    method = method.toUpperCase();
    if (!this.routes.has(method)) this.routes.set(method, []);
    this.routes.get(method).push({ ...compile(pattern), handler, options, pattern, method });
    return this;
  }

  get(p, h, o) { return this.add('GET', p, h, o); }
  post(p, h, o) { return this.add('POST', p, h, o); }
  put(p, h, o) { return this.add('PUT', p, h, o); }
  patch(p, h, o) { return this.add('PATCH', p, h, o); }
  delete(p, h, o) { return this.add('DELETE', p, h, o); }

  /**
   * Tìm tuyến khớp.
   * @returns {{route, params}|null}  null nghĩa là không tuyến nào khớp
   */
  match(method, pathname) {
    for (const route of this.routes.get(method.toUpperCase()) || []) {
      const m = route.regex.exec(pathname);
      if (!m) continue;
      const params = {};
      route.keys.forEach((k, i) => { params[k] = decodeURIComponent(m[i + 1]); });
      return { route, params };
    }
    return null;
  }

  /** Các phương thức khả dụng cho một đường dẫn — dùng cho phản hồi 405. */
  methodsFor(pathname) {
    const out = [];
    for (const [method, routes] of this.routes) {
      if (routes.some(r => r.regex.test(pathname))) out.push(method);
    }
    return out;
  }

  /** Liệt kê toàn bộ tuyến — dùng cho `node server/cli.js routes`. */
  list() {
    const out = [];
    for (const [method, routes] of this.routes) {
      for (const r of routes) out.push({ method, pattern: r.pattern, ...r.options });
    }
    return out.sort((a, b) => a.pattern.localeCompare(b.pattern));
  }
}

/** '/api/leads/:id' → biểu thức chính quy + danh sách tên tham số. */
function compile(pattern) {
  const keys = [];
  const source = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/:([A-Za-z_]\w*)/g, (_, key) => { keys.push(key); return '([^/]+)'; })
    .replace(/\*$/, '.*');
  return { regex: new RegExp(`^${source}/?$`), keys };
}

export default Router;
