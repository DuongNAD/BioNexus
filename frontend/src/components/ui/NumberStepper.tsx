import React from 'react';
import { Minus, Plus } from 'lucide-react';

export interface NumberStepperProps {
  value: number;
  min?: number;
  max: number;
  onChange: (newValue: number) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  'aria-label'?: string;
}

export const NumberStepper: React.FC<NumberStepperProps> = ({
  value,
  min = 1,
  max,
  onChange,
  disabled = false,
  size = 'md',
  className = '',
  'aria-label': ariaLabel = 'Số lượng',
}) => {
  const isMin = value <= min;
  const isMax = value >= max;

  const sizeClasses = {
    sm: 'h-7 text-xs',
    md: 'h-9 text-sm',
    lg: 'h-11 text-base',
  }[size];

  const btnSizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
  }[size];

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isMin) {
      onChange(Math.max(min, value - 1));
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isMax) {
      onChange(Math.min(max, value + 1));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    if (rawVal === '') return;
    const parsed = parseInt(rawVal, 10);
    if (!isNaN(parsed)) {
      const clamped = Math.max(min, Math.min(max, parsed));
      onChange(clamped);
    }
  };

  return (
    <div
      className={`inline-flex items-center rounded-xl border border-line bg-surface/60 backdrop-blur-md overflow-hidden transition-colors focus-within:border-accent ${className}`}
      role="group"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || isMin}
        aria-label="Giảm số lượng"
        className={`flex items-center justify-center transition-colors text-fg-2 hover:bg-surface-hover hover:text-fg disabled:opacity-30 disabled:cursor-not-allowed ${btnSizeClasses}`}
      >
        <Minus className="size-3.5" />
      </button>

      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={handleInputChange}
        disabled={disabled}
        aria-label={ariaLabel}
        className={`w-12 text-center font-mono font-semibold bg-transparent text-fg focus:outline-none ${sizeClasses}`}
      />

      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || isMax}
        aria-label="Tăng số lượng"
        className={`flex items-center justify-center transition-colors text-fg-2 hover:bg-surface-hover hover:text-fg disabled:opacity-30 disabled:cursor-not-allowed ${btnSizeClasses}`}
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
};
