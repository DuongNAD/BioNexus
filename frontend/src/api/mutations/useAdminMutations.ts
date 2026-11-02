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
      const payload: UpdateStatusRequest = { status, reason };
      const res = await api<SellerDto>(`admin/sellers/${sellerId}/status`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      return res.data!;
    },
    onSuccess: () => {
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
      const payload: UpdateStatusRequest = { status, reason };
      const res = await api<ProductDto>(`admin/products/${productId}/status`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      return res.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all() });
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
