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

export interface IucnBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  code: ConservationStatus | string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const IucnBadge = React.forwardRef<HTMLSpanElement, IucnBadgeProps>(
  (
    {
      className,
      code,
      size = 'md',
      showLabel = true,
      ...props
    },
    ref
  ) => {
    const uppercaseCode = (code || '').toUpperCase() as ConservationStatus;
    const spec = IUCN_SPECS[uppercaseCode] || {
      color: '#94a3b8',
      label: 'Chưa xác định',
      desc: 'Not Evaluated',
    };

    const sizeStyles = {
      sm: 'px-2 py-0.5 text-[10px] gap-1.5',
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
          'inline-flex items-center rounded-full border border-line bg-black/40 backdrop-blur-md font-medium text-fg select-none',
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
        <span className="font-bold tracking-wider">{uppercaseCode || '--'}</span>
        {showLabel && (
          <span className="text-fg-2 border-l border-line/60 pl-1.5">
            {spec.label}
          </span>
        )}
      </span>
    );
  }
);

IucnBadge.displayName = 'IucnBadge';
