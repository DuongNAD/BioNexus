import React, { Suspense, useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MotionConfig } from 'motion/react';
import { Toaster } from 'sonner';
import { router } from './app/router';
import { QualityProvider } from './components/3d/QualityProvider';
import { ApiError } from './api/errors';
import { getAuthState, getIdentityKey, subscribeAuth } from './api/authStore';

// DevPanel kéo theo cả kho mock và mật khẩu seed: chỉ tải ở chế độ dev để bản build không chứa chúng
const DevPanel = import.meta.env.DEV
  ? React.lazy(() => import('./components/dev/DevPanel').then((m) => ({ default: m.DevPanel })))
  : null;

// Các nhánh bộ đệm gắn với người đang đăng nhập
const PRIVATE_QUERY_ROOTS = new Set(['auth', 'cart', 'orders', 'seller', 'admin']);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      // Lỗi 4xx là kết quả xác định (sai quyền, không tồn tại), thử lại chỉ làm chậm trạng thái lỗi
      retry: (failureCount, error) =>
        !(error instanceof ApiError && error.status >= 400 && error.status < 500) && failureCount < 1,
      refetchOnWindowFocus: false,
    },
  },
});

/** Đổi người đăng nhập (đăng nhập, đăng xuất, hết phiên) thì bỏ dữ liệu riêng của người cũ */
function useClearPrivateCacheOnIdentityChange(): void {
  useEffect(() => {
    let identity = getIdentityKey(getAuthState());
    return subscribeAuth((next) => {
      const nextIdentity = getIdentityKey(next);
      if (nextIdentity === identity) return;
      identity = nextIdentity;
      queryClient.removeQueries({
        predicate: (query) => PRIVATE_QUERY_ROOTS.has(String(query.queryKey[1])),
      });
    });
  }, []);
}

export default function App(): React.JSX.Element {
  useClearPrivateCacheOnIdentityChange();

  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        <QualityProvider>
          <Suspense
            fallback={
              <div className="flex h-screen w-screen items-center justify-center bg-bg text-accent">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                  <p className="text-sm font-medium tracking-wide">Đang khởi tạo BioNexus...</p>
                </div>
              </div>
            }
          >
            <RouterProvider router={router} />
          </Suspense>
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              className: 'bg-glass border border-line text-fg backdrop-blur-xl',
            }}
          />
          {DevPanel && (
            <Suspense fallback={null}>
              <DevPanel />
            </Suspense>
          )}
        </QualityProvider>
      </MotionConfig>
    </QueryClientProvider>
  );
}
