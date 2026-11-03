import React, { useState, useMemo } from 'react';
import { Package, ArrowRight, MapPin } from 'lucide-react';
import { Price } from '@/components/ui/Price';
import { StatusPill } from '@/components/ui/StatusPill';
import { EmptyState } from '@/components/ui/EmptyState';
import { ButtonLink } from '@/components/domain/ButtonLink';
import { QueryErrorState } from '@/components/domain/QueryErrorState';
import { useOrders } from '@/api/queries/useOrderQueries';
import { resolveProductImage } from '@/api/adapters';
import type { OrderStatus, OrderDto } from '@/types/api';

type TabStatus = 'ALL' | OrderStatus;

const TABS: { id: TabStatus; label: string }[] = [
  { id: 'ALL', label: 'Tất cả đơn hàng' },
  { id: 'PENDING', label: 'Chờ xử lý' },
  { id: 'COMPLETED', label: 'Hoàn tất' },
  { id: 'CANCELLED', label: 'Đã hủy' },
];

export default function OrdersPage(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<TabStatus>('ALL');

  // Route đã bọc RequireAuth nên ở đây luôn có token USER
  const { data: orders = [], isLoading, isError, error, refetch, isRefetching } = useOrders();

  // Lọc theo tab trạng thái
  const filteredOrders = useMemo(() => {
    if (activeTab === 'ALL') return orders;
    return orders.filter((o) => o.status === activeTab);
  }, [orders, activeTab]);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-fg font-sans">
          Lịch Sử Đơn Hàng
        </h1>
        <p className="mt-1 text-xs text-fg-3">
          Theo dõi tiến độ đóng gói bảo ôn và vận chuyển chuyên dụng các cá thể cảnh của bạn
        </p>
      </div>

      {/* Tabs trạng thái */}
      <div className="flex items-center gap-2 border-b border-line pb-2 overflow-x-auto">
        {TABS.map((tab) => {
          const isSelected = activeTab === tab.id;
          const count =
            tab.id === 'ALL'
              ? orders.length
              : orders.filter((o) => o.status === tab.id).length;

          return (
            <button
              key={tab.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                isSelected
                  ? 'bg-accent/15 text-accent font-semibold border border-accent/30 shadow-sm'
                  : 'text-fg-3 hover:text-fg hover:bg-surface-2'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-surface-2">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Danh sách đơn hàng */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 rounded-2xl bg-surface animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <QueryErrorState
          title="Không tải được lịch sử đơn hàng"
          error={error}
          onRetry={() => refetch()}
          isRetrying={isRefetching}
        />
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon={<Package className="size-8 text-accent" />}
          title="Chưa có đơn hàng nào trong mục này"
          description="Khám phá các cá thể cảnh nhân tạo F2+ đang mở bán trên sàn BioNexus."
          action={{
            label: 'Khám phá sàn sinh vật cảnh',
            href: '#/products',
          }}
        />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} formatDate={formatDate} />
          ))}
        </div>
      )}
    </div>
  );
}

const OrderCard: React.FC<{ order: OrderDto; formatDate: (d: string) => string }> = ({
  order,
  formatDate,
}) => {
  const items = order.items || [];
  const firstItem = items[0];
  const moreCount = Math.max(0, items.length - 1);

  return (
    <div className="rounded-2xl border border-line bg-surface-1/70 backdrop-blur-md p-5 md:p-6 shadow-md hover:border-accent/30 transition-all space-y-4">
      {/* Header card: Mã đơn + Ngày đặt + StatusPill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line/60 pb-3">
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold text-accent text-sm">
            {order.orderCode || `ORD-2026-${order.id.toString().padStart(4, '0')}`}
          </span>
          <span className="text-xs text-fg-3">· {formatDate(order.createdAt)}</span>
        </div>

        <StatusPill status={order.status} size="sm" />
      </div>

      {/* Body: Chồng ảnh + Tóm tắt sản phẩm + Địa chỉ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Chồng ảnh nhỏ các cá thể (StackedPhotoAvatars) */}
          <div className="flex -space-x-3 overflow-hidden shrink-0">
            {items.slice(0, 3).map((item, idx) => (
              <div
                key={idx}
                className="size-14 rounded-xl border-2 border-bg bg-surface-2 overflow-hidden shadow-sm"
              >
                <img
                  src={resolveProductImage(item.imageUrl)}
                  alt={item.productName}
                  loading="lazy"
                  className="size-full object-cover"
                />
              </div>
            ))}
            {items.length > 3 && (
              <div className="size-14 rounded-xl border-2 border-bg bg-surface-2 flex items-center justify-center text-xs font-mono font-bold text-accent shadow-sm">
                +{items.length - 3}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <h2 className="font-semibold text-fg text-sm truncate">
              {firstItem ? firstItem.productName : 'Đơn hàng sinh vật cảnh'}
            </h2>
            {moreCount > 0 && (
              <p className="text-xs text-fg-3 font-mono mt-0.5">+ {moreCount} cá thể khác</p>
            )}
            <div className="flex items-center gap-1.5 text-xs text-fg-3 mt-1.5 truncate max-w-md">
              <MapPin className="size-3 shrink-0" aria-hidden="true" />
              <span className="truncate">{order.shippingAddress}</span>
            </div>
          </div>
        </div>

        {/* Footer: Tổng tiền + Nút Chi tiết */}
        <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-line/40">
          <div className="text-left md:text-right">
            <span className="block text-[11px] text-fg-3 uppercase">Tổng thanh toán:</span>
            <Price amount={order.totalAmount} size="md" className="text-accent" />
          </div>

          <ButtonLink
            to={`/orders/${order.id}`}
            size="sm"
            variant="secondary"
            pill
            className="gap-1 text-xs"
            aria-label={`Xem chi tiết đơn ${order.orderCode}`}
          >
            <span>Xem chi tiết</span>
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </ButtonLink>
        </div>
      </div>
    </div>
  );
};
