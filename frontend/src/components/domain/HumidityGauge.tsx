import React from 'react';
import { Droplets } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface HumidityGaugeProps {
  humidMin?: number | null;
  humidMax?: number | null;
  className?: string;
}

export const HumidityGauge: React.FC<HumidityGaugeProps> = ({
  humidMin,
  humidMax,
  className = '',
}) => {
  const hasData = humidMin !== null && humidMin !== undefined && humidMax !== null && humidMax !== undefined;

  const min = hasData ? humidMin : 0;
  const max = hasData ? humidMax : 0;
  const avg = hasData ? Math.round((min + max) / 2) : 0;

  // Cấu hình vòng tròn SVG
  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressPercent = hasData ? Math.min(100, Math.max(0, avg)) : 0;
  const strokeDashoffset = circumference - (circumference * progressPercent) / 100;

  return (
    <div
      className={cn(
        'rounded-2xl border border-line bg-surface p-5 backdrop-blur-md flex flex-col items-center justify-between text-center',
        className
      )}
    >
      <div className="w-full flex items-center justify-between pb-2 border-b border-line/40">
        <div className="flex items-center gap-1.5 text-xs text-fg-3">
          <Droplets className="size-3.5 text-ocean" />
          <span className="font-semibold uppercase tracking-wider text-[11px] text-fg-2">Độ ẩm</span>
        </div>
        <span className="text-[11px] font-mono text-ocean">Tối ưu</span>
      </div>

      {/* SVG Ring Gauge */}
      <div className="relative my-3 flex items-center justify-center">
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id="humidityGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#6ee7b7" />
            </linearGradient>
          </defs>

          {/* Vòng nền */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-surface-2"
            fill="transparent"
          />

          {/* Vòng tiến độ phát quang */}
          {hasData && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="url(#humidityGrad)"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          )}
        </svg>

        {/* Nội dung trung tâm */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {hasData ? (
            <>
              <span className="font-mono text-xl font-bold text-fg tracking-tight">
                {min === max ? `${min}%` : `${min}–${max}%`}
              </span>
              <span className="text-[10px] font-mono text-fg-3">trung bình {avg}%</span>
            </>
          ) : (
            <span className="text-xs text-fg-3">Không có số liệu</span>
          )}
        </div>
      </div>

      <p className="text-xs text-fg-3">Môi trường sống cân bằng</p>
    </div>
  );
};
