import React from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface QueryErrorStateProps {
  title?: string;
  error?: unknown;
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
}

/** Trạng thái lỗi chung có nút "Thử lại" (tài liệu 03: mọi trang phải có trạng thái lỗi riêng, không giả làm rỗng) */
export function QueryErrorState({
  title = 'Không tải được dữ liệu',
  error,
  onRetry,
  isRetrying = false,
  className = '',
}: QueryErrorStateProps): React.JSX.Element {
  const message =
    error instanceof Error && error.message
      ? error.message
      : 'Máy chủ BioNexus chưa phản hồi. Vui lòng kiểm tra kết nối và thử lại.';

  return (
    <div
      role="alert"
      className={`mx-auto flex max-w-lg flex-col items-center justify-center rounded-2xl border border-danger/30 bg-danger/5 p-8 text-center md:p-12 ${className}`}
    >
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl border border-danger/40 bg-danger/10 text-danger">
        <AlertTriangle className="size-7" aria-hidden="true" />
      </div>
      <h2 className="text-xl font-bold tracking-tight text-fg">{title}</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-fg-2">{message}</p>
      {onRetry && (
        <Button variant="primary" pill className="mt-6 gap-2" onClick={onRetry} isLoading={isRetrying}>
          <RotateCw className="size-4" aria-hidden="true" />
          <span>Thử lại</span>
        </Button>
      )}
    </div>
  );
}
