// Hằng số này giữ file không rỗng khi khối bên dưới đang bị comment (lint cấm file rỗng).
export const FEATURE_INFO = 'TN-05 · Người bán xem đơn hàng của shop (xem CHUC-NANG-MUA-HANG-THEM.md)';

// [TN-05] BẮT ĐẦU · Khối "Đơn hàng của shop" trên bảng điều khiển người bán
// import React from 'react';
// import { ReceiptText } from 'lucide-react';
// import { useSellerOrders } from '@/api/queries/useSellerQueries';
// import { Panel, Section } from '@/components/layout/Page';
// import { QueryErrorState } from '@/components/domain/QueryErrorState';
// import { EmptyState } from '@/components/ui/EmptyState';
// import { Price } from '@/components/ui/Price';
// import { Skeleton } from '@/components/ui/Skeleton';
// import { StatusPill } from '@/components/ui/StatusPill';
// import { formatOrderDate } from '@/pages/orders/OrdersPage';
// import type { SellerOrderDto } from '@/types/api';

// /** Mỗi đơn chỉ hiện các món của shop mình; tiền là tiền hàng của shop trong đơn đó. */
// export function ShopOrdersSection(): React.JSX.Element {
  // const { data: orders = [], isLoading, isError, error, refetch, isRefetching } = useSellerOrders();

  // let pendingCount = 0;
  // for (const order of orders) {
    // if (order.status === 'PENDING') pendingCount = pendingCount + 1;
  // }

  // let body: React.ReactNode;
  // if (isLoading) {
    // body = (
      // <div className="space-y-3" role="status" aria-label="Đang tải đơn hàng của shop">
        // {Array.from({ length: 3 }).map((_, i) => (
          // <Skeleton key={i} className="h-20 w-full" />
        // ))}
      // </div>
    // );
  // } else if (isError) {
    // body = <QueryErrorState title="Không tải được đơn hàng của shop" error={error} onRetry={() => refetch()} isRetrying={isRefetching} />;
  // } else if (orders.length === 0) {
    // body = (
      // <EmptyState
        // icon={<ReceiptText aria-hidden="true" />}
        // title="Shop chưa có đơn hàng"
        // description="Khi người mua đặt cá thể của shop, đơn sẽ hiện ở đây."
      // />
    // );
  // } else {
    // body = (
      // <Panel padded={false} className="overflow-hidden">
        // <ul className="divide-y divide-line">
          // {orders.map((order) => (
            // <ShopOrderRow key={order.id} order={order} />
          // ))}
        // </ul>
      // </Panel>
    // );
  // }

  // return (
    // <Section
      // title={`Đơn hàng của shop (${orders.length})`}
      // description={pendingCount > 0 ? `${pendingCount} đơn đang chờ xử lý, hãy chuẩn bị cá thể để giao.` : undefined}
    // >
      // {body}
    // </Section>
  // );
// }

// function ShopOrderRow({ order }: { order: SellerOrderDto }): React.JSX.Element {
  // return (
    // <li className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-start md:px-6">
      // <div className="min-w-0 flex-1">
        // <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          // <span className="font-mono font-semibold text-fg">{order.orderCode}</span>
          // <StatusPill status={order.status} size="sm" />
        // </div>
        // <p className="mt-1 text-sm text-fg-2">
          // {order.buyerFullName || 'Người mua'}
          // <span className="text-fg-3"> · {formatOrderDate(order.createdAt)}</span>
        // </p>
        // <ul className="mt-1 space-y-0.5 text-sm text-fg-3">
          // {order.items.map((item) => (
            // <li key={item.productId} className="truncate">
              // {item.productName} × <span className="font-mono">{item.quantity}</span>
            // </li>
          // ))}
        // </ul>
        // <p className="mt-1 truncate text-sm text-fg-3">Giao đến: {order.shippingAddress}</p>
      // </div>
      // <Price amount={order.shopTotal} size="md" className="shrink-0 text-fg" />
    // </li>
  // );
// }
// [TN-05] KẾT THÚC
