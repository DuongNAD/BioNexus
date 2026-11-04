import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Search, X, Compass, Layers, ShoppingBag, Dna, ArrowRight } from 'lucide-react';
import { APP_ROUTES } from '@/app/routes';
import { formatVnd } from '@/lib/parseEnvironmentSpecs';
import { useSpeciesList } from '@/api/queries/useSpeciesQueries';
import { useAllApprovedProducts } from '@/api/queries/useProductQueries';
import { useAuthState } from '@/api/queries/useAuthQueries';
import { IucnBadge } from '@/components/ui/IucnBadge';
import { Kbd } from '@/components/ui/Kbd';
import { cn } from '@/lib/cn';

export function normalizeSearchString(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, (m) => (m === 'đ' ? 'd' : 'D'))
    .toLowerCase()
    .trim();
}

export type QuickSearchCategory = 'species' | 'taxonomy' | 'product' | 'navigation';

export interface QuickSearchItem {
  id: string;
  category: QuickSearchCategory;
  categoryLabel: string;
  title: string;
  subtitle?: string;
  badge?: string;
  iucnCode?: string;
  imageUrl?: string;
  iconName?: 'species' | 'taxonomy' | 'product' | 'route';
  url: string;
  keywords: string[];
}

export interface QuickSearchProps {
  isOpen?: boolean;
  onClose?: () => void;
  /** Cần khi điều khiển từ ngoài để phím tắt ⌘K / Ctrl+K mở được bảng */
  onOpen?: () => void;
}

// Loài gợi ý khi chưa gõ gì: tra theo tên khoa học, không theo id
const FEATURED_SPECIES = ['Ambystoma mexicanum', 'Python regius', 'Nepenthes rajah'];
const RESULT_CAPS: Partial<Record<QuickSearchCategory, number>> = { species: 8, product: 6 };

export const QuickSearch: React.FC<QuickSearchProps> = ({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  onOpen: controlledOnOpen,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const setIsOpen = useCallback(
    (open: boolean) => {
      if (!isControlled) setInternalIsOpen(open);
      if (open) controlledOnOpen?.();
      else controlledOnClose?.();
    },
    [isControlled, controlledOnOpen, controlledOnClose]
  );

  // Bắt phím tắt toàn cục ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey) && !e.altKey) {
        // Điều khiển từ ngoài mà không có onOpen thì để trình duyệt tự xử lý phím
        if (isControlled && !isOpen && !controlledOnOpen) return;
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isControlled, controlledOnOpen, setIsOpen]);

  // Chỉ mount phần có dữ liệu khi mở: danh sách loài và sản phẩm tải ở lần mở đầu rồi dùng bộ đệm
  if (!isOpen) return null;
  return <QuickSearchDialog onRequestClose={() => setIsOpen(false)} />;
};

