import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useQuality } from './QualityProvider';

const STAR_COUNT = { high: 1800, medium: 1100, low: 500, static: 0 } as const;

/** Nền sao mờ phía sau cảnh hạt, cho bầu trời có chiều sâu thay vì một mảng đen phẳng */
export function Starfield(): React.JSX.Element | null {
  const { tier } = useQuality();
  const ref = useRef<THREE.Points>(null);
  const count = STAR_COUNT[tier];

  const [geometry, texture] = useMemo(() => {
    if (count === 0) return [null, null] as const;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Chỉ đặt sau cảnh (z âm): sao sát camera sẽ thành chấm to bất thường (tài liệu 05 mục 2.3)
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 36;
      positions[i * 3 + 2] = -6 - Math.random() * 22;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Chấm tròn mềm vẽ bằng canvas 2D: pointsMaterial mặc định là ô vuông
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grd = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grd.addColorStop(0, 'rgba(255,255,255,1)');
      grd.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, 32, 32);
    }
    return [geo, new THREE.CanvasTexture(canvas)] as const;
  }, [count]);

  useEffect(() => {
    return () => {
      geometry?.dispose();
      texture?.dispose();
    };
  }, [geometry, texture]);

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.z += dt * 0.004;
  });

  if (!geometry || !texture) return null;

  return (
    <points ref={ref} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        size={0.08}
        sizeAttenuation
        map={texture}
        color="#a7f3d0"
        transparent
        opacity={0.5}
        depthWrite={false}
      />
    </points>
  );
}
