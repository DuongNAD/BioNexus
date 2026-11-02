import React, { useState, useRef, useCallback } from 'react';
import { Maximize2 } from 'lucide-react';

export interface ProductLensMagnifierProps {
  src: string;
  alt: string;
  zoomLevel?: number; // Mặc định 2.5
  lensSize?: number; // Mặc định 160px
  onOpenLightbox?: () => void;
  className?: string;
}

export const LensMagnifier: React.FC<ProductLensMagnifierProps> = ({
  src,
  alt,
  zoomLevel = 2.5,
  lensSize = 160,
  onOpenLightbox,
  className = '',
}) => {
  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0, bgX: 0, bgY: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();

      // Tọa độ tương đối chuột trong container (px)
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (mouseX < 0 || mouseX > rect.width || mouseY < 0 || mouseY > rect.height) {
        setIsActive(false);
        return;
      }

      // Tỷ lệ phần trăm 0% -> 100%
      const bgX = (mouseX / rect.width) * 100;
      const bgY = (mouseY / rect.height) * 100;

      setPosition({
        x: mouseX,
        y: mouseY,
        bgX,
        bgY,
      });
      setIsActive(true);
    },
    []
  );

  const handleMouseLeave = () => {
    setIsActive(false);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`group relative overflow-hidden rounded-2xl border border-line bg-surface-2 select-none ${className}`}
    >
      {/* Ảnh chính hiển thị */}
      <img
        src={src}
        alt={alt}
        className="size-full object-cover transition-opacity duration-300"
        loading="eager"
      />

      {/* Thấu kính quang học 2.5x */}
      {isActive && (
        <div
          className="pointer-events-none absolute rounded-full border-2 border-accent shadow-[0_0_25px_rgba(110,231,183,0.5)] hidden md:block"
          style={{
            width: `${lensSize}px`,
            height: `${lensSize}px`,
            left: `${position.x}px`,
            top: `${position.y}px`,
            transform: 'translate(-50%, -50%)',
            backgroundImage: `url(${src})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: `${position.bgX}% ${position.bgY}%`,
            backgroundSize: `${zoomLevel * 100}%`,
          }}
        />
      )}

      {/* Nút Lightbox phóng to */}
      {onOpenLightbox && (
        <button
          type="button"
          onClick={onOpenLightbox}
          className="absolute top-4 right-4 z-20 flex size-9 items-center justify-center rounded-full border border-line bg-black/60 text-fg backdrop-blur-md transition-all hover:border-accent hover:text-accent hover:scale-105"
          aria-label="Phóng to ảnh toàn màn hình"
        >
          <Maximize2 className="size-4" />
        </button>
      )}

      {/* Nhãn hướng dẫn soi vi mô */}
      <div className="absolute bottom-3 left-3 z-10 hidden md:flex items-center gap-1.5 rounded-full border border-line/60 bg-black/60 px-3 py-1 text-[11px] text-fg-3 backdrop-blur-md">
        <span>Rê chuột để soi kính lúp 2.5x</span>
      </div>
    </div>
  );
};
