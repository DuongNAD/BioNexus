import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router';
import { Menu, ShoppingBag, User as UserIcon, X, Shield } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { QuickSearch, QuickSearchTrigger } from '@/components/navigation/QuickSearch';
import { FlyToCartContainer } from '@/components/domain/FlyToCart';
import { useCart } from '@/api/queries/useCartQueries';
import { useAuthState } from '@/api/queries/useAuthQueries';
import { cn } from '@/lib/cn';
import { PageContainer } from './Page';

const FOOTER_COLUMNS: { title: string; links: { label: string; to: string; devOnly?: boolean }[] }[] = [
  {
    title: 'Khám phá',
    links: [
      { label: 'Cây phân loại', to: '/taxonomy' },
      { label: 'Bách khoa loài', to: '/species' },
      { label: 'Hành trình 9 loài', to: '/tham-hiem' },
    ],
  },
  {
    title: 'Cửa hàng',
    links: [
      { label: 'Sàn sinh vật cảnh', to: '/products' },
      { label: 'Giỏ hàng', to: '/cart' },
      { label: 'Đơn hàng của tôi', to: '/orders' },
    ],
  },
  {
    title: 'Người bán và dự án',
    links: [
      { label: 'Mở shop', to: '/seller/apply' },
      { label: 'Nguồn ảnh', to: '/credits' },
      { label: 'Đăng nhập quản trị', to: '/admin/login' },
      { label: 'Thư viện giao diện', to: '/dev/ui', devOnly: true },
    ],
  },
];

const NAV_ITEMS = [
  { label: 'Trang chủ', path: '/' },
  { label: 'Cây phân loại', path: '/taxonomy' },
  { label: 'Bách khoa loài', path: '/species' },
  // Chữ "Mua sắm" để người dùng nhận ra ngay đây là sàn; tiêu đề trang vẫn là Sàn sinh vật cảnh
  { label: 'Mua sắm', path: '/products' },
  { label: 'Hành trình 9 loài', path: '/tham-hiem' },
];

// Chỉ tài khoản người mua mới có đơn hàng nên mục Giao dịch chỉ hiện khi đăng nhập USER
const TRANSACTIONS_ITEM = { label: 'Giao dịch', path: '/orders' };

// Trang con (/species/5, /taxonomy/3) vẫn sáng mục cha
function isNavActive(pathname: string, path: string): boolean {
  return path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(`${path}/`);
}

