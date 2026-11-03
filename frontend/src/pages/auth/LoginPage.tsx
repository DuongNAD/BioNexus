import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLogin } from '@/api/mutations/useAuthMutations';
import { ApiError } from '@/api/errors';
import { USE_MOCKS } from '@/lib/env';
import { toast } from 'sonner';
import { AuthCard, AuthError, DemoLogins, PasswordField, type DemoAccount } from './components/AuthCard';

interface LoginFormValues {
  username: string;
  password: string;
}

// Nút đăng nhập nhanh chứa mật khẩu seed: chỉ hiện khi chạy dev với MSW, không bao giờ vào bản build
const SHOW_DEMO_LOGINS = import.meta.env.DEV && USE_MOCKS;

export default function LoginPage(): React.JSX.Element {
  const [searchParams] = useSearchParams();
  const nextUrl = searchParams.get('next');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // Tài liệu 03 mục 12: thành công thì về next hoặc trang chủ
  const getSafeRedirectUrl = (next: string | null) => {
    if (!next) return '#/';
    // Chống Open Redirect: chỉ cho phép đường dẫn nội bộ bắt đầu bằng /
    if (next.startsWith('/') && !next.startsWith('//')) {
      return `#${next}`;
    }
    return '#/';
  };

  const onSubmit = async (values: LoginFormValues) => {
    setErrorMessage(null);
    try {
      const auth = await loginMutation.mutateAsync({
        username: values.username.trim(),
        password: values.password,
      });

      toast.success(`Chào mừng trở lại, ${auth.fullName || auth.username}`);
      window.location.hash = getSafeRedirectUrl(nextUrl);
    } catch (caught) {
      const err = caught instanceof ApiError ? caught : new ApiError(0, 'INTERNAL_ERROR');
      if (err.code === 'AUTH_ACCOUNT_BANNED') {
        setErrorMessage('Tài khoản của bạn đã bị khóa vĩnh viễn do vi phạm quy chế bảo tồn.');
      } else if (err.code === 'AUTH_ACCOUNT_INACTIVE') {
        setErrorMessage('Tài khoản chưa được kích hoạt hoặc đang tạm khóa. Vui lòng kiểm tra email kích hoạt.');
      } else if (err.code === 'AUTH_INVALID_CREDENTIALS' || err.status === 401) {
        setErrorMessage('Sai tài khoản hoặc mật khẩu.');
      } else {
        setErrorMessage(err.message || 'Đăng nhập không thành công.');
      }
    }
  };

  const handleQuickFill = (acc: DemoAccount) => {
    if (loginMutation.isPending) return;
    setValue('username', acc.username);
    setValue('password', acc.password);
    void handleSubmit(onSubmit)();
  };

  return (
    <AuthCard
      eyebrow="Thành viên BioNexus"
      title="Đăng nhập"
      description="Chào mừng bạn quay lại. Đăng nhập để mua sinh vật cảnh và theo dõi đơn hàng."
      footer={
        <>
          <p>
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-medium text-accent hover:underline">
              Đăng ký thành viên mới
            </Link>
          </p>
          <p>
            <Link to="/admin/login" className="hover:text-fg">
              Đăng nhập dành cho Ban Quản trị
            </Link>
          </p>
        </>
      }
    >
      <AuthError message={errorMessage} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Input
          id="login-username"
          label="Tên đăng nhập"
          {...register('username', { validate: (v) => v.trim().length > 0 || 'Vui lòng nhập tên đăng nhập' })}
          placeholder="Nhập tên đăng nhập..."
          autoComplete="username"
          error={errors.username?.message}
        />

        <PasswordField
          id="login-password"
          label="Mật khẩu"
          {...register('password', { required: 'Vui lòng nhập mật khẩu' })}
          placeholder="Nhập mật khẩu..."
          autoComplete="current-password"
          error={errors.password?.message}
        />

        <Button type="submit" size="lg" pill disabled={loginMutation.isPending} className="mt-2 w-full gap-2">
          {loginMutation.isPending ? (
            <div className="size-4 animate-spin rounded-full border-2 border-accent-ink border-t-transparent" aria-hidden="true" />
          ) : (
            <ArrowRight className="size-4" aria-hidden="true" />
          )}
          <span>{loginMutation.isPending ? 'Đang xác thực...' : 'Đăng nhập'}</span>
        </Button>
      </form>

      {/* Đăng nhập nhanh bằng tài khoản seed: chỉ có ở chế độ dev + MSW */}
      {SHOW_DEMO_LOGINS && (
        <DemoLogins
          disabled={loginMutation.isPending}
          onPick={handleQuickFill}
          accounts={[
            { username: 'levanc', password: '123456', note: 'Người mua' },
            { username: 'nguyenvana', password: '123456', note: 'Chủ shop' },
            { username: 'vuthif', password: '123456', note: 'Bị khóa (403)' },
            { username: 'dangvang', password: '123456', note: 'Tạm khóa (403)' },
          ]}
        />
      )}
    </AuthCard>
  );
}
