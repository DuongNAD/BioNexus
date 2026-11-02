import React, { useState } from 'react';
import { PHOTOS, type PhotoId, type PhotoMetadata } from '@/content/photos';
import { cn } from '@/lib/cn';

export interface PhotoProps extends React.HTMLAttributes<HTMLDivElement> {
  id?: PhotoId | string;
  photo?: PhotoMetadata;
  alt?: string;
  sizes?: string;
  priority?: boolean;
  aspectRatio?: string;
  objectFit?: 'cover' | 'contain' | 'scale-down';
  imgClassName?: string;
}

export const Photo: React.FC<PhotoProps> = ({
  id,
  photo: directPhoto,
  alt,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  priority = false,
  aspectRatio,
  objectFit = 'cover',
  className = '',
  imgClassName = '',
  style,
  ...rest
}) => {
  const photo = directPhoto || (id ? PHOTOS[id] : undefined);
  const [isLoaded, setIsLoaded] = useState(false);

  if (!photo) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-xl border border-line bg-surface text-xs text-fg-3 select-none',
          className
        )}
        style={{ aspectRatio: aspectRatio || '16/9', ...style }}
        {...rest}
      >
        <span>Chưa có ảnh</span>
      </div>
    );
  }

  const avifSrcSet = photo.sources.avif.map((s) => `${s.src} ${s.width}w`).join(', ');
  const webpSrcSet = photo.sources.webp.map((s) => `${s.src} ${s.width}w`).join(', ');
  const fallbackSrc =
    photo.sources.jpg || photo.sources.webp[photo.sources.webp.length - 1]?.src;

  const resolvedAlt = alt || photo.alt || photo.title;
  const hasFullHeight = className.includes('h-full') || className.includes('size-full');
  const resolvedAspectRatio = aspectRatio || (hasFullHeight ? undefined : `${photo.width}/${photo.height}`);

  return (
    <div
      className={cn('relative overflow-hidden rounded-xl bg-bg-raised', className)}
      style={{ ...(resolvedAspectRatio ? { aspectRatio: resolvedAspectRatio } : {}), ...style }}
      {...rest}
    >
      {/* 1. Base64 placeholder blur */}
      {!isLoaded && photo.placeholder && (
        <img
          src={photo.placeholder}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover filter blur-lg scale-105"
          style={{ objectPosition: photo.focus }}
        />
      )}

      {/* 2. Responsive picture element */}
      <picture className="block h-full w-full">
        {avifSrcSet && <source type="image/avif" srcSet={avifSrcSet} sizes={sizes} />}
        {webpSrcSet && <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />}
        <img
          ref={(el) => {
            if (el?.complete && !isLoaded) setIsLoaded(true);
          }}
          src={fallbackSrc}
          alt={resolvedAlt}
          sizes={sizes}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          className={cn(
            'relative z-10 h-full w-full transition-opacity duration-300 ease-out opacity-100',
            imgClassName
          )}
          style={{
            objectFit,
            objectPosition: photo.focus,
          }}
        />
      </picture>
    </div>
  );
};
