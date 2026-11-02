import { useQuery } from '@tanstack/react-query';
import { api } from '../client';
import { queryKeys } from '../keys';
import { toSpeciesView, type SpeciesViewModel } from '../adapters';
import type { SpeciesDto, ProductDto } from '@/types/api';

export function useSpeciesList(filters?: { nodeId?: number; q?: string; iucn?: string }) {
  return useQuery({
    queryKey: queryKeys.species.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.nodeId) params.set('nodeId', String(filters.nodeId));
      if (filters?.q) params.set('q', filters.q);
      if (filters?.iucn) params.set('iucn', filters.iucn);
      const queryStr = params.toString() ? `?${params.toString()}` : '';

      const res = await api<SpeciesDto[]>(`species${queryStr}`);
      const rawList = res.data || [];
      return rawList.map((s) => toSpeciesView(s));
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSpeciesDetail(id: number | string, options?: { enabled?: boolean }) {
  return useQuery<SpeciesViewModel | null>({
    queryKey: queryKeys.species.detail(id),
    queryFn: async () => {
      const res = await api<SpeciesDto>(`species/${id}`);
      if (!res.data) return null;
      return toSpeciesView(res.data);
    },
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled !== undefined ? options.enabled : !!id,
  });
}

export function useSpeciesProducts(id: number | string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.species.products(id),
    queryFn: async () => {
      const res = await api<ProductDto[]>(`species/${id}/products`);
      return res.data || [];
    },
    staleTime: 2 * 60 * 1000,
    enabled: options?.enabled !== undefined ? options.enabled : !!id,
  });
}
