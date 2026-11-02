import React from 'react';
import { Link } from 'react-router';
import { ArrowRight, Dna } from 'lucide-react';
import type { TaxonomyNodeDto, SpeciesDto } from '@/types/api';
import { TaxonRankChip, RANK_INFO } from '@/components/domain/TaxonRankChip';
import { IucnBadge } from '@/components/ui/IucnBadge';
import { Button } from '@/components/ui/Button';
import { extractNames, SPECIES_EXTRAS } from '@/api/adapters';
import { cn } from '@/lib/cn';

export interface TaxonomySidebarProps {
  activeNode: TaxonomyNodeDto | null;
  branchSpecies: SpeciesDto[];
  totalApprovedProducts: number;
  className?: string;
}

export const TaxonomySidebar: React.FC<TaxonomySidebarProps> = ({
  activeNode,
  branchSpecies,
  totalApprovedProducts,
  className = '',
}) => {
  if (!activeNode) {
    return (
      <aside
        className={cn(
          'w-80 shrink-0 rounded-2xl border border-line bg-surface-1/70 p-6 backdrop-blur-xl shadow-lg flex flex-col justify-center text-center text-xs text-fg-3',
          className
        )}
      >
        <Dna className="size-8 mx-auto text-accent mb-2 opacity-50" />
        Chọn một nhánh phân loại để xem chi tiết phả hệ và số liệu sinh thái.
      </aside>
    );
  }

  const rank = activeNode.rankLevel || activeNode.rank;
  const isItalic = rank === 'GENUS';
  const rankInfo = rank ? RANK_INFO[rank] : undefined;
  const prominentSpecies = branchSpecies[0];
  const prominentExtra = prominentSpecies ? SPECIES_EXTRAS[prominentSpecies.scientificName] : undefined;
  const prominentPhoto = prominentExtra
    ? `photos/${prominentExtra.slug}/hero-960.webp`
    : prominentSpecies?.imageURL;

  return (
    <aside
      className={cn(
        'w-84 shrink-0 rounded-2xl border border-line bg-surface-1/80 p-5 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-4',
        className
      )}
    >
      <div>
        {/* Header & Rank */}
        <div className="flex items-center justify-between pb-3 border-b border-line/40">
          <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-semibold">
            Tổng quan phân nhánh
          </span>
          <TaxonRankChip rank={rank || 'SPECIES'} />
        </div>

        {/* Tiêu đề nút */}
        <div className="mt-3">
          <h2
            className={cn(
              'text-lg text-fg font-semibold tracking-tight',
              isItalic && 'font-serif italic text-accent'
            )}
          >
            {activeNode.scientificName}
          </h2>
          {activeNode.commonName && (
            <p className="text-xs text-fg-3 mt-0.5">{activeNode.commonName}</p>
          )}

          {/* Định nghĩa khoa học của cấp bậc */}
          {rankInfo && (
            <p className="mt-2 text-[11px] text-fg-2 leading-relaxed bg-surface-2/50 rounded-lg p-2.5 border border-line/30">
              {rankInfo.definition}
            </p>
          )}
        </div>

        {/* 2 Ô KPI Thống kê Ticker */}
        <div className="mt-3.5 grid grid-cols-2 gap-2.5">
          <div className="rounded-xl border border-line bg-surface-2/70 p-3 text-center">
            <span className="text-[10px] font-mono text-fg-3 uppercase">Loài trực thuộc</span>
            <p className="font-mono text-2xl font-bold text-accent mt-0.5">
              {branchSpecies.length}
            </p>
            <span className="text-[10px] text-fg-3">trong nhánh</span>
          </div>

          <div className="rounded-xl border border-line bg-surface-2/70 p-3 text-center">
            <span className="text-[10px] font-mono text-fg-3 uppercase">Cá thể đang bán</span>
            <p className="font-mono text-2xl font-bold text-emerald-400 mt-0.5">
              {totalApprovedProducts}
            </p>
            <span className="text-[10px] text-fg-3">đã cấp phép F2+</span>
          </div>
        </div>

        {/* Ảnh đại diện nổi bật */}
        {prominentSpecies && prominentPhoto && (
          <div className="mt-3.5 relative aspect-video w-full overflow-hidden rounded-xl border border-line bg-surface-2">
            <img
              src={prominentPhoto}
              alt={prominentSpecies.commonName}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-white">
              <span className="font-semibold truncate">
                {extractNames(prominentSpecies.commonName).displayName}
              </span>
              <IucnBadge code={prominentSpecies.conservationStatus} size="sm" />
            </div>
          </div>
        )}

        {/* Danh sách các loài trực thuộc (thu nhỏ) */}
        {branchSpecies.length > 0 && (
          <div className="mt-3.5">
            <p className="text-[11px] font-mono uppercase tracking-wider text-fg-3 mb-1.5">
              Loài tiêu biểu ({branchSpecies.length})
            </p>
            <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-line pr-1">
              {branchSpecies.map((sp) => {
                const { displayName } = extractNames(sp.commonName);
                return (
                  <Link
                    key={sp.id}
                    to={`/species/${sp.id}`}
                    className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-xs text-fg-2 hover:bg-surface hover:text-accent transition-colors"
                  >
                    <span className="truncate">{displayName}</span>
                    <IucnBadge code={sp.conservationStatus} size="sm" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* CTA Button dẫn tới /species?node=:id */}
      <div className="pt-2">
        <Link to={`/species?node=${activeNode.id}`} className="w-full block">
          <Button variant="primary" className="w-full gap-2 text-xs">
            Xem tất cả loài trong nhánh ({branchSpecies.length})
            <ArrowRight className="size-3.5" />
          </Button>
        </Link>
      </div>
    </aside>
  );
};
