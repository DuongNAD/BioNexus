import type { MockCartItem } from '../types';

export const SEED_CARTS: Record<number, MockCartItem[]> = {
  // levanc (userId: 3): 2 món hợp lệ (Axolotl x1, Trăn bóng x1)
  3: [
    { productId: 7, quantity: 1 },
    { productId: 4, quantity: 1 },
  ],
  // phamthid (userId: 4): 2 món kiểm thử lỗi biên (Tangerine x5 vượt tồn 3, Rùa Hermann x1 SOLD_OUT)
  4: [
    { productId: 2, quantity: 5 },
    { productId: 6, quantity: 1 },
  ],
};
