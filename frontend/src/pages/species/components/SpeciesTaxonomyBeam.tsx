import React, { useRef } from 'react';
import { Link } from 'react-router';
import { Layers, ChevronRight } from 'lucide-react';
import type { TaxonomyNodeDto } from '@/types/api';
import { TaxonRankChip } from '@/components/domain/TaxonRankChip';
import { cn } from '@/lib/cn';

export interface SpeciesTaxonomyBeamProps {
  breadcrumbs: TaxonomyNodeDto[];
  className?: string;
}

export const SpeciesTaxonomyBeam: React.FC<SpeciesTaxonomyBeamProps> = ({
  breadcrumbs,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<number, HTMLAnchorElement | null>>({});

  if (breadcrumbs.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative rounded-2xl border border-line bg-surface-1/70 p-6 backdrop-blur-xl shadow-lg space-y-4 overflow-hidden',
        className
      )}
    >
      <div className="flex items-center justify-between pb-3 border-b border-line/40">
        <div className="flex items-center gap-2">
          <Layers className="size-4 text-accent" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-fg">
            Chuỗi phân loại phả hệ 6 cấp
          </h3>
        </div>
        <span className="text-[11px] font-mono text-fg-3">
          Liên kết trực tiếp Cây phân loại
        </span>
      </div>

      <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 py-2 z-10">
        {breadcrumbs.map((node, idx) => {
          const rank = node.rankLevel || node.rank;
          const isGenus = rank === 'GENUS';

          return (
            <React.Fragment key={node.id}>
              <Link
                ref={(el) => {
                  nodeRefs.current[node.id] = el;
                }}
                to={`/taxonomy/${node.id}`}
                className="group relative flex flex-1 flex-col items-center justify-center rounded-xl border border-line bg-surface-2/80 p-3 text-center transition-all duration-300 hover:border-accent hover:bg-surface-hover hover:scale-105 shadow-sm"
              >
                <TaxonRankChip rank={rank || 'SPECIES'} showHelp={false} className="mb-2 text-[10px]" />
                <p
                  className={cn(
                    'text-xs font-semibold text-fg group-hover:text-accent transition-colors truncate max-w-full',
                    isGenus && 'font-serif italic text-accent'
                  )}
                >
                  {node.scientificName}
                </p>
                <p className="text-[10px] text-fg-3 truncate max-w-full mt-0.5">
                  {node.commonName}
                </p>
              </Link>

              {idx < breadcrumbs.length - 1 && (
                <div className="hidden sm:flex items-center justify-center text-fg-mute">
                  <ChevronRight className="size-4" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
