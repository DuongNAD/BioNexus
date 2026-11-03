import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import { ExternalLink, Keyboard } from 'lucide-react';
import { useAdminProducts } from '@/api/queries/useAdminQueries';
import { useSpeciesList } from '@/api/queries/useSpeciesQueries';
import { useModerateProduct } from '@/api/mutations/useAdminMutations';
import { PRODUCT_PLACEHOLDER_IMAGE } from '@/api/adapters';
import { Eyebrow, PageContainer, PageHeader, Panel } from '@/components/layout/Page';
import { QueryErrorState } from '@/components/domain/QueryErrorState';
import { LensMagnifier } from '@/components/domain/LensMagnifier';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { IucnBadge } from '@/components/ui/IucnBadge';
import { Kbd } from '@/components/ui/Kbd';
import { Price } from '@/components/ui/Price';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusPill } from '@/components/ui/StatusPill';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { parseEnvironmentSpecs } from '@/lib/parseEnvironmentSpecs';
import { SPECIES_EXTRAS } from '@/content/species-extras';
import { PHOTOS } from '@/content/photos';
import { cn } from '@/lib/cn';
import {
  DetailItem,
  DetailList,
  QueueFilter,
  QueueSearch,
  RangeLine,
  ShortcutHelpDialog,
  ShortcutHint,
  errorMessage,
  isTypingTarget,
  type ShortcutItem,
} from './components/AdminKit';
import type { ProductViewModel } from '@/api/adapters';
import type { ProductStatus } from '@/types/api';

const REJECTION_REASONS = [
  { id: 'MISIDENTIFIED_SPECIES', title: 'Sai loài khai báo', desc: 'Cá thể không khớp với loài đã chọn (khác hình thái hoặc màu).' },
  { id: 'WILD_POACHED_SUSPICION', title: 'Nghi bắt từ tự nhiên', desc: 'Cá thể có dấu hiệu hoang dã hoặc thuộc loài cấm nuôi thương mại.' },
  { id: 'MISSING_DOCUMENTATION', title: 'Thiếu giấy tờ nhân giống', desc: 'Không có giấy chứng nhận cơ sở nhân giống cho cá thể này.' },
  { id: 'POOR_MEDIA_QUALITY', title: 'Ảnh không rõ', desc: 'Ảnh mờ hoặc thiếu góc chụp để nhận dạng loài.' },
  { id: 'OTHER', title: 'Lý do khác', desc: 'Ghi rõ lý do ở ô ghi chú bên dưới.' },
];

// Tài liệu 01 mục 7: không render quá 50 dòng một lúc
const PAGE_SIZE = 50;

type StatusFilter = ProductStatus | 'ALL';

const STATUS_TABS: { id: StatusFilter; label: string }[] = [
  { id: 'PENDING', label: 'Chờ duyệt' },
  { id: 'APPROVED', label: 'Đã duyệt' },
  { id: 'REJECTED', label: 'Từ chối' },
  { id: 'SOLD_OUT', label: 'Hết hàng' },
  { id: 'ALL', label: 'Tất cả' },
];

// Dòng gợi ý dưới danh sách: gộp J/K cho gọn
const HINT_ITEMS: ShortcutItem[] = [
  { label: 'Chọn sản phẩm', keys: ['J', 'K'] },
  { label: 'Duyệt', keys: ['A'] },
  { label: 'Từ chối', keys: ['R'] },
];

const SHORTCUTS: ShortcutItem[] = [
  { label: 'Sản phẩm kế tiếp', keys: ['J'] },
  { label: 'Sản phẩm trước', keys: ['K'] },
  { label: 'Duyệt', keys: ['A'] },
  { label: 'Từ chối', keys: ['R'] },
  { label: 'Trợ giúp', keys: ['?'] },
];

