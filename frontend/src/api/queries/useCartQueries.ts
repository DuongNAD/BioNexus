import { useQuery } from '@tanstack/react-query';
import { api } from '../client';
import { queryKeys } from '../keys';
import { useAuthState } from './useAuthQueries';
import type { CartDto } from '@/types/api';

export function useCart(options?: { enabled?: boolean }) {
  const auth = useAuthState();
  return useQuery<CartDto>({
    queryKey: queryKeys.cart.current(),
    queryFn: async () => {
      const res = await api<CartDto>('cart');
      return res.data || { items: [], itemCount: 0, subtotal: 0 };
    },
    staleTime: 0, // Giỏ hàng luôn kiểm tra mới
    // Admin không có giỏ hàng: gọi api/cart bằng token admin sẽ bị từ chối
    enabled: (options?.enabled ?? true) && !!auth.token && auth.accountType === 'USER',
  });
}
