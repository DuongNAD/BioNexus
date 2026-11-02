import React, { useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router';
import {
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Store,
  Phone,
  Mail,
  ShieldCheck,
  RotateCcw,
  AlertTriangle,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Price } from '@/components/ui/Price';
import { StatusPill } from '@/components/ui/StatusPill';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { CelebrationConfetti, AnimatedCheckmark } from '@/components/domain/CelebrationConfetti';
import { useOrderDetail } from '@/api/queries/useOrderQueries';
import { useAddToCart } from '@/api/mutations/useCartMutations';
import { formatVnd } from '@/lib/parseEnvironmentSpecs';
import { toast } from 'sonner';

export default function OrderDetailPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const isNewOrder = searchParams.get('new') === '1';

  const { data: order, isLoading, error } = useOrderDetail(id || '');
  const addToCartMutation = useAddToCart();

  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
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

  // Mua lại các món trong đơn
  const handleReorder = () => {
    if (!order?.items) return;
    let addedCount = 0;

    order.items.forEach((item) => {
      addToCartMutation.mutate(
        { productId: item.productId, quantity: item.quantity },
        {
          onSuccess: () => {
            addedCount++;
            if (addedCount === order.items.length) {
              toast.success('Đã thêm các cá thể vào giỏ hàng');
              window.location.hash = '#/cart';
            }
          },
        }
      );
    });
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

  if (error || !order) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <AlertTriangle className="size-12 text-amber-400 mb-3" />
        <h2 className="text-xl font-bold text-fg">Không tìm thấy đơn hàng yêu cầu</h2>
        <p className="mt-2 text-xs text-fg-3">
          Mã đơn hàng không tồn tại trên hệ thống hoặc bạn không có quyền xem thông tin đơn hàng này.
        </p>
        <Link to="/orders" className="mt-6">
          <Button variant="primary" pill>← Quay lại danh sách đơn hàng</Button>
        </Link>
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
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Header chi tiết đơn hàng */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <Link to="/orders" className="inline-flex items-center gap-1.5 text-xs text-fg-3 hover:text-accent transition-colors mb-2">
            <ArrowLeft className="size-3.5" />
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
            variant="secondary"
            onClick={() => setIsContactDialogOpen(true)}
            className="text-xs gap-1.5"
          >
            <Store className="size-3.5 text-accent" />
            <span>Liên hệ shop</span>
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={handleReorder}
            disabled={addToCartMutation.isPending}
            className="text-xs gap-1.5"
          >
            <RotateCcw className="size-3.5" />
            <span>Mua lại</span>
          </Button>
        </div>
      </div>

      {/* Dòng thời gian tiến độ trạng thái (4-Step Timeline) */}
      <div className="rounded-2xl border border-line bg-surface-1/70 backdrop-blur-md p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-fg text-sm uppercase tracking-wider font-mono">
          Tiến độ giao nhận sinh vật cảnh
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative pt-2">
          {/* Bước 1 */}
          <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2">
            <div className="size-8 rounded-full bg-accent/20 border border-accent flex items-center justify-center text-accent shrink-0">
              <CheckCircle2 className="size-4" />
            </div>
            <div>
              <span className="font-semibold text-fg text-xs block">1. Đã đặt hàng</span>
              <span className="text-[10px] text-fg-3 font-mono">{formatDate(order.createdAt)}</span>
            </div>
          </div>

          {/* Bước 2 */}
          <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2">
            <div
              className={`size-8 rounded-full border flex items-center justify-center shrink-0 ${
                isCompleted || order.status === 'PENDING'
                  ? 'bg-accent/20 border-accent text-accent'
                  : 'bg-surface-2 border-line text-fg-3'
              }`}
            >
              <Package className="size-4" />
            </div>
            <div>
              <span className="font-semibold text-fg text-xs block">2. Đóng thùng bảo ôn</span>
              <span className="text-[10px] text-fg-3">Kiểm tra thể trạng cá thể</span>
            </div>
          </div>

          {/* Bước 3 */}
          <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2">
            <div
              className={`size-8 rounded-full border flex items-center justify-center shrink-0 ${
                isCompleted
                  ? 'bg-accent/20 border-accent text-accent'
                  : 'bg-surface-2 border-line text-fg-3'
              }`}
            >
              <Truck className="size-4" />
            </div>
            <div>
              <span className="font-semibold text-fg text-xs block">3. Vận chuyển chuyên dụng</span>
              <span className="text-[10px] text-fg-3">Xe điều hòa sinh học</span>
            </div>
          </div>

          {/* Bước 4 (hoặc Nhánh CANCELLED) */}
          <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2">
            <div
              className={`size-8 rounded-full border flex items-center justify-center shrink-0 ${
                isCancelled
                  ? 'bg-red-500/20 border-red-500 text-red-400'
                  : isCompleted
                    ? 'bg-accent/20 border-accent text-accent'
                    : 'bg-surface-2 border-line text-fg-3'
              }`}
            >
              {isCancelled ? <XCircle className="size-4" /> : <CheckCircle2 className="size-4" />}
            </div>
            <div>
              <span className="font-semibold text-fg text-xs block">
                {isCancelled ? 'Đã hủy đơn hàng' : '4. Giao thành công'}
              </span>
              <span className="text-[10px] text-fg-3">
                {isCancelled ? 'Giao dịch đã kết thúc' : 'Đồng kiểm cá thể sống'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bảng kê chi tiết cá thể (Snapshot Price Items) */}
      <div className="rounded-2xl border border-line bg-surface-1/70 backdrop-blur-md p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-fg text-sm uppercase tracking-wider font-mono border-b border-line/60 pb-3">
          Danh mục cá thể đã đặt
        </h3>

        <div className="divide-y divide-line/40">
          {(order.items || []).map((item) => (
            <div key={item.productId} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="size-14 rounded-xl bg-surface-2 border border-line overflow-hidden shrink-0">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.productName} className="size-full object-cover" />
                  ) : (
                    <div className="size-full flex items-center justify-center text-[10px] text-fg-3 font-mono">
                      BIO
                    </div>
                  )}
                </div>

                <div>
                  <Link
                    to={`/products/${item.productId}`}
                    className="font-semibold text-fg text-sm hover:text-accent transition-colors"
                  >
                    {item.productName}
                  </Link>
                  <span className="text-xs text-fg-3 block font-mono">
                    Đơn giá chốt: {formatVnd(item.unitPrice)} × {item.quantity} cá thể
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
            <span className="font-bold text-fg block font-mono">Địa chỉ giao nhận & Ghi chú:</span>
            <p className="text-fg-2">{order.shippingAddress}</p>
            <div className="pt-2 border-t border-line/40 text-[11px] text-fg-3 flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-accent shrink-0" />
              <span>Thùng cách nhiệt đã dán tem "Sinh vật sống - Ưu tiên giao ngay"</span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-fg-2">
              <span>Tạm tính cá thể:</span>
              <span className="font-mono font-semibold text-fg">{formatVnd(order.totalAmount)}</span>
            </div>
            <div className="flex items-center justify-between text-fg-2">
              <span>Vận chuyển điều hòa sinh học:</span>
              <span className="font-mono text-emerald-400">0 ₫</span>
            </div>
            <div className="pt-2 border-t border-line/60 flex items-baseline justify-between">
              <span className="text-sm font-bold text-fg">Tổng thanh toán:</span>
              <Price amount={order.totalAmount} size="lg" className="text-2xl text-accent" />
            </div>
          </div>
        </div>
      </div>

      {/* Dialog liên hệ shop */}
      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Kênh liên lạc Trại nhân giống</DialogTitle>
            <DialogDescription>
              Đội ngũ kỹ thuật của cơ sở nhân giống sẵn sàng tư vấn cách thiết lập sinh cảnh và giải đáp thắc mắc sức khỏe cá thể.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-3 text-xs">
            <div className="flex items-center gap-3 p-3 rounded-xl border border-line bg-surface-2">
              <Phone className="size-4 text-accent" />
              <div>
                <span className="text-fg-3 block text-[11px]">Hotline kỹ thuật nuôi:</span>
                <span className="font-mono font-bold text-fg">1900-BIONEXUS (028 3822 1234)</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl border border-line bg-surface-2">
              <Mail className="size-4 text-accent" />
              <div>
                <span className="text-fg-3 block text-[11px]">Email hỗ trợ bảo tồn:</span>
                <span className="font-mono font-bold text-fg">hotro@bionexus.vn</span>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="primary" onClick={() => setIsContactDialogOpen(false)}>
              Đã hiểu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
