import React from 'react';
import type { SpeciesViewModel } from '@/api/adapters';
import type { TaxonomyNodeDto } from '@/types/api';
import { IucnBadge } from '@/components/ui/IucnBadge';
import { Breadcrumbs, Eyebrow, PageContainer } from '@/components/layout/Page';
import { PhotoCredit } from '@/components/media/PhotoCredit';
import { PHOTOS, type PhotoCredit as PhotoCreditData } from '@/content/photos';
import type { CatalogPhoto } from '@/api/catalog';

export interface SpeciesHeroCoverProps {
  species: SpeciesViewModel;
  breadcrumbs: TaxonomyNodeDto[];
  /** Nguồn ảnh hero của loài catalog (9 loài gốc lấy từ PHOTOS) */
  catalogHero?: CatalogPhoto | null;
}

/** Đổi nguồn ảnh catalog sang dạng PhotoCredit dùng chung */
export function catalogCredit(photo: CatalogPhoto): PhotoCreditData {
  return {
    author: photo.author,
    license: photo.license,
    licenseUrl: photo.licenseUrl || 'https://creativecommons.org/licenses/',
    sourceUrl: photo.sourceUrl,
    modified: photo.modified,
  };
}

/**
 * Bìa hồ sơ loài: ảnh thật tràn ngang màn hình (mẫu R "Axolotl phóng to"), chữ đặt trên lớp phủ tối.
 * Chứa H1 duy nhất của trang.
 */
export const SpeciesHeroCover: React.FC<SpeciesHeroCoverProps> = ({ species, breadcrumbs, catalogHero }) => {
  const photoMeta = species.heroPhotoId ? PHOTOS[species.heroPhotoId] : undefined;
  const credit = photoMeta?.credit ?? (catalogHero ? catalogCredit(catalogHero) : undefined);
  // Đường dẫn ngắn: bách khoa, vài cấp gần nhất của cây phân loại, rồi loài
  const crumbs = [
    { label: 'Bách khoa loài', to: '/species' },
    ...breadcrumbs.slice(-3).map((n) => ({
      label: (n.rankLevel || n.rank) === 'GENUS' ? <i className="font-serif">{n.scientificName}</i> : n.scientificName,
      to: `/taxonomy/${n.id}`,
    })),
    { label: species.displayName },
  ];

  return (
    <section className="group relative isolate flex min-h-[72vh] items-end overflow-hidden md:min-h-[80vh]">
      <img
        src={species.heroPhoto}
        alt={species.displayName}
        fetchPriority="high"
        className="absolute inset-0 -z-20 size-full object-cover"
        style={{ objectPosition: species.focus || 'center' }}
      />
      {/* Lớp phủ để chữ trên ảnh đạt tương phản AA */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-bg via-bg/55 to-bg/10" aria-hidden="true" />
      <div className="absolute inset-0 -z-10 hidden bg-gradient-to-r from-bg/80 via-bg/20 to-transparent md:block" aria-hidden="true" />

      <PageContainer className="pt-28 pb-10 md:pb-16">
        <Breadcrumbs items={crumbs} className="mb-6 text-white/70 [&_a:hover]:text-white [&_[aria-current]]:text-white/90" />
        <Eyebrow className="mb-4">
          {[species.group, species.origin.place].filter(Boolean).join(' · ')}
        </Eyebrow>
        <h1 className="max-w-4xl text-[44px] leading-[0.95] font-semibold tracking-[-0.05em] text-white md:text-[84px]">
          {species.displayName}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="font-serif text-2xl text-accent-2 italic md:text-[34px]">{species.scientificName}</p>
          {species.englishName && <span className="text-base text-white/70">{species.englishName}</span>}
          <IucnBadge code={species.conservationStatus} size="md" className="bg-black/60 backdrop-blur-md" />
        </div>
      </PageContainer>

      {credit && <PhotoCredit credit={credit} variant="hover-chip" />}
    </section>
  );
};
