import React from 'react';
import { Link } from 'react-router';
import type { TaxonomyNodeDto } from '@/types/api';
import { RANK_INFO } from '@/components/domain/TaxonRankChip';
import { cn } from '@/lib/cn';

export interface SpeciesTaxonomyBeamProps {
  breadcrumbs: TaxonomyNodeDto[];
  /** Tên khoa học của loài: ô cuối của chuỗi */
  speciesName: string;
  className?: string;
}

/** Chuỗi 6 cấp từ Giới tới Chi rồi tới loài; mỗi cấp bấm được để mở cây phân loại */
export const SpeciesTaxonomyBeam: React.FC<SpeciesTaxonomyBeamProps> = ({ breadcrumbs, speciesName, className = '' }) => {
  if (breadcrumbs.length === 0) return null;

  return (
    <nav aria-label="Vị trí trong cây phân loại" className={cn('-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0', className)}>
      <ol className="grid min-w-[720px] grid-flow-col auto-cols-fr border-y border-line">
        {breadcrumbs.map((node) => {
          const rank = node.rankLevel || node.rank;
          const info = RANK_INFO[rank];
          return (
            <li key={node.id} className="min-w-0 border-l border-line first:border-l-0">
              <Link
                to={`/taxonomy/${node.id}`}
                className="block px-4 py-4 transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
              >
                <span className="block text-xs font-semibold tracking-[0.18em] text-fg-3 uppercase">{info?.labelVi ?? rank}</span>
                <span className={cn('mt-1.5 block truncate text-sm text-fg', info?.isItalic && 'font-serif text-base italic')}>
                  {node.scientificName}
                </span>
                <span className="mt-0.5 block truncate text-sm text-fg-3">{node.commonName}</span>
              </Link>
            </li>
          );
        })}
        <li className="relative min-w-0 border-l border-line px-4 py-4 after:absolute after:inset-x-4 after:-bottom-px after:h-0.5 after:bg-accent">
          <span className="block text-xs font-semibold tracking-[0.18em] text-accent uppercase">Loài</span>
          <span className="mt-1.5 block truncate font-serif text-base text-fg italic" aria-current="page">
            {speciesName}
          </span>
        </li>
      </ol>
    </nav>
  );
};
