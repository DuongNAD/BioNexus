import React, { useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import type { TaxonomyNodeDto, SpeciesDto } from '@/types/api';
import { TaxonRow } from './TaxonRow';
import { SpeciesCardCompact } from './SpeciesCardCompact';
import { TaxonRankChip, RANK_INFO } from '@/components/domain/TaxonRankChip';
import type { ThumbnailItem } from './ThumbnailStack';
import { cn } from '@/lib/cn';

export interface MobileTaxonomyViewProps {
  currentNode: TaxonomyNodeDto;
  breadcrumbs: TaxonomyNodeDto[];
  childrenNodes: TaxonomyNodeDto[];
  speciesList: SpeciesDto[];
  /** Tổng số loài dưới toàn bộ nhánh (không chỉ loài trực thuộc chi) */
  branchSpeciesCount: number;
  onSelectNode: (node: TaxonomyNodeDto) => void;
  thumbnailsMap?: Record<number, ThumbnailItem[]>;
  productCounts?: Record<number, number>;
}

export const MobileTaxonomyView: React.FC<MobileTaxonomyViewProps> = ({
  currentNode,
  breadcrumbs,
  childrenNodes,
  speciesList,
  branchSpeciesCount,
  onSelectNode,
  thumbnailsMap = {},
  productCounts = {},
}) => {
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  // Nút cha trực tiếp để quay lại
  const parentNode = breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 2] : null;
  const currentRank = currentNode.rankLevel || currentNode.rank;
  const isLeafGenus = currentRank === 'GENUS';

  return (
    <div className="flex flex-col space-y-4 md:hidden">
      {/* Nút Quay lại cấp cha */}
      {parentNode && (
        <button
          type="button"
          onClick={() => onSelectNode(parentNode)}
          className="flex items-center gap-2 text-xs font-semibold text-accent hover:underline py-1"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          <span>
            Quay lại {parentNode.scientificName} (
            {parentNode.commonName || RANK_INFO[parentNode.rankLevel || parentNode.rank]?.labelVi})
          </span>
        </button>
      )}

      {/* Thẻ định danh nút hiện tại */}
      <div className="rounded-2xl border border-line bg-surface-1 p-4 shadow-md">
        <div className="flex items-center justify-between pb-2 border-b border-line/40">
          <TaxonRankChip rank={currentRank || 'SPECIES'} />
          <span className="text-[11px] font-mono text-fg-3">
            {isLeafGenus ? `${speciesList.length} loài` : `${childrenNodes.length} nhánh con`}
          </span>
        </div>

        <div className="mt-3">
          <h2
            className={cn(
              'text-lg font-bold text-fg',
              isLeafGenus && 'font-serif italic text-accent'
            )}
          >
            {currentNode.scientificName}
          </h2>
          <p className="text-xs text-fg-2 mt-0.5">{currentNode.commonName}</p>
        </div>
      </div>

      {/* Danh sách các con: Hoặc nút phân loại con, hoặc loài trực thuộc nếu là Chi */}
      <div className="rounded-2xl border border-line bg-surface-1 p-3 shadow-md space-y-2">
        <h3 className="px-1 text-xs font-bold uppercase tracking-wider text-fg-3">
          {isLeafGenus ? 'Các loài trực thuộc chi' : 'Các phân nhánh con'}
        </h3>

        {isLeafGenus ? (
          speciesList.length === 0 ? (
            <div className="p-6 text-center text-xs text-fg-3">Chưa có loài nào ở chi này.</div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {speciesList.map((sp) => (
                <SpeciesCardCompact
                  key={sp.id}
                  species={sp}
                  productCount={productCounts[sp.id] || 0}
                />
              ))}
            </div>
          )
        ) : childrenNodes.length === 0 ? (
          <div className="p-6 text-center text-xs text-fg-3">Chưa có phân nhánh con nào.</div>
        ) : (
          childrenNodes.map((child) => (
            <TaxonRow
              key={child.id}
              node={child}
              isSelected={false}
              onSelect={onSelectNode}
              thumbnails={thumbnailsMap[child.id] || []}
            />
          ))
        )}
      </div>

      {/* Accordion tóm tắt nhánh */}
      <div className="rounded-2xl border border-line bg-surface-1 overflow-hidden shadow-md">
        <button
          type="button"
          onClick={() => setIsSummaryOpen(!isSummaryOpen)}
          aria-expanded={isSummaryOpen}
          aria-controls="taxonomy-mobile-summary"
          className="flex w-full items-center justify-between p-4 text-xs font-semibold text-fg hover:bg-surface-2 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Layers className="size-4 text-accent" aria-hidden="true" />
            Tóm tắt toàn bộ phân nhánh
          </span>
          {isSummaryOpen ? (
            <ChevronUp className="size-4" aria-hidden="true" />
          ) : (
            <ChevronDown className="size-4" aria-hidden="true" />
          )}
        </button>

        {isSummaryOpen && (
          <div id="taxonomy-mobile-summary" className="border-t border-line p-4 space-y-3 bg-surface-2/40 text-xs">
            <div className="flex justify-between text-fg-2">
              <span>Tổng số loài trong nhánh:</span>
              <strong className="text-accent font-mono">{branchSpeciesCount}</strong>
            </div>

            <Link to={`/species?node=${currentNode.id}`} className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-lg bg-accent px-3 text-xs font-semibold text-accent-ink shadow-[var(--glow-accent-btn)] transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2">
              Xem tất cả loài trong nhánh trên Bách khoa
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
