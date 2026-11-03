import React from 'react';
import { Eyebrow } from '@/components/layout/Page';

/** Cột "xem trước" cạnh form: nhãn nhỏ + một thẻ, dính khi cuộn trên desktop */
export function FormPreview({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <aside className="lg:sticky lg:top-24 lg:self-start" aria-label="Xem trước">
      <Eyebrow tone="muted" className="mb-3">
        Xem trước
      </Eyebrow>
      {children}
    </aside>
  );
}

/** Thẻ ảnh tĩnh mô phỏng thẻ sản phẩm trên sàn (không phải link) */
export function PreviewMediaCard({
  image,
  title,
  subtitle,
  badge,
  footer,
}: {
  image: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  footer?: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="relative aspect-[4/5] overflow-hidden rounded-[20px] border border-line bg-bg-raised">
      <img src={image} alt="" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" aria-hidden="true" />
      {badge && <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">{badge}</div>}
      <div className="absolute inset-x-0 bottom-0 p-5">
        <div className="text-xl leading-tight font-semibold tracking-[-0.02em] text-white">{title}</div>
        {subtitle && <div className="mt-1 text-sm text-white/75">{subtitle}</div>}
        {footer && <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/85">{footer}</div>}
      </div>
    </div>
  );
}
