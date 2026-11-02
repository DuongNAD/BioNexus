import React from 'react';
import { Compass } from 'lucide-react';
import type { SpeciesViewModel } from '@/api/adapters';
import type { TaxonomyNodeDto } from '@/types/api';
import { IucnBadge } from '@/components/ui/IucnBadge';
import { TaxonPath } from '@/components/domain/TaxonPath';
import { PhotoCredit } from '@/components/media/PhotoCredit';
import { PHOTOS } from '@/content/photos';
import { cn } from '@/lib/cn';

export interface SpeciesHeroCoverProps {
  species: SpeciesViewModel;
  breadcrumbs: TaxonomyNodeDto[];
  className?: string;
}

export const SpeciesHeroCover: React.FC<SpeciesHeroCoverProps> = ({
  species,
  breadcrumbs,
  className = '',
}) => {
  const photoMeta = species.heroPhotoId ? PHOTOS[species.heroPhotoId] : undefined;

  return (
    <div
      className={cn(
        'group relative min-h-[75vh] lg:min-h-[82vh] w-full overflow-hidden rounded-3xl border border-line bg-bg shadow-2xl flex flex-col justify-end p-6 sm:p-10 lg:p-14',
        className
      )}
    >
      {/* 1. Lớp Ảnh Thật Lớn Nhất với objectPosition Riêng */}
      <div className="absolute inset-0 h-full w-full">
        <img
          src={species.heroPhoto}
          alt={species.displayName}
          className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.02]"
          style={{ objectPosition: species.focus || 'center' }}
        />
      </div>

      {/* 2. Lớp Gradient 2 Chiều: Trái & Đáy Đạt Chuẩn WCAG 2.2 AA */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent opacity-95"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-bg via-bg/40 to-transparent opacity-90 hidden sm:block"
        aria-hidden="true"
      />

      {/* 3. Nội Dung Tạp Chí Khoa Học Phía Trên */}
      <div className="relative z-10 max-w-3xl space-y-4">
        {/* Đường dẫn phân loại rút gọn 6 cấp */}
        <div className="inline-block rounded-full bg-black/60 px-3.5 py-1.5 backdrop-blur-md border border-white/10">
          <TaxonPath breadcrumbs={breadcrumbs} />
        </div>

        {/* Eyebrow: Nhóm sinh học & Nơi bản địa */}
        <div className="flex items-center gap-2 text-xs font-mono tracking-[0.25em] text-accent uppercase font-semibold">
          <span>{species.group}</span>
          <span className="text-white/40">·</span>
          <span className="flex items-center gap-1 text-white/80">
            <Compass className="size-3 text-emerald-400" />
            {species.origin.place}
          </span>
        </div>

        {/* H1 Tên thường (Bỏ ngoặc đơn tiếng Anh) */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white font-sans drop-shadow-md">
          {species.displayName}
        </h1>

        {/* Tên khoa học Cormorant Garamond Italic Serif */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <p className="font-serif italic text-2xl sm:text-3xl lg:text-4xl text-accent-2 tracking-wide drop-shadow">
            {species.scientificName}
          </p>

          {species.englishName && (
            <span className="text-xs sm:text-sm font-sans text-white/60">
              ({species.englishName})
            </span>
          )}

          <IucnBadge code={species.conservationStatus} size="md" className="shadow-lg backdrop-blur-md bg-black/70 ml-2" />
        </div>

        {/* Câu trích dẫn tóm tắt bảo tồn */}
        {species.conservationNote && (
          <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed pt-2 border-t border-white/10">
            {species.conservationNote}
          </p>
        )}
      </div>

      {/* 4. Chip Ghi Công Bản Quyền Ảnh Wikimedia Commons */}
      {photoMeta?.credit && (
        <PhotoCredit credit={photoMeta.credit} variant="hover-chip" />
      )}
    </div>
  );
};
