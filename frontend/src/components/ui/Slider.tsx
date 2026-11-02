import React from 'react';
import * as RadixSlider from '@radix-ui/react-slider';

export interface SliderProps {
  value: number[];
  min?: number;
  max?: number;
  step?: number;
  onValueChange: (val: number[]) => void;
  className?: string;
  'aria-label'?: string;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  className = '',
  'aria-label': ariaLabel = 'Thanh trượt giá trị',
}) => {
  return (
    <RadixSlider.Root
      className={`relative flex items-center select-none touch-none w-full h-5 ${className}`}
      value={value}
      min={min}
      max={max}
      step={step}
      onValueChange={onValueChange}
      aria-label={ariaLabel}
    >
      <RadixSlider.Track className="bg-surface-2 relative grow rounded-full h-1.5 overflow-hidden">
        <RadixSlider.Range className="absolute bg-accent h-full rounded-full" />
      </RadixSlider.Track>
      {value.map((_, index) => (
        <RadixSlider.Thumb
          key={index}
          className="block size-4 bg-fg border-2 border-accent rounded-full shadow-md hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent/40 transition-transform cursor-grab active:cursor-grabbing"
          aria-label={`Giá trị ${index + 1}`}
        />
      ))}
    </RadixSlider.Root>
  );
};
