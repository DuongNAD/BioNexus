import React, { useMemo, useState } from 'react';
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
  Inbox,
} from 'lucide-react';
import { useAuthState } from '@/api/queries/useAuthQueries';
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
}[] = [
  { status: 'CR', nameVi: 'Cực kỳ nguy cấp', color: '#d81e05' },
  { status: 'EN', nameVi: 'Nguy cấp', color: '#fc7f3f' },
  { status: 'VU', nameVi: 'Sắp nguy cấp', color: '#f9e814' },
  { status: 'NT', nameVi: 'Sắp bị đe dọa', color: '#cce226' },
  { status: 'LC', nameVi: 'Ít quan tâm', color: '#60c659' },
];

// Số mục xem nhanh mỗi hàng đợi (tài liệu 03 mục 14)
const QUEUE_PREVIEW_SIZE = 3;

const ROLE_NAME_MAP: Record<string, string> = {
  SUPER_ADMIN: 'Quản trị tổng',
  MODERATOR: 'Kiểm duyệt viên',
  BIOLOGIST: 'Nhà sinh học',
};

export default function AdminDashboardPage(): React.JSX.Element {
  const auth = useAuthState();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hoveredIucn, setHoveredIucn] = useState<string | null>(null);

  const role = auth.role as string | null;
  // BIOLOGIST gọi hàng đợi kiểm duyệt sẽ bị 403, nên chỉ tải khi vai trò được phép
  const canModerate = role === 'SUPER_ADMIN' || role === 'MODERATOR';
  const canManageSpecies = role === 'SUPER_ADMIN' || role === 'BIOLOGIST';

  const sellersQuery = useAdminSellers(undefined, { enabled: canModerate });
  const productsQuery = useAdminProducts(undefined, { enabled: canModerate });
  const speciesQuery = useSpeciesList();

  const sellers = useMemo(() => sellersQuery.data ?? [], [sellersQuery.data]);
  const products = useMemo(() => productsQuery.data ?? [], [productsQuery.data]);
  const speciesList = useMemo(() => speciesQuery.data ?? [], [speciesQuery.data]);

  const pendingSellers = useMemo(() => sellers.filter((s) => s.status === 'PENDING'), [sellers]);
  const pendingProducts = useMemo(() => products.filter((p) => p.status === 'PENDING'), [products]);
  const activeSellersCount = useMemo(() => sellers.filter((s) => s.status === 'ACTIVE').length, [sellers]);
  const speciesCount = speciesList.length;

  // Tính tỷ lệ 5 bậc bảo tồn IUCN từ dữ liệu thật
  const iucnCounts = useMemo(() => {
    const counts: Record<string, { count: number; names: string[] }> = {};
    IUCN_DISPLAY_TIERS.forEach((tier) => {
      counts[tier.status] = { count: 0, names: [] };
    });
    speciesList.forEach((s) => {
      const bucket = counts[s.conservationStatus];
      if (bucket) {
        bucket.count += 1;
        bucket.names.push(s.displayName || s.commonName);
      }
    });
    return counts;
  }, [speciesList]);

  // Loài bị đe dọa cao (CR, EN): cần soát kỹ giấy tờ nguồn gốc khi có sản phẩm đăng bán
  const threatenedSpecies = useMemo(
    () => speciesList.filter((s) => s.conservationStatus === 'CR' || s.conservationStatus === 'EN'),
    [speciesList]
  );

  const totalSpeciesAnalyzed = speciesList.length || 1;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.species.all() }),
    ]);
    setIsRefreshing(false);
  };

  const renderCount = (query: { isLoading: boolean; isError: boolean }, value: number) => {
    if (query.isLoading) return <span className="animate-pulse">--</span>;
    if (query.isError) return <span title="Không tải được số liệu">--</span>;
    return <Ticker value={value} />;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. Header Bảng điều khiển */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-danger/30 bg-danger/10 px-3 py-1 text-xs font-semibold text-danger mb-2">
            <span className="size-2 rounded-full bg-danger" aria-hidden="true" />
            <span>Trung tâm Điều hành Sinh quyển BioNexus</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-fg font-sans">
            Tổng quan Quản trị & Giám sát Sàn
          </h1>
          <p className="mt-1 text-sm md:text-base text-fg-2">
            Xin chào, <span className="font-semibold text-fg">{auth.user?.fullName || auth.user?.username}</span>
            {role && (
              <>
                {' '}(<span className="text-accent">{ROLE_NAME_MAP[role] || role}</span>)
              </>
            )}
            .
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2 text-xs font-semibold text-fg hover:border-line-strong hover:bg-surface-hover transition-colors self-start sm:self-auto disabled:opacity-50"
        >
          <RotateCw className={`size-3.5 ${isRefreshing ? 'animate-spin text-accent' : 'text-fg-3'}`} aria-hidden="true" />
          <span>{isRefreshing ? 'Đang làm mới...' : 'Làm mới số liệu'}</span>
        </button>
      </div>

      {(sellersQuery.isError || productsQuery.isError || speciesQuery.isError) && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
          <span className="flex items-center gap-2">
            <AlertTriangle className="size-4" aria-hidden="true" />
            Không tải được một phần số liệu quản trị.
          </span>
          <button
            type="button"
            onClick={handleRefresh}
            className="rounded-lg border border-danger/40 px-3 py-1.5 text-xs font-semibold hover:bg-danger/15"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* 2. StatTiles: chỉ hiện ô thuộc nhiệm vụ của vai trò hiện tại */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {canModerate && (
          <div className="group rounded-2xl border border-warm/30 bg-surface/80 backdrop-blur-xl p-5 hover:border-warm/60 transition-all duration-200 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-fg-3">Cửa hàng chờ duyệt</p>
                <div className="text-3xl md:text-4xl font-bold tracking-tight text-warm font-sans">
                  {renderCount(sellersQuery, pendingSellers.length)}
                </div>
              </div>
              <div className="rounded-xl border border-warm/30 bg-warm/10 p-2.5 text-warm">
                <Store className="size-5" aria-hidden="true" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-line/40 flex items-center justify-between text-xs">
              <span className="text-fg-3">Hồ sơ mở shop cần xét</span>
              <Link to="/admin/sellers" className="inline-flex items-center gap-1 font-semibold text-warm hover:underline">
                <span>Xem hàng đợi</span>
                <ArrowRight className="size-3" aria-hidden="true" />
              </Link>
            </div>
          </div>
        )}

        {canModerate && (
          <div className="group rounded-2xl border border-accent/30 bg-surface/80 backdrop-blur-xl p-5 hover:border-accent/60 transition-all duration-200 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-fg-3">Sản phẩm chờ duyệt</p>
                <div className="text-3xl md:text-4xl font-bold tracking-tight text-accent font-sans">
                  {renderCount(productsQuery, pendingProducts.length)}
                </div>
              </div>
              <div className="rounded-xl border border-accent/30 bg-accent/10 p-2.5 text-accent">
                <PackageCheck className="size-5" aria-hidden="true" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-line/40 flex items-center justify-between text-xs">
              <span className="text-fg-3">Đối soát với loài khai báo</span>
              <Link to="/admin/products" className="inline-flex items-center gap-1 font-semibold text-accent hover:underline">
                <span>Kiểm định ngay</span>
                <ArrowRight className="size-3" aria-hidden="true" />
              </Link>
            </div>
          </div>
        )}

        <div className="group rounded-2xl border border-ocean/30 bg-surface/80 backdrop-blur-xl p-5 hover:border-ocean/60 transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-3">Loài trong Bách khoa</p>
              <div className="text-3xl md:text-4xl font-bold tracking-tight text-ocean font-sans">
                {renderCount(speciesQuery, speciesCount)}
              </div>
            </div>
            <div className="rounded-xl border border-ocean/30 bg-ocean/10 p-2.5 text-ocean">
              <Leaf className="size-5" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-line/40 flex items-center justify-between text-xs">
            <span className="text-fg-3">Phả hệ 6 cấp chuẩn hóa</span>
            <Link
              to={canManageSpecies ? '/admin/species' : '/species'}
              className="inline-flex items-center gap-1 font-semibold text-ocean hover:underline"
            >
              <span>Xem danh mục</span>
              <ArrowRight className="size-3" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {canModerate && (
          <div className="group rounded-2xl border border-success/30 bg-surface/80 backdrop-blur-xl p-5 hover:border-success/60 transition-all duration-200 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wider text-fg-3">Shop đang hoạt động</p>
                <div className="text-3xl md:text-4xl font-bold tracking-tight text-success font-sans">
                  {renderCount(sellersQuery, activeSellersCount)}
                </div>
              </div>
              <div className="rounded-xl border border-success/30 bg-success/10 p-2.5 text-success">
                <ShieldCheck className="size-5" aria-hidden="true" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-line/40 flex items-center justify-between text-xs">
              <span className="text-fg-3">Trạng thái ACTIVE</span>
              <span className="font-semibold text-success">Đang mở bán</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Hai hàng đợi xem nhanh, mỗi hàng 3 mục (chỉ vai trò kiểm duyệt) */}
      {canModerate && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <QueuePreview
            title="Hồ sơ shop chờ duyệt"
            to="/admin/sellers"
            isLoading={sellersQuery.isLoading}
            isError={sellersQuery.isError}
            total={pendingSellers.length}
            items={pendingSellers.slice(0, QUEUE_PREVIEW_SIZE).map((s) => ({
              key: `seller-${s.id}`,
              title: s.shopName,
              meta: s.ownerFullName || s.ownerUsername || `Người dùng #${s.userId}`,
            }))}
          />
          <QueuePreview
            title="Sản phẩm chờ duyệt"
            to="/admin/products"
            isLoading={productsQuery.isLoading}
            isError={productsQuery.isError}
            total={pendingProducts.length}
            items={pendingProducts.slice(0, QUEUE_PREVIEW_SIZE).map((p) => ({
              key: `product-${p.id}`,
              title: p.productName,
              meta: `${p.displayShopName} · ${p.formattedPrice}`,
              image: p.displayImage,
            }))}
          />
        </div>
      )}

      {/* 4. Phân tích bảo tồn IUCN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-line bg-surface/90 backdrop-blur-xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-fg tracking-tight">
                Phân bổ mức độ bảo tồn (Sách Đỏ IUCN)
              </h2>
              <p className="text-xs md:text-sm text-fg-3">
                Mức độ đe dọa của {speciesCount} loài hiện có trên nền tảng.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="h-6 w-full rounded-xl overflow-hidden flex bg-bg-deep border border-line p-0.5">
              {IUCN_DISPLAY_TIERS.map((tier) => {
                const count = iucnCounts[tier.status]?.count || 0;
                const percentage = (count / totalSpeciesAnalyzed) * 100;
                if (percentage === 0) return null;
                const isHovered = hoveredIucn === tier.status;

                return (
                  <div
                    key={tier.status}
                    style={{ width: `${percentage}%`, backgroundColor: tier.color }}
                    onMouseEnter={() => setHoveredIucn(tier.status)}
                    onMouseLeave={() => setHoveredIucn(null)}
                    className={`h-full transition-all duration-200 relative ${isHovered ? 'brightness-125 z-10' : 'opacity-90'}`}
                    title={`${tier.nameVi} (${tier.status}): ${count} loài (${percentage.toFixed(1)}%)`}
                    aria-hidden="true"
                  />
                );
              })}
            </div>

            <div className="min-h-[24px] text-xs">
              {hoveredIucn ? (
                <div className="flex items-center gap-2 text-fg">
                  <span className="font-semibold text-accent">
                    {IUCN_DISPLAY_TIERS.find((t) => t.status === hoveredIucn)?.nameVi} ({hoveredIucn}):
                  </span>
                  <span className="text-fg-2">{iucnCounts[hoveredIucn]?.names.join(', ')}</span>
                </div>
              ) : (
                <span className="text-fg-3 text-xs">Di chuột lên phân đoạn màu để xem danh sách loài.</span>
              )}
            </div>
          </div>

          {/* Lưới 5 bậc: mang cùng thông tin với thanh màu cho người dùng trình đọc màn hình */}
          <ul className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
            {IUCN_DISPLAY_TIERS.map((tier) => {
              const data = iucnCounts[tier.status] || { count: 0, names: [] };
              const percentage = (data.count / totalSpeciesAnalyzed) * 100;
              return (
                <li
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
                    <p className="text-[11px] text-fg-3 font-mono">{percentage.toFixed(1)}%</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Loài bị đe dọa cao: lấy từ dữ liệu, không tự gán phụ lục CITES */}
        <div className="rounded-2xl border border-danger/40 bg-danger/5 backdrop-blur-xl p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-danger/40 bg-danger/15 p-2.5 text-danger shrink-0">
                <AlertTriangle className="size-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-base font-bold text-fg tracking-tight">Loài bị đe dọa cao</h3>
                <p className="text-xs text-danger font-medium">Cực kỳ nguy cấp (CR) và Nguy cấp (EN)</p>
              </div>
            </div>

            {speciesQuery.isLoading ? (
              <p className="text-xs text-fg-3">Đang tải danh sách loài...</p>
            ) : threatenedSpecies.length === 0 ? (
              <p className="text-xs text-fg-3">Chưa có loài nào ở mức CR hoặc EN.</p>
            ) : (
              <ul className="space-y-2 text-xs text-fg">
                {threatenedSpecies.map((s) => (
                  <li key={s.id} className="flex items-start gap-2 bg-surface/60 rounded-lg p-2.5 border border-line/40">
                    <IucnBadge code={s.conservationStatus} size="sm" showLabel={false} />
                    <div>
                      <p className="font-semibold text-fg">
                        <i className="font-serif">{s.scientificName}</i> ({s.displayName})
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <p className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-xs text-fg-2 leading-relaxed">
              Sản phẩm thuộc các loài này cần được soát kỹ giấy tờ nguồn gốc nhân giống trước khi duyệt.
            </p>
          </div>

          {canModerate && (
            <div className="mt-4 pt-3 border-t border-line/40">
              <Link to="/admin/products" className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline">
                <span>Xem hàng đợi sản phẩm</span>
                <ArrowRight className="size-3" aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface QueuePreviewItem {
  key: string;
  title: string;
  meta: string;
  image?: string;
}

function QueuePreview({
  title,
  to,
  isLoading,
  isError,
  total,
  items,
}: {
  title: string;
  to: string;
  isLoading: boolean;
  isError: boolean;
  total: number;
  items: QueuePreviewItem[];
}): React.JSX.Element {
  return (
    <section className="rounded-2xl border border-line bg-surface/90 backdrop-blur-xl p-6 space-y-4" aria-label={title}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base md:text-lg font-bold text-fg tracking-tight">{title}</h2>
        <StatusPill status="PENDING" />
      </div>

      {isLoading ? (
        <div className="space-y-2" aria-hidden="true">
          {Array.from({ length: QUEUE_PREVIEW_SIZE }).map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-surface-2 animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-sm text-danger">Không tải được hàng đợi.</p>
      ) : items.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-fg-3">
          <Inbox className="size-4" aria-hidden="true" />
          Hàng đợi trống.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.key} className="flex items-center gap-3 rounded-xl border border-line/50 bg-bg-deep/40 p-3">
              {item.image && (
                <img src={item.image} alt="" className="size-10 rounded-lg object-cover border border-line" loading="lazy" />
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-fg">{item.title}</p>
                <p className="truncate text-xs text-fg-3">{item.meta}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Link to={to} className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline">
        <span>{total > items.length ? `Xem cả ${total} hồ sơ` : 'Mở hàng đợi'}</span>
        <ArrowRight className="size-3" aria-hidden="true" />
      </Link>
    </section>
  );
}
