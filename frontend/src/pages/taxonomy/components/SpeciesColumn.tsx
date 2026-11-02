import React from 'react';
import type { SpeciesDto } from '@/types/api';
import { SpeciesCardCompact } from './SpeciesCardCompact';
import { TaxonRankChip } from '@/components/domain/TaxonRankChip';
import { cn } from '@/lib/cn';

export interface SpeciesColumnProps {
  genusName: string;
  speciesList: SpeciesDto[];
  productCounts?: Record<number, number>;
  columnRef?: React.Ref<HTMLDivElement>;
  className?: string;
}

export const SpeciesColumn: React.FC<SpeciesColumnProps> = ({
  genusName,
  speciesList,
  productCounts = {},
  columnRef,
  className = '',
}) => {
  return (
    <div
      ref={columnRef}
      className={cn(
        'flex h-[620px] w-80 shrink-0 flex-col rounded-2xl border border-line bg-surface-1/70 backdrop-blur-xl overflow-hidden shadow-lg',
        className
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between border-b border-line px-4 py-3 bg-surface-2/40">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-fg">
            Loài thuộc chi <span className="font-serif italic font-semibold text-accent">{genusName}</span>
          </h3>
          <p className="text-[10px] font-mono text-fg-3">{speciesList.length} loài đại diện</p>
        </div>
        <TaxonRankChip rank="SPECIES" showHelp={false} />
      </div>

      {/* Species Grid/List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-line">
        {speciesList.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-6 text-center text-xs text-fg-3">
            <p>Chưa có loài nào ở nhánh phân loại này.</p>
          </div>
        ) : (
          speciesList.map((species) => (
            <SpeciesCardCompact
              key={species.id}
              species={species}
              productCount={productCounts[species.id] || 0}
            />
          ))
        )}
      </div>
    </div>
  );
};
