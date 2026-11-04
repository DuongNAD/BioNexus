import * as React from 'react';
import { cn } from '@/lib/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      id,
      label,
      error,
      helperText,
      required,
      disabled,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;
    const errorId = `${textareaId}-error`;
    const helperId = `${textareaId}-helper`;

    const describedBy = error ? errorId : helperText ? helperId : undefined;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="mb-2 block text-sm font-medium text-fg-2"
          >
            {label}
            {required && <span className="ml-1 text-danger">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          disabled={disabled}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(
            'w-full rounded-[10px] border border-line bg-fg/[0.04] px-4 py-3 text-[15px] leading-relaxed text-fg placeholder:text-fg-3 transition-colors duration-150',
            // Viền accent + quầng mờ: thấy rõ khi focus mà không chói như vòng offset
              'hover:border-line-strong focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-danger hover:border-danger focus:border-danger focus:ring-danger/40',
            className
          )}
          {...props}
        />
        {error && (
          <p id={errorId} role="alert" className="mt-1.5 text-xs font-medium text-danger">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={helperId} className="mt-1.5 text-xs text-fg-3">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
