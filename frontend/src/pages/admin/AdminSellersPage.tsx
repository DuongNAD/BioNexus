import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import { Ban, Check, Copy, ExternalLink, Keyboard } from 'lucide-react';
import { useAdminSellers } from '@/api/queries/useAdminQueries';
import { useModerateSeller } from '@/api/mutations/useAdminMutations';
import { Eyebrow, PageContainer, PageHeader, Panel } from '@/components/layout/Page';
import { QueryErrorState } from '@/components/domain/QueryErrorState';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Kbd } from '@/components/ui/Kbd';
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
import { cn } from '@/lib/cn';
import {
  DetailItem,
  DetailList,
  QueueFilter,
  QueueSearch,
  ShortcutHelpDialog,
  ShortcutHint,
  errorMessage,
  formatDateVi,
  isTypingTarget,
  type ShortcutItem,
} from './components/AdminKit';
import type { SellerDto, SellerStatus } from '@/types/api';

const QUICK_REJECTION_REASONS = [
  'Thiếu giấy chứng nhận cơ sở nhân giống',
  'Bản scan giấy phép bị mờ, không đọc được số hiệu',
  'Địa chỉ cơ sở không khớp với thông tin đăng ký',
  'Loài đăng ký nhân giống bị cấm thương mại',
];

// Tài liệu 01 mục 7: không render quá 50 dòng một lúc
const PAGE_SIZE = 50;

type StatusFilter = SellerStatus | 'ALL';

const STATUS_TABS: { id: StatusFilter; label: string }[] = [
  { id: 'PENDING', label: 'Chờ duyệt' },
  { id: 'ACTIVE', label: 'Đang bán' },
  { id: 'REJECTED', label: 'Từ chối' },
  { id: 'BANNED', label: 'Bị khóa' },
  { id: 'ALL', label: 'Tất cả' },
];

// Dòng gợi ý dưới danh sách: gộp J/K cho gọn
const HINT_ITEMS: ShortcutItem[] = [
  { label: 'Chọn hồ sơ', keys: ['J', 'K'] },
  { label: 'Duyệt', keys: ['A'] },
  { label: 'Từ chối', keys: ['R'] },
];

const SHORTCUTS: ShortcutItem[] = [
  { label: 'Hồ sơ kế tiếp', keys: ['J'] },
  { label: 'Hồ sơ trước', keys: ['K'] },
  { label: 'Duyệt', keys: ['A'] },
  { label: 'Từ chối', keys: ['R'] },
  { label: 'Trợ giúp', keys: ['?'] },
];

