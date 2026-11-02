import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import { easing } from 'maath';
import { useQuality } from './QualityProvider';

export interface HelixSceneProps {
  progress: React.RefObject<number> | { current: number };
  onActiveTaxon?: (index: number) => void;
}

export const TAXONOMIC_RANKS = [
  { level: 0, rankEn: 'Domain', rankVi: 'Vực', name: 'Eukaryota', desc: 'Sinh vật nhân thực với màng nhân hoàn chỉnh' },
  { level: 1, rankEn: 'Kingdom', rankVi: 'Giới', name: 'Animalia / Plantae', desc: 'Động vật đa bào và thực vật có lục lạp' },
  { level: 2, rankEn: 'Subkingdom', rankVi: 'Phân giới', name: 'Bilateria / Viridiplantae', desc: 'Đối xứng hai bên & thực vật xanh quang hợp' },
  { level: 3, rankEn: 'Phylum', rankVi: 'Ngành', name: 'Chordata / Tracheophyta', desc: 'Ngành Dây sống & Thực vật có mạch' },
  { level: 4, rankEn: 'Subphylum', rankVi: 'Phân ngành', name: 'Vertebrata / Euphyllophytina', desc: 'Động vật có xương sống & Thực vật lá thật' },
  { level: 5, rankEn: 'Class', rankVi: 'Lớp', name: 'Reptilia / Amphibia', desc: 'Lớp Bò sát, Lưỡng cư và Thực vật hai lá mầm' },
  { level: 6, rankEn: 'Subclass', rankVi: 'Phân lớp', name: 'Lepidosauria / Lissamphibia', desc: 'Thằn lằn vảy và ếch nhái hiện đại' },
  { level: 7, rankEn: 'Order', rankVi: 'Bộ', name: 'Squamata / Testudines', desc: 'Bộ Có vảy (Trăn, Nhông) & Rùa cạn' },
  { level: 8, rankEn: 'Suborder', rankVi: 'Phân bộ', name: 'Serpentes / Sauria', desc: 'Phân bộ Rắn, Thằn lằn & Rùa cổ ẩn' },
  { level: 9, rankEn: 'Family', rankVi: 'Họ', name: 'Pythonidae / Agamidae', desc: 'Họ Trăn, Nhông cát, Kỳ giông & Nắp ấm' },
  { level: 10, rankEn: 'Subfamily', rankVi: 'Phân họ', name: 'Pythoninae / Agaminae', desc: 'Nhánh tiến hóa thích nghi bán sa mạc' },
  { level: 11, rankEn: 'Genus', rankVi: 'Chi', name: 'Python / Pogona / Ambystoma', desc: 'Chi Trăn, Rồng Úc, Kỳ giông & Nắp ấm' },
  { level: 12, rankEn: 'Species Group', rankVi: 'Nhóm loài', name: 'Exotic Native Complexes', desc: 'Quần thể sinh vật cảnh thuần dưỡng F2' },
  { level: 13, rankEn: 'Species', rankVi: 'Loài', name: 'Axolotl, Ball Python, Rajah...', desc: '9 loài sinh vật cảnh biểu tượng BioNexus' },
];

const LEVELS = 14;
const R = 3.3;
const DY = 1.05;
const STEP = 0.62;

// Tính toạ độ trên chuỗi xoắn kép
export const getHelixPoint = (k: number, strand: number, r = R): [number, number, number] => {
  const angle = k * STEP + (strand ? Math.PI : 0);
  return [Math.cos(angle) * r, -k * DY, Math.sin(angle) * r];
};

export const HelixScene: React.FC<HelixSceneProps> = ({ progress, onActiveTaxon }) => {
  const { tier } = useQuality();
  const groupRef = useRef<THREE.Group>(null!);
  const activeIdxRef = useRef<number>(-1);
  const tmpWorldPos = useMemo(() => new THREE.Vector3(), []);
  const rungPositions = useRef<THREE.Vector3[]>([]);

  // 1. Tạo hình học đường ống phát quang sợi đôi (Backbone Tubes)
  const [strandGeo0, strandGeo1] = useMemo(() => {
    const pts0: THREE.Vector3[] = [];
    const pts1: THREE.Vector3[] = [];
    for (let t = -1; t <= LEVELS; t += 0.1) {
      pts0.push(new THREE.Vector3(...getHelixPoint(t, 0)));
      pts1.push(new THREE.Vector3(...getHelixPoint(t, 1)));
    }
    const c0 = new THREE.CatmullRomCurve3(pts0);
    const c1 = new THREE.CatmullRomCurve3(pts1);
    return [
      new THREE.TubeGeometry(c0, 400, 0.035, 8, false),
      new THREE.TubeGeometry(c1, 400, 0.035, 8, false),
    ];
  }, []);

  // Dọn dẹp hình học khi unmount
  useEffect(() => {
    return () => {
      strandGeo0.dispose();
      strandGeo1.dispose();
    };
  }, [strandGeo0, strandGeo1]);

  // Khởi tạo các điểm mút bậc thang
  useEffect(() => {
    rungPositions.current = Array.from({ length: LEVELS }, (_, k) => {
      const p = getHelixPoint(k, 0, R + 0.75); // Bán kính ngoài chống cắt xuyên
      return new THREE.Vector3(...p);
    });
  }, []);

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
    easing.damp(state.camera.position, 'y', camY + 0.4, 0.35, dt);
    easing.damp(state.camera.position, 'x', state.pointer.x * 0.8, 0.5, dt);
    state.camera.lookAt(0, state.camera.position.y - 0.4, 0);

    // Tìm bậc thang gần camera nhất tại độ cao hiện tại
    let best = -1;
    let maxZ = -Infinity;

    for (let k = 0; k < LEVELS; k++) {
      const angle = k * STEP + groupRef.current.rotation.y;
      const x = Math.cos(angle) * R + 2.4;
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
    <group ref={groupRef} position={[2.4, 0, 0]}>
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
            <line>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  args={[new Float32Array([...p0, ...p1]), 3]}
                />
              </bufferGeometry>
              <lineBasicMaterial
                color={isAT ? '#5eead4' : '#6ee7b7'}
                transparent
                opacity={0.35}
              />
            </line>
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
