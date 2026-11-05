import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router';
import { Search, RotateCcw, SlidersHorizontal, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Slider } from '@/components/ui/Slider';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageContainer, PageHeader, Panel, Eyebrow } from '@/components/layout/Page';
import { ProductCard } from '@/components/domain/ProductCard';
import { triggerFlyToCart } from '@/components/domain/FlyToCart';
import { QueryErrorState } from '@/components/domain/QueryErrorState';
import { useAllApprovedProducts } from '@/api/queries/useProductQueries';
import { useSpeciesList } from '@/api/queries/useSpeciesQueries';
import { useAuthState } from '@/api/queries/useAuthQueries';
import { useAddToCart } from '@/api/mutations/useCartMutations';
import { formatVnd } from '@/lib/parseEnvironmentSpecs';
import { cn } from '@/lib/cn';
import { toast } from 'sonner';
import type { ConservationStatus } from '@/types/api';
import type { SpeciesViewModel } from '@/api/adapters';
import { normalizeSearchString } from '@/components/navigation/QuickSearch';

const BIOLOGICAL_GROUPS = [
  'Tất cả',
  'Bò sát',
  'Lưỡng cư',
  'Cá cảnh',
  'Động vật không xương sống',
  'Thú cưng',
  'Chim',
  'Cây ăn thịt',
  'Cây cảnh',
] as const;
type BiologicalGroup = (typeof BIOLOGICAL_GROUPS)[number];

const IUCN_OPTIONS: { code: ConservationStatus; color: string; label: string }[] = [
  { code: 'LC', color: '#60c659', label: 'Ít quan tâm' },
  { code: 'NT', color: '#cce226', label: 'Sắp bị đe dọa' },
  { code: 'VU', color: '#f9e814', label: 'Sắp nguy cấp' },
  { code: 'EN', color: '#fc7f3f', label: 'Nguy cấp' },
  { code: 'CR', color: '#d81e05', label: 'Cực kỳ nguy cấp' },
];

const PRICE_PRESETS: { label: string; min: number; max: number }[] = [
  { label: 'Dưới 500 nghìn', min: 0, max: 500000 },
  { label: '500 nghìn – 1,5 triệu', min: 500000, max: 1500000 },
  // Infinity: tới mức giá cao nhất đang bán
  { label: 'Trên 1,5 triệu', min: 1500000, max: Infinity },
];

const PAGE_SIZE = 12;

/** Dãy nút trang rút gọn: luôn có trang đầu, trang cuối và hai trang quanh trang hiện tại */
function pageWindow(current: number, total: number): Array<number | 'gap'> {
  const pages = new Set([1, total, current - 1, current, current + 1].filter((p) => p >= 1 && p <= total));
  const sorted = [...pages].sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1]! > 1 ? ['gap' as const, p] : [p]));
}

function chipClass(active: boolean): string {
  return cn(
    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
    active ? 'border-accent bg-accent/15 font-semibold text-accent' : 'border-line text-fg-2 hover:border-line-strong hover:text-fg'
  );
}

interface FilterFieldsProps {
  idPrefix: string;
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onClearSearch: () => void;
  group: BiologicalGroup;
  speciesId?: number;
  speciesList: SpeciesViewModel[];
  minPrice: number;
  maxPrice: number;
  /** Trần thanh trượt giá: giá cao nhất đang bán, làm tròn lên triệu */
  priceCeiling: number;
  inStock: boolean;
  iucn: string[];
  updateFilters: (updates: Record<string, string | number | boolean | null | undefined>) => void;
}

