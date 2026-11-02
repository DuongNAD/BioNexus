import { useQuery } from '@tanstack/react-query';
import { api } from '../client';
import { queryKeys } from '../keys';
import type { OrderDto } from '@/types/api';

export function useOrders(options?: { enabled?: boolean }) {
  return useQuery<OrderDto[]>({
    queryKey: queryKeys.orders.mine(),
    queryFn: async () => {
      const res = await api<OrderDto[]>('orders/mine');
      return res.data || [];
    },
    staleTime: 0,
    enabled: options?.enabled,
  });
}

export function useOrderDetail(id: number | string, options?: { enabled?: boolean }) {
  return useQuery<OrderDto | null>({
    queryKey: queryKeys.orders.detail(id),
    queryFn: async () => {
      const res = await api<OrderDto>(`orders/${id}`);
      return res.data;
    },
    staleTime: 0,
    enabled: options?.enabled !== undefined ? options.enabled : !!id,
  });
}
