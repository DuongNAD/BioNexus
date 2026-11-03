import React from 'react';
import { Link } from 'react-router';
import { RANK_INFO } from '@/components/domain/TaxonRankChip';
import { cn } from '@/lib/cn';
import type { TaxonomyNodeDto, TaxonomyRank } from '@/types/api';

const RANKS: TaxonomyRank[] = ['KINGDOM', 'PHYLUM', 'CLASS', 'ORDER', 'FAMILY', 'GENUS'];

const rankOf = (node: TaxonomyNodeDto): TaxonomyRank => node.rankLevel || node.rank;

/**
 * Thang 6 cấp: cho thấy đang ở đâu trong cây và bấm để quay lên cấp trên.
 * Thay cho các cột Miller cũ: nhìn một dòng là biết đường đi từ Giới tới Chi.
 */
export function RankLadder({ path }: { path: TaxonomyNodeDto[] }): React.JSX.Element {
  const byRank = new Map(path.map((n) => [rankOf(n), n]));
  const currentRank = path.length > 0 ? rankOf(path[path.length - 1]!) : null;
  const currentIndex = currentRank ? RANKS.indexOf(currentRank) : -1;

  return (
    <nav aria-label="Các cấp phân loại" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ol className="grid min-w-[640px] grid-cols-6 border-y border-line">
        {RANKS.map((rank, i) => {
          const node = byRank.get(rank);
          const isCurrent = i === currentIndex;
          const isPassed = i < currentIndex;
          const isNext = i === currentIndex + 1;
          const info = RANK_INFO[rank];
          const content = (
            <>
              <span
                className={cn(
                  'block text-xs font-semibold uppercase tracking-[0.18em]',
                  isCurrent ? 'text-accent' : 'text-fg-3'
                )}
              >
                {info.labelVi}
              </span>
              <span
                className={cn(
                  'mt-1.5 block truncate text-sm',
                  node ? 'text-fg' : 'text-fg-3',
                  node && info.isItalic && 'font-serif text-base italic',
                  isCurrent && 'font-semibold'
                )}
              >
                {node ? node.scientificName : isNext ? 'Chọn bên dưới' : '—'}
              </span>
            </>
          );
          return (
            <li
              key={rank}
              className={cn(
                'relative min-w-0 border-l border-line px-4 py-4 first:border-l-0 first:pl-0',
                // Vạch sáng dưới cấp đang xem
                isCurrent && 'after:absolute after:inset-x-4 after:-bottom-px after:h-0.5 after:bg-accent first:after:left-0'
              )}
            >
              {node && !isCurrent ? (
                <Link
                  to={`/taxonomy/${node.id}`}
                  className={cn('block rounded-md transition-colors hover:text-accent', isPassed && 'opacity-90')}
                >
                  {content}
                </Link>
              ) : (
                <div aria-current={isCurrent ? 'step' : undefined}>{content}</div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
