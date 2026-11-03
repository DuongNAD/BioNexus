import React from 'react';
import type { ConservationStatus } from '@/types/api';
import { IUCN_COLORS } from '@/lib/parseEnvironmentSpecs';
import { cn } from '@/lib/cn';

export interface IucnScaleProps {
  currentStatus: ConservationStatus;
  explanation?: string;
  className?: string;
}

const SCALE_LEVELS: Array<{ code: ConservationStatus; labelVi: string; desc: string }> = [
  { code: 'LC', labelVi: 'Ít quan tâm', desc: 'Quần thể hoang dã dồi dào, phạm vi phân bố rộng, nguy cơ tuyệt chủng thấp.' },
  { code: 'NT', labelVi: 'Sắp bị đe dọa', desc: 'Có thể chuyển sang nhóm bị đe dọa trong tương lai gần nếu sinh cảnh suy thoái.' },
  { code: 'VU', labelVi: 'Sắp nguy cấp', desc: 'Nguy cơ tuyệt chủng cao ngoài tự nhiên trong trung hạn.' },
  { code: 'EN', labelVi: 'Nguy cấp', desc: 'Nguy cơ tuyệt chủng rất cao ngoài tự nhiên trong tương lai gần.' },
  { code: 'CR', labelVi: 'Cực kỳ nguy cấp', desc: 'Nguy cơ tuyệt chủng cực kỳ cao ngoài tự nhiên ngay trước mắt.' },
  { code: 'EW', labelVi: 'Tuyệt chủng ngoài tự nhiên', desc: 'Chỉ còn sống trong điều kiện nuôi nhốt hoặc khu bảo tồn.' },
  { code: 'EX', labelVi: 'Tuyệt chủng', desc: 'Không còn cá thể nào sống sót.' },
];

/** Thang 7 bậc IUCN: một dải liền, bậc của loài sáng màu chuẩn, các bậc khác chìm */
export const IucnScale: React.FC<IucnScaleProps> = ({ currentStatus, explanation, className = '' }) => {
  const currentLevel = SCALE_LEVELS.find((l) => l.code === currentStatus) || SCALE_LEVELS[0]!;

  return (
    <div className={cn('space-y-6', className)}>
      <ol className="grid grid-cols-7 gap-1.5" aria-label="Thang bảo tồn IUCN">
        {SCALE_LEVELS.map((lvl) => {
          const isCurrent = lvl.code === currentStatus;
          return (
            <li key={lvl.code} aria-current={isCurrent ? 'step' : undefined} className="min-w-0">
              <span
                className={cn('block h-2 rounded-full', !isCurrent && 'opacity-25')}
                style={{ backgroundColor: IUCN_COLORS[lvl.code] }}
                aria-hidden="true"
              />
              <span className={cn('mt-2 block font-mono text-xs', isCurrent ? 'font-semibold text-fg' : 'text-fg-3')}>
                {lvl.code}
              </span>
              <span className={cn('mt-0.5 hidden text-xs leading-snug md:block', isCurrent ? 'text-fg' : 'text-fg-3')}>
                {lvl.labelVi}
              </span>
            </li>
          );
        })}
      </ol>
      <div className="max-w-3xl">
        <p className="text-lg font-semibold text-fg">
          {currentLevel.labelVi} <span className="font-mono text-base text-fg-3">({currentLevel.code})</span>
        </p>
        <p className="mt-2 leading-relaxed text-fg-2">{explanation || currentLevel.desc}</p>
      </div>
    </div>
  );
};
