// Hằng số này giữ file không rỗng khi khối bên dưới đang bị comment (lint cấm file rỗng).
export const FEATURE_INFO = 'TN-15 · Danh sách yêu thích (xem CHUC-NANG-MUA-HANG-THEM.md)';

// [TN-15] BẮT ĐẦU · Nút "Lưu để mua sau" trên trang chi tiết sản phẩm
// import React from 'react';
// import { useNavigate } from 'react-router';
// import { Heart } from 'lucide-react';
// import { toast } from 'sonner';
// import { Button } from '@/components/ui/Button';
// import { useAuthState } from '@/api/queries/useAuthQueries';
// import { useWishlist } from '@/api/queries/useWishlistQueries';
// import { useAddToWishlist, useRemoveFromWishlist } from '@/api/mutations/useWishlistMutations';
// import { cn } from '@/lib/cn';

// /** Lưu được cả sản phẩm đang hết hàng: người mua quay lại khi shop nhập thêm. */
// export function WishlistButton({ productId }: { productId: number }): React.JSX.Element | null {
  // const auth = useAuthState();
  // const navigate = useNavigate();
  // const { data: wishlist = [] } = useWishlist();
  // const addMutation = useAddToWishlist();
  // const removeMutation = useRemoveFromWishlist();

  // // Tài khoản quản trị không mua hàng nên không có danh sách yêu thích
  // if (auth.accountType === 'ADMIN') {
    // return null;
  // }

  // const isSaved = wishlist.some((p) => p.id === productId);
  // const isBusy = addMutation.isPending || removeMutation.isPending;

  // const handleClick = async () => {
    // if (!auth.token) {
      // navigate(`/login?next=${encodeURIComponent(`/products/${productId}`)}`);
      // return;
    // }
    // try {
      // if (isSaved) {
        // await removeMutation.mutateAsync(productId);
        // toast.success('Đã bỏ khỏi danh sách yêu thích');
      // } else {
        // await addMutation.mutateAsync(productId);
        // toast.success('Đã lưu vào danh sách yêu thích', {
          // action: { label: 'Xem danh sách', onClick: () => navigate('/wishlist') },
        // });
      // }
    // } catch (err) {
      // toast.error(err instanceof Error && err.message ? err.message : 'Không cập nhật được danh sách yêu thích');
    // }
  // };

  // return (
    // <Button
      // variant="ghost"
      // pill
      // onClick={handleClick}
      // disabled={isBusy}
      // aria-pressed={isSaved}
      // leftIcon={<Heart className={cn('size-4', isSaved && 'fill-current text-danger')} aria-hidden="true" />}
    // >
      // {isSaved ? 'Đã lưu vào yêu thích' : 'Lưu để mua sau'}
    // </Button>
  // );
// }
// [TN-15] KẾT THÚC
