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
          'absolute bottom-2.5 right-2.5 pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10',
          className
        )}
      >
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-line text-[11px] text-fg-3 shadow-lg select-none">
          <span>© {credit.author}</span>
          <span className="text-line-strong">·</span>
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
            className="text-fg-3 hover:text-fg ml-0.5"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    );
  }

  if (variant === 'banner-fixed') {
    return (
      <div className={cn('text-[11px] text-fg-3 flex items-center gap-1.5', className)}>
        <span>Nguồn ảnh: © {credit.author} ({credit.license})</span>
        <a
          href={credit.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline flex items-center gap-0.5"
        >
          <span>Commons</span>
          <ExternalLink className="w-2.5 h-2.5" />
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
        className="w-5 h-5 rounded-full bg-surface-hover border border-line flex items-center justify-center text-fg-3 hover:text-fg"
        aria-label="Thông tin bản quyền ảnh"
      >
        <Info className="w-3 h-3" />
      </button>

      {popoverOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-56 p-2.5 rounded-xl bg-bg-raised border border-line text-xs text-fg-2 shadow-2xl z-50 backdrop-blur-2xl">
          <p className="font-semibold text-fg mb-1">Bản quyền hình ảnh</p>
          <p className="text-[11px] text-fg-3 mb-1.5">Tác giả: {credit.author}</p>
          <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-line/60">
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
              <span>Gốc</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
