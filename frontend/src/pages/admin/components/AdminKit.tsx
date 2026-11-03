import React from 'react';
import { Search } from 'lucide-react';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Kbd } from '@/components/ui/Kbd';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { cn } from '@/lib/cn';

/*
 * Mảnh giao diện dùng chung cho các trang quản trị: bộ lọc hàng đợi, ô tìm,
 * danh sách định nghĩa, thanh khoảng giá trị và hộp phím tắt.
 */

/** Phím tắt không được chạy khi người dùng đang gõ chữ */
export function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable);
}

export function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

export function formatDateVi(value?: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString('vi-VN');
}

/** Bộ lọc trạng thái kèm số lượng; cuộn ngang trên màn hẹp thay vì làm tràn trang */
export function QueueFilter<T extends string>({
  tabs,
  value,
  counts,
  onChange,
}: {
  tabs: { id: T; label: string }[];
  value: T;
  counts: Record<T, number>;
  onChange: (value: T) => void;
}): React.JSX.Element {
  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <SegmentedControl
        // w-max: giữ nhãn trên một dòng, phần thừa cuộn ngang thay vì xuống dòng
        className="w-max"
        label="Lọc theo trạng thái"
        value={value}
        onChange={onChange}
        options={tabs.map((t) => ({ value: t.id, label: `${t.label} · ${counts[t.id]}` }))}
      />
    </div>
  );
}

export function QueueSearch({
  value,
  onChange,
  label,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
  className?: string;
}): React.JSX.Element {
  return (
    <div className={cn('relative w-full sm:w-72', className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-fg-3" aria-hidden="true" />
      <input
        type="search"
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-full border border-line bg-surface pr-4 pl-10 text-sm text-fg placeholder:text-fg-3 focus:border-accent focus:outline-none"
      />
    </div>
  );
}

/** Danh sách định nghĩa hai cột: nhãn trên, giá trị dưới */
export function DetailList({ children, className }: { children: React.ReactNode; className?: string }): React.JSX.Element {
  return <dl className={cn('grid gap-x-6 gap-y-4 sm:grid-cols-2', className)}>{children}</dl>;
}

export function DetailItem({
  label,
  children,
  wide = false,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}): React.JSX.Element {
  return (
    <div className={cn('min-w-0', wide && 'sm:col-span-2')}>
      <dt className="text-sm text-fg-3">{label}</dt>
      <dd className="mt-1 text-[15px] break-words text-fg">{children}</dd>
    </div>
  );
}

/** Thanh khoảng giá trị (nhiệt độ, độ ẩm) gọn, không bọc thêm hộp viền */
export function RangeLine({
  label,
  min,
  max,
  unit,
  scaleMin,
  scaleMax,
  color = 'var(--accent)',
}: {
  label: string;
  min: number;
  max: number;
  unit: string;
  scaleMin: number;
  scaleMax: number;
  color?: string;
}): React.JSX.Element {
  const pct = (v: number) => ((Math.max(scaleMin, Math.min(scaleMax, v)) - scaleMin) / (scaleMax - scaleMin)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="text-fg-3">{label}</span>
        <span className="font-mono text-fg">
          {min}–{max} {unit}
        </span>
      </div>
      <div className="relative mt-2 h-1.5 rounded-full bg-surface-2" aria-hidden="true">
        <span
          className="absolute inset-y-0 rounded-full"
          style={{ left: `${pct(min)}%`, width: `${Math.max(2, pct(max) - pct(min))}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export interface ShortcutItem {
  label: string;
  keys: string[];
}

/** Dòng gợi ý phím tắt dưới danh sách (ẩn trên màn hình cảm ứng nhỏ) */
export function ShortcutHint({ items }: { items: ShortcutItem[] }): React.JSX.Element {
  return (
    <p className="hidden flex-wrap items-center gap-x-4 gap-y-2 px-1 pt-4 text-sm text-fg-3 md:flex">
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1.5">
          {item.keys.map((k) => (
            <Kbd key={k}>{k}</Kbd>
          ))}
          <span>{item.label}</span>
        </span>
      ))}
    </p>
  );
}

export function ShortcutHelpDialog({
  open,
  onOpenChange,
  items,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: ShortcutItem[];
}): React.JSX.Element {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Phím tắt kiểm duyệt</DialogTitle>
          <DialogDescription>Phím tắt không hoạt động khi bạn đang gõ trong ô nhập liệu.</DialogDescription>
        </DialogHeader>
        <ul className="mt-5 divide-y divide-line">
          {items.map((item) => (
            <li key={item.label} className="flex items-center justify-between gap-4 py-3 text-sm">
              <span className="text-fg">{item.label}</span>
              <span className="flex items-center gap-1">
                {item.keys.map((k) => (
                  <Kbd key={k}>{k}</Kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
        <DialogFooter>
          <Button pill onClick={() => onOpenChange(false)}>
            Đã hiểu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Ô nhập chuẩn trong form quản trị */
export const fieldClass = (hasError?: boolean): string =>
  cn(
    'h-11 w-full rounded-[10px] border bg-surface-2 px-3.5 text-sm text-fg placeholder:text-fg-3 focus:border-accent focus:outline-none',
    hasError ? 'border-danger' : 'border-line'
  );
