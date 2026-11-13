// Hằng số này giữ file không rỗng khi khối bên dưới đang bị comment (lint cấm file rỗng).
export const FEATURE_INFO = 'TN-01 · Người mua hủy đơn (xem CHUC-NANG-MUA-HANG-THEM.md)';

// [TN-01] BẮT ĐẦU · Nút hủy đơn kèm hộp thoại xác nhận (trang chi tiết đơn hàng)
// import React, { useState } from 'react';
// import { XCircle } from 'lucide-react';
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
// import { useCancelOrder } from '@/api/mutations/useOrderMutations';
// import { ApiError } from '@/api/errors';
// import type { OrderDto } from '@/types/api';

// /** Chỉ hiện khi đơn đang chờ xử lý. Hủy xong thì kho được hoàn lại cho cửa hàng. */
// export function CancelOrderButton({ order }: { order: OrderDto }): React.JSX.Element | null {
  // const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  // const cancelMutation = useCancelOrder();

  // if (order.status !== 'PENDING') {
    // return null;
  // }

  // const handleConfirm = async () => {
    // try {
      // await cancelMutation.mutateAsync(order.id);
      // toast.success(`Đã hủy đơn ${order.orderCode}`);
      // setIsConfirmOpen(false);
    // } catch (err) {
      // const message = err instanceof ApiError ? err.message : 'Không hủy được đơn. Vui lòng thử lại.';
      // toast.error(message);
      // setIsConfirmOpen(false);
    // }
  // };

  // return (
    // <>
      // <Button
        // pill
        // variant="outline"
        // onClick={() => setIsConfirmOpen(true)}
        // leftIcon={<XCircle className="size-4" aria-hidden="true" />}
        // className="hover:border-danger/50 hover:text-danger"
      // >
        // Hủy đơn
      // </Button>

      // <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        // <DialogContent className="max-w-md">
          // <DialogHeader>
            // <DialogTitle>Hủy đơn {order.orderCode}?</DialogTitle>
            // <DialogDescription className="pt-2 leading-relaxed text-fg-2">
              // Đơn sẽ chuyển sang trạng thái Đã hủy và các cá thể được trả lại kho của cửa hàng. Không hoàn tác được.
            // </DialogDescription>
          // </DialogHeader>
          // <DialogFooter className="mt-4 gap-2">
            // <Button variant="secondary" pill onClick={() => setIsConfirmOpen(false)}>
              // Giữ đơn
            // </Button>
            // <Button variant="danger" pill onClick={handleConfirm} isLoading={cancelMutation.isPending}>
              // Xác nhận hủy
            // </Button>
          // </DialogFooter>
        // </DialogContent>
      // </Dialog>
    // </>
  // );
// }
// [TN-01] KẾT THÚC
