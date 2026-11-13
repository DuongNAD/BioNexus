import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import { queryKeys } from '../keys';
import type {
  UpdateStatusRequest,
  CreateSpeciesRequest,
  SellerDto,
  ProductDto,
  SpeciesDto,
  SellerStatus,
  ProductStatus,
} from '@/types/api';
// import type { AdminOrderDto, OrderStatus } from '@/types/api'; // [TN-03]
// import type { OrderDto } from '@/types/api'; // [TN-11]

// Hợp đồng chỉ có { status }; reason là trường đề xuất, chỉ gửi khi có nội dung
function buildStatusPayload(status: SellerStatus | ProductStatus, reason?: string): UpdateStatusRequest {
  const trimmed = reason?.trim();
  return trimmed ? { status, reason: trimmed } : { status };
}

export function useModerateSeller() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sellerId,
      status,
      reason,
    }: {
      sellerId: number;
      status: SellerStatus;
      reason?: string;
    }) => {
      const res = await api<SellerDto>(`admin/sellers/${sellerId}/status`, {
        method: 'PUT',
        body: JSON.stringify(buildStatusPayload(status, reason)),
      });
      return res.data!;
    },
    // onSettled: kể cả khi 409 (người khác đã duyệt) cũng tải lại hàng đợi để bỏ dòng cũ
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.seller.all() });
    },
  });
}

export function useModerateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      status,
      reason,
    }: {
      productId: number;
      status: ProductStatus;
      reason?: string;
    }) => {
      const res = await api<ProductDto>(`admin/products/${productId}/status`, {
        method: 'PUT',
        body: JSON.stringify(buildStatusPayload(status, reason)),
      });
      return res.data!;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.species.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.seller.products() });
    },
  });
}

export function useCreateSpecies() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateSpeciesRequest) => {
      const res = await api<SpeciesDto>('admin/species', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.species.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.taxonomy.all() });
    },
  });
}

// [TN-03] BẮT ĐẦU · Quản trị viên hoàn tất hoặc hủy đơn (PUT api/admin/orders/{id}/status)
// export function useUpdateOrderStatus() {
  // const queryClient = useQueryClient();

  // return useMutation({
    // mutationFn: async ({ orderId, status }: { orderId: number; status: OrderStatus }) => {
      // const res = await api<AdminOrderDto>(`admin/orders/${orderId}/status`, {
        // method: 'PUT',
        // body: JSON.stringify({ status }),
      // });
      // return res.data!;
    // },
    // // Hủy đơn thì kho được hoàn lại: làm mới cả sản phẩm và thống kê (nằm trong admin.all)
    // onSettled: () => {
      // queryClient.invalidateQueries({ queryKey: queryKeys.admin.all() });
      // queryClient.invalidateQueries({ queryKey: queryKeys.orders.all() });
      // queryClient.invalidateQueries({ queryKey: queryKeys.products.all() });
    // },
  // });
// }
// [TN-03] KẾT THÚC

// [TN-11] BẮT ĐẦU · Quản trị viên xác nhận đã thu tiền (PUT api/admin/orders/{id}/payment)
// export function useConfirmPayment() {
  // const queryClient = useQueryClient();

  // return useMutation({
    // mutationFn: async (orderId: number) => {
      // const res = await api<OrderDto>(`admin/orders/${orderId}/payment`, { method: 'PUT' });
      // return res.data!;
    // },
    // onSettled: () => {
      // queryClient.invalidateQueries({ queryKey: queryKeys.admin.all() });
      // queryClient.invalidateQueries({ queryKey: queryKeys.orders.all() });
    // },
  // });
// }
// [TN-11] KẾT THÚC
