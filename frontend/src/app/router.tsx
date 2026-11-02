import React from 'react';
import { createHashRouter, type RouteObject } from 'react-router';
import { APP_ROUTES, type RouteMeta } from './routes';
import { RootLayout } from '@/components/layout/RootLayout';
const AuthLayout = React.lazy(() => import('@/components/layout/AuthLayout').then((m) => ({ default: m.AuthLayout })));
const AccountLayout = React.lazy(() => import('@/components/layout/AccountLayout').then((m) => ({ default: m.AccountLayout })));
const AdminLayout = React.lazy(() => import('@/components/layout/AdminLayout').then((m) => ({ default: m.AdminLayout })));
const Home = React.lazy(() => import('@/pages/Home'));
const Credits = React.lazy(() => import('@/pages/Credits'));
const UIPreview = React.lazy(() => import('@/pages/dev/UIPreview'));
const TaxonomyPage = React.lazy(() => import('@/pages/taxonomy/TaxonomyPage'));
const SpeciesListPage = React.lazy(() => import('@/pages/species/SpeciesListPage'));
const SpeciesDetailPage = React.lazy(() => import('@/pages/species/SpeciesDetailPage'));

// Milestone 5 Real Lazy Pages
const ProductsPage = React.lazy(() => import('@/pages/products/ProductsPage'));
const ProductDetailPage = React.lazy(() => import('@/pages/products/ProductDetailPage'));
const CartPage = React.lazy(() => import('@/pages/cart/CartPage'));
const CheckoutPage = React.lazy(() => import('@/pages/checkout/CheckoutPage'));
const OrdersPage = React.lazy(() => import('@/pages/orders/OrdersPage'));
const OrderDetailPage = React.lazy(() => import('@/pages/orders/OrderDetailPage'));
const LoginPage = React.lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('@/pages/auth/RegisterPage'));
const AdminLoginPage = React.lazy(() => import('@/pages/auth/AdminLoginPage'));
const AccountPage = React.lazy(() => import('@/pages/account/AccountPage'));
const SellerApplyPage = React.lazy(() => import('@/pages/seller/SellerApplyPage'));
const SellerDashboardPage = React.lazy(() => import('@/pages/seller/SellerDashboardPage'));
const SellerNewProductPage = React.lazy(() => import('@/pages/seller/SellerNewProductPage'));

// Milestone 6 Admin & Fallback Lazy Pages
const AdminDashboardPage = React.lazy(() => import('@/pages/admin/AdminDashboardPage'));
const AdminSellersPage = React.lazy(() => import('@/pages/admin/AdminSellersPage'));
const AdminProductsPage = React.lazy(() => import('@/pages/admin/AdminProductsPage'));
const AdminSpeciesPage = React.lazy(() => import('@/pages/admin/AdminSpeciesPage'));
const JourneyPage = React.lazy(() => import('@/pages/journey/JourneyPage'));
const NotFoundPage = React.lazy(() => import('@/pages/NotFoundPage'));

function PageSuspenseFallback({ message }: { message: string }): React.JSX.Element {
  return (
    <div
      className="flex min-h-[75vh] w-full flex-col items-center justify-center p-8 text-accent"
      role="status"
      aria-live="polite"
    >
      <div className="size-10 animate-spin rounded-full border-2 border-accent border-t-transparent shadow-[0_0_15px_rgba(110,231,183,0.3)]" />
      <p className="mt-4 text-xs font-mono tracking-widest text-fg-3 uppercase">
        {message}
      </p>
    </div>
  );
}

// Component trang placeholder trực quan cho các route chưa triển khai nghiệp vụ
function RoutePlaceholder({ route }: { route: RouteMeta }): React.JSX.Element {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto">
      <span className="mb-3 rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent">
        {route.name}
      </span>
      <h1 className="mb-4 text-3xl font-bold tracking-tight text-fg md:text-5xl font-sans">
        {route.title}
      </h1>
      <p className="max-w-xl text-base text-fg-2 md:text-lg">
        {route.description}
      </p>
      <div className="mt-8 rounded-xl border border-line bg-surface-2 p-4 text-xs font-mono text-fg-3 shadow-inner">
        Route: <span className="text-accent">{route.path}</span> | Khung: <span className="text-accent">{route.layout}</span> | 3D: {route.has3D ? 'Có' : 'Không'}
      </div>
    </div>
  );
}

