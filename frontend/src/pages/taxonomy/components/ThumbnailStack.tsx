import React from 'react';
import { cn } from '@/lib/cn';

export interface ThumbnailItem {
  speciesId: number;
  name: string;
  url: string;
}

export interface ThumbnailStackProps {
  thumbnails: ThumbnailItem[];
  totalCount?: number;
  className?: string;
}

export const ThumbnailStack: React.FC<ThumbnailStackProps> = ({
  thumbnails,
  totalCount,
  className = '',
}) => {
  if (thumbnails.length === 0) return null;

  const displayThumbs = thumbnails.slice(0, 3);
  const remaining = (totalCount !== undefined ? totalCount : thumbnails.length) - displayThumbs.length;

  return (
    <div className={cn('flex items-center -space-x-2 overflow-hidden py-1', className)}>
      {displayThumbs.map((thumb, idx) => (
        <img
          key={thumb.speciesId}
          src={thumb.url}
          alt={thumb.name}
          className="size-7 rounded-full border-2 border-bg object-cover shadow-sm transition-transform duration-200 group-hover:translate-x-0.5"
          style={{ zIndex: 3 - idx }}
          loading="lazy"
        />
      ))}
      {remaining > 0 && (
        <span
          className="flex size-7 items-center justify-center rounded-full border-2 border-bg bg-surface-2 text-[10px] font-mono text-fg-3 shadow-sm"
          style={{ zIndex: 0 }}
        >
          +{remaining}
        </span>
      )}
    </div>
  );
};
