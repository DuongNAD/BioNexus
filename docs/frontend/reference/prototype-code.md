# Code prototype đã duyệt (tham khảo)

Đây là code của prototype dùng để dựng mẫu R (React 19 + JSX, Tailwind v4, Motion, React Three Fiber). Code đã chạy và được chụp kiểm tra. Ảnh chụp ở `screens/`.

**Cách dùng:** đọc để hiểu thuật toán và thông số, rồi **viết lại bằng TypeScript** theo cấu trúc ở tài liệu 01. Không chép nguyên văn:

- Dữ liệu `@/data` trong prototype là dữ liệu tạm. Bản thật lấy dữ liệu qua `src/api` (MSW).
- Ảnh trong prototype là đường dẫn tạm. Bản thật dùng `<Photo>`.
- Prototype gọi `setState` mỗi lần cuộn. Bản thật dùng motion value (tài liệu 05 mục 1.3).

Các bài học đã rút ra (đã sửa trong code dưới đây):

- **Lực đẩy hạt theo chuột** phải tắt dần khi chuột đứng yên (`uPush`). Nếu không, chữ BIONEXUS bằng hạt bị thủng một lỗ cố định.
- **Nền sao** chỉ đặt phía sau cảnh và dùng texture tròn. Sao sát camera sẽ thành ô vuông to.
- **Chữ BIONEXUS bằng hạt** phải chờ `document.fonts.load(...)` xong mới lấy mẫu pixel.
- **Ảnh trong chuỗi xoắn** đặt ở R + 0,75 để sợi sáng chạy phía sau ảnh. Ảnh để trong `Suspense` riêng để sợi hiện trước.
- **Bộ đếm số (Ticker)** dùng `animate()` chứ không dùng spring. Spring từng dừng ở 24 thay vì 25.
- **Đổi route** thì gỡ Canvas cũ (key theo route). HMR đôi khi báo lỗi "R3F hooks outside Canvas" giả, tải lại trang là hết.

## 1. `Genesis.jsx`: hạt biến hình nâng cấp (thiên hà → hành tinh → ADN → lá → chữ)

Bản thật đổi hình "hành tinh" thành `earthSurface` (tài liệu 05 mục 3) và tách engine thành `ParticleMorph` dùng chung.

```jsx
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { easing } from 'maath'
import { iucnCount } from '@/data'

// Bản nâng cấp của mẫu Q: 5 hình (thiên hà → hành tinh → chuỗi ADN → chiếc lá → chữ),
// hạt đổi hình so le và xoáy giữa chừng, có bloom, nền sao, bấm chuột tạo sóng đẩy hạt
const N = 24000
const TAU = Math.PI * 2
const rand = Math.random
const gauss = () => (rand() + rand() + rand() - 1.5) / 1.5
const tiltX = ([x, y, z], a) => [x, y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)]

function galaxy(i) {
  if (i % 7 === 0) {
    // lõi sáng ở giữa
    const d = Math.pow(rand(), 2) * 0.9
    const th = rand() * TAU
    const ph = Math.acos(2 * rand() - 1)
    return tiltX([Math.sin(ph) * Math.cos(th) * d, Math.cos(ph) * d * 0.5, Math.sin(ph) * Math.sin(th) * d], 0.5)
  }
  // 3 nhánh xoắn ốc
  const arm = i % 3
  const d = 0.25 + Math.pow(rand(), 1.3) * 3.3
  const spread = 0.32 * (1.25 - d / 3.6)
  const a = (arm / 3) * TAU + d * 1.3
  return tiltX([Math.cos(a) * d + gauss() * spread, gauss() * 0.12 * (1.4 - d / 3.6), Math.sin(a) * d + gauss() * spread], 0.5)
}

function planet(i) {
  if (i % 6 === 0) {
    // vành quỹ đạo nghiêng quanh hành tinh
    const a = rand() * TAU
    const d = 3.1 + gauss() * 0.07
    const [x, y, z] = tiltX([Math.cos(a) * d, gauss() * 0.025, Math.sin(a) * d], 0.38)
    return [x * Math.cos(0.25) - y * Math.sin(0.25), x * Math.sin(0.25) + y * Math.cos(0.25), z]
  }
  const y = 1 - (i / (N - 1)) * 2
  const r = Math.sqrt(1 - y * y)
  const t = i * 2.399963
  return [Math.cos(t) * r * 2.2, y * 2.2, Math.sin(t) * r * 2.2]
}

function helix(i) {
  const strand = i % 3
  const t = (i / N) * Math.PI * 7
  const y = (i / N) * 7 - 3.5
  if (strand === 2) {
    // các "liên kết" nối hai sợi
    const s = rand() * 2 - 1
    const a = Math.floor(t * 3) / 3
    return [Math.cos(a) * 1.25 * s, Math.floor(y * 3) / 3, Math.sin(a) * 1.25 * s]
  }
  const a = t + (strand ? Math.PI : 0)
  const j = () => (rand() - 0.5) * 0.12
  return [Math.cos(a) * 1.25 + j(), y + j(), Math.sin(a) * 1.25 + j()]
}

function leaf(i) {
  // phiến lá: hai đường cong đối xứng, có gân giữa
  const u = rand()
  const v = rand() * 2 - 1
  const half = Math.sin(Math.PI * u) * 1.35 * (1 - u * 0.35)
  const vein = i % 7 === 0 ? 0 : v
  const y = u * 5.2 - 2.6
  const bend = Math.sin(u * Math.PI) * 0.5
  return [vein * half + Math.sin(y * 0.6) * 0.3, y, (rand() - 0.5) * 0.15 - bend * Math.abs(vein)]
}

function textPoints(word) {
  const c = document.createElement('canvas')
  c.width = 1200
  c.height = 300
  const g = c.getContext('2d')
  g.fillStyle = '#fff'
  g.font = '700 230px "Be Vietnam Pro", sans-serif'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.fillText(word, 600, 160)
  const data = g.getImageData(0, 0, 1200, 300).data
  const pts = []
  for (let y = 0; y < 300; y += 3) for (let x = 0; x < 1200; x += 3) if (data[(y * 1200 + x) * 4 + 3] > 128) pts.push([(x - 600) / 128, -(y - 150) / 128 + 0.6])
  return () => {
    const p = pts[Math.floor(rand() * pts.length)]
    return [p[0] + (rand() - 0.5) * 0.02, p[1], (rand() - 0.5) * 0.25]
  }
}

function build() {
  const shapes = [galaxy, planet, helix, leaf, textPoints('BIONEXUS')]
  const palette = [...iucnCount.map((c) => c.color), '#6ee7b7', '#5eead4', '#a7f3d0', '#6ee7b7', '#5eead4'].map((h) => new THREE.Color(h))
  const pos = shapes.map(() => new Float32Array(N * 3))
  const col = new Float32Array(N * 3)
  const rnd = new Float32Array(N)
  for (let i = 0; i < N; i++) {
    shapes.forEach((f, k) => pos[k].set(f(i), i * 3))
    const c = palette[Math.floor(rand() * palette.length)]
    col.set([c.r, c.g, c.b], i * 3)
    rnd[i] = rand()
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(pos[0], 3))
  ;['aA', 'aB', 'aC', 'aD', 'aE'].forEach((n, k) => g.setAttribute(n, new THREE.BufferAttribute(pos[k], 3)))
  g.setAttribute('aColor', new THREE.BufferAttribute(col, 3))
  g.setAttribute('aRand', new THREE.BufferAttribute(rnd, 1))
  return g
}

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uProgress;
  uniform float uSize;
  uniform float uShockT;
  uniform float uPush;
  uniform vec3 uMouse;
  uniform vec3 uShockP;
  uniform vec3 uCA[4];
  uniform vec3 uCB[4];
  attribute vec3 aA;
  attribute vec3 aB;
  attribute vec3 aC;
  attribute vec3 aD;
  attribute vec3 aE;
  attribute vec3 aColor;
  attribute float aRand;
  varying vec3 vColor;
  varying float vAlpha;

  // mỗi hạt bắt đầu đổi hình lệch nhau một chút theo aRand, nên hình mới hiện ra như sóng
  float stage(float k) {
    float t = clamp((uProgress - k) * 1.6 - aRand * 0.6, 0.0, 1.0);
    return t * t * (3.0 - 2.0 * t);
  }

  void main() {
    float t0 = stage(0.0);
    float t1 = stage(1.0);
    float t2 = stage(2.0);
    float t3 = stage(3.0);
    vec3 pos = mix(aA, aB, t0);
    pos = mix(pos, aC, t1);
    pos = mix(pos, aD, t2);
    pos = mix(pos, aE, t3);
    // giữa lúc đổi hình thì hạt bị cuốn xoáy, xong thì đứng yên lại
    float mid = sin(3.14159 * t0) + sin(3.14159 * t1) + sin(3.14159 * t2) + sin(3.14159 * t3);
    vec3 swirl = vec3(sin(pos.y * 1.7 + uTime * 0.9 + aRand * 6.0), cos(pos.z * 1.5 + uTime * 0.7 + aRand * 3.0), sin(pos.x * 1.3 + uTime * 0.8 + aRand * 5.0));
    pos += swirl * mid * 0.6;
    pos += 0.035 * vec3(sin(uTime * 1.3 + aRand * 40.0), cos(uTime * 1.1 + aRand * 30.0), sin(uTime * 0.9 + aRand * 20.0));

    vec4 world = modelMatrix * vec4(pos, 1.0);
    // đẩy hạt ra khỏi con trỏ (chỉ khi đang rê chuột, đứng yên thì hạt lấp lại)
    vec3 d = world.xyz - uMouse;
    float f = smoothstep(1.5, 0.0, length(d.xy)) * uPush;
    world.xyz += normalize(d + 0.0001) * f * 0.8;
    // sóng tròn lan ra từ chỗ bấm chuột
    float age = uTime - uShockT;
    vec3 sd = world.xyz - uShockP;
    float ring = smoothstep(0.7, 0.0, abs(length(sd.xy) - age * 5.0)) * exp(-age * 1.2) * step(0.0, age);
    world.xyz += normalize(sd + 0.0001) * ring * 0.9;

    vec4 mv = viewMatrix * world;
    gl_Position = projectionMatrix * mv;
    float twinkle = 0.75 + 0.25 * sin(uTime * 2.2 + aRand * 60.0);
    gl_PointSize = uSize * (0.5 + aRand) * twinkle / -mv.z;

    vec3 col = mix(uCA[0], uCB[0], aRand);
    col = mix(col, mix(uCA[1], uCB[1], aRand), t0);
    col = mix(col, mix(uCA[2], uCB[2], aRand), t1);
    col = mix(col, mix(uCA[3], uCB[3], aRand), t2);
    col = mix(col, aColor, t3);
    vColor = col + f * 0.5 + ring * 0.9;
    vAlpha = (0.45 + aRand * 0.55) * clamp(1.5 - (-mv.z - 6.0) * 0.15, 0.3, 1.0);
  }
`
const fragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    gl_FragColor = vec4(vColor, pow(smoothstep(0.5, 0.0, d), 1.6) * vAlpha);
  }
