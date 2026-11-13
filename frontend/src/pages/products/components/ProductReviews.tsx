// Hằng số này giữ file không rỗng khi khối bên dưới đang bị comment (lint cấm file rỗng).
export const FEATURE_INFO = 'TN-16 · Đánh giá sản phẩm sau khi mua (xem CHUC-NANG-MUA-HANG-THEM.md)';

// [TN-16] BẮT ĐẦU · Khối "Đánh giá từ người mua" trên trang chi tiết sản phẩm
// import React, { useState } from 'react';
// import { Link } from 'react-router';
// import { Star } from 'lucide-react';
// import { toast } from 'sonner';
// import { Section } from '@/components/layout/Page';
// import { Button } from '@/components/ui/Button';
// import { Textarea } from '@/components/ui/Textarea';
// import { Skeleton } from '@/components/ui/Skeleton';
// import { useAuthState } from '@/api/queries/useAuthQueries';
// import { useProductReviews } from '@/api/queries/useProductQueries';
// import { useCreateReview } from '@/api/mutations/useReviewMutations';
// import { formatOrderDate } from '@/pages/orders/OrdersPage';
// import { cn } from '@/lib/cn';

// const STAR_VALUES = [1, 2, 3, 4, 5];

// /** Hàng 5 ngôi sao chỉ để xem; chữ thay thế đọc được "4 trên 5 sao". */
// function Stars({ value, size = 'size-4' }: { value: number; size?: string }): React.JSX.Element {
  // return (
    // <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${value} trên 5 sao`}>
      // {STAR_VALUES.map((star) => (
        // <Star
          // key={star}
          // className={cn(size, star <= Math.round(value) ? 'fill-warm text-warm' : 'text-fg-3')}
          // aria-hidden="true"
        // />
      // ))}
    // </span>
  // );
// }

// export function ProductReviews({ productId }: { productId: number }): React.JSX.Element {
  // const auth = useAuthState();
  // const { data: reviews = [], isLoading } = useProductReviews(productId);
  // const createReview = useCreateReview();

  // const [rating, setRating] = useState(5);
  // const [comment, setComment] = useState('');
  // const [errorText, setErrorText] = useState<string | null>(null);

  // let total = 0;
  // for (const review of reviews) {
    // total = total + review.rating;
  // }
  // let average = 0;
  // if (reviews.length > 0) {
    // average = total / reviews.length;
  // }

  // const isBuyerAccount = Boolean(auth.token) && auth.accountType === 'USER';
  // const myReview = reviews.find((r) => r.userId === auth.user?.id);

  // const handleSubmit = async (e: React.FormEvent) => {
    // e.preventDefault();
    // if (!comment.trim()) {
      // setErrorText('Vui lòng nhập nhận xét');
      // return;
    // }
    // setErrorText(null);
    // try {
      // await createReview.mutateAsync({ productId, rating, comment: comment.trim() });
      // setComment('');
      // toast.success('Cảm ơn bạn đã đánh giá sản phẩm');
    // } catch (err) {
      // setErrorText(err instanceof Error && err.message ? err.message : 'Không gửi được đánh giá');
    // }
  // };

  // // Phần dưới danh sách: form gửi, hoặc lời nhắc đăng nhập, hoặc báo đã đánh giá
  // let formArea: React.ReactNode = null;
  // if (!isBuyerAccount) {
    // formArea = (
      // <p className="text-sm text-fg-3">
        // <Link to={`/login?next=${encodeURIComponent(`/products/${productId}`)}`} className="text-accent underline underline-offset-2">
          // Đăng nhập
        // </Link>{' '}
        // để đánh giá cá thể bạn đã mua.
      // </p>
    // );
  // } else if (myReview) {
    // formArea = <p className="text-sm text-fg-3">Bạn đã đánh giá sản phẩm này. Cảm ơn bạn!</p>;
  // } else {
    // formArea = (
      // <form onSubmit={handleSubmit} className="max-w-xl space-y-4" noValidate>
        // <fieldset>
          // <legend className="text-sm font-medium text-fg-2">Số sao</legend>
          // <div className="mt-2 flex gap-1">
            // {STAR_VALUES.map((star) => (
              // <label
                // key={star}
                // className="cursor-pointer rounded-md p-1 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent"
              // >
                // <input
                  // type="radio"
                  // name="review-rating"
                  // value={star}
                  // checked={rating === star}
                  // onChange={() => setRating(star)}
                  // className="sr-only"
                // />
                // <span className="sr-only">{star} sao</span>
                // <Star
                  // className={cn('size-6', star <= rating ? 'fill-warm text-warm' : 'text-fg-3')}
                  // aria-hidden="true"
                // />
              // </label>
            // ))}
          // </div>
        // </fieldset>
        // <Textarea
          // label="Nhận xét"
          // value={comment}
          // onChange={(e) => setComment(e.target.value)}
          // maxLength={1000}
          // rows={3}
          // placeholder="Cá thể khi nhận có khỏe không, đóng gói thế nào, shop hỗ trợ ra sao..."
          // error={errorText ?? undefined}
        // />
        // <div className="flex flex-wrap items-center gap-3">
          // <Button type="submit" pill isLoading={createReview.isPending}>
            // Gửi đánh giá
          // </Button>
          // <span className="text-sm text-fg-3">Chỉ người đã mua và đã nhận hàng mới gửi được.</span>
        // </div>
      // </form>
    // );
  // }

  // return (
    // <Section title="Đánh giá từ người mua" className="border-t border-line">
      // {isLoading ? (
        // <Skeleton className="h-24 w-full rounded-[20px]" />
      // ) : (
        // <div className="space-y-8">
          // <div className="flex items-center gap-4">
            // <span className="font-mono text-4xl font-semibold text-fg">{average.toFixed(1)}</span>
            // <div>
              // <Stars value={average} size="size-5" />
              // <p className="mt-1 text-sm text-fg-3">{reviews.length} đánh giá</p>
            // </div>
          // </div>

          // {reviews.length === 0 ? (
            // <p className="text-sm text-fg-3">Chưa có đánh giá nào cho cá thể này.</p>
          // ) : (
            // <ul className="divide-y divide-line border-y border-line">
              // {reviews.map((review) => (
                // <li key={review.id} className="py-4">
                  // <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    // <span className="font-semibold text-fg">{review.userFullName}</span>
                    // <Stars value={review.rating} />
                    // <span className="text-sm text-fg-3">{formatOrderDate(review.createdAt)}</span>
                  // </div>
                  // <p className="mt-2 whitespace-pre-line text-fg-2">{review.comment}</p>
                // </li>
              // ))}
            // </ul>
          // )}

          // {formArea}
        // </div>
      // )}
    // </Section>
  // );
// }
// [TN-16] KẾT THÚC
