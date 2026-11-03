import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import {
  Package,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  RotateCcw,
  AlertTriangle,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Price } from '@/components/ui/Price';
import { StatusPill } from '@/components/ui/StatusPill';
import { CelebrationConfetti, AnimatedCheckmark } from '@/components/domain/CelebrationConfetti';
import { ButtonLink } from '@/components/domain/ButtonLink';
import { QueryErrorState } from '@/components/domain/QueryErrorState';
import { useOrderDetail } from '@/api/queries/useOrderQueries';
import { productDetailQueryOptions } from '@/api/queries/useProductQueries';
import { useAddToCart } from '@/api/mutations/useCartMutations';
import { resolveProductImage } from '@/api/adapters';
import { ApiError } from '@/api/errors';
import { formatVnd } from '@/lib/parseEnvironmentSpecs';
import { toast } from 'sonner';

export default function OrderDetailPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const isNewOrder = searchParams.get('new') === '1';

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: order, isLoading, isError, error, refetch, isRefetching } = useOrderDetail(id || '');
  const addToCartMutation = useAddToCart();

  const [isReordering, setIsReordering] = useState(false);
  const [showCelebration, setShowCelebration] = useState(isNewOrder);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '--';
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  const handleDismissCelebration = () => {
    setShowCelebration(false);
    searchParams.delete('new');
    setSearchParams(searchParams, { replace: true });
  };

  // Mua lại (tài liệu 03 mục 10): chỉ thêm các món còn bán, số lượng không vượt tồn kho, rồi báo rõ kết quả
  const handleReorder = async () => {
    const items = order?.items ?? [];
    if (items.length === 0 || isReordering) return;
    setIsReordering(true);

    const added: string[] = [];
    const skipped: string[] = [];
    // Chạy lần lượt vì useAddToCart cập nhật lạc quan cùng một bộ đệm giỏ: chạy song song thì rollback đè nhau
    for (const item of items) {
      try {
        const product = await queryClient.fetchQuery(productDetailQueryOptions(item.productId));
        if (!product || !product.isAvailable) {
          skipped.push(item.productName);
          continue;
        }
        await addToCartMutation.mutateAsync({
          productId: item.productId,
          quantity: Math.min(item.quantity, product.stockQuantity),
        });
        added.push(item.productName);
      } catch {
        skipped.push(item.productName);
      }
    }
    setIsReordering(false);

    if (added.length === 0) {
      toast.error('Không món nào trong đơn còn được bán. Giỏ hàng không thay đổi.');
      return;
    }
    if (skipped.length > 0) {
      toast.warning(`Đã thêm ${added.length} món. Không thể thêm: ${skipped.join(', ')}.`);
    } else {
      toast.success('Đã thêm các cá thể vào giỏ hàng');
    }
    navigate('/cart');
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="h-8 w-1/3 bg-surface rounded animate-pulse" />
        <div className="h-40 bg-surface rounded-2xl animate-pulse" />
        <div className="h-64 bg-surface rounded-2xl animate-pulse" />
      </div>
    );
  }

  // Chỉ 404 mới là "không tìm thấy" (đơn của người khác backend cũng trả 404); lỗi mạng hay 500 thì cho thử lại
  const isNotFound = (isError && error instanceof ApiError && (error.status === 404 || error.status === 400)) || (!isError && !order);
  if (isError && !isNotFound) {
    return (
      <QueryErrorState
        title="Không tải được chi tiết đơn hàng"
        error={error}
        onRetry={() => refetch()}
        isRetrying={isRefetching}
        className="mt-10"
      />
    );
  }

  if (isNotFound || !order) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <AlertTriangle className="size-12 text-amber-400 mb-3" aria-hidden="true" />
        <h1 className="text-xl font-bold text-fg">Không tìm thấy đơn hàng yêu cầu</h1>
        <p className="mt-2 text-sm text-fg-3">
          Mã đơn hàng không tồn tại trên hệ thống hoặc bạn không có quyền xem thông tin đơn hàng này.
        </p>
        <ButtonLink to="/orders" variant="primary" pill className="mt-6">
          ← Quay lại danh sách đơn hàng
        </ButtonLink>
      </div>
    );
  }

  const isCancelled = order.status === 'CANCELLED';
  const isCompleted = order.status === 'COMPLETED';

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Hiệu ứng pháo giấy Motion khi vừa đặt xong (?new=1) */}
      {showCelebration && <CelebrationConfetti />}

      {/* Banner chúc mừng đặt hàng thành công */}
      {showCelebration && (
        <div className="rounded-2xl border border-accent/40 bg-accent/10 backdrop-blur-xl p-6 relative overflow-hidden shadow-2xl flex flex-col sm:flex-row items-center gap-5">
          <AnimatedCheckmark size={56} className="shrink-0" />
          <div className="flex-1 text-center sm:text-left">
            <span className="text-xs uppercase font-mono tracking-wider text-accent font-bold">
              Giao dịch thành công
            </span>
            <h2 className="text-xl font-bold text-fg mt-0.5">
              Đã nhận đơn hàng của bạn!
            </h2>
            <p className="text-xs text-fg-2 mt-1 leading-relaxed">
              Mã đơn: <span className="font-mono text-accent font-bold">{order.orderCode}</span>.
              Trang trại nhân giống đã nhận thông tin và đang chuẩn bị thùng xốp bảo ôn chuyên dụng.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDismissCelebration}
            className="absolute top-4 right-4 text-fg-3 hover:text-fg p-1"
            aria-label="Đóng thông báo"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Header chi tiết đơn hàng */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <Link to="/orders" className="inline-flex items-center gap-1.5 text-xs text-fg-3 hover:text-accent transition-colors mb-2">
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            <span>Quay lại danh sách đơn hàng</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-fg font-mono">
              {order.orderCode || `ORD-2026-${order.id.toString().padStart(4, '0')}`}
            </h1>
            <StatusPill status={order.status} size="sm" />
          </div>
          <span className="text-xs text-fg-3 mt-1 block">
            Thời gian đặt: {formatDate(order.createdAt)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="primary"
            onClick={handleReorder}
            disabled={isReordering}
            aria-busy={isReordering}
            className="text-xs gap-1.5"
          >
            <RotateCcw className={`size-3.5 ${isReordering ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>{isReordering ? 'Đang thêm vào giỏ...' : 'Mua lại'}</span>
          </Button>
        </div>
      </div>

      {/* Dòng thời gian tiến độ trạng thái (4-Step Timeline) */}
      <div className="rounded-2xl border border-line bg-surface-1/70 backdrop-blur-md p-6 shadow-xl space-y-4">
        <h2 className="font-bold text-fg text-sm uppercase tracking-wider">
          Tiến độ đơn hàng
        </h2>

        <ol className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative pt-2">
          <li className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2">
            <div className="size-8 rounded-full bg-accent/20 border border-accent flex items-center justify-center text-accent shrink-0">
              <CheckCircle2 className="size-4" aria-hidden="true" />
            </div>
            <div>
              <span className="font-semibold text-fg text-xs block">1. Đã đặt hàng</span>
              <span className="text-[11px] text-fg-3">{formatDate(order.createdAt)}</span>
            </div>
          </li>

          <li className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2" aria-current={order.status === 'PENDING' ? 'step' : undefined}>
            <div
              className={`size-8 rounded-full border flex items-center justify-center shrink-0 ${
                isCancelled ? 'bg-surface-2 border-line text-fg-3' : 'bg-accent/20 border-accent text-accent'
              }`}
            >
              <Package className="size-4" aria-hidden="true" />
            </div>
            <div>
              <span className="font-semibold text-fg text-xs block">2. Đang xử lý</span>
              <span className="text-[11px] text-fg-3">Cửa hàng chuẩn bị cá thể</span>
            </div>
          </li>

          <li className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2" aria-current={isCompleted || isCancelled ? 'step' : undefined}>
            <div
              className={`size-8 rounded-full border flex items-center justify-center shrink-0 ${
                isCancelled
                  ? 'bg-red-500/20 border-red-500 text-red-400'
                  : isCompleted
                    ? 'bg-accent/20 border-accent text-accent'
                    : 'bg-surface-2 border-line text-fg-3'
              }`}
            >
              {isCancelled ? <XCircle className="size-4" aria-hidden="true" /> : <CheckCircle2 className="size-4" aria-hidden="true" />}
            </div>
            <div>
              <span className="font-semibold text-fg text-xs block">
                {isCancelled ? '3. Đã hủy đơn hàng' : '3. Hoàn tất'}
              </span>
              <span className="text-[11px] text-fg-3">
                {isCancelled ? 'Giao dịch đã kết thúc' : 'Người mua đã nhận cá thể'}
              </span>
            </div>
          </li>
        </ol>
      </div>

      {/* Bảng kê chi tiết cá thể (Snapshot Price Items) */}
      <div className="rounded-2xl border border-line bg-surface-1/70 backdrop-blur-md p-6 shadow-xl space-y-4">
        <h2 className="font-bold text-fg text-sm uppercase tracking-wider border-b border-line/60 pb-3">
          Danh mục cá thể đã đặt
        </h2>

        <div className="divide-y divide-line/40">
          {(order.items || []).map((item) => (
            <div key={item.productId} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="size-14 rounded-xl bg-surface-2 border border-line overflow-hidden shrink-0">
                  <img
                    src={resolveProductImage(item.imageUrl)}
                    alt={item.productName}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </div>

                <div>
                  <Link
                    to={`/products/${item.productId}`}
                    className="font-semibold text-fg text-sm hover:text-accent transition-colors"
                  >
                    {item.productName}
                  </Link>
                  <span className="text-xs text-fg-3 block">
                    Đơn giá lúc mua: <span className="font-mono">{formatVnd(item.unitPrice)}</span> × {item.quantity} cá thể
                  </span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-sm font-mono font-bold text-accent">
                  {formatVnd(item.lineTotal)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Thông tin giao hàng & Tổng tiền */}
        <div className="pt-4 border-t border-line/60 grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
          <div className="rounded-xl border border-line/60 bg-surface-2/40 p-4 text-xs space-y-1.5">
            <span className="font-bold text-fg block">Địa chỉ giao hàng:</span>
            <p className="text-fg-2">{order.shippingAddress}</p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-fg-2">
              <span>Tạm tính cá thể:</span>
              <span className="font-mono font-semibold text-fg">{formatVnd(order.totalAmount)}</span>
            </div>
            <div className="pt-2 border-t border-line/60 flex items-baseline justify-between">
              <span className="text-sm font-bold text-fg">Tổng thanh toán:</span>
              <Price amount={order.totalAmount} size="lg" className="text-2xl text-accent" />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
