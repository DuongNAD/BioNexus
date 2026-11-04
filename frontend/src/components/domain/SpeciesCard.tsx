import React from 'react';
import type { SpeciesViewModel } from '@/api/adapters';
import { IucnBadge } from '@/components/ui/IucnBadge';
import { MediaCard } from '@/components/media/MediaCard';

export interface SpeciesCardProps {
  species: SpeciesViewModel;
  /** Số cá thể đang bán; bỏ trống thì không hiện dòng này */
  productCount?: number;
  aspect?: '4/5' | '4/3' | '1/1';
  className?: string;
}

/** Thẻ loài: ảnh thật làm chủ, tên Việt, tên khoa học in nghiêng và mức IUCN */
export function SpeciesCard({ species, productCount, aspect = '4/5', className }: SpeciesCardProps): React.JSX.Element {
  return (
    <MediaCard
      to={`/species/${species.id}`}
      image={species.cardPhoto}
      imageAlt={species.displayName}
      focus={species.focus}
      aspect={aspect}
      className={className}
      badge={<IucnBadge code={species.conservationStatus} size="md" onMedia />}
      title={species.displayName}
      subtitle={<i className="font-serif text-[15px]">{species.scientificName}</i>}
      footer={
        <>
          <span>{species.group}</span>
          {productCount !== undefined && (
            <span>{productCount > 0 ? `${productCount} cá thể đang bán` : 'Chưa có cá thể đang bán'}</span>
          )}
        </>
      }
    />
  );
}
