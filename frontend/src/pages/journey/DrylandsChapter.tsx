import React, { useEffect, useRef } from 'react';
import { Flashlight, Sun } from 'lucide-react';
import type { SpeciesDto } from '@/types/api';
import { clamp, lerp, localTime, smooth, sub, today } from '@/lib/geo';
import { LEG, resolveJourneySpecies, TIPS } from '@/content/journey';
import { Journal } from '@/components/journey/Journal';
import { Motes } from '@/components/journey/Motes';
import { StationTitle, Tip } from '@/components/journey/Tip';
import { TripImg } from '@/components/journey/TripImg';
import { Exit, useJourneyReducedMotion, useScrub, useStamp } from '@/components/journey/useScrub';

const ST6_RANGES = {
  leave: [0.12, 0.2] as const,
  arm: [0.18, 0.28] as const,
  ir: [0.26, 0.4] as const,
  color: [0.52, 0.58] as const,
  journal: [0.62, 0.74] as const,
  exit: [0.94, 1] as const,
};

export function BallPython({ liveSpecies }: { liveSpecies?: SpeciesDto[] }): React.JSX.Element {
  const ref = useRef<HTMLElement | null>(null);
  const stamp = useStamp('ball-python', 0.74);

  useScrub(ref, ST6_RANGES, (p, el) => {
    el.style.setProperty('--flash', Math.sin(Math.PI * clamp((p - 0.47) / 0.07)).toFixed(3));
    stamp(p, el);
  });

  const s = resolveJourneySpecies('ball-python', liveSpecies);
  const leg = LEG['tram-6']!;
  const corner = 'absolute size-10 border-white/85 md:size-14';

  return (
    <section id="tram-6" ref={ref} className="relative h-[340vh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <TripImg
          name="ghana"
          alt="Voi giữa savan xanh mùa mưa ở phía bắc Ghana"
          className="absolute inset-0 size-full object-cover"
          style={{ transform: 'scale(calc(1.05 + var(--p) * 0.08))' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#040a07] via-[#040a07]/25 to-[#040a07]/35" />

        <StationTitle
          leg={leg}
          from={{ city: 'Thành phố Mexico', ll: [19.43, -99.13] }}
          title={
            <>
              Savan
              <br />
              phía bắc Ghana
            </>
          }
        >
          Trăn bóng cỡ nhỏ và hiền, khi sợ hãi cuộn tròn như quả bóng. Để không làm nó giật mình,
          đoàn đặt bẫy ảnh qua đêm ở rìa savan.
        </StationTitle>

        {/* Ảnh từ bẫy ảnh: hồng ngoại đen trắng, chớp đèn, rồi sang màu */}
        <TripImg
          name="ballpython"
          alt="Trăn bóng (Python regius) cuộn trên vỏ cây"
          className="absolute inset-0 size-full object-cover"
          style={{
            objectPosition: '62% 50%',
            opacity: 'var(--ir)',
            filter:
              'grayscale(calc(1 - var(--color))) contrast(calc(1.35 - var(--color) * 0.35)) brightness(calc(0.78 + var(--color) * 0.22))',
          }}
        />
        <div
          aria-hidden="true"
          className="scan pointer-events-none absolute inset-0"
          style={{ opacity: 'calc(var(--ir) * (1 - var(--color)))' }}
        />
        <div
          className="absolute inset-0 bg-gradient-to-l from-[#040a07]/80 via-transparent to-transparent"
          style={{ opacity: 'var(--journal)' }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-white"
          style={{ opacity: 'var(--flash)' }}
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-4 top-[180px] bottom-6 font-mono text-[12px] tracking-wider text-white/90 uppercase md:inset-x-[4vw] md:top-[96px] md:bottom-[5vh] md:text-[13px]"
          style={{ opacity: 'calc(var(--arm) * (1 - var(--journal)))' }}
        >
          <span className={`${corner} top-0 left-0 border-t-2 border-l-2`} />
          <span className={`${corner} top-0 right-0 border-t-2 border-r-2`} />
          <span className={`${corner} bottom-0 left-0 border-b-2 border-l-2`} />
          <span className={`${corner} right-0 bottom-0 border-r-2 border-b-2`} />
          <span className="absolute top-4 left-5 flex items-center gap-2 md:top-5 md:left-7">
            <span className="blink size-2.5 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444]" />
            Ghi hình · Bẫy ảnh · Trạm 06
          </span>
          <span className="absolute bottom-4 left-5 tabular-nums md:bottom-5 md:left-7">
            {today()} · {localTime('Africa/Accra')}
          </span>
          <span className="absolute right-5 bottom-4 grid text-right md:right-7 md:bottom-5">
            <span className="[grid-area:1/1]" style={{ opacity: 'calc(1 - var(--color))' }}>
              Hồng ngoại
            </span>
            <span className="text-[#9ff0cf] [grid-area:1/1]" style={{ opacity: 'var(--color)' }}>
              Màu · <span className="normal-case">Python regius</span>
            </span>
          </span>
          <span className="absolute top-1/2 left-1/2 size-8 -translate-x-1/2 -translate-y-1/2">
            <span className="absolute top-1/2 left-0 h-px w-full bg-white/70" />
            <span className="absolute top-0 left-1/2 h-full w-px bg-white/70" />
          </span>
        </div>

        <Journal
          s={s}
          page="06"
          where="GHANA"
          photo="Brian Gratwicke"
          tip={TIPS['ball-python']}
          className="inset-x-3 bottom-3 md:inset-x-auto md:right-[5vw] md:bottom-[5vh] md:w-[410px]"
        />
        <Tip tip={TIPS['ball-python']!} s={s} className="md:bottom-[5vh] md:left-[6vw] md:w-[400px]" />
        <Exit />
      </div>
    </section>
  );
}

const ST7_RANGES = {
  leave: [0.12, 0.2] as const,
  night: [0.14, 0.3] as const,
  torch: [0.26, 0.34] as const,
  full: [0.62, 0.7] as const,
  journal: [0.68, 0.78] as const,
  exit: [0.94, 1] as const,
};
const TORCH = { w: 1920, h: 1080, tx: 0.84, ty: 0.3, span: [0.32, 0.62] as const };

export function Gecko({ liveSpecies }: { liveSpecies?: SpeciesDto[] }): React.JSX.Element {
  const ref = useRef<HTMLElement | null>(null);
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const ptr = useRef({ x: 0, y: 0, t: -1e9 });
  const pRef = useRef(0);
  const stamp = useStamp('leopard-gecko', 0.78);

  // Đèn pin theo chuột nếu vừa di chuột, ngược lại tự quét theo đường soạn sẵn và dừng ở đầu thằn lằn
  const place = () => {
    const el = ref.current;
    if (!el) return;
    const p = pRef.current;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const k = Math.max(vw / TORCH.w, vh / TORCH.h);
    const iw = TORCH.w * k;
    const ih = TORCH.h * k;
    const gx = (vw - iw) / 2 + TORCH.tx * iw;
    const gy = (vh - ih) / 2 + TORCH.ty * ih;
    const pts: readonly [number, number][] = [
      [vw * 0.2, vh * 0.72],
      [vw * 0.72, vh * 0.66],
      [vw * 0.3, vh * 0.36],
      [gx, gy],
    ];
    const s =
      clamp((p - TORCH.span[0]) / (TORCH.span[1] - TORCH.span[0])) * 3;
    const seg = Math.min(2, Math.floor(s));
    const f = smooth(clamp(s - seg));
    let x = lerp(pts[seg]![0], pts[seg + 1]![0], f);
    let y = lerp(pts[seg]![1], pts[seg + 1]![1], f);
    if (performance.now() - ptr.current.t < 2200 && p < TORCH.span[1]) {
      x = ptr.current.x;
      y = ptr.current.y;
    }
    const full = sub(p, ST7_RANGES.full[0], ST7_RANGES.full[1]);
    el.style.setProperty('--tx', `${x.toFixed(1)}px`);
    el.style.setProperty('--ty', `${y.toFixed(1)}px`);
    el.style.setProperty(
      '--tr',
      `${lerp(Math.min(vw, vh) * 0.25, Math.hypot(vw, vh), full).toFixed(1)}px`
    );
  };

  useScrub(ref, ST7_RANGES, (p, el) => {
    pRef.current = p;
    place();
    stamp(p, el);
  });

  useEffect(() => {
    const el = stickyRef.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      ptr.current = { x: e.clientX, y: e.clientY, t: performance.now() };
      place();
    };
    el.addEventListener('pointermove', onMove, { passive: true });
    return () => el.removeEventListener('pointermove', onMove);
  });

  const s = resolveJourneySpecies('leopard-gecko', liveSpecies);
  const leg = LEG['tram-7']!;

  return (
    <section id="tram-7" ref={ref} className="relative h-[360vh]">
      <div ref={stickyRef} className="sticky top-0 h-svh overflow-hidden">
        <TripImg
          name="baloch"
          alt="Hoàng hôn trên núi ở Turbat, Balochistan"
          className="absolute inset-0 size-full object-cover"
          style={{ transform: 'scale(calc(1.04 + var(--p) * 0.06))' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#040a07] via-[#040a07]/20 to-transparent" />
        <div
          className="absolute inset-0 bg-[#03060a]"
          style={{ opacity: 'calc(var(--night) * 0.9)' }}
        />
        <Motes kind="star" style={{ opacity: 'var(--night)' }} />

        <StationTitle
          leg={leg}
          from={{ city: 'Accra', ll: [5.6, -0.19] }}
          title={
            <>
              Đêm ở
              <br />
              Balochistan
            </>
          }
        >
          Ban ngày bán hoang mạc nóng và khô. Thằn lằn da báo đợi trời tối mới ra ngoài, nên muốn gặp
          phải đi với đèn pin.
        </StationTitle>

        <TripImg
          name="gecko"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover"
          style={{
            opacity: 'calc(var(--torch) * 0.9)',
            filter: 'brightness(.09) saturate(.5)',
          }}
        />
        <TripImg
          name="gecko"
          alt="Thằn lằn da báo (Eublepharis macularius) trên cát"
          className="absolute inset-0 size-full object-cover"
          style={{
            opacity: 'var(--torch)',
            filter: 'sepia(.18) saturate(1.1) brightness(1.05)',
            maskImage:
              'radial-gradient(circle var(--tr) at var(--tx) var(--ty), #000 62%, transparent 100%)',
            WebkitMaskImage:
              'radial-gradient(circle var(--tr) at var(--tx) var(--ty), #000 62%, transparent 100%)',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 mix-blend-screen"
          style={{
            opacity: 'calc(var(--torch) * (1 - var(--full)))',
            background:
              'radial-gradient(circle calc(var(--tr) * 1.4) at var(--tx) var(--ty), rgba(255,226,170,.28), transparent 70%)',
          }}
        />
        <div
          className="absolute inset-0 bg-gradient-to-l from-[#040a07]/80 via-transparent to-transparent"
          style={{ opacity: 'var(--journal)' }}
        />
        <p
          className="glass absolute bottom-[8vh] left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full px-4 py-2 text-sm whitespace-nowrap"
          style={{ opacity: 'calc(var(--torch) * (1 - var(--full)))' }}
        >
          <Flashlight className="size-4 text-[#ffe2aa]" aria-hidden="true" />
          <span className="hidden md:inline">Di chuột để soi đèn pin</span>
          <span className="md:hidden">Cuộn để soi đèn pin</span>
        </p>

        <Journal
          s={s}
          page="07"
          where="BALOCHISTAN"
          photo="George Chernilevsky"
          tip={TIPS['leopard-gecko']}
          className="inset-x-3 bottom-3 md:inset-x-auto md:right-[5vw] md:bottom-[5vh] md:w-[410px]"
        />
        <Tip
          tip={TIPS['leopard-gecko']!}
          s={s}
          className="md:bottom-[5vh] md:left-[6vw] md:w-[400px]"
        />
        <Exit />
      </div>
    </section>
  );
}

const ST8_RANGES = {
  leave: [0.3, 0.38] as const,
  heat: [0.04, 0.32] as const,
  frame: [0.36, 0.48] as const,
  journal: [0.58, 0.7] as const,
  exit: [0.94, 1] as const,
};

export function Dragon({ liveSpecies }: { liveSpecies?: SpeciesDto[] }): React.JSX.Element {
  const ref = useRef<HTMLElement | null>(null);
  const tRef = useRef<HTMLSpanElement | null>(null);
  const reduced = useJourneyReducedMotion();
  const stamp = useStamp('bearded-dragon', 0.7);

  useScrub(ref, ST8_RANGES, (p, el) => {
    const h = sub(p, ST8_RANGES.heat[0], ST8_RANGES.heat[1]);
    if (tRef.current) tRef.current.textContent = String(Math.round(lerp(26, 42, h)));
    stamp(p, el);
  });

  const s = resolveJourneySpecies('bearded-dragon', liveSpecies);
  const leg = LEG['tram-8']!;

  return (
    <section id="tram-8" ref={ref} className="relative h-[340vh]">
      {!reduced && (
        <svg width="0" height="0" className="absolute" aria-hidden="true">
          <filter id="haze">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.006 0.09"
              numOctaves={2}
              seed={7}
            />
            <feDisplacementMap in="SourceGraphic" scale={7}>
              <animate
                attributeName="scale"
                values="3;9;3"
                dur="2.6s"
                repeatCount="indefinite"
              />
            </feDisplacementMap>
          </filter>
        </svg>
      )}
      <div className="sticky top-0 h-svh overflow-hidden">
        <TripImg
          name="uluru"
          alt="Uluru và cây chết trên đất đỏ miền trung nước Úc"
          className="absolute inset-0 size-full object-cover"
          style={{ transform: 'scale(calc(1.04 + var(--p) * 0.06))' }}
        />
        {/* Hơi nóng bốc lên ở dải đất sát mặt đất */}
        {!reduced && (
          <TripImg
            name="uluru"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 size-full object-cover"
            style={{
              transform: 'scale(calc(1.04 + var(--p) * 0.06))',
              filter: 'url(#haze)',
              clipPath: 'inset(62% 0 0 0)',
              opacity: 'var(--heat)',
            }}
          />
        )}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 mix-blend-screen"
          style={{
            opacity: 'var(--heat)',
            background:
              'radial-gradient(circle at 82% 6%, rgba(255,240,200,.75), rgba(255,190,110,.25) 18%, transparent 46%)',
          }}
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#0b0603]/80 via-[#0b0603]/20 to-transparent"
          style={{ opacity: 'calc(1 - var(--leave))' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#040a07] via-transparent to-transparent" />
        <div
          className="absolute inset-0 bg-[#060402]"
          style={{ opacity: 'calc(var(--frame) * 0.55)' }}
        />

        <div
          className="absolute inset-x-0 top-[22vh] px-4 md:top-[30vh] md:right-[7vw] md:left-auto md:w-[440px] md:px-0"
          style={{
            opacity: 'calc(1 - var(--leave))',
            transform: 'translateY(calc(var(--leave) * -50px))',
          }}
        >
          <p className="mt-6 flex items-center gap-2 text-xs tracking-[0.2em] text-white/70 uppercase">
            <Sun className="size-4 text-[#ffcf8a]" aria-hidden="true" />
            Nhiệt độ
          </p>
          <p className="mt-1 flex items-baseline gap-2 font-light tabular-nums">
            <span
              ref={tRef}
              className="text-[clamp(80px,10.5vw,168px)] leading-[0.85] tracking-[-0.04em]"
            >
              26
            </span>
            <span className="text-3xl text-white/70 md:text-4xl">°C</span>
          </p>
          <div className="mt-5 w-[min(420px,80vw)]">
            <div className="relative h-2 rounded-full bg-[linear-gradient(90deg,#4ade80_0%,#facc15_45%,#fb923c_75%,#ef4444_100%)]">
              <span
                className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#040a07] shadow-[0_0_14px_#fff]"
                style={{ left: 'calc(var(--heat) * 100%)' }}
              />
            </div>
            <div className="mt-2 flex justify-between font-mono text-[11px] text-white/70">
              <span>Khi nuôi 26–32°C</span>
              <span>Điểm sưởi 38–42°C</span>
            </div>
          </div>
        </div>

        <StationTitle
          leg={leg}
          from={{ city: 'Quetta', ll: [30.18, 66.98] }}
          title={
            <>
              Đất đỏ
              <br />
              miền trung Úc
            </>
          }
        >
          Rồng Úc hoạt động ban ngày, phơi nắng trên đá và cát đỏ để giữ ấm, ăn tạp cả côn trùng lẫn
          rau xanh.
        </StationTitle>

        <div
          className="absolute inset-x-3 top-[22vh] h-[38vh] overflow-hidden rounded-[28px] ring-1 ring-white/15 md:inset-x-auto md:top-[11vh] md:left-[6vw] md:h-[62vh] md:w-[min(54vw,880px)]"
          style={{
            opacity: 'var(--frame)',
            transform:
              'translateY(calc((1 - var(--frame)) * 70px)) scale(calc(0.96 + var(--frame) * 0.04))',
          }}
        >
          <TripImg
            name="dragon"
            alt="Rồng Úc (Pogona vitticeps) phơi nắng trên cát"
            sizes="(min-width: 768px) 54vw, 95vw"
            className="size-full object-cover"
            style={{ objectPosition: '30% 50%' }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 mix-blend-screen"
            style={{
              background:
                'radial-gradient(circle at 90% 0%, rgba(255,214,150,.35), transparent 55%)',
            }}
          />
        </div>

        <Journal
          s={s}
          page="08"
          where="TRUNG ÚC"
          photo="George Chernilevsky"
          tip={TIPS['bearded-dragon']}
          className="inset-x-3 bottom-3 md:inset-x-auto md:right-[5vw] md:bottom-[5vh] md:w-[410px]"
        />
        <Tip
          tip={TIPS['bearded-dragon']!}
          s={s}
          className="md:bottom-[5vh] md:left-[6vw] md:w-[420px]"
        />
        <Exit />
      </div>
    </section>
  );
}