`

// Màu từng hình: thiên hà tím–ngọc, hành tinh xanh biển–ngọc, ADN xanh lục, lá xanh non; chữ dùng bảng màu IUCN
const STAGE_A = ['#c4b5fd', '#38bdf8', '#34d399', '#4ade80']
const STAGE_B = ['#5eead4', '#6ee7b7', '#a7f3d0', '#d9f99d']

function Cloud({ progress }) {
  const mat = useRef()
  const points = useRef()
  const [geo, setGeo] = useState(null)
  useEffect(() => {
    let alive = true
    // chờ phông tải xong mới vẽ chữ BIONEXUS ra hạt
    document.fonts.load('700 120px "Be Vietnam Pro"').finally(() => alive && setGeo(build()))
    return () => (alive = false)
  }, [])
  useEffect(() => () => geo?.dispose(), [geo])
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uSize: { value: 30 },
      uShockT: { value: -100 },
      uPush: { value: 0 },
      uMouse: { value: new THREE.Vector3(99, 99, 0) },
      uShockP: { value: new THREE.Vector3() },
      uCA: { value: STAGE_A.map((h) => new THREE.Color(h)) },
      uCB: { value: STAGE_B.map((h) => new THREE.Color(h)) },
    }),
    [],
  )
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), [])
  const hit = useMemo(() => new THREE.Vector3(), [])
  const shock = useRef(false)
  const lastPointer = useMemo(() => new THREE.Vector2(9, 9), [])
  const idle = useRef(0)
  useEffect(() => {
    const onDown = () => (shock.current = true)
    window.addEventListener('pointerdown', onDown)
    return () => window.removeEventListener('pointerdown', onDown)
  }, [])

  useFrame((state, dt) => {
    if (!mat.current) return
    const u = mat.current.uniforms
    const t = state.clock.elapsedTime
    u.uTime.value = t
    u.uSize.value = 30 * state.viewport.dpr
    easing.damp(u.uProgress, 'value', progress.current * 4, 0.5, dt)
    state.raycaster.setFromCamera(state.pointer, state.camera)
    if (state.raycaster.ray.intersectPlane(plane, hit)) easing.damp3(u.uMouse.value, hit, 0.15, dt)
    if (state.pointer.distanceTo(lastPointer) > 0.002) {
      idle.current = 0
      lastPointer.copy(state.pointer)
    } else idle.current += dt
    easing.damp(u.uPush, 'value', idle.current < 1.2 ? 1 : 0, 0.35, dt)
    if (shock.current) {
      shock.current = false
      u.uShockT.value = t
      u.uShockP.value.copy(hit)
    }
    // Lá và chữ quay về mặt trước (lá đung đưa nhẹ); các hình khác tự xoay
    const s = u.uProgress.value
    const o = points.current
    if (s > 2.5) {
      const base = Math.round(o.rotation.y / TAU) * TAU
      easing.damp(o.rotation, 'y', base + (s > 3.5 ? 0 : Math.sin(t * 0.6) * 0.45), 0.5, dt)
    } else o.rotation.y += dt * 0.14
    easing.damp(o.position, 'x', s > 3.5 ? 0 : 1.9, 0.6, dt)
  })

  if (!geo) return null
  return (
    <points ref={points} geometry={geo} position={[1.9, 0, 0]} frustumCulled={false}>
      <shaderMaterial ref={mat} vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  )
}

// Nền sao: chỉ nằm phía sau cảnh (z âm) để không có ngôi sao nào sát camera thành chấm to
function Stars() {
  const ref = useRef()
  const [geo, dot] = useMemo(() => {
    const p = new Float32Array(1800 * 3)
    for (let i = 0; i < 1800; i++) p.set([(rand() - 0.5) * 60, (rand() - 0.5) * 36, -6 - rand() * 22], i * 3)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(p, 3))
    const c = document.createElement('canvas')
    c.width = c.height = 32
    const x = c.getContext('2d')
    const grd = x.createRadialGradient(16, 16, 0, 16, 16, 16)
    grd.addColorStop(0, 'rgba(255,255,255,1)')
    grd.addColorStop(1, 'rgba(255,255,255,0)')
    x.fillStyle = grd
    x.fillRect(0, 0, 32, 32)
    return [g, new THREE.CanvasTexture(c)]
  }, [])
  useFrame((_, dt) => (ref.current.rotation.z += dt * 0.004))
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.09} sizeAttenuation map={dot} color="#a7f3d0" transparent opacity={0.55} depthWrite={false} />
    </points>
  )
}

// Camera lệch nhẹ theo chuột cho có chiều sâu
function Rig() {
  const goal = useMemo(() => new THREE.Vector3(), [])
  useFrame((state, dt) => {
    easing.damp3(state.camera.position, goal.set(state.pointer.x * 0.5, state.pointer.y * 0.35, 9), 0.6, dt)
    state.camera.lookAt(0, 0, 0)
  })
  return null
}

export function GenesisCanvas({ progress }) {
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 9], fov: 45 }} gl={{ antialias: false }}>
      <color attach="background" args={['#020605']} />
      <Stars />
      <Cloud progress={progress} />
      <Rig />
      <EffectComposer multisampling={0}>
        <Bloom intensity={0.85} luminanceThreshold={0.12} luminanceSmoothing={0.4} mipmapBlur />
        <Vignette offset={0.3} darkness={0.7} />
      </EffectComposer>
    </Canvas>
  )
}
```

