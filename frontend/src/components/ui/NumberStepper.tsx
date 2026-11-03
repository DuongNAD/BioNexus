import React, { useEffect, useState } from 'react';
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
  // Chuỗi nháp khi gõ tay: cho phép xoá trắng để gõ số mới, chỉ gửi giá trị khi rời ô hoặc bấm Enter
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const isMin = value <= min;
  const isMax = value >= max;

  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-9 text-sm',
    lg: 'h-11 text-base',
  }[size];

  const btnSizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
  }[size];

  const clamp = (n: number) => Math.max(min, Math.min(max, n));

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isMin) {
      // Dòng đang vượt tồn kho (5 > 3) thì giảm thẳng về mức tối đa, không gửi 4 rồi bị 409
      onChange(clamp(value - 1));
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isMax) {
      onChange(clamp(value + 1));
    }
  };

  const commitDraft = () => {
    const parsed = parseInt(draft, 10);
    if (isNaN(parsed)) {
      setDraft(String(value));
      return;
    }
    const clamped = clamp(parsed);
    setDraft(String(clamped));
    if (clamped !== value) onChange(clamped);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Giữ nguyên chuỗi gõ vào; commitDraft dùng parseInt nên "3.75" thành 3, chữ thì trả về giá trị cũ
    setDraft(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitDraft();
    } else if (e.key === 'Escape') {
      setDraft(String(value));
    }
  };

  return (
    <div
      className={`inline-flex items-center overflow-hidden rounded-full border border-line bg-surface transition-colors focus-within:border-accent ${className}`}
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
        <Minus className="size-3.5" aria-hidden="true" />
      </button>

      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={draft}
        onChange={handleInputChange}
        onBlur={commitDraft}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-label={ariaLabel}
        className={`w-10 bg-transparent text-center font-mono font-semibold text-fg focus:outline-none ${sizeClasses}`}
      />

      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || isMax}
        aria-label="Tăng số lượng"
        className={`flex items-center justify-center transition-colors text-fg-2 hover:bg-surface-hover hover:text-fg disabled:opacity-30 disabled:cursor-not-allowed ${btnSizeClasses}`}
      >
        <Plus className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  );
};
