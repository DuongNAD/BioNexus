import { http, HttpResponse } from 'msw';
import { db } from '../db';
import { requireUser } from '../guards';
import { applySimulatedLatency } from '../faults';
import type { CreateReviewRequest } from '@/types/api';

export const reviewHandlers = [
  // 1. Danh sách đánh giá sản phẩm
  http.get('*/api/reviews', async ({ request }) => {
    await applySimulatedLatency();
    const url = new URL(request.url);
    const productIdStr = url.searchParams.get('productId');
    const productId = productIdStr ? Number(productIdStr) : NaN;

    if (isNaN(productId) || productId <= 0) {
      return HttpResponse.json(
        { success: false, code: 'INVALID_ID', message: 'Mã sản phẩm không hợp lệ', data: null },
        { status: 400 }
      );
    }

    const reviews = db.getReviewsByProductId(productId);
    return HttpResponse.json({
      success: true,
      code: 'SUCCESS',
      message: 'Lấy đánh giá thành công',
      data: reviews,
    });
  }),

  // 2. Gửi đánh giá sản phẩm mới
  http.post('*/api/reviews', async ({ request }) => {
    await applySimulatedLatency();
    const guard = requireUser(request);
    if ('response' in guard) return guard.response;
    const { session } = guard;

    try {
      const body = (await request.json()) as CreateReviewRequest;
      const res = db.addReview(session.sub, body);
      return HttpResponse.json(res.body, { status: res.status });
    } catch {
      return HttpResponse.json(
        { success: false, code: 'BAD_REQUEST', message: 'Dữ liệu không hợp lệ', data: null },
        { status: 400 }
      );
    }
  }),
];
