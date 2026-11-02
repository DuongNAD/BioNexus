import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import { queryKeys } from '../keys';
import type { PlaceOrderRequest, OrderDto } from '@/types/api';

export function usePlaceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: PlaceOrderRequest) => {
      const res = await api<OrderDto>('orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.current() });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all() });
    },
  });
}
