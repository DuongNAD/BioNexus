import React from 'react';
import { geoNaturalEarth1Project, WORLD_LAND_DOTS } from '@/lib/geo';
import { ROUTE } from '@/content/journey';

const W = 1000;
const H = 500;

export const PTS = ROUTE.map((r) => {
  const [x, y] = geoNaturalEarth1Project([r.ll[1], r.ll[0]]);
  return { ...r, xy: [x, y] as const };
});

// Cung nối giữa hai điểm liên tiếp trên lộ trình (Bézier bậc hai, uốn lên phía bắc)
export const ARCS = PTS.slice(1).map((b, i) => {
  const a = PTS[i]!;
  const [x1, y1] = a.xy;
  const [x2, y2] = b.xy;
  const d = Math.hypot(x2 - x1, y2 - y1);
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2 - Math.min(95, d * 0.25);
  return {
    i,
    a,
    b,
    cx,
    cy,
    d: `M${x1.toFixed(1)},${y1.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`,
  };
});

// Lấy tọa độ và góc hướng của máy bay tại tiến độ t ∈ [0..1] trên cung thứ i
export function arcPoint(i: number, t: number): [number, number, number] {
  const s = ARCS[i]!;
  const [x1, y1] = s.a.xy;
  const [x2, y2] = s.b.xy;
  const u = 1 - t;
  const x = u * u * x1 + 2 * u * t * s.cx + t * t * x2;
  const y = u * u * y1 + 2 * u * t * s.cy + t * t * y2;
  const dx = 2 * u * (s.cx - x1) + 2 * t * (x2 - s.cx);
  const dy = 2 * u * (s.cy - y1) + 2 * t * (y2 - s.cy);
  return [x, y, (Math.atan2(dy, dx) * 180) / Math.PI];
}

export interface WorldMapProps {
  mode?: 'preview' | 'flight' | 'draw';
  active?: number;
  met?: string[];
  planeRef?: React.RefObject<SVGGElement | null>;
  className?: string;
}

export function WorldMap({
  mode = 'preview',
  active = -1,
  met = [],
  planeRef,
  className,
}: WorldMapProps): React.JSX.Element {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      aria-label="Bản đồ lộ trình 9 trạm trên thế giới"
    >
      <path
        d={WORLD_LAND_DOTS}
        stroke="rgba(166,232,202,.24)"
        strokeWidth="2.1"
        strokeLinecap="round"
        fill="none"
      />
      {ARCS.map((s) => {
        const past = mode === 'draw' || mode === 'preview' || s.i < active;
        const cur = mode === 'flight' && s.i === active;
        return (
          <g key={s.i}>
            <path
              d={s.d}
              fill="none"
              stroke="rgba(255,255,255,.16)"
              strokeWidth="1.2"
              strokeDasharray="3 5"
            />
            {(past || cur) && (
              <path
                d={s.d}
                fill="none"
                stroke="#6ee7b7"
                strokeWidth={cur ? 2.4 : 1.7}
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={
                  cur
                    ? 'calc(1 - var(--fly, 1))'
                    : mode === 'draw'
                      ? 'calc(1 - var(--draw, 1))'
                      : 0
                }
                style={{ filter: 'drop-shadow(0 0 8px rgba(110,231,183,.55))' }}
              />
            )}
          </g>
        );
      })}
      {PTS.map((p) => {
        const got = Boolean(p.slug && met.includes(p.slug));
        return (
          <g key={p.id} transform={`translate(${p.xy[0].toFixed(1)} ${p.xy[1].toFixed(1)})`}>
            {got && <circle r="8" fill="rgba(110,231,183,.2)" />}
            <circle
              r={p.slug ? 3.5 : 2.3}
              fill={got ? '#6ee7b7' : p.slug ? '#e8f5ee' : 'rgba(255,255,255,.55)'}
            />
            {p.slug && (
              <text
                x={p.dx}
                y={p.dy}
                textAnchor={p.dx < 0 ? 'end' : 'start'}
                fill="rgba(232,245,238,.82)"
                fontSize="11"
                fontWeight="500"
              >
                {p.label}
              </text>
            )}
          </g>
        );
      })}
      {mode === 'flight' && (
        <g
          ref={planeRef}
          style={{ filter: 'drop-shadow(0 0 12px rgba(110,231,183,.9))' }}
        >
          <circle r="13" fill="rgba(110,231,183,.18)" />
          <path
            d="M9,0 L-5,-5 L-2,-1 L-8,-1 L-10,-4 L-11,-4 L-9,0 L-11,4 L-10,4 L-8,1 L-2,1 L-5,5 Z"
            fill="#ecfdf5"
          />
        </g>
      )}
    </svg>
  );
}
