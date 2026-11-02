import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Price } from '@/components/ui/Price';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { VietQRCard } from '@/components/domain/VietQRCard';
import { useCart } from '@/api/queries/useCartQueries';
import { useProductDetail } from '@/api/queries/useProductQueries';
import { useMe } from '@/api/queries/useAuthQueries';
import { usePlaceOrder } from '@/api/mutations/useOrderMutations';
import { getStoredToken } from '@/api/authStore';
import { formatVnd } from '@/lib/parseEnvironmentSpecs';
import { toast } from 'sonner';

// Zod Schema xác thực địa chỉ giao hàng & cam kết
const checkoutShippingSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Họ và tên người nhận phải có ít nhất 2 ký tự')
    .max(50, 'Họ và tên không được vượt quá 50 ký tự'),
  phone: z
    .string()
    .regex(/^(0|\+84)\d{9}$/, 'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0 hoặc +84)'),
  shippingAddress: z
    .string()
    .min(10, 'Địa chỉ chi tiết cần tối thiểu 10 ký tự để bảo đảm vận chuyển an toàn')
    .max(255, 'Địa chỉ không được vượt quá 255 ký tự'),
  shippingNote: z.string().max(200, 'Ghi chú không được vượt quá 200 ký tự').optional(),
  adoptionPledge: z.boolean().refine((val) => val === true, {
    message: 'Bạn bắt buộc phải cam kết chăm sóc và tuân thủ điều kiện sinh cảnh cho cá thể',
  }),
});

type CheckoutShippingFormData = z.infer<typeof checkoutShippingSchema>;

type PaymentMethod = 'COD' | 'VIETQR' | 'BIOPAY';

