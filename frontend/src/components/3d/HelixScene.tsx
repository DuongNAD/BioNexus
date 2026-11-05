import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Image as DreiImage, Sparkles } from '@react-three/drei';
import { easing } from 'maath';
import { useQuality } from './QualityProvider';
import { Starfield } from './Starfield';

/** Một ảnh loài gắn lên chuỗi xoắn */
export interface HelixPhoto {
  /** Khoá ổn định, thường là tên khoa học */
  key: string;
  /** Ảnh thật cỡ 960 (tài liệu 05 mục 6) */
  src: string;
}

export interface HelixSceneProps {
  progress: React.RefObject<number> | { current: number };
  onActiveTaxon?: (index: number) => void;
  /** Lệch trục xoắn sang phải khi khung nằm ngang (chừa chỗ cho chữ hoặc thẻ bên trái). Khung dọc luôn căn giữa */
  offsetX?: number;
  /** Khoảng cách camera tối thiểu; khung hẹp thì camera tự lùi thêm để cả hai sợi vừa bề ngang */
  minDistance?: number;
  /** Nhân khoảng lùi tự tính: dưới 1 cho phép ảnh tràn mép khung khi cảnh phủ cả màn hình */
  fitScale?: number;
  /** Ảnh loài xếp lên hai sợi (mẫu P). Bỏ trống thì chỉ vẽ sợi và mấu */
  photos?: HelixPhoto[];
  /** Báo chỉ số ảnh (trong `photos`) đang nằm trước camera; chỉ gọi khi đổi */
  onActivePhoto?: (photoIndex: number) => void;
  /** Bấm vào một ảnh */
  onSelectPhoto?: (photoIndex: number) => void;
  /** Vẽ dần hai sợi từ trên xuống lúc cảnh vừa hiện */
  revealOnMount?: boolean;
}

// Dữ liệu cấp phân loại nằm ở taxonomyRanks.ts (không phụ thuộc three.js)
export { TAXONOMIC_RANKS } from './taxonomyRanks';

/** Số bậc thang trên chuỗi xoắn */
export const HELIX_LEVELS = 14;
const LEVELS = HELIX_LEVELS;
const R = 3.3;
const DY = 1.05;
const STEP = 0.62;
// Ảnh nằm lệch ra ngoài sợi để sợi sáng chạy phía sau ảnh
const PHOTO_R = R + 0.75;
const PHOTO_W = 1.9;
const PHOTO_H = 1.27;
const PHOTO_ACTIVE_SCALE = 1.24;
const FRAME_PAD = 0.05;

// Sợi chạy từ t = -4 tới LEVELS + 3 để khung nhìn không trống nửa trên lúc mới vào khối
const STRAND_FROM = -4;
const STRAND_TO = LEVELS + 3;
const STRAND_SEGMENTS = 560;
const STRAND_RADIAL = 8;
const HALO_SEGMENTS = 280;
const HALO_RADIAL = 6;
const REVEAL_SECONDS = 2.2;
// Hạt sáng chạy dọc mỗi sợi: một vòng hết chiều dài sợi mất khoảng 28 giây
const PULSE_SPEED = 0.035;
const PULSES_PER_STRAND = { high: 40, medium: 26, low: 0, static: 0 } as const;

// Tính toạ độ trên chuỗi xoắn kép
export const getHelixPoint = (k: number, strand: number, r = R): [number, number, number] => {
  const angle = k * STEP + (strand ? Math.PI : 0);
  return [Math.cos(angle) * r, -k * DY, Math.sin(angle) * r];
};

/** Tỉ lệ sợi đã vẽ khi tới bậc k: ảnh và mấu của bậc đó chỉ hiện sau khi sợi chạm tới */
const revealPointOf = (k: number): number => (k - STRAND_FROM) / (STRAND_TO - STRAND_FROM);

interface PhotoSlot {
  k: number;
  strand: 0 | 1;
  photoIndex: number;
}

/** Xếp ảnh lên bậc: sợi 0 đi lần lượt, sợi 1 lệch nửa danh sách để hai ảnh cùng bậc là hai loài khác nhau */
export function buildPhotoSlots(photoCount: number, maxCards: number): PhotoSlot[] {
  if (photoCount <= 0 || maxCards <= 0) return [];
  const half = Math.max(1, Math.ceil(photoCount / 2));
  const bothStrands = maxCards >= LEVELS * 2;
  const slots: PhotoSlot[] = [];
  for (let k = 0; k < LEVELS; k++) {
    slots.push({ k, strand: 0, photoIndex: k % photoCount });
    if (bothStrands && photoCount > 1) slots.push({ k, strand: 1, photoIndex: (k + half) % photoCount });
  }
  return slots;
}

