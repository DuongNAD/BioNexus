import React from 'react';
import { Outlet, Link, useLocation } from 'react-router';
import { User, Package, FileText, Store, Sparkles, LogOut, type LucideIcon } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useLogout } from '@/api/mutations/useAuthMutations';

interface AccountNavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export function AccountLayout(): React.JSX.Element {
  const location = useLocation();
  const logoutMutation = useLogout();

  const userNav: AccountNavItem[] = [
    { label: 'Hồ sơ cá nhân', path: '/account', icon: User },
    { label: 'Lịch sử đơn hàng', path: '/orders', icon: Package },
    { label: 'Đăng ký mở shop', path: '/seller/apply', icon: FileText },
    { label: 'Bảng điều khiển Shop', path: '/seller', icon: Store },
    { label: 'Đăng bán sản phẩm mới', path: '/seller/products/new', icon: Sparkles },
  ];

  return (
    <div className="flex min-h-screen bg-bg text-fg">
      {/* Sidebar người dùng */}
      <aside className="w-64 border-r border-line bg-bg-raised p-6 flex flex-col justify-between hidden md:flex">
        <div className="space-y-6">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-accent">
            <Logo size={22} />
            <span>BioNexus</span>
          </Link>

          <div>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-fg-mute">
              Trung tâm thành viên
            </p>
            <nav className="mt-3 flex flex-col gap-1 text-sm font-medium">
              {userNav.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
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
            <LogOut className="size-3.5" />
            <span>Đăng xuất tài khoản</span>
          </button>
          <Link to="/" className="block hover:text-accent transition-colors pt-1">
            ← Về trang chủ
          </Link>
          <p className="text-[10px] text-fg-mute">Tài khoản thành viên BioNexus</p>
        </div>
      </aside>

      {/* Nội dung chính */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-line bg-bg/80 backdrop-blur-xl px-6 flex items-center justify-between md:hidden">
          <Link to="/" className="flex items-center gap-2 text-base font-bold text-accent">
            <Logo size={18} />
            <span>BioNexus</span>
          </Link>
          <div className="flex items-center gap-3 text-xs text-fg-2">
            <Link to="/account" className="hover:text-fg">Tài khoản</Link>
            <Link to="/orders" className="hover:text-fg">Đơn hàng</Link>
            <Link to="/seller" className="hover:text-fg">Shop</Link>
          </div>
        </header>

        <div className="flex-1 p-6 md:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
