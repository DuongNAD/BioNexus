// Hằng số này giữ file không rỗng khi khối bên dưới đang bị comment (lint cấm file rỗng).
export const FEATURE_INFO = 'TN-03 · Quản trị viên quản lý đơn hàng (xem CHUC-NANG-MUA-HANG-THEM.md)';

// [TN-03] BẮT ĐẦU · Trang quản trị đơn hàng: xem mọi đơn, lọc, hoàn tất hoặc hủy (hủy thì hoàn kho)
// import React, { useMemo, useState } from 'react';
// import { CheckCircle2, ReceiptText, XCircle } from 'lucide-react';
// import { toast } from 'sonner';
// import { useAdminOrders } from '@/api/queries/useAdminQueries';
// import { useUpdateOrderStatus } from '@/api/mutations/useAdminMutations';
// import { PageContainer, PageHeader, Panel } from '@/components/layout/Page';
// import { QueryErrorState } from '@/components/domain/QueryErrorState';
// import { Button } from '@/components/ui/Button';
// import { EmptyState } from '@/components/ui/EmptyState';
// import { Price } from '@/components/ui/Price';
// import { Skeleton } from '@/components/ui/Skeleton';
// import { StatusPill } from '@/components/ui/StatusPill';
// import {
  // Dialog,
  // DialogContent,
  // DialogHeader,
  // DialogTitle,
  // DialogDescription,
  // DialogFooter,
// } from '@/components/ui/Dialog';
// import { normalizeSearchString } from '@/components/navigation/QuickSearch';
// import { errorMessage, formatDateVi, QueueFilter, QueueSearch } from './components/AdminKit';
// import type { AdminOrderDto, OrderStatus } from '@/types/api';

// type StatusFilter = OrderStatus | 'ALL';

// const STATUS_TABS: { id: StatusFilter; label: string }[] = [
  // { id: 'PENDING', label: 'Chờ xử lý' },
  // { id: 'COMPLETED', label: 'Hoàn tất' },
  // { id: 'CANCELLED', label: 'Đã hủy' },
  // { id: 'ALL', label: 'Tất cả' },
// ];

// export default function AdminOrdersPage(): React.JSX.Element {
  // // Tải mọi đơn một lần rồi lọc ở giao diện, để đếm được số đơn của từng tab
  // const { data: orders = [], isLoading, isError, error, refetch, isRefetching } = useAdminOrders();
  // const updateStatus = useUpdateOrderStatus();

  // const [statusFilter, setStatusFilter] = useState<StatusFilter>('PENDING');
  // const [search, setSearch] = useState('');
  // const [orderToCancel, setOrderToCancel] = useState<AdminOrderDto | null>(null);

  // const counts: Record<StatusFilter, number> = {
    // PENDING: orders.filter((o) => o.status === 'PENDING').length,
    // COMPLETED: orders.filter((o) => o.status === 'COMPLETED').length,
    // CANCELLED: orders.filter((o) => o.status === 'CANCELLED').length,
    // ALL: orders.length,
  // };

  // const visibleOrders = useMemo(() => {
    // let list = orders;
    // if (statusFilter !== 'ALL') {
      // list = list.filter((o) => o.status === statusFilter);
    // }
    // const keyword = normalizeSearchString(search);
    // if (keyword) {
      // // Tìm theo mã đơn, tên đăng nhập hoặc họ tên người mua (không phân biệt dấu)
      // list = list.filter((o) => {
        // const haystack = normalizeSearchString(`${o.orderCode} ${o.buyerUsername ?? ''} ${o.buyerFullName ?? ''}`);
        // return haystack.includes(keyword);
      // });
    // }
    // return list;
  // }, [orders, statusFilter, search]);

  // const changeStatus = async (order: AdminOrderDto, status: OrderStatus) => {
    // try {
      // await updateStatus.mutateAsync({ orderId: order.id, status });
      // if (status === 'COMPLETED') {
        // toast.success(`Đơn ${order.orderCode} đã hoàn tất`);
      // } else {
        // toast.success(`Đã hủy đơn ${order.orderCode}, kho đã được hoàn lại`);
      // }
    // } catch (err) {
      // toast.error(errorMessage(err, 'Không cập nhật được trạng thái đơn'));
    // }
  // };

  // const handleConfirmCancel = async () => {
    // if (!orderToCancel) return;
    // await changeStatus(orderToCancel, 'CANCELLED');
    // setOrderToCancel(null);
  // };

  // let content: React.ReactNode;
  // if (isLoading) {
    // content = (
      // <div className="space-y-3" role="status" aria-label="Đang tải đơn hàng">
        // {Array.from({ length: 4 }).map((_, i) => (
          // <Skeleton key={i} className="h-24 w-full rounded-[20px]" />
        // ))}
      // </div>
    // );
  // } else if (isError) {
    // content = (
      // <QueryErrorState title="Không tải được danh sách đơn" error={error} onRetry={() => refetch()} isRetrying={isRefetching} />
    // );
  // } else if (visibleOrders.length === 0) {
    // content = (
      // <EmptyState
        // icon={<ReceiptText aria-hidden="true" />}
        // title="Không có đơn nào ở mục này"
        // description="Thử chọn trạng thái khác hoặc xóa từ khóa tìm kiếm."
      // />
    // );
  // } else {
    // content = (
      // <Panel padded={false} className="overflow-hidden">
        // <ul className="divide-y divide-line">
          // {visibleOrders.map((order) => (
            // <AdminOrderRow
              // key={order.id}
              // order={order}
              // isBusy={updateStatus.isPending && updateStatus.variables?.orderId === order.id}
              // onComplete={() => changeStatus(order, 'COMPLETED')}
              // onCancel={() => setOrderToCancel(order)}
            // />
          // ))}
        // </ul>
      // </Panel>
    // );
  // }

  // return (
    // <PageContainer>
      // <PageHeader
        // eyebrow="Quản trị"
        // title="Quản lý đơn hàng"
        // description="Theo dõi mọi đơn trên sàn. Đơn đang chờ xử lý có thể chuyển sang hoàn tất hoặc hủy (hủy thì trả cá thể về kho)."
      // />

      // <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        // <QueueFilter tabs={STATUS_TABS} value={statusFilter} counts={counts} onChange={setStatusFilter} />
        // <QueueSearch
          // value={search}
          // onChange={setSearch}
          // label="Tìm đơn hàng"
          // placeholder="Mã đơn hoặc tên người mua"
        // />
      // </div>

      // {content}

      // <Dialog open={orderToCancel !== null} onOpenChange={(open) => !open && setOrderToCancel(null)}>
        // <DialogContent className="max-w-md">
          // <DialogHeader>
            // <DialogTitle>Hủy đơn {orderToCancel?.orderCode}?</DialogTitle>
            // <DialogDescription className="pt-2 leading-relaxed text-fg-2">
              // Đơn chuyển sang Đã hủy và các cá thể trong đơn được cộng lại vào kho của cửa hàng. Không hoàn tác được.
            // </DialogDescription>
          // </DialogHeader>
          // <DialogFooter className="mt-4 gap-2">
            // <Button variant="secondary" pill onClick={() => setOrderToCancel(null)}>
              // Giữ đơn
            // </Button>
            // <Button variant="danger" pill onClick={handleConfirmCancel} isLoading={updateStatus.isPending}>
              // Xác nhận hủy
            // </Button>
          // </DialogFooter>
        // </DialogContent>
      // </Dialog>
    // </PageContainer>
  // );
