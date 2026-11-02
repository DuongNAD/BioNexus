import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRegister } from '@/api/mutations/useAuthMutations';
import { toast } from 'sonner';

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(4, 'Tên đăng nhập phải có ít nhất 4 ký tự')
      .max(30, 'Tên đăng nhập tối đa 30 ký tự')
      .regex(/^[a-z0-9_]+$/, 'Tên đăng nhập chỉ gồm chữ thường không dấu, số và dấu gạch dưới (_)'),
    password: z
      .string()
      .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
      .max(50, 'Mật khẩu tối đa 50 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận lại mật khẩu'),
    fullName: z
      .string()
      .min(2, 'Họ và tên phải có ít nhất 2 ký tự')
      .max(60, 'Họ và tên tối đa 60 ký tự'),
    email: z
      .string()
      .min(1, 'Vui lòng nhập địa chỉ email')
      .email('Địa chỉ email không đúng định dạng (ví dụ: bionexus@domain.com)'),
    phone: z
      .string()
      .regex(/^(0|\+84)\d{9}$/, 'Số điện thoại Việt Nam hợp lệ gồm 10 chữ số (bắt đầu bằng 0 hoặc +84)'),
    address: z.string().min(5, 'Địa chỉ giao hàng mặc định phải có ít nhất 5 ký tự'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp với mật khẩu đã nhập',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage(): React.JSX.Element {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const nextUrl = searchParams.get('next');

  const [showPassword, setShowPassword] = useState(false);
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      email: '',
      phone: '',
      address: '',
    },
  });

  const passwordVal = watch('password') || '';

  // Tính điểm độ mạnh mật khẩu (1 - 4)
  const passwordStrength = useMemo(() => {
    if (!passwordVal) return 0;
    let score = 0;
    if (passwordVal.length >= 8) score += 1;
    if (/[a-z]/.test(passwordVal) && /[A-Z]/.test(passwordVal)) score += 1;
    if (/\d/.test(passwordVal)) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(passwordVal)) score += 1;
    return score;
  }, [passwordVal]);

  const strengthLabels = ['Rất yếu', 'Yếu', 'Trung bình', 'Mạnh', 'Tuyệt vời'];
  const strengthColors = ['bg-surface-2', 'bg-red-500', 'bg-amber-500', 'bg-accent', 'bg-emerald-400'];

  const onSubmit = async (values: RegisterFormData) => {
    try {
      await registerMutation.mutateAsync({
        username: values.username.trim(),
        password: values.password,
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        address: values.address.trim(),
      });

      toast.success('Đăng ký tài khoản thành công! Chào mừng bạn gia nhập BioNexus.');

      // Chuyển hướng sang chuyến đi làm quen sau khi đăng ký (trừ khi có ?next= hợp lệ)
      if (nextUrl && nextUrl.startsWith('/') && !nextUrl.startsWith('//')) {
        navigate(nextUrl, { replace: true });
      } else {
        navigate('/tham-hiem?chao-mung=1', { replace: true });
      }
    } catch (err: any) {
      if (err.code === 'USER_USERNAME_EXISTS') {
        setError('username', { type: 'server', message: 'Tên đăng nhập đã tồn tại trên hệ thống' });
      } else if (err.code === 'USER_EMAIL_EXISTS') {
        setError('email', { type: 'server', message: 'Email đã được đăng ký cho tài khoản khác' });
      } else {
        toast.error(err.message || 'Đăng ký không thành công.');
      }
    }
  };

  return (
    <div className="rounded-2xl border border-line bg-surface-1/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-fg font-sans">
          Đăng Ký Thành Viên
        </h1>
        <p className="mt-1 text-xs text-fg-2">
          Gia nhập cộng đồng bảo tồn và sở hữu sinh vật cảnh F2+ hợp pháp
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Họ và tên & Tên đăng nhập */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="reg-fullname" className="block text-xs font-medium text-fg-2 mb-1">
              Họ và tên *
            </label>
            <Input
              id="reg-fullname"
              {...register('fullName')}
              placeholder="Nguyễn Văn A"
              className="text-xs"
              error={errors.fullName?.message}
            />
          </div>

          <div>
            <label htmlFor="reg-username" className="block text-xs font-medium text-fg-2 mb-1">
              Tên đăng nhập *
            </label>
            <Input
              id="reg-username"
              {...register('username')}
              placeholder="nguyenvana"
              className="text-xs"
              error={errors.username?.message}
            />
          </div>
        </div>

        {/* Email & Số điện thoại */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="reg-email" className="block text-xs font-medium text-fg-2 mb-1">
              Địa chỉ Email *
            </label>
            <Input
              id="reg-email"
              type="email"
              {...register('email')}
              placeholder="vana@gmail.com"
              className="text-xs"
              error={errors.email?.message}
            />
          </div>

          <div>
            <label htmlFor="reg-phone" className="block text-xs font-medium text-fg-2 mb-1">
              Số điện thoại *
            </label>
            <Input
              id="reg-phone"
              {...register('phone')}
              placeholder="0912345678"
              className="text-xs"
              error={errors.phone?.message}
            />
          </div>
        </div>

        {/* Mật khẩu & Xác nhận mật khẩu */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="reg-password" className="block text-xs font-medium text-fg-2 mb-1">
              Mật khẩu *
            </label>
            <div className="relative">
              <Input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder="Tối thiểu 6 ký tự"
                className="pr-8 text-xs"
                error={errors.password?.message}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-fg-3 hover:text-fg"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="reg-confirmpass" className="block text-xs font-medium text-fg-2 mb-1">
              Xác nhận mật khẩu *
            </label>
            <Input
              id="reg-confirmpass"
              type={showPassword ? 'text' : 'password'}
              {...register('confirmPassword')}
              placeholder="Nhập lại mật khẩu"
              className="text-xs"
              error={errors.confirmPassword?.message}
            />
          </div>
        </div>

        {/* Thanh đo độ mạnh mật khẩu 4 cấp độ */}
        {passwordVal && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-fg-3">Độ mạnh mật khẩu:</span>
              <span className="font-mono font-semibold text-fg">
                {strengthLabels[passwordStrength]}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 h-1.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-colors ${
                    i < passwordStrength ? strengthColors[passwordStrength] : 'bg-surface-2'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Địa chỉ giao hàng mặc định */}
        <div>
          <label htmlFor="reg-address" className="block text-xs font-medium text-fg-2 mb-1">
            Địa chỉ giao hàng mặc định *
          </label>
          <Input
            id="reg-address"
            {...register('address')}
            placeholder="Số nhà, tên đường, quận/huyện, tỉnh/thành..."
            className="text-xs"
            error={errors.address?.message}
          />
        </div>

        <Button
          type="submit"
          size="lg"
          pill
          variant="primary"
          disabled={registerMutation.isPending}
          className="w-full gap-2 font-bold shadow-[var(--glow-accent-btn)] mt-4"
        >
          {registerMutation.isPending ? (
            <div className="size-4 animate-spin rounded-full border-2 border-accent-ink border-t-transparent" />
          ) : (
            <ArrowRight className="size-4" />
          )}
          <span>{registerMutation.isPending ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản'}</span>
        </Button>
      </form>

      <div className="pt-2 border-t border-line/60 flex items-center justify-between text-xs text-fg-3">
        <span>Đã có tài khoản BioNexus?</span>
        <Link to="/login" className="text-accent hover:underline font-semibold">
          Đăng nhập ngay →
        </Link>
      </div>
    </div>
  );
}
