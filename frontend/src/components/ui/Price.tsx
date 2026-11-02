import * as React from 'react';
import { cn } from '@/lib/cn';

export interface PriceProps extends React.HTMLAttributes<HTMLSpanElement> {
  amount: number;
  size?: 'sm' | 'md' | 'lg';
}

export const Price = React.forwardRef<HTMLSpanElement, PriceProps>(
  (
    {
      className,
      amount,
      size = 'md',
      ...props
    },
    ref
  ) => {
    const safeAmount = typeof amount === 'number' && !isNaN(amount) ? Math.max(0, amount) : 0;

    const formatted = new Intl.NumberFormat('vi-VN').format(safeAmount);

    const sizeStyles = {
      sm: 'text-xs',
      md: 'text-sm font-semibold',
      lg: 'text-xl font-bold tracking-tight',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-baseline font-mono text-accent',
          sizeStyles[size],
          className
        )}
        {...props}
      >
        <span>{formatted}</span>
        <span className="ml-1 text-[0.8em] font-sans font-normal opacity-80">₫</span>
      </span>
    );
  }
);

Price.displayName = 'Price';
