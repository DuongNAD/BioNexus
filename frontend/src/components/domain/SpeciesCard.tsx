import React from 'react';
import { Link } from 'react-router';
import { MapPin, ShoppingBag } from 'lucide-react';
import type { SpeciesViewModel } from '@/api/adapters';
import { IucnBadge } from '@/components/ui/IucnBadge';
import { Badge } from '@/components/ui/Badge';
import { Photo } from '@/components/media/Photo';
import { cn } from '@/lib/cn';

export interface SpeciesCardProps {
  species: SpeciesViewModel;
  productCount?: number;
  simplifiedTaxonPath?: string;
  className?: string;
  onClick?: () => void;
}

export const SpeciesCard: React.FC<SpeciesCardProps> = ({
  species,
  productCount,
  simplifiedTaxonPath,
  className = '',
  onClick,
}) => {
  const count = productCount !== undefined ? productCount : undefined;

  return (
    <Link
      to={`/species/${species.id}`}
      onClick={onClick}
      className={cn(
        'group relative flex aspect-[4/5] w-full flex-col justify-end overflow-hidden rounded-2xl border border-line bg-surface transition-all duration-500 ease-out hover:border-accent/50 hover:shadow-2xl hover:shadow-accent/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        className
      )}
    >
      {/* 1. Lớp Ảnh Thật với Hover Scale 1.05 */}
      <div className="absolute inset-0 h-full w-full overflow-hidden">
        {species.heroPhotoId ? (
          <Photo
            id={species.heroPhotoId}
            alt={species.displayName}
            className="h-full w-full rounded-none"
            imgClassName="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            style={{ objectPosition: species.focus || 'center' }}
          />
        ) : (
          <img
            src={species.heroPhoto}
            alt={species.displayName}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            style={{ objectPosition: species.focus || 'center' }}
          />
        )}
      </div>

      {/* 2. Lớp Gradient Phủ Đáy Chuẩn WCAG 2.2 AA */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"
        aria-hidden="true"
      />

      {/* 3. Huy Hiệu Góc Trên: IUCN & Số Cá Thể Bán */}
      <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 z-10">
        <IucnBadge code={species.conservationStatus} size="sm" className="shadow-lg backdrop-blur-md bg-black/60" />
        {count !== undefined && (
          <Badge
            variant={count > 0 ? 'accent' : 'default'}
            size="sm"
            className={cn(
              'backdrop-blur-md text-[10px] shadow-lg font-mono',
              count > 0 ? 'bg-black/70 text-accent border border-accent/30' : 'bg-black/60 text-fg-3 border border-white/10'
            )}
          >
            <ShoppingBag className="size-2.5 mr-1 inline" />
            {count > 0 ? `${count} cá thể bán` : 'Chưa có hàng'}
          </Badge>
        )}
      </div>

      {/* 4. Khối Thông Tin Sinh Học Dưới Đáy */}
      <div className="relative z-10 p-4 transition-transform duration-300 ease-out">
        {/* Đường dẫn phân loại rút gọn lộ ra khi hover */}
        {simplifiedTaxonPath && (
          <p className="mb-1 text-[11px] font-mono text-accent-2 truncate opacity-80 group-hover:opacity-100 transition-opacity">
            {simplifiedTaxonPath}
          </p>
        )}

        {/* Tên thường */}
        <h3 className="font-sans font-semibold text-fg text-base sm:text-lg line-clamp-1 group-hover:text-accent transition-colors">
          {species.displayName}
        </h3>

        {/* Tên khoa học in nghiêng */}
        <p className="font-serif italic text-accent-2 text-xs sm:text-sm line-clamp-1">
          {species.scientificName}
        </p>

        {/* Nơi bản địa */}
        {species.origin?.place && (
          <p className="mt-1 flex items-center gap-1 text-[11px] text-fg-3 line-clamp-1">
            <MapPin className="size-3 text-accent shrink-0" aria-hidden="true" />
            <span className="truncate">{species.origin.place}</span>
          </p>
        )}
      </div>
    </Link>
  );
};
