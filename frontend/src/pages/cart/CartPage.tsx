import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import { useQueries } from '@tanstack/react-query';
import { ShoppingBag, Store, Trash2, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Price } from '@/components/ui/Price';
import { Ticker } from '@/components/ui/Ticker';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { NumberStepper } from '@/components/ui/NumberStepper';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { PageContainer, PageHeader, Panel } from '@/components/layout/Page';
import { useCart } from '@/api/queries/useCartQueries';
import {
  useUpdateCartItem,
  useRemoveCartItem,
  useClearCart,
  useAddToCart,
} from '@/api/mutations/useCartMutations';
import { productDetailQueryOptions } from '@/api/queries/useProductQueries';
import { resolveProductImage } from '@/api/adapters';
import { QueryErrorState } from '@/components/domain/QueryErrorState';
import { ButtonLink } from '@/components/domain/ButtonLink';
import { formatVnd } from '@/lib/parseEnvironmentSpecs';
import { cn } from '@/lib/cn';
import { toast } from 'sonner';
import type { CartItemDto } from '@/types/api';

interface CartGroup {
  shopKey: string;
  shopName: string;
  items: CartItemDto[];
}

export default function CartPage(): React.JSX.Element {
  const navigate = useNavigate();
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);

  // Route đã bọc RequireAuth nên ở đây luôn là tài khoản USER
  const { data: cart, isLoading, isError, error, refetch, isRefetching } = useCart();

  const updateItemMutation = useUpdateCartItem();
  const removeItemMutation = useRemoveCartItem();
  const clearCartMutation = useClearCart();
  const addToCartMutation = useAddToCart();

  const cartItems = useMemo(() => cart?.items || [], [cart]);

  // CartItemDto không có shop: tra chi tiết từng sản phẩm (kể cả món đã ngừng bán) để nhóm theo shop
  const productQueries = useQueries({
    queries: cartItems.map((item) => productDetailQueryOptions(item.productId)),
  });
  const detailByProductId = new Map(
    cartItems.map((item, index) => [item.productId, productQueries[index]?.data ?? null] as const)
  );
  const detailsKey = productQueries.map((q) => q.dataUpdatedAt).join(',');

  // Phân nhóm các món theo Shop
  const cartGroups: CartGroup[] = useMemo(() => {
    const groupsMap = new Map<string, { shopName: string; items: CartItemDto[] }>();

    cartItems.forEach((item) => {
      const detail = detailByProductId.get(item.productId);
      const key = detail ? String(detail.sellerProfileId) : 'unknown';
      const shopName = detail?.displayShopName || 'Cửa hàng';

      if (!groupsMap.has(key)) {
        groupsMap.set(key, { shopName, items: [] });
      }
      groupsMap.get(key)!.items.push(item);
    });

    return Array.from(groupsMap.entries()).map(([shopKey, val]) => ({
      shopKey,
      shopName: val.shopName,
      items: val.items,
    }));
    // detailByProductId tạo mới mỗi render; detailsKey đổi khi dữ liệu chi tiết thực sự đổi
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems, detailsKey]);

  // Kiểm tra tính hợp lệ của giỏ hàng
  const hasUnavailableItems = cartItems.some((i) => !i.available);
  const hasOverStockItems = cartItems.some((i) => i.quantity > i.maxQuantity);
  const isCartValidForCheckout = cartItems.length > 0 && !hasUnavailableItems && !hasOverStockItems;

  // Tính lại tổng tiền thực tế chỉ từ các món hợp lệ
  const validSubtotal = useMemo(() => {
    return cartItems
      .filter((i) => i.available)
      .reduce((sum, item) => sum + item.quantity * item.price, 0);
  }, [cartItems]);

  // Xóa 1 món và hỗ trợ Hoàn tác (Undo Toast)
  const handleRemoveItem = (item: CartItemDto) => {
    removeItemMutation.mutate(item.productId, {
      onSuccess: () => {
        toast.info(`Đã xóa "${item.productName}" khỏi giỏ hàng`, {
          duration: 6000,
          action: {
            label: 'Hoàn tác',
            onClick: () => {
              addToCartMutation.mutate(
                {
                  productId: item.productId,
                  // Món đã vượt kho thì chỉ hoàn tác tới mức tồn kho hiện có
                  quantity: Math.max(1, Math.min(item.quantity, item.maxQuantity)),
                },
                {
                  onError: (err) => {
                    toast.error(err.message || 'Không thể hoàn tác: sản phẩm có thể đã hết hàng.');
                  },
                }
              );
            },
          },
        });
      },
    });
  };

  // Cập nhật số lượng
  const handleQuantityChange = (productId: number, newQty: number) => {
    updateItemMutation.mutate({ productId, quantity: newQty });
  };

  // Giảm về tồn kho tối đa
  const handleClampToMax = (item: CartItemDto) => {
    updateItemMutation.mutate({
      productId: item.productId,
      quantity: item.maxQuantity,
    });
  };

  // Xóa sạch giỏ hàng
  const handleConfirmClear = () => {
    clearCartMutation.mutate(undefined, {
      onSuccess: () => {
        setIsClearDialogOpen(false);
        toast.success('Đã xóa sạch toàn bộ giỏ hàng');
      },
    });
  };

  return (
    <PageContainer className="pb-20">
      <PageHeader
        eyebrow="Giỏ hàng"
        title="Giỏ hàng của bạn"
        description="Kiểm tra số lượng từng cá thể trước khi đặt hàng. Giá và tồn kho được kiểm tra lại khi bạn xác nhận."
        meta={
          cartItems.length > 0 && (
            <span>
              <span className="font-mono text-fg">{cartItems.length}</span> sản phẩm từ{' '}
              <span className="font-mono text-fg">{cartGroups.length}</span> cửa hàng
            </span>
          )
        }
        actions={
          cartItems.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              pill
              onClick={() => setIsClearDialogOpen(true)}
              className="gap-1.5 text-danger hover:bg-danger/10 hover:text-danger"
            >
              <Trash2 className="size-4" aria-hidden="true" />
              <span>Xóa toàn bộ</span>
            </Button>
          )
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px]" role="status" aria-label="Đang tải giỏ hàng">
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-[20px]" />
            ))}
          </div>
          <Skeleton className="h-72 w-full rounded-[20px]" />
        </div>
      ) : isError ? (
        <QueryErrorState title="Không tải được giỏ hàng" error={error} onRetry={() => refetch()} isRetrying={isRefetching} />
      ) : cartItems.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag aria-hidden="true" />}
          title="Giỏ hàng đang trống"
          description="Bạn chưa thêm cá thể nào. Hãy xem các cá thể nhân giống đang bán trên sàn."
          action={{ label: 'Vào sàn sinh vật cảnh', href: '#/products' }}
        />
      ) : (
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
          <div className="space-y-6">
            {cartGroups.map((group) => (
              <Panel key={group.shopKey} padded={false} className="overflow-hidden">
                <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
                  <h2 className="flex min-w-0 items-center gap-2 font-semibold text-fg">
                    <Store className="size-4 shrink-0 text-accent" aria-hidden="true" />
                    <span className="truncate">{group.shopName}</span>
                  </h2>
                  <span className="shrink-0 text-sm text-fg-3">{group.items.length} sản phẩm</span>
                </div>

                <ul className="divide-y divide-line">
                  {group.items.map((item) => {
                    // Món đã ngừng bán chỉ cần báo ngừng bán, không gợi ý "giảm về 0"
                    const isOverStock = item.available && item.quantity > item.maxQuantity;
                    const isUnavailable = !item.available;
                    const isUpdatingThisLine =
                      updateItemMutation.isPending && updateItemMutation.variables?.productId === item.productId;

                    return (
                      <li
                        key={item.productId}
                        className={cn('relative flex gap-4 px-5 py-4', isOverStock && 'bg-warm/[0.06]')}
                      >
                        <img
                          src={resolveProductImage(
                            item.imageUrl,
                            detailByProductId.get(item.productId)?.speciesScientificName
                          )}
                          alt={item.productName}
                          loading="lazy"
                          className={cn(
                            'size-20 shrink-0 rounded-xl object-cover sm:size-24',
                            isUnavailable && 'opacity-50 grayscale'
                          )}
                        />

                        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <Link
                              to={`/products/${item.productId}`}
                              className={cn(
                                'line-clamp-2 pr-8 font-semibold transition-colors hover:text-accent sm:pr-0',
                                isUnavailable ? 'text-fg-3' : 'text-fg'
                              )}
                            >
                              {item.productName}
                            </Link>
                            <p className="mt-1 text-sm text-fg-3">
                              <span className="font-mono">{formatVnd(item.price)}</span> / cá thể
                            </p>

                            {isUnavailable && (
                              <p className="mt-1 flex items-center gap-1.5 text-sm text-danger">
                                <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
                                Ngừng bán hoặc đã hết hàng
                              </p>
                            )}
                            {isOverStock && (
                              <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-warm">
                                <span>Kho chỉ còn {item.maxQuantity} cá thể.</span>
                                <button
                                  type="button"
                                  onClick={() => handleClampToMax(item)}
                                  disabled={isUpdatingThisLine}
                                  className="font-medium text-accent underline underline-offset-2 hover:text-fg disabled:opacity-50"
                                >
                                  Giảm về {item.maxQuantity}
                                </button>
                              </p>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 sm:shrink-0 sm:justify-end">
                            {!isUnavailable ? (
                              <NumberStepper
                                value={item.quantity}
                                min={1}
                                max={Math.max(1, item.maxQuantity)}
                                onChange={(val) => handleQuantityChange(item.productId, val)}
                                disabled={isUpdatingThisLine}
                                size="sm"
                                aria-label={`Số lượng ${item.productName}`}
                              />
                            ) : (
                              <span className="text-sm text-fg-3">
                                Số lượng <span className="font-mono">{item.quantity}</span>
                              </span>
                            )}
                            <Price
                              amount={isUnavailable ? 0 : item.quantity * item.price}
                              size="md"
                              className="justify-end text-fg sm:min-w-[96px]"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item)}
                              disabled={removeItemMutation.isPending && removeItemMutation.variables === item.productId}
                              // Màn hẹp: ghim góc trên phải dòng để hàng số lượng và thành tiền không bị xuống dòng
                              className="absolute top-3 right-3 rounded-full p-2 text-fg-3 transition-colors hover:bg-danger/10 hover:text-danger disabled:opacity-50 sm:static"
                              aria-label={`Xóa ${item.productName}`}
                            >
                              <Trash2 className="size-4" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </Panel>
            ))}
          </div>

          <aside className="lg:sticky lg:top-24">
            <Panel>
              <h2 className="text-lg font-semibold tracking-[-0.02em] text-fg">Tóm tắt đơn hàng</h2>
              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between text-fg-2">
                  <dt>Tạm tính</dt>
                  <dd className="font-mono text-fg">{formatVnd(validSubtotal)}</dd>
                </div>
                <div className="flex items-center justify-between text-fg-2">
                  <dt>Vận chuyển</dt>
                  <dd className="text-success">Miễn phí</dd>
                </div>
                <div className="flex items-baseline justify-between border-t border-line pt-4">
                  <dt className="font-semibold text-fg">Tổng thanh toán</dt>
                  <dd>
                    <Ticker value={validSubtotal} formatAsCurrency className="text-2xl font-semibold text-fg" />
                  </dd>
                </div>
              </dl>
              {hasUnavailableItems && (
                <p className="mt-1 text-right text-xs text-fg-3">Không tính các món đã ngừng bán</p>
              )}

              {!isCartValidForCheckout && (
                <p role="status" className="mt-5 flex items-start gap-2 text-sm text-warm">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span>Xóa các món ngừng bán và giảm các món vượt tồn kho để có thể đặt hàng.</span>
                </p>
              )}

              <Button
                size="lg"
                pill
                variant="primary"
                disabled={!isCartValidForCheckout}
                onClick={() => navigate('/checkout')}
                className="mt-6 w-full gap-2"
              >
                <span>Tiến hành đặt hàng</span>
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
              <ButtonLink to="/products" variant="ghost" pill className="mt-2 w-full">
                Tiếp tục mua sắm
              </ButtonLink>
            </Panel>
          </aside>
        </div>
      )}

      <Dialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Xóa toàn bộ giỏ hàng?</DialogTitle>
            <DialogDescription>Mọi cá thể đang có trong giỏ sẽ bị xóa. Bạn có thể thêm lại từ sàn sinh vật cảnh.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="secondary" pill onClick={() => setIsClearDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="danger" pill onClick={handleConfirmClear} disabled={clearCartMutation.isPending}>
              Xóa tất cả
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
