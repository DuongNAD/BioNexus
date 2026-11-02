import React, { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import {
  PackageCheck,
  Search,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  Sparkles,
  ExternalLink,
  Store,
  BookOpen,
} from 'lucide-react';
import { getAuthState, subscribeAuth } from '@/api/authStore';
import { useAdminProducts } from '@/api/queries/useAdminQueries';
import { useSpeciesList } from '@/api/queries/useSpeciesQueries';
import { useModerateProduct } from '@/api/mutations/useAdminMutations';
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
  { id: 'OTHER', title: 'Lý do khác', desc: 'Ghi rõ căn cứ từ chối gửi tới người bán.' },
];

export default function AdminProductsPage(): React.JSX.Element {
  const auth = useSyncExternalStore(subscribeAuth, getAuthState);
  const { data: allProducts = [], isLoading } = useAdminProducts('ALL');
  const { data: speciesList = [] } = useSpeciesList();
  const moderateProductMutation = useModerateProduct();

  // State
  const [selectedStatus, setSelectedStatus] = useState<ProductStatus | 'ALL'>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  // Modal states
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [selectedReasonId, setSelectedReasonId] = useState(REJECTION_REASONS[0]?.id || 'MISIDENTIFIED_SPECIES');
  const [customReasonNote, setCustomReasonNote] = useState('');

  // Phân quyền: Chỉ SUPER_ADMIN và MODERATOR được duyệt sản phẩm
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
          Tài khoản ({userRole === 'BIOLOGIST' ? 'Nhà sinh học' : 'Người dùng'}) không có quyền kiểm duyệt sản phẩm thương mại. Khu vực này chỉ dành cho Kiểm duyệt viên (Moderator) và Admin Tổng.
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

  // Lọc sản phẩm
  const filteredProducts = allProducts.filter((product) => {
    const matchesStatus = selectedStatus === 'ALL' || product.status === selectedStatus;
    if (!matchesStatus) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const prodName = product.productName.toLowerCase();
    const speciesName = (product.speciesCommonName || '').toLowerCase();
    const scientific = (product.speciesScientificName || '').toLowerCase();
    const shopName = (product.shopName || '').toLowerCase();
    return prodName.includes(q) || speciesName.includes(q) || scientific.includes(q) || shopName.includes(q);
  });

  // Tự động chọn sản phẩm đầu tiên
  useEffect(() => {
    if (filteredProducts.length > 0) {
      const exists = filteredProducts.some((p) => p.id === selectedProductId);
      if (!exists && filteredProducts[0]) {
        setSelectedProductId(filteredProducts[0].id);
      }
    } else {
      setSelectedProductId(null);
    }
  }, [filteredProducts, selectedProductId]);

  const currentProduct: ProductViewModel | undefined = allProducts.find((p) => p.id === selectedProductId);

  // Tìm thông tin loài bách khoa đối chiếu
  const matchedSpecies = currentProduct
    ? speciesList.find((s) => s.id === currentProduct.speciesId)
    : undefined;

  const speciesExtra = matchedSpecies
    ? SPECIES_EXTRAS[matchedSpecies.scientificName]
    : undefined;

  // Lấy ảnh chuẩn bách khoa từ Wikimedia Commons
  const wikiHeroPhoto = speciesExtra?.heroPhotoId ? PHOTOS[speciesExtra.heroPhotoId] : undefined;
  const wikiFallbackPhoto = speciesExtra?.portraitPhotoId ? PHOTOS[speciesExtra.portraitPhotoId] : undefined;
  const scientificPhoto = wikiHeroPhoto || wikiFallbackPhoto;

  const scientificImageUrl = scientificPhoto?.sources.webp[scientificPhoto.sources.webp.length - 1]?.src
    || scientificPhoto?.sources.jpg
    || matchedSpecies?.imageURL
    || '/photos/axolotl/hero-960.webp';

  const parsedSpecs = matchedSpecies
    ? parseEnvironmentSpecs(matchedSpecies.environmentSpecs)
    : { tempMin: null, tempMax: null, raw: '' };

  // Đếm theo trạng thái
  const counts = {
    PENDING: allProducts.filter((p) => p.status === 'PENDING').length,
    APPROVED: allProducts.filter((p) => p.status === 'APPROVED').length,
    REJECTED: allProducts.filter((p) => p.status === 'REJECTED').length,
    SOLD_OUT: allProducts.filter((p) => p.status === 'SOLD_OUT').length,
    ALL: allProducts.length,
  };

  // Điều hướng J/K
  const selectNext = useCallback(() => {
    if (filteredProducts.length <= 1) return;
    const currentIndex = filteredProducts.findIndex((p) => p.id === selectedProductId);
    if (currentIndex < filteredProducts.length - 1) {
      const nextItem = filteredProducts[currentIndex + 1];
      if (nextItem) setSelectedProductId(nextItem.id);
    }
  }, [filteredProducts, selectedProductId]);

  const selectPrev = useCallback(() => {
    if (filteredProducts.length <= 1) return;
    const currentIndex = filteredProducts.findIndex((p) => p.id === selectedProductId);
    if (currentIndex > 0) {
      const prevItem = filteredProducts[currentIndex - 1];
      if (prevItem) setSelectedProductId(prevItem.id);
    }
  }, [filteredProducts, selectedProductId]);

  // Phím tắt bàn phím với Input Focus Guard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

      const hasModalOpen = isApproveOpen || isRejectOpen || isHelpOpen;
      if (hasModalOpen) {
        if (e.key === 'Escape') {
          setIsApproveOpen(false);
          setIsRejectOpen(false);
          setIsHelpOpen(false);
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
        if (currentProduct && currentProduct.status === 'PENDING') {
          e.preventDefault();
          setIsApproveOpen(true);
        }
      } else if (e.key === 'r' || e.key === 'R') {
        if (currentProduct && currentProduct.status === 'PENDING') {
          e.preventDefault();
          setCustomReasonNote('');
          setIsRejectOpen(true);
        }
      } else if (e.key === '?') {
        e.preventDefault();
        setIsHelpOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectNext, selectPrev, currentProduct, isApproveOpen, isRejectOpen, isHelpOpen]);

  // Phê duyệt sản phẩm
  const handleApprove = async () => {
    if (!currentProduct) return;
    try {
      await moderateProductMutation.mutateAsync({
        productId: currentProduct.id,
        status: 'APPROVED',
      });
      setIsApproveOpen(false);
      toast.success(`Đã phê duyệt sản phẩm "${currentProduct.productName}". Cá thể đã hiển thị công khai trên Sàn.`);
    } catch {
      toast.error('Có lỗi xảy ra khi phê duyệt sản phẩm');
    }
  };

  // Từ chối sản phẩm
  const handleReject = async () => {
    if (!currentProduct) return;
    const selectedReason = REJECTION_REASONS.find((r) => r.id === selectedReasonId);
    const reasonText =
      selectedReasonId === 'OTHER'
        ? customReasonNote.trim()
        : `${selectedReason?.title}: ${selectedReason?.desc} ${customReasonNote ? `(${customReasonNote.trim()})` : ''}`.trim();

    if (reasonText.length < 5) {
      toast.error('Vui lòng chọn hoặc nhập lý do từ chối cụ thể');
      return;
    }

    try {
      await moderateProductMutation.mutateAsync({
        productId: currentProduct.id,
        status: 'REJECTED',
        reason: reasonText,
      });
      setIsRejectOpen(false);
      toast.success(`Đã từ chối kiểm định cá thể "${currentProduct.productName}" kèm lý do gửi tới người bán.`);
    } catch {
      toast.error('Có lỗi xảy ra khi từ chối sản phẩm');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Header Trang */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent mb-1.5">
            <PackageCheck className="size-3.5" aria-hidden="true" />
            <span>Đối Soát Song Song: Khai Báo Người Bán vs Mẫu Chuẩn Bách Khoa</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-fg font-sans">
            Kiểm duyệt Sinh vật cảnh Đăng bán
          </h1>
          <p className="text-xs md:text-sm text-fg-3">
            Đối chiếu hình thái vi mô 2.5x và phả hệ 6 cấp để ngăn chặn phân loại sai loài và động vật hoang dã.
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

      {/* 2. Bố cục Dual-Pane (35% Hàng đợi / 65% Đối chiếu song song) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[700px]">
        {/* CỘT TRÁI (35% -> col-span-4 hoặc 5: 35% ~ col-span-4) */}
        <div className="lg:col-span-4 rounded-2xl border border-line bg-surface/90 backdrop-blur-xl p-4 flex flex-col gap-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1 pb-2 border-b border-line/60">
            {[
              { id: 'PENDING', label: 'Chờ duyệt', count: counts.PENDING },
              { id: 'APPROVED', label: 'Đã duyệt', count: counts.APPROVED },
              { id: 'REJECTED', label: 'Từ chối', count: counts.REJECTED },
              { id: 'SOLD_OUT', label: 'Hết hàng', count: counts.SOLD_OUT },
              { id: 'ALL', label: 'Tất cả', count: counts.ALL },
            ].map((tab) => {
              const isActive = selectedStatus === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedStatus(tab.id as typeof selectedStatus)}
                  className={`rounded-xl px-2 py-1 text-xs font-semibold transition-all flex items-center gap-1 ${
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
              placeholder="Tìm theo tên cá thể, loài, shop..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-line bg-bg-deep/60 pl-9 pr-4 py-2 text-xs text-fg placeholder:text-fg-mute focus:border-accent focus:outline-none"
            />
          </div>

          {/* Danh sách hàng đợi */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[600px]">
            {isLoading ? (
              <div className="flex h-40 items-center justify-center text-accent text-xs">
                <span>Đang tải danh sách sản phẩm...</span>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-xl border border-line/40 bg-bg-deep/40 p-8 text-center text-fg-3 text-xs">
                <PackageCheck className="size-8 mx-auto mb-2 opacity-40" aria-hidden="true" />
                <p>Không có sản phẩm nào trong hàng đợi này.</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((prod) => {
                  const isSelected = prod.id === selectedProductId;

                  return (
                    <motion.div
                      key={prod.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      onClick={() => setSelectedProductId(prod.id)}
                      className={`group rounded-xl border p-3 transition-all duration-150 cursor-pointer relative flex gap-3 ${
                        isSelected
                          ? 'border-accent bg-accent/10 shadow-[0_0_15px_rgba(110,231,183,0.1)]'
                          : 'border-line/60 bg-bg-deep/40 hover:border-line-strong hover:bg-surface-hover'
                      }`}
                    >
                      {/* Active indicator */}
                      {isSelected && (
                        <span className="absolute left-0 top-2 bottom-2 w-1 bg-accent rounded-r" />
                      )}

                      {/* Thumbnail */}
                      <div className="size-14 rounded-lg overflow-hidden bg-bg-raised shrink-0 border border-line">
                        {prod.imageUrl ? (
                          <img
                            src={prod.imageUrl}
                            alt={prod.productName}
                            className="size-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="size-full flex items-center justify-center text-[10px] text-fg-mute">
                            No photo
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-1">
                            <h3 className="text-xs font-semibold text-fg truncate group-hover:text-accent transition-colors">
                              {prod.productName}
                            </h3>
                            <StatusPill status={prod.status} />
                          </div>
                          <p className="text-[11px] text-fg-3 truncate mt-0.5">
                            {prod.speciesCommonName} · <em>{prod.speciesScientificName}</em>
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-[11px] pt-1">
                          <Price amount={prod.price} className="font-semibold text-accent text-xs" />
                          <span className="text-[10px] text-fg-mute">{prod.shopName}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* CỘT PHẢI (65% -> col-span-8): KHUNG ĐỐI CHIẾU SONG SONG */}
        <div className="lg:col-span-8 rounded-2xl border border-line bg-surface/90 backdrop-blur-xl p-6 flex flex-col justify-between">
          {!currentProduct ? (
            <div className="flex h-full flex-col items-center justify-center p-12 text-center text-fg-3">
              <PackageCheck className="size-12 mb-3 opacity-30 text-accent" aria-hidden="true" />
              <p className="text-base font-semibold text-fg">Chưa chọn cá thể nào để thẩm định</p>
              <p className="text-xs text-fg-3 mt-1">Chọn một cá thể bên trái hoặc dùng phím [J]/[K] để mở khung đối chiếu song song.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header đối chiếu */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-line pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl md:text-2xl font-bold text-fg tracking-tight">
                      {currentProduct.productName}
                    </h2>
                    <span className="rounded-md border border-line bg-surface px-2 py-0.5 text-xs font-mono text-fg-3">
                      ID: #{currentProduct.id}
                    </span>
                  </div>
                  <p className="text-xs text-fg-3 mt-1 flex items-center gap-2">
                    <Store className="size-3 text-accent" aria-hidden="true" />
                    <span>Đăng bán bởi: <strong className="text-fg">{currentProduct.shopName}</strong></span>
                    <span>·</span>
                    <span>Kho: <strong className="text-fg">{currentProduct.stockQuantity}</strong> cá thể</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Price amount={currentProduct.price} className="text-lg font-bold text-accent font-sans" />
                  <StatusPill status={currentProduct.status} />
                </div>
              </div>

              {/* BẢNG ĐỐI CHIẾU SONG SONG ĐỘC NHẤT VÔ NHỊ (Side-by-Side Verification) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* CỘT A: KHAI BÁO CỦA NGƯỜI BÁN */}
                <div className="rounded-xl border border-warm/30 bg-warm/5 p-4 space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-warm/20">
                      <span className="text-xs font-bold uppercase tracking-wider text-warm flex items-center gap-1.5">
                        <Store className="size-3.5" aria-hidden="true" />
                        <span>Khai báo của Người bán</span>
                      </span>
                      <span className="text-[10px] font-mono text-warm bg-warm/15 px-2 py-0.5 rounded-md border border-warm/30">
                        Cá thể thực tế
                      </span>
                    </div>

                    {/* Ảnh người bán kèm kính lúp LensMagnifier 2.5x */}
                    <div className="mt-3 relative rounded-xl overflow-hidden border border-line bg-black/60 aspect-4/3 flex items-center justify-center">
                      {currentProduct.imageUrl ? (
                        <LensMagnifier
                          src={currentProduct.imageUrl}
                          alt={currentProduct.productName}
                          zoomLevel={2.5}
                          className="size-full"
                        />
                      ) : (
                        <span className="text-xs text-fg-3">Chưa có ảnh thực tế</span>
                      )}
                      <span className="absolute bottom-2 left-2 rounded-md bg-black/70 backdrop-blur-md px-2 py-0.5 text-[10px] text-accent border border-line pointer-events-none">
                        Soi kính lúp 2.5x
                      </span>
                    </div>

                    {/* Thông tin khai báo */}
                    <div className="mt-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-fg-2">
                        <span className="text-fg-mute">Tên thương mại:</span>
                        <span className="font-semibold text-fg">{currentProduct.productName}</span>
                      </div>
                      <div className="flex items-center justify-between text-fg-2">
                        <span className="text-fg-mute">Cơ sở đăng ký:</span>
                        <span className="text-accent">{currentProduct.shopName}</span>
                      </div>
                      <div className="flex items-center justify-between text-fg-2">
                        <span className="text-fg-mute">Cam kết nguồn gốc:</span>
                        <span className="text-success font-semibold flex items-center gap-1">
                          <ShieldCheck className="size-3" aria-hidden="true" />
                          <span>F2+ sinh sản nhân tạo</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-fg-2">
                        <span className="text-fg-mute">Giấy chứng nhận:</span>
                        <span className="font-mono text-accent">LIC-01.pdf</span>
                      </div>

                      <div className="pt-2 border-t border-line/30">
                        <span className="text-fg-mute block text-[11px] mb-1">Mô tả của người bán:</span>
                        <p className="text-fg-2 italic bg-surface/50 p-2 rounded-lg border border-line/30 text-[11px] leading-relaxed">
                          "{currentProduct.description || 'Không có mô tả chi tiết từ shop.'}"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CỘT B: HỒ SƠ MẪU CHUẨN BÁCH KHOA WIKIMEDIA COMMONS */}
                <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-accent/20">
                      <span className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
                        <BookOpen className="size-3.5" aria-hidden="true" />
                        <span>Mẫu Chuẩn Bách Khoa</span>
                      </span>
                      {matchedSpecies && (
                        <IucnBadge code={matchedSpecies.conservationStatus} size="sm" />
                      )}
                    </div>

                    {/* Ảnh chuẩn bách khoa kèm kính lúp LensMagnifier */}
                    <div className="mt-3 relative rounded-xl overflow-hidden border border-line bg-black/60 aspect-4/3 flex items-center justify-center">
                      <LensMagnifier
                        src={scientificImageUrl}
                        alt={matchedSpecies?.commonName || 'Mẫu chuẩn khoa học'}
                        zoomLevel={2.5}
                        className="size-full"
                      />
                      <span className="absolute bottom-2 left-2 rounded-md bg-black/70 backdrop-blur-md px-2 py-0.5 text-[10px] text-accent border border-line pointer-events-none">
                        Soi kính lúp 2.5x
                      </span>
                      {scientificPhoto?.credit && (
                        <span className="absolute top-2 right-2 rounded-md bg-black/70 backdrop-blur-md px-2 py-0.5 text-[9px] text-fg-3 border border-line pointer-events-none">
                          {scientificPhoto.credit.license}
                        </span>
                      )}
                    </div>

                    {/* Thông tin phân loại học */}
                    <div className="mt-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-fg-2">
                        <span className="text-fg-mute">Tên khoa học:</span>
                        <span className="font-serif italic text-accent font-semibold">
                          {matchedSpecies?.scientificName || currentProduct.speciesScientificName}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-fg-2">
                        <span className="text-fg-mute">Tên thường gọi:</span>
                        <span className="text-fg font-medium">
                          {matchedSpecies?.commonName || currentProduct.speciesCommonName}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-fg-2">
                        <span className="text-fg-mute">Bảo tồn IUCN:</span>
                        <span className="font-semibold text-fg">
                          {matchedSpecies?.conservationStatus} · {matchedSpecies?.conservationStatus === 'CR' ? 'Cực kỳ nguy cấp (CITES I)' : 'Có kiểm soát'}
                        </span>
                      </div>

                      {/* Thông số vi khí hậu tiêu chuẩn */}
                      <div className="pt-2 border-t border-line/30 space-y-2">
                        <span className="text-fg-mute block text-[11px]">Thông số sinh cảnh vi khí hậu chuẩn:</span>
                        <ClimateBar specs={parsedSpecs} />
                        {parsedSpecs.humidMin !== null && parsedSpecs.humidMin !== undefined && (
                          <div className="flex justify-center mt-2">
                            <HumidityGauge
                              humidMin={parsedSpecs.humidMin}
                              humidMax={parsedSpecs.humidMax}
                              className="w-full"
                            />
                          </div>
                        )}
                        {speciesExtra?.diet && (
                          <div className="text-fg-3 text-[10px] pt-1">
                            Thức ăn: <span className="text-fg-2">{speciesExtra.diet}</span>
                          </div>
                        )}
                      </div>

                      {/* Lối tắt GBIF */}
                      {speciesExtra?.gbifUrl && (
                        <div className="pt-1">
                          <a
                            href={speciesExtra.gbifUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-ocean hover:underline"
                          >
                            <span>Tra cứu dữ liệu GBIF Backbone Taxonomy</span>
                            <ExternalLink className="size-3" aria-hidden="true" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Thanh tác vụ kiểm duyệt dưới cùng */}
          {currentProduct && (
            <div className="pt-6 border-t border-line mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-fg-3">
                {currentProduct.status === 'PENDING' ? (
                  <span>Quyết định phê duyệt đưa sản phẩm lên sàn công khai:</span>
                ) : (
                  <span>Trạng thái sản phẩm: <strong>{currentProduct.status}</strong></span>
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

                {currentProduct.status === 'APPROVED' && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-success font-semibold bg-success/10 border border-success/30 px-3 py-1.5 rounded-xl">
                    <CheckCircle2 className="size-3.5" aria-hidden="true" />
                    <span>Đã duyệt mở bán</span>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Thanh phím tắt nổi ở đáy màn hình */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 rounded-2xl border border-line bg-bg-raised/90 backdrop-blur-2xl px-5 py-2.5 shadow-2xl hidden md:flex items-center gap-5 text-xs text-fg-2">
        <span className="font-semibold text-fg flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-accent" aria-hidden="true" />
          <span>Kiểm định tốc độ cao:</span>
        </span>

        <div className="flex items-center gap-1.5">
          <Kbd>J</Kbd>
          <span>Cá thể sau</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Kbd>K</Kbd>
          <span>Cá thể trước</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Kbd>A</Kbd>
          <span className="text-accent">Chấp thuận</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Kbd>R</Kbd>
          <span className="text-danger">Từ chối</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Kbd>Esc</Kbd>
          <span>Đóng modal</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Kbd>?</Kbd>
          <span>Trợ giúp</span>
        </div>
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
              Xác nhận cá thể đúng loài và đủ điều kiện pháp lý để xuất hiện công khai trên Sàn sinh vật cảnh:
            </DialogDescription>
          </DialogHeader>

          {currentProduct && (
            <div className="rounded-xl border border-line bg-surface p-4 my-2 space-y-1.5 text-xs">
              <p className="text-base font-bold text-fg">{currentProduct.productName}</p>
              <p className="text-fg-3">Loài: {currentProduct.speciesCommonName} (<em>{currentProduct.speciesScientificName}</em>)</p>
              <p className="text-accent font-semibold">Cửa hàng: {currentProduct.shopName}</p>
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
              Chọn lý do từ chối gửi phản hồi chi tiết cho người bán:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 my-2">
            <div className="space-y-2">
              {REJECTION_REASONS.map((reason) => {
                const isSelected = selectedReasonId === reason.id;
                return (
                  <div
                    key={reason.id}
                    onClick={() => setSelectedReasonId(reason.id)}
                    className={`rounded-xl border p-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-danger bg-danger/10 text-fg'
                        : 'border-line/60 bg-surface/60 hover:border-line-strong'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-fg">{reason.title}</span>
                      <span className={`size-3 rounded-full border ${isSelected ? 'border-danger bg-danger' : 'border-line'}`} />
                    </div>
                    <p className="text-[11px] text-fg-3 mt-1">{reason.desc}</p>
                  </div>
                );
              })}
            </div>

            <div>
              <label htmlFor="custom-reason-note" className="text-[11px] text-fg-mute block mb-1">
                Ghi chú thêm cho người bán (tùy chọn):
              </label>
              <textarea
                id="custom-reason-note"
                rows={3}
                value={customReasonNote}
                onChange={(e) => setCustomReasonNote(e.target.value)}
                placeholder="Nhập hướng dẫn khắc phục hình ảnh hoặc bổ sung giấy chứng nhận..."
                className="w-full rounded-xl border border-line bg-bg-deep p-3 text-xs text-fg placeholder:text-fg-mute focus:border-danger focus:outline-none"
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
              <span>Phím tắt Kiểm duyệt Cá thể</span>
            </DialogTitle>
            <DialogDescription className="text-fg-2 text-xs">
              Thao tác thẩm định hàng loạt cá thể bằng bàn phím:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2.5 my-3 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-surface border border-line/40">
              <span className="text-fg">Cá thể kế tiếp</span>
              <div className="flex gap-1"><Kbd>J</Kbd> hoặc <Kbd>↓</Kbd></div>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-surface border border-line/40">
              <span className="text-fg">Cá thể liền trước</span>
              <div className="flex gap-1"><Kbd>K</Kbd> hoặc <Kbd>↑</Kbd></div>
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
    </div>
  );
}
