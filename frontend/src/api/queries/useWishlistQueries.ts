// Hằng số này giữ file không rỗng khi khối bên dưới đang bị comment (lint cấm file rỗng).
export const FEATURE_INFO = 'TN-15 · Danh sách yêu thích (xem CHUC-NANG-MUA-HANG-THEM.md)';

// [TN-15] BẮT ĐẦU · Đọc danh sách yêu thích (GET api/wishlist)
// import { useQuery } from '@tanstack/react-query';
// import { api } from '../client';
// import { queryKeys } from '../keys';
// import { toProductView, type ProductViewModel } from '../adapters';
// import { useAuthState } from './useAuthQueries';
// import type { ProductDto } from '@/types/api';

// /** Chỉ tải khi đã đăng nhập bằng tài khoản USER (khách và quản trị không có danh sách yêu thích). */
// export function useWishlist() {
  // const auth = useAuthState();
  // return useQuery<ProductViewModel[]>({
    // queryKey: queryKeys.wishlist.all(),
    // queryFn: async () => {
      // const res = await api<ProductDto[]>('wishlist');
      // const list = res.data || [];
      // return list.map((p) => toProductView(p));
    // },
    // staleTime: 30 * 1000,
    // enabled: !!auth.token && auth.accountType === 'USER',
  // });
// }
// [TN-15] KẾT THÚC