export default function AdminSellersPage(): React.JSX.Element {
  const { data, isLoading, isError, refetch } = useAdminSellers();
  const moderateSellerMutation = useModerateSeller();
  const allSellers = useMemo(() => data ?? [], [data]);

  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSellerId, setSelectedSellerId] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const listRef = useRef<HTMLUListElement>(null);

  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isBanOpen, setIsBanOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Danh sách đã lọc (memo để effect tự chọn không chạy mỗi lần render)
  const filteredSellers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allSellers.filter((seller) => {
      if (selectedStatus !== 'ALL' && seller.status !== selectedStatus) return false;
      if (!q) return true;
      return (
        seller.shopName.toLowerCase().includes(q) ||
        (seller.ownerFullName || '').toLowerCase().includes(q) ||
        (seller.ownerUsername || '').toLowerCase().includes(q)
      );
    });
  }, [allSellers, selectedStatus, searchQuery]);

  const visibleSellers = filteredSellers.slice(0, visibleCount);

  // Đổi bộ lọc thì quay lại trang đầu của danh sách
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [selectedStatus, searchQuery]);

  // Tự chọn hồ sơ đầu tiên nếu chưa chọn hoặc hồ sơ cũ không còn trong danh sách
  useEffect(() => {
    if (filteredSellers.length === 0) {
      setSelectedSellerId(null);
      return;
    }
    if (!filteredSellers.some((s) => s.id === selectedSellerId)) {
      setSelectedSellerId(filteredSellers[0]!.id);
    }
  }, [filteredSellers, selectedSellerId]);

  const currentSeller: SellerDto | undefined = allSellers.find((s) => s.id === selectedSellerId);

  const counts = useMemo(
    () => ({
      PENDING: allSellers.filter((s) => s.status === 'PENDING').length,
      ACTIVE: allSellers.filter((s) => s.status === 'ACTIVE').length,
      REJECTED: allSellers.filter((s) => s.status === 'REJECTED').length,
      BANNED: allSellers.filter((s) => s.status === 'BANNED').length,

      ALL: allSellers.length,
    }),
    [allSellers]
  );

  const selectNext = useCallback(() => {
    const currentIndex = filteredSellers.findIndex((s) => s.id === selectedSellerId);
    const nextItem = filteredSellers[currentIndex + 1];
    if (nextItem) {
      setSelectedSellerId(nextItem.id);
      if (currentIndex + 1 >= visibleCount) setVisibleCount((c) => c + PAGE_SIZE);
    }
  }, [filteredSellers, selectedSellerId, visibleCount]);

  const selectPrev = useCallback(() => {
    const currentIndex = filteredSellers.findIndex((s) => s.id === selectedSellerId);
    const prevItem = currentIndex > 0 ? filteredSellers[currentIndex - 1] : undefined;
    if (prevItem) setSelectedSellerId(prevItem.id);
  }, [filteredSellers, selectedSellerId]);

  const openReject = () => {
    setRejectionReason('');
    setIsRejectOpen(true);
  };

  // Phím tắt J/K/A/R/?: bỏ qua khi đang gõ chữ hoặc có phím bổ trợ (Ctrl+R vẫn là tải lại trang)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
      // Đang mở hộp thoại thì chỉ nghe Esc (dự phòng cho Radix khi focus nằm ngoài dialog)
      if (isApproveOpen || isRejectOpen || isBanOpen || isHelpOpen) {
        if (e.key === 'Escape') {
          setIsApproveOpen(false);
          setIsRejectOpen(false);
          setIsBanOpen(false);
          setIsHelpOpen(false);
        }
        return;
      }
      if (isTypingTarget(e.target)) return;

      // Mũi tên chỉ đổi hồ sơ khi focus nằm trong hàng đợi, để không chặn cuộn trang
      const focusInList = !!listRef.current && listRef.current.contains(document.activeElement);

      if (e.key === 'j' || e.key === 'J' || (e.key === 'ArrowDown' && focusInList)) {
        e.preventDefault();
        selectNext();
      } else if (e.key === 'k' || e.key === 'K' || (e.key === 'ArrowUp' && focusInList)) {
        e.preventDefault();
        selectPrev();
      } else if (e.key === 'a' || e.key === 'A') {
        if (currentSeller?.status === 'PENDING') {
          e.preventDefault();
          setIsApproveOpen(true);
        }
      } else if (e.key === 'r' || e.key === 'R') {
        if (currentSeller?.status === 'PENDING') {
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
  }, [selectNext, selectPrev, currentSeller, isApproveOpen, isRejectOpen, isBanOpen, isHelpOpen]);

  // Giữ hồ sơ đang chọn trong khung nhìn khi đổi bằng bàn phím
  useEffect(() => {
    if (selectedSellerId == null || !listRef.current) return;
    const row = listRef.current.querySelector<HTMLElement>(`[data-seller-id="${selectedSellerId}"]`);
    row?.scrollIntoView?.({ block: 'nearest' });
  }, [selectedSellerId]);

  const handleApprove = async () => {
    if (!currentSeller) return;
    try {
      await moderateSellerMutation.mutateAsync({ sellerId: currentSeller.id, status: 'ACTIVE' });
      setIsApproveOpen(false);
      toast.success(`Đã duyệt cửa hàng ${currentSeller.shopName}`);
    } catch (err) {
      toast.error(errorMessage(err, 'Không duyệt được hồ sơ này'));
    }
  };

  const handleReject = async () => {
    if (!currentSeller) return;
    if (rejectionReason.trim().length < 10) {
      toast.error('Lý do từ chối phải có ít nhất 10 ký tự');
      return;
    }
    try {
      await moderateSellerMutation.mutateAsync({
        sellerId: currentSeller.id,
        status: 'REJECTED',
        reason: rejectionReason.trim(),
      });
      setIsRejectOpen(false);
      toast.success(`Đã từ chối hồ sơ ${currentSeller.shopName}`);
    } catch (err) {
      toast.error(errorMessage(err, 'Không từ chối được hồ sơ này'));
    }
  };

  const handleBan = async () => {
    if (!currentSeller) return;
    try {
      await moderateSellerMutation.mutateAsync({ sellerId: currentSeller.id, status: 'BANNED' });
      setIsBanOpen(false);
      toast.success(`Đã khóa cửa hàng ${currentSeller.shopName}`);
    } catch (err) {
      toast.error(errorMessage(err, 'Không khóa được cửa hàng này'));
    }
  };

  const copyPhoneNumber = async (phone: string) => {
    try {
      await navigator.clipboard.writeText(phone);
      setCopiedPhone(true);
      toast.success('Đã sao chép số điện thoại');
      setTimeout(() => setCopiedPhone(false), 2000);
    } catch {
      toast.error('Trình duyệt không cho phép sao chép');
    }
  };

  const submittedDate = formatDateVi(currentSeller?.createdAt);
  const reasonLength = rejectionReason.trim().length;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Quản trị · Kiểm duyệt"
        title="Duyệt cửa hàng"
        description="Mở giấy phép cơ sở nhân giống và đối chiếu thông tin chủ shop trước khi cho phép mở bán."
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
          label="Tìm hồ sơ shop"
          placeholder="Tìm shop, chủ shop"
        />
      </div>

      {isError ? (
        <QueryErrorState title="Không tải được hàng đợi hồ sơ shop" onRetry={() => void refetch?.()} />
      ) : (
        <div className="grid gap-6 pb-16 lg:grid-cols-[360px_minmax(0,1fr)]">
          {/* Danh sách hồ sơ */}
          <div className="min-w-0">
            <Panel padded={false} className="overflow-hidden">
              {isLoading ? (
                <div className="space-y-px p-2" role="status" aria-label="Đang tải hồ sơ">
                  {Array.from({ length: 4 }, (_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : filteredSellers.length === 0 ? (
                <p className="px-5 py-10 text-center text-sm text-fg-2">Không có cửa hàng nào khớp bộ lọc.</p>
              ) : (
                <ul ref={listRef} className="max-h-[640px] divide-y divide-line overflow-y-auto" aria-label="Hàng đợi hồ sơ shop">
                  {visibleSellers.map((seller) => {
                    const isSelected = seller.id === selectedSellerId;
                    return (
                      <li key={seller.id}>
                        <button
                          type="button"
                          data-seller-id={seller.id}
                          aria-pressed={isSelected}
                          onClick={() => setSelectedSellerId(seller.id)}
                          className={cn(
                            'relative flex w-full items-start justify-between gap-3 px-5 py-4 text-left transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent',
                            isSelected ? 'bg-accent/10' : 'hover:bg-surface-hover'
                          )}
                        >
                          {isSelected && <span className="absolute inset-y-0 left-0 w-0.5 bg-accent" aria-hidden="true" />}
                          <span className="min-w-0">
                            <span className={cn('block truncate text-[15px] font-semibold', isSelected ? 'text-accent' : 'text-fg')}>
                              {seller.shopName}
                            </span>
                            <span className="mt-0.5 block truncate text-sm text-fg-3">
                              {seller.ownerFullName || `Người dùng #${seller.userId}`}
                            </span>
                            {!seller.businessLicenseUrl && (
                              <span className="mt-1 block text-xs font-medium text-danger">Thiếu giấy phép</span>
                            )}
                          </span>
                          <StatusPill status={seller.status} size="sm" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Panel>
            {filteredSellers.length > visibleCount && (
              <Button variant="outline" pill className="mt-3 w-full" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
                Xem thêm {filteredSellers.length - visibleCount} hồ sơ
              </Button>
            )}
            <ShortcutHint items={HINT_ITEMS} />
          </div>

          {/* Chi tiết hồ sơ */}
          <Panel className="flex min-w-0 flex-col">
            {isLoading ? (
              <Skeleton className="h-80 w-full" />
            ) : !currentSeller ? (
              <EmptyState title="Chưa chọn hồ sơ nào" description="Chọn một cửa hàng trong danh sách, hoặc dùng phím J và K để duyệt lần lượt." className="my-auto border-0" />
            ) : (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Eyebrow tone="muted">Hồ sơ #{currentSeller.id}</Eyebrow>
                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-fg md:text-[28px]">{currentSeller.shopName}</h2>
                    <p className="mt-1 text-sm text-fg-3">Ngày nộp: {submittedDate ?? 'Chưa có'}</p>
                  </div>
                  <StatusPill status={currentSeller.status} />
                </div>

                <DetailList className="mt-6 border-t border-line pt-6">
                  <DetailItem label="Chủ cơ sở">{currentSeller.ownerFullName || 'Chưa có'}</DetailItem>
                  <DetailItem label="Tài khoản">
                    <span className="font-mono text-sm">
                      {currentSeller.ownerUsername ? `@${currentSeller.ownerUsername}` : `Người dùng #${currentSeller.userId}`}
                    </span>
                  </DetailItem>
                  <DetailItem label="Email">{currentSeller.ownerEmail || 'Chưa có'}</DetailItem>
                  <DetailItem label="Số điện thoại">
                    <span className="inline-flex items-center gap-2">
                      <span className="font-mono text-sm">{currentSeller.ownerPhone || 'Chưa có'}</span>
                      {currentSeller.ownerPhone && (
                        <button
                          type="button"
                          onClick={() => void copyPhoneNumber(currentSeller.ownerPhone!)}
                          className="flex size-8 items-center justify-center rounded-full text-fg-3 transition-colors hover:bg-surface-hover hover:text-accent"
                          aria-label="Sao chép số điện thoại"
                        >
                          {copiedPhone ? <Check className="size-4 text-success" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
                        </button>
                      )}
                    </span>
                  </DetailItem>
                  <DetailItem label="Địa chỉ" wide>
                    {currentSeller.ownerAddress || 'Chưa có'}
                  </DetailItem>
                  {currentSeller.bio && (
                    <DetailItem label="Giới thiệu cơ sở" wide>
                      <span className="block border-l-2 border-accent/50 pl-3 text-fg-2">{currentSeller.bio}</span>
                    </DetailItem>
                  )}
                </DetailList>

                {/* Giấy phép: DTO chỉ có đường dẫn, người duyệt phải mở tệp gốc để kiểm tra */}
                <div className="mt-6 border-t border-line pt-6">
                  <Eyebrow tone="muted">Giấy phép nhân giống</Eyebrow>
                  {currentSeller.businessLicenseUrl ? (
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <a
                        href={currentSeller.businessLicenseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-sm font-medium text-fg transition-colors hover:border-line-strong hover:bg-surface"
                      >
                        <span>Mở giấy phép</span>
                        <ExternalLink className="size-4" aria-hidden="true" />
                        <span className="sr-only">(mở trong thẻ mới)</span>
                      </a>
                      <span className="min-w-0 truncate font-mono text-xs text-fg-3">{currentSeller.businessLicenseUrl}</span>
                    </div>
                  ) : (
                    <p role="note" className="mt-3 text-sm leading-relaxed text-danger">
                      Hồ sơ chưa đính kèm giấy phép cơ sở nhân giống. Nên từ chối kèm yêu cầu bổ sung.
                    </p>
                  )}
                  {currentSeller.approvedByAdminId && (
                    <p className="mt-3 text-sm text-fg-3">
                      Người xử lý gần nhất: <span className="font-mono text-fg-2">#{currentSeller.approvedByAdminId}</span>
                    </p>
                  )}
                </div>

                {/* Thanh hành động */}
                {(currentSeller.status === 'PENDING' || currentSeller.status === 'ACTIVE') && (
                  <div className="mt-auto flex flex-wrap items-center justify-end gap-3 border-t border-line pt-6">
                    {currentSeller.status === 'PENDING' && (
                      <>
                        <Button variant="danger" pill onClick={openReject} aria-keyshortcuts="R">
                          Từ chối
                          <Kbd aria-hidden="true" className="ml-1 hidden md:inline-flex">R</Kbd>
                        </Button>
                        <Button pill onClick={() => setIsApproveOpen(true)} aria-keyshortcuts="A">
                          Duyệt cửa hàng
                          <Kbd aria-hidden="true" className="ml-1 hidden border-black/20 bg-black/10 text-accent-ink md:inline-flex">A</Kbd>
                        </Button>
                      </>
                    )}
                    {currentSeller.status === 'ACTIVE' && (
                      <Button variant="danger" pill onClick={() => setIsBanOpen(true)} leftIcon={<Ban className="size-4" aria-hidden="true" />}>
                        Khóa cửa hàng
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
          </Panel>
        </div>
      )}

      {/* Duyệt hồ sơ */}
      <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Duyệt cửa hàng này?</DialogTitle>
            <DialogDescription>Shop sẽ được đăng sản phẩm lên sàn sau khi duyệt.</DialogDescription>
          </DialogHeader>
          {currentSeller && (
            <div className="mt-5 border-y border-line py-4 text-sm">
              <p className="text-base font-semibold text-fg">{currentSeller.shopName}</p>
              {(currentSeller.ownerFullName || currentSeller.ownerUsername) && (
                <p className="mt-1 text-fg-3">
                  Chủ cơ sở: {currentSeller.ownerFullName}
                  {currentSeller.ownerUsername && ` (@${currentSeller.ownerUsername})`}
                </p>
              )}
              {currentSeller.businessLicenseUrl ? (
                <p className="mt-2 text-fg-2">Có giấy phép đính kèm: hãy mở và kiểm tra trước khi duyệt.</p>
              ) : (
                <p className="mt-2 font-medium text-danger">Hồ sơ chưa đính kèm giấy phép.</p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" pill onClick={() => setIsApproveOpen(false)}>
              Hủy
            </Button>
            <Button pill onClick={handleApprove} isLoading={moderateSellerMutation.isPending}>
              Duyệt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Từ chối hồ sơ: bắt buộc lý do từ 10 ký tự */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Từ chối hồ sơ cửa hàng</DialogTitle>
            <DialogDescription>Lý do được lưu cùng quyết định kiểm duyệt (tối thiểu 10 ký tự).</DialogDescription>
          </DialogHeader>

          <div className="mt-5 space-y-4">
            <div>
              <p className="text-sm text-fg-3">Chọn nhanh</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {QUICK_REJECTION_REASONS.map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setRejectionReason(reason)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-left text-sm transition-colors',
                      rejectionReason === reason ? 'border-danger bg-danger/10 text-fg' : 'border-line text-fg-2 hover:border-line-strong hover:text-fg'
                    )}
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="seller-reject-reason" className="text-sm text-fg-2">
                Lý do từ chối
              </label>
              <textarea
                id="seller-reject-reason"
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Ví dụ: Giấy phép bị mờ, không đọc được số hiệu cơ sở."
                aria-describedby="seller-reject-reason-count"
                className="mt-2 w-full rounded-[10px] border border-line bg-surface-2 p-3.5 text-sm text-fg placeholder:text-fg-3 focus:border-danger focus:outline-none"
              />
              <p id="seller-reject-reason-count" className="mt-1 flex justify-between text-xs text-fg-3">
                <span>Tối thiểu 10 ký tự</span>
                <span className={reasonLength < 10 ? 'text-danger' : 'text-success'}>{reasonLength} ký tự</span>
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" pill onClick={() => setIsRejectOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="danger"
              pill
              onClick={handleReject}
              disabled={reasonLength < 10}
              isLoading={moderateSellerMutation.isPending}
            >
              Từ chối hồ sơ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Khóa cửa hàng */}
      <Dialog open={isBanOpen} onOpenChange={setIsBanOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Khóa cửa hàng?</DialogTitle>
            <DialogDescription>Shop bị khóa không đăng được sản phẩm mới và không mở lại được từ giao diện này.</DialogDescription>
          </DialogHeader>
          {currentSeller && <p className="mt-5 border-y border-line py-4 text-base font-semibold text-fg">{currentSeller.shopName}</p>}
          <DialogFooter>
            <Button variant="ghost" pill onClick={() => setIsBanOpen(false)}>
              Hủy
            </Button>
            <Button variant="danger" pill onClick={handleBan} isLoading={moderateSellerMutation.isPending}>
              Khóa cửa hàng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ShortcutHelpDialog open={isHelpOpen} onOpenChange={setIsHelpOpen} items={SHORTCUTS} />
    </PageContainer>
  );
}
