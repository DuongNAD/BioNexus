import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { IucnBadge } from '@/components/ui/IucnBadge';
import { PHOTOS } from '@/content/photos';

const AUTH_SLIDES = [
  { key: 'axolotl/hero-1', iucn: 'CR' },
  { key: 'nepenthes-rajah/hero-1', iucn: 'EN' },
  { key: 'ball-python/hero-1', iucn: 'NT' },
  { key: 'bearded-dragon/hero-1', iucn: 'LC' },
  { key: 'venus-flytrap/hero-1', iucn: 'VU' },
];

function BrandLink(): React.JSX.Element {
  return (
    <Link to="/" className="inline-flex items-center gap-2.5 text-lg font-bold tracking-tight text-accent" aria-label="BioNexus - Về trang chủ">
      <span className="flex size-8 items-center justify-center rounded-lg border border-accent/30 bg-black/40 text-accent">
        <Logo size={20} />
      </span>
      <span>BioNexus</span>
    </Link>
  );
}

/**
 * Khung đăng nhập chia đôi (tài liệu 03 mục 12): trái là ảnh loài thật đổi mỗi 6 giây, phải là form.
 * Mobile: ảnh thu thành dải phía trên, form bên dưới.
 */
export function AuthLayout(): React.JSX.Element {
  const location = useLocation();
  const isAdminLogin = location.pathname.includes('/admin');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % AUTH_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slideConfig = AUTH_SLIDES[currentSlideIndex] ?? AUTH_SLIDES[0]!;
  const defaultPhoto = Object.values(PHOTOS)[0]!;
  const photo = PHOTOS[slideConfig.key] ?? defaultPhoto;
  const imgSrc = photo.sources.webp[photo.sources.webp.length - 1]?.src ?? photo.sources.jpg;

  const credit = (
    <p className="text-xs leading-relaxed text-white/75">
      <span className="font-medium text-white">{photo.title}</span>
      {photo.scientificName && <i className="ml-1 font-serif text-[13px]">({photo.scientificName})</i>}
      <span className="block">
        Ảnh: {photo.credit.author} · {photo.credit.license} ·{' '}
        <a href={photo.credit.sourceUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-white">
          Nguồn gốc
        </a>
      </span>
    </p>
  );

  return (
    <div className="grid min-h-screen bg-bg text-fg lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
      {/* Cột ảnh (desktop) */}
      <div className="relative hidden overflow-hidden bg-bg-deep lg:block">
        <img
          key={photo.id}
          src={imgSrc}
          alt={photo.alt || photo.title}
          className="absolute inset-0 size-full object-cover [animation:fade-in-soft_1s_ease-out,kenburns_9s_ease-in-out_infinite_alternate]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/40" aria-hidden="true" />

        <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
          <div className="flex items-center justify-between">
            <BrandLink />
            {isAdminLogin && (
              <span className="rounded-full border border-warm/40 bg-black/40 px-3 py-1 text-xs font-semibold text-warm backdrop-blur-md">
                Khu vực quản trị
              </span>
            )}
          </div>

          <div className="max-w-xl">
            <p className="text-4xl leading-[1.05] font-semibold tracking-[-0.04em] text-white xl:text-5xl">
              {isAdminLogin ? (
                <>
                  Mỗi cá thể lên sàn đều <span className="font-serif font-medium text-accent italic">được thẩm định</span>.
                </>
              ) : (
                <>
                  Mọi loài đều có <span className="font-serif font-medium text-accent italic">quỹ đạo riêng</span>.
                </>
              )}
            </p>
            <p className="mt-4 max-w-md text-base leading-relaxed text-white/75">
              {isAdminLogin
                ? 'Kiểm duyệt shop và sản phẩm, quản lý bách khoa loài trong một nơi.'
                : 'Bách khoa sinh học 6 cấp và sàn sinh vật cảnh nhân giống có kiểm duyệt.'}
            </p>
            <div className="mt-10 flex items-end justify-between gap-6 border-t border-white/15 pt-5">
              {credit}
              <IucnBadge code={slideConfig.iucn} size="sm" className="shrink-0 bg-black/50 backdrop-blur-md" />
            </div>
          </div>
        </div>
      </div>

      {/* Cột form */}
      <div className="flex min-w-0 flex-col">
        {/* Dải ảnh trên mobile */}
        <div className="relative h-[30vh] min-h-48 overflow-hidden lg:hidden">
          <img src={imgSrc} alt={photo.alt || photo.title} className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-black/30 to-black/40" aria-hidden="true" />
          <div className="absolute inset-x-4 top-4">
            <BrandLink />
          </div>
          <div className="absolute inset-x-4 bottom-3">{credit}</div>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-8 lg:px-12">
          <main id="main-content" className="w-full max-w-md">
            <Outlet />
          </main>
          <Link to="/" className="mt-10 inline-flex items-center gap-1.5 text-sm text-fg-3 transition-colors hover:text-fg">
            <ArrowLeft className="size-4" aria-hidden="true" />
            <span>Về trang chủ</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
