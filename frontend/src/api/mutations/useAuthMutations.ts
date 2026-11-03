import { useMutation } from '@tanstack/react-query';
import { api } from '../client';
import { setAuthSession, clearAuthSession } from '../authStore';
import type { LoginRequest, RegisterRequest, AuthResponse } from '@/types/api';

// Bộ đệm riêng tư (giỏ, đơn, shop, hàng đợi admin) được xóa ở App khi người đăng nhập đổi,
// nên các mutation ở đây chỉ cần cập nhật authStore.

export function useLogin() {
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
    },
  });
}

export function useAdminLogin() {
  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const res = await api<AuthResponse>('auth/admin/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
        skipAuth: true,
      });
      return res.data!;
    },
    onSuccess: (data) => {
      setAuthSession(data);
    },
  });
}

export function useRegister() {
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
    },
  });
}

/** Hợp đồng API không có endpoint đăng xuất (token không trạng thái), nên chỉ xóa phiên ở client */
export function useLogout(redirectTo: string = '#/login') {
  return useMutation({
    mutationFn: async () => {
      clearAuthSession();
    },
    onSettled: () => {
      if (typeof window !== 'undefined') {
        window.location.hash = redirectTo;
      }
    },
  });
}
