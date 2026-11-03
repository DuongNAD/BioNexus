import React from 'react';
import type { ParsedEnvironmentSpecs } from '@/lib/parseEnvironmentSpecs';
import { cn } from '@/lib/cn';

export interface ClimateBarProps {
  specs: ParsedEnvironmentSpecs;
  isWaterTemp?: boolean;
  className?: string;
}

const SCALE_MIN = 10;
const SCALE_MAX = 50;
const TICKS = [10, 20, 30, 40, 50];

function toPercent(val: number): number {
  const clamped = Math.max(SCALE_MIN, Math.min(SCALE_MAX, val));
  return ((clamped - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100;
}

/**
 * Thanh khoảng nhiệt độ 10–50°C (mẫu R "Mỗi loài cần một khoảng nhiệt riêng").
 * Không tự vẽ khung: nơi dùng đặt nó trong một Panel, tránh thẻ lồng thẻ.
 */
export const ClimateBar: React.FC<ClimateBarProps> = ({ specs, isWaterTemp = false, className = '' }) => {
  const isWater = isWaterTemp || specs.waterTempMin !== undefined;
  const title = isWater ? 'Nhiệt độ nước' : 'Nhiệt độ không khí';
  const hasRange = specs.tempMin !== null && specs.tempMax !== null;

  if (!hasRange) {
    return (
      <div className={cn('space-y-1', className)}>
        <p className="text-sm text-fg-3">{title}</p>
        <p className="text-sm text-fg-2">{specs.raw || 'Chưa có thông số nhiệt độ cụ thể.'}</p>
      </div>
    );
  }

  const minPct = toPercent(specs.tempMin!);
  const mainWidth = Math.max(3, toPercent(specs.tempMax!) - minPct);

  const hasBask = specs.baskMin !== null && specs.baskMin !== undefined;
  const baskMinPct = hasBask ? toPercent(specs.baskMin!) : 0;
  const baskWidth = hasBask ? Math.max(3, toPercent(specs.baskMax || specs.baskMin!) - baskMinPct) : 0;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm text-fg-3">{title}</p>
        <p className="font-mono text-lg font-medium text-fg tabular-nums">
          {specs.tempMin}°C — {specs.tempMax}°C
        </p>
      </div>

      <div className="relative h-2.5 w-full rounded-full bg-surface-2">
        <div
          className="absolute inset-y-0 rounded-full bg-gradient-to-r from-accent-2 to-accent"
          style={{ left: `${minPct}%`, width: `${mainWidth}%` }}
        />
        {hasBask && (
          <div
            className="absolute inset-y-0 rounded-full bg-warm"
            style={{ left: `${baskMinPct}%`, width: `${baskWidth}%` }}
          />
        )}
      </div>

      <div className="flex justify-between font-mono text-xs text-fg-3" aria-hidden="true">
        {TICKS.map((deg) => (
          <span key={deg}>{deg}°</span>
        ))}
      </div>

      {hasBask && (
        <div className="flex items-baseline justify-between gap-3 text-sm">
          <span className="flex items-center gap-2 text-fg-2">
            <span className="size-2 rounded-full bg-warm" aria-hidden="true" />
            Điểm sưởi
          </span>
          <span className="font-mono text-warm tabular-nums">
            {specs.baskMin === specs.baskMax ? `${specs.baskMin}°C` : `${specs.baskMin}°C — ${specs.baskMax}°C`}
          </span>
        </div>
      )}
    </div>
  );
};
