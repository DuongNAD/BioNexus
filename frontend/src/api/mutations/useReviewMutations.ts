// Hằng số này giữ file không rỗng khi khối bên dưới đang bị comment (lint cấm file rỗng).
export const FEATURE_INFO = 'TN-16 · Đánh giá sản phẩm sau khi mua (xem CHUC-NANG-MUA-HANG-THEM.md)';

// [TN-16] BẮT ĐẦU · Gửi đánh giá sản phẩm (POST api/reviews); xem đánh giá dùng useProductReviews có sẵn
// import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { api } from '../client';
// import { queryKeys } from '../keys';
// import type { CreateReviewRequest, ReviewDto } from '@/types/api';

// export function useCreateReview() {
  // const queryClient = useQueryClient();

  // return useMutation({
    // mutationFn: async (payload: CreateReviewRequest) => {
      // const res = await api<ReviewDto>('reviews', {
        // method: 'POST',
        // body: JSON.stringify(payload),
      // });
      // return res.data!;
    // },
    // onSettled: (_data, _error, variables) => {
      // queryClient.invalidateQueries({ queryKey: queryKeys.products.reviews(variables.productId) });
    // },
  // });
// }
// [TN-16] KẾT THÚC
