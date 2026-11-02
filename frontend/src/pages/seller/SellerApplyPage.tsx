import React, { useEffect } from 'react';
import { Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Store, ShieldCheck, ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useMe } from '@/api/queries/useAuthQueries';
import { useApplySeller } from '@/api/mutations/useSellerMutations';
import { getStoredToken } from '@/api/authStore';
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
  const token = getStoredToken();
  const { data: me, isLoading } = useMe({ enabled: !!token });
  const applySellerMutation = useApplySeller();

  const {
    register,
    handleSubmit,
    watch,
    setError,
    setValue,
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

  // Điền sẵn dữ liệu cũ nếu shop bị từ chối REJECTED
  useEffect(() => {
    if (me?.shop) {
      if (me.shop.shopName) setValue('shopName', me.shop.shopName);
      if (me.shop.businessLicenseUrl) setValue('businessLicenseUrl', me.shop.businessLicenseUrl);
      if (me.shop.bio) setValue('bio', me.shop.bio);
    }
  }, [me, setValue]);

  const onSubmit = async (values: SellerApplyFormData) => {
    try {
      await applySellerMutation.mutateAsync({
        shopName: values.shopName.trim(),
        businessLicenseUrl: values.businessLicenseUrl.trim(),
        bio: values.bio.trim(),
      });

      toast.success('Gửi hồ sơ mở shop thành công! Ban Quản trị sẽ thẩm định trong 24-48 giờ.');
      window.location.hash = '#/account';
    } catch (err: any) {
      if (err.code === 'SELLER_SHOP_NAME_EXISTS') {
        setError('shopName', { type: 'server', message: 'Tên cửa hàng đã tồn tại trên hệ thống. Vui lòng chọn tên khác.' });
      } else if (err.code === 'SELLER_ALREADY_REGISTERED') {
        toast.error('Bạn đã đăng ký mở shop trước đó.');
      } else {
        toast.error(err.message || 'Không thể nộp hồ sơ.');
      }
    }
  };

  if (!token) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
        <Store className="size-12 text-fg-3 mb-3" />
        <h2 className="text-xl font-bold text-fg">Đăng nhập để đăng ký mở shop</h2>
        <Link to="/login?next=/seller/apply" className="mt-4">
          <Button variant="primary" pill>Đăng nhập ngay</Button>
        </Link>
      </div>
    );
  }

  if (isLoading || !me) {
    return <div className="h-64 rounded-2xl bg-surface animate-pulse max-w-4xl" />;
  }

  // Nếu shop đã ACTIVE -> điều hướng về /seller
  if (me.shop?.status === 'ACTIVE') {
    return (
      <div className="rounded-2xl border border-line bg-surface p-8 text-center max-w-lg mx-auto space-y-4">
        <Store className="size-12 text-accent mx-auto" />
        <h2 className="text-xl font-bold text-fg">Bạn đã sở hữu shop đang hoạt động</h2>
        <p className="text-xs text-fg-2">
          Cơ sở <span className="font-semibold text-accent">{me.shop.shopName}</span> đã được cấp chứng nhận kiểm định F2+.
        </p>
        <Link to="/seller">
          <Button variant="primary" pill className="gap-2">
            <span>Vào Bảng điều khiển Shop</span>
            <ArrowRight className="size-4" />
          </Button>
        </Link>
      </div>
    );
  }

  // Nếu shop đang PENDING -> hiển thị màn hình theo dõi
  if (me.shop?.status === 'PENDING') {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-surface-1/90 backdrop-blur-xl p-8 max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
            <Clock className="size-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-fg">Hồ sơ mở shop đang được thẩm định</h2>
            <p className="text-xs text-amber-300">Cơ sở: {me.shop.shopName}</p>
          </div>
        </div>

        <p className="text-xs text-fg-2 leading-relaxed">
          Ban Quản trị và Chuyên gia Sinh học BioNexus đang đối soát hồ sơ giấy phép CITES và kiểm định vệ sinh chuồng trại của bạn.
        </p>

        <div className="pt-4 border-t border-line/60">
          <Link to="/account">
            <Button variant="secondary" size="sm" pill>← Về trang tài khoản</Button>
          </Link>
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

        {/* Cột phải (40% Live Sticky Preview - "Paper Island"): Xem trước thẻ shop */}
        <aside className="lg:col-span-5 sticky top-24 space-y-4">
          <span className="text-xs uppercase font-mono font-bold tracking-wider text-accent block">
            Xem trước giao diện thẻ Shop (Live Preview)
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
