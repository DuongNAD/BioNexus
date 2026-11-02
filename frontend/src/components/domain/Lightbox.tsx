import React, { useEffect, useState, useCallback } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import type { PhotoMetadata } from '@/content/photos';

export interface LightboxProps {
  photos: PhotoMetadata[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export const Lightbox: React.FC<LightboxProps> = ({
  photos,
  initialIndex = 0,
  isOpen,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  const handlePrev = useCallback(() => {
    if (photos.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  }, [photos.length]);

  const handleNext = useCallback(() => {
    if (photos.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  }, [photos.length]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, handlePrev, handleNext, onClose]);

  if (!isOpen || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex] || photos[0];
  if (!currentPhoto) return null;

  const webpSrc =
    currentPhoto.sources.webp[currentPhoto.sources.webp.length - 1]?.src ||
    currentPhoto.sources.jpg ||
    '';

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl transition-opacity animate-in fade-in-0 duration-200" />
        <DialogPrimitive.Content
          className="fixed inset-0 z-50 flex flex-col items-center justify-between p-4 sm:p-6 text-white focus:outline-none"
          aria-modal="true"
          role="dialog"
          aria-label={currentPhoto.title || 'Trình xem ảnh lớn'}
        >
          {/* Thanh trên: Chỉ số ảnh & Nút đóng */}
          <div className="flex w-full items-center justify-between z-10 max-w-7xl">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-white/60">
                {currentIndex + 1} / {photos.length}
              </span>
              <span className="text-white/30">|</span>
              <span className="text-xs font-medium text-emerald-400 truncate max-w-xs sm:max-w-md">
                {currentPhoto.title}
              </span>
            </div>

            <DialogPrimitive.Close
              onClick={onClose}
              className="flex size-11 items-center justify-center rounded-full bg-white/10 text-white/80 backdrop-blur-md transition-colors hover:bg-white/20 hover:text-white focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
              aria-label="Đóng trình xem ảnh"
            >
              <X className="size-5" />
            </DialogPrimitive.Close>
          </div>

          {/* Vùng ảnh chính & Nút mũi tên lật ảnh */}
          <div className="relative flex flex-1 w-full items-center justify-center my-4 overflow-hidden max-w-7xl">
            {photos.length > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-2 sm:left-4 z-20 flex size-12 items-center justify-center rounded-full bg-black/60 border border-white/10 text-white/80 backdrop-blur-md transition-all hover:bg-black/90 hover:text-white hover:scale-105 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
                aria-label="Ảnh trước (phím Mũi tên Trái)"
              >
                <ChevronLeft className="size-6" />
              </button>
            )}

            <div className="relative max-h-[70vh] max-w-full flex items-center justify-center">
              <img
                src={webpSrc}
                alt={currentPhoto.alt || currentPhoto.title}
                className="max-h-[70vh] max-w-full object-contain rounded-xl shadow-2xl transition-all duration-300"
              />
            </div>

            {photos.length > 1 && (
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-2 sm:right-4 z-20 flex size-12 items-center justify-center rounded-full bg-black/60 border border-white/10 text-white/80 backdrop-blur-md transition-all hover:bg-black/90 hover:text-white hover:scale-105 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
                aria-label="Ảnh tiếp theo (phím Mũi tên Phải)"
              >
                <ChevronRight className="size-6" />
              </button>
            )}
          </div>

          {/* Thanh dưới: Chú thích bản quyền Wikimedia Commons chuẩn mực */}
          <div className="w-full max-w-4xl rounded-xl border border-white/10 bg-black/60 px-4 py-2.5 backdrop-blur-md text-center text-xs text-white/70">
            <p className="font-medium text-white/90">{currentPhoto.alt || currentPhoto.title}</p>
            <div className="mt-1 flex flex-wrap items-center justify-center gap-2 text-[11px] text-white/60">
              {currentPhoto.credit?.author && (
                <span>Tác giả: <strong className="text-white/80">{currentPhoto.credit.author}</strong></span>
              )}
              {currentPhoto.credit?.license && (
                <span>· Giấy phép: <span className="text-emerald-400">{currentPhoto.credit.license}</span></span>
              )}
              {currentPhoto.credit?.sourceUrl && (
                <a
                  href={currentPhoto.credit.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-400 hover:underline"
                >
                  <ExternalLink className="size-3" /> Nguồn Wikimedia Commons
                </a>
              )}
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
