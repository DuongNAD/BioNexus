import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShieldCheck, AlertTriangle, ArrowRight, ArrowLeft, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Price } from '@/components/ui/Price';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { PageContainer, PageHeader, Panel } from '@/components/layout/Page';
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
import { cn } from '@/lib/cn';
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
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_380px]" role="status" aria-label="Đang tải thông tin đơn hàng">
        <Skeleton className="h-80 w-full rounded-[20px]" />
        <Skeleton className="h-64 w-full rounded-[20px]" />
      </div>
    );
  } else if (loadError) {
    statusView = (
      <QueryErrorState title="Không tải được thông tin đơn hàng" error={loadError} onRetry={() => refetch()} />
    );
  } else if (checkoutItems.length === 0) {
    statusView = (
      <EmptyState
        icon={<ShoppingBag aria-hidden="true" />}
        title={isDirectBuy ? 'Không tìm thấy sản phẩm' : 'Giỏ hàng đang trống'}
        description="Chưa có cá thể nào để đặt hàng. Hãy chọn sản phẩm trên sàn sinh vật cảnh."
        action={{ label: 'Vào sàn sinh vật cảnh', onClick: () => navigate('/products') }}
      />
    );
  } else if (blockingReason) {
    statusView = (
      <div
        role="alert"
        className="mx-auto flex max-w-xl flex-col items-center rounded-[20px] border border-dashed border-warm/40 px-6 py-12 text-center"
      >
        <AlertTriangle className="mb-4 size-8 text-warm" aria-hidden="true" />
        <h2 className="text-xl font-semibold tracking-[-0.02em] text-fg">Chưa thể đặt hàng</h2>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-fg-2">{blockingReason}</p>
        <ButtonLink to={backTo} pill className="mt-6">
          {isDirectBuy ? 'Về trang sản phẩm' : 'Về giỏ hàng để điều chỉnh'}
        </ButtonLink>
      </div>
    );
  }

  const steps = [
    { step: 1 as const, label: 'Địa chỉ giao hàng' },
    { step: 2 as const, label: 'Xác nhận đơn' },
  ];

  return (
    <PageContainer className="pb-20">
      <PageHeader
        breadcrumbs={[
          isDirectBuy
            ? { label: 'Sản phẩm', to: backTo }
            : { label: 'Giỏ hàng', to: '/cart' },
          { label: 'Đặt hàng' },
        ]}
        eyebrow={isDirectBuy ? 'Mua ngay' : 'Đặt cả giỏ hàng'}
        title="Xác nhận đặt hàng"
        description="Nhập địa chỉ nhận hàng, kiểm tra lại đơn rồi xác nhận. Tồn kho được kiểm tra lại đúng lúc đặt."
      />

      {statusView ?? (
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-10">
          <div className="min-w-0">
            {/* Thanh hai bước: vạch sáng dưới bước đang làm */}
            <ol className="mb-6 grid grid-cols-2 border-b border-line">
              {steps.map(({ step, label }) => {
                const active = currentStep === step;
                return (
                  <li key={step}>
                    <button
                      type="button"
                      disabled={step === 2 && currentStep === 1}
                      onClick={() => setCurrentStep(step)}
                      aria-current={active ? 'step' : undefined}
                      className={cn(
                        'relative flex w-full items-center gap-3 py-3 text-left text-sm transition-colors disabled:cursor-not-allowed',
                        active ? 'font-semibold text-fg' : 'text-fg-3 hover:text-fg',
                        active && 'after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-accent'
                      )}
                    >
                      <span
                        className={cn(
                          'flex size-7 shrink-0 items-center justify-center rounded-full font-mono text-sm',
                          active ? 'bg-accent text-accent-ink' : 'border border-line'
                        )}
                      >
                        {step}
                      </span>
                      <span>{label}</span>
                    </button>
                  </li>
                );
              })}
            </ol>

            {currentStep === 1 && (
              <form onSubmit={handleSubmit(onStep1Submit)} noValidate>
                <Panel className="space-y-6">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <label htmlFor="address-input" className="text-sm font-medium text-fg-2">
                        Địa chỉ nhận hàng
                      </label>
                      {me?.address && (
                        <button
                          type="button"
                          onClick={() => setValue('shippingAddress', me.address, { shouldValidate: true })}
                          className="text-sm text-accent underline underline-offset-2 hover:text-fg"
                        >
                          Dùng địa chỉ mặc định
                        </button>
                      )}
                    </div>
                    <Textarea
                      id="address-input"
                      {...register('shippingAddress')}
                      placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành. Ghi thêm tên và số điện thoại nếu người nhận khác bạn."
                      rows={3}
                      error={errors.shippingAddress?.message}
                    />
                  </div>

                  <div className="border-t border-line pt-5">
                    <label htmlFor="adoptionPledge" className="flex cursor-pointer items-start gap-3 select-none">
                      <input
                        type="checkbox"
                        id="adoptionPledge"
                        {...register('adoptionPledge')}
                        aria-invalid={Boolean(errors.adoptionPledge)}
                        aria-describedby={errors.adoptionPledge ? 'adoptionPledge-error' : undefined}
                        className="mt-0.5 size-4 shrink-0 accent-[var(--accent)]"
                      />
                      <span className="text-sm leading-relaxed text-fg-2">
                        <span className="block font-medium text-fg">Tôi cam kết chăm sóc cá thể này</span>
                        Tôi đã tìm hiểu điều kiện sống (nhiệt độ, độ ẩm, thức ăn) và có chỗ nuôi phù hợp.
                      </span>
                    </label>
                    {errors.adoptionPledge && (
                      <p id="adoptionPledge-error" role="alert" className="mt-2 pl-7 text-sm text-danger">
                        {errors.adoptionPledge.message}
                      </p>
                    )}
                  </div>
                </Panel>

                <div className="mt-6 flex items-center justify-between gap-3">
                  <ButtonLink to={backTo} variant="ghost" pill className="gap-1.5">
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    <span>Quay lại</span>
                  </ButtonLink>
                  <Button type="submit" size="lg" pill className="gap-2">
                    <span>Tiếp tục</span>
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              </form>
            )}

            {currentStep === 2 && (
              <>
                <Panel className="divide-y divide-line [&>*]:py-5 [&>*:first-child]:pt-0 [&>*:last-child]:pb-0">
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="font-semibold text-fg">Giao đến</h2>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-sm text-accent underline underline-offset-2 hover:text-fg"
                      >
                        Thay đổi
                      </button>
                    </div>
                    <p className="mt-2 whitespace-pre-line text-fg-2">{shippingAddress}</p>
                  </div>

                  {/* Phương thức thanh toán chỉ để hiển thị: hợp đồng API chưa có trường này */}
                  <fieldset>
                    <legend className="font-semibold text-fg">Phương thức thanh toán</legend>
                    <div className="mt-3 divide-y divide-line">
                      {PAYMENT_OPTIONS.map((opt) => {
                        const checked = paymentMethod === opt.id;
                        return (
                          <label
                            key={opt.id}
                            className="flex cursor-pointer items-start gap-3 py-3 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent"
                          >
                            <input
                              type="radio"
                              name="paymentMethod"
                              value={opt.id}
                              checked={checked}
                              onChange={() => setPaymentMethod(opt.id)}
                              className="mt-1 size-4 shrink-0 accent-[var(--accent)]"
                            />
                            <span>
                              <span className={cn('block', checked ? 'font-semibold text-fg' : 'text-fg-2')}>
                                {opt.label}
                              </span>
                              <span className="block text-sm text-fg-3">{opt.description}</span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    {paymentMethod === 'VIETQR' && (
                      <div className="mt-4">
                        <VietQRCard amount={subtotal} memo={transferMemo} />
                      </div>
                    )}
                  </fieldset>
                </Panel>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  <Button type="button" variant="ghost" pill onClick={() => setCurrentStep(1)} className="gap-1.5">
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    <span>Quay lại bước 1</span>
                  </Button>
                  <Button
                    type="button"
                    size="lg"
                    pill
                    onClick={handleFinalPlaceOrder}
                    isLoading={placeOrderMutation.isPending}
                    className="min-w-[200px] gap-2"
                  >
                    {placeOrderMutation.isPending ? 'Đang tạo đơn hàng...' : 'Đặt hàng'}
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Tóm tắt đơn luôn nhìn thấy ở cả hai bước */}
          <aside className="lg:sticky lg:top-24">
            <Panel>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold tracking-[-0.02em] text-fg">Đơn hàng</h2>
                <span className="text-sm text-fg-3">{checkoutItems.length} sản phẩm</span>
              </div>
              <ul className="mt-4 divide-y divide-line">
                {checkoutItems.map((item) => (
                  <li key={item.productId} className="flex items-center gap-3 py-3">
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      loading="lazy"
                      className="size-14 shrink-0 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-medium text-fg">{item.productName}</p>
                      <p className="text-sm text-fg-3">
                        <span className="font-mono">{formatVnd(item.price)}</span> ×{' '}
                        <span className="font-mono">{item.quantity}</span>
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-sm text-fg">{formatVnd(item.lineTotal)}</span>
                  </li>
                ))}
              </ul>
              <dl className="mt-2 space-y-3 border-t border-line pt-4 text-sm">
                <div className="flex justify-between text-fg-2">
                  <dt>Vận chuyển</dt>
                  <dd className="text-success">Miễn phí</dd>
                </div>
                <div className="flex items-baseline justify-between">
                  <dt className="font-semibold text-fg">Tổng thanh toán</dt>
                  <dd>
                    <Price amount={subtotal} size="lg" className="text-2xl text-fg" />
                  </dd>
                </div>
              </dl>
              <p className="mt-4 flex items-start gap-2 text-sm text-fg-3">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                <span>Nếu có món vừa hết hàng, đơn sẽ không được tạo và giỏ hàng giữ nguyên.</span>
              </p>
            </Panel>
          </aside>
        </div>
      )}

      {/* Dialog 409: món hết hàng hoặc ngừng bán lúc đặt */}
      <Dialog open={!!conflictError} onOpenChange={() => setConflictError(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-warm" aria-hidden="true" />
              <span>Không thể hoàn tất đơn hàng</span>
            </DialogTitle>
            <DialogDescription className="space-y-2 pt-2 leading-relaxed text-fg-2">
              <span className="block">{conflictError}</span>
              <span className="block">Đơn hàng chưa được tạo, giỏ hàng và tồn kho giữ nguyên.</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="secondary" pill onClick={() => setConflictError(null)}>
              Đóng
            </Button>
            <ButtonLink to={backTo} pill>
              {isDirectBuy ? 'Về trang sản phẩm' : 'Về giỏ hàng'}
            </ButtonLink>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
