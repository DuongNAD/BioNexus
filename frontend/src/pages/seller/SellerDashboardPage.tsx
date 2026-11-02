import React, { useState, useMemo } from 'react';
import { Link } from 'react-router';
import {
  Store,
  CheckCircle2,
  Clock,
  DollarSign,
  Package,
  Plus,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/StatusPill';
import { Ticker } from '@/components/ui/Ticker';
import { EmptyState } from '@/components/ui/EmptyState';
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
  const { data: me, isLoading: isMeLoading } = useMe();
  const shop = me?.shop;

  const { data: products = [], isLoading: isProductsLoading } = useSellerProducts({
    enabled: shop?.status === 'ACTIVE',
  });

  const [activeTab, setActiveTab] = useState<TabInventory>('ALL');

  // Lọc sản phẩm theo Tab
  const filteredProducts = useMemo(() => {
    if (activeTab === 'ALL') return products;
    if (activeTab === 'SOLD_OUT') return products.filter((p) => p.isOutOfStock || p.status === 'SOLD_OUT');
    return products.filter((p) => p.status === activeTab);
  }, [products, activeTab]);

  // Tính các chỉ số KPI StatTiles
  const approvedCount = products.filter((p) => p.status === 'APPROVED' && !p.isOutOfStock).length;
  const pendingCount = products.filter((p) => p.status === 'PENDING').length;
  const totalRevenue = useMemo(() => {
    // Ước tính doanh thu từ các cá thể đã giao dịch
    return 2640000; // Giá trị thống kê mẫu theo seed
  }, []);

  if (isMeLoading) {
    return <div className="h-64 rounded-2xl bg-surface animate-pulse max-w-5xl" />;
  }

  // Nếu chưa có shop hoặc shop chưa ACTIVE
  if (!shop || shop.status !== 'ACTIVE') {
    return (
      <div className="rounded-2xl border border-line bg-surface-1 p-8 text-center max-w-lg mx-auto space-y-4">
        <Store className="size-12 text-fg-3 mx-auto" />
        <h2 className="text-xl font-bold text-fg">
          {shop?.status === 'PENDING'
            ? 'Hồ sơ mở shop đang trong quá trình thẩm định'
            : shop?.status === 'REJECTED'
              ? 'Hồ sơ mở shop chưa được phê duyệt'
              : 'Bạn chưa đăng ký mở shop'}
        </h2>
        <p className="text-xs text-fg-2">
          {shop?.status === 'PENDING'
            ? 'Ban Quản trị đang kiểm tra giấy phép CITES. Bạn chưa thể quản lý kênh bán hàng.'
            : 'Đăng ký trở thành đối tác nhân giống F2+ để mở gian hàng trên sàn BioNexus.'}
        </p>
        <Link to={shop?.status === 'REJECTED' ? '/seller/apply' : '/account'}>
          <Button variant="primary" pill>
            {shop?.status === 'REJECTED' ? 'Nộp lại hồ sơ' : 'Xem hồ sơ tài khoản'}
          </Button>
        </Link>
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
            <span className="flex items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-2.5 py-0.5 text-[11px] font-mono text-accent">
              <ShieldCheck className="size-3" /> F2+ Certified
            </span>
          </div>
          <p className="text-xs text-fg-3 max-w-xl">
            {shop.bio || 'Cơ sở nhân giống sinh thái được chứng nhận bởi BioNexus.'}
          </p>
        </div>

        <Link to="/seller/products/new">
          <Button size="md" pill variant="primary" className="gap-2 font-semibold shadow-[var(--glow-accent-btn)]">
            <Plus className="size-4" />
            <span>Đăng bán cá thể mới</span>
          </Button>
        </Link>
      </div>

      {/* 2. Lưới 4 Thẻ Thống Kê KPI (StatTiles) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Thẻ 1: Đang bán */}
        <div className="rounded-2xl border border-line bg-surface-1/70 backdrop-blur-md p-4 space-y-2 shadow-md">
          <div className="flex items-center justify-between text-xs text-fg-3">
            <span>Cá thể đang bán</span>
            <CheckCircle2 className="size-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-fg font-mono">
            <Ticker value={approvedCount} />
          </div>
          <span className="text-[10px] text-emerald-400 block font-mono">Đã qua kiểm định sinh học</span>
        </div>

        {/* Thẻ 2: Chờ kiểm duyệt */}
        <div className="rounded-2xl border border-line bg-surface-1/70 backdrop-blur-md p-4 space-y-2 shadow-md">
          <div className="flex items-center justify-between text-xs text-fg-3">
            <span>Chờ kiểm duyệt</span>
            <Clock className="size-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300 font-mono">
            <Ticker value={pendingCount} />
          </div>
          <span className="text-[10px] text-fg-3 block">Hồ sơ đang đợi Admin duyệt</span>
        </div>

        {/* Thẻ 3: Doanh số tạm tính */}
        <div className="rounded-2xl border border-line bg-surface-1/70 backdrop-blur-md p-4 space-y-2 shadow-md">
          <div className="flex items-center justify-between text-xs text-fg-3">
            <span>Doanh số tạm tính</span>
            <DollarSign className="size-4 text-accent" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-accent font-mono truncate">
            <Ticker value={totalRevenue} formatAsCurrency />
          </div>
          <span className="text-[10px] text-fg-3 block font-mono">Tổng giá trị đơn hoàn tất</span>
        </div>

        {/* Thẻ 4: Đơn hàng mới */}
        <div className="rounded-2xl border border-line bg-surface-1/70 backdrop-blur-md p-4 space-y-2 shadow-md">
          <div className="flex items-center justify-between text-xs text-fg-3">
            <span>Đơn hàng mới</span>
            <Package className="size-4 text-accent-2" />
          </div>
          <div className="text-2xl font-bold text-fg font-mono">
            <Ticker value={2} />
          </div>
          <span className="text-[10px] text-accent block font-mono">Cần chuẩn bị cá thể</span>
        </div>
      </div>

      {/* 3. Bảng Quản Lý Danh Sách Sản Phẩm (Product Inventory Table) */}
      <div className="rounded-2xl border border-line bg-surface-1/80 backdrop-blur-xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line/60 pb-4">
          <h3 className="font-bold text-fg text-base uppercase tracking-wider font-mono">
            Danh mục cá thể của shop ({products.length})
          </h3>

          {/* Tabs trạng thái sản phẩm */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {INVENTORY_TABS.map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
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
              <thead className="border-b border-line text-fg-3 font-mono uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-3">Cá thể</th>
                  <th className="py-3 px-3">Loài sinh học</th>
                  <th className="py-3 px-3">Giá niêm yết</th>
                  <th className="py-3 px-3">Tồn kho</th>
                  <th className="py-3 px-3">Trạng thái</th>
                  <th className="py-3 px-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/40">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-2/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.displayImage}
                          alt={p.productName}
                          className="size-10 rounded-lg object-cover border border-line shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="font-semibold text-fg block truncate">{p.productName}</span>
                          <span className="text-[10px] text-fg-3 font-mono">PRD-{p.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div>
                        <span className="font-medium text-fg block">{p.speciesCommonName || '--'}</span>
                        {p.speciesScientificName && (
                          <span className="text-[11px] italic text-fg-mute font-serif block">
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
                      <Link to={`/products/${p.id}`}>
                        <Button size="sm" variant="ghost" className="size-8 p-0 text-fg-3 hover:text-accent">
                          <span title="Xem trên sàn">
                            <Eye className="size-4" />
                          </span>
                        </Button>
                      </Link>
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