function getRouteElement(route: RouteMeta): React.JSX.Element {
  switch (route.path) {
    case '/':
      return (
        <React.Suspense fallback={<PageSuspenseFallback message="Đang mở cánh cổng BioNexus..." />}>
          <Home />
        </React.Suspense>
      );

    case '/tham-hiem':
      return (
        <React.Suspense fallback={<PageSuspenseFallback message="Đang mở Hộ chiếu loài và bản đồ thực địa..." />}>
          <JourneyPage />
        </React.Suspense>
      );

    case '/taxonomy':
    case '/taxonomy/:id':
      return (
        <React.Suspense fallback={<PageSuspenseFallback message="Đang khởi tạo Cây phân loại 6 cấp..." />}>
          <TaxonomyPage />
        </React.Suspense>
      );

    case '/species':
      return (
        <React.Suspense fallback={<PageSuspenseFallback message="Đang nạp Bách khoa toàn thư sinh vật..." />}>
          <SpeciesListPage />
        </React.Suspense>
      );

    case '/species/:id':
      return (
        <React.Suspense fallback={<PageSuspenseFallback message="Đang xuất bản Hồ sơ tạp chí khoa học..." />}>
          <SpeciesDetailPage />
        </React.Suspense>
      );

    case '/products':
      return (
        <React.Suspense fallback={<PageSuspenseFallback message="Đang tải Sàn sinh vật cảnh..." />}>
          <ProductsPage />
        </React.Suspense>
      );

    case '/products/:id':
      return (
        <React.Suspense fallback={<PageSuspenseFallback message="Đang tải thông tin cá thể..." />}>
          <ProductDetailPage />
        </React.Suspense>
      );

    case '/cart':
      return (
        <React.Suspense fallback={<PageSuspenseFallback message="Đang kiểm tra giỏ hàng..." />}>
          <CartPage />
        </React.Suspense>
      );

    case '/checkout':
      return (
        <React.Suspense fallback={<PageSuspenseFallback message="Đang khởi tạo thanh toán..." />}>
          <CheckoutPage />
        </React.Suspense>
      );

    case '/orders':
      return (
        <React.Suspense fallback={<PageSuspenseFallback message="Đang tải lịch sử đơn hàng..." />}>
          <OrdersPage />
        </React.Suspense>
      );

    case '/orders/:id':
      return (
        <React.Suspense fallback={<PageSuspenseFallback message="Đang tải chi tiết đơn hàng..." />}>
          <OrderDetailPage />
        </React.Suspense>
      );

    case '/login':
      return (
        <React.Suspense fallback={<PageSuspenseFallback message="Đang tải cổng đăng nhập..." />}>
          <LoginPage />
        </React.Suspense>
      );

    case '/register':
      return (
        <React.Suspense fallback={<PageSuspenseFallback message="Đang tải form đăng ký..." />}>
          <RegisterPage />
        </React.Suspense>
      );

    case '/admin/login':
      return (
        <React.Suspense fallback={<PageSuspenseFallback message="Đang tải cổng quản trị..." />}>
          <AdminLoginPage />
        </React.Suspense>
      );

    case '/account':
      return (
        <React.Suspense fallback={<PageSuspenseFallback message="Đang tải hồ sơ thành viên..." />}>
          <AccountPage />
        </React.Suspense>
      );

    case '/seller/apply':
      return (
        <React.Suspense fallback={<PageSuspenseFallback message="Đang tải đơn đăng ký shop..." />}>
          <SellerApplyPage />
        </React.Suspense>
      );

    case '/seller':
      return (
        <React.Suspense fallback={<PageSuspenseFallback message="Đang tải Bảng điều khiển Shop..." />}>
          <SellerDashboardPage />
        </React.Suspense>
      );

    case '/seller/products/new':
      return (
        <React.Suspense fallback={<PageSuspenseFallback message="Đang nạp form đăng bán mới..." />}>
          <SellerNewProductPage />
        </React.Suspense>
      );

    case '/credits':
      return (
        <React.Suspense fallback={<PageSuspenseFallback message="Đang tải thông tin bản quyền ảnh..." />}>
          <Credits />
        </React.Suspense>
      );

    case '/dev/ui':
      return (
        <React.Suspense fallback={<PageSuspenseFallback message="Đang khởi tạo Thư viện Giao diện Dev..." />}>
          <UIPreview />
        </React.Suspense>
      );

    case '/admin':
      return (
        <React.Suspense fallback={<PageSuspenseFallback message="Đang nạp Trung tâm Điều hành Quản trị..." />}>
          <AdminDashboardPage />
        </React.Suspense>
      );

    case '/admin/sellers':
      return (
        <React.Suspense fallback={<PageSuspenseFallback message="Đang nạp Hàng đợi Kiểm duyệt Shop..." />}>
          <AdminSellersPage />
        </React.Suspense>
      );

    case '/admin/products':
      return (
        <React.Suspense fallback={<PageSuspenseFallback message="Đang nạp Khung Đối soát Song song..." />}>
          <AdminProductsPage />
        </React.Suspense>
      );

    case '/admin/species':
      return (
        <React.Suspense fallback={<PageSuspenseFallback message="Đang nạp Danh mục Bách khoa Loài..." />}>
          <AdminSpeciesPage />
        </React.Suspense>
      );

    case '*':
      return (
        <React.Suspense fallback={<PageSuspenseFallback message="Đang định vị..." />}>
          <NotFoundPage />
        </React.Suspense>
      );

    default:
      return <RoutePlaceholder route={route} />;
  }
}