## 2. `Helix.jsx`: chuỗi xoắn ảnh loài

```jsx
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { Image as DreiImage, Line, Sparkles, useProgress } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { easing } from 'maath'
import { AnimatePresence, motion } from 'motion/react'
import { Plus } from 'lucide-react'
import { species, products, RANKS, vnd } from '@/data'
import { IucnBadge, LogoMark, useCart } from '@/components/shared'

// Chuỗi xoắn kép: mỗi bậc là một cặp ảnh loài nằm đối diện nhau, nối bằng "liên kết" sáng
const LEVELS = 14
const R = 3.3
const DY = 1.05
const STEP = 0.62
const pointOn = (k, strand, r = R) => {
  const a = k * STEP + (strand ? Math.PI : 0)
  return [Math.cos(a) * r, -k * DY, Math.sin(a) * r]
}
export const ITEMS = Array.from({ length: LEVELS }, (_, k) => [
  { k, strand: 0, sp: species[k % 9] },
  { k, strand: 1, sp: species[(k + 4) % 9] },
]).flat()

function Card({ item, activeRef, index }) {
  const ref = useRef()
  const [hover, setHover] = useState(false)
  // Ảnh đặt lệch ra ngoài sợi xoắn một chút để sợi sáng chạy phía sau ảnh
  const [x, y, z] = pointOn(item.k, item.strand, R + 0.75)
  const angle = item.k * STEP + (item.strand ? Math.PI : 0)
  useFrame((_, dt) => {
    const on = activeRef.current === index || hover
    easing.damp3(ref.current.scale, on ? [2.3, 1.55, 1] : [1.9, 1.28, 1], 0.2, dt)
    easing.damp(ref.current.material, 'grayscale', on ? 0 : 0.55, 0.25, dt)
    easing.damp(ref.current.material, 'zoom', hover ? 1.15 : 1, 0.25, dt)
  })
  return (
    <DreiImage
      ref={ref}
      url={item.sp.img}
      position={[x, y, z]}
      rotation={[0, Math.PI / 2 - angle, 0]}
      radius={0.08}
      side={THREE.DoubleSide}
      onPointerOver={(e) => (e.stopPropagation(), setHover(true))}
      onPointerOut={() => setHover(false)}
    />
  )
}

function Strand({ strand, color }) {
  const geo = useMemo(() => {
    const pts = []
    for (let t = -1; t <= LEVELS; t += 0.1) pts.push(new THREE.Vector3(...pointOn(t, strand)))
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 600, 0.035, 8, false)
  }, [strand])
  return (
    <mesh geometry={geo}>
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  )
}

function Helix({ progress, onActive }) {
  const group = useRef()
  const activeRef = useRef(-1)
  const tmp = useMemo(() => new THREE.Vector3(), [])
  const refs = useRef([])
  useFrame((state, dt) => {
    const p = progress.current
    const camY = -p * (LEVELS - 1) * DY
    easing.damp(group.current.rotation, 'y', -p * Math.PI * 2.6 + state.clock.elapsedTime * 0.04, 0.35, dt)
    easing.damp(state.camera.position, 'y', camY + 0.4, 0.35, dt)
    easing.damp(state.camera.position, 'x', state.pointer.x * 0.8, 0.5, dt)
    state.camera.lookAt(0, state.camera.position.y - 0.4, 0)
    // Ảnh nào gần camera nhất (z lớn nhất, ngang tầm nhìn) thì là loài đang được giới thiệu
    let best = -1
    let bestZ = -Infinity
    refs.current.forEach((o, i) => {
      if (!o) return
      o.getWorldPosition(tmp)
      if (Math.abs(tmp.y - camY) < DY * 0.9 && tmp.z > bestZ) {
        bestZ = tmp.z
        best = i
      }
    })
    if (best !== activeRef.current) {
      activeRef.current = best
      onActive(best)
    }
  })
  return (
    <group ref={group} position={[2.4, 0, 0]}>
      <Strand strand={0} color="#6ee7b7" />
      <Strand strand={1} color="#5eead4" />
      {Array.from({ length: LEVELS }, (_, k) => (
        <Line key={k} points={[pointOn(k, 0), pointOn(k, 1)]} color="#a7f3d0" lineWidth={1} transparent opacity={0.25} />
      ))}
      {ITEMS.map((it, i) => (
        <group key={i} ref={(o) => (refs.current[i] = o)} position={pointOn(it.k, it.strand)}>
          <mesh>
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshBasicMaterial color="#d1fae5" toneMapped={false} />
          </mesh>
        </group>
      ))}
      {/* Sợi xoắn hiện ngay, ảnh nạp xong mới hiện */}
      <Suspense fallback={null}>
        {ITEMS.map((it, i) => <Card key={'c' + i} item={it} index={i} activeRef={activeRef} />)}
      </Suspense>
    </group>
  )
}

function Loader() {
  const { active, progress } = useProgress()
  return (
    <AnimatePresence>
      {active && (
        <motion.p exit={{ opacity: 0 }} className="fixed right-10 bottom-10 z-30 font-mono text-xs text-white/50">
          Đang nạp ảnh {Math.round(progress)}%
        </motion.p>
      )}
    </AnimatePresence>
  )
}

// Cảnh 3D và thẻ thông tin tách riêng để trang R (tổng hợp) dùng lại
export function HelixCanvas({ progress, onActive }) {
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0.4, 13], fov: 40 }}>
      <color attach="background" args={['#030807']} />
      <fog attach="fog" args={['#030807', 11, 24]} />
      <Helix progress={progress} onActive={onActive} />
      <Sparkles count={260} scale={[16, 30, 10]} position={[0, -7, -2]} size={2.2} speed={0.3} color="#a7f3d0" opacity={0.6} />
      <EffectComposer>
        <Bloom intensity={0.9} luminanceThreshold={0.55} mipmapBlur />
        <Vignette offset={0.25} darkness={0.75} />
      </EffectComposer>
    </Canvas>
  )
}

export function HelixPanel({ item }) {
  const { add } = useCart()
  const product = products.find((x) => x.sp.slug === item.sp.slug && x.stock > 0)
  return (
    <>
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs text-white/45">Bậc {String(item.k + 1).padStart(2, '0')} / {LEVELS}</p>
        <IucnBadge status={item.sp.status} />
      </div>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight">{item.sp.name}</h2>
      <p className="text-white/50 italic">{item.sp.sci}</p>
      <ol className="mt-4 space-y-1 text-xs text-white/55">
        {item.sp.path.map((n, i) => (
          <li key={i} className="flex gap-2" style={{ paddingLeft: i * 10 }}>
            <span className="w-10 text-white/30">{RANKS[i]}</span>
            <span className={i === 5 ? 'text-[#6ee7b7] italic' : ''}>{n.sci}</span>
          </li>
        ))}
      </ol>
      {product ? (
        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
          <div>
            <p className="text-sm text-white/70">{product.name}</p>
            <p className="font-semibold">{vnd(product.price)}</p>
          </div>
          <button onClick={() => add(product)} className="grid size-11 place-items-center rounded-full bg-[#6ee7b7] text-[#03140d]" aria-label="Thêm vào giỏ"><Plus className="size-5" /></button>
        </div>
      ) : (
        <p className="mt-5 border-t border-white/10 pt-4 text-sm text-white/45">Chưa có cửa hàng nào đang bán loài này.</p>
      )}
    </>
  )
}

export default function HelixPage() {
  const progress = useRef(0)
  const [active, setActive] = useState(-1)
  const [p, setP] = useState(0)
  const { count, bump } = useCart()
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight
      progress.current = Math.min(1, Math.max(0, scrollY / max))
      setP(progress.current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const item = active >= 0 ? ITEMS[active] : null
  const showPanel = p > 0.04 && p < 0.97 && item

  return (
    <div className="relative bg-[#030807] text-white">
      <div className="fixed inset-0">
        <HelixCanvas progress={progress} onActive={setActive} />
      </div>

      <Loader />
      <header className="fixed inset-x-0 top-0 z-20 flex items-center justify-between px-10 py-7">
        <span className="flex items-center gap-2 font-semibold"><LogoMark className="size-5 text-[#6ee7b7]" />BioNexus</span>
        <span className="font-mono text-xs tracking-[0.25em] text-white/50 uppercase">Chuỗi xoắn · {String(Math.round(p * 100)).padStart(2, '0')}%</span>
        <span className="rounded-full border border-white/15 bg-black/30 px-4 py-2 text-sm backdrop-blur">Giỏ <motion.b key={bump} initial={{ color: '#6ee7b7' }} animate={{ color: '#fff' }}>{count}</motion.b></span>
      </header>

      <div className="fixed top-1/2 right-8 z-20 h-48 w-px -translate-y-1/2 bg-white/15">
        <div className="w-px bg-[#6ee7b7]" style={{ height: `${p * 100}%` }} />
      </div>

      <AnimatePresence mode="wait">
        {showPanel && (
          <motion.aside
            key={item.sp.slug + item.k}
            initial={{ opacity: 0, x: -24, filter: 'blur(8px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -12, filter: 'blur(8px)' }}
            transition={{ duration: 0.35 }}
            className="fixed bottom-24 left-10 z-20 w-[360px] rounded-3xl border border-white/10 bg-black/45 p-6 backdrop-blur-xl"
          >
            <HelixPanel item={item} />
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="pointer-events-none relative z-10">
        <section className="flex h-screen flex-col justify-center px-10">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="font-mono text-xs tracking-[0.3em] text-[#6ee7b7] uppercase">three.js · React Three Fiber</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.9 }} className="mt-5 max-w-xl text-[84px] leading-[0.95] font-semibold tracking-[-0.05em]">
            Chuỗi xoắn <span className="text-[#6ee7b7]">sự sống</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-6 max-w-md text-lg text-white/55">
            Cuộn xuống để đi dọc chuỗi xoắn. Loài nằm phía trước sẽ hiện màu và thẻ thông tin bên trái.
          </motion.p>
        </section>
        <div className="h-[420vh]" />
        <section className="flex h-screen flex-col items-center justify-center text-center">
          <h2 className="text-[72px] leading-none font-semibold tracking-[-0.05em]">9 loài · 25 bậc phân loại</h2>
          <a href="#/p" className="pointer-events-auto mt-8 rounded-full bg-white px-7 py-3.5 font-semibold text-black">Vào cửa hàng</a>
        </section>
      </main>
    </div>
  )
}
```

