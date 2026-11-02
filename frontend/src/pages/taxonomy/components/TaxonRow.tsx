import React from 'react';
import { ChevronRight } from 'lucide-react';
import type { TaxonomyNodeDto } from '@/types/api';
import { ThumbnailStack, type ThumbnailItem } from './ThumbnailStack';
import { cn } from '@/lib/cn';

export interface TaxonRowProps {
  node: TaxonomyNodeDto;
  isSelected: boolean;
  onSelect: (node: TaxonomyNodeDto) => void;
  thumbnails?: ThumbnailItem[];
  rowRef?: React.Ref<HTMLButtonElement>;
}

export const TaxonRow: React.FC<TaxonRowProps> = ({
  node,
  isSelected,
  onSelect,
  thumbnails = [],
  rowRef,
}) => {
  const rank = node?.rankLevel || node?.rank;
  const isItalicRank = rank === 'GENUS';

  return (
    <button
      ref={rowRef}
      type="button"
      onClick={() => onSelect(node)}
      className={cn(
        'group relative flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-3 text-left transition-all duration-200 outline-none',
        isSelected
          ? 'border border-accent/50 bg-accent/10 text-fg shadow-[0_0_15px_rgba(110,231,183,0.12)]'
          : 'border border-transparent bg-surface/50 text-fg-2 hover:border-line hover:bg-surface hover:text-fg'
      )}
    >
      <div className="min-w-0 flex-1">
        {/* Tên khoa học theo quy tắc danh pháp quốc tế */}
        <p
          className={cn(
            'truncate text-sm tracking-wide',
            isItalicRank ? 'font-serif italic font-semibold text-accent' : 'font-sans font-semibold text-fg',
            isSelected && !isItalicRank && 'text-accent'
          )}
        >
          {node.scientificName}
        </p>

        {/* Tên thường */}
        <p className="truncate text-xs text-fg-3 mt-0.5">
          {node.commonName || node.rankLevel}
        </p>

        {/* Thumbnail stack nếu có loài con */}
        {thumbnails.length > 0 && (
          <div className="mt-1.5">
            <ThumbnailStack thumbnails={thumbnails} />
          </div>
        )}
      </div>

      <ChevronRight
        className={cn(
          'size-4 shrink-0 transition-transform duration-200',
          isSelected ? 'translate-x-1 text-accent' : 'text-fg-mute group-hover:translate-x-0.5 group-hover:text-fg-3'
        )}
        aria-hidden="true"
      />
    </button>
  );
};
