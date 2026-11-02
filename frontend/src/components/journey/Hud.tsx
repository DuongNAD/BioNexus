import React, { useEffect, useRef } from 'react';
import { Compass, Droplets, MapPin, Mountain, Thermometer } from 'lucide-react';
import type { SpeciesDto } from '@/types/api';
import { clamp, fmtLL, lerp, localTime, sub } from '@/lib/geo';
import { LEG, resolveJourneySpecies } from '@/content/journey';

const ST3_CLIMB: readonly [number, number] = [0, 0.34];

export interface HudProps {
  active: string;
  liveSpecies?: SpeciesDto[];
}

// Hộp thông tin góc trên phải: ngày, điểm đến, giờ địa phương, tọa độ, khí hậu, thanh tiến độ
export function Hud({ active, liveSpecies }: HudProps): React.JSX.Element {
  const leg = LEG[active];
  const s = leg?.slug ? resolveJourneySpecies(leg.slug, liveSpecies) : null;
  const llRef = useRef<HTMLParagraphElement | null>(null);
  const altRef = useRef<HTMLElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const prevLL = useRef<readonly [number, number]>(leg?.ll || [20.32, 105.61]);

  useEffect(() => {
    if (!leg) return;
    const [la0, lo0] = prevLL.current;
    const [la1, lo1] = leg.ll;
    prevLL.current = leg.ll;
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const k = clamp((now - t0) / 360);
      const e = 1 - (1 - k) ** 3;
      if (llRef.current) {
        llRef.current.textContent = fmtLL(lerp(la0, la1, e), lerp(lo0, lo1, e));
      }
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [active, leg]);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const max = Math.max(
          1,
          document.documentElement.scrollHeight - window.innerHeight
        );
        if (barRef.current) {
          barRef.current.style.width = `${clamp(window.scrollY / max) * 100}%`;
        }
        if (active === 'tram-3' && altRef.current) {
          const el = document.getElementById('tram-3');
          if (el) {
            const r = el.getBoundingClientRect();
            const p = clamp(-r.top / Math.max(1, r.height - window.innerHeight));
            const a = Math.round(lerp(1500, 2650, sub(p, ST3_CLIMB[0], ST3_CLIMB[1])));
            altRef.current.textContent = `${a.toLocaleString('vi-VN')} m`;
          }
        }
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, [active]);

  const hide =
    active === 'mo-dau' ||
    active === 'tong-quan' ||
    active === 'ho-chieu' ||
    active === 'ket' ||
    active.startsWith('bay-') ||
    !leg;

  return (
    <aside
      aria-label="Thông số điểm đến"
      className={`glass fixed top-16 right-3 left-3 z-30 rounded-2xl p-3 text-xs transition duration-300 md:top-20 md:right-6 md:left-auto md:w-[304px] md:p-4 ${
        hide ? 'pointer-events-none -translate-y-2 opacity-0' : ''
      }`}
    >
      <div className="flex items-center justify-between text-[11px] tracking-[0.14em] text-white/65 uppercase">
        <span>
          {leg?.day}
          {leg?.stop ? ` · ${leg.stop}` : ''}
        </span>
        <span className="flex items-center gap-1.5 font-mono text-white/80">
          {leg && localTime(leg.tz)}
          <Compass
            className="size-3.5 text-[#6ee7b7]"
            style={{
              transform: `rotate(${((leg?.ll[1] || 0) * 1.4).toFixed(0)}deg)`,
            }}
            aria-hidden="true"
          />
        </span>
      </div>
      <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-white">
        <MapPin className="size-3.5 shrink-0 text-[#6ee7b7]" aria-hidden="true" />
        <span className="truncate">{leg?.place}</span>
      </p>
      <p ref={llRef} className="mt-0.5 font-mono text-[11px] text-[#9ff0cf]">
        {leg && fmtLL(leg.ll[0], leg.ll[1])}
      </p>
      {s && (
        <dl className="mt-2.5 hidden grid-cols-3 gap-2 border-t border-white/10 pt-2.5 text-[11px] md:grid">
          <div>
            <dt className="flex items-center gap-1 text-white/50">
              <Thermometer className="size-3" aria-hidden="true" />
              Nhiệt độ
            </dt>
            <dd className="mt-0.5 font-medium text-white/90">
              {s.temp.replace(/ \(.*\)/, '').replace(/, .*/, '')}
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-1 text-white/50">
              <Droplets className="size-3" aria-hidden="true" />
              Độ ẩm
            </dt>
            <dd className="mt-0.5 font-medium text-white/90">{s.humidity}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-1 text-white/50">
              <Mountain className="size-3" aria-hidden="true" />
              Độ cao
            </dt>
            <dd ref={altRef} className="mt-0.5 font-medium tabular-nums text-white/90">
              {leg?.alt}
            </dd>
          </div>
        </dl>
      )}
      <div className="mt-2.5 h-[2px] overflow-hidden rounded-full bg-white/10">
        <div ref={barRef} className="h-full w-0 bg-[#6ee7b7]" />
      </div>
    </aside>
  );
}
