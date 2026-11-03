import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import { easing } from 'maath';
import { useQuality } from './QualityProvider';

export interface HelixSceneProps {
  progress: React.RefObject<number> | { current: number };
  onActiveTaxon?: (index: number) => void;
  /** Lệch trục xoắn sang phải khi khung nằm ngang (chừa chỗ cho chữ hoặc thẻ bên trái). Khung dọc luôn căn giữa */
  offsetX?: number;
  /** Khoảng cách camera tối thiểu; khung hẹp thì camera tự lùi thêm để cả hai sợi vừa bề ngang */
  minDistance?: number;
}

// Dữ liệu cấp phân loại nằm ở taxonomyRanks.ts (không phụ thuộc three.js)
export { TAXONOMIC_RANKS } from './taxonomyRanks';

/** Số bậc thang trên chuỗi xoắn */
export const HELIX_LEVELS = 14;
const LEVELS = HELIX_LEVELS;
const R = 3.3;
const DY = 1.05;
const STEP = 0.62;

// Tính toạ độ trên chuỗi xoắn kép
export const getHelixPoint = (k: number, strand: number, r = R): [number, number, number] => {
  const angle = k * STEP + (strand ? Math.PI : 0);
  return [Math.cos(angle) * r, -k * DY, Math.sin(angle) * r];
};

export const HelixScene: React.FC<HelixSceneProps> = ({
  progress,
  onActiveTaxon,
  offsetX = 0,
  minDistance = 14,
}) => {
  const { tier } = useQuality();
  const groupRef = useRef<THREE.Group>(null!);
  const activeIdxRef = useRef<number>(-1);
  const tmpWorldPos = useMemo(() => new THREE.Vector3(), []);

  // 1. Tạo hình học đường ống phát quang sợi đôi (Backbone Tubes)
  const [strandGeo0, strandGeo1] = useMemo(() => {
    const pts0: THREE.Vector3[] = [];
    const pts1: THREE.Vector3[] = [];
    // Sợi kéo dài quá bậc đầu và bậc cuối để khung nhìn không bị trống nửa trên lúc mới vào khối
    for (let t = -4; t <= LEVELS + 3; t += 0.1) {
      pts0.push(new THREE.Vector3(...getHelixPoint(t, 0)));
      pts1.push(new THREE.Vector3(...getHelixPoint(t, 1)));
    }
    const c0 = new THREE.CatmullRomCurve3(pts0);
    const c1 = new THREE.CatmullRomCurve3(pts1);
    return [
      new THREE.TubeGeometry(c0, 560, 0.035, 8, false),
      new THREE.TubeGeometry(c1, 560, 0.035, 8, false),
    ];
  }, []);

  // Dọn dẹp hình học khi unmount
  useEffect(() => {
    return () => {
      strandGeo0.dispose();
      strandGeo1.dispose();
    };
  }, [strandGeo0, strandGeo1]);

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

  // 2. Vũ đạo cuộn và nhận diện thẻ tích cực
  useFrame((state, dt) => {
    if (!groupRef.current) return;
    const p = progress.current ?? 0;
    const camY = -p * (LEVELS - 1) * DY;

    // Xoay trục và cuộn camera
    easing.damp(
      groupRef.current.rotation,
      'y',
      -p * Math.PI * 2.6 + state.clock.elapsedTime * 0.04,
      0.35,
      dt
    );
    // Bán kính 3,3 là cho canvas tràn màn hình: trong thẻ nhỏ hoặc khung dọc, camera đặt cố định sẽ cắt mất một sợi
    const aspect = state.size.width / Math.max(1, state.size.height);
    const shift = aspect >= 1 ? offsetX : 0;
    groupRef.current.position.x = shift;
    const fov = (state.camera as THREE.PerspectiveCamera).fov ?? 42;
    const halfTan = Math.tan(THREE.MathUtils.degToRad(fov / 2));
    // Sợi gần camera nhất nằm ở z = +R nên tính bề ngang tại độ sâu đó, chừa 0,7 đơn vị lề
    const fitDistance = (Math.abs(shift) + R + 0.7) / (halfTan * aspect) + R;
    state.camera.position.z = Math.max(minDistance, fitDistance);

    easing.damp(state.camera.position, 'y', camY + 0.4, 0.35, dt);
    easing.damp(state.camera.position, 'x', state.pointer.x * 0.8, 0.5, dt);
    state.camera.lookAt(0, state.camera.position.y - 0.4, 0);

    // Tìm bậc thang gần camera nhất tại độ cao hiện tại
    let best = -1;
    let maxZ = -Infinity;

    for (let k = 0; k < LEVELS; k++) {
      const angle = k * STEP + groupRef.current.rotation.y;
      const x = Math.cos(angle) * R + shift;
      const y = -k * DY;
      const z = Math.sin(angle) * R;

      tmpWorldPos.set(x, y, z);
      if (Math.abs(tmpWorldPos.y - camY) < DY * 0.9 && tmpWorldPos.z > maxZ) {
        maxZ = tmpWorldPos.z;
        best = k;
      }
    }

    if (best !== -1 && best !== activeIdxRef.current) {
      activeIdxRef.current = best;
      onActiveTaxon?.(best);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Ống xoắn phát quang ngọc bích */}
      <mesh geometry={strandGeo0}>
        <meshBasicMaterial color="#6ee7b7" toneMapped={false} />
      </mesh>
      <mesh geometry={strandGeo1}>
        <meshBasicMaterial color="#5eead4" toneMapped={false} />
      </mesh>

      {/* Cầu liên kết bậc thang & Mấu cầu phát quang */}
      {Array.from({ length: LEVELS }, (_, k) => {
        const p0 = getHelixPoint(k, 0);
        const p1 = getHelixPoint(k, 1);
        const isAT = k % 2 === 0;

        return (
          <group key={k}>
            {/* Thanh cầu bazơ ngang (A-T cyan, G-C emerald) */}
            <lineSegments geometry={rungGeometries[k]}>
              <lineBasicMaterial
                color={isAT ? '#5eead4' : '#6ee7b7'}
                transparent
                opacity={0.35}
              />
            </lineSegments>
            {/* Mấu mút phát quang */}
            <mesh position={p0}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshBasicMaterial color="#d1fae5" toneMapped={false} />
            </mesh>
            <mesh position={p1}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshBasicMaterial color="#d1fae5" toneMapped={false} />
            </mesh>
          </group>
        );
      })}

      {/* Hạt bụi phát sáng lơ lửng xung quanh (ở tier high) */}
      {tier === 'high' && (
        <Sparkles
          count={260}
          scale={[16, 30, 10]}
          position={[0, -7, -2]}
          size={2.2}
          speed={0.3}
          color="#a7f3d0"
          opacity={0.5}
        />
      )}
    </group>
  );
};