export default function AdminProductsPage(): React.JSX.Element {
  const { data, isLoading, isError, refetch } = useAdminProducts();
  const { data: speciesData } = useSpeciesList();
  const moderateProductMutation = useModerateProduct();
  const allProducts = useMemo(() => data ?? [], [data]);
  const speciesList = useMemo(() => speciesData ?? [], [speciesData]);

  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const listRef = useRef<HTMLUListElement>(null);

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

  // Loài đối chiếu: khớp theo speciesId lấy từ cùng nguồn dữ liệu API
  const matchedSpecies = currentProduct ? speciesList.find((s) => s.id === currentProduct.speciesId) : undefined;
  const speciesExtra = matchedSpecies ? SPECIES_EXTRAS[matchedSpecies.scientificName] : undefined;

  // Ảnh chuẩn của loài (Wikimedia Commons, có ghi công)
  const referencePhoto =
    (speciesExtra?.heroPhotoId ? PHOTOS[speciesExtra.heroPhotoId] : undefined) ||
    (speciesExtra?.portraitPhotoId ? PHOTOS[speciesExtra.portraitPhotoId] : undefined);
  const referenceImageUrl =
    referencePhoto?.sources.webp[referencePhoto.sources.webp.length - 1]?.src ||
    referencePhoto?.sources.jpg ||
    matchedSpecies?.heroPhoto ||
    PRODUCT_PLACEHOLDER_IMAGE;

  const specs = matchedSpecies ? parseEnvironmentSpecs(matchedSpecies.environmentSpecs) : null;

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

  const openReject = () => {
    setCustomReasonNote('');
    setIsRejectOpen(true);
  };

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

      // Mũi tên chỉ đổi sản phẩm khi focus nằm trong hàng đợi, để không chặn cuộn trang
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
          openReject();
        }
      } else if (e.key === '?') {
        e.preventDefault();
        setIsHelpOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectNext, selectPrev, currentProduct, isApproveOpen, isRejectOpen, isHelpOpen]);

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
      toast.success(`Đã duyệt "${currentProduct.productName}". Sản phẩm đã hiện trên sàn.`);
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
    prod.speciesCommonName ||
    speciesList.find((s) => s.id === prod.speciesId)?.displayName ||
    `Loài #${prod.speciesId}`;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Quản trị · Kiểm duyệt"
        title="Duyệt sản phẩm"
        description="Đặt ảnh người bán cạnh ảnh chuẩn của loài để kiểm tra đúng loài trước khi sản phẩm lên sàn."
        actions={
          <Button variant="outline" pill onClick={() => setIsHelpOpen(true)} leftIcon={<Keyboard className="size-4" aria-hidden="true" />}>
            Phím tắt
          </Button>
        }
      />

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <QueueFilter tabs={STATUS_TABS} value={selectedStatus} counts={counts} onChange={setSelectedStatus} />
        <QueueSearch
          value={searchQuery}
          onChange={setSearchQuery}
          label="Tìm sản phẩm trong hàng đợi"
          placeholder="Tìm sản phẩm, loài hoặc shop"
        />
      </div>

      {isError ? (
        <QueryErrorState title="Không tải được hàng đợi sản phẩm" onRetry={() => void refetch?.()} />
      ) : (
        <div className="grid gap-6 pb-16 lg:grid-cols-[360px_minmax(0,1fr)]">
          {/* Danh sách sản phẩm */}
          <div className="min-w-0">
            <Panel padded={false} className="overflow-hidden">
              {isLoading ? (
                <div className="space-y-px p-2" role="status" aria-label="Đang tải sản phẩm">
                  {Array.from({ length: 4 }, (_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <p className="px-5 py-10 text-center text-sm text-fg-2">Không có sản phẩm nào khớp bộ lọc.</p>
              ) : (
                <ul ref={listRef} className="max-h-[680px] divide-y divide-line overflow-y-auto" aria-label="Hàng đợi sản phẩm">
                  {visibleProducts.map((prod) => {
                    const isSelected = prod.id === selectedProductId;
                    return (
                      <li key={prod.id}>
                        <button
                          type="button"
                          data-product-id={prod.id}
                          aria-pressed={isSelected}
                          onClick={() => setSelectedProductId(prod.id)}
                          className={cn(
                            'relative flex w-full gap-3 px-4 py-4 text-left transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent',
                            isSelected ? 'bg-accent/10' : 'hover:bg-surface-hover'
                          )}
                        >
                          {isSelected && <span className="absolute inset-y-0 left-0 w-0.5 bg-accent" aria-hidden="true" />}
                          {/* Ảnh minh họa cạnh tên sản phẩm: tên đã đọc được nên alt để trống */}
                          <img src={prod.displayImage} alt="" className="size-14 shrink-0 rounded-xl object-cover" loading="lazy" />
                          <span className="min-w-0 flex-1">
                            <span className={cn('block truncate text-[15px] font-semibold', isSelected ? 'text-accent' : 'text-fg')}>
                              {prod.productName}
                            </span>
                            <span className="mt-0.5 block truncate text-sm text-fg-3">{speciesLabel(prod)}</span>
                            <span className="mt-1.5 flex items-center justify-between gap-2">
                              <Price amount={prod.price} className="font-mono text-sm text-fg" />
                              <StatusPill status={prod.status} size="sm" />
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Panel>
            {filteredProducts.length > visibleCount && (
              <Button variant="outline" pill className="mt-3 w-full" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
                Xem thêm {filteredProducts.length - visibleCount} sản phẩm
              </Button>
            )}
            <ShortcutHint items={HINT_ITEMS} />
          </div>

          {/* Khối đối chiếu */}
          <Panel className="flex min-w-0 flex-col">
            {isLoading ? (
              <Skeleton className="h-96 w-full" />
            ) : !currentProduct ? (
              <EmptyState
                title="Chưa chọn sản phẩm nào"
                description="Chọn một sản phẩm trong danh sách, hoặc dùng phím J và K để duyệt lần lượt."
                className="my-auto border-0"
              />
            ) : (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Eyebrow tone="muted">Sản phẩm #{currentProduct.id}</Eyebrow>
                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-fg md:text-[28px]">{currentProduct.productName}</h2>
                    <p className="mt-1 text-sm text-fg-3">
                      {currentProduct.displayShopName} · Còn {currentProduct.stockQuantity} cá thể
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Price amount={currentProduct.price} size="lg" className="font-mono text-fg" />
                    <StatusPill status={currentProduct.status} />
                  </div>
                </div>

                {/* Ảnh người bán và ảnh chuẩn đặt cạnh nhau để so hình thái */}
                <div className="mt-6 grid gap-4 border-t border-line pt-6 sm:grid-cols-2">
                  <figure className="min-w-0">
                    <figcaption className="mb-2 text-sm text-fg-3">Ảnh người bán</figcaption>
                    <div className="aspect-[4/3] overflow-hidden rounded-xl bg-bg-deep">
                      <LensMagnifier src={currentProduct.displayImage} alt={`Ảnh người bán: ${currentProduct.productName}`} className="size-full" />
                    </div>
                  </figure>
                  <figure className="min-w-0">
                    <figcaption className="mb-2 text-sm text-fg-3">Ảnh chuẩn của loài</figcaption>
                    <div className="aspect-[4/3] overflow-hidden rounded-xl bg-bg-deep">
                      <LensMagnifier
                        src={referenceImageUrl}
                        alt={`Ảnh chuẩn của loài ${matchedSpecies?.displayName || matchedSpecies?.scientificName || 'khai báo'}`}
                        className="size-full"
                      />
                    </div>
                    {referencePhoto?.credit && (
                      <p className="mt-2 text-xs leading-relaxed text-fg-2">
                        Ảnh: {referencePhoto.credit.author} ·{' '}
                        <a href={referencePhoto.credit.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">
                          {referencePhoto.credit.license}
                        </a>{' '}
                        ·{' '}
                        <a href={referencePhoto.credit.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">
                          Nguồn
                        </a>
                      </p>
                    )}
                  </figure>
                </div>

                <DetailList className="mt-6 border-t border-line pt-6">
                  <DetailItem label="Loài khai báo">
                    <span className="flex flex-wrap items-center gap-2">
                      <span>{speciesLabel(currentProduct)}</span>
                      {matchedSpecies && <IucnBadge code={matchedSpecies.conservationStatus} size="sm" />}
                    </span>
                    {(matchedSpecies?.scientificName || currentProduct.speciesScientificName) && (
                      <span className="mt-0.5 block font-serif text-base text-fg-2 italic">
                        {matchedSpecies?.scientificName || currentProduct.speciesScientificName}
                      </span>
                    )}
                  </DetailItem>
                  <DetailItem label="Điều kiện sống chuẩn">
                    {specs && specs.tempMin !== null && specs.tempMax !== null ? (
                      <span className="block space-y-3">
                        <RangeLine
                          label={specs.waterTempMin !== undefined ? 'Nhiệt độ nước' : 'Nhiệt độ'}
                          min={specs.tempMin}
                          max={specs.tempMax}
                          unit="°C"
                          scaleMin={0}
                          scaleMax={45}
                          color="var(--warm)"
                        />
                        {specs.humidMin != null && specs.humidMax != null && (
                          <RangeLine label="Độ ẩm" min={specs.humidMin} max={specs.humidMax} unit="%" scaleMin={0} scaleMax={100} color="var(--ocean)" />
                        )}
                      </span>
                    ) : (
                      <span className="text-fg-2">{matchedSpecies?.environmentSpecs || 'Chưa có thông số'}</span>
                    )}
                  </DetailItem>
                  <DetailItem label="Mô tả của người bán" wide>
                    <span className="block border-l-2 border-accent/50 pl-3 text-fg-2">
                      {currentProduct.description || 'Chưa có mô tả.'}
                    </span>
                  </DetailItem>
                  {matchedSpecies?.referenceURL && (
                    <DetailItem label="Tham khảo" wide>
                      <a
                        href={matchedSpecies.referenceURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-accent hover:underline"
                      >
                        <span>Tra cứu loài trên GBIF</span>
                        <ExternalLink className="size-4" aria-hidden="true" />
                        <span className="sr-only">(mở trong thẻ mới)</span>
                      </a>
                    </DetailItem>
                  )}
                </DetailList>

                {currentProduct.status === 'PENDING' && (
                  <div className="mt-auto flex flex-wrap items-center justify-end gap-3 border-t border-line pt-6">
                    <Button variant="danger" pill onClick={openReject} aria-keyshortcuts="R">
                      Từ chối
                      <Kbd aria-hidden="true" className="ml-1 hidden md:inline-flex">R</Kbd>
                    </Button>
                    <Button pill onClick={() => setIsApproveOpen(true)} aria-keyshortcuts="A">
                      Duyệt sản phẩm
                      <Kbd aria-hidden="true" className="ml-1 hidden border-black/20 bg-black/10 text-accent-ink md:inline-flex">A</Kbd>
                    </Button>
                  </div>
                )}
              </>
            )}
          </Panel>
        </div>
      )}

      {/* Duyệt sản phẩm */}
      <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Duyệt sản phẩm này?</DialogTitle>
            <DialogDescription>Sản phẩm sẽ hiện công khai trên sàn ngay sau khi duyệt.</DialogDescription>
          </DialogHeader>
          {currentProduct && (
            <div className="mt-5 border-y border-line py-4 text-sm">
              <p className="text-base font-semibold text-fg">{currentProduct.productName}</p>
              <p className="mt-1 text-fg-3">
                {speciesLabel(currentProduct)} · {currentProduct.displayShopName}
              </p>
              <Price amount={currentProduct.price} className="mt-2 block font-mono text-fg" />
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" pill onClick={() => setIsApproveOpen(false)}>
              Hủy
            </Button>
            <Button pill onClick={handleApprove} isLoading={moderateProductMutation.isPending}>
              Duyệt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Từ chối sản phẩm */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Từ chối sản phẩm</DialogTitle>
            <DialogDescription>Chọn lý do để lưu cùng quyết định kiểm duyệt.</DialogDescription>
          </DialogHeader>

          <div className="mt-5 space-y-4">
            {/* Nhóm radio gốc: chọn được bằng phím mũi tên và Tab */}
            <fieldset>
              <legend className="sr-only">Lý do từ chối</legend>
              <div className="divide-y divide-line border-y border-line">
                {REJECTION_REASONS.map((reason) => {
                  const isSelected = selectedReasonId === reason.id;
                  return (
                    <label
                      key={reason.id}
                      className={cn(
                        'flex cursor-pointer items-start gap-3 px-1 py-3 transition-colors focus-within:bg-surface',
                        isSelected && 'bg-danger/5'
                      )}
                    >
                      <input
                        type="radio"
                        name="product-reject-reason"
                        value={reason.id}
                        checked={isSelected}
                        onChange={() => setSelectedReasonId(reason.id)}
                        className="mt-1 size-4 shrink-0 accent-[var(--danger)]"
                      />
                      <span>
                        <span className="block text-sm font-medium text-fg">{reason.title}</span>
                        <span className="mt-0.5 block text-sm text-fg-3">{reason.desc}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div>
              <label htmlFor="custom-reason-note" className="text-sm text-fg-2">
                Ghi chú thêm {selectedReasonId === 'OTHER' ? '(bắt buộc với "Lý do khác")' : '(tùy chọn)'}
              </label>
              <textarea
                id="custom-reason-note"
                rows={3}
                value={customReasonNote}
                onChange={(e) => setCustomReasonNote(e.target.value)}
                placeholder="Ví dụ: Cần thêm ảnh chụp mặt bụng để nhận dạng."
                className="mt-2 w-full rounded-[10px] border border-line bg-surface-2 p-3.5 text-sm text-fg placeholder:text-fg-3 focus:border-danger focus:outline-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" pill onClick={() => setIsRejectOpen(false)}>
              Hủy
            </Button>
            <Button variant="danger" pill onClick={handleReject} isLoading={moderateProductMutation.isPending}>
              Từ chối sản phẩm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ShortcutHelpDialog open={isHelpOpen} onOpenChange={setIsHelpOpen} items={SHORTCUTS} />
    </PageContainer>
  );
}
