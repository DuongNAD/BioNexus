import React from 'react';
import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

/*
 * Bộ khung trang dùng chung (đợt làm lại giao diện 11/2026).
 * Mục tiêu: mọi trang cùng một nhịp chữ và khoảng cách theo mẫu R, ít khung viền lồng nhau.
 *  - Nhãn nhỏ (Eyebrow) dùng Be Vietnam Pro, không dùng font mono cho chữ tiếng Việt.
 *  - Mỗi vùng tối đa một lớp thẻ có viền; bên trong thẻ chỉ dùng khoảng trắng và đường kẻ mảnh.
 */

const CONTAINER_WIDTH = {
  narrow: 'max-w-3xl',
  default: 'max-w-6xl',
  wide: 'max-w-7xl',
  // Trang lưới danh mục: màn từ 1536px trở lên mà giữ 1280px thì hai bên trống tới 300px
  catalog: 'max-w-7xl 2xl:max-w-[1600px]',
} as const;

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: keyof typeof CONTAINER_WIDTH;
}

// Layout có cột bên (tài khoản, quản trị) đã tự lo lề và bề rộng: trang con không cộng thêm lần nữa
const ContainedContext = React.createContext(false);

/** Bọc vùng nội dung của layout đã có lề, để PageContainer bên trong chỉ còn là một khối thường */
export function ContainedRegion({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <ContainedContext.Provider value={true}>{children}</ContainedContext.Provider>;
}

/** Khung ngang chuẩn: căn giữa, lề 16px trên mobile, 40px trên desktop */
export function PageContainer({ width = 'wide', className, ...props }: PageContainerProps): React.JSX.Element {
  const contained = React.useContext(ContainedContext);
  if (contained) return <div className={cn('w-full min-w-0', className)} {...props} />;
  return <div className={cn('mx-auto w-full px-4 sm:px-6 lg:px-10', CONTAINER_WIDTH[width], className)} {...props} />;
}

/** Nhãn nhỏ in hoa phía trên tiêu đề */
export function Eyebrow({
  children,
  className,
  tone = 'accent',
}: {
  children: React.ReactNode;
  className?: string;
  tone?: 'accent' | 'muted';
}): React.JSX.Element {
  return (
    <p
      className={cn(
        'text-xs font-semibold uppercase tracking-[0.2em]',
        tone === 'accent' ? 'text-accent' : 'text-fg-3',
        className
      )}
    >
      {children}
    </p>
  );
}

export interface BreadcrumbItem {
  label: React.ReactNode;
  to?: string;
}

/** Đường dẫn trang: mục cuối là trang hiện tại, không có link */
export function Breadcrumbs({ items, className }: { items: BreadcrumbItem[]; className?: string }): React.JSX.Element {
  return (
    <nav aria-label="Đường dẫn" className={cn('text-sm text-fg-3', className)}>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex min-w-0 items-center gap-1.5">
              {item.to && !isLast ? (
                <Link to={item.to} className="truncate transition-colors hover:text-fg">
                  {item.label}
                </Link>
              ) : (
                <span className={cn('truncate', isLast && 'text-fg-2')} aria-current={isLast ? 'page' : undefined}>
                  {item.label}
                </span>
              )}
              {!isLast && <ChevronRight className="size-3.5 shrink-0 text-fg-mute" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export interface PageHeaderProps {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Nút hoặc công tắc đặt bên phải tiêu đề (xuống dưới trên mobile) */
  actions?: React.ReactNode;
  /** Dòng phụ dưới mô tả: số liệu, chip trạng thái */
  meta?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  className?: string;
}

/** Đầu trang chuẩn: H1 duy nhất của trang */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  meta,
  breadcrumbs,
  className,
}: PageHeaderProps): React.JSX.Element {
  return (
    <header className={cn('pt-10 pb-8 md:pt-16 md:pb-12', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} className="mb-6" />}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0 max-w-3xl">
          {eyebrow && <Eyebrow className="mb-4">{eyebrow}</Eyebrow>}
          <h1 className="text-[34px] leading-[1.05] font-semibold tracking-[-0.035em] text-fg text-balance md:text-[56px] md:leading-[1.0]">
            {title}
          </h1>
          {description && (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-fg-2 md:text-lg">{description}</p>
          )}
          {meta && <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-fg-3">{meta}</div>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>}
      </div>
    </header>
  );
}

export interface SectionProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  /** Mức tiêu đề: h2 cho khối chính, h3 cho khối phụ trong cột */
  as?: 'h2' | 'h3';
}

/** Khối nội dung có tiêu đề H2 (hoặc H3) và hàng hành động bên phải */
export function Section({
  eyebrow,
  title,
  description,
  actions,
  as = 'h2',
  className,
  children,
  ...props
}: SectionProps): React.JSX.Element {
  const Heading = as;
  const hasHead = eyebrow || title || description || actions;
  return (
    <section className={cn('py-8 md:py-12', className)} {...props}>
      {hasHead && (
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between md:mb-8">
          <div className="min-w-0">
            {eyebrow && <Eyebrow className="mb-2">{eyebrow}</Eyebrow>}
            {title && (
              <Heading
                className={cn(
                  'font-semibold tracking-[-0.03em] text-fg',
                  as === 'h2' ? 'text-2xl md:text-[32px] md:leading-tight' : 'text-lg md:text-xl'
                )}
              >
                {title}
              </Heading>
            )}
            {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-fg-2 md:text-base">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

/** Bề mặt thẻ chuẩn: một lớp viền mảnh, bo 20px, không đổ bóng đen */
export function Panel({
  className,
  padded = true,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { padded?: boolean }): React.JSX.Element {
  return (
    <div
      className={cn('rounded-[20px] border border-line bg-surface', padded && 'p-5 md:p-6', className)}
      {...props}
    />
  );
}
