import React from 'react';
import { Thermometer } from 'lucide-react';
import type { ParsedEnvironmentSpecs } from '@/lib/parseEnvironmentSpecs';
import { cn } from '@/lib/cn';

export interface ClimateBarProps {
  specs: ParsedEnvironmentSpecs;
  isWaterTemp?: boolean;
  className?: string;
}

const SCALE_MIN = 10;
const SCALE_MAX = 50;

function toPercent(val: number): number {
  const clamped = Math.max(SCALE_MIN, Math.min(SCALE_MAX, val));
  return ((clamped - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100;
}

export const ClimateBar: React.FC<ClimateBarProps> = ({
  specs,
  isWaterTemp = false,
  className = '',
}) => {
  const isWater = isWaterTemp || specs.waterTempMin !== undefined;
  const title = isWater ? 'Nhiệt độ nước' : 'Nhiệt độ không khí';

  const hasRange = specs.tempMin !== null && specs.tempMax !== null;

  if (!hasRange) {
    return (
      <div className={cn('rounded-2xl border border-line bg-surface p-4 text-xs', className)}>
        <div className="flex items-center gap-2 text-fg-3 mb-1">
          <Thermometer className="size-4 text-accent" />
          <span className="font-semibold uppercase tracking-wider text-[11px]">{title}</span>
        </div>
        <p className="text-fg-2 font-mono text-xs">{specs.raw || 'Chưa có thông số nhiệt độ cụ thể.'}</p>
      </div>
    );
  }

  const minPct = toPercent(specs.tempMin!);
  const maxPct = toPercent(specs.tempMax!);
  const mainWidth = Math.max(3, maxPct - minPct);

  const hasBask = specs.baskMin !== null && specs.baskMin !== undefined;
  const baskMinPct = hasBask ? toPercent(specs.baskMin!) : 0;
  const baskMaxPct = hasBask ? toPercent(specs.baskMax || specs.baskMin!) : 0;
  const baskWidth = Math.max(3, baskMaxPct - baskMinPct);

  return (
    <div className={cn('rounded-2xl border border-line bg-surface p-5 backdrop-blur-md flex flex-col justify-between', className)}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-line/40">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-accent/10 text-accent border border-accent/20">
            <Thermometer className="size-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-fg-2">{title}</h4>
            <p className="text-[11px] text-fg-3">Khoảng thích nghi sinh học</p>
          </div>
        </div>

        <div className="font-mono text-base font-bold text-accent">
          {specs.tempMin}°C — {specs.tempMax}°C
        </div>
      </div>

      {/* Visual Bar Container */}
      <div className="py-4">
        {/* Điểm sưởi chú thích phía trên nếu có */}
        {hasBask && (
          <div className="mb-2 flex items-center justify-between text-[11px] font-mono">
            <span className="text-amber-400 font-semibold flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#fbbf24]" />
              Điểm sưởi (Basking):
            </span>
            <span className="text-amber-300 font-bold">
              {specs.baskMin === specs.baskMax ? `${specs.baskMin}°C` : `${specs.baskMin}°C — ${specs.baskMax}°C`}
            </span>
          </div>
        )}

        {/* Thanh thang đo 10°C - 50°C */}
        <div className="relative h-4 w-full rounded-full bg-surface-2 overflow-hidden border border-line">
          {/* Vạch chia thang đo 10, 20, 30, 40, 50 */}
          {[10, 20, 30, 40, 50].map((deg) => (
            <div
              key={deg}
              className="absolute top-0 bottom-0 w-px bg-white/5"
              style={{ left: `${toPercent(deg)}%` }}
            />
          ))}

          {/* Dải nhiệt độ chính */}
          <div
            className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 shadow-[0_0_12px_rgba(110,231,183,0.5)] transition-all duration-500"
            style={{ left: `${minPct}%`, width: `${mainWidth}%` }}
          />

          {/* Dải điểm sưởi */}
          {hasBask && (
            <div
              className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 shadow-[0_0_12px_rgba(251,191,36,0.6)] z-10 transition-all duration-500"
              style={{ left: `${baskMinPct}%`, width: `${baskWidth}%` }}
            />
          )}
        </div>

        {/* Thước đo số */}
        <div className="mt-2 flex justify-between text-[10px] font-mono text-fg-3">
          <span>10°C</span>
          <span>20°C</span>
          <span>30°C</span>
          <span>40°C</span>
          <span>50°C</span>
        </div>
      </div>
    </div>
  );
};
