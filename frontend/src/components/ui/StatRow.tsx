import React from 'react';
import { cn } from '@/lib/cn';

export interface StatItem {
  label: string;
  value: React.ReactNode;
  hint?: string;
}

/**
 * Dãy số liệu ngang, ngăn bằng đường kẻ mảnh thay vì mỗi số một hộp có viền.
 * Số dùng font mono (tài liệu 02: mono chỉ cho số và mã), nhãn dùng Be Vietnam Pro.
 */
export function StatRow({ items, className }: { items: StatItem[]; className?: string }): React.JSX.Element {
  return (
    <dl
      className={cn(
        'grid grid-cols-2 divide-line sm:flex sm:divide-x [&>div]:py-3 sm:[&>div]:px-6 sm:[&>div:first-child]:pl-0',
        className
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="text-sm text-fg-3">{item.label}</dt>
          <dd className="mt-1 font-mono text-2xl font-medium tabular-nums text-fg md:text-[28px]">{item.value}</dd>
          {item.hint && <dd className="mt-0.5 text-xs text-fg-3">{item.hint}</dd>}
        </div>
      ))}
    </dl>
  );
}
