import React from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router';
import { ShieldAlert } from 'lucide-react';
import { useAuthState, useMe } from '@/api/queries/useAuthQueries';
import type { AdminRole } from '@/types/api';

interface GuardProps {
  children?: React.ReactNode;
}

function useNextParam(): string {
  const location = useLocation();
  return encodeURIComponent(location.pathname + location.search);
}

/** Trang 403 hiện ngay trong layout (tài liệu 03 mục 0: sai quyền thì không redirect im lặng) */
export function ForbiddenState({
  message,
  homeTo = '/',
  homeLabel = 'Về trang chủ',
}: {
  message: string;
  homeTo?: string;
  homeLabel?: string;
}): React.JSX.Element {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 flex size-16 items-center justify-center rounded-2xl border border-danger/40 bg-danger/10 text-danger">
        <ShieldAlert className="size-8" aria-hidden="true" />
      </div>
      <span className="rounded-full border border-danger/40 bg-danger/15 px-3 py-1 text-xs font-semibold text-danger">
        Mã lỗi 403
      </span>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-fg">Bạn không có quyền xem trang này</h1>
      <p className="mt-2 text-sm leading-relaxed text-fg-2">{message}</p>
      <Link
        to={homeTo}
        className="mt-6 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-ink hover:opacity-90"
      >
        {homeLabel}
      </Link>
    </div>
  );
}

/**
 * 1. RequireAuth: trang dành cho tài khoản USER. Khách thì về #/login?next=…, admin thì thấy 403.
 */
export function RequireAuth({ children }: GuardProps): React.JSX.Element {
  const auth = useAuthState();
  const next = useNextParam();

  if (!auth.token || !auth.user) {
    return <Navigate to={`/login?next=${next}`} replace />;
  }
  if (auth.accountType !== 'USER') {
    return (
      <ForbiddenState
        message="Tài khoản quản trị không dùng giỏ hàng, đơn hàng hay shop. Hãy đăng nhập bằng tài khoản thành viên."
        homeTo="/admin"
        homeLabel="Về khu vực quản trị"
      />
    );
  }

  return <>{children ?? <Outlet />}</>;
}

/**
 * 2. RequireSeller: chỉ shop ACTIVE mới qua. Shop chưa ACTIVE thì về trang đăng ký shop.
 */
export function RequireSeller({ children }: GuardProps): React.JSX.Element {
  const auth = useAuthState();
  const next = useNextParam();
  const { data: me, isLoading } = useMe();

  if (!auth.token || !auth.user) {
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-accent" role="status" aria-label="Đang kiểm tra shop">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  const shop = me?.shop;
  if (!shop || shop.status !== 'ACTIVE') {
    return <Navigate to="/seller/apply" replace />;
  }

  return <>{children ?? <Outlet />}</>;
}

/**
 * 3. RequireRole: khu quản trị. Chưa đăng nhập admin thì về #/admin/login, sai vai trò thì 403.
 */
export interface RequireRoleProps extends GuardProps {
  allowedRoles?: AdminRole[];
}

export function RequireRole({ allowedRoles, children }: RequireRoleProps): React.JSX.Element {
  const auth = useAuthState();
  const next = useNextParam();

  if (!auth.token || !auth.user) {
    return <Navigate to={`/admin/login?next=${next}`} replace />;
  }
  if (auth.accountType !== 'ADMIN') {
    return (
      <ForbiddenState message="Khu vực này chỉ dành cho Ban Quản trị BioNexus. Hãy đăng nhập bằng tài khoản quản trị." />
    );
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = auth.role as AdminRole;
    if (userRole !== 'SUPER_ADMIN' && !allowedRoles.includes(userRole)) {
      return (
        <ForbiddenState
          message="Vai trò quản trị của bạn không được giao nhiệm vụ ở khu vực này."
          homeTo="/admin"
          homeLabel="Về bảng tổng quan"
        />
      );
    }
  }

  return <>{children ?? <Outlet />}</>;
}
