import { http, HttpResponse } from 'msw';
import { db } from '../db';
import { requireUser } from '../guards';
import { applySimulatedLatency } from '../faults';
import type { PlaceOrderRequest } from '@/types/api';

export const orderHandlers = [
  // 1. Lịch sử đơn hàng của tôi (Đặt trước :id)
  http.get('*/api/orders/mine', async ({ request }) => {
    await applySimulatedLatency();
    const guard = requireUser(request);
    if ('response' in guard) return guard.response;
    const { session } = guard;

    const orders = db.getUserOrders(session.sub);
    return HttpResponse.json({
      success: true,
      code: 'SUCCESS',
      message: 'Lấy lịch sử đơn hàng thành công',
      data: orders,
    });
  }),

  // 2. Chi tiết một đơn hàng
  http.get('*/api/orders/:id', async ({ request, params }) => {
    await applySimulatedLatency();
    const guard = requireUser(request);
    if ('response' in guard) return guard.response;
    const { session } = guard;

    const id = Number(params.id);
    if (isNaN(id) || id <= 0) {
      return HttpResponse.json(
        { success: false, code: 'INVALID_ID', message: 'Mã định danh không hợp lệ', data: null },
        { status: 400 }
      );
    }

    const order = db.getOrderById(session.sub, id);
    if (!order) {
      return HttpResponse.json(
        { success: false, code: 'ORDER_NOT_FOUND', message: 'Không tìm thấy đơn hàng', data: null },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      code: 'SUCCESS',
      message: 'Lấy thông tin đơn hàng thành công',
      data: order,
    });
  }),

  // 3. Đặt hàng & Thanh toán mô phỏng Transaction nguyên tử
  http.post('*/api/orders', async ({ request }) => {
    await applySimulatedLatency();
    const guard = requireUser(request);
    if ('response' in guard) return guard.response;
    const { session } = guard;

    try {
      const body = (await request.json()) as PlaceOrderRequest;
      const res = db.placeOrder(session.sub, body);
      return HttpResponse.json(res.body, { status: res.status });
    } catch {
      return HttpResponse.json(
        { success: false, code: 'BAD_REQUEST', message: 'Dữ liệu không hợp lệ', data: null },
        { status: 400 }
      );
    }
  }),
];
