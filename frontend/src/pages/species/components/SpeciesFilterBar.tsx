import React from 'react';
import { Search, LayoutGrid, Globe, X } from 'lucide-react';
import type { ConservationStatus } from '@/types/api';
import { IUCN_SPECS } from '@/components/ui/IucnBadge';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { cn } from '@/lib/cn';
import type { SpeciesGroup } from '@/api/adapters';

export type BiologicalGroup = 'all' | Exclude<SpeciesGroup, 'Khác'>;
export type SortOption = 'name_asc' | 'iucn_desc' | 'products_desc';

export interface SpeciesFilterBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  selectedGroup: BiologicalGroup;
  onGroupChange: (group: BiologicalGroup) => void;
  selectedIucn: ConservationStatus | null;
  onIucnChange: (iucn: ConservationStatus | null) => void;
  /** Số loài theo từng mức IUCN, hiện cạnh chip để biết lọc ra bao nhiêu */
  iucnCounts: Record<ConservationStatus, number>;
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
  { id: 'Cá cảnh', label: 'Cá cảnh' },
  { id: 'Động vật không xương sống', label: 'Không xương sống' },
  { id: 'Chim', label: 'Chim' },
  { id: 'Thú', label: 'Thú' },
  { id: 'Thú cưng', label: 'Thú cưng' },
  { id: 'Cây ăn thịt', label: 'Cây ăn thịt' },
  { id: 'Cây cảnh', label: 'Cây cảnh' },
];

// Nguy cấp nhất đứng đầu, giống thứ tự đọc của Sách Đỏ
const IUCN_CHIPS: ConservationStatus[] = ['CR', 'EN', 'VU', 'NT', 'LC'];

const chipClass = (active: boolean): string =>
  cn(
    'inline-flex h-9 shrink-0 items-center gap-2 rounded-full border px-3.5 text-sm whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
    active ? 'border-accent bg-accent/15 text-fg' : 'border-line text-fg-2 hover:border-line-strong hover:text-fg'
  );

export const SpeciesFilterBar: React.FC<SpeciesFilterBarProps> = ({
  query,
  onQueryChange,
  selectedGroup,
  onGroupChange,
  selectedIucn,
  onIucnChange,
  iucnCounts,
  selectedSort,
  onSortChange,
  viewMode,
  onViewModeChange,
  totalFiltered,
  className = '',
}) => {
  return (
    <div className={cn('space-y-4 border-y border-line py-5', className)}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-fg-3" aria-hidden="true" />
          <input
            type="search"
            aria-label="Tìm loài theo tên thường, tên khoa học hoặc nơi bản địa"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Tìm theo tên loài, tên khoa học, nơi sống..."
            className="h-11 w-full rounded-full border border-line bg-surface pr-10 pl-10 text-sm text-fg placeholder:text-fg-3 transition-colors focus:border-accent focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange('')}
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-fg-3 hover:text-fg"
              aria-label="Xóa từ khóa tìm kiếm"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-fg-3">
            <span>Sắp xếp</span>
            <select
              value={selectedSort}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="h-10 cursor-pointer rounded-full border border-line bg-surface px-3.5 text-sm text-fg focus:border-accent focus:outline-none"
            >
              <option value="name_asc">Tên (A → Z)</option>
              <option value="iucn_desc">Nguy cấp nhất trước</option>
              <option value="products_desc">Nhiều cá thể đang bán</option>
            </select>
          </label>
          <SegmentedControl
            label="Chế độ xem"
            value={viewMode}
            onChange={onViewModeChange}
            options={[
              { value: 'grid', label: 'Lưới', icon: <LayoutGrid className="size-4" aria-hidden="true" /> },
              { value: 'map', label: 'Bản đồ', icon: <Globe className="size-4" aria-hidden="true" /> },
            ]}
          />
        </div>
      </div>

      {/* Hai hàng chip riêng: gộp chung một hàng thì chip IUCN bị cắt mất trên màn hình vừa */}
      <div className="flex flex-col gap-3">
        <div role="group" aria-label="Lọc theo nhóm sinh học" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
          {GROUPS.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => onGroupChange(g.id)}
              aria-pressed={selectedGroup === g.id}
              className={chipClass(selectedGroup === g.id)}
            >
              {g.label}
            </button>
          ))}
        </div>

        <div role="group" aria-label="Lọc theo mức bảo tồn IUCN" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
          {IUCN_CHIPS.map((code) => {
            const active = selectedIucn === code;
            return (
              <button
                key={code}
                type="button"
                onClick={() => onIucnChange(active ? null : code)}
                aria-pressed={active}
                aria-label={`${IUCN_SPECS[code].label}: ${iucnCounts[code]} loài`}
                className={chipClass(active)}
              >
                <span className="size-2 rounded-full" style={{ backgroundColor: IUCN_SPECS[code].color }} aria-hidden="true" />
                <span className="font-mono text-xs font-medium">{code}</span>
                <span className="hidden sm:inline">{IUCN_SPECS[code].label}</span>
                <span className="font-mono text-xs text-fg-3">{iucnCounts[code]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-sm text-fg-3" aria-live="polite">
        Tìm thấy <span className="font-mono text-fg">{totalFiltered}</span> loài
      </p>
    </div>
  );
};
