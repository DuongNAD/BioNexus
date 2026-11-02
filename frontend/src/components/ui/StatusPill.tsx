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
    styles: 'border-warm/30 bg-warm/15 text-warm',
  },
  APPROVED: {
    label: 'Đã duyệt',
    styles: 'border-success/30 bg-success/15 text-success',
  },
  ACTIVE: {
    label: 'Đang hoạt động',
    styles: 'border-success/30 bg-success/15 text-success',
  },
  COMPLETED: {
    label: 'Đã hoàn tất',
    styles: 'border-success/30 bg-success/15 text-success',
  },
  REJECTED: {
    label: 'Bị từ chối',
    styles: 'border-danger/30 bg-danger/15 text-danger',
  },
  BANNED: {
    label: 'Bị khóa',
    styles: 'border-danger/30 bg-danger/15 text-danger',
  },
  CANCELLED: {
    label: 'Đã hủy',
    styles: 'border-danger/30 bg-danger/15 text-danger',
  },
  SOLD_OUT: {
    label: 'Hết hàng',
    styles: 'border-line bg-white/[0.08] text-fg-3',
  },
  INACTIVE: {
    label: 'Chưa kích hoạt',
    styles: 'border-line bg-white/[0.08] text-fg-3',
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
      styles: 'border-line bg-surface text-fg-2',
    };

    const sizeStyles = {
      sm: 'px-2 py-0.5 text-[10px]',
      md: 'px-2.5 py-1 text-xs',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full border font-medium select-none',
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