/** Các ô lọc dùng chung cho cột trái (desktop) và tấm lọc gập (mobile) */
function FilterFields({
  idPrefix,
  searchInput,
  onSearchInputChange,
  onClearSearch,
  group,
  speciesId,
  speciesList,
  minPrice,
  maxPrice,
  priceCeiling,
  inStock,
  iucn,
  updateFilters,
}: FilterFieldsProps): React.JSX.Element {
  return (
    <div className="divide-y divide-line [&>*]:py-5 [&>*:first-child]:pt-0 [&>*:last-child]:pb-0">
      <div>
        <label htmlFor={`${idPrefix}-search`} className="mb-2 block text-sm font-medium text-fg-2">
          Tìm theo tên
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fg-3" aria-hidden="true" />
          <Input
            id={`${idPrefix}-search`}
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
            placeholder="Tên cá thể hoặc tên loài"
            className="pr-9 pl-9"
          />
          {searchInput && (
            <button
              type="button"
              onClick={onClearSearch}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-1 text-fg-3 hover:text-fg"
              aria-label="Xóa từ khóa tìm kiếm"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <fieldset>
        <legend className="mb-3 text-sm font-medium text-fg-2">Nhóm sinh vật</legend>
        <div className="flex flex-wrap gap-2">
          {BIOLOGICAL_GROUPS.map((grp) => (
            <button
              key={grp}
              type="button"
              aria-pressed={group === grp}
              onClick={() => updateFilters({ group: grp === 'Tất cả' ? null : grp })}
              className={chipClass(group === grp)}
            >
              {grp}
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <Select
          id={`${idPrefix}-species`}
          label="Loài"
          value={speciesId ? String(speciesId) : ''}
          onChange={(e) => updateFilters({ speciesId: e.target.value ? Number(e.target.value) : null })}
          options={[
            { label: 'Tất cả các loài', value: '' },
            ...speciesList.map((s) => ({ label: `${s.displayName} (${s.scientificName})`, value: String(s.id) })),
          ]}
        />
      </div>

      <fieldset>
        <legend className="mb-1 text-sm font-medium text-fg-2">Khoảng giá</legend>
        <p className="mb-3 font-mono text-sm text-fg">
          {formatVnd(minPrice)} – {formatVnd(maxPrice)}
        </p>
        <Slider
          aria-label="Khoảng giá"
          value={[minPrice, maxPrice]}
          min={0}
          max={priceCeiling}
          step={50000}
          // Kéo hết về trần thì bỏ lọc giá trên để cá thể đắt hơn trần cũ vẫn hiện
          onValueChange={([min, max]) => updateFilters({ minPrice: min || null, maxPrice: max !== undefined && max < priceCeiling ? max : null })}
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {PRICE_PRESETS.map((preset) => {
            const presetMax = Number.isFinite(preset.max) ? preset.max : priceCeiling;
            const active = minPrice === preset.min && maxPrice === presetMax;
            return (
              <button
                key={preset.label}
                type="button"
                aria-pressed={active}
                onClick={() => updateFilters({ minPrice: preset.min || null, maxPrice: Number.isFinite(preset.max) ? preset.max : null })}
                className={chipClass(active)}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-sm font-medium text-fg-2">Mức bảo tồn IUCN</legend>
        <div className="flex flex-wrap gap-2">
          {IUCN_OPTIONS.map((item) => {
            const isChecked = iucn.includes(item.code);
            return (
              <button
                key={item.code}
                type="button"
                aria-pressed={isChecked}
                aria-label={`${item.code}, ${item.label}`}
                title={item.label}
                onClick={() => {
                  const next = isChecked ? iucn.filter((c) => c !== item.code) : [...iucn, item.code];
                  updateFilters({ iucn: next.length > 0 ? next.join(',') : null });
                }}
                className={chipClass(isChecked)}
              >
                <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} aria-hidden="true" />
                <span className="font-mono">{item.code}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label className="flex cursor-pointer items-center gap-3 text-sm text-fg select-none">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => updateFilters({ inStock: e.target.checked || null })}
            className="size-4 rounded border-line bg-surface accent-[var(--accent)]"
          />
          <span>Chỉ hiện cá thể còn hàng</span>
        </label>
      </div>
    </div>
  );
}

export default function ProductsPage(): React.JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const auth = useAuthState();
  const addToCartMutation = useAddToCart();

  // Đọc bộ lọc từ URL để chia sẻ và quay lại được
  const querySearch = searchParams.get('q') || '';
  const querySpeciesId = searchParams.get('speciesId') ? Number(searchParams.get('speciesId')) : undefined;
  const queryGroup = (searchParams.get('group') as BiologicalGroup) || 'Tất cả';
  const queryMinPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : 0;
  const queryMaxPriceParam = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : null;
  const queryInStock = searchParams.get('inStock') === 'true';
  const queryIucn = useMemo(() => (searchParams.get('iucn') ? searchParams.get('iucn')!.split(',') : []), [searchParams]);
  const querySort = searchParams.get('sort') || 'newest';
  const queryPage = searchParams.get('page') ? Number(searchParams.get('page')) : 1;

  const [searchInput, setSearchInput] = useState(querySearch);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const { data: allSpecies = [] } = useSpeciesList();

  // Tải đủ mọi trang sản phẩm APPROVED rồi lọc giá/nhóm/IUCN ở client vì API chưa có các bộ lọc này (ghi trong HANDOFF)
  const { data: productsData, isLoading, isError, error, refetch, isRefetching } = useAllApprovedProducts();

  const allProducts = useMemo(() => productsData || [], [productsData]);
  const totalOnSale = allProducts.length;
  const priceCeiling = useMemo(
    () => Math.max(5000000, Math.ceil(allProducts.reduce((m, p) => Math.max(m, p.price), 0) / 1000000) * 1000000),
    [allProducts]
  );
  const queryMaxPrice = queryMaxPriceParam ?? priceCeiling;
  const groupBySpecies = useMemo(() => new Map(allSpecies.map((s) => [s.scientificName, s.group])), [allSpecies]);
  // Ô chọn loài chỉ liệt kê loài đang có cá thể bán (trong nhóm đang lọc), thay vì cả bách khoa
  const speciesList = useMemo(() => {
    const onSale = new Set(allProducts.map((p) => p.speciesId));
    return allSpecies
      .filter((s) => onSale.has(s.id) && (queryGroup === 'Tất cả' || s.group === queryGroup))
      .sort((a, b) => a.displayName.localeCompare(b.displayName, 'vi'));
  }, [allSpecies, allProducts, queryGroup]);

  useEffect(() => {
    setSearchInput(querySearch);
  }, [querySearch]);

  const updateFilters = useCallback(
    (updates: Record<string, string | number | boolean | null | undefined>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(updates).forEach(([key, val]) => {
            if (val === null || val === undefined || val === '' || val === false) {
              next.delete(key);
            } else {
              next.set(key, String(val));
            }
          });
          // Đổi tiêu chí lọc thì quay về trang 1
          if (!('page' in updates)) {
            next.set('page', '1');
          }
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  // Đợi người dùng gõ xong mới đổi URL
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== querySearch) {
        updateFilters({ q: searchInput || null });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, querySearch, updateFilters]);

  const filteredProducts = useMemo(() => {
    let list = [...allProducts];

    if (querySpeciesId) list = list.filter((p) => p.speciesId === querySpeciesId);

    if (querySearch) {
      const q = normalizeSearchString(querySearch);
      list = list.filter((p) =>
        [p.productName, p.speciesCommonName, p.speciesScientificName, p.displayShopName].some((t) => t && normalizeSearchString(t).includes(q))
      );
    }

    if (queryGroup !== 'Tất cả') {
      list = list.filter((p) => !!p.speciesScientificName && groupBySpecies.get(p.speciesScientificName) === queryGroup);
    }

    list = list.filter((p) => p.price >= queryMinPrice && p.price <= queryMaxPrice);

    if (queryInStock) {
      list = list.filter((p) => p.isAvailable);
    }

    if (queryIucn.length > 0) {
      list = list.filter((p) => p.conservationStatus && queryIucn.includes(p.conservationStatus));
    }

    switch (querySort) {
      case 'price_asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'stock_desc':
        list.sort((a, b) => b.stockQuantity - a.stockQuantity);
        break;
      case 'newest':
      default:
        list.sort((a, b) => b.id - a.id);
        break;
    }

    return list;
  }, [allProducts, querySpeciesId, querySearch, groupBySpecies, queryGroup, queryMinPrice, queryMaxPrice, queryInStock, queryIucn, querySort]);

  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE) || 1;
  // URL cũ có thể trỏ quá trang cuối sau khi lọc
  const currentPage = Math.min(Math.max(1, queryPage), totalPages);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, currentPage]);
  const goToPage = (page: number) => {
    updateFilters({ page });
    document.getElementById('product-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const activeFilterCount =
    (queryGroup !== 'Tất cả' ? 1 : 0) +
    (querySpeciesId ? 1 : 0) +
    (queryMinPrice > 0 || queryMaxPriceParam !== null ? 1 : 0) +
    (queryInStock ? 1 : 0) +
    queryIucn.length +
    (querySearch ? 1 : 0);

  const handleResetFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const handleQuickAdd = (productId: number, event: React.MouseEvent<HTMLButtonElement>) => {
    const product = allProducts.find((p) => p.id === productId);

    // Khách thì mời đăng nhập thay vì gửi request (401) và chạy hiệu ứng bay vào giỏ giả
    if (!auth.token) {
      toast.info('Đăng nhập để thêm cá thể vào giỏ hàng', {
        action: {
          label: 'Đăng nhập',
          onClick: () => navigate(`/login?next=${encodeURIComponent('/products')}`),
        },
      });
      return;
    }
    if (auth.accountType !== 'USER') {
      toast.error('Tài khoản quản trị không dùng được giỏ hàng.');
      return;
    }

    triggerFlyToCart(event, product?.displayImage);
    addToCartMutation.mutate(
      { productId, quantity: 1 },
      {
        onSuccess: () => {
          toast.success(`Đã thêm "${product?.productName || 'cá thể'}" vào giỏ hàng`);
        },
        onError: (err) => {
          toast.error(err.message || 'Không thể thêm vào giỏ hàng');
        },
      }
    );
  };

  const filterProps: Omit<FilterFieldsProps, 'idPrefix'> = {
    searchInput,
    onSearchInputChange: setSearchInput,
    onClearSearch: () => {
      setSearchInput('');
      updateFilters({ q: null });
    },
    group: queryGroup,
    speciesId: querySpeciesId,
    speciesList,
    minPrice: queryMinPrice,
    maxPrice: queryMaxPrice,
    priceCeiling,
    inStock: queryInStock,
    iucn: queryIucn,
    updateFilters,
  };

  return (
    <PageContainer width="catalog">
      <PageHeader
        eyebrow="Sàn sinh vật cảnh"
        title="Cá thể nhân giống đang bán"
        description="Mọi cá thể trên sàn đều nhân giống F2+ và được kiểm duyệt trước khi mở bán. Lọc theo nhóm, giá hoặc mức bảo tồn để tìm loài phù hợp với bạn."
        meta={
          <>
            <span>
              <span className="font-mono text-fg">{totalOnSale}</span> cá thể đang bán
            </span>
            <Link to="/species" className="inline-flex items-center gap-1 text-accent hover:underline">
              Tra cứu bách khoa loài
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-8 pb-20 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12">
        {/* Cột lọc desktop: không bọc hộp, các nhóm ngăn bằng đường kẻ mảnh */}
        <aside aria-label="Bộ lọc" className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
          <div className="mb-5 flex items-center justify-between">
            <Eyebrow tone="muted">Bộ lọc</Eyebrow>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 text-sm text-fg-3 transition-colors hover:text-accent"
              >
                <RotateCcw className="size-3.5" aria-hidden="true" />
                Đặt lại
              </button>
            )}
          </div>
          <FilterFields idPrefix="filter-desktop" {...filterProps} />
        </aside>

        <section id="product-results" aria-label="Danh sách sinh vật cảnh" className="min-w-0 scroll-mt-24">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <p className="text-sm text-fg-2" aria-live="polite">
              <span className="font-mono text-fg">{filteredProducts.length}</span> kết quả
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                pill
                variant="secondary"
                className="gap-1.5 lg:hidden"
                onClick={() => setIsMobileFilterOpen((open) => !open)}
                aria-expanded={isMobileFilterOpen}
                aria-controls="mobile-product-filters"
              >
                <SlidersHorizontal className="size-3.5" aria-hidden="true" />
                Bộ lọc{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
              </Button>
              <div className="w-44 sm:w-52">
                <Select
                  aria-label="Sắp xếp sản phẩm"
                  value={querySort}
                  onChange={(e) => updateFilters({ sort: e.target.value })}
                  options={[
                    { label: 'Mới nhất', value: 'newest' },
                    { label: 'Giá thấp đến cao', value: 'price_asc' },
                    { label: 'Giá cao đến thấp', value: 'price_desc' },
                    { label: 'Còn nhiều hàng nhất', value: 'stock_desc' },
                  ]}
                />
              </div>
            </div>
          </div>

          {isMobileFilterOpen && (
            <Panel id="mobile-product-filters" className="mb-6 lg:hidden">
              <FilterFields idPrefix="filter-mobile" {...filterProps} />
              <div className="mt-6 flex gap-3">
                <Button variant="secondary" pill className="flex-1" onClick={handleResetFilters}>
                  Đặt lại
                </Button>
                <Button pill className="flex-1" onClick={() => setIsMobileFilterOpen(false)}>
                  Xem {filteredProducts.length} kết quả
                </Button>
              </div>
            </Panel>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 md:gap-6" role="status" aria-label="Đang tải sản phẩm">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/5] w-full rounded-[20px]" />
              ))}
            </div>
          ) : isError ? (
            <QueryErrorState
              title="Không tải được sàn sinh vật cảnh"
              error={error}
              onRetry={() => refetch()}
              isRetrying={isRefetching}
            />
          ) : filteredProducts.length === 0 ? (
            <EmptyState
              icon={<Search aria-hidden="true" />}
              title="Không tìm thấy sinh vật cảnh phù hợp"
              description="Hãy nới khoảng giá, bỏ bớt mức IUCN hoặc thử một từ khóa khác."
              action={{ label: 'Xóa toàn bộ bộ lọc', onClick: handleResetFilters }}
            >
              <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-fg-3">
                <span>Gợi ý:</span>
                {['Gecko', 'Axolotl', 'Nắp ấm', 'Trăn bóng'].map((kw) => (
                  <button
                    key={kw}
                    type="button"
                    onClick={() => {
                      setSearchInput(kw);
                      updateFilters({ q: kw });
                    }}
                    className={chipClass(false)}
                  >
                    {kw}
                  </button>
                ))}
              </div>
            </EmptyState>
          ) : (
            // 12 cá thể mỗi trang: 4 cột ở màn rộng vẫn đủ 3 hàng chẵn
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 md:gap-6">
              {paginatedProducts.map((product) => (
                <li key={product.id}>
                  <ProductCard product={product} onAddToCart={handleQuickAdd} />
                </li>
              ))}
            </ul>
          )}

          {totalPages > 1 && !isLoading && !isError && (
            <nav aria-label="Phân trang" className="mt-10 flex flex-wrap items-center justify-center gap-2">
              <Button
                size="sm"
                pill
                variant="secondary"
                disabled={currentPage <= 1}
                onClick={() => goToPage(currentPage - 1)}
              >
                Trước
              </Button>
              {pageWindow(currentPage, totalPages).map((pNum, idx) => {
                if (pNum === 'gap') {
                  return (
                    <span key={`gap-${idx}`} className="px-1 text-fg-3" aria-hidden="true">
                      …
                    </span>
                  );
                }
                const isActive = pNum === currentPage;
                return (
                  <button
                    key={pNum}
                    type="button"
                    aria-label={`Trang ${pNum}`}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => goToPage(pNum)}
                    className={cn(
                      'size-9 rounded-full font-mono text-sm transition-colors',
                      isActive ? 'bg-accent font-semibold text-accent-ink' : 'text-fg-2 hover:bg-surface hover:text-fg'
                    )}
                  >
                    {pNum}
                  </button>
                );
              })}
              <Button
                size="sm"
                pill
                variant="secondary"
                disabled={currentPage >= totalPages}
                onClick={() => goToPage(currentPage + 1)}
              >
                Sau
              </Button>
            </nav>
          )}
        </section>
      </div>
    </PageContainer>
  );
}
