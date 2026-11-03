import React, { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowRight, RotateCw } from 'lucide-react';
import { useAuthState } from '@/api/queries/useAuthQueries';
import { useAdminSellers, useAdminProducts } from '@/api/queries/useAdminQueries';
import { useSpeciesList } from '@/api/queries/useSpeciesQueries';
import { queryKeys } from '@/api/keys';
import { PageContainer, PageHeader, Panel, Section } from '@/components/layout/Page';
import { Button } from '@/components/ui/Button';
import { IUCN_SPECS, IucnBadge, type ConservationStatus } from '@/components/ui/IucnBadge';
import { StatRow, type StatItem } from '@/components/ui/StatRow';
import { Skeleton } from '@/components/ui/Skeleton';

// Thứ tự từ nguy cấp nhất xuống ít quan tâm
const IUCN_TIERS: ConservationStatus[] = ['CR', 'EN', 'VU', 'NT', 'LC'];

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

  // Đếm loài theo mức IUCN từ dữ liệu thật
  const iucnCounts = useMemo(() => {
    const counts = new Map<ConservationStatus, number>();
    speciesList.forEach((s) => {
      const code = s.conservationStatus as ConservationStatus;
      counts.set(code, (counts.get(code) ?? 0) + 1);
    });
    return counts;
  }, [speciesList]);

  // Loài bị đe dọa cao (CR, EN): sản phẩm của các loài này cần soát kỹ giấy tờ nhân giống
  const threatenedSpecies = useMemo(
    () => speciesList.filter((s) => s.conservationStatus === 'CR' || s.conservationStatus === 'EN'),
    [speciesList]
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.species.all() }),
    ]);
    setIsRefreshing(false);
  };

  const countOf = (query: { isLoading: boolean; isError: boolean }, value: number): React.ReactNode =>
    query.isLoading || query.isError ? '—' : value;

  const stats: StatItem[] = [
    ...(canModerate
      ? [
          { label: 'Shop chờ duyệt', value: countOf(sellersQuery, pendingSellers.length) },
          { label: 'Sản phẩm chờ duyệt', value: countOf(productsQuery, pendingProducts.length) },
        ]
      : []),
    { label: 'Loài trong bách khoa', value: countOf(speciesQuery, speciesList.length) },
    ...(canModerate ? [{ label: 'Shop đang hoạt động', value: countOf(sellersQuery, activeSellersCount) }] : []),
  ];

  const hasError = sellersQuery.isError || productsQuery.isError || speciesQuery.isError;
  const greetingName = auth.user?.fullName || auth.user?.username;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Quản trị"
        title="Tổng quan quản trị"
        description={
          <>
            Xin chào, <span className="text-fg">{greetingName}</span>
            {role && <> · {ROLE_NAME_MAP[role] || role}</>}.
          </>
        }
        actions={
          <Button variant="outline" pill onClick={handleRefresh} isLoading={isRefreshing} leftIcon={<RotateCw className="size-4" aria-hidden="true" />}>
            Làm mới
          </Button>
        }
      />

      {hasError && (
        <div role="alert" className="mb-6 flex flex-wrap items-center justify-between gap-3 border-y border-danger/40 py-3 text-sm text-danger">
          <span>Không tải được một phần số liệu quản trị.</span>
          <Button variant="danger" size="sm" pill onClick={handleRefresh}>
            Thử lại
          </Button>
        </div>
      )}

      <Panel>
        <StatRow items={stats} />
      </Panel>

      {canModerate && (
        <Section title="Hàng đợi kiểm duyệt" description="Ba hồ sơ đầu tiên của mỗi hàng đợi. Mở hàng đợi để duyệt hoặc từ chối.">
          <div className="grid gap-4 lg:grid-cols-2">
            <QueuePreview
              title="Shop chờ duyệt"
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
        </Section>
      )}

      <Section title="Mức bảo tồn" description={`Phân bổ mức IUCN của ${speciesList.length} loài trong bách khoa.`}>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
          <Panel>
            {speciesQuery.isLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <>
                {/* Thanh màu chỉ minh hoạ; danh sách bên dưới mang cùng thông tin cho trình đọc màn hình */}
                <div className="flex h-3 overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
                  {IUCN_TIERS.map((code) => {
                    const count = iucnCounts.get(code) ?? 0;
                    if (count === 0) return null;
                    return (
                      <span
                        key={code}
                        style={{ width: `${(count / Math.max(1, speciesList.length)) * 100}%`, backgroundColor: IUCN_SPECS[code].color }}
                      />
                    );
                  })}
                </div>
                <ul className="mt-5 divide-y divide-line">
                  {IUCN_TIERS.map((code) => {
                    const count = iucnCounts.get(code) ?? 0;
                    const pct = speciesList.length > 0 ? Math.round((count / speciesList.length) * 100) : 0;
                    return (
                      <li key={code} className="flex items-center justify-between gap-3 py-3 text-sm">
                        <span className="flex items-center gap-3">
                          <IucnBadge code={code} size="sm" showLabel={false} />
                          <span className="text-fg">{IUCN_SPECS[code].label}</span>
                        </span>
                        <span className="font-mono text-fg-2">
                          {count} loài · {pct}%
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </Panel>

          <Panel>
            <h3 className="text-lg font-semibold tracking-[-0.02em] text-fg">Loài bị đe dọa cao</h3>
            <p className="mt-1 text-sm text-fg-3">Cực kỳ nguy cấp (CR) và Nguy cấp (EN)</p>
            {speciesQuery.isLoading ? (
              <Skeleton className="mt-4 h-24 w-full" />
            ) : threatenedSpecies.length === 0 ? (
              <p className="mt-4 text-sm text-fg-2">Chưa có loài nào ở mức CR hoặc EN.</p>
            ) : (
              <ul className="mt-4 divide-y divide-line">
                {threatenedSpecies.map((s) => (
                  <li key={s.id}>
                    <Link
                      to={canManageSpecies ? '/admin/species' : `/species/${s.id}`}
                      className="flex items-center justify-between gap-3 py-3 text-sm transition-colors hover:text-accent"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-fg">{s.displayName || s.commonName}</span>
                        <span className="block truncate font-serif text-[15px] text-fg-3 italic">{s.scientificName}</span>
                      </span>
                      <IucnBadge code={s.conservationStatus} size="sm" showLabel={false} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 border-t border-line pt-4 text-sm leading-relaxed text-fg-2">
              Sản phẩm thuộc các loài này cần được soát kỹ giấy tờ nhân giống trước khi duyệt.
            </p>
          </Panel>
        </div>
      </Section>
    </PageContainer>
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
    <Panel>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-lg font-semibold tracking-[-0.02em] text-fg">{title}</h3>
        {!isLoading && !isError && <span className="font-mono text-sm text-fg-3">{total}</span>}
      </div>

      {isLoading ? (
        <div className="mt-4 space-y-2" aria-hidden="true">
          {Array.from({ length: QUEUE_PREVIEW_SIZE }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : isError ? (
        <p className="mt-4 text-sm text-danger">Không tải được hàng đợi.</p>
      ) : items.length === 0 ? (
        <p className="mt-4 text-sm text-fg-2">Hàng đợi trống.</p>
      ) : (
        <ul className="mt-3 divide-y divide-line">
          {items.map((item) => (
            <li key={item.key} className="flex items-center gap-3 py-3">
              {item.image && <img src={item.image} alt="" className="size-11 shrink-0 rounded-xl object-cover" loading="lazy" />}
              <div className="min-w-0">
                <p className="truncate text-[15px] font-medium text-fg">{item.title}</p>
                <p className="truncate text-sm text-fg-3">{item.meta}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Link to={to} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline">
        <span>{total > items.length ? `Xem cả ${total} hồ sơ` : 'Mở hàng đợi'}</span>
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </Panel>
  );
}
