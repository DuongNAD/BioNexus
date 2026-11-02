import React, { Suspense } from 'react';
import { RouterProvider } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { router } from './app/router';
import { DevPanel } from './components/dev/DevPanel';
import { QualityProvider } from './components/3d/QualityProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App(): React.JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
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
        {import.meta.env.DEV && <DevPanel />}
      </QualityProvider>
    </QueryClientProvider>
  );
}
