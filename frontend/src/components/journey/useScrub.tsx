import React, { useEffect, useRef, useState } from 'react';
import { clamp, smooth, sub } from '@/lib/geo';
import { SECTION_NEXT_PRELOAD } from '@/content/journey';
import { usePassport } from '@/hooks/usePassport';
import { preloadTripImage } from './TripImg';

export type ScrubRanges = Record<string, readonly [number, number]>;
export type ScrubExtraFn = (p: number, el: HTMLElement) => void;

export function useJourneyReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    setReduced(mql.matches);
    mql.addEventListener?.('change', onChange);
    return () => mql.removeEventListener?.('change', onChange);
  }, []);

  return reduced;
}

// Gắn tiến độ cuộn [0..1] của một <section> vào biến CSS --p và các biến con đã làm mượt
export function useScrub(
  ref: React.RefObject<HTMLElement | null>,
  ranges?: ScrubRanges,
  extra?: ScrubExtraFn
): void {
  const reduced = useJourneyReducedMotion();
  const rangesRef = useRef(ranges);
  const extraRef = useRef(extra);
  rangesRef.current = ranges;
  extraRef.current = extra;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reduced) {
      const pStatic = 0.78;
      el.style.setProperty('--p', pStatic.toFixed(4));
      const rMap = rangesRef.current;
      if (rMap) {
        for (const [k, [a, b]] of Object.entries(rMap)) {
          if (k === 'exit' || k === 'land') {
            el.style.setProperty(`--${k}`, '0');
          } else {
            el.style.setProperty(`--${k}`, smooth(sub(pStatic, a, b)).toFixed(3));
          }
        }
      }
      extraRef.current?.(pStatic, el);

      if (typeof IntersectionObserver !== 'undefined') {
        const io = new IntersectionObserver(
          ([entry]) => {
            if (entry?.isIntersecting) {
              extraRef.current?.(0.85, el);
            }
          },
          { threshold: 0.2 }
        );
        io.observe(el);
        return () => io.disconnect();
      }
      return;
    }

    let raf = 0;
    const run = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const p = clamp(-r.top / Math.max(1, r.height - window.innerHeight));
      el.style.setProperty('--p', p.toFixed(4));
      const rMap = rangesRef.current;
      if (rMap) {
        for (const [k, [a, b]] of Object.entries(rMap)) {
          el.style.setProperty(`--${k}`, smooth(sub(p, a, b)).toFixed(3));
        }
      }
      if (p > 0.6 && el.id && SECTION_NEXT_PRELOAD[el.id]) {
        preloadTripImage(SECTION_NEXT_PRELOAD[el.id]);
      }
      extraRef.current?.(p, el);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(run);
    };
    run();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [ref, reduced]);
}

// Đóng dấu vào hộ chiếu một lần duy nhất khi cuộn qua mốc `at`, đồng thời bật thuộc tính cho hiệu ứng con dấu
export function useStamp(slug: string, at: number): ScrubExtraFn {
  const { collect } = usePassport();
  const done = useRef(false);
  return (p: number, el: HTMLElement) => {
    if (p >= at) {
      el.setAttribute('data-stamped', '');
      if (!done.current) {
        done.current = true;
        collect(slug);
      }
    } else {
      el.removeAttribute('data-stamped');
    }
  };
}

// Màn tối dần ở cuối mỗi cảnh để nối sang cảnh sau
export function Exit(): React.JSX.Element {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-20 bg-[#040a07]"
      style={{ opacity: 'var(--exit)' }}
    />
  );
}
