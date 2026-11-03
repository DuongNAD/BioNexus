import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { User, Lock, Eye, EyeOff, ArrowRight, UserCheck, Store, Ban, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLogin } from '@/api/mutations/useAuthMutations';
import { ApiError } from '@/api/errors';
import { USE_MOCKS } from '@/lib/env';
import { toast } from 'sonner';

interface LoginFormValues {
  username: string;
  password: string;
}

// Nút đăng nhập nhanh chứa mật khẩu seed: chỉ hiện khi chạy dev với MSW, không bao giờ vào bản build
const SHOW_DEMO_LOGINS = import.meta.env.DEV && USE_MOCKS;

export default function LoginPage(): React.JSX.Element {
  const [searchParams] = useSearchParams();
  const nextUrl = searchParams.get('next');
  const [showPassword, setShowPassword] = useState(false);
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

  const handleQuickFill = (u: string, p: string) => {
    if (loginMutation.isPending) return;
    setValue('username', u);
    setValue('password', p);
    void handleSubmit(onSubmit)();
  };

  return (
    <div className="rounded-2xl border border-line bg-surface-1/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-fg font-sans">
          Đăng Nhập Tài Khoản
        </h1>
        <p className="mt-1 text-xs text-fg-2">
          Chào mừng bạn quay trở lại với sinh quyển BioNexus
        </p>
      </div>

      {errorMessage && (
        <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label htmlFor="login-username" className="block text-xs font-medium text-fg-2 mb-1.5">
            Tên đăng nhập
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-fg-3" aria-hidden="true" />
            <Input
              id="login-username"
              {...register('username', { validate: (v) => v.trim().length > 0 || 'Vui lòng nhập tên đăng nhập' })}
              placeholder="Nhập tên đăng nhập..."
              className="pl-9 text-xs"
              autoComplete="username"
              aria-invalid={Boolean(errors.username)}
              aria-describedby={errors.username ? 'login-username-error' : undefined}
            />
          </div>
          {errors.username && (
            <p id="login-username-error" role="alert" className="mt-1.5 text-xs font-medium text-danger">
              {errors.username.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="login-password" className="block text-xs font-medium text-fg-2 mb-1.5">
            Mật khẩu
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-fg-3" aria-hidden="true" />
            <Input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              {...register('password', { required: 'Vui lòng nhập mật khẩu' })}
              placeholder="Nhập mật khẩu..."
              className="pl-9 pr-9 text-xs"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'login-password-error' : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-3 hover:text-fg"
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.password && (
            <p id="login-password-error" role="alert" className="mt-1.5 text-xs font-medium text-danger">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          pill
          variant="primary"
          disabled={loginMutation.isPending}
          className="w-full gap-2 font-bold shadow-[var(--glow-accent-btn)] mt-2"
        >
          {loginMutation.isPending ? (
            <div className="size-4 animate-spin rounded-full border-2 border-accent-ink border-t-transparent" />
          ) : (
            <ArrowRight className="size-4" />
          )}
          <span>{loginMutation.isPending ? 'Đang xác thực...' : 'Đăng nhập'}</span>
        </Button>
      </form>

      {/* Đăng nhập nhanh bằng tài khoản seed: chỉ có ở chế độ dev + MSW */}
      {SHOW_DEMO_LOGINS && (
      <div className="rounded-xl border border-dashed border-line/70 bg-surface-2/40 p-3.5 space-y-2.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-accent block">
          Đăng nhập nhanh (tài khoản mẫu, chỉ ở chế độ dev)
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={loginMutation.isPending}
            onClick={() => handleQuickFill('levanc', '123456')}
            className="flex items-center gap-1.5 rounded-lg border border-line bg-surface p-2 text-left text-xs hover:border-accent hover:text-accent transition-colors"
          >
            <UserCheck className="size-3.5 text-accent shrink-0" />
            <div className="truncate">
              <span className="font-semibold block truncate">levanc</span>
              <span className="text-[10px] text-fg-3 block truncate">Khách mua</span>
            </div>
          </button>

          <button
            type="button"
            disabled={loginMutation.isPending}
            onClick={() => handleQuickFill('nguyenvana', '123456')}
            className="flex items-center gap-1.5 rounded-lg border border-line bg-surface p-2 text-left text-xs hover:border-accent hover:text-accent transition-colors"
          >
            <Store className="size-3.5 text-accent shrink-0" />
            <div className="truncate">
              <span className="font-semibold block truncate">nguyenvana</span>
              <span className="text-[10px] text-fg-3 block truncate">Chủ shop</span>
            </div>
          </button>

          <button
            type="button"
            disabled={loginMutation.isPending}
            onClick={() => handleQuickFill('vuthif', '123456')}
            className="flex items-center gap-1.5 rounded-lg border border-line bg-surface p-2 text-left text-xs hover:border-red-400 hover:text-red-300 transition-colors"
          >
            <Ban className="size-3.5 text-red-400 shrink-0" />
            <div className="truncate">
              <span className="font-semibold block truncate">vuthif</span>
              <span className="text-[10px] text-fg-3 block truncate">Bị khóa (403)</span>
            </div>
          </button>

          <button
            type="button"
            disabled={loginMutation.isPending}
            onClick={() => handleQuickFill('dangvang', '123456')}
            className="flex items-center gap-1.5 rounded-lg border border-line bg-surface p-2 text-left text-xs hover:border-amber-400 hover:text-amber-300 transition-colors"
          >
            <Clock className="size-3.5 text-amber-400 shrink-0" />
            <div className="truncate">
              <span className="font-semibold block truncate">dangvang</span>
              <span className="text-[10px] text-fg-3 block truncate">Tạm khóa (403)</span>
            </div>
          </button>
        </div>
      </div>
      )}

      <div className="pt-2 border-t border-line/60 flex items-center justify-between text-xs text-fg-3">
        <span>Chưa có tài khoản?</span>
        <Link to="/register" className="text-accent hover:underline font-semibold">
          Đăng ký thành viên mới →
        </Link>
      </div>

      <div className="text-center">
        <Link to="/admin/login" className="text-xs text-fg-3 hover:text-accent transition-colors">
          Cổng xác thực Ban Quản trị →
        </Link>
      </div>
    </div>
  );
}
