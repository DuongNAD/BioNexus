import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { QualityProvider } from '../QualityProvider';
import { SceneShell, _resetGlobalActiveCanvas, getGlobalActiveCanvasId } from '../SceneShell';

type IntersectionCallback = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => void;
const observerCallbacks: Map<Element, IntersectionCallback> = new Map();

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '200px 0px 200px 0px';
  readonly thresholds: ReadonlyArray<number> = [0.05];

  constructor(private callback: IntersectionCallback) {}

  observe(element: Element) {
    observerCallbacks.set(element, this.callback);
  }

  unobserve(element: Element) {
    observerCallbacks.delete(element);
  }

  disconnect() {
    observerCallbacks.clear();
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

function triggerIntersection(element: Element, isIntersecting: boolean) {
  const cb = observerCallbacks.get(element);
  if (cb) {
    cb(
      [
        {
          isIntersecting,
          target: element,
          intersectionRatio: isIntersecting ? 1.0 : 0,
          boundingClientRect: element.getBoundingClientRect(),
          intersectionRect: element.getBoundingClientRect(),
          rootBounds: null,
          time: Date.now(),
        } as IntersectionObserverEntry,
      ],
      new MockIntersectionObserver(cb)
    );
  }
}

describe('SceneShell Unit & Lifecycle Integration Test Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    vi.useFakeTimers();
    observerCallbacks.clear();
    _resetGlobalActiveCanvas();
    globalThis.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    observerCallbacks.clear();
    _resetGlobalActiveCanvas();
  });

  // 1. Poster-First ban đầu
  it('1. hiển thị ảnh poster ban đầu theo quy tắc Poster-First (opacity-100)', () => {
    render(
      <QualityProvider>
        <SceneShell
          id="test-shell"
          posterSrc="/posters/test.webp"
          posterAlt="Ảnh thử nghiệm"
          srDescription="Mô tả cho thiết bị đọc màn hình"
        >
          {() => <div data-testid="canvas-content">Canvas Content</div>}
        </SceneShell>
      </QualityProvider>
    );

    const img = screen.getByRole('img', { name: 'Ảnh thử nghiệm' });
    expect(img).toBeDefined();
    expect(img.getAttribute('src')).toBe('/posters/test.webp');
    expect(img.className).toContain('opacity-100');
  });

  // 2. Chuẩn WCAG 2.2 AA (.sr-only)
  it('2. chứa phần tử mô tả ngữ nghĩa ẩn .sr-only theo chuẩn WCAG 2.2 AA', () => {
    render(
      <QualityProvider>
        <SceneShell
          id="test-shell-a11y"
          posterSrc="/posters/test.webp"
          posterAlt="Ảnh thử nghiệm"
          srDescription="Cảnh 3D mô phỏng địa cầu bảo tồn."
        >
          {() => <div>Canvas Content</div>}
        </SceneShell>
      </QualityProvider>
    );

    const srText = screen.getByText('Cảnh 3D mô phỏng địa cầu bảo tồn.');
    expect(srText).toBeDefined();
    expect(srText.className).toContain('sr-only');
  });

  // 3. Static tier không mount canvas
  it('3. không mount Canvas khi tier là static', () => {
    localStorage.setItem('bionexus.quality_tier', 'static');

    const { container } = render(
      <QualityProvider>
        <SceneShell
          id="test-shell-static"
          posterSrc="/posters/test.webp"
          posterAlt="Ảnh thử nghiệm"
        >
          {() => <div data-testid="should-not-mount">Canvas 3D</div>}
        </SceneShell>
      </QualityProvider>
    );

    const root = container.querySelector('.relative.overflow-hidden')!;
    act(() => {
      triggerIntersection(root, true);
    });

    expect(screen.queryByTestId('should-not-mount')).toBeNull();
  });

  // 4. Lớp 2: Explicit onFirstFrame callback làm mờ poster
  it('4. làm mờ poster lập tức khi component con kích hoạt onFirstFrame()', () => {
    localStorage.setItem('bionexus.quality_tier', 'high');

    let triggerFirstFrame: () => void = () => {};

    const { container } = render(
      <QualityProvider>
        <SceneShell
          id="test-shell-hook"
          posterSrc="/posters/test.webp"
          posterAlt="Ảnh thử nghiệm"
        >
          {(_tier, onFirstFrame) => {
            triggerFirstFrame = onFirstFrame;
            return <div data-testid="canvas-hook">Canvas 3D</div>;
          }}
        </SceneShell>
      </QualityProvider>
    );

    const root = container.querySelector('.relative.overflow-hidden')!;
    act(() => {
      triggerIntersection(root, true);
    });

    const img = screen.getByRole('img', { name: 'Ảnh thử nghiệm' });
    expect(img.className).toContain('opacity-100');

    // Kích hoạt onFirstFrame từ R3F Canvas
    act(() => {
      triggerFirstFrame();
    });

    expect(img.className).toContain('opacity-0 pointer-events-none');
  });

  // 5. Lớp 1: Fallback timer 300ms tự động làm mờ poster
  it('5. tự động làm mờ poster qua fallback timer 300ms nếu component con không gọi onFirstFrame()', () => {
    localStorage.setItem('bionexus.quality_tier', 'high');

    const { container } = render(
      <QualityProvider>
        <SceneShell
          id="test-shell-timer"
          posterSrc="/posters/test.webp"
          posterAlt="Ảnh thử nghiệm"
        >
          {() => <div data-testid="canvas-timer">Canvas 3D</div>}
        </SceneShell>
      </QualityProvider>
    );

    const root = container.querySelector('.relative.overflow-hidden')!;
    act(() => {
      triggerIntersection(root, true);
    });

    const img = screen.getByRole('img', { name: 'Ảnh thử nghiệm' });
    expect(img.className).toContain('opacity-100');

    // Chạy qua 300ms fallback
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(img.className).toContain('opacity-0 pointer-events-none');
  });

  // 6. Điều phối Semaphore: Tối đa 1 Active Canvas
  it('6. bộ điều phối Semaphore toàn cục bảo đảm tối đa 1 SceneShell active', () => {
    localStorage.setItem('bionexus.quality_tier', 'high');

    const { container } = render(
      <QualityProvider>
        <div>
          <SceneShell id="shell-1" posterSrc="/p1.webp" posterAlt="P1">
            {() => <div data-testid="canvas-1">Canvas 1</div>}
          </SceneShell>
          <SceneShell id="shell-2" posterSrc="/p2.webp" posterAlt="P2">
            {() => <div data-testid="canvas-2">Canvas 2</div>}
          </SceneShell>
        </div>
      </QualityProvider>
    );

    const roots = container.querySelectorAll('.relative.overflow-hidden');

    act(() => {
      triggerIntersection(roots[0]!, true);
    });
    expect(screen.getByTestId('canvas-1')).toBeDefined();
    expect(screen.queryByTestId('canvas-2')).toBeNull();
    expect(getGlobalActiveCanvasId()).toBe('shell-1');

    // Shell 2 tiệm cận viewport trong khi Shell 1 đang active
    act(() => {
      triggerIntersection(roots[1]!, true);
    });
    // Invariant: Shell 2 KHÔNG được cướp slot của Shell 1
    expect(screen.getByTestId('canvas-1')).toBeDefined();
    expect(screen.queryByTestId('canvas-2')).toBeNull();
    expect(getGlobalActiveCanvasId()).toBe('shell-1');
  });

  // 7. Khắc phục bế tắc Semaphore khi cuộn trang
  it('7. khắc phục bế tắc Semaphore: SceneShell kế tiếp tự động chiếm slot khi SceneShell trước ra ngoài viewport mà không cần cuộn lại', () => {
    localStorage.setItem('bionexus.quality_tier', 'high');

    const { container } = render(
      <QualityProvider>
        <div>
          <SceneShell id="shell-a" posterSrc="/pa.webp" posterAlt="PA">
            {() => <div data-testid="canvas-a">Canvas A</div>}
          </SceneShell>
          <SceneShell id="shell-b" posterSrc="/pb.webp" posterAlt="PB">
            {() => <div data-testid="canvas-b">Canvas B</div>}
          </SceneShell>
        </div>
      </QualityProvider>
    );

    const roots = container.querySelectorAll('.relative.overflow-hidden');

    // 1. Shell A vào tầm nhìn
    act(() => {
      triggerIntersection(roots[0]!, true);
    });
    expect(screen.getByTestId('canvas-a')).toBeDefined();
    expect(screen.queryByTestId('canvas-b')).toBeNull();

    // 2. Cuộn xuống: Shell B vào tầm nhìn (rootMargin 200px) trong khi Shell A chưa ra ngoài
    act(() => {
      triggerIntersection(roots[1]!, true);
    });
    expect(screen.queryByTestId('canvas-b')).toBeNull();

    // 3. Cuộn tiếp: Shell A ra khỏi tầm nhìn hoàn toàn
    act(() => {
      triggerIntersection(roots[0]!, false);
    });

    // Shell A bị unmount
    expect(screen.queryByTestId('canvas-a')).toBeNull();

    // REMEDIATION TEST: Shell B tự động chiếm slot và mount canvas ngay lập tức!
    expect(screen.getByTestId('canvas-b')).toBeDefined();
    expect(getGlobalActiveCanvasId()).toBe('shell-b');
  });

  // 8. Giữ Canvas trong DOM khi mất ngữ cảnh webglcontextlost
  it('8. giữ nguyên thẻ Canvas trong DOM và phủ poster khi webglcontextlost xảy ra', () => {
    localStorage.setItem('bionexus.quality_tier', 'high');

    const { container } = render(
      <QualityProvider>
        <SceneShell id="shell-ctx" posterSrc="/pctx.webp" posterAlt="PCtx">
          {() => (
            <div data-testid="canvas-holder">
              <canvas data-testid="test-canvas" />
            </div>
          )}
        </SceneShell>
      </QualityProvider>
    );

    const root = container.querySelector('.relative.overflow-hidden')!;
    act(() => {
      triggerIntersection(root, true);
    });

    const canvas = screen.getByTestId('test-canvas');
    expect(canvas).toBeDefined();

    // Giả lập webglcontextlost
    const lostEvent = new Event('webglcontextlost', { cancelable: true });
    const preventDefaultSpy = vi.spyOn(lostEvent, 'preventDefault');

    act(() => {
      canvas.dispatchEvent(lostEvent);
    });

    expect(preventDefaultSpy).toHaveBeenCalled();
    // Canvas VẪN TỒN TẠI trong DOM
    expect(screen.getByTestId('canvas-holder')).toBeDefined();

    // Poster phủ lên với opacity-100
    const img = screen.getByRole('img', { name: 'PCtx' });
    expect(img.className).toContain('opacity-100');
  });

  // 9. Phục hồi ngữ cảnh khi nhận webglcontextrestored
  it('9. phục hồi ngữ cảnh đồ họa khi nhận webglcontextrestored và làm mờ lại poster', () => {
    localStorage.setItem('bionexus.quality_tier', 'high');

    let notifyFrame: () => void = () => {};

    const { container } = render(
      <QualityProvider>
        <SceneShell id="shell-restore" posterSrc="/prestore.webp" posterAlt="PRestore">
          {(_tier, onFirstFrame) => {
            notifyFrame = onFirstFrame;
            return (
              <div data-testid="canvas-holder-res">
                <canvas data-testid="restore-canvas" />
              </div>
            );
          }}
        </SceneShell>
      </QualityProvider>
    );

    const root = container.querySelector('.relative.overflow-hidden')!;
    act(() => {
      triggerIntersection(root, true);
    });

    act(() => {
      notifyFrame();
    });

    const img = screen.getByRole('img', { name: 'PRestore' });
    expect(img.className).toContain('opacity-0 pointer-events-none');

    const canvas = screen.getByTestId('restore-canvas');

    // 1. Mất context
    act(() => {
      canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }));
    });
    expect(img.className).toContain('opacity-100');

    // 2. Phục hồi context
    act(() => {
      canvas.dispatchEvent(new Event('webglcontextrestored'));
    });

    // 3. Khung hình mới được render
    act(() => {
      notifyFrame();
    });

    expect(img.className).toContain('opacity-0 pointer-events-none');
  });

  // 10. Giải phóng Semaphore khi unmount hoàn toàn
  it('10. giải phóng Semaphore khi SceneShell bị unmount hoàn toàn khỏi DOM', () => {
    localStorage.setItem('bionexus.quality_tier', 'high');

    const { unmount, container } = render(
      <QualityProvider>
        <SceneShell id="shell-unmount" posterSrc="/pu.webp" posterAlt="PU">
          {() => <div data-testid="canvas-u">Canvas U</div>}
        </SceneShell>
      </QualityProvider>
    );

    const root = container.querySelector('.relative.overflow-hidden')!;
    act(() => {
      triggerIntersection(root, true);
    });

    expect(getGlobalActiveCanvasId()).toBe('shell-unmount');

    unmount();

    expect(getGlobalActiveCanvasId()).toBeNull();
  });
});
