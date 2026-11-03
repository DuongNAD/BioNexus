import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, GitFork } from 'lucide-react';
import type { SpeciesDto } from '@/types/api';
import { cn } from '@/lib/cn';
import {
  JOURNEY_SPECIES_BASE,
  resolveJourneySpecies,
  type JourneySpeciesView,
} from '@/content/journey';
import { usePassport } from '@/hooks/usePassport';
import { useJourneyReducedMotion, useScrub } from '@/components/journey/useScrub';

// Cây họ hàng của 9 loài, dựng hoàn toàn từ phân loại trong dữ liệu (Giới → Chi → Loài).
// Đây là họ hàng theo phân loại, không phải lịch sử tiến hóa: không có mốc thời gian nào ngoài dữ liệu.

const RANKS = ['Giới', 'Ngành', 'Lớp', 'Bộ', 'Họ', 'Chi', 'Loài'] as const;

const LEAF_IMG: Record<string, string> = {
  'burmese-python': 'python',
  'nepenthes-ampullaria': 'ampullaria',
  'nepenthes-rajah': 'rajah',
  'venus-flytrap': 'venus',
  axolotl: 'axolotl',
  'ball-python': 'ballpython',
  'leopard-gecko': 'gecko2',
  'bearded-dragon': 'dragon',
  'hermann-tortoise': 'hermann',
};

// Các nhánh được làm nổi lần lượt: tên khoa học của tổ tiên chung
export const KINSHIP_HIGHLIGHTS = [
  'Caryophyllales',
  'Python',
  'Squamata',
  'Amphibia',
] as const;

// Tra cứu ID phân loại dự phòng theo scientificName khi API chỉ trả nút gốc

const W = 1000;
const H = 600;
const X0 = 24;

export interface TaxonBreadcrumb {
  rank: string;
  sci: string;
  vi: string;
}

