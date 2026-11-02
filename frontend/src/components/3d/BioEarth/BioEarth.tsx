import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { MapPin } from 'lucide-react';
import { IucnBadge } from '@/components/ui/IucnBadge';
import { useQuality } from '../QualityProvider';
import {
  latLngToVector3,
  IUCN_MARKER_COLORS,
  VIETNAM_BREEDING_HUBS,
  DEFAULT_SPECIES_BIOMARKERS,
} from './coordinates';
import type { BioEarthProps, SpeciesBioMarker, BreedingHub } from './types';

const GLOBE_RADIUS = 2.2;

// 1. Lớp Bầu Khí Quyển Fresnel Xanh Ngọc (#00D29E)
function AtmosphereLayer() {
  const uniforms = useMemo(
    () => ({
      uAtmosphereColor: { value: new THREE.Color('#00D29E') },
    }),
    []
  );

  const vertexShader = `
    varying vec3 vNormal;
    varying vec3 vPositionEye;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vPositionEye = mv.xyz;
      gl_Position = projectionMatrix * mv;
    }
  `;

  const fragmentShader = `
    uniform vec3 uAtmosphereColor;
    varying vec3 vNormal;
    varying vec3 vPositionEye;
    void main() {
      vec3 viewDir = normalize(-vPositionEye);
      float fresnel = clamp(dot(vNormal, viewDir), 0.0, 1.0);
      float intensity = pow(fresnel, 3.2) * 1.35;
      gl_FragColor = vec4(uAtmosphereColor, intensity * 0.85);
    }
  `;

  return (
    <mesh>
      <sphereGeometry args={[GLOBE_RADIUS * 1.14, 48, 36]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.BackSide}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// 2. Lớp Lõi Cầu & Lưới Kinh Vĩ Tuyến (Core & Graticule)
function CoreLayer() {
  const graticuleLines = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const r = GLOBE_RADIUS * 1.001;
    // Vĩ tuyến cách nhau 15 độ
    for (let lat = -75; lat <= 75; lat += 15) {
      for (let lng = -180; lng <= 180; lng += 5) {
        const [x1, y1, z1] = latLngToVector3(lat, lng, r);
        const [x2, y2, z2] = latLngToVector3(lat, lng + 5, r);
        points.push(new THREE.Vector3(x1, y1, z1), new THREE.Vector3(x2, y2, z2));
      }
    }
    // Kinh tuyến cách nhau 15 độ
    for (let lng = -180; lng < 180; lng += 15) {
      for (let lat = -85; lat <= 85; lat += 5) {
        const [x1, y1, z1] = latLngToVector3(lat, lng, r);
        const [x2, y2, z2] = latLngToVector3(lat + 5, lng, r);
        points.push(new THREE.Vector3(x1, y1, z1), new THREE.Vector3(x2, y2, z2));
      }
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  useEffect(() => {
    return () => {
      graticuleLines.dispose();
    };
  }, [graticuleLines]);

  return (
    <group>
      {/* Cầu lõi ngọc bích tối che khuất mặt sau */}
      <mesh renderOrder={0}>
        <sphereGeometry args={[GLOBE_RADIUS * 0.985, 64, 48]} />
        <meshStandardMaterial color="#03130E" roughness={0.88} metalness={0.12} />
      </mesh>
      {/* Lưới kinh vĩ tuyến mờ */}
      <lineSegments geometry={graticuleLines}>
        <lineBasicMaterial color="#a7f3d0" transparent opacity={0.07} depthWrite={false} />
      </lineSegments>
    </group>
  );
}

// 3. Lớp Lục Địa & Hạt Bề Mặt (Fibonacci Sphere Land Particles)
function LandParticlesLayer({ tier }: { tier: string }) {
  const count = tier === 'high' ? 10000 : tier === 'medium' ? 6000 : 2500;

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      // Ước lượng phân bố lục địa
      const isLand = Math.sin(phi * 3.5 + theta * 2.2) + Math.cos(phi * 2.0 - theta * 3.1) > 0.3;
      const r = isLand ? GLOBE_RADIUS * 1.006 : GLOBE_RADIUS * 1.0;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      if (isLand) {
        colors[i * 3] = 0.43; // #6ee7b7 lục ngọc
        colors[i * 3 + 1] = 0.91;
        colors[i * 3 + 2] = 0.72;
      } else {
        colors[i * 3] = 0.15; // Đại dương mờ
        colors[i * 3 + 1] = 0.45;
        colors[i * 3 + 2] = 0.65;
      }
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [count]);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  return (
    <points geometry={geometry}>
      <pointsMaterial
        size={0.024}
        vertexColors
        transparent
        opacity={0.7}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// 4. Lớp Vành Bụi Quỹ Đạo Ngoài (Outer Halo Ring - Tier High)
function OuterHaloLayer() {
  const haloGeo = useMemo(() => {
    const count = 1000;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.1;
      const dist = 2.85 + Math.random() * 0.45;
      pos[i * 3] = Math.cos(angle) * dist;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.15;
      pos[i * 3 + 2] = Math.sin(angle) * dist;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return geo;
  }, []);

  const haloRef = useRef<THREE.Points>(null!);

  useFrame((_, dt) => {
    if (haloRef.current) {
      haloRef.current.rotation.y -= dt * 0.02;
    }
  });

  useEffect(() => {
    return () => {
      haloGeo.dispose();
    };
  }, [haloGeo]);

  return (
    <points ref={haloRef} geometry={haloGeo} rotation={[0.38, 0, 0.25]}>
      <pointsMaterial
        size={0.02}
        color="#a7f3d0"
        transparent
        opacity={0.35}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// 5. Lớp Cung Đường Bay 3D (3D Flight Arcs)
function FlightArc({
  source,
  target,
  color,
  isDashed = false,
}: {
  source: [number, number, number];
  target: [number, number, number];
  color: string;
  isDashed?: boolean;
}) {
  const curvePoints = useMemo(() => {
    const vSrc = new THREE.Vector3(...source);
    const vDst = new THREE.Vector3(...target);
    const angle = vSrc.angleTo(vDst);
    const peakAltitude = GLOBE_RADIUS * (0.14 + 0.36 * (angle / Math.PI));

    const pts: THREE.Vector3[] = [];
    const segments = 48;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const current = new THREE.Vector3().copy(vSrc).lerp(vDst, t).normalize();
      const altitude = GLOBE_RADIUS + 4 * peakAltitude * t * (1 - t);
      pts.push(current.multiplyScalar(altitude));
    }
    return new THREE.CatmullRomCurve3(pts).getPoints(64);
  }, [source, target]);

  const geometry = useMemo(() => {
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(curvePoints), 48, 0.009, 6, false);
  }, [curvePoints]);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial
        color={color}
        transparent
        opacity={isDashed ? 0.22 : 0.75}
        toneMapped={false}
      />
    </mesh>
  );
}

// 6. Lớp Marker 9 Loài IUCN & Thẻ Tooltip Drei Html
function SpeciesMarker({
  species,
  isSelected,
  onSelect,
  hubName,
}: {
  species: SpeciesBioMarker;
  isSelected: boolean;
  onSelect: () => void;
  hubName: string;
}) {
  const markerPos = useMemo(
    () => latLngToVector3(species.origin.lat, species.origin.lng, GLOBE_RADIUS * 1.018),
    [species.origin.lat, species.origin.lng]
  );

  const color = IUCN_MARKER_COLORS[species.conservationStatus] || '#00D29E';

  return (
    <group position={markerPos}>
      {/* Chốt cầu trung tâm */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        <sphereGeometry args={[isSelected ? 0.055 : 0.038, 16, 16]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>

      {/* Cột sáng mảnh vươn cao */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.006, 0.006, 0.16, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.65} toneMapped={false} />
      </mesh>

      {/* Thẻ Tooltip Drei Html neo trên đỉnh marker khi được chọn */}
      {isSelected && (
        <Html position={[0, 0.22, 0]} center occlude distanceFactor={7}>
          <div className="w-64 rounded-2xl border border-white/20 bg-[#03130E]/95 p-3.5 text-white shadow-2xl backdrop-blur-xl pointer-events-auto">
            <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
              <IucnBadge code={species.conservationStatus} size="sm" />
              <span className="font-mono text-[10px] text-[#00D29E] uppercase font-semibold">
                {species.group}
              </span>
            </div>
            <div className="mt-2 flex gap-2.5 items-center">
              <img
                src={species.heroPhoto}
                alt={species.displayName}
                className="size-12 rounded-lg object-cover border border-white/15"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate text-white">{species.displayName}</p>
                <p className="text-xs italic text-white/50 truncate">{species.scientificName}</p>
                <p className="text-[11px] text-white/70 flex items-center gap-1 mt-0.5">
                  <MapPin className="size-3 text-[#00D29E] shrink-0" />
                  <span className="truncate">{species.origin.place}</span>
                </p>
              </div>
            </div>
            <div className="mt-2.5 rounded-lg bg-black/40 px-2.5 py-1.5 text-[11px] text-white/70 border border-white/5">
              <span className="text-white/40">Nhân giống: </span>
              <span className="font-medium text-[#00D29E]">{hubName}</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// 7. Component Quả Địa Cầu BioEarth Hoàn Chỉnh
export function BioEarth({
  speciesList = DEFAULT_SPECIES_BIOMARKERS,
  breedingHubs = VIETNAM_BREEDING_HUBS,
  selectedSpeciesId,
  onSelectSpecies,
}: BioEarthProps) {
  const { tier } = useQuality();
  const globeGroup = useRef<THREE.Group | null>(null);

  // Bản đồ tra cứu vị trí trung tâm bảo tồn
  const hubMap = useMemo(() => {
    const map = new Map<string, BreedingHub>();
    breedingHubs.forEach((h) => map.set(h.id, h));
    return map;
  }, [breedingHubs]);

  // Bộ đệm tái sử dụng để tính toán quaternion hướng nhìn động (Zero GC Allocation)
  const targetQuaternion = useRef(new THREE.Quaternion());
  const tempTargetVec = useRef(new THREE.Vector3());
  const tempCamDir = useRef(new THREE.Vector3());
  const tempViewVec = useRef(new THREE.Vector3());

  // Vòng lặp xoay tự do và Slerp hướng tới camera thực tế
  useFrame((state, delta) => {
    if (!globeGroup.current) return;

    if (selectedSpeciesId) {
      const sp = speciesList.find((s) => s.speciesId === selectedSpeciesId);
      if (sp) {
        // 1. Tọa độ marker loài trên mặt cầu đơn vị
        const [x, y, z] = latLngToVector3(sp.origin.lat, sp.origin.lng, 1.0);
        tempTargetVec.current.set(x, y, z).normalize();

        // 2. Tính hướng nhìn đích động vView dựa trên camera.position so với tâm địa cầu
        tempCamDir.current
          .copy(state.camera.position)
          .sub(globeGroup.current.position)
          .normalize();

        // 3. Nghiêng nhẹ 0.18 theo camera.up để marker nằm ở góc nhìn trung tâm tối ưu
        tempViewVec.current
          .copy(tempCamDir.current)
          .addScaledVector(state.camera.up, 0.18)
          .normalize();

        // 4. Xoay từ vTarget sang vView động
        targetQuaternion.current.setFromUnitVectors(
          tempTargetVec.current,
          tempViewVec.current
        );

        globeGroup.current.quaternion.slerp(
          targetQuaternion.current,
          1.0 - Math.exp(-4.0 * delta)
        );
      }
    } else {
      // Tự xoay nhịp nhàng quanh trục Y khi không chọn loài cụ thể
      globeGroup.current.rotation.y += delta * 0.06;
    }
  });

  return (
    <group ref={globeGroup}>
      {/* Lớp 1: Cầu Lõi & Lưới Kinh Vĩ Tuyến */}
      <CoreLayer />

      {/* Lớp 2: Hạt Lục Địa Fibonacci */}
      <LandParticlesLayer tier={tier} />

      {/* Lớp 3: Bầu Khí Quyển Fresnel */}
      {tier !== 'low' && <AtmosphereLayer />}

      {/* Lớp 4: Vành Bụi Quỹ Đạo Ngoài (tier high) */}
      {tier === 'high' && <OuterHaloLayer />}

      {/* Lớp 5 & Lớp 7: Marker & Thẻ Thông Tin 9 Loài */}
      {speciesList.map((sp) => {
        const hub = hubMap.get(sp.hubId);
        return (
          <SpeciesMarker
            key={sp.speciesId}
            species={sp}
            isSelected={selectedSpeciesId === sp.speciesId}
            onSelect={() => onSelectSpecies?.(sp.speciesId)}
            hubName={hub ? `${hub.shopName} (${hub.city})` : 'Việt Nam Hub'}
          />
        );
      })}

      {/* Lớp 6: Cung Đường Bay 3D Về Việt Nam */}
      {speciesList.map((sp) => {
        const fallbackHub = VIETNAM_BREEDING_HUBS[0]!;
        const hub = hubMap.get(sp.hubId) ?? (breedingHubs[0] ?? fallbackHub);
        const srcPos = latLngToVector3(sp.origin.lat, sp.origin.lng, GLOBE_RADIUS);
        const dstPos = latLngToVector3(hub.lat, hub.lng, GLOBE_RADIUS);
        const color = IUCN_MARKER_COLORS[sp.conservationStatus] || '#00D29E';

        return (
          <FlightArc
            key={`arc-${sp.speciesId}`}
            source={srcPos}
            target={dstPos}
            color={color}
            isDashed={!sp.hasActiveProduct}
          />
        );
      })}
    </group>
  );
}
