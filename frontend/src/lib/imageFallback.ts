/**
 * Ảnh catalog (photos/c/...) được suy ra từ tên loài nên có thể chưa tồn tại: loài admin vừa thêm,
 * hoặc ảnh tải về bị lỗi. Bắt lỗi tải ảnh ở pha capture cho mọi <img> thay vì thêm onError vào từng component.
 */
export function installCatalogImageFallback(placeholder: string): void {
  window.addEventListener(
    'error',
    (event) => {
      const img = event.target;
      if (!(img instanceof HTMLImageElement) || img.dataset.fallback === '1') return;
      if (!img.src.includes('/photos/c/')) return;
      img.dataset.fallback = '1';
      img.removeAttribute('srcset');
      img.src = placeholder;
    },
    true
  );
}