// Chuỗi phân loại 6 cấp (Giới → Chi) cho từng loài từ dữ liệu phân loại bách khoa
export const SPECIES_TAXONOMY_PATHS: Record<string, readonly TaxonBreadcrumb[]> = {
  'burmese-python': [
    { rank: 'KINGDOM', sci: 'Animalia', vi: 'Giới Động vật' },
    { rank: 'PHYLUM', sci: 'Chordata', vi: 'Ngành Dây sống' },
    { rank: 'CLASS', sci: 'Reptilia', vi: 'Lớp Bò sát' },
    { rank: 'ORDER', sci: 'Squamata', vi: 'Bộ Có vảy' },
    { rank: 'FAMILY', sci: 'Pythonidae', vi: 'Họ Trăn' },
    { rank: 'GENUS', sci: 'Python', vi: 'Chi Trăn' },
  ],
  'nepenthes-ampullaria': [
    { rank: 'KINGDOM', sci: 'Plantae', vi: 'Giới Thực vật' },
    { rank: 'PHYLUM', sci: 'Tracheophyta', vi: 'Ngành Thực vật có mạch' },
    { rank: 'CLASS', sci: 'Magnoliopsida', vi: 'Lớp Hai lá mầm' },
    { rank: 'ORDER', sci: 'Caryophyllales', vi: 'Bộ Cẩm chướng' },
    { rank: 'FAMILY', sci: 'Nepenthaceae', vi: 'Họ Nắp ấm' },
    { rank: 'GENUS', sci: 'Nepenthes', vi: 'Chi Nắp ấm' },
  ],
  'nepenthes-rajah': [
    { rank: 'KINGDOM', sci: 'Plantae', vi: 'Giới Thực vật' },
    { rank: 'PHYLUM', sci: 'Tracheophyta', vi: 'Ngành Thực vật có mạch' },
    { rank: 'CLASS', sci: 'Magnoliopsida', vi: 'Lớp Hai lá mầm' },
    { rank: 'ORDER', sci: 'Caryophyllales', vi: 'Bộ Cẩm chướng' },
    { rank: 'FAMILY', sci: 'Nepenthaceae', vi: 'Họ Nắp ấm' },
    { rank: 'GENUS', sci: 'Nepenthes', vi: 'Chi Nắp ấm' },
  ],
  'venus-flytrap': [
    { rank: 'KINGDOM', sci: 'Plantae', vi: 'Giới Thực vật' },
    { rank: 'PHYLUM', sci: 'Tracheophyta', vi: 'Ngành Thực vật có mạch' },
    { rank: 'CLASS', sci: 'Magnoliopsida', vi: 'Lớp Hai lá mầm' },
    { rank: 'ORDER', sci: 'Caryophyllales', vi: 'Bộ Cẩm chướng' },
    { rank: 'FAMILY', sci: 'Droseraceae', vi: 'Họ Gọng vó' },
    { rank: 'GENUS', sci: 'Dionaea', vi: 'Chi Dionaea' },
  ],
  axolotl: [
    { rank: 'KINGDOM', sci: 'Animalia', vi: 'Giới Động vật' },
    { rank: 'PHYLUM', sci: 'Chordata', vi: 'Ngành Dây sống' },
    { rank: 'CLASS', sci: 'Amphibia', vi: 'Lớp Lưỡng cư' },
    { rank: 'ORDER', sci: 'Caudata', vi: 'Bộ Có đuôi' },
    { rank: 'FAMILY', sci: 'Ambystomatidae', vi: 'Họ Ambystomatidae' },
    { rank: 'GENUS', sci: 'Ambystoma', vi: 'Chi Ambystoma' },
  ],
  'ball-python': [
    { rank: 'KINGDOM', sci: 'Animalia', vi: 'Giới Động vật' },
    { rank: 'PHYLUM', sci: 'Chordata', vi: 'Ngành Dây sống' },
    { rank: 'CLASS', sci: 'Reptilia', vi: 'Lớp Bò sát' },
    { rank: 'ORDER', sci: 'Squamata', vi: 'Bộ Có vảy' },
    { rank: 'FAMILY', sci: 'Pythonidae', vi: 'Họ Trăn' },
    { rank: 'GENUS', sci: 'Python', vi: 'Chi Trăn' },
  ],
  'leopard-gecko': [
    { rank: 'KINGDOM', sci: 'Animalia', vi: 'Giới Động vật' },
    { rank: 'PHYLUM', sci: 'Chordata', vi: 'Ngành Dây sống' },
    { rank: 'CLASS', sci: 'Reptilia', vi: 'Lớp Bò sát' },
    { rank: 'ORDER', sci: 'Squamata', vi: 'Bộ Có vảy' },
    { rank: 'FAMILY', sci: 'Eublepharidae', vi: 'Họ Eublepharidae' },
    { rank: 'GENUS', sci: 'Eublepharis', vi: 'Chi Thằn lằn da báo' },
  ],
  'bearded-dragon': [
    { rank: 'KINGDOM', sci: 'Animalia', vi: 'Giới Động vật' },
    { rank: 'PHYLUM', sci: 'Chordata', vi: 'Ngành Dây sống' },
    { rank: 'CLASS', sci: 'Reptilia', vi: 'Lớp Bò sát' },
    { rank: 'ORDER', sci: 'Squamata', vi: 'Bộ Có vảy' },
    { rank: 'FAMILY', sci: 'Agamidae', vi: 'Họ Nhông' },
    { rank: 'GENUS', sci: 'Pogona', vi: 'Chi Pogona' },
  ],
  'hermann-tortoise': [
    { rank: 'KINGDOM', sci: 'Animalia', vi: 'Giới Động vật' },
    { rank: 'PHYLUM', sci: 'Chordata', vi: 'Ngành Dây sống' },
    { rank: 'CLASS', sci: 'Reptilia', vi: 'Lớp Bò sát' },
    { rank: 'ORDER', sci: 'Testudines', vi: 'Bộ Rùa' },
    { rank: 'FAMILY', sci: 'Testudinidae', vi: 'Họ Rùa núi' },
    { rank: 'GENUS', sci: 'Testudo', vi: 'Chi Testudo' },
  ],
};

export const KINSHIP_DISCLAIMER =
  'Đây là họ hàng theo phân loại, không phải lịch sử tiến hóa.';

