import { useQuery } from '@tanstack/react-query';
import { api } from '../client';
import { queryKeys } from '../keys';
import { toProductView, type ProductViewModel } from '../adapters';
import type { SellerDto, ProductDto } from '@/types/api';
// import type { SellerOrderDto } from '@/types/api'; // [TN-05]

export function useSellerProfile(options?: { enabled?: boolean }) {
  return useQuery<SellerDto | null>({
    queryKey: queryKeys.seller.profile(),
    queryFn: async () => {
      const res = await api<SellerDto>('seller/profile');
      return res.data;
    },
    staleTime: 60 * 1000,
    enabled: options?.enabled,
  });
}

export function useSellerProducts(options?: { enabled?: boolean }) {
  return useQuery<ProductViewModel[]>({
    queryKey: queryKeys.seller.products(),
    queryFn: async () => {
      const res = await api<ProductDto[]>('seller/products');
      const list = res.data || [];
      return list.map((p) => toProductView(p));
    },
    staleTime: 60 * 1000,
    enabled: options?.enabled,
  });
}

// [TN-05] BẮT ĐẦU · Các đơn có hàng của shop tôi (GET api/seller/orders)
// export function useSellerOrders(options?: { enabled?: boolean }) {
  // return useQuery<SellerOrderDto[]>({
    // queryKey: queryKeys.seller.orders(),
    // queryFn: async () => {
      // const res = await api<SellerOrderDto[]>('seller/orders');
      // return res.data || [];
    // },
    // staleTime: 0,
    // enabled: options?.enabled,
  // });
// }
// [TN-05] KẾT THÚC
