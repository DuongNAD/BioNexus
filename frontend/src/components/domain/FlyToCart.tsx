import React, { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';

// Hiệu ứng bay vào giỏ chạy bằng requestAnimationFrame nên CSS prefers-reduced-motion không chặn được
function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

interface FlyItem {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  imgSrc?: string;
}

let flyCounter = 0;
const listeners = new Set<(item: FlyItem) => void>();

export function triggerFlyToCart(e: React.MouseEvent | { clientX: number; clientY: number }, imgSrc?: string) {
  if (prefersReducedMotion()) return;
  // Tìm biểu tượng giỏ hàng trên Header qua data-cart-icon hoặc selector
  const cartIcon = document.querySelector('[data-cart-icon]') || document.querySelector('header a[href*="cart"]');
  const cartRect = cartIcon?.getBoundingClientRect();

  const startX = 'clientX' in e ? e.clientX : window.innerWidth / 2;
  const startY = 'clientY' in e ? e.clientY : window.innerHeight / 2;
  const endX = cartRect ? cartRect.left + cartRect.width / 2 : window.innerWidth - 80;
  const endY = cartRect ? cartRect.top + cartRect.height / 2 : 28;

  const item: FlyItem = {
    id: ++flyCounter,
    startX,
    startY,
    endX,
    endY,
    imgSrc,
  };

  listeners.forEach((listener) => listener(item));
}

export const FlyToCartContainer: React.FC = () => {
  const [items, setItems] = useState<FlyItem[]>([]);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const handler = (item: FlyItem) => {
      setItems((prev) => [...prev, item]);
      setTimeout(() => {
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        // Kích hoạt animation rung tại cart icon
        const cartIcon = document.querySelector('[data-cart-icon]');
        if (cartIcon) {
          cartIcon.classList.add('animate-bounce');
          setTimeout(() => cartIcon.classList.remove('animate-bounce'), 600);
        }
      }, 750);
    };

    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  if (items.length === 0 || reduceMotion) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {items.map((item) => (
        <FlyParticle key={item.id} item={item} />
      ))}
    </div>
  );
};

const FlyParticle: React.FC<{ item: FlyItem }> = ({ item }) => {
  const [coords, setCoords] = useState({ x: item.startX, y: item.startY, scale: 1, opacity: 1 });

  useEffect(() => {
    const startTime = performance.now();
    const duration = 700;

    let rafId: number;

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Bezier curve: bay bổng lên trước rồi đáp xuống giỏ
      const easeProgress = Math.pow(progress, 2);
      const curX = item.startX + (item.endX - item.startX) * progress;
      const arcHeight = -120 * Math.sin(progress * Math.PI);
      const curY = item.startY + (item.endY - item.startY) * easeProgress + arcHeight;

      setCoords({
        x: curX,
        y: curY,
        scale: Math.max(0.2, 1 - progress * 0.8),
        opacity: Math.max(0, 1 - progress * 0.3),
      });

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [item]);

  return (
    <div
      className="absolute size-10 rounded-full border border-accent bg-accent/20 backdrop-blur-md shadow-[0_0_20px_rgba(110,231,183,0.6)] flex items-center justify-center -translate-x-1/2 -translate-y-1/2 will-change-transform overflow-hidden"
      style={{
        left: coords.x,
        top: coords.y,
        transform: `translate(-50%, -50%) scale(${coords.scale})`,
        opacity: coords.opacity,
      }}
    >
      {item.imgSrc ? (
        <img src={item.imgSrc} alt="" className="size-full object-cover rounded-full" />
      ) : (
        <div className="size-3 rounded-full bg-accent animate-ping" />
      )}
    </div>
  );
};
