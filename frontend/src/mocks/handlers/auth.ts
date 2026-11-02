import { http, HttpResponse } from 'msw';
import { db } from '../db';
import { authenticateRequest, createMockToken } from '../auth';
import { applySimulatedLatency } from '../faults';
import type { LoginRequest, RegisterRequest } from '@/types/api';

export const authHandlers = [
  // 1. Đăng ký tài khoản người dùng
  http.post('*/api/auth/register', async ({ request }) => {
    const isFault = await applySimulatedLatency();
    if (isFault) {
      return HttpResponse.json({ success: false, code: 'INTERNAL_ERROR', message: 'Lỗi mô phỏng', data: null }, { status: 500 });
    }

    try {
      const body = (await request.json()) as RegisterRequest;
      const res = db.registerUser(body);
      return HttpResponse.json(res.body, { status: res.status });
    } catch {
      return HttpResponse.json({ success: false, code: 'BAD_REQUEST', message: 'Dữ liệu không hợp lệ', data: null }, { status: 400 });
    }
  }),

  // 2. Đăng nhập người dùng thông thường
  http.post('*/api/auth/login', async ({ request }) => {
    const isFault = await applySimulatedLatency();
    if (isFault) {
      return HttpResponse.json({ success: false, code: 'INTERNAL_ERROR', message: 'Lỗi mô phỏng', data: null }, { status: 500 });
    }

    try {
      const body = (await request.json()) as LoginRequest;
      const username = body.username || body.account || '';
      const res = db.loginUser(username, body.password);
      return HttpResponse.json(res.body, { status: res.status });
    } catch {
      return HttpResponse.json({ success: false, code: 'BAD_REQUEST', message: 'Dữ liệu không hợp lệ', data: null }, { status: 400 });
    }
  }),

  // 3. Đăng nhập quản trị viên (Admin)
  http.post('*/api/auth/admin/login', async ({ request }) => {
    const isFault = await applySimulatedLatency();
    if (isFault) {
      return HttpResponse.json({ success: false, code: 'INTERNAL_ERROR', message: 'Lỗi mô phỏng', data: null }, { status: 500 });
    }

    try {
      const body = (await request.json()) as LoginRequest;
      const account = body.account || body.username || '';
      const res = db.loginAdmin(account, body.password);
      return HttpResponse.json(res.body, { status: res.status });
    } catch {
      return HttpResponse.json({ success: false, code: 'BAD_REQUEST', message: 'Dữ liệu không hợp lệ', data: null }, { status: 400 });
    }
  }),

  // 4. Làm mới token (Refresh Token)
  http.post('*/api/auth/refresh', async ({ request }) => {
    await applySimulatedLatency();
    const session = authenticateRequest(request);
    if (!session) {
      return HttpResponse.json(
        { success: false, code: 'AUTH_TOKEN_INVALID', message: 'Token không hợp lệ hoặc đã hết hạn', data: null },
        { status: 401 }
      );
    }

    const newToken = createMockToken(session);
    return HttpResponse.json({
      success: true,
      code: 'SUCCESS',
      message: 'Làm mới token thành công',
      data: {
        token: newToken,
        id: session.sub,
        username: session.username,
        accountType: session.accountType,
        role: session.role,
      },
    });
  }),

  // 5. Đăng xuất (Logout)
  http.post('*/api/auth/logout', async () => {
    await applySimulatedLatency();
    return HttpResponse.json({
      success: true,
      code: 'SUCCESS',
      message: 'Đăng xuất thành công',
      data: null,
    });
  }),

  // 6. Hồ sơ cá nhân (Me)
  http.get('*/api/me', async ({ request }) => {
    await applySimulatedLatency();
    const session = authenticateRequest(request);
    if (!session) {
      return HttpResponse.json(
        { success: false, code: 'AUTH_UNAUTHORIZED', message: 'Vui lòng đăng nhập để tiếp tục', data: null },
        { status: 401 }
      );
    }

    const me = db.getMe(session.sub);
    if (!me) {
      return HttpResponse.json(
        { success: false, code: 'USER_NOT_FOUND', message: 'Không tìm thấy người dùng', data: null },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      code: 'SUCCESS',
      message: 'Lấy thông tin tài khoản thành công',
      data: me,
    });
  }),
];
