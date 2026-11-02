import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router';
import { ShoppingBag, User as UserIcon } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { QuickSearch, QuickSearchTrigger } from '@/components/navigation/QuickSearch';
import { FlyToCartContainer } from '@/components/domain/FlyToCart';
import { useCart } from '@/api/queries/useCartQueries';
import { getAuthState, subscribeAuth } from '@/api/authStore';

export function RootLayout(): React.JSX.Element {
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [authState, setAuthState] = useState(getAuthState());

  useEffect(() => {
    return subscribeAuth((next) => setAuthState(next));
  }, []);

  const { data: cart } = useCart({ enabled: !!authState.token });
  const cartCount = cart?.itemCount || 0;

  const navItems = [
    { label: 'Trang chủ', path: '/' },
    { label: 'Cây phân loại', path: '/taxonomy' },
    { label: 'Bách khoa loài', path: '/species' },
    { label: 'Sàn sinh vật cảnh', path: '/products' },
    { label: 'Hành trình 9 loài', path: '/tham-hiem' },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-bg text-fg">
      {/* Skip Link for WCAG 2.2 AA */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:font-semibold focus:text-accent-ink"
      >
        Bỏ qua tới nội dung chính
      </a>

      {/* Fly to cart container */}
      <FlyToCartContainer />

      {/* Navbar */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-line bg-bg/85 px-6 backdrop-blur-xl">
        <Link
          to="/"
          className="group flex items-center gap-2.5 text-lg font-bold tracking-tight text-accent"
          aria-label="BioNexus - Về trang chủ"
        >
          {/* Logo Helix chuẩn vector */}
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-accent/30 bg-accent/10 text-accent transition-colors group-hover:border-accent group-hover:bg-accent/20">
            <Logo size={20} />
          </span>
          <span className="bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-transparent">
            BioNexus
          </span>
        </Link>

        <nav aria-label="Điều hướng chính" className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`transition-colors duration-150 ${
                  isActive ? 'text-accent font-semibold' : 'text-fg-2 hover:text-fg'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <QuickSearchTrigger onClick={() => setIsSearchOpen(true)} className="w-28 md:w-48" />

          {/* Cart Icon */}
          <Link
            to="/cart"
            data-cart-icon
            className="relative flex size-9 items-center justify-center rounded-full border border-line bg-surface/80 text-fg-2 hover:border-accent hover:text-accent transition-colors"
            aria-label={`Giỏ hàng, ${cartCount} sản phẩm`}
          >
            <ShoppingBag className="size-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-ink shadow-sm">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>

          {authState.token ? (
            <Link
              to="/account"
              className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-fg hover:border-accent transition-colors"
            >
              <UserIcon className="size-3.5 text-accent" />
              <span className="hidden sm:inline truncate max-w-[100px]">
                {authState.user?.fullName || authState.user?.username || 'Tài khoản'}
              </span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="rounded-full border border-line bg-surface px-4 py-1.5 text-xs font-semibold text-fg-2 hover:border-accent hover:text-accent transition-colors hidden sm:inline-block"
            >
              Đăng nhập
            </Link>
          )}

          <Link
            to="/products"
            className="rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-accent-ink shadow-[var(--glow-accent-btn)] hover:bg-white transition-colors"
          >
            Khám phá
          </Link>
        </div>
      </header>

      {/* Command Palette QuickSearch toàn cục */}
      <QuickSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Nội dung trang */}
      <main id="main-content" className="flex-1 focus:outline-none">
        <Outlet />
      </main>

      {/* Footer sơ khởi */}
      <footer className="border-t border-line bg-bg-deep p-8 text-center text-xs text-fg-3">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p>BioNexus © 2026 — Bách khoa sinh học & Sàn sinh vật cảnh nhân giống có kiểm duyệt pháp lý.</p>
          <div className="flex items-center gap-4">
            <Link to="/tham-hiem" className="hover:text-accent transition-colors">
              Hành trình 9 loài
            </Link>
            <Link to="/credits" className="hover:text-accent transition-colors">
              Bản quyền ảnh
            </Link>
            <Link to="/taxonomy" className="hover:text-accent transition-colors">
              Phân loại 6 cấp
            </Link>
            <Link to="/species" className="hover:text-accent transition-colors">
              Bách khoa loài
            </Link>
            {import.meta.env.DEV && (
              <Link to="/dev/ui" className="text-accent hover:underline">
                Dev UI Preview
              </Link>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
