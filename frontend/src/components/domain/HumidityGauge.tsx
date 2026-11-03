import React from 'react';
import { cn } from '@/lib/cn';

export interface HumidityGaugeProps {
  humidMin?: number | null;
  humidMax?: number | null;
  /** Loài thủy sinh: chuỗi seed ghi "Độ ẩm: không áp dụng" */
  notApplicable?: boolean;
  className?: string;
}

/** Thanh độ ẩm 0–100%, cùng kiểu với ClimateBar để hai số liệu đọc liền mạch */
export const HumidityGauge: React.FC<HumidityGaugeProps> = ({ humidMin, humidMax, notApplicable = false, className = '' }) => {
  const hasData = humidMin != null && humidMax != null;
  const min = hasData ? Math.max(0, Math.min(100, humidMin)) : 0;
  const max = hasData ? Math.max(min, Math.min(100, humidMax)) : 0;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm text-fg-3">Độ ẩm</p>
        <p className="font-mono text-lg font-medium text-fg tabular-nums">
          {hasData ? (min === max ? `${min}%` : `${min}–${max}%`) : notApplicable ? 'Không áp dụng' : 'Chưa có'}
        </p>
      </div>
      <div className="relative h-2.5 w-full rounded-full bg-surface-2">
        {hasData && (
          <div
            className="absolute inset-y-0 rounded-full bg-gradient-to-r from-ocean to-accent-2"
            style={{ left: `${min}%`, width: `${Math.max(3, max - min)}%` }}
          />
        )}
      </div>
      <div className="flex justify-between font-mono text-xs text-fg-3" aria-hidden="true">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
      {notApplicable && !hasData && <p className="text-sm text-fg-3">Loài sống hoàn toàn dưới nước.</p>}
    </div>
  );
};
