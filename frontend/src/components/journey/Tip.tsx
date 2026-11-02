import React from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { distanceKm, fmtLL } from '@/lib/geo';
import type {
  JourneyLeg,
  JourneySpeciesView,
  JourneyTipConfig,
} from '@/content/journey';
import { usePassport } from '@/hooks/usePassport';
import { resolveTipHref } from './Journal';
import { TripImg } from './TripImg';

export interface StationTitleProps {
  leg: JourneyLeg;
  from?: { city: string; ll: readonly [number, number] };
  title: React.ReactNode;
  children?: React.ReactNode;
}

// Tiêu đề trạm xuất hiện đầu cảnh rồi nhường chỗ cho màn lộ diện loài
export function StationTitle({
  leg,
  from,
  title,
  children,
}: StationTitleProps): React.JSX.Element {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-[22vh] px-4 md:top-[22vh] md:px-[7vw]"
      style={{
        opacity: 'calc(1 - var(--leave))',
        transform: 'translateY(calc(var(--leave) * -56px))',
      }}
    >
      <p className="kicker">
        {leg.day}
        {leg.stop ? ` · ${leg.stop}` : ''}
      </p>
      <h2 className="mt-3 font-serif text-[clamp(48px,7.2vw,116px)] leading-[0.9] font-medium">
        {title}
      </h2>
      <p className="mt-4 font-mono text-sm text-[#9ff0cf]">
        {leg.place} · {fmtLL(leg.ll[0], leg.ll[1])}
        {from
          ? ` · bay từ ${from.city}, ${distanceKm(from.ll, leg.ll).toLocaleString('vi-VN')} km`
          : ''}
      </p>
      {children && (
        <p className="mt-3 max-w-xl text-lg leading-relaxed text-white/85">{children}</p>
      )}
    </div>
  );
}

export interface TipProps {
  tip: JourneyTipConfig;
  s: JourneySpeciesView;
  className?: string;
}

// Thẻ nhỏ giới thiệu tính năng của BioNexus gắn với từng trạm dừng
export function Tip({ tip, s, className }: TipProps): React.JSX.Element | null {
  const { openQuickSearch } = usePassport();
  if (!tip) return null;

  const href = resolveTipHref(tip, s);
  const handleCtaClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (tip.kind === 'quick-search') {
      e.preventDefault();
      openQuickSearch();
    }
  };

  return (
    <aside
      className={cn(
        'glass pointer-events-auto absolute z-10 hidden w-[360px] rounded-[20px] p-4 text-xs md:block',
        className
      )}
      style={{
        opacity: 'var(--journal)',
        transform: 'translateY(calc((1 - var(--journal)) * 48px))',
      }}
    >
      <p className="text-[10px] font-semibold tracking-[0.18em] text-[#9ff0cf] uppercase">
        Trên BioNexus · {tip.n}
      </p>
      <p className="mt-1 text-sm font-semibold text-white">{tip.t}</p>
      <p className="mt-1 leading-relaxed text-white/75">{tip.d}</p>

      {tip.kind === 'taxonomy' && (
        <div className="mt-2.5 flex flex-wrap items-center gap-1 text-[11px] text-white/85">
          {[
            'Giới Thực vật',
            'Ngành Thực vật có mạch',
            'Lớp Hai lá mầm',
            'Bộ Cẩm chướng',
            'Họ Nắp ấm',
            'Chi Nắp ấm',
          ].map((r, i) => (
            <span key={r} className="inline-flex items-center gap-1">
              {i > 0 && <span className="text-white/35">›</span>}
              <span className="rounded-full bg-white/8 px-2 py-0.5">{r}</span>
            </span>
          ))}
        </div>
      )}

      {tip.kind === 'iucn-filter' && (
        <div className="mt-2.5 grid grid-cols-5 gap-1 text-center font-mono text-[10px]">
          {(
            [
              ['LC', 'bg-emerald-500/30 text-white/70'],
              ['NT', 'bg-lime-500/30 text-white/70'],
              ['VU', 'bg-amber-400/30 text-white/70'],
              ['EN', 'bg-orange-400 text-[#1a0d04] font-bold ring-2 ring-orange-200'],
              ['CR', 'bg-red-500/30 text-white/70'],
            ] as const
          ).map(([c, cls]) => (
            <span key={c} className={cn('rounded-md py-1', cls)}>
              {c}
            </span>
          ))}
        </div>
      )}

      {tip.kind === 'quick-search' && (
        <button
          type="button"
          onClick={() => openQuickSearch()}
          className="mt-2.5 flex w-full items-center gap-2 rounded-xl bg-black/35 px-3 py-2 text-left font-mono text-white/80 ring-1 ring-white/15 transition hover:ring-[#6ee7b7]/60"
        >
          <kbd className="rounded bg-white/12 px-1.5 py-0.5 text-[10px]">⌘K</kbd>
          <span className="truncate">Dionaea muscipula…</span>
          <span className="ml-auto text-[10px] text-[#6ee7b7]">Enter</span>
        </button>
      )}

      {tip.kind === 'marketplace' && (
        <div className="mt-2.5 flex items-center gap-2.5 rounded-xl bg-black/30 p-2 ring-1 ring-white/10">
          <TripImg
            name="axolotl2"
            alt=""
            aria-hidden="true"
            sizes="96px"
            className="size-10 rounded-lg object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-white">Axolotl Leucistic (5 cm)</p>
            <p className="text-[11px] text-white/60">BioGreen Exotic</p>
          </div>
          <span className="font-mono font-semibold text-white">450.000 ₫</span>
        </div>
      )}

      {tip.kind === 'morphs' && (
        <div className="mt-2.5 flex flex-wrap gap-1.5 text-[11px]">
          {[
            'Ball Python Normal · 2.500.000 ₫',
            'Ball Python Piebald · 8.500.000 ₫',
          ].map((m) => (
            <span key={m} className="rounded-full bg-white/8 px-2.5 py-1 text-white/85">
              {m}
            </span>
          ))}
        </div>
      )}

      {tip.kind === 'seller-apply' && (
        <div className="mt-2.5 flex flex-wrap gap-1.5 text-[11px]">
          {['BioGreen Exotic · TP.HCM', 'Carnivora Garden · Đà Lạt'].map((sh) => (
            <span
              key={sh}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/8 px-2.5 py-1 text-white/85"
            >
              <span className="size-1.5 rounded-full bg-[#6ee7b7]" />
              {sh}
            </span>
          ))}
        </div>
      )}

      <a
        href={href}
        onClick={handleCtaClick}
        className="mt-2.5 inline-flex items-center gap-1 font-medium text-[#6ee7b7] hover:underline"
      >
        {tip.cta} <ArrowRight className="size-3.5" aria-hidden="true" />
      </a>
    </aside>
  );
}
