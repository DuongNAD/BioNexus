import React, { useState } from 'react';
import { Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { ShieldAlert, ShieldCheck, Scale, Microscope, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAdminLogin } from '@/api/mutations/useAuthMutations';
import { toast } from 'sonner';

interface AdminLoginFormValues {
  account: string;
  password: string;
}

export default function AdminLoginPage(): React.JSX.Element {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const adminLoginMutation = useAdminLogin();

  const { register, handleSubmit, setValue } = useForm<AdminLoginFormValues>({
    defaultValues: {
      account: '',
      password: '',
    },
  });

  const onSubmit = async (values: AdminLoginFormValues) => {
    setErrorMessage(null);
    try {
      await adminLoginMutation.mutateAsync({
        account: values.account.trim(),
        password: values.password,
      });

      toast.success('Xác thực Ban Quản trị thành công!');
      window.location.hash = '#/admin';
    } catch (err: any) {
      if (err.code === 'AUTH_ACCOUNT_BANNED') {
        setErrorMessage('Tài khoản quản trị viên của bạn đã bị vô hiệu hóa.');
      } else if (err.code === 'AUTH_INVALID_CREDENTIALS' || err.status === 401) {
        setErrorMessage('Sai tài khoản hoặc mật khẩu quản trị.');
      } else {
        setErrorMessage(err.message || 'Không có thẩm quyền truy cập Ban Quản trị BioNexus.');
      }
    }
  };

  const handleQuickFill = (acc: string, pass: string) => {
    setValue('account', acc);
    setValue('password', pass);
    onSubmit({ account: acc, password: pass });
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
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="admin-account" className="block text-xs font-medium text-fg-2 mb-1.5">
            Tài khoản Quản trị (Account)
          </label>
          <div className="relative">
            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-amber-400" />
            <Input
              id="admin-account"
              {...register('account', { required: true })}
              placeholder="Nhập mã định danh quản trị..."
              className="pl-9 text-xs"
              autoComplete="username"
            />
          </div>
        </div>

        <div>
          <label htmlFor="admin-password" className="block text-xs font-medium text-fg-2 mb-1.5">
            Mật khẩu bảo mật
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-fg-3" />
            <Input
              id="admin-password"
              type={showPassword ? 'text' : 'password'}
              {...register('password', { required: true })}
              placeholder="Nhập mật khẩu..."
              className="pl-9 pr-9 text-xs"
              autoComplete="current-password"
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

      {/* Quick Seed Admin Accounts (NO EMOJIS, pure Lucide icons) */}
      <div className="rounded-xl border border-dashed border-amber-500/30 bg-surface-2/40 p-3.5 space-y-2.5">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300 block">
          Tài khoản quản trị mẫu (Admin Seed)
        </span>
        <div className="grid grid-cols-1 gap-2">
          <button
            type="button"
            onClick={() => handleQuickFill('superadmin', 'admin123')}
            className="flex items-center gap-2 rounded-lg border border-line bg-surface p-2 text-left text-xs hover:border-accent hover:text-accent transition-colors"
          >
            <ShieldCheck className="size-3.5 text-accent shrink-0" />
            <div className="flex-1 truncate">
              <span className="font-semibold block truncate">superadmin</span>
              <span className="text-[10px] text-fg-3 block truncate">Super Admin (Toàn quyền hệ thống)</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickFill('moderator1', 'admin123')}
            className="flex items-center gap-2 rounded-lg border border-line bg-surface p-2 text-left text-xs hover:border-accent hover:text-accent transition-colors"
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
            className="flex items-center gap-2 rounded-lg border border-line bg-surface p-2 text-left text-xs hover:border-accent hover:text-accent transition-colors"
          >
            <Microscope className="size-3.5 text-accent shrink-0" />
            <div className="flex-1 truncate">
              <span className="font-semibold block truncate">biologist1</span>
              <span className="text-[10px] text-fg-3 block truncate">Nhà sinh học (Quản trị loài & Cây phân loại)</span>
            </div>
          </button>
        </div>
      </div>

      <div className="pt-2 border-t border-line/60 text-center">
        <Link to="/login" className="text-xs text-fg-3 hover:text-accent transition-colors">
          ← Quay lại Đăng nhập người dùng thường
        </Link>
      </div>
    </div>
  );
}
