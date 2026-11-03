import React from 'react';
import { Link } from 'react-router';
import { cn } from '@/lib/cn';

export interface MediaCardProps {
  to: string;
  image: string;
  /** Mô tả ảnh cho trình đọc màn hình; ảnh chỉ trang trí thì để chuỗi rỗng */
  imageAlt: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Chip góc trên trái ảnh (ví dụ IUCN, cấp phân loại) */
  badge?: React.ReactNode;
  /** Dòng cuối trên ảnh: số liệu, giá */
  footer?: React.ReactNode;
  aspect?: '4/5' | '4/3' | '1/1' | '16/10';
  focus?: string;
  className?: string;
}

const ASPECT = {
  '4/5': 'aspect-[4/5]',
  '4/3': 'aspect-[4/3]',
  '1/1': 'aspect-square',
  '16/10': 'aspect-[16/10]',
} as const;

/**
 * Thẻ ảnh làm chủ (mẫu R: "ảnh thật là nhân vật chính").
 * Cả thẻ là một link duy nhất nên bàn phím chỉ có một điểm dừng; chữ đặt trên lớp phủ tối để đọc được.
 */
export function MediaCard({
  to,
  image,
  imageAlt,
  title,
  subtitle,
  badge,
  footer,
  aspect = '4/5',
  focus = 'center',
  className,
}: MediaCardProps): React.JSX.Element {
  return (
    <Link
      to={to}
      className={cn(
        'group relative block overflow-hidden rounded-[20px] border border-line bg-bg-raised transition-colors duration-300 hover:border-line-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        ASPECT[aspect],
        className
      )}
    >
      <img
        src={image}
        alt={imageAlt}
        loading="lazy"
        className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        style={{ objectPosition: focus }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" aria-hidden="true" />
      {badge && <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">{badge}</div>}
      <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
        <div className="text-lg leading-tight font-semibold tracking-[-0.02em] text-white md:text-xl">{title}</div>
        {subtitle && <div className="mt-1 text-sm text-white/75">{subtitle}</div>}
        {footer && <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/80">{footer}</div>}
      </div>
    </Link>
  );
}
