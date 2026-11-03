import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router';
import { Search, RotateCcw, SlidersHorizontal, ArrowRight, ShieldCheck, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Slider } from '@/components/ui/Slider';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Ticker } from '@/components/ui/Ticker';
import { ProductCard } from '@/components/domain/ProductCard';
import { triggerFlyToCart } from '@/components/domain/FlyToCart';
import { QueryErrorState } from '@/components/domain/QueryErrorState';
import { useProducts } from '@/api/queries/useProductQueries';
import { useSpeciesList } from '@/api/queries/useSpeciesQueries';
import { useAuthState } from '@/api/queries/useAuthQueries';
import { useAddToCart } from '@/api/mutations/useCartMutations';
import { formatVnd } from '@/lib/parseEnvironmentSpecs';
import { SPECIES_EXTRAS } from '@/content/species-extras';
import { toast } from 'sonner';
import type { ConservationStatus } from '@/types/api';
import type { SpeciesViewModel } from '@/api/adapters';

const BIOLOGICAL_GROUPS = ['Tất cả', 'Bò sát', 'Lưỡng cư', 'Cây ăn thịt'] as const;
type BiologicalGroup = (typeof BIOLOGICAL_GROUPS)[number];

const IUCN_OPTIONS: { code: ConservationStatus; color: string; label: string }[] = [
  { code: 'LC', color: '#60c659', label: 'Ít quan tâm' },
  { code: 'NT', color: '#cce226', label: 'Sắp bị đe dọa' },
  { code: 'VU', color: '#f9e814', label: 'Sắp nguy cấp' },
  { code: 'EN', color: '#fc7f3f', label: 'Nguy cấp' },
  { code: 'CR', color: '#d81e05', label: 'Cực kỳ nguy cấp' },
];

