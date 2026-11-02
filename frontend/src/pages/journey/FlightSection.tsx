import React, { useRef } from 'react';
import { Plane } from 'lucide-react';
import type { SpeciesDto } from '@/types/api';
import { distanceKm, localTime, sub } from '@/lib/geo';
import { CHAPTERS, FLIGHTS, LEG, resolveJourneySpecies } from '@/content/journey';
import { usePassport } from '@/hooks/usePassport';
import { Exit, useScrub } from '@/components/journey/useScrub';
import { arcPoint, WorldMap } from '@/components/journey/WorldMap';

const FLY_RANGES = {
  pass: [0.04, 0.2] as const,
  fly: [0.18, 0.66] as const,
  land: [0.66, 0.78] as const,
  exit: [0.92, 1] as const,
};

function Barcode(): React.JSX.Element {
  const bars = [
    2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 1, 1, 3, 2, 1, 2, 1, 3, 1, 1, 2, 3,
    1, 2, 1,
  ];
  let x = 0;
  return (
    <svg viewBox="0 0 120 40" className="h-10 w-32 text-white/80" aria-hidden="true">
      {bars.map((w, i) => {
        const r = i % 2 === 0 && <rect key={i} x={x} y="0" width={w} height="40" fill="currentColor" />;
        x += w + 1;
        return r;
      })}
    </svg>
  );
}

export interface FlightProps {
  id: 'bay-2' | 'bay-3' | 'bay-4';
  liveSpecies?: SpeciesDto[];
}

export function Flight({ id, liveSpecies }: FlightProps): React.JSX.Element {
  const ref = useRef<HTMLElement | null>(null);
  const planeRef = useRef<SVGGElement | null>(null);
  const { met, user } = usePassport();
  const f = FLIGHTS[id]!;
  const ch = CHAPTERS.find((c) => c.n === f.chapter)!;

  useScrub(ref, FLY_RANGES, (p) => {
    const t = sub(p, FLY_RANGES.fly[0], FLY_RANGES.fly[1]);
    const [x, y, ang] = arcPoint(f.a, t);
    planeRef.current?.setAttribute(
      'transform',
      `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ang.toFixed(1)})`
    );
  });

  const km = distanceKm(f.from.ll, f.to.ll);

  return (
    <section id={id} ref={ref} className="relative h-[260vh]">
      <div className="sticky top-0 h-svh overflow-hidden bg-[radial-gradient(ellipse_at_50%_40%,#0b1f18_0%,#040a07_70%)]">
        <div
          className="absolute inset-x-0 top-[12vh] mx-auto w-[min(1180px,140vw)] max-md:-translate-x-[20%] md:top-[9vh] md:w-[min(1180px,92vw)]"
          style={{
            transform: 'scale(calc(1 + var(--land) * 0.04))',
            opacity: 'calc(1 - var(--land) * 0.55)',
          }}
        >
          <WorldMap mode="flight" active={f.a} met={met} planeRef={planeRef} />
        </div>

        <div
          className="absolute inset-x-0 top-[80px] px-4 md:top-[96px] md:px-[7vw]"
          style={{ opacity: 'calc(1 - var(--land))' }}
        >
          <p className="kicker">
            {LEG[id]?.day} · Chuyển sang chặng {f.chapter} / 4
          </p>
        </div>

        {/* Thẻ lên máy bay */}
        <div
          className="glass absolute inset-x-3 bottom-4 flex overflow-hidden rounded-[22px] md:inset-x-auto md:bottom-[7vh] md:left-[7vw] md:w-[640px]"
          style={{
            opacity: 'calc(var(--pass) * (1 - var(--land)))',
            transform: 'translateY(calc((1 - var(--pass)) * 60px))',
          }}
        >
          <div className="flex-1 p-5 md:p-6">
            <div className="flex items-center justify-between text-[11px] tracking-[0.16em] text-white/60 uppercase">
              <span>Thẻ lên máy bay · BioNexus</span>
              <span className="font-mono">Chặng {f.chapter}</span>
            </div>
            <div className="mt-4 flex items-end justify-between gap-3">
              <div>
                <p className="font-mono text-[44px] leading-none font-semibold tracking-tight md:text-[56px]">
                  {f.from.code}
                </p>
                <p className="mt-1 text-sm text-white/70">{f.from.city}</p>
              </div>
              <div className="mb-6 flex flex-1 items-center gap-2 text-[#6ee7b7]">
                <span className="h-px flex-1 border-t border-dashed border-[#6ee7b7]/60" />
                <Plane className="size-5" aria-hidden="true" />
                <span className="h-px flex-1 border-t border-dashed border-[#6ee7b7]/60" />
              </div>
              <div className="text-right">
                <p className="font-mono text-[44px] leading-none font-semibold tracking-tight text-[#c4f5de] md:text-[56px]">
                  {f.to.code}
                </p>
                <p className="mt-1 text-sm text-white/70">{f.to.city}</p>
              </div>
            </div>
            <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-white/10 pt-4 text-[13px]">
              <div>
                <dt className="text-[10px] tracking-wider text-white/50 uppercase">Hành khách</dt>
                <dd className="mt-1 truncate font-medium">
                  {user ? user.name : 'Khách thám hiểm'}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] tracking-wider text-white/50 uppercase">Quãng đường</dt>
                <dd className="mt-1 font-medium tabular-nums">
                  ≈ {km.toLocaleString('vi-VN')} km
                </dd>
              </div>
              <div>
                <dt className="text-[10px] tracking-wider text-white/50 uppercase">Giờ nơi đến</dt>
                <dd className="mt-1 font-medium tabular-nums">{localTime(f.tz)}</dd>
              </div>
            </dl>
          </div>
          <div className="hidden w-[150px] flex-col items-center justify-between border-l border-dashed border-white/20 p-5 md:flex">
            <p className="text-center text-[11px] tracking-[0.14em] text-white/55 uppercase">
              Điểm đến
            </p>
            <p className="text-center font-serif text-xl leading-tight">{ch.title}</p>
            <Barcode />
          </div>
        </div>

        {/* Hạ cánh: tiêu đề chặng mới */}
        <div
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-4 text-center"
          style={{
            opacity: 'var(--land)',
            transform: 'translateY(calc((1 - var(--land)) * 40px))',
          }}
        >
          <p className="kicker">Chặng {f.chapter} / 4</p>
          <h2 className="mx-auto mt-4 font-serif text-[clamp(56px,9vw,148px)] leading-[0.88] font-medium text-balance">
            {ch.title}
          </h2>
          <p className="mx-auto mt-6 flex flex-wrap justify-center gap-2">
            {ch.stations.map((sid) => {
              const leg = LEG[sid]!;
              const s = resolveJourneySpecies(leg.slug || 'axolotl', liveSpecies);
              return (
                <span key={sid} className="glass rounded-full px-4 py-2 text-sm">
                  {leg.stop} · {s.name}
                </span>
              );
            })}
          </p>
        </div>
        <Exit />
      </div>
    </section>
  );
}
