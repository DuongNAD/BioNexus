import React, { useSyncExternalStore } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { getAuthState, subscribeAuth } from '@/api/authStore';
import { useMe } from '@/api/queries/useAuthQueries';
import type { AdminRole } from '@/types/api';

/**
 * 1. RequireAuth: Chặn người dùng chưa đăng nhập
 */
export function RequireAuth(): React.JSX.Element {
  const auth = useSyncExternalStore(subscribeAuth, getAuthState);
  const location = useLocation();

  if (!auth.token || !auth.user) {
    const currentPath = location.pathname + location.search;
    return <Navigate to={`/login?next=${encodeURIComponent(currentPath)}`} replace />;
  }

  return <Outlet />;
}

/**
 * 2. RequireSeller: Chặn người dùng chưa có cửa hàng hoặc cửa hàng chưa ACTIVE
 */
export function RequireSeller(): React.JSX.Element {
  const auth = useSyncExternalStore(subscribeAuth, getAuthState);
  const location = useLocation();
  const { data: me, isLoading } = useMe({ enabled: !!auth.token });

  if (!auth.token || !auth.user) {
    const currentPath = location.pathname + location.search;
    return <Navigate to={`/login?next=${encodeURIComponent(currentPath)}`} replace />;
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-accent">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  const shop = me?.shop;
  if (!shop || shop.status !== 'ACTIVE') {
    return <Navigate to="/seller/apply" replace />;
  }

  return <Outlet />;
}

/**
 * 3. RequireRole: Kiểm tra vai trò quản trị cụ thể (ADMIN, MODERATOR, BIOLOGIST)
 */
export interface RequireRoleProps {
  allowedRoles?: AdminRole[];
}

export function RequireRole({ allowedRoles }: RequireRoleProps): React.JSX.Element {
  const auth = useSyncExternalStore(subscribeAuth, getAuthState);
  const location = useLocation();

  if (!auth.token || !auth.user || auth.accountType !== 'ADMIN') {
    const currentPath = location.pathname + location.search;
    return <Navigate to={`/admin/login?next=${encodeURIComponent(currentPath)}`} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = auth.role as AdminRole;
    const isAuthorized = userRole === 'SUPER_ADMIN' || allowedRoles.includes(userRole);

    if (!isAuthorized) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
          <span className="rounded-full bg-danger/10 px-3 py-1 text-xs font-semibold text-danger">403 FORBIDDEN</span>
          <h2 className="mt-4 text-2xl font-bold text-fg">Không đủ quyền truy cập</h2>
          <p className="mt-2 text-sm text-fg-3">Tài khoản quản trị của bạn không có thẩm quyền kiểm duyệt khu vực này.</p>
        </div>
      );
    }
  }

  return <Outlet />;
}
