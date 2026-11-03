import React from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Store, ArrowRight } from 'lucide-react';
import { PageContainer, PageHeader, Panel } from '@/components/layout/Page';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Skeleton } from '@/components/ui/Skeleton';
import { QueryErrorState } from '@/components/domain/QueryErrorState';
import { useMe } from '@/api/queries/useAuthQueries';
import { useApplySeller } from '@/api/mutations/useSellerMutations';
import { ApiError } from '@/api/errors';
import { toast } from 'sonner';
import { ShopStatusNotice } from './components/ShopStatusNotice';
import { FormPreview } from './components/FormPreview';

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
    return (
      <PageContainer className="space-y-6 py-12" role="status" aria-label="Đang tải hồ sơ">
        <Skeleton className="h-24 w-1/2" />
        <Skeleton className="h-96 w-full rounded-[20px]" />
      </PageContainer>
    );
  }

  if (isError || !me) {
    return (
      <PageContainer className="py-16">
        <QueryErrorState title="Không tải được hồ sơ tài khoản" error={error} onRetry={() => refetch()} isRetrying={isRefetching} />
      </PageContainer>
    );
  }

  // Đã có shop (mọi trạng thái): backend chỉ cho một hồ sơ mỗi tài khoản (409 SELLER_ALREADY_REGISTERED), nên không hiện form
  if (me.shop) {
    return <ShopStatusNotice shop={me.shop} context="apply" />;
  }

  return (
    <PageContainer className="pb-20">
      <PageHeader
        eyebrow="Mở shop"
        title="Đăng ký cửa hàng nhân giống"
        description="Gửi hồ sơ cơ sở và giấy phép. Ban Quản trị duyệt xong là bạn đăng bán được ngay."
      />

      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Panel className="md:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <Input
              id="shopName"
              label="Tên cửa hàng hoặc cơ sở nhân giống"
              required
              {...register('shopName')}
              placeholder="Ví dụ: BioGreen Exotic"
              error={errors.shopName?.message}
            />

            <Input
              id="businessLicenseUrl"
              label="Liên kết giấy phép nhân nuôi F2+ và kiểm dịch"
              required
              {...register('businessLicenseUrl')}
              placeholder="https://drive.google.com/file/d/.../view"
              error={errors.businessLicenseUrl?.message}
              helperText="Tài liệu PDF trực tuyến có dấu xác nhận của Chi cục Kiểm lâm hoặc giấy chứng nhận trại F2+."
            />

            <Textarea
              id="bio"
              label="Giới thiệu cơ sở và năng lực nhân giống"
              required
              {...register('bio')}
              rows={5}
              placeholder="Kinh nghiệm nhân giống, quy mô chuồng nuôi hoặc vườn ươm, quy trình phòng dịch..."
              error={errors.bio?.message}
            />

            <dl className="grid gap-4 border-t border-line pt-6 text-[15px] sm:grid-cols-2">
              <div>
                <dt className="text-sm text-fg-3">Số điện thoại liên hệ</dt>
                <dd className="mt-1 font-mono text-fg">{me.phone || 'Chưa có số điện thoại'}</dd>
              </div>
              <div>
                <dt className="text-sm text-fg-3">Địa chỉ cơ sở</dt>
                <dd className="mt-1 text-fg">{me.address || 'Chưa có địa chỉ'}</dd>
              </div>
            </dl>

            <p className="text-sm leading-relaxed text-fg-3">
              Khi nộp hồ sơ, bạn cam kết mọi cá thể bày bán là thế hệ F2+ sinh sản nhân tạo, không phải cá thể bắt từ tự nhiên.
            </p>

            <Button type="submit" size="lg" pill isLoading={applySellerMutation.isPending} className="w-full gap-2 sm:w-auto">
              <span>{applySellerMutation.isPending ? 'Đang gửi hồ sơ...' : 'Gửi hồ sơ thẩm định'}</span>
              {!applySellerMutation.isPending && <ArrowRight className="size-4" aria-hidden="true" />}
            </Button>
          </form>
        </Panel>

        <FormPreview>
          <Panel>
            <div className="flex items-center gap-3">
              <Store className="size-6 shrink-0 text-accent" aria-hidden="true" />
              <p className="min-w-0 truncate text-lg font-semibold text-fg">{formData.shopName || 'Tên cửa hàng của bạn'}</p>
            </div>
            <p className="mt-1 text-sm text-warm">Hồ sơ đang soạn</p>
            <p className="mt-4 line-clamp-4 text-[15px] leading-relaxed text-fg-2">
              {formData.bio || 'Phần giới thiệu cơ sở sẽ hiện ở đây.'}
            </p>
            <dl className="mt-5 divide-y divide-line border-t border-line text-sm">
              <div className="flex justify-between gap-3 py-2.5">
                <dt className="text-fg-3">Chủ cơ sở</dt>
                <dd className="truncate text-fg">{me.fullName}</dd>
              </div>
              <div className="flex justify-between gap-3 py-2.5">
                <dt className="text-fg-3">Điện thoại</dt>
                <dd className="font-mono text-fg">{me.phone || 'Chưa có'}</dd>
              </div>
            </dl>
          </Panel>
        </FormPreview>
      </div>
    </PageContainer>
  );
}
