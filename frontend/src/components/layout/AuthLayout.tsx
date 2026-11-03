import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router';
import { Logo } from '@/components/ui/Logo';
import { IucnBadge } from '@/components/ui/IucnBadge';
import { ShieldAlert } from 'lucide-react';
import { PHOTOS } from '@/content/photos';

const AUTH_SLIDES = [
  { key: 'axolotl/hero-1', iucn: 'CR' },
  { key: 'nepenthes-rajah/hero-1', iucn: 'EN' },
  { key: 'ball-python/hero-1', iucn: 'NT' },
  { key: 'bearded-dragon/hero-1', iucn: 'LC' },
  { key: 'venus-flytrap/hero-1', iucn: 'VU' },
];

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

  const defaultSlide = AUTH_SLIDES[0]!;
  const slideConfig = AUTH_SLIDES[currentSlideIndex] ?? defaultSlide;
  const defaultPhoto = Object.values(PHOTOS)[0]!;
  const photo = (slideConfig?.key ? PHOTOS[slideConfig.key] : defaultPhoto) ?? defaultPhoto;
  const imgSrc = photo.sources.webp[photo.sources.webp.length - 1]?.src ?? photo.sources.jpg;

  return (
    <div className="grid min-h-screen lg:grid-cols-12 bg-bg text-fg">
      {/* Cột trái (55% desktop): Trình chiếu Ken Burns Iris Slideshow */}
      <div className="hidden lg:flex lg:col-span-7 flex-col justify-between border-r border-line bg-bg-deep p-10 relative overflow-hidden">
        {/* Slideshow background với hiệu ứng Ken Burns & Iris */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div
            key={photo.id}
            className="absolute inset-0 bg-cover bg-center transition-all duration-1000 animate-in fade-in"
            style={{
              backgroundImage: `url(${imgSrc})`,
              transform: 'scale(1.05)',
              animation: 'kenburns 8s ease-in-out infinite alternate',
            }}
          />
          {/* Lớp phủ chuyển tiếp tối sâu */}
          <div className="absolute inset-0 bg-gradient-to-t from-bg-deep/95 via-bg-deep/40 to-bg-deep/30" />
          <div className="absolute inset-0 bg-black/35 backdrop-blur-[1px]" />
        </div>

        {/* Header trên ảnh */}
        <div className="relative z-10 flex items-center justify-between">
          <Link
            to="/"
            className="group flex items-center gap-2.5 text-xl font-bold tracking-tight text-accent"
            aria-label="BioNexus - Về trang chủ"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/30 bg-black/50 text-accent transition-colors group-hover:border-accent group-hover:bg-accent/20">
              <Logo size={22} />
            </span>
            <span className="bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-transparent font-sans">
              BioNexus
            </span>
          </Link>

          {isAdminLogin && (
            <div className="flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-mono text-amber-300 backdrop-blur-md">
              <ShieldAlert className="size-3.5" />
              <span>Cổng Quản Trị</span>
            </div>
          )}
        </div>

        {/* Khối trích dẫn giữa */}
        <div className="relative z-10 my-auto py-8 max-w-lg">
          <span className="rounded-full border border-line bg-black/60 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent backdrop-blur-md font-mono">
            {isAdminLogin ? 'Quản trị Sinh quyển' : 'Sinh quyển & Bảo tồn'}
          </span>
          <blockquote className="mt-4 text-2xl xl:text-3xl font-serif italic text-fg leading-relaxed">
            {isAdminLogin
              ? '"Trách nhiệm thẩm định nghiêm ngặt để mọi cá thể mở bán đều vẹn nguyên nguồn gốc nhân tạo F2+."'
              : '"Mọi cá thể đều có quỹ đạo riêng trong sinh quyển sự sống. Bảo tồn là gìn giữ mắt xích của muôn loài."'}
          </blockquote>
          <p className="mt-3 text-xs text-fg-2 font-sans">
            Sàn giao dịch sinh vật cảnh nhân giống có kiểm định sinh học & bách khoa toàn thư phân loại.
          </p>
        </div>

        {/* Hộp ghi công bản quyền nổi (Floating Credit Card) */}
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-line/40 pt-4">
          <div className="rounded-xl border border-white/10 bg-black/60 backdrop-blur-md p-3 text-xs shadow-xl max-w-md">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-fg font-sans">{photo.title}</span>
              {photo.scientificName && (
                <span className="italic text-fg-3 font-serif">({photo.scientificName})</span>
              )}
              <IucnBadge code={slideConfig.iucn} size="sm" showLabel={false} />
            </div>
            <p className="text-[11px] text-fg-3">
              Ảnh: {photo.credit.author} · Giấy phép {photo.credit.license} · Nguồn:{' '}
              <a
                href={photo.credit.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-accent underline underline-offset-2 hover:text-white"
              >
                Wikimedia Commons
              </a>
            </p>
          </div>

          <Link to="/" className="text-xs text-fg-3 hover:text-accent transition-colors font-mono shrink-0">
            ← Quay lại trang chủ
          </Link>
        </div>
      </div>

      {/* Cột phải (45% desktop): Form xác thực */}
      <div className="col-span-12 lg:col-span-5 flex flex-col justify-center items-center p-6 md:p-12 relative">
        {/* Banner mobile thu nhỏ 28vh */}
        <div className="w-full mb-6 lg:hidden relative h-40 rounded-2xl overflow-hidden border border-line bg-surface-2">
          <img src={imgSrc} alt={photo.title} className="size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
            <span className="font-semibold text-fg truncate">{photo.title}</span>
            <IucnBadge code={slideConfig.iucn} size="sm" showLabel={false} />
          </div>
        </div>

        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
