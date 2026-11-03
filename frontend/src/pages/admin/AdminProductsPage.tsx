import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import {
  PackageCheck,
  Search,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  ExternalLink,
  Store,
  BookOpen,
  RotateCw,
} from 'lucide-react';
import { useAdminProducts } from '@/api/queries/useAdminQueries';
import { useSpeciesList } from '@/api/queries/useSpeciesQueries';
import { useModerateProduct } from '@/api/mutations/useAdminMutations';
import { PRODUCT_PLACEHOLDER_IMAGE } from '@/api/adapters';
import { StatusPill } from '@/components/ui/StatusPill';
import { IucnBadge } from '@/components/ui/IucnBadge';
import { Kbd } from '@/components/ui/Kbd';
import { Price } from '@/components/ui/Price';
import { LensMagnifier } from '@/components/domain/LensMagnifier';
import { ClimateBar } from '@/components/domain/ClimateBar';
import { HumidityGauge } from '@/components/domain/HumidityGauge';
import { parseEnvironmentSpecs } from '@/lib/parseEnvironmentSpecs';
import { SPECIES_EXTRAS } from '@/content/species-extras';
import { PHOTOS } from '@/content/photos';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import type { ProductViewModel } from '@/api/adapters';
import type { ProductStatus } from '@/types/api';

const REJECTION_REASONS = [
  { id: 'MISIDENTIFIED_SPECIES', title: 'Phân loại sai loài', desc: 'Cá thể không khớp với loài bách khoa đã khai báo (sai hình thái hoặc morph).' },
  { id: 'WILD_POACHED_SUSPICION', title: 'Nghi vấn săn bắt tự nhiên', desc: 'Cá thể có dấu hiệu hoang dã, thương tật tự nhiên hoặc thuộc loài cấm nuôi thương mại.' },
  { id: 'MISSING_DOCUMENTATION', title: 'Thiếu chứng nhận F2+ CITES', desc: 'Hồ sơ thiếu mã số cấp phép trại nuôi nhân tạo thế hệ F2 theo Nghị định 06/2019/NĐ-CP.' },
  { id: 'POOR_MEDIA_QUALITY', title: 'Ảnh chụp mờ nhòe', desc: 'Ảnh chụp không rõ ràng hình thái vảy, màu sắc hoặc thiếu góc chụp thẩm định.' },
  { id: 'OTHER', title: 'Lý do khác', desc: 'Ghi rõ căn cứ từ chối ở ô ghi chú bên dưới.' },
];

// Tài liệu 01 mục 7: không render quá 50 dòng một lúc
const PAGE_SIZE = 50;

const STATUS_TABS: { id: ProductStatus | 'ALL'; label: string }[] = [
  { id: 'PENDING', label: 'Chờ duyệt' },
  { id: 'APPROVED', label: 'Đã duyệt' },
  { id: 'REJECTED', label: 'Từ chối' },
  { id: 'SOLD_OUT', label: 'Hết hàng' },
  { id: 'ALL', label: 'Tất cả' },
];

const IUCN_LABEL_VI: Record<string, string> = {
  LC: 'Ít quan tâm',
  NT: 'Sắp bị đe dọa',
  VU: 'Sắp nguy cấp',
  EN: 'Nguy cấp',
  CR: 'Cực kỳ nguy cấp',
  EW: 'Tuyệt chủng ngoài tự nhiên',
  EX: 'Tuyệt chủng',
};

/** Phím tắt không được chạy khi người dùng đang gõ chữ */
function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable);
}

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

