import React, { useState, useSyncExternalStore } from 'react';
import { Link } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import {
  Store,
  PackageCheck,
  Leaf,
  ShieldCheck,
  AlertTriangle,
  RotateCw,
  ArrowRight,
  ShieldAlert,
  Clock,
  History,
  FileCheck2,
  CheckCircle2,
  XCircle,
  Ban,
  ExternalLink,
} from 'lucide-react';
import { getAuthState, subscribeAuth } from '@/api/authStore';
import { useAdminSellers, useAdminProducts } from '@/api/queries/useAdminQueries';
import { useSpeciesList } from '@/api/queries/useSpeciesQueries';
import { queryKeys } from '@/api/keys';
import { Ticker } from '@/components/ui/Ticker';
import { IucnBadge } from '@/components/ui/IucnBadge';
import { StatusPill } from '@/components/ui/StatusPill';
import type { ConservationStatus } from '@/types/api';

// 5 bậc bảo tồn IUCN xuất hiện trong seed
const IUCN_DISPLAY_TIERS: {
  status: ConservationStatus;
  nameVi: string;
  color: string;
  bgRgba: string;
  citesWarning?: boolean;
}[] = [
  { status: 'CR', nameVi: 'Cực kỳ nguy cấp', color: '#d81e05', bgRgba: 'rgba(216, 30, 5, 0.15)', citesWarning: true },
  { status: 'EN', nameVi: 'Nguy cấp', color: '#fc7f3f', bgRgba: 'rgba(252, 127, 63, 0.15)', citesWarning: true },
  { status: 'VU', nameVi: 'Sắp nguy cấp', color: '#f9e814', bgRgba: 'rgba(249, 232, 20, 0.15)' },
  { status: 'NT', nameVi: 'Sắp bị đe dọa', color: '#cce226', bgRgba: 'rgba(204, 226, 38, 0.15)' },
  { status: 'LC', nameVi: 'Ít quan tâm', color: '#60c659', bgRgba: 'rgba(96, 198, 89, 0.15)' },
];

