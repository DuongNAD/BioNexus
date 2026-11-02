import React from 'react';
import { Mountain, Trees, Compass } from 'lucide-react';
import type { SpeciesViewModel } from '@/api/adapters';
import { Photo } from '@/components/media/Photo';
import { cn } from '@/lib/cn';

export interface HabitatCardProps {
  species: SpeciesViewModel;
  className?: string;
}

export const HabitatCard: React.FC<HabitatCardProps> = ({ species, className = '' }) => {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-line bg-surface p-5 backdrop-blur-md flex flex-col justify-between transition-all duration-300 hover:border-accent/40',
        className
      )}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-line/40">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-accent/10 text-accent border border-accent/20">
              <Mountain className="size-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-fg-2">Sinh cảnh bản địa</h4>
              <p className="text-[11px] text-fg-3">{species.group}</p>
            </div>
          </div>
          <span className="flex items-center gap-1 text-[11px] font-mono text-accent">
            <Compass className="size-3" />
            {species.nativeCoordsFormatted || `${species.origin.lat}°, ${species.origin.lng}°`}
          </span>
        </div>

        {/* Khung ảnh Sinh cảnh Thật */}
        <div className="relative mt-3.5 aspect-video w-full overflow-hidden rounded-xl border border-line bg-surface-2">
          {species.habitatPhotoId ? (
            <Photo
              id={species.habitatPhotoId}
              alt={`Sinh cảnh ${species.displayName}`}
              className="h-full w-full rounded-none"
              imgClassName="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-fg-3">
              Ảnh sinh cảnh tự nhiên
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] text-white/90 font-medium">
            <span className="flex items-center gap-1 truncate">
              <Trees className="size-3 text-emerald-400 shrink-0" />
              {species.origin.place}
            </span>
          </div>
        </div>
      </div>

      {/* Mô tả thích nghi môi trường */}
      <div className="mt-3 rounded-xl bg-surface-2/60 p-3 text-xs text-fg-2 border border-line/30 leading-relaxed">
        <p className="line-clamp-3">
          {species.environmentSpecs || 'Môi trường sống tự nhiên đòi hỏi vi khí hậu ổn định và nguồn sáng chuyên biệt.'}
        </p>
      </div>
    </div>
  );
};
