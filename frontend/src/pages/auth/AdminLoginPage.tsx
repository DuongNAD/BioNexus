import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { ShieldAlert, ShieldCheck, Scale, Microscope, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAdminLogin } from '@/api/mutations/useAuthMutations';
import { ApiError } from '@/api/errors';
import { USE_MOCKS } from '@/lib/env';
import { toast } from 'sonner';

interface AdminLoginFormValues {
  account: string;
  password: string;
}

// Nút đăng nhập nhanh chứa mật khẩu seed: chỉ hiện khi chạy dev với MSW, không bao giờ vào bản build
const SHOW_DEMO_LOGINS = import.meta.env.DEV && USE_MOCKS;

export default function AdminLoginPage(): React.JSX.Element {
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const adminLoginMutation = useAdminLogin();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AdminLoginFormValues>({
    defaultValues: {
      account: '',
      password: '',
    },
  });

  // Chỉ quay lại đường dẫn nội bộ trong khu quản trị (chống open redirect)
  const getSafeRedirectHash = (): string => {
    const next = searchParams.get('next');
    if (next && next.startsWith('/admin') && !next.startsWith('//')) return `#${next}`;
    return '#/admin';
  };

  const onSubmit = async (values: AdminLoginFormValues) => {
    setErrorMessage(null);
    try {
      // Backend đọc cột account qua trường username (LoginRequest.java)
      const auth = await adminLoginMutation.mutateAsync({
        username: values.account.trim(),
        password: values.password,
      });

      toast.success(`Xin chào, ${auth.fullName || auth.username}!`);
      window.location.hash = getSafeRedirectHash();
    } catch (err) {
      const code = err instanceof ApiError ? err.code : '';
      if (code === 'AUTH_ACCOUNT_BANNED') {
        setErrorMessage('Tài khoản quản trị viên của bạn đã bị vô hiệu hóa.');
      } else if (code === 'AUTH_ACCOUNT_INACTIVE') {
        setErrorMessage('Tài khoản quản trị viên đang tạm khóa.');
      } else if (code === 'AUTH_INVALID_CREDENTIALS' || (err instanceof ApiError && err.status === 401)) {
        setErrorMessage('Sai tài khoản hoặc mật khẩu quản trị.');
      } else {
        setErrorMessage(err instanceof Error && err.message ? err.message : 'Đăng nhập quản trị không thành công.');
      }
    }
  };

  const handleQuickFill = (acc: string, pass: string) => {
    if (adminLoginMutation.isPending) return;
    setValue('account', acc);
    setValue('password', pass);
    void handleSubmit(onSubmit)();
  };

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-surface-1/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl space-y-6">
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-mono text-amber-300 mb-3">
          <ShieldAlert className="size-3.5" />
          <span>Khu Vực Bảo Mật Ban Quản Trị</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-fg font-sans">
          Cổng Xác Thực Quản Trị
        </h1>
        <p className="mt-1 text-xs text-fg-2">
          Dành riêng cho Kiểm duyệt viên, Nhà sinh học và Quản trị viên hệ thống
        </p>
      </div>

      {errorMessage && (
        <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label htmlFor="admin-account" className="block text-xs font-medium text-fg-2 mb-1.5">
            Tài khoản quản trị
          </label>
          <div className="relative">
            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-amber-400" aria-hidden="true" />
            <Input
              id="admin-account"
              {...register('account', { validate: (v) => v.trim().length > 0 || 'Vui lòng nhập tài khoản quản trị' })}
              placeholder="Nhập tài khoản quản trị..."
              className="pl-9 text-xs"
              autoComplete="username"
              aria-invalid={Boolean(errors.account)}
              aria-describedby={errors.account ? 'admin-account-error' : undefined}
            />
          </div>
          {errors.account && (
            <p id="admin-account-error" role="alert" className="mt-1.5 text-xs font-medium text-danger">
              {errors.account.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="admin-password" className="block text-xs font-medium text-fg-2 mb-1.5">
            Mật khẩu
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-fg-3" aria-hidden="true" />
            <Input
              id="admin-password"
              type={showPassword ? 'text' : 'password'}
              {...register('password', { required: 'Vui lòng nhập mật khẩu' })}
              placeholder="Nhập mật khẩu..."
              className="pl-9 pr-9 text-xs"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'admin-password-error' : undefined}
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
            <p id="admin-password-error" role="alert" className="mt-1.5 text-xs font-medium text-danger">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          pill
          variant="primary"
          disabled={adminLoginMutation.isPending}
          className="w-full gap-2 font-bold shadow-[var(--glow-accent-btn)] mt-2"
        >
          {adminLoginMutation.isPending ? (
            <div className="size-4 animate-spin rounded-full border-2 border-accent-ink border-t-transparent" />
          ) : (
            <ArrowRight className="size-4" />
          )}
          <span>{adminLoginMutation.isPending ? 'Đang xác thực...' : 'Đăng nhập Quản trị'}</span>
        </Button>
      </form>

      {/* Đăng nhập nhanh bằng tài khoản seed: chỉ có ở chế độ dev + MSW */}
      {SHOW_DEMO_LOGINS && (
      <div className="rounded-xl border border-dashed border-amber-500/30 bg-surface-2/40 p-3.5 space-y-2.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
          Tài khoản quản trị mẫu (chỉ ở chế độ dev)
        </span>
        <div className="grid grid-cols-1 gap-2">
          <button
            type="button"
            onClick={() => handleQuickFill('superadmin', 'admin123')}
            disabled={adminLoginMutation.isPending}
            className="flex items-center gap-2 rounded-lg border border-line bg-surface p-2 text-left text-xs hover:border-accent hover:text-accent transition-colors disabled:opacity-60"
          >
            <ShieldCheck className="size-3.5 text-accent shrink-0" aria-hidden="true" />
            <div className="flex-1 truncate">
              <span className="font-semibold block truncate">superadmin</span>
              <span className="text-[10px] text-fg-3 block truncate">Quản trị tổng (toàn quyền hệ thống)</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickFill('moderator1', 'admin123')}
            disabled={adminLoginMutation.isPending}
            className="flex items-center gap-2 rounded-lg border border-line bg-surface p-2 text-left text-xs hover:border-accent hover:text-accent transition-colors disabled:opacity-60"
          >
            <Scale className="size-3.5 text-accent shrink-0" />
            <div className="flex-1 truncate">
              <span className="font-semibold block truncate">moderator1</span>
              <span className="text-[10px] text-fg-3 block truncate">Kiểm duyệt viên (Phê duyệt Shop & Cá thể)</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickFill('biologist1', 'admin123')}
            disabled={adminLoginMutation.isPending}
            className="flex items-center gap-2 rounded-lg border border-line bg-surface p-2 text-left text-xs hover:border-accent hover:text-accent transition-colors disabled:opacity-60"
          >
            <Microscope className="size-3.5 text-accent shrink-0" aria-hidden="true" />
            <div className="flex-1 truncate">
              <span className="font-semibold block truncate">biologist1</span>
              <span className="text-[10px] text-fg-3 block truncate">Nhà sinh học (Quản trị loài & Cây phân loại)</span>
            </div>
          </button>
        </div>
      </div>
      )}

      <div className="pt-2 border-t border-line/60 text-center">
        <Link to="/login" className="text-xs text-fg-3 hover:text-accent transition-colors">
          ← Quay lại Đăng nhập người dùng thường
        </Link>
      </div>
    </div>
  );
}
