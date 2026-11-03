import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
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
  ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Price } from '@/components/ui/Price';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { VietQRCard } from '@/components/domain/VietQRCard';
import { ButtonLink } from '@/components/domain/ButtonLink';
import { QueryErrorState } from '@/components/domain/QueryErrorState';
import { useCart } from '@/api/queries/useCartQueries';
import { useProductDetail } from '@/api/queries/useProductQueries';
import { useMe } from '@/api/queries/useAuthQueries';
import { usePlaceOrder } from '@/api/mutations/useOrderMutations';
import { resolveProductImage } from '@/api/adapters';
import { ApiError } from '@/api/errors';
import { formatVnd } from '@/lib/parseEnvironmentSpecs';
import type { PlaceOrderRequest } from '@/types/api';
import { toast } from 'sonner';

// Tài liệu 03 mục 9: chỉ gửi shippingAddress (≥ 10 ký tự, khớp ORDER_INVALID_SHIPPING_ADDRESS)
const checkoutShippingSchema = z.object({
  shippingAddress: z
    .string()
    .trim()
    .min(10, 'Địa chỉ giao hàng cần tối thiểu 10 ký tự')
    .max(255, 'Địa chỉ không được vượt quá 255 ký tự'),
  adoptionPledge: z.boolean().refine((val) => val === true, {
    message: 'Bạn cần xác nhận đã tìm hiểu điều kiện nuôi trước khi đặt hàng',
  }),
});

type CheckoutShippingFormData = z.infer<typeof checkoutShippingSchema>;

type PaymentMethod = 'COD' | 'VIETQR';

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string; description: string }[] = [
  { id: 'COD', label: 'Thanh toán khi nhận hàng', description: 'Kiểm tra cá thể sống khi nhận rồi mới thanh toán.' },
  { id: 'VIETQR', label: 'Chuyển khoản VietQR', description: 'Bản minh hoạ, chưa kết nối cổng thanh toán.' },
];

interface CheckoutLine {
  productId: number;
  productName: string;
  imageUrl: string;
  price: number;
  quantity: number;
  lineTotal: number;
}

