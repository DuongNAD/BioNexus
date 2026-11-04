import * as React from 'react';
import { cn } from '@/lib/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      className,
      variant = 'rectangular',
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      text: 'h-4 w-full rounded',
      circular: 'rounded-full',
      rectangular: 'rounded-xl',
    };

    return (
      <div
        ref={ref}
        aria-busy="true"
        aria-live="polite"
        className={cn(
          'animate-pulse bg-fg/[0.06]',
          variantStyles[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';
