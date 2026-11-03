import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '../client';
import { queryKeys } from '../keys';
import type { CartDto, AddCartItemRequest, UpdateCartItemRequest } from '@/types/api';

// Lỗi khi sửa giỏ (409 vượt kho, 404 món đã bị xoá…) phải hiện cho người dùng, không được im lặng
function toastCartError(err: unknown): void {
  toast.error(err instanceof Error && err.message ? err.message : 'Không cập nhật được giỏ hàng. Vui lòng thử lại.');
}

/**
 * Thêm vào giỏ (lạc quan + rollback). Lỗi do nơi gọi tự báo, vì mỗi trang có cách báo riêng
 * (trang sản phẩm gợi ý đăng nhập, trang đơn hàng gom kết quả "Mua lại").
 */
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

      // 3. Cập nhật lạc quan cache nếu có dữ liệu cũ (món không còn bán thì không cộng vào tạm tính)
      if (previousCart) {
        const existingItem = previousCart.items.find((i) => i.productId === newItem.productId);
        const updatedItems = existingItem
          ? previousCart.items.map((i) => {
              if (i.productId !== newItem.productId) return i;
              const quantity = i.quantity + newItem.quantity;
              return { ...i, quantity, lineTotal: i.available ? quantity * i.price : 0 };
            })
          : [
              ...previousCart.items,
              {
                productId: newItem.productId,
                productName: 'Đang thêm...',
                imageUrl: null,
                price: 0,
                quantity: newItem.quantity,
                available: true,
                maxQuantity: newItem.quantity,
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
    onSettled: (_data, _err, variables) => {
      // Tài liệu 04 mục 8: đồng bộ giỏ và tồn kho của sản phẩm vừa thêm (409 hết hàng thì trang sản phẩm phải cập nhật)
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.current() });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(variables.productId) });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.products.all(), 'list'] });
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
    onError: toastCartError,
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
    onError: toastCartError,
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
    onError: toastCartError,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.current() });
    },
  });
}
