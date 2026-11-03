import React from 'react';
import { Columns3, Dna } from 'lucide-react';
import type { TaxonomyNodeDto } from '@/types/api';
import { TaxonPath } from '@/components/domain/TaxonPath';
import { TaxonRankChip } from '@/components/domain/TaxonRankChip';
import { cn } from '@/lib/cn';

export interface TaxonomyHeaderProps {
  breadcrumbs: TaxonomyNodeDto[];
  currentNode?: TaxonomyNodeDto;
  viewMode: 'columns' | 'helix';
  onViewModeChange: (mode: 'columns' | 'helix') => void;
  className?: string;
}

export const TaxonomyHeader: React.FC<TaxonomyHeaderProps> = ({
  breadcrumbs,
  currentNode,
  viewMode,
  onViewModeChange,
  className = '',
}) => {
  return (
    <div className={cn('flex flex-col gap-4 border-b border-line pb-6 pt-2', className)}>
      {/* Breadcrumbs dẫn hướng */}
      <TaxonPath breadcrumbs={breadcrumbs} currentNode={currentNode} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-fg font-sans">
              Cây phân loại Sinh học
            </h1>
            {currentNode && <TaxonRankChip rank={currentNode.rankLevel || currentNode.rank} />}
          </div>
          <p className="mt-1 text-xs sm:text-sm text-fg-2 max-w-2xl">
            Khám phá phả hệ sự sống 6 cấp từ 2 Giới gốc xuống tới Chi và Loài đặc hữu BioNexus.
          </p>
        </div>

        {/* Công tắc SegmentedControl Cột vs Chuỗi xoắn 3D */}
        <div
          role="group"
          aria-label="Chế độ xem cây phân loại"
          className="inline-flex rounded-full border border-line bg-surface p-1 shadow-inner shrink-0 self-start sm:self-auto"
        >
          <button
            type="button"
            onClick={() => onViewModeChange('columns')}
            aria-pressed={viewMode === 'columns'}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200',
              viewMode === 'columns'
                ? 'bg-accent text-accent-ink shadow-sm'
                : 'text-fg-2 hover:text-fg'
            )}
          >
            <Columns3 className="size-3.5" aria-hidden="true" />
            <span>Cột phân cấp</span>
          </button>

          <button
            type="button"
            onClick={() => onViewModeChange('helix')}
            aria-pressed={viewMode === 'helix'}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200',
              viewMode === 'helix'
                ? 'bg-accent text-accent-ink shadow-sm'
                : 'text-fg-2 hover:text-fg'
            )}
          >
            <Dna className="size-3.5" aria-hidden="true" />
            <span>Chuỗi xoắn 3D</span>
          </button>
        </div>
      </div>
    </div>
  );
};
