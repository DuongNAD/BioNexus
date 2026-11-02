import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import { queryKeys } from '../keys';
import type { CartDto, AddCartItemRequest, UpdateCartItemRequest } from '@/types/api';

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AddCartItemRequest) => {
      const res = await api<CartDto>('cart/items', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return res.data!;
    },
    onMutate: async (newItem) => {
      // 1. Dừng các truy vấn cart đang bay
      await queryClient.cancelQueries({ queryKey: queryKeys.cart.current() });

      // 2. Lưu snapshot cache giỏ hàng hiện tại
      const previousCart = queryClient.getQueryData<CartDto>(queryKeys.cart.current());

      // 3. Cập nhật lạc quan cache nếu có dữ liệu cũ
      if (previousCart) {
        const existingItem = previousCart.items.find((i) => i.productId === newItem.productId);
        const updatedItems = existingItem
          ? previousCart.items.map((i) =>
              i.productId === newItem.productId
                ? { ...i, quantity: i.quantity + newItem.quantity, lineTotal: (i.quantity + newItem.quantity) * i.price }
                : i
            )
          : [
              ...previousCart.items,
              {
                productId: newItem.productId,
                productName: 'Đang thêm...',
                imageUrl: null,
                price: 0,
                quantity: newItem.quantity,
                available: true,
                maxQuantity: 99,
                lineTotal: 0,
              },
            ];

        queryClient.setQueryData<CartDto>(queryKeys.cart.current(), {
          ...previousCart,
          items: updatedItems,
          itemCount: previousCart.itemCount + newItem.quantity,
          subtotal: updatedItems.reduce((acc, i) => acc + i.lineTotal, 0),
        });
      }

      return { previousCart };
    },
    onError: (_err, _newItem, context) => {
      // Rollback phục hồi lại trạng thái giỏ hàng ban đầu
      if (context?.previousCart) {
        queryClient.setQueryData(queryKeys.cart.current(), context.previousCart);
      }
    },
    onSettled: () => {
      // Đồng bộ lại dữ liệu chuẩn từ server
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.current() });
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, quantity }: { productId: number; quantity: number }) => {
      const payload: UpdateCartItemRequest = { quantity };
      const res = await api<CartDto>(`cart/items/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      return res.data!;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.cart.current(), data);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.current() });
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: number) => {
      const res = await api<CartDto>(`cart/items/${productId}`, {
        method: 'DELETE',
      });
      return res.data!;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.cart.current(), data);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.current() });
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await api<CartDto>('cart', {
        method: 'DELETE',
      });
      return res.data!;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.cart.current(), data);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.current() });
    },
  });
}
