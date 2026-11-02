import { http, HttpResponse } from 'msw';
import { db } from '../db';
import { authenticateRequest } from '../auth';
import { applySimulatedLatency } from '../faults';
import type { UpdateStatusRequest, CreateSpeciesRequest, SellerStatus, ProductStatus } from '@/types/api';

export const adminHandlers = [
  // 1. Hàng đợi duyệt người bán (MODERATOR / SUPER_ADMIN)
  http.get('*/api/admin/sellers', async ({ request }) => {
    await applySimulatedLatency();
    const session = authenticateRequest(request);
    if (!session || session.accountType !== 'ADMIN') {
      return HttpResponse.json(
        { success: false, code: 'AUTH_FORBIDDEN', message: 'Bạn không có quyền quản trị', data: null },
        { status: 403 }
      );
    }

    if (session.role !== 'MODERATOR' && session.role !== 'SUPER_ADMIN') {
      return HttpResponse.json(
        { success: false, code: 'AUTH_FORBIDDEN', message: 'Bạn không có quyền kiểm duyệt cửa hàng', data: null },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const statusParam = url.searchParams.get('status') || undefined;
    const sellers = db.getSellers(statusParam);
    return HttpResponse.json({
      success: true,
      code: 'SUCCESS',
      message: 'Lấy danh sách cửa hàng thành công',
      data: sellers,
    });
  }),

  // 2. Duyệt hồ sơ người bán (MODERATOR / SUPER_ADMIN)
  http.put('*/api/admin/sellers/:id/status', async ({ request, params }) => {
    await applySimulatedLatency();
    const session = authenticateRequest(request);
    if (!session || session.accountType !== 'ADMIN') {
      return HttpResponse.json(
        { success: false, code: 'AUTH_FORBIDDEN', message: 'Bạn không có quyền quản trị', data: null },
        { status: 403 }
      );
    }

    if (session.role !== 'MODERATOR' && session.role !== 'SUPER_ADMIN') {
      return HttpResponse.json(
        { success: false, code: 'AUTH_FORBIDDEN', message: 'Bạn không có quyền kiểm duyệt cửa hàng', data: null },
        { status: 403 }
      );
    }

    const id = Number(params.id);
    if (isNaN(id) || id <= 0) {
      return HttpResponse.json(
        { success: false, code: 'INVALID_ID', message: 'Mã định danh không hợp lệ', data: null },
        { status: 400 }
      );
    }

    try {
      const body = (await request.json()) as UpdateStatusRequest;
      const res = db.moderateSeller(session.sub, id, body.status as SellerStatus, body.reason);
      return HttpResponse.json(res.body, { status: res.status });
    } catch {
      return HttpResponse.json(
        { success: false, code: 'BAD_REQUEST', message: 'Dữ liệu không hợp lệ', data: null },
        { status: 400 }
      );
    }
  }),

  // 3. Hàng đợi duyệt sản phẩm sàn (MODERATOR / SUPER_ADMIN)
  http.get('*/api/admin/products', async ({ request }) => {
    await applySimulatedLatency();
    const session = authenticateRequest(request);
    if (!session || session.accountType !== 'ADMIN') {
      return HttpResponse.json(
        { success: false, code: 'AUTH_FORBIDDEN', message: 'Bạn không có quyền quản trị', data: null },
        { status: 403 }
      );
    }

    if (session.role !== 'MODERATOR' && session.role !== 'SUPER_ADMIN') {
      return HttpResponse.json(
        { success: false, code: 'AUTH_FORBIDDEN', message: 'Bạn không có quyền kiểm duyệt sản phẩm', data: null },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const statusParam = url.searchParams.get('status') || undefined;
    const products = db.getAdminProducts(statusParam);
    return HttpResponse.json({
      success: true,
      code: 'SUCCESS',
      message: 'Lấy danh sách sản phẩm thành công',
      data: products,
    });
  }),

  // 4. Kiểm duyệt sản phẩm sàn (MODERATOR / SUPER_ADMIN)
  http.put('*/api/admin/products/:id/status', async ({ request, params }) => {
    await applySimulatedLatency();
    const session = authenticateRequest(request);
    if (!session || session.accountType !== 'ADMIN') {
      return HttpResponse.json(
        { success: false, code: 'AUTH_FORBIDDEN', message: 'Bạn không có quyền quản trị', data: null },
        { status: 403 }
      );
    }

    if (session.role !== 'MODERATOR' && session.role !== 'SUPER_ADMIN') {
      return HttpResponse.json(
        { success: false, code: 'AUTH_FORBIDDEN', message: 'Bạn không có quyền kiểm duyệt sản phẩm', data: null },
        { status: 403 }
      );
    }

    const id = Number(params.id);
    if (isNaN(id) || id <= 0) {
      return HttpResponse.json(
        { success: false, code: 'INVALID_ID', message: 'Mã định danh không hợp lệ', data: null },
        { status: 400 }
      );
    }

    try {
      const body = (await request.json()) as UpdateStatusRequest;
      const res = db.moderateProduct(session.sub, id, body.status as ProductStatus, body.reason);
      return HttpResponse.json(res.body, { status: res.status });
    } catch {
      return HttpResponse.json(
        { success: false, code: 'BAD_REQUEST', message: 'Dữ liệu không hợp lệ', data: null },
        { status: 400 }
      );
    }
  }),

  // 5. Thêm mới loài sinh vật (BIOLOGIST / SUPER_ADMIN)
  http.post('*/api/admin/species', async ({ request }) => {
    await applySimulatedLatency();
    const session = authenticateRequest(request);
    if (!session || session.accountType !== 'ADMIN') {
      return HttpResponse.json(
        { success: false, code: 'AUTH_FORBIDDEN', message: 'Bạn không có quyền quản trị', data: null },
        { status: 403 }
      );
    }

    if (session.role !== 'BIOLOGIST' && session.role !== 'SUPER_ADMIN') {
      return HttpResponse.json(
        { success: false, code: 'AUTH_FORBIDDEN', message: 'Bạn không có quyền quản lý loài sinh học', data: null },
        { status: 403 }
      );
    }

    try {
      const body = (await request.json()) as CreateSpeciesRequest;
      const res = db.createSpecies(session.sub, body);
      return HttpResponse.json(res.body, { status: res.status });
    } catch {
      return HttpResponse.json(
        { success: false, code: 'BAD_REQUEST', message: 'Dữ liệu không hợp lệ', data: null },
        { status: 400 }
      );
    }
  }),
];