/** Chấm tròn mềm vẽ bằng canvas 2D: pointsMaterial mặc định là ô vuông */
function createDotTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grd = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(0.35, 'rgba(255,255,255,0.55)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 64, 64);
  }
  return new THREE.CanvasTexture(canvas);
}

/** Khung bo góc sau ảnh: chỉ một hình dùng chung cho mọi ảnh */
function createFrameGeometry(): THREE.ShapeGeometry {
  const w = PHOTO_W + FRAME_PAD * 2;
  const h = PHOTO_H + FRAME_PAD * 2;
  const r = 0.12;
  const shape = new THREE.Shape();
  shape.moveTo(-w / 2 + r, -h / 2);
  shape.lineTo(w / 2 - r, -h / 2);
  shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  shape.lineTo(w / 2, h / 2 - r);
  shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  shape.lineTo(-w / 2 + r, h / 2);
  shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  shape.lineTo(-w / 2, -h / 2 + r);
  shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  return new THREE.ShapeGeometry(shape, 6);
}

/** Nền sao đi theo camera: camera trượt xuống gần 14 đơn vị nên nền sao đứng yên sẽ hụt ở cuối chuỗi */
function CameraAnchoredStars(): React.JSX.Element {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) ref.current.position.y = state.camera.position.y;
  });
  return (
    <group ref={ref}>
      <Starfield />
    </group>
  );
}

type ImageMaterialLike = THREE.ShaderMaterial & { grayscale: number; zoom: number };

interface PhotoCardProps {
  slot: PhotoSlot;
  slotIndex: number;
  src: string;
  frameGeometry: THREE.ShapeGeometry;
  frameColor: THREE.Color;
  activeSlotRef: React.RefObject<number>;
  revealRef: React.RefObject<number>;
  onSelect?: (photoIndex: number) => void;
}

function PhotoCard({
  slot,
  slotIndex,
  src,
  frameGeometry,
  frameColor,
  activeSlotRef,
  revealRef,
  onSelect,
}: PhotoCardProps): React.JSX.Element {
  const groupRef = useRef<THREE.Group>(null!);
  const imageRef = useRef<THREE.Mesh>(null!);
  const frameMatRef = useRef<THREE.MeshBasicMaterial>(null!);
  const [hovered, setHovered] = useState(false);
  const position = useMemo(() => getHelixPoint(slot.k, slot.strand, PHOTO_R), [slot.k, slot.strand]);
  const angle = slot.k * STEP + (slot.strand ? Math.PI : 0);
  const revealAt = revealPointOf(slot.k);

  useEffect(() => {
    if (!hovered) return;
    document.body.style.cursor = 'pointer';
    return () => {
      document.body.style.cursor = '';
    };
  }, [hovered]);

  useFrame((_, dt) => {
    const group = groupRef.current;
    const mesh = imageRef.current;
    if (!group || !mesh) return;
    const material = mesh.material as ImageMaterialLike;
    const shown = (revealRef.current ?? 1) >= revealAt;
    const active = activeSlotRef.current === slotIndex;
    const on = active || hovered;
    const s = !shown ? 0.001 : on ? PHOTO_ACTIVE_SCALE : 1;
    easing.damp3(group.scale, [s, s, 1], 0.22, dt);
    // Ảnh đang ở trước camera hiện màu, các ảnh khác thang xám (tài liệu 05 mục 4)
    easing.damp(material, 'grayscale', on ? 0 : 0.6, 0.25, dt);
    easing.damp(material, 'zoom', hovered ? 1.15 : 1, 0.25, dt);
    if (frameMatRef.current) easing.damp(frameMatRef.current, 'opacity', active ? 0.95 : 0, 0.25, dt);
  });

  return (
    <group ref={groupRef} position={position} rotation={[0, Math.PI / 2 - angle, 0]} scale={[0.001, 0.001, 1]}>
      {/* Viền sáng của ảnh đang xem; chỉ mặt trước nên nhìn từ trong lòng chuỗi không thấy */}
      <mesh geometry={frameGeometry} position={[0, 0, -0.015]}>
        <meshBasicMaterial ref={frameMatRef} color={frameColor} transparent opacity={0} toneMapped={false} depthWrite={false} />
      </mesh>
      <DreiImage
        ref={imageRef}
        url={src}
        scale={[PHOTO_W, PHOTO_H]}
        radius={0.08}
        side={THREE.DoubleSide}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onSelect?.(slot.photoIndex);
        }}
      />
    </group>
  );
}

