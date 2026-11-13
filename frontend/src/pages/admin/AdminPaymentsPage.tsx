// Hằng số này giữ file không rỗng khi khối bên dưới đang bị comment (lint cấm file rỗng).
export const FEATURE_INFO = 'TN-11 · Đối soát thanh toán (xem CHUC-NANG-MUA-HANG-THEM.md)';

// [TN-11] BẮT ĐẦU · Trang quản trị "Đối soát thanh toán": xem đơn chưa/đã thu tiền và xác nhận đã thu
// import React, { useMemo, useState } from 'react';
// import { BadgeCheck, Wallet } from 'lucide-react';
// import { toast } from 'sonner';
// import { useAdminPayments } from '@/api/queries/useAdminQueries';
// import { useConfirmPayment } from '@/api/mutations/useAdminMutations';
// import { PageContainer, PageHeader, Panel } from '@/components/layout/Page';
// import { QueryErrorState } from '@/components/domain/QueryErrorState';
// import { Button } from '@/components/ui/Button';
// import { EmptyState } from '@/components/ui/EmptyState';
// import { Price } from '@/components/ui/Price';
// import { Skeleton } from '@/components/ui/Skeleton';
// import { StatusPill } from '@/components/ui/StatusPill';
// import { normalizeSearchString } from '@/components/navigation/QuickSearch';
// import { errorMessage, formatDateVi, QueueFilter, QueueSearch } from './components/AdminKit';
// import type { OrderDto, PaymentStatus } from '@/types/api';

// type PaymentFilter = PaymentStatus | 'ALL';

// const PAYMENT_TABS: { id: PaymentFilter; label: string }[] = [
  // { id: 'UNPAID', label: 'Chưa thu tiền' },
  // { id: 'PAID', label: 'Đã thu tiền' },
  // { id: 'ALL', label: 'Tất cả' },
// ];

// export default function AdminPaymentsPage(): React.JSX.Element {
  // // Tải mọi đơn một lần rồi lọc ở giao diện để đếm được số đơn của từng tab
  // const { data: orders = [], isLoading, isError, error, refetch, isRefetching } = useAdminPayments();
  // const confirmPayment = useConfirmPayment();

  // const [filter, setFilter] = useState<PaymentFilter>('UNPAID');
  // const [search, setSearch] = useState('');

  // const counts: Record<PaymentFilter, number> = {
    // UNPAID: orders.filter((o) => o.paymentStatus !== 'PAID').length,
    // PAID: orders.filter((o) => o.paymentStatus === 'PAID').length,
    // ALL: orders.length,
  // };

  // const visibleOrders = useMemo(() => {
    // let list = orders;
    // if (filter === 'PAID') {
      // list = list.filter((o) => o.paymentStatus === 'PAID');
    // } else if (filter === 'UNPAID') {
      // list = list.filter((o) => o.paymentStatus !== 'PAID');
    // }
    // const keyword = normalizeSearchString(search);
    // if (keyword) {
      // list = list.filter((o) => normalizeSearchString(o.orderCode).includes(keyword));
    // }
    // return list;
  // }, [orders, filter, search]);

  // const handleConfirm = async (order: OrderDto) => {
    // try {
      // await confirmPayment.mutateAsync(order.id);
      // toast.success(`Đã xác nhận thu tiền đơn ${order.orderCode}`);
    // } catch (err) {
      // toast.error(errorMessage(err, 'Không xác nhận được thanh toán'));
    // }
  // };

  // let content: React.ReactNode;
  // if (isLoading) {
    // content = (
      // <div className="space-y-3" role="status" aria-label="Đang tải danh sách thanh toán">
        // {Array.from({ length: 4 }).map((_, i) => (
          // <Skeleton key={i} className="h-20 w-full rounded-[20px]" />
        // ))}
      // </div>
    // );
  // } else if (isError) {
    // content = <QueryErrorState title="Không tải được danh sách thanh toán" error={error} onRetry={() => refetch()} isRetrying={isRefetching} />;
  // } else if (visibleOrders.length === 0) {
    // content = (
      // <EmptyState
        // icon={<Wallet aria-hidden="true" />}
        // title="Không có đơn nào ở mục này"
        // description="Thử chọn mục khác hoặc xóa từ khóa tìm kiếm."
      // />
    // );
  // } else {
    // content = (
      // <Panel padded={false} className="overflow-hidden">
        // <ul className="divide-y divide-line">
          // {visibleOrders.map((order) => {
            // const isPaid = order.paymentStatus === 'PAID';
            // const canConfirm = !isPaid && order.status !== 'CANCELLED';
            // let methodLabel = 'Trả tiền khi nhận hàng (COD)';
            // if (order.paymentMethod === 'BANK_TRANSFER') {
              // methodLabel = 'Chuyển khoản VietQR';
            // }
            // return (
              // <li key={order.id} className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:px-6">
                // <div className="min-w-0 flex-1">
                  // <div className="flex flex-wrap items-center gap-2">
                    // <span className="font-mono font-semibold text-fg">{order.orderCode}</span>
                    // <StatusPill status={order.status} size="sm" />
                    // <StatusPill status={isPaid ? 'COMPLETED' : 'PENDING'} label={isPaid ? 'Đã thu tiền' : 'Chưa thu tiền'} size="sm" />
                  // </div>
                  // <p className="mt-1 text-sm text-fg-2">
                    // {methodLabel}
                    // <span className="text-fg-3"> · {formatDateVi(order.createdAt) ?? '--'}</span>
                  // </p>
                // </div>
                // <div className="flex shrink-0 flex-wrap items-center gap-3">
                  // <Price amount={order.totalAmount} size="md" className="text-fg" />
                  // {canConfirm && (
                    // <Button
                      // size="sm"
                      // pill
                      // onClick={() => handleConfirm(order)}
                      // disabled={confirmPayment.isPending}
                      // leftIcon={<BadgeCheck className="size-4" aria-hidden="true" />}
                      // aria-label={`Xác nhận đã thu tiền đơn ${order.orderCode}`}
                    // >
                      // Xác nhận đã thu tiền
                    // </Button>
                  // )}
                // </div>
              // </li>
            // );
          // })}
        // </ul>
      // </Panel>
    // );
  // }

  // return (
    // <PageContainer>
      // <PageHeader
        // eyebrow="Quản trị"
        // title="Đối soát thanh toán"
        // description="Xác nhận đã thu tiền khi người giao hàng nộp tiền COD hoặc khi tiền chuyển khoản VietQR đã về tài khoản. Đơn đã hủy không xác nhận được."
      // />
      // <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        // <QueueFilter tabs={PAYMENT_TABS} value={filter} counts={counts} onChange={setFilter} />
        // <QueueSearch value={search} onChange={setSearch} label="Tìm theo mã đơn" placeholder="Mã đơn" />
      // </div>
      // {content}
    // </PageContainer>
  // );
// }
// [TN-11] KẾT THÚC
