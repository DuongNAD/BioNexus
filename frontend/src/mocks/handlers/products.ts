import { http, HttpResponse } from 'msw';
import { db } from '../db';
import { applySimulatedLatency } from '../faults';

export const productHandlers = [
  // 1. Tìm kiếm sản phẩm nhanh (Đặt trước :id)
  http.get('*/api/products/search', async ({ request }) => {
    await applySimulatedLatency();
    const url = new URL(request.url);
    const q = url.searchParams.get('q') || '';
    const pageData = db.getProducts({ q, page: 1, size: 20 });
    return HttpResponse.json({
      success: true,
      code: 'SUCCESS',
      message: 'Tìm kiếm sản phẩm thành công',
      data: pageData,
    });
  }),

  // 2. Danh sách đánh giá của một sản phẩm
  http.get('*/api/products/:id/reviews', async ({ params }) => {
    await applySimulatedLatency();
    const id = Number(params.id);
    if (isNaN(id) || id <= 0) {
      return HttpResponse.json(
        { success: false, code: 'INVALID_ID', message: 'Mã định danh không hợp lệ', data: null },
        { status: 400 }
      );
    }

    const prod = db.getProductById(id);
    if (!prod) {
      return HttpResponse.json(
        { success: false, code: 'PRODUCT_NOT_FOUND', message: 'Không tìm thấy sản phẩm', data: null },
        { status: 404 }
      );
    }

    const reviews = db.getReviewsByProductId(id);
    return HttpResponse.json({
      success: true,
      code: 'SUCCESS',
      message: 'Lấy đánh giá sản phẩm thành công',
      data: reviews,
    });
  }),

  // 3. Chi tiết sản phẩm sinh vật cảnh
  http.get('*/api/products/:id', async ({ params }) => {
    await applySimulatedLatency();
    const id = Number(params.id);
    if (isNaN(id) || id <= 0) {
      return HttpResponse.json(
        { success: false, code: 'INVALID_ID', message: 'Mã định danh không hợp lệ', data: null },
        { status: 400 }
      );
    }

    const prod = db.getProductById(id);
    if (!prod) {
      return HttpResponse.json(
        { success: false, code: 'PRODUCT_NOT_FOUND', message: 'Không tìm thấy sản phẩm', data: null },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      code: 'SUCCESS',
      message: 'Lấy thông tin sản phẩm thành công',
      data: prod,
    });
  }),

  // 4. Danh mục sản phẩm sàn giao dịch với phân trang & bộ lọc
  http.get('*/api/products', async ({ request }) => {
    const isFault = await applySimulatedLatency();
    if (isFault) {
      return HttpResponse.json({ success: false, code: 'INTERNAL_ERROR', message: 'Lỗi mô phỏng', data: null }, { status: 500 });
    }

    const url = new URL(request.url);
    const speciesIdStr = url.searchParams.get('speciesId');
    const speciesId = speciesIdStr ? Number(speciesIdStr) : undefined;
    const q = url.searchParams.get('q') || undefined;

    const pageStr = url.searchParams.get('page');
    const sizeStr = url.searchParams.get('size');
    const page = pageStr !== null ? Number(pageStr) : 1;
    const size = sizeStr !== null ? Number(sizeStr) : 12;

    // page, size và speciesId phải là số nguyên; giá trị lạ trả 400 thay vì lặng lẽ bỏ qua bộ lọc
    if (
      !Number.isInteger(page) ||
      page <= 0 ||
      !Number.isInteger(size) ||
      size <= 0 ||
      size > 48 ||
      (speciesId !== undefined && (!Number.isInteger(speciesId) || speciesId <= 0))
    ) {
      return HttpResponse.json(
        { success: false, code: 'INVALID_PAGINATION', message: 'Tham số phân trang không hợp lệ', data: null },
        { status: 400 }
      );
    }

    const pageData = db.getProducts({ speciesId, q, page, size });
    return HttpResponse.json({
      success: true,
      code: 'SUCCESS',
      message: 'Lấy danh mục sản phẩm thành công',
      data: pageData,
    });
  }),
];
