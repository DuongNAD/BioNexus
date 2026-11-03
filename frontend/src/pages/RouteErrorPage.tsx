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
    <div
      role="alert"
      className="flex min-h-[70vh] flex-col items-center justify-center bg-bg px-6 py-16 text-center text-fg"
    >
      <div className="mb-6 flex size-16 items-center justify-center rounded-2xl border border-danger/40 bg-danger/10 text-danger">
        <AlertTriangle className="size-8" aria-hidden="true" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight md:text-4xl">
        {isNotFound ? 'Không tìm thấy trang' : 'Có lỗi xảy ra'}
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-fg-2 md:text-base">
        {isChunkLoadError(error)
          ? 'Phiên bản mới của BioNexus vừa được cập nhật. Hãy tải lại trang để tiếp tục.'
          : 'Trang này gặp sự cố khi hiển thị. Bạn có thể tải lại trang hoặc quay về trang chủ.'}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink hover:opacity-90"
        >
          <RotateCw className="size-4" aria-hidden="true" />
          <span>Tải lại</span>
        </button>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-fg hover:border-line-strong"
        >
          <Home className="size-4 text-accent" aria-hidden="true" />
          <span>Về trang chủ</span>
        </Link>
      </div>
      {import.meta.env.DEV && (
        <pre className="mt-8 max-w-2xl overflow-x-auto whitespace-pre-wrap rounded-xl border border-line bg-surface p-4 text-left font-mono text-xs text-fg-3">
          {detail}
        </pre>
      )}
    </div>
  );
}
