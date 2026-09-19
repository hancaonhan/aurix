/**
 * API khách tiềm năng cho bảng điều khiển.
 *
 * Mỗi tuyến khai báo đúng một quyền. Người có quyền rộng (`leads.delete`, tức
 * quản trị trở lên) nhìn thấy toàn bộ; nhân viên kinh doanh chỉ nhìn thấy khách
 * chưa ai nhận hoặc do chính mình phụ trách — phạm vi này do tầng nghiệp vụ áp
 * đặt, không phải do giao diện tự giấu bớt.
 */
import * as leads from '../services/leads.js';
import { can } from '../security/rbac.js';
import { audit } from '../services/audit.js';
import { err } from '../core/errors.js';

const scoped = ctx => !can(ctx.user, 'leads.delete');

export function register(router) {
  /* ---------- Danh sách ---------- */
  router.get('/api/console/leads', async ctx => {
    const data = await leads.listLeads({
      limit: Number(ctx.query.limit) || 50,
      offset: Number(ctx.query.offset) || 0,
      status: ctx.query.status,
      source: ctx.query.source,
      industry: ctx.query.industry,
      assignedTo: ctx.query.assignedTo,
      q: ctx.query.q,
      sort: ctx.query.sort,
      dir: ctx.query.dir,
      viewer: ctx.user,
      scopeToViewer: scoped(ctx)
    });
    return ctx.json(200, { ok: true, ...data, statuses: leads.LEAD_STATUSES });
  }, { permission: 'leads.read', rateLimit: 'api' });

  /* ---------- Một khách ---------- */
  router.get('/api/console/leads/:id', async ctx => {
    const lead = await leads.getLead(ctx.params.id);
    if (scoped(ctx) && lead.assignedTo && lead.assignedTo !== ctx.user.id) throw err.forbidden();
    return ctx.json(200, { ok: true, lead });
  }, { permission: 'leads.read' });

  /* ---------- Đổi trạng thái ---------- */
  router.patch('/api/console/leads/:id/status', async ctx => {
    const lead = await leads.getLead(ctx.params.id);
    leads.assertCanEdit(lead, ctx.user);

    const { status } = await ctx.body();
    await leads.setStatus(lead.id, status);
    audit({
      actor: ctx.user, action: 'lead.status.change', target: `lead:${lead.id}`,
      detail: { from: lead.status, to: status }, ipHash: ctx.ipHash
    });
    return ctx.json(200, { ok: true, lead: await leads.getLead(lead.id) });
  }, { permission: 'leads.write' });

  /* ---------- Phân công ---------- */
  router.patch('/api/console/leads/:id/assign', async ctx => {
    const lead = await leads.getLead(ctx.params.id);
    leads.assertCanEdit(lead, ctx.user);

    const body = await ctx.body();
    const userId = body.userId === null || body.userId === '' ? null : Number(body.userId);

    // Nhân viên kinh doanh chỉ được tự nhận việc, không được đẩy sang người khác.
    if (scoped(ctx) && userId !== null && userId !== ctx.user.id) {
      throw err.forbidden('Bạn chỉ có thể tự nhận khách này.');
    }

    await leads.assign(lead.id, userId);
    audit({
      actor: ctx.user, action: 'lead.assign', target: `lead:${lead.id}`,
      detail: { to: userId }, ipHash: ctx.ipHash
    });
    return ctx.json(200, { ok: true, lead: await leads.getLead(lead.id) });
  }, { permission: 'leads.write' });

  /* ---------- Giá trị hợp đồng ---------- */
  router.patch('/api/console/leads/:id/value', async ctx => {
    const lead = await leads.getLead(ctx.params.id);
    leads.assertCanEdit(lead, ctx.user);

    const { valueVnd } = await ctx.body();
    await leads.setValue(lead.id, valueVnd);
    audit({
      actor: ctx.user, action: 'lead.value.set', target: `lead:${lead.id}`,
      detail: { valueVnd }, ipHash: ctx.ipHash
    });
    return ctx.json(200, { ok: true, lead: await leads.getLead(lead.id) });
  }, { permission: 'leads.write' });

  /* ---------- Ghi chú ---------- */
  router.post('/api/console/leads/:id/notes', async ctx => {
    const lead = await leads.getLead(ctx.params.id);
    leads.assertCanEdit(lead, ctx.user);

    const { body } = await ctx.body();
    const id = await leads.addNote(lead.id, { body, author: ctx.user });
    audit({ actor: ctx.user, action: 'lead.note.add', target: `lead:${lead.id}`, ipHash: ctx.ipHash });
    return ctx.json(201, { ok: true, id, notes: await leads.listNotes(lead.id) });
  }, { permission: 'leads.write' });

  /* ---------- Xoá ---------- */
  router.delete('/api/console/leads/:id', async ctx => {
    await leads.deleteLead(ctx.params.id);
    audit({ actor: ctx.user, action: 'lead.delete', target: `lead:${ctx.params.id}`, ipHash: ctx.ipHash });
    return ctx.json(200, { ok: true });
  }, { permission: 'leads.delete' });

  /* ---------- Kết xuất CSV ---------- *
   * Kết xuất là hành vi mang dữ liệu cá nhân ra khỏi hệ thống, nên luôn được
   * ghi vào nhật ký kiểm toán kèm bộ lọc đã dùng.                            */
  router.get('/api/console/leads.csv', async ctx => {
    const csv = await leads.exportCsv({
      status: ctx.query.status,
      source: ctx.query.source,
      q: ctx.query.q,
      viewer: ctx.user,
      scopeToViewer: scoped(ctx)
    });
    audit({
      actor: ctx.user, action: 'lead.export', detail: { filters: ctx.query }, ipHash: ctx.ipHash
    });
    const stamp = new Date().toISOString().slice(0, 10);
    return ctx.download(200, csv, `aurix-khach-tiem-nang-${stamp}.csv`);
  }, { permission: 'leads.export' });
}
