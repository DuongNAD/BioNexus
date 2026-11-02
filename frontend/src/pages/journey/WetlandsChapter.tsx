import React, { useRef, useState } from 'react';
import { Hand, Waves } from 'lucide-react';
import type { SpeciesDto } from '@/types/api';
import { LEG, resolveJourneySpecies, TIPS } from '@/content/journey';
import { Journal } from '@/components/journey/Journal';
import { Motes } from '@/components/journey/Motes';
import { StationTitle, Tip } from '@/components/journey/Tip';
import { TripImg } from '@/components/journey/TripImg';
import { Exit, useScrub, useStamp } from '@/components/journey/useScrub';

// Mép răng của lá bẫy: đường răng cưa dọc mép dưới (hàm trên) hoặc mép trên (hàm dưới)
const teeth = (top: boolean): string => {
  const n = 18;
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const x = (i / n) * 100;
    pts.push(`${x.toFixed(2)}% ${top ? (i % 2 ? 100 : 86) : i % 2 ? 0 : 14}%`);
  }
  return top
    ? `polygon(0 0, 100% 0, ${pts.reverse().join(', ')})`
    : `polygon(${pts.join(', ')}, 100% 100%, 0 100%)`;
};

const ST4_RANGES = {
  leave: [0.12, 0.2] as const,
  frame: [0.18, 0.3] as const,
  jaws: [0.3, 0.5] as const,
  journal: [0.6, 0.72] as const,
  exit: [0.94, 1] as const,
};