// 1. Root Layout Routes
const rootMeta = APP_ROUTES.filter((r) => r.layout === 'root');
const rootChildren: RouteObject[] = rootMeta.map((r) => {
  if (r.path === '/') {
    return {
      index: true,
      element: getRouteElement(r),
    };
  }
  const relativePath = r.path.startsWith('/') ? r.path.slice(1) : r.path;
  return {
    path: relativePath,
    element: getRouteElement(r),
  };
});

// 2. Auth Layout Routes
const authMeta = APP_ROUTES.filter((r) => r.layout === 'auth');
const authChildren: RouteObject[] = authMeta.map((r) => ({
  path: r.path.startsWith('/') ? r.path.slice(1) : r.path,
  element: getRouteElement(r),
}));

// 3. Account / Seller Layout Routes
const accountMeta = APP_ROUTES.filter((r) => r.layout === 'account' || r.layout === 'seller');
const accountChildren: RouteObject[] = accountMeta.map((r) => ({
  path: r.path.startsWith('/') ? r.path.slice(1) : r.path,
  element: getRouteElement(r),
}));

// 4. Admin Layout Routes
const adminMeta = APP_ROUTES.filter((r) => r.layout === 'admin');
const adminChildren: RouteObject[] = adminMeta.map((r) => ({
  path: r.path.startsWith('/') ? r.path.slice(1) : r.path,
  element: getRouteElement(r),
}));

// 5. Standalone Journey Route (/tham-hiem)
const journeyMeta = APP_ROUTES.filter((r) => r.layout === 'journey');
const journeyRoutes: RouteObject[] = journeyMeta.map((r) => ({
  path: r.path,
  element: getRouteElement(r),
}));

export const router = createHashRouter([
  ...journeyRoutes,
  {
    path: '/',
    element: <RootLayout />,
    children: rootChildren,
  },
  {
    element: <AuthLayout />,
    children: authChildren,
  },
  {
    element: <AccountLayout />,
    children: accountChildren,
  },
  {
    element: <AdminLayout />,
    children: adminChildren,
  },
]);
