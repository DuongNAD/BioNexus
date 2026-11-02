# Code mẫu S · Hành trình 9 loài

Code prototype đã chạy và được chủ dự án duyệt (React 19 + JSX + Tailwind v4 + motion, không WebGL). Dùng làm **thuật toán và bố cục tham chiếu**, khi port sang `frontend/` phải viết lại bằng TypeScript, lấy dữ liệu qua hook `src/api/` thay cho `@/data`, và theo đặc tả [`../07-hanh-trinh.md`](../07-hanh-trinh.md).

Khác biệt cần nhớ khi port:

- `@/data` trong prototype là dữ liệu chép tay từ seed. Bản thật dùng `useSpeciesList`, `useProducts`, `useMe`, tra loài theo `scientificName`.
- `F(name)` trỏ `./trip/<name>.webp`. Bản thật dùng component ảnh có `srcset` AVIF/WebP.
- Các link `#/s` là chỗ giữ chỗ, thay bằng route thật (bảng ở đặc tả, mục 6).
- Thanh chuyển "Khách / Người mới đăng ký" chỉ có trong bản mẫu; bản thật đưa vào DevPanel.

## `Expedition.jsx`

Trang chính: ghép section, Header, Hud, ChapterRail, chế độ người mới

```jsx
import { useEffect, useRef, useState } from 'react'
import { animate, motion } from 'motion/react'
import { Compass, Droplets, MapPin, Mountain, Ship, Stamp, Thermometer } from 'lucide-react'
import { species } from '@/data'
import { LogoMark } from '@/components/shared'
import { cn } from '@/lib/utils'
import { CSS, Passport, SP, clamp, fmtLL, lerp, localTime, sub } from './expedition/core'
import { CHAPTERS, LEGS } from './expedition/data'
import { Overview, PassportCover } from './expedition/Welcome'
import { Hero, River, ST3, Station1, Station2, Station3 } from './expedition/Rainforest'
import { Axolotl, Venus } from './expedition/Wetlands'
import { BallPython, Dragon, Gecko } from './expedition/Drylands'
import { Hermann } from './expedition/Mediterranean'
import { Flight } from './expedition/Flight'
import { Certificate, PassportBook, Recap } from './expedition/Finale'
import { Kinship } from './expedition/Kinship'

// Mẫu S: Hành trình 9 loài, trang riêng (#/tham-hiem trong bản thật). Hai chế độ:
// khách xem từ trang chủ, và chuyến đi làm quen ngay sau khi đăng ký (#/s?moi, có lời chào + nút bỏ qua).
// Không dùng WebGL: ảnh thật, CSS, SVG và canvas 2D, để máy yếu vẫn mượt.

// Tài khoản test trong seed, chỉ để xem trước chế độ người mới
const NEW_USER = { name: 'Lê Văn C', account: 'levanc' }

// Trạm đang đứng: -1 là phần mở đầu, LEGS.length là phần kết (hộ chiếu, chứng nhận)
function useActiveLeg() {
  const [i, setI] = useState(-1)
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const mid = innerHeight * 0.5
      let cur = -1
      LEGS.forEach((l, k) => {
        const el = document.getElementById(l.id)
        if (el && el.getBoundingClientRect().top <= mid) cur = k
      })
      const end = document.getElementById('ho-chieu')
      if (end && end.getBoundingClientRect().top < mid) cur = LEGS.length
      setI(cur)
    }
    const req = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    addEventListener('scroll', req, { passive: true })
    addEventListener('resize', req)
    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('scroll', req)
      removeEventListener('resize', req)
    }
  }, [])
  return i
}

function Header({ welcome, setWelcome, met }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-3 px-4 md:px-8">
        <a href="#/s" className="flex items-center gap-2.5 font-semibold">
          <LogoMark className="size-5 text-[#6ee7b7]" />
          BioNexus
          <span className="hidden font-normal text-white/60 lg:inline">/ Hành trình 9 loài</span>
        </a>
        <div className="flex items-center gap-2">
          {/* Chỉ có trong bản mẫu: xem trang ở hai chế độ */}
          <div className="glass hidden rounded-full p-1 text-[13px] md:flex" role="group" aria-label="Xem trang như">
            {[
              [false, 'Khách'],
              [true, 'Người mới đăng ký'],
            ].map(([v, t]) => (
              <button key={t} type="button" onClick={() => setWelcome(v)} aria-pressed={welcome === v} className={cn('rounded-full px-3 py-1.5 transition', welcome === v ? 'bg-white/14 text-white' : 'text-white/60 hover:text-white')}>
                {t}
              </button>
            ))}
          </div>
          {welcome && (
            <a href="#/s" className="hidden rounded-full px-3 py-2 text-sm text-white/70 transition hover:text-white sm:block">
              Bỏ qua chuyến đi
            </a>
          )}
          <div className="glass flex items-center gap-3 rounded-full py-2 pr-3.5 pl-4 text-sm" role="status" aria-label={`Hộ chiếu loài: đã gặp ${met.length} trên 9 loài`}>
            <Stamp className="size-4 text-[#6ee7b7]" aria-hidden="true" />
            <span className="flex gap-1" aria-hidden="true">
              {species.map((s, i) => (
                <span key={s.slug} className={cn('size-1.5 rounded-full transition-all duration-700', i < met.length ? 'bg-[#6ee7b7] shadow-[0_0_8px_#6ee7b7]' : 'bg-white/20')} />
              ))}
            </span>
            <motion.span key={met.length} initial={{ scale: 1.6, color: '#6ee7b7' }} animate={{ scale: 1, color: '#e9f2ec' }} transition={{ type: 'spring', stiffness: 300, damping: 14 }} className="font-semibold tabular-nums">
              {met.length}/9
            </motion.span>
          </div>
        </div>
      </div>
    </header>
  )
}

// Bảng thông số chuyến đi: vị trí, giờ địa phương, khí hậu, độ cao của trạm đang đứng
function Hud({ i }) {
  const llRef = useRef(null)
  const altRef = useRef(null)
  const barRef = useRef(null)
  const prev = useRef(LEGS[0].ll)
  const [, setTick] = useState(0)
  const leg = LEGS[Math.min(LEGS.length - 1, Math.max(0, i))]
  const show = i >= 0 && i < LEGS.length && !!LEGS[i]?.hud

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30000)
    let raf = 0
    const update = () => {
      raf = 0
      const doc = document.documentElement
      if (barRef.current) barRef.current.style.transform = `scaleX(${clamp(scrollY / (doc.scrollHeight - innerHeight))})`
      const el = document.getElementById('tram-3')
      if (altRef.current && el) {
        const r = el.getBoundingClientRect()
        const p = clamp(-r.top / (r.height - innerHeight))
        altRef.current.textContent = Math.round(lerp(1500, 2650, sub(p, ...ST3.climb))).toLocaleString('vi-VN') + ' m'
      }
    }
    const req = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    addEventListener('scroll', req, { passive: true })
    return () => {
      clearInterval(id)
      cancelAnimationFrame(raf)
      removeEventListener('scroll', req)
    }
  }, [])

  // Tọa độ chạy dần sang trạm mới như máy định vị đang cập nhật
  useEffect(() => {
    const from = prev.current
    const to = leg.ll
    const c = animate(0, 1, {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (t) => {
        prev.current = [lerp(from[0], to[0], t), lerp(from[1], to[1], t)]
        if (llRef.current) llRef.current.textContent = fmtLL(...prev.current)
      },
    })
    return () => c.stop()
  }, [leg])

  const s = leg.slug && SP[leg.slug]
  const cells = [
    [Thermometer, 'Nhiệt độ', s ? s.temp.split(',')[0].replace(' (nước)', '') : '—'],
    [Droplets, 'Độ ẩm', s ? s.humid : '—'],
    [Mountain, 'Độ cao', leg.alt ? <span ref={altRef}>1.500 m</span> : (leg.altText ?? '—')],
  ]
  return (
    <motion.aside animate={{ opacity: show ? 1 : 0, y: show ? 0 : -12 }} transition={{ duration: 0.5 }} className="pointer-events-none fixed top-[72px] right-3 left-3 z-40 md:right-6 md:left-auto md:w-[300px]" aria-label="Thông số chuyến đi">
      <div className="glass rounded-2xl p-3 md:p-4">
        <div className="flex items-center justify-between text-[11px] tracking-[0.16em] text-white/65 uppercase">
          <span>
            {leg.day} · {leg.stop}
          </span>
          <span className="flex items-center gap-2 font-mono tracking-normal normal-case">
            {localTime(leg.tz)}
            <Compass className="spin size-4 text-[#6ee7b7]" aria-hidden="true" />
          </span>
        </div>
        <motion.p key={leg.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-1.5 flex items-start gap-1.5 text-[15px] leading-snug font-medium">
          <MapPin className="mt-0.5 size-4 shrink-0 text-[#6ee7b7]" aria-hidden="true" />
          {leg.place}
        </motion.p>
        <p ref={llRef} className="mt-1 font-mono text-xs tracking-wide whitespace-pre text-[#9ff0cf] tabular-nums" />
        {leg.note && (
          <p className="mt-3 hidden items-center gap-2 border-t border-white/10 pt-3 text-[13px] text-white/80 md:flex">
            <Ship className="size-3.5 text-[#6ee7b7]" aria-hidden="true" />
            {leg.note}
          </p>
        )}
        <dl className={cn('mt-3 hidden grid-cols-3 gap-2 border-t border-white/10 pt-3', s && 'md:grid')}>
          {cells.map(([Icon, k, v]) => (
            <div key={k}>
              <dt className="flex items-center gap-1 text-[10px] tracking-wider text-white/55 uppercase">
                <Icon className="size-3" aria-hidden="true" />
                {k}
              </dt>
              <motion.dd key={leg.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mt-1 text-[13px] leading-tight font-medium tabular-nums">
                {v}
              </motion.dd>
            </div>
          ))}
        </dl>
        <div className="mt-3 h-0.5 overflow-hidden rounded-full bg-white/10">
          <div ref={barRef} className="h-full origin-left rounded-full bg-[#6ee7b7]" style={{ transform: 'scaleX(0)' }} />
        </div>
      </div>
    </motion.aside>
  )
}

// Thanh chặng bên trái: 4 chặng, mỗi trạm một chấm; bấm để nhảy tới chặng
function ChapterRail({ i }) {
  const cur = LEGS[i]?.id
  const show = i >= 0 && i < LEGS.length
  const curChapter = CHAPTERS.findLast((c) => LEGS.findIndex((l) => l.id === c.first) <= i)?.n
  return (
    <motion.nav animate={{ opacity: show ? 1 : 0, x: show ? 0 : -12 }} className="fixed top-1/2 left-5 z-40 hidden -translate-y-1/2 flex-col gap-4 md:flex" aria-label="Các chặng của hành trình" style={{ pointerEvents: show ? 'auto' : 'none' }}>
      {CHAPTERS.map((c) => {
        const active = c.n === curChapter
        return (
          <button key={c.n} type="button" onClick={() => document.getElementById(c.first)?.scrollIntoView({ behavior: 'smooth' })} className="group flex items-center gap-3 text-left">
            <span className="flex flex-col items-center gap-1.5">
              <span className={cn('font-mono text-[11px] transition', active ? 'text-[#6ee7b7]' : 'text-white/45 group-hover:text-white/80')}>0{c.n}</span>
              {c.stations.map((sid) => (
                <span key={sid} className={cn('size-1.5 rounded-full transition-all', sid === cur ? 'scale-150 bg-[#6ee7b7] shadow-[0_0_8px_#6ee7b7]' : active ? 'bg-white/60' : 'bg-white/25')} />
              ))}
            </span>
            <span className="glass rounded-full px-3 py-1 text-xs whitespace-nowrap opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">{c.title}</span>
          </button>
        )
      })}
    </motion.nav>
  )
}

export default function Expedition() {
  const [met, setMet] = useState([])
  const [welcome, setWelcomeState] = useState(() => location.hash.includes('?moi'))
  const i = useActiveLeg()
  const collect = (slug) => setMet((m) => (m.includes(slug) ? m : [...m, slug]))
  const setWelcome = (v) => {
    setWelcomeState(v)
    history.replaceState(null, '', v ? '#/s?moi' : '#/s')
  }
  const user = welcome ? NEW_USER : null
  return (
    <Passport.Provider value={{ met, collect, user }}>
      <div className="exp min-h-screen">
        <style>{CSS}</style>
        <Header welcome={welcome} setWelcome={setWelcome} met={met} />
        <Hud i={i} />
        <ChapterRail i={i} />
        <main>
          <PassportCover />
          <Overview />
          <Hero />
          <Station1 />
          <River />
          <Station2 />
          <Station3 />
          <Flight id="bay-2" />
          <Venus />
          <Axolotl />
          <Flight id="bay-3" />
          <BallPython />
          <Gecko />
          <Dragon />
          <Flight id="bay-4" />
          <Hermann />
          <Recap />
          <PassportBook />
          <Kinship />
          <Certificate />
        </main>
      </div>
    </Passport.Provider>
  )
}
```

## `expedition/core.jsx`

Dùng chung: useScrub (biến CSS theo cuộn), useStamp, Motes (canvas 2D), Journal, Tip, StampMark, StationTitle, CSS

```jsx
import { createContext, useContext, useEffect, useRef } from 'react'
import { ArrowRight, NotebookPen } from 'lucide-react'
import { species, origins } from '@/data'
import { IucnBadge } from '@/components/shared'
import { cn } from '@/lib/utils'

// Phần dùng chung của trang Hành trình 9 loài: tiến độ cuộn, hạt, sổ tay, con dấu

export const F = (n) => `./trip/${n}.webp`
export const SP = Object.fromEntries(species.map((s) => [s.slug, s]))
export const clamp = (v) => Math.min(1, Math.max(0, v))
export const smooth = (v) => v * v * (3 - 2 * v)
export const lerp = (a, b, t) => a + (b - a) * t
export const sub = (p, a, b) => smooth(clamp((p - a) / (b - a)))

const dms = (v, pos, neg) => {
  const a = Math.abs(v)
  let d = Math.floor(a)
  let m = Math.round((a - d) * 60)
  if (m === 60) {
    d += 1
    m = 0
  }
  return `${d}°${String(m).padStart(2, '0')}′${v >= 0 ? pos : neg}`
}
export const fmtLL = (lat, lon) => `${dms(lat, 'B', 'N')}  ${dms(lon, 'Đ', 'T')}`

// Khoảng cách vòng lớn (km), để số liệu quãng đường là số tính thật chứ không bịa
export function distanceKm([a1, o1], [a2, o2]) {
  const r = Math.PI / 180
  const h = Math.sin(((a2 - a1) * r) / 2) ** 2 + Math.cos(a1 * r) * Math.cos(a2 * r) * Math.sin(((o2 - o1) * r) / 2) ** 2
  return Math.round((2 * 6371 * Math.asin(Math.sqrt(h))) / 10) * 10
}

export const localTime = (tz) => new Intl.DateTimeFormat('vi-VN', { timeZone: tz, hour: '2-digit', minute: '2-digit' }).format(new Date())
export const today = () => new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date())

export const Passport = createContext(null)
export const usePassport = () => useContext(Passport)

// Ghi tiến độ cuộn của một section dính vào biến CSS (--p và các khoảng con đã làm mượt), không render lại React
export function useScrub(ref, ranges, onFrame) {
  const cb = useRef(onFrame)
  useEffect(() => {
    cb.current = onFrame
  })
  useEffect(() => {
    const el = ref.current
    let raf = 0
    const update = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      if (r.bottom < -innerHeight || r.top > innerHeight * 2) return
      const p = clamp(-r.top / (r.height - innerHeight))
      el.style.setProperty('--p', p.toFixed(4))
      for (const k in ranges) el.style.setProperty('--' + k, sub(p, ranges[k][0], ranges[k][1]).toFixed(4))
      cb.current?.(p, el)
    }
    const req = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    addEventListener('scroll', req, { passive: true })
    addEventListener('resize', req)
    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('scroll', req)
      removeEventListener('resize', req)
    }
  }, [ref, ranges])
}

// Đóng dấu hộ chiếu một lần khi qua ngưỡng
export function useStamp(slug, at) {
  const { collect } = usePassport()
  return (p, el) => {
    if (p > at && !el.dataset.stamped) {
      el.dataset.stamped = '1'
      collect(slug)
    }
  }
}

function sprite(rgb, ring) {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  if (ring) {
    gr.addColorStop(0, `rgba(${rgb},0)`)
    gr.addColorStop(0.62, `rgba(${rgb},.12)`)
    gr.addColorStop(0.8, `rgba(${rgb},.75)`)
    gr.addColorStop(0.9, `rgba(${rgb},.15)`)
    gr.addColorStop(1, `rgba(${rgb},0)`)
  } else {
    gr.addColorStop(0, `rgba(${rgb},1)`)
    gr.addColorStop(0.16, `rgba(${rgb},.9)`)
    gr.addColorStop(0.42, `rgba(${rgb},.16)`)
    gr.addColorStop(1, `rgba(${rgb},0)`)
  }
  g.fillStyle = gr
  g.fillRect(0, 0, 64, 64)
  return c
}

const KINDS = {
  pollen: { rgb: '255,234,190', n: 130 },
  firefly: { rgb: '214,255,150', n: 100 },
  bubble: { rgb: '200,245,235', n: 70, ring: true },
  star: { rgb: '235,240,255', n: 160 },
}

// Hạt nền 2D: bụi phấn, đom đóm, bọt nước, sao. Chỉ vẽ khi đang trong khung nhìn
export function Motes({ kind, className, style }) {
  const ref = useRef(null)
  useEffect(() => {
    const cv = ref.current
    const ctx = cv.getContext('2d')
    const K = KINDS[kind]
    const img = sprite(K.rgb, K.ring)
    const ps = Array.from({ length: K.n }, () => ({ x: Math.random(), y: Math.random(), z: 0.25 + Math.random() * 0.75, ph: Math.random() * 6.283, sp: 0.4 + Math.random() * 0.9 }))
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(devicePixelRatio || 1, 2)
    let w = 0, h = 0, raf = 0, mx = 0, my = 0
    const resize = () => {
      w = cv.clientWidth
      h = cv.clientHeight
      cv.width = w * dpr
      cv.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const draw = (t) => {
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'
      for (const p of ps) {
        let x, y, a, s
        if (kind === 'firefly') {
          x = p.x + Math.sin(t * 0.00023 * p.sp + p.ph) * 0.05 + mx * 0.03 * p.z
          y = p.y * 0.85 + 0.15 + Math.cos(t * 0.00017 * p.sp + p.ph * 1.3) * 0.04 + my * 0.03 * p.z
          a = Math.pow(Math.max(0, Math.sin(t * 0.0011 * p.sp + p.ph)), 4)
          s = 12 + 26 * p.z
        } else if (kind === 'bubble') {
          x = p.x + Math.sin(t * 0.0012 * p.sp + p.ph) * 0.008
          y = (((p.y - t * 0.00006 * p.sp * p.z) % 1) + 1) % 1
          a = 0.35 + 0.5 * p.z
          s = 6 + 16 * p.z
        } else if (kind === 'star') {
          x = p.x + mx * 0.01 * p.z
          y = p.y * 0.7 + my * 0.01 * p.z
          a = (0.25 + 0.6 * p.z) * (0.6 + 0.4 * Math.sin(t * 0.0016 * p.sp + p.ph))
          s = 2 + 6 * p.z
        } else {
          x = p.x + Math.sin(t * 0.00031 * p.sp + p.ph) * 0.02 + mx * 0.05 * p.z
          y = (((p.y - t * 0.000014 * p.sp * p.z) % 1) + 1) % 1 + my * 0.03 * p.z
          a = (0.16 + 0.5 * p.z) * (0.65 + 0.35 * Math.sin(t * 0.002 * p.sp + p.ph))
          s = 3 + 10 * p.z
        }
        ctx.globalAlpha = a
        ctx.drawImage(img, x * w - s / 2, y * h - s / 2, s, s)
      }
    }
    const loop = (t) => {
      draw(t)
      raf = requestAnimationFrame(loop)
    }
    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf)
      if (!e.isIntersecting) return
      if (still) draw(4000)
      else raf = requestAnimationFrame(loop)
    })
    const onMove = (e) => {
      mx = e.clientX / innerWidth - 0.5
      my = e.clientY / innerHeight - 0.5
    }
    resize()
    io.observe(cv)
    addEventListener('resize', resize)
    addEventListener('pointermove', onMove, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      removeEventListener('resize', resize)
      removeEventListener('pointermove', onMove)
    }
  }, [kind])
  return <canvas ref={ref} aria-hidden="true" className={cn('pointer-events-none absolute inset-0 size-full', className)} style={style} />
}

export function StationTitle({ leg, title, children, from, fade = 'leave' }) {
  return (
    <div className="absolute inset-x-0 bottom-[10vh] px-4 md:bottom-[12vh] md:px-[7vw]" style={{ opacity: `calc(1 - var(--${fade}))`, transform: `translateY(calc(var(--${fade}) * -50px))` }}>
      <p className="kicker">
        {leg.day} · {leg.stop}
      </p>
      <h2 className="mt-3 font-serif text-[clamp(56px,8.5vw,136px)] leading-[0.88] font-medium tracking-[-0.015em]">{title}</h2>
      <p className="mt-4 font-mono text-sm text-[#9ff0cf]">
        {leg.place} · {fmtLL(...leg.ll)}
        {from && <span className="text-white/60"> · bay từ {from.city}, {distanceKm(from.ll, leg.ll).toLocaleString('vi-VN')} km</span>}
      </p>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/85">{children}</p>
    </div>
  )
}

// Con dấu hộ chiếu (SVG), hiện ra khi section có data-stamped
export function StampMark({ n, where, className }) {
  const id = `ring-${n}`
  return (
    <svg viewBox="0 0 140 140" aria-hidden="true" className={cn('stamp pointer-events-none absolute size-[112px] text-[#6ee7b7] md:size-[132px]', className)}>
      <defs>
        <path id={id} d="M70,70 m-50,0 a50,50 0 1,1 100,0 a50,50 0 1,1 -100,0" />
      </defs>
      <circle cx="70" cy="70" r="66" fill="rgba(4,14,10,.55)" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="70" cy="70" r="60" fill="none" stroke="currentColor" strokeWidth="1" opacity=".7" />
      <circle cx="70" cy="70" r="38" fill="none" stroke="currentColor" strokeWidth="1" opacity=".7" />
      <text fill="currentColor" fontSize="10.5" fontWeight="700" letterSpacing="2.2">
        <textPath href={`#${id}`}>ĐÃ GẶP · TRẠM {n} · {where} ·</textPath>
      </text>
      <text x="70" y="78" textAnchor="middle" fill="currentColor" fontSize="26" fontWeight="700" fontFamily="ui-monospace, monospace">
        {n}
      </text>
    </svg>
  )
}

