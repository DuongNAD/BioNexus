import React from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Store, ShieldCheck, ArrowRight, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { ButtonLink } from '@/components/domain/ButtonLink';
import { QueryErrorState } from '@/components/domain/QueryErrorState';
import { useMe } from '@/api/queries/useAuthQueries';
import { useApplySeller } from '@/api/mutations/useSellerMutations';
import { ApiError } from '@/api/errors';
import { toast } from 'sonner';

const sellerApplySchema = z.object({
  shopName: z
    .string()
    .min(3, 'Tên cửa hàng phải có ít nhất 3 ký tự')
    .max(50, 'Tên cửa hàng không được vượt quá 50 ký tự'),
  businessLicenseUrl: z
    .string()
    .min(5, 'Vui lòng cung cấp liên kết tài liệu giấy phép F2+ CITES')
    .url('Đường dẫn giấy phép phải là URL hợp lệ (ví dụ: https://drive.google.com/...)'),
  bio: z
    .string()
    .min(20, 'Mô tả cơ sở nhân giống cần tối thiểu 20 ký tự')
    .max(500, 'Mô tả cơ sở không được vượt quá 500 ký tự'),
});

type SellerApplyFormData = z.infer<typeof sellerApplySchema>;

export default function SellerApplyPage(): React.JSX.Element {
  const navigate = useNavigate();
  // Route đã bọc RequireAuth nên ở đây luôn là tài khoản USER
  const { data: me, isLoading, isError, error, refetch, isRefetching } = useMe();
  const applySellerMutation = useApplySeller();

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<SellerApplyFormData>({
    resolver: zodResolver(sellerApplySchema),
    defaultValues: {
      shopName: '',
      businessLicenseUrl: '',
      bio: '',
    },
  });

  const formData = watch();

  const onSubmit = async (values: SellerApplyFormData) => {
    try {
      await applySellerMutation.mutateAsync({
        shopName: values.shopName.trim(),
        businessLicenseUrl: values.businessLicenseUrl.trim(),
        bio: values.bio.trim(),
      });

      toast.success('Đã gửi hồ sơ mở shop. Ban Quản trị sẽ thẩm định giấy phép của bạn.');
      navigate('/account');
    } catch (err) {
      const code = err instanceof ApiError ? err.code : '';
      if (code === 'SELLER_SHOP_NAME_EXISTS') {
        setError('shopName', { type: 'server', message: 'Tên cửa hàng đã tồn tại trên hệ thống. Vui lòng chọn tên khác.' });
      } else if (code === 'SELLER_ALREADY_REGISTERED') {
        toast.error('Bạn đã đăng ký mở shop trước đó.');
        void refetch();
      } else {
        toast.error(err instanceof Error && err.message ? err.message : 'Không thể nộp hồ sơ.');
      }
    }
  };

  if (isLoading) {
    return <div className="h-64 rounded-2xl bg-surface animate-pulse max-w-4xl" role="status" aria-label="Đang tải hồ sơ" />;
  }

  if (isError || !me) {
    return (
      <QueryErrorState
        title="Không tải được hồ sơ tài khoản"
        error={error}
        onRetry={() => refetch()}
        isRetrying={isRefetching}
      />
    );
  }

  // Nếu shop đã ACTIVE -> điều hướng về /seller
  if (me.shop?.status === 'ACTIVE') {
    return (
      <div className="rounded-2xl border border-line bg-surface p-8 text-center max-w-lg mx-auto space-y-4">
        <Store className="size-12 text-accent mx-auto" aria-hidden="true" />
        <h1 className="text-xl font-bold text-fg">Bạn đã sở hữu shop đang hoạt động</h1>
        <p className="text-sm text-fg-2">
          Cơ sở <span className="font-semibold text-accent">{me.shop.shopName}</span> đã được Ban Quản trị duyệt.
        </p>
        <ButtonLink to="/seller" variant="primary" pill className="gap-2">
          <span>Vào Bảng điều khiển Shop</span>
          <ArrowRight className="size-4" aria-hidden="true" />
        </ButtonLink>
      </div>
    );
  }

  // Nếu shop đang PENDING -> hiển thị màn hình theo dõi
  if (me.shop?.status === 'PENDING') {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-surface-1/90 backdrop-blur-xl p-8 max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
            <Clock className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-fg">Hồ sơ mở shop đang được thẩm định</h1>
            <p className="text-xs text-amber-300">Cơ sở: {me.shop.shopName}</p>
          </div>
        </div>

        <p className="text-sm text-fg-2 leading-relaxed">
          Ban Quản trị BioNexus đang kiểm tra giấy phép kinh doanh của bạn. Bạn sẽ đăng bán được ngay khi shop được duyệt.
        </p>

        <div className="pt-4 border-t border-line/60">
          <ButtonLink to="/account" variant="secondary" size="sm" pill>
            ← Về trang tài khoản
          </ButtonLink>
        </div>
      </div>
    );
  }

  // Shop bị từ chối hoặc bị khóa: backend chỉ cho một hồ sơ mỗi tài khoản (409 SELLER_ALREADY_REGISTERED), nên không hiện form
  if (me.shop) {
    const isBanned = me.shop.status === 'BANNED';
    return (
      <div className="rounded-2xl border border-danger/30 bg-surface-1/90 backdrop-blur-xl p-8 max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-danger/15 text-danger flex items-center justify-center">
            <XCircle className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-fg">
              {isBanned ? 'Shop của bạn đang bị khóa' : 'Hồ sơ mở shop chưa được duyệt'}
            </h1>
            <p className="text-sm text-fg-2">Cơ sở: {me.shop.shopName}</p>
          </div>
        </div>
        <p className="text-sm text-fg-2 leading-relaxed">
          Mỗi tài khoản chỉ có một hồ sơ shop. Vui lòng liên hệ Ban Quản trị BioNexus để được hướng dẫn xử lý.
        </p>
        <div className="pt-4 border-t border-line/60">
          <ButtonLink to="/account" variant="secondary" size="sm" pill>
            ← Về trang tài khoản
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-fg font-sans">
          Đăng Ký Cửa Hàng & Cơ Sở Nhân Giống
        </h1>
        <p className="mt-1 text-xs text-fg-3">
          Gia nhập mạng lưới trại nhân giống sinh thái F2+ có kiểm định nguồn gen tại BioNexus
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cột trái (60% Form): Form nộp hồ sơ */}
        <div className="lg:col-span-7 space-y-6">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="rounded-2xl border border-line bg-surface-1/70 backdrop-blur-xl p-6 md:p-8 shadow-xl space-y-5"
          >
            <div>
              <label htmlFor="shopName" className="block text-xs font-medium text-fg-2 mb-1.5">
                Tên cửa hàng / Tên cơ sở nhân giống *
              </label>
              <Input
                id="shopName"
                {...register('shopName')}
                placeholder="Ví dụ: BioGreen Exotic Reptiles"
                error={errors.shopName?.message}
                className="text-xs"
              />
            </div>

            <div>
              <label htmlFor="businessLicenseUrl" className="block text-xs font-medium text-fg-2 mb-1.5">
                Liên kết Giấy phép nhân nuôi F2+ CITES & Kiểm dịch thú y *
              </label>
              <Input
                id="businessLicenseUrl"
                {...register('businessLicenseUrl')}
                placeholder="https://drive.google.com/file/d/.../view"
                error={errors.businessLicenseUrl?.message}
                className="text-xs"
              />
              <p className="mt-1 text-[11px] text-fg-3">
                Nhập liên kết tài liệu trực tuyến (PDF). Hồ sơ hợp lệ cần có dấu xác nhận của Chi cục Kiểm lâm hoặc giấy chứng nhận trang trại F2+.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="block text-xs font-medium text-fg-2 mb-1.5">Số điện thoại hotline cơ sở:</span>
                <span className="block text-xs font-mono text-fg bg-surface-2 p-2.5 rounded-xl border border-line">
                  {me.phone || 'Chưa có SĐT'}
                </span>
              </div>

              <div>
                <span className="block text-xs font-medium text-fg-2 mb-1.5">Địa chỉ trang trại / vườn ươm:</span>
                <span className="block text-xs text-fg bg-surface-2 p-2.5 rounded-xl border border-line truncate">
                  {me.address || 'Chưa có địa chỉ'}
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="bio" className="block text-xs font-medium text-fg-2 mb-1.5">
                Giới thiệu cơ sở & Năng lực nhân giống *
              </label>
              <Textarea
                id="bio"
                {...register('bio')}
                rows={4}
                placeholder="Mô tả kinh nghiệm nhân giống, quy mô chuồng nuôi / vườn ươm, quy trình phòng dịch và điều kiện kiểm soát cá thể..."
                error={errors.bio?.message}
                className="text-xs"
              />
            </div>

            <div className="rounded-xl border border-line/60 bg-surface-2/40 p-3.5 text-xs text-fg-3 flex items-start gap-2.5">
              <ShieldCheck className="size-4 text-accent shrink-0 mt-0.5" />
              <span>
                Bằng việc nộp hồ sơ, bạn cam kết 100% cá thể bày bán trên BioNexus là thế hệ F2+ sinh sản nhân tạo, không buôn bán cá thể đánh bắt từ tự nhiên.
              </span>
            </div>

            <Button
              type="submit"
              size="lg"
              pill
              variant="primary"
              disabled={applySellerMutation.isPending}
              className="w-full gap-2 font-bold shadow-[var(--glow-accent-btn)]"
            >
              {applySellerMutation.isPending ? (
                <div className="size-4 animate-spin rounded-full border-2 border-accent-ink border-t-transparent" />
              ) : (
                <ArrowRight className="size-4" />
              )}
              <span>{applySellerMutation.isPending ? 'Đang gửi hồ sơ...' : 'Gửi hồ sơ thẩm định cơ sở'}</span>
            </Button>
          </form>
        </div>

        {/* Cột phải (40%, dính, kiểu "paper island"): xem trước thẻ shop */}
        <aside className="lg:col-span-5 sticky top-24 space-y-4">
          <span className="text-xs uppercase font-mono font-bold tracking-wider text-accent block">
            Xem trước thẻ shop
          </span>

          <div className="rounded-2xl border border-accent/40 bg-surface-1/90 backdrop-blur-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-line/60 pb-4">
              <div className="size-12 rounded-2xl border border-accent/40 bg-accent/15 flex items-center justify-center text-accent">
                <Store className="size-6" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-fg text-base truncate font-sans">
                  {formData.shopName || 'Tên cửa hàng của bạn'}
                </h3>
                <span className="text-[11px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 inline-block mt-0.5">
                  Hồ sơ đang soạn thảo
                </span>
              </div>
            </div>

            <p className="text-xs text-fg-2 leading-relaxed italic line-clamp-3">
              "{formData.bio || 'Mô tả giới thiệu trang trại của bạn sẽ xuất hiện tại đây khi nộp hồ sơ...'}"
            </p>

            <div className="pt-2 border-t border-line/40 text-xs text-fg-3 space-y-1">
              <div>Chủ cơ sở: <span className="text-fg font-medium">{me.fullName}</span></div>
              <div>Hotline: <span className="font-mono text-fg">{me.phone}</span></div>
              <div className="truncate">Địa chỉ: <span className="text-fg truncate">{me.address}</span></div>
            </div>

            <div className="rounded-xl border border-line bg-surface-2/60 p-3 text-[11px] text-accent flex items-center gap-2">
              <ShieldCheck className="size-4 shrink-0" />
              <span>Cam kết 100% cá thể sinh sản nhân tạo F2+</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
