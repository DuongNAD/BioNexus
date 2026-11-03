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
  { code: 'NT', labelVi: 'Sắp bị đe dọa', desc: 'Có nguy cơ chuyển sang nhóm bị đe dọa trong tương lai gần nếu sinh cảnh suy thoái.' },
  { code: 'VU', labelVi: 'Sắp nguy cấp', desc: 'Đối mặt với nguy cơ tuyệt chủng cao trong tự nhiên ở mức trung hạn.' },
  { code: 'EN', labelVi: 'Nguy cấp', desc: 'Đối mặt với nguy cơ tuyệt chủng rất cao ngoài tự nhiên trong tương lai gần.' },
  { code: 'CR', labelVi: 'Cực kỳ nguy cấp', desc: 'Đối mặt với nguy cơ tuyệt chủng tối cao ngoài tự nhiên trong tương lai trực tiếp.' },
  { code: 'EW', labelVi: 'Tuyệt chủng tự nhiên', desc: 'Chỉ còn tồn tại trong điều kiện nuôi nhốt nhân tạo hoặc các khu bảo tồn sinh học.' },
  { code: 'EX', labelVi: 'Tuyệt chủng hoàn toàn', desc: 'Không còn bất kỳ cá thể nào còn sống sót trên toàn hành tinh.' },
];

export const IucnScale: React.FC<IucnScaleProps> = ({
  currentStatus,
  explanation,
  className = '',
}) => {
  const currentLevel = SCALE_LEVELS.find((l) => l.code === currentStatus) || SCALE_LEVELS[0]!;
  const currentColor = IUCN_COLORS[currentStatus] || '#6ee7b7';

  return (
    <div
      className={cn(
        'rounded-2xl border border-line bg-surface p-5 backdrop-blur-md flex flex-col justify-between space-y-4',
        className
      )}
    >
      <div className="flex items-center justify-between pb-2 border-b border-line/40">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-fg-2">
            Thang bậc bảo tồn IUCN Red List
          </h4>
          <p className="text-[11px] text-fg-3">Đánh giá nguy cơ tuyệt chủng toàn cầu</p>
        </div>
        <span
          className="rounded-full px-2.5 py-0.5 text-xs font-mono font-bold text-black"
          style={{ backgroundColor: currentColor }}
        >
          {currentStatus} · {currentLevel.labelVi}
        </span>
      </div>

      {/* Dãy 7 nấc bậc thang IUCN */}
      <div className="relative py-2">
        {/* Đường nối ngang */}
        <div className="absolute top-1/2 left-4 right-4 h-0.5 -translate-y-1/2 bg-line z-0" />

        <div className="relative z-10 flex items-center justify-between gap-1">
          {SCALE_LEVELS.map((lvl) => {
            const isCurrent = lvl.code === currentStatus;
            const lvlColor = IUCN_COLORS[lvl.code] || '#fff';

            return (
              <div key={lvl.code} className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex size-7 sm:size-8 items-center justify-center rounded-full text-[10px] font-mono font-bold transition-all duration-300',
                    isCurrent
                      ? 'scale-125 text-black shadow-[0_0_15px_var(--glow)] z-20 font-extrabold'
                      : 'bg-surface-2 text-fg-2 border border-line'
                  )}
                  style={
                    isCurrent
                      ? ({
                          backgroundColor: lvlColor,
                          ['--glow' as string]: lvlColor,
                        } as React.CSSProperties)
                      : {}
                  }
                  title={`${lvl.code} - ${lvl.labelVi}`}
                >
                  {lvl.code}
                </div>
                <span
                  className={cn(
                    'mt-1.5 text-[9px] font-mono hidden sm:inline-block',
                    isCurrent ? 'text-fg font-bold' : 'text-fg-3'
                  )}
                >
                  {lvl.code}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Câu giải thích bảo tồn chính thức */}
      <div className="rounded-xl bg-surface-2/60 p-3 text-xs text-fg-2 border border-line/30 leading-relaxed">
        <p className="font-semibold text-fg mb-0.5">{currentLevel.labelVi}:</p>
        <p>{explanation || currentLevel.desc}</p>
      </div>
    </div>
  );
};
