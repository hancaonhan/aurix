/**
 * Phân quyền theo vai trò (RBAC).
 *
 * Quyền được đặt tên theo dạng `tài-nguyên.hành-động`. Vai trò là một tập quyền
 * có tên. Muốn thêm quyền mới: khai báo trong PERMISSIONS rồi gán vào ROLES —
 * không cần sửa bất kỳ handler nào ngoài việc gắn `permission:` cho tuyến.
 *
 * Ký tự `*` cho phép mọi quyền (chỉ dành cho vai trò chủ sở hữu).
 */

/** Toàn bộ quyền hệ thống hiểu được, kèm mô tả hiển thị trong bảng điều khiển. */
export const PERMISSIONS = {
  'leads.read':      'Xem danh sách khách tiềm năng',
  'leads.write':     'Đổi trạng thái, phân công, ghi chú khách tiềm năng',
  'leads.delete':    'Xoá khách tiềm năng',
  'leads.export':    'Kết xuất dữ liệu khách tiềm năng ra tệp',
  'diagnostics.read':'Xem kết quả chẩn đoán',
  'stats.read':      'Xem số liệu tổng quan',
  'mail.read':       'Xem hàng đợi thư',
  'mail.retry':      'Gửi lại thư lỗi',
  'content.read':    'Xem nội dung website',
  'content.write':   'Sửa, thêm, xoá nội dung website',
  'content.publish': 'Xuất bản — dựng lại website sau khi sửa nội dung',
  'settings.read':   'Xem cấu hình site',
  'settings.write':  'Sửa cấu hình site',
  'users.read':      'Xem danh sách tài khoản',
  'users.write':     'Tạo, sửa, khoá tài khoản',
  'audit.read':      'Xem nhật ký kiểm toán',
  'system.read':     'Xem trạng thái hệ thống',
  'system.write':    'Thao tác hệ thống (sao lưu, migration)'
};

/** Vai trò → quyền. Thứ tự trong đối tượng cũng là thứ bậc hiển thị. */
export const ROLES = {
  owner: {
    label: 'Chủ sở hữu',
    desc: 'Toàn quyền, kể cả quản lý tài khoản và hệ thống.',
    permissions: ['*']
  },
  admin: {
    label: 'Quản trị',
    desc: 'Vận hành toàn bộ nghiệp vụ, không đụng tới hệ thống.',
    permissions: [
      'leads.read', 'leads.write', 'leads.delete', 'leads.export',
      'diagnostics.read', 'stats.read', 'mail.read', 'mail.retry',
      'content.read', 'content.write', 'content.publish',
      'settings.read', 'settings.write', 'users.read', 'audit.read', 'system.read'
    ]
  },
  sales: {
    label: 'Kinh doanh',
    desc: 'Làm việc với khách tiềm năng được giao.',
    permissions: ['leads.read', 'leads.write', 'leads.export', 'diagnostics.read', 'stats.read']
  },
  editor: {
    label: 'Biên tập',
    desc: 'Sửa toàn bộ nội dung website và xuất bản.',
    permissions: ['content.read', 'content.write', 'content.publish', 'settings.read', 'settings.write', 'stats.read']
  },
  viewer: {
    label: 'Chỉ xem',
    desc: 'Xem số liệu, không thay đổi được gì.',
    permissions: ['leads.read', 'diagnostics.read', 'stats.read', 'content.read']
  }
};

export const ROLE_KEYS = Object.keys(ROLES);

export const isRole = r => Object.hasOwn(ROLES, r);

/** Tập quyền thực tế của một vai trò. */
export function permissionsOf(role) {
  const def = ROLES[role];
  if (!def) return new Set();
  if (def.permissions.includes('*')) return new Set(Object.keys(PERMISSIONS));
  return new Set(def.permissions);
}

/** @param {{role: string}} user */
export function can(user, permission) {
  if (!user || !user.active) return false;
  const def = ROLES[user.role];
  if (!def) return false;
  if (def.permissions.includes('*')) return true;
  return def.permissions.includes(permission);
}

/**
 * Một vai trò chỉ được quản lý vai trò thấp hơn hoặc ngang mình — ngăn tài
 * khoản quản trị tự nâng cấp thành chủ sở hữu.
 */
const RANK = { owner: 100, admin: 80, sales: 50, editor: 50, viewer: 10 };
export const rankOf = role => RANK[role] ?? 0;
export const canManageRole = (actorRole, targetRole) => rankOf(actorRole) > rankOf(targetRole) || actorRole === 'owner';

export default { PERMISSIONS, ROLES, can, permissionsOf, isRole, canManageRole, rankOf };
