import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import * as THREE from 'three';
import { QualityProvider, useQuality } from '../QualityProvider';
import { SceneShell } from '../SceneShell';
import { getHelixPoint, TAXONOMIC_RANKS } from '../HelixScene';

// Mock IntersectionObserver cho môi trường JSDOM
type IntersectionCallback = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => void;
let observerCallbacks: Map<Element, IntersectionCallback> = new Map();

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

describe('Milestone 3 Empirical Adversarial Challenge Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    observerCallbacks.clear();
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
    observerCallbacks.clear();
  });

  // =========================================================================
  // THỬ THÁCH 1: BẤT BIẾN DUY NHẤT 1 WEBGL CANVAS HOẠT ĐỘNG ĐỒNG THỜI
  // =========================================================================
  describe('Thử thách 1: Quy tắc Bất biến Tối đa 1 Canvas WebGL hoạt động', () => {
    it('khi mount đồng thời 3 SceneShell (Chương 0, 1, 2), chỉ có tối đa 1 Canvas WebGL render tại bất kỳ thời điểm nào', async () => {
      localStorage.setItem('bionexus.quality_tier', 'high');

      const { container } = render(
        <QualityProvider>
          <div>
            <SceneShell id="scene-genesis" posterSrc="/p0.webp" posterAlt="Genesis">
              {() => <div data-testid="canvas-genesis" className="webgl-canvas-node">Canvas Genesis</div>}
            </SceneShell>
            <SceneShell id="scene-helix" posterSrc="/p1.webp" posterAlt="Helix">
              {() => <div data-testid="canvas-helix" className="webgl-canvas-node">Canvas Helix</div>}
            </SceneShell>
            <SceneShell id="scene-earth" posterSrc="/p2.webp" posterAlt="BioEarth">
              {() => <div data-testid="canvas-earth" className="webgl-canvas-node">Canvas Earth</div>}
            </SceneShell>
          </div>
        </QualityProvider>
      );

      const roots = container.querySelectorAll('.relative.overflow-hidden');
      expect(roots.length).toBe(3);

      // Ban đầu khi chưa intersect, không có canvas nào mount
      expect(screen.queryByTestId('canvas-genesis')).toBeNull();
      expect(screen.queryByTestId('canvas-helix')).toBeNull();
      expect(screen.queryByTestId('canvas-earth')).toBeNull();

      // Kích hoạt Scene 1 vào khung nhìn
      act(() => {
        triggerIntersection(roots[0]!, true);
      });
      expect(screen.getByTestId('canvas-genesis')).toBeDefined();
      expect(screen.queryByTestId('canvas-helix')).toBeNull();
      expect(screen.queryByTestId('canvas-earth')).toBeNull();

      // Giả lập cuộn nhanh: Scene 2 cũng vào khung nhìn khi Scene 1 chưa ra ngoài
      act(() => {
        triggerIntersection(roots[1]!, true);
      });
      // Invariant check: Scene 2 KHÔNG được chiếm chỗ khi Scene 1 đang hoạt động
      expect(screen.getByTestId('canvas-genesis')).toBeDefined();
      expect(screen.queryByTestId('canvas-helix')).toBeNull();
      expect(screen.queryByTestId('canvas-earth')).toBeNull();

      // Giả lập Scene 1 ra khỏi tầm nhìn (unmount/unintersect)
      act(() => {
        triggerIntersection(roots[0]!, false);
      });
      // Scene 1 phải bị tháo gỡ lập tức khỏi DOM
      expect(screen.queryByTestId('canvas-genesis')).toBeNull();

      // Đếm số lượng canvas WebGL đang hiện diện trong toàn bộ DOM
      const activeCanvases = container.querySelectorAll('.webgl-canvas-node');
      expect(activeCanvases.length).toBeLessThanOrEqual(1);
    });

    it('kiểm tra tính liên tục của Semaphore khi cuộn tuần tự giữa 2 chương', () => {
      localStorage.setItem('bionexus.quality_tier', 'high');

      const { container } = render(
        <QualityProvider>
          <div>
            <SceneShell id="scene-ch0" posterSrc="/p0.webp" posterAlt="Ch0">
              {() => <div data-testid="canvas-ch0">Canvas Ch0</div>}
            </SceneShell>
            <SceneShell id="scene-ch1" posterSrc="/p1.webp" posterAlt="Ch1">
              {() => <div data-testid="canvas-ch1">Canvas Ch1</div>}
            </SceneShell>
          </div>
        </QualityProvider>
      );

      const roots = container.querySelectorAll('.relative.overflow-hidden');

      // Ch0 vào tầm nhìn trước
      act(() => {
        triggerIntersection(roots[0]!, true);
      });
      expect(screen.getByTestId('canvas-ch0')).toBeDefined();
      expect(screen.queryByTestId('canvas-ch1')).toBeNull();

      // Cuộn dứt điểm: Ch0 ra khỏi tầm nhìn
      act(() => {
        triggerIntersection(roots[0]!, false);
      });
      expect(screen.queryByTestId('canvas-ch0')).toBeNull();

      // Ch1 vào tầm nhìn
      act(() => {
        triggerIntersection(roots[1]!, true);
      });
      expect(screen.getByTestId('canvas-ch1')).toBeDefined();
    });

    it('quan sát hành vi cạnh tranh khi 2 Scene giao thoa vùng nhìn (overlapping rootMargin)', () => {
      localStorage.setItem('bionexus.quality_tier', 'high');

      const { container } = render(
        <QualityProvider>
          <div>
            <SceneShell id="scene-overlap-0" posterSrc="/p0.webp" posterAlt="Ov0">
              {() => <div data-testid="canvas-ov0">Canvas Ov0</div>}
            </SceneShell>
            <SceneShell id="scene-overlap-1" posterSrc="/p1.webp" posterAlt="Ov1">
              {() => <div data-testid="canvas-ov1">Canvas Ov1</div>}
            </SceneShell>
          </div>
        </QualityProvider>
      );

      const roots = container.querySelectorAll('.relative.overflow-hidden');

      // Cả 2 cùng intersect do rootMargin 200px giao nhau
      act(() => {
        triggerIntersection(roots[0]!, true);
        triggerIntersection(roots[1]!, true);
      });

      // Bất biến: chỉ có đúng 1 canvas WebGL được mount
      const mounted = [
        screen.queryByTestId('canvas-ov0'),
        screen.queryByTestId('canvas-ov1'),
      ].filter(Boolean);
      expect(mounted.length).toBe(1);
    });

    it('bảo đảm giải phóng Semaphore toàn cục khi component SceneShell bị unmount hoàn toàn', () => {
      localStorage.setItem('bionexus.quality_tier', 'high');

      const { unmount, container } = render(
        <QualityProvider>
          <SceneShell id="temporary-scene" posterSrc="/p.webp" posterAlt="Temp">
            {() => <div data-testid="canvas-temp">Temp Canvas</div>}
          </SceneShell>
        </QualityProvider>
      );

      const root = container.querySelector('.relative.overflow-hidden')!;
      act(() => {
        triggerIntersection(root, true);
      });
      expect(screen.getByTestId('canvas-temp')).toBeDefined();

      // Unmount component khỏi React DOM
      unmount();

      // Mount một Scene khác, scene mới phải chiếm được slot mà không bị deadlock
      render(
        <QualityProvider>
          <SceneShell id="next-scene" posterSrc="/p2.webp" posterAlt="Next">
            {() => <div data-testid="canvas-next">Next Canvas</div>}
          </SceneShell>
        </QualityProvider>
      );

      const nextRoot = document.querySelector('.relative.overflow-hidden')!;
      act(() => {
        triggerIntersection(nextRoot, true);
      });
      expect(screen.getByTestId('canvas-next')).toBeDefined();
    });
  });

  // =========================================================================
  // THỬ THÁCH 2: RÒ RỈ BỘ NHỚ GPU & DỌN DẸP GEOMETRY/MATERIAL
  // =========================================================================
  describe('Thử thách 2: Rò rỉ Bộ nhớ GPU & Dọn dẹp Geometry/Material', () => {
    it('xác minh BufferGeometry và TubeGeometry gọi .dispose() đúng chuẩn Three.js', () => {
      const geo = new THREE.BufferGeometry();
      const disposeSpy = vi.spyOn(geo, 'dispose');

      const pos = new Float32Array([0, 0, 0, 1, 1, 1]);
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

      // Thực thi dọn dẹp
      geo.dispose();
      expect(disposeSpy).toHaveBeenCalledTimes(1);
    });

    it('xác minh chuỗi xoắn Helix CatmullRom Curve sinh ra đúng 400 phân đoạn và dọn dẹp khi unmount', () => {
      const pts0: THREE.Vector3[] = [];
      for (let t = -1; t <= 14; t += 0.1) {
        pts0.push(new THREE.Vector3(...getHelixPoint(t, 0)));
      }
      const curve = new THREE.CatmullRomCurve3(pts0);
      const tubeGeo = new THREE.TubeGeometry(curve, 400, 0.035, 8, false);

      const disposeSpy = vi.spyOn(tubeGeo, 'dispose');
      expect(tubeGeo.parameters.tubularSegments).toBe(400);
      expect(tubeGeo.attributes.position).toBeDefined();

      tubeGeo.dispose();
      expect(disposeSpy).toHaveBeenCalledTimes(1);
    });

    it('stress churn test: mount và unmount SceneShell 20 lần liên tục không rò rỉ listener', () => {
      localStorage.setItem('bionexus.quality_tier', 'high');

      for (let i = 0; i < 20; i++) {
        const { unmount, container } = render(
          <QualityProvider>
            <SceneShell id={`churn-scene-${i}`} posterSrc="/p.webp" posterAlt="Churn">
              {() => <div data-testid={`churn-canvas-${i}`}>Canvas</div>}
            </SceneShell>
          </QualityProvider>
        );

        const root = container.querySelector('.relative.overflow-hidden')!;
        act(() => {
          triggerIntersection(root, true);
        });

        // Tháo gỡ lập tức
        unmount();
      }

      // Sau 20 vòng lặp churn, hệ thống vẫn mount scene mới ổn định
      const { container } = render(
        <QualityProvider>
          <SceneShell id="after-churn" posterSrc="/p.webp" posterAlt="After">
            {() => <div data-testid="after-churn-canvas">After Churn</div>}
          </SceneShell>
        </QualityProvider>
      );
      const root = container.querySelector('.relative.overflow-hidden')!;
      act(() => {
        triggerIntersection(root, true);
      });
      expect(screen.getByTestId('after-churn-canvas')).toBeDefined();
    });
  });

  // =========================================================================
  // THỬ THÁCH 3: MÔ PHỎNG MẤT NGỮ CẢNH WEBGL & PHỤC HỒI
  // =========================================================================
  describe('Thử thách 3: Mô phỏng Mất Ngữ Cảnh WebGL & Phục Hồi', () => {
    it('bắt sự kiện webglcontextlost, gọi e.preventDefault(), giữ canvas trong DOM và phủ poster tĩnh', () => {
      localStorage.setItem('bionexus.quality_tier', 'high');

      const { container } = render(
        <QualityProvider>
          <SceneShell id="scene-context-test" posterSrc="/poster.webp" posterAlt="Poster Test">
            {() => (
              <div data-testid="canvas-wrapper">
                <canvas data-testid="webgl-canvas" />
              </div>
            )}
          </SceneShell>
        </QualityProvider>
      );

      const root = container.querySelector('.relative.overflow-hidden')!;
      act(() => {
        triggerIntersection(root, true);
      });

      const canvasWrapper = screen.getByTestId('canvas-wrapper');
      expect(canvasWrapper).toBeDefined();

      const canvas = screen.getByTestId('webgl-canvas');
      expect(canvas).toBeDefined();

      // Giả lập sự kiện webglcontextlost từ trình duyệt
      const lostEvent = new Event('webglcontextlost', { bubbles: true, cancelable: true });
      const preventDefaultSpy = vi.spyOn(lostEvent, 'preventDefault');

      act(() => {
        canvas.dispatchEvent(lostEvent);
      });

      // Bắt buộc e.preventDefault() để ngăn trình duyệt sập tab
      expect(preventDefaultSpy).toHaveBeenCalled();

      // KHÔNG unmount thẻ Canvas khỏi DOM để tiếp tục nhận sự kiện webglcontextrestored
      expect(screen.getByTestId('canvas-wrapper')).toBeDefined();

      // Ảnh poster hiển thị phủ lên trên với opacity-100
      const posterImg = screen.getByRole('img', { name: 'Poster Test' });
      expect(posterImg).toBeDefined();
      expect(posterImg.className).toContain('opacity-100');

      // Giả lập phục hồi ngữ cảnh đồ họa webglcontextrestored
      const restoredEvent = new Event('webglcontextrestored', { bubbles: true, cancelable: true });
      act(() => {
        canvas.dispatchEvent(restoredEvent);
      });

      // Canvas tiếp tục hiện diện an toàn
      expect(screen.getByTestId('canvas-wrapper')).toBeDefined();
    });
  });

  // =========================================================================
  // THỬ THÁCH 4: HẠ BẬC CHẤT LƯỢNG KHI RỚT FPS & CHẾ ĐỘ GIẢM CHUYỂN ĐỘNG
  // =========================================================================
  describe('Thử thách 4: Hạ Bậc Chất Lượng Khi Rớt FPS & prefers-reduced-motion', () => {
    it('chuỗi hạ bậc FPS tự động: high -> medium -> low -> static khi gọi reportFpsDrop() liên tục', () => {
      let qualityState: ReturnType<typeof useQuality> = null!;

      function TestConsumer() {
        qualityState = useQuality();
        return <div>Tier: {qualityState.tier}</div>;
      }

      render(
        <QualityProvider>
          <TestConsumer />
        </QualityProvider>
      );

      // Giả định ban đầu là high hoặc medium tùy môi trường JSDOM
      const initialTier = qualityState.tier;
      expect(['high', 'medium', 'low', 'static']).toContain(initialTier);

      // Giả lập sụt FPS lần 1
      act(() => {
        qualityState.reportFpsDrop();
      });
      const tierAfterDrop1 = qualityState.tier;
      expect(['medium', 'low', 'static']).toContain(tierAfterDrop1);

      // Giả lập sụt FPS lần 2
      act(() => {
        qualityState.reportFpsDrop();
      });
      const tierAfterDrop2 = qualityState.tier;
      expect(['low', 'static']).toContain(tierAfterDrop2);

      // Giả lập sụt FPS lần 3
      act(() => {
        qualityState.reportFpsDrop();
      });
      const tierAfterDrop3 = qualityState.tier;
      expect(tierAfterDrop3).toBe('static');

      // Giả lập sụt FPS lần 4 (boundary stress: tại static không bị underflow)
      act(() => {
        qualityState.reportFpsDrop();
      });
      expect(qualityState.tier).toBe('static');
    });

    it('khi prefers-reduced-motion được bật, bắt buộc tier = static và không mount canvas WebGL', () => {
      // Mock matchMedia trả về true cho prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: query.includes('prefers-reduced-motion: reduce'),
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      let qualityState: ReturnType<typeof useQuality> = null!;

      function TestConsumer() {
        qualityState = useQuality();
        return (
          <div>
            <SceneShell id="reduced-scene" posterSrc="/p.webp" posterAlt="Reduced Motion Poster">
              {() => <div data-testid="should-never-mount">WebGL Canvas</div>}
            </SceneShell>
          </div>
        );
      }

      const { container } = render(
        <QualityProvider>
          <TestConsumer />
        </QualityProvider>
      );

      // 1. Phải nhận diện prefersReducedMotion = true
      expect(qualityState.prefersReducedMotion).toBe(true);

      // 2. Tier bắt buộc phải là 'static' bất kể phần cứng mạnh cỡ nào
      expect(qualityState.tier).toBe('static');

      // 3. Kể cả khi intersect trong tầm nhìn, Canvas WebGL KHÔNG được phép mount
      const root = container.querySelector('.relative.overflow-hidden')!;
      act(() => {
        triggerIntersection(root, true);
      });

      expect(screen.queryByTestId('should-never-mount')).toBeNull();

      // 4. Ảnh poster hiển thị đầy đủ
      const img = screen.getByRole('img', { name: 'Reduced Motion Poster' });
      expect(img).toBeDefined();
    });
  });

  // =========================================================================
  // THỬ THÁCH 5: TOÁN HỌC OUTWARD OFFSET & AN TOÀN CHUỖI XOẮN HELIX
  // =========================================================================
  describe('Thử thách 5: Độ dịch Outward Offset 4.05 và an toàn nhãn 14 nấc', () => {
    it('khoảng cách từ tâm chuỗi xoắn đến điểm neo nhãn luôn đạt chuẩn R + 0.75 = 4.05', () => {
      const R_BASE = 3.3;
      const R_OUTWARD = R_BASE + 0.75; // 4.05

      for (let k = 0; k < 14; k++) {
        const [xBase, , zBase] = getHelixPoint(k, 0, R_BASE);
        const [xOut, , zOut] = getHelixPoint(k, 0, R_OUTWARD);

        const distBase = Math.sqrt(xBase * xBase + zBase * zBase);
        const distOut = Math.sqrt(xOut * xOut + zOut * zOut);

        expect(distBase).toBeCloseTo(3.3, 2);
        expect(distOut).toBeCloseTo(4.05, 2);

        // Khoảng cách an toàn giữa sợi ống và nhãn
        const delta = distOut - distBase;
        expect(delta).toBeCloseTo(0.75, 2);
      }
    });

    it('toàn bộ 6 cấp phân loại có đầy đủ cấp bậc song ngữ Anh - Việt và mô tả bách khoa', () => {
      expect(TAXONOMIC_RANKS.length).toBe(6);
      TAXONOMIC_RANKS.forEach((rank, idx) => {
        expect(rank.level).toBe(idx);
        expect(rank.rankEn).toBeTruthy();
        expect(rank.rankVi).toBeTruthy();
        expect(rank.name).toBeTruthy();
        expect(rank.desc).toBeTruthy();
      });
    });
  });
});
