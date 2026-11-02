import * as React from 'react';
import { cn } from '@/lib/cn';

export interface LogoProps extends React.SVGAttributes<SVGSVGElement> {
  /** Kích thước vuông theo pixel (mặc định 24) */
  size?: number | string;
  /** Nhãn tiếp cận cho screen reader (nếu là logo độc lập) */
  'aria-label'?: string;
}

/**
 * Logo BioNexus: SVG tự vẽ hai sợi xoắn cách điệu (chuỗi xoắn kép sinh học),
 * một màu `--accent` (#6ee7b7 / #2fe8b0) kết hợp sợi phụ `--accent-2` (#5eead4),
 * tuân thủ tuyệt đối quy tắc "Không emoji" của dự án.
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
      {/* Sợi xoắn 1: Màu nhấn chính --accent */}
      <path
        d="M8 6 C14 12, 18 20, 24 26"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Sợi xoắn 2: Màu nhấn phụ --accent-2, mờ 75% tạo chiều sâu 3D */}
      <path
        d="M24 6 C18 12, 14 20, 8 26"
        stroke="var(--color-accent-2, currentColor)"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.75"
      />
      {/* Điểm nút trung tâm: Hạt liên kết phân tử */}
      <circle cx="16" cy="16" r="3" fill="currentColor" />
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
