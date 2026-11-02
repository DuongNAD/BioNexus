import React from 'react';
import type { ConservationStatus } from '@/types/api';
import { IUCN_COLORS } from '@/lib/parseEnvironmentSpecs';
import { cn } from '@/lib/cn';

export interface IucnCount {
  code: ConservationStatus;
  labelVi: string;
  count: number;
}

export interface SpeciesHeroProps {
  counts: Record<ConservationStatus, number>;
  activeIucn: ConservationStatus | null;
  onToggleIucn: (code: ConservationStatus) => void;
  className?: string;
}

const IUCN_TICKER_ITEMS: Array<{ code: ConservationStatus; labelVi: string }> = [
  { code: 'LC', labelVi: 'Ít quan tâm' },
  { code: 'NT', labelVi: 'Sắp bị đe dọa' },
  { code: 'VU', labelVi: 'Sắp nguy cấp' },
  { code: 'EN', labelVi: 'Nguy cấp' },
  { code: 'CR', labelVi: 'Cực kỳ nguy cấp' },
];

export const SpeciesHero: React.FC<SpeciesHeroProps> = ({
  counts,
  activeIucn,
  onToggleIucn,
  className = '',
}) => {
  return (
    <div className={cn('flex flex-col gap-6 pt-4 pb-2', className)}>
      <div>
        <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-accent font-semibold">
          Danh mục sinh học toàn cầu · 9 loài đặc hữu
        </span>
        <h1 className="mt-1 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-fg font-sans">
          Bách khoa loài
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-fg-2 max-w-2xl leading-relaxed">
          Khám phá hồ sơ chuyên khảo sinh thái học, bản đồ sinh cảnh toàn cầu và tiêu chuẩn nhân giống bảo tồn F2+ của các loài sinh vật cảnh BioNexus.
        </p>
      </div>

      {/* Dải 5 ô IUCN Ticker */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {IUCN_TICKER_ITEMS.map((item) => {
          const count = counts[item.code] || 0;
          const isActive = activeIucn === item.code;
          const dotColor = IUCN_COLORS[item.code] || '#6ee7b7';

          return (
            <button
              key={item.code}
              type="button"
              onClick={() => onToggleIucn(item.code)}
              className={cn(
                'group relative flex flex-col justify-between rounded-2xl border p-3.5 text-left transition-all duration-300 outline-none',
                isActive
                  ? 'border-accent bg-accent/15 shadow-[0_0_20px_rgba(110,231,183,0.18)] scale-[1.02]'
                  : 'border-line bg-surface-1/70 hover:border-line-strong hover:bg-surface-2/80'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-mono text-xs font-bold text-fg">
                  <span
                    className="size-2 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: dotColor }}
                  />
                  {item.code}
                </span>
                <span className="text-[10px] text-fg-3 truncate max-w-[80px]">
                  {item.labelVi}
                </span>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <span className="font-mono text-2xl font-bold text-fg group-hover:text-accent transition-colors">
                  {count}
                </span>
                <span className="text-[10px] font-mono text-fg-3">loài</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
