import { useQuery } from '@tanstack/react-query';
import { api } from '../client';
import { queryKeys } from '../keys';
import { toProductView, type ProductViewModel } from '../adapters';
import type { SellerDto, ProductDto, SellerStatus, ProductStatus } from '@/types/api';

export function useAdminSellers(status?: SellerStatus | 'ALL', options?: { enabled?: boolean }) {
  return useQuery<SellerDto[]>({
    queryKey: queryKeys.admin.sellers(status),
    queryFn: async () => {
      const endpoint = status ? `admin/sellers?status=${status}` : 'admin/sellers';
      const res = await api<SellerDto[]>(endpoint);
      return res.data || [];
    },
    staleTime: 0,
    enabled: options?.enabled,
  });
}

export function usePendingSellers(options?: { enabled?: boolean }) {
  return useAdminSellers('PENDING', options);
}

export function useAdminProducts(status?: ProductStatus | 'ALL', options?: { enabled?: boolean }) {
  return useQuery<ProductViewModel[]>({
    queryKey: queryKeys.admin.products(status),
    queryFn: async () => {
      const endpoint = status ? `admin/products?status=${status}` : 'admin/products';
      const res = await api<ProductDto[]>(endpoint);
      const list = res.data || [];
      return list.map((p) => toProductView(p));
    },
    staleTime: 0,
    enabled: options?.enabled,
  });
}

export function usePendingProducts(options?: { enabled?: boolean }) {
  return useAdminProducts('PENDING', options);
}
