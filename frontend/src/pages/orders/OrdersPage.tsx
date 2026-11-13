import React, { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { Package, ChevronRight } from 'lucide-react';
import { Price } from '@/components/ui/Price';
import { StatusPill } from '@/components/ui/StatusPill';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { PageContainer, PageHeader, Panel } from '@/components/layout/Page';
import { QueryErrorState } from '@/components/domain/QueryErrorState';
import { useOrders } from '@/api/queries/useOrderQueries';
import { resolveProductImage } from '@/api/adapters';
import type { OrderStatus, OrderDto } from '@/types/api';
// import { Search } from 'lucide-react'; // [TN-09]
// import { normalizeSearchString } from '@/components/navigation/QuickSearch'; // [TN-09]

type TabStatus = 'ALL' | OrderStatus;

const TABS: { id: TabStatus; label: string }[] = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'PENDING', label: 'Chờ xử lý' },
  { id: 'COMPLETED', label: 'Hoàn tất' },
  { id: 'CANCELLED', label: 'Đã hủy' },
];

export function formatOrderDate(dateStr?: string): string {
  if (!dateStr) return '--';
  try {
    return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

export default function OrdersPage(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<TabStatus>('ALL');
  // [TN-09] BẮT ĐẦU · Từ khóa tìm đơn
  // const [searchText, setSearchText] = useState('');
  // [TN-09] KẾT THÚC

  // Route đã bọc RequireAuth nên ở đây luôn có token USER
  const { data: orders = [], isLoading, isError, error, refetch, isRefetching } = useOrders();

  const filteredOrders = useMemo(
    () => (activeTab === 'ALL' ? orders : orders.filter((o) => o.status === activeTab)),
    [orders, activeTab]
  );

  // Danh sách đang hiển thị: mặc định là danh sách đã lọc theo trạng thái
  let visibleOrders = filteredOrders;
  // [TN-09] BẮT ĐẦU · Lọc thêm theo mã đơn hoặc tên sản phẩm (không phân biệt hoa thường và dấu)
  // const keyword = normalizeSearchString(searchText);
  // if (keyword) {
    // visibleOrders = filteredOrders.filter((order) => {
      // const productNames = (order.items || []).map((item) => item.productName).join(' ');
      // return normalizeSearchString(`${order.orderCode} ${productNames}`).includes(keyword);
    // });
  // }
  // [TN-09] KẾT THÚC

  const countOf = (tab: TabStatus) => (tab === 'ALL' ? orders.length : orders.filter((o) => o.status === tab).length);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Tài khoản"
        title="Đơn hàng của tôi"
        description="Theo dõi trạng thái từng đơn và xem lại các cá thể bạn đã mua."
      />

      {/* Thanh lọc trạng thái cuộn ngang được trên màn hẹp */}
      <div className="-mx-4 mb-6 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <SegmentedControl
          label="Lọc đơn theo trạng thái"
          value={activeTab}
          onChange={setActiveTab}
          options={TABS.map((tab) => ({ value: tab.id, label: `${tab.label} (${countOf(tab.id)})` }))}
          className="whitespace-nowrap"
        />
      </div>

      {/* [TN-09] BẮT ĐẦU · Ô tìm đơn theo mã hoặc tên sản phẩm */}
      {/*
      <div className="relative mb-6 w-full sm:w-80">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-fg-3" aria-hidden="true" />
        <input
          type="search"
          aria-label="Tìm đơn hàng"
          placeholder="Mã đơn hoặc tên sản phẩm"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="h-11 w-full rounded-full border border-line bg-surface pr-4 pl-10 text-sm text-fg placeholder:text-fg-3 focus:border-accent focus:outline-none"
        />
      </div>
      */}
      {/* [TN-09] KẾT THÚC */}

      {isLoading ? (
        <div className="space-y-3" role="status" aria-label="Đang tải đơn hàng">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-[20px]" />
          ))}
        </div>
      ) : isError ? (
        <QueryErrorState
          title="Không tải được lịch sử đơn hàng"
          error={error}
          onRetry={() => refetch()}
          isRetrying={isRefetching}
        />
      ) : visibleOrders.length === 0 ? (
        <EmptyState
          icon={<Package aria-hidden="true" />}
          title="Chưa có đơn hàng nào ở mục này"
          description="Các đơn bạn đặt trên sàn sinh vật cảnh sẽ hiện ở đây."
          action={{ label: 'Vào sàn sinh vật cảnh', href: '#/products' }}
        />
      ) : (
        <Panel padded={false} className="overflow-hidden">
          <ul className="divide-y divide-line">
            {visibleOrders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </ul>
        </Panel>
      )}
    </PageContainer>
  );
}

function OrderRow({ order }: { order: OrderDto }): React.JSX.Element {
  const items = order.items || [];
  const firstItem = items[0];
  const moreCount = Math.max(0, items.length - 1);
  const code = order.orderCode || `#${order.id}`;

  return (
    <li>
      <Link
        to={`/orders/${order.id}`}
        aria-label={`Xem chi tiết đơn ${code}`}
        className="group flex items-center gap-4 px-5 py-5 transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent md:px-6"
      >
        {/* Ảnh các cá thể trong đơn (danh sách /orders/mine có thể không kèm items) */}
        <div className="flex shrink-0 -space-x-4">
          {items.slice(0, 2).map((item, idx) => (
            <img
              key={idx}
              src={resolveProductImage(item.imageUrl)}
              alt=""
              loading="lazy"
              className="size-14 rounded-xl object-cover ring-2 ring-bg md:size-16"
            />
          ))}
          {items.length === 0 && (
            <span className="flex size-14 items-center justify-center rounded-xl bg-surface-2 text-fg-3 md:size-16">
              <Package className="size-5" aria-hidden="true" />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-mono font-semibold text-fg">{code}</span>
            <StatusPill status={order.status} size="md" />
          </div>
          <p className="mt-1 truncate text-sm text-fg-2">
            {firstItem ? firstItem.productName : 'Đơn hàng sinh vật cảnh'}
            {moreCount > 0 && <span className="text-fg-3"> và {moreCount} sản phẩm khác</span>}
          </p>
          <p className="mt-0.5 text-sm text-fg-3">{formatOrderDate(order.createdAt)}</p>
          <Price amount={order.totalAmount} size="md" className="mt-1 text-fg sm:hidden" />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Price amount={order.totalAmount} size="md" className="hidden text-fg sm:inline-flex" />
          <ChevronRight className="size-5 text-fg-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </div>
      </Link>
    </li>
  );
}
