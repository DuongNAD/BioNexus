import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      id,
      label,
      error,
      helperText,
      options,
      placeholder,
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;

    const describedBy = error ? errorId : helperText ? helperId : undefined;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="mb-2 block text-sm font-medium text-fg-2"
          >
            {label}
            {required && <span className="ml-1 text-danger">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className={cn(
              'h-11 w-full appearance-none rounded-[10px] border border-line bg-white/[0.04] px-4 pr-10 text-[15px] text-fg transition-colors duration-150',
              // Viền accent + quầng mờ: thấy rõ khi focus mà không chói như vòng offset
              'hover:border-line-strong focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-danger hover:border-danger focus:border-danger focus:ring-danger/40',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="bg-bg-raised text-fg-3">
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={String(option.value)}
                value={option.value}
                disabled={option.disabled}
                className="bg-bg-raised text-fg py-1.5"
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 flex items-center text-fg-3">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
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

Select.displayName = 'Select';
