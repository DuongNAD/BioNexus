import { http, HttpResponse } from 'msw';
import { db } from '../db';
import { authenticateRequest } from '../auth';
import { applySimulatedLatency } from '../faults';
import type { AddCartItemRequest, UpdateCartItemRequest } from '@/types/api';

export const cartHandlers = [
  // 1. Xem giỏ hàng của tôi
  http.get('*/api/cart', async ({ request }) => {
    await applySimulatedLatency();
    const session = authenticateRequest(request);
    if (!session || session.accountType !== 'USER') {
      return HttpResponse.json(
        { success: false, code: 'AUTH_UNAUTHORIZED', message: 'Vui lòng đăng nhập để tiếp tục', data: null },
        { status: 401 }
      );
    }

    const cart = db.getCart(session.sub);
    return HttpResponse.json({
      success: true,
      code: 'SUCCESS',
      message: 'Lấy thông tin giỏ hàng thành công',
      data: cart,
    });
  }),

  // 2. Thêm sản phẩm vào giỏ hàng
  http.post('*/api/cart/items', async ({ request }) => {
    await applySimulatedLatency();
    const session = authenticateRequest(request);
    if (!session || session.accountType !== 'USER') {
      return HttpResponse.json(
        { success: false, code: 'AUTH_UNAUTHORIZED', message: 'Vui lòng đăng nhập để tiếp tục', data: null },
        { status: 401 }
      );
    }

    try {
      const body = (await request.json()) as AddCartItemRequest;
      const res = db.addToCart(session.sub, body.productId, body.quantity);
      return HttpResponse.json(res.body, { status: res.status });
    } catch {
      return HttpResponse.json(
        { success: false, code: 'BAD_REQUEST', message: 'Dữ liệu không hợp lệ', data: null },
        { status: 400 }
      );
    }
  }),

  // 3. Cập nhật số lượng món trong giỏ
  http.put('*/api/cart/items/:productId', async ({ request, params }) => {
    await applySimulatedLatency();
    const session = authenticateRequest(request);
    if (!session || session.accountType !== 'USER') {
      return HttpResponse.json(
        { success: false, code: 'AUTH_UNAUTHORIZED', message: 'Vui lòng đăng nhập để tiếp tục', data: null },
        { status: 401 }
      );
    }

    const productId = Number(params.productId);
    if (isNaN(productId) || productId <= 0) {
      return HttpResponse.json(
        { success: false, code: 'INVALID_ID', message: 'Mã định danh không hợp lệ', data: null },
        { status: 400 }
      );
    }

    try {
      const body = (await request.json()) as UpdateCartItemRequest;
      const res = db.updateCartItem(session.sub, productId, body.quantity);
      return HttpResponse.json(res.body, { status: res.status });
    } catch {
      return HttpResponse.json(
        { success: false, code: 'BAD_REQUEST', message: 'Dữ liệu không hợp lệ', data: null },
        { status: 400 }
      );
    }
  }),

  // 4. Xóa một món ra khỏi giỏ
  http.delete('*/api/cart/items/:productId', async ({ request, params }) => {
    await applySimulatedLatency();
    const session = authenticateRequest(request);
    if (!session || session.accountType !== 'USER') {
      return HttpResponse.json(
        { success: false, code: 'AUTH_UNAUTHORIZED', message: 'Vui lòng đăng nhập để tiếp tục', data: null },
        { status: 401 }
      );
    }

    const productId = Number(params.productId);
    if (isNaN(productId) || productId <= 0) {
      return HttpResponse.json(
        { success: false, code: 'INVALID_ID', message: 'Mã định danh không hợp lệ', data: null },
        { status: 400 }
      );
    }

    const res = db.removeCartItem(session.sub, productId);
    return HttpResponse.json(res.body, { status: res.status });
  }),

  // 5. Xóa toàn bộ giỏ hàng
  http.delete('*/api/cart', async ({ request }) => {
    await applySimulatedLatency();
    const session = authenticateRequest(request);
    if (!session || session.accountType !== 'USER') {
      return HttpResponse.json(
        { success: false, code: 'AUTH_UNAUTHORIZED', message: 'Vui lòng đăng nhập để tiếp tục', data: null },
        { status: 401 }
      );
    }

    const res = db.clearCart(session.sub);
    return HttpResponse.json(res.body, { status: res.status });
  }),
];
