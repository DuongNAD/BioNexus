import { useQueries } from '@tanstack/react-query';
import { api } from '../client';
import { queryKeys } from '../keys';
import { toSpeciesView, type SpeciesViewModel } from '../adapters';
import type { SpeciesDto } from '@/types/api';

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
