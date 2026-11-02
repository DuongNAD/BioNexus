import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Search, X, Compass, Layers, ShoppingBag, Dna, ArrowRight } from 'lucide-react';
import { SEED_SPECIES } from '@/mocks/data/species';
import { SEED_TAXONOMY } from '@/mocks/data/taxonomy';
import { SEED_PRODUCTS } from '@/mocks/data/products';
import { APP_ROUTES } from '@/app/routes';
import { formatVnd } from '@/lib/parseEnvironmentSpecs';
import { extractNames, SPECIES_EXTRAS } from '@/api/adapters';
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
}

export const QuickSearch: React.FC<QuickSearchProps> = ({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const setIsOpen = (open: boolean) => {
    if (!isControlled) {
      setInternalIsOpen(open);
    }
    if (!open && controlledOnClose) {
      controlledOnClose();
    }
  };

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Bắt phím tắt toàn cục ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Tự động focus vào input khi mở modal
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Chuẩn bị kho dữ liệu tổng hợp
  const allItems = useMemo<QuickSearchItem[]>(() => {
    const items: QuickSearchItem[] = [];

    // 1. Nhóm Loài sinh vật (9 loài)
    SEED_SPECIES.forEach((sp) => {
      const { displayName, englishName } = extractNames(sp.commonName);
      const extra = SPECIES_EXTRAS[sp.scientificName];
      const photoUrl = extra ? `photos/${extra.slug}/hero-960.webp` : (sp.imageURL || undefined);

      items.push({
        id: `sp-${sp.id}`,
        category: 'species',
        categoryLabel: 'Bách khoa loài',
        title: displayName,
        subtitle: `${sp.scientificName} · ${englishName || sp.commonName}`,
        iucnCode: sp.conservationStatus,
        imageUrl: photoUrl || undefined,
        iconName: 'species',
        url: `/species/${sp.id}`,
        keywords: [
          sp.scientificName,
          sp.commonName,
          displayName,
          englishName,
          extra?.slug || '',
          extra?.group || '',
          sp.conservationStatus,
        ].filter(Boolean),
      });
    });

    // 2. Nhóm Cây phân loại (26 nút)
    SEED_TAXONOMY.forEach((node) => {
      items.push({
        id: `tax-${node.id}`,
        category: 'taxonomy',
        categoryLabel: 'Phân loại học',
        title: node.scientificName,
        subtitle: `${node.rank}: ${node.commonName}`,
        badge: `${node.rank}`,
        iconName: 'taxonomy',
        url: `/taxonomy/${node.id}`,
        keywords: [node.scientificName, node.commonName, node.rank],
      });
    });

    // 3. Nhóm Sản phẩm đang bán APPROVED (7 sản phẩm)
    SEED_PRODUCTS.filter((p) => p.status === 'APPROVED').forEach((prod) => {
      items.push({
        id: `prod-${prod.id}`,
        category: 'product',
        categoryLabel: 'Cửa hàng',
        title: prod.productName,
        subtitle: `${prod.shopName || 'BioGreen Exotic'} · ${formatVnd(prod.price)}`,
        badge: 'F2+',
        imageUrl: prod.imageUrl || 'photos/product-placeholder.webp',
        iconName: 'product',
        url: `/products/${prod.id}`,
        keywords: [prod.productName, prod.shopName || '', String(prod.price)],
      });
    });

    // 4. Nhóm Điều hướng hệ thống
    APP_ROUTES.filter((r) => r.path !== '*' && !r.path.includes(':')).forEach((route) => {
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
          item.id === 'sp-1' ||
          item.id === 'sp-3' ||
          item.id === 'sp-4'
      );
    }

    return allItems.filter((item) => {
      const matchTitle = normalizeSearchString(item.title).includes(q);
      const matchSub = item.subtitle ? normalizeSearchString(item.subtitle).includes(q) : false;
      const matchKeywords = item.keywords.some((kw) => normalizeSearchString(kw).includes(q));
      return matchTitle || matchSub || matchKeywords;
    });
  }, [allItems, query]);

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

  const handleSelect = (item: QuickSearchItem) => {
    setIsOpen(false);
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
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md animate-in fade-in-0 duration-200" />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-[12%] -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] max-w-2xl rounded-2xl border border-line-strong bg-bg-raised/95 shadow-2xl backdrop-blur-2xl overflow-hidden focus:outline-none animate-in fade-in-0 zoom-in-95 duration-200"
          role="dialog"
          aria-modal="true"
          aria-label="Tìm kiếm nhanh BioNexus"
        >
          {/* Ô nhập liệu tìm kiếm */}
          <div className="relative flex items-center border-b border-line px-4 py-3.5">
            <Search className="size-5 text-accent mr-3 shrink-0" aria-hidden="true" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập tên loài, chi, họ, sản phẩm hoặc trang..."
              role="combobox"
              aria-expanded={isOpen}
              aria-controls="quicksearch-results-list"
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
                <X className="size-4" />
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
                            className={cn(
                              'size-3.5 text-fg-mute transition-transform',
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
};

export const QuickSearchTrigger: React.FC<{ onClick?: () => void; className?: string }> = ({
  onClick,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Mở tìm kiếm nhanh (Ctrl+K)"
      className={cn(
        'group flex items-center justify-between rounded-full border border-line bg-surface-2/60 px-3 py-1.5 text-xs text-fg-3 transition-all hover:border-accent/40 hover:bg-surface-hover hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Search className="size-3.5 text-accent" />
        <span className="hidden sm:inline">Tìm kiếm nhanh...</span>
        <span className="sm:hidden">Tìm...</span>
      </div>
      <Kbd className="ml-2 hidden md:inline-block">⌘K</Kbd>
    </button>
  );
};
