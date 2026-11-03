import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import {
  Store,
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  Ban,
  FileText,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Calendar,
  RotateCw,
} from 'lucide-react';
import { useAdminSellers } from '@/api/queries/useAdminQueries';
import { useModerateSeller } from '@/api/mutations/useAdminMutations';
import { StatusPill } from '@/components/ui/StatusPill';
import { Kbd } from '@/components/ui/Kbd';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import type { SellerDto, SellerStatus } from '@/types/api';

const QUICK_REJECTION_REASONS = [
  'Thiếu giấy chứng nhận cơ sở nhân giống F2+ theo Nghị định 06/2019/NĐ-CP',
  'Bản scan giấy phép CITES bị mờ, không rõ số hiệu hoặc thiếu dấu mộc đỏ',
  'Địa chỉ cơ sở nuôi cấy không trùng khớp với thông tin đăng ký kiểm lâm',
  'Loài đăng ký nhân giống thuộc Phụ lục I cấm thương mại quốc tế',
];

// Tài liệu 01 mục 7: không render quá 50 dòng một lúc
const PAGE_SIZE = 50;

const STATUS_TABS: { id: SellerStatus | 'ALL'; label: string }[] = [
  { id: 'PENDING', label: 'Chờ duyệt' },
  { id: 'ACTIVE', label: 'Đang bán' },
  { id: 'REJECTED', label: 'Từ chối' },
  { id: 'BANNED', label: 'Bị khóa' },
  { id: 'ALL', label: 'Tất cả' },
];

/** Phím tắt không được chạy khi người dùng đang gõ chữ */
function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable);
}

function formatDateVi(value?: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString('vi-VN');
}

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

