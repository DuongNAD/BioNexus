import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router';
import { BarChart3, Store, Search, Leaf, LogOut, Menu, X, ArrowLeft, type LucideIcon } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useAuthState } from '@/api/queries/useAuthQueries';
import { useLogout } from '@/api/mutations/useAuthMutations';
import { USE_MOCKS } from '@/lib/env';
import { cn } from '@/lib/cn';
import { ContainedRegion } from './Page';
import type { AdminRole } from '@/types/api';

interface AdminNavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  allowedRoles: AdminRole[];
}

const ADMIN_NAV: AdminNavItem[] = [
  { label: 'Tổng quan', path: '/admin', icon: BarChart3, allowedRoles: ['SUPER_ADMIN', 'MODERATOR', 'BIOLOGIST'] },
  // Duyệt shop và sản phẩm: chỉ MODERATOR và SUPER_ADMIN (tài liệu 04)
  { label: 'Duyệt shop', path: '/admin/sellers', icon: Store, allowedRoles: ['SUPER_ADMIN', 'MODERATOR'] },
  { label: 'Duyệt sản phẩm', path: '/admin/products', icon: Search, allowedRoles: ['SUPER_ADMIN', 'MODERATOR'] },
  // Quản lý loài: chỉ BIOLOGIST và SUPER_ADMIN
  { label: 'Quản lý loài', path: '/admin/species', icon: Leaf, allowedRoles: ['SUPER_ADMIN', 'BIOLOGIST'] },
];

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: 'Quản trị tổng',
  MODERATOR: 'Kiểm duyệt viên',
  BIOLOGIST: 'Nhà sinh học',
};

/** Khung khu quản trị: thanh bên cố định trên desktop, menu thả xuống trên mobile */
export function AdminLayout(): React.JSX.Element {
  const location = useLocation();
  const auth = useAuthState();
  const logoutMutation = useLogout('#/admin/login');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Không tự gán vai trò mặc định: thiếu vai trò thì chỉ thấy mục Tổng quan
  const currentRole = (auth.role as AdminRole | null) ?? null;
  const visibleNav = ADMIN_NAV.filter(
    (item) =>
      currentRole === 'SUPER_ADMIN' || (currentRole ? item.allowedRoles.includes(currentRole) : item.path === '/admin')
  );
  const displayName = auth.user?.fullName || auth.user?.username || '';
  const roleLabel = currentRole ? ROLE_LABEL[currentRole] ?? currentRole : 'Chưa rõ vai trò';

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navList = (
    <ul className="space-y-1">
      {visibleNav.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        return (
          <li key={item.path}>
            <Link
              to={item.path}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                isActive ? 'bg-accent/15 font-semibold text-accent' : 'text-fg-2 hover:bg-surface hover:text-fg'
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );

  const identity = (
    <div className="flex items-center gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-semibold text-accent">
        {(displayName[0] || 'Q').toUpperCase()}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-fg">{displayName}</p>
        <p className="truncate text-sm text-fg-3">{roleLabel}</p>
      </div>
    </div>
  );

  const footerLinks = (
    <div className="space-y-1 text-sm">
      <Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-fg-3 transition-colors hover:bg-surface hover:text-fg">
        <ArrowLeft className="size-4" aria-hidden="true" />
        <span>Về trang chủ sàn</span>
      </Link>
      <button
        type="button"
        onClick={() => logoutMutation.mutate()}
        disabled={logoutMutation.isPending}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-fg-3 transition-colors hover:bg-danger/10 hover:text-danger"
      >
        <LogOut className="size-4" aria-hidden="true" />
        <span>Đăng xuất</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg text-fg lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      {/* Thanh bên desktop */}
      <aside className="sticky top-0 hidden h-screen flex-col justify-between border-r border-line bg-bg-deep px-4 py-6 lg:flex">
        <div className="space-y-8">
          <Link to="/admin" className="flex items-center gap-2.5 px-3 text-lg font-bold tracking-tight text-accent">
            <Logo size={20} />
            <span>BioNexus</span>
            <span className="text-sm font-medium text-fg-3">Quản trị</span>
          </Link>
          <div className="px-3">{identity}</div>
          <nav aria-label="Menu quản trị">{navList}</nav>
        </div>
        <div className="space-y-4">
          {USE_MOCKS && <p className="px-3 text-xs text-fg-3">Đang dùng dữ liệu giả lập (MSW)</p>}
          {footerLinks}
        </div>
      </aside>

      <div className="min-w-0">
        {/* Thanh trên mobile */}
        <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur-xl lg:hidden">
          <div className="flex h-14 items-center justify-between px-4">
            <Link to="/admin" className="flex items-center gap-2 text-base font-bold text-accent">
              <Logo size={18} />
              <span>Quản trị</span>
            </Link>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="admin-mobile-menu"
              aria-label={isMobileMenuOpen ? 'Đóng menu quản trị' : 'Mở menu quản trị'}
              className="flex size-9 items-center justify-center rounded-full border border-line text-fg hover:border-accent hover:text-accent"
            >
              {isMobileMenuOpen ? <X className="size-4" aria-hidden="true" /> : <Menu className="size-4" aria-hidden="true" />}
            </button>
          </div>
          {isMobileMenuOpen && (
            <div id="admin-mobile-menu" className="space-y-4 border-t border-line px-4 py-4">
              {identity}
              <nav aria-label="Menu quản trị">{navList}</nav>
              <div className="border-t border-line pt-3">{footerLinks}</div>
            </div>
          )}
        </header>

        <main id="main-content" className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-10">
          <ContainedRegion>
            <Outlet />
          </ContainedRegion>
        </main>
      </div>
    </div>
  );
}
