import React from 'react';
import { cn } from '@/lib/cn';
import type { SpeciesDto } from '@/types/api';
import { CHAPTERS, LEG, resolveJourneySpecies } from '@/content/journey';

export interface ChapterRailProps {
  active: string;
  met: string[];
  liveSpecies?: SpeciesDto[];
}

// Đường lộ trình 4 chặng và 9 trạm dọc mép trái màn hình lớn
export function ChapterRail({ active, met, liveSpecies }: ChapterRailProps): React.JSX.Element {
  const cur = LEG[active]?.chapter;
  const hide = active === 'mo-dau' || active === 'tong-quan';

  return (
    <nav
      aria-label="Các chặng trong hành trình"
      className={cn(
        'fixed top-1/2 left-4 z-30 hidden -translate-y-1/2 flex-col gap-3 text-xs transition duration-300 lg:flex',
        hide && 'pointer-events-none opacity-0'
      )}
    >
      {CHAPTERS.map((ch) => {
        const on = cur === ch.n;
        return (
          <div key={ch.n} className="group flex flex-col gap-1.5">
            <a
              href={`#${ch.entry}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(ch.entry)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-2 font-mono text-[11px]"
            >
              <span className={cn('transition', on ? 'font-bold text-[#6ee7b7]' : 'text-white/40')}>
                {ch.n}
              </span>
              <span
                className={cn(
                  'glass rounded-full px-2.5 py-0.5 font-sans text-xs transition',
                  on
                    ? 'opacity-100'
                    : 'pointer-events-none -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                )}
              >
                {ch.title}
              </span>
            </a>
            <div className="ml-1 flex flex-col gap-1.5 border-l border-white/15 pl-2">
              {ch.stations.map((sid) => {
                const leg = LEG[sid]!;
                const slug = leg.slug || 'axolotl';
                const s = resolveJourneySpecies(slug, liveSpecies);
                const got = met.includes(slug);
                const here = active === sid;
                return (
                  <a
                    key={sid}
                    href={`#${sid}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(sid)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    title={`${leg.stop} · ${s.name}`}
                    className="flex items-center gap-2"
                  >
                    <span
                      className={cn(
                        'size-2 rounded-full transition',
                        here
                          ? 'scale-125 bg-[#6ee7b7] shadow-[0_0_10px_#6ee7b7]'
                          : got
                            ? 'bg-[#6ee7b7]/80'
                            : 'bg-white/25 hover:bg-white/60'
                      )}
                    />
                  </a>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