// }

// function AdminOrderRow({
  // order,
  // isBusy,
  // onComplete,
  // onCancel,
// }: {
  // order: AdminOrderDto;
  // isBusy: boolean;
  // onComplete: () => void;
  // onCancel: () => void;
// }): React.JSX.Element {
  // const items = order.items || [];
  // const firstItem = items[0];
  // const buyerName = order.buyerFullName || order.buyerUsername || 'Không rõ người mua';

  // return (
    // <li className="flex flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:px-6">
      // <div className="min-w-0 flex-1">
        // <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          // <span className="font-mono font-semibold text-fg">{order.orderCode}</span>
          // <StatusPill status={order.status} size="md" />
        // </div>
        // <p className="mt-1 text-sm text-fg-2">
          // {buyerName}
          // {order.buyerUsername && <span className="text-fg-3"> · @{order.buyerUsername}</span>}
          // <span className="text-fg-3"> · {formatDateVi(order.createdAt) ?? '--'}</span>
        // </p>
        // <p className="mt-0.5 truncate text-sm text-fg-3">
          // {firstItem ? `${firstItem.productName} × ${firstItem.quantity}` : 'Đơn không có dòng hàng'}
          // {items.length > 1 && ` và ${items.length - 1} sản phẩm khác`}
        // </p>
        // <p className="mt-0.5 truncate text-sm text-fg-3">Giao đến: {order.shippingAddress}</p>
      // </div>

      // <div className="flex shrink-0 flex-wrap items-center gap-3 md:justify-end">
        // <Price amount={order.totalAmount} size="md" className="text-fg" />
        // {order.status === 'PENDING' && (
          // <>
            // <Button
              // size="sm"
              // pill
              // onClick={onComplete}
              // disabled={isBusy}
              // leftIcon={<CheckCircle2 className="size-4" aria-hidden="true" />}
              // aria-label={`Hoàn tất đơn ${order.orderCode}`}
            // >
              // Hoàn tất
            // </Button>
            // <Button
              // size="sm"
              // pill
              // variant="danger"
              // onClick={onCancel}
              // disabled={isBusy}
              // leftIcon={<XCircle className="size-4" aria-hidden="true" />}
              // aria-label={`Hủy đơn ${order.orderCode}`}
            // >
              // Hủy
            // </Button>
          // </>
        // )}
      // </div>
    // </li>
  // );
// }
// [TN-03] KẾT THÚC
