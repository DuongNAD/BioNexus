import React from 'react';
import type { TaxonomyNodeDto, TaxonomyRank } from '@/types/api';
import { TaxonRow } from './TaxonRow';
import { TaxonRankChip } from '@/components/domain/TaxonRankChip';
import type { ThumbnailItem } from './ThumbnailStack';
import { cn } from '@/lib/cn';

export interface TaxonColumnProps {
  rank: TaxonomyRank;
  title: string;
  items: TaxonomyNodeDto[];
  selectedId: number | null;
  onSelect: (node: TaxonomyNodeDto) => void;
  thumbnailsMap?: Record<number, ThumbnailItem[]>;
  columnRef?: React.Ref<HTMLDivElement>;
  selectedRowRef?: React.Ref<HTMLButtonElement>;
  className?: string;
}

export const TaxonColumn: React.FC<TaxonColumnProps> = ({
  rank,
  title,
  items,
  selectedId,
  onSelect,
  thumbnailsMap = {},
  columnRef,
  selectedRowRef,
  className = '',
}) => {
  return (
    <div
      ref={columnRef}
      className={cn(
        'flex h-[620px] w-72 shrink-0 flex-col rounded-2xl border border-line bg-surface-1/70 backdrop-blur-xl overflow-hidden shadow-lg',
        className
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between border-b border-line px-4 py-3 bg-surface-2/40">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-fg">{title}</h3>
          <p className="text-[10px] font-mono text-fg-3">{items.length} phân nhánh</p>
        </div>
        <TaxonRankChip rank={rank} showHelp={false} />
      </div>

      {/* Rows Container */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin scrollbar-thumb-line">
        {items.length === 0 ? (
          <div className="flex h-full items-center justify-center p-6 text-center text-xs text-fg-3">
            Chưa có phân nhánh con nào
          </div>
        ) : (
          items.map((node) => {
            const isSelected = node.id === selectedId;
            return (
              <TaxonRow
                key={node.id}
                node={node}
                isSelected={isSelected}
                onSelect={onSelect}
                thumbnails={thumbnailsMap[node.id] || []}
                rowRef={isSelected ? selectedRowRef : undefined}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
