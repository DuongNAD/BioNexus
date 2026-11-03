import { useSyncExternalStore } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../client';
import { queryKeys } from '../keys';
import { getAuthState, subscribeAuth, type AuthState } from '../authStore';
import type { MeDto } from '@/types/api';

/** Trạng thái đăng nhập dạng reactive: component tự render lại khi đăng nhập hoặc đăng xuất */
export function useAuthState(): AuthState {
  return useSyncExternalStore(subscribeAuth, getAuthState, getAuthState);
}

export function useMe(options?: { enabled?: boolean }) {
  const auth = useAuthState();
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: async () => {
      const res = await api<MeDto>('me');
      return res.data;
    },
    staleTime: 60 * 1000,
    // api/me chỉ dành cho tài khoản USER; admin gọi sẽ bị 403
    enabled: (options?.enabled ?? true) && !!auth.token && auth.accountType === 'USER',
  });
}
