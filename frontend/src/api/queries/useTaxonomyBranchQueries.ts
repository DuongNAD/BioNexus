import { useQueries } from '@tanstack/react-query';
import { api } from '../client';
import { queryKeys } from '../keys';
import { toSpeciesView, type SpeciesViewModel } from '../adapters';
import type { SpeciesDto, TaxonomyNodeDto } from '@/types/api';

/**
 * Nạp nút con của nhiều nút cùng lúc (mỗi cột Miller là con của một mắt xích breadcrumbs).
 * Dùng chung query key với useTaxonomyChildren nên không gọi lại API đã có trong bộ đệm.
 */
export function useTaxonomyChildrenMany(nodeIds: number[]): {
  childrenById: Record<number, TaxonomyNodeDto[]>;
  isLoading: boolean;
  isError: boolean;
} {
  return useQueries({
    queries: nodeIds.map((id) => ({
      queryKey: queryKeys.taxonomy.children(id),
      queryFn: async () => {
        const res = await api<TaxonomyNodeDto[]>(`taxonomy/${id}/children`);
        return res.data || [];
      },
      staleTime: 10 * 60 * 1000,
    })),
    combine: (results) => {
      const childrenById: Record<number, TaxonomyNodeDto[]> = {};
      results.forEach((r, idx) => {
        const id = nodeIds[idx];
        if (id !== undefined && r.data) childrenById[id] = r.data;
      });
      return {
        childrenById,
        isLoading: results.some((r) => r.isLoading),
        isError: results.some((r) => r.isError),
      };
    },
  });
}

/**
 * Loài nằm dưới từng nhánh (api/species?nodeId= trả cả cây con), dùng cho chồng ảnh thu nhỏ.
 * Dùng chung query key với useSpeciesList({ nodeId }).
 */
export function useBranchSpeciesMany(nodeIds: number[]): Record<number, SpeciesViewModel[]> {
  return useQueries({
    queries: nodeIds.map((nodeId) => ({
      queryKey: queryKeys.species.list({ nodeId }),
      queryFn: async () => {
        const res = await api<SpeciesDto[]>(`species?nodeId=${nodeId}`);
        return (res.data || []).map((s) => toSpeciesView(s));
      },
      staleTime: 5 * 60 * 1000,
    })),
    combine: (results) => {
      const map: Record<number, SpeciesViewModel[]> = {};
      results.forEach((r, idx) => {
        const id = nodeIds[idx];
        if (id !== undefined && r.data) map[id] = r.data;
      });
      return map;
    },
  });
}
