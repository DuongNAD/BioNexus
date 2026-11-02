import React, { useState, useMemo } from 'react';
import { Link } from 'react-router';
import {
  ShoppingBag,
  Store,
  Trash2,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Price } from '@/components/ui/Price';
import { Ticker } from '@/components/ui/Ticker';
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
import { useCart } from '@/api/queries/useCartQueries';
import {
  useUpdateCartItem,
  useRemoveCartItem,
  useClearCart,
  useAddToCart,
} from '@/api/mutations/useCartMutations';
import { useProducts } from '@/api/queries/useProductQueries';
import { getStoredToken } from '@/api/authStore';
import { toast } from 'sonner';
import type { CartItemDto } from '@/types/api';

interface CartGroup {
  shopKey: string;
  shopName: string;
  items: CartItemDto[];
}

export default function CartPage(): React.JSX.Element {
  const token = getStoredToken();
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);

  const { data: cart, isLoading } = useCart({ enabled: !!token });
  const { data: productsData } = useProducts();
  const allProducts = productsData?.items || [];

  const updateItemMutation = useUpdateCartItem();
  const removeItemMutation = useRemoveCartItem();
  const clearCartMutation = useClearCart();
  const addToCartMutation = useAddToCart();

  const cartItems = cart?.items || [];

  // Phân nhóm các món theo Shop
  const cartGroups: CartGroup[] = useMemo(() => {
    const groupsMap = new Map<string, { shopName: string; items: CartItemDto[] }>();

    cartItems.forEach((item) => {
      // Tìm shop name từ danh mục sản phẩm nếu có
      const matchedProd = allProducts.find((p) => p.id === item.productId);
      const shopName = matchedProd?.displayShopName || 'Cơ sở nhân giống BioNexus';
      const key = shopName;

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
  }, [cartItems, allProducts]);

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
              addToCartMutation.mutate({
                productId: item.productId,
                quantity: item.quantity,
              });
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

  // Chưa đăng nhập
  if (!token) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="size-16 rounded-2xl bg-surface-2 border border-line flex items-center justify-center text-accent mb-4">
          <ShoppingBag className="size-8" />
        </div>
        <h2 className="text-2xl font-bold text-fg">Đăng nhập để xem giỏ hàng</h2>
        <p className="mt-2 text-sm text-fg-2">
          Giỏ hàng được lưu trữ an toàn trên máy chủ BioNexus giúp bạn không bị mất các cá thể đã chọn.
        </p>
        <Link to="/login?next=/cart" className="mt-6">
          <Button variant="primary" pill>
            Đăng nhập ngay
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-fg py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header trang giỏ hàng */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-fg font-sans">
              Giỏ Hàng Của Bạn
            </h1>
            <p className="mt-1 text-xs md:text-sm text-fg-3">
              Quản lý cá thể sinh vật cảnh đã chọn trước khi tiến hành xác nhận đặt hàng
            </p>
          </div>

          {cartItems.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsClearDialogOpen(true)}
              className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-1.5 self-start sm:self-auto"
            >
              <Trash2 className="size-3.5" />
              <span>Xóa toàn bộ giỏ hàng</span>
            </Button>
          )}
        </div>

        {/* Trạng thái rỗng */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-28 rounded-2xl bg-surface animate-pulse" />
              ))}
            </div>
            <div className="lg:col-span-4 h-64 rounded-2xl bg-surface animate-pulse" />
          </div>
        ) : cartItems.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="size-8 text-accent" />}
            title="Giỏ hàng của bạn đang trống"
            description="Bạn chưa thêm cá thể sinh vật cảnh nào vào giỏ hàng. Hãy khám phá sàn giao dịch có kiểm định của BioNexus."
            action={{
              label: 'Khám phá sàn sinh vật cảnh',
              href: '#/products',
            }}
          />
        ) : (
          /* Bố cục 2 Cột Desktop: 8/12 Danh sách món / 4/12 Tóm tắt dính */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Cột trái (8/12): Phân nhóm theo Shop */}
            <div className="lg:col-span-8 space-y-6">
              {cartGroups.map((group) => (
                <div
                  key={group.shopKey}
                  className="rounded-2xl border border-line bg-surface-1/60 backdrop-blur-md overflow-hidden shadow-lg"
                >
                  {/* Shop Header */}
                  <div className="flex items-center justify-between border-b border-line/60 bg-surface-2/40 px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Store className="size-4 text-accent" />
                      <span className="font-semibold text-fg text-sm">{group.shopName}</span>
                      <span title="Trại nhân giống F2+ đã kiểm duyệt">
                        <ShieldCheck className="size-3.5 text-accent" />
                      </span>
                    </div>
                    <span className="text-xs text-fg-3 font-mono">{group.items.length} món</span>
                  </div>

                  {/* Danh sách các dòng món */}
                  <div className="divide-y divide-line/40 p-2 sm:p-4">
                    {group.items.map((item) => {
                      const isOverStock = item.quantity > item.maxQuantity;
                      const isUnavailable = !item.available;

                      return (
                        <div
                          key={item.productId}
                          className={`p-3 sm:p-4 rounded-xl transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                            isUnavailable
                              ? 'opacity-50 bg-black/40'
                              : isOverStock
                                ? 'border border-amber-500/40 bg-amber-500/5'
                                : 'hover:bg-surface-2/40'
                          }`}
                        >
                          {/* Ảnh & thông tin */}
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="relative size-16 sm:size-20 rounded-xl overflow-hidden bg-surface-2 shrink-0 border border-line">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.productName}
                                  className={`size-full object-cover ${isUnavailable ? 'grayscale' : ''}`}
                                />
                              ) : (
                                <div className="size-full flex items-center justify-center text-fg-3 text-xs">
                                  Ảnh
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <Link
                                to={`/products/${item.productId}`}
                                className="font-semibold text-fg text-sm hover:text-accent transition-colors truncate block"
                              >
                                {item.productName}
                              </Link>
                              <div className="mt-1 flex items-baseline gap-2">
                                <span className="text-xs font-mono font-semibold text-accent">
                                  <Price amount={item.price} size="sm" />
                                </span>
                                <span className="text-[11px] text-fg-3 font-mono">/ cá thể</span>
                              </div>

                              {/* Cảnh báo lỗi trên dòng món */}
                              {isUnavailable && (
                                <span className="mt-1 inline-flex items-center gap-1 rounded bg-red-500/20 px-1.5 py-0.5 text-[10px] font-medium text-red-300">
                                  <AlertTriangle className="size-3" /> Ngừng bán hoặc hết hàng
                                </span>
                              )}

                              {isOverStock && (
                                <div className="mt-1 flex items-center gap-2">
                                  <span className="text-[10px] text-amber-300 font-medium">
                                    Kho chỉ còn {item.maxQuantity} cá thể
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleClampToMax(item)}
                                    className="text-[10px] text-accent underline hover:text-white font-mono"
                                  >
                                    [Giảm về {item.maxQuantity}]
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Bộ tăng giảm số lượng & Thành tiền */}
                          <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 border-line/40 pt-2 sm:pt-0">
                            {!isUnavailable ? (
                              <NumberStepper
                                value={item.quantity}
                                min={1}
                                max={Math.max(1, item.maxQuantity)}
                                onChange={(val) => handleQuantityChange(item.productId, val)}
                                size="sm"
                              />
                            ) : (
                              <span className="text-xs text-fg-3 font-mono">Số lượng: {item.quantity}</span>
                            )}

                            <div className="text-right min-w-[90px]">
                              <span className="block text-xs font-mono font-bold text-fg">
                                <Price amount={isUnavailable ? 0 : item.quantity * item.price} size="sm" />
                              </span>
                            </div>

                            {/* Nút xóa */}
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item)}
                              className="text-fg-3 hover:text-red-400 p-1.5 rounded-lg hover:bg-surface-2 transition-colors"
                              title="Xóa khỏi giỏ hàng"
                              aria-label={`Xóa ${item.productName}`}
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Cột phải (4/12): Tóm tắt chi phí & Đặt hàng (DÍNH) */}
            <aside className="lg:col-span-4 sticky top-24 rounded-2xl border border-line bg-surface-1/80 backdrop-blur-xl p-6 shadow-xl space-y-5">
              <h3 className="font-bold text-fg text-base uppercase tracking-wider font-mono border-b border-line/60 pb-3">
                Tóm tắt đơn hàng
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between text-fg-2">
                  <span>Tạm tính cá thể:</span>
                  <Ticker value={validSubtotal} formatAsCurrency className="text-sm font-bold text-fg" />
                </div>

                <div className="flex items-center justify-between text-fg-2">
                  <div className="flex items-center gap-1">
                    <span>Vận chuyển bảo tồn:</span>
                    <span title="Thùng giữ nhiệt điều hòa sinh học">
                      <Info className="size-3 text-fg-3" />
                    </span>
                  </div>
                  <span className="text-emerald-400 font-mono font-semibold">Miễn phí (0 ₫)</span>
                </div>

                <div className="pt-3 border-t border-line/60 flex items-baseline justify-between">
                  <span className="text-sm font-bold text-fg">Tổng thanh toán:</span>
                  <div className="text-right">
                    <Ticker value={validSubtotal} formatAsCurrency className="text-2xl font-bold text-accent" />
                    <span className="block text-[10px] text-fg-3 font-mono">Đã bao gồm phí kiểm định F2+</span>
                  </div>
                </div>
              </div>

              {/* Banner cảnh báo nếu giỏ có lỗi */}
              {!isCartValidForCheckout && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300 flex items-start gap-2">
                  <AlertTriangle className="size-4 shrink-0 text-amber-400 mt-0.5" />
                  <span>
                    Vui lòng xóa các món ngừng bán hoặc điều chỉnh số lượng các món vượt tồn kho để tiến hành đặt hàng.
                  </span>
                </div>
              )}

              {/* Nút Đặt hàng */}
              <div>
                <Button
                  size="lg"
                  pill
                  variant="primary"
                  disabled={!isCartValidForCheckout}
                  onClick={() => {
                    window.location.hash = '#/checkout';
                  }}
                  className="w-full gap-2 font-semibold shadow-[var(--glow-accent-btn)]"
                >
                  <span>Tiến hành đặt hàng</span>
                  <ArrowRight className="size-4" />
                </Button>
                <p className="mt-2 text-[11px] text-fg-3 text-center">
                  Kho hàng sẽ được khóa tạm thời khi chuyển sang bước thanh toán.
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>

      {/* Dialog xác nhận xóa sạch giỏ hàng */}
      <Dialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Xóa toàn bộ giỏ hàng?</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa tất cả sinh vật cảnh ra khỏi giỏ hàng? Thao tác này sẽ làm sạch các cá thể đang lưu.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="secondary" onClick={() => setIsClearDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmClear}
              disabled={clearCartMutation.isPending}
            >
              Xác nhận xóa tất cả
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
