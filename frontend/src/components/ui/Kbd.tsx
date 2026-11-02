import * as React from 'react';
import { cn } from '@/lib/cn';

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {}

export const Kbd = React.forwardRef<HTMLElement, KbdProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <kbd
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md border border-line-strong bg-surface-2 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-fg-2 shadow-sm select-none',
          className
        )}
        {...props}
      >
        {children}
      </kbd>
    );
  }
);

Kbd.displayName = 'Kbd';