export default function AdminDashboardPage(): React.JSX.Element {
  const auth = useSyncExternalStore(subscribeAuth, getAuthState);
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFeedTab, setActiveFeedTab] = useState<'ALL' | 'SELLER' | 'PRODUCT' | 'SPECIES'>('ALL');
  const [hoveredIucn, setHoveredIucn] = useState<string | null>(null);

  // Queries
  const { data: sellers = [], isLoading: sellersLoading } = useAdminSellers('ALL');
  const { data: products = [], isLoading: productsLoading } = useAdminProducts('ALL');
  const { data: speciesList = [], isLoading: speciesLoading } = useSpeciesList();

  // Kiểm tra quyền hạn tối thiểu: ADMIN
  if (!auth.token || !auth.user || auth.accountType !== 'ADMIN') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
        <div className="size-16 rounded-2xl border border-danger/40 bg-danger/10 flex items-center justify-center text-danger mb-4 shadow-[0_0_25px_rgba(248,113,113,0.2)]">
          <ShieldAlert className="size-8" aria-hidden="true" />
        </div>
        <span className="rounded-full border border-danger/40 bg-danger/15 px-3 py-1 text-xs font-mono font-semibold tracking-wider text-danger uppercase">
          403 Forbidden
        </span>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-fg font-sans">
          Khu vực hạn chế quản trị
        </h2>
        <p className="mt-2 text-sm text-fg-2 leading-relaxed">
          Bạn cần đăng nhập bằng tài khoản Quản trị viên (Super Admin, Moderator hoặc Biologist) để truy cập bảng điều khiển này.
        </p>
        <Link
          to="/admin/login"
          className="mt-6 rounded-xl bg-accent px-5 py-2.5 text-xs font-semibold text-accent-ink hover:opacity-90 transition-opacity"
        >
          Đăng nhập Ban Quản trị
        </Link>
      </div>
    );
  }

  // Thống kê 4 KPI
  const pendingSellersCount = sellers.filter((s) => s.status === 'PENDING').length;
  const activeSellersCount = sellers.filter((s) => s.status === 'ACTIVE').length;
  const pendingProductsCount = products.filter((p) => p.status === 'PENDING').length;
  const speciesCount = speciesList.length;

  // Tính tỷ lệ 5 bậc bảo tồn IUCN
  const iucnCounts: Record<string, { count: number; species: { id: number; nameVi: string; scientificName: string }[] }> = {
    CR: { count: 0, species: [] },
    EN: { count: 0, species: [] },
    VU: { count: 0, species: [] },
    NT: { count: 0, species: [] },
    LC: { count: 0, species: [] },
  };

  speciesList.forEach((s) => {
    const status = s.conservationStatus;
    if (iucnCounts[status]) {
      iucnCounts[status].count += 1;
      iucnCounts[status].species.push({
        id: s.id,
        nameVi: s.commonName,
        scientificName: s.scientificName,
      });
    }
  });

  const totalSpeciesAnalyzed = speciesList.length || 1;

  // Danh sách sự kiện kiểm duyệt mẫu từ kịch bản
  const activityLogs = [
    {
      id: 'log-1',
      type: 'SELLER',
      actor: 'moderator1',
      actorRole: 'Kiểm duyệt viên',
      action: 'phê duyệt chứng nhận F2+ CITES',
      target: 'BioGreen Exotic',
      targetId: 1,
      targetLink: '/admin/sellers',
      status: 'ACTIVE' as const,
      timestamp: '10 phút trước',
      note: 'Giấy phép Chi cục Kiểm lâm TP.HCM số VN-CITES-2026-F2-0489 hợp lệ, nhân giống F2 đạt chuẩn.',
      icon: CheckCircle2,
      color: 'text-success',
    },
    {
      id: 'log-2',
      type: 'PRODUCT',
      actor: 'moderator1',
      actorRole: 'Kiểm duyệt viên',
      action: 'tiếp nhận hồ sơ thẩm định cá thể',
      target: 'Rồng Úc Hypo Baby (2 tháng tuổi)',
      targetId: 1,
      targetLink: '/admin/products',
      status: 'PENDING' as const,
      timestamp: '25 phút trước',
      note: 'Đối soát hình thái vảy và giấy tờ gốc từ BioGreen Exotic, đang chờ phê duyệt.',
      icon: FileCheck2,
      color: 'text-warm',
    },
    {
      id: 'log-3',
      type: 'SELLER',
      actor: 'tranthib',
      actorRole: 'Nhà nhân giống',
      action: 'nộp hồ sơ thẩm định cơ sở',
      target: 'AquaTerra Shop',
      targetId: 2,
      targetLink: '/admin/sellers',
      status: 'PENDING' as const,
      timestamp: '1 giờ trước',
      note: 'Đính kèm bản scan giấy chứng nhận trại nuôi lic-02.pdf, Cầu Giấy, Hà Nội.',
      icon: Clock,
      color: 'text-accent',
    },
    {
      id: 'log-4',
      type: 'SPECIES',
      actor: 'biologist1',
      actorRole: 'Nhà sinh học',
      action: 'chuẩn hóa thông số vi khí hậu',
      target: 'Ambystoma mexicanum (Axolotl)',
      targetId: 1,
      targetLink: '/admin/species',
      status: 'APPROVED' as const,
      timestamp: '3 giờ trước',
      note: 'Cập nhật dải nhiệt độ nước 14-18°C và cảnh báo CITES Phụ lục I.',
      icon: Leaf,
      color: 'text-accent',
    },
    {
      id: 'log-5',
      type: 'SELLER',
      actor: 'moderator1',
      actorRole: 'Kiểm duyệt viên',
      action: 'từ chối cấp phép cơ sở',
      target: 'Exotic Reptile Hub',
      targetId: 4,
      targetLink: '/admin/sellers',
      status: 'REJECTED' as const,
      timestamp: 'Hôm qua',
      note: 'Hồ sơ không đính kèm giấy phép cơ sở nhân giống theo Nghị định 06/2019/NĐ-CP.',
      icon: XCircle,
      color: 'text-danger',
    },
    {
      id: 'log-6',
      type: 'SELLER',
      actor: 'superadmin',
      actorRole: 'Quản trị tối cao',
      action: 'đình chỉ hoạt động cơ sở',
      target: 'Gecko Lab',
      targetId: 5,
      targetLink: '/admin/sellers',
      status: 'BANNED' as const,
      timestamp: '3 ngày trước',
      note: 'Phát hiện bán cá thể không rõ nguồn gốc thế hệ F2, thu hồi giấy phép hoạt động.',
      icon: Ban,
      color: 'text-danger',
    },
  ];

  const filteredLogs = activityLogs.filter((log) => {
    if (activeFeedTab === 'ALL') return true;
    return log.type === activeFeedTab;
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: queryKeys.admin.all() });
    await queryClient.invalidateQueries({ queryKey: queryKeys.species.all() });
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const roleNameMap: Record<string, string> = {
    SUPER_ADMIN: 'Quản trị viên Tối cao',
    MODERATOR: 'Kiểm duyệt viên Sàn',
    BIOLOGIST: 'Chuyên gia Sinh học',
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. Header Bảng điều khiển */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-danger/30 bg-danger/10 px-3 py-1 text-xs font-semibold text-danger mb-2">
            <span className="size-2 rounded-full bg-danger animate-pulse" />
            <span>Trung tâm Điều hành Sinh quyển BioNexus</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-fg font-sans">
            Tổng quan Quản trị & Giám sát Sàn
          </h1>
          <p className="mt-1 text-sm md:text-base text-fg-2">
            Xin chào, <span className="font-semibold text-fg">{auth.user.fullName || auth.user.username}</span> (
            <span className="text-accent">{roleNameMap[auth.role as string] || auth.role}</span>). Giám sát an toàn sinh thái và tuân thủ CITES.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2 text-xs font-semibold text-fg hover:border-line-strong hover:bg-surface-hover transition-colors self-start sm:self-auto disabled:opacity-50"
          aria-label="Làm mới dữ liệu quản trị"
        >
          <RotateCw className={`size-3.5 ${isRefreshing ? 'animate-spin text-accent' : 'text-fg-3'}`} aria-hidden="true" />
          <span>{isRefreshing ? 'Đang làm tươi...' : 'Làm mới số liệu'}</span>
        </button>
      </div>

      {/* 2. Lưới 4 KPI StatTiles tích hợp Ticker */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* KPI 1: Shop chờ duyệt */}
        <div className="group rounded-2xl border border-warm/30 bg-surface/80 backdrop-blur-xl p-5 hover:border-warm/60 transition-all duration-200 flex flex-col justify-between shadow-[0_4px_20px_rgba(251,191,36,0.05)]">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-3">Cửa hàng chờ duyệt</p>
              <div className="text-3xl md:text-4xl font-bold tracking-tight text-warm font-sans">
                {sellersLoading ? (
                  <span className="animate-pulse">--</span>
                ) : (
                  <Ticker value={pendingSellersCount} />
                )}
              </div>
            </div>
            <div className="rounded-xl border border-warm/30 bg-warm/10 p-2.5 text-warm">
              <Store className="size-5" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-line/40 flex items-center justify-between text-xs">
            <span className="text-fg-3">Hồ sơ CITES F2+ cần xét</span>
            <Link
              to="/admin/sellers"
              className="inline-flex items-center gap-1 font-semibold text-warm hover:underline"
            >
              <span>Xem hàng đợi</span>
              <ArrowRight className="size-3" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* KPI 2: Sản phẩm chờ kiểm định */}
        <div className="group rounded-2xl border border-accent/30 bg-surface/80 backdrop-blur-xl p-5 hover:border-accent/60 transition-all duration-200 flex flex-col justify-between shadow-[0_4px_20px_rgba(110,231,183,0.05)]">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-3">Sản phẩm chờ kiểm định</p>
              <div className="text-3xl md:text-4xl font-bold tracking-tight text-accent font-sans">
                {productsLoading ? (
                  <span className="animate-pulse">--</span>
                ) : (
                  <Ticker value={pendingProductsCount} />
                )}
              </div>
            </div>
            <div className="rounded-xl border border-accent/30 bg-accent/10 p-2.5 text-accent">
              <PackageCheck className="size-5" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-line/40 flex items-center justify-between text-xs">
            <span className="text-fg-3">Đối soát loài bách khoa</span>
            <Link
              to="/admin/products"
              className="inline-flex items-center gap-1 font-semibold text-accent hover:underline"
            >
              <span>Kiểm định ngay</span>
              <ArrowRight className="size-3" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* KPI 3: Loài trong Bách khoa */}
        <div className="group rounded-2xl border border-ocean/30 bg-surface/80 backdrop-blur-xl p-5 hover:border-ocean/60 transition-all duration-200 flex flex-col justify-between shadow-[0_4px_20px_rgba(59,130,246,0.05)]">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-3">Loài trong Bách khoa</p>
              <div className="text-3xl md:text-4xl font-bold tracking-tight text-ocean font-sans">
                {speciesLoading ? (
                  <span className="animate-pulse">--</span>
                ) : (
                  <Ticker value={speciesCount} />
                )}
              </div>
            </div>
            <div className="rounded-xl border border-ocean/30 bg-ocean/10 p-2.5 text-ocean">
              <Leaf className="size-5" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-line/40 flex items-center justify-between text-xs">
            <span className="text-fg-3">Phả hệ 6 cấp chuẩn hóa</span>
            <Link
              to="/admin/species"
              className="inline-flex items-center gap-1 font-semibold text-ocean hover:underline"
            >
              <span>Xem danh mục</span>
              <ArrowRight className="size-3" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* KPI 4: Cửa hàng đã cấp chứng nhận đang hoạt động */}
        <div className="group rounded-2xl border border-success/30 bg-surface/80 backdrop-blur-xl p-5 hover:border-success/60 transition-all duration-200 flex flex-col justify-between shadow-[0_4px_20px_rgba(74,222,128,0.05)]">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-3">Trang trại được cấp phép</p>
              <div className="text-3xl md:text-4xl font-bold tracking-tight text-success font-sans">
                {sellersLoading ? (
                  <span className="animate-pulse">--</span>
                ) : (
                  <Ticker value={activeSellersCount} />
                )}
              </div>
            </div>
            <div className="rounded-xl border border-success/30 bg-success/10 p-2.5 text-success">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-line/40 flex items-center justify-between text-xs">
            <span className="text-fg-3">Chứng nhận F2+ CITES</span>
            <span className="font-semibold text-success flex items-center gap-1">
              <span>Đang mở bán</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3. Phân Tích Bảo Tồn IUCN & Cảnh Báo Pháp Lý */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Biểu đồ thanh xếp lớp tỷ lệ 5 bậc IUCN */}
        <div className="lg:col-span-2 rounded-2xl border border-line bg-surface/90 backdrop-blur-xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-fg tracking-tight">
                Phân bổ Mức độ Bảo tồn Sinh học (IUCN Red List)
              </h2>
              <p className="text-xs md:text-sm text-fg-3">
                Theo dõi mức độ đe dọa sinh học của {speciesCount} loài hiện có trên nền tảng.
              </p>
            </div>
            <span className="text-xs font-mono text-accent bg-accent/10 border border-accent/20 px-2.5 py-1 rounded-full self-start">
              5 bậc phân định
            </span>
          </div>

          {/* Thanh xếp lớp ngang (Stacked Distribution Bar) */}
          <div className="space-y-2">
            <div className="h-6 w-full rounded-xl overflow-hidden flex bg-bg-deep border border-line p-0.5">
              {IUCN_DISPLAY_TIERS.map((tier) => {
                const count = iucnCounts[tier.status]?.count || 0;
                const percentage = totalSpeciesAnalyzed > 0 ? (count / totalSpeciesAnalyzed) * 100 : 0;
                if (percentage === 0) return null;

                const isHovered = hoveredIucn === tier.status;

                return (
                  <div
                    key={tier.status}
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: tier.color,
                    }}
                    onMouseEnter={() => setHoveredIucn(tier.status)}
                    onMouseLeave={() => setHoveredIucn(null)}
                    className={`h-full transition-all duration-200 cursor-pointer relative ${
                      isHovered ? 'brightness-125 scale-y-110 z-10' : 'opacity-90'
                    }`}
                    title={`${tier.nameVi} (${tier.status}): ${count} loài (${percentage.toFixed(1)}%)`}
                    aria-label={`${tier.nameVi}: ${count} loài`}
                  />
                );
              })}
            </div>

            {/* Tooltip hiển thị khi hover */}
            <div className="min-h-[24px] text-xs">
              {hoveredIucn ? (
                <div className="flex items-center gap-2 animate-fadeIn text-fg">
                  <span className="font-semibold text-accent">
                    {IUCN_DISPLAY_TIERS.find((t) => t.status === hoveredIucn)?.nameVi} ({hoveredIucn}):
                  </span>
                  <span className="text-fg-2">
                    {iucnCounts[hoveredIucn]?.species.map((sp) => sp.nameVi).join(', ')}
                  </span>
                </div>
              ) : (
                <span className="text-fg-mute text-[11px]">Di chuột lên phân đoạn màu để xem chi tiết danh sách loài.</span>
              )}
            </div>
          </div>

          {/* Lưới 5 bậc bảo tồn chi tiết */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
            {IUCN_DISPLAY_TIERS.map((tier) => {
              const data = iucnCounts[tier.status] || { count: 0, species: [] };
              const percentage = totalSpeciesAnalyzed > 0 ? (data.count / totalSpeciesAnalyzed) * 100 : 0;

              return (
                <div
                  key={tier.status}
                  className="rounded-xl border border-line/60 bg-bg-deep/50 p-3 flex flex-col justify-between hover:border-line-strong transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <IucnBadge code={tier.status} size="sm" showLabel={false} />
                    <span className="text-xs font-mono font-bold text-fg">
                      <Ticker value={data.count} /> loài
                    </span>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-fg-2 truncate">{tier.nameVi}</p>
                    <p className="text-[10px] text-fg-mute font-mono">{percentage.toFixed(1)}% sinh quyển</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Thẻ Cảnh Báo An Toàn Pháp Lý CITES Phụ Lục I */}
        <div className="rounded-2xl border border-danger/40 bg-danger/5 backdrop-blur-xl p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-danger/40 bg-danger/15 p-2.5 text-danger shrink-0 shadow-[0_0_15px_rgba(216,30,5,0.2)]">
                <AlertTriangle className="size-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-base font-bold text-fg tracking-tight">
                  Cảnh báo Pháp lý CITES Phụ lục I
                </h3>
                <p className="text-xs text-danger font-medium">Bảo vệ loài Cực kỳ nguy cấp (CR) & Nguy cấp (EN)</p>
              </div>
            </div>

            <p className="text-xs text-fg-2 leading-relaxed">
              Hệ thống hiện ghi nhận <strong>2 loài</strong> thuộc bậc đe dọa cao nhất nằm trong Danh mục CITES:
            </p>

            <ul className="space-y-2 text-xs text-fg">
              <li className="flex items-start gap-2 bg-surface/60 rounded-lg p-2.5 border border-line/40">
                <IucnBadge code="CR" size="sm" showLabel={false} />
                <div>
                  <p className="font-semibold text-fg">Ambystoma mexicanum (Axolotl)</p>
                  <p className="text-[11px] text-fg-3">Cực kỳ nguy cấp (CR) · Phụ lục I CITES</p>
                </div>
              </li>
              <li className="flex items-start gap-2 bg-surface/60 rounded-lg p-2.5 border border-line/40">
                <IucnBadge code="EN" size="sm" showLabel={false} />
                <div>
                  <p className="font-semibold text-fg">Nepenthes rajah (Cây nắp ấm Rajah)</p>
                  <p className="text-[11px] text-fg-3">Nguy cấp (EN) · Phụ lục I CITES</p>
                </div>
              </li>
            </ul>

            <div className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-xs text-danger/90 leading-relaxed">
              Mọi sản phẩm thương mại liên quan bắt buộc phải có <strong>Giấy chứng nhận cơ sở nhân giống thế hệ F2+</strong> theo Nghị định 06/2019/NĐ-CP. Tuyệt đối không phê duyệt cá thể đánh bắt tự nhiên.
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-line/40">
            <Link
              to="/admin/products"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
            >
              <span>Xem hàng đợi thẩm định</span>
              <ExternalLink className="size-3" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Dòng Thời Gian Nhật Ký Kiểm Duyệt Gần Đây (Activity Feed) */}
      <div className="rounded-2xl border border-line bg-surface/90 backdrop-blur-xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl border border-line bg-surface p-2 text-accent">
              <History className="size-4" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-fg tracking-tight">
                Nhật ký Hoạt động Kiểm duyệt & Biến động Hệ thống
              </h2>
              <p className="text-xs text-fg-3">
                Theo dõi vết thời gian các quyết định phê duyệt cửa hàng, sản phẩm và cập nhật loài.
              </p>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'ALL', label: 'Tất cả sự kiện' },
              { id: 'SELLER', label: 'Cửa hàng' },
              { id: 'PRODUCT', label: 'Sản phẩm' },
              { id: 'SPECIES', label: 'Bách khoa loài' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFeedTab(tab.id as typeof activeFeedTab)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeFeedTab === tab.id
                    ? 'bg-accent text-accent-ink shadow-[var(--glow-accent-btn)]'
                    : 'border border-line bg-surface text-fg-2 hover:border-line-strong hover:text-fg'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline list */}
        <div className="relative border-l border-line/60 ml-4 pl-6 space-y-6">
          {filteredLogs.map((log) => {
            const Icon = log.icon;
            return (
              <div key={log.id} className="relative group">
                {/* Timeline node */}
                <span className={`absolute -left-[31px] top-1.5 size-4 rounded-full border-2 border-bg-deep bg-surface flex items-center justify-center ${log.color}`}>
                  <span className="size-1.5 rounded-full bg-current" />
                </span>

                <div className="rounded-xl border border-line/50 bg-bg-deep/40 p-4 hover:border-line-strong transition-all duration-200 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-fg text-sm">{log.actor}</span>
                      <span className="rounded-md border border-line bg-surface px-1.5 py-0.5 text-[10px] font-mono text-fg-3 uppercase inline-flex items-center gap-1">
                        <Icon className="size-3" aria-hidden="true" />
                        <span>{log.actorRole}</span>
                      </span>
                      <span className="text-fg-3 text-xs">đã {log.action}</span>
                      <Link
                        to={log.targetLink}
                        className="font-semibold text-accent hover:underline text-sm inline-flex items-center gap-1"
                      >
                        <span>{log.target}</span>
                      </Link>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusPill status={log.status} />
                      <span className="text-[11px] text-fg-mute font-mono">{log.timestamp}</span>
                    </div>
                  </div>

                  <p className="text-xs text-fg-2 bg-surface/50 rounded-lg p-2.5 border border-line/30 italic">
                    "{log.note}"
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
