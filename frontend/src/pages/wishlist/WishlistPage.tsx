// Hằng số này giữ file không rỗng khi khối bên dưới đang bị comment (lint cấm file rỗng).
export const FEATURE_INFO = 'TN-15 · Danh sách yêu thích (xem CHUC-NANG-MUA-HANG-THEM.md)';

// [TN-15] BẮT ĐẦU · Trang "Danh sách yêu thích": xem lại các cá thể đã lưu, thêm vào giỏ hoặc bỏ lưu
// import React from 'react';
// import { Link } from 'react-router';
// import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
// import { toast } from 'sonner';
// import { Button } from '@/components/ui/Button';
// import { EmptyState } from '@/components/ui/EmptyState';
// import { Skeleton } from '@/components/ui/Skeleton';
// import { StatusPill } from '@/components/ui/StatusPill';
// import { PageContainer, PageHeader, Panel } from '@/components/layout/Page';
// import { QueryErrorState } from '@/components/domain/QueryErrorState';
// import { useWishlist } from '@/api/queries/useWishlistQueries';
// import { useRemoveFromWishlist } from '@/api/mutations/useWishlistMutations';
// import { useAddToCart } from '@/api/mutations/useCartMutations';
// import type { ProductViewModel } from '@/api/adapters';

// export default function WishlistPage(): React.JSX.Element {
  // const { data: items = [], isLoading, isError, error, refetch, isRefetching } = useWishlist();
  // const removeMutation = useRemoveFromWishlist();
  // const addToCartMutation = useAddToCart();

  // const handleAddToCart = (product: ProductViewModel) => {
    // addToCartMutation.mutate(
      // { productId: product.id, quantity: 1 },
      // {
        // onSuccess: () => toast.success(`Đã thêm "${product.productName}" vào giỏ`),
        // onError: (err) => toast.error(err.message || 'Không thêm được vào giỏ hàng'),
      // }
    // );
  // };

  // const handleRemove = (product: ProductViewModel) => {
    // removeMutation.mutate(product.id, {
      // onSuccess: () => toast.success('Đã bỏ khỏi danh sách yêu thích'),
      // onError: (err) => toast.error(err.message || 'Không bỏ lưu được'),
    // });
  // };

  // let content: React.ReactNode;
  // if (isLoading) {
    // content = (
      // <div className="space-y-3" role="status" aria-label="Đang tải danh sách yêu thích">
        // {Array.from({ length: 3 }).map((_, i) => (
          // <Skeleton key={i} className="h-24 w-full rounded-[20px]" />
        // ))}
      // </div>
    // );
  // } else if (isError) {
    // content = <QueryErrorState title="Không tải được danh sách yêu thích" error={error} onRetry={() => refetch()} isRetrying={isRefetching} />;
  // } else if (items.length === 0) {
    // content = (
      // <EmptyState
        // icon={<Heart aria-hidden="true" />}
        // title="Chưa lưu cá thể nào"
        // description="Bấm Lưu để mua sau ở trang sản phẩm hoặc trong giỏ hàng để giữ lại những cá thể bạn quan tâm."
        // action={{ label: 'Vào sàn sinh vật cảnh', href: '#/products' }}
      // />
    // );
  // } else {
    // content = (
      // <Panel padded={false} className="overflow-hidden">
        // <ul className="divide-y divide-line">
          // {items.map((product) => (
            // <li key={product.id} className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center md:px-6">
              // <div className="flex min-w-0 flex-1 items-center gap-4">
                // <img
                  // src={product.displayImage}
                  // alt={product.productName}
                  // loading="lazy"
                  // className="size-16 shrink-0 rounded-xl object-cover"
                // />
                // <div className="min-w-0">
                  // <Link to={`/products/${product.id}`} className="line-clamp-2 font-semibold text-fg hover:text-accent">
                    // {product.productName}
                  // </Link>
                  // <p className="mt-0.5 text-sm text-fg-3">{product.displayShopName}</p>
                  // <div className="mt-1 flex flex-wrap items-center gap-2">
                    // <span className="font-mono text-sm text-fg">{product.formattedPrice}</span>
                    // {!product.isAvailable && <StatusPill status="SOLD_OUT" label="Ngừng bán hoặc hết hàng" size="sm" />}
                  // </div>
                // </div>
              // </div>
              // <div className="flex shrink-0 items-center gap-2">
                // <Button
                  // size="sm"
                  // pill
                  // onClick={() => handleAddToCart(product)}
                  // disabled={!product.isAvailable || addToCartMutation.isPending}
                  // leftIcon={<ShoppingBag className="size-4" aria-hidden="true" />}
                // >
                  // Thêm vào giỏ
                // </Button>
                // <Button
                  // size="sm"
                  // pill
                  // variant="ghost"
                  // onClick={() => handleRemove(product)}
                  // disabled={removeMutation.isPending}
                  // leftIcon={<Trash2 className="size-4" aria-hidden="true" />}
                  // aria-label={`Bỏ lưu ${product.productName}`}
                // >
                  // Bỏ lưu
                // </Button>
              // </div>
            // </li>
          // ))}
        // </ul>
      // </Panel>
    // );
  // }

  // return (
    // <PageContainer>
      // <PageHeader
        // eyebrow="Tài khoản"
        // title="Danh sách yêu thích"
        // description="Các cá thể bạn đã lưu để mua sau. Giá và tồn kho luôn là số hiện tại của cửa hàng."
      // />
      // {content}
    // </PageContainer>
  // );
// }
// [TN-15] KẾT THÚC