export default function ProductsPage(): React.JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const auth = useAuthState();
  const addToCartMutation = useAddToCart();

  // Đọc params từ URL
  const querySearch = searchParams.get('q') || '';
  const querySpeciesId = searchParams.get('speciesId') ? Number(searchParams.get('speciesId')) : undefined;
  const queryGroup = (searchParams.get('group') as BiologicalGroup) || 'Tất cả';
  const queryMinPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : 0;
  const queryMaxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : 5000000;
  const queryInStock = searchParams.get('inStock') === 'true';
  const queryIucn = searchParams.get('iucn') ? searchParams.get('iucn')!.split(',') : [];
  const querySort = searchParams.get('sort') || 'newest';
  const queryPage = searchParams.get('page') ? Number(searchParams.get('page')) : 1;

  // Local state cho debounce search & UI
  const [searchInput, setSearchInput] = useState(querySearch);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Queries
  const { data: speciesList = [] } = useSpeciesList();

  // Lấy trang lớn nhất hợp đồng cho phép (size ≤ 48) rồi lọc giá/nhóm/IUCN ở client (ghi trong HANDOFF)
  const {
    data: productsData,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useProducts({
    speciesId: querySpeciesId,
    q: querySearch || undefined,
    size: 48,
  });

  const allProducts = productsData?.items || [];
  const totalOnSale = productsData?.total ?? allProducts.length;

  // Đồng bộ search input khi URL thay đổi
  useEffect(() => {
    setSearchInput(querySearch);
  }, [querySearch]);

  // Cập nhật URL search params
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
          // Reset về trang 1 khi lọc tiêu chí mới (trừ khi đang đổi trang)
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

  // Debounce tìm kiếm từ khóa
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== querySearch) {
        updateFilters({ q: searchInput || null });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, querySearch, updateFilters]);

  // Bộ lọc nâng cao phía client (giá, nhóm sinh học, tồn kho, IUCN, sắp xếp)
  const filteredProducts = useMemo(() => {
    let list = [...allProducts];

    // 1. Nhóm sinh học
    if (queryGroup !== 'Tất cả') {
      list = list.filter((p) => {
        if (!p.speciesScientificName) return false;
        const extra = SPECIES_EXTRAS[p.speciesScientificName];
        return extra?.group === queryGroup;
      });
    }

    // 2. Khoảng giá
    list = list.filter((p) => p.price >= queryMinPrice && p.price <= queryMaxPrice);

    // 3. Chỉ còn hàng
    if (queryInStock) {
      list = list.filter((p) => p.isAvailable);
    }

    // 4. Mức bảo tồn IUCN
    if (queryIucn.length > 0) {
      list = list.filter((p) => p.conservationStatus && queryIucn.includes(p.conservationStatus));
    }

    // 5. Sắp xếp
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
  }, [allProducts, queryGroup, queryMinPrice, queryMaxPrice, queryInStock, queryIucn, querySort]);

  // Phân trang
  const pageSize = 9;
  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (queryPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, queryPage]);

  // 3 Sản phẩm Featured tuyển chọn (2:1:1 layout)
  const featuredItems = useMemo(() => {
    return allProducts.slice(0, 3);
  }, [allProducts]);

  // Reset bộ lọc
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
          toast.success(`Đã thêm "${product?.productName || 'Cá thể'}" vào giỏ hàng`);
        },
        onError: (err) => {
          toast.error(err.message || 'Không thể thêm vào giỏ hàng');
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-bg text-fg">
      {/* 1. Hero & Ticker & Định vị thương hiệu */}
      <section className="relative overflow-hidden border-b border-line bg-bg-raised py-12 md:py-16">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full bg-accent/5 blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-3 py-1 text-xs font-mono text-accent mb-4 backdrop-blur-md">
                <ShieldCheck className="size-3.5" aria-hidden="true" />
                <span>100% Nhân giống nhân tạo F2+ · CITES</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-fg font-sans">
                Sàn Sinh Vật Cảnh
              </h1>
              <p className="mt-3 text-sm md:text-base text-fg-2 max-w-xl leading-relaxed">
                Mọi cá thể đều có hồ sơ kiểm định sinh học, nguồn gốc trang trại hợp pháp và được bảo hộ theo quy chế bảo tồn BioNexus.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="rounded-2xl border border-line bg-surface-1/70 backdrop-blur-md p-4 text-center min-w-[140px]">
                <span className="block text-xs text-fg-3 uppercase tracking-wider">Đang mở bán</span>
                <div className="text-3xl font-bold text-accent font-mono mt-0.5">
                  <Ticker value={totalOnSale} duration={800} />
                </div>
                <span className="text-xs text-fg-3 font-sans">sản phẩm đã kiểm duyệt</span>
              </div>

              <div className="flex flex-col gap-2">
                <Link
                  to="/taxonomy"
                  className="inline-flex items-center gap-1.5 text-xs text-fg-2 hover:text-accent transition-colors font-medium"
                >
                  <span>Cây phân loại 6 cấp</span>
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
                <Link
                  to="/species"
                  className="inline-flex items-center gap-1.5 text-xs text-fg-2 hover:text-accent transition-colors font-medium"
                >
                  <span>Bách khoa toàn thư loài</span>
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>

          {/* Dải nổi bật 3 cá thể tuyển chọn (2:1:1 layout) */}
          {featuredItems.length >= 3 && featuredItems[0] && (
            <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Ô lớn bên trái (chiếm 6/12 hoặc 7/12 cột) */}
              <Link
                to={`/products/${featuredItems[0]!.id}`}
                className="lg:col-span-6 relative block aspect-[16/10] md:aspect-[16/9] lg:aspect-auto lg:h-[360px] rounded-2xl overflow-hidden border border-line bg-surface-2 group shadow-xl focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
              >
                <img
                  src={featuredItems[0]!.displayImage}
                  alt={featuredItems[0]!.productName}
                  className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-deep/95 via-bg-deep/40 to-transparent" />
                <div className="absolute top-4 left-4 z-10">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-black/60 px-3 py-1 text-xs font-mono text-accent backdrop-blur-md">
                    <Sparkles className="size-3.5" aria-hidden="true" /> Tuyển chọn sinh quyển
                  </span>
                </div>
                <div className="absolute bottom-5 left-5 right-5 z-10">
                  <span className="text-xs text-accent font-mono block mb-1">
                    {featuredItems[0]!.displayShopName}
                  </span>
                  <h3 className="text-xl md:text-2xl font-bold text-fg group-hover:text-accent transition-colors">
                    {featuredItems[0]!.productName}
                  </h3>
                  {featuredItems[0]!.speciesScientificName && (
                    <p className="text-xs italic text-fg-2 font-serif mb-2">
                      {featuredItems[0]!.speciesScientificName}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                    <span className="text-lg font-bold text-accent font-mono">
                      {formatVnd(featuredItems[0]!.price)}
                    </span>
                    <span
                      className="inline-flex h-8 items-center rounded-full bg-accent px-3 text-xs font-semibold text-accent-ink"
                      aria-hidden="true"
                    >
                      Khám phá cá thể →
                    </span>
                  </div>
                </div>
              </Link>

              {/* 2 Ô nhỏ bên phải (mỗi ô 3/12 cột hoặc xếp chồng) */}
              <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {featuredItems.slice(1, 3).map((item) => (
                  <Link
                    key={item.id}
                    to={`/products/${item.id}`}
                    className="relative aspect-[4/3] lg:aspect-auto lg:h-[360px] rounded-2xl overflow-hidden border border-line bg-surface-2 group shadow-xl flex flex-col justify-end p-5 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
                  >
                    <img
                      src={item.displayImage}
                      alt={item.productName}
                      className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-deep/95 via-bg-deep/40 to-transparent" />
                    <div className="relative z-10">
                      <span className="text-[11px] text-accent font-mono block">
                        {item.displayShopName}
                      </span>
                      <h4 className="text-base font-bold text-fg line-clamp-1 group-hover:text-accent transition-colors">
                        {item.productName}
                      </h4>
                      <p className="text-xs font-mono font-semibold text-fg-2 mt-1">
                        {formatVnd(item.price)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. Thân trang: Cột lọc dính + Lưới sản phẩm */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* CỘT LỌC DESKTOP (3/12 cột, Dính) */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-24 rounded-2xl border border-line bg-surface-1/60 backdrop-blur-xl p-5 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-line/60 pb-3">
              <h2 className="font-semibold text-fg text-sm uppercase tracking-wider">
                Bộ lọc tìm kiếm
              </h2>
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-xs text-fg-3 hover:text-accent transition-colors"
                title="Đặt lại toàn bộ bộ lọc"
              >
                <RotateCcw className="size-3" aria-hidden="true" />
                <span>Đặt lại</span>
              </button>
            </div>

            {/* Ô tìm kiếm từ khóa */}
            <div>
              <label htmlFor="search-input" className="block text-xs font-medium text-fg-2 mb-1.5">
                Tìm kiếm từ khóa
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-fg-3" aria-hidden="true" />
                <Input
                  id="search-input"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Tên cá thể hoặc tên loài..."
                  className="pl-9 pr-8 text-xs"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      updateFilters({ q: null });
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-fg-3 hover:text-fg"
                    aria-label="Xóa từ khóa tìm kiếm"
                  >
                    <X className="size-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>

            {/* Chip lọc Nhóm sinh học */}
            <div>
              <span className="block text-xs font-medium text-fg-2 mb-2">Nhóm sinh học</span>
              <div className="flex flex-wrap gap-1.5">
                {BIOLOGICAL_GROUPS.map((grp) => {
                  const isSelected = queryGroup === grp;
                  return (
                    <button
                      key={grp}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => updateFilters({ group: grp === 'Tất cả' ? null : grp })}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-accent text-accent-ink font-semibold shadow-sm'
                          : 'bg-surface-2 text-fg-2 hover:bg-surface-hover hover:text-fg border border-line/60'
                      }`}
                    >
                      {grp}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Combobox chọn loài */}
            <div>
              <label htmlFor="species-select" className="block text-xs font-medium text-fg-2 mb-1.5">
                Loài sinh học
              </label>
              <Select
                id="species-select"
                value={querySpeciesId ? String(querySpeciesId) : ''}
                onChange={(e) => updateFilters({ speciesId: e.target.value ? Number(e.target.value) : null })}
                options={[
                  { label: 'Tất cả các loài', value: '' },
                  ...speciesList.map((s: SpeciesViewModel) => ({
                    label: `${s.commonName} (${s.scientificName})`,
                    value: String(s.id),
                  })),
                ]}
                className="text-xs"
              />
            </div>

            {/* Thanh trượt khoảng giá */}
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-fg-2 mb-2">
                <span>Khoảng giá</span>
                <span className="font-mono text-accent text-[11px]">
                  {formatVnd(queryMinPrice)} – {formatVnd(queryMaxPrice)}
                </span>
              </div>
              <Slider
                value={[queryMinPrice, queryMaxPrice]}
                min={0}
                max={5000000}
                step={50000}
                onValueChange={([min, max]) => updateFilters({ minPrice: min, maxPrice: max })}
              />
              <div className="grid grid-cols-3 gap-1 mt-3">
                <button
                  type="button"
                  onClick={() => updateFilters({ minPrice: 0, maxPrice: 500000 })}
                  className="rounded border border-line bg-surface-2 px-1 py-1 text-[10px] text-fg-2 hover:text-accent hover:border-accent transition-colors text-center"
                >
                  Dưới 500k
                </button>
                <button
                  type="button"
                  onClick={() => updateFilters({ minPrice: 500000, maxPrice: 1500000 })}
                  className="rounded border border-line bg-surface-2 px-1 py-1 text-[10px] text-fg-2 hover:text-accent hover:border-accent transition-colors text-center"
                >
                  500k – 1.5tr
                </button>
                <button
                  type="button"
                  onClick={() => updateFilters({ minPrice: 1500000, maxPrice: 5000000 })}
                  className="rounded border border-line bg-surface-2 px-1 py-1 text-[10px] text-fg-2 hover:text-accent hover:border-accent transition-colors text-center"
                >
                  Trên 1.5tr
                </button>
              </div>
            </div>

            {/* Checkbox chỉ còn hàng */}
            <div className="pt-2 border-t border-line/60">
              <label className="flex items-center gap-2 text-xs font-medium text-fg cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={queryInStock}
                  onChange={(e) => updateFilters({ inStock: e.target.checked || null })}
                  className="size-4 rounded border-line bg-surface text-accent focus:ring-accent"
                />
                <span>Chỉ hiển thị cá thể còn hàng</span>
              </label>
            </div>

            {/* Bộ lọc mức IUCN */}
            <div className="pt-2 border-t border-line/60">
              <span className="block text-xs font-medium text-fg-2 mb-2">Bậc bảo tồn IUCN</span>
              <div className="flex flex-wrap gap-1.5">
                {IUCN_OPTIONS.map((item) => {
                  const isChecked = queryIucn.includes(item.code);
                  return (
                    <button
                      key={item.code}
                      type="button"
                      aria-pressed={isChecked}
                      aria-label={`${item.code} · ${item.label}`}
                      onClick={() => {
                        const nextIucn = isChecked
                          ? queryIucn.filter((c) => c !== item.code)
                          : [...queryIucn, item.code];
                        updateFilters({ iucn: nextIucn.length > 0 ? nextIucn.join(',') : null });
                      }}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono transition-all border ${
                        isChecked
                          ? 'border-accent bg-accent/15 text-accent font-bold'
                          : 'border-line/60 bg-surface-2 text-fg-3 hover:text-fg'
                      }`}
                    >
                      <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} aria-hidden="true" />
                      <span>{item.code}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* KHU VỰC LƯỚI SẢN PHẨM & TOOLBAR (9/12 cột) */}
          {/* Đã nằm trong <main> của RootLayout nên dùng section, không lồng <main> */}
          <section aria-label="Danh sách sinh vật cảnh" className="col-span-12 lg:col-span-9 space-y-6">
            {/* Toolbar sắp xếp và đếm kết quả */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-line bg-surface-1/40 backdrop-blur-md p-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-fg" aria-live="polite">
                  Hiển thị <span className="text-accent font-mono">{filteredProducts.length}</span> sản phẩm
                </span>

                {/* Mobile Filter Button */}
                <Button
                  size="sm"
                  variant="secondary"
                  className="lg:hidden ml-auto gap-1.5 text-xs"
                  onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                  aria-expanded={isMobileFilterOpen}
                >
                  <SlidersHorizontal className="size-3.5" aria-hidden="true" />
                  <span>Bộ lọc</span>
                </Button>
              </div>

              {/* Hộp chọn sắp xếp */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-fg-3 shrink-0" aria-hidden="true">Sắp xếp:</span>
                <Select
                  aria-label="Sắp xếp sản phẩm"
                  value={querySort}
                  onChange={(e) => updateFilters({ sort: e.target.value })}
                  options={[
                    { label: 'Mới nhất (Mặc định)', value: 'newest' },
                    { label: 'Giá: Thấp đến Cao', value: 'price_asc' },
                    { label: 'Giá: Cao đến Thấp', value: 'price_desc' },
                    { label: 'Tồn kho nhiều nhất', value: 'stock_desc' },
                  ]}
                  className="text-xs w-48"
                />
              </div>
            </div>

            {/* Mobile Filter Drawer (Khi bật trên mobile) */}
            {isMobileFilterOpen && (
              <div className="lg:hidden rounded-2xl border border-accent/30 bg-surface-1 p-5 space-y-4 shadow-2xl animate-in slide-in-from-top-4">
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <span className="font-bold text-sm text-accent">Bộ lọc trên di động</span>
                  <button
                    type="button"
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="text-fg-3 hover:text-fg"
                    aria-label="Đóng bộ lọc"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                </div>

                {/* Nhóm sinh học mobile */}
                <div className="flex flex-wrap gap-1.5">
                  {BIOLOGICAL_GROUPS.map((grp) => (
                    <button
                      key={grp}
                      type="button"
                      aria-pressed={queryGroup === grp}
                      onClick={() => updateFilters({ group: grp === 'Tất cả' ? null : grp })}
                      className={`px-3 py-1 rounded-full text-xs ${
                        queryGroup === grp
                          ? 'bg-accent text-accent-ink font-semibold'
                          : 'bg-surface-2 text-fg-2'
                      }`}
                    >
                      {grp}
                    </button>
                  ))}
                </div>

                {/* In stock mobile */}
                <label className="flex items-center gap-2 text-xs font-medium text-fg">
                  <input
                    type="checkbox"
                    checked={queryInStock}
                    onChange={(e) => updateFilters({ inStock: e.target.checked || null })}
                    className="size-4 rounded text-accent"
                  />
                  <span>Chỉ còn hàng</span>
                </label>

                <Button
                  size="sm"
                  variant="primary"
                  className="w-full text-xs"
                  onClick={() => setIsMobileFilterOpen(false)}
                >
                  Áp dụng bộ lọc
                </Button>
              </div>
            )}

            {/* Lưới sản phẩm */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-line bg-surface p-4 space-y-3">
                    <Skeleton className="aspect-[4/5] w-full rounded-xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-8 w-full rounded-lg" />
                  </div>
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
                icon={<Search className="size-8 text-accent" />}
                title="Không tìm thấy sinh vật cảnh phù hợp"
                description="Hãy thử nới lỏng khoảng giá, bỏ bớt mức IUCN hoặc tìm kiếm với từ khóa khác."
                action={{
                  label: 'Xóa toàn bộ bộ lọc',
                  onClick: handleResetFilters,
                }}
              >
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-fg-3">
                  <span>Gợi ý từ khóa:</span>
                  {['Gecko', 'Axolotl', 'Nắp ấm', 'Trăn bóng'].map((kw) => (
                    <button
                      key={kw}
                      type="button"
                      onClick={() => {
                        setSearchInput(kw);
                        updateFilters({ q: kw });
                      }}
                      className="rounded-full border border-line px-2.5 py-0.5 text-accent hover:border-accent transition-colors"
                    >
                      {kw}
                    </button>
                  ))}
                </div>
              </EmptyState>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleQuickAdd}
                  />
                ))}
              </div>
            )}

            {/* Phân trang */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-8">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={queryPage <= 1}
                  onClick={() => updateFilters({ page: queryPage - 1 })}
                >
                  Trước
                </Button>

                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pNum = idx + 1;
                  const isActive = pNum === queryPage;
                  return (
                    <button
                      key={pNum}
                      type="button"
                      aria-label={`Trang ${pNum}`}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={() => updateFilters({ page: pNum })}
                      className={`size-8 rounded-lg text-xs font-mono font-semibold transition-colors ${
                        isActive
                          ? 'bg-accent text-accent-ink shadow-md'
                          : 'border border-line bg-surface text-fg-2 hover:border-accent hover:text-fg'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}

                <Button
                  size="sm"
                  variant="secondary"
                  disabled={queryPage >= totalPages}
                  onClick={() => updateFilters({ page: queryPage + 1 })}
                >
                  Sau
                </Button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