export default function CheckoutPage(): React.JSX.Element {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Chế độ mua ngay (Direct Buy): ?productId=&quantity=
  const directProductId = Number(searchParams.get('productId')) || null;
  const directQuantity = Math.max(1, Math.floor(Number(searchParams.get('quantity')) || 1));
  const isDirectBuy = directProductId !== null;

  // Route đã bọc RequireAuth nên ở đây luôn là tài khoản USER
  const { data: me } = useMe();
  const cartQuery = useCart({ enabled: !isDirectBuy });
  const directQuery = useProductDetail(directProductId || 0, { enabled: isDirectBuy });

  const placeOrderMutation = usePlaceOrder();

  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [conflictError, setConflictError] = useState<string | null>(null);
  // Nội dung chuyển khoản phải cố định trong suốt phiên thanh toán, không đổi theo mỗi lần render
  const [transferMemo] = useState(() => `BIONEXUS ${Date.now().toString().slice(-6)}`);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<CheckoutShippingFormData>({
    resolver: zodResolver(checkoutShippingSchema),
    defaultValues: {
      shippingAddress: '',
      adoptionPledge: false,
    },
  });

  const shippingAddress = watch('shippingAddress');

  // Điền sẵn địa chỉ mặc định một lần, không ghi đè khi người dùng đã gõ
  useEffect(() => {
    if (me?.address && !getValues('shippingAddress')) {
      setValue('shippingAddress', me.address);
    }
  }, [me, getValues, setValue]);

  const directProduct = directQuery.data;
  const isLoading = isDirectBuy ? directQuery.isLoading : cartQuery.isLoading;
  const loadError = isDirectBuy ? directQuery.error : cartQuery.error;
  const refetch = isDirectBuy ? directQuery.refetch : cartQuery.refetch;

  const checkoutItems: CheckoutLine[] = isDirectBuy
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
    : (cartQuery.data?.items ?? []).map((i) => ({
        productId: i.productId,
        productName: i.productName,
        imageUrl: resolveProductImage(i.imageUrl),
        price: i.price,
        quantity: i.quantity,
        lineTotal: i.price * i.quantity,
      }));

  // Lý do không thể đặt (giỏ có món ngừng bán, vượt kho, hoặc mua ngay quá tồn kho)
  const blockingReason = (() => {
    if (isDirectBuy) {
      if (!directProduct) return null;
      if (!directProduct.isAvailable) return 'Sản phẩm này hiện không còn mở bán.';
      if (directQuantity > directProduct.stockQuantity) {
        return `Kho chỉ còn ${directProduct.stockQuantity} cá thể, ít hơn số lượng bạn chọn.`;
      }
      return null;
    }
    const items = cartQuery.data?.items ?? [];
    if (items.some((i) => !i.available)) return 'Giỏ hàng có món đã ngừng bán hoặc hết hàng.';
    if (items.some((i) => i.quantity > i.maxQuantity)) return 'Giỏ hàng có món vượt quá số lượng còn trong kho.';
    return null;
  })();

  const subtotal = checkoutItems.reduce((acc, i) => acc + i.lineTotal, 0);

  const onStep1Submit = () => {
    setCurrentStep(2);
    window.scrollTo({ top: 0 });
  };

  const handleFinalPlaceOrder = async () => {
    const address = getValues('shippingAddress').trim();
    const payload: PlaceOrderRequest = isDirectBuy
      ? { items: [{ productId: directProductId!, quantity: directQuantity }], shippingAddress: address }
      : { shippingAddress: address };

    try {
      const order = await placeOrderMutation.mutateAsync(payload);
      toast.success(`Đặt hàng thành công · ${order.orderCode}`);
      navigate(`/orders/${order.id}?new=1`);
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : null;
      if (apiErr?.status === 409) {
        setConflictError(apiErr.message || 'Một số sản phẩm trong đơn đã hết hàng hoặc ngừng bán.');
      } else {
        toast.error(apiErr?.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.');
      }
    }
  };

  const backTo = isDirectBuy ? `/products/${directProductId}` : '/cart';

  // ===== Trạng thái đang tải / lỗi / rỗng / không đặt được =====
  let statusView: React.ReactNode = null;
  if (isLoading) {
    statusView = (
      <div className="space-y-4" role="status" aria-label="Đang tải thông tin đơn hàng">
        <div className="h-14 rounded-2xl bg-surface animate-pulse" />
        <div className="h-72 rounded-2xl bg-surface animate-pulse" />
      </div>
    );
  } else if (loadError) {
    statusView = (
      <QueryErrorState title="Không tải được thông tin đơn hàng" error={loadError} onRetry={() => refetch()} />
    );
  } else if (checkoutItems.length === 0) {
    statusView = (
      <EmptyState
        icon={<ShoppingBag className="size-8 text-accent" />}
        title={isDirectBuy ? 'Không tìm thấy sản phẩm' : 'Giỏ hàng đang trống'}
        description="Chưa có cá thể nào để đặt hàng. Hãy chọn sản phẩm trên sàn sinh vật cảnh."
        action={{ label: 'Vào cửa hàng', onClick: () => navigate('/products') }}
      />
    );
  } else if (blockingReason) {
    statusView = (
      <div
        role="alert"
        className="mx-auto max-w-lg rounded-2xl border border-amber-500/30 bg-amber-500/10 p-8 text-center"
      >
        <AlertTriangle className="mx-auto mb-3 size-10 text-amber-400" aria-hidden="true" />
        <h2 className="text-lg font-bold text-fg">Chưa thể đặt hàng</h2>
        <p className="mt-2 text-sm text-fg-2">{blockingReason}</p>
        <ButtonLink to={backTo} variant="primary" pill className="mt-6">
          {isDirectBuy ? 'Về trang sản phẩm' : 'Về giỏ hàng để điều chỉnh'}
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-fg py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-fg font-sans">Xác Nhận Đặt Hàng</h1>
            <span className="text-xs text-accent">{isDirectBuy ? 'Mua ngay một sản phẩm' : 'Đặt toàn bộ giỏ hàng'}</span>
          </div>

          {!statusView && (
            <ol className="grid grid-cols-2 rounded-2xl border border-line bg-surface-1/70 backdrop-blur-md p-1.5 shadow-md">
              {[
                { step: 1 as const, label: 'Địa chỉ giao hàng' },
                { step: 2 as const, label: 'Xác nhận đơn' },
              ].map(({ step, label }) => (
                <li key={step}>
                  <button
                    type="button"
                    disabled={step === 2 && currentStep === 1}
                    onClick={() => setCurrentStep(step)}
                    aria-current={currentStep === step ? 'step' : undefined}
                    className={`flex w-full items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      currentStep === step
                        ? 'bg-accent text-accent-ink shadow-md font-bold'
                        : step === 2
                          ? 'text-fg-3 cursor-not-allowed'
                          : 'text-fg-2 hover:text-fg'
                    }`}
                  >
                    <span className="flex size-5 items-center justify-center rounded-full bg-black/20 text-[11px] font-mono">
                      {step}
                    </span>
                    <span>{label}</span>
                  </button>
                </li>
              ))}
            </ol>
          )}
        </div>

        {statusView}

        {/* BƯỚC 1: Địa chỉ giao hàng */}
        {!statusView && currentStep === 1 && (
          <form onSubmit={handleSubmit(onStep1Submit)} className="space-y-6" noValidate>
            <div className="rounded-2xl border border-line bg-surface-1/70 backdrop-blur-xl p-6 md:p-8 space-y-6 shadow-xl">
              <h2 className="text-lg font-bold text-fg border-b border-line/60 pb-3 flex items-center gap-2">
                <Truck className="size-5 text-accent" aria-hidden="true" />
                <span>Địa chỉ giao hàng</span>
              </h2>

              <div>
                <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                  <label htmlFor="address-input" className="block text-xs font-medium text-fg-2">
                    Địa chỉ nhận hàng (kèm tên và số điện thoại người nhận nếu khác tài khoản) *
                  </label>
                  {me?.address && (
                    <button
                      type="button"
                      onClick={() => setValue('shippingAddress', me.address, { shouldValidate: true })}
                      className="text-xs text-accent underline hover:text-white"
                    >
                      Dùng địa chỉ mặc định
                    </button>
                  )}
                </div>
                <Textarea
                  id="address-input"
                  {...register('shippingAddress')}
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành..."
                  rows={3}
                  error={errors.shippingAddress?.message}
                />
              </div>

              <div className="rounded-xl border border-accent/40 bg-accent/5 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="adoptionPledge"
                    {...register('adoptionPledge')}
                    aria-invalid={Boolean(errors.adoptionPledge)}
                    aria-describedby={errors.adoptionPledge ? 'adoptionPledge-error' : undefined}
                    className="size-4.5 rounded border-line bg-surface text-accent focus:ring-accent mt-0.5"
                  />
                  <label htmlFor="adoptionPledge" className="text-xs text-fg-2 leading-relaxed cursor-pointer select-none">
                    <span className="font-semibold text-fg block text-sm mb-0.5">Cam kết chăm sóc sinh vật cảnh (bắt buộc)</span>
                    Tôi đã tìm hiểu điều kiện sống (nhiệt độ, độ ẩm, thức ăn) và có chỗ nuôi phù hợp cho cá thể này.
                  </label>
                </div>
                {errors.adoptionPledge && (
                  <p id="adoptionPledge-error" role="alert" className="text-xs text-red-400 pl-7">
                    {errors.adoptionPledge.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <ButtonLink to={backTo} variant="ghost" size="sm" className="gap-1.5 text-xs text-fg-3 hover:text-fg">
                <ArrowLeft className="size-3.5" aria-hidden="true" />
                <span>Quay lại</span>
              </ButtonLink>

              <Button type="submit" size="lg" pill variant="primary" className="gap-2 font-semibold">
                <span>Tiếp tục</span>
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </form>
        )}

        {/* BƯỚC 2: Xác nhận */}
        {!statusView && currentStep === 2 && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-line bg-surface-1/70 backdrop-blur-xl p-6 md:p-8 space-y-6 shadow-xl">
              <h2 className="text-lg font-bold text-fg border-b border-line/60 pb-3 flex items-center justify-between">
                <span>Danh sách cá thể</span>
                <span className="text-xs font-mono text-accent">{checkoutItems.length} sản phẩm</span>
              </h2>

              <ul className="divide-y divide-line/40">
                {checkoutItems.map((item) => (
                  <li key={item.productId} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        loading="lazy"
                        className="size-12 rounded-lg object-cover border border-line shrink-0"
                      />
                      <div>
                        <span className="font-semibold text-fg text-sm block">{item.productName}</span>
                        <span className="text-xs text-fg-3 font-mono">
                          {formatVnd(item.price)} × {item.quantity}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-fg text-sm">{formatVnd(item.lineTotal)}</span>
                  </li>
                ))}
              </ul>

              <div className="rounded-xl border border-line bg-surface-2/40 p-4 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-fg-3">Giao đến:</span>
                  <button type="button" onClick={() => setCurrentStep(1)} className="text-accent underline hover:text-white">
                    Thay đổi
                  </button>
                </div>
                <p className="text-fg-2 whitespace-pre-line">{shippingAddress}</p>
              </div>

              <div className="pt-4 border-t border-line/60 flex items-baseline justify-between">
                <span className="text-sm font-bold text-fg">Tổng tiền:</span>
                <Price amount={subtotal} size="lg" className="text-2xl text-accent" />
              </div>

              <div className="rounded-xl border border-line/60 bg-surface-2/30 p-3 text-xs text-fg-3 flex items-start gap-2">
                <ShieldCheck className="size-4 shrink-0 text-accent mt-0.5" aria-hidden="true" />
                <span>
                  Kho được kiểm tra lại khi đặt. Nếu một món đã hết, đơn sẽ không được tạo và giỏ hàng giữ nguyên.
                </span>
              </div>
            </div>

            {/* Phương thức thanh toán: chỉ hiển thị, hợp đồng API chưa có trường này */}
            <fieldset className="rounded-2xl border border-line bg-surface-1/70 backdrop-blur-xl p-6 md:p-8 space-y-4 shadow-xl">
              <legend className="sr-only">Phương thức thanh toán</legend>
              <h2 className="text-lg font-bold text-fg border-b border-line/60 pb-3 flex items-center gap-2" aria-hidden="true">
                <CreditCard className="size-5 text-accent" />
                <span>Phương thức thanh toán</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PAYMENT_OPTIONS.map((opt) => {
                  const checked = paymentMethod === opt.id;
                  return (
                    <label
                      key={opt.id}
                      className={`relative p-4 rounded-xl border cursor-pointer transition-all has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent ${
                        checked
                          ? 'border-accent bg-accent/10 shadow-[0_0_15px_rgba(110,231,183,0.15)]'
                          : 'border-line bg-surface-2/40 hover:bg-surface-2'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={opt.id}
                        checked={checked}
                        onChange={() => setPaymentMethod(opt.id)}
                        className="sr-only"
                      />
                      <span className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-fg text-sm">{opt.label}</span>
                        {checked && <CheckCircle2 className="size-4 text-accent" aria-hidden="true" />}
                      </span>
                      <span className="block text-xs text-fg-3">{opt.description}</span>
                    </label>
                  );
                })}
              </div>

              {paymentMethod === 'VIETQR' && <VietQRCard amount={subtotal} memo={transferMemo} />}
            </fieldset>

            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep(1)}
                className="gap-1.5 text-xs text-fg-3 hover:text-fg"
              >
                <ArrowLeft className="size-3.5" aria-hidden="true" />
                <span>Quay lại bước 1</span>
              </Button>

              <Button
                type="button"
                size="lg"
                pill
                variant="primary"
                onClick={handleFinalPlaceOrder}
                disabled={placeOrderMutation.isPending}
                aria-busy={placeOrderMutation.isPending}
                className="gap-2 font-bold shadow-[var(--glow-accent-btn)] min-w-[200px]"
              >
                {placeOrderMutation.isPending ? (
                  <div className="size-4 animate-spin rounded-full border-2 border-accent-ink border-t-transparent" aria-hidden="true" />
                ) : (
                  <Lock className="size-4" aria-hidden="true" />
                )}
                <span>{placeOrderMutation.isPending ? 'Đang tạo đơn hàng...' : 'Đặt hàng'}</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Dialog 409: món hết hàng hoặc ngừng bán lúc đặt */}
      <Dialog open={!!conflictError} onOpenChange={() => setConflictError(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="size-5 text-amber-400" aria-hidden="true" />
              <span>Không thể hoàn tất đơn hàng</span>
            </DialogTitle>
            <DialogDescription className="space-y-3 pt-2 text-fg-2 text-xs leading-relaxed">
              <span className="block">{conflictError}</span>
              <span className="block">Đơn hàng chưa được tạo, giỏ hàng và tồn kho giữ nguyên.</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="secondary" onClick={() => setConflictError(null)}>
              Đóng
            </Button>
            <ButtonLink to={backTo} variant="primary">
              {isDirectBuy ? 'Về trang sản phẩm' : 'Về giỏ hàng'}
            </ButtonLink>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