export default function AdminProductsPage(): React.JSX.Element {
  const { data, isLoading, isError, refetch } = useAdminProducts();
  const { data: speciesData } = useSpeciesList();
  const moderateProductMutation = useModerateProduct();
  const allProducts = useMemo(() => data ?? [], [data]);
  const speciesList = useMemo(() => speciesData ?? [], [speciesData]);

  // State
  const [selectedStatus, setSelectedStatus] = useState<ProductStatus | 'ALL'>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const listRef = useRef<HTMLUListElement>(null);

  // Modal states
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [selectedReasonId, setSelectedReasonId] = useState(REJECTION_REASONS[0]?.id || 'MISIDENTIFIED_SPECIES');
  const [customReasonNote, setCustomReasonNote] = useState('');

  // Lọc sản phẩm (memo để effect tự chọn không chạy mỗi lần render)
  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allProducts.filter((product) => {
      if (selectedStatus !== 'ALL' && product.status !== selectedStatus) return false;
      if (!q) return true;
      return (
        product.productName.toLowerCase().includes(q) ||
        (product.speciesCommonName || '').toLowerCase().includes(q) ||
        (product.speciesScientificName || '').toLowerCase().includes(q) ||
        product.displayShopName.toLowerCase().includes(q)
      );
    });
  }, [allProducts, selectedStatus, searchQuery]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [selectedStatus, searchQuery]);

  // Tự động chọn sản phẩm đầu tiên
  useEffect(() => {
    if (filteredProducts.length === 0) {
      setSelectedProductId(null);
      return;
    }
    if (!filteredProducts.some((p) => p.id === selectedProductId)) {
      setSelectedProductId(filteredProducts[0]!.id);
    }
  }, [filteredProducts, selectedProductId]);

  const currentProduct: ProductViewModel | undefined = allProducts.find((p) => p.id === selectedProductId);

  // Loài bách khoa đối chiếu: khớp theo speciesId lấy từ cùng nguồn dữ liệu API
  const matchedSpecies = currentProduct ? speciesList.find((s) => s.id === currentProduct.speciesId) : undefined;
  const speciesExtra = matchedSpecies ? SPECIES_EXTRAS[matchedSpecies.scientificName] : undefined;

  // Ảnh chuẩn của loài (Wikimedia Commons, có ghi công)
  const scientificPhoto =
    (speciesExtra?.heroPhotoId ? PHOTOS[speciesExtra.heroPhotoId] : undefined) ||
    (speciesExtra?.portraitPhotoId ? PHOTOS[speciesExtra.portraitPhotoId] : undefined);
  const scientificImageUrl =
    scientificPhoto?.sources.webp[scientificPhoto.sources.webp.length - 1]?.src ||
    scientificPhoto?.sources.jpg ||
    matchedSpecies?.heroPhoto ||
    PRODUCT_PLACEHOLDER_IMAGE;

  const parsedSpecs = matchedSpecies
    ? parseEnvironmentSpecs(matchedSpecies.environmentSpecs)
    : { tempMin: null, tempMax: null, raw: '' };

  const counts = useMemo(
    () => ({
      PENDING: allProducts.filter((p) => p.status === 'PENDING').length,
      APPROVED: allProducts.filter((p) => p.status === 'APPROVED').length,
      REJECTED: allProducts.filter((p) => p.status === 'REJECTED').length,
      SOLD_OUT: allProducts.filter((p) => p.status === 'SOLD_OUT').length,
      ALL: allProducts.length,
    }),
    [allProducts]
  );

  // Điều hướng J/K
  const selectNext = useCallback(() => {
    const currentIndex = filteredProducts.findIndex((p) => p.id === selectedProductId);
    const nextItem = filteredProducts[currentIndex + 1];
    if (nextItem) {
      setSelectedProductId(nextItem.id);
      if (currentIndex + 1 >= visibleCount) setVisibleCount((c) => c + PAGE_SIZE);
    }
  }, [filteredProducts, selectedProductId, visibleCount]);

  const selectPrev = useCallback(() => {
    const currentIndex = filteredProducts.findIndex((p) => p.id === selectedProductId);
    const prevItem = currentIndex > 0 ? filteredProducts[currentIndex - 1] : undefined;
    if (prevItem) setSelectedProductId(prevItem.id);
  }, [filteredProducts, selectedProductId]);

  // Phím tắt J/K/A/R/?: bỏ qua khi đang gõ chữ hoặc có phím bổ trợ (Ctrl+R vẫn là tải lại trang)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
      // Đang mở hộp thoại thì chỉ nghe Esc (dự phòng cho Radix khi focus nằm ngoài dialog)
      if (isApproveOpen || isRejectOpen || isHelpOpen) {
        if (e.key === 'Escape') {
          setIsApproveOpen(false);
          setIsRejectOpen(false);
          setIsHelpOpen(false);
        }
        return;
      }
      if (isTypingTarget(e.target)) return;

      // Mũi tên chỉ đổi cá thể khi focus nằm trong hàng đợi, để không chặn cuộn trang
      const focusInList = !!listRef.current && listRef.current.contains(document.activeElement);

      if (e.key === 'j' || e.key === 'J' || (e.key === 'ArrowDown' && focusInList)) {
        e.preventDefault();
        selectNext();
      } else if (e.key === 'k' || e.key === 'K' || (e.key === 'ArrowUp' && focusInList)) {
        e.preventDefault();
        selectPrev();
      } else if (e.key === 'a' || e.key === 'A') {
        if (currentProduct?.status === 'PENDING') {
          e.preventDefault();
          setIsApproveOpen(true);
        }
      } else if (e.key === 'r' || e.key === 'R') {
        if (currentProduct?.status === 'PENDING') {
          e.preventDefault();
          setCustomReasonNote('');
          setIsRejectOpen(true);
        }
      } else if (e.key === '?') {
        e.preventDefault();
        setIsHelpOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectNext, selectPrev, currentProduct, isApproveOpen, isRejectOpen, isHelpOpen]);

  // Giữ cá thể đang chọn trong khung nhìn khi đổi bằng bàn phím
  useEffect(() => {
    if (selectedProductId == null || !listRef.current) return;
    const row = listRef.current.querySelector<HTMLElement>(`[data-product-id="${selectedProductId}"]`);
    row?.scrollIntoView?.({ block: 'nearest' });
  }, [selectedProductId]);

  const handleApprove = async () => {
    if (!currentProduct) return;
    try {
      await moderateProductMutation.mutateAsync({ productId: currentProduct.id, status: 'APPROVED' });
      setIsApproveOpen(false);
      toast.success(`Đã duyệt "${currentProduct.productName}". Sản phẩm đã hiện trên Sàn.`);
    } catch (err) {
      toast.error(errorMessage(err, 'Không duyệt được sản phẩm này'));
    }
  };

  const handleReject = async () => {
    if (!currentProduct) return;
    const selectedReason = REJECTION_REASONS.find((r) => r.id === selectedReasonId);
    const note = customReasonNote.trim();
    const reasonText =
      selectedReasonId === 'OTHER' ? note : `${selectedReason?.title}: ${selectedReason?.desc}${note ? ` (${note})` : ''}`;

    if (reasonText.length < 5) {
      toast.error('Vui lòng chọn hoặc nhập lý do từ chối cụ thể');
      return;
    }

    try {
      await moderateProductMutation.mutateAsync({ productId: currentProduct.id, status: 'REJECTED', reason: reasonText });
      setIsRejectOpen(false);
      toast.success(`Đã từ chối "${currentProduct.productName}".`);
    } catch (err) {
      toast.error(errorMessage(err, 'Không từ chối được sản phẩm này'));
    }
  };

  const speciesLabel = (prod: ProductViewModel) =>
    prod.speciesCommonName || matchedSpeciesName(speciesList, prod.speciesId) || `Loài #${prod.speciesId}`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Header Trang */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent mb-1.5">
            <PackageCheck className="size-3.5" aria-hidden="true" />
            <span>Đối chiếu khai báo của người bán với mẫu chuẩn bách khoa</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-fg font-sans">
            Kiểm duyệt Sinh vật cảnh Đăng bán
          </h1>
          <p className="text-xs md:text-sm text-fg-3">
            Đặt ảnh sản phẩm cạnh ảnh chuẩn của loài khai báo để kiểm tra có đúng loài không.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsHelpOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-fg-2 hover:text-fg hover:border-line-strong transition-colors self-start sm:self-auto"
        >
          <HelpCircle className="size-3.5 text-accent" aria-hidden="true" />
          <span>Phím tắt</span>
          <Kbd>?</Kbd>
        </button>
      </div>

      {/* 2. Hàng đợi trái, khối đối chiếu phải */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[700px]">
        <div className="lg:col-span-4 rounded-2xl border border-line bg-surface/90 backdrop-blur-xl p-4 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-1 pb-2 border-b border-line/60" role="group" aria-label="Lọc theo trạng thái">
            {STATUS_TABS.map((tab) => {
              const isActive = selectedStatus === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setSelectedStatus(tab.id)}
                  className={`rounded-xl px-2 py-1 text-xs font-semibold transition-all flex items-center gap-1 ${
                    isActive
                      ? 'bg-accent text-accent-ink shadow-[var(--glow-accent-btn)]'
                      : 'border border-line bg-surface text-fg-2 hover:border-line-strong hover:text-fg'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-1.5 text-[10px] font-mono font-bold ${
                      isActive ? 'bg-black/20 text-accent-ink' : 'bg-surface-2 text-fg-3'
                    }`}
                  >
                    {counts[tab.id]}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-fg-3" aria-hidden="true" />
            <input
              type="search"
              aria-label="Tìm sản phẩm trong hàng đợi"
              placeholder="Tìm theo tên cá thể, loài, shop..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-line bg-bg-deep/60 pl-9 pr-4 py-2 text-xs text-fg placeholder:text-fg-3 focus:border-accent focus:outline-none"
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-1 max-h-[600px]">
            {isLoading ? (
              <div className="flex h-40 items-center justify-center text-accent text-xs" role="status">
                <span>Đang tải danh sách sản phẩm...</span>
              </div>
            ) : isError ? (
              <div role="alert" className="rounded-xl border border-danger/40 bg-danger/10 p-6 text-center text-xs text-danger space-y-3">
                <p>Không tải được hàng đợi sản phẩm.</p>
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-danger/40 px-3 py-1.5 font-semibold hover:bg-danger/15"
                >
                  <RotateCw className="size-3.5" aria-hidden="true" />
                  <span>Thử lại</span>
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-xl border border-line/40 bg-bg-deep/40 p-8 text-center text-fg-3 text-xs">
                <PackageCheck className="size-8 mx-auto mb-2 opacity-40" aria-hidden="true" />
                <p>Không có sản phẩm nào trong hàng đợi này.</p>
              </div>
            ) : (
              <>
                <ul ref={listRef} className="space-y-2" aria-label="Hàng đợi sản phẩm">
                  <AnimatePresence initial={false}>
                    {visibleProducts.map((prod) => {
                      const isSelected = prod.id === selectedProductId;
                      return (
                        <motion.li
                          key={prod.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: prod.status === 'APPROVED' ? 40 : -40 }}
                          transition={{ duration: 0.15 }}
                        >
                          <button
                            type="button"
                            data-product-id={prod.id}
                            aria-pressed={isSelected}
                            onClick={() => setSelectedProductId(prod.id)}
                            className={`group w-full text-left rounded-xl border p-3 transition-all duration-150 relative flex gap-3 ${
                              isSelected
                                ? 'border-accent bg-accent/10'
                                : 'border-line/60 bg-bg-deep/40 hover:border-line-strong hover:bg-surface-hover'
                            }`}
                          >
                            {isSelected && (
                              <span className="absolute left-0 top-2 bottom-2 w-1 bg-accent rounded-r" aria-hidden="true" />
                            )}

                            <span className="size-14 rounded-lg overflow-hidden bg-bg-raised shrink-0 border border-line">
                              {/* Ảnh minh họa cạnh tên sản phẩm: tên đã đọc được nên alt để trống */}
                              <img src={prod.displayImage} alt="" className="size-full object-cover" loading="lazy" />
                            </span>

                            <span className="flex-1 min-w-0 flex flex-col justify-between">
                              <span className="block">
                                <span className="flex items-start justify-between gap-1">
                                  <span className="text-xs font-semibold text-fg truncate group-hover:text-accent transition-colors">
                                    {prod.productName}
                                  </span>
                                  <StatusPill status={prod.status} />
                                </span>
                                <span className="block text-[11px] text-fg-3 truncate mt-0.5">
                                  {speciesLabel(prod)}
                                  {prod.speciesScientificName && (
                                    <>
                                      {' · '}
                                      <em>{prod.speciesScientificName}</em>
                                    </>
                                  )}
                                </span>
                              </span>

                              <span className="flex items-center justify-between text-[11px] pt-1">
                                <Price amount={prod.price} className="font-semibold text-accent text-xs" />
                                <span className="text-[11px] text-fg-3 truncate">{prod.displayShopName}</span>
                              </span>
                            </span>
                          </button>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
                {filteredProducts.length > visibleCount && (
                  <button
                    type="button"
                    onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                    className="mt-3 w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold text-fg-2 hover:text-fg hover:border-line-strong"
                  >
                    Xem thêm ({filteredProducts.length - visibleCount} sản phẩm)
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Khối đối chiếu */}
        <div className="lg:col-span-8 rounded-2xl border border-line bg-surface/90 backdrop-blur-xl p-6 flex flex-col justify-between">
          {!currentProduct ? (
            <div className="flex h-full flex-col items-center justify-center p-12 text-center text-fg-3">
              <PackageCheck className="size-12 mb-3 opacity-30 text-accent" aria-hidden="true" />
              <p className="text-base font-semibold text-fg">Chưa chọn cá thể nào để thẩm định</p>
              <p className="text-xs text-fg-3 mt-1">Chọn một cá thể bên trái hoặc dùng phím J/K để mở khối đối chiếu.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-line pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl md:text-2xl font-bold text-fg tracking-tight">{currentProduct.productName}</h2>
                    <span className="rounded-md border border-line bg-surface px-2 py-0.5 text-xs font-mono text-fg-3">
                      Mã #{currentProduct.id}
                    </span>
                  </div>
                  <p className="text-xs text-fg-3 mt-1 flex flex-wrap items-center gap-2">
                    <Store className="size-3 text-accent" aria-hidden="true" />
                    <span>
                      Đăng bán bởi: <strong className="text-fg">{currentProduct.displayShopName}</strong>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      Kho: <strong className="text-fg">{currentProduct.stockQuantity}</strong> cá thể
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Price amount={currentProduct.price} className="text-lg font-bold text-accent font-sans" />
                  <StatusPill status={currentProduct.status} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* CỘT A: KHAI BÁO CỦA NGƯỜI BÁN */}
                <div className="rounded-xl border border-warm/30 bg-warm/5 p-4 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-warm/20">
                    <span className="text-xs font-bold uppercase tracking-wider text-warm flex items-center gap-1.5">
                      <Store className="size-3.5" aria-hidden="true" />
                      <span>Khai báo của người bán</span>
                    </span>
                  </div>

                  <div className="relative rounded-xl overflow-hidden border border-line bg-black/60 aspect-4/3 flex items-center justify-center">
                    <LensMagnifier
                      src={currentProduct.displayImage}
                      alt={`Ảnh người bán: ${currentProduct.productName}`}
                      zoomLevel={2.5}
                      className="size-full"
                    />
                    <span className="absolute bottom-2 left-2 rounded-md bg-black/70 backdrop-blur-md px-2 py-0.5 text-[11px] text-accent border border-line pointer-events-none">
                      Kính lúp 2.5x
                    </span>
                  </div>

                  <dl className="space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-fg-3">Tên thương mại</dt>
                      <dd className="font-semibold text-fg text-right">{currentProduct.productName}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-fg-3">Cửa hàng</dt>
                      <dd className="text-accent text-right">{currentProduct.displayShopName}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-fg-3">Loài khai báo</dt>
                      <dd className="text-fg-2 text-right">{speciesLabel(currentProduct)}</dd>
                    </div>
                    <div className="pt-2 border-t border-line/30">
                      <dt className="text-fg-3 text-[11px] mb-1">Mô tả của người bán</dt>
                      <dd className="text-fg-2 italic bg-surface/50 p-2 rounded-lg border border-line/30 text-[11px] leading-relaxed">
                        {currentProduct.description ? `"${currentProduct.description}"` : 'Chưa có mô tả.'}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* CỘT B: MẪU CHUẨN BÁCH KHOA */}
                <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-accent/20">
                    <span className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
                      <BookOpen className="size-3.5" aria-hidden="true" />
                      <span>Mẫu chuẩn bách khoa</span>
                    </span>
                    {matchedSpecies && <IucnBadge code={matchedSpecies.conservationStatus} size="sm" />}
                  </div>

                  <figure className="space-y-1.5">
                    <div className="relative rounded-xl overflow-hidden border border-line bg-black/60 aspect-4/3 flex items-center justify-center">
                      <LensMagnifier
                        src={scientificImageUrl}
                        alt={`Ảnh chuẩn của loài ${matchedSpecies?.displayName || matchedSpecies?.scientificName || 'khai báo'}`}
                        zoomLevel={2.5}
                        className="size-full"
                      />
                      <span className="absolute bottom-2 left-2 rounded-md bg-black/70 backdrop-blur-md px-2 py-0.5 text-[11px] text-accent border border-line pointer-events-none">
                        Kính lúp 2.5x
                      </span>
                    </div>
                    {scientificPhoto?.credit && (
                      <figcaption className="text-[11px] text-fg-3">
                        Ảnh: {scientificPhoto.credit.author} ·{' '}
                        <a href={scientificPhoto.credit.licenseUrl} target="_blank" rel="noopener noreferrer" className="hover:text-accent underline">
                          {scientificPhoto.credit.license}
                        </a>{' '}
                        ·{' '}
                        <a href={scientificPhoto.credit.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:text-accent underline">
                          Nguồn
                        </a>
                      </figcaption>
                    )}
                  </figure>

                  {matchedSpecies ? (
                    <dl className="space-y-2 text-xs">
                      <div className="flex items-center justify-between gap-3">
                        <dt className="text-fg-3">Tên khoa học</dt>
                        <dd className="font-serif italic text-accent font-semibold">{matchedSpecies.scientificName}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <dt className="text-fg-3">Tên thường gọi</dt>
                        <dd className="text-fg font-medium text-right">{matchedSpecies.commonName}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <dt className="text-fg-3">Bảo tồn IUCN</dt>
                        <dd className="font-semibold text-fg">
                          {matchedSpecies.conservationStatus} · {IUCN_LABEL_VI[matchedSpecies.conservationStatus] || 'Chưa rõ'}
                        </dd>
                      </div>

                      <div className="pt-2 border-t border-line/30 space-y-2">
                        <dt className="text-fg-3 text-[11px]">Thông số môi trường chuẩn</dt>
                        <dd className="space-y-2">
                          <ClimateBar specs={parsedSpecs} />
                          {parsedSpecs.humidMin !== null && parsedSpecs.humidMin !== undefined && (
                            <HumidityGauge humidMin={parsedSpecs.humidMin} humidMax={parsedSpecs.humidMax} className="w-full" />
                          )}
                          {speciesExtra?.diet && (
                            <p className="text-fg-3 text-[11px] pt-1">
                              Thức ăn: <span className="text-fg-2">{speciesExtra.diet}</span>
                            </p>
                          )}
                        </dd>
                      </div>

                      {matchedSpecies.referenceURL && (
                        <div className="pt-1">
                          <a
                            href={matchedSpecies.referenceURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-ocean hover:underline"
                          >
                            <span>Tra cứu trên GBIF</span>
                            <ExternalLink className="size-3" aria-hidden="true" />
                            <span className="sr-only">(mở trong thẻ mới)</span>
                          </a>
                        </div>
                      )}
                    </dl>
                  ) : (
                    <p className="text-xs text-fg-3">Không tìm thấy hồ sơ loài khai báo trong bách khoa.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Thanh tác vụ kiểm duyệt dưới cùng */}
          {currentProduct && (
            <div className="pt-6 border-t border-line mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-fg-3 flex items-center gap-2">
                {currentProduct.status === 'PENDING' ? (
                  <span>Duyệt thì sản phẩm hiện công khai trên Sàn:</span>
                ) : (
                  <>
                    <span>Trạng thái sản phẩm:</span>
                    <StatusPill status={currentProduct.status} />
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                {currentProduct.status === 'PENDING' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomReasonNote('');
                        setIsRejectOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-danger/40 bg-danger/15 px-4 py-2 text-xs font-semibold text-danger hover:bg-danger/25 transition-colors"
                    >
                      <XCircle className="size-3.5" aria-hidden="true" />
                      <span>Từ chối</span>
                      <Kbd>R</Kbd>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsApproveOpen(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-accent-ink hover:opacity-90 shadow-[var(--glow-accent-btn)] transition-all"
                    >
                      <CheckCircle2 className="size-3.5" aria-hidden="true" />
                      <span>Chấp thuận duyệt</span>
                      <Kbd className="bg-black/20 text-accent-ink border-black/30">A</Kbd>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Chú thích phím tắt */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 rounded-2xl border border-line bg-bg-raised/90 backdrop-blur-2xl px-5 py-2.5 shadow-2xl hidden md:flex items-center gap-5 text-xs text-fg-2">
        <span className="font-semibold text-fg flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-accent" aria-hidden="true" />
          <span>Phím tắt:</span>
        </span>
        <div className="flex items-center gap-1.5"><Kbd>J</Kbd><span>Cá thể sau</span></div>
        <div className="flex items-center gap-1.5"><Kbd>K</Kbd><span>Cá thể trước</span></div>
        <div className="flex items-center gap-1.5"><Kbd>A</Kbd><span className="text-accent">Chấp thuận</span></div>
        <div className="flex items-center gap-1.5"><Kbd>R</Kbd><span className="text-danger">Từ chối</span></div>
        <div className="flex items-center gap-1.5"><Kbd>Esc</Kbd><span>Đóng hộp thoại</span></div>
        <div className="flex items-center gap-1.5"><Kbd>?</Kbd><span>Trợ giúp</span></div>
      </div>

      {/* DIALOG 1: Phê duyệt cá thể */}
      <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-success">
              <CheckCircle2 className="size-5" aria-hidden="true" />
              <span>Chấp thuận Kiểm định Cá thể</span>
            </DialogTitle>
            <DialogDescription className="text-fg-2 text-xs">
              Xác nhận cá thể đúng loài khai báo và đủ điều kiện hiện công khai trên Sàn:
            </DialogDescription>
          </DialogHeader>

          {currentProduct && (
            <div className="rounded-xl border border-line bg-surface p-4 my-2 space-y-1.5 text-xs">
              <p className="text-base font-bold text-fg">{currentProduct.productName}</p>
              <p className="text-fg-3">
                Loài: {speciesLabel(currentProduct)}
                {currentProduct.speciesScientificName && (
                  <>
                    {' '}(<em>{currentProduct.speciesScientificName}</em>)
                  </>
                )}
              </p>
              <p className="text-accent font-semibold">Cửa hàng: {currentProduct.displayShopName}</p>
              <Price amount={currentProduct.price} className="font-mono text-fg-2" />
            </div>
          )}

          <DialogFooter className="mt-4 gap-2">
            <button
              type="button"
              onClick={() => setIsApproveOpen(false)}
              className="rounded-xl border border-line px-4 py-2 text-xs font-semibold text-fg-3 hover:text-fg"
            >
              Hủy bỏ (Esc)
            </button>
            <button
              type="button"
              onClick={handleApprove}
              disabled={moderateProductMutation.isPending}
              className="rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-accent-ink hover:opacity-90 disabled:opacity-50"
            >
              {moderateProductMutation.isPending ? 'Đang duyệt...' : 'Xác nhận Duyệt bài'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG 2: Từ chối cá thể */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-danger">
              <XCircle className="size-5" aria-hidden="true" />
              <span>Từ chối Kiểm định Cá thể</span>
            </DialogTitle>
            <DialogDescription className="text-fg-2 text-xs">
              Chọn lý do từ chối để ghi nhận quyết định kiểm duyệt.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 my-2">
            {/* Nhóm radio gốc: chọn được bằng phím mũi tên và Tab */}
            <fieldset className="space-y-2">
              <legend className="sr-only">Lý do từ chối</legend>
              {REJECTION_REASONS.map((reason) => {
                const isSelected = selectedReasonId === reason.id;
                return (
                  <label
                    key={reason.id}
                    className={`block rounded-xl border p-3 cursor-pointer transition-all focus-within:ring-2 focus-within:ring-danger ${
                      isSelected ? 'border-danger bg-danger/10 text-fg' : 'border-line/60 bg-surface/60 hover:border-line-strong'
                    }`}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-xs text-fg">{reason.title}</span>
                      <input
                        type="radio"
                        name="product-reject-reason"
                        value={reason.id}
                        checked={isSelected}
                        onChange={() => setSelectedReasonId(reason.id)}
                        className="size-3.5 accent-[var(--danger)]"
                      />
                    </span>
                    <span className="block text-[11px] text-fg-3 mt-1">{reason.desc}</span>
                  </label>
                );
              })}
            </fieldset>

            <div>
              <label htmlFor="custom-reason-note" className="text-[11px] text-fg-3 block mb-1">
                Ghi chú thêm (tùy chọn{selectedReasonId === 'OTHER' ? ', bắt buộc với "Lý do khác"' : ''}):
              </label>
              <textarea
                id="custom-reason-note"
                rows={3}
                value={customReasonNote}
                onChange={(e) => setCustomReasonNote(e.target.value)}
                placeholder="Nhập hướng dẫn khắc phục hình ảnh hoặc bổ sung giấy chứng nhận..."
                className="w-full rounded-xl border border-line bg-bg-deep p-3 text-xs text-fg placeholder:text-fg-3 focus:border-danger focus:outline-none"
              />
            </div>
          </div>

          <DialogFooter className="mt-4 gap-2">
            <button
              type="button"
              onClick={() => setIsRejectOpen(false)}
              className="rounded-xl border border-line px-4 py-2 text-xs font-semibold text-fg-3 hover:text-fg"
            >
              Hủy bỏ (Esc)
            </button>
            <button
              type="button"
              onClick={handleReject}
              disabled={moderateProductMutation.isPending}
              className="rounded-xl bg-danger px-4 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {moderateProductMutation.isPending ? 'Đang từ chối...' : 'Xác nhận Từ chối'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG 3: Trợ giúp phím tắt */}
      <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-accent">
              <HelpCircle className="size-5" aria-hidden="true" />
              <span>Phím tắt kiểm duyệt cá thể</span>
            </DialogTitle>
            <DialogDescription className="text-fg-2 text-xs">
              Phím tắt chỉ hoạt động khi bạn không gõ trong ô nhập liệu.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2.5 my-3 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-surface border border-line/40">
              <span className="text-fg">Cá thể kế tiếp</span>
              <div className="flex gap-1"><Kbd>J</Kbd> hoặc <Kbd>↓</Kbd> (trong danh sách)</div>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-surface border border-line/40">
              <span className="text-fg">Cá thể liền trước</span>
              <div className="flex gap-1"><Kbd>K</Kbd> hoặc <Kbd>↑</Kbd> (trong danh sách)</div>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-surface border border-line/40">
              <span className="text-fg">Chấp thuận duyệt</span>
              <Kbd>A</Kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-surface border border-line/40">
              <span className="text-fg">Từ chối (chọn lý do)</span>
              <Kbd>R</Kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-surface border border-line/40">
              <span className="text-fg">Đóng hộp thoại</span>
              <Kbd>Esc</Kbd>
            </div>
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setIsHelpOpen(false)}
              className="w-full rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-accent-ink hover:opacity-90"
            >
              Đã hiểu
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function matchedSpeciesName(list: { id: number; displayName: string }[], speciesId: number): string | undefined {
  return list.find((s) => s.id === speciesId)?.displayName;
}
