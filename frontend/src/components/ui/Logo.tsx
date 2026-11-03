import * as React from 'react';
import { cn } from '@/lib/cn';

export interface LogoProps extends React.SVGAttributes<SVGSVGElement> {
  /** Kích thước vuông theo pixel (mặc định 24) */
  size?: number | string;
  /** Nhãn tiếp cận cho screen reader (nếu là logo độc lập) */
  'aria-label'?: string;
}

/**
 * Logo BioNexus: chuỗi xoắn kép đứng, hai sợi bắt chéo hai lần và bốn bậc nối.
 * Bản cũ chỉ có hai nét chéo nên nhìn như nút đóng "X".
 * Sợi trước màu `--accent`, sợi sau `--accent-2` mờ hơn để có chiều sâu.
 */
export function Logo({
  size = 24,
  className,
  'aria-label': ariaLabel,
  ...props
}: LogoProps): React.JSX.Element {
  const isAccessible = Boolean(ariaLabel);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      role={isAccessible ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-hidden={isAccessible ? undefined : true}
      className={cn('shrink-0 text-accent transition-transform duration-200', className)}
      {...props}
    >
      {/* Sợi sau vẽ trước để sợi trước đè lên ở chỗ bắt chéo */}
      <path
        d="M23 4C23 8.4 9 11.6 9 16S23 23.6 23 28"
        stroke="var(--color-accent-2, currentColor)"
        strokeWidth="2.6"
        strokeLinecap="round"
        opacity="0.7"
      />
      {/* Bốn bậc nối hai sợi, đặt ở nơi hai sợi cách nhau đều */}
      <path
        d="M12 7h8M12 13h8M12 19h8M12 25h8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M9 4C9 8.4 23 11.6 23 16S9 23.6 9 28"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

Logo.displayName = 'Logo';

/**
 * Alias cho Logo dạng mark độc lập
 */
export const LogoMark = Logo;

export interface LogoTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  className?: string;
}

/**
 * Text thương hiệu BioNexus với gradient chuẩn Bio-Luxury
 */
export function LogoText({ className, ...props }: LogoTextProps): React.JSX.Element {
  return (
    <span
      className={cn(
        'bg-gradient-to-r from-accent to-accent-2 bg-clip-text font-bold tracking-tight text-transparent',
        className
      )}
      {...props}
    >
      BioNexus
    </span>
  );
}

LogoText.displayName = 'LogoText';
