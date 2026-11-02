import React, { useRef } from 'react';
import { toast } from 'sonner';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { ProductDto, SpeciesDto } from '@/types/api';
import { formatVnd } from '@/lib/parseEnvironmentSpecs';
import { clamp, distanceKm, today } from '@/lib/geo';
import {
  CHAPTERS,
  JOURNEY_CREDITS,
  JOURNEY_SPECIES_BASE,
  LEG,
  resolveJourneySpecies,
  ROUTE,
  SHORT_STATION_NAMES,
  VISAS,
  type VisaConfig,
} from '@/content/journey';
import { usePassport } from '@/hooks/usePassport';
import { Motes } from '@/components/journey/Motes';
import { StampMark } from '@/components/journey/StampMark';
import { TripImg } from '@/components/journey/TripImg';
import { useScrub } from '@/components/journey/useScrub';
import { WorldMap } from '@/components/journey/WorldMap';

const RECAP_RANGES = {
  draw: [0, 0.45] as const,
  txt: [0.3, 0.5] as const,
  exit: [0.9, 1] as const,
};

export function Recap(): React.JSX.Element {
  const ref = useRef<HTMLElement | null>(null);
  const { met } = usePassport();
  useScrub(ref, RECAP_RANGES);

  const total = ROUTE.slice(1).reduce(
    (sum, l, i) => sum + distanceKm(ROUTE[i]!.ll, l.ll),
    0
  );

  return (
    <section id="ket" ref={ref} className="relative h-[220vh]">
      <div className="sticky top-0 h-svh overflow-hidden bg-[radial-gradient(ellipse_at_50%_45%,#0b1f18_0%,#03070a_72%)]">
        <Motes kind="star" />
        <div
          className="absolute inset-x-0 top-[16vh] mx-auto w-[min(1200px,150vw)] max-md:-translate-x-[16%] md:w-[min(1200px,92vw)]"
          style={{ opacity: 'calc(0.35 + (1 - var(--txt)) * 0.65)' }}
        >
          <WorldMap mode="draw" met={met} />
        </div>
        <div
          className="absolute inset-x-0 bottom-[12vh] px-4 text-center"
          style={{
            opacity: 'var(--txt)',
            transform: 'translateY(calc((1 - var(--txt)) * 40px))',
          }}
        >
          <p className="kicker">Ngày 10 · Hết hành trình</p>
          <h2 className="mx-auto mt-4 font-serif text-[clamp(52px,8vw,128px)] leading-[0.88] font-medium text-balance">
            Mười ngày, chín loài
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/85">
            ≈ {total.toLocaleString('vi-VN')} km qua 4 chặng. Bạn đã gặp {met.length} trên 9 loài
            trong bách khoa BioNexus.
          </p>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 bg-[#040a07]"
          style={{ opacity: 'var(--exit)' }}
        />
      </div>
    </section>
  );
}

const BOOK_RANGES = {
  open: [0, 0.14] as const,
  stamps: [0.14, 0.72] as const,
  exit: [0.92, 1] as const,
};

function Visa({
  v,
  got,
  n,
  liveSpecies,
}: {
  v: VisaConfig;
  got: boolean;
  n: number;
  liveSpecies?: SpeciesDto[];
}): React.JSX.Element {
  const leg = LEG[v.id]!;
  const s = resolveJourneySpecies(leg.slug || 'axolotl', liveSpecies);
  const shape =
    v.shape === 'circle'
      ? 'aspect-square rounded-full'
      : v.shape === 'oval'
        ? 'aspect-[1.45] rounded-[50%]'
        : 'aspect-[1.35] rounded-[8px]';

  return (
    <div
      className="absolute w-[30%] md:w-[40%]"
      style={{
        left: `${v.x}%`,
        top: `${v.y}%`,
        transform: `rotate(${v.rot}deg)`,
      }}
    >
      {got ? (
        <div
          data-visa={n}
          className={cn(
            'visa flex flex-col items-center justify-center border-[3px] p-1 text-center mix-blend-multiply',
            shape
          )}
          style={{
            color: v.ink,
            borderColor: v.ink,
            boxShadow: `inset 0 0 0 3px #efe9dc, inset 0 0 0 4.5px ${v.ink}`,
          }}
        >
          <span className="text-[7px] font-bold tracking-[0.16em] md:text-[10px]">
            TRẠM {String(n).padStart(2, '0')}
          </span>
          <span className="font-serif text-[11px] leading-tight font-semibold md:text-[17px]">
            {s.name}
          </span>
          <span className="text-[6px] font-bold tracking-[0.12em] md:text-[9px]">
            {SHORT_STATION_NAMES[v.id]} · {today()}
          </span>
        </div>
      ) : (
        <div
          className={cn(
            'flex items-center justify-center border-2 border-dashed border-[#1d2a24]/25 p-2 text-center text-[8px] text-[#1d2a24]/45 md:text-[11px]',
            shape
          )}
        >
          Chưa có dấu · Trạm {String(n).padStart(2, '0')}
        </div>
      )}
    </div>
  );
}

export function PassportBook({
  liveSpecies,
}: {
  liveSpecies?: SpeciesDto[];
}): React.JSX.Element {
  const ref = useRef<HTMLElement | null>(null);
  const { met, user } = usePassport();

  useScrub(ref, BOOK_RANGES, (p, el) => {
    const k =
      clamp((p - BOOK_RANGES.stamps[0]) / (BOOK_RANGES.stamps[1] - BOOK_RANGES.stamps[0])) *
      VISAS.length;
    el.querySelectorAll<HTMLElement>('[data-visa]').forEach((d) => {
      if (Number(d.dataset.visa) <= Math.ceil(k)) d.setAttribute('data-on', '');
      else d.removeAttribute('data-on');
    });
  });

  const renderPage = (i: 0 | 1) => (
    <div
      className="relative aspect-[1.2] flex-1 bg-[#efe9dc] md:aspect-[0.72]"
      style={{
        backgroundImage:
          'repeating-radial-gradient(circle at 50% 120%, rgba(16,94,74,.07) 0 1px, transparent 1px 9px)',
      }}
    >
      <p className="absolute inset-x-4 top-3 flex justify-between text-[7px] font-bold tracking-[0.18em] text-[#10594a] md:top-5 md:text-[10px]">
        <span>HỘ CHIẾU LOÀI</span>
        <span>{i === 0 ? 'THỊ THỰC · 1' : 'THỊ THỰC · 2'}</span>
      </p>
      <div className="absolute inset-x-[6%] top-[9%] bottom-[8%]">
        {VISAS.filter((v) => v.page === i).map((v) => {
          const leg = LEG[v.id]!;
          return (
            <Visa
              key={v.id}
              v={v}
              n={VISAS.indexOf(v) + 1}
              got={Boolean(leg.slug && met.includes(leg.slug))}
              liveSpecies={liveSpecies}
            />
          );
        })}
      </div>
      <p className="absolute inset-x-4 bottom-3 text-center font-mono text-[7px] text-[#1d2a24]/55 md:bottom-4 md:text-[10px]">
        {i === 0 ? '— 2 —' : '— 3 —'}
      </p>
    </div>
  );

  return (
    <section id="ho-chieu" ref={ref} className="relative h-[240vh]">
      <div className="sticky top-0 flex h-svh flex-col items-center justify-center gap-8 overflow-hidden px-4 md:px-[7vw]">
        <div className="text-center">
          <p className="kicker">Hộ chiếu loài · {user ? user.name : 'Khách thám hiểm'}</p>
          <h2 className="mt-3 font-serif text-[clamp(40px,5.4vw,84px)] leading-[0.92] font-medium">
            {met.length === 9 ? 'Đủ chín con dấu' : `${met.length} trên 9 con dấu`}
          </h2>
        </div>
        <div
          className="flex w-[min(980px,100%)] flex-col overflow-hidden rounded-[12px] shadow-[0_60px_120px_-40px_rgba(0,0,0,.95)] ring-1 ring-black/20 md:flex-row"
          style={{
            transform:
              'perspective(2000px) rotateX(calc((1 - var(--open)) * 24deg)) scale(calc(0.92 + var(--open) * 0.08))',
            opacity: 'var(--open)',
          }}
        >
          {renderPage(0)}
          <div className="h-px bg-[#1d2a24]/25 shadow-[0_0_18px_rgba(0,0,0,.35)] md:h-auto md:w-px" />
          {renderPage(1)}
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 bg-[#040a07]"
          style={{ opacity: 'var(--exit)' }}
        />
      </div>
    </section>
  );
}

const KEEP_IMG_BY_SLUG: Record<string, string> = {
  axolotl: 'axolotl2',
  'ball-python': 'ballpython',
  'nepenthes-rajah': 'rajah2',
  'leopard-gecko': 'gecko2',
  'venus-flytrap': 'venus',
  'nepenthes-ampullaria': 'ampullaria2',
  'burmese-python': 'python',
  'bearded-dragon': 'dragon',
  'hermann-tortoise': 'hermann',
};

const FALLBACK_APPROVED_PRODUCTS: Array<{
  id: number;
  name: string;
  shop: string;
  price: number;
  slug: string;
  sci: string;
}> = [
  {
    id: 1,
    name: 'Axolotl Leucistic (5 cm)',
    shop: 'BioGreen Exotic',
    price: 450000,
    slug: 'axolotl',
    sci: 'Ambystoma mexicanum',
  },
  {
    id: 2,
    name: 'Axolotl Golden Albino (8 cm)',
    shop: 'BioGreen Exotic',
    price: 650000,
    slug: 'axolotl',
    sci: 'Ambystoma mexicanum',
  },
  {
    id: 3,
    name: 'Ball Python Normal CB25',
    shop: 'BioGreen Exotic',
    price: 2500000,
    slug: 'ball-python',
    sci: 'Python regius',
  },
  {
    id: 4,
    name: 'Ball Python Piebald CB25',
    shop: 'BioGreen Exotic',
    price: 8500000,
    slug: 'ball-python',
    sci: 'Python regius',
  },
  {
    id: 5,
    name: 'Nepenthes rajah mô cấy (cỡ S)',
    shop: 'Carnivora Garden',
    price: 1200000,
    slug: 'nepenthes-rajah',
    sci: 'Nepenthes rajah',
  },
  {
    id: 6,
    name: 'Leopard Gecko High Yellow',
    shop: 'BioGreen Exotic',
    price: 900000,
    slug: 'leopard-gecko',
    sci: 'Eublepharis macularius',
  },
  {
    id: 7,
    name: 'Venus Flytrap B52 (chậu 9 cm)',
    shop: 'Carnivora Garden',
    price: 350000,
    slug: 'venus-flytrap',
    sci: 'Dionaea muscipula',
  },
];

export interface CertificateProps {
  liveProducts?: ProductDto[];
  liveSpecies?: SpeciesDto[];
  onAddCartProduct?: (productId: number, productName: string) => void;
}

export function Certificate({
  liveProducts,
  liveSpecies,
  onAddCartProduct,
}: CertificateProps): React.JSX.Element {
  const { met, user } = usePassport();
  const done = met.length === 9;

  // Ghép danh sách sản phẩm đã duyệt từ API thật với loài tương ứng
  const keepItems = (() => {
    const approved = liveProducts?.filter((p) => p.status === 'APPROVED');
    if (approved && approved.length > 0) {
      return approved.map((p) => {
        const spDto = liveSpecies?.find((s) => s.id === p.speciesId);
        const sci = spDto?.scientificName || 'Ambystoma mexicanum';
        const baseMatch = Object.values(JOURNEY_SPECIES_BASE).find(
          (b) => b.sci.toLowerCase() === sci.toLowerCase() || b.id === p.speciesId
        );
        const slug = baseMatch?.slug || 'axolotl';
        return {
          id: p.id,
          name: p.productName,
          shop: p.shopName || 'BioGreen Exotic',
          price: p.price,
          slug,
          sci: baseMatch?.sci || sci,
        };
      });
    }
    return FALLBACK_APPROVED_PRODUCTS;
  })();

  return (
    <>
      <section className="px-4 pt-24 pb-16 md:px-[7vw]">
        <div className="relative mx-auto max-w-[920px] rounded-[28px] border border-[#d8c591]/40 bg-[linear-gradient(160deg,#0d2a20,#06140f)] p-8 text-center shadow-[0_60px_120px_-40px_rgba(0,0,0,.9)] md:p-14">
          <div className="pointer-events-none absolute inset-3 rounded-[20px] border border-[#d8c591]/25" />
          <p className="kicker text-[#d8c591]!">Chứng nhận</p>
          <h2 className="mt-4 font-serif text-[clamp(40px,5vw,76px)] leading-[0.95] font-medium">
            Nhà thám hiểm BioNexus
          </h2>
          <p className="mt-6 text-white/70">Trao cho</p>
          <p className="mt-2 font-serif text-[clamp(32px,4vw,56px)] text-[#c4f5de] italic">
            {user ? user.name : 'Bạn'}
          </p>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/80">
            {done
              ? `đã hoàn thành Hành trình 9 loài qua ${CHAPTERS.length} chặng, ngày ${today()}.`
              : `đã gặp ${met.length} trên 9 loài. Đi tiếp lúc nào cũng được, hộ chiếu vẫn giữ các dấu đã có.`}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={user ? '#/' : '#/register'}
              className="inline-flex items-center gap-2 rounded-full bg-[#6ee7b7] px-6 py-3.5 font-semibold text-[#03140d] transition hover:bg-[#8ff0c8]"
            >
              {user ? 'Bắt đầu dùng BioNexus' : 'Đăng ký để lưu hộ chiếu'}{' '}
              <ArrowRight className="size-4" aria-hidden="true" />
            </a>
            <a
              href="#/species"
              className="rounded-full border border-white/20 px-6 py-3.5 font-medium transition hover:bg-white/10"
            >
              Mở bách khoa 9 loài
            </a>
          </div>
          {done && (
            <div data-stamped="">
              <StampMark
                n="9/9"
                where="HÀNH TRÌNH 9 LOÀI"
                className="-top-10 -right-4 md:-top-12 md:-right-10"
              />
            </div>
          )}
        </div>
      </section>

      <section className="px-4 pb-24 md:px-[7vw]">
        <div className="mx-auto max-w-[1240px]">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="kicker">Mang chuyến đi về nhà</p>
              <h2 className="mt-3 font-serif text-[clamp(38px,4.5vw,64px)] leading-[0.95] font-medium text-balance">
                Rừng để lại cho rừng
              </h2>
            </div>
            <p className="max-w-md text-white/75">
              Trên sàn chỉ có cây con và cá thể nhân giống, đã qua kiểm duyệt. Đây là những loài
              vừa gặp đang được bán.
            </p>
          </div>
          <div className="mt-10 flex snap-x gap-4 overflow-x-auto pb-4 [scrollbar-width:thin]">
            {keepItems.map((p) => {
              const tripKey = KEEP_IMG_BY_SLUG[p.slug] || 'axolotl2';
              return (
                <article
                  key={p.id}
                  className="glass w-[272px] shrink-0 snap-start overflow-hidden rounded-[22px]"
                >
                  <TripImg
                    name={tripKey}
                    alt={p.name}
                    sizes="280px"
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <div className="p-4">
                    <p className="text-[13px] text-white/60">{p.shop}</p>
                    <h3 className="mt-1 line-clamp-2 min-h-[2.6em] font-semibold">
                      <a href={`#/products/${p.id}`} className="hover:text-[#6ee7b7] transition">
                        {p.name}
                      </a>
                    </h3>
                    <p className="mt-0.5 font-serif text-[#c4f5de] italic">{p.sci}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-semibold tabular-nums">{formatVnd(p.price)}</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (onAddCartProduct) {
                            onAddCartProduct(p.id, p.name);
                          } else {
                            toast.success(`Đã thêm “${p.name}” vào giỏ`);
                          }
                        }}
                        className="rounded-full border border-white/20 px-3.5 py-1.5 text-sm font-medium transition hover:bg-white/10"
                      >
                        Thêm vào giỏ
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-4 pt-12 pb-32 text-sm text-white/60 md:px-[7vw]">
        <div className="mx-auto max-w-[1240px]">
          <p className="font-medium text-white/80">
            Ảnh trong hành trình (Wikimedia Commons, đã kiểm tra tồn tại và giấy phép)
          </p>
          <ul className="mt-4 grid gap-x-8 gap-y-2 md:grid-cols-2">
            {JOURNEY_CREDITS.map((c) => (
              <li
                key={c.key}
                className="truncate"
                title={`${c.title} · ${c.author} · ${c.license}`}
              >
                <a
                  href={c.source}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white hover:underline"
                >
                  {c.title.replace(/\.(jpe?g|png)$/i, '')}
                </a>{' '}
                · {c.author} · {c.license}
              </li>
            ))}
          </ul>
          <p className="mt-8">BioNexus · Đồ án Aptech 2026 · Mẫu S, Hành trình 9 loài</p>
        </div>
      </footer>
    </>
  );
}
