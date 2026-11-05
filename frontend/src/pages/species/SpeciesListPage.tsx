import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { RotateCcw, SearchX, X } from 'lucide-react';
import { useSpeciesList } from '@/api/queries/useSpeciesQueries';
import { useAllApprovedProducts } from '@/api/queries/useProductQueries';
import { useTaxonomyDetail } from '@/api/queries/useTaxonomyQueries';
import { SpeciesFilterBar, type BiologicalGroup, type SortOption } from './components/SpeciesFilterBar';
import { SpeciesCard } from '@/components/domain/SpeciesCard';
import { QueryErrorState } from '@/components/domain/QueryErrorState';
import { PageContainer, PageHeader } from '@/components/layout/Page';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { normalizeSearchString } from '@/components/navigation/QuickSearch';
import type { ConservationStatus } from '@/types/api';

// Địa cầu 3D kéo theo three.js: chỉ tải khi người dùng chuyển sang chế độ bản đồ
const SpeciesMapView = React.lazy(() =>
  import('./components/SpeciesMapView').then((m) => ({ default: m.SpeciesMapView }))
);

// 633 thẻ ảnh render một lần làm trang giật; hiện từng đợt, bấm Xem thêm để tải tiếp
const PAGE_STEP = 24;

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
  const nodeQuery = useTaxonomyDetail(nodeFilter ?? 0, { enabled: Boolean(nodeFilter) });

  const speciesQuery = useSpeciesList(nodeFilter ? { nodeId: nodeFilter } : undefined);
  const productsQuery = useAllApprovedProducts();

  const allSpecies = useMemo(() => speciesQuery.data || [], [speciesQuery.data]);
  const [mapSelection, setMapSelection] = useState<string | null>(null);

  // Số cá thể đang bán của từng loài (sàn chỉ trả sản phẩm APPROVED)
  const productCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    (productsQuery.data || []).forEach((p) => {
      counts[p.speciesId] = (counts[p.speciesId] || 0) + 1;
    });
    return counts;
  }, [productsQuery.data]);

  // Shop của sản phẩm đầu tiên đang bán mỗi loài, để cung bay trên địa cầu về đúng trại nhân giống
  const shopBySpecies = useMemo(() => {
    const map: Record<number, string> = {};
    (productsQuery.data || []).forEach((p) => {
      if (!map[p.speciesId] && p.displayShopName) map[p.speciesId] = p.displayShopName;
    });
    return map;
  }, [productsQuery.data]);

  const iucnCounts = useMemo<Record<ConservationStatus, number>>(() => {
    const counts: Record<ConservationStatus, number> = { LC: 0, NT: 0, VU: 0, EN: 0, CR: 0, EW: 0, EX: 0 };
    allSpecies.forEach((s) => {
      if (counts[s.conservationStatus] !== undefined) counts[s.conservationStatus]++;
    });
    return counts;
  }, [allSpecies]);

  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === '' || val === 'all') next.delete(key);
      else next.set(key, val);
    });
    setSearchParams(next, { replace: true });
  };

  const filteredSpecies = useMemo(() => {
    return allSpecies
      .filter((sp) => {
        if (groupParam !== 'all' && sp.group !== groupParam) return false;
        if (iucnParam && sp.conservationStatus !== iucnParam) return false;
        if (queryParam) {
          // Tìm không phân biệt dấu trên tên thường, tên khoa học và nơi bản địa
          const q = normalizeSearchString(queryParam);
          const haystack = [sp.commonName, sp.displayName, sp.englishName, sp.scientificName, sp.slug, sp.origin.place];
          if (!haystack.some((text) => normalizeSearchString(text).includes(q))) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortParam === 'iucn_desc') {
          return (IUCN_WEIGHT[b.conservationStatus] || 0) - (IUCN_WEIGHT[a.conservationStatus] || 0);
        }
        if (sortParam === 'products_desc') {
          return (productCounts[b.id] || 0) - (productCounts[a.id] || 0);
        }
        return a.displayName.localeCompare(b.displayName, 'vi');
      });
  }, [allSpecies, groupParam, iucnParam, queryParam, sortParam, productCounts]);

  // Đổi bộ lọc thì quay về đợt đầu
  const filterKey = [groupParam, iucnParam, queryParam, sortParam, nodeFilter].join('|');
  const [paging, setPaging] = useState({ key: filterKey, count: PAGE_STEP });
  const visibleCount = paging.key === filterKey ? paging.count : PAGE_STEP;
  const visibleSpecies = filteredSpecies.slice(0, visibleCount);
  const remaining = filteredSpecies.length - visibleSpecies.length;

  const onSaleTotal = Object.values(productCounts).reduce((sum, n) => sum + n, 0);
  const branchNode = nodeFilter ? nodeQuery.data?.node : undefined;

  return (
    <PageContainer width="catalog" className="pb-20">
      <PageHeader
        eyebrow="Bách khoa loài"
        title="Mỗi loài, một hồ sơ"
        description="Tra cứu loài theo tên, nhóm sinh học hoặc mức bảo tồn IUCN. Mỗi hồ sơ có ảnh thật, khí hậu sống, nơi bản địa và cá thể nhân giống đang bán."
        meta={
          <>
            <span>
              <span className="font-mono text-fg">{allSpecies.length}</span> loài
            </span>
            <span>
              <span className="font-mono text-fg">{onSaleTotal}</span> cá thể đang bán
            </span>
            {nodeFilter && (
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 py-1 pr-1.5 pl-3 text-fg">
                <span>
                  Nhánh{' '}
                  <span className="font-semibold">{branchNode ? branchNode.scientificName : `#${nodeFilter}`}</span>
                </span>
                <button
                  type="button"
                  onClick={() => updateParams({ node: null })}
                  className="rounded-full p-1 text-fg-2 hover:bg-surface-2 hover:text-fg"
                  aria-label="Bỏ lọc theo nhánh phân loại"
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              </span>
            )}
          </>
        }
      />

      <SpeciesFilterBar
        query={queryParam}
        onQueryChange={(q) => updateParams({ q })}
        selectedGroup={groupParam}
        onGroupChange={(group) => updateParams({ group })}
        selectedIucn={iucnParam}
        onIucnChange={(iucn) => updateParams({ iucn })}
        iucnCounts={iucnCounts}
        selectedSort={sortParam}
        onSortChange={(sort) => updateParams({ sort })}
        viewMode={viewParam}
        onViewModeChange={(view) => updateParams({ view })}
        totalFiltered={filteredSpecies.length}
      />

      <div className="pt-8">
        {speciesQuery.isLoading ? (
          <div
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            role="status"
            aria-label="Đang tải danh sách loài"
          >
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton key={i} className="aspect-[4/5] w-full rounded-[20px]" />
            ))}
          </div>
        ) : speciesQuery.isError ? (
          <QueryErrorState
            title="Không tải được Bách khoa loài"
            error={speciesQuery.error}
            onRetry={() => void speciesQuery.refetch()}
            isRetrying={speciesQuery.isFetching}
          />
        ) : filteredSpecies.length === 0 ? (
          <EmptyState
            icon={<SearchX aria-hidden="true" />}
            title="Không có loài nào khớp bộ lọc"
            description="Thử bỏ bớt từ khóa, nhóm hoặc mức bảo tồn đang chọn."
          >
            <Button
              variant="secondary"
              pill
              onClick={() => setSearchParams(new URLSearchParams(), { replace: true })}
              className="gap-2"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Xóa toàn bộ lọc
            </Button>
          </EmptyState>
        ) : viewParam === 'grid' ? (
          <>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibleSpecies.map((species) => (
                <li key={species.id}>
                  <SpeciesCard species={species} productCount={productCounts[species.id] || 0} />
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-col items-center gap-3">
              <p className="text-sm text-fg-2" aria-live="polite">
                Đang hiện <span className="font-mono text-fg">{visibleSpecies.length}</span> /{' '}
                <span className="font-mono text-fg">{filteredSpecies.length}</span> loài
              </p>
              {remaining > 0 && (
                <Button variant="secondary" pill onClick={() => setPaging({ key: filterKey, count: visibleCount + PAGE_STEP })}>
                  Xem thêm {Math.min(PAGE_STEP, remaining)} loài
                </Button>
              )}
            </div>
          </>
        ) : (
          <React.Suspense
            fallback={<Skeleton className="h-[640px] w-full rounded-[20px]" role="status" aria-label="Đang tải bản đồ" />}
          >
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
              shopBySpecies={shopBySpecies}
            />
          </React.Suspense>
        )}
      </div>
    </PageContainer>
  );
};

export default SpeciesListPage;
