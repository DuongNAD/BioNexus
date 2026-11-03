import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router';
import {
  Store,
  CheckCircle2,
  Clock,
  XCircle,
  Package,
  Plus,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { StatusPill } from '@/components/ui/StatusPill';
import { Ticker } from '@/components/ui/Ticker';
import { EmptyState } from '@/components/ui/EmptyState';
import { ButtonLink } from '@/components/domain/ButtonLink';
import { QueryErrorState } from '@/components/domain/QueryErrorState';
import { useMe } from '@/api/queries/useAuthQueries';
import { useSellerProducts } from '@/api/queries/useSellerQueries';
import type { ProductStatus } from '@/types/api';

type TabInventory = 'ALL' | ProductStatus;

const INVENTORY_TABS: { id: TabInventory; label: string }[] = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'APPROVED', label: 'Đang bán' },
  { id: 'PENDING', label: 'Chờ duyệt' },
  { id: 'REJECTED', label: 'Bị từ chối' },
  { id: 'SOLD_OUT', label: 'Hết hàng' },
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

  // Lọc sản phẩm theo Tab
  const filteredProducts = useMemo(() => {
    if (activeTab === 'ALL') return products;
    if (activeTab === 'SOLD_OUT') return products.filter((p) => p.isOutOfStock || p.status === 'SOLD_OUT');
    return products.filter((p) => p.status === activeTab);
  }, [products, activeTab]);

  // 4 ô thống kê theo tài liệu 03 mục 13, tính từ dữ liệu thật (chưa có API doanh thu nên không hiển thị)
  const approvedCount = products.filter((p) => p.status === 'APPROVED' && !p.isOutOfStock).length;
  const pendingCount = products.filter((p) => p.status === 'PENDING').length;
  const rejectedCount = products.filter((p) => p.status === 'REJECTED').length;
  const soldOutCount = products.filter((p) => p.status === 'SOLD_OUT' || (p.status === 'APPROVED' && p.isOutOfStock)).length;

  if (isMeLoading) {
    return <div className="h-64 rounded-2xl bg-surface animate-pulse max-w-5xl" role="status" aria-label="Đang tải shop" />;
  }

  if (isMeError) {
    return (
      <QueryErrorState
        title="Không tải được thông tin shop"
        error={meError}
        onRetry={() => refetchMe()}
        isRetrying={isMeRefetching}
      />
    );
  }

  // Nếu chưa có shop hoặc shop chưa ACTIVE
  if (!shop || shop.status !== 'ACTIVE') {
    return (
      <div className="rounded-2xl border border-line bg-surface-1 p-8 text-center max-w-lg mx-auto space-y-4">
        <Store className="size-12 text-fg-3 mx-auto" aria-hidden="true" />
        <h1 className="text-xl font-bold text-fg">
          {shop?.status === 'PENDING'
            ? 'Hồ sơ mở shop đang trong quá trình thẩm định'
            : shop?.status === 'REJECTED'
              ? 'Hồ sơ mở shop chưa được phê duyệt'
              : shop?.status === 'BANNED'
                ? 'Shop của bạn đang bị khóa'
                : 'Bạn chưa đăng ký mở shop'}
        </h1>
        <p className="text-sm text-fg-2">
          {shop?.status === 'PENDING'
            ? 'Ban Quản trị đang kiểm tra giấy phép. Bạn chưa thể quản lý kênh bán hàng.'
            : shop?.status === 'REJECTED' || shop?.status === 'BANNED'
              ? 'Mỗi tài khoản chỉ có một hồ sơ shop. Vui lòng liên hệ Ban Quản trị BioNexus để được hướng dẫn.'
              : 'Đăng ký trở thành đối tác nhân giống F2+ để mở gian hàng trên sàn BioNexus.'}
        </p>
        <ButtonLink to={shop ? '/account' : '/seller/apply'} variant="primary" pill>
          {shop ? 'Xem hồ sơ tài khoản' : 'Đăng ký mở shop'}
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* 1. Header Cửa hàng */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-fg font-sans">
              {shop.shopName}
            </h1>
            <span className="flex items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-2.5 py-0.5 text-[11px] text-accent">
              <ShieldCheck className="size-3" aria-hidden="true" /> Shop đã được duyệt
            </span>
          </div>
          <p className="text-xs text-fg-3 max-w-xl">
            {shop.bio || 'Cơ sở nhân giống sinh thái được chứng nhận bởi BioNexus.'}
          </p>
        </div>

        <ButtonLink
          to="/seller/products/new"
          size="md"
          pill
          variant="primary"
          className="gap-2 font-semibold shadow-[var(--glow-accent-btn)]"
        >
          <Plus className="size-4" aria-hidden="true" />
          <span>Đăng bán cá thể mới</span>
        </ButtonLink>
      </div>

      {/* 2. Bốn ô thống kê (StatTile) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Đang bán', value: approvedCount, icon: CheckCircle2, iconClass: 'text-emerald-400', valueClass: 'text-fg', note: 'Đã duyệt, còn hàng' },
          { label: 'Chờ duyệt', value: pendingCount, icon: Clock, iconClass: 'text-amber-400', valueClass: 'text-amber-300', note: 'Đang đợi Ban Quản trị' },
          { label: 'Bị từ chối', value: rejectedCount, icon: XCircle, iconClass: 'text-red-400', valueClass: 'text-red-300', note: 'Cần đăng lại hồ sơ khác' },
          { label: 'Hết hàng', value: soldOutCount, icon: Package, iconClass: 'text-fg-3', valueClass: 'text-fg-2', note: 'Tồn kho về 0' },
        ].map(({ label, value, icon: Icon, iconClass, valueClass, note }) => (
          <div key={label} className="rounded-2xl border border-line bg-surface-1/70 backdrop-blur-md p-4 space-y-2 shadow-md">
            <div className="flex items-center justify-between text-xs text-fg-3">
              <span>{label}</span>
              <Icon className={`size-4 ${iconClass}`} aria-hidden="true" />
            </div>
            <div className={`text-2xl font-bold font-mono ${valueClass}`}>
              <Ticker value={value} />
            </div>
            <span className="text-[11px] text-fg-3 block">{note}</span>
          </div>
        ))}
      </div>

      {/* 3. Bảng Quản Lý Danh Sách Sản Phẩm (Product Inventory Table) */}
      <div className="rounded-2xl border border-line bg-surface-1/80 backdrop-blur-xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line/60 pb-4">
          <h2 className="font-bold text-fg text-base uppercase tracking-wider">
            Danh mục cá thể của shop ({products.length})
          </h2>

          {/* Tabs trạng thái sản phẩm */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {INVENTORY_TABS.map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-accent text-accent-ink font-bold shadow-sm'
                      : 'text-fg-3 hover:text-fg hover:bg-surface-2'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bảng dữ liệu */}
        {isProductsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-surface animate-pulse" />
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
            icon={<Store className="size-8 text-accent" />}
            title="Không có cá thể nào trong mục này"
            description="Hãy bắt đầu đăng bán cá thể nhân tạo F2+ để mở rộng quy mô gian hàng của bạn."
            action={{
              label: 'Đăng bán cá thể mới',
              href: '#/seller/products/new',
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line text-fg-3 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-3">Cá thể</th>
                  <th className="py-3 px-3">Loài sinh học</th>
                  <th className="py-3 px-3">Giá niêm yết</th>
                  <th className="py-3 px-3">Tồn kho</th>
                  <th className="py-3 px-3">Trạng thái</th>
                  <th className="py-3 px-3 text-right"><span className="sr-only">Thao tác</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/40">
                {filteredProducts.map((p) => (
                  <tr
                    key={p.id}
                    className={`transition-colors ${
                      p.id === highlightedId ? 'bg-accent/10 outline outline-1 outline-accent/40' : 'hover:bg-surface-2/40'
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.displayImage}
                          alt=""
                          className="size-10 rounded-lg object-cover border border-line shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="font-semibold text-fg block truncate">{p.productName}</span>
                          <span className="text-[11px] text-fg-3">
                            {p.status === 'PENDING' ? 'Đang chờ kiểm duyệt' : `Mã ${p.id}`}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div>
                        <span className="font-medium text-fg block">{p.speciesCommonName || '--'}</span>
                        {p.speciesScientificName && (
                          <span className="text-[11px] italic text-fg-3 font-serif block">
                            {p.speciesScientificName}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-accent">
                      {p.formattedPrice}
                    </td>

                    <td className="py-3 px-3 font-mono font-semibold">
                      {p.stockQuantity}
                    </td>

                    <td className="py-3 px-3">
                      <StatusPill status={p.status} size="sm" />
                    </td>

                    <td className="py-3 px-3 text-right">
                      {p.status === 'APPROVED' && (
                        <Link
                          to={`/products/${p.id}`}
                          className="inline-flex size-8 items-center justify-center rounded-lg text-fg-3 hover:bg-surface hover:text-accent"
                          aria-label={`Xem ${p.productName} trên sàn`}
                          title="Xem trên sàn"
                        >
                          <Eye className="size-4" aria-hidden="true" />
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
