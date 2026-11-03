import { HttpResponse } from 'msw';
import { db } from './db';
import { authenticateRequest, type DecodedToken } from './auth';
import type { AdminRole } from '@/types/api';

type GuardResult = { session: DecodedToken } | { response: Response };

function fail(status: number, code: string, message: string): { response: Response } {
  return { response: HttpResponse.json({ success: false, code, message, data: null }, { status }) };
}

/**
 * Mô phỏng filter của backend (tài liệu 04 mục 4.2): token sai hoặc thiếu thì 401,
 * sai loại tài khoản thì 403, và luôn đọc lại trạng thái từ db (bị khóa giữa phiên thì 403 ngay).
 */
export function requireUser(request: Request): GuardResult {
  const session = authenticateRequest(request);
  if (!session) return fail(401, 'AUTH_UNAUTHORIZED', 'Vui lòng đăng nhập để tiếp tục');
  if (session.accountType !== 'USER') return fail(403, 'AUTH_FORBIDDEN', 'Tài khoản quản trị không dùng được chức năng này');

  const user = db.getRawState().users.find((u) => u.id === session.sub);
  if (!user) return fail(401, 'AUTH_TOKEN_INVALID', 'Phiên đăng nhập không còn hợp lệ');
  if (user.status === 'BANNED') return fail(403, 'AUTH_ACCOUNT_BANNED', 'Tài khoản của bạn đã bị khóa');
  if (user.status === 'INACTIVE') return fail(403, 'AUTH_ACCOUNT_INACTIVE', 'Tài khoản đang tạm khóa');
  return { session };
}

export function requireAdmin(request: Request, roles: AdminRole[]): GuardResult {
  const session = authenticateRequest(request);
  if (!session) return fail(401, 'AUTH_UNAUTHORIZED', 'Vui lòng đăng nhập quản trị để tiếp tục');
  if (session.accountType !== 'ADMIN') return fail(403, 'AUTH_FORBIDDEN', 'Bạn không có quyền quản trị');

  const admin = db.getRawState().admins.find((a) => a.id === session.sub);
  if (!admin) return fail(401, 'AUTH_TOKEN_INVALID', 'Phiên đăng nhập không còn hợp lệ');
  if (admin.status !== 'ACTIVE') return fail(403, 'AUTH_ACCOUNT_BANNED', 'Tài khoản quản trị đã bị vô hiệu hóa');
  // Vai trò lấy từ db chứ không tin token
  if (!roles.includes(admin.adminRole as AdminRole)) {
    return fail(403, 'AUTH_FORBIDDEN', 'Vai trò của bạn không được phép thực hiện thao tác này');
  }
  return { session: { ...session, role: admin.adminRole } };
}
