import { useQuery } from '@tanstack/react-query';
import { api } from '../client';
import { queryKeys } from '../keys';
import type { CartDto } from '@/types/api';

export function useCart(options?: { enabled?: boolean }) {
  return useQuery<CartDto>({
    queryKey: queryKeys.cart.current(),
    queryFn: async () => {
      const res = await api<CartDto>('cart');
      return res.data || { items: [], itemCount: 0, subtotal: 0 };
    },
    staleTime: 0, // Giỏ hàng luôn kiểm tra mới
    enabled: options?.enabled,
  });
}
