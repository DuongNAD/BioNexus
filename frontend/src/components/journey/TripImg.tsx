import React from 'react';

export const F = (name: string): string => `trip/${name}.webp`;

const preloadedTripKeys = new Set<string>();

// Tải trước ảnh nền của mục kế tiếp khi người dùng cuộn qua 60% mục hiện tại
export function preloadTripImage(name?: string): void {
  if (!name || typeof window === 'undefined' || preloadedTripKeys.has(name)) return;
  preloadedTripKeys.add(name);
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = `trip/${name}-1600.webp`;
  } catch {
    // Bỏ qua lỗi tạo ảnh trong môi trường test
  }
}

export interface TripImgProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  name: string;
  sizes?: string;
}

/**
 * Thẻ <picture className="contents"> phục vụ ảnh đa cỡ 960/1600/1920/2560 (AVIF + WebP)
 * từ thư mục public/trip/ mà không làm thay đổi bố cục CSS của <img> bên trong.
 * Cỡ 2560 cho ảnh tràn màn hình trên màn rộng hoặc mật độ điểm ảnh cao (1440px ở 2x cần khoảng 2880px).
 */
export function TripImg({
  name,
  alt = '',
  sizes = '100vw',
  loading = 'lazy',
  decoding = 'async',
  ...imgProps
}: TripImgProps): React.JSX.Element {
  return (
    <picture className="contents">
      <source
        type="image/avif"
        srcSet={`trip/${name}-960.avif 960w, trip/${name}-1600.avif 1600w, trip/${name}-1920.avif 1920w, trip/${name}-2560.avif 2560w`}
        sizes={sizes}
      />
      <source
        type="image/webp"
        srcSet={`trip/${name}-960.webp 960w, trip/${name}-1600.webp 1600w, trip/${name}-1920.webp 1920w, trip/${name}-2560.webp 2560w`}
        sizes={sizes}
      />
      <img
        src={F(name)}
        alt={alt}
        loading={loading}
        decoding={decoding}
        {...imgProps}
      />
    </picture>
  );
}
