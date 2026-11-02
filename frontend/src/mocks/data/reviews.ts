import type { MockReview } from '../types';

export const SEED_REVIEWS: MockReview[] = [
  {
    id: 1,
    productId: 1,
    userId: 3,
    userFullName: 'Lê Văn C',
    rating: 5,
    comment: 'Bé gecko rất khỏe mạnh, ăn dế sung và đã lột xác hoàn hảo.',
    createdAt: '2026-10-27T10:00:00Z',
  },
  {
    id: 2,
    productId: 7,
    userId: 3,
    userFullName: 'Lê Văn C',
    rating: 5,
    comment: 'Axolotl hồng leucistic cực kỳ đáng yêu, bơi lội năng động.',
    createdAt: '2026-10-28T14:30:00Z',
  },
  {
    id: 3,
    productId: 8,
    userId: 2,
    userFullName: 'Trần Thị B',
    rating: 5,
    comment: 'Cây bắt ruồi khỏe, bẫy phản xạ cực nhanh khi có ruồi chạm.',
    createdAt: '2026-10-29T09:15:00Z',
  },
];
