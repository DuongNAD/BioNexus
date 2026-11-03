import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { Package, CheckCircle2, XCircle, RotateCcw, SearchX, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Price } from '@/components/ui/Price';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusPill } from '@/components/ui/StatusPill';
import { PageContainer, PageHeader, Panel, Section } from '@/components/layout/Page';
import { CelebrationConfetti, AnimatedCheckmark } from '@/components/domain/CelebrationConfetti';
import { ButtonLink } from '@/components/domain/ButtonLink';
import { QueryErrorState } from '@/components/domain/QueryErrorState';
import { useOrderDetail } from '@/api/queries/useOrderQueries';
import { productDetailQueryOptions } from '@/api/queries/useProductQueries';
import { useAddToCart } from '@/api/mutations/useCartMutations';
import { resolveProductImage } from '@/api/adapters';
import { ApiError } from '@/api/errors';
import { formatVnd } from '@/lib/parseEnvironmentSpecs';
import { cn } from '@/lib/cn';
import { formatOrderDate } from './OrdersPage';
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
      <PageContainer className="space-y-4 pt-10" role="status" aria-label="Đang tải đơn hàng">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-32 w-full rounded-[20px]" />
        <Skeleton className="h-64 w-full rounded-[20px]" />
      </PageContainer>
    );
  }

  // Chỉ 404 mới là "không tìm thấy" (đơn của người khác backend cũng trả 404); lỗi mạng hay 500 thì cho thử lại
  const isNotFound = (isError && error instanceof ApiError && (error.status === 404 || error.status === 400)) || (!isError && !order);
  if (isError && !isNotFound) {
    return (
      <PageContainer className="pt-10">
        <QueryErrorState
          title="Không tải được chi tiết đơn hàng"
          error={error}
          onRetry={() => refetch()}
          isRetrying={isRefetching}
        />
      </PageContainer>
    );
  }

  if (isNotFound || !order) {
    return (
      <PageContainer className="flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
        <SearchX className="mb-5 size-10 text-accent" aria-hidden="true" />
        <h1 className="text-2xl font-semibold tracking-[-0.03em] text-fg md:text-3xl">Không tìm thấy đơn hàng</h1>
        <p className="mt-3 max-w-md text-fg-2">Đơn này không tồn tại hoặc không thuộc tài khoản của bạn.</p>
        <ButtonLink to="/orders" pill className="mt-8">
          Về danh sách đơn hàng
        </ButtonLink>
      </PageContainer>
    );
  }

  const isCancelled = order.status === 'CANCELLED';
  const isCompleted = order.status === 'COMPLETED';
  const code = order.orderCode || `#${order.id}`;

  // Tài liệu 03 mục 10: Đã đặt → Đang xử lý → Hoàn tất hoặc Đã hủy
  const timeline: { label: string; hint: string; state: 'done' | 'current' | 'todo' | 'cancelled' }[] = [
    { label: 'Đã đặt hàng', hint: formatOrderDate(order.createdAt), state: 'done' },
    {
      label: 'Đang xử lý',
      hint: 'Cửa hàng chuẩn bị cá thể',
      state: isCancelled || isCompleted ? 'done' : 'current',
    },
    isCancelled
      ? { label: 'Đã hủy', hint: 'Đơn đã kết thúc', state: 'cancelled' }
      : { label: 'Hoàn tất', hint: 'Người mua đã nhận cá thể', state: isCompleted ? 'done' : 'todo' },
  ];

  return (
    <PageContainer>
      {showCelebration && <CelebrationConfetti />}

      <PageHeader
        breadcrumbs={[{ label: 'Đơn hàng của tôi', to: '/orders' }, { label: code }]}
        eyebrow="Chi tiết đơn hàng"
        title={<span className="font-mono tracking-[-0.02em]">{code}</span>}
        meta={
          <>
            <StatusPill status={order.status} size="md" />
            <span>Đặt lúc {formatOrderDate(order.createdAt)}</span>
          </>
        }
        actions={
          <Button
            pill
            variant="secondary"
            onClick={handleReorder}
            disabled={isReordering}
            aria-busy={isReordering}
            className="gap-2"
          >
            <RotateCcw className={cn('size-4', isReordering && 'animate-spin')} aria-hidden="true" />
            <span>{isReordering ? 'Đang thêm vào giỏ...' : 'Mua lại'}</span>
          </Button>
        }
      />

      {showCelebration && (
        <div
          role="status"
          className="relative mb-8 flex items-center gap-4 rounded-[20px] border border-accent/40 bg-accent/10 p-5 pr-12"
        >
          <AnimatedCheckmark size={44} className="shrink-0" />
          <div>
            <p className="font-semibold text-fg">Đặt hàng thành công</p>
            <p className="mt-0.5 text-sm text-fg-2">
              Cửa hàng đã nhận đơn <span className="font-mono text-fg">{code}</span> và đang chuẩn bị cá thể cho bạn.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDismissCelebration}
            className="absolute top-3 right-3 rounded-full p-1.5 text-fg-3 hover:bg-surface-2 hover:text-fg"
            aria-label="Đóng thông báo"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Tiến độ: ba mốc trên một dòng, vạch nối giữa các mốc */}
      <Section as="h2" title="Tiến độ" className="pt-0 md:pt-0">
        <ol className="grid gap-4 sm:grid-cols-3">
          {timeline.map((step, i) => (
            <li
              key={step.label}
              aria-current={step.state === 'current' || (step.state === 'cancelled' && i === 2) ? 'step' : undefined}
              className={cn(
                'border-t-2 pt-3',
                step.state === 'done' && 'border-accent',
                step.state === 'current' && 'border-warm',
                step.state === 'cancelled' && 'border-danger',
                step.state === 'todo' && 'border-line'
              )}
            >
              <p
                className={cn(
                  'flex items-center gap-2 font-semibold',
                  step.state === 'todo' ? 'text-fg-3' : 'text-fg'
                )}
              >
                {step.state === 'cancelled' ? (
                  <XCircle className="size-4 text-danger" aria-hidden="true" />
                ) : step.state === 'done' ? (
                  <CheckCircle2 className="size-4 text-accent" aria-hidden="true" />
                ) : step.state === 'current' ? (
                  <Package className="size-4 text-warm" aria-hidden="true" />
                ) : null}
                {step.label}
              </p>
              <p className="mt-1 text-sm text-fg-3">{step.hint}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section as="h2" title="Cá thể đã đặt" className="pb-16">
        <Panel padded={false} className="overflow-hidden">
          <ul className="divide-y divide-line">
            {(order.items || []).map((item) => (
              <li key={item.productId} className="flex items-center gap-4 px-5 py-4 md:px-6">
                <img
                  src={resolveProductImage(item.imageUrl)}
                  alt={item.productName}
                  loading="lazy"
                  className="size-16 shrink-0 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/products/${item.productId}`}
                    className="line-clamp-2 font-semibold text-fg transition-colors hover:text-accent"
                  >
                    {item.productName}
                  </Link>
                  <p className="mt-0.5 text-sm text-fg-3">
                    Giá lúc mua <span className="font-mono">{formatVnd(item.unitPrice)}</span> ×{' '}
                    <span className="font-mono">{item.quantity}</span>
                  </p>
                </div>
                <span className="shrink-0 font-mono text-fg">{formatVnd(item.lineTotal)}</span>
              </li>
            ))}
          </ul>

          <div className="grid gap-6 border-t border-line px-5 py-5 sm:grid-cols-2 md:px-6">
            <div>
              <p className="text-sm text-fg-3">Giao đến</p>
              <p className="mt-1 text-fg-2">{order.shippingAddress}</p>
            </div>
            <dl className="space-y-2 text-sm sm:text-right">
              <div className="flex justify-between gap-4 text-fg-2 sm:justify-end">
                <dt>Vận chuyển</dt>
                <dd className="text-success">Miễn phí</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 sm:justify-end">
                <dt className="font-semibold text-fg">Tổng thanh toán</dt>
                <dd>
                  <Price amount={order.totalAmount} size="lg" className="text-2xl text-fg" />
                </dd>
              </div>
            </dl>
          </div>
        </Panel>
      </Section>
    </PageContainer>
  );
}
