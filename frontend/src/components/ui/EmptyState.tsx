import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  children?: React.ReactNode;
  className?: string;
}

/** Trạng thái rỗng: khung viền đứt nhẹ, không lồng thêm hộp quanh icon */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  children,
  className = '',
}) => {
  return (
    <div
      className={`mx-auto flex max-w-xl flex-col items-center justify-center rounded-[20px] border border-dashed border-line px-6 py-12 text-center md:py-16 ${className}`}
      role="status"
    >
      {icon && <div className="mb-4 text-accent [&_svg]:size-8">{icon}</div>}
      <h3 className="text-xl font-semibold tracking-[-0.02em] text-fg">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-fg-2">{description}</p>

      {children && <div className="mt-4 w-full">{children}</div>}

      {action && (
        <div className="mt-6">
          <Button
            variant="primary"
            pill
            onClick={() => {
              if (action.href) window.location.hash = action.href;
              else action.onClick?.();
            }}
          >
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
};