function QuickSearchDialog({ onRequestClose }: { onRequestClose: () => void }): React.JSX.Element {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const auth = useAuthState();
  const { data: speciesList = [] } = useSpeciesList();
  const { data: allProducts } = useAllApprovedProducts();

  // Kho dữ liệu tìm kiếm dựng từ API
  const allItems = useMemo<QuickSearchItem[]>(() => {
    const items: QuickSearchItem[] = [];

    // 1. Nhóm loài sinh vật
    speciesList.forEach((sp) => {
      items.push({
        id: `sp-${sp.id}`,
        category: 'species',
        categoryLabel: 'Bách khoa loài',
        title: sp.displayName,
        subtitle: `${sp.scientificName} · ${sp.englishName || sp.commonName}`,
        // Vật nuôi thuần hoá không có mức IUCN thật, không hiện huy hiệu giữ chỗ
        iucnCode: sp.isDomestic ? undefined : sp.conservationStatus,
        imageUrl: sp.cardPhoto,
        iconName: 'species',
        url: `/species/${sp.id}`,
        keywords: [sp.scientificName, sp.commonName, sp.displayName, sp.englishName, sp.slug, sp.group, sp.isDomestic ? 'vật nuôi' : sp.conservationStatus].filter(Boolean),
      });
    });

    // 2. Nhóm sản phẩm đang bán (API chỉ trả APPROVED)
    (allProducts ?? []).forEach((prod) => {
      items.push({
        id: `prod-${prod.id}`,
        category: 'product',
        categoryLabel: 'Cửa hàng',
        title: prod.productName,
        subtitle: `${prod.displayShopName} · ${formatVnd(prod.price)}`,
        badge: 'F2+',
        imageUrl: prod.displayImage,
        iconName: 'product',
        url: `/products/${prod.id}`,
        keywords: [prod.productName, prod.displayShopName, prod.speciesCommonName || '', prod.speciesScientificName || ''],
      });
    });

    // 3. Nhóm điều hướng: bỏ route dev, route có tham số và khu quản trị với người không phải admin
    APP_ROUTES.filter(
      (r) =>
        r.path !== '*' &&
        !r.path.includes(':') &&
        (!r.devOnly || import.meta.env.DEV) &&
        (r.access !== 'admin' || auth.accountType === 'ADMIN')
    ).forEach((route) => {
      items.push({
        id: `nav-${route.path}`,
        category: 'navigation',
        categoryLabel: 'Điều hướng',
        title: route.name,
        subtitle: route.description,
        badge: route.path,
        iconName: 'route',
        url: route.path,
        keywords: [route.name, route.title, route.description, route.path],
      });
    });

    return items;
  }, [speciesList, allProducts, auth.accountType]);

  const featuredSpeciesIds = useMemo(
    () => new Set(speciesList.filter((sp) => FEATURED_SPECIES.includes(sp.scientificName)).map((sp) => `sp-${sp.id}`)),
    [speciesList]
  );

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, []);

  // Lọc kết quả theo query NFD không dấu
  const filteredItems = useMemo(() => {
    const q = normalizeSearchString(query);
    if (!q) {
      // Hiển thị gợi ý nổi bật khi chưa nhập gì
      return allItems.filter(
        (item) =>
          item.id === 'nav-/' ||
          item.id === 'nav-/taxonomy' ||
          item.id === 'nav-/species' ||
          item.id === 'nav-/products' ||
          featuredSpeciesIds.has(item.id)
      );
    }

    const matched = allItems.filter((item) => {
      const matchTitle = normalizeSearchString(item.title).includes(q);
      const matchSub = item.subtitle ? normalizeSearchString(item.subtitle).includes(q) : false;
      const matchKeywords = item.keywords.some((kw) => normalizeSearchString(kw).includes(q));
      return matchTitle || matchSub || matchKeywords;
    });
    // Hơn 600 loài và 400 sản phẩm: chỉ hiện vài kết quả đầu mỗi nhóm, phần còn lại mở ở trang danh sách
    const seen: Partial<Record<QuickSearchCategory, number>> = {};
    const capped = matched.filter((item) => {
      const cap = RESULT_CAPS[item.category];
      if (!cap) return true;
      seen[item.category] = (seen[item.category] ?? 0) + 1;
      return seen[item.category]! <= cap;
    });
    const extra: QuickSearchItem[] = [];
    const speciesMatches = matched.filter((i) => i.category === 'species').length;
    const productMatches = matched.filter((i) => i.category === 'product').length;
    if (speciesMatches > RESULT_CAPS.species!) {
      extra.push({
        id: 'nav-more-species',
        category: 'navigation',
        categoryLabel: 'Điều hướng',
        title: `Xem cả ${speciesMatches} loài khớp "${query.trim()}"`,
        subtitle: 'Mở Bách khoa loài với từ khoá này',
        iconName: 'species',
        url: `/species?q=${encodeURIComponent(query.trim())}`,
        keywords: [],
      });
    }
    if (productMatches > RESULT_CAPS.product!) {
      extra.push({
        id: 'nav-more-products',
        category: 'navigation',
        categoryLabel: 'Điều hướng',
        title: `Xem cả ${productMatches} cá thể khớp "${query.trim()}"`,
        subtitle: 'Mở sàn sinh vật cảnh với từ khoá này',
        iconName: 'product',
        url: `/products?q=${encodeURIComponent(query.trim())}`,
        keywords: [],
      });
    }
    return [...capped, ...extra];
  }, [allItems, query, featuredSpeciesIds]);

  // Phân nhóm kết quả
  const groupedResults = useMemo(() => {
    const groups: { category: QuickSearchCategory; label: string; items: QuickSearchItem[] }[] = [];
    const catOrder: QuickSearchCategory[] = ['species', 'taxonomy', 'product', 'navigation'];
    const catLabels: Record<QuickSearchCategory, string> = {
      species: 'Loài sinh vật',
      taxonomy: 'Phân loại học',
      product: 'Cửa hàng sinh vật cảnh',
      navigation: 'Điều hướng hệ thống',
    };

    catOrder.forEach((cat) => {
      const items = filteredItems.filter((i) => i.category === cat);
      if (items.length > 0) {
        groups.push({
          category: cat,
          label: catLabels[cat],
          items,
        });
      }
    });

    return groups;
  }, [filteredItems]);

  // Mảng phẳng phục vụ điều hướng bàn phím
  const flatResults = useMemo(() => {
    return groupedResults.flatMap((g) => g.items);
  }, [groupedResults]);

  // Reset selectedIndex khi flatResults thay đổi
  useEffect(() => {
    setSelectedIndex(0);
  }, [flatResults.length]);

  // Giữ mục đang chọn trong khung nhìn khi di chuyển bằng phím
  useEffect(() => {
    const id = flatResults[selectedIndex]?.id;
    if (!id) return;
    document.getElementById('quicksearch-item-' + id)?.scrollIntoView?.({ block: 'nearest' });
  }, [selectedIndex, flatResults]);

  const handleSelect = (item: QuickSearchItem) => {
    onRequestClose();
    navigate(item.url);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (flatResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % flatResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + flatResults.length) % flatResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = flatResults[selectedIndex];
      if (selected) {
        handleSelect(selected);
      }
    }
  };

  const activeId = flatResults[selectedIndex]?.id;

  return (
    <DialogPrimitive.Root open onOpenChange={(open) => !open && onRequestClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md animate-in fade-in-0 duration-200" />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-[12%] -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] max-w-2xl rounded-2xl border border-line-strong bg-bg-raised/95 shadow-2xl backdrop-blur-2xl overflow-hidden focus:outline-none animate-in fade-in-0 zoom-in-95 duration-200"
          aria-describedby={undefined}
        >
          <DialogPrimitive.Title className="sr-only">Tìm kiếm nhanh BioNexus</DialogPrimitive.Title>
          {/* Ô nhập liệu tìm kiếm */}
          <div className="relative flex items-center border-b border-line px-4 py-3.5">
            <Search className="size-5 text-accent mr-3 shrink-0" aria-hidden="true" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập tên loài, sản phẩm hoặc trang..."
              role="combobox"
              aria-label="Tìm loài, sản phẩm hoặc trang"
              aria-expanded={true}
              aria-controls="quicksearch-results-list"
              aria-activedescendant={activeId ? 'quicksearch-item-' + activeId : undefined}
              aria-autocomplete="list"
              className="w-full bg-transparent text-sm text-fg placeholder:text-fg-3 focus:outline-none"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 rounded-full text-fg-3 hover:text-fg hover:bg-surface-hover"
                aria-label="Xóa nội dung tìm kiếm"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            ) : (
              <Kbd className="hidden sm:inline-block">ESC</Kbd>
            )}
          </div>

          {/* Danh sách kết quả phân nhóm */}
          <div
            id="quicksearch-results-list"
            ref={listRef}
            role="listbox"
            aria-label="Kết quả tìm kiếm"
            className="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-line"
          >
            {flatResults.length === 0 ? (
              <div className="p-8 text-center text-xs text-fg-3">
                <p className="font-semibold text-fg-2">Không tìm thấy kết quả phù hợp cho &quot;{query}&quot;</p>
                <p className="mt-1">Thử tìm kiếm với tên khoa học hoặc chuyển sang duyệt Cây phân loại.</p>
              </div>
            ) : (
              groupedResults.map((group) => (
                <div key={group.category} className="mb-3">
                  <div className="px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider text-accent font-semibold">
                    {group.label} ({group.items.length})
                  </div>

                  {group.items.map((item) => {
                    const globalIdx = flatResults.findIndex((x) => x.id === item.id);
                    const isSelected = globalIdx === selectedIndex;

                    return (
                      <div
                        key={item.id}
                        role="option"
                        id={`quicksearch-item-${item.id}`}
                        aria-selected={isSelected}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                        className={cn(
                          'group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 cursor-pointer text-xs transition-colors',
                          isSelected ? 'bg-surface-2 text-fg border border-accent/40 shadow-sm' : 'text-fg-2 hover:bg-surface'
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Thumbnail hoặc Icon đại diện */}
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt=""
                              aria-hidden="true"
                              className="size-9 rounded-lg object-cover border border-line shrink-0"
                            />
                          ) : (
                            <div className="flex size-9 items-center justify-center rounded-lg bg-surface-2 border border-line text-accent shrink-0">
                              {item.category === 'taxonomy' && <Layers className="size-4" />}
                              {item.category === 'navigation' && <Compass className="size-4" />}
                              {item.category === 'species' && <Dna className="size-4" />}
                              {item.category === 'product' && <ShoppingBag className="size-4" />}
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <p className={cn('font-semibold truncate text-fg', isSelected && 'text-accent')}>
                              {item.title}
                            </p>
                            {item.subtitle && (
                              <p className="text-[11px] text-fg-3 truncate">{item.subtitle}</p>
                            )}
                          </div>
                        </div>

                        {/* Huy hiệu IUCN hoặc Rank hoặc Action Arrow */}
                        <div className="flex items-center gap-2 shrink-0">
                          {item.iucnCode && <IucnBadge code={item.iucnCode} size="sm" />}
                          {item.badge && (
                            <span className="rounded-md border border-line bg-surface-2 px-2 py-0.5 text-[10px] font-mono text-fg-3">
                              {item.badge}
                            </span>
                          )}
                          <ArrowRight
                            aria-hidden="true"
                            className={cn(
                              'size-3.5 text-fg-3 transition-transform',
                              isSelected && 'translate-x-0.5 text-accent'
                            )}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Thanh hướng dẫn phím dưới đáy */}
          <div className="flex items-center justify-between border-t border-line bg-surface px-4 py-2.5 text-[11px] text-fg-3">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd>
                <span>Di chuyển</span>
              </span>
              <span className="flex items-center gap-1">
                <Kbd>↵</Kbd>
                <span>Chọn</span>
              </span>
              <span className="flex items-center gap-1">
                <Kbd>ESC</Kbd>
                <span>Đóng</span>
              </span>
            </div>

            <span>{flatResults.length} kết quả</span>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

// Máy Apple dùng ⌘, Windows và Linux dùng Ctrl: hiện sai phím thì người dùng bấm không ra
function isApplePlatform(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent);
}

/** Nút mở tìm kiếm: chỉ có icon khi header chật, có chữ từ màn rộng xl. Phím tắt vẫn chạy nhưng không hiện nhãn cho header gọn */
export const QuickSearchTrigger: React.FC<{ onClick?: () => void; className?: string }> = ({
  onClick,
  className = '',
}) => {
  const shortcut = isApplePlatform() ? '⌘K' : 'Ctrl K';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Mở tìm kiếm nhanh (${shortcut.replace(' ', '+')})`}
      className={cn(
        'group flex h-9 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-line bg-surface-2/60 text-sm text-fg-2 transition-colors hover:border-accent/40 hover:bg-surface-hover hover:text-fg max-xl:w-9 xl:w-52 xl:justify-start xl:px-3.5',
        className
      )}
    >
      <span className="flex items-center gap-2">
        <Search className="size-4 text-accent" aria-hidden="true" />
        <span className="hidden xl:inline">Tìm loài, sản phẩm</span>
      </span>
    </button>
  );
};