## 3. `Mix.jsx`: trang R ghép L + K + P + Q (bố cục, tiến độ cuộn của từng khối, header theo khối)

```jsx
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView } from 'motion/react'
import { ShoppingBag } from 'lucide-react'
import { species } from '@/data'
import { LogoMark, useCart } from '@/components/shared'
import { cn } from '@/lib/utils'
import { GenesisCanvas } from '@/pages/Genesis'
import { ZoomReveal, STEPS, Panel } from '@/pages/Story'
import { Hero as Origins, Climate, Shop } from '@/pages/Globe'
import { HelixCanvas, HelixPanel, ITEMS } from '@/pages/Helix'

// Mẫu R: ghép L (cuộn kể chuyện) + K (địa cầu) + P (xoắn ADN 3D) + Q nâng cấp (hạt biến hình)
const NAV = [
  ['genesis', 'Khởi nguồn'],
  ['species', 'Một loài'],
  ['origins', 'Nguồn gốc'],
  ['helix', 'Chuỗi xoắn'],
  ['process', 'Quy trình'],
  ['shop', 'Cửa hàng'],
]

// Tiến độ cuộn 0 → 1 bên trong một section cao (phần dính sticky chạy hết thì là 1)
function useSectionProgress(ref, cb) {
  const cbRef = useRef(cb)
  cbRef.current = cb
  useEffect(() => {
    const on = () => {
      const r = ref.current.getBoundingClientRect()
      cbRef.current(Math.min(1, Math.max(0, -r.top / (r.height - innerHeight))))
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => {
      window.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
    }
  }, [ref])
}

function Header() {
  const { count, bump } = useCart()
  const [act, setAct] = useState(NAV[0][0])
  useEffect(() => {
    const on = () => {
      let cur = NAV[0][0]
      for (const [id] of NAV) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= innerHeight * 0.45) cur = id
      }
      setAct(cur)
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-8">
        <span className="flex items-center gap-2 font-semibold"><LogoMark className="size-5 text-[#6ee7b7]" />BioNexus</span>
        <nav className="flex gap-0.5 rounded-full border border-white/10 bg-black/40 p-1 text-sm backdrop-blur-xl">
          {NAV.map(([id, label]) => (
            <button key={id} onClick={() => document.getElementById(id).scrollIntoView({ behavior: 'smooth' })} className={cn('relative rounded-full px-4 py-1.5 transition', act === id ? 'text-white' : 'text-white/50 hover:text-white/80')}>
              {act === id && <motion.span layoutId="mix-nav" className="absolute inset-0 rounded-full border border-white/15 bg-white/10" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
              <span className="relative">{label}</span>
            </button>
          ))}
        </nav>
        <span className="relative grid size-10 place-items-center rounded-full border border-white/10 bg-black/40 backdrop-blur-xl">
          <ShoppingBag className="size-4" />
          <motion.span key={bump} initial={{ scale: 0.3 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-[#6ee7b7] text-[10px] font-bold text-[#03140d]">{count}</motion.span>
        </span>
      </div>
    </header>
  )
}

const CHAPTERS = [
  { k: '01 · Trái Đất', t: '9 loài từ khắp các lục địa', d: 'Mexico, Borneo, Tây Phi, Úc, Nam Âu… mỗi loài trong bách khoa đều có vùng bản địa và mức bảo tồn IUCN riêng.' },
  { k: '02 · Di truyền', t: '25 bậc phân loại, 6 cấp', d: 'Giới, Ngành, Lớp, Bộ, Họ, Chi. Cây phân loại giúp tìm loài theo nhánh và gắn đúng sản phẩm với đúng loài.' },
  { k: '03 · Thực vật', t: 'Cả động vật lẫn cây ăn thịt', d: 'Bò sát, lưỡng cư, nắp ấm và cây bắt ruồi; mỗi sản phẩm đều được kiểm duyệt trước khi lên sàn.' },
]

// Mở đầu: hạt biến hình (Q nâng cấp) dính màn hình suốt 5 chương
function Genesis() {
  const ref = useRef(null)
  const progress = useRef(0)
  const [p, setP] = useState(0)
  const near = useInView(ref, { margin: '200px 0px' })
  useSectionProgress(ref, (v) => {
    progress.current = v
    setP(v)
  })
  const ch = Math.round(p * 4)
  return (
    <section ref={ref} id="genesis" className="relative h-[500vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        {near && <GenesisCanvas progress={progress} />}
        <div className="absolute top-1/2 right-8 flex -translate-y-1/2 flex-col gap-2">
          {[0, 1, 2, 3, 4].map((i) => <span key={i} className={cn('w-1 rounded-full transition-all duration-500', i === ch ? 'h-8 bg-[#6ee7b7]' : 'h-3 bg-white/20')} />)}
        </div>
      </div>
      <div className="pointer-events-none relative z-10 -mt-[100vh]">
        <div className="flex h-screen items-center px-14">
          <div className="max-w-xl">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="font-mono text-xs tracking-[0.3em] text-[#6ee7b7] uppercase">Bách khoa sinh học · Sàn sinh vật cảnh</motion.p>
            <motion.h1 initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ delay: 0.4, duration: 1 }} className="mt-5 text-[84px] leading-[0.95] font-semibold tracking-[-0.05em]">
              Mọi loài đều có <span className="bg-gradient-to-r from-[#c4b5fd] via-[#5eead4] to-[#6ee7b7] bg-clip-text text-transparent">quỹ đạo riêng.</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="mt-6 max-w-md text-lg leading-relaxed text-white/55">
              Cuộn xuống để đi từ một thiên hà hạt sáng đến từng loài: chúng sống ở đâu, thuộc nhánh nào, và cửa hàng nào đang nhân giống có giấy phép.
            </motion.p>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="mt-8 text-sm text-white/35">Cuộn để hạt đổi hình · rê chuột để đẩy hạt · bấm chuột để tạo sóng</motion.p>
          </div>
        </div>
        {CHAPTERS.map((c) => (
          <div key={c.k} className="flex h-screen items-center px-14">
            <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ amount: 0.6 }} transition={{ duration: 0.8 }} className="max-w-md">
              <p className="font-mono text-xs tracking-[0.3em] text-[#6ee7b7] uppercase">{c.k}</p>
              <h2 className="mt-4 text-[64px] leading-[0.98] font-semibold tracking-[-0.05em]">{c.t}</h2>
              <p className="mt-5 text-lg leading-relaxed text-white/55">{c.d}</p>
            </motion.div>
          </div>
        ))}
        <div className="flex h-screen items-end justify-center pb-20 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ amount: 0.6 }} transition={{ duration: 0.8 }}>
            <p className="font-mono text-xs tracking-[0.3em] text-[#6ee7b7] uppercase">04 · BioNexus</p>
            <p className="mt-3 text-lg text-white/60">Bách khoa sinh học và sàn sinh vật cảnh có kiểm duyệt</p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// Đi dọc chuỗi xoắn 3D (P) trong một section dính, thẻ thông tin đổi theo loài ở phía trước
function HelixChapter() {
  const ref = useRef(null)
  const progress = useRef(0)
  const [p, setP] = useState(0)
  const [active, setActive] = useState(-1)
  const near = useInView(ref, { margin: '300px 0px' })
  useSectionProgress(ref, (v) => {
    progress.current = v
    setP(v)
  })
  const item = active >= 0 ? ITEMS[active] : null
  return (
    <section ref={ref} id="helix" className="relative h-[460vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        {near && <HelixCanvas progress={progress} onActive={setActive} />}
        <div className="pointer-events-none absolute top-24 left-10">
          <p className="font-mono text-xs tracking-[0.3em] text-[#6ee7b7] uppercase">Chuỗi xoắn · {String(Math.round(p * 100)).padStart(2, '0')}%</p>
          <h2 className="mt-3 text-[56px] leading-[0.95] font-semibold tracking-[-0.05em]">Chuỗi xoắn <span className="text-[#6ee7b7]">sự sống</span></h2>
          <p className="mt-3 max-w-sm text-white/50">Cuộn để đi dọc chuỗi. Loài ở phía trước hiện màu và thẻ thông tin bên dưới.</p>
        </div>
        <AnimatePresence mode="wait">
          {item && p > 0.03 && p < 0.97 && (
            <motion.aside
              key={item.sp.slug + item.k}
              initial={{ opacity: 0, x: -24, filter: 'blur(8px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -12, filter: 'blur(8px)' }}
              transition={{ duration: 0.35 }}
              className="absolute bottom-12 left-10 w-[360px] rounded-3xl border border-white/10 bg-black/45 p-6 backdrop-blur-xl"
            >
              <HelixPanel item={item} />
            </motion.aside>
          )}
        </AnimatePresence>
        <div className="absolute top-1/2 right-8 h-48 w-px -translate-y-1/2 bg-white/15">
          <div className="w-px bg-[#6ee7b7]" style={{ height: `${p * 100}%` }} />
        </div>
      </div>
    </section>
  )
}

function Step({ s, i, setActive }) {
  const ref = useRef(null)
  const inView = useInView(ref, { margin: '-45% 0px -45% 0px' })
  useEffect(() => {
    if (inView) setActive(i)
  }, [inView, i, setActive])
  return (
    <div ref={ref} className="flex min-h-[78vh] flex-col justify-center">
      <p className="font-mono text-sm text-[#6ee7b7]">0{i + 1} — {s.k}</p>
      <h3 className={cn('mt-3 text-[44px] leading-[1.05] font-semibold tracking-[-0.04em] transition-colors duration-500', inView ? 'text-white' : 'text-white/15')}>{s.t}</h3>
      <p className={cn('mt-4 max-w-md text-lg leading-relaxed transition-colors duration-500', inView ? 'text-white/60' : 'text-white/15')}>{s.d}</p>
    </div>
  )
}

// Các bước quy trình (L): chữ bên trái, khung minh hoạ dính bên phải đổi theo bước
function Process() {
  const [active, setActive] = useState(0)
  return (
    <section id="process" className="mx-auto max-w-6xl px-6 py-28">
      <p className="text-center font-mono text-xs tracking-[0.3em] text-[#6ee7b7] uppercase">Quy trình</p>
      <h2 className="mt-4 text-center text-[56px] font-semibold tracking-[-0.045em]">Từ cây phân loại <span className="font-serif font-medium text-[#6ee7b7] italic">đến giỏ hàng</span></h2>
      <div className="mt-10 grid grid-cols-2 gap-16">
        <div>{STEPS.map((s, i) => <Step key={i} s={s} i={i} setActive={setActive} />)}</div>
        <div className="relative">
          <div className="sticky top-[14vh] flex h-[72vh] items-center">
            <div className="relative w-full rounded-[36px] bg-[#e9eee5] p-8 text-[#0f1f17] shadow-[0_40px_120px_-30px_rgba(110,231,183,0.35)]">
              <div className="absolute top-6 right-8 flex gap-1.5">
                {STEPS.map((_, i) => <span key={i} className={cn('h-1.5 rounded-full transition-all duration-500', i === active ? 'w-6 bg-[#16a34a]' : 'w-1.5 bg-black/15')} />)}
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={active} initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -16, filter: 'blur(6px)' }} transition={{ duration: 0.45 }} className="pt-6">
                  <Panel i={active} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Finale() {
  return (
    <section className="px-8 pb-32">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[40px] border border-white/10 bg-[#06150f] px-16 py-20">
        <div className="pointer-events-none absolute -right-20 -bottom-40 size-[520px] rounded-full bg-[#6ee7b7]/25 blur-[120px]" />
        <div className="pointer-events-none absolute -top-40 -left-20 size-[420px] rounded-full bg-[#c4b5fd]/15 blur-[120px]" />
        <div className="relative grid grid-cols-5 gap-3">
          {species.slice(0, 5).map((s, i) => (
            <motion.img key={s.slug} src={s.img} alt={s.full} initial={{ y: 40, opacity: 0 }} whileInView={{ y: i % 2 ? 24 : 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.7 }} className="h-44 w-full rounded-2xl object-cover" style={{ objectPosition: s.pos }} />
          ))}
        </div>
        <h2 className="relative mt-16 text-[64px] leading-none font-semibold tracking-[-0.05em]">9 loài. 7 sản phẩm. <span className="font-serif font-medium text-[#6ee7b7] italic">Một quy trình rõ ràng.</span></h2>
        <button onClick={() => document.getElementById('shop').scrollIntoView({ behavior: 'smooth' })} className="relative mt-8 rounded-full bg-[#6ee7b7] px-7 py-3.5 font-semibold text-[#03140d] transition hover:bg-white">Bắt đầu mua sắm</button>
      </div>
    </section>
  )
}

export default function Mix() {
  return (
    <div className="relative bg-[#030807] text-white">
      <Header />
      <Genesis />
      <div id="species">
        <ZoomReveal dark />
      </div>
      <div id="origins" className="bg-[#030b10]">
        <Origins />
        <Climate />
      </div>
      <HelixChapter />
      <Process />
      <div id="shop">
        <Shop />
      </div>
      <Finale />
      <footer className="px-10 pb-36 text-sm text-white/35">BioNexus · Đồ án Aptech 2026 · Ảnh loài: Wikimedia Commons</footer>
    </div>
  )
}
```

