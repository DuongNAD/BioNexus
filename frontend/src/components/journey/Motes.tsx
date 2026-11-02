import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';
import { useJourneyReducedMotion } from './useScrub';

export type MoteKind = 'pollen' | 'firefly' | 'bubble' | 'star';

export interface MotesProps {
  kind: MoteKind;
  className?: string;
  style?: React.CSSProperties;
}

// Hạt trên canvas 2D: phấn hoa, đom đóm, bọt nước, sao; tự dừng khi ra khỏi khung nhìn
export function Motes({ kind, className, style }: MotesProps): React.JSX.Element | null {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const reduced = useJourneyReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const n = kind === 'star' ? 95 : kind === 'bubble' ? 34 : kind === 'firefly' ? 30 : 42;
    let w = 0;
    let h = 0;
    let raf = 0;

    const resize = () => {
      w = cv.clientWidth || 1;
      h = cv.clientHeight || 1;
      cv.width = w * dpr;
      cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const pts = Array.from({ length: n }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r:
        kind === 'bubble'
          ? 2 + Math.random() * 5
          : kind === 'firefly'
            ? 1.6 + Math.random() * 2.2
            : 0.7 + Math.random() * 1.4,
      vx: (Math.random() - 0.5) * 0.25,
      vy:
        kind === 'bubble'
          ? -(0.35 + Math.random() * 0.55)
          : kind === 'pollen'
            ? -(0.08 + Math.random() * 0.18)
            : (Math.random() - 0.5) * 0.16,
      p: Math.random() * 6.28,
    }));

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const q of pts) {
        if (kind !== 'star') {
          q.x = (q.x + q.vx + Math.sin(t * 0.001 + q.p) * 0.18 + w) % w;
          q.y = (q.y + q.vy + h) % h;
        }
        const a = 0.28 + 0.55 * (0.5 + 0.5 * Math.sin(t * 0.002 + q.p));
        if (kind === 'firefly') {
          const g = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, q.r * 6);
          g.addColorStop(0, `rgba(214,255,150,${a})`);
          g.addColorStop(0.4, `rgba(110,231,183,${a * 0.45})`);
          g.addColorStop(1, 'rgba(110,231,183,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(q.x, q.y, q.r * 6, 0, 6.28);
          ctx.fill();
        } else if (kind === 'bubble') {
          ctx.strokeStyle = `rgba(200,248,235,${a * 0.65})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(q.x, q.y, q.r, 0, 6.28);
          ctx.stroke();
        } else {
          ctx.fillStyle =
            kind === 'star' ? `rgba(232,244,238,${a})` : `rgba(216,243,220,${a * 0.7})`;
          ctx.beginPath();
          ctx.arc(q.x, q.y, q.r, 0, 6.28);
          ctx.fill();
        }
      }
      raf = requestAnimationFrame(draw);
    };

    if (typeof IntersectionObserver !== 'undefined') {
      const io = new IntersectionObserver(([e]) => {
        if (e?.isIntersecting) {
          if (!raf) raf = requestAnimationFrame(draw);
        } else {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      });
      io.observe(cv);
      window.addEventListener('resize', resize, { passive: true });
      return () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        window.removeEventListener('resize', resize);
      };
    }

    raf = requestAnimationFrame(draw);
    window.addEventListener('resize', resize, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [kind, reduced]);

  if (reduced) return null;

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={style}
      className={cn('pointer-events-none absolute inset-0 size-full', className)}
    />
  );
}
