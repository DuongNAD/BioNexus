import * as React from 'react';
import { cn } from '@/lib/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  glow?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      interactive = false,
      glow = false,
      padding = 'md',
      children,
      ...props
    },
    ref
  ) => {
    const paddingStyles = {
      none: 'p-0',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-2xl border border-line bg-surface backdrop-blur-xl transition-all duration-200',
          paddingStyles[padding],
          interactive &&
            'cursor-pointer hover:border-line-strong hover:bg-surface-hover hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]',
          glow && 'shadow-[var(--glow-card)]',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
