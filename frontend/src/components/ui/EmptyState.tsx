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
      className={`flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-2xl border border-line/60 bg-surface/40 backdrop-blur-md max-w-lg mx-auto ${className}`}
      role="status"
    >
      {icon && (
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl border border-line bg-surface-2/60 text-accent shadow-inner">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-bold tracking-tight text-fg font-sans">{title}</h3>
      <p className="mt-2 text-sm text-fg-2 leading-relaxed max-w-sm">{description}</p>

      {children && <div className="mt-4 w-full">{children}</div>}

      {action && (
        <div className="mt-6">
          {action.href ? (
            <Button
              variant="primary"
              pill
              onClick={() => {
                if (action.href) window.location.hash = action.href;
              }}
            >
              {action.label}
            </Button>
          ) : (
            <Button variant="primary" pill onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
