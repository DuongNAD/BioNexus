import { http, HttpResponse } from 'msw';
import { db } from '../db';
import { applySimulatedLatency } from '../faults';

export const speciesHandlers = [
  // 1. Tìm kiếm nhanh bách khoa loài (Đặt trước :id để không bị nuốt route)
  http.get('*/api/species/search', async ({ request }) => {
    await applySimulatedLatency();
    const url = new URL(request.url);
    const q = url.searchParams.get('q') || '';
    const list = db.getSpeciesList({ q });
    return HttpResponse.json({
      success: true,
      code: 'SUCCESS',
      message: 'Tìm kiếm loài thành công',
      data: list,
    });
  }),

  // 2. Sản phẩm liên quan tới loài
  http.get('*/api/species/:id/products', async ({ params }) => {
    await applySimulatedLatency();
    const id = Number(params.id);
    if (isNaN(id) || id <= 0) {
      return HttpResponse.json(
        { success: false, code: 'INVALID_ID', message: 'Mã định danh không hợp lệ', data: null },
        { status: 400 }
      );
    }

    const species = db.getSpeciesById(id);
    if (!species) {
      return HttpResponse.json(
        { success: false, code: 'SPECIES_NOT_FOUND', message: 'Không tìm thấy loài sinh vật', data: null },
        { status: 404 }
      );
    }

    const products = db.getProductsBySpeciesId(id);
    return HttpResponse.json({
      success: true,
      code: 'SUCCESS',
      message: 'Lấy sản phẩm liên quan thành công',
      data: products,
    });
  }),

  // 3. Chi tiết một loài
  http.get('*/api/species/:id', async ({ params }) => {
    await applySimulatedLatency();
    const id = Number(params.id);
    if (isNaN(id) || id <= 0) {
      return HttpResponse.json(
        { success: false, code: 'INVALID_ID', message: 'Mã định danh không hợp lệ', data: null },
        { status: 400 }
      );
    }

    const species = db.getSpeciesById(id);
    if (!species) {
      return HttpResponse.json(
        { success: false, code: 'SPECIES_NOT_FOUND', message: 'Không tìm thấy thông tin loài sinh vật', data: null },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      code: 'SUCCESS',
      message: 'Lấy thông tin loài thành công',
      data: species,
    });
  }),

  // 4. Danh sách bách khoa loài với bộ lọc & tìm kiếm
  http.get('*/api/species', async ({ request }) => {
    const isFault = await applySimulatedLatency();
    if (isFault) {
      return HttpResponse.json({ success: false, code: 'INTERNAL_ERROR', message: 'Lỗi mô phỏng', data: null }, { status: 500 });
    }

    const url = new URL(request.url);
    const nodeIdStr = url.searchParams.get('nodeId');
    const nodeId = nodeIdStr ? Number(nodeIdStr) : undefined;
    const q = url.searchParams.get('q') || undefined;
    const iucn = url.searchParams.get('iucn') || undefined;

    const list = db.getSpeciesList({ nodeId, q, iucn });
    return HttpResponse.json({
      success: true,
      code: 'SUCCESS',
      message: 'Lấy danh sách loài thành công',
      data: list,
    });
  }),
];
