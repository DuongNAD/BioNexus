import { http, HttpResponse } from 'msw';
import { db } from '../db';
import { applySimulatedLatency } from '../faults';

export const taxonomyHandlers = [
  // 1. Cây phân loại gốc (Root Kingdoms)
  http.get('*/api/taxonomy', async () => {
    const isFault = await applySimulatedLatency();
    if (isFault) {
      return HttpResponse.json({ success: false, code: 'INTERNAL_ERROR', message: 'Lỗi mô phỏng', data: null }, { status: 500 });
    }

    const roots = db.getRootTaxonomy();
    return HttpResponse.json({
      success: true,
      code: 'SUCCESS',
      message: 'Lấy danh sách nút gốc thành công',
      data: roots,
    });
  }),

  // 2. Chi tiết nút phân loại & Breadcrumbs
  http.get('*/api/taxonomy/:id', async ({ params }) => {
    await applySimulatedLatency();
    const id = Number(params.id);
    if (isNaN(id) || id <= 0) {
      return HttpResponse.json(
        { success: false, code: 'INVALID_ID', message: 'Mã định danh không hợp lệ', data: null },
        { status: 400 }
      );
    }

    const detail = db.getTaxonomyDetail(id);
    if (!detail) {
      return HttpResponse.json(
        { success: false, code: 'TAXONOMY_NOT_FOUND', message: 'Không tìm thấy nhánh phân loại sinh học', data: null },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      code: 'SUCCESS',
      message: 'Lấy thông tin nút phân loại thành công',
      data: detail,
    });
  }),

  // 3. Danh sách các nhánh phân loại con
  http.get('*/api/taxonomy/:id/children', async ({ params }) => {
    await applySimulatedLatency();
    const id = Number(params.id);
    if (isNaN(id) || id <= 0) {
      return HttpResponse.json(
        { success: false, code: 'INVALID_ID', message: 'Mã định danh không hợp lệ', data: null },
        { status: 400 }
      );
    }

    const node = db.getRawState().taxonomy.find((n) => n.id === id);
    if (!node) {
      return HttpResponse.json(
        { success: false, code: 'TAXONOMY_NOT_FOUND', message: 'Không tìm thấy nhánh phân loại sinh học', data: null },
        { status: 404 }
      );
    }

    const children = db.getTaxonomyChildren(id);
    return HttpResponse.json({
      success: true,
      code: 'SUCCESS',
      message: 'Lấy danh sách nút con thành công',
      data: children,
    });
  }),

  // 4. Danh sách loài thuộc nút phân loại cấp Chi (GENUS)
  http.get('*/api/taxonomy/:id/species', async ({ params }) => {
    await applySimulatedLatency();
    const id = Number(params.id);
    if (isNaN(id) || id <= 0) {
      return HttpResponse.json(
        { success: false, code: 'INVALID_ID', message: 'Mã định danh không hợp lệ', data: null },
        { status: 400 }
      );
    }

    const node = db.getRawState().taxonomy.find((n) => n.id === id);
    if (!node) {
      return HttpResponse.json(
        { success: false, code: 'TAXONOMY_NOT_FOUND', message: 'Không tìm thấy nhánh phân loại sinh học', data: null },
        { status: 404 }
      );
    }

    const species = db.getTaxonomySpecies(id);
    return HttpResponse.json({
      success: true,
      code: 'SUCCESS',
      message: 'Lấy danh sách loài thuộc nút thành công',
      data: species,
    });
  }),
];
