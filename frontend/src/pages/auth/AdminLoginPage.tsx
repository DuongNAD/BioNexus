import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAdminLogin } from '@/api/mutations/useAuthMutations';
import { ApiError } from '@/api/errors';
import { toast } from 'sonner';
import { AuthCard, AuthError, PasswordField } from './components/AuthCard';

interface AdminLoginFormValues {
  account: string;
  password: string;
}

export default function AdminLoginPage(): React.JSX.Element {
  const [searchParams] = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const adminLoginMutation = useAdminLogin();

  const {
    register,
    handleSubmit,
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

  return (
    <AuthCard
      eyebrow="Ban Quản trị"
      title="Đăng nhập quản trị"
      description="Dành cho kiểm duyệt viên, nhà sinh học và quản trị viên hệ thống."
      footer={
        <p>
          <Link to="/login" className="hover:text-fg">
            Quay lại đăng nhập thành viên
          </Link>
        </p>
      }
    >
      <AuthError message={errorMessage} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Input
          id="admin-account"
          label="Tài khoản quản trị"
          {...register('account', { validate: (v) => v.trim().length > 0 || 'Vui lòng nhập tài khoản quản trị' })}
          placeholder="Nhập tài khoản quản trị..."
          autoComplete="username"
          error={errors.account?.message}
        />

        <PasswordField
          id="admin-password"
          label="Mật khẩu"
          {...register('password', { required: 'Vui lòng nhập mật khẩu' })}
          placeholder="Nhập mật khẩu..."
          autoComplete="current-password"
          error={errors.password?.message}
        />

        <Button type="submit" size="lg" pill disabled={adminLoginMutation.isPending} className="mt-2 w-full gap-2">
          {adminLoginMutation.isPending ? (
            <div className="size-4 animate-spin rounded-full border-2 border-accent-ink border-t-transparent" aria-hidden="true" />
          ) : (
            <ArrowRight className="size-4" aria-hidden="true" />
          )}
          <span>{adminLoginMutation.isPending ? 'Đang xác thực...' : 'Đăng nhập quản trị'}</span>
        </Button>
      </form>
    </AuthCard>
  );
}
