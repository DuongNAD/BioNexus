import React from 'react';
import { Link, isRouteErrorResponse, useRouteError } from 'react-router';
import { AlertTriangle, Home, RotateCw } from 'lucide-react';

// Chunk của trang không tải được (thường do vừa deploy bản mới): tải lại trang là đủ
function isChunkLoadError(error: unknown): boolean {
  return error instanceof Error && /dynamically imported module|Importing a module script failed|Failed to fetch/i.test(error.message);
}

/** errorElement của router: thay màn hình lỗi tiếng Anh mặc định của React Router */
export default function RouteErrorPage(): React.JSX.Element {
  const error = useRouteError();
  const isNotFound = isRouteErrorResponse(error) && error.status === 404;
  const detail = error instanceof Error ? error.message : isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : String(error);

  return (
    // Tự mang nền và lề vì có thể hiện ngoài mọi layout (lỗi ở chính layout)
    <div
      role="alert"
      className="flex min-h-[70vh] flex-col items-center justify-center bg-bg px-4 py-16 text-center text-fg sm:px-6"
    >
      <AlertTriangle className="mb-5 size-10 text-danger" aria-hidden="true" />
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fg-3">{isNotFound ? 'Lỗi 404' : 'Sự cố hiển thị'}</p>
      <h1 className="mt-3 text-[34px] leading-tight font-semibold tracking-[-0.035em] md:text-5xl">
        {isNotFound ? 'Không tìm thấy trang' : 'Có lỗi xảy ra'}
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-fg-2">
        {isChunkLoadError(error)
          ? 'Phiên bản mới của BioNexus vừa được cập nhật. Hãy tải lại trang để tiếp tục.'
          : 'Trang này gặp sự cố khi hiển thị. Bạn có thể tải lại trang hoặc quay về trang chủ.'}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-accent-ink transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <RotateCw className="size-4" aria-hidden="true" />
          <span>Tải lại</span>
        </button>
        <Link
          to="/"
          className="inline-flex h-10 items-center gap-2 rounded-full border border-line px-5 text-sm font-medium text-fg transition-colors hover:border-line-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <Home className="size-4" aria-hidden="true" />
          <span>Về trang chủ</span>
        </Link>
      </div>
      {import.meta.env.DEV && (
        <pre className="mt-10 max-w-2xl overflow-x-auto rounded-[10px] bg-surface p-4 text-left font-mono text-xs whitespace-pre-wrap text-fg-3">
          {detail}
        </pre>
      )}
    </div>
  );
}
