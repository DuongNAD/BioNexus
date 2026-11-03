import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router';
import {
  BarChart3,
  Store,
  Search,
  Leaf,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Shield,
  type LucideIcon,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useAuthState } from '@/api/queries/useAuthQueries';
import { useLogout } from '@/api/mutations/useAuthMutations';
import { USE_MOCKS } from '@/lib/env';
import type { AdminRole } from '@/types/api';

interface AdminNavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  allowedRoles: AdminRole[];
}

export function AdminLayout(): React.JSX.Element {
  const location = useLocation();
  const auth = useAuthState();
  const logoutMutation = useLogout('#/admin/login');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const adminNav: AdminNavItem[] = [
    {
      label: 'Tổng quan KPI',
      path: '/admin',
      icon: BarChart3,
      allowedRoles: ['SUPER_ADMIN', 'MODERATOR', 'BIOLOGIST'],
    },
    {
      label: 'Kiểm duyệt Shop',
      path: '/admin/sellers',
      icon: Store,
      allowedRoles: ['SUPER_ADMIN', 'MODERATOR'], // Ẩn với BIOLOGIST
    },
    {
      label: 'Kiểm duyệt Sản phẩm',
      path: '/admin/products',
      icon: Search,
      allowedRoles: ['SUPER_ADMIN', 'MODERATOR'], // Ẩn với BIOLOGIST
    },
    {
      label: 'Quản lý Bách khoa Loài',
      path: '/admin/species',
      icon: Leaf,
      allowedRoles: ['SUPER_ADMIN', 'BIOLOGIST'], // Ẩn với MODERATOR
    },
  ];

  // Không tự gán vai trò mặc định: thiếu vai trò thì chỉ thấy mục chung (Tổng quan)
  const currentRole = (auth.role as AdminRole | null) ?? null;

  // Lọc menu theo vai trò người dùng đăng nhập hiện tại
  const visibleNav = adminNav.filter(
    (item) =>
      currentRole === 'SUPER_ADMIN' ||
      (currentRole ? item.allowedRoles.includes(currentRole) : item.path === '/admin')
  );

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const roleMeta: Record<string, { label: string; badgeClass: string }> = {
    SUPER_ADMIN: {
      label: 'Admin Tổng',
      badgeClass: 'border-purple-500/40 bg-purple-500/15 text-purple-300',
    },
    MODERATOR: {
      label: 'Kiểm duyệt viên',
      badgeClass: 'border-warm/40 bg-warm/15 text-warm',
    },
    BIOLOGIST: {
      label: 'Nhà sinh học',
      badgeClass: 'border-accent/40 bg-accent/15 text-accent',
    },
  };

  const currentRoleInfo = (currentRole && roleMeta[currentRole]) || {
    label: 'Chưa rõ vai trò',
    badgeClass: 'border-line bg-surface text-fg-3',
  };

  const getPageTitle = (path: string): string => {
    switch (path) {
      case '/admin':
        return 'Tổng quan KPI';
      case '/admin/sellers':
        return 'Kiểm duyệt Shop';
      case '/admin/products':
        return 'Kiểm duyệt Sản phẩm';
      case '/admin/species':
        return 'Quản lý Bách khoa Loài';
      default:
        return 'Quản trị hệ thống';
    }
  };

  return (
    <div className="flex min-h-screen bg-bg-deep text-fg">
      {/* 1. Sidebar desktop cố định bên trái */}
      <aside className="w-64 border-r border-line bg-black/60 backdrop-blur-2xl p-6 flex flex-col justify-between hidden md:flex shrink-0">
        <div className="space-y-6">
          {/* Logo & Badge */}
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-lg font-bold text-accent">
              <Logo size={22} />
              <span>BioNexus</span>
            </Link>
            <span className="rounded-full bg-danger/20 border border-danger/40 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-danger uppercase">
              Quản trị
            </span>
          </div>

          {/* Hồ sơ Admin */}
          <div className="rounded-xl border border-line/60 bg-surface/60 p-3 flex items-center gap-3">
            <div className="size-9 rounded-lg bg-surface-2 border border-line flex items-center justify-center font-bold text-accent text-sm uppercase">
              {(auth.user?.fullName || auth.user?.username || 'A')[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-fg truncate">
                {auth.user?.fullName || auth.user?.username || 'Quản trị viên'}
              </p>
              <span
                className={`inline-block mt-0.5 rounded px-1.5 text-[10px] font-bold border uppercase ${currentRoleInfo.badgeClass}`}
              >
                {currentRoleInfo.label}
              </span>
            </div>
          </div>

          {/* Navigation Menu */}
          <div>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-fg-3">
              Bảng quản trị sàn
            </p>
            <nav className="mt-3 flex flex-col gap-1 text-sm font-medium" aria-label="Menu quản trị">
              {visibleNav.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                      isActive
                        ? 'bg-danger/15 text-danger font-semibold border border-danger/30'
                        : 'text-fg-2 hover:bg-surface-hover hover:text-fg'
                    }`}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-line/40 pt-4 space-y-3 text-xs text-fg-3">
          <Link to="/" className="block hover:text-accent transition-colors">
            ← Quay lại trang chủ sàn
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="w-full flex items-center gap-2 rounded-xl border border-line/60 bg-surface px-3 py-2 text-xs font-semibold text-danger hover:border-danger/40 hover:bg-danger/10 transition-colors"
          >
            <LogOut className="size-3.5" aria-hidden="true" />
            <span>Đăng xuất phiên</span>
          </button>
        </div>
      </aside>

      {/* 2. Khung nội dung chính */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="h-16 border-b border-line bg-bg-deep/80 backdrop-blur-xl px-6 flex items-center justify-between md:hidden shrink-0">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 text-base font-bold text-accent">
              <Logo size={18} />
              <span>BioNexus</span>
            </Link>
            <span className="rounded bg-danger/20 border border-danger/40 px-1.5 py-0.5 text-[10px] font-semibold text-danger">
              Quản trị
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-xl border border-line bg-surface p-2 text-fg hover:text-accent transition-colors"
              aria-label={isMobileMenuOpen ? 'Đóng menu quản trị' : 'Mở menu quản trị'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="admin-mobile-menu"
            >
              {isMobileMenuOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div id="admin-mobile-menu" className="md:hidden border-b border-line bg-bg-raised/95 backdrop-blur-2xl p-4 space-y-4 animate-fadeIn">
            <div className="flex items-center gap-3 p-2 bg-surface/60 rounded-xl border border-line">
              <div className="size-8 rounded-lg bg-surface-2 flex items-center justify-center font-bold text-accent text-xs uppercase">
                {(auth.user?.fullName || auth.user?.username || 'A')[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-fg truncate">
                  {auth.user?.fullName || auth.user?.username}
                </p>
                <span className={`text-[10px] font-bold uppercase ${currentRoleInfo.badgeClass}`}>
                  {currentRoleInfo.label}
                </span>
              </div>
            </div>

            <nav className="flex flex-col gap-1 text-sm font-medium" aria-label="Menu quản trị">
              {visibleNav.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                      isActive
                        ? 'bg-danger/15 text-danger font-semibold border border-danger/30'
                        : 'text-fg-2 hover:bg-surface-hover hover:text-fg'
                    }`}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-2 border-t border-line flex items-center justify-between">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-xs text-fg-3 hover:text-accent"
              >
                ← Trang chủ
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="text-xs text-danger font-semibold flex items-center gap-1"
              >
                <LogOut className="size-3" aria-hidden="true" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        )}

        {/* Desktop Breadcrumbs Bar */}
        <div className="hidden md:flex h-12 border-b border-line/60 bg-surface/20 px-6 md:px-10 items-center justify-between text-xs text-fg-3">
          <div className="flex items-center gap-2">
            <Shield className="size-3.5 text-danger" aria-hidden="true" />
            <span>Khu vực Quản trị</span>
            <ChevronRight className="size-3 text-fg-3" aria-hidden="true" />
            <span className="text-fg font-semibold">{getPageTitle(location.pathname)}</span>
          </div>

          {/* Chỉ báo dữ liệu giả: chỉ hiện khi chạy với MSW, không hiện khi nối backend thật */}
          {USE_MOCKS && (
            <span className="text-warm font-semibold flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-warm" aria-hidden="true" />
              <span>Dữ liệu giả lập (MSW)</span>
            </span>
          )}
        </div>

        {/* Content Outlet */}
        <div className="flex-1 p-6 md:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
