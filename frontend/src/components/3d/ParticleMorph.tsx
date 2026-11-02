import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { easing } from 'maath';
import { useQuality } from './QualityProvider';
import vertexShader from './shaders/particleMorph.vert.glsl?raw';
import fragmentShader from './shaders/particleMorph.frag.glsl?raw';

export interface ParticleMorphProps {
  progress: React.RefObject<number> | { current: number };
  interactive?: boolean;
}

const PALETTE_A = ['#c4b5fd', '#38bdf8', '#34d399', '#4ade80'];
const PALETTE_B = ['#5eead4', '#6ee7b7', '#a7f3d0', '#d9f99d'];

export const ParticleMorph: React.FC<ParticleMorphProps> = ({ progress, interactive = true }) => {
  const { tier } = useQuality();
  const pointsRef = useRef<THREE.Points>(null!);
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  // Xác định số lượng hạt theo phân cấp phần cứng
  const particleCount = useMemo(() => {
    switch (tier) {
      case 'high':
        return 16000;
      case 'medium':
        return 8000;
      case 'low':
        return 3000;
      default:
        return 0;
    }
  }, [tier]);

  // Khởi tạo thuộc tính hình học BufferGeometry
  const geometry = useMemo(() => {
    if (particleCount === 0) return null;
    const N = particleCount;
    const geo = new THREE.BufferGeometry();

    const pos0 = new Float32Array(N * 3); // Galaxy
    const pos1 = new Float32Array(N * 3); // DNA
    const pos2 = new Float32Array(N * 3); // Leaf
    const pos3 = new Float32Array(N * 3); // Earth
    const colors = new Float32Array(N * 3);
    const rand = new Float32Array(N);
    const land = new Float32Array(N);

    const randGauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

    for (let i = 0; i < N; i++) {
      rand[i] = Math.random();

      // 1. Galaxy Xoắn Ốc
      if (i % 7 === 0) {
        const d = Math.pow(Math.random(), 2) * 0.9;
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        pos0[i * 3] = Math.sin(ph) * Math.cos(th) * d;
        pos0[i * 3 + 1] = Math.cos(ph) * d * 0.5;
        pos0[i * 3 + 2] = Math.sin(ph) * Math.sin(th) * d;
      } else {
        const arm = i % 3;
        const d = 0.25 + Math.pow(Math.random(), 1.3) * 3.3;
        const spread = 0.32 * (1.25 - d / 3.6);
        const a = (arm / 3) * Math.PI * 2 + d * 1.3;
        pos0[i * 3] = Math.cos(a) * d + randGauss() * spread;
        pos0[i * 3 + 1] = randGauss() * 0.12 * (1.4 - d / 3.6);
        pos0[i * 3 + 2] = Math.sin(a) * d + randGauss() * spread;
      }

      // 2. DNA Double Helix
      const strand = i % 3;
      const t = (i / N) * Math.PI * 7;
      const yDna = (i / N) * 7.0 - 3.5;
      if (strand === 2) {
        const s = Math.random() * 2 - 1;
        const aRung = Math.floor(t * 3) / 3;
        pos1[i * 3] = Math.cos(aRung) * 1.25 * s;
        pos1[i * 3 + 1] = Math.floor(yDna * 3) / 3;
        pos1[i * 3 + 2] = Math.sin(aRung) * 1.25 * s;
      } else {
        const aStrand = t + (strand === 1 ? Math.PI : 0);
        pos1[i * 3] = Math.cos(aStrand) * 1.25 + (Math.random() - 0.5) * 0.1;
        pos1[i * 3 + 1] = yDna + (Math.random() - 0.5) * 0.1;
        pos1[i * 3 + 2] = Math.sin(aStrand) * 1.25 + (Math.random() - 0.5) * 0.1;
      }

      // 3. Leaf Phiến Lá Sinh Học
      const uL = Math.random();
      const vL = Math.random() * 2 - 1;
      const wL = Math.sin(Math.PI * uL) * 1.35 * (1 - uL * 0.35);
      const vEff = i % 7 === 0 ? 0 : vL;
      const yLeaf = uL * 5.2 - 2.6;
      pos2[i * 3] = vEff * wL + Math.sin(yLeaf * 0.6) * 0.3;
      pos2[i * 3 + 1] = yLeaf;
      pos2[i * 3 + 2] = (Math.random() - 0.5) * 0.15 - Math.sin(uL * Math.PI) * 0.5 * Math.abs(vEff);

      // 4. Earth Surface (Fibonacci Sphere)
      const phiSphere = Math.acos(1 - (2 * (i + 0.5)) / N);
      const thetaSphere = Math.PI * (1 + Math.sqrt(5)) * i;
      const isContinental = Math.sin(phiSphere * 3 + thetaSphere * 2) > 0.15;
      land[i] = isContinental ? 1.0 : 0.0;
      const rEarth = isContinental ? 2.213 : 2.2;
      pos3[i * 3] = rEarth * Math.sin(phiSphere) * Math.cos(thetaSphere);
      pos3[i * 3 + 1] = rEarth * Math.cos(phiSphere);
      pos3[i * 3 + 2] = rEarth * Math.sin(phiSphere) * Math.sin(thetaSphere);

      // Màu mặc định ngọc bích
      colors[i * 3] = 0.43;
      colors[i * 3 + 1] = 0.91;
      colors[i * 3 + 2] = 0.72;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos0, 3));
    geo.setAttribute('aPos0', new THREE.BufferAttribute(pos0, 3));
    geo.setAttribute('aPos1', new THREE.BufferAttribute(pos1, 3));
    geo.setAttribute('aPos2', new THREE.BufferAttribute(pos2, 3));
    geo.setAttribute('aPos3', new THREE.BufferAttribute(pos3, 3));
    geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('aRand', new THREE.BufferAttribute(rand, 1));
    geo.setAttribute('aLand', new THREE.BufferAttribute(land, 1));

    return geo;
  }, [particleCount]);

  // Dọn dẹp GPU buffer khi unmount
  useEffect(() => {
    return () => {
      geometry?.dispose();
    };
  }, [geometry]);

  // Khởi tạo Uniforms
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uSize: { value: 30 },
      uPush: { value: 0 },
      uMouse: { value: new THREE.Vector3(99, 99, 0) },
      uShockT: { value: -100 },
      uShockP: { value: new THREE.Vector3() },
      uCA: { value: PALETTE_A.map((c) => new THREE.Color(c)) },
      uCB: { value: PALETTE_B.map((c) => new THREE.Color(c)) },
    }),
    []
  );

  // Lắng nghe tương tác chuột & Shockwave
  const planeZ = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const hitVec = useMemo(() => new THREE.Vector3(), []);
  const lastPointer = useMemo(() => new THREE.Vector2(9, 9), []);
  const idleRef = useRef(0);

  const { raycaster, camera } = useThree();

  useEffect(() => {
    if (!interactive) return;
    const handlePointerDown = () => {
      if (!materialRef.current) return;
      const u = materialRef.current.uniforms;
      if (u['uShockT'] && u['uTime']) {
        u['uShockT'].value = u['uTime'].value;
      }
      if (u['uShockP']) {
        u['uShockP'].value.copy(hitVec);
      }
    };
    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [interactive, hitVec]);

  useFrame((state, dt) => {
    if (!materialRef.current || !geometry || !pointsRef.current) return;
    const u = materialRef.current.uniforms;
    const t = state.clock.elapsedTime;
    if (u['uTime']) u['uTime'].value = t;
    if (u['uSize']) u['uSize'].value = 32 * state.viewport.dpr;

    // Nội suy mượt mà tiến độ cuộn
    const targetProgress = progress.current ?? 0;
    if (u['uProgress']) {
      easing.damp(u['uProgress'], 'value', targetProgress, 0.45, dt);
    }

    // Tính toán tương tác con trỏ chuột
    if (interactive) {
      raycaster.setFromCamera(state.pointer, camera);
      if (raycaster.ray.intersectPlane(planeZ, hitVec) && u['uMouse']) {
        easing.damp3(u['uMouse'].value, hitVec, 0.15, dt);
      }

      if (state.pointer.distanceTo(lastPointer) > 0.002) {
        idleRef.current = 0;
        lastPointer.copy(state.pointer);
      } else {
        idleRef.current += dt;
      }
      // Tự triệt tiêu lực đẩy sau 1.2s không rê chuột
      if (u['uPush']) {
        easing.damp(u['uPush'], 'value', idleRef.current < 1.2 ? 1.0 : 0.0, 0.35, dt);
      }
    }

    // Tự xoay cụm hạt ở các pha không gian
    const currP = u['uProgress'] ? u['uProgress'].value : 0;
    if (currP < 2.2) {
      pointsRef.current.rotation.y += dt * 0.12;
    } else {
      // Hồi quy về góc đối diện khi chuyển sang hình lá và địa cầu
      const targetY = Math.round(pointsRef.current.rotation.y / (Math.PI * 2)) * (Math.PI * 2);
      easing.damp(pointsRef.current.rotation, 'y', targetY, 0.5, dt);
    }
  });

  if (!geometry) return null;

  return (
    <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