export default function CheckoutPage(): React.JSX.Element {
  const [searchParams] = useSearchParams();
  const token = getStoredToken();

  // Kiểm tra chế độ mua ngay (Direct Buy)
  const directProductId = searchParams.get('productId') ? Number(searchParams.get('productId')) : null;
  const directQuantity = searchParams.get('quantity') ? Number(searchParams.get('quantity')) : 1;
  const isDirectBuy = Boolean(directProductId);

  // Queries
  const { data: me } = useMe({ enabled: !!token });
  const { data: cart } = useCart({ enabled: !!token && !isDirectBuy });
  const { data: directProduct } = useProductDetail(directProductId || 0, {
    enabled: isDirectBuy,
  });

  const placeOrderMutation = usePlaceOrder();

  // State các bước
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [conflictError, setConflictError] = useState<string | null>(null);

  // React Hook Form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckoutShippingFormData>({
    resolver: zodResolver(checkoutShippingSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      shippingAddress: '',
      shippingNote: '',
      adoptionPledge: false,
    },
  });

  const formData = watch();

  // Tự động điền (Prefill) từ hồ sơ người dùng
  useEffect(() => {
    if (me) {
      if (me.fullName) setValue('fullName', me.fullName);
      if (me.phone) setValue('phone', me.phone);
      if (me.address) setValue('shippingAddress', me.address);
    }
  }, [me, setValue]);

  // Danh sách các món trong đơn hàng
  const checkoutItems = isDirectBuy
    ? directProduct
      ? [
          {
            productId: directProduct.id,
            productName: directProduct.productName,
            imageUrl: directProduct.displayImage,
            price: directProduct.price,
            quantity: directQuantity,
            lineTotal: directProduct.price * directQuantity,
          },
        ]
      : []
    : cart?.items.filter((i) => i.available) || [];

  const subtotal = checkoutItems.reduce((acc, i) => acc + i.lineTotal, 0);

  // Xử lý sang Bước 2
  const onStep1Submit = () => {
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Xác nhận đặt hàng cuối cùng
  const handleFinalPlaceOrder = async () => {
    try {
      const payload = isDirectBuy
        ? {
            items: [{ productId: directProductId!, quantity: directQuantity }],
            shippingAddress: `${formData.shippingAddress} (Người nhận: ${formData.fullName} - ${formData.phone})${
              formData.shippingNote ? ` [Ghi chú: ${formData.shippingNote}]` : ''
            }`,
          }
        : {
            shippingAddress: `${formData.shippingAddress} (Người nhận: ${formData.fullName} - ${formData.phone})${
              formData.shippingNote ? ` [Ghi chú: ${formData.shippingNote}]` : ''
            }`,
          };

      const order = await placeOrderMutation.mutateAsync(payload);
      toast.success('Đặt hàng thành công!');
      window.location.hash = `#/orders/${order.id}?new=1`;
    } catch (err: any) {
      if (err.status === 409 || err.code?.includes('CONFLICT') || err.code?.includes('OUT_OF_STOCK')) {
        setConflictError(err.message || 'Một số sản phẩm trong đơn đã hết hàng hoặc thay đổi trạng thái tồn kho.');
      } else {
        toast.error(err.message || 'Không thể tạo đơn hàng');
      }
    }
  };

  if (!token) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="size-16 rounded-2xl bg-surface-2 border border-line flex items-center justify-center text-accent mb-4">
          <Lock className="size-8" />
        </div>
        <h2 className="text-2xl font-bold text-fg">Đăng nhập để thanh toán</h2>
        <p className="mt-2 text-sm text-fg-2">
          Vui lòng đăng nhập tài khoản của bạn để tiến hành xác nhận đặt hàng và lưu giữ hồ sơ cá thể.
        </p>
        <Link to={`/login?next=${encodeURIComponent(window.location.hash.replace('#', ''))}`} className="mt-6">
          <Button variant="primary" pill>
            Đăng nhập ngay
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-fg py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Header thanh điều hướng 2 bước */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-fg font-sans">
              Xác Nhận Đặt Hàng
            </h1>
            <span className="text-xs font-mono text-accent">
              {isDirectBuy ? 'Chế độ Mua ngay cá thể' : 'Chế độ Giỏ hàng đầy đủ'}
            </span>
          </div>

          {/* Stepper chỉ báo bước */}
          <div className="grid grid-cols-2 rounded-2xl border border-line bg-surface-1/70 backdrop-blur-md p-1.5 shadow-md">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                currentStep === 1
                  ? 'bg-accent text-accent-ink shadow-md font-bold'
                  : 'text-fg-2 hover:text-fg'
              }`}
            >
              <span className="flex size-5 items-center justify-center rounded-full bg-black/20 text-[11px] font-mono">
                1
              </span>
              <span>1. Thông tin giao hàng & Cam kết</span>
            </button>

            <button
              type="button"
              disabled={currentStep === 1}
              onClick={() => setCurrentStep(2)}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                currentStep === 2
                  ? 'bg-accent text-accent-ink shadow-md font-bold'
                  : 'text-fg-3 cursor-not-allowed'
              }`}
            >
              <span className="flex size-5 items-center justify-center rounded-full bg-black/20 text-[11px] font-mono">
                2
              </span>
              <span>2. Thanh toán & Xác nhận đơn</span>
            </button>
          </div>
        </div>

        {/* BƯỚC 1: Form thông tin người nhận & Cam kết nhận nuôi */}
        {currentStep === 1 && (
          <form onSubmit={handleSubmit(onStep1Submit)} className="space-y-6">
            <div className="rounded-2xl border border-line bg-surface-1/70 backdrop-blur-xl p-6 md:p-8 space-y-6 shadow-xl">
              <h2 className="text-lg font-bold text-fg border-b border-line/60 pb-3 flex items-center gap-2">
                <Truck className="size-5 text-accent" />
                <span>Thông tin người nhận & Địa chỉ giao hàng</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fullName-input" className="block text-xs font-medium text-fg-2 mb-1.5">
                    Họ và tên người nhận *
                  </label>
                  <Input
                    id="fullName-input"
                    {...register('fullName')}
                    placeholder="Ví dụ: Lê Văn C"
                    error={errors.fullName?.message}
                  />
                </div>

                <div>
                  <label htmlFor="phone-input" className="block text-xs font-medium text-fg-2 mb-1.5">
                    Số điện thoại liên hệ *
                  </label>
                  <Input
                    id="phone-input"
                    {...register('phone')}
                    placeholder="0912345678"
                    error={errors.phone?.message}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address-input" className="block text-xs font-medium text-fg-2 mb-1.5">
                  Địa chỉ giao hàng chi tiết *
                </label>
                <Input
                  id="address-input"
                  {...register('shippingAddress')}
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành..."
                  error={errors.shippingAddress?.message}
                />
                <p className="mt-1 text-[11px] text-fg-3">
                  Địa chỉ chi tiết cần tối thiểu 10 ký tự để đơn vị vận chuyển chuyên dụng điều phối thùng giữ nhiệt.
                </p>
              </div>

              <div>
                <label htmlFor="note-input" className="block text-xs font-medium text-fg-2 mb-1.5">
                  Ghi chú giao nhận sinh vật (Tùy chọn)
                </label>
                <Textarea
                  id="note-input"
                  {...register('shippingNote')}
                  placeholder="Ví dụ: Giao giờ hành chính, gọi trước 30 phút để chuẩn bị bể nuôi..."
                  rows={2}
                />
              </div>

              {/* Hộp cam kết nhận nuôi cá thể */}
              <div className="rounded-xl border border-accent/40 bg-accent/5 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="adoptionPledge"
                    {...register('adoptionPledge')}
                    className="size-4.5 rounded border-line bg-surface text-accent focus:ring-accent mt-0.5"
                  />
                  <label htmlFor="adoptionPledge" className="text-xs text-fg-2 leading-relaxed cursor-pointer select-none">
                    <span className="font-semibold text-fg block text-sm mb-0.5">
                      Cam kết nhận nuôi & chăm sóc sinh vật cảnh (Bắt buộc)
                    </span>
                    Tôi xác nhận đã tìm hiểu kỹ thông số môi trường sống (nhiệt độ, độ ẩm, chế độ dinh dưỡng) và có cơ sở vật chất đạt chuẩn để tiếp nhận nuôi dưỡng cá thể cảnh nhân tạo F2+ này.
                  </label>
                </div>
                {errors.adoptionPledge && (
                  <p className="text-xs text-red-400 pl-7">{errors.adoptionPledge.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Link to={isDirectBuy ? `/products/${directProductId}` : '/cart'}>
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-fg-3 hover:text-fg">
                  <ArrowLeft className="size-3.5" />
                  <span>Quay lại</span>
                </Button>
              </Link>

              <Button type="submit" size="lg" pill variant="primary" className="gap-2 font-semibold">
                <span>Tiếp tục sang bước 2</span>
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </form>
        )}

        {/* BƯỚC 2: Phương thức thanh toán & Xem lại đơn hàng */}
        {currentStep === 2 && (
          <div className="space-y-6">
            {/* Phương thức thanh toán */}
            <div className="rounded-2xl border border-line bg-surface-1/70 backdrop-blur-xl p-6 md:p-8 space-y-6 shadow-xl">
              <h2 className="text-lg font-bold text-fg border-b border-line/60 pb-3 flex items-center gap-2">
                <CreditCard className="size-5 text-accent" />
                <span>Phương thức thanh toán</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. COD */}
                <div
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'COD'
                      ? 'border-accent bg-accent/10 shadow-[0_0_15px_rgba(110,231,183,0.15)]'
                      : 'border-line bg-surface-2/40 hover:bg-surface-2'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-fg text-sm">COD</span>
                    {paymentMethod === 'COD' && <CheckCircle2 className="size-4 text-accent" />}
                  </div>
                  <p className="text-xs text-fg-3">
                    Đồng kiểm cá thể sống khi nhận hàng & thanh toán tiền mặt.
                  </p>
                </div>

                {/* 2. VietQR */}
                <div
                  onClick={() => setPaymentMethod('VIETQR')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'VIETQR'
                      ? 'border-accent bg-accent/10 shadow-[0_0_15px_rgba(110,231,183,0.15)]'
                      : 'border-line bg-surface-2/40 hover:bg-surface-2'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-fg text-sm">Chuyển khoản VietQR</span>
                    {paymentMethod === 'VIETQR' && <CheckCircle2 className="size-4 text-accent" />}
                  </div>
                  <p className="text-xs text-fg-3">
                    Quét mã QR tự động Napas247, xác nhận tức thì.
                  </p>
                </div>

                {/* 3. BioPay */}
                <div
                  onClick={() => setPaymentMethod('BIOPAY')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'BIOPAY'
                      ? 'border-accent bg-accent/10 shadow-[0_0_15px_rgba(110,231,183,0.15)]'
                      : 'border-line bg-surface-2/40 hover:bg-surface-2'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-fg text-sm">Ví BioPay</span>
                    {paymentMethod === 'BIOPAY' && <CheckCircle2 className="size-4 text-accent" />}
                  </div>
                  <p className="text-xs text-fg-3">
                    Thanh toán số dư tích lũy sinh thái trực tuyến.
                  </p>
                </div>
              </div>

              {/* VietQR View nếu chọn */}
              {paymentMethod === 'VIETQR' && (
                <div className="pt-2">
                  <VietQRCard
                    amount={subtotal}
                    memo={`BIO-ORDER-${Date.now().toString().slice(-6)}`}
                  />
                </div>
              )}
            </div>

            {/* Bảng kê xem lại đơn hàng */}
            <div className="rounded-2xl border border-line bg-surface-1/70 backdrop-blur-xl p-6 md:p-8 space-y-6 shadow-xl">
              <h2 className="text-lg font-bold text-fg border-b border-line/60 pb-3 flex items-center justify-between">
                <span>Xem lại danh sách cá thể</span>
                <span className="text-xs font-mono text-accent">{checkoutItems.length} sản phẩm</span>
              </h2>

              <div className="divide-y divide-line/40">
                {checkoutItems.map((item) => (
                  <div key={item.productId} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="size-12 rounded-lg object-cover border border-line shrink-0"
                        />
                      )}
                      <div>
                        <span className="font-semibold text-fg text-sm block">{item.productName}</span>
                        <span className="text-xs text-fg-3 font-mono">
                          {formatVnd(item.price)} × {item.quantity}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-fg text-sm">
                      {formatVnd(item.lineTotal)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Tóm tắt người nhận */}
              <div className="rounded-xl border border-line bg-surface-2/40 p-4 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-fg-3">Giao đến:</span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-accent underline hover:text-white"
                  >
                    Thay đổi
                  </button>
                </div>
                <p className="font-semibold text-fg">
                  {formData.fullName} · {formData.phone}
                </p>
                <p className="text-fg-2">{formData.shippingAddress}</p>
                {formData.shippingNote && (
                  <p className="text-fg-3 italic">Ghi chú: {formData.shippingNote}</p>
                )}
              </div>

              {/* Tổng thanh toán & Cảnh báo ACID */}
              <div className="pt-4 border-t border-line/60 flex items-baseline justify-between">
                <div>
                  <span className="text-sm font-bold text-fg block">Tổng tiền thanh toán:</span>
                  <span className="text-[11px] text-fg-3 font-mono">
                    Đã bao gồm đóng thùng bảo ôn chuyên dụng
                  </span>
                </div>
                <Price amount={subtotal} size="lg" className="text-2xl text-accent" />
              </div>

              <div className="rounded-xl border border-line/60 bg-surface-2/30 p-3 text-[11px] text-fg-3 flex items-start gap-2">
                <ShieldCheck className="size-4 shrink-0 text-accent mt-0.5" />
                <span>
                  Hệ thống khóa tồn kho nguyên tử (ACID transaction). Đơn hàng sẽ được tạo và xác nhận ngay khi bấm thanh toán.
                </span>
              </div>
            </div>

            {/* Cụm nút xác nhận */}
            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep(1)}
                className="gap-1.5 text-xs text-fg-3 hover:text-fg"
              >
                <ArrowLeft className="size-3.5" />
                <span>Quay lại Bước 1</span>
              </Button>

              <Button
                type="button"
                size="lg"
                pill
                variant="primary"
                onClick={handleFinalPlaceOrder}
                disabled={placeOrderMutation.isPending || checkoutItems.length === 0}
                className="gap-2 font-bold shadow-[var(--glow-accent-btn)] min-w-[200px]"
              >
                {placeOrderMutation.isPending ? (
                  <div className="size-4 animate-spin rounded-full border-2 border-accent-ink border-t-transparent" />
                ) : (
                  <Lock className="size-4" />
                )}
                <span>
                  {placeOrderMutation.isPending ? 'Đang tạo đơn hàng...' : 'Xác nhận Đặt hàng'}
                </span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Dialog xung đột tồn kho 409 (ConflictDialog) */}
      <Dialog open={!!conflictError} onOpenChange={() => setConflictError(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="size-5 text-amber-400" />
              <span>Không thể hoàn tất đơn hàng</span>
            </DialogTitle>
            <DialogDescription className="space-y-3 pt-2 text-fg-2 text-xs leading-relaxed">
              <p>{conflictError}</p>
              <p>
                Giao dịch đã được hệ thống BioNexus tự động hoàn tác (rollback) để bảo đảm an toàn. Thông tin người nhận của bạn vẫn được giữ nguyên.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="secondary" onClick={() => setConflictError(null)}>
              Đóng
            </Button>
            <Link to="/cart">
              <Button variant="primary">Về giỏ hàng để cập nhật</Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
