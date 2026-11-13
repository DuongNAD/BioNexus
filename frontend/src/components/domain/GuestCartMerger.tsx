// Hằng số này giữ file không rỗng khi khối bên dưới đang bị comment (lint cấm file rỗng).
export const FEATURE_INFO = 'TN-17 · Giỏ hàng tạm cho khách (xem CHUC-NANG-MUA-HANG-THEM.md)';

// [TN-17] BẮT ĐẦU · Khi khách vừa đăng nhập: gộp giỏ tạm (localStorage) vào giỏ thật trên server
// import { useEffect } from 'react';
// import { toast } from 'sonner';
// import { useAuthState } from '@/api/queries/useAuthQueries';
// import { useMergeGuestCart } from '@/api/mutations/useCartMutations';
// import { clearGuestCart, readGuestCart } from '@/lib/guestCart';

// /** Không vẽ gì; gắn một lần ở khung chung của app (AppShell trong router.tsx). */
// export function GuestCartMerger(): null {
  // const auth = useAuthState();
  // const mergeMutation = useMergeGuestCart();
  // const { mutate } = mergeMutation;
  // const isBuyer = Boolean(auth.token) && auth.accountType === 'USER';

  // useEffect(() => {
    // if (!isBuyer) {
      // return;
    // }
    // const lines = readGuestCart();
    // if (lines.length === 0) {
      // return;
    // }
    // // Xóa giỏ tạm trước khi gọi API: nếu effect chạy hai lần thì lần sau không gộp trùng
    // clearGuestCart();
    // mutate(lines, {
      // onSuccess: (result) => {
        // if (result.failedCount === 0) {
          // toast.success(`Đã chuyển ${result.addedCount} món từ giỏ tạm vào giỏ hàng của bạn`);
        // } else {
          // toast.warning(
            // `Đã chuyển ${result.addedCount} món vào giỏ hàng. ${result.failedCount} món không thêm được (hết hàng, ngừng bán hoặc là hàng của shop bạn).`
          // );
        // }
      // },
    // });
  // }, [isBuyer, mutate]);

  // return null;
// }
// [TN-17] KẾT THÚC
