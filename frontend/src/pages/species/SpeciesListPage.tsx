import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useSpeciesList } from '@/api/queries/useSpeciesQueries';
import { useProducts } from '@/api/queries/useProductQueries';
import { SpeciesHero } from './components/SpeciesHero';
import { SpeciesFilterBar, type BiologicalGroup, type SortOption } from './components/SpeciesFilterBar';
import { SpeciesMapView } from './components/SpeciesMapView';
import { SpeciesCard } from '@/components/domain/SpeciesCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { normalizeSearchString } from '@/components/navigation/QuickSearch';
import type { ConservationStatus } from '@/types/api';
import { AlertTriangle, RotateCcw, SearchX } from 'lucide-react';

const IUCN_WEIGHT: Record<ConservationStatus, number> = {
  CR: 5,
  EN: 4,
  VU: 3,
  NT: 2,
  LC: 1,
  EW: 0,
  EX: -1,
};

export const SpeciesListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Đọc các tham số lọc từ URL
  const queryParam = searchParams.get('q') || '';
  const groupParam = (searchParams.get('group') as BiologicalGroup) || 'all';
  const iucnParam = (searchParams.get('iucn') as ConservationStatus) || null;
  const sortParam = (searchParams.get('sort') as SortOption) || 'name_asc';
  const viewParam = (searchParams.get('view') as 'grid' | 'map') || 'grid';
  const nodeParam = searchParams.get('node');

  // ?node= lọc theo cả nhánh: API api/species?nodeId= tự gom mọi loài trong cây con
  const parsedNode = nodeParam ? Number(nodeParam) : NaN;
  const nodeFilter = Number.isInteger(parsedNode) && parsedNode > 0 ? parsedNode : undefined;

  // Nạp danh sách loài và sản phẩm
  const speciesQuery = useSpeciesList(nodeFilter ? { nodeId: nodeFilter } : undefined);
  const productsQuery = useProducts();

  const allSpecies = useMemo(() => speciesQuery.data || [], [speciesQuery.data]);
  const [mapSelection, setMapSelection] = useState<string | null>(null);

  // Bản đồ số lượng sản phẩm APPROVED cho từng loài
  const productCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    const approved = (productsQuery.data?.items || []).filter((p) => p.status === 'APPROVED');
    approved.forEach((p) => {
      counts[p.speciesId] = (counts[p.speciesId] || 0) + 1;
    });
    return counts;
  }, [productsQuery.data?.items]);

  // Đếm số lượng loài theo từng mức IUCN cho Ticker
  const iucnCounts = useMemo<Record<ConservationStatus, number>>(() => {
    const counts: Record<ConservationStatus, number> = {
      LC: 0,
      NT: 0,
      VU: 0,
      EN: 0,
      CR: 0,
      EW: 0,
      EX: 0,
    };
    allSpecies.forEach((s) => {
      if (counts[s.conservationStatus] !== undefined) {
        counts[s.conservationStatus]++;
      }
    });
    return counts;
  }, [allSpecies]);

  // Cập nhật tham số URL an toàn
  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === '' || val === 'all') {
        next.delete(key);
      } else {
        next.set(key, val);
      }
    });
    setSearchParams(next, { replace: true });
  };

  // Lọc và sắp xếp danh sách loài
  const filteredSpecies = useMemo(() => {
    return allSpecies
      .filter((sp) => {
        // 1. Lọc theo nhóm sinh học (lọc theo nhánh đã do API xử lý)
        if (groupParam !== 'all' && sp.group !== groupParam) {
          return false;
        }

        // 2. Lọc theo mức IUCN
        if (iucnParam && sp.conservationStatus !== iucnParam) {
          return false;
        }

        // 3. Lọc theo từ khóa tìm kiếm tiếng Việt không dấu NFD
        if (queryParam) {
          const q = normalizeSearchString(queryParam);
          const matchCommon = normalizeSearchString(sp.commonName).includes(q);
          const matchDisplay = normalizeSearchString(sp.displayName).includes(q);
          const matchScientific = normalizeSearchString(sp.scientificName).includes(q);
          const matchSlug = normalizeSearchString(sp.slug).includes(q);
          const matchPlace = normalizeSearchString(sp.origin.place).includes(q);

          if (!matchCommon && !matchDisplay && !matchScientific && !matchSlug && !matchPlace) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortParam === 'iucn_desc') {
          return (IUCN_WEIGHT[b.conservationStatus] || 0) - (IUCN_WEIGHT[a.conservationStatus] || 0);
        }
        if (sortParam === 'products_desc') {
          const countA = productCounts[a.id] || 0;
          const countB = productCounts[b.id] || 0;
          return countB - countA;
        }
        return a.displayName.localeCompare(b.displayName, 'vi');
      });
  }, [allSpecies, groupParam, iucnParam, queryParam, sortParam, productCounts]);

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const handleToggleIucn = (code: ConservationStatus) => {
    updateParams({ iucn: iucnParam === code ? null : code });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
      {/* Hero trang với 5 ô IUCN Ticker */}
      <SpeciesHero
        counts={iucnCounts}
        activeIucn={iucnParam}
        onToggleIucn={handleToggleIucn}
      />

      {/* Thanh lọc dính */}
      <SpeciesFilterBar
        query={queryParam}
        onQueryChange={(q) => updateParams({ q })}
        selectedGroup={groupParam}
        onGroupChange={(group) => updateParams({ group })}
        selectedIucn={iucnParam}
        onIucnChange={(iucn) => updateParams({ iucn })}
        selectedSort={sortParam}
        onSortChange={(sort) => updateParams({ sort })}
        viewMode={viewParam}
        onViewModeChange={(view) => updateParams({ view })}
        totalFiltered={filteredSpecies.length}
      />

      {/* Chế độ xem: Lưới thẻ loài vs Bản đồ 3D */}
      {speciesQuery.isLoading ? (
        <div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
          role="status"
          aria-label="Đang tải danh sách loài"
        >
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="aspect-[3/4] w-full rounded-2xl" />
          ))}
        </div>
      ) : speciesQuery.isError ? (
        <EmptyState
          icon={<AlertTriangle className="size-7" aria-hidden="true" />}
          title="Không tải được Bách khoa loài"
          description="Máy chủ BioNexus đang không phản hồi. Vui lòng kiểm tra kết nối rồi thử lại."
          action={{ label: 'Thử lại', onClick: () => void speciesQuery.refetch() }}
        />
      ) : filteredSpecies.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border border-line bg-surface p-12 text-center max-w-md mx-auto shadow-sm">
          <div className="flex size-14 items-center justify-center rounded-full bg-surface-2 text-accent mb-3 border border-line">
            <SearchX className="size-7 opacity-70" aria-hidden="true" />
          </div>
          <h3 className="text-base font-bold text-fg">Không có loài nào khớp với bộ lọc</h3>
          <p className="mt-1 text-xs text-fg-3 leading-relaxed">
            Thử nới lỏng các tiêu chí tìm kiếm hoặc xóa các mức bảo tồn đang chọn.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleResetFilters}
            className="mt-5 gap-2"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            Xóa toàn bộ lọc
          </Button>
        </div>
      ) : viewParam === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredSpecies.map((species) => (
            <SpeciesCard
              key={species.id}
              species={species}
              productCount={productCounts[species.id] || 0}
              simplifiedTaxonPath={`${species.group} › ${species.scientificName.split(' ')[0]}`}
            />
          ))}
        </div>
      ) : (
        <SpeciesMapView
          speciesList={filteredSpecies}
          // Lựa chọn cũ bị lọc mất thì quay về loài đầu tiên còn hiển thị
          selectedScientificName={
            filteredSpecies.some((s) => s.scientificName === mapSelection)
              ? mapSelection
              : (filteredSpecies[0]?.scientificName ?? null)
          }
          onSelectSpecies={setMapSelection}
          productCounts={productCounts}
        />
      )}
    </div>
  );
};

export default SpeciesListPage;
