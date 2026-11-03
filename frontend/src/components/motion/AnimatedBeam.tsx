import React, { useEffect, useState, useId } from 'react';
import { cn } from '@/lib/cn';

export interface AnimatedBeamProps {
  containerRef: React.RefObject<HTMLElement | null>;
  fromRef: React.RefObject<HTMLElement | null>;
  toRef: React.RefObject<HTMLElement | null>;
  curvature?: number;
  reverse?: boolean;
  duration?: number;
  delay?: number;
  className?: string;
}

export const AnimatedBeam: React.FC<AnimatedBeamProps> = ({
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  duration = 2,
  delay = 0,
  className = '',
}) => {
  const id = useId();
  const [pathD, setPathD] = useState('');
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });

  const updatePath = React.useCallback(() => {
    if (!containerRef.current || !fromRef.current || !toRef.current) return;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const fromRect = fromRef.current.getBoundingClientRect();
    const toRect = toRef.current.getBoundingClientRect();

    // SVG nằm trong vùng cuộn ngang: đo theo toạ độ nội dung (cộng scrollLeft/Top) và phủ cả scrollWidth
    setSvgDimensions({
      width: container.scrollWidth,
      height: container.scrollHeight,
    });

    const offsetX = container.scrollLeft - containerRect.left;
    const offsetY = container.scrollTop - containerRect.top;
    const startX = fromRect.right + offsetX;
    const startY = fromRect.top + fromRect.height / 2 + offsetY;
    const endX = toRect.left + offsetX;
    const endY = toRect.top + toRect.height / 2 + offsetY;

    // Nếu các phần tử xếp dọc (vertical beam)
    const isVertical = Math.abs(endX - startX) < 40;

    let d = '';
    if (isVertical) {
      const midY = (startY + endY) / 2;
      const ctrlX = startX + (curvature || 24);
      d = `M ${startX} ${startY} Q ${ctrlX} ${midY} ${endX} ${endY}`;
    } else {
      const deltaX = Math.max(32, Math.abs(endX - startX) * 0.5);
      const ctrl1X = startX + deltaX;
      const ctrl1Y = startY + curvature;
      const ctrl2X = endX - deltaX;
      const ctrl2Y = endY - curvature;
      d = `M ${startX} ${startY} C ${ctrl1X} ${ctrl1Y}, ${ctrl2X} ${ctrl2Y}, ${endX} ${endY}`;
    }

    setPathD(d);
  }, [containerRef, fromRef, toRef, curvature]);

  useEffect(() => {
    updatePath();
    window.addEventListener('resize', updatePath);
    // Cột đổi kích thước (ảnh tải xong, thêm cột) cũng phải vẽ lại tia
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => updatePath()) : null;
    [containerRef.current, fromRef.current, toRef.current].forEach((el) => {
      if (el && observer) observer.observe(el);
    });
    return () => {
      window.removeEventListener('resize', updatePath);
      observer?.disconnect();
    };
  }, [updatePath, containerRef, fromRef, toRef]);

  // Kiểm tra prefers-reduced-motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(media.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  if (!pathD) return null;

  const gradientId = `beam-grad-${id.replace(/:/g, '')}`;
  const glowId = `beam-glow-${id.replace(/:/g, '')}`;

  return (
    <svg
      fill="none"
      width={svgDimensions.width}
      height={svgDimensions.height}
      xmlns="http://www.w3.org/2000/svg"
      className={cn('pointer-events-none absolute left-0 top-0 z-10', className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={gradientId}
          gradientUnits="userSpaceOnUse"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#6ee7b7" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#5eead4" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
        </linearGradient>

        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 1. Đường nền mờ định hướng */}
      <path
        d={pathD}
        stroke="rgba(255, 255, 255, 0.08)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* 2. Lớp đệm ngoài Glow */}
      {!prefersReducedMotion && (
        <path
          d={pathD}
          stroke={`url(#${gradientId})`}
          strokeWidth="5"
          opacity="0.35"
          filter={`url(#${glowId})`}
          strokeLinecap="round"
        />
      )}

      {/* 3. Tia sáng photon chạy theo đường nét đứt hoặc nét liền */}
      <path
        d={pathD}
        stroke={`url(#${gradientId})`}
        strokeWidth="1.75"
        strokeLinecap="round"
        style={
          prefersReducedMotion
            ? { opacity: 0.6 }
            : {
                strokeDasharray: '6 8',
                animation: `dashMovement ${duration}s linear infinite`,
                animationDelay: `${delay}s`,
                animationDirection: reverse ? 'reverse' : 'normal',
              }
        }
      />

      <style>{`
        @keyframes dashMovement {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -28;
          }
        }
      `}</style>
    </svg>
  );
};
