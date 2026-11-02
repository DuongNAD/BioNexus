import React, { useRef } from 'react';
import type { SpeciesDto } from '@/types/api';
import { today } from '@/lib/geo';
import { LEG, resolveJourneySpecies, TIPS } from '@/content/journey';
import { usePassport } from '@/hooks/usePassport';
import { Journal } from '@/components/journey/Journal';
import { StationTitle, Tip } from '@/components/journey/Tip';
import { TripImg } from '@/components/journey/TripImg';
import { Exit, useScrub, useStamp } from '@/components/journey/useScrub';

const ST9_RANGES = {
  leave: [0.12, 0.2] as const,
  card: [0.18, 0.32] as const,
  flip: [0.38, 0.56] as const,
  journal: [0.62, 0.74] as const,
  exit: [0.94, 1] as const,
};

function PostageStamp({ className }: { className?: string }): React.JSX.Element {
  // Răng cưa tem thư: lớp đặc phủ phần ảnh, lớp chấm tròn đục lỗ ở phần viền (padding)
  const mask =
    'linear-gradient(#000 0 0) content-box, radial-gradient(circle at 4px 4px, transparent 2.4px, #000 2.8px) -4px -4px / 8px 8px padding-box';
  return (
    <span
      className={`block bg-[#f7f2e8] p-[5px] ${className ?? ''}`}
      style={{ WebkitMask: mask, mask }}
    >
      <TripImg
        name="calanque"
        alt=""
        aria-hidden="true"
        sizes="160px"
        className="block h-full w-full object-cover"
      />
    </span>
  );
}

export function Hermann({ liveSpecies }: { liveSpecies?: SpeciesDto[] }): React.JSX.Element {
  const ref = useRef<HTMLElement | null>(null);
  const { user } = usePassport();
  const stamp = useStamp('hermann-tortoise', 0.74);
  useScrub(ref, ST9_RANGES, stamp);

  const s = resolveJourneySpecies('hermann-tortoise', liveSpecies);
  const leg = LEG['tram-9']!;
  const face =
    'absolute inset-0 overflow-hidden rounded-[6px] [backface-visibility:hidden] shadow-[0_40px_90px_-30px_rgba(0,0,0,.8)]';

  return (
    <section id="tram-9" ref={ref} className="relative h-[340vh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <TripImg
          name="maquis"
          alt="Đồi cây bụi maquis ven Địa Trung Hải"
          className="absolute inset-0 size-full object-cover"
          style={{ transform: 'scale(calc(1.05 + var(--p) * 0.08))' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#040a07] via-[#040a07]/25 to-[#040a07]/35" />
        <div
          className="absolute inset-0 bg-[#020604]"
          style={{ opacity: 'calc(var(--card) * 0.5)' }}
        />

        <StationTitle
          leg={leg}
          from={{ city: 'Alice Springs', ll: [-23.7, 133.88] }}
          title={
            <>
              Bụi rậm
              <br />
              Địa Trung Hải
            </>
          }
        >
          Trạm cuối. Cây bụi thơm, đá vôi và nắng hanh, nơi rùa Hermann chậm rãi kiếm ăn. Gửi một
          tấm bưu thiếp về trước khi khép hành trình.
        </StationTitle>

        <div
          className="absolute inset-x-4 top-[22vh] aspect-[3/2] [perspective:1800px] md:inset-x-auto md:top-[14vh] md:left-[7vw] md:w-[min(46vw,720px)]"
          style={{ opacity: 'var(--card)' }}
        >
          <div
            className="relative size-full [transform-style:preserve-3d]"
            style={{
              transform:
                'translateY(calc((1 - var(--card)) * 80px)) rotateZ(calc((1 - var(--card)) * -7deg + var(--flip) * 2deg)) rotateY(calc(var(--flip) * 180deg))',
            }}
          >
            {/* Mặt trước: ảnh */}
            <div className={`${face} bg-[#f4efe5] p-[10px]`}>
              <TripImg
                name="hermann"
                alt="Rùa Hermann giữa cỏ và hoa cúc"
                sizes="(min-width: 768px) 46vw, 92vw"
                className="size-full rounded-[2px] object-cover"
              />
              <span className="absolute bottom-6 left-7 font-serif text-[clamp(22px,2.6vw,40px)] text-white italic drop-shadow-[0_2px_10px_rgba(0,0,0,.6)]">
                Lời chào từ Địa Trung Hải
              </span>
              <PostageStamp className="absolute top-6 right-6 h-[22%] w-[15%] rotate-3" />
            </div>

            {/* Mặt sau: lời nhắn */}
            <div
              className={`${face} grid grid-cols-[1.25fr_1fr] gap-5 bg-[#f4efe5] p-5 text-[#22302a] md:p-8`}
              style={{
                transform: 'rotateY(180deg)',
                backgroundImage:
                  'linear-gradient(90deg, transparent calc(55.5% - 1px), rgba(34,48,42,.25) calc(55.5% - 1px), rgba(34,48,42,.25) 55.5%, transparent 55.5%)',
              }}
            >
              <div className="font-serif text-[clamp(15px,1.45vw,22px)] leading-snug italic">
                <p>Gửi BioNexus,</p>
                <p className="mt-2">
                  Hôm nay gặp rùa Hermann giữa bụi rậm và hoa cúc. {s.desc}
                </p>
                <p className="mt-3">Hẹn gặp lại ở chặng sau.</p>
                <p className="mt-2 font-semibold not-italic">
                  {user ? user.name : 'Một nhà thám hiểm'}
                </p>
              </div>
              <div className="relative">
                <PostageStamp className="ml-auto h-[38%] w-[46%] -rotate-2" />
                <svg
                  viewBox="0 0 120 120"
                  className="absolute top-[6%] right-[30%] size-[44%] text-[#7a2e2e]/70"
                  aria-hidden="true"
                >
                  <defs>
                    <path id="pm-path" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
                  </defs>
                  <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" strokeWidth="2" />
                  <circle cx="60" cy="60" r="34" fill="none" stroke="currentColor" strokeWidth="1" />
                  <text fill="currentColor" fontSize="10" fontWeight="700" letterSpacing="1.6">
                    <textPath href="#pm-path">ĐỊA TRUNG HẢI · TRẠM 09 ·</textPath>
                  </text>
                  <text
                    x="60"
                    y="64"
                    textAnchor="middle"
                    fill="currentColor"
                    fontSize="11"
                    fontWeight="700"
                  >
                    {today()}
                  </text>
                </svg>
                <div className="absolute inset-x-0 bottom-0 space-y-3 text-[clamp(11px,1vw,14px)]">
                  {[
                    'Hộ chiếu loài BioNexus',
                    'Trang 09 · Rùa Hermann',
                    user ? user.name : 'Khách thám hiểm',
                  ].map((t) => (
                    <p key={t} className="border-b border-[#22302a]/30 pb-1">
                      {t}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Journal
          s={s}
          page="09"
          where="ĐỊA TRUNG HẢI"
          photo="NorbertNagel"
          tip={TIPS['hermann-tortoise']}
          className="inset-x-3 bottom-3 md:inset-x-auto md:right-[5vw] md:bottom-[5vh] md:w-[410px]"
        />
        <Tip
          tip={TIPS['hermann-tortoise']!}
          s={s}
          className="md:bottom-[5vh] md:left-[7vw] md:w-[400px]"
        />
        <Exit />
      </div>
    </section>
  );
}
