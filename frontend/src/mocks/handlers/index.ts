import { http, HttpResponse } from 'msw';
import { authHandlers } from './auth';
import { taxonomyHandlers } from './taxonomy';
import { speciesHandlers } from './species';
import { productHandlers } from './products';
import { cartHandlers } from './cart';
import { orderHandlers } from './orders';
import { reviewHandlers } from './reviews';
import { sellerHandlers } from './seller';
import { adminHandlers } from './admin';

/**
 * Tổng hợp toàn bộ 29+ Handlers MSW 2 cho 9 phân hệ của BioNexus.
 */
export const handlers = [
  // Health & Ping endpoints
  http.get('*/api/health', () => {
    return HttpResponse.json({
      success: true,
      code: 'SUCCESS',
      message: 'MSW 2 Mock Server BioNexus đang hoạt động bình thường.',
      data: { status: 'ONLINE', timestamp: new Date().toISOString() },
    });
  }),

  http.get('*/api/ping', () => {
    return HttpResponse.json({
      status: 'ONLINE',
      timestamp: new Date().toISOString(),
    });
  }),

  // Domain handlers
  ...authHandlers,
  ...taxonomyHandlers,
  ...speciesHandlers,
  ...productHandlers,
  ...cartHandlers,
  ...orderHandlers,
  ...reviewHandlers,
  ...sellerHandlers,
  ...adminHandlers,
];
