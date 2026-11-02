import React from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  IUCN_JOURNEY_STYLE,
  type JourneySpeciesView,
  type JourneyTipConfig,
} from '@/content/journey';
import { usePassport } from '@/hooks/usePassport';
import { StampMark } from './StampMark';

export function resolveTipHref(tip: JourneyTipConfig, s: JourneySpeciesView): string {
  switch (tip.kind) {
    case 'species-detail':
    case 'morphs':
      return `#/species/${s.id}`;
    case 'taxonomy':
      return `#/taxonomy/${s.nodeId}`;
    case 'iucn-filter':
      return `#/species?iucn=${tip.iucnCode || s.iucn}`;
    case 'marketplace':
      return '#/products';
    case 'seller-apply':
      return '#/seller/apply';
    case 'cart':
      return '#/cart';
    case 'orders':
      return '#/orders';
    case 'quick-search':
      return '#/species';
  }
}

export interface JournalProps {
  s: JourneySpeciesView;
  page: string;
  where: string;
  photo: string;
  tip?: JourneyTipConfig;
  className?: string;
}

// Trang Sổ tay thực địa ở mỗi trạm dừng
export function Journal({ s, page, where, photo, tip, className }: JournalProps): React.JSX.Element {
  const { openQuickSearch } = usePassport();
  const c = IUCN_JOURNEY_STYLE[s.iucn] ?? IUCN_JOURNEY_STYLE.LC;

  const handleTipClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (tip?.kind === 'quick-search') {
      e.preventDefault();
      openQuickSearch();
    }
  };

  return (
    <article
      className={cn(
        'glass pointer-events-auto absolute z-10 rounded-[24px] p-5 md:rounded-[28px] md:p-7',
        className
      )}
      style={{
        opacity: 'var(--journal)',
        transform: 'translateY(calc((1 - var(--journal)) * 64px))',
      }}
    >
      <StampMark
        n={page}
        where={where}
        className="-top-7 -right-3 max-md:size-24 md:-top-9 md:-right-6"
      />
      <div className="flex items-center justify-between text-[11px] tracking-[0.16em] text-white/60 uppercase">
        <span className="flex items-center gap-1.5">
          <BookOpen className="size-3.5 text-[#6ee7b7]" aria-hidden="true" />
          Sổ tay thực địa
        </span>
        <span className="font-mono">Trang {page}</span>
      </div>
      <h3 className="mt-2 font-serif text-[clamp(30px,3.6vw,48px)] leading-[0.95] font-medium">
        {s.name}
      </h3>
      <p className="mt-1 font-serif text-base text-[#c4f5de] italic md:text-lg">{s.sci}</p>
      <span
        className={cn(
          'mt-2.5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium',
          c.chip
        )}
      >
        <span className="size-1.5 rounded-full" style={{ background: c.dot }} />
        {s.iucn} · {c.label}
      </span>
      <dl className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10 text-xs ring-1 ring-white/10 md:mt-4 md:text-[13px]">
        {(
          [
            ['Nhiệt độ', s.temp],
            ['Độ ẩm', s.humidity],
            ['Sinh cảnh', s.habitat],
            ['Bản địa', s.origin],
          ] as const
        ).map(([k, v]) => (
          <div key={k} className="bg-[#06130e]/90 p-2.5 md:p-3">
            <dt className="text-[10px] tracking-[0.14em] text-white/55 uppercase">{k}</dt>
            <dd className="mt-0.5 font-medium text-white/95">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 hidden text-[14px] leading-relaxed text-white/80 md:block">{s.desc}</p>
      {tip && (
        <a
          href={resolveTipHref(tip, s)}
          onClick={handleTipClick}
          className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-white/6 px-3 py-2 text-xs text-white/85 md:hidden"
        >
          <span className="truncate">
            <strong className="text-[#9ff0cf]">Trên BioNexus:</strong> {tip.t}
          </span>
          <ArrowRight className="size-3.5 shrink-0 text-[#6ee7b7]" aria-hidden="true" />
        </a>
      )}
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/10 pt-3 text-xs text-white/55">
        <span className="truncate">Ảnh: {photo}</span>
        <a
          href={`#/species/${s.id}`}
          className="inline-flex shrink-0 items-center gap-1 font-medium text-[#6ee7b7] hover:underline"
        >
          Hồ sơ loài <ArrowRight className="size-3.5" aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}