export type KinshipSpeciesItem = Omit<JourneySpeciesView, 'parsedSpecs' | 'path' | 'id' | 'nodeId'> & {
  id?: number;
  nodeId?: number;
  path?: readonly TaxonBreadcrumb[];
};

export interface KinshipNode {
  id: string;
  label: string;
  sci?: string;
  depth: number;
  children: KinshipNode[];
  parent?: KinshipNode;
  leaf?: boolean;
  s?: KinshipSpeciesItem;
  x: number;
  y: number;
  hl: string;
  anc: string;
  taxonId?: number;
}

export interface KinshipTreeData {
  nodes: KinshipNode[];
  leaves: KinshipNode[];
  byId: Record<string, KinshipNode>;
  xl: number;
  sw: number;
}

export const joinVi = (a: string[]): string =>
  a.length < 2 ? a.join('') : `${a.slice(0, -1).join(', ')} và ${a[a.length - 1]}`;

function hasAncestor(n: KinshipNode, ancestorId: string): boolean {
  for (let p = n.parent; p; p = p.parent) {
    if (p.id === ancestorId) return true;
  }
  return false;
}

export function findCommonAncestor(
  byId: Record<string, KinshipNode>,
  leafIdA: string,
  leafIdB: string
): KinshipNode | null {
  const a = byId[leafIdA];
  const b = byId[leafIdB];
  if (!a || !b) return null;
  const ancestorsA = new Set<string>();
  for (let p: KinshipNode | undefined = a; p; p = p.parent) {
    ancestorsA.add(p.id);
  }
  for (let p: KinshipNode | undefined = b; p; p = p.parent) {
    if (ancestorsA.has(p.id)) return p;
  }
  return null;
}

// xl: hoành độ cột lá; màn hẹp dồn cây sang trái để tên loài đủ chỗ
export function buildKinshipTree(
  xl = 760,
  speciesList: KinshipSpeciesItem[] = Object.values(JOURNEY_SPECIES_BASE),
  // Tên khoa học -> id nút phân loại lấy từ API; thiếu thì link về trang cây phân loại gốc
  taxonIdMap: Record<string, number> = {}
): KinshipTreeData {
  const root: KinshipNode = {
    id: 'root',
    label: 'Sự sống',
    depth: 0,
    children: [],
    x: 0,
    y: 0,
    hl: '',
    anc: '',
  };
  const byId: Record<string, KinshipNode> = { root };

  for (const s of speciesList) {
    let parent = root;
    const path = s.path ?? SPECIES_TAXONOMY_PATHS[s.slug] ?? [];
    path.forEach((n, i) => {
      let node = byId[n.sci];
      if (!node) {
        node = {
          id: n.sci,
          label: n.vi,
          depth: i + 1,
          children: [],
          parent,
          x: 0,
          y: 0,
          hl: '',
          anc: '',
          taxonId: taxonIdMap[n.sci],
        };
        byId[n.sci] = node;
        parent.children.push(node);
      }
      parent = node;
    });
    const leaf: KinshipNode = {
      id: s.slug,
      label: s.name,
      sci: s.sci,
      depth: 7,
      children: [],
      parent,
      leaf: true,
      s,
      x: 0,
      y: 0,
      hl: '',
      anc: '',
    };
    byId[s.slug] = leaf;
    parent.children.push(leaf);
  }

  // Thứ tự theo tên khoa học để cây không có nhánh cắt nhau
  const key = (n: KinshipNode): string => n.sci ?? n.id;
  const sort = (n: KinshipNode): void => {
    n.children.sort((a, b) => key(a).localeCompare(key(b)));
    n.children.forEach(sort);
  };
  sort(root);

  const leaves: KinshipNode[] = [];
  const walk = (n: KinshipNode): void => {
    if (n.children.length > 0) {
      n.children.forEach(walk);
    } else {
      leaves.push(n);
    }
  };
  walk(root);

  const rowH = (H - 60) / Math.max(1, leaves.length - 1);
  leaves.forEach((l, i) => {
    l.y = 30 + i * rowH;
  });

  const place = (n: KinshipNode): void => {
    n.x = X0 + (n.depth / 7) * (xl - X0);
    if (n.children.length > 0) {
      n.children.forEach(place);
      n.y = (n.children[0]!.y + n.children[n.children.length - 1]!.y) / 2;
    }
  };
  place(root);

  const nodes = Object.values(byId);
  // Mỗi phần tử thuộc nhánh nổi nào (để CSS làm mờ phần còn lại)
  const inHl = (n: KinshipNode): string =>
    KINSHIP_HIGHLIGHTS.map((h, k) =>
      n.id === h || hasAncestor(n, h) ? `hl-${k + 1}` : ''
    )
      .filter(Boolean)
      .join(' ');

  for (const n of nodes) {
    n.hl = inHl(n);
    n.anc = KINSHIP_HIGHLIGHTS.map((h, k) => (n.id === h ? `anc-${k + 1}` : ''))
      .filter(Boolean)
      .join(' ');
  }

  // Nét cây theo đơn vị viewBox, màn hẹp phải dày hơn để sau khi co vẫn thấy
  return { nodes, leaves, byId, xl, sw: xl < 700 ? 3.6 : 1.5 };
}