export function Journal({ s, page, where, photo, tip, className }) {
  const o = origins[s.slug]
  const rows = [
    ['Nhiệt độ', s.temp],
    ['Độ ẩm', s.humid],
    ['Sinh cảnh', s.habitat],
    ['Bản địa', o.place],
  ]
  return (
    <div className="journal-in contents">
      <article className={cn('journal glass absolute z-10 rounded-[26px] p-5 md:p-7', className)}>
        <header className="flex items-center justify-between text-[11px] tracking-[0.16em] text-white/65 uppercase">
          <span className="flex items-center gap-2">
            <NotebookPen className="size-3.5" aria-hidden="true" />
            Sổ tay thực địa
          </span>
          <span className="font-mono">Trang {page}</span>
        </header>
        <h3 className="mt-3 font-serif text-[40px] leading-none font-medium md:mt-4 md:text-[48px]">{s.name}</h3>
        <p className="mt-1 font-serif text-xl text-[#c4f5de] italic">{s.sci}</p>
        <IucnBadge status={s.status} className="mt-3" />
        <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:mt-5">
          {rows.map(([k, v]) => (
            <div key={k} className="bg-[#07140f]/90 p-3 md:p-3.5">
              <dt className="text-[10px] tracking-wider text-white/55 uppercase">{k}</dt>
              <dd className="mt-1 text-[13px] leading-snug text-white/90 md:text-[14px]">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 hidden text-[15px] leading-relaxed text-white/75 md:block">{s.desc}</p>
        {tip && (
          <p className="mt-3 flex items-center gap-2 rounded-xl bg-[#6ee7b7]/10 px-3 py-2 text-[13px] text-[#c4f5de] md:hidden">
            <span className="font-semibold">Trên BioNexus:</span> {tip.t}
          </p>
        )}
        <footer className="mt-4 flex items-center justify-between gap-3 text-[13px] md:mt-5">
          <span className="truncate text-white/55">Ảnh: {photo}</span>
          <a href="#/s" className="inline-flex shrink-0 items-center gap-1.5 font-medium text-[#6ee7b7] hover:underline">
            Hồ sơ loài <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </footer>
        <StampMark n={page} where={where} className="-top-11 right-2 md:-top-14 md:-right-12" />
      </article>
    </div>
  )
}

// Thẻ "Trên BioNexus": mỗi trạm giới thiệu thêm một tính năng của web (chỉ hiện trên màn hình rộng)
export function Tip({ tip, className }) {
  if (!tip) return null
  return (
    <aside className={cn('tip glass absolute z-10 hidden w-[340px] rounded-[22px] p-5 md:block', className)}>
      <p className="kicker text-[#9ff0cf]!">Trên BioNexus · {tip.k}</p>
      <h4 className="mt-2 text-lg font-semibold">{tip.t}</h4>
      <div className="mt-2 text-[14px] leading-relaxed text-white/78">{tip.d}</div>
      <a href="#/s" className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#6ee7b7] hover:underline">
        {tip.cta} <ArrowRight className="size-4" aria-hidden="true" />
      </a>
    </aside>
  )
}

export const Exit = () => <div className="absolute inset-0 z-20 bg-[#040a07]" style={{ opacity: 'var(--exit)' }} />

export const CSS = `
@property --snap { syntax: '<number>'; inherits: true; initial-value: 0; }
.exp { background: #040a07; color: #e9f2ec; }
.exp .kicker { font-size: 12px; letter-spacing: .2em; text-transform: uppercase; color: rgba(233,242,236,.72); }
.exp .glass { background: rgba(6,17,12,.62); -webkit-backdrop-filter: blur(22px) saturate(1.3); backdrop-filter: blur(22px) saturate(1.3); border: 1px solid rgba(255,255,255,.12); box-shadow: 0 30px 80px -24px rgba(0,0,0,.65), inset 0 1px 0 rgba(255,255,255,.07); }
.exp .beam { background: linear-gradient(180deg, rgba(255,238,196,.36), rgba(255,238,196,.1) 45%, transparent 78%); transform: rotate(17deg); filter: blur(8px); animation: exp-beam 7s ease-in-out infinite alternate; }
.exp .spin { transform-box: fill-box; transform-origin: center; animation: exp-spin 40s linear infinite; }
.exp .fog { animation: exp-fog 16s ease-in-out infinite alternate; }
.exp .journal-in > .journal, .exp .tip { opacity: var(--journal); transform: translateX(calc((1 - var(--journal)) * 56px)); }
.exp .tip { transform: translateX(calc((1 - var(--journal)) * -56px)); }
.exp .stamp { opacity: 0; transform: rotate(-2deg) scale(1.9); transition: opacity .2s ease, transform .6s cubic-bezier(.2,1.7,.4,1); }
.exp [data-stamped] .stamp, .exp .stamp[data-on] { opacity: 1; transform: rotate(-14deg) scale(1); }
.exp .visa { opacity: 0; transform: scale(1.8); transition: opacity .15s ease, transform .5s cubic-bezier(.2,1.6,.4,1); }
.exp .visa[data-on] { opacity: .9; transform: scale(1); }
.exp .caustics { background-image: radial-gradient(ellipse 18% 9% at 20% 30%, rgba(190,255,240,.22), transparent 70%), radial-gradient(ellipse 14% 7% at 70% 60%, rgba(190,255,240,.18), transparent 70%), radial-gradient(ellipse 20% 8% at 45% 80%, rgba(190,255,240,.16), transparent 70%), radial-gradient(ellipse 12% 6% at 85% 20%, rgba(190,255,240,.2), transparent 70%); background-size: 60% 60%; animation: exp-caustic 9s ease-in-out infinite alternate; mix-blend-mode: screen; }
.exp .scan { background: repeating-linear-gradient(0deg, rgba(255,255,255,.05) 0 1px, transparent 1px 3px); }
.exp .blink { animation: exp-blink 1.1s steps(2, start) infinite; }
.exp .sway { animation: exp-sway 6s ease-in-out infinite alternate; }
@media (max-width: 767px) { .exp .journal-in > .journal { transform: translateY(calc((1 - var(--journal)) * 56px)); } }
@keyframes exp-beam { from { opacity: .28 } to { opacity: .85 } }
@keyframes exp-spin { to { transform: rotate(360deg) } }
@keyframes exp-fog { from { transform: translateX(-4vw) scale(1) } to { transform: translateX(4vw) scale(1.08) } }
@keyframes exp-caustic { from { background-position: 0 0, 30% 10%, 60% 40% , 10% 70% } to { background-position: 12% 8%, 18% 22%, 48% 30%, 22% 58% } }
@keyframes exp-blink { to { visibility: hidden } }
@keyframes exp-sway { from { transform: translate3d(-.6%, 0, 0) rotate(-.4deg) } to { transform: translate3d(.6%, -.8%, 0) rotate(.4deg) } }
@media (prefers-reduced-motion: reduce) { .exp .beam, .exp .spin, .exp .fog, .exp .caustics, .exp .sway { animation: none } }
`
```

## `expedition/data.jsx`

Lộ trình, chặng, chuyến bay, nội dung thẻ "Trên BioNexus"

```jsx
import { IUCN, origins, products, species, vnd } from '@/data'

// Lộ trình: 4 chặng, 9 trạm (mỗi trạm một loài trong seed). Khí hậu lấy từ environmentSpecs,
// tọa độ trạm loài lấy từ origins; hud=false thì ẩn bảng thông số (đang bay, cảnh mở đầu, cảnh kết).
export const LEGS = [
  { id: 'cua-rung', day: 'Ngày 01', stop: 'Cửa rừng', place: 'Vườn quốc gia Cúc Phương, Ninh Bình', ll: [20.32, 105.6], tz: 'Asia/Ho_Chi_Minh' },
  { id: 'tram-1', day: 'Ngày 01', stop: 'Trạm 01', place: 'Vườn quốc gia Cát Tiên, Đồng Nai', ll: [11.42, 107.43], tz: 'Asia/Ho_Chi_Minh', slug: 'burmese-python', hud: true },
  { id: 'song', day: 'Ngày 02', stop: 'Quá cảnh', place: 'Taman Negara, Malaysia', ll: [4.38, 102.4], tz: 'Asia/Kuala_Lumpur', note: 'Thuyền dài, rồi cầu treo trên tán rừng', hud: true },
  { id: 'tram-2', day: 'Ngày 03', stop: 'Trạm 02', place: 'Rừng thấp Borneo', ll: origins['nepenthes-ampullaria'].loc, tz: 'Asia/Kuching', slug: 'nepenthes-ampullaria', altText: 'Vùng thấp', hud: true },
  { id: 'tram-3', day: 'Ngày 04', stop: 'Trạm 03', place: 'Núi Kinabalu, Sabah', ll: origins['nepenthes-rajah'].loc, tz: 'Asia/Kuching', slug: 'nepenthes-rajah', alt: [1500, 2650], hud: true },
  { id: 'bay-2', day: 'Ngày 05', stop: 'Chuyến bay', place: 'Trên không', ll: [34.2, -77.9], tz: 'America/New_York' },
  { id: 'tram-4', day: 'Ngày 05', stop: 'Trạm 04', place: 'Green Swamp, Bắc Carolina (Mỹ)', ll: origins['venus-flytrap'].loc, tz: 'America/New_York', slug: 'venus-flytrap', hud: true },
  { id: 'tram-5', day: 'Ngày 06', stop: 'Trạm 05', place: 'Kênh Xochimilco, Thành phố Mexico', ll: origins.axolotl.loc, tz: 'America/Mexico_City', slug: 'axolotl', hud: true },
  { id: 'bay-3', day: 'Ngày 07', stop: 'Chuyến bay', place: 'Trên không', ll: origins['ball-python'].loc, tz: 'Africa/Accra' },
  { id: 'tram-6', day: 'Ngày 07', stop: 'Trạm 06', place: 'Savan phía bắc Ghana', ll: origins['ball-python'].loc, tz: 'Africa/Accra', slug: 'ball-python', hud: true },
  { id: 'tram-7', day: 'Ngày 08', stop: 'Trạm 07', place: 'Balochistan, Pakistan', ll: origins['leopard-gecko'].loc, tz: 'Asia/Karachi', slug: 'leopard-gecko', hud: true },
  { id: 'tram-8', day: 'Ngày 09', stop: 'Trạm 08', place: 'Miền trung nước Úc', ll: origins['bearded-dragon'].loc, tz: 'Australia/Darwin', slug: 'bearded-dragon', hud: true },
  { id: 'bay-4', day: 'Ngày 10', stop: 'Chuyến bay', place: 'Trên không', ll: origins['hermann-tortoise'].loc, tz: 'Europe/Rome' },
  { id: 'tram-9', day: 'Ngày 10', stop: 'Trạm 09', place: 'Bụi rậm Nam Âu, Địa Trung Hải', ll: origins['hermann-tortoise'].loc, tz: 'Europe/Rome', slug: 'hermann-tortoise', hud: true },
  { id: 'ket', day: 'Ngày 10', stop: 'Hết hành trình', place: 'Địa Trung Hải', ll: origins['hermann-tortoise'].loc, tz: 'Europe/Rome' },
]
export const LEG = Object.fromEntries(LEGS.map((l) => [l.id, l]))

export const CHAPTERS = [
  { n: 1, title: 'Rừng mưa Đông Nam Á', first: 'cua-rung', stations: ['tram-1', 'tram-2', 'tram-3'] },
  { n: 2, title: 'Đầm lầy và hồ nước', first: 'bay-2', stations: ['tram-4', 'tram-5'] },
  { n: 3, title: 'Đất khô và savan', first: 'bay-3', stations: ['tram-6', 'tram-7', 'tram-8'] },
  { n: 4, title: 'Bụi rậm Địa Trung Hải', first: 'bay-4', stations: ['tram-9'] },
]

// Các điểm vẽ trên bản đồ (theo thứ tự đi), mã sân bay dùng cho thẻ lên máy bay
export const ROUTE = ['cua-rung', 'tram-1', 'song', 'tram-2', 'tram-3', 'tram-4', 'tram-5', 'tram-6', 'tram-7', 'tram-8', 'tram-9'].map((id) => LEG[id])

export const FLIGHTS = {
  'bay-2': { chapter: 2, from: { code: 'BKI', city: 'Kota Kinabalu', ll: [5.94, 116.05] }, to: { code: 'ILM', city: 'Wilmington, Bắc Carolina', ll: [34.27, -77.9] }, tz: 'America/New_York', a: 4, b: 5 },
  'bay-3': { chapter: 3, from: { code: 'MEX', city: 'Thành phố Mexico', ll: [19.43, -99.13] }, to: { code: 'ACC', city: 'Accra, Ghana', ll: [5.6, -0.19] }, tz: 'Africa/Accra', a: 6, b: 7 },
  'bay-4': { chapter: 4, from: { code: 'ASP', city: 'Alice Springs', ll: [-23.7, 133.88] }, to: { code: 'FCO', city: 'Roma, Ý', ll: [41.8, 12.25] }, tz: 'Europe/Rome', a: 9, b: 10 },
}

const Kbd = ({ children }) => <kbd className="rounded-md border border-white/20 bg-white/10 px-1.5 py-0.5 font-mono text-[12px]">{children}</kbd>

const pick = (name) => products.find((p) => p.name === name)

// Mỗi trạm giới thiệu một tính năng của BioNexus (dùng cho chuyến đi làm quen sau khi đăng ký)
export const TIPS = {
  'burmese-python': { k: 'Trạm 01', t: 'Hồ sơ loài', d: 'Mỗi loài có một trang riêng: ảnh lớn, khí hậu nuôi, mức IUCN, vùng bản địa và các cá thể đang bán.', cta: 'Xem hồ sơ Trăn đất' },
  'nepenthes-ampullaria': { k: 'Trạm 02', t: 'Cây phân loại 6 cấp', d: <TaxonPath slug="nepenthes-ampullaria" />, cta: 'Mở cây phân loại' },
  'nepenthes-rajah': { k: 'Trạm 03', t: 'Mức bảo tồn IUCN', d: <IucnScale at="EN" />, cta: 'Lọc bách khoa theo IUCN' },
  'venus-flytrap': { k: 'Trạm 04', t: 'Tìm nhanh', d: (<>Nhấn <Kbd>⌘ K</Kbd> hoặc <Kbd>Ctrl K</Kbd> ở bất kỳ trang nào để tìm loài, bậc phân loại hay sản phẩm. Gõ không dấu cũng được.</>), cta: 'Thử tìm “bat ruoi”' },
  axolotl: { k: 'Trạm 05', t: 'Sàn sinh vật cảnh', d: <ProductLine p={pick('Axolotl Leucistic (5 cm)')} lead="Mỗi sản phẩm gắn đúng một loài trong bách khoa, ví dụ:" />, cta: 'Vào cửa hàng' },
  'ball-python': { k: 'Trạm 06', t: 'Kiểm duyệt trước khi lên sàn', d: <Moderation />, cta: 'Đọc quy định đăng bán' },
  'leopard-gecko': { k: 'Trạm 07', t: 'Giỏ hàng và đặt hàng', d: 'Thêm vào giỏ, kiểm tra lại số lượng rồi đặt hàng. Kho tự trừ khi đặt; hết thì sản phẩm chuyển sang Hết hàng.', cta: 'Xem giỏ hàng' },
  'bearded-dragon': { k: 'Trạm 08', t: 'Mở cửa hàng của bạn', d: 'Muốn bán cá thể nhân giống? Đăng ký người bán, chờ quản trị duyệt hồ sơ, rồi đăng sản phẩm.', cta: 'Đăng ký người bán' },
  'hermann-tortoise': { k: 'Trạm 09', t: 'Đơn hàng và đánh giá', d: 'Theo dõi trạng thái từng đơn trong tài khoản và đánh giá sản phẩm đã mua.', cta: 'Mở tài khoản' },
}

function TaxonPath({ slug }) {
  const s = species.find((x) => x.slug === slug)
  return (
    <span className="flex flex-wrap items-center gap-1">
      {(s?.path ?? []).map((n, i) => (
        <span key={n.sci} className="flex items-center gap-1">
          {i > 0 && <span className="text-white/35">›</span>}
          <span className="rounded-full bg-white/8 px-2 py-0.5 text-[12px] ring-1 ring-white/12">{n.vi}</span>
        </span>
      ))}
    </span>
  )
}

function IucnScale({ at }) {
  const keys = Object.keys(IUCN)
  return (
    <span className="block">
      Lọc bách khoa theo 5 mức. Nắp ấm Rajah đang ở mức {IUCN[at].label} ({at}).
      <span className="mt-3 flex gap-1">
        {keys.map((k) => (
          <span key={k} className="flex-1 text-center">
            <span className={k === at ? 'block h-1.5 rounded-full' : 'block h-1.5 rounded-full opacity-35'} style={{ background: IUCN[k].color, boxShadow: k === at ? `0 0 12px ${IUCN[k].color}` : 'none' }} />
            <span className={k === at ? 'mt-1 block font-mono text-[11px] text-white' : 'mt-1 block font-mono text-[11px] text-white/50'}>{k}</span>
          </span>
        ))}
      </span>
    </span>
  )
}

function ProductLine({ p, lead }) {
  if (!p) return lead
  return (
    <span className="block">
      {lead}
      <span className="mt-3 flex items-center gap-3 rounded-xl bg-white/6 p-2.5 ring-1 ring-white/10">
        <img src="./trip/axolotl2.webp" alt="" className="size-11 rounded-lg object-cover" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium text-white">{p.name}</span>
          <span className="block text-[12px] text-white/60">{p.shop}</span>
        </span>
        <span className="text-[13px] font-semibold text-white tabular-nums">{vnd(p.price)}</span>
      </span>
    </span>
  )
}

function Moderation() {
  const steps = [
    ['Chờ duyệt', 'bg-amber-300/15 text-amber-200 ring-amber-200/30'],
    ['Đã duyệt', 'bg-emerald-300/15 text-emerald-200 ring-emerald-200/30'],
  ]
  return (
    <span className="block">
      Sản phẩm mới nằm ở trạng thái chờ duyệt cho tới khi kiểm duyệt viên chấp nhận; bị từ chối thì người mua không thấy.
      <span className="mt-3 flex items-center gap-2 text-[12px]">
        {steps.map(([t, c], i) => (
          <span key={t} className="flex items-center gap-2">
            {i > 0 && <span className="text-white/40">→</span>}
            <span className={`rounded-full px-2.5 py-1 ring-1 ${c}`}>{t}</span>
          </span>
        ))}
      </span>
    </span>
  )
}
```

## `expedition/WorldMap.jsx`

Bản đồ chấm (d3-geo + land-110m) và cung đường bay

```jsx
import { useMemo } from 'react'
import { geoNaturalEarth1, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'
import land110 from 'world-atlas/land-110m.json'
import { cn } from '@/lib/utils'
import { ROUTE } from './data'

// Bản đồ thế giới dạng chấm (SVG một path) + đường đi giữa các trạm. Đường bay vẽ kiểu cung
// trong mặt phẳng bản đồ (không theo vòng lớn) để không bị cắt ở kinh tuyến 180.

const W = 1000
const proj = geoNaturalEarth1().fitSize([W, W / 1.92], { type: 'Sphere' })
const TOP = proj([0, 80])[1]
const BOTTOM = proj([0, -57])[1]
export const VIEW = `0 ${TOP.toFixed(0)} ${W} ${(BOTTOM - TOP).toFixed(0)}`

let dotsCache = null
function landDots() {
  if (dotsCache) return dotsCache
  const h = Math.ceil(BOTTOM) + 2
  const cv = document.createElement('canvas')
  cv.width = W
  cv.height = h
  const ctx = cv.getContext('2d')
  ctx.fillStyle = '#000'
  ctx.beginPath()
  geoPath(proj, ctx)(feature(land110, land110.objects.land))
  ctx.fill()
  const px = ctx.getImageData(0, 0, W, h).data
  const step = 6.2
  let d = ''
  for (let y = TOP + 2; y < BOTTOM; y += step) {
    // so le từng hàng để lưới chấm trông tự nhiên hơn
    const off = Math.round(y / step) % 2 ? step / 2 : 0
    for (let x = 2 + off; x < W; x += step) {
      if (px[(Math.round(y) * W + Math.round(x)) * 4 + 3] > 128) d += `M${x.toFixed(1)} ${y.toFixed(1)}h0`
    }
  }
  return (dotsCache = d)
}

export const PTS = ROUTE.map((l) => proj([l.ll[1], l.ll[0]]))

// Cung bậc hai giữa hai điểm liên tiếp, phồng lên phía trên
export const ARCS = PTS.slice(1).map((b, i) => {
  const a = PTS[i]
  const mx = (a[0] + b[0]) / 2
  const my = (a[1] + b[1]) / 2
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const len = Math.hypot(dx, dy) || 1
  let nx = -dy / len
  let ny = dx / len
  if (ny > 0) {
    nx = -nx
    ny = -ny
  }
  const k = Math.min(160, len * 0.28)
  const c = [mx + nx * k, my + ny * k]
  return { a, b, c, d: `M${a[0].toFixed(1)} ${a[1].toFixed(1)}Q${c[0].toFixed(1)} ${c[1].toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}` }
})

export function arcPoint(i, t) {
  const { a, b, c } = ARCS[i]
  const u = 1 - t
  const x = u * u * a[0] + 2 * u * t * c[0] + t * t * b[0]
  const y = u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]
  const tx = 2 * u * (c[0] - a[0]) + 2 * t * (b[0] - c[0])
  const ty = 2 * u * (c[1] - a[1]) + 2 * t * (b[1] - c[1])
  return [x, y, (Math.atan2(ty, tx) * 180) / Math.PI]
}

const LABEL = {
  'tram-1': ['Cát Tiên', -8, 16, 'end'],
  'tram-2': ['Borneo', -8, 14, 'end'],
  'tram-3': ['Kinabalu', 8, -8, 'start'],
  'tram-4': ['Bắc Carolina', 8, -8, 'start'],
  'tram-5': ['Xochimilco', -8, 16, 'end'],
  'tram-6': ['Ghana', -8, 16, 'end'],
  'tram-7': ['Balochistan', 8, -8, 'start'],
  'tram-8': ['Trung Úc', 8, 16, 'start'],
  'tram-9': ['Địa Trung Hải', -8, -8, 'end'],
}

// mode 'draw': cả lộ trình vẽ dần theo --draw; mode 'flight': các cung trước `active` đã đi, cung `active` vẽ theo --fly
export function WorldMap({ mode = 'draw', active = -1, met = [], planeRef, className }) {
  const dots = useMemo(landDots, [])
  const N = ARCS.length
  return (
    <svg viewBox={VIEW} className={cn('block h-auto w-full', className)} aria-hidden="true">
      <path d={dots} fill="none" stroke="rgba(214,235,226,.2)" strokeWidth="2.3" strokeLinecap="round" />
      {ARCS.map((arc, i) => {
        const drawn = mode === 'draw' ? `clamp(0, calc(var(--draw) * ${N} - ${i}), 1)` : i < active ? 1 : i === active ? 'var(--fly)' : 0
        return (
          <g key={i}>
            <path d={arc.d} fill="none" stroke="rgba(255,255,255,.16)" strokeWidth="1" strokeDasharray="3 5" />
            <path d={arc.d} pathLength="1" fill="none" stroke="#6ee7b7" strokeWidth="1.8" strokeLinecap="round" style={{ strokeDasharray: 1, strokeDashoffset: `calc(1 - ${drawn})`, filter: 'drop-shadow(0 0 4px #6ee7b799)' }} />
          </g>
        )
      })}
      {ROUTE.map((l, i) => {
        const [x, y] = PTS[i]
        const lab = LABEL[l.id]
        const on = l.slug && met.includes(l.slug)
        const seen = mode === 'draw' ? `clamp(0, calc(var(--draw) * ${N} - ${i - 1}), 1)` : i <= active ? 1 : 0.45
        return (
          <g key={l.id} style={{ opacity: seen }}>
            {on && <circle cx={x} cy={y} r="9" fill="#6ee7b7" opacity=".18" />}
            <circle cx={x} cy={y} r={l.slug ? 3.6 : 2.4} fill={on ? '#6ee7b7' : '#e9f2ec'} stroke="#040a07" strokeWidth="1.2" />
            {lab && (
              <text x={x + lab[1]} y={y + lab[2]} textAnchor={lab[3]} fontSize="12.5" fontWeight="600" fill={on ? '#c4f5de' : 'rgba(233,242,236,.75)'} style={{ paintOrder: 'stroke', stroke: '#040a07', strokeWidth: 3 }}>
                {lab[0]}
              </text>
            )}
          </g>
        )
      })}
      {planeRef && (
        <g ref={planeRef}>
          <circle r="14" fill="#6ee7b7" opacity=".18" />
          <path d="M-9 0 L7 -1.6 Q11 0 7 1.6 Z M-2 -1 L-7 -8 L-4.5 -8 L3 -1 Z M-2 1 L-7 8 L-4.5 8 L3 1 Z M-8 -0.6 L-11 -4 L-9.6 -4 L-6 -0.6 Z M-8 0.6 L-11 4 L-9.6 4 L-6 0.6 Z" fill="#e9fff6" />
        </g>
      )}
    </svg>
  )
}
```

## `expedition/Welcome.jsx`

Hộ chiếu mở bìa (lời chào) và "BioNexus là gì?"

```jsx
import { useRef } from 'react'
import { ArrowDown, ArrowRight, BookOpen, ShieldCheck, Stamp } from 'lucide-react'
import { stats } from '@/data'
import { LogoMark } from '@/components/shared'
import { Motes, distanceKm, today, usePassport, useScrub } from './core'
import { ROUTE } from './data'
import { WorldMap } from './WorldMap'

// Mở đầu: hộ chiếu mở ra (lời chào người vừa đăng ký), rồi "BioNexus là gì" trên bản đồ lộ trình

const COVER = { open: [0.16, 0.5], text: [0, 0.12], exit: [0.86, 1] }

// Dòng mã cuối trang hộ chiếu (trang trí): bỏ dấu, viết hoa, khoảng trắng thành '<'
const mrz = (name) =>
  ('P<BNX<' + name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'D').toUpperCase().replace(/\s+/g, '<<'))
    .padEnd(36, '<')
    .slice(0, 36)

export function PassportCover() {
  const ref = useRef(null)
  const { user, met } = usePassport()
  useScrub(ref, COVER)
  const name = user ? user.name : 'Khách thám hiểm'
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(-2)
    .join('')
  const go = () => document.getElementById('tong-quan')?.scrollIntoView({ behavior: 'smooth' })
  const rows = [
    ['Họ tên', name],
    ['Tên đăng nhập', user ? user.account : 'chưa đăng ký'],
    ['Ngày cấp', today()],
    ['Nơi cấp', 'BioNexus'],
    ['Số trang dấu', `9 · đã có ${met.length}`],
  ]
  return (
    <section id="mo-dau" ref={ref} className="relative h-[220vh]">
      <div className="sticky top-0 grid h-svh overflow-hidden bg-[radial-gradient(ellipse_at_70%_40%,#0e2a20_0%,#040a07_65%)] md:grid-cols-[1fr_1fr]">
        <Motes kind="firefly" style={{ opacity: 0.55 }} />
        <div className="relative z-10 flex flex-col justify-end px-4 pt-24 pb-6 md:justify-center md:px-[7vw] md:pb-0">
          <p className="kicker">{user ? 'Tài khoản đã sẵn sàng' : 'BioNexus · Hành trình 9 loài'}</p>
          <h1 className="mt-4 font-serif text-[clamp(52px,7.4vw,124px)] leading-[0.88] font-medium tracking-[-0.015em] text-balance">
            {user ? (
              <>
                Chào mừng,
                <br />
                <em className="text-[#c4f5de]">{user.name}</em>
              </>
            ) : (
              <>
                Một vòng Trái Đất,
                <br />
                <em className="text-[#c4f5de]">chín loài</em>
              </>
            )}
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/85">
            {user
              ? 'Trước khi bắt đầu, mời bạn đi một vòng làm quen: 4 chặng, 9 trạm. Mỗi trạm là một loài thật trong bách khoa và một tính năng của BioNexus.'
              : '4 chặng, 9 trạm, mỗi trạm một loài thật trong bách khoa BioNexus. Gặp loài nào, hộ chiếu đóng dấu loài đó.'}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button type="button" onClick={go} className="inline-flex items-center gap-2 rounded-full bg-[#6ee7b7] px-6 py-3.5 font-semibold text-[#03140d] transition hover:bg-[#8ff0c8]">
              Bắt đầu hành trình <ArrowDown className="size-4" aria-hidden="true" />
            </button>
            <a href="#/s" className="rounded-full border border-white/20 px-6 py-3.5 font-medium transition hover:bg-white/10">
              {user ? 'Bỏ qua, vào trang chủ' : 'Đăng ký để lưu hộ chiếu'}
            </a>
          </div>
          <p className="mt-5 text-sm text-white/60">{user ? 'Khoảng 6 phút. Dừng lúc nào cũng được, hộ chiếu lưu cùng tài khoản.' : 'Khoảng 6 phút, không cần đăng nhập.'}</p>
        </div>

        {/* Cuốn hộ chiếu: bìa lật sang trái theo cuộn, lộ trang thông tin */}
        <div className="pointer-events-none absolute inset-x-0 top-[76px] flex justify-center md:pointer-events-auto md:relative md:inset-auto md:top-auto md:items-center" style={{ opacity: 'calc(1 - var(--exit))' }}>
          <div className="relative h-[224px] w-[160px] [perspective:2200px] md:h-[520px] md:w-[370px]" style={{ transform: 'translateX(calc(var(--open) * 18%))' }}>
            {/* Trang thông tin */}
            <div className="absolute inset-0 rounded-[10px] bg-[#efe9dc] p-4 text-[#1d2a24] shadow-[0_50px_100px_-30px_rgba(0,0,0,.9)] md:p-7" style={{ backgroundImage: 'repeating-radial-gradient(circle at 80% 20%, rgba(16,94,74,.07) 0 1px, transparent 1px 7px)' }}>
              <p className="flex items-center justify-between text-[9px] font-bold tracking-[0.18em] text-[#10594a] md:text-[11px]">
                <span>HỘ CHIẾU LOÀI</span>
                <span>BIONEXUS</span>
              </p>
              <div className="mt-3 flex gap-3 md:mt-6 md:gap-5">
                <span className="grid size-14 shrink-0 place-items-center rounded-md bg-[#10594a] font-serif text-2xl text-[#efe9dc] md:size-24 md:text-4xl">{initials}</span>
                <dl className="min-w-0 space-y-1 text-[9px] md:space-y-2 md:text-[13px]">
                  {rows.map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-[7px] tracking-wider text-[#1d2a24]/55 uppercase md:text-[10px]">{k}</dt>
                      <dd className="truncate font-semibold">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <p className="absolute inset-x-4 bottom-4 font-mono text-[7px] leading-tight tracking-[0.12em] break-all text-[#1d2a24]/70 md:inset-x-7 md:bottom-7 md:text-[11px]">
                {mrz(name)}
                <br />
                {'BNX<' + today().replace(/\//g, '') + '<<<9<<<<<<<<<<<<<<<<<'}
              </p>
            </div>
            {/* Bìa */}
            <div className="absolute inset-0 origin-left [transform-style:preserve-3d]" style={{ transform: 'rotateY(calc(var(--open) * -168deg))' }}>
              <div className="absolute inset-0 grid place-items-center rounded-[10px] bg-[linear-gradient(145deg,#0f3a2c,#082319)] text-[#d8c591] shadow-[0_50px_100px_-30px_rgba(0,0,0,.9)] [backface-visibility:hidden]" style={{ backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,.06), transparent 50%), linear-gradient(145deg,#0f3a2c,#082319)' }}>
                <div className="flex flex-col items-center text-center">
                  <p className="text-[10px] font-bold tracking-[0.3em] md:text-[13px]">HỘ CHIẾU LOÀI</p>
                  <svg viewBox="0 0 100 100" className="mt-5 size-20 md:mt-8 md:size-36" aria-hidden="true">
                    <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1.4" />
                    <ellipse cx="50" cy="50" rx="20" ry="46" fill="none" stroke="currentColor" strokeWidth="1" />
                    <ellipse cx="50" cy="50" rx="36" ry="46" fill="none" stroke="currentColor" strokeWidth=".8" opacity=".7" />
                    <path d="M6 36h88M4 50h92M6 64h88" stroke="currentColor" strokeWidth=".8" opacity=".7" />
                  </svg>
                  <LogoMark className="mt-5 size-8 md:mt-8 md:size-11" />
                  <p className="mt-2 text-[12px] font-semibold tracking-[0.34em] md:text-[16px]">BIONEXUS</p>
                  <p className="mt-6 text-[8px] tracking-[0.24em] opacity-80 md:mt-10 md:text-[10px]">HÀNH TRÌNH 9 LOÀI</p>
                </div>
              </div>
              <div className="absolute inset-0 rounded-[10px] bg-[#0b2c21] [backface-visibility:hidden]" style={{ transform: 'rotateY(180deg)' }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const OVERVIEW = { draw: [0.05, 0.7], a: [0.08, 0.2], b: [0.22, 0.34], c: [0.36, 0.48], exit: [0.9, 1] }

export function Overview() {
  const ref = useRef(null)
  const { met, user } = usePassport()
  useScrub(ref, OVERVIEW)
  const total = ROUTE.slice(1).reduce((sum, l, i) => sum + distanceKm(ROUTE[i].ll, l.ll), 0)
  const pillars = [
    ['a', BookOpen, 'Bách khoa phân loại', `${stats.species} loài, ${stats.nodes} bậc phân loại sắp theo 6 cấp từ Giới tới Chi, mỗi loài có mức bảo tồn IUCN và vùng bản địa.`],
    ['b', ShieldCheck, 'Sàn sinh vật cảnh có kiểm duyệt', `Người bán phải được duyệt, sản phẩm phải qua kiểm duyệt viên trước khi lên sàn. Hiện có ${stats.products} sản phẩm đang bán, mỗi sản phẩm gắn đúng một loài.`],
    ['c', Stamp, 'Hộ chiếu loài', user ? 'Hộ chiếu lưu cùng tài khoản của bạn. Đi hết 9 trạm để nhận chứng nhận nhà thám hiểm.' : 'Đi hết 9 trạm để đủ dấu. Đăng ký tài khoản để lưu hộ chiếu và nhận chứng nhận.'],
  ]
  return (
    <section id="tong-quan" ref={ref} className="relative h-[260vh]">
      <div className="sticky top-0 flex h-svh flex-col overflow-hidden bg-[radial-gradient(ellipse_at_65%_45%,#0b1f18_0%,#040a07_70%)] md:flex-row md:items-center">
        <div className="relative z-10 shrink-0 px-4 pt-24 md:w-[40%] md:px-0 md:pt-0 md:pr-12 md:pl-[7vw]">
          <p className="kicker">Trước khi lên đường</p>
          <h2 className="mt-3 font-serif text-[clamp(44px,4.6vw,80px)] leading-[0.9] font-medium">BioNexus là gì?</h2>
          <ul className="mt-6 space-y-3 md:mt-8 md:space-y-5">
            {pillars.map(([k, Icon, t, d]) => (
              <li key={k} className="flex gap-4" style={{ opacity: `calc(0.25 + var(--${k}) * 0.75)`, transform: `translateX(calc((1 - var(--${k})) * 24px))` }}>
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#6ee7b7]/12 ring-1 ring-[#6ee7b7]/30">
                  <Icon className="size-5 text-[#6ee7b7]" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-semibold md:text-lg">{t}</span>
                  <span className="mt-1 hidden text-[15px] leading-relaxed text-white/75 md:block">{d}</span>
                </span>
              </li>
            ))}
          </ul>
          <a href="#/s" className="mt-7 hidden items-center gap-1.5 text-sm font-medium text-[#6ee7b7] hover:underline md:inline-flex">
            Đọc thêm về BioNexus <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </div>
        <div className="relative mt-6 flex-1 md:mt-0 md:pr-[4vw]">
          <div className="max-md:w-[150vw] max-md:-translate-x-[18%]">
            <WorldMap mode="draw" met={met} />
          </div>
          <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 px-4 font-mono text-[12px] text-white/70 md:px-0">
            <span>4 chặng · 10 ngày · 9 loài</span>
            <span>Lộ trình ≈ {total.toLocaleString('vi-VN')} km</span>
          </div>
        </div>
        <div className="absolute inset-0 z-20 bg-[#040a07]" style={{ opacity: 'var(--exit)' }} />
      </div>
    </section>
  )
}
```

## `expedition/Rainforest.jsx`

Chặng 1: cửa rừng, ống nhòm, quá cảnh, lấy nét, độ cao + sương

```jsx
import { useRef } from 'react'
import { ArrowDown, Binoculars, Mountain, Ship, Stamp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Exit, F, Journal, Motes, SP, StationTitle, Tip, clamp, fmtLL, lerp, smooth, sub, useScrub, useStamp } from './core'
import { LEG, TIPS } from './data'

// Chặng 1 · Rừng mưa Đông Nam Á: cửa rừng, ống nhòm, quá cảnh, lấy nét, leo núi trong sương

function Beams() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 mix-blend-screen" style={{ transform: 'translateX(calc(var(--walk) * -8vw))' }}>
      {[[14, 8, 0], [31, 4, 1.7], [47, 11, 0.6], [66, 5, 2.6], [78, 9, 1.2]].map(([l, w, d]) => (
        <span key={l} className="beam absolute -top-[25vh] h-[160vh] origin-top" style={{ left: `${l}%`, width: `${w}vw`, animationDelay: `${d}s` }} />
      ))}
    </div>
  )
}

const PLAN = [
  { day: 'Ngày 01', where: 'Cát Tiên, Việt Nam', slug: 'burmese-python', img: 'python' },
  { day: 'Ngày 02', where: 'Sông Tembeling, Taman Negara', note: 'Đi thuyền, qua cầu treo trên tán rừng' },
  { day: 'Ngày 03', where: 'Rừng thấp Borneo', slug: 'nepenthes-ampullaria', img: 'ampullaria' },
  { day: 'Ngày 04', where: 'Núi Kinabalu, 1.500–2.650 m', slug: 'nepenthes-rajah', img: 'rajah' },
]

const HERO = { title: [0.03, 0.26], walk: [0, 0.95], planIn: [0.28, 0.42], planOut: [0.74, 0.86], exit: [0.88, 1] }

export function Hero() {
  const ref = useRef(null)
  useScrub(ref, HERO)
  return (
    <section id="cua-rung" ref={ref} className="relative h-[260vh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <img src={F('trail')} alt="Đường mòn xuyên rừng ở Vườn quốc gia Cúc Phương" className="absolute inset-0 size-full object-cover" style={{ transformOrigin: '46% 52%', transform: 'scale(calc(1.04 + var(--walk) * 0.6))' }} />
        {/* Mép ảnh mờ phóng nhanh hơn nền: cảm giác đang đi xuyên qua lớp lá */}
        <img
          src={F('trail')}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover"
          style={{
            transformOrigin: '46% 52%',
            transform: 'scale(calc(1.1 + var(--walk) * 1.6))',
            filter: 'blur(10px) brightness(.45) saturate(1.2)',
            maskImage: 'radial-gradient(ellipse 58% 52% at 46% 52%, transparent 42%, #000 82%)',
            WebkitMaskImage: 'radial-gradient(ellipse 58% 52% at 46% 52%, transparent 42%, #000 82%)',
          }}
        />
        <Beams />
        <Motes kind="pollen" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,transparent_25%,rgba(3,8,6,.7)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#040a07] via-[#040a07]/55 to-transparent" />

        <div className="absolute inset-x-0 top-[88px] px-4 md:top-[104px] md:px-[7vw]" style={{ opacity: 'calc(1 - var(--title))' }}>
          <p className="font-mono text-xs tracking-wide text-white/75">
            Cửa rừng · Vườn quốc gia Cúc Phương · {fmtLL(...LEG['cua-rung'].ll)}
          </p>
        </div>
        <div className="absolute inset-x-0 bottom-[9vh] px-4 md:px-[7vw]" style={{ opacity: 'calc(1 - var(--title))', transform: 'translateY(calc(var(--title) * -70px))', filter: 'blur(calc(var(--title) * 12px))' }}>
          <p className="kicker">Hành trình 9 loài · Chặng 1 / 4</p>
          <h1 className="mt-4 font-serif text-[clamp(68px,11.5vw,184px)] leading-[0.84] font-medium tracking-[-0.02em]">
            Bước vào
            <br />
            <em className="text-[#c4f5de]">rừng mưa</em>
          </h1>
          <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
            <p className="max-w-md text-lg leading-relaxed text-white/85">Bốn ngày đầu ở Đông Nam Á, ba loài trong bách khoa. Từ thảm lá mục vùng thấp lên tới rừng mây 2.650 m trên núi Kinabalu.</p>
            <span className="flex items-center gap-3 text-sm text-white/75">
              <span className="grid size-11 place-items-center rounded-full border border-white/25">
                <ArrowDown className="size-4 animate-bounce" aria-hidden="true" />
              </span>
              Cuộn để bước vào rừng
            </span>
          </div>
        </div>

        <div
          className="glass absolute inset-x-4 bottom-6 rounded-[28px] p-5 md:inset-x-auto md:top-1/2 md:right-[7vw] md:bottom-auto md:w-[480px] md:-translate-y-1/2 md:p-7"
          style={{ opacity: 'min(var(--planIn), calc(1 - var(--planOut)))', transform: 'translateY(calc((1 - var(--planIn)) * 40px))' }}
        >
          <p className="kicker">Lịch trình · Chặng 1 / 4</p>
          <h2 className="mt-2 font-serif text-[32px] leading-none text-balance md:text-[40px]">Rừng mưa Đông Nam Á</h2>
          <ol className="mt-5 space-y-1">
            {PLAN.map((r) => {
              const s = r.slug && SP[r.slug]
              return (
                <li key={r.day} className="flex items-center gap-4 border-t border-white/10 py-3">
                  <span className="w-16 shrink-0 font-mono text-xs text-[#9ff0cf]">{r.day}</span>
                  {s ? (
                    <img src={F(r.img)} alt="" className="size-10 shrink-0 rounded-full object-cover ring-1 ring-white/20" />
                  ) : (
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/8 ring-1 ring-white/15">
                      <Ship className="size-4 text-white/80" aria-hidden="true" />
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block truncate text-[15px] font-medium">{r.where}</span>
                    <span className="block truncate text-sm text-white/65">{s ? `${s.name} · ${s.sci}` : r.note}</span>
                  </span>
                </li>
              )
            })}
          </ol>
          <p className="mt-3 flex items-center gap-2 border-t border-white/10 pt-4 text-sm text-white/70">
            <Stamp className="size-4 text-[#6ee7b7]" aria-hidden="true" />
            Gặp được loài nào, hộ chiếu đóng dấu loài đó.
          </p>
        </div>
        <Exit />
      </div>
    </section>
  )
}

function LensRing({ className, style }) {
  return (
    <svg viewBox="0 0 200 200" className={cn('absolute inset-0 size-full', className)} style={style}>
      <circle cx="100" cy="100" r="99" fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      <g className="spin">
        {Array.from({ length: 72 }, (_, k) => (
          <line key={k} x1="100" y1={k % 6 ? 4 : 2} x2="100" y2={k % 6 ? 8 : 13} stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" transform={`rotate(${k * 5} 100 100)`} opacity={k % 6 ? 0.5 : 1} />
        ))}
      </g>
      <path d="M100 84v-8M100 116v8M84 100h-8M116 100h8" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

// Trạm 01: dò bằng ống nhòm, khóa mục tiêu rồi mở toàn cảnh
const ST1 = { leave: [0.14, 0.22], appear: [0.17, 0.23], search: [0.2, 0.5], lock: [0.49, 0.56], open: [0.58, 0.74], journal: [0.72, 0.84], exit: [0.94, 1] }
const LENS_IMG = { w: 1920, h: 1280, px: 0.42, py: 0.5, tx: 0.44, ty: 0.56 }

export function Station1() {
  const ref = useRef(null)
  const stamp = useStamp('burmese-python', 0.84)
  useScrub(ref, ST1, (p, el) => {
    const vw = innerWidth
    const vh = innerHeight
    const k = Math.max(vw / LENS_IMG.w, vh / LENS_IMG.h)
    const iw = LENS_IMG.w * k
    const ih = LENS_IMG.h * k
    const tx = (vw - iw) * LENS_IMG.px + LENS_IMG.tx * iw
    const ty = (vh - ih) * LENS_IMG.py + LENS_IMG.ty * ih
    const pts = [[vw * 0.76, vh * 0.3], [vw * 0.22, vh * 0.4], [vw * 0.66, vh * 0.68], [tx, ty]]
    const s = sub(p, ...ST1.search) * 3
    const seg = Math.min(2, Math.floor(s))
    const f = smooth(clamp(s - seg))
    const open = sub(p, ...ST1.open)
    const r0 = Math.min(vw, vh) * (vw < 768 ? 0.27 : 0.2)
    const x = lerp(lerp(pts[seg][0], pts[seg + 1][0], f), vw / 2, open)
    const y = lerp(lerp(pts[seg][1], pts[seg + 1][1], f), vh / 2, open)
    el.style.setProperty('--lx', x.toFixed(1) + 'px')
    el.style.setProperty('--ly', y.toFixed(1) + 'px')
    el.style.setProperty('--lr', lerp(r0 * sub(p, ...ST1.appear), Math.hypot(vw, vh) * 0.6, open).toFixed(1) + 'px')
    stamp(p, el)
  })
  const s = SP['burmese-python']
  return (
    <section id="tram-1" ref={ref} className="relative h-[400vh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <img src={F('roots')} alt="Rễ bạnh của cây cổ thụ ở Vườn quốc gia Cát Tiên" loading="lazy" className="absolute inset-0 size-full object-cover" style={{ transform: 'scale(calc(1.06 + var(--p) * 0.1))' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#040a07] via-[#040a07]/30 to-[#040a07]/40" />
        <div className="absolute inset-0 bg-[#020604]" style={{ opacity: 'calc(var(--appear) * 0.55 * (1 - var(--open)))' }} />

        <StationTitle leg={LEG['tram-1']} title={<>Ven rừng<br />Cát Tiên</>}>
          Rễ bạnh, lá mục, đất ẩm ven sông. Trăn đất sống trong những khu rừng như thế này, nhưng rất khó thấy: vằn nâu trên lưng hoà vào nền lá.
        </StationTitle>

        <img src={F('python')} alt="Trăn đất (Python bivittatus) nằm trên lá" className="absolute inset-0 size-full object-cover" style={{ objectPosition: `${LENS_IMG.px * 100}% ${LENS_IMG.py * 100}%`, clipPath: 'circle(var(--lr) at var(--lx) var(--ly))' }} />
        <div className="absolute inset-0 bg-gradient-to-l from-[#040a07]/80 via-transparent to-transparent" style={{ opacity: 'var(--journal)' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#040a07]/80 via-transparent to-transparent" style={{ opacity: 'var(--journal)' }} />
        <div aria-hidden="true" className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2" style={{ left: 'var(--lx)', top: 'var(--ly)', width: 'calc(var(--lr) * 2)', height: 'calc(var(--lr) * 2)', opacity: 'calc(var(--appear) * (1 - var(--open)))' }}>
          <LensRing className="text-white/80" style={{ opacity: 'calc(1 - var(--lock))' }} />
          <LensRing className="text-[#6ee7b7]" style={{ opacity: 'var(--lock)', transform: 'scale(calc(1.06 - var(--lock) * 0.06))' }} />
        </div>
        <div className="pointer-events-none absolute -translate-x-1/2 text-sm whitespace-nowrap" style={{ left: 'var(--lx)', top: 'calc(var(--ly) + var(--lr) + 16px)', opacity: 'calc(var(--appear) * (1 - var(--open)))' }}>
          <span className="glass flex items-center gap-2 rounded-full px-3.5 py-1.5">
            <Binoculars className="size-4 text-[#6ee7b7]" aria-hidden="true" />
            <span className="grid">
              <span className="[grid-area:1/1]" style={{ opacity: 'calc(1 - var(--lock))' }}>
                Đang dò tìm…
              </span>
              <span className="text-[#9ff0cf] [grid-area:1/1]" style={{ opacity: 'var(--lock)' }}>
                Phát hiện · <em>Python bivittatus</em>
              </span>
            </span>
          </span>
        </div>

        <Journal s={s} page="01" where="CÁT TIÊN" photo="VQG Bardiya, Nepal · Shadow Ayush" tip={TIPS['burmese-python']} className="inset-x-3 bottom-3 md:inset-x-auto md:right-[6vw] md:bottom-[5vh] md:w-[430px]" />
        <Tip tip={TIPS['burmese-python']} className="md:bottom-[6vh] md:left-[6vw]" />
        <Exit />
      </div>
    </section>
  )
}

// Quá cảnh: trượt ngang qua sông Tembeling và cầu treo, vé hành trình chạy theo
const SONG = { pan: [0.12, 0.88], exit: [0.94, 1] }
const TICKET = ['Cát Tiên', 'Taman Negara', 'Borneo']

export function River() {
  const ref = useRef(null)
  useScrub(ref, SONG)
  const panels = [
    { img: 'boat', alt: 'Thuyền dài trên sông Tembeling, Taman Negara', k: 'Ngày 02 · Quá cảnh', t: 'Theo dòng Tembeling', d: 'Thuyền dài đưa đoàn ngược dòng vào Taman Negara, vườn quốc gia rừng mưa ở bán đảo Mã Lai.' },
    { img: 'walkway', alt: 'Cầu treo trên tán rừng ở Taman Negara', k: 'Ngày 02 · Buổi chiều', t: 'Đi trên tán rừng', d: 'Cầu treo nối những thân cây cao, cho nhìn xuống tầng rừng từ phía trên. Sáng mai, đoàn vượt biển sang Borneo.' },
  ]
  return (
    <section id="song" ref={ref} className="relative h-[280vh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="flex h-full w-[200vw]" style={{ transform: 'translateX(calc(var(--pan) * -100vw))' }}>
          {panels.map((x) => (
            <div key={x.img} className="relative h-full w-screen overflow-hidden">
              <img src={F(x.img)} alt={x.alt} loading="lazy" className="absolute top-0 -left-[15%] h-full w-[115%] max-w-none object-cover" style={{ transform: 'translateX(calc(var(--pan) * 13vw))' }} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#040a07] via-[#040a07]/25 to-[#040a07]/30" />
              <div className="absolute inset-x-0 bottom-[22vh] px-4 md:bottom-[24vh] md:px-[7vw]">
                <p className="kicker">{x.k}</p>
                <h2 className="mt-3 font-serif text-[clamp(52px,7.5vw,120px)] leading-[0.9] font-medium">{x.t}</h2>
                <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/85">{x.d}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="glass absolute inset-x-4 bottom-6 rounded-2xl px-5 py-4 md:inset-x-[7vw] md:px-7">
          <div className="flex justify-between text-xs tracking-[0.14em] text-white/70 uppercase">
            {TICKET.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
          <div className="relative mt-3 h-6">
            <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-white/25" />
            <div className="absolute top-1/2 left-0 h-px -translate-y-px bg-[#6ee7b7]" style={{ width: 'calc(var(--p) * 100%)' }} />
            {[0, 50, 100].map((l) => (
              <span key={l} className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#6ee7b7] bg-[#040a07]" style={{ left: `${l}%` }} />
            ))}
            <span className="absolute top-1/2 grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#6ee7b7] text-[#03140d] shadow-[0_0_20px_#6ee7b7aa]" style={{ left: 'calc(var(--p) * 100%)' }}>
              <Ship className="size-3.5" aria-hidden="true" />
            </span>
          </div>
        </div>
        <Exit />
      </div>
    </section>
  )
}

// Trạm 02: cúi nhìn xuống nền rừng, ống kính lấy nét dần vào nắp ấm
const ST2 = { leave: [0.14, 0.22], tilt: [0.16, 0.4], frame: [0.28, 0.4], focus: [0.42, 0.6], journal: [0.6, 0.72], exit: [0.94, 1] }

export function Station2() {
  const ref = useRef(null)
  const stamp = useStamp('nepenthes-ampullaria', 0.72)
  useScrub(ref, ST2, stamp)
  const s = SP['nepenthes-ampullaria']
  return (
    <section id="tram-2" ref={ref} className="relative h-[360vh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <img src={F('swamp')} alt="Rừng ngập nước vùng thấp ở Borneo" loading="lazy" className="absolute inset-0 size-full object-cover" style={{ transformOrigin: '50% 100%', transform: 'translateY(calc(var(--tilt) * -10%)) scale(calc(1.08 + var(--tilt) * 0.22))' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#040a07] via-[#040a07]/25 to-[#040a07]/40" />
        <div className="absolute inset-0 bg-[#020604]" style={{ opacity: 'calc(var(--tilt) * 0.55)' }} />

        <StationTitle leg={LEG['tram-2']} title={<>Nền rừng<br />thấp Borneo</>}>
          Ánh sáng chỉ lọt qua kẽ lá. Ở tầng thấp nhất, nắp ấm Ampullaria mọc thành cụm sát mặt đất, túi bẫy tròn như những chiếc bình nhỏ.
        </StationTitle>

        <div className="absolute inset-x-3 top-[22vh] h-[38vh] overflow-hidden rounded-[28px] ring-1 ring-white/15 md:inset-x-auto md:top-[11vh] md:left-[6vw] md:h-[62vh] md:w-[min(56vw,920px)]" style={{ opacity: 'var(--frame)', transform: 'translateY(calc((1 - var(--frame)) * 70px)) scale(calc(0.96 + var(--frame) * 0.04))' }}>
          <img src={F('ampullaria')} alt="Cụm nắp ấm Ampullaria trên nền lá mục" loading="lazy" className="size-full object-cover" style={{ filter: 'blur(calc((1 - var(--focus)) * 16px)) brightness(calc(0.7 + var(--focus) * 0.3))', transform: 'scale(calc(1.14 - var(--focus) * 0.14))' }} />
          <div aria-hidden="true" className="absolute" style={{ inset: 'calc(10% + var(--focus) * 12%) calc(10% + var(--focus) * 16%)' }}>
            {['top-0 left-0 border-t border-l', 'top-0 right-0 border-t border-r', 'bottom-0 left-0 border-b border-l', 'right-0 bottom-0 border-r border-b'].map((c) => (
              <span key={c} className={cn('absolute size-7 border-white/85', c)} style={{ opacity: 'calc(1 - var(--focus))' }} />
            ))}
            {['top-0 left-0 border-t-2 border-l-2', 'top-0 right-0 border-t-2 border-r-2', 'bottom-0 left-0 border-b-2 border-l-2', 'right-0 bottom-0 border-r-2 border-b-2'].map((c) => (
              <span key={c} className={cn('absolute size-7 border-[#6ee7b7]', c)} style={{ opacity: 'var(--focus)' }} />
            ))}
            <span className="glass absolute -top-11 left-0 grid rounded-full px-3 py-1 text-[13px] whitespace-nowrap">
              <span className="[grid-area:1/1]" style={{ opacity: 'calc(1 - var(--focus))' }}>
                Đang lấy nét…
              </span>
              <span className="text-[#9ff0cf] [grid-area:1/1]" style={{ opacity: 'var(--focus)' }}>
                Đã lấy nét · <em>Nepenthes ampullaria</em>
              </span>
            </span>
          </div>
        </div>

        <Journal s={s} page="02" where="BORNEO" photo="Bernard Dupont" tip={TIPS['nepenthes-ampullaria']} className="inset-x-3 bottom-3 md:inset-x-auto md:right-[5vw] md:bottom-[5vh] md:w-[410px]" />
        <Tip tip={TIPS['nepenthes-ampullaria']} className="md:bottom-[5vh] md:left-[6vw] md:w-[min(56vw,520px)]" />
        <Exit />
      </div>
    </section>
  )
}

// Trạm 03: leo núi (đồng hồ độ cao), vào rừng mây, sương tan để lộ nắp ấm Rajah
export const ST3 = { climb: [0, 0.34], swap: [0.3, 0.42], leave: [0.33, 0.41], fogIn: [0.38, 0.46], clear: [0.5, 0.7], journal: [0.7, 0.8], exit: [0.94, 1] }
const TAPE = { top: 2800, step: 50, px: 18 }

export function Station3() {
  const ref = useRef(null)
  const altRef = useRef(null)
  const stamp = useStamp('nepenthes-rajah', 0.8)
  useScrub(ref, ST3, (p, el) => {
    const a = lerp(1500, 2650, sub(p, ...ST3.climb))
    if (altRef.current) altRef.current.textContent = Math.round(a).toLocaleString('vi-VN')
    el.style.setProperty('--tape', (((TAPE.top - a) / TAPE.step) * TAPE.px).toFixed(1) + 'px')
    stamp(p, el)
  })
  const s = SP['nepenthes-rajah']
  const leg = LEG['tram-3']
  const ticks = Array.from({ length: (TAPE.top - 1400) / TAPE.step + 1 }, (_, k) => TAPE.top - k * TAPE.step)
  return (
    <section id="tram-3" ref={ref} className="relative h-[440vh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <img src={F('summit')} alt="Mây hình thành trên rừng mưa dưới chân núi Kinabalu" loading="lazy" className="absolute inset-0 size-full object-cover" style={{ opacity: 'calc(1 - var(--swap))', transformOrigin: '50% 30%', transform: 'scale(calc(1.18 - var(--climb) * 0.16)) translateY(calc(var(--climb) * 3%))' }} />
        <img src={F('ferns')} alt="Dương xỉ thân gỗ trong rừng mây trên núi cao" loading="lazy" className="absolute inset-0 size-full object-cover" style={{ opacity: 'var(--swap)', transform: 'scale(calc(1.1 + var(--clear) * 0.06))' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#040a07]/85 via-[#040a07]/30 to-transparent" style={{ opacity: 'calc(1 - var(--leave))' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#040a07] via-transparent to-[#040a07]/40" />

        <div className="absolute inset-x-0 top-[22vh] px-4 md:top-[20vh] md:px-[7vw]" style={{ opacity: 'calc(1 - var(--leave))', transform: 'translateY(calc(var(--leave) * -50px))' }}>
          <p className="kicker">
            {leg.day} · {leg.stop} · Leo núi
          </p>
          <p className="mt-6 text-xs tracking-[0.2em] text-white/65 uppercase">Độ cao</p>
          <p className="mt-1 flex items-baseline gap-3 font-light tabular-nums">
            <span ref={altRef} className="text-[clamp(88px,13vw,208px)] leading-[0.85] tracking-[-0.04em]">
              1.500
            </span>
            <span className="text-3xl text-white/70 md:text-4xl">m</span>
          </p>
          <h2 className="mt-6 font-serif text-[clamp(40px,5vw,72px)] leading-none font-medium">Lên rừng mây Kinabalu</h2>
          <p className="mt-3 font-mono text-sm text-[#9ff0cf]">
            {leg.place} · {fmtLL(...leg.ll)}
          </p>
          <p className="mt-4 max-w-lg text-lg leading-relaxed text-white/85">Càng lên cao càng lạnh và ẩm. Ban ngày 18–26°C, ban đêm chỉ còn 10–15°C, độ ẩm 80–95%.</p>
        </div>
        <div aria-hidden="true" className="absolute top-0 right-6 hidden h-full w-28 md:block lg:right-[7vw]" style={{ opacity: 'calc(1 - var(--leave))' }}>
          <div className="absolute top-1/2 right-0 left-0 z-10 flex -translate-y-1/2 items-center gap-2">
            <span className="h-px flex-1 bg-[#6ee7b7]" />
            <span className="size-2 rotate-45 bg-[#6ee7b7]" />
          </div>
          <div className="absolute inset-x-0 top-1/2" style={{ transform: 'translateY(calc(var(--tape) * -1))' }}>
            {ticks.map((t) => (
              <div key={t} className="flex h-[18px] items-center justify-end gap-2 font-mono text-[11px] text-white/70">
                {t % 250 === 0 && <span>{t.toLocaleString('vi-VN')}</span>}
                <span className={cn('h-px bg-white/60', t % 250 === 0 ? 'w-6' : 'w-3 opacity-60')} />
              </div>
            ))}
          </div>
        </div>

        <div className="absolute inset-x-[14vw] top-[22vh] h-[38vh] overflow-hidden rounded-[28px] ring-1 ring-white/15 md:inset-x-auto md:top-[9vh] md:left-[8vw] md:h-[82vh] md:w-[min(34vw,560px)]" style={{ opacity: 'var(--fogIn)' }}>
          <img src={F('rajah')} alt="Nắp ấm Rajah khổng lồ trong môi trường sống" loading="lazy" className="size-full object-cover" style={{ transform: 'scale(calc(1.12 - var(--clear) * 0.12))' }} />
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ opacity: 'calc(var(--fogIn) * (1 - var(--clear)))' }}>
          <div className="absolute inset-0 bg-[#9fb5ac]/35" />
          {[
            [-10, 10, 70, 60, -1],
            [30, -5, 80, 70, 1],
            [-20, 45, 75, 70, -1],
            [35, 40, 80, 75, 1],
            [5, 20, 70, 60, 1],
          ].map(([l, t, w, h, dir], k) => (
            <div key={k} className="absolute" style={{ left: `${l}vw`, top: `${t}vh`, width: `${w}vw`, height: `${h}vh`, transform: `translateX(calc(var(--clear) * ${dir * 45}vw))` }}>
              <div className="fog size-full rounded-full bg-[radial-gradient(closest-side,rgba(214,228,221,.85),rgba(214,228,221,0))]" style={{ animationDelay: `${-k * 3}s` }} />
            </div>
          ))}
          <p className="glass absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full px-5 py-2.5 text-sm whitespace-nowrap" style={{ opacity: 'calc(1 - var(--clear) * 2)' }}>
            <Mountain className="size-4 text-[#6ee7b7]" aria-hidden="true" />
            Sương mù 2.650 m · chờ sương tan
          </p>
        </div>

        <Journal s={s} page="03" where="KINABALU" photo="NepGrower · Phạm vi công cộng" tip={TIPS['nepenthes-rajah']} className="inset-x-3 bottom-3 md:inset-x-auto md:right-[6vw] md:bottom-[5vh] md:w-[430px]" />
        <Tip tip={TIPS['nepenthes-rajah']} className="md:top-[12vh] md:left-[calc(8vw+min(34vw,560px)+24px)] md:w-[300px]" />
        <Exit />
      </div>
    </section>
  )
}
```

## `expedition/Flight.jsx`

Chuyển chặng: máy bay trên bản đồ, thẻ lên máy bay

```jsx
import { useRef } from 'react'
import { Plane } from 'lucide-react'
import { Exit, SP, distanceKm, localTime, sub, usePassport, useScrub } from './core'
import { CHAPTERS, FLIGHTS, LEG } from './data'
import { WorldMap, arcPoint } from './WorldMap'

// Chuyển chặng: bản đồ thế giới, máy bay bay theo cung, thẻ lên máy bay; cuối cảnh là tiêu đề chặng mới

const FLY = { pass: [0.04, 0.2], fly: [0.18, 0.66], land: [0.66, 0.78], exit: [0.92, 1] }

function Barcode() {
  // Mã vạch trang trí: độ rộng vạch cố định theo một dãy, không mang dữ liệu
  const bars = [2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 1, 1, 3, 2, 1, 2, 1, 3, 1, 1, 2, 3, 1, 2, 1]
  let x = 0
  return (
    <svg viewBox="0 0 120 40" className="h-10 w-32 text-white/80" aria-hidden="true">
      {bars.map((w, i) => {
        const r = i % 2 === 0 && <rect key={i} x={x} y="0" width={w} height="40" fill="currentColor" />
        x += w + 1
        return r
      })}
    </svg>
  )
}

export function Flight({ id }) {
  const ref = useRef(null)
  const planeRef = useRef(null)
  const { met, user } = usePassport()
  const f = FLIGHTS[id]
  const ch = CHAPTERS.find((c) => c.n === f.chapter)
  useScrub(ref, FLY, (p) => {
    const t = sub(p, ...FLY.fly)
    const [x, y, ang] = arcPoint(f.a, t)
    planeRef.current?.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ang.toFixed(1)})`)
  })
  const km = distanceKm(f.from.ll, f.to.ll)
  return (
    <section id={id} ref={ref} className="relative h-[260vh]">
      <div className="sticky top-0 h-svh overflow-hidden bg-[radial-gradient(ellipse_at_50%_40%,#0b1f18_0%,#040a07_70%)]">
        <div className="absolute inset-x-0 top-[12vh] mx-auto w-[min(1180px,140vw)] max-md:-translate-x-[20%] md:top-[9vh] md:w-[min(1180px,92vw)]" style={{ transform: 'scale(calc(1 + var(--land) * 0.04))', opacity: 'calc(1 - var(--land) * 0.55)' }}>
          <WorldMap mode="flight" active={f.a} met={met} planeRef={planeRef} />
        </div>

        <div className="absolute inset-x-0 top-[80px] px-4 md:top-[96px] md:px-[7vw]" style={{ opacity: 'calc(1 - var(--land))' }}>
          <p className="kicker">
            {LEG[id].day} · Chuyển sang chặng {f.chapter} / 4
          </p>
        </div>

        {/* Thẻ lên máy bay */}
        <div className="glass absolute inset-x-3 bottom-4 flex overflow-hidden rounded-[22px] md:inset-x-auto md:bottom-[7vh] md:left-[7vw] md:w-[640px]" style={{ opacity: 'calc(var(--pass) * (1 - var(--land)))', transform: 'translateY(calc((1 - var(--pass)) * 60px))' }}>
          <div className="flex-1 p-5 md:p-6">
            <div className="flex items-center justify-between text-[11px] tracking-[0.16em] text-white/60 uppercase">
              <span>Thẻ lên máy bay · BioNexus</span>
              <span className="font-mono">Chặng {f.chapter}</span>
            </div>
            <div className="mt-4 flex items-end justify-between gap-3">
              <div>
                <p className="font-mono text-[44px] leading-none font-semibold tracking-tight md:text-[56px]">{f.from.code}</p>
                <p className="mt-1 text-sm text-white/70">{f.from.city}</p>
              </div>
              <div className="mb-6 flex flex-1 items-center gap-2 text-[#6ee7b7]">
                <span className="h-px flex-1 border-t border-dashed border-[#6ee7b7]/60" />
                <Plane className="size-5" aria-hidden="true" />
                <span className="h-px flex-1 border-t border-dashed border-[#6ee7b7]/60" />
              </div>
              <div className="text-right">
                <p className="font-mono text-[44px] leading-none font-semibold tracking-tight text-[#c4f5de] md:text-[56px]">{f.to.code}</p>
                <p className="mt-1 text-sm text-white/70">{f.to.city}</p>
              </div>
            </div>
            <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-white/10 pt-4 text-[13px]">
              <div>
                <dt className="text-[10px] tracking-wider text-white/50 uppercase">Hành khách</dt>
                <dd className="mt-1 truncate font-medium">{user ? user.name : 'Khách thám hiểm'}</dd>
              </div>
              <div>
                <dt className="text-[10px] tracking-wider text-white/50 uppercase">Quãng đường</dt>
                <dd className="mt-1 font-medium tabular-nums">≈ {km.toLocaleString('vi-VN')} km</dd>
              </div>
              <div>
                <dt className="text-[10px] tracking-wider text-white/50 uppercase">Giờ nơi đến</dt>
                <dd className="mt-1 font-medium tabular-nums">{localTime(f.tz)}</dd>
              </div>
            </dl>
          </div>
          <div className="hidden w-[150px] flex-col items-center justify-between border-l border-dashed border-white/20 p-5 md:flex">
            <p className="text-center text-[11px] tracking-[0.14em] text-white/55 uppercase">Điểm đến</p>
            <p className="text-center font-serif text-xl leading-tight">{ch.title}</p>
            <Barcode />
          </div>
        </div>

        {/* Hạ cánh: tiêu đề chặng mới */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-4 text-center" style={{ opacity: 'var(--land)', transform: 'translateY(calc((1 - var(--land)) * 40px))' }}>
          <p className="kicker">Chặng {f.chapter} / 4</p>
          <h2 className="mx-auto mt-4 font-serif text-[clamp(56px,9vw,148px)] leading-[0.88] font-medium text-balance">{ch.title}</h2>
          <p className="mx-auto mt-6 flex flex-wrap justify-center gap-2">
            {ch.stations.map((sid) => {
              const s = SP[LEG[sid].slug]
              return (
                <span key={sid} className="glass rounded-full px-4 py-2 text-sm">
                  {LEG[sid].stop} · {s.name}
                </span>
              )
            })}
          </p>
        </div>
        <Exit />
      </div>
    </section>
  )
}
```

## `expedition/Wetlands.jsx`

Chặng 2: hàm bẫy (Venus), lặn xuống kênh (axolotl)

```jsx
import { useRef, useState } from 'react'
import { Hand, Waves } from 'lucide-react'
import { Exit, F, Journal, Motes, SP, StationTitle, Tip, useScrub, useStamp } from './core'
import { LEG, TIPS } from './data'

// Chặng 2 · Đầm lầy và hồ nước: bẫy sập (bắt ruồi Venus), lặn xuống kênh (axolotl)

// Mép răng của lá bẫy: đường răng cưa dọc mép dưới (hàm trên) hoặc mép trên (hàm dưới)
const teeth = (top) => {
  const n = 18
  const pts = []
  for (let i = 0; i <= n; i++) {
    const x = (i / n) * 100
    pts.push(`${x.toFixed(2)}% ${top ? (i % 2 ? 100 : 86) : i % 2 ? 0 : 14}%`)
  }
  return top ? `polygon(0 0, 100% 0, ${pts.reverse().join(', ')})` : `polygon(${pts.join(', ')}, 100% 100%, 0 100%)`
}

const ST4 = { leave: [0.12, 0.2], frame: [0.18, 0.3], jaws: [0.3, 0.5], journal: [0.6, 0.72], exit: [0.94, 1] }

export function Venus() {
  const ref = useRef(null)
  const [touch, setTouch] = useState(0)
  const [snap, setSnap] = useState(false)
  const stamp = useStamp('venus-flytrap', 0.72)
  useScrub(ref, ST4, stamp)
  const s = SP['venus-flytrap']
  // Bẫy cần hai lần chạm vào lông cảm ứng mới khép
  const poke = () => {
    if (snap) return
    if (touch === 0) return setTouch(1)
    setTouch(2)
    setSnap(true)
    setTimeout(() => {
      setSnap(false)
      setTouch(0)
    }, 1900)
  }
  const jaw = 'absolute inset-x-[-2%] h-[54%] bg-[linear-gradient(180deg,#123826,#0a2418)]'
  return (
    <section id="tram-4" ref={ref} className="relative h-[340vh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <img src={F('carolina')} alt="Rừng thông lá dài thưa trên đồng bằng ven biển" loading="lazy" className="absolute inset-0 size-full object-cover" style={{ transform: 'scale(calc(1.06 + var(--p) * 0.08))' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#040a07] via-[#040a07]/30 to-[#040a07]/35" />
        <div className="absolute inset-0 bg-[#020604]" style={{ opacity: 'calc(var(--frame) * 0.5)' }} />

        <StationTitle leg={LEG['tram-4']} from={{ city: 'Kota Kinabalu', ll: [5.94, 116.05] }} title={<>Đầm lầy ven biển<br />Carolina</>}>
          Đất cát nghèo dinh dưỡng, nắng nhiều, rừng thông thưa. Cây bắt ruồi Venus bù phần thiếu bằng cách bắt côn trùng.
        </StationTitle>

        <div
          className="absolute inset-x-3 top-[22vh] h-[38vh] overflow-hidden rounded-[28px] ring-1 ring-white/15 md:inset-x-auto md:top-[11vh] md:left-[6vw] md:h-[62vh] md:w-[min(50vw,820px)]"
          style={{ opacity: 'var(--frame)', transform: 'translateY(calc((1 - var(--frame)) * 70px))', '--snap': snap ? 1 : 0, transition: snap ? '--snap .16s cubic-bezier(.6,0,1,1)' : '--snap .9s cubic-bezier(.2,.8,.2,1)' }}
        >
          <img src={F('venus2')} alt="Cụm cây bắt ruồi Venus mọc hoang ở Green Swamp" loading="lazy" className="size-full object-cover" />
          <div aria-hidden="true" className={`${jaw} top-0`} style={{ clipPath: teeth(true), transform: 'translateY(calc(var(--jaws) * (1 - var(--snap)) * -104%))' }}>
            <div className="absolute inset-x-0 bottom-0 h-[16%] bg-[linear-gradient(0deg,rgba(214,70,70,.55),transparent)]" />
          </div>
          <div aria-hidden="true" className={`${jaw} bottom-0`} style={{ clipPath: teeth(false), transform: 'translateY(calc(var(--jaws) * (1 - var(--snap)) * 104%))' }}>
            <div className="absolute inset-x-0 top-0 h-[16%] bg-[linear-gradient(180deg,rgba(214,70,70,.55),transparent)]" />
          </div>
          <button type="button" onClick={poke} className="glass absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full px-4 py-2 text-sm whitespace-nowrap transition hover:bg-white/10" style={{ opacity: 'var(--jaws)' }}>
            <Hand className="size-4 text-[#6ee7b7]" aria-hidden="true" />
            {snap ? 'Bẫy đã khép' : `Chạm lông cảm ứng · ${touch}/2`}
          </button>
        </div>

        <Journal s={s} page="04" where="CAROLINA" photo="Green Swamp · Judy Gallagher" tip={TIPS['venus-flytrap']} className="inset-x-3 bottom-3 md:inset-x-auto md:right-[5vw] md:bottom-[5vh] md:w-[410px]" />
        <Tip tip={TIPS['venus-flytrap']} className="md:bottom-[5vh] md:left-[6vw] md:w-[min(50vw,460px)]" />
        <Exit />
      </div>
    </section>
  )
}

const ST5 = { leave: [0.12, 0.2], dive: [0.2, 0.46], deep: [0.42, 0.56], journal: [0.62, 0.74], exit: [0.94, 1] }

export function Axolotl() {
  const ref = useRef(null)
  const stamp = useStamp('axolotl', 0.74)
  useScrub(ref, ST5, stamp)
  const s = SP.axolotl
  return (
    <section id="tram-5" ref={ref} className="relative h-[360vh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <img src={F('xochi')} alt="Thuyền trajinera trên kênh Xochimilco" loading="lazy" className="absolute inset-0 size-full object-cover" style={{ transformOrigin: '50% 90%', transform: 'scale(calc(1.05 + var(--dive) * 0.35))' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#040a07] via-[#040a07]/25 to-[#040a07]/35" />

        <StationTitle leg={LEG['tram-5']} from={{ city: 'Wilmington', ll: [34.27, -77.9] }} title={<>Kênh<br />Xochimilco</>}>
          Thuyền trajinera sặc sỡ chở khách dọc các kênh giữa những luống chinampa. Dưới mặt nước là nhà của axolotl, loài kỳ giông đặc hữu của nơi này.
        </StationTitle>

        {/* Lớp dưới nước: lộ dần từ đáy lên như mặt nước đang dâng qua ống kính */}
        <div className="absolute inset-0 overflow-hidden" style={{ clipPath: 'inset(calc((1 - var(--dive)) * 100%) 0 0 0)' }}>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#0f4a42_0%,#07261f_45%,#03110d_100%)]" />
          <div className="caustics absolute inset-0 opacity-80" />
          <div className="absolute inset-x-[18%] -top-[10%] h-[70%] bg-[radial-gradient(ellipse_at_50%_0%,rgba(190,255,235,.28),transparent_65%)]" />
          <div className="absolute inset-x-3 top-[22vh] h-[38vh] overflow-hidden rounded-[32px] md:inset-x-auto md:top-[10vh] md:left-[7vw] md:h-[70vh] md:w-[min(52vw,860px)]" style={{ opacity: 'var(--deep)', transform: 'scale(calc(0.94 + var(--deep) * 0.06))' }}>
            <img src={F('axolotl')} alt="Axolotl kiểu hoang dã màu xám xanh" loading="lazy" className="sway size-full object-cover" style={{ filter: 'saturate(.9) hue-rotate(-8deg)' }} />
            <div className="caustics absolute inset-0 opacity-60" />
            <div className="absolute inset-0 bg-[#0d4a40]/25 mix-blend-multiply" />
          </div>
          <Motes kind="bubble" />
          <p className="glass absolute top-[13vh] right-4 flex items-center gap-2 rounded-full px-4 py-2 text-sm md:top-[12vh] md:right-[6vw]" style={{ opacity: 'calc(var(--deep) * (1 - var(--journal)))' }}>
            <Waves className="size-4 text-[#6ee7b7]" aria-hidden="true" />
            Dưới mặt nước · {s.temp}
          </p>
        </div>
        <div aria-hidden="true" className="absolute inset-x-0 h-[3px] bg-[linear-gradient(90deg,transparent,rgba(210,255,240,.9),transparent)] shadow-[0_0_24px_rgba(190,255,235,.8)]" style={{ top: 'calc((1 - var(--dive)) * 100%)', opacity: 'calc(var(--dive) * (1 - var(--deep)))' }} />

        <Journal s={s} page="05" where="XOCHIMILCO" photo="Fernando Losada Rodríguez" tip={TIPS.axolotl} className="inset-x-3 bottom-3 md:inset-x-auto md:right-[5vw] md:bottom-[5vh] md:w-[410px]" />
        <Tip tip={TIPS.axolotl} className="md:bottom-[5vh] md:left-[7vw] md:w-[400px]" />
        <Exit />
      </div>
    </section>
  )
}
```

## `expedition/Drylands.jsx`

Chặng 3: bẫy ảnh, đèn pin, nắng gắt

```jsx
import { useEffect, useRef } from 'react'
import { Flashlight, Sun } from 'lucide-react'
import { Exit, F, Journal, Motes, SP, StationTitle, Tip, clamp, lerp, localTime, smooth, sub, today, useScrub, useStamp } from './core'
import { LEG, TIPS } from './data'

// Chặng 3 · Đất khô và savan: bẫy ảnh (trăn bóng), đèn pin ban đêm (thằn lằn da báo), nắng gắt (rồng Úc)

const ST6 = { leave: [0.12, 0.2], arm: [0.18, 0.28], ir: [0.26, 0.4], color: [0.52, 0.58], journal: [0.62, 0.74], exit: [0.94, 1] }

export function BallPython() {
  const ref = useRef(null)
  const stamp = useStamp('ball-python', 0.74)
  useScrub(ref, ST6, (p, el) => {
    el.style.setProperty('--flash', Math.sin(Math.PI * clamp((p - 0.47) / 0.07)).toFixed(3))
    stamp(p, el)
  })
  const s = SP['ball-python']
  const corner = 'absolute size-10 border-white/85 md:size-14'
  return (
    <section id="tram-6" ref={ref} className="relative h-[340vh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <img src={F('ghana')} alt="Voi giữa savan xanh mùa mưa ở phía bắc Ghana" loading="lazy" className="absolute inset-0 size-full object-cover" style={{ transform: 'scale(calc(1.05 + var(--p) * 0.08))' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#040a07] via-[#040a07]/25 to-[#040a07]/35" />

        <StationTitle leg={LEG['tram-6']} from={{ city: 'Thành phố Mexico', ll: [19.43, -99.13] }} title={<>Savan<br />phía bắc Ghana</>}>
          Trăn bóng cỡ nhỏ và hiền, khi sợ hãi cuộn tròn như quả bóng. Để không làm nó giật mình, đoàn đặt bẫy ảnh qua đêm ở rìa savan.
        </StationTitle>

        {/* Ảnh từ bẫy ảnh: hồng ngoại đen trắng, chớp đèn, rồi sang màu */}
        <img
          src={F('ballpython')}
          alt="Trăn bóng (Python regius) cuộn trên vỏ cây"
          loading="lazy"
          className="absolute inset-0 size-full object-cover"
          style={{ objectPosition: '62% 50%', opacity: 'var(--ir)', filter: 'grayscale(calc(1 - var(--color))) contrast(calc(1.35 - var(--color) * 0.35)) brightness(calc(0.78 + var(--color) * 0.22))' }}
        />
        <div className="scan absolute inset-0" style={{ opacity: 'calc(var(--ir) * (1 - var(--color)))' }} />
        <div className="absolute inset-0 bg-gradient-to-l from-[#040a07]/80 via-transparent to-transparent" style={{ opacity: 'var(--journal)' }} />
        <div className="absolute inset-0 bg-white" style={{ opacity: 'var(--flash)' }} />

        <div aria-hidden="true" className="pointer-events-none absolute inset-x-4 top-[180px] bottom-6 font-mono text-[12px] tracking-wider text-white/90 uppercase md:inset-x-[4vw] md:top-[96px] md:bottom-[5vh] md:text-[13px]" style={{ opacity: 'calc(var(--arm) * (1 - var(--journal)))' }}>
          <span className={`${corner} top-0 left-0 border-t-2 border-l-2`} />
          <span className={`${corner} top-0 right-0 border-t-2 border-r-2`} />
          <span className={`${corner} bottom-0 left-0 border-b-2 border-l-2`} />
          <span className={`${corner} right-0 bottom-0 border-r-2 border-b-2`} />
          <span className="absolute top-4 left-5 flex items-center gap-2 md:top-5 md:left-7">
            <span className="blink size-2.5 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444]" />
            Ghi hình · Bẫy ảnh · Trạm 06
          </span>
          <span className="absolute bottom-4 left-5 tabular-nums md:bottom-5 md:left-7">
            {today()} · {localTime('Africa/Accra')}
          </span>
          <span className="absolute right-5 bottom-4 grid text-right md:right-7 md:bottom-5">
            <span className="[grid-area:1/1]" style={{ opacity: 'calc(1 - var(--color))' }}>
              Hồng ngoại
            </span>
            <span className="text-[#9ff0cf] [grid-area:1/1]" style={{ opacity: 'var(--color)' }}>
              Màu · <span className="normal-case">Python regius</span>
            </span>
          </span>
          <span className="absolute top-1/2 left-1/2 size-8 -translate-x-1/2 -translate-y-1/2">
            <span className="absolute top-1/2 left-0 h-px w-full bg-white/70" />
            <span className="absolute top-0 left-1/2 h-full w-px bg-white/70" />
          </span>
        </div>

        <Journal s={s} page="06" where="GHANA" photo="Brian Gratwicke" tip={TIPS['ball-python']} className="inset-x-3 bottom-3 md:inset-x-auto md:right-[5vw] md:bottom-[5vh] md:w-[410px]" />
        <Tip tip={TIPS['ball-python']} className="md:bottom-[5vh] md:left-[6vw] md:w-[400px]" />
        <Exit />
      </div>
    </section>
  )
}

const ST7 = { leave: [0.12, 0.2], night: [0.14, 0.3], torch: [0.26, 0.34], full: [0.62, 0.7], journal: [0.68, 0.78], exit: [0.94, 1] }
const TORCH = { w: 1920, h: 1080, tx: 0.84, ty: 0.3, span: [0.32, 0.62] }

export function Gecko() {
  const ref = useRef(null)
  const stickyRef = useRef(null)
  const ptr = useRef({ x: 0, y: 0, t: -1e9 })
  const pRef = useRef(0)
  const stamp = useStamp('leopard-gecko', 0.78)

  // Đèn pin theo chuột nếu vừa di chuột, ngược lại tự quét theo đường soạn sẵn và dừng ở đầu thằn lằn
  const place = () => {
    const el = ref.current
    if (!el) return
    const p = pRef.current
    const vw = innerWidth
    const vh = innerHeight
    const k = Math.max(vw / TORCH.w, vh / TORCH.h)
    const iw = TORCH.w * k
    const ih = TORCH.h * k
    const gx = (vw - iw) / 2 + TORCH.tx * iw
    const gy = (vh - ih) / 2 + TORCH.ty * ih
    const pts = [[vw * 0.2, vh * 0.72], [vw * 0.72, vh * 0.66], [vw * 0.3, vh * 0.36], [gx, gy]]
    const s = clamp((p - TORCH.span[0]) / (TORCH.span[1] - TORCH.span[0])) * 3
    const seg = Math.min(2, Math.floor(s))
    const f = smooth(clamp(s - seg))
    let x = lerp(pts[seg][0], pts[seg + 1][0], f)
    let y = lerp(pts[seg][1], pts[seg + 1][1], f)
    if (performance.now() - ptr.current.t < 2200 && p < TORCH.span[1]) {
      x = ptr.current.x
      y = ptr.current.y
    }
    const full = sub(p, ...ST7.full)
    el.style.setProperty('--tx', x.toFixed(1) + 'px')
    el.style.setProperty('--ty', y.toFixed(1) + 'px')
    el.style.setProperty('--tr', lerp(Math.min(vw, vh) * 0.25, Math.hypot(vw, vh), full).toFixed(1) + 'px')
  }

  useScrub(ref, ST7, (p, el) => {
    pRef.current = p
    place()
    stamp(p, el)
  })

  useEffect(() => {
    const el = stickyRef.current
    const onMove = (e) => {
      if (e.pointerType !== 'mouse') return
      ptr.current = { x: e.clientX, y: e.clientY, t: performance.now() }
      place()
    }
    el.addEventListener('pointermove', onMove, { passive: true })
    return () => el.removeEventListener('pointermove', onMove)
  })

  const s = SP['leopard-gecko']
  return (
    <section id="tram-7" ref={ref} className="relative h-[360vh]">
      <div ref={stickyRef} className="sticky top-0 h-svh overflow-hidden">
        <img src={F('baloch')} alt="Hoàng hôn trên núi ở Turbat, Balochistan" loading="lazy" className="absolute inset-0 size-full object-cover" style={{ transform: 'scale(calc(1.04 + var(--p) * 0.06))' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#040a07] via-[#040a07]/20 to-transparent" />
        <div className="absolute inset-0 bg-[#03060a]" style={{ opacity: 'calc(var(--night) * 0.9)' }} />
        <Motes kind="star" style={{ opacity: 'var(--night)' }} />

        <StationTitle leg={LEG['tram-7']} from={{ city: 'Accra', ll: [5.6, -0.19] }} title={<>Đêm ở<br />Balochistan</>}>
          Ban ngày bán hoang mạc nóng và khô. Thằn lằn da báo đợi trời tối mới ra ngoài, nên muốn gặp phải đi với đèn pin.
        </StationTitle>

        <img src={F('gecko')} alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 size-full object-cover" style={{ opacity: 'calc(var(--torch) * 0.9)', filter: 'brightness(.09) saturate(.5)' }} />
        <img
          src={F('gecko')}
          alt="Thằn lằn da báo (Eublepharis macularius) trên cát"
          loading="lazy"
          className="absolute inset-0 size-full object-cover"
          style={{
            opacity: 'var(--torch)',
            filter: 'sepia(.18) saturate(1.1) brightness(1.05)',
            // Mép đèn pin mềm như vệt sáng thật
            maskImage: 'radial-gradient(circle var(--tr) at var(--tx) var(--ty), #000 62%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(circle var(--tr) at var(--tx) var(--ty), #000 62%, transparent 100%)',
          }}
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 mix-blend-screen" style={{ opacity: 'calc(var(--torch) * (1 - var(--full)))', background: 'radial-gradient(circle calc(var(--tr) * 1.4) at var(--tx) var(--ty), rgba(255,226,170,.28), transparent 70%)' }} />
        <div className="absolute inset-0 bg-gradient-to-l from-[#040a07]/80 via-transparent to-transparent" style={{ opacity: 'var(--journal)' }} />
        <p className="glass absolute bottom-[8vh] left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full px-4 py-2 text-sm whitespace-nowrap" style={{ opacity: 'calc(var(--torch) * (1 - var(--full)))' }}>
          <Flashlight className="size-4 text-[#ffe2aa]" aria-hidden="true" />
          <span className="hidden md:inline">Di chuột để soi đèn pin</span>
          <span className="md:hidden">Cuộn để soi đèn pin</span>
        </p>

        <Journal s={s} page="07" where="BALOCHISTAN" photo="George Chernilevsky" tip={TIPS['leopard-gecko']} className="inset-x-3 bottom-3 md:inset-x-auto md:right-[5vw] md:bottom-[5vh] md:w-[410px]" />
        <Tip tip={TIPS['leopard-gecko']} className="md:bottom-[5vh] md:left-[6vw] md:w-[400px]" />
        <Exit />
      </div>
    </section>
  )
}

const ST8 = { leave: [0.3, 0.38], heat: [0.04, 0.32], frame: [0.36, 0.48], journal: [0.58, 0.7], exit: [0.94, 1] }

export function Dragon() {
  const ref = useRef(null)
  const tRef = useRef(null)
  const stamp = useStamp('bearded-dragon', 0.7)
  useScrub(ref, ST8, (p, el) => {
    const h = sub(p, ...ST8.heat)
    if (tRef.current) tRef.current.textContent = Math.round(lerp(26, 42, h))
    stamp(p, el)
  })
  const s = SP['bearded-dragon']
  return (
    <section id="tram-8" ref={ref} className="relative h-[340vh]">
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <filter id="haze">
          <feTurbulence type="fractalNoise" baseFrequency="0.006 0.09" numOctaves="2" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale="7">
            <animate attributeName="scale" values="3;9;3" dur="2.6s" repeatCount="indefinite" />
          </feDisplacementMap>
        </filter>
      </svg>
      <div className="sticky top-0 h-svh overflow-hidden">
        <img src={F('uluru')} alt="Uluru và cây chết trên đất đỏ miền trung nước Úc" loading="lazy" className="absolute inset-0 size-full object-cover" style={{ transform: 'scale(calc(1.04 + var(--p) * 0.06))' }} />
        {/* Hơi nóng bốc lên ở dải đất sát mặt đất */}
        <img src={F('uluru')} alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 size-full object-cover" style={{ transform: 'scale(calc(1.04 + var(--p) * 0.06))', filter: 'url(#haze)', clipPath: 'inset(62% 0 0 0)', opacity: 'var(--heat)' }} />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 mix-blend-screen" style={{ opacity: 'var(--heat)', background: 'radial-gradient(circle at 82% 6%, rgba(255,240,200,.75), rgba(255,190,110,.25) 18%, transparent 46%)' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0603]/80 via-[#0b0603]/20 to-transparent" style={{ opacity: 'calc(1 - var(--leave))' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#040a07] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[#060402]" style={{ opacity: 'calc(var(--frame) * 0.55)' }} />

        <div className="absolute inset-x-0 top-[22vh] px-4 md:top-[30vh] md:right-[7vw] md:left-auto md:w-[440px] md:px-0" style={{ opacity: 'calc(1 - var(--leave))', transform: 'translateY(calc(var(--leave) * -50px))' }}>
          <p className="mt-6 flex items-center gap-2 text-xs tracking-[0.2em] text-white/70 uppercase">
            <Sun className="size-4 text-[#ffcf8a]" aria-hidden="true" />
            Nhiệt độ
          </p>
          <p className="mt-1 flex items-baseline gap-2 font-light tabular-nums">
            <span ref={tRef} className="text-[clamp(80px,10.5vw,168px)] leading-[0.85] tracking-[-0.04em]">
              26
            </span>
            <span className="text-3xl text-white/70 md:text-4xl">°C</span>
          </p>
          <div className="mt-5 w-[min(420px,80vw)]">
            <div className="relative h-2 rounded-full bg-[linear-gradient(90deg,#4ade80_0%,#facc15_45%,#fb923c_75%,#ef4444_100%)]">
              <span className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#040a07] shadow-[0_0_14px_#fff]" style={{ left: 'calc(var(--heat) * 100%)' }} />
            </div>
            <div className="mt-2 flex justify-between font-mono text-[11px] text-white/70">
              <span>Khi nuôi {s.temp}</span>
              <span>Điểm sưởi 38–42°C</span>
            </div>
          </div>
        </div>

        <StationTitle leg={LEG['tram-8']} from={{ city: 'Quetta', ll: [30.18, 66.98] }} title={<>Đất đỏ<br />miền trung Úc</>}>
          Rồng Úc hoạt động ban ngày, phơi nắng trên đá và cát đỏ để giữ ấm, ăn tạp cả côn trùng lẫn rau xanh.
        </StationTitle>

        <div className="absolute inset-x-3 top-[22vh] h-[38vh] overflow-hidden rounded-[28px] ring-1 ring-white/15 md:inset-x-auto md:top-[11vh] md:left-[6vw] md:h-[62vh] md:w-[min(54vw,880px)]" style={{ opacity: 'var(--frame)', transform: 'translateY(calc((1 - var(--frame)) * 70px)) scale(calc(0.96 + var(--frame) * 0.04))' }}>
          <img src={F('dragon')} alt="Rồng Úc (Pogona vitticeps) phơi nắng trên cát" loading="lazy" className="size-full object-cover" style={{ objectPosition: '30% 50%' }} />
          <div className="absolute inset-0 mix-blend-screen" style={{ background: 'radial-gradient(circle at 90% 0%, rgba(255,214,150,.35), transparent 55%)' }} />
        </div>

        <Journal s={s} page="08" where="TRUNG ÚC" photo="George Chernilevsky" tip={TIPS['bearded-dragon']} className="inset-x-3 bottom-3 md:inset-x-auto md:right-[5vw] md:bottom-[5vh] md:w-[410px]" />
        <Tip tip={TIPS['bearded-dragon']} className="md:bottom-[5vh] md:left-[6vw] md:w-[420px]" />
        <Exit />
      </div>
    </section>
  )
}
```

## `expedition/Mediterranean.jsx`

Chặng 4: bưu thiếp lật mặt

```jsx
import { useRef } from 'react'
import { Exit, F, Journal, SP, StationTitle, Tip, today, usePassport, useScrub, useStamp } from './core'
import { LEG, TIPS } from './data'

// Chặng 4 · Bụi rậm Địa Trung Hải: bưu thiếp lật mặt (rùa Hermann)

const ST9 = { leave: [0.12, 0.2], card: [0.18, 0.32], flip: [0.38, 0.56], journal: [0.62, 0.74], exit: [0.94, 1] }

function PostageStamp({ className }) {
  // Răng cưa tem thư: lớp đặc phủ phần ảnh, lớp chấm tròn đục lỗ ở phần viền (padding)
  const mask = 'linear-gradient(#000 0 0) content-box, radial-gradient(circle at 4px 4px, transparent 2.4px, #000 2.8px) -4px -4px / 8px 8px padding-box'
  return (
    <span className={`block bg-[#f7f2e8] p-[5px] ${className}`} style={{ WebkitMask: mask, mask }}>
      <img src={F('calanque')} alt="" className="block h-full w-full object-cover" />
    </span>
  )
}

export function Hermann() {
  const ref = useRef(null)
  const { user } = usePassport()
  const stamp = useStamp('hermann-tortoise', 0.74)
  useScrub(ref, ST9, stamp)
  const s = SP['hermann-tortoise']
  const face = 'absolute inset-0 overflow-hidden rounded-[6px] [backface-visibility:hidden] shadow-[0_40px_90px_-30px_rgba(0,0,0,.8)]'
  return (
    <section id="tram-9" ref={ref} className="relative h-[340vh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <img src={F('maquis')} alt="Đồi cây bụi maquis ven Địa Trung Hải" loading="lazy" className="absolute inset-0 size-full object-cover" style={{ transform: 'scale(calc(1.05 + var(--p) * 0.08))' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#040a07] via-[#040a07]/25 to-[#040a07]/35" />
        <div className="absolute inset-0 bg-[#020604]" style={{ opacity: 'calc(var(--card) * 0.5)' }} />

        <StationTitle leg={LEG['tram-9']} from={{ city: 'Alice Springs', ll: [-23.7, 133.88] }} title={<>Bụi rậm<br />Địa Trung Hải</>}>
          Trạm cuối. Cây bụi thơm, đá vôi và nắng hanh, nơi rùa Hermann chậm rãi kiếm ăn. Gửi một tấm bưu thiếp về trước khi khép hành trình.
        </StationTitle>

        <div className="absolute inset-x-4 top-[22vh] aspect-[3/2] [perspective:1800px] md:inset-x-auto md:top-[14vh] md:left-[7vw] md:w-[min(46vw,720px)]" style={{ opacity: 'var(--card)' }}>
          <div className="relative size-full [transform-style:preserve-3d]" style={{ transform: 'translateY(calc((1 - var(--card)) * 80px)) rotateZ(calc((1 - var(--card)) * -7deg + var(--flip) * 2deg)) rotateY(calc(var(--flip) * 180deg))' }}>
            {/* Mặt trước: ảnh */}
            <div className={`${face} bg-[#f4efe5] p-[10px]`}>
              <img src={F('hermann')} alt="Rùa Hermann giữa cỏ và hoa cúc" loading="lazy" className="size-full rounded-[2px] object-cover" />
              <span className="absolute bottom-6 left-7 font-serif text-[clamp(22px,2.6vw,40px)] text-white italic drop-shadow-[0_2px_10px_rgba(0,0,0,.6)]">Lời chào từ Địa Trung Hải</span>
              <PostageStamp className="absolute top-6 right-6 h-[22%] w-[15%] rotate-3" />
            </div>
            {/* Mặt sau: lời nhắn */}
            <div className={`${face} grid grid-cols-[1.25fr_1fr] gap-5 bg-[#f4efe5] p-5 text-[#22302a] md:p-8`} style={{ transform: 'rotateY(180deg)', backgroundImage: 'linear-gradient(90deg, transparent calc(55.5% - 1px), rgba(34,48,42,.25) calc(55.5% - 1px), rgba(34,48,42,.25) 55.5%, transparent 55.5%)' }}>
              <div className="font-serif text-[clamp(15px,1.45vw,22px)] leading-snug italic">
                <p>Gửi BioNexus,</p>
                <p className="mt-2">Hôm nay gặp rùa Hermann giữa bụi rậm và hoa cúc. {s.desc}</p>
                <p className="mt-3">Hẹn gặp lại ở chặng sau.</p>
                <p className="mt-2 not-italic font-semibold">{user ? user.name : 'Một nhà thám hiểm'}</p>
              </div>
              <div className="relative">
                <PostageStamp className="ml-auto h-[38%] w-[46%] -rotate-2" />
                <svg viewBox="0 0 120 120" className="absolute top-[6%] right-[30%] size-[44%] text-[#7a2e2e]/70" aria-hidden="true">
                  <defs>
                    <path id="pm" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
                  </defs>
                  <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" strokeWidth="2" />
                  <circle cx="60" cy="60" r="34" fill="none" stroke="currentColor" strokeWidth="1" />
                  <text fill="currentColor" fontSize="10" fontWeight="700" letterSpacing="1.6">
                    <textPath href="#pm">ĐỊA TRUNG HẢI · TRẠM 09 ·</textPath>
                  </text>
                  <text x="60" y="64" textAnchor="middle" fill="currentColor" fontSize="11" fontWeight="700">
                    {today()}
                  </text>
                </svg>
                <div className="absolute inset-x-0 bottom-0 space-y-3 text-[clamp(11px,1vw,14px)]">
                  {['Hộ chiếu loài BioNexus', 'Trang 09 · Rùa Hermann', user ? user.name : 'Khách thám hiểm'].map((t) => (
                    <p key={t} className="border-b border-[#22302a]/30 pb-1">
                      {t}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Journal s={s} page="09" where="ĐỊA TRUNG HẢI" photo="NorbertNagel" tip={TIPS['hermann-tortoise']} className="inset-x-3 bottom-3 md:inset-x-auto md:right-[5vw] md:bottom-[5vh] md:w-[410px]" />
        <Tip tip={TIPS['hermann-tortoise']} className="md:bottom-[5vh] md:left-[7vw] md:w-[400px]" />
        <Exit />
      </div>
    </section>
  )
}
```

## `expedition/Kinship.jsx`

Cây họ hàng 9 loài dựng từ phân loại (Giới → Chi), 4 nhánh nổi kèm câu tự sinh

```jsx
import { useMemo, useRef } from 'react'
import { ArrowRight, GitFork } from 'lucide-react'
import { species } from '@/data'
import { cn } from '@/lib/utils'
import { F, usePassport, useScrub } from './core'

// Cây họ hàng của 9 loài, dựng hoàn toàn từ phân loại trong dữ liệu (Giới → Chi → Loài).
// Đây là họ hàng theo phân loại, không phải lịch sử tiến hóa: không có mốc thời gian nào ngoài dữ liệu.

const RANKS = ['Giới', 'Ngành', 'Lớp', 'Bộ', 'Họ', 'Chi', 'Loài']
const LEAF_IMG = { 'burmese-python': 'python', 'nepenthes-ampullaria': 'ampullaria', 'nepenthes-rajah': 'rajah', 'venus-flytrap': 'venus', axolotl: 'axolotl', 'ball-python': 'ballpython', 'leopard-gecko': 'gecko2', 'bearded-dragon': 'dragon', 'hermann-tortoise': 'hermann' }
// Các nhánh được làm nổi lần lượt: tên khoa học của tổ tiên chung
const HIGHLIGHTS = ['Caryophyllales', 'Python', 'Squamata', 'Amphibia']

const W = 1000
const H = 600
const X0 = 24

// xl: hoành độ cột lá; màn hẹp dồn cây sang trái để tên loài đủ chỗ
function buildTree(xl) {
  const root = { id: 'root', label: 'Sự sống', depth: 0, children: [] }
  const byId = { root }
  for (const s of species) {
    let parent = root
    s.path.forEach((n, i) => {
      let node = byId[n.sci]
      if (!node) {
        node = byId[n.sci] = { id: n.sci, label: n.vi, depth: i + 1, children: [], parent }
        parent.children.push(node)
      }
      parent = node
    })
    const leaf = (byId[s.slug] = { id: s.slug, label: s.name, sci: s.sci, depth: 7, children: [], parent, leaf: true, s })
    parent.children.push(leaf)
  }
  // Thứ tự theo tên khoa học để cây không có nhánh cắt nhau
  const key = (n) => n.sci ?? n.id
  const sort = (n) => {
    n.children.sort((a, b) => key(a).localeCompare(key(b)))
    n.children.forEach(sort)
  }
  sort(root)
  const leaves = []
  const walk = (n) => (n.children.length ? n.children.forEach(walk) : leaves.push(n))
  walk(root)
  const rowH = (H - 60) / (leaves.length - 1)
  leaves.forEach((l, i) => (l.y = 30 + i * rowH))
  const place = (n) => {
    n.x = X0 + (n.depth / 7) * (xl - X0)
    if (n.children.length) {
      n.children.forEach(place)
      n.y = (n.children[0].y + n.children[n.children.length - 1].y) / 2
    }
  }
  place(root)
  const nodes = Object.values(byId)
  // Mỗi phần tử thuộc nhánh nổi nào (để CSS làm mờ phần còn lại)
  const inHl = (n) => HIGHLIGHTS.map((h, k) => (n.id === h || hasAncestor(n, h) ? `hl-${k + 1}` : '')).join(' ')
  const hasAncestor = (n, id) => {
    for (let p = n.parent; p; p = p.parent) if (p.id === id) return true
    return false
  }
  for (const n of nodes) {
    n.hl = inHl(n)
    n.anc = HIGHLIGHTS.map((h, k) => (n.id === h ? `anc-${k + 1}` : '')).join(' ')
  }
  // Nét cây theo đơn vị viewBox, màn hẹp phải dày hơn để sau khi co vẫn thấy
  return { nodes, leaves, byId, xl, sw: xl < 700 ? 3.6 : 1.5 }
}

const joinVi = (a) => (a.length < 2 ? a.join('') : `${a.slice(0, -1).join(', ')} và ${a[a.length - 1]}`)

const KIN = { grow: [0.04, 0.38], leaves: [0.3, 0.42], exit: [0.94, 1] }
const SEG = [0.45, 0.9]

export function Kinship() {
  const ref = useRef(null)
  const { met } = usePassport()
  const { nodes, leaves, byId, xl, sw } = useMemo(() => buildTree(innerWidth < 768 ? 540 : 760), [])
  useScrub(ref, KIN, (p, el) => {
    const t = (p - SEG[0]) / (SEG[1] - SEG[0])
    const k = t < 0 || t >= 1 ? '0' : String(Math.floor(t * HIGHLIGHTS.length) + 1)
    if (el.dataset.hl !== k) el.dataset.hl = k
  })
  const captions = HIGHLIGHTS.map((id) => {
    const anc = byId[id]
    const under = leaves.filter((l) => l.hl.includes(`hl-${HIGHLIGHTS.indexOf(id) + 1}`)).map((l) => l.label)
    return under.length === 1 ? `${under[0]} là loài duy nhất thuộc ${anc.label} trong chín loài.` : `${joinVi(under)} cùng thuộc ${anc.label}.`
  })
  const edgeD = (a, b) => {
    const mx = (a.x + b.x) / 2
    return `M${a.x} ${a.y}C${mx} ${a.y} ${mx} ${b.y} ${b.x} ${b.y}`
  }
  const reveal = (d) => `clamp(0, calc(var(--grow) * 7 - ${d - 1}), 1)`
  return (
    <section id="ho-hang" ref={ref} data-hl="0" className="kin relative h-[300vh]">
      <style>{HIGHLIGHTS.map((_, i) => `.exp .kin[data-hl="${i + 1}"] .k-el:not(.hl-${i + 1}){opacity:.14}.exp .kin[data-hl="${i + 1}"] .k-edge.hl-${i + 1}{stroke:#6ee7b7;filter:drop-shadow(0 0 3px #6ee7b7)}.exp .kin[data-hl="${i + 1}"] .k-lab.anc-${i + 1}{color:#c4f5de;display:block;font-weight:600}.exp .kin[data-hl="${i + 1}"] .cap-${i + 1}{opacity:1;transform:none}`).join('')}</style>
      <div className="sticky top-0 flex h-svh flex-col overflow-hidden bg-[radial-gradient(ellipse_at_40%_50%,#0b1f18_0%,#040a07_70%)] px-4 pt-20 pb-4 md:px-[7vw] md:pt-24 md:pb-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="kicker">Sau hành trình</p>
            <h2 className="mt-2 font-serif text-[clamp(36px,4.6vw,72px)] leading-[0.92] font-medium">Chín loài, một cây họ hàng</h2>
          </div>
          <p className="max-w-md text-[14px] leading-relaxed text-white/70 md:text-[15px]">Cây vẽ từ phân loại trong bách khoa, từ Giới tới Chi. Nó cho biết các loài bạn gặp xếp gần nhau thế nào. Đây là họ hàng theo phân loại, không phải lịch sử tiến hóa.</p>
        </div>

        <div className="relative mt-4 min-h-0 w-full flex-1 md:mx-auto md:mt-6 md:max-w-[1080px]">
          {/* Hàng tên cấp phân loại */}
          <div className="absolute inset-x-0 top-0 hidden h-5 md:block">
            {RANKS.map((r, i) => (
              <span key={r} className="absolute -translate-x-1/2 font-mono text-[11px] tracking-wider text-white/45 uppercase" style={{ left: `${((X0 + ((i + 1) / 7) * (xl - X0)) / W) * 100}%`, opacity: reveal(i + 1) }}>
                {r}
              </span>
            ))}
          </div>
          <div className="absolute inset-x-0 top-0 bottom-0 md:top-7">
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden="true">
              {nodes
                .filter((n) => n.parent)
                .map((n) => (
                  <path key={n.id} d={edgeD(n.parent, n)} pathLength="1" fill="none" stroke="rgba(214,235,226,.55)" strokeWidth={sw} className={cn('k-el k-edge transition-[opacity,stroke] duration-500', n.hl)} style={{ strokeDasharray: 1, strokeDashoffset: `calc(1 - ${reveal(n.depth)})` }} />
                ))}
            </svg>
            {nodes
              .filter((n) => !n.leaf)
              .map((n) => (
                <div key={n.id} className={cn('k-el absolute transition-opacity duration-500', n.hl)} style={{ left: `${(n.x / W) * 100}%`, top: `${(n.y / H) * 100}%`, opacity: `clamp(0, calc(var(--grow) * 7 - ${n.depth - 1} - 0.4), 1)` }}>
                  <span className={cn('absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full', n.depth === 0 ? 'size-3 bg-[#6ee7b7] shadow-[0_0_12px_#6ee7b7]' : 'bg-[#d6ebe2]')} />
                  <span className={cn('k-lab absolute bottom-2 left-1 w-max max-w-[108px] text-[11.5px] leading-tight text-white/80 transition-colors', n.depth === 0 ? 'block font-semibold text-[#9ff0cf]' : 'hidden md:block', n.anc)}>{n.label}</span>
                </div>
              ))}
            {leaves.map((l) => {
              const got = met.includes(l.id)
              return (
                <div key={l.id} className={cn('k-el absolute flex items-center gap-2.5 transition-opacity duration-500 md:gap-3', l.hl)} style={{ left: `${(l.x / W) * 100}%`, top: `${(l.y / H) * 100}%`, opacity: 'var(--leaves)', transform: 'translate(calc((1 - var(--leaves)) * 20px), -50%)' }}>
                  <img src={F(LEAF_IMG[l.id])} alt="" loading="lazy" className={cn('size-8 shrink-0 rounded-full object-cover ring-2 md:size-11', got ? 'ring-[#6ee7b7]' : 'opacity-50 ring-white/20 grayscale')} />
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] leading-tight font-medium md:text-[15px]">{l.label}</span>
                    <span className="hidden truncate font-serif text-[13px] text-[#c4f5de] italic md:block">{l.sci}</span>
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Lời giải thích từng nhánh nổi */}
        <div className="relative mt-3 h-[84px] md:mt-4 md:h-[72px]">
          <div className="glass absolute inset-0 grid items-center rounded-2xl px-4 md:px-6">
            <p className="cap flex items-center gap-2 text-[14px] text-white/75 transition-all duration-500 [grid-area:1/1] md:text-[15px]" style={{ opacity: 'calc(1 - min(1, var(--p) * 3))' }}>
              <GitFork className="size-4 shrink-0 text-[#6ee7b7]" aria-hidden="true" />
              Cuộn tiếp để xem những loài nằm chung nhánh.
            </p>
            {captions.map((c, i) => (
              <p key={c} className={`cap cap-${i + 1} flex translate-y-2 items-center gap-2 text-[14px] opacity-0 transition-all duration-500 [grid-area:1/1] md:text-[16px]`}>
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#6ee7b7]/15 font-mono text-[12px] text-[#6ee7b7]">{i + 1}</span>
                {c}
              </p>
            ))}
            <a href="#/s" className="absolute right-4 hidden items-center gap-1.5 text-sm font-medium text-[#6ee7b7] hover:underline md:right-6 md:inline-flex">
              Mở cây phân loại <ArrowRight className="size-4" aria-hidden="true" />
            </a>
          </div>
        </div>
        <div className="absolute inset-0 z-20 bg-[#040a07]" style={{ opacity: 'var(--exit)' }} />
      </div>
    </section>
  )
}
```

## `expedition/Finale.jsx`

Kết: bản đồ cả hành trình, hộ chiếu đủ dấu, chứng nhận, sản phẩm, ghi nguồn

```jsx
import { useRef } from 'react'
import { toast } from 'sonner'
import { ArrowRight } from 'lucide-react'
import { products, vnd } from '@/data'
import { CREDITS } from '@/pages/expedition-credits'
import { cn } from '@/lib/utils'
import { F, Motes, SP, StampMark, clamp, distanceKm, today, usePassport, useScrub } from './core'
import { CHAPTERS, LEG, ROUTE } from './data'
import { WorldMap } from './WorldMap'

// Kết hành trình: bản đồ cả lộ trình, cuốn hộ chiếu đóng dấu, chứng nhận, gợi ý mua, ghi nguồn ảnh

const RECAP = { draw: [0, 0.45], txt: [0.3, 0.5], exit: [0.9, 1] }

export function Recap() {
  const ref = useRef(null)
  const { met } = usePassport()
  useScrub(ref, RECAP)
  const total = ROUTE.slice(1).reduce((sum, l, i) => sum + distanceKm(ROUTE[i].ll, l.ll), 0)
  return (
    <section id="ket" ref={ref} className="relative h-[220vh]">
      <div className="sticky top-0 h-svh overflow-hidden bg-[radial-gradient(ellipse_at_50%_45%,#0b1f18_0%,#03070a_72%)]">
        <Motes kind="star" />
        <div className="absolute inset-x-0 top-[16vh] mx-auto w-[min(1200px,150vw)] max-md:-translate-x-[16%] md:w-[min(1200px,92vw)]" style={{ opacity: 'calc(0.35 + (1 - var(--txt)) * 0.65)' }}>
          <WorldMap mode="draw" met={met} />
        </div>
        <div className="absolute inset-x-0 bottom-[12vh] px-4 text-center" style={{ opacity: 'var(--txt)', transform: 'translateY(calc((1 - var(--txt)) * 40px))' }}>
          <p className="kicker">Ngày 10 · Hết hành trình</p>
          <h2 className="mx-auto mt-4 font-serif text-[clamp(52px,8vw,128px)] leading-[0.88] font-medium text-balance">Mười ngày, chín loài</h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/85">
            ≈ {total.toLocaleString('vi-VN')} km qua 4 chặng. Bạn đã gặp {met.length} trên 9 loài trong bách khoa BioNexus.
          </p>
        </div>
        <div className="absolute inset-0 z-20 bg-[#040a07]" style={{ opacity: 'var(--exit)' }} />
      </div>
    </section>
  )
}

// Vị trí, hình dạng, màu mực của từng con dấu trên hai trang hộ chiếu
const VISAS = [
  { id: 'tram-1', page: 0, x: 8, y: 12, rot: -8, shape: 'circle', ink: '#0f766e' },
  { id: 'tram-2', page: 0, x: 52, y: 8, rot: 6, shape: 'rect', ink: '#9a3412' },
  { id: 'tram-3', page: 0, x: 26, y: 40, rot: -3, shape: 'oval', ink: '#1d4ed8' },
  { id: 'tram-4', page: 0, x: 6, y: 68, rot: 9, shape: 'rect', ink: '#6d28d9' },
  { id: 'tram-5', page: 0, x: 54, y: 64, rot: -11, shape: 'circle', ink: '#b91c1c' },
  { id: 'tram-6', page: 1, x: 10, y: 10, rot: 4, shape: 'oval', ink: '#a16207' },
  { id: 'tram-7', page: 1, x: 52, y: 22, rot: -7, shape: 'circle', ink: '#0f766e' },
  { id: 'tram-8', page: 1, x: 12, y: 50, rot: 10, shape: 'rect', ink: '#c2410c' },
  { id: 'tram-9', page: 1, x: 50, y: 64, rot: -5, shape: 'oval', ink: '#1e40af' },
]
const SHORT = { 'tram-1': 'CÁT TIÊN', 'tram-2': 'BORNEO', 'tram-3': 'KINABALU', 'tram-4': 'CAROLINA', 'tram-5': 'XOCHIMILCO', 'tram-6': 'GHANA', 'tram-7': 'BALOCHISTAN', 'tram-8': 'TRUNG ÚC', 'tram-9': 'ĐỊA TRUNG HẢI' }
const BOOK = { open: [0, 0.14], stamps: [0.14, 0.72], exit: [0.92, 1] }

function Visa({ v, got, n }) {
  const leg = LEG[v.id]
  const s = SP[leg.slug]
  const shape = v.shape === 'circle' ? 'aspect-square rounded-full' : v.shape === 'oval' ? 'aspect-[1.45] rounded-[50%]' : 'aspect-[1.35] rounded-[8px]'
  return (
    <div className="absolute w-[30%] md:w-[40%]" style={{ left: `${v.x}%`, top: `${v.y}%`, transform: `rotate(${v.rot}deg)` }}>
      {got ? (
        <div data-visa={n} className={cn('visa flex flex-col items-center justify-center border-[3px] p-1 text-center mix-blend-multiply', shape)} style={{ color: v.ink, borderColor: v.ink, boxShadow: `inset 0 0 0 3px #efe9dc, inset 0 0 0 4.5px ${v.ink}` }}>
          <span className="text-[7px] font-bold tracking-[0.16em] md:text-[10px]">TRẠM {String(n).padStart(2, '0')}</span>
          <span className="font-serif text-[11px] leading-tight font-semibold md:text-[17px]">{s.name}</span>
          <span className="text-[6px] font-bold tracking-[0.12em] md:text-[9px]">
            {SHORT[v.id]} · {today()}
          </span>
        </div>
      ) : (
        <div className={cn('flex items-center justify-center border-2 border-dashed border-[#1d2a24]/25 p-2 text-center text-[8px] text-[#1d2a24]/45 md:text-[11px]', shape)}>Chưa có dấu · Trạm {String(n).padStart(2, '0')}</div>
      )}
    </div>
  )
}

export function PassportBook() {
  const ref = useRef(null)
  const { met, user } = usePassport()
  useScrub(ref, BOOK, (p, el) => {
    const k = clamp((p - BOOK.stamps[0]) / (BOOK.stamps[1] - BOOK.stamps[0])) * VISAS.length
    el.querySelectorAll('[data-visa]').forEach((d) => {
      if (Number(d.dataset.visa) <= Math.ceil(k)) d.setAttribute('data-on', '')
      else d.removeAttribute('data-on')
    })
  })
  const page = (i) => (
    <div className="relative aspect-[1.2] flex-1 bg-[#efe9dc] md:aspect-[0.72]" style={{ backgroundImage: 'repeating-radial-gradient(circle at 50% 120%, rgba(16,94,74,.07) 0 1px, transparent 1px 9px)' }}>
      <p className="absolute inset-x-4 top-3 flex justify-between text-[7px] font-bold tracking-[0.18em] text-[#10594a] md:top-5 md:text-[10px]">
        <span>HỘ CHIẾU LOÀI</span>
        <span>{i === 0 ? 'THỊ THỰC · 1' : 'THỊ THỰC · 2'}</span>
      </p>
      <div className="absolute inset-x-[6%] top-[9%] bottom-[8%]">
        {VISAS.filter((v) => v.page === i).map((v) => (
          <Visa key={v.id} v={v} n={VISAS.indexOf(v) + 1} got={met.includes(LEG[v.id].slug)} />
        ))}
      </div>
      <p className="absolute inset-x-4 bottom-3 text-center font-mono text-[7px] text-[#1d2a24]/55 md:bottom-4 md:text-[10px]">{i === 0 ? '— 2 —' : '— 3 —'}</p>
    </div>
  )
  return (
    <section id="ho-chieu" ref={ref} className="relative h-[240vh]">
      <div className="sticky top-0 flex h-svh flex-col items-center justify-center gap-8 overflow-hidden px-4 md:px-[7vw]">
        <div className="text-center">
          <p className="kicker">Hộ chiếu loài · {user ? user.name : 'Khách thám hiểm'}</p>
          <h2 className="mt-3 font-serif text-[clamp(40px,5.4vw,84px)] leading-[0.92] font-medium">
            {met.length === 9 ? 'Đủ chín con dấu' : `${met.length} trên 9 con dấu`}
          </h2>
        </div>
        <div className="flex w-[min(980px,100%)] flex-col overflow-hidden rounded-[12px] shadow-[0_60px_120px_-40px_rgba(0,0,0,.95)] ring-1 ring-black/20 md:flex-row" style={{ transform: 'perspective(2000px) rotateX(calc((1 - var(--open)) * 24deg)) scale(calc(0.92 + var(--open) * 0.08))', opacity: 'var(--open)' }}>
          {page(0)}
          <div className="h-px bg-[#1d2a24]/25 shadow-[0_0_18px_rgba(0,0,0,.35)] md:h-auto md:w-px" />
          {page(1)}
        </div>
        <div className="absolute inset-0 z-20 bg-[#040a07]" style={{ opacity: 'var(--exit)' }} />
      </div>
    </section>
  )
}

const KEEP_IMG = { axolotl: 'axolotl2', 'ball-python': 'ballpython', 'nepenthes-rajah': 'rajah2', 'leopard-gecko': 'gecko2', 'venus-flytrap': 'venus', 'nepenthes-ampullaria': 'ampullaria2' }

export function Certificate() {
  const { met, user } = usePassport()
  const done = met.length === 9
  const keep = products.filter((p) => p.status === 'APPROVED')
  return (
    <>
      <section className="px-4 pt-24 pb-16 md:px-[7vw]">
        <div className="relative mx-auto max-w-[920px] rounded-[28px] border border-[#d8c591]/40 bg-[linear-gradient(160deg,#0d2a20,#06140f)] p-8 text-center shadow-[0_60px_120px_-40px_rgba(0,0,0,.9)] md:p-14">
          <div className="pointer-events-none absolute inset-3 rounded-[20px] border border-[#d8c591]/25" />
          <p className="kicker text-[#d8c591]!">Chứng nhận</p>
          <h2 className="mt-4 font-serif text-[clamp(40px,5vw,76px)] leading-[0.95] font-medium">Nhà thám hiểm BioNexus</h2>
          <p className="mt-6 text-white/70">Trao cho</p>
          <p className="mt-2 font-serif text-[clamp(32px,4vw,56px)] text-[#c4f5de] italic">{user ? user.name : 'Bạn'}</p>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/80">
            {done ? `đã hoàn thành Hành trình 9 loài qua ${CHAPTERS.length} chặng, ngày ${today()}.` : `đã gặp ${met.length} trên 9 loài. Đi tiếp lúc nào cũng được, hộ chiếu vẫn giữ các dấu đã có.`}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href="#/s" className="inline-flex items-center gap-2 rounded-full bg-[#6ee7b7] px-6 py-3.5 font-semibold text-[#03140d] transition hover:bg-[#8ff0c8]">
              {user ? 'Bắt đầu dùng BioNexus' : 'Đăng ký để lưu hộ chiếu'} <ArrowRight className="size-4" aria-hidden="true" />
            </a>
            <a href="#/s" className="rounded-full border border-white/20 px-6 py-3.5 font-medium transition hover:bg-white/10">
              Mở bách khoa 9 loài
            </a>
          </div>
          {done && (
            <div data-stamped="">
              <StampMark n="9/9" where="HÀNH TRÌNH 9 LOÀI" className="-top-10 -right-4 md:-top-12 md:-right-10" />
            </div>
          )}
        </div>
      </section>

      <section className="px-4 pb-24 md:px-[7vw]">
        <div className="mx-auto max-w-[1240px]">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="kicker">Mang chuyến đi về nhà</p>
              <h2 className="mt-3 font-serif text-[clamp(38px,4.5vw,64px)] leading-[0.95] font-medium text-balance">Rừng để lại cho rừng</h2>
            </div>
            <p className="max-w-md text-white/75">Trên sàn chỉ có cây con và cá thể nhân giống, đã qua kiểm duyệt. Đây là những loài vừa gặp đang được bán.</p>
          </div>
          <div className="mt-10 flex snap-x gap-4 overflow-x-auto pb-4 [scrollbar-width:thin]">
            {keep.map((p) => (
              <article key={p.id} className="glass w-[272px] shrink-0 snap-start overflow-hidden rounded-[22px]">
                <img src={KEEP_IMG[p.sp.slug] ? F(KEEP_IMG[p.sp.slug]) : p.sp.img} alt={p.name} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                <div className="p-4">
                  <p className="text-[13px] text-white/60">{p.shop}</p>
                  <h3 className="mt-1 line-clamp-2 min-h-[2.6em] font-semibold">{p.name}</h3>
                  <p className="mt-0.5 font-serif text-[#c4f5de] italic">{p.sp.sci}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-semibold tabular-nums">{vnd(p.price)}</span>
                    <button type="button" onClick={() => toast.success(`Đã thêm “${p.name}” vào giỏ`)} className="rounded-full border border-white/20 px-3.5 py-1.5 text-sm font-medium transition hover:bg-white/10">
                      Thêm vào giỏ
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-4 pt-12 pb-32 text-sm text-white/60 md:px-[7vw]">
        <div className="mx-auto max-w-[1240px]">
          <p className="font-medium text-white/80">Ảnh trong hành trình (Wikimedia Commons, đã kiểm tra tồn tại và giấy phép)</p>
          <ul className="mt-4 grid gap-x-8 gap-y-2 md:grid-cols-2">
            {CREDITS.map((c) => (
              <li key={c.key} className="truncate" title={`${c.title} · ${c.author} · ${c.license}`}>
                <a href={c.source} target="_blank" rel="noreferrer" className="hover:text-white hover:underline">
                  {c.title.replace(/\.(jpe?g|png)$/i, '')}
                </a>{' '}
                · {c.author} · {c.license}
              </li>
            ))}
          </ul>
          <p className="mt-8">BioNexus · Đồ án Aptech 2026 · Mẫu S, Hành trình 9 loài</p>
        </div>
      </footer>
    </>
  )
}
```