## 4. `Story.jsx`: ZoomReveal, StickySteps, các panel minh hoạ quy trình (mẫu L)

```jsx
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useScroll, useTransform } from 'motion/react'
import { AlertTriangle, BadgeCheck, Check, FileText, Minus, Plus, ShoppingBag } from 'lucide-react'
import { species, products, RANKS, vnd } from '@/data'
import { IucnBadge, LogoMark, useCart } from '@/components/shared'
import { cn } from '@/lib/utils'
import { ContainerScroll } from '@/components/ui/container-scroll-animation'
import { BlurFade } from '@/components/ui/blur-fade'

const INK = '#0f1f17'
const LEAF = '#16a34a'

function Nav() {
  const { count, bump } = useCart()
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a href="#/l" className="flex items-center gap-2 font-semibold text-[#0f1f17]"><LogoMark className="size-5 text-[#16a34a]" />BioNexus</a>
        <nav className="flex gap-1 rounded-full border border-black/[0.06] bg-white/70 p-1 text-sm shadow-sm backdrop-blur-xl">
          {['Câu chuyện', 'Bách khoa', 'Cửa hàng', 'Người bán'].map((l, i) => (
            <a key={l} href="#/l" className={cn('rounded-full px-4 py-1.5 transition', i === 0 ? 'bg-[#0f1f17] text-white' : 'text-black/60 hover:text-black')}>{l}</a>
          ))}
        </nav>
        <span className="relative flex size-10 items-center justify-center rounded-full bg-white shadow-sm">
          <ShoppingBag className="size-4" />
          <motion.span key={bump} initial={{ scale: 0.3 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-[#16a34a] text-[10px] font-bold text-white">{count}</motion.span>
        </span>
      </div>
    </header>
  )
}

function Storefront() {
  return (
    <div className="h-full w-full overflow-hidden rounded-2xl bg-[#f6f7f4] p-5">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-[#0f1f17]">Cửa hàng · 7 sản phẩm đã duyệt</p>
        <div className="flex gap-1.5 text-xs">{['Tất cả', 'Bò sát', 'Lưỡng cư', 'Cây ăn thịt'].map((t, i) => <span key={t} className={cn('rounded-full px-3 py-1', i ? 'bg-white text-black/60' : 'bg-[#0f1f17] text-white')}>{t}</span>)}</div>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-3">
        {products.slice(0, 8).map((p) => (
          <div key={p.id} className="overflow-hidden rounded-xl bg-white">
            <img src={p.sp.img} alt="" className="h-28 w-full object-cover" style={{ objectPosition: p.sp.pos }} />
            <div className="p-2.5">
              <p className="truncate text-[12px] font-medium text-[#0f1f17]">{p.name}</p>
              <p className="text-[12px] font-semibold text-[#16a34a]">{vnd(p.price)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[700px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(134,239,172,0.55),rgba(253,230,138,0.25),transparent)] blur-2xl" />
      <ContainerScroll
        titleComponent={
          <div className="relative -mt-16 pb-16">
            <BlurFade delay={0.1}><p className="text-sm font-semibold text-[#16a34a]">Câu chuyện của một sàn sinh vật cảnh</p></BlurFade>
            <BlurFade delay={0.2}>
              <h1 className="mt-4 text-[80px] leading-[0.98] font-semibold tracking-[-0.05em] text-[#0f1f17]">
                Cuộn xuống<br />để <span className="font-serif text-[92px] font-medium italic text-[#16a34a]">mở cửa hàng</span>
              </h1>
            </BlurFade>
          </div>
        }
      >
        <Storefront />
      </ContainerScroll>
    </section>
  )
}

// Ảnh phóng từ khung nhỏ ra toàn màn hình theo cuộn (kiểu trang sản phẩm Apple)
export function ZoomReveal({ dark = false }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const inset = useTransform(scrollYProgress, [0, 0.55], [28, 0])
  const radius = useTransform(scrollYProgress, [0, 0.55], [40, 0])
  const clip = useTransform([inset, radius], ([i, r]) => `inset(${i}% ${i * 1.25}% ${i}% ${i * 1.25}% round ${r}px)`)
  const scale = useTransform(scrollYProgress, [0, 0.6], [1.25, 1])
  const textY = useTransform(scrollYProgress, [0.45, 0.75], [60, 0])
  const textO = useTransform(scrollYProgress, [0.45, 0.7], [0, 1])
  const introO = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const ax = species[0]
  return (
    <section ref={ref} className="relative h-[280vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.p style={{ opacity: introO }} className={cn('absolute inset-x-0 top-[9%] z-10 text-center text-2xl font-medium tracking-tight', dark ? 'text-white/70' : 'text-[#0f1f17]/70')}>Bắt đầu từ một loài…</motion.p>
        <motion.div className="absolute inset-0" style={{ clipPath: clip }}>
          <motion.img src={ax.img} alt={ax.full} style={{ scale, objectPosition: ax.pos }} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        </motion.div>
        <motion.div style={{ y: textY, opacity: textO }} className="absolute inset-x-0 bottom-[10%] mx-auto max-w-6xl px-6 text-white">
          <IucnBadge status={ax.status} className="bg-black/40! px-3 py-1.5 text-xs backdrop-blur" />
          <h2 className="mt-4 text-[120px] leading-[0.9] font-semibold tracking-[-0.05em]">Axolotl</h2>
          <div className="mt-4 flex items-end justify-between gap-10">
            <p className="max-w-xl text-lg text-white/80">{ax.desc}</p>
            <p className="font-mono text-sm text-white/60">{ax.sci} · {ax.path.map((n) => n.sci).slice(2).join(' › ')}</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export const STEPS = [
  { k: 'Bách khoa', t: 'Nhà sinh học dựng cây phân loại 6 cấp', d: 'Giới, Ngành, Lớp, Bộ, Họ, Chi. Mỗi loài gắn vào đúng một chi, nên tìm theo nhánh nào cũng ra.' },
  { k: 'Hồ sơ loài', t: 'Mỗi loài có hồ sơ riêng', d: 'Tên khoa học, mức IUCN, nhiệt độ, độ ẩm và môi trường sống, đối chiếu với GBIF.' },
  { k: 'Người bán', t: 'Cửa hàng phải được duyệt', d: 'Người bán gửi giấy phép kinh doanh. Quản trị viên duyệt thì cửa hàng mới được đăng bán.' },
  { k: 'Kiểm duyệt', t: 'Sản phẩm chờ duyệt trước khi lên sàn', d: 'Mỗi sản phẩm gắn đúng một loài. Thiếu giấy tờ nguồn gốc thì bị từ chối.' },
  { k: 'Giỏ hàng', t: 'Giỏ hàng tự kiểm tra tồn kho', d: 'Đặt quá số cá thể còn lại thì giỏ báo ngay; sản phẩm hết hàng tự ẩn nút mua.' },
]

export function Panel({ i }) {
  const rajah = species[1]
  // Sản phẩm PENDING thật trong seed_data.sql
  const pending = { name: 'Rồng Úc Hypo Baby (2 tháng tuổi)', shop: 'BioGreen Exotic', sp: species.find((x) => x.slug === 'bearded-dragon') }
  if (i === 0)
    return (
      <div className="space-y-2.5">
        {rajah.path.map((n, j) => (
          <motion.div key={n.sci} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: j * 0.08 }} className="flex items-center gap-3" style={{ paddingLeft: j * 22 }}>
            <span className="w-14 text-right text-[11px] font-semibold tracking-wider text-black/40 uppercase">{RANKS[j]}</span>
            <span className={cn('rounded-xl px-4 py-2.5 text-sm font-medium shadow-sm', j === 5 ? 'bg-[#16a34a] text-white italic' : 'bg-white text-[#0f1f17]')}>{n.sci}</span>
            <span className="text-xs text-black/40">{n.vi}</span>
          </motion.div>
        ))}
      </div>
    )
  if (i === 1)
    return (
      <div className="overflow-hidden rounded-3xl bg-white shadow-xl">
        <img src={rajah.img} alt="" className="h-56 w-full object-cover" />
        <div className="p-6">
          <div className="flex items-center justify-between"><p className="text-xl font-semibold">{rajah.full}</p><IucnBadge status={rajah.status} /></div>
          <p className="text-sm text-black/50 italic">{rajah.sci}</p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
            {[['Nhiệt độ', rajah.temp], ['Độ ẩm', rajah.humid], ['Môi trường', rajah.habitat]].map(([a, b]) => <div key={a} className="rounded-xl bg-[#f3f5f1] p-3"><p className="text-black/45">{a}</p><p className="mt-0.5 font-medium">{b}</p></div>)}
          </div>
        </div>
      </div>
    )
  if (i === 2)
    return (
      <div className="space-y-3">
        {[['BioGreen Exotic', 'ACTIVE'], ['Carnivora Garden', 'ACTIVE'], ['AquaTerra Shop', 'PENDING'], ['Exotic Reptile Hub', 'REJECTED']].map(([n, s], j) => {
          const c = { ACTIVE: LEAF, PENDING: '#d97706', REJECTED: '#dc2626' }[s]
          return (
            <motion.div key={n} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: j * 0.1 }} className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
              <span className="grid size-11 place-items-center rounded-xl bg-[#f3f5f1]"><FileText className="size-5 text-black/50" /></span>
              <div className="flex-1"><p className="font-medium">{n}</p><p className="text-xs text-black/45">Giấy phép kinh doanh (PDF)</p></div>
              <span className="rounded-full px-3 py-1 font-mono text-[11px] font-semibold" style={{ color: c, background: `${c}14` }}>{s}</span>
            </motion.div>
          )
        })}
      </div>
    )
  if (i === 3) return <ModerationDemo p={pending} />
  return <CartDemo />
}

function ModerationDemo({ p }) {
  const [ok, setOk] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setOk(true), 1300)
    return () => clearTimeout(t)
  }, [])
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-xl">
      <img src={p.sp.img} alt="" className="h-60 w-full object-cover" style={{ objectPosition: p.sp.pos }} />
      <div className="p-6">
        <p className="text-sm text-black/45">{p.shop}</p>
        <p className="text-xl font-semibold">{p.name}</p>
        <div className="mt-5 flex items-center gap-3">
          <span className="rounded-full bg-amber-50 px-3 py-1 font-mono text-xs font-semibold text-amber-600">PENDING</span>
          <motion.span className="h-px flex-1 bg-black/10" />
          <AnimatePresence>
            {ok && (
              <motion.span initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 font-mono text-xs font-semibold text-green-600">
                <Check className="size-3.5" /> APPROVED
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <p className="mt-4 flex items-center gap-1.5 text-sm text-black/55"><BadgeCheck className="size-4 text-[#16a34a]" />Đã đối chiếu: {p.sp.sci}</p>
      </div>
    </div>
  )
}

function CartDemo() {
  const p = products.find((x) => x.id === 2)
  const [q, setQ] = useState(2)
  const over = q > p.stock
  return (
    <div className="rounded-3xl bg-white p-6 shadow-xl">
      <p className="font-semibold">Giỏ hàng</p>
      <div className={cn('mt-4 flex items-center gap-4 rounded-2xl border p-3 transition', over ? 'border-amber-300 bg-amber-50' : 'border-black/[0.06]')}>
        <img src={p.sp.img} alt="" className="size-16 rounded-xl object-cover" style={{ transform: 'scaleX(-1)' }} />
        <div className="flex-1">
          <p className="font-medium">{p.name}</p>
          <p className="text-sm text-black/50">{vnd(p.price)}</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-[#f3f5f1] p-1">
          <button onClick={() => setQ((x) => Math.max(1, x - 1))} className="grid size-8 place-items-center rounded-full bg-white"><Minus className="size-3.5" /></button>
          <span className="w-5 text-center font-semibold tabular-nums">{q}</span>
          <button onClick={() => setQ((x) => x + 1)} className="grid size-8 place-items-center rounded-full bg-white"><Plus className="size-3.5" /></button>
        </div>
      </div>
      <AnimatePresence>
        {over && (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3 flex items-center gap-2 text-sm text-amber-700">
            <AlertTriangle className="size-4" /> Kho chỉ còn {p.stock} cá thể
          </motion.p>
        )}
      </AnimatePresence>
      <div className="mt-6 flex items-center justify-between border-t border-black/[0.06] pt-4">
        <span className="text-black/50">Tạm tính</span>
        <span className="text-xl font-semibold tabular-nums">{vnd(p.price * q)}</span>
      </div>
      <p className="mt-2 text-xs text-black/40">Bấm + để thử vượt tồn kho.</p>
    </div>
  )
}

function Step({ s, i, setActive }) {
  const ref = useRef(null)
  const inView = useInView(ref, { margin: '-45% 0px -45% 0px' })
  useEffect(() => {
    if (inView) setActive(i)
  }, [inView, i, setActive])
  return (
    <div ref={ref} className="flex min-h-[78vh] flex-col justify-center">
      <p className="font-mono text-sm text-[#16a34a]">0{i + 1} — {s.k}</p>
      <h3 className={cn('mt-3 text-[44px] leading-[1.05] font-semibold tracking-[-0.04em] transition-colors duration-500', inView ? 'text-[#0f1f17]' : 'text-black/20')}>{s.t}</h3>
      <p className={cn('mt-4 max-w-md text-lg leading-relaxed transition-colors duration-500', inView ? 'text-black/60' : 'text-black/20')}>{s.d}</p>
    </div>
  )
}

function Steps() {
  const [active, setActive] = useState(0)
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <h2 className="text-center text-[56px] font-semibold tracking-[-0.045em] text-[#0f1f17]">Từ cây phân loại <span className="font-serif font-medium italic text-[#16a34a]">đến giỏ hàng</span></h2>
      <div className="mt-10 grid grid-cols-2 gap-16">
        <div>{STEPS.map((s, i) => <Step key={i} s={s} i={i} setActive={setActive} />)}</div>
        <div className="relative">
          <div className="sticky top-[14vh] flex h-[72vh] items-center">
            <div className="relative w-full rounded-[36px] bg-[#e9eee5] p-8">
              <div className="absolute top-6 right-8 flex gap-1.5">
                {STEPS.map((_, i) => <span key={i} className={cn('h-1.5 rounded-full transition-all duration-500', i === active ? 'w-6 bg-[#16a34a]' : 'w-1.5 bg-black/15')} />)}
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={active} initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -16, filter: 'blur(6px)' }} transition={{ duration: 0.45 }} className="pt-6">
                  <Panel i={active} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Finale() {
  return (
    <section className="px-6 pb-32">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[44px] bg-[#0f1f17] px-16 py-20 text-white">
        <div className="pointer-events-none absolute -right-20 -bottom-40 size-[520px] rounded-full bg-[#16a34a]/40 blur-[120px]" />
        <div className="grid grid-cols-5 gap-3">
          {species.slice(0, 5).map((s, i) => (
            <motion.img key={s.slug} src={s.img} alt="" initial={{ y: 40, opacity: 0 }} whileInView={{ y: i % 2 ? 24 : 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.7 }} className="h-44 w-full rounded-2xl object-cover" style={{ objectPosition: s.pos }} />
          ))}
        </div>
        <h2 className="relative mt-16 text-[64px] leading-none font-semibold tracking-[-0.05em]">9 loài. 7 sản phẩm. <span className="font-serif font-medium italic text-[#86efac]">Một quy trình rõ ràng.</span></h2>
        <a href="#/l" className="relative mt-8 inline-flex rounded-full bg-white px-7 py-3.5 font-semibold text-[#0f1f17] transition hover:bg-[#dcfce7]">Bắt đầu mua sắm</a>
      </div>
    </section>
  )
}

export default function Story() {
  return (
    <div className="min-h-screen bg-[#f6f7f4] text-[#0f1f17]">
      <Nav />
      <Hero />
      <ZoomReveal />
      <Steps />
      <Finale />
    </div>
  )
}
```

