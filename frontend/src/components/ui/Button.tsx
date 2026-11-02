import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  pill?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      pill = false,
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none';

    const variantStyles = {
      primary:
        'bg-accent text-accent-ink font-semibold hover:bg-white active:bg-accent/90 shadow-[var(--glow-accent-btn)]',
      secondary:
        'bg-surface-hover text-fg border border-line hover:bg-white/10 hover:border-line-strong active:bg-white/15',
      outline:
        'bg-transparent text-fg-2 border border-line hover:bg-surface hover:text-fg hover:border-line-strong',
      ghost: 'bg-transparent text-fg-2 hover:text-fg hover:bg-surface',
      danger:
        'bg-danger/15 text-danger border border-danger/30 hover:bg-danger hover:text-black active:bg-danger/80',
      icon: 'bg-transparent text-fg-2 hover:text-fg hover:bg-surface rounded-full',
    };

    const sizeStyles = {
      sm: 'h-8 px-3 text-xs gap-1.5 min-w-[32px]',
      md: 'h-10 px-4 text-sm gap-2 min-w-[40px]',
      lg: 'h-12 px-6 text-base gap-2.5 min-w-[48px]',
      icon: 'h-10 w-10 p-0 text-sm',
    };

    const radiusStyle = pill ? 'rounded-full' : 'rounded-lg';

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          radiusStyle,
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-current" />
            {children && <span className="opacity-70">{children}</span>}
          </>
        ) : (
          <>
            {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
