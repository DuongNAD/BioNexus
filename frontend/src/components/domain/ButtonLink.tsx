import React from 'react';
import { Link, type LinkProps } from 'react-router';
import { cn } from '@/lib/cn';

// Link mang dáng nút: thay cho <Link><Button/></Link> (lồng <a><button> sai HTML và tạo 2 điểm tab)
const BASE =
  'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 select-none';

const VARIANTS = {
  primary:
    'bg-accent text-accent-ink font-semibold hover:bg-white active:bg-accent/90 shadow-[var(--glow-accent-btn)]',
  secondary:
    'bg-surface-hover text-fg border border-line hover:bg-fg/10 hover:border-line-strong active:bg-fg/15',
  outline: 'bg-transparent text-fg-2 border border-line hover:bg-surface hover:text-fg hover:border-line-strong',
  ghost: 'bg-transparent text-fg-2 hover:text-fg hover:bg-surface',
} as const;

const SIZES = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
} as const;

export interface ButtonLinkProps extends LinkProps {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  pill?: boolean;
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  pill = false,
  className,
  ...props
}: ButtonLinkProps): React.JSX.Element {
  return (
    <Link
      className={cn(BASE, VARIANTS[variant], SIZES[size], pill ? 'rounded-full' : 'rounded-lg', className)}
      {...props}
    />
  );
}
