// Hằng số này giữ file không rỗng khi khối bên dưới đang bị comment (lint cấm file rỗng).
export const FEATURE_INFO = 'TN-02 · Người mua xác nhận đã nhận hàng (xem CHUC-NANG-MUA-HANG-THEM.md)';

// [TN-02] BẮT ĐẦU · Nút "Đã nhận hàng" kèm hộp thoại xác nhận (trang chi tiết đơn hàng)
// import React, { useState } from 'react';
// import { PackageCheck } from 'lucide-react';
// import { toast } from 'sonner';
// import { Button } from '@/components/ui/Button';
// import {
  // Dialog,
  // DialogContent,
  // DialogHeader,
  // DialogTitle,
  // DialogDescription,
  // DialogFooter,
// } from '@/components/ui/Dialog';
// import { useConfirmReceived } from '@/api/mutations/useOrderMutations';
// import { ApiError } from '@/api/errors';
// import type { OrderDto } from '@/types/api';

// /** Người mua bấm khi đã nhận cá thể: đơn chuyển từ Chờ xử lý sang Hoàn tất. */
// export function ConfirmReceivedButton({ order }: { order: OrderDto }): React.JSX.Element | null {
  // const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  // const confirmMutation = useConfirmReceived();

  // if (order.status !== 'PENDING') {
    // return null;
  // }

  // const handleConfirm = async () => {
    // try {
      // await confirmMutation.mutateAsync(order.id);
      // toast.success('Cảm ơn bạn, đơn hàng đã hoàn tất');
      // setIsConfirmOpen(false);
    // } catch (err) {
      // const message = err instanceof ApiError ? err.message : 'Không cập nhật được đơn. Vui lòng thử lại.';
      // toast.error(message);
      // setIsConfirmOpen(false);
    // }
  // };

  // return (
    // <>
      // <Button
        // pill
        // onClick={() => setIsConfirmOpen(true)}
        // leftIcon={<PackageCheck className="size-4" aria-hidden="true" />}
      // >
        // Đã nhận hàng
      // </Button>

      // <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        // <DialogContent className="max-w-md">
          // <DialogHeader>
            // <DialogTitle>Xác nhận đã nhận đơn {order.orderCode}?</DialogTitle>
            // <DialogDescription className="pt-2 leading-relaxed text-fg-2">
              // Chỉ bấm khi bạn đã nhận và kiểm tra cá thể còn khỏe mạnh. Sau khi xác nhận, đơn chuyển sang Hoàn tất và
              // không hủy được nữa.
            // </DialogDescription>
          // </DialogHeader>
          // <DialogFooter className="mt-4 gap-2">
            // <Button variant="secondary" pill onClick={() => setIsConfirmOpen(false)}>
              // Chưa nhận
            // </Button>
            // <Button pill onClick={handleConfirm} isLoading={confirmMutation.isPending}>
              // Đã nhận hàng
            // </Button>
          // </DialogFooter>
        // </DialogContent>
      // </Dialog>
    // </>
  // );
// }
// [TN-02] KẾT THÚC
