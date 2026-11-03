import * as React from 'react';
import { cn } from '@/lib/cn';

export type BusinessStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'REJECTED'
  | 'BANNED'
  | 'CANCELLED'
  | 'SOLD_OUT'
  | 'INACTIVE';

export interface StatusPillProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: BusinessStatus | string;
  label?: string;
  size?: 'sm' | 'md';
}

const STATUS_MAP: Record<
  string,
  { label: string; styles: string }
> = {
  PENDING: {
    label: 'Đang chờ duyệt',
    styles: 'bg-warm/12 text-warm',
  },
  APPROVED: {
    label: 'Đã duyệt',
    styles: 'bg-success/12 text-success',
  },
  ACTIVE: {
    label: 'Đang hoạt động',
    styles: 'bg-success/12 text-success',
  },
  COMPLETED: {
    label: 'Đã hoàn tất',
    styles: 'bg-success/12 text-success',
  },
  REJECTED: {
    label: 'Bị từ chối',
    styles: 'bg-danger/12 text-danger',
  },
  BANNED: {
    label: 'Bị khóa',
    styles: 'bg-danger/12 text-danger',
  },
  CANCELLED: {
    label: 'Đã hủy',
    styles: 'bg-danger/12 text-danger',
  },
  SOLD_OUT: {
    label: 'Hết hàng',
    styles: 'bg-white/[0.08] text-fg-2',
  },
  INACTIVE: {
    label: 'Chưa kích hoạt',
    styles: 'bg-white/[0.08] text-fg-2',
  },
};

export const StatusPill = React.forwardRef<HTMLSpanElement, StatusPillProps>(
  (
    {
      className,
      status,
      label,
      size = 'md',
      ...props
    },
    ref
  ) => {
    const uppercaseStatus = (status || '').toUpperCase();
    const config = STATUS_MAP[uppercaseStatus] || {
      label: status || 'Không rõ',
      styles: 'bg-surface-2 text-fg-2',
    };

    const sizeStyles = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-xs',
    };

    return (
      <span
        ref={ref}
        className={cn(
          // Tài liệu 02: nền là chính màu trạng thái ở độ đậm 12%, chữ cùng màu, không viền
          'inline-flex shrink-0 items-center whitespace-nowrap rounded-full font-medium select-none',
          config.styles,
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {label || config.label}
      </span>
    );
  }
);

StatusPill.displayName = 'StatusPill';
