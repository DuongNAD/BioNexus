import React, { useRef } from 'react';
import { Binoculars, Mountain, Ship, Stamp } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { SpeciesDto } from '@/types/api';
import { clamp, fmtLL, lerp, smooth, sub } from '@/lib/geo';
import { LEG, resolveJourneySpecies, TIPS } from '@/content/journey';
import { Journal } from '@/components/journey/Journal';
import { Motes } from '@/components/journey/Motes';
import { StationTitle, Tip } from '@/components/journey/Tip';
import { TripImg } from '@/components/journey/TripImg';
import { Exit, useScrub, useStamp } from '@/components/journey/useScrub';

const CUA_RANGES = {
  walk: [0, 0.7] as const,
  title: [0, 0.36] as const,
  card: [0.34, 0.62] as const,
  exit: [0.9, 1] as const,
};

export function Gate({ liveSpecies }: { liveSpecies?: SpeciesDto[] }): React.JSX.Element {
  const ref = useRef<HTMLElement | null>(null);
  useScrub(ref, CUA_RANGES);

  const s1 = resolveJourneySpecies('burmese-python', liveSpecies);
  const s2 = resolveJourneySpecies('nepenthes-ampullaria', liveSpecies);
  const s3 = resolveJourneySpecies('nepenthes-rajah', liveSpecies);

  const stops = [
    { d: 'Ngày 01', p: 'Cát Tiên, Việt Nam', s: `${s1.name} · ${s1.sci}`, img: 'python' },
    {
      d: 'Ngày 02',
      p: 'Sông Tembeling, Taman Negara',
      s: 'Đi thuyền, qua cầu treo trên tán rừng',
    },
    { d: 'Ngày 03', p: 'Rừng thấp Borneo', s: `${s2.name} · ${s2.sci}`, img: 'ampullaria' },
    { d: 'Ngày 04', p: 'Núi Kinabalu, 1.500–2.650 m', s: `${s3.name} · ${s3.sci}`, img: 'rajah' },
  ];

  return (
    <section id="cua-rung" ref={ref} className="relative h-[300vh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <TripImg
          name="trail"
          alt="Đường mòn trong Vườn quốc gia Cúc Phương"
          className="absolute inset-0 size-full object-cover"
          style={{
            transformOrigin: '48% 54%',
            transform: 'scale(calc(1 + var(--walk) * 0.42))',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 mix-blend-screen"
          style={{
            opacity: 'calc(0.55 - var(--walk) * 0.25)',
            background:
              'conic-gradient(from 196deg at 52% -8%, transparent 0deg, rgba(190,255,220,.22) 9deg, transparent 19deg, rgba(190,255,220,.14) 29deg, transparent 41deg)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#040a07] via-[#040a07]/20 to-[#040a07]/35" />
        <Motes kind="pollen" />

        <div
          className="absolute inset-x-0 bottom-[12vh] px-4 md:px-[7vw]"
          style={{
            opacity: 'calc(1 - var(--title))',
            transform: 'translateY(calc(var(--title) * -48px))',
          }}
        >
          <p className="kicker">Chặng 1 / 4 · Ngày 01–04 · Đông Nam Á</p>
          <h2 className="mt-4 font-serif text-[clamp(48px,8.5vw,136px)] leading-[0.88] font-medium tracking-[-0.02em]">
            Bước vào
            <br />
            <span className="text-[#c4f5de] italic">rừng mưa nhiệt đới</span>
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 md:text-lg">
            Từ đường mòn Cúc Phương xuôi vào Cát Tiên, vượt sông Tembeling sang Borneo rồi leo lên
            rừng mây Kinabalu.
          </p>
        </div>

        <div
          className="glass absolute inset-x-4 top-1/2 -translate-y-1/2 rounded-[26px] p-6 md:right-[7vw] md:left-auto md:w-[460px] md:p-8"
          style={{
            opacity: 'calc(var(--card) * (1 - var(--exit)))',
            transform: 'translateY(calc(-50% + (1 - var(--card)) * 48px))',
          }}
        >
          <p className="kicker">Lịch trình · Chặng 1 / 4</p>
          <h3 className="mt-2 font-serif text-3xl font-medium">Rừng mưa Đông Nam Á</h3>
          <ol className="mt-5 divide-y divide-white/10">
            {stops.map((x) => (
              <li key={x.d} className="flex items-center gap-3.5 py-3">
                <span className="w-16 shrink-0 font-mono text-xs text-[#6ee7b7]">{x.d}</span>
                {x.img ? (
                  <TripImg
                    name={x.img}
                    alt=""
                    aria-hidden="true"
                    sizes="96px"
                    className="size-11 shrink-0 rounded-full object-cover ring-1 ring-white/20"
                  />
                ) : (
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white/8 ring-1 ring-white/15">
                    <Ship className="size-4 text-[#6ee7b7]" aria-hidden="true" />
                  </span>
                )}
                <div className="min-w-0">
                  <p className="font-medium text-white">{x.p}</p>
                  <p className="truncate text-xs text-white/65">{x.s}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-4 flex items-center gap-2 text-xs text-white/65">
            <Stamp className="size-3.5 text-[#6ee7b7]" aria-hidden="true" />
            Gặp được loài nào, hộ chiếu đóng dấu loài đó.
          </p>
        </div>
        <Exit />
      </div>
    </section>
  );
}

// Trạm 01: ống nhòm dò qua nền rừng rồi dừng ở đầu trăn đất
const ST1_RANGES = {
  leave: [0.14, 0.22] as const,
  appear: [0.12, 0.22] as const,
  lock: [0.46, 0.56] as const,
  open: [0.56, 0.7] as const,
  journal: [0.64, 0.76] as const,
  exit: [0.94, 1] as const,
};
const LENS_IMG = { w: 1920, h: 1280, px: 0.39, py: 0.54, span: [0.14, 0.48] as const };

function LensRing({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 200 200"
      aria-hidden="true"
      style={style}
      className={cn('pointer-events-none absolute inset-0 size-full', className)}
    >
      <circle cx="100" cy="100" r="97" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle
        cx="100"
        cy="100"
        r="90"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeDasharray="2 6"
      />
      {[0, 90, 180, 270].map((rot) => (
        <line
          key={rot}
          x1="100"
          y1="3"
          x2="100"
          y2="16"
          stroke="currentColor"
          strokeWidth="1.5"
          transform={`rotate(${rot} 100 100)`}
        />
      ))}
    </svg>
  );
}

export function Station1({ liveSpecies }: { liveSpecies?: SpeciesDto[] }): React.JSX.Element {
  const ref = useRef<HTMLElement | null>(null);
  const stamp = useStamp('burmese-python', 0.74);

  useScrub(ref, ST1_RANGES, (p, el) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const k = Math.max(vw / LENS_IMG.w, vh / LENS_IMG.h);
    const iw = LENS_IMG.w * k;
    const ih = LENS_IMG.h * k;
    const tx = (vw - iw) / 2 + LENS_IMG.px * iw;
    const ty = (vh - ih) / 2 + LENS_IMG.py * ih;
    const pts: readonly [number, number][] = [
      [vw * 0.22, vh * 0.34],
      [vw * 0.72, vh * 0.62],
      [tx, ty],
    ];
    const s =
      clamp((p - LENS_IMG.span[0]) / (LENS_IMG.span[1] - LENS_IMG.span[0])) * 2;
    const seg = Math.min(1, Math.floor(s));
    const f = smooth(clamp(s - seg));
    const x = lerp(pts[seg]![0], pts[seg + 1]![0], f);
    const y = lerp(pts[seg]![1], pts[seg + 1]![1], f);
    const open = smooth(sub(p, ST1_RANGES.open[0], ST1_RANGES.open[1]));
    const r0 = Math.min(vw, vh) * 0.21;
    const r = lerp(r0, Math.hypot(vw, vh), open);
    el.style.setProperty('--lx', `${x.toFixed(1)}px`);
    el.style.setProperty('--ly', `${y.toFixed(1)}px`);
    el.style.setProperty('--lr', `${r.toFixed(1)}px`);
    stamp(p, el);
  });

  const s = resolveJourneySpecies('burmese-python', liveSpecies);
  const leg = LEG['tram-1']!;

  return (
    <section id="tram-1" ref={ref} className="relative h-[400vh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <TripImg
          name="roots"
          alt="Rễ bạnh của cây cổ thụ ở Vườn quốc gia Cát Tiên"
          className="absolute inset-0 size-full object-cover"
          style={{ transform: 'scale(calc(1.06 + var(--p) * 0.1))' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#040a07] via-[#040a07]/30 to-[#040a07]/40" />
        <div
          className="absolute inset-0 bg-[#020604]"
          style={{ opacity: 'calc(var(--appear) * 0.55 * (1 - var(--open)))' }}
        />

        <StationTitle
          leg={leg}
          title={
            <>
              Ven rừng
              <br />
              Cát Tiên
            </>
          }
        >
          Rễ bạnh, lá mục, đất ẩm ven sông. Trăn đất sống trong những khu rừng như thế này, nhưng
          rất khó thấy: vằn nâu trên lưng hoà vào nền lá.
        </StationTitle>

        <TripImg
          name="python"
          alt="Trăn đất (Python bivittatus) nằm trên lá"
          className="absolute inset-0 size-full object-cover"
          style={{
            objectPosition: `${LENS_IMG.px * 100}% ${LENS_IMG.py * 100}%`,
            clipPath: 'circle(var(--lr) at var(--lx) var(--ly))',
          }}
        />
        <div
          className="absolute inset-0 bg-gradient-to-l from-[#040a07]/80 via-transparent to-transparent"
          style={{ opacity: 'var(--journal)' }}
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#040a07]/80 via-transparent to-transparent"
          style={{ opacity: 'var(--journal)' }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
          style={{
            left: 'var(--lx)',
            top: 'var(--ly)',
            width: 'calc(var(--lr) * 2)',
            height: 'calc(var(--lr) * 2)',
            opacity: 'calc(var(--appear) * (1 - var(--open)))',
          }}
        >
          <LensRing className="text-white/80" style={{ opacity: 'calc(1 - var(--lock))' }} />
          <LensRing
            className="text-[#6ee7b7]"
            style={{
              opacity: 'var(--lock)',
              transform: 'scale(calc(1.06 - var(--lock) * 0.06))',
            }}
          />
        </div>
        <div
          className="pointer-events-none absolute -translate-x-1/2 text-sm whitespace-nowrap"
          style={{
            left: 'var(--lx)',
            top: 'calc(var(--ly) + var(--lr) + 16px)',
            opacity: 'calc(var(--appear) * (1 - var(--open)))',
          }}
        >
          <span className="glass flex items-center gap-2 rounded-full px-3.5 py-1.5">
            <Binoculars className="size-4 text-[#6ee7b7]" aria-hidden="true" />
            <span className="grid">
              <span className="[grid-area:1/1]" style={{ opacity: 'calc(1 - var(--lock))' }}>
                Đang dò tìm…
              </span>
              <span className="text-[#9ff0cf] [grid-area:1/1]" style={{ opacity: 'var(--lock)' }}>
                Phát hiện · <em>Python bivittatus</em>
              </span>
            </span>
          </span>
        </div>

        <Journal
          s={s}
          page="01"
          where="CÁT TIÊN"
          photo="VQG Bardiya, Nepal · Shadow Ayush"
          tip={TIPS['burmese-python']}
          className="inset-x-3 bottom-3 md:inset-x-auto md:right-[6vw] md:bottom-[5vh] md:w-[430px]"
        />
        <Tip tip={TIPS['burmese-python']!} s={s} className="md:bottom-[6vh] md:left-[6vw]" />
        <Exit />
      </div>
    </section>
  );
}

// Quá cảnh: trượt ngang qua sông Tembeling và cầu treo, vé hành trình chạy theo
const SONG_RANGES = { pan: [0.12, 0.88] as const, exit: [0.94, 1] as const };
const TICKET = ['Cát Tiên', 'Taman Negara', 'Borneo'];

export function River(): React.JSX.Element {
  const ref = useRef<HTMLElement | null>(null);
  useScrub(ref, SONG_RANGES);

  const panels = [
    {
      img: 'boat',
      alt: 'Ngã ba sông Tembeling và sông Jelai ở Kuala Tembeling, rừng mưa hai bên bờ dưới trời xanh',
      k: 'Ngày 02 · Quá cảnh',
      t: 'Theo dòng Tembeling',
      d: 'Từ bến Kuala Tembeling, nơi sông Tembeling gặp sông Jelai, thuyền dài đưa đoàn ngược dòng vào Taman Negara, vườn quốc gia rừng mưa ở bán đảo Mã Lai.',
    },
    {
      img: 'walkway',
      alt: 'Cầu treo trên tán rừng ở Taman Negara',
      k: 'Ngày 02 · Buổi chiều',
      t: 'Đi trên tán rừng',
      d: 'Cầu treo nối những thân cây cao, cho nhìn xuống tầng rừng từ phía trên. Sáng mai, đoàn vượt biển sang Borneo.',
    },
  ];

  return (
    <section id="song" ref={ref} className="relative h-[280vh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <div
          className="flex h-full w-[200vw]"
          style={{ transform: 'translateX(calc(var(--pan) * -100vw))' }}
        >
          {panels.map((x) => (
            <div key={x.img} className="relative h-full w-screen overflow-hidden">
              <TripImg
                name={x.img}
                alt={x.alt}
                className="absolute top-0 -left-[15%] h-full w-[115%] max-w-none object-cover"
                style={{ transform: 'translateX(calc(var(--pan) * 13vw))' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#040a07] via-[#040a07]/25 to-[#040a07]/30" />
              {/* Ảnh trời sáng (sông Tembeling) cần thêm lớp tối phía chữ để đoạn mô tả đạt tương phản AA */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#040a07]/70 via-[#040a07]/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-[22vh] px-4 md:bottom-[24vh] md:px-[7vw]">
                <p className="kicker">{x.k}</p>
                <h2 className="mt-3 font-serif text-[clamp(52px,7.5vw,120px)] leading-[0.9] font-medium">
                  {x.t}
                </h2>
                <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/85">{x.d}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="glass absolute inset-x-4 bottom-6 rounded-2xl px-5 py-4 md:inset-x-[7vw] md:px-7">
          <div className="flex justify-between text-xs tracking-[0.14em] text-white/70 uppercase">
            {TICKET.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
          <div className="relative mt-3 h-6">
            <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-white/25" />
            <div
              className="absolute top-1/2 left-0 h-px -translate-y-px bg-[#6ee7b7]"
              style={{ width: 'calc(var(--p) * 100%)' }}
            />
            {[0, 50, 100].map((l) => (
              <span
                key={l}
                className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#6ee7b7] bg-[#040a07]"
                style={{ left: `${l}%` }}
              />
            ))}
            <span
              className="absolute top-1/2 grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#6ee7b7] text-[#03140d] shadow-[0_0_20px_#6ee7b7aa]"
              style={{ left: 'calc(var(--p) * 100%)' }}
            >
              <Ship className="size-3.5" aria-hidden="true" />
            </span>
          </div>
        </div>
        <Exit />
      </div>
    </section>
  );
}

// Trạm 02: cúi nhìn xuống nền rừng, ống kính lấy nét dần vào nắp ấm
const ST2_RANGES = {
  leave: [0.14, 0.22] as const,
  tilt: [0.16, 0.4] as const,
  frame: [0.28, 0.4] as const,
  focus: [0.42, 0.6] as const,
  journal: [0.6, 0.72] as const,
  exit: [0.94, 1] as const,
};

export function Station2({ liveSpecies }: { liveSpecies?: SpeciesDto[] }): React.JSX.Element {
  const ref = useRef<HTMLElement | null>(null);
  const stamp = useStamp('nepenthes-ampullaria', 0.72);
  useScrub(ref, ST2_RANGES, stamp);

  const s = resolveJourneySpecies('nepenthes-ampullaria', liveSpecies);
  const leg = LEG['tram-2']!;

  return (
    <section id="tram-2" ref={ref} className="relative h-[360vh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <TripImg
          name="swamp"
          alt="Rừng ngập nước vùng thấp ở Borneo"
          className="absolute inset-0 size-full object-cover"
          style={{
            transformOrigin: '50% 100%',
            transform: 'translateY(calc(var(--tilt) * -10%)) scale(calc(1.08 + var(--tilt) * 0.22))',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#040a07] via-[#040a07]/25 to-[#040a07]/40" />
        <div
          className="absolute inset-0 bg-[#020604]"
          style={{ opacity: 'calc(var(--tilt) * 0.55)' }}
        />

        <StationTitle
          leg={leg}
          title={
            <>
              Nền rừng
              <br />
              thấp Borneo
            </>
          }
        >
          Ánh sáng chỉ lọt qua kẽ lá. Ở tầng thấp nhất, nắp ấm Ampullaria mọc thành cụm sát mặt đất,
          túi bẫy tròn như những chiếc bình nhỏ.
        </StationTitle>

        <div
          className="absolute inset-x-3 top-[22vh] h-[38vh] overflow-hidden rounded-[28px] ring-1 ring-white/15 md:inset-x-auto md:top-[11vh] md:left-[6vw] md:h-[62vh] md:w-[min(56vw,920px)]"
          style={{
            opacity: 'var(--frame)',
            transform:
              'translateY(calc((1 - var(--frame)) * 70px)) scale(calc(0.96 + var(--frame) * 0.04))',
          }}
        >
          <TripImg
            name="ampullaria"
            alt="Cụm nắp ấm Ampullaria trên nền lá mục"
            sizes="(min-width: 768px) 56vw, 95vw"
            className="size-full object-cover"
            style={{
              filter:
                'blur(calc((1 - var(--focus)) * 16px)) brightness(calc(0.7 + var(--focus) * 0.3))',
              transform: 'scale(calc(1.14 - var(--focus) * 0.14))',
            }}
          />
          <div
            aria-hidden="true"
            className="absolute"
            style={{ inset: 'calc(10% + var(--focus) * 12%) calc(10% + var(--focus) * 16%)' }}
          >
            {[
              'top-0 left-0 border-t border-l',
              'top-0 right-0 border-t border-r',
              'bottom-0 left-0 border-b border-l',
              'right-0 bottom-0 border-r border-b',
            ].map((c) => (
              <span
                key={c}
                className={cn('absolute size-7 border-white/85', c)}
                style={{ opacity: 'calc(1 - var(--focus))' }}
              />
            ))}
            {[
              'top-0 left-0 border-t-2 border-l-2',
              'top-0 right-0 border-t-2 border-r-2',
              'bottom-0 left-0 border-b-2 border-l-2',
              'right-0 bottom-0 border-r-2 border-b-2',
            ].map((c) => (
              <span
                key={c}
                className={cn('absolute size-7 border-[#6ee7b7]', c)}
                style={{ opacity: 'var(--focus)' }}
              />
            ))}
            <span className="glass absolute -top-11 left-0 grid rounded-full px-3 py-1 text-[13px] whitespace-nowrap">
              <span className="[grid-area:1/1]" style={{ opacity: 'calc(1 - var(--focus))' }}>
                Đang lấy nét…
              </span>
              <span className="text-[#9ff0cf] [grid-area:1/1]" style={{ opacity: 'var(--focus)' }}>
                Đã lấy nét · <em>Nepenthes ampullaria</em>
              </span>
            </span>
          </div>
        </div>

        <Journal
          s={s}
          page="02"
          where="BORNEO"
          photo="Bernard Dupont"
          tip={TIPS['nepenthes-ampullaria']}
          className="inset-x-3 bottom-3 md:inset-x-auto md:right-[5vw] md:bottom-[5vh] md:w-[410px]"
        />
        <Tip
          tip={TIPS['nepenthes-ampullaria']!}
          s={s}
          className="md:bottom-[5vh] md:left-[6vw] md:w-[min(56vw,520px)]"
        />
        <Exit />
      </div>
    </section>
  );
}

// Trạm 03: leo núi (đồng hồ độ cao), vào rừng mây, sương tan để lộ nắp ấm Rajah
export const ST3_RANGES = {
  climb: [0, 0.34] as const,
  swap: [0.3, 0.42] as const,
  leave: [0.33, 0.41] as const,
  fogIn: [0.38, 0.46] as const,
  clear: [0.5, 0.7] as const,
  journal: [0.7, 0.8] as const,
  exit: [0.94, 1] as const,
};
const TAPE = { top: 2800, step: 50, px: 18 };

export function Station3({ liveSpecies }: { liveSpecies?: SpeciesDto[] }): React.JSX.Element {
  const ref = useRef<HTMLElement | null>(null);
  const altRef = useRef<HTMLSpanElement | null>(null);
  const stamp = useStamp('nepenthes-rajah', 0.8);

  useScrub(ref, ST3_RANGES, (p, el) => {
    const a = lerp(1500, 2650, sub(p, ST3_RANGES.climb[0], ST3_RANGES.climb[1]));
    if (altRef.current) altRef.current.textContent = Math.round(a).toLocaleString('vi-VN');
    el.style.setProperty('--tape', `${(((TAPE.top - a) / TAPE.step) * TAPE.px).toFixed(1)}px`);
    stamp(p, el);
  });

  const s = resolveJourneySpecies('nepenthes-rajah', liveSpecies);
  const leg = LEG['tram-3']!;
  const ticks = Array.from(
    { length: (TAPE.top - 1400) / TAPE.step + 1 },
    (_, k) => TAPE.top - k * TAPE.step
  );

  return (
    <section id="tram-3" ref={ref} className="relative h-[440vh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <TripImg
          name="summit"
          alt="Mây hình thành trên rừng mưa dưới chân núi Kinabalu"
          className="absolute inset-0 size-full object-cover"
          style={{
            opacity: 'calc(1 - var(--swap))',
            transformOrigin: '50% 30%',
            transform:
              'scale(calc(1.18 - var(--climb) * 0.16)) translateY(calc(var(--climb) * 3%))',
          }}
        />
        <TripImg
          name="ferns"
          alt="Dương xỉ thân gỗ trong rừng mây trên núi cao"
          className="absolute inset-0 size-full object-cover"
          style={{
            opacity: 'var(--swap)',
            transform: 'scale(calc(1.1 + var(--clear) * 0.06))',
          }}
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#040a07]/85 via-[#040a07]/30 to-transparent"
          style={{ opacity: 'calc(1 - var(--leave))' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#040a07] via-transparent to-[#040a07]/40" />

        <div
          className="absolute inset-x-0 top-[22vh] px-4 md:top-[20vh] md:px-[7vw]"
          style={{
            opacity: 'calc(1 - var(--leave))',
            transform: 'translateY(calc(var(--leave) * -50px))',
          }}
        >
          <p className="kicker">
            {leg.day} · {leg.stop} · Leo núi
          </p>
          <p className="mt-6 text-xs tracking-[0.2em] text-white/65 uppercase">Độ cao</p>
          <p className="mt-1 flex items-baseline gap-3 font-light tabular-nums">
            <span
              ref={altRef}
              className="text-[clamp(88px,13vw,208px)] leading-[0.85] tracking-[-0.04em]"
            >
              1.500
            </span>
            <span className="text-3xl text-white/70 md:text-4xl">m</span>
          </p>
          <h2 className="mt-6 font-serif text-[clamp(40px,5vw,72px)] leading-none font-medium">
            Lên rừng mây Kinabalu
          </h2>
          <p className="mt-3 font-mono text-sm text-[#9ff0cf]">
            {leg.place} · {fmtLL(leg.ll[0], leg.ll[1])}
          </p>
          <p className="mt-4 max-w-lg text-lg leading-relaxed text-white/85">
            Càng lên cao càng lạnh và ẩm. Ban ngày 18–26°C, ban đêm chỉ còn 10–15°C, độ ẩm 80–95%.
          </p>
        </div>

        <div
          aria-hidden="true"
          className="absolute top-0 right-6 hidden h-full w-28 md:block lg:right-[7vw]"
          style={{ opacity: 'calc(1 - var(--leave))' }}
        >
          <div className="absolute top-1/2 right-0 left-0 z-10 flex -translate-y-1/2 items-center gap-2">
            <span className="h-px flex-1 bg-[#6ee7b7]" />
            <span className="size-2 rotate-45 bg-[#6ee7b7]" />
          </div>
          <div
            className="absolute inset-x-0 top-1/2"
            style={{ transform: 'translateY(calc(var(--tape) * -1))' }}
          >
            {ticks.map((t) => (
              <div
                key={t}
                className="flex h-[18px] items-center justify-end gap-2 font-mono text-[11px] text-white/70"
              >
                {t % 250 === 0 && <span>{t.toLocaleString('vi-VN')}</span>}
                <span
                  className={cn(
                    'h-px bg-white/60',
                    t % 250 === 0 ? 'w-6' : 'w-3 opacity-60'
                  )}
                />
              </div>
            ))}
          </div>
        </div>

        <div
          className="absolute inset-x-[14vw] top-[22vh] h-[38vh] overflow-hidden rounded-[28px] ring-1 ring-white/15 md:inset-x-auto md:top-[9vh] md:left-[8vw] md:h-[82vh] md:w-[min(34vw,560px)]"
          style={{ opacity: 'var(--fogIn)' }}
        >
          <TripImg
            name="rajah"
            alt="Nắp ấm Rajah khổng lồ trong môi trường sống"
            sizes="(min-width: 768px) 34vw, 72vw"
            className="size-full object-cover"
            style={{ transform: 'scale(calc(1.12 - var(--clear) * 0.12))' }}
          />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ opacity: 'calc(var(--fogIn) * (1 - var(--clear)))' }}
        >
          <div className="absolute inset-0 bg-[#9fb5ac]/35" />
          {(
            [
              [-10, 10, 70, 60, -1],
              [30, -5, 80, 70, 1],
              [-20, 45, 75, 70, -1],
              [35, 40, 80, 75, 1],
              [5, 20, 70, 60, 1],
            ] as const
          ).map(([l, t, w, h, dir], k) => (
            <div
              key={k}
              className="absolute"
              style={{
                left: `${l}vw`,
                top: `${t}vh`,
                width: `${w}vw`,
                height: `${h}vh`,
                transform: `translateX(calc(var(--clear) * ${dir * 45}vw))`,
              }}
            >
              <div
                className="fog size-full rounded-full bg-[radial-gradient(closest-side,rgba(214,228,221,.85),rgba(214,228,221,0))]"
                style={{ animationDelay: `${-k * 3}s` }}
              />
            </div>
          ))}
          <p
            className="glass absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full px-5 py-2.5 text-sm whitespace-nowrap"
            style={{ opacity: 'calc(1 - var(--clear) * 2)' }}
          >
            <Mountain className="size-4 text-[#6ee7b7]" aria-hidden="true" />
            Sương mù 2.650 m · chờ sương tan
          </p>
        </div>

        <Journal
          s={s}
          page="03"
          where="KINABALU"
          photo="NepGrower · Phạm vi công cộng"
          tip={TIPS['nepenthes-rajah']}
          className="inset-x-3 bottom-3 md:inset-x-auto md:right-[6vw] md:bottom-[5vh] md:w-[430px]"
        />
        <Tip
          tip={TIPS['nepenthes-rajah']!}
          s={s}
          className="md:top-[12vh] md:left-[calc(8vw+min(34vw,560px)+24px)] md:w-[300px]"
        />
        <Exit />
      </div>
    </section>
  );
}