export function formatKinshipCaption(ancestorLabel: string, leafLabels: string[]): string {
  return leafLabels.length === 1
    ? `${leafLabels[0]} là loài duy nhất thuộc ${ancestorLabel} trong chín loài.`
    : `${joinVi(leafLabels)} cùng thuộc ${ancestorLabel}.`;
}

export function buildKinshipCaptions(tree: KinshipTreeData): string[] {
  return KINSHIP_HIGHLIGHTS.map((id, idx) => {
    const anc = tree.byId[id];
    const under = tree.leaves
      .filter((l) => l.hl.split(' ').includes(`hl-${idx + 1}`))
      .map((l) => l.label);
    return formatKinshipCaption(anc?.label ?? id, under);
  });
}

const KIN_RANGES = {
  grow: [0.04, 0.38] as const,
  leaves: [0.3, 0.42] as const,
  exit: [0.94, 1] as const,
};
const SEG: readonly [number, number] = [0.45, 0.9];

export interface KinshipProps {
  liveSpecies?: SpeciesDto[];
  /** Tên khoa học -> id nút phân loại, dựng từ breadcrumbs của API */
  taxonIdMap?: Record<string, number>;
}

export function Kinship({ liveSpecies, taxonIdMap }: KinshipProps): React.JSX.Element {
  const ref = useRef<HTMLElement | null>(null);
  const { met } = usePassport();
  const reduced = useJourneyReducedMotion();
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  const [activeHlIndex, setActiveHlIndex] = useState<number>(0);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const resolvedSpecies = useMemo(
    () =>
      Object.keys(JOURNEY_SPECIES_BASE).map((slug) =>
        resolveJourneySpecies(slug, liveSpecies)
      ),
    [liveSpecies]
  );

  const dynamicTaxonIds = useMemo(() => taxonIdMap ?? {}, [taxonIdMap]);

  const tree = useMemo(
    () => buildKinshipTree(isMobile ? 540 : 760, resolvedSpecies, dynamicTaxonIds),
    [isMobile, resolvedSpecies, dynamicTaxonIds]
  );
  const { nodes, leaves, byId, xl, sw } = tree;

  useScrub(ref, KIN_RANGES, (p, el) => {
    const t = (p - SEG[0]) / (SEG[1] - SEG[0]);
    const idx = t < 0 || t >= 1 ? 0 : Math.floor(t * KINSHIP_HIGHLIGHTS.length) + 1;
    const k = String(idx);
    if (el.dataset.hl !== k) {
      el.dataset.hl = k;
      setActiveHlIndex(idx);
    }
  });

  const captions = useMemo(() => buildKinshipCaptions(tree), [tree]);

  const activeHighlightSci =
    activeHlIndex >= 1 && activeHlIndex <= KINSHIP_HIGHLIGHTS.length
      ? KINSHIP_HIGHLIGHTS[activeHlIndex - 1]
      : null;
  const activeTaxonId = activeHighlightSci
    ? byId[activeHighlightSci]?.taxonId
    : undefined;
  const taxonomyHref = activeTaxonId ? `#/taxonomy/${activeTaxonId}` : '#/taxonomy';

  const edgeD = (a: KinshipNode, b: KinshipNode): string => {
    const mx = (a.x + b.x) / 2;
    return `M${a.x} ${a.y}C${mx} ${a.y} ${mx} ${b.y} ${b.x} ${b.y}`;
  };

  const reveal = (d: number): string => `clamp(0, calc(var(--grow) * 7 - ${d - 1}), 1)`;
  const baseUrl = import.meta.env.BASE_URL || './';

  return (
    <section id="ho-hang" ref={ref} data-hl="0" className="kin relative h-[300vh]">
      <style>
        {`.kin:not([data-hl="0"]) .cap-0{opacity:0!important}` +
          KINSHIP_HIGHLIGHTS.map(
            (_, i) =>
              `.kin[data-hl="${i + 1}"] .k-el:not(.hl-${i + 1}){opacity:.14}.kin[data-hl="${i + 1}"] .k-edge.hl-${i + 1}{stroke:#6ee7b7;filter:drop-shadow(0 0 3px #6ee7b7)}.kin[data-hl="${i + 1}"] .k-lab.anc-${i + 1}{color:#c4f5de;display:block;font-weight:600}.kin[data-hl="${i + 1}"] .cap-${i + 1}{opacity:1;transform:none}`
          ).join('')}
      </style>
      <div className="sticky top-0 flex h-svh flex-col overflow-hidden bg-[radial-gradient(ellipse_at_40%_50%,#0b1f18_0%,#040a07_70%)] px-4 pt-20 pb-4 md:px-[7vw] md:pt-24 md:pb-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="kicker">Sau hành trình</p>
            <h2 className="mt-2 font-serif text-[clamp(36px,4.6vw,72px)] leading-[0.92] font-medium">
              Chín loài, một cây họ hàng
            </h2>
          </div>
          <p className="max-w-md text-[14px] leading-relaxed text-white/70 md:text-[15px]">
            Cây vẽ từ phân loại trong bách khoa, từ Giới tới Chi. Nó cho biết các loài bạn gặp xếp gần nhau thế nào. {KINSHIP_DISCLAIMER}
          </p>
        </div>

        <div className="relative mt-4 min-h-0 w-full flex-1 md:mx-auto md:mt-6 md:max-w-[1080px]">
          {/* Hàng tên cấp phân loại */}
          <div className="absolute inset-x-0 top-0 hidden h-5 md:block">
            {RANKS.map((r, i) => (
              <span
                key={r}
                className="absolute -translate-x-1/2 font-mono text-[11px] tracking-wider text-white/45 uppercase"
                style={{
                  left: `${((X0 + ((i + 1) / 7) * (xl - X0)) / W) * 100}%`,
                  opacity: reveal(i + 1),
                }}
              >
                {r}
              </span>
            ))}
          </div>
          <div className="absolute inset-x-0 top-0 bottom-0 md:top-7">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              preserveAspectRatio="none"
              className="absolute inset-0 size-full"
              aria-hidden="true"
            >
              {nodes
                .filter((n) => n.parent)
                .map((n) => (
                  <path
                    key={n.id}
                    d={edgeD(n.parent!, n)}
                    pathLength="1"
                    fill="none"
                    stroke="rgba(214,235,226,.55)"
                    strokeWidth={sw}
                    className={cn(
                      'k-el k-edge transition-[opacity,stroke] duration-500',
                      n.hl
                    )}
                    style={{
                      strokeDasharray: 1,
                      strokeDashoffset: `calc(1 - ${reveal(n.depth)})`,
                    }}
                  />
                ))}
            </svg>
            {nodes
              .filter((n) => !n.leaf)
              .map((n) => (
                <div
                  key={n.id}
                  className={cn('k-el absolute transition-opacity duration-500', n.hl)}
                  style={{
                    left: `${(n.x / W) * 100}%`,
                    top: `${(n.y / H) * 100}%`,
                    opacity: `clamp(0, calc(var(--grow) * 7 - ${n.depth - 1} - 0.4), 1)`,
                  }}
                >
                  <span
                    className={cn(
                      'absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full',
                      n.depth === 0
                        ? 'size-3 bg-[#6ee7b7] shadow-[0_0_12px_#6ee7b7]'
                        : 'bg-[#d6ebe2]'
                    )}
                  />
                  <span
                    className={cn(
                      'k-lab absolute bottom-2 left-1 w-max max-w-[108px] text-[11.5px] leading-tight text-white/80 transition-colors',
                      n.depth === 0
                        ? 'block font-semibold text-[#9ff0cf]'
                        : 'hidden md:block',
                      n.anc
                    )}
                  >
                    {n.label}
                  </span>
                </div>
              ))}
            {leaves.map((l) => {
              const got = met.includes(l.id);
              const imgName = LEAF_IMG[l.id] || 'python';
              return (
                <div
                  key={l.id}
                  className={cn(
                    'k-el absolute flex items-center gap-2.5 transition-opacity duration-500 md:gap-3',
                    l.hl
                  )}
                  style={{
                    left: `${(l.x / W) * 100}%`,
                    top: `${(l.y / H) * 100}%`,
                    opacity: 'var(--leaves)',
                    transform: 'translate(calc((1 - var(--leaves)) * 20px), -50%)',
                  }}
                >
                  <img
                    src={`${baseUrl}trip/${imgName}-960.webp`}
                    alt=""
                    loading="lazy"
                    className={cn(
                      'size-8 shrink-0 rounded-full object-cover ring-2 md:size-11',
                      got ? 'ring-[#6ee7b7]' : 'opacity-50 ring-white/20 grayscale'
                    )}
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] leading-tight font-medium md:text-[15px]">
                      {l.label}
                    </span>
                    <span className="hidden truncate font-serif text-[13px] text-[#c4f5de] italic md:block">
                      {l.sci}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lời giải thích từng nhánh nổi */}
        {reduced ? (
          <div className="glass relative mt-3 rounded-2xl px-4 py-3 md:mt-4 md:px-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <ol className="grid gap-1.5 text-xs text-white/85 md:grid-cols-2 md:text-sm">
                {captions.map((c, i) => (
                  <li key={c} className="flex items-center gap-2">
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[#6ee7b7]/15 font-mono text-[11px] text-[#6ee7b7]">
                      {i + 1}
                    </span>
                    <span>{c}</span>
                  </li>
                ))}
              </ol>
              <a
                href={taxonomyHref}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6ee7b7] hover:underline"
              >
                Mở cây phân loại <ArrowRight className="size-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        ) : (
          <div className="relative mt-3 h-[84px] md:mt-4 md:h-[72px]">
            <div className="glass absolute inset-0 grid items-center rounded-2xl px-4 md:px-6">
              <p
                className="cap cap-0 flex items-center gap-2 text-[14px] text-white/75 transition-all duration-500 [grid-area:1/1] md:text-[15px]"
                style={{ opacity: 'clamp(0, calc(1 - var(--p) * 3), 1)' }}
              >
                <GitFork className="size-4 shrink-0 text-[#6ee7b7]" aria-hidden="true" />
                Cuộn tiếp để xem những loài nằm chung nhánh.
              </p>
              {captions.map((c, i) => (
                <p
                  key={c}
                  className={`cap cap-${i + 1} flex translate-y-2 items-center gap-2 text-[14px] opacity-0 transition-all duration-500 [grid-area:1/1] md:pr-44 md:text-[16px]`}
                >
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#6ee7b7]/15 font-mono text-[12px] text-[#6ee7b7]">
                    {i + 1}
                  </span>
                  <span>{c}</span>
                </p>
              ))}
              <a
                href={taxonomyHref}
                className="absolute right-4 hidden items-center gap-1.5 text-sm font-medium text-[#6ee7b7] hover:underline md:right-6 md:inline-flex"
              >
                Mở cây phân loại <ArrowRight className="size-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        )}
        <div
          className="pointer-events-none absolute inset-0 z-20 bg-[#040a07]"
          style={{ opacity: 'var(--exit)' }}
        />
      </div>
    </section>
  );
}
