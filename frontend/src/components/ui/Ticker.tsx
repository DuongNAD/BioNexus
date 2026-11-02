import React, { useEffect, useState, useRef } from 'react';
import { formatVnd } from '@/lib/parseEnvironmentSpecs';

export interface TickerProps {
  value: number;
  formatAsCurrency?: boolean;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}

export const Ticker: React.FC<TickerProps> = ({
  value,
  formatAsCurrency = false,
  prefix = '',
  suffix = '',
  duration = 600,
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const startValRef = useRef(value);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const startVal = displayValue;
    const endVal = value;
    if (startVal === endVal) return;

    startValRef.current = startVal;
    startTimeRef.current = null;

    const step = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      // Easing out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValRef.current + (endVal - startValRef.current) * easeOut);
      setDisplayValue(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  const formatted = formatAsCurrency
    ? formatVnd(displayValue)
    : new Intl.NumberFormat('vi-VN').format(displayValue);

  return (
    <span className={`font-mono font-semibold tracking-tight transition-colors ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};
