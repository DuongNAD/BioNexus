import React from 'react';
import { cn } from '@/lib/cn';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Nhãn cho trình đọc màn hình, ví dụ "Chế độ xem" */
  label: string;
  className?: string;
}

/** Công tắc nhiều lựa chọn dạng viên thuốc (tài liệu 03: SegmentedControl đổi chế độ xem) */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: SegmentedControlProps<T>): React.JSX.Element {
  return (
    <div role="group" aria-label={label} className={cn('inline-flex rounded-full border border-line bg-surface p-1', className)}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            disabled={opt.disabled}
            onClick={() => onChange(opt.value)}
            className={cn(
              'inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-40',
              active ? 'bg-accent text-accent-ink' : 'text-fg-2 hover:text-fg'
            )}
          >
            {opt.icon}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
