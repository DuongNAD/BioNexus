import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import { setAuthSession, clearAuthSession } from '../authStore';
import { queryKeys } from '../keys';
import type { LoginRequest, RegisterRequest, AuthResponse } from '@/types/api';

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const res = await api<AuthResponse>('auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
        skipAuth: true,
      });
      return res.data!;
    },
    onSuccess: (data) => {
      setAuthSession(data);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all() });
    },
  });
}

export function useAdminLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: { account: string; password: string }) => {
      const res = await api<AuthResponse>('auth/admin/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
        skipAuth: true,
      });
      return res.data!;
    },
    onSuccess: (data) => {
      setAuthSession(data);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all() });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: RegisterRequest) => {
      const res = await api<AuthResponse>('auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
        skipAuth: true,
      });
      return res.data!;
    },
    onSuccess: (data) => {
      setAuthSession(data);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all() });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        await api('auth/logout', { method: 'POST' });
      } finally {
        clearAuthSession();
      }
    },
    onSettled: () => {
      clearAuthSession();
      queryClient.clear();
      if (typeof window !== 'undefined') {
        window.location.hash = '#/login';
      }
    },
  });
}
