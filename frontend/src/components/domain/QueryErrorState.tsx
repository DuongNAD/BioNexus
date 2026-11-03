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
      className={`mx-auto flex max-w-xl flex-col items-center justify-center rounded-[20px] border border-dashed border-danger/40 px-6 py-12 text-center md:py-16 ${className}`}
    >
      <AlertTriangle className="mb-4 size-8 text-danger" aria-hidden="true" />
      <h2 className="text-xl font-semibold tracking-[-0.02em] text-fg">{title}</h2>
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
