import React, { useRef } from 'react';
import { ArrowDown, ArrowRight, BookOpen, ShieldCheck, Stamp } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { distanceKm, mrz, today } from '@/lib/geo';
import { ROUTE } from '@/content/journey';
import { usePassport, type PassportUser } from '@/hooks/usePassport';
import { Motes } from '@/components/journey/Motes';
import { TripImg } from '@/components/journey/TripImg';
import { Exit, useScrub } from '@/components/journey/useScrub';
import { WorldMap } from '@/components/journey/WorldMap';

const OPEN_RANGES = { open: [0.06, 0.55] as const, exit: [0.9, 1] as const };
const ABOUT_RANGES = { show: [0.06, 0.36] as const, exit: [0.9, 1] as const };

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[parts.length - 2]![0] ?? ''}${parts[parts.length - 1]![0] ?? ''}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function PassportCover({
  met,
  user,
}: {
  met: string[];
  user: PassportUser | null;
}): React.JSX.Element {
  const name = user ? user.name : 'Khách thám hiểm';
  const initials = user ? getInitials(user.name) : 'KT';
  return (
    <div
      className="relative aspect-[0.72] w-[min(360px,74vw)] select-none [perspective:1800px] md:w-[372px]"
      style={{
        transform:
          'translateX(calc(var(--open) * 40%)) scale(calc(0.96 + var(--open) * 0.04))',
      }}
    >
      {/* Trang thông tin bên trong */}
      <div
        className="absolute inset-0 overflow-hidden rounded-[10px] bg-[#efe9dc] p-5 text-[#1c2823] shadow-[0_50px_110px_-30px_rgba(0,0,0,.95)] ring-1 ring-black/20 md:p-6"
        style={{
          backgroundImage:
            'repeating-radial-gradient(circle at 80% 20%, rgba(16,94,74,.065) 0 1px, transparent 1px 8px)',
        }}
      >
        <div className="flex items-center justify-between border-b border-[#1c2823]/15 pb-2 text-[9px] font-bold tracking-[0.2em] text-[#0f5a49] uppercase">
          <span>Hộ chiếu loài</span>
          <span>BioNexus</span>
        </div>
        <div className="mt-4 grid grid-cols-[76px_1fr] gap-3.5 text-[11px]">
          <div className="grid aspect-[0.82] place-items-center rounded-[6px] border border-[#0f5a49]/30 bg-[#0d3b2e] font-serif text-2xl font-semibold text-[#d8c591]">
            {initials}
          </div>
          <dl className="space-y-1.5">
            {(
              [
                ['Họ tên', name],
                ['Tên đăng nhập', user ? user.username : 'Chưa đăng ký'],
                ['Ngày cấp', today()],
                ['Nơi cấp', 'BioNexus'],
                ['Số trang dấu', `9 · đã có ${met.length}`],
              ] as const
            ).map(([k, v]) => (
              <div key={k}>
                <dt className="text-[8px] tracking-[0.16em] text-[#1c2823]/55 uppercase">{k}</dt>
                <dd className="font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="absolute inset-x-4 bottom-3 border-t border-[#1c2823]/15 pt-2 font-mono text-[8.5px] leading-snug tracking-[0.08em] text-[#1c2823]/70">
          <p className="truncate">{mrz(name)}</p>
          <p className="truncate">
            BNX&lt;{today().replace(/\D/g, '')}&lt;&lt;&lt;9&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;
          </p>
        </div>
      </div>

      {/* Bìa trước mở sang trái quanh gáy */}
      <div
        className="absolute inset-0 origin-left [transform-style:preserve-3d]"
        style={{ transform: 'rotateY(calc(var(--open) * -178deg))' }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-between rounded-[10px] border border-[#d8c591]/35 bg-[linear-gradient(155deg,#0f3529_0%,#061a13_60%,#04110c_100%)] p-6 text-center text-[#d8c591] shadow-[0_40px_90px_-20px_rgba(0,0,0,.95)] [backface-visibility:hidden]">
          <div className="pointer-events-none absolute inset-2.5 rounded-[6px] border border-[#d8c591]/25" />
          <p className="mt-1 text-[10px] font-semibold tracking-[0.26em] uppercase">
            Hộ chiếu loài
          </p>
          <div className="flex flex-col items-center gap-3">
            <svg viewBox="0 0 120 120" className="size-28 text-[#d8c591]/85" aria-hidden="true">
              <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <circle
                cx="60"
                cy="60"
                r="46"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.7"
                strokeDasharray="2 3"
              />
              <ellipse cx="60" cy="60" rx="52" ry="22" fill="none" stroke="currentColor" strokeWidth="0.8" />
              <ellipse cx="60" cy="60" rx="22" ry="52" fill="none" stroke="currentColor" strokeWidth="0.8" />
              <line x1="8" y1="60" x2="112" y2="60" stroke="currentColor" strokeWidth="0.8" />
            </svg>
            <Logo className="size-8 text-[#d8c591]" />
            <p className="font-serif text-2xl tracking-[0.14em] uppercase">BioNexus</p>
          </div>
          <p className="mb-1 text-[9px] tracking-[0.22em] text-[#d8c591]/75 uppercase">
            Hành trình 9 loài
          </p>
        </div>
        {/* Mặt trong của bìa trước */}
        <div
          className="absolute inset-0 rounded-[10px] bg-[#0a231b] p-6 text-[#d8c591]/70 shadow-inner [backface-visibility:hidden]"
          style={{
            transform: 'rotateY(180deg)',
            backgroundImage:
              'radial-gradient(circle at 30% 50%, rgba(216,197,145,.08), transparent 65%)',
          }}
        />
      </div>
    </div>
  );
}

export interface WelcomeSectionProps {
  onSkip: () => void;
  speciesCount?: number;
  taxonomyCount?: number;
  approvedProductCount?: number;
}

export function WelcomeSection({
  onSkip,
  speciesCount = 9,
  taxonomyCount = 25,
  approvedProductCount = 7,
}: WelcomeSectionProps): React.JSX.Element {
  const ref = useRef<HTMLElement | null>(null);
  const aboutRef = useRef<HTMLElement | null>(null);
  const { met, user, isWelcomeMode } = usePassport();

  useScrub(ref, OPEN_RANGES);
  useScrub(aboutRef, ABOUT_RANGES);

  const totalKm = ROUTE.slice(1).reduce(
    (sum, l, i) => sum + distanceKm(ROUTE[i]!.ll, l.ll),
    0
  );

  const showWelcomeCopy = isWelcomeMode || Boolean(user);
  const displayName = user ? user.name : 'Lê Văn C';

  return (
    <>
      <section id="mo-dau" ref={ref} className="relative h-[240vh]">
        <div className="sticky top-0 h-svh overflow-hidden">
          <TripImg
            name="trail"
            alt=""
            aria-hidden="true"
            loading="eager"
            fetchPriority="high"
            className="absolute inset-0 size-full scale-105 object-cover opacity-35 blur-[2px]"
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_65%_45%,rgba(16,60,44,.55),#040a07_72%)]" />
          <Motes kind="firefly" />

          <div className="relative z-10 mx-auto grid h-full max-w-[1320px] items-center gap-8 px-4 pt-16 pb-8 md:grid-cols-[1.05fr_1fr] md:px-[6vw]">
            <div>
              <p className="kicker">
                {showWelcomeCopy ? 'Tài khoản đã sẵn sàng' : 'BioNexus · Ấn phẩm tương tác'}
              </p>
              <h1 className="mt-3 font-serif text-[clamp(42px,5.4vw,80px)] leading-[0.92] font-medium tracking-[-0.02em]">
                {showWelcomeCopy ? (
                  <>
                    Chào mừng,
                    <br />
                    <span className="text-[#c4f5de] italic">{displayName}</span>
                  </>
                ) : (
                  <>
                    Hành trình
                    <br />
                    <span className="text-[#c4f5de] italic">9 loài</span>
                  </>
                )}
              </h1>
              <p className="mt-4 max-w-[420px] text-base leading-relaxed text-white/85 md:text-[17px]">
                {showWelcomeCopy
                  ? 'Trước khi bắt đầu, mời bạn đi một vòng làm quen: 4 chặng, 9 trạm. Mỗi trạm là một loài thật trong bách khoa và một tính năng của BioNexus.'
                  : 'Mười ngày đi qua 4 vùng sinh cảnh để gặp 9 loài trong bách khoa BioNexus tại chính nơi chúng sống ngoài tự nhiên.'}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href={showWelcomeCopy ? '#tong-quan' : '#cua-rung'}
                  onClick={(e) => {
                    e.preventDefault();
                    const targetId = showWelcomeCopy ? 'tong-quan' : 'cua-rung';
                    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-[#6ee7b7] px-6 py-3 text-sm font-semibold text-[#03140d] transition hover:bg-[#8ff0c8]"
                >
                  {showWelcomeCopy ? 'Bắt đầu hành trình' : 'Mở hộ chiếu, lên đường'}
                  <ArrowDown className="size-4" aria-hidden="true" />
                </a>
                {showWelcomeCopy && (
                  <button
                    type="button"
                    onClick={onSkip}
                    className="rounded-full border border-white/20 px-5 py-3 text-sm font-medium text-white/85 transition hover:bg-white/10"
                  >
                    Bỏ qua, vào trang chủ
                  </button>
                )}
              </div>
              <p className="mt-4 text-xs text-white/55">
                {showWelcomeCopy
                  ? 'Khoảng 6 phút. Dừng lúc nào cũng được, hộ chiếu lưu cùng tài khoản.'
                  : 'Cuộn để đi · mỗi trạm đóng một dấu vào hộ chiếu.'}
              </p>
            </div>

            <div className="flex justify-center max-md:-order-1">
              <PassportCover met={met} user={user} />
            </div>
          </div>
          <Exit />
        </div>
      </section>

      {/* Mục giới thiệu ngắn: 3 trụ cột của BioNexus + bản đồ lộ trình 9 trạm */}
      <section id="tong-quan" ref={aboutRef} className="relative h-[240vh]">
        <div className="sticky top-0 h-svh overflow-hidden bg-[radial-gradient(ellipse_at_60%_50%,#0b2119_0%,#040a07_72%)]">
          <div
            className="mx-auto grid h-full max-w-[1320px] items-center gap-8 px-4 pt-16 pb-8 md:grid-cols-[0.95fr_1.25fr] md:px-[6vw]"
            style={{
              opacity: 'var(--show)',
              transform: 'translateY(calc((1 - var(--show)) * 40px))',
            }}
          >
            <div>
              <p className="kicker">Trước khi lên đường</p>
              <h2 className="mt-3 font-serif text-[clamp(38px,5vw,72px)] leading-[0.92] font-medium">
                BioNexus là gì?
              </h2>
              <ul className="mt-6 space-y-4">
                {(
                  [
                    [
                      BookOpen,
                      'Bách khoa phân loại',
                      `${speciesCount} loài, ${taxonomyCount} bậc phân loại sắp theo 6 cấp từ Giới tới Chi, mỗi loài có mức bảo tồn IUCN và vùng bản địa.`,
                    ],
                    [
                      ShieldCheck,
                      'Sàn sinh vật cảnh có kiểm duyệt',
                      `Người bán phải được duyệt, sản phẩm phải qua kiểm duyệt viên trước khi lên sàn. Hiện có ${approvedProductCount} sản phẩm đang bán, mỗi sản phẩm gắn đúng một loài.`,
                    ],
                    [
                      Stamp,
                      'Hộ chiếu loài',
                      'Hộ chiếu lưu cùng tài khoản của bạn. Đi hết 9 trạm để nhận chứng nhận nhà thám hiểm.',
                    ],
                  ] as const
                ).map(([Icon, t, d]) => (
                  <li key={t} className="flex gap-3.5">
                    <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl border border-[#6ee7b7]/30 bg-[#6ee7b7]/10 text-[#6ee7b7]">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="font-semibold text-white">{t}</h3>
                      <p className="mt-0.5 text-sm leading-relaxed text-white/75">{d}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <a
                href="#/"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-[#6ee7b7] hover:underline"
              >
                Đọc thêm về BioNexus <ArrowRight className="size-4" aria-hidden="true" />
              </a>
            </div>

            <div>
              <WorldMap mode="preview" met={met} className="w-full" />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-2 font-mono text-xs text-white/65">
                <span>4 chặng · 10 ngày · 9 loài</span>
                <span>Lộ trình ≈ {totalKm.toLocaleString('vi-VN')} km</span>
              </div>
            </div>
          </div>
          <Exit />
        </div>
      </section>
    </>
  );
}
