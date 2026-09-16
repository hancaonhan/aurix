/**
 * API quản trị nội dung website.
 *
 * Mỗi thao tác ghi đều để lại dấu vết kiểm toán kèm mã mục — nội dung công khai
 * là thứ khách hàng nhìn thấy, nên "ai đổi câu này" phải trả lời được.
 */
import * as content from '../services/content.js';
import { audit } from '../services/audit.js';

export function register(router) {
  /* ---------- Danh mục ---------- */
  router.get('/api/console/content', ctx =>
    ctx.json(200, { ok: true, ...content.listCollections(), publish: content.publishState() }),
    { permission: 'content.read', rateLimit: 'api' });

  /* ---------- Một bộ sưu tập ---------- */
  router.get('/api/console/content/c/:key', ctx =>
    ctx.json(200, { ok: true, ...content.listItems(ctx.params.key) }),
    { permission: 'content.read' });

  /* ---------- Thêm mục ---------- */
  router.post('/api/console/content/c/:key', async ctx => {
    const { data } = await ctx.body();
    const out = content.createItem(ctx.params.key, data, ctx.user.id);
    audit({
      actor: ctx.user, action: 'content.create', target: `${ctx.params.key}:${data?.[out.idField]}`,
      ipHash: ctx.ipHash
    });
    return ctx.json(201, { ok: true, ...out });
  }, { permission: 'content.write' });

  /* ---------- Sắp xếp lại ---------- *
   * Phải đứng TRƯỚC tuyến '/c/:key/:id': bộ định tuyến khớp theo thứ tự đăng
   * ký, nếu đảo lại thì ':id' sẽ nuốt mất chữ 'order'.                       */
  router.put('/api/console/content/c/:key/order', async ctx => {
    const { ids } = await ctx.body();
    const out = content.reorder(ctx.params.key, ids, ctx.user.id);
    audit({ actor: ctx.user, action: 'content.reorder', target: ctx.params.key, ipHash: ctx.ipHash });
    return ctx.json(200, { ok: true, ...out });
  }, { permission: 'content.write' });

  /* ---------- Sửa mục ---------- */
  router.put('/api/console/content/c/:key/:id', async ctx => {
    const { data } = await ctx.body();
    const out = content.saveItem(ctx.params.key, ctx.params.id, data, ctx.user.id);
    audit({
      actor: ctx.user, action: 'content.update', target: `${ctx.params.key}:${ctx.params.id}`,
      ipHash: ctx.ipHash
    });
    return ctx.json(200, { ok: true, ...out });
  }, { permission: 'content.write' });

  /* ---------- Xoá mục ---------- */
  router.delete('/api/console/content/c/:key/:id', ctx => {
    const out = content.deleteItem(ctx.params.key, ctx.params.id, ctx.user.id);
    audit({
      actor: ctx.user, action: 'content.delete', target: `${ctx.params.key}:${ctx.params.id}`,
      ipHash: ctx.ipHash
    });
    return ctx.json(200, { ok: true, ...out });
  }, { permission: 'content.write' });

  /* ---------- Khôi phục bản gốc ---------- */
  router.post('/api/console/content/c/:key/:id/restore', ctx => {
    const out = content.restoreItem(ctx.params.key, ctx.params.id);
    audit({
      actor: ctx.user, action: 'content.restore', target: `${ctx.params.key}:${ctx.params.id}`,
      ipHash: ctx.ipHash
    });
    return ctx.json(200, { ok: true, ...out });
  }, { permission: 'content.write' });

  /* ---------- Đối tượng đơn lẻ ---------- */
  router.get('/api/console/content/s/:key', ctx =>
    ctx.json(200, { ok: true, ...content.getSingleton(ctx.params.key) }),
    { permission: 'content.read' });

  router.put('/api/console/content/s/:key', async ctx => {
    const { data } = await ctx.body();
    const out = content.saveSingleton(ctx.params.key, data, ctx.user.id);
    audit({ actor: ctx.user, action: 'content.update', target: `s:${ctx.params.key}`, ipHash: ctx.ipHash });
    return ctx.json(200, { ok: true, ...out });
  }, { permission: 'content.write' });

  /* ---------- Xuất bản ---------- *
   * Dựng lại HTML tĩnh rồi kiểm định. Chạy lâu (vài giây) nên không đặt giới
   * hạn tần suất chung mà chặn bằng khoá một-lượt ở tầng dịch vụ.            */
  router.post('/api/console/content/publish', async ctx => {
    const result = await content.publish();
    audit({
      actor: ctx.user, action: 'content.publish', ipHash: ctx.ipHash,
      detail: { step: result.step, seconds: result.seconds },
      result: result.ok ? 'ok' : 'error'
    });
    return ctx.json(200, { ok: true, result });
  }, { permission: 'content.publish' });
}