## 5. `Globe.jsx` (trích phần đầu): công thức xoay quả địa cầu cobe tới một toạ độ (mẫu K)

Bản thật không dùng cobe nữa mà dựng `BioEarth` bằng three.js (tài liệu 05 mục 3). Phần này chỉ để tham khảo cách lấy nét và kéo chuột.

```jsx
import { useEffect, useRef, useState } from 'react'
import createGlobe from 'cobe'
import { AnimatePresence, motion } from 'motion/react'
import { Droplets, MapPin, Plus, ShoppingBag, Thermometer } from 'lucide-react'
import { species, products, origins, IUCN, vnd } from '@/data'
import { IucnBadge, LogoMark, useCart } from '@/components/shared'
import { cn } from '@/lib/utils'
import { BlurFade } from '@/components/ui/blur-fade'
import { InteractiveGridPattern } from '@/components/ui/interactive-grid-pattern'

const TEAL = '#5eead4'
const toAngles = ([lat, lng]) => [Math.PI - ((lng * Math.PI) / 180 - Math.PI / 2), (lat * Math.PI) / 180]

// Quả địa cầu cobe: xoay tới vùng bản địa của loài đang chọn (theo ví dụ "focus" trong tài liệu cobe)
function Earth({ focus }) {
  const canvas = useRef(null)
  const target = useRef(toAngles(focus))
  const drag = useRef(null)
  const offset = useRef(0)
  target.current = toAngles(focus)

  useEffect(() => {
    let phi = target.current[0]
    let theta = target.current[1]
    let width = canvas.current.offsetWidth
    const onResize = () => (width = canvas.current.offsetWidth)
    window.addEventListener('resize', onResize)
    const globe = createGlobe(canvas.current, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi,
      theta,
      dark: 1,
      diffuse: 1.4,
      mapSamples: 22000,
      mapBrightness: 7,
      baseColor: [0.2, 0.32, 0.36],
      markerColor: [0.37, 0.92, 0.83],
      glowColor: [0.16, 0.5, 0.52],
      markers: Object.values(origins).map((o) => ({ location: o.loc, size: 0.05 })),
      onRender: (state) => {
        const [tp, tt] = target.current
        const goal = tp + offset.current
        const d = ((goal - phi + Math.PI * 3) % (Math.PI * 2)) - Math.PI
        phi += d * 0.06
        theta += (tt * 0.8 - theta) * 0.06
        state.phi = phi
        state.theta = theta
        state.width = width * 2
        state.height = width * 2
      },
    })
    setTimeout(() => (canvas.current.style.opacity = '1'))
    return () => {
      globe.destroy()
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvas}
      className="aspect-square w-full cursor-grab opacity-0 transition-opacity duration-1000"
      onPointerDown={(e) => (drag.current = e.clientX - offset.current * 200)}
      onPointerUp={() => (drag.current = null)}
      onPointerOut={() => (drag.current = null)}
      onPointerMove={(e) => drag.current !== null && (offset.current = (e.clientX - drag.current) / 200)}
    />
  )
}

```
