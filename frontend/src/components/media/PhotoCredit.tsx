import React, { useState } from 'react';
import { ExternalLink, Info } from 'lucide-react';
import type { PhotoCredit as CreditType } from '@/content/photos';
import { cn } from '@/lib/cn';

export interface PhotoCreditProps {
  credit: CreditType;
  variant?: 'hover-chip' | 'mobile-popover' | 'banner-fixed' | 'inline';
  className?: string;
}

export const PhotoCredit: React.FC<PhotoCreditProps> = ({
  credit,
  variant = 'hover-chip',
  className = '',
}) => {
  const [popoverOpen, setPopoverOpen] = useState(false);

  if (variant === 'hover-chip') {
    return (
      <div
        className={cn(
          'absolute bottom-2.5 right-2.5 pointer-events-auto opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-within:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity duration-200 z-10',
          className
        )}
      >
        <div className="flex max-w-[calc(100vw-3rem)] items-center gap-1.5 rounded-full bg-black/70 px-3 py-1 text-xs text-white/85 backdrop-blur-md select-none">
          <span className="truncate">© {credit.author}</span>
          <span className="text-white/40" aria-hidden="true">·</span>
          <a
            href={credit.licenseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline text-accent"
          >
            {credit.license}
          </a>
          <a
            href={credit.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Xem file gốc trên Wikimedia Commons"
            aria-label="Xem file gốc trên Wikimedia Commons"
            className="ml-0.5 shrink-0 text-white/70 hover:text-white"
          >
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    );
  }

  if (variant === 'banner-fixed') {
    return (
      <div className={cn('flex flex-wrap items-center gap-x-1.5 text-xs text-fg-3', className)}>
        <span>Nguồn ảnh: © {credit.author} ({credit.license})</span>
        <a
          href={credit.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline flex items-center gap-0.5"
        >
          <span>Commons</span>
          <ExternalLink className="size-3" aria-hidden="true" />
        </a>
      </div>
    );
  }

  // Variant inline hoặc mobile-popover
  return (
    <div className={cn('relative inline-block', className)}>
      <button
        type="button"
        onClick={() => setPopoverOpen(!popoverOpen)}
        aria-expanded={popoverOpen}
        className="flex size-8 items-center justify-center rounded-full bg-black/50 text-white/80 backdrop-blur-md hover:text-white"
        aria-label="Thông tin bản quyền ảnh"
      >
        <Info className="size-4" aria-hidden="true" />
      </button>

      {popoverOpen && (
        <div className="absolute bottom-full right-0 z-50 mb-2 w-60 rounded-[10px] border border-line bg-bg-raised p-3 text-sm text-fg-2">
          <p className="font-semibold text-fg mb-1">Bản quyền hình ảnh</p>
          <p className="mb-2 text-fg-2">Tác giả: {credit.author}</p>
          <div className="flex items-center justify-between border-t border-line pt-2">
            <a
              href={credit.licenseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              {credit.license}
            </a>
            <a
              href={credit.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-fg-3 hover:text-fg flex items-center gap-0.5"
            >
              <span>Xem file gốc</span>
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
