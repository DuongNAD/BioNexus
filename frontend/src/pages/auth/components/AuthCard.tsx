import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Eyebrow } from '@/components/layout/Page';
import { Input, type InputProps } from '@/components/ui/Input';

/** Khung form đăng nhập / đăng ký: một thẻ duy nhất, một H1, phần chân cho liên kết phụ */
export function AuthCard({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="rounded-[20px] border border-line bg-bg-raised/85 p-6 backdrop-blur-xl sm:p-8">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="mt-3 text-[30px] leading-tight font-semibold tracking-[-0.03em] text-fg">{title}</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-fg-2">{description}</p>
      <div className="mt-8">{children}</div>
      {footer && <div className="mt-8 space-y-2 border-t border-line pt-5 text-sm text-fg-3">{footer}</div>}
    </div>
  );
}

/** Thông báo lỗi từ máy chủ, đặt ngay trên form (tài liệu 03 mục 12) */
export function AuthError({ message }: { message: string | null }): React.JSX.Element | null {
  if (!message) return null;
  return (
    <div role="alert" className="mb-6 rounded-[10px] bg-danger/10 px-4 py-3 text-sm text-red-200">
      {message}
    </div>
  );
}

/** Ô mật khẩu có nút hiện/ẩn; lỗi hiển thị bên dưới qua prop error của Input */
export const PasswordField = React.forwardRef<HTMLInputElement, Omit<InputProps, 'type'>>((props, ref) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input ref={ref} type={visible ? 'text' : 'password'} {...props} className="pr-12" />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        // Căn giữa theo chiều cao ô nhập (h-11), không theo cả khối vì có thể có nhãn và dòng lỗi
        className={`absolute right-1.5 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-fg-3 transition-colors hover:bg-surface-2 hover:text-fg ${props.label ? 'top-[50px]' : 'top-[22px]'}`}
        aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
      >
        {visible ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
      </button>
    </div>
  );
});
PasswordField.displayName = 'PasswordField';