export const HelixScene: React.FC<HelixSceneProps> = ({
  progress,
  onActiveTaxon,
  offsetX = 0,
  minDistance = 14,
  fitScale = 1,
  photos,
  onActivePhoto,
  onSelectPhoto,
  revealOnMount = false,
}) => {
  const { tier, config, prefersReducedMotion } = useQuality();
  const groupRef = useRef<THREE.Group>(null!);
  const pulsesRef = useRef<THREE.Points>(null);
  const activeIdxRef = useRef<number>(-1);
  const activeSlotRef = useRef<number>(-1);
  const rungRefs = useRef<Array<THREE.Group | null>>([]);
  const shouldReveal = revealOnMount && !prefersReducedMotion;
  const revealRef = useRef<number>(shouldReveal ? 0 : 1);
  const revealStartRef = useRef<number | null>(null);

  const slots = useMemo(() => buildPhotoSlots(photos?.length ?? 0, config.helixCards), [photos?.length, config.helixCards]);
  const pulsesPerStrand = PULSES_PER_STRAND[tier];

  // Có bloom thì đẩy màu sợi quá 1 để chỉ sợi được làm loé; ảnh đã tone map nên không bị loá
  const glow = config.bloom ? 2 : 1.25;
  const colors = useMemo(
    () => ({
      strand0: new THREE.Color('#6ee7b7').multiplyScalar(glow),
      strand1: new THREE.Color('#5eead4').multiplyScalar(glow),
      halo0: new THREE.Color('#6ee7b7'),
      halo1: new THREE.Color('#5eead4'),
      node: new THREE.Color('#d1fae5').multiplyScalar(glow),
      pulse: new THREE.Color('#ecfdf5').multiplyScalar(glow),
      frame: new THREE.Color('#6ee7b7').multiplyScalar(glow),
    }),
    [glow]
  );

  // 1. Hình học: sợi đôi, quầng sáng quanh sợi (giả bloom ở mức không có hậu kỳ), khung ảnh, chấm sáng
  const geometries = useMemo(() => {
    const pts0: THREE.Vector3[] = [];
    const pts1: THREE.Vector3[] = [];
    for (let t = STRAND_FROM; t <= STRAND_TO; t += 0.1) {
      pts0.push(new THREE.Vector3(...getHelixPoint(t, 0)));
      pts1.push(new THREE.Vector3(...getHelixPoint(t, 1)));
    }
    const curve0 = new THREE.CatmullRomCurve3(pts0);
    const curve1 = new THREE.CatmullRomCurve3(pts1);
    return {
      strand0: new THREE.TubeGeometry(curve0, STRAND_SEGMENTS, 0.035, STRAND_RADIAL, false),
      strand1: new THREE.TubeGeometry(curve1, STRAND_SEGMENTS, 0.035, STRAND_RADIAL, false),
      halo0: new THREE.TubeGeometry(curve0, HALO_SEGMENTS, 0.14, HALO_RADIAL, false),
      halo1: new THREE.TubeGeometry(curve1, HALO_SEGMENTS, 0.14, HALO_RADIAL, false),
      frame: createFrameGeometry(),
      dot: createDotTexture(),
    };
  }, []);

  useEffect(() => {
    return () => {
      Object.values(geometries).forEach((g) => g.dispose());
    };
  }, [geometries]);

  const pulseGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pulsesPerStrand * 2 * 3), 3));
    return geo;
  }, [pulsesPerStrand]);

  useEffect(() => () => pulseGeometry.dispose(), [pulseGeometry]);

  // Thanh bậc thang dựng một lần: tạo Float32Array trong JSX sẽ dựng lại attribute ở mỗi lần render
  const rungGeometries = useMemo(
    () =>
      Array.from({ length: LEVELS }, (_, k) => {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute(
          'position',
          new THREE.BufferAttribute(new Float32Array([...getHelixPoint(k, 0), ...getHelixPoint(k, 1)]), 3)
        );
        return geo;
      }),
    []
  );

  useEffect(() => {
    return () => rungGeometries.forEach((g) => g.dispose());
  }, [rungGeometries]);

  // 2. Vũ đạo cuộn, vẽ dần sợi và nhận diện bậc hoặc ảnh đang ở trước camera
  useFrame((state, dt) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;

    if (revealRef.current < 1) {
      if (revealStartRef.current === null) revealStartRef.current = time;
      const f = Math.min(1, (time - revealStartRef.current) / REVEAL_SECONDS);
      // Chậm dần ở cuối để sợi "đậu" vào chỗ thay vì dừng gắt
      revealRef.current = 1 - Math.pow(1 - f, 3);
      const done = revealRef.current >= 1;
      const strandCount = done ? Infinity : Math.floor(revealRef.current * STRAND_SEGMENTS) * STRAND_RADIAL * 6;
      const haloCount = done ? Infinity : Math.floor(revealRef.current * HALO_SEGMENTS) * HALO_RADIAL * 6;
      geometries.strand0.setDrawRange(0, strandCount);
      geometries.strand1.setDrawRange(0, strandCount);
      geometries.halo0.setDrawRange(0, haloCount);
      geometries.halo1.setDrawRange(0, haloCount);
      rungRefs.current.forEach((g, k) => {
        if (g) g.visible = revealRef.current >= revealPointOf(k);
      });
    }

    // Chấm sáng chạy dọc hai sợi như dòng thông tin di truyền
    if (pulsesRef.current && pulsesPerStrand > 0) {
      pulsesRef.current.visible = revealRef.current >= 1;
      const attr = pulseGeometry.getAttribute('position') as THREE.BufferAttribute;
      const arr = attr.array as Float32Array;
      const span = STRAND_TO - STRAND_FROM;
      for (let strand = 0; strand < 2; strand++) {
        for (let i = 0; i < pulsesPerStrand; i++) {
          // Hai sợi chạy ngược chiều nhau, như hai mạch đối song song của ADN
          const phase = (i / pulsesPerStrand + (strand ? -1 : 1) * time * PULSE_SPEED + 10) % 1;
          const t = STRAND_FROM + phase * span;
          const a = t * STEP + (strand ? Math.PI : 0);
          const o = (strand * pulsesPerStrand + i) * 3;
          arr[o] = Math.cos(a) * R;
          arr[o + 1] = -t * DY;
          arr[o + 2] = Math.sin(a) * R;
        }
      }
      attr.needsUpdate = true;
    }

    const p = progress.current ?? 0;
    const camY = -p * (LEVELS - 1) * DY;

    easing.damp(groupRef.current.rotation, 'y', -p * Math.PI * 2.6 + time * 0.04, 0.35, dt);
    // Bán kính 3,3 là cho canvas tràn màn hình: trong thẻ nhỏ hoặc khung dọc, camera đặt cố định sẽ cắt mất một sợi
    const aspect = state.size.width / Math.max(1, state.size.height);
    const shift = aspect >= 1 ? offsetX : 0;
    groupRef.current.position.x = shift;
    const fov = (state.camera as THREE.PerspectiveCamera).fov ?? 42;
    const halfTan = Math.tan(THREE.MathUtils.degToRad(fov / 2));
    // Sợi gần camera nhất nằm ở z = +R nên tính bề ngang tại độ sâu đó, chừa 0,7 đơn vị lề
    const fitDistance = ((Math.abs(shift) + R + 0.7) / (halfTan * aspect) + R) * fitScale;
    state.camera.position.z = Math.max(minDistance, fitDistance);

    easing.damp(state.camera.position, 'y', camY + 0.4, 0.35, dt);
    easing.damp(state.camera.position, 'x', state.pointer.x * 0.8, 0.5, dt);
    state.camera.lookAt(0, state.camera.position.y - 0.4, 0);

    // Quay quanh trục y một góc θ đưa điểm ở góc a tới góc a − θ
    const theta = groupRef.current.rotation.y;

    if (onActiveTaxon && slots.length === 0) {
      let best = -1;
      let maxZ = -Infinity;
      for (let k = 0; k < LEVELS; k++) {
        const z = Math.sin(k * STEP - theta) * R;
        if (Math.abs(-k * DY - camY) < DY * 0.9 && z > maxZ) {
          maxZ = z;
          best = k;
        }
      }
      if (best !== -1 && best !== activeIdxRef.current) {
        activeIdxRef.current = best;
        onActiveTaxon(best);
      }
    }

    if (slots.length > 0) {
      // Mỗi bậc chỉ có hai ảnh nên ảnh trước mặt của đúng bậc đó có thể nằm sát mép khung (trục xoắn lệch phải).
      // Xét cả bậc kề, chỉ ảnh ở mặt trước, và chọn ảnh gần camera nhất; lệch bậc bị phạt để vẫn ưu tiên bậc đang tới
      const camX = state.camera.position.x;
      const camZ = state.camera.position.z;
      let bestSlot = -1;
      let minScore = Infinity;
      for (let i = 0; i < slots.length; i++) {
        const slot = slots[i]!;
        const dy = -slot.k * DY - camY;
        if (Math.abs(dy) >= DY * 1.6) continue;
        const a = slot.k * STEP + (slot.strand ? Math.PI : 0) - theta;
        const z = Math.sin(a) * PHOTO_R;
        if (z <= 0) continue;
        const dx = shift + Math.cos(a) * PHOTO_R - camX;
        const dz = z - camZ;
        const score = dx * dx + dz * dz + 4 * dy * dy;
        if (score < minScore) {
          minScore = score;
          bestSlot = i;
        }
      }
      if (bestSlot !== -1 && bestSlot !== activeSlotRef.current) {
        activeSlotRef.current = bestSlot;
        const slot = slots[bestSlot]!;
        onActivePhoto?.(slot.photoIndex);
        if (slot.k !== activeIdxRef.current) {
          activeIdxRef.current = slot.k;
          onActiveTaxon?.(slot.k);
        }
      }
    }
  });

  return (
    <>
      {tier !== 'static' && <CameraAnchoredStars />}
      <group ref={groupRef}>
        {/* Ống xoắn phát quang ngọc bích và quầng sáng mờ bao quanh */}
        <mesh geometry={geometries.strand0}>
          <meshBasicMaterial color={colors.strand0} toneMapped={false} />
        </mesh>
        <mesh geometry={geometries.strand1}>
          <meshBasicMaterial color={colors.strand1} toneMapped={false} />
        </mesh>
        <mesh geometry={geometries.halo0}>
          <meshBasicMaterial color={colors.halo0} transparent opacity={0.1} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
        <mesh geometry={geometries.halo1}>
          <meshBasicMaterial color={colors.halo1} transparent opacity={0.1} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>

        {/* Cầu liên kết bậc thang và mấu phát quang */}
        {Array.from({ length: LEVELS }, (_, k) => {
          const p0 = getHelixPoint(k, 0);
          const p1 = getHelixPoint(k, 1);
          const isAT = k % 2 === 0;

          return (
            <group
              key={k}
              ref={(g) => {
                rungRefs.current[k] = g;
              }}
              visible={!shouldReveal}
            >
              <lineSegments geometry={rungGeometries[k]}>
                <lineBasicMaterial color={isAT ? '#5eead4' : '#6ee7b7'} transparent opacity={0.3} />
              </lineSegments>
              <mesh position={p0}>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshBasicMaterial color={colors.node} toneMapped={false} />
              </mesh>
              <mesh position={p1}>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshBasicMaterial color={colors.node} toneMapped={false} />
              </mesh>
            </group>
          );
        })}

        {pulsesPerStrand > 0 && (
          <points ref={pulsesRef} geometry={pulseGeometry} visible={false} frustumCulled={false}>
            <pointsMaterial
              size={0.28}
              sizeAttenuation
              map={geometries.dot}
              color={colors.pulse}
              transparent
              opacity={0.9}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              toneMapped={false}
            />
          </points>
        )}

        {/* Sợi hiện ngay, ảnh nạp xong mới hiện */}
        {photos && slots.length > 0 && (
          <Suspense fallback={null}>
            {slots.map((slot, i) => (
              <PhotoCard
                key={`${slot.k}-${slot.strand}`}
                slot={slot}
                slotIndex={i}
                src={photos[slot.photoIndex]!.src}
                frameGeometry={geometries.frame}
                frameColor={colors.frame}
                activeSlotRef={activeSlotRef}
                revealRef={revealRef}
                onSelect={onSelectPhoto}
              />
            ))}
          </Suspense>
        )}

        {/* Hạt bụi phát sáng lơ lửng xung quanh (ở tier high) */}
        {tier === 'high' && (
          <Sparkles count={260} scale={[16, 30, 10]} position={[0, -7, -2]} size={2.2} speed={0.3} color="#a7f3d0" opacity={0.5} />
        )}
      </group>
    </>
  );
};
