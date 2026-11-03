import React from 'react';
import { Outlet, Link, useLocation } from 'react-router';
import { User, Package, FileText, Store, Sparkles, LogOut, type LucideIcon } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useLogout } from '@/api/mutations/useAuthMutations';
import { useMe } from '@/api/queries/useAuthQueries';

interface AccountNavItem {
  label: string;
  shortLabel: string;
  path: string;
  icon: LucideIcon;
}

export function AccountLayout(): React.JSX.Element {
  const location = useLocation();
  const logoutMutation = useLogout();
  const { data: me } = useMe();
  const shop = me?.shop;

  // Mục shop đổi theo trạng thái: chưa có shop thì mời đăng ký, có shop thì vào bảng điều khiển
  const userNav: AccountNavItem[] = [
    { label: 'Hồ sơ cá nhân', shortLabel: 'Tài khoản', path: '/account', icon: User },
    { label: 'Lịch sử đơn hàng', shortLabel: 'Đơn hàng', path: '/orders', icon: Package },
    ...(shop
      ? [{ label: 'Bảng điều khiển Shop', shortLabel: 'Shop', path: '/seller', icon: Store }]
      : [{ label: 'Đăng ký mở shop', shortLabel: 'Mở shop', path: '/seller/apply', icon: FileText }]),
    ...(shop?.status === 'ACTIVE'
      ? [{ label: 'Đăng bán sản phẩm mới', shortLabel: 'Đăng bán', path: '/seller/products/new', icon: Sparkles }]
      : []),
  ];

  const isActivePath = (path: string) =>
    location.pathname === path || (path === '/orders' && location.pathname.startsWith('/orders/'));

  return (
    <div className="flex min-h-screen bg-bg text-fg">
      {/* Sidebar người dùng */}
      <aside className="w-64 border-r border-line bg-bg-raised p-6 flex flex-col justify-between hidden md:flex">
        <div className="space-y-6">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-accent" aria-label="BioNexus - Về trang chủ">
            <Logo size={22} />
            <span>BioNexus</span>
          </Link>

          <div>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-fg-3">Trung tâm thành viên</p>
            <nav className="mt-3 flex flex-col gap-1 text-sm font-medium" aria-label="Menu tài khoản">
              {userNav.map((item) => {
                const isActive = isActivePath(item.path);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                      isActive
                        ? 'bg-accent/15 text-accent font-semibold border border-accent/25'
                        : 'text-fg-2 hover:bg-surface-hover hover:text-fg'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="border-t border-line/40 pt-4 text-xs text-fg-3 space-y-2">
          <button
            type="button"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="flex items-center gap-2 text-fg-3 hover:text-red-400 transition-colors w-full text-left"
          >
            <LogOut className="size-3.5" aria-hidden="true" />
            <span>Đăng xuất tài khoản</span>
          </button>
          <Link to="/" className="block hover:text-accent transition-colors pt-1">
            ← Về trang chủ
          </Link>
        </div>
      </aside>

      {/* Nội dung chính */}
      <main id="main-content" className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-line bg-bg/80 backdrop-blur-xl px-4 md:hidden">
          <div className="flex h-14 items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-base font-bold text-accent" aria-label="BioNexus - Về trang chủ">
              <Logo size={18} />
              <span>BioNexus</span>
            </Link>
            <button
              type="button"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-fg-2 hover:border-red-400/60 hover:text-red-300"
            >
              <LogOut className="size-3.5" aria-hidden="true" />
              <span>Đăng xuất</span>
            </button>
          </div>
          {/* Tài liệu 03 mục 11: trên mobile menu tài khoản thành tabs */}
          <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-2 text-xs" aria-label="Menu tài khoản">
            {userNav.map((item) => {
              const isActive = isActivePath(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  aria-current={isActive ? 'page' : undefined}
                  className={`whitespace-nowrap rounded-full px-3 py-1.5 transition-colors ${
                    isActive ? 'bg-accent/15 font-semibold text-accent' : 'text-fg-2 hover:text-fg'
                  }`}
                >
                  {item.shortLabel}
                </Link>
              );
            })}
          </nav>
        </header>

        <div className="flex-1 p-4 sm:p-6 md:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