export default function AdminSellersPage(): React.JSX.Element {
  const { data, isLoading, isError, refetch } = useAdminSellers();
  const moderateSellerMutation = useModerateSeller();
  const allSellers = useMemo(() => data ?? [], [data]);

  // State
  const [selectedStatus, setSelectedStatus] = useState<SellerStatus | 'ALL'>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSellerId, setSelectedSellerId] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const listRef = useRef<HTMLUListElement>(null);

  // Modals state
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isBanOpen, setIsBanOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Danh sách đã lọc theo trạng thái và tìm kiếm (memo để effect tự chọn không chạy mỗi lần render)
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

  // Tự động chọn hồ sơ đầu tiên nếu chưa chọn hoặc hồ sơ cũ không còn trong danh sách
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

  // Điều hướng J/K
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
          setRejectionReason('');
          setIsRejectOpen(true);
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

  // Phê duyệt
  const handleApprove = async () => {
    if (!currentSeller) return;
    try {
      await moderateSellerMutation.mutateAsync({ sellerId: currentSeller.id, status: 'ACTIVE' });
      setIsApproveOpen(false);
      toast.success(`Đã cấp phép hoạt động cho ${currentSeller.shopName}`);
    } catch (err) {
      toast.error(errorMessage(err, 'Không phê duyệt được hồ sơ này'));
    }
  };

  // Từ chối
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

  // Khóa shop đang hoạt động
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Header Trang */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-warm/30 bg-warm/10 px-3 py-1 text-xs font-semibold text-warm mb-1.5">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            <span>Thẩm định hồ sơ mở shop nhân giống</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-fg font-sans">
            Kiểm duyệt Đối tác Người bán
          </h1>
          <p className="text-xs md:text-sm text-fg-3">
            Xác minh giấy phép cơ sở nhân giống trước khi cho phép mở bán.
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

      {/* 2. Khung danh sách trái, chi tiết phải */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[650px]">
        <div className="lg:col-span-5 rounded-2xl border border-line bg-surface/90 backdrop-blur-xl p-4 flex flex-col gap-4">
          {/* Lọc theo trạng thái */}
          <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-line/60" role="group" aria-label="Lọc theo trạng thái">
            {STATUS_TABS.map((tab) => {
              const isActive = selectedStatus === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setSelectedStatus(tab.id)}
                  className={`rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all flex items-center gap-1.5 ${
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

          {/* Ô tìm kiếm */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-fg-3" aria-hidden="true" />
            <input
              type="search"
              aria-label="Tìm hồ sơ shop"
              placeholder="Tìm theo tên shop, chủ hộ, tài khoản..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-line bg-bg-deep/60 pl-9 pr-4 py-2 text-xs text-fg placeholder:text-fg-3 focus:border-accent focus:outline-none"
            />
          </div>

          {/* Danh sách hàng đợi */}
          <div className="flex-1 overflow-y-auto pr-1 max-h-[550px]">
            {isLoading ? (
              <div className="flex h-40 items-center justify-center text-accent text-xs" role="status">
                <span>Đang tải danh sách hồ sơ...</span>
              </div>
            ) : isError ? (
              <div role="alert" className="rounded-xl border border-danger/40 bg-danger/10 p-6 text-center text-xs text-danger space-y-3">
                <p>Không tải được hàng đợi hồ sơ shop.</p>
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-danger/40 px-3 py-1.5 font-semibold hover:bg-danger/15"
                >
                  <RotateCw className="size-3.5" aria-hidden="true" />
                  <span>Thử lại</span>
                </button>
              </div>
            ) : filteredSellers.length === 0 ? (
              <div className="rounded-xl border border-line/40 bg-bg-deep/40 p-8 text-center text-fg-3 text-xs">
                <Store className="size-8 mx-auto mb-2 opacity-40" aria-hidden="true" />
                <p>Không có cửa hàng nào thỏa mãn điều kiện lọc.</p>
              </div>
            ) : (
              <>
                <ul ref={listRef} className="space-y-2" aria-label="Hàng đợi hồ sơ shop">
                  <AnimatePresence initial={false}>
                    {visibleSellers.map((seller) => {
                      const isSelected = seller.id === selectedSellerId;
                      const hasLicense = !!seller.businessLicenseUrl;

                      return (
                        <motion.li
                          key={seller.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: seller.status === 'ACTIVE' ? 40 : -40 }}
                          transition={{ duration: 0.15 }}
                        >
                          <button
                            type="button"
                            data-seller-id={seller.id}
                            aria-pressed={isSelected}
                            onClick={() => setSelectedSellerId(seller.id)}
                            className={`group w-full text-left rounded-xl border p-3.5 transition-all duration-150 relative ${
                              isSelected
                                ? 'border-accent bg-accent/10'
                                : 'border-line/60 bg-bg-deep/40 hover:border-line-strong hover:bg-surface-hover'
                            }`}
                          >
                            {isSelected && (
                              <span className="absolute left-0 top-2 bottom-2 w-1 bg-accent rounded-r" aria-hidden="true" />
                            )}

                            <span className="flex items-start justify-between gap-2">
                              <span>
                                <span className="block text-sm font-semibold text-fg group-hover:text-accent transition-colors">
                                  {seller.shopName}
                                </span>
                                <span className="block text-xs text-fg-3 mt-0.5">
                                  {seller.ownerFullName || `Người dùng #${seller.userId}`}
                                  {seller.ownerUsername && (
                                    <span className="font-mono text-[11px]"> (@{seller.ownerUsername})</span>
                                  )}
                                </span>
                              </span>
                              <StatusPill status={seller.status} />
                            </span>

                            <span className="mt-3 flex items-center justify-between text-[11px] pt-2 border-t border-line/30">
                              {hasLicense ? (
                                <span className="inline-flex items-center gap-1 font-semibold text-accent">
                                  <FileText className="size-3" aria-hidden="true" />
                                  <span>Có giấy phép</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 font-semibold text-danger">
                                  <AlertTriangle className="size-3" aria-hidden="true" />
                                  <span>Thiếu giấy phép</span>
                                </span>
                              )}
                              <span className="font-mono text-fg-3">Mã #{seller.id}</span>
                            </span>
                          </button>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
                {filteredSellers.length > visibleCount && (
                  <button
                    type="button"
                    onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                    className="mt-3 w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold text-fg-2 hover:text-fg hover:border-line-strong"
                  >
                    Xem thêm ({filteredSellers.length - visibleCount} hồ sơ)
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Cột chi tiết */}
        <div className="lg:col-span-7 rounded-2xl border border-line bg-surface/90 backdrop-blur-xl p-6 flex flex-col justify-between">
          {!currentSeller ? (
            <div className="flex h-full flex-col items-center justify-center p-12 text-center text-fg-3">
              <Store className="size-12 mb-3 opacity-30 text-accent" aria-hidden="true" />
              <p className="text-base font-semibold text-fg">Chưa chọn hồ sơ nào</p>
              <p className="text-xs text-fg-3 mt-1">Chọn một cơ sở từ danh sách bên trái hoặc dùng phím J/K để duyệt.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-line pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl md:text-2xl font-bold text-fg tracking-tight">{currentSeller.shopName}</h2>
                    <span className="rounded-md border border-line bg-surface px-2 py-0.5 text-xs font-mono text-fg-3">
                      Mã #{currentSeller.id}
                    </span>
                  </div>
                  <p className="text-xs text-fg-3 mt-1 flex items-center gap-1.5">
                    <Calendar className="size-3" aria-hidden="true" />
                    <span>Ngày nộp: {submittedDate ?? 'Chưa có'}</span>
                  </p>
                </div>
                <StatusPill status={currentSeller.status} />
              </div>

              {/* Thông tin chủ sở hữu: chỉ hiện dữ liệu có thật trong DTO */}
              <div className="rounded-xl border border-line/50 bg-bg-deep/40 p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-fg-2 flex items-center gap-2">
                  <Store className="size-3.5 text-accent" aria-hidden="true" />
                  <span>Hồ sơ chủ cơ sở</span>
                </h3>

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <dt className="text-fg-3 text-[11px]">Họ và tên đại diện</dt>
                    <dd className="font-semibold text-fg">{currentSeller.ownerFullName || 'Chưa có'}</dd>
                  </div>
                  <div>
                    <dt className="text-fg-3 text-[11px]">Tên đăng nhập</dt>
                    <dd className="font-mono text-fg-2">
                      {currentSeller.ownerUsername ? `@${currentSeller.ownerUsername}` : `Người dùng #${currentSeller.userId}`}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-fg-3 text-[11px]">Email liên hệ</dt>
                    <dd className="text-fg-2 flex items-center gap-1 mt-0.5">
                      <Mail className="size-3 text-fg-3" aria-hidden="true" />
                      <span>{currentSeller.ownerEmail || 'Chưa có'}</span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-fg-3 text-[11px]">Số điện thoại</dt>
                    <dd className="flex items-center gap-1.5 mt-0.5">
                      <Phone className="size-3 text-fg-3" aria-hidden="true" />
                      <span className="font-mono text-fg">{currentSeller.ownerPhone || 'Chưa có'}</span>
                      {currentSeller.ownerPhone && (
                        <button
                          type="button"
                          onClick={() => void copyPhoneNumber(currentSeller.ownerPhone!)}
                          className="rounded p-1 text-fg-3 hover:text-accent transition-colors"
                          aria-label="Sao chép số điện thoại"
                        >
                          {copiedPhone ? <Check className="size-3 text-success" aria-hidden="true" /> : <Copy className="size-3" aria-hidden="true" />}
                        </button>
                      )}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-fg-3 text-[11px]">Địa chỉ</dt>
                    <dd className="text-fg-2 flex items-center gap-1 mt-0.5">
                      <MapPin className="size-3 text-fg-3" aria-hidden="true" />
                      <span>{currentSeller.ownerAddress || 'Chưa có'}</span>
                    </dd>
                  </div>
                </dl>

                {currentSeller.bio && (
                  <div className="pt-2 border-t border-line/30 text-xs">
                    <span className="text-fg-3 block text-[11px] mb-1">Giới thiệu cơ sở</span>
                    <p className="text-fg-2 italic bg-surface/40 p-2.5 rounded-lg border border-line/30">"{currentSeller.bio}"</p>
                  </div>
                )}
              </div>

              {/* Giấy phép: chỉ có đường dẫn trong DTO, người duyệt phải mở tệp gốc để kiểm tra */}
              <div className="rounded-xl border border-line/50 bg-bg-deep/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-fg-2 flex items-center gap-2">
                    <FileText className="size-3.5 text-accent" aria-hidden="true" />
                    <span>Giấy phép cơ sở nhân giống</span>
                  </h3>
                  {currentSeller.businessLicenseUrl ? (
                    <span className="rounded-full bg-success/15 border border-success/30 px-2 py-0.5 text-[10px] font-bold text-success uppercase">
                      Đã đính kèm
                    </span>
                  ) : (
                    <span className="rounded-full bg-danger/15 border border-danger/30 px-2 py-0.5 text-[10px] font-bold text-danger uppercase">
                      Chưa nộp
                    </span>
                  )}
                </div>

                {currentSeller.businessLicenseUrl ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={currentSeller.businessLicenseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-fg hover:border-line-strong hover:bg-surface-hover transition-colors"
                    >
                      <span>Mở giấy phép</span>
                      <ExternalLink className="size-3" aria-hidden="true" />
                      <span className="sr-only">(mở trong thẻ mới)</span>
                    </a>
                    <span className="text-[11px] text-fg-3 break-all">{currentSeller.businessLicenseUrl}</span>
                  </div>
                ) : (
                  <div role="note" className="rounded-xl border border-danger/40 bg-danger/10 p-3 text-xs text-danger space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="size-3.5" aria-hidden="true" />
                      <span>Thiếu giấy phép</span>
                    </p>
                    <p className="text-fg-2 text-[11px] leading-relaxed">
                      Hồ sơ chưa đính kèm giấy chứng nhận cơ sở nhân giống. Nên từ chối kèm yêu cầu bổ sung.
                    </p>
                  </div>
                )}
              </div>

              {currentSeller.approvedByAdminId && (
                <div className="rounded-xl border border-line/40 bg-surface/30 p-3 text-xs flex items-center justify-between">
                  <span className="text-fg-3">Quản trị viên xử lý gần nhất:</span>
                  <span className="font-mono text-accent">#{currentSeller.approvedByAdminId}</span>
                </div>
              )}
            </div>
          )}

          {/* Thanh tác vụ kiểm duyệt */}
          {currentSeller && (
            <div className="pt-6 border-t border-line mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-fg-3 flex items-center gap-2">
                {currentSeller.status === 'PENDING' ? (
                  <span>Chọn hành động quyết định hồ sơ này:</span>
                ) : (
                  <>
                    <span>Trạng thái:</span>
                    <StatusPill status={currentSeller.status} />
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                {currentSeller.status === 'PENDING' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setRejectionReason('');
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
                      <span>Phê duyệt cấp phép</span>
                      <Kbd className="bg-black/20 text-accent-ink border-black/30">A</Kbd>
                    </button>
                  </>
                )}

                {currentSeller.status === 'ACTIVE' && (
                  <button
                    type="button"
                    onClick={() => setIsBanOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-danger/40 bg-danger/15 px-4 py-2 text-xs font-semibold text-danger hover:bg-danger/25 transition-colors"
                  >
                    <Ban className="size-3.5" aria-hidden="true" />
                    <span>Khóa cửa hàng</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Chú thích phím tắt ở đáy màn hình */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 rounded-2xl border border-line bg-bg-raised/90 backdrop-blur-2xl px-5 py-2.5 shadow-2xl hidden md:flex items-center gap-5 text-xs text-fg-2">
        <span className="font-semibold text-fg flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-accent" aria-hidden="true" />
          <span>Phím tắt:</span>
        </span>
        <div className="flex items-center gap-1.5"><Kbd>J</Kbd><span>Kế tiếp</span></div>
        <div className="flex items-center gap-1.5"><Kbd>K</Kbd><span>Trước</span></div>
        <div className="flex items-center gap-1.5"><Kbd>A</Kbd><span className="text-accent">Duyệt</span></div>
        <div className="flex items-center gap-1.5"><Kbd>R</Kbd><span className="text-danger">Từ chối</span></div>
        <div className="flex items-center gap-1.5"><Kbd>Esc</Kbd><span>Đóng hộp thoại</span></div>
        <div className="flex items-center gap-1.5"><Kbd>?</Kbd><span>Trợ giúp</span></div>
      </div>

      {/* DIALOG 1: Phê duyệt hồ sơ */}
      <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-success">
              <CheckCircle2 className="size-5" aria-hidden="true" />
              <span>Xác nhận Cấp phép Cửa hàng</span>
            </DialogTitle>
            <DialogDescription className="text-fg-2 text-xs">
              Bạn đang chuẩn bị phê duyệt tư cách người bán cho:
            </DialogDescription>
          </DialogHeader>

          {currentSeller && (
            <div className="rounded-xl border border-line bg-surface p-4 my-2 space-y-1.5 text-xs">
              <p className="text-base font-bold text-fg">{currentSeller.shopName}</p>
              {(currentSeller.ownerFullName || currentSeller.ownerUsername) && (
                <p className="text-fg-3">
                  Đại diện: {currentSeller.ownerFullName}
                  {currentSeller.ownerUsername && ` (@${currentSeller.ownerUsername})`}
                </p>
              )}
              {currentSeller.businessLicenseUrl ? (
                <p className="text-fg-2 text-[11px]">Có giấy phép đính kèm: hãy mở và kiểm tra trước khi duyệt.</p>
              ) : (
                <p className="text-danger text-[11px] font-semibold">Hồ sơ chưa đính kèm giấy phép.</p>
              )}
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
              disabled={moderateSellerMutation.isPending}
              className="rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-accent-ink hover:opacity-90 disabled:opacity-50"
            >
              {moderateSellerMutation.isPending ? 'Đang cấp phép...' : 'Xác nhận Phê duyệt'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG 2: Từ chối hồ sơ (bắt buộc lý do >= 10 ký tự) */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-danger">
              <XCircle className="size-5" aria-hidden="true" />
              <span>Từ chối Cấp phép Đối tác</span>
            </DialogTitle>
            <DialogDescription className="text-fg-2 text-xs">
              Nhập lý do từ chối (tối thiểu 10 ký tự) để ghi nhận quyết định kiểm duyệt.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 my-2">
            <div>
              <span className="text-[11px] text-fg-3 block mb-1.5">Mẫu lý do nhanh:</span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_REJECTION_REASONS.map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setRejectionReason(reason)}
                    className="rounded-lg border border-line/60 bg-surface px-2.5 py-1 text-[11px] text-fg-2 hover:border-accent hover:text-fg transition-colors text-left"
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="seller-reject-reason" className="sr-only">
                Lý do từ chối
              </label>
              <textarea
                id="seller-reject-reason"
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Nhập chi tiết căn cứ từ chối theo Nghị định 06/2019/NĐ-CP..."
                aria-describedby="seller-reject-reason-count"
                className="w-full rounded-xl border border-line bg-bg-deep p-3 text-xs text-fg placeholder:text-fg-3 focus:border-danger focus:outline-none"
              />
              <div id="seller-reject-reason-count" className="flex justify-between items-center text-[11px] text-fg-3 mt-1">
                <span>Tối thiểu 10 ký tự</span>
                <span className={rejectionReason.trim().length < 10 ? 'text-danger' : 'text-success'}>
                  {rejectionReason.trim().length} ký tự
                </span>
              </div>
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
              disabled={rejectionReason.trim().length < 10 || moderateSellerMutation.isPending}
              className="rounded-xl bg-danger px-4 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-40"
            >
              {moderateSellerMutation.isPending ? 'Đang từ chối...' : 'Xác nhận Từ chối'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG 3: Khóa cửa hàng */}
      <Dialog open={isBanOpen} onOpenChange={setIsBanOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-danger">
              <Ban className="size-5" aria-hidden="true" />
              <span>Khóa cửa hàng</span>
            </DialogTitle>
            <DialogDescription className="text-fg-2 text-xs">
              Cửa hàng sẽ chuyển sang trạng thái Bị khóa và không thể đăng bán sản phẩm mới.
            </DialogDescription>
          </DialogHeader>

          {currentSeller && (
            <div className="rounded-xl border border-danger/40 bg-danger/10 p-4 my-2 text-xs space-y-1">
              <p className="font-bold text-fg">{currentSeller.shopName}</p>
              <p className="text-danger">Theo luật chuyển trạng thái, shop bị khóa không thể mở lại từ giao diện.</p>
            </div>
          )}

          <DialogFooter className="mt-4 gap-2">
            <button
              type="button"
              onClick={() => setIsBanOpen(false)}
              className="rounded-xl border border-line px-4 py-2 text-xs font-semibold text-fg-3 hover:text-fg"
            >
              Hủy bỏ (Esc)
            </button>
            <button
              type="button"
              onClick={handleBan}
              disabled={moderateSellerMutation.isPending}
              className="rounded-xl bg-danger px-4 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {moderateSellerMutation.isPending ? 'Đang khóa...' : 'Xác nhận Khóa'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG 4: Trợ giúp phím tắt */}
      <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-accent">
              <HelpCircle className="size-5" aria-hidden="true" />
              <span>Phím tắt kiểm duyệt</span>
            </DialogTitle>
            <DialogDescription className="text-fg-2 text-xs">
              Phím tắt chỉ hoạt động khi bạn không gõ trong ô nhập liệu.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2.5 my-3 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-surface border border-line/40">
              <span className="text-fg">Hồ sơ kế tiếp</span>
              <div className="flex gap-1"><Kbd>J</Kbd> hoặc <Kbd>↓</Kbd> (trong danh sách)</div>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-surface border border-line/40">
              <span className="text-fg">Hồ sơ liền trước</span>
              <div className="flex gap-1"><Kbd>K</Kbd> hoặc <Kbd>↑</Kbd> (trong danh sách)</div>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-surface border border-line/40">
              <span className="text-fg">Phê duyệt hồ sơ</span>
              <Kbd>A</Kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-surface border border-line/40">
              <span className="text-fg">Từ chối hồ sơ (nhập lý do)</span>
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