export function RootLayout(): React.JSX.Element {
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const authState = useAuthState();
  const isAdmin = authState.accountType === 'ADMIN';
  const navItems =
    authState.accountType === 'USER' ? [...NAV_ITEMS.slice(0, 4), TRANSACTIONS_ITEM, ...NAV_ITEMS.slice(4)] : NAV_ITEMS;

  // Admin không có giỏ hàng (tài liệu 03 mục 1): useCart tự tắt với tài khoản không phải USER
  const { data: cart } = useCart();
  const cartCount = cart?.itemCount || 0;

  // Trang chủ: header trong suốt nổi trên cảnh hạt, thành kính mờ sau khi cuộn quá 80 px (tài liệu 03 mục 1)
  const isHome = location.pathname === '/';
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setIsScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);
  const isHeaderClear = isHome && !isScrolled && !isMenuOpen;

  // Đóng menu mobile khi chuyển trang
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMenuOpen]);

  const accountLink = isAdmin ? '/admin' : '/account';
  const accountLabel = authState.user?.fullName || authState.user?.username || 'Tài khoản';

  return (
    <div className="flex min-h-screen flex-col bg-bg text-fg">
      {/* Skip Link for WCAG 2.2 AA */}
      <a
        href="#main-content"
        onClick={(e) => {
          // HashRouter dùng hash cho route: nhảy tới nội dung bằng focus thay vì đổi hash
          e.preventDefault();
          document.getElementById('main-content')?.focus();
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:font-semibold focus:text-accent-ink"
      >
        Bỏ qua tới nội dung chính
      </a>

      {/* Fly to cart container */}
      <FlyToCartContainer />

      {/* Navbar */}
      <header
        className={cn(
          'top-0 z-50 border-b transition-[background-color,border-color] duration-300',
          isHome ? 'fixed inset-x-0' : 'sticky',
          isHeaderClear ? 'border-transparent bg-transparent' : 'border-line bg-bg/85 backdrop-blur-xl'
        )}
      >
        <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2 rounded-full text-accent"
            aria-label="BioNexus - Về trang chủ"
          >
            <Logo size={28} />
            <span className="text-[17px] font-semibold tracking-[-0.02em] text-fg">BioNexus</span>
          </Link>

          {/* Nav viên thuốc. Nền mục đang chọn làm bằng CSS: motion.span layoutId kéo thêm khoảng 38 KB gzip
              vào bundle đầu và làm vượt ngân sách 180 KB của check:budget */}
          <nav aria-label="Điều hướng chính" className="hidden lg:block">
            <ul className="flex items-center gap-0.5 rounded-full border border-line bg-black/35 p-1 text-sm font-medium backdrop-blur-xl">
              {navItems.map((item) => {
                const isActive = isNavActive(location.pathname, item.path);
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'block rounded-full border px-3.5 py-1.5 whitespace-nowrap transition-colors duration-150',
                        isActive
                          ? 'border-white/15 bg-white/10 text-fg'
                          : 'border-transparent text-fg-2 hover:bg-white/5 hover:text-fg'
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <QuickSearchTrigger onClick={() => setIsSearchOpen(true)} />

            {!isAdmin && (
              <Link
                to="/cart"
                data-cart-icon
                className="relative flex size-9 shrink-0 items-center justify-center rounded-full border border-line bg-surface-2/60 text-fg-2 hover:border-accent hover:text-accent transition-colors"
                aria-label={`Giỏ hàng, ${cartCount} sản phẩm`}
              >
                <ShoppingBag className="size-4" aria-hidden="true" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-ink shadow-sm">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Bỏ nút "Khám phá" cũ: nó trỏ tới /products, trùng mục "Sàn sinh vật cảnh" ngay trên nav */}
            {authState.token ? (
              <Link
                to={accountLink}
                aria-label={isAdmin ? `Khu vực quản trị của ${accountLabel}` : `Tài khoản của ${accountLabel}`}
                className="hidden h-9 items-center gap-1.5 rounded-full border border-line bg-surface-2/60 px-3.5 text-sm font-medium text-fg hover:border-accent transition-colors sm:flex"
              >
                {isAdmin ? (
                  <Shield className="size-4 text-accent" aria-hidden="true" />
                ) : (
                  <UserIcon className="size-4 text-accent" aria-hidden="true" />
                )}
                <span className="truncate max-w-[120px]">{accountLabel}</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="hidden h-9 items-center whitespace-nowrap rounded-full bg-accent px-4 text-sm font-semibold text-accent-ink transition-colors hover:bg-white sm:inline-flex"
              >
                Đăng nhập
              </Link>
            )}

            {/* Màn hình hẹp: thanh điều hướng chính gom vào menu */}
            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-main-menu"
              aria-label={isMenuOpen ? 'Đóng menu điều hướng' : 'Mở menu điều hướng'}
              className="flex size-9 shrink-0 items-center justify-center rounded-full border border-line bg-surface/80 text-fg hover:border-accent hover:text-accent transition-colors lg:hidden"
            >
              {isMenuOpen ? <X className="size-4" aria-hidden="true" /> : <Menu className="size-4" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <nav
            id="mobile-main-menu"
            aria-label="Điều hướng chính"
            className="border-t border-line bg-bg-raised/95 px-4 pb-4 pt-2 backdrop-blur-2xl lg:hidden"
          >
            <ul className="flex flex-col gap-1 text-sm font-medium">
              {navItems.map((item) => {
                const isActive = isNavActive(location.pathname, item.path);
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'block rounded-xl px-3 py-2.5 transition-colors',
                        isActive ? 'bg-accent/15 text-accent font-semibold' : 'text-fg-2 hover:bg-surface hover:text-fg'
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-3 flex items-center gap-2 border-t border-line pt-3">
              {authState.token ? (
                <Link
                  to={accountLink}
                  className="flex-1 truncate rounded-full border border-line bg-surface px-4 py-2 text-center text-xs font-semibold text-fg hover:border-accent"
                >
                  {isAdmin ? 'Khu vực quản trị' : `Tài khoản: ${accountLabel}`}
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="flex-1 rounded-full border border-line bg-surface px-4 py-2 text-center text-xs font-semibold text-fg hover:border-accent"
                >
                  Đăng nhập
                </Link>
              )}
              <Link
                to="/products"
                className="flex-1 rounded-full bg-accent px-4 py-2 text-center text-xs font-semibold text-accent-ink"
              >
                Khám phá cửa hàng
              </Link>
            </div>
          </nav>
        )}
      </header>

      {/* Command Palette QuickSearch toàn cục */}
      <QuickSearch isOpen={isSearchOpen} onOpen={() => setIsSearchOpen(true)} onClose={() => setIsSearchOpen(false)} />

      {/* Nội dung trang */}
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        <Outlet />
      </main>

      {/* Footer 4 cột (tài liệu 03 mục 1): Khám phá, Cửa hàng, Người bán, Dự án */}
      <footer className="border-t border-line bg-bg-deep">
        <PageContainer className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Link to="/" className="inline-flex items-center gap-2.5 text-lg font-bold tracking-tight text-accent">
              <Logo size={20} />
              <span>BioNexus</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-fg-3">
              Bách khoa sinh học 6 cấp phân loại và sàn sinh vật cảnh nhân giống có kiểm duyệt. Ảnh loài là ảnh thật, giấy phép tự do.
            </p>
          </div>
          {FOOTER_COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fg-3">{col.title}</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                {col.links
                  .filter((l) => !l.devOnly || import.meta.env.DEV)
                  .map((l) => (
                    <li key={l.to}>
                      <Link to={l.to} className="text-fg-2 transition-colors hover:text-accent">
                        {l.label}
                      </Link>
                    </li>
                  ))}
              </ul>
            </nav>
          ))}
        </PageContainer>
        <div className="border-t border-line">
          <PageContainer className="flex flex-col gap-2 py-6 text-sm text-fg-3 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 BioNexus · Đồ án Aptech 2026</p>
            <p>Dữ liệu loài đối chiếu GBIF · Ảnh từ Wikimedia Commons</p>
          </PageContainer>
        </div>
      </footer>
    </div>
  );
}
