// Hằng số này giữ file không rỗng khi khối bên dưới đang bị comment (lint cấm file rỗng).
export const FEATURE_INFO = 'TN-15 · Danh sách yêu thích (xem CHUC-NANG-MUA-HANG-THEM.md)';

// [TN-15] BẮT ĐẦU · Lưu và bỏ lưu sản phẩm yêu thích (POST / DELETE api/wishlist/{productId})
// import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { api } from '../client';
// import { queryKeys } from '../keys';
// import type { ProductDto } from '@/types/api';

// export function useAddToWishlist() {
  // const queryClient = useQueryClient();

  // return useMutation({
    // mutationFn: async (productId: number) => {
      // const res = await api<ProductDto[]>(`wishlist/${productId}`, { method: 'POST' });
      // return res.data || [];
    // },
    // onSettled: () => {
      // queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.all() });
    // },
  // });
// }

// export function useRemoveFromWishlist() {
  // const queryClient = useQueryClient();

  // return useMutation({
    // mutationFn: async (productId: number) => {
      // const res = await api<ProductDto[]>(`wishlist/${productId}`, { method: 'DELETE' });
      // return res.data || [];
    // },
    // onSettled: () => {
      // queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.all() });
    // },
  // });
// }
// [TN-15] KẾT THÚC
