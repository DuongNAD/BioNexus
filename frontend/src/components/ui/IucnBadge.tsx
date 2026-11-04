import * as React from 'react';
import { cn } from '@/lib/cn';

export type ConservationStatus = 'LC' | 'NT' | 'VU' | 'EN' | 'CR' | 'EW' | 'EX';

export interface IucnSpec {
  color: string;
  label: string;
  desc: string;
}

export const IUCN_SPECS: Record<ConservationStatus, IucnSpec> = {
  LC: { color: '#60c659', label: 'Ít quan tâm', desc: 'Least Concern' },
  NT: { color: '#cce226', label: 'Sắp bị đe dọa', desc: 'Near Threatened' },
  VU: { color: '#f9e814', label: 'Sắp nguy cấp', desc: 'Vulnerable' },
  EN: { color: '#fc7f3f', label: 'Nguy cấp', desc: 'Endangered' },
  CR: { color: '#d81e05', label: 'Cực kỳ nguy cấp', desc: 'Critically Endangered' },
  EW: { color: '#542344', label: 'Tuyệt chủng tự nhiên', desc: 'Extinct in the Wild' },
  EX: { color: '#000000', label: 'Tuyệt chủng', desc: 'Extinct' },
};

// Mức NE (Not Evaluated) chỉ để hiển thị, không phải giá trị trong DB
const DOMESTIC_SPEC: IucnSpec = { color: '#94a3b8', label: 'Vật nuôi', desc: 'Not Evaluated: IUCN không đánh giá dạng vật nuôi thuần hoá' };

export interface IucnBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  code: ConservationStatus | string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  /** Đặt trên ảnh: nền đen mờ, chữ trắng ở cả chế độ sáng lẫn tối */
  onMedia?: boolean;
  /** Vật nuôi thuần hoá: IUCN không đánh giá (NE), bỏ qua code giữ chỗ */
  domestic?: boolean;
}

export const IucnBadge = React.forwardRef<HTMLSpanElement, IucnBadgeProps>(
  (
    {
      className,
      code,
      size = 'md',
      showLabel = true,
      onMedia = false,
      domestic = false,
      ...props
    },
    ref
  ) => {
    const uppercaseCode = domestic ? 'NE' : ((code || '').toUpperCase() as ConservationStatus);
    const spec = (domestic ? DOMESTIC_SPEC : IUCN_SPECS[uppercaseCode as ConservationStatus]) || {
      color: '#94a3b8',
      label: 'Chưa xác định',
      desc: 'Not Evaluated',
    };

    const sizeStyles = {
      // Chữ mang thông tin không nhỏ hơn 12px kể cả ở cỡ nhỏ
      sm: 'px-2 py-0.5 text-xs gap-1.5',
      md: 'px-2.5 py-1 text-xs gap-2',
      lg: 'px-3 py-1.5 text-sm gap-2.5',
    };

    const dotSizes = {
      sm: 'h-1.5 w-1.5',
      md: 'h-2 w-2',
      lg: 'h-2.5 w-2.5',
    };

    const isExtinct = uppercaseCode === 'EX';

    return (
      <span
        ref={ref}
        title={`${spec.desc} (${spec.label})`}
        className={cn(
          'inline-flex items-center rounded-full border font-medium select-none',
          onMedia ? 'border-white/15 bg-black/60 text-white backdrop-blur-md' : 'border-line bg-surface-2 text-fg',
          sizeStyles[size],
          className
        )}
        {...props}
      >
        <span
          className={cn(
            'inline-block rounded-full shrink-0',
            dotSizes[size],
            isExtinct && 'border border-white/60'
          )}
          style={{ backgroundColor: spec.color }}
          aria-hidden="true"
        />
        {/* Vật nuôi không có mã IUCN: hiện chữ "Vật nuôi" kể cả ở thẻ chỉ hiện mã */}
        <span className={cn('font-bold', !domestic && 'tracking-wider')}>{domestic ? spec.label : uppercaseCode || '--'}</span>
        {showLabel && !domestic && (
          <span className={cn('border-l pl-1.5', onMedia ? 'border-white/20 text-white/80' : 'border-line/60 text-fg-2')}>
            {spec.label}
          </span>
        )}
      </span>
    );
  }
);

IucnBadge.displayName = 'IucnBadge';
