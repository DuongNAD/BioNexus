import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import { queryKeys } from '../keys';
import type {
  SellerApplyRequest,
  UpdateSellerProfileRequest,
  CreateProductRequest,
  SellerDto,
  ProductDto,
} from '@/types/api';

export function useApplySeller() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SellerApplyRequest) => {
      const res = await api<SellerDto>('seller/apply', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.seller.profile() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
    },
  });
}

export function useUpdateSellerProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateSellerProfileRequest) => {
      const res = await api<SellerDto>('seller/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.seller.profile() });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateProductRequest) => {
      const res = await api<ProductDto>('seller/products', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.seller.products() });
      // Hàng đợi kiểm duyệt dùng key admin.products(status): làm mới cả nhánh admin
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all() });
    },
  });
}
