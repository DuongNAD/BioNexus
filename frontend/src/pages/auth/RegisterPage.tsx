import React, { useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRegister } from '@/api/mutations/useAuthMutations';
import { toast } from 'sonner';
import { AuthCard, PasswordField } from './components/AuthCard';

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
    <AuthCard
      eyebrow="Thành viên mới"
      title="Tạo tài khoản"
      description="Gia nhập cộng đồng nuôi sinh vật cảnh nhân giống hợp pháp của BioNexus."
      footer={
        <p>
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-medium text-accent hover:underline">
            Đăng nhập
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <Input id="reg-fullname" label="Họ và tên" required {...register('fullName')} placeholder="Nguyễn Văn A" autoComplete="name" error={errors.fullName?.message} />
          <Input id="reg-username" label="Tên đăng nhập" required {...register('username')} placeholder="nguyenvana" autoComplete="username" error={errors.username?.message} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Input id="reg-email" label="Email" required type="email" {...register('email')} placeholder="vana@gmail.com" autoComplete="email" error={errors.email?.message} />
          <Input id="reg-phone" label="Số điện thoại" required {...register('phone')} placeholder="0912345678" autoComplete="tel" error={errors.phone?.message} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <PasswordField id="reg-password" label="Mật khẩu" required {...register('password')} placeholder="Tối thiểu 6 ký tự" autoComplete="new-password" error={errors.password?.message} />
          <Input
            id="reg-confirmpass"
            label="Nhập lại mật khẩu"
            required
            type="password"
            {...register('confirmPassword')}
            placeholder="Nhập lại mật khẩu"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
          />
        </div>

        {/* Thanh đo độ mạnh mật khẩu 4 cấp */}
        {passwordVal && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-fg-3">Độ mạnh mật khẩu</span>
              <span className="text-fg">{strengthLabels[passwordStrength]}</span>
            </div>
            <div className="grid h-1.5 grid-cols-4 gap-1.5" aria-hidden="true">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-colors ${i < passwordStrength ? strengthColors[passwordStrength] : 'bg-surface-2'}`}
                />
              ))}
            </div>
          </div>
        )}

        <Input
          id="reg-address"
          label="Địa chỉ giao hàng mặc định"
          required
          {...register('address')}
          placeholder="Số nhà, đường, quận/huyện, tỉnh/thành"
          autoComplete="street-address"
          error={errors.address?.message}
        />

        <Button type="submit" size="lg" pill disabled={registerMutation.isPending} className="mt-2 w-full gap-2">
          {registerMutation.isPending ? (
            <div className="size-4 animate-spin rounded-full border-2 border-accent-ink border-t-transparent" aria-hidden="true" />
          ) : (
            <ArrowRight className="size-4" aria-hidden="true" />
          )}
          <span>{registerMutation.isPending ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản'}</span>
        </Button>
      </form>
    </AuthCard>
  );
}
