import { useQuery } from '@tanstack/react-query';
import { api } from '../client';
import { queryKeys } from '../keys';
import type { MeDto } from '@/types/api';

export function useMe(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: async () => {
      const res = await api<MeDto>('me');
      return res.data;
    },
    staleTime: 60 * 1000,
    enabled: options?.enabled,
  });
}
