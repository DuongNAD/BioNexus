import { useQuery } from '@tanstack/react-query';
import { api } from '../client';
import { queryKeys } from '../keys';
import { normalizePage } from '../normalize';
import { toProductView, type ProductViewModel } from '../adapters';
import type { ProductDto, ReviewDto, Page } from '@/types/api';

export function useProducts(params?: {
  speciesId?: number;
  q?: string;
  page?: number;
  size?: number;
}) {
  return useQuery<Page<ProductViewModel>>({
    queryKey: queryKeys.products.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.speciesId) searchParams.set('speciesId', String(params.speciesId));
      if (params?.q) searchParams.set('q', params.q);
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.size) searchParams.set('size', String(params.size));
      const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : '';

      const res = await api<Page<ProductDto>>(`products${queryStr}`);
      const normalized = normalizePage(res.data);
      return {
        ...normalized,
        items: normalized.items.map((p) => toProductView(p)),
      };
    },
    staleTime: 60 * 1000,
  });
}

export function useProductDetail(id: number | string, options?: { enabled?: boolean }) {
  return useQuery<ProductViewModel | null>({
    queryKey: queryKeys.products.detail(id),
    queryFn: async () => {
      const res = await api<ProductDto>(`products/${id}`);
      if (!res.data) return null;
      return toProductView(res.data);
    },
    staleTime: 60 * 1000,
    enabled: options?.enabled !== undefined ? options.enabled : !!id,
  });
}

export function useProductReviews(id: number | string, options?: { enabled?: boolean }) {
  return useQuery<ReviewDto[]>({
    queryKey: queryKeys.products.reviews(id),
    queryFn: async () => {
      const res = await api<ReviewDto[]>(`products/${id}/reviews`);
      return res.data || [];
    },
    staleTime: 60 * 1000,
    enabled: options?.enabled !== undefined ? options.enabled : !!id,
  });
}
