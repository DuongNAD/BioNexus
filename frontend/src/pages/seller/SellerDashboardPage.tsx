import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Plus, Eye } from 'lucide-react';
import { PageContainer, PageHeader, Section, Panel } from '@/components/layout/Page';
import { StatusPill } from '@/components/ui/StatusPill';
import { StatRow } from '@/components/ui/StatRow';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { ButtonLink } from '@/components/domain/ButtonLink';
import { QueryErrorState } from '@/components/domain/QueryErrorState';
import { useMe } from '@/api/queries/useAuthQueries';
import { useSellerProducts } from '@/api/queries/useSellerQueries';
import { cn } from '@/lib/cn';
import type { ProductStatus } from '@/types/api';
import { ShopStatusNotice } from './components/ShopStatusNotice';

type TabInventory = 'ALL' | ProductStatus;

const INVENTORY_TABS: { value: TabInventory; label: string }[] = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'APPROVED', label: 'Đang bán' },
  { value: 'PENDING', label: 'Chờ duyệt' },
  { value: 'REJECTED', label: 'Bị từ chối' },
  { value: 'SOLD_OUT', label: 'Hết hàng' },
];

export default function SellerDashboardPage(): React.JSX.Element {
  const [searchParams] = useSearchParams();
  // Sản phẩm vừa đăng (từ trang đăng bán chuyển về) được tô sáng trong bảng
  const highlightedId = Number(searchParams.get('moi')) || null;
  const {
    data: me,
    isLoading: isMeLoading,
    isError: isMeError,
    error: meError,
    refetch: refetchMe,
    isRefetching: isMeRefetching,
  } = useMe();
  const shop = me?.shop;

  const {
    data: products = [],
    isLoading: isProductsLoading,
    isError: isProductsError,
    error: productsError,
    refetch: refetchProducts,
    isRefetching: isProductsRefetching,
  } = useSellerProducts({
    enabled: shop?.status === 'ACTIVE',
  });

  const [activeTab, setActiveTab] = useState<TabInventory>('ALL');

  const filteredProducts = useMemo(() => {
    if (activeTab === 'ALL') return products;
    if (activeTab === 'SOLD_OUT') return products.filter((p) => p.isOutOfStock || p.status === 'SOLD_OUT');
    return products.filter((p) => p.status === activeTab);
  }, [products, activeTab]);

  // 4 số liệu theo tài liệu 03 mục 13, tính từ dữ liệu thật (chưa có API doanh thu nên không hiển thị)
  const approvedCount = products.filter((p) => p.status === 'APPROVED' && !p.isOutOfStock).length;
  const pendingCount = products.filter((p) => p.status === 'PENDING').length;
  const rejectedCount = products.filter((p) => p.status === 'REJECTED').length;
  const soldOutCount = products.filter((p) => p.status === 'SOLD_OUT' || (p.status === 'APPROVED' && p.isOutOfStock)).length;

  if (isMeLoading) {
    return (
      <PageContainer className="space-y-6 py-12" role="status" aria-label="Đang tải shop">
        <Skeleton className="h-24 w-1/2" />
        <Skeleton className="h-64 w-full rounded-[20px]" />
      </PageContainer>
    );
  }

  if (isMeError) {
    return (
      <PageContainer className="py-16">
        <QueryErrorState title="Không tải được thông tin shop" error={meError} onRetry={() => refetchMe()} isRetrying={isMeRefetching} />
      </PageContainer>
    );
  }

  if (!shop || shop.status !== 'ACTIVE') {
    return <ShopStatusNotice shop={shop ?? null} context="dashboard" />;
  }

  return (
    <PageContainer className="pb-20">
      <PageHeader
        eyebrow="Kênh người bán"
        title={shop.shopName}
        description={shop.bio || 'Cơ sở nhân giống đã được Ban Quản trị BioNexus duyệt.'}
        meta={<StatusPill status="ACTIVE" size="sm" />}
        actions={
          <ButtonLink to="/seller/products/new" pill>
            <Plus className="size-4" aria-hidden="true" />
            <span>Đăng bán cá thể mới</span>
          </ButtonLink>
        }
      />

      <StatRow
        className="border-y border-line py-2"
        items={[
          { label: 'Đang bán', value: approvedCount, hint: 'Đã duyệt, còn hàng' },
          { label: 'Chờ duyệt', value: pendingCount, hint: 'Đợi Ban Quản trị' },
          { label: 'Bị từ chối', value: rejectedCount, hint: 'Không lên sàn' },
          { label: 'Hết hàng', value: soldOutCount, hint: 'Tồn kho về 0' },
        ]}
      />

      <Section
        title={`Cá thể của shop (${products.length})`}
        actions={
          <div className="-mx-4 max-w-[calc(100vw-2rem)] overflow-x-auto px-4 sm:mx-0 sm:max-w-none sm:px-0">
            <SegmentedControl
              label="Lọc theo trạng thái"
              options={INVENTORY_TABS}
              value={activeTab}
              onChange={setActiveTab}
              // w-max: giữ nhãn trên một dòng, vùng bọc ngoài tự cuộn ngang trên mobile
              className="w-max [&>button]:whitespace-nowrap"
            />
          </div>
        }
      >
        {isProductsLoading ? (
          <div className="space-y-3" role="status" aria-label="Đang tải sản phẩm">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : isProductsError ? (
          <QueryErrorState
            title="Không tải được danh sách sản phẩm"
            error={productsError}
            onRetry={() => refetchProducts()}
            isRetrying={isProductsRefetching}
          />
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            title="Không có cá thể nào trong mục này"
            description="Đăng bán cá thể nhân giống F2+ để gian hàng có sản phẩm trên sàn."
            action={{ label: 'Đăng bán cá thể mới', href: '#/seller/products/new' }}
          />
        ) : (
          <>
            {/* Mobile: danh sách gọn thay cho bảng 6 cột */}
            <ul className="divide-y divide-line border-y border-line sm:hidden">
              {filteredProducts.map((p) => (
                <li key={p.id} className={cn('flex items-center gap-3 py-3', p.id === highlightedId && 'bg-accent/10')}>
                  <img src={p.displayImage} alt="" className="size-14 shrink-0 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-fg">{p.productName}</p>
                    <p className="mt-0.5 text-sm text-fg-3">
                      <span className="font-mono text-fg-2">{p.formattedPrice}</span> · Còn {p.stockQuantity}
                    </p>
                    <StatusPill status={p.status} size="sm" className="mt-1.5" />
                  </div>
                  {p.status === 'APPROVED' && (
                    <Link
                      to={`/products/${p.id}`}
                      className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-fg-3 hover:text-accent"
                      aria-label={`Xem ${p.productName} trên sàn`}
                    >
                      <Eye className="size-4" aria-hidden="true" />
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            <Panel
              padded={false}
              /* relative: ô sr-only (absolute) phải nằm trong vùng cuộn, nếu không trang tràn ngang */
              className="relative hidden overflow-x-auto sm:block"
            >
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-line text-sm whitespace-nowrap text-fg-3">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-medium">Cá thể</th>
                    <th scope="col" className="px-5 py-3 font-medium">Loài</th>
                    <th scope="col" className="px-5 py-3 text-right font-medium">Giá</th>
                    <th scope="col" className="px-5 py-3 text-right font-medium">Tồn kho</th>
                    <th scope="col" className="px-5 py-3 font-medium">Trạng thái</th>
                    <th scope="col" className="px-5 py-3">
                      <span className="sr-only">Thao tác</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className={cn('transition-colors', p.id === highlightedId ? 'bg-accent/10' : 'hover:bg-surface')}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img src={p.displayImage} alt="" className="size-12 shrink-0 rounded-xl object-cover" />
                          <div className="min-w-0">
                            <span className="block truncate font-medium text-fg">{p.productName}</span>
                            <span className="block text-sm text-fg-3">
                              {p.id === highlightedId ? (
                                'Vừa đăng'
                              ) : p.status === 'PENDING' ? (
                                'Đang chờ kiểm duyệt'
                              ) : (
                                <span className="font-mono">#{p.id}</span>
                              )}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="block text-fg-2">{p.speciesCommonName || 'Chưa rõ'}</span>
                        {p.speciesScientificName && (
                          <span className="block font-serif text-[15px] text-fg-3 italic">{p.speciesScientificName}</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right font-mono whitespace-nowrap tabular-nums text-fg">{p.formattedPrice}</td>
                      <td className="px-5 py-3 text-right font-mono whitespace-nowrap tabular-nums text-fg">{p.stockQuantity}</td>
                      <td className="px-5 py-3">
                        <StatusPill status={p.status} size="sm" />
                      </td>
                      <td className="px-5 py-3 text-right">
                        {p.status === 'APPROVED' && (
                          <Link
                            to={`/products/${p.id}`}
                            className="inline-flex size-9 items-center justify-center rounded-full text-fg-3 transition-colors hover:bg-surface-2 hover:text-accent"
                            aria-label={`Xem ${p.productName} trên sàn`}
                          >
                            <Eye className="size-4" aria-hidden="true" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          </>
        )}
      </Section>
    </PageContainer>
  );
}
