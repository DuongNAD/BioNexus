import React, { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import {
  Store,
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  Ban,
  FileText,
  ExternalLink,
  Copy,
  Check,
  ZoomIn,
  AlertTriangle,
  FileCheck2,
  HelpCircle,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Calendar,
} from 'lucide-react';
import { getAuthState, subscribeAuth } from '@/api/authStore';
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

export default function AdminSellersPage(): React.JSX.Element {
  const auth = useSyncExternalStore(subscribeAuth, getAuthState);
  const { data: allSellers = [], isLoading } = useAdminSellers('ALL');
  const moderateSellerMutation = useModerateSeller();

  // State
  const [selectedStatus, setSelectedStatus] = useState<SellerStatus | 'ALL'>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSellerId, setSelectedSellerId] = useState<number | null>(null);

  // Modals state
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isBanOpen, setIsBanOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isLicenseLightboxOpen, setIsLicenseLightboxOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Phân quyền: Chỉ SUPER_ADMIN và MODERATOR được duyệt
  const userRole = auth.role as string;
  const isAuthorized = auth.token && auth.accountType === 'ADMIN' && (userRole === 'SUPER_ADMIN' || userRole === 'MODERATOR');

  if (!isAuthorized) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
        <div className="size-16 rounded-2xl border border-danger/40 bg-danger/10 flex items-center justify-center text-danger mb-4 shadow-[0_0_25px_rgba(248,113,113,0.2)]">
          <ShieldAlert className="size-8" aria-hidden="true" />
        </div>
        <span className="rounded-full border border-danger/40 bg-danger/15 px-3 py-1 text-xs font-mono font-semibold tracking-wider text-danger uppercase">
          403 Forbidden
        </span>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-fg font-sans">
          Không đủ quyền truy cập
        </h2>
        <p className="mt-2 text-sm text-fg-2 leading-relaxed">
          Tài khoản của bạn ({userRole === 'BIOLOGIST' ? 'Nhà sinh học' : 'Người dùng'}) không có thẩm quyền kiểm duyệt người bán. Khu vực này chỉ dành cho Kiểm duyệt viên (Moderator) và Admin Tổng.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            to="/admin"
            className="rounded-xl border border-line bg-surface px-4 py-2 text-xs font-semibold text-fg hover:bg-surface-hover"
          >
            Về bảng tổng quan
          </Link>
          <Link
            to="/"
            className="rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-accent-ink hover:opacity-90"
          >
            Về trang chủ sàn
          </Link>
        </div>
      </div>
    );
  }

  // Danh sách đã lọc theo trạng thái và tìm kiếm
  const filteredSellers = allSellers.filter((seller) => {
    const matchesStatus = selectedStatus === 'ALL' || seller.status === selectedStatus;
    if (!matchesStatus) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const shopName = seller.shopName.toLowerCase();
    const ownerName = (seller.ownerFullName || '').toLowerCase();
    const ownerUser = (seller.ownerUsername || '').toLowerCase();
    return shopName.includes(q) || ownerName.includes(q) || ownerUser.includes(q);
  });

  // Tự động chọn hồ sơ đầu tiên nếu chưa chọn hoặc hồ sơ cũ không còn trong danh sách
  useEffect(() => {
    if (filteredSellers.length > 0) {
      const exists = filteredSellers.some((s) => s.id === selectedSellerId);
      if (!exists && filteredSellers[0]) {
        setSelectedSellerId(filteredSellers[0].id);
      }
    } else {
      setSelectedSellerId(null);
    }
  }, [filteredSellers, selectedSellerId]);

  const currentSeller: SellerDto | undefined = allSellers.find((s) => s.id === selectedSellerId);

  // Đếm số lượng theo trạng thái
  const counts = {
    PENDING: allSellers.filter((s) => s.status === 'PENDING').length,
    ACTIVE: allSellers.filter((s) => s.status === 'ACTIVE').length,
    REJECTED: allSellers.filter((s) => s.status === 'REJECTED').length,
    BANNED: allSellers.filter((s) => s.status === 'BANNED').length,
    ALL: allSellers.length,
  };

  // Điều hướng J/K
  const selectNext = useCallback(() => {
    if (filteredSellers.length <= 1) return;
    const currentIndex = filteredSellers.findIndex((s) => s.id === selectedSellerId);
    if (currentIndex < filteredSellers.length - 1) {
      const nextItem = filteredSellers[currentIndex + 1];
      if (nextItem) setSelectedSellerId(nextItem.id);
    }
  }, [filteredSellers, selectedSellerId]);

  const selectPrev = useCallback(() => {
    if (filteredSellers.length <= 1) return;
    const currentIndex = filteredSellers.findIndex((s) => s.id === selectedSellerId);
    if (currentIndex > 0) {
      const prevItem = filteredSellers[currentIndex - 1];
      if (prevItem) setSelectedSellerId(prevItem.id);
    }
  }, [filteredSellers, selectedSellerId]);

  // Phím tắt bàn phím tốc độ cao kèm Input Focus Guard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Input focus guard: Nếu đang gõ text trong input/textarea thì bỏ qua
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      // Nếu có modal đang mở, chỉ lắng nghe Escape
      const hasModalOpen = isApproveOpen || isRejectOpen || isBanOpen || isHelpOpen || isLicenseLightboxOpen;
      if (hasModalOpen) {
        if (e.key === 'Escape') {
          setIsApproveOpen(false);
          setIsRejectOpen(false);
          setIsBanOpen(false);
          setIsHelpOpen(false);
          setIsLicenseLightboxOpen(false);
        }
        return;
      }

      if (e.key === 'j' || e.key === 'J' || e.key === 'ArrowDown') {
        e.preventDefault();
        selectNext();
      } else if (e.key === 'k' || e.key === 'K' || e.key === 'ArrowUp') {
        e.preventDefault();
        selectPrev();
      } else if (e.key === 'a' || e.key === 'A') {
        if (currentSeller && currentSeller.status === 'PENDING') {
          e.preventDefault();
          setIsApproveOpen(true);
        }
      } else if (e.key === 'r' || e.key === 'R') {
        if (currentSeller && currentSeller.status === 'PENDING') {
          e.preventDefault();
          setRejectionReason('');
          setIsRejectOpen(true);
        }
      } else if (e.key === '?') {
        e.preventDefault();
        setIsHelpOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectNext,
    selectPrev,
    currentSeller,
    isApproveOpen,
    isRejectOpen,
    isBanOpen,
    isHelpOpen,
    isLicenseLightboxOpen,
  ]);

  // Phê duyệt
  const handleApprove = async () => {
    if (!currentSeller) return;
    try {
      await moderateSellerMutation.mutateAsync({
        sellerId: currentSeller.id,
        status: 'ACTIVE',
      });
      setIsApproveOpen(false);
      toast.success(`Đã cấp phép hoạt động cho đối tác ${currentSeller.shopName}`);
    } catch {
      toast.error('Có lỗi xảy ra khi phê duyệt đối tác');
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
      toast.success(`Đã từ chối cấp phép đối tác ${currentSeller.shopName}`);
    } catch {
      toast.error('Có lỗi xảy ra khi từ chối hồ sơ');
    }
  };

  // Đình chỉ / Khóa
  const handleBan = async () => {
    if (!currentSeller) return;
    try {
      await moderateSellerMutation.mutateAsync({
        sellerId: currentSeller.id,
        status: 'BANNED',
      });
      setIsBanOpen(false);
      toast.success(`Đã đình chỉ hoạt động đối tác ${currentSeller.shopName}`);
    } catch {
      toast.error('Có lỗi xảy ra khi đình chỉ đối tác');
    }
  };

  const copyPhoneNumber = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(true);
    toast.success('Đã sao chép số điện thoại');
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Header Trang */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-warm/30 bg-warm/10 px-3 py-1 text-xs font-semibold text-warm mb-1.5">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            <span>Thẩm định Pháp lý Nhân giống F2+ CITES (Nghị định 06/2019/NĐ-CP)</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-fg font-sans">
            Kiểm duyệt Đối tác Người bán
          </h1>
          <p className="text-xs md:text-sm text-fg-3">
            Xác minh chứng nhận cơ sở nuôi sinh sản nhân tạo, ngăn chặn buôn bán động vật hoang dã trái phép.
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

      {/* 2. Khung Master-Detail (38% / 62%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[650px]">
        {/* CỘT MASTER (Trái 38% -> col-span-5) */}
        <div className="lg:col-span-5 rounded-2xl border border-line bg-surface/90 backdrop-blur-xl p-4 flex flex-col gap-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-line/60">
            {[
              { id: 'PENDING', label: 'Chờ duyệt', count: counts.PENDING, color: 'text-warm' },
              { id: 'ACTIVE', label: 'Đang bán', count: counts.ACTIVE, color: 'text-success' },
              { id: 'REJECTED', label: 'Từ chối', count: counts.REJECTED, color: 'text-danger' },
              { id: 'BANNED', label: 'Bị khóa', count: counts.BANNED, color: 'text-danger' },
              { id: 'ALL', label: 'Tất cả', count: counts.ALL, color: 'text-fg-3' },
            ].map((tab) => {
              const isActive = selectedStatus === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedStatus(tab.id as typeof selectedStatus)}
                  className={`rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-accent text-accent-ink shadow-[var(--glow-accent-btn)]'
                      : 'border border-line bg-surface text-fg-2 hover:border-line-strong hover:text-fg'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono font-bold ${
                      isActive ? 'bg-black/20 text-accent-ink' : 'bg-surface-2 text-fg-3'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Ô tìm kiếm */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-fg-3" aria-hidden="true" />
            <input
              type="text"
              placeholder="Tìm theo tên shop, chủ hộ, tài khoản..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-line bg-bg-deep/60 pl-9 pr-4 py-2 text-xs text-fg placeholder:text-fg-mute focus:border-accent focus:outline-none"
            />
          </div>

          {/* Danh sách hàng đợi */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[550px]">
            {isLoading ? (
              <div className="flex h-40 items-center justify-center text-accent text-xs">
                <span>Đang tải danh sách hồ sơ...</span>
              </div>
            ) : filteredSellers.length === 0 ? (
              <div className="rounded-xl border border-line/40 bg-bg-deep/40 p-8 text-center text-fg-3 text-xs">
                <Store className="size-8 mx-auto mb-2 opacity-40" aria-hidden="true" />
                <p>Không có cửa hàng nào thỏa mãn điều kiện lọc.</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredSellers.map((seller) => {
                  const isSelected = seller.id === selectedSellerId;
                  const hasLicense = !!seller.businessLicenseUrl;

                  return (
                    <motion.div
                      key={seller.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      onClick={() => setSelectedSellerId(seller.id)}
                      className={`group rounded-xl border p-3.5 transition-all duration-150 cursor-pointer relative ${
                        isSelected
                          ? 'border-accent bg-accent/10 shadow-[0_0_15px_rgba(110,231,183,0.1)]'
                          : 'border-line/60 bg-bg-deep/40 hover:border-line-strong hover:bg-surface-hover'
                      }`}
                    >
                      {/* Active marker line */}
                      {isSelected && (
                        <span className="absolute left-0 top-2 bottom-2 w-1 bg-accent rounded-r" />
                      )}

                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-semibold text-fg group-hover:text-accent transition-colors">
                            {seller.shopName}
                          </h3>
                          <p className="text-xs text-fg-3 mt-0.5">
                            {seller.ownerFullName} <span className="font-mono text-[11px]">(@{seller.ownerUsername})</span>
                          </p>
                        </div>
                        <StatusPill status={seller.status} />
                      </div>

                      <div className="mt-3 flex items-center justify-between text-[11px] pt-2 border-t border-line/30">
                        {hasLicense ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-accent">
                            <ShieldCheck className="size-3" aria-hidden="true" />
                            <span>CITES F2+</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-semibold text-danger">
                            <AlertTriangle className="size-3" aria-hidden="true" />
                            <span>Thiếu giấy phép</span>
                          </span>
                        )}

                        <span className="font-mono text-fg-mute">ID: #{seller.id}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* CỘT DETAIL (Phải 62% -> col-span-7) */}
        <div className="lg:col-span-7 rounded-2xl border border-line bg-surface/90 backdrop-blur-xl p-6 flex flex-col justify-between">
          {!currentSeller ? (
            <div className="flex h-full flex-col items-center justify-center p-12 text-center text-fg-3">
              <Store className="size-12 mb-3 opacity-30 text-accent" aria-hidden="true" />
              <p className="text-base font-semibold text-fg">Chưa chọn hồ sơ nào</p>
              <p className="text-xs text-fg-3 mt-1">Chọn một cơ sở từ danh sách bên trái hoặc dùng phím [J]/[K] để duyệt.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header chi tiết */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-line pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl md:text-2xl font-bold text-fg tracking-tight">
                      {currentSeller.shopName}
                    </h2>
                    <span className="rounded-md border border-line bg-surface px-2 py-0.5 text-xs font-mono text-fg-3">
                      ID: #{currentSeller.id}
                    </span>
                  </div>
                  <p className="text-xs text-fg-3 mt-1 flex items-center gap-1.5">
                    <Calendar className="size-3" aria-hidden="true" />
                    <span>Ngày nộp: 01/03/2026</span>
                  </p>
                </div>
                <StatusPill status={currentSeller.status} />
              </div>

              {/* Thông tin chủ sở hữu */}
              <div className="rounded-xl border border-line/50 bg-bg-deep/40 p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-fg-2 flex items-center gap-2">
                  <Store className="size-3.5 text-accent" aria-hidden="true" />
                  <span>Hồ sơ Chủ cơ sở / Đơn vị Đăng ký</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-fg-mute block text-[11px]">Họ và tên đại diện:</span>
                    <span className="font-semibold text-fg">{currentSeller.ownerFullName}</span>
                  </div>
                  <div>
                    <span className="text-fg-mute block text-[11px]">Tên đăng nhập:</span>
                    <span className="font-mono text-fg-2">@{currentSeller.ownerUsername}</span>
                  </div>
                  <div>
                    <span className="text-fg-mute block text-[11px]">Email liên hệ:</span>
                    <span className="text-fg-2 flex items-center gap-1 mt-0.5">
                      <Mail className="size-3 text-fg-3" aria-hidden="true" />
                      <span>{currentSeller.ownerEmail || 'thib@gmail.com'}</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-fg-mute block text-[11px]">Số điện thoại:</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Phone className="size-3 text-fg-3" aria-hidden="true" />
                      <span className="font-mono text-fg">{currentSeller.ownerPhone || '0912345678'}</span>
                      <button
                        type="button"
                        onClick={() => copyPhoneNumber(currentSeller.ownerPhone || '0912345678')}
                        className="rounded p-1 text-fg-3 hover:text-accent transition-colors"
                        title="Sao chép số điện thoại"
                      >
                        {copiedPhone ? <Check className="size-3 text-success" /> : <Copy className="size-3" />}
                      </button>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-fg-mute block text-[11px]">Địa chỉ cơ sở nhân giống:</span>
                    <span className="text-fg-2 flex items-center gap-1 mt-0.5">
                      <MapPin className="size-3 text-fg-3" aria-hidden="true" />
                      <span>{currentSeller.ownerAddress || 'Cầu Giấy, Hà Nội, Việt Nam'}</span>
                    </span>
                  </div>
                </div>

                {currentSeller.bio && (
                  <div className="pt-2 border-t border-line/30 text-xs">
                    <span className="text-fg-mute block text-[11px] mb-1">Năng lực cơ sở:</span>
                    <p className="text-fg-2 italic bg-surface/40 p-2.5 rounded-lg border border-line/30">
                      "{currentSeller.bio}"
                    </p>
                  </div>
                )}
              </div>

              {/* Thẩm định giấy phép CITES F2+ */}
              <div className="rounded-xl border border-line/50 bg-bg-deep/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-fg-2 flex items-center gap-2">
                    <FileText className="size-3.5 text-accent" aria-hidden="true" />
                    <span>Chứng nhận CITES F2+ (Nghị định 06/2019/NĐ-CP)</span>
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
                  <div className="space-y-3">
                    <div className="rounded-xl border border-accent/30 bg-accent/5 p-3 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-fg-mute text-[11px]">Số hiệu đăng ký trại nuôi:</span>
                        <span className="font-mono font-bold text-accent">VN-CITES-2026-F2-0489</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-fg-mute text-[11px]">Cơ quan cấp phép:</span>
                        <span className="text-fg font-medium">Chi cục Kiểm lâm — Sở NN&PTNT</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-fg-mute text-[11px]">Loại hình:</span>
                        <span className="text-fg-2">Sinh sản nhân tạo thế hệ F2 (Captive-bred)</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsLicenseLightboxOpen(true)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-fg hover:border-line-strong hover:bg-surface-hover transition-colors"
                      >
                        <ZoomIn className="size-3.5 text-accent" aria-hidden="true" />
                        <span>Xem scan dấu mộc đỏ</span>
                      </button>

                      <a
                        href={currentSeller.businessLicenseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-fg-3 hover:text-fg hover:border-line-strong transition-colors"
                      >
                        <span>Tệp tài liệu gốc</span>
                        <ExternalLink className="size-3" aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-danger/40 bg-danger/10 p-3 text-xs text-danger space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="size-3.5" aria-hidden="true" />
                      <span>CẢNH BÁO: HỒ SƠ CHƯA ĐÍNH KÈM GIẤY PHÉP KINH DOANH VÀ CITES</span>
                    </p>
                    <p className="text-fg-2 text-[11px] leading-relaxed">
                      Tuyệt đối không phê duyệt đối tác chưa xuất trình giấy chứng nhận cơ sở nhân giống F2+. Khuyến nghị từ chối hồ sơ kèm yêu cầu bổ sung văn bản kiểm lâm.
                    </p>
                  </div>
                )}
              </div>

              {/* Lịch sử kiểm duyệt */}
              {currentSeller.approvedByAdminId && (
                <div className="rounded-xl border border-line/40 bg-surface/30 p-3 text-xs flex items-center justify-between">
                  <span className="text-fg-3">Admin phê duyệt gần nhất:</span>
                  <span className="font-mono text-accent">Admin #{currentSeller.approvedByAdminId}</span>
                </div>
              )}
            </div>
          )}

          {/* Thanh tác vụ kiểm duyệt */}
          {currentSeller && (
            <div className="pt-6 border-t border-line mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-fg-3">
                {currentSeller.status === 'PENDING' ? (
                  <span>Chọn hành động quyết định hồ sơ này:</span>
                ) : (
                  <span>Trạng thái: <strong>{currentSeller.status}</strong></span>
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
                    <span>Đình chỉ / Khóa cửa hàng</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Thanh phím tắt nổi ở đáy màn hình (Speed Moderation Bar) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 rounded-2xl border border-line bg-bg-raised/90 backdrop-blur-2xl px-5 py-2.5 shadow-2xl hidden md:flex items-center gap-5 text-xs text-fg-2">
        <span className="font-semibold text-fg flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-accent" aria-hidden="true" />
          <span>Kiểm duyệt tốc độ cao:</span>
        </span>

        <div className="flex items-center gap-1.5">
          <Kbd>J</Kbd>
          <span>Kế tiếp</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Kbd>K</Kbd>
          <span>Trước</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Kbd>A</Kbd>
          <span className="text-accent">Duyệt</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Kbd>R</Kbd>
          <span className="text-danger">Từ chối</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Kbd>Esc</Kbd>
          <span>Hủy modal</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Kbd>?</Kbd>
          <span>Trợ giúp</span>
        </div>
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
              Bạn đang chuẩn bị phê duyệt tư cách Người bán cho đối tác:
            </DialogDescription>
          </DialogHeader>

          {currentSeller && (
            <div className="rounded-xl border border-line bg-surface p-4 my-2 space-y-1.5 text-xs">
              <p className="text-base font-bold text-fg">{currentSeller.shopName}</p>
              <p className="text-fg-3">Đại diện: {currentSeller.ownerFullName} (@{currentSeller.ownerUsername})</p>
              <p className="text-accent font-mono text-[11px]">Chứng nhận F2+ CITES đã kiểm tra</p>
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

      {/* DIALOG 2: Từ chối hồ sơ (Bắt buộc lý do >= 10 ký tự) */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-danger">
              <XCircle className="size-5" aria-hidden="true" />
              <span>Từ chối Cấp phép Đối tác</span>
            </DialogTitle>
            <DialogDescription className="text-fg-2 text-xs">
              Bắt buộc nhập lý do từ chối gửi tới đối tác (tối thiểu 10 ký tự):
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 my-2">
            {/* Quick chips */}
            <div>
              <span className="text-[11px] text-fg-mute block mb-1.5">Mẫu lý do nhanh:</span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_REJECTION_REASONS.map((reason, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setRejectionReason(reason)}
                    className="rounded-lg border border-line/60 bg-surface px-2.5 py-1 text-[11px] text-fg-3 hover:border-accent hover:text-fg transition-colors text-left"
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>

            {/* Input textarea */}
            <div>
              <textarea
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Nhập chi tiết căn cứ từ chối theo Nghị định 06/2019/NĐ-CP..."
                className="w-full rounded-xl border border-line bg-bg-deep p-3 text-xs text-fg placeholder:text-fg-mute focus:border-danger focus:outline-none"
              />
              <div className="flex justify-between items-center text-[10px] text-fg-mute mt-1">
                <span>Tối thiểu 10 ký tự</span>
                <span className={rejectionReason.length < 10 ? 'text-danger' : 'text-success'}>
                  {rejectionReason.length} ký tự
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

      {/* DIALOG 3: Khóa / Đình chỉ cửa hàng */}
      <Dialog open={isBanOpen} onOpenChange={setIsBanOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-danger">
              <Ban className="size-5" aria-hidden="true" />
              <span>Đình chỉ Hoạt động Cửa hàng</span>
            </DialogTitle>
            <DialogDescription className="text-fg-2 text-xs">
              Hành động này sẽ tạm ngừng mở bán toàn bộ cá thể cảnh của đối tác và chuyển trạng thái shop sang BANNED.
            </DialogDescription>
          </DialogHeader>

          {currentSeller && (
            <div className="rounded-xl border border-danger/40 bg-danger/10 p-4 my-2 text-xs space-y-1">
              <p className="font-bold text-fg">{currentSeller.shopName}</p>
              <p className="text-danger">Cảnh báo: Hành vi gian lận nguồn gốc CITES sẽ bị lưu nhật ký kiểm định.</p>
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
              {moderateSellerMutation.isPending ? 'Đang đình chỉ...' : 'Xác nhận Đình chỉ'}
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
              <span>Hệ thống Phím tắt Kiểm duyệt</span>
            </DialogTitle>
            <DialogDescription className="text-fg-2 text-xs">
              Thao tác thẩm định hàng loạt hồ sơ không cần rời tay khỏi bàn phím:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2.5 my-3 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-surface border border-line/40">
              <span className="text-fg">Hồ sơ kế tiếp</span>
              <div className="flex gap-1"><Kbd>J</Kbd> hoặc <Kbd>↓</Kbd></div>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-surface border border-line/40">
              <span className="text-fg">Hồ sơ liền trước</span>
              <div className="flex gap-1"><Kbd>K</Kbd> hoặc <Kbd>↑</Kbd></div>
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
            <div className="flex items-center justify-between p-2 rounded-lg bg-surface border border-line/40">
              <span className="text-fg">Bật/tắt trợ giúp này</span>
              <Kbd>?</Kbd>
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

      {/* DIALOG 5: Xem scan giấy phép CITES dấu mộc đỏ */}
      <Dialog open={isLicenseLightboxOpen} onOpenChange={setIsLicenseLightboxOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-accent">
              <FileCheck2 className="size-5" aria-hidden="true" />
              <span>Chứng thư Thẩm định Cơ sở Nhân giống F2+ CITES</span>
            </DialogTitle>
            <DialogDescription className="text-fg-2 text-xs">
              Bản quét giấy chứng nhận theo Nghị định 06/2019/NĐ-CP:
            </DialogDescription>
          </DialogHeader>

          {/* Khung mô phỏng chứng thư CITES có mộc đỏ */}
          <div className="rounded-xl border border-line bg-surface p-6 my-2 text-fg space-y-4">
            <div className="text-center space-y-1 border-b border-line pb-4">
              <p className="text-xs uppercase font-serif tracking-widest text-fg-3">Cộng hòa Xã hội Chủ nghĩa Việt Nam</p>
              <p className="text-xs font-serif italic text-fg-3">Độc lập - Tự do - Hạnh phúc</p>
              <h4 className="text-base font-bold text-accent uppercase tracking-wider mt-2">
                Giấy Chứng Nhận Đăng Ký Cơ Sở Nuôi Sinh Sản Nhân Tạo
              </h4>
              <p className="text-xs font-mono text-fg-2">Số đăng ký: VN-CITES-2026-F2-0489</p>
            </div>

            <div className="space-y-2 text-xs leading-relaxed text-fg-2">
              <p>
                <strong>Tên cơ sở:</strong> {currentSeller?.shopName}
              </p>
              <p>
                <strong>Đại diện pháp luật:</strong> {currentSeller?.ownerFullName}
              </p>
              <p>
                <strong>Địa chỉ trại nuôi:</strong> {currentSeller?.ownerAddress || 'Cầu Giấy, Hà Nội'}
              </p>
              <p>
                <strong>Nguồn gốc con giống:</strong> Thế hệ F2 nhân tạo sinh sản trong môi trường có kiểm soát (Captive-bred F2), không xâm hại quần thể hoang dã.
              </p>
            </div>

            {/* Dấu mộc đỏ giả lập */}
            <div className="pt-4 flex justify-end">
              <div className="border-2 border-danger rounded-full size-24 flex flex-col items-center justify-center text-center p-1 text-danger rotate-[-12deg] shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                <span className="text-[8px] uppercase font-bold leading-tight">Cục Kiểm Lâm</span>
                <span className="text-[9px] font-bold">ĐÃ KIỂM TRA</span>
                <span className="text-[7px]">CITES F2+</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setIsLicenseLightboxOpen(false)}
              className="rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-accent-ink hover:opacity-90"
            >
              Đóng (Esc)
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
