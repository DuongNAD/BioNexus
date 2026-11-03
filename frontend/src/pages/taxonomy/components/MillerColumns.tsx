import React, { useRef, useEffect, useLayoutEffect, useReducer } from 'react';
import type { TaxonomyNodeDto, SpeciesDto, TaxonomyRank } from '@/types/api';
import { TaxonColumn } from './TaxonColumn';
import { SpeciesColumn } from './SpeciesColumn';
import { AnimatedBeam } from '@/components/motion/AnimatedBeam';
import type { ThumbnailItem } from './ThumbnailStack';
import { cn } from '@/lib/cn';

export interface ColumnData {
  rank: TaxonomyRank;
  title: string;
  items: TaxonomyNodeDto[];
  selectedId: number | null;
}

export interface MillerColumnsProps {
  columns: ColumnData[];
  onSelectNode: (node: TaxonomyNodeDto) => void;
  terminalGenus: TaxonomyNodeDto | null;
  terminalSpecies: SpeciesDto[];
  thumbnailsMap?: Record<number, ThumbnailItem[]>;
  productCounts?: Record<number, number>;
  className?: string;
}

export const MillerColumns: React.FC<MillerColumnsProps> = ({
  columns,
  onSelectNode,
  terminalGenus,
  terminalSpecies,
  thumbnailsMap = {},
  productCounts = {},
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedRowRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const columnRefs = useRef<Record<number, HTMLDivElement | null>>({});
  // Ref chỉ có giá trị sau khi commit: render lại một lần để tia sáng đọc được phần tử thật
  const [, rerenderAfterCommit] = useReducer((n: number) => n + 1, 0);

  useLayoutEffect(() => {
    rerenderAfterCommit();
  }, [columns, terminalGenus]);

  // Tự động cuộn sang phải khi có cột mới mở ra
  useEffect(() => {
    if (containerRef.current) {
      const reduceMotion =
        typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      containerRef.current.scrollTo({
        left: containerRef.current.scrollWidth,
        behavior: reduceMotion ? 'auto' : 'smooth',
      });
    }
  }, [columns.length, terminalGenus]);

  // Tìm cặp hàng đang chọn ở cột i và cột i+1 để nối tia sáng AnimatedBeam
  const beamPairs = React.useMemo(() => {
    const pairs: Array<{ fromColIdx: number; toColIdx: number; fromId: number }> = [];
    for (let i = 0; i < columns.length - 1; i++) {
      const col = columns[i];
      if (col && col.selectedId !== null) {
        pairs.push({
          fromColIdx: i,
          toColIdx: i + 1,
          fromId: col.selectedId,
        });
      }
    }
    return pairs;
  }, [columns]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex items-start gap-4 overflow-x-auto pb-4 pt-2 scrollbar-thin scrollbar-thumb-line',
        className
      )}
    >
      {/* Các cột phân cấp Miller */}
      {columns.map((col, idx) => (
        <TaxonColumn
          key={`${col.rank}-${idx}`}
          rank={col.rank}
          title={col.title}
          items={col.items}
          selectedId={col.selectedId}
          onSelect={onSelectNode}
          thumbnailsMap={thumbnailsMap}
          columnRef={(el) => {
            columnRefs.current[idx] = el;
          }}
          selectedRowRef={(el) => {
            if (col.selectedId !== null) {
              selectedRowRefs.current[col.selectedId] = el;
            }
          }}
        />
      ))}

      {/* Cột tận cùng Chi -> Danh sách loài */}
      {terminalGenus && (
        <SpeciesColumn
          genusName={terminalGenus.scientificName}
          speciesList={terminalSpecies}
          productCounts={productCounts}
          columnRef={(el) => {
            columnRefs.current[columns.length] = el;
          }}
        />
      )}

      {/* Tia sáng AnimatedBeam kết nối giữa các cột */}
      {beamPairs.map((pair) => {
        const fromEl = selectedRowRefs.current[pair.fromId];
        const toColEl = columnRefs.current[pair.toColIdx];

        if (!fromEl || !toColEl) return null;

        return (
          <AnimatedBeam
            key={`beam-${pair.fromId}-${pair.toColIdx}`}
            containerRef={containerRef}
            fromRef={{ current: fromEl }}
            toRef={{ current: toColEl }}
            duration={2}
          />
        );
      })}
    </div>
  );
};
