import React from 'react';
import { Search, LayoutGrid, Globe, ArrowUpDown, X } from 'lucide-react';
import type { ConservationStatus } from '@/types/api';
import { cn } from '@/lib/cn';

export type BiologicalGroup = 'all' | 'Bò sát' | 'Lưỡng cư' | 'Cây ăn thịt';
export type SortOption = 'name_asc' | 'iucn_desc' | 'products_desc';

export interface SpeciesFilterBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  selectedGroup: BiologicalGroup;
  onGroupChange: (group: BiologicalGroup) => void;
  selectedIucn: ConservationStatus | null;
  onIucnChange: (iucn: ConservationStatus | null) => void;
  selectedSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: 'grid' | 'map';
  onViewModeChange: (view: 'grid' | 'map') => void;
  totalFiltered: number;
  className?: string;
}

const GROUPS: Array<{ id: BiologicalGroup; label: string }> = [
  { id: 'all', label: 'Tất cả' },
  { id: 'Bò sát', label: 'Bò sát' },
  { id: 'Lưỡng cư', label: 'Lưỡng cư' },
  { id: 'Cây ăn thịt', label: 'Cây ăn thịt' },
];

export const SpeciesFilterBar: React.FC<SpeciesFilterBarProps> = ({
  query,
  onQueryChange,
  selectedGroup,
  onGroupChange,
  selectedIucn,
  onIucnChange,
  selectedSort,
  onSortChange,
  viewMode,
  onViewModeChange,
  totalFiltered,
  className = '',
}) => {
  return (
    <div
      className={cn(
        'sticky top-16 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3.5 backdrop-blur-xl bg-bg/90 border-y border-line shadow-md space-y-3',
        className
      )}
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Hàng 1: Ô tìm kiếm & Nhóm sinh học */}
        <div className="flex flex-1 flex-col sm:flex-row sm:items-center gap-3">
          {/* Ô tìm kiếm */}
          <div className="relative min-w-[240px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-accent pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Tìm theo tên loài, chi, họ..."
              className="w-full rounded-full border border-line bg-surface-2/80 pl-9 pr-8 py-1.5 text-xs text-fg placeholder:text-fg-3 focus:border-accent focus:outline-none transition-colors"
            />
            {query && (
              <button
                type="button"
                onClick={() => onQueryChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-fg-3 hover:text-fg p-0.5"
                aria-label="Xóa từ khóa tìm kiếm"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Chip nhóm sinh học */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {GROUPS.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => onGroupChange(g.id)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition-all duration-200',
                  selectedGroup === g.id
                    ? 'bg-accent text-accent-ink font-semibold shadow-sm'
                    : 'border border-line bg-surface-1 text-fg-2 hover:border-line-strong hover:text-fg'
                )}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hàng 2: Sắp xếp, Bộ lọc IUCN & Công tắc Xem Lưới / Bản đồ */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
          {/* Sắp xếp */}
          <div className="flex items-center gap-1.5 text-xs">
            <ArrowUpDown className="size-3.5 text-fg-3" />
            <select
              value={selectedSort}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="rounded-full border border-line bg-surface-2/80 px-2.5 py-1 text-xs text-fg focus:border-accent focus:outline-none cursor-pointer"
            >
              <option value="name_asc">Tên (A → Z)</option>
              <option value="iucn_desc">Nguy cấp nhất trước</option>
              <option value="products_desc">Nhiều sản phẩm nhất</option>
            </select>
          </div>

          {/* Công tắc Chế độ xem Lưới vs Bản đồ */}
          <div className="inline-flex rounded-full border border-line bg-surface-1 p-0.5 shadow-inner">
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200',
                viewMode === 'grid'
                  ? 'bg-accent text-accent-ink shadow-sm'
                  : 'text-fg-2 hover:text-fg'
              )}
              title="Chế độ Lưới thẻ loài"
            >
              <LayoutGrid className="size-3.5" />
              <span className="hidden sm:inline">Lưới</span>
            </button>

            <button
              type="button"
              onClick={() => onViewModeChange('map')}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200',
                viewMode === 'map'
                  ? 'bg-accent text-accent-ink shadow-sm'
                  : 'text-fg-2 hover:text-fg'
              )}
              title="Chế độ Bản đồ BioEarth 3D"
            >
              <Globe className="size-3.5" />
              <span className="hidden sm:inline">Bản đồ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dòng tóm tắt kết quả & chip lọc đang áp dụng */}
      <div className="flex items-center justify-between text-[11px] font-mono text-fg-3 pt-1">
        <span>Tìm thấy {totalFiltered} loài sinh vật</span>
        {selectedIucn && (
          <span className="flex items-center gap-1 text-accent">
            Đang lọc mức IUCN: <strong>{selectedIucn}</strong>
            <button
              type="button"
              onClick={() => onIucnChange(null)}
              className="ml-1 text-fg-3 hover:text-fg"
              aria-label="Xóa lọc IUCN"
            >
              <X className="size-3" />
            </button>
          </span>
        )}
      </div>
    </div>
  );
};
