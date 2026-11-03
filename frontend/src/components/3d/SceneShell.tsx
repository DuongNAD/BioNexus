import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useQuality } from './QualityProvider';
import type { QualityTier, SceneShellProps } from './types';

// Bộ điều phối toàn cục: Đảm bảo tối đa 1 Canvas WebGL nặng chạy tại một thời điểm
let globalActiveCanvasId: string | null = null;
const canvasListeners = new Set<(activeId: string | null) => void>();

function setActiveCanvas(id: string | null) {
  if (globalActiveCanvasId !== id) {
    globalActiveCanvasId = id;
    const listeners = Array.from(canvasListeners);
    listeners.forEach((fn) => fn(globalActiveCanvasId));
  }
}

// Hàm hỗ trợ kiểm thử và reset Semaphore
export function _resetGlobalActiveCanvas(): void {
  setActiveCanvas(null);
}

export const _resetActiveCanvasForTesting = _resetGlobalActiveCanvas;

export function getGlobalActiveCanvasId(): string | null {
  return globalActiveCanvasId;
}

const TIER_ORDER: Record<QualityTier, number> = {
  static: 0,
  low: 1,
  medium: 2,
  high: 3,
};

export function SceneShell({
  id,
  posterSrc,
  posterAlt,
  minTier = 'low',
  className = '',
  children,
  srDescription,
}: SceneShellProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const { tier } = useQuality();

  const [isNearView, setIsNearView] = useState(false);
  const [isGlobalActive, setIsGlobalActive] = useState(false);
  const [firstFrameRendered, setFirstFrameRendered] = useState(false);
  const [contextLost, setContextLost] = useState(false);

  const satisfiesMinTier = TIER_ORDER[tier] >= TIER_ORDER[minTier];
  const isEligible = tier !== 'static' && satisfiesMinTier;

  // 1. Quản lý trạng thái Active Canvas toàn cục & Tự động tranh slot khi slot trống
  useEffect(() => {
    const listener = (activeId: string | null) => {
      if (activeId === id) {
        setIsGlobalActive(true);
      } else if (!activeId && !globalActiveCanvasId && isNearView && isEligible) {
        // Slot trống và component này đang trong tầm nhìn & đủ điều kiện -> lập tức chiếm slot
        setActiveCanvas(id);
      } else {
        setIsGlobalActive(false);
      }
    };

    canvasListeners.add(listener);

    // Kiểm tra ngay khi mount hoặc khi isNearView / isEligible thay đổi
    if (globalActiveCanvasId === id) {
      setIsGlobalActive(true);
    } else if (!globalActiveCanvasId && isNearView && isEligible) {
      setActiveCanvas(id);
    } else {
      setIsGlobalActive(false);
    }

    return () => {
      canvasListeners.delete(listener);
      if (globalActiveCanvasId === id) {
        setActiveCanvas(null);
      }
    };
  }, [id, isNearView, isEligible]);

  // 2. IntersectionObserver: Theo dõi tầm nhìn với rootMargin 200px
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        if (entry.isIntersecting) {
          setIsNearView(true);
          // Chiếm slot canvas nếu slot đang trống hoặc đã thuộc về mình
          if (isEligible && (!globalActiveCanvasId || globalActiveCanvasId === id)) {
            setActiveCanvas(id);
          }
        } else {
          setIsNearView(false);
          setFirstFrameRendered(false);
          if (globalActiveCanvasId === id) {
            setActiveCanvas(null);
          }
        }
      },
      {
        rootMargin: '200px 0px 200px 0px',
        threshold: 0.05,
      }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (globalActiveCanvasId === id) {
        setActiveCanvas(null);
      }
    };
  }, [id, isEligible]);

  // Điều kiện để mount Canvas WebGL (KHÔNG unmount khi contextLost để giữ thẻ canvas phục hồi)
  const shouldMountCanvas = isEligible && isNearView && isGlobalActive;

  // 3. Quản lý trạng thái khung hình đầu tiên (2 lớp bảo vệ)
  const handleFirstFrame = useCallback(() => {
    setFirstFrameRendered(true);
  }, []);

  useEffect(() => {
    if (!shouldMountCanvas) {
      setFirstFrameRendered(false);
      // Canvas đã gỡ thì lần mount sau là context mới: không để poster che mãi vì lần mất context cũ
      setContextLost(false);
      return;
    }

    // Lớp 1: Timer an toàn tự động ẩn poster sau 300ms nếu component con không gọi onFirstFrame
    const timer = setTimeout(() => {
      setFirstFrameRendered(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [shouldMountCanvas]);

  // 4. Lắng nghe mất và phục hồi context đồ họa WebGL
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !shouldMountCanvas) return;

    const handleLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
      setFirstFrameRendered(false);
    };

    const handleRestored = () => {
      setContextLost(false);
    };

    let attachedCanvas: HTMLCanvasElement | null = null;

    const attachListeners = (canvas: HTMLCanvasElement) => {
      if (attachedCanvas === canvas) return;
      if (attachedCanvas) {
        attachedCanvas.removeEventListener('webglcontextlost', handleLost);
        attachedCanvas.removeEventListener('webglcontextrestored', handleRestored);
      }
      attachedCanvas = canvas;
      attachedCanvas.addEventListener('webglcontextlost', handleLost);
      attachedCanvas.addEventListener('webglcontextrestored', handleRestored);
    };

    // Gắn ngay nếu thẻ canvas đã có sẵn trong DOM
    const existing = el.querySelector('canvas');
    if (existing) {
      attachListeners(existing);
    }

    // MutationObserver dự phòng: bắt sự kiện khi R3F chèn thẻ canvas vào DOM
    const observer = new MutationObserver(() => {
      const c = el.querySelector('canvas');
      if (c) {
        attachListeners(c);
      }
    });

    observer.observe(el, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      if (attachedCanvas) {
        attachedCanvas.removeEventListener('webglcontextlost', handleLost);
        attachedCanvas.removeEventListener('webglcontextrestored', handleRestored);
        attachedCanvas = null;
      }
    };
  }, [shouldMountCanvas]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {/* 1. Lớp Poster WebP/AVIF hiển thị trước (Poster-First), phủ lên khi mất context */}
      <img
        src={posterSrc}
        alt={posterAlt}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-out z-10 ${
          firstFrameRendered && shouldMountCanvas && !contextLost
            ? 'opacity-0 pointer-events-none'
            : 'opacity-100'
        }`}
        loading="lazy"
        decoding="async"
      />

      {/* 2. Lớp Canvas WebGL (Mount khi đủ điều kiện, giữ nguyên khi contextLost) */}
      {shouldMountCanvas && (
        <div className="absolute inset-0 z-0" aria-hidden="true">
          {children(tier, handleFirstFrame)}
        </div>
      )}

      {/* 3. Lớp hỗ trợ thiết bị trợ thính / khiếm thị (WCAG 2.2 AA) */}
      <div className="sr-only">
        {srDescription || posterAlt || 'Nội dung minh họa đồ họa 3D tương tác.'}
      </div>
    </div>
  );
}
