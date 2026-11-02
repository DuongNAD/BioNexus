import { http, HttpResponse } from 'msw';
import { db } from '../db';
import { authenticateRequest } from '../auth';
import { applySimulatedLatency } from '../faults';
import type { SellerApplyRequest, UpdateSellerProfileRequest, CreateProductRequest } from '@/types/api';

export const sellerHandlers = [
  // 1. Đăng ký mở cửa hàng sinh vật cảnh
  http.post('*/api/seller/apply', async ({ request }) => {
    await applySimulatedLatency();
    const session = authenticateRequest(request);
    if (!session || session.accountType !== 'USER') {
      return HttpResponse.json(
        { success: false, code: 'AUTH_UNAUTHORIZED', message: 'Vui lòng đăng nhập để tiếp tục', data: null },
        { status: 401 }
      );
    }

    try {
      const body = (await request.json()) as SellerApplyRequest;
      const res = db.applySeller(session.sub, body);
      return HttpResponse.json(res.body, { status: res.status });
    } catch {
      return HttpResponse.json(
        { success: false, code: 'BAD_REQUEST', message: 'Dữ liệu không hợp lệ', data: null },
        { status: 400 }
      );
    }
  }),

  // 2. Lấy thông tin hồ sơ cửa hàng của tôi
  http.get('*/api/seller/profile', async ({ request }) => {
    await applySimulatedLatency();
    const session = authenticateRequest(request);
    if (!session || session.accountType !== 'USER') {
      return HttpResponse.json(
        { success: false, code: 'AUTH_UNAUTHORIZED', message: 'Vui lòng đăng nhập để tiếp tục', data: null },
        { status: 401 }
      );
    }

    const shop = db.getSellerProfile(session.sub);
    if (!shop) {
      return HttpResponse.json(
        { success: false, code: 'SELLER_NOT_FOUND', message: 'Không tìm thấy thông tin cửa hàng', data: null },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      code: 'SUCCESS',
      message: 'Lấy thông tin cửa hàng thành công',
      data: shop,
    });
  }),

  // 3. Cập nhật thông tin cửa hàng của tôi
  http.put('*/api/seller/profile', async ({ request }) => {
    await applySimulatedLatency();
    const session = authenticateRequest(request);
    if (!session || session.accountType !== 'USER') {
      return HttpResponse.json(
        { success: false, code: 'AUTH_UNAUTHORIZED', message: 'Vui lòng đăng nhập để tiếp tục', data: null },
        { status: 401 }
      );
    }

    try {
      const body = (await request.json()) as UpdateSellerProfileRequest;
      const res = db.updateSellerProfile(session.sub, body);
      return HttpResponse.json(res.body, { status: res.status });
    } catch {
      return HttpResponse.json(
        { success: false, code: 'BAD_REQUEST', message: 'Dữ liệu không hợp lệ', data: null },
        { status: 400 }
      );
    }
  }),

  // 4. Lấy toàn bộ sản phẩm của cửa hàng tôi (kể cả PENDING/REJECTED/SOLD_OUT)
  http.get('*/api/seller/products', async ({ request }) => {
    await applySimulatedLatency();
    const session = authenticateRequest(request);
    if (!session || session.accountType !== 'USER') {
      return HttpResponse.json(
        { success: false, code: 'AUTH_UNAUTHORIZED', message: 'Vui lòng đăng nhập để tiếp tục', data: null },
        { status: 401 }
      );
    }

    const res = db.getSellerProducts(session.sub);
    return HttpResponse.json(res.body, { status: res.status });
  }),

  // 5. Đăng bán sản phẩm mới (chỉ shop ACTIVE)
  http.post('*/api/seller/products', async ({ request }) => {
    await applySimulatedLatency();
    const session = authenticateRequest(request);
    if (!session || session.accountType !== 'USER') {
      return HttpResponse.json(
        { success: false, code: 'AUTH_UNAUTHORIZED', message: 'Vui lòng đăng nhập để tiếp tục', data: null },
        { status: 401 }
      );
    }

    try {
      const body = (await request.json()) as CreateProductRequest;
      const res = db.createSellerProduct(session.sub, body);
      return HttpResponse.json(res.body, { status: res.status });
    } catch {
      return HttpResponse.json(
        { success: false, code: 'BAD_REQUEST', message: 'Dữ liệu không hợp lệ', data: null },
        { status: 400 }
      );
    }
  }),
];