export function Venus({ liveSpecies }: { liveSpecies?: SpeciesDto[] }): React.JSX.Element {
  const ref = useRef<HTMLElement | null>(null);
  const [touch, setTouch] = useState(0);
  const [snap, setSnap] = useState(false);
  const stamp = useStamp('venus-flytrap', 0.72);
  useScrub(ref, ST4_RANGES, stamp);

  const s = resolveJourneySpecies('venus-flytrap', liveSpecies);
  const leg = LEG['tram-4']!;

  // Bẫy cần hai lần chạm vào lông cảm ứng mới khép
  const poke = () => {
    if (snap) return;
    if (touch === 0) {
      setTouch(1);
      return;
    }
    setTouch(2);
    setSnap(true);
    setTimeout(() => {
      setSnap(false);
      setTouch(0);
    }, 1900);
  };

  const jaw =
    'absolute inset-x-[-2%] h-[54%] bg-[linear-gradient(180deg,#123826,#0a2418)]';

  return (
    <section id="tram-4" ref={ref} className="relative h-[340vh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <TripImg
          name="carolina"
          alt="Rừng thông lá dài thưa trên đồng bằng ven biển"
          className="absolute inset-0 size-full object-cover"
          style={{ transform: 'scale(calc(1.06 + var(--p) * 0.08))' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#040a07] via-[#040a07]/30 to-[#040a07]/35" />
        <div
          className="absolute inset-0 bg-[#020604]"
          style={{ opacity: 'calc(var(--frame) * 0.5)' }}
        />

        <StationTitle
          leg={leg}
          from={{ city: 'Kota Kinabalu', ll: [5.94, 116.05] }}
          title={
            <>
              Đầm lầy ven biển
              <br />
              Carolina
            </>
          }
        >
          Đất cát nghèo dinh dưỡng, nắng nhiều, rừng thông thưa. Cây bắt ruồi Venus bù phần thiếu
          bằng cách bắt côn trùng.
        </StationTitle>

        <div
          className="absolute inset-x-3 top-[22vh] h-[38vh] overflow-hidden rounded-[28px] ring-1 ring-white/15 md:inset-x-auto md:top-[11vh] md:left-[6vw] md:h-[62vh] md:w-[min(50vw,820px)]"
          style={
            {
              opacity: 'var(--frame)',
              transform: 'translateY(calc((1 - var(--frame)) * 70px))',
              '--snap': snap ? 1 : 0,
              transition: snap
                ? '--snap .16s cubic-bezier(.6,0,1,1)'
                : '--snap .9s cubic-bezier(.2,.8,.2,1)',
            } as React.CSSProperties
          }
        >
          <TripImg
            name="venus2"
            alt="Cụm cây bắt ruồi Venus mọc hoang ở Green Swamp"
            sizes="(min-width: 768px) 50vw, 95vw"
            className="size-full object-cover"
          />
          <div
            aria-hidden="true"
            className={`${jaw} top-0`}
            style={{
              clipPath: teeth(true),
              transform: 'translateY(calc(var(--jaws) * (1 - var(--snap)) * -104%))',
            }}
          >
            <div className="absolute inset-x-0 bottom-0 h-[16%] bg-[linear-gradient(0deg,rgba(214,70,70,.55),transparent)]" />
          </div>
          <div
            aria-hidden="true"
            className={`${jaw} bottom-0`}
            style={{
              clipPath: teeth(false),
              transform: 'translateY(calc(var(--jaws) * (1 - var(--snap)) * 104%))',
            }}
          >
            <div className="absolute inset-x-0 top-0 h-[16%] bg-[linear-gradient(180deg,rgba(214,70,70,.55),transparent)]" />
          </div>
          <button
            type="button"
            onClick={poke}
            className="glass absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full px-4 py-2 text-sm whitespace-nowrap transition hover:bg-white/10"
            style={{ opacity: 'var(--jaws)' }}
          >
            <Hand className="size-4 text-[#6ee7b7]" aria-hidden="true" />
            {snap ? 'Bẫy đã khép' : `Chạm lông cảm ứng · ${touch}/2`}
          </button>
        </div>

        <Journal
          s={s}
          page="04"
          where="CAROLINA"
          photo="Green Swamp · Judy Gallagher"
          tip={TIPS['venus-flytrap']}
          className="inset-x-3 bottom-3 md:inset-x-auto md:right-[5vw] md:bottom-[5vh] md:w-[410px]"
        />
        <Tip
          tip={TIPS['venus-flytrap']!}
          s={s}
          className="md:bottom-[5vh] md:left-[6vw] md:w-[min(50vw,460px)]"
        />
        <Exit />
      </div>
    </section>
  );
}

const ST5_RANGES = {
  leave: [0.12, 0.2] as const,
  dive: [0.2, 0.46] as const,
  deep: [0.42, 0.56] as const,
  journal: [0.62, 0.74] as const,
  exit: [0.94, 1] as const,
};

export function Axolotl({ liveSpecies }: { liveSpecies?: SpeciesDto[] }): React.JSX.Element {
  const ref = useRef<HTMLElement | null>(null);
  const stamp = useStamp('axolotl', 0.74);
  useScrub(ref, ST5_RANGES, stamp);

  const s = resolveJourneySpecies('axolotl', liveSpecies);
  const leg = LEG['tram-5']!;

  return (
    <section id="tram-5" ref={ref} className="relative h-[360vh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <TripImg
          name="xochi"
          alt="Thuyền trajinera trên kênh Xochimilco"
          className="absolute inset-0 size-full object-cover"
          style={{
            transformOrigin: '50% 90%',
            transform: 'scale(calc(1.05 + var(--dive) * 0.35))',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#040a07] via-[#040a07]/25 to-[#040a07]/35" />

        <StationTitle
          leg={leg}
          from={{ city: 'Wilmington', ll: [34.27, -77.9] }}
          title={
            <>
              Kênh
              <br />
              Xochimilco
            </>
          }
        >
          Thuyền trajinera sặc sỡ chở khách dọc các kênh giữa những luống chinampa. Dưới mặt nước là
          nhà của axolotl, loài kỳ giông đặc hữu của nơi này.
        </StationTitle>

        {/* Lớp dưới nước: lộ dần từ đáy lên như mặt nước đang dâng qua ống kính */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: 'inset(calc((1 - var(--dive)) * 100%) 0 0 0)' }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#0f4a42_0%,#07261f_45%,#03110d_100%)]" />
          <div className="caustics absolute inset-0 opacity-80" />
          <div className="absolute inset-x-[18%] -top-[10%] h-[70%] bg-[radial-gradient(ellipse_at_50%_0%,rgba(190,255,235,.28),transparent_65%)]" />
          <div
            className="absolute inset-x-3 top-[22vh] h-[38vh] overflow-hidden rounded-[32px] md:inset-x-auto md:top-[10vh] md:left-[7vw] md:h-[70vh] md:w-[min(52vw,860px)]"
            style={{
              opacity: 'var(--deep)',
              transform: 'scale(calc(0.94 + var(--deep) * 0.06))',
            }}
          >
            <TripImg
              name="axolotl"
              alt="Axolotl kiểu hoang dã màu xám xanh"
              sizes="(min-width: 768px) 52vw, 95vw"
              className="sway size-full object-cover"
              style={{ filter: 'saturate(.9) hue-rotate(-8deg)' }}
            />
            <div className="caustics absolute inset-0 opacity-60" />
            <div className="absolute inset-0 bg-[#0d4a40]/25 mix-blend-multiply" />
          </div>
          <Motes kind="bubble" />
          <p
            className="glass absolute top-[13vh] right-4 flex items-center gap-2 rounded-full px-4 py-2 text-sm md:top-[12vh] md:right-[6vw]"
            style={{ opacity: 'calc(var(--deep) * (1 - var(--journal)))' }}
          >
            <Waves className="size-4 text-[#6ee7b7]" aria-hidden="true" />
            Dưới mặt nước · {s.temp}
          </p>
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-x-0 h-[3px] bg-[linear-gradient(90deg,transparent,rgba(210,255,240,.9),transparent)] shadow-[0_0_24px_rgba(190,255,235,.8)]"
          style={{
            top: 'calc((1 - var(--dive)) * 100%)',
            opacity: 'calc(var(--dive) * (1 - var(--deep)))',
          }}
        />

        <Journal
          s={s}
          page="05"
          where="XOCHIMILCO"
          photo="Fernando Losada Rodríguez"
          tip={TIPS.axolotl}
          className="inset-x-3 bottom-3 md:inset-x-auto md:right-[5vw] md:bottom-[5vh] md:w-[410px]"
        />
        <Tip tip={TIPS.axolotl!} s={s} className="md:bottom-[5vh] md:left-[7vw] md:w-[400px]" />
        <Exit />
      </div>
    </section>
  );
}
