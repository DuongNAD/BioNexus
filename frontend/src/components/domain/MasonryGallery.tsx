import React, { useState } from 'react';
import { Maximize2 } from 'lucide-react';
import { PHOTOS, type PhotoMetadata } from '@/content/photos';
import { Lightbox } from './Lightbox';
import { cn } from '@/lib/cn';

export interface MasonryGalleryProps {
  photoIds?: string[];
  photos?: PhotoMetadata[];
  className?: string;
}

export const MasonryGallery: React.FC<MasonryGalleryProps> = ({
  photoIds,
  photos: directPhotos,
  className = '',
}) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const resolvedPhotos: PhotoMetadata[] = React.useMemo(() => {
    if (directPhotos && directPhotos.length > 0) return directPhotos;
    if (photoIds && photoIds.length > 0) {
      return photoIds
        .map((id) => PHOTOS[id])
        .filter((p): p is PhotoMetadata => Boolean(p));
    }
    return [];
  }, [directPhotos, photoIds]);

  if (resolvedPhotos.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-8 text-center text-xs text-fg-3">
        Đang cập nhật bộ ảnh lưu trữ...
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          'columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4',
          className
        )}
      >
        {resolvedPhotos.map((photo, idx) => {
          const webpSrc =
            photo.sources.webp[photo.sources.webp.length - 1]?.src ||
            photo.sources.jpg ||
            '';

          return (
            <div
              key={photo.id || idx}
              onClick={() => setLightboxIndex(idx)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setLightboxIndex(idx);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`Mở ảnh: ${photo.title || photo.alt}`}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-line bg-surface-2 break-inside-avoid transition-all duration-300 hover:border-accent/40 hover:shadow-xl hover:shadow-accent/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <img
                src={webpSrc}
                alt={photo.alt || photo.title}
                loading="lazy"
                className="w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                style={{ objectPosition: photo.focus || 'center' }}
              />

              <div
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-white"
                aria-hidden="true"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold truncate text-white/95">
                    {photo.title || photo.alt}
                  </p>
                  <span className="flex size-7 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
                    <Maximize2 className="size-3.5 text-white" />
                  </span>
                </div>
                {photo.credit?.author && (
                  <p className="text-[10px] text-white/70 truncate mt-0.5">
                    Ảnh: {photo.credit.author} ({photo.credit.license})
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Lightbox
        photos={resolvedPhotos}
        initialIndex={lightboxIndex ?? 0}
        isOpen={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
      />
    </>
  );
};
