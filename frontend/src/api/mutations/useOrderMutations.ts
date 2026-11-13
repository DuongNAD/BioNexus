import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import { queryKeys } from '../keys';
import type { PlaceOrderRequest, OrderDto } from '@/types/api';
// import type { CouponDto } from '@/types/api'; // [TN-06]

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
    // Chạy cả khi lỗi: 409 hết hàng nghĩa là available/maxQuantity của giỏ và tồn kho đã đổi
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.current() });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.species.all() });
    },
  });
}

// [TN-01] BẮT ĐẦU · Người mua hủy đơn đang chờ xử lý (POST api/orders/{id}/cancel)
// export function useCancelOrder() {
  // const queryClient = useQueryClient();

  // return useMutation({
    // mutationFn: async (orderId: number) => {
      // const res = await api<OrderDto>(`orders/${orderId}/cancel`, { method: 'POST' });
      // return res.data!;
    // },
    // // Hủy đơn thì kho được hoàn lại, nên làm mới cả danh sách sản phẩm
    // onSettled: () => {
      // queryClient.invalidateQueries({ queryKey: queryKeys.orders.all() });
      // queryClient.invalidateQueries({ queryKey: queryKeys.products.all() });
      // queryClient.invalidateQueries({ queryKey: queryKeys.species.all() });
    // },
  // });
// }
// [TN-01] KẾT THÚC

// [TN-02] BẮT ĐẦU · Người mua xác nhận đã nhận hàng (POST api/orders/{id}/complete)
// export function useConfirmReceived() {
  // const queryClient = useQueryClient();

  // return useMutation({
    // mutationFn: async (orderId: number) => {
      // const res = await api<OrderDto>(`orders/${orderId}/complete`, { method: 'POST' });
      // return res.data!;
    // },
    // onSettled: () => {
      // queryClient.invalidateQueries({ queryKey: queryKeys.orders.all() });
    // },
  // });
// }
// [TN-02] KẾT THÚC

// [TN-06] BẮT ĐẦU · Kiểm tra mã giảm giá trước khi đặt (GET api/coupons/{code}?subtotal=)
// // Dùng useMutation vì chỉ gọi khi người dùng bấm "Áp dụng", không tự tải khi vào trang.
// export function useCheckCoupon() {
  // return useMutation({
    // mutationFn: async ({ code, subtotal }: { code: string; subtotal: number }) => {
      // const res = await api<CouponDto>(`coupons/${encodeURIComponent(code.trim())}?subtotal=${subtotal}`, {
        // skipAuth: true,
      // });
      // return res.data!;
    // },
  // });
// }
// [TN-06] KẾT THÚC
