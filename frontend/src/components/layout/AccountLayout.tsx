import React from 'react';
import { Outlet, Link, useLocation } from 'react-router';
import { User, Package, FileText, Store, Sparkles, LogOut, type LucideIcon } from 'lucide-react';
import { useLogout } from '@/api/mutations/useAuthMutations';
import { useAuthState, useMe } from '@/api/queries/useAuthQueries';
import { cn } from '@/lib/cn';
import { ContainedRegion, PageContainer } from './Page';

interface AccountNavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

/**
 * Khung trang tài khoản và shop, nằm trong RootLayout nên vẫn giữ navbar và footer chung.
 * Desktop: cột menu bên trái; mobile: menu thành hàng tab cuộn ngang (tài liệu 03 mục 11).
 */
export function AccountLayout(): React.JSX.Element {
  const location = useLocation();
  const logoutMutation = useLogout();
  const auth = useAuthState();
  const { data: me } = useMe();
  const shop = me?.shop;

  // Mục shop đổi theo trạng thái: chưa có shop thì mời đăng ký, có shop thì vào bảng điều khiển
  const userNav: AccountNavItem[] = [
    { label: 'Hồ sơ', path: '/account', icon: User },
    { label: 'Đơn hàng', path: '/orders', icon: Package },
    ...(shop
      ? [{ label: 'Shop của tôi', path: '/seller', icon: Store }]
      : [{ label: 'Mở shop', path: '/seller/apply', icon: FileText }]),
    ...(shop?.status === 'ACTIVE' ? [{ label: 'Đăng bán', path: '/seller/products/new', icon: Sparkles }] : []),
  ];

  const isActivePath = (path: string) =>
    location.pathname === path || (path === '/orders' && location.pathname.startsWith('/orders/'));

  const displayName = auth.user?.fullName || auth.user?.username || '';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <PageContainer className="grid gap-6 py-6 md:py-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
      {/* min-w-0: hàng tab cuộn ngang trên mobile không được kéo giãn cột lưới */}
      <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
        {/* Danh tính: chỉ hiện trên desktop, mobile đã có tên ở navbar */}
        <div className="hidden items-center gap-3 border-b border-line pb-5 lg:flex">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-semibold text-accent">
            {initials || '?'}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-fg">{displayName}</p>
            {auth.user?.username && <p className="truncate text-sm text-fg-3">@{auth.user.username}</p>}
          </div>
        </div>

        <nav aria-label="Menu tài khoản" className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:mt-4 lg:overflow-visible lg:px-0">
          <ul className="flex gap-1 lg:flex-col">
            {userNav.map((item) => {
              const isActive = isActivePath(item.path);
              const Icon = item.icon;
              return (
                <li key={item.path} className="shrink-0">
                  <Link
                    to={item.path}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-3 rounded-full px-4 py-2 text-sm whitespace-nowrap transition-colors lg:rounded-xl lg:px-3 lg:py-2.5',
                      isActive ? 'bg-accent/15 font-semibold text-accent' : 'text-fg-2 hover:bg-surface hover:text-fg'
                    )}
                  >
                    <Icon className="hidden size-4 shrink-0 lg:block" aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
            <li className="shrink-0 lg:mt-4 lg:border-t lg:border-line lg:pt-4">
              <button
                type="button"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="flex w-full items-center gap-3 rounded-full px-4 py-2 text-sm whitespace-nowrap text-fg-3 transition-colors hover:text-danger lg:rounded-xl lg:px-3 lg:py-2.5"
              >
                <LogOut className="hidden size-4 shrink-0 lg:block" aria-hidden="true" />
                <span>Đăng xuất</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      <div className="min-w-0">
        <ContainedRegion>
          <Outlet />
        </ContainedRegion>
      </div>
    </PageContainer>
  );
}
