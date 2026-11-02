import { useQuery } from '@tanstack/react-query';
import { api } from '../client';
import { queryKeys } from '../keys';
import type { TaxonomyNodeDto, TaxonomyDetailDto, SpeciesDto } from '@/types/api';

export function useTaxonomyTree() {
  return useQuery({
    queryKey: queryKeys.taxonomy.root(),
    queryFn: async () => {
      const res = await api<TaxonomyNodeDto[]>('taxonomy');
      return res.data || [];
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useTaxonomyDetail(id: number | string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.taxonomy.detail(id),
    queryFn: async () => {
      const res = await api<TaxonomyDetailDto>(`taxonomy/${id}`);
      return res.data;
    },
    staleTime: 10 * 60 * 1000,
    enabled: options?.enabled !== undefined ? options.enabled : !!id,
  });
}

export function useTaxonomyChildren(id: number | string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.taxonomy.children(id),
    queryFn: async () => {
      const res = await api<TaxonomyNodeDto[]>(`taxonomy/${id}/children`);
      return res.data || [];
    },
    staleTime: 10 * 60 * 1000,
    enabled: options?.enabled !== undefined ? options.enabled : !!id,
  });
}

export function useTaxonomySpecies(id: number | string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.taxonomy.species(id),
    queryFn: async () => {
      const res = await api<SpeciesDto[]>(`taxonomy/${id}/species`);
      return res.data || [];
    },
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled !== undefined ? options.enabled : !!id,
  });
}
