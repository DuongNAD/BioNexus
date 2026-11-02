import React from 'react';
import { Link } from 'react-router';
import { ShoppingBag } from 'lucide-react';
import type { SpeciesDto } from '@/types/api';
import { IucnBadge } from '@/components/ui/IucnBadge';
import { Badge } from '@/components/ui/Badge';
import { SPECIES_EXTRAS, extractNames } from '@/api/adapters';
import { cn } from '@/lib/cn';

export interface SpeciesCardCompactProps {
  species: SpeciesDto;
  productCount?: number;
  className?: string;
}

export const SpeciesCardCompact: React.FC<SpeciesCardCompactProps> = ({
  species,
  productCount,
  className = '',
}) => {
  const { displayName } = extractNames(species.commonName);
  const extra = SPECIES_EXTRAS[species.scientificName];
  const photoUrl = extra ? `photos/${extra.slug}/hero-960.webp` : (species.imageURL || undefined);
  const count = productCount !== undefined ? productCount : 0;

  return (
    <Link
      to={`/species/${species.id}`}
      className={cn(
        'group relative flex aspect-[4/5] w-full flex-col justify-end overflow-hidden rounded-xl border border-line bg-surface transition-all duration-300 hover:border-accent/40 hover:shadow-xl hover:shadow-accent/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        className
      )}
    >
      <img
        src={photoUrl || undefined}
        alt={displayName}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        style={{ objectPosition: extra?.focus || 'center' }}
      />

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"
        aria-hidden="true"
      />

      <div className="absolute top-2.5 right-2.5 z-10">
        <IucnBadge code={species.conservationStatus} size="sm" className="bg-black/60 backdrop-blur-md shadow" />
      </div>

      <div className="relative z-10 p-3">
        <p className="font-semibold text-fg text-xs sm:text-sm truncate group-hover:text-accent transition-colors">
          {displayName}
        </p>

        <p className="font-serif italic text-accent-2 text-[11px] truncate">
          {species.scientificName}
        </p>

        <div className="mt-1.5 flex items-center gap-1">
          {count > 0 ? (
            <Badge variant="success" size="sm" className="text-[9px] px-1.5 py-0 bg-black/60 backdrop-blur-md">
              <ShoppingBag className="size-2.5 mr-1" /> {count} cá thể bán
            </Badge>
          ) : (
            <Badge variant="default" size="sm" className="text-[9px] px-1.5 py-0 bg-black/60 backdrop-blur-md text-fg-3">
              Chưa có cá thể bán
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
};
