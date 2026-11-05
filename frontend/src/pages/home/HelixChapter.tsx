import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Canvas } from '@react-three/fiber';
import { AnimatePresence, motion, useScroll } from 'motion/react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { SceneShell } from '@/components/3d/SceneShell';
import { HelixScene, HELIX_LEVELS, type HelixPhoto } from '@/components/3d/HelixScene';
import { HelixPostFx } from '@/components/3d/HelixPostFx';
import { useQuality } from '@/components/3d/QualityProvider';
import { RANK_INFO } from '@/components/domain/TaxonRankChip';
import { normalizeBreadcrumbs } from '@/components/domain/TaxonPath';
import { ButtonLink } from '@/components/domain/ButtonLink';
import { IucnBadge } from '@/components/ui/IucnBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Eyebrow } from '@/components/layout/Page';
import { useTaxonomyDetail } from '@/api/queries/useTaxonomyQueries';
import { useSpeciesProducts } from '@/api/queries/useSpeciesQueries';
import { SPECIES_EXTRAS, type SpeciesViewModel } from '@/api/adapters';
import { formatVnd } from '@/lib/parseEnvironmentSpecs';
import { cn } from '@/lib/cn';
import { dur, ease } from '@/lib/motion';

const WIDE_QUERY = '(min-width: 1024px)';

/** Chuỗi xoắn 3D chỉ dựng ở màn rộng; màn hẹp dùng băng thẻ vuốt (tài liệu 03, mobile khối 5) */
function useIsWide(): boolean {
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(WIDE_QUERY).matches);
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia(WIDE_QUERY);
    const onChange = () => setWide(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return wide;
}

/** Ảnh 960 px dùng làm texture; loài không có hồ sơ mở rộng thì không lên chuỗi */
function helixPhotoOf(species: SpeciesViewModel): string | null {
  const extra = SPECIES_EXTRAS[species.scientificName];
  return extra ? `photos/${extra.slug}/hero-960.webp` : null;
}

interface HelixSpeciesPanelProps {
  species: SpeciesViewModel;
}

/** Thẻ kính góc trái dưới: loài đang ở trước camera, sáu cấp phân loại của nó và cá thể đang bán */
function HelixSpeciesPanel({ species }: HelixSpeciesPanelProps): React.JSX.Element {
  const taxonomyQuery = useTaxonomyDetail(species.nodeId, { enabled: Boolean(species.nodeId) });
  const productsQuery = useSpeciesProducts(species.id);
  const lineage = useMemo(
    () => normalizeBreadcrumbs(taxonomyQuery.data?.breadcrumbs, taxonomyQuery.data?.node),
    [taxonomyQuery.data]
  );
  const product = productsQuery.data?.find((p) => p.status === 'APPROVED' && p.stockQuantity > 0);

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <Eyebrow tone="muted">Loài ở phía trước</Eyebrow>
        {!species.isDomestic && <IucnBadge code={species.conservationStatus} size="sm" className="shrink-0" />}
      </div>
      <h3 className="mt-3 text-[28px] leading-tight font-semibold tracking-[-0.03em] text-fg">{species.displayName}</h3>
      <p className="font-serif text-lg text-fg-2 italic">{species.scientificName}</p>

      <ol className="mt-4 space-y-1 text-sm" aria-label="Sáu cấp phân loại">
        {taxonomyQuery.isLoading
          ? Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-4" style={{ marginLeft: i * 10, width: `${60 - i * 4}%` }} />)
          : lineage.map((node, i) => {
              const info = RANK_INFO[node.rank];
              const isLast = i === lineage.length - 1;
              return (
                <motion.li
                  key={node.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: dur.base, ease: ease.out }}
                  className="flex gap-3"
                  style={{ paddingLeft: i * 10 }}
                >
                  <span className="w-11 shrink-0 text-fg-3">{info?.labelVi ?? node.rank}</span>
                  <span className={cn('truncate', isLast ? 'font-medium text-accent italic' : 'text-fg-2', info?.isItalic && 'italic')}>
                    {node.scientificName}
                  </span>
                </motion.li>
              );
            })}
      </ol>

      <div className="mt-5 flex items-center justify-between gap-4 border-t border-line pt-4">
        {product ? (
          <div className="min-w-0">
            <p className="truncate text-sm text-fg-2">{product.productName}</p>
            <p className="font-mono text-base font-semibold text-fg">{formatVnd(product.price)}</p>
          </div>
        ) : (
          <p className="text-sm text-fg-3">
            {productsQuery.isLoading ? 'Đang tìm cá thể đang bán…' : 'Chưa có cửa hàng nào đang bán loài này.'}
          </p>
        )}
        <div className="flex shrink-0 items-center gap-2">
          {product && (
            <ButtonLink to={`/products/${product.id}`} size="sm" pill>
              Xem cá thể
            </ButtonLink>
          )}
          <Link
            to={`/species/${species.id}`}
            className="inline-flex size-9 items-center justify-center rounded-full border border-line text-fg-2 transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            aria-label={`Mở hồ sơ ${species.displayName}`}
          >
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </>
  );
}

/** Thẻ loài cuộn ngang có snap: thay cảnh 3D ở màn hẹp và ở mức chất lượng thấp */
function HelixCarousel({ species }: { species: SpeciesViewModel[] }): React.JSX.Element {
  return (
    <ul
      aria-label="Các loài trên chuỗi xoắn"
      className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 scrollbar-none sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0"
    >
      {species.map((sp) => (
        <li key={sp.id} className="w-[78%] max-w-[300px] shrink-0 snap-start">
          <Link
            to={`/species/${sp.id}`}
            className="group block overflow-hidden rounded-[20px] border border-line bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <div className="aspect-[4/5] overflow-hidden">
              <img
                src={sp.cardPhoto}
                alt={sp.displayName}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-4">
              {!sp.isDomestic && <IucnBadge code={sp.conservationStatus} size="sm" />}
              <p className="mt-2 font-semibold text-fg">{sp.displayName}</p>
              <p className="font-serif text-fg-2 italic">{sp.scientificName}</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export interface HelixChapterProps {
  progressRef: React.RefObject<number>;
  speciesList: SpeciesViewModel[] | undefined;
}

export function HelixChapter({ progressRef, speciesList }: HelixChapterProps): React.JSX.Element {
  const { config, tier } = useQuality();
  const navigate = useNavigate();
  const isWide = useIsWide();
  // Mức low và static (gồm cả giảm chuyển động) không dựng 3D, dùng băng thẻ như màn hẹp
  const use3d = isWide && (tier === 'high' || tier === 'medium');

  // Chỉ loài có ảnh 960 lên chuỗi; thứ tự theo dữ liệu API, không cố định id
  const featured = useMemo(() => (speciesList ?? []).filter((sp) => helixPhotoOf(sp) !== null), [speciesList]);
  const photos = useMemo<HelixPhoto[]>(
    () => featured.map((sp) => ({ key: sp.scientificName, src: helixPhotoOf(sp)! })),
    [featured]
  );

  const [activePhoto, setActivePhoto] = useState(0);
  const [activeRung, setActiveRung] = useState(0);
  const activeSpecies = featured[Math.min(activePhoto, Math.max(0, featured.length - 1))];

  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });

  return (
    <section
      ref={sectionRef}
      id="chapter-1"
      data-theme="dark"
      aria-labelledby="helix-title"
      className={cn('relative border-t border-line bg-bg-deep', use3d && 'h-[460vh]')}
    >
      <div className={cn('relative', use3d && 'sticky top-0 h-screen overflow-hidden')}>
        {use3d && (
          <div className="absolute inset-0">
            <SceneShell
              id="home-helix"
              posterSrc="posters/home-helix.webp"
              posterAlt="Chuỗi xoắn kép phát sáng ngọc bích ghép từ ảnh thật của các loài, ảnh nắp ấm ở phía trước được viền sáng"
              minTier="medium"
              className="h-full w-full"
              srDescription="Chuỗi xoắn kép ghép từ ảnh thật của các loài trong bách khoa. Thông tin loài ở phía trước có trong thẻ bên trái."
            >
              {(_tier, handleFirstFrame) => (
                <Canvas
                  dpr={config.dpr}
                  gl={{ antialias: config.antialias }}
                  camera={{ position: [0, 0.4, 14], fov: 40 }}
                  onCreated={() => handleFirstFrame?.()}
                >
                  <color attach="background" args={['#020605']} />
                  <fog attach="fog" args={['#020605', 11, 24]} />
                  <HelixScene
                    progress={progressRef}
                    offsetX={2.6}
                    minDistance={13}
                    fitScale={0.85}
                    photos={photos}
                    revealOnMount
                    onActivePhoto={setActivePhoto}
                    onActiveTaxon={setActiveRung}
                    onSelectPhoto={(i) => {
                      const sp = featured[i];
                      if (sp) navigate(`/species/${sp.id}`);
                    }}
                  />
                  <HelixPostFx />
                </Canvas>
              )}
            </SceneShell>
          </div>
        )}

        {/* Lớp tối bên trái để chữ đặt trên cảnh 3D đạt tương phản AA; mép trên dưới hoà vào chương kề */}
        {use3d && (
          <>
            <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-[55%] bg-gradient-to-r from-bg-deep via-bg-deep/75 to-transparent" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-bg-deep to-transparent" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-bg-deep to-transparent" />
          </>
        )}

        {/* Khung chữ không nhận con trỏ để rê và bấm được ảnh phía sau; chỉ chữ và thẻ nhận lại */}
        <div
          className={cn(
            'relative z-10 mx-auto flex max-w-7xl flex-col px-4 sm:px-6 lg:px-10',
            use3d ? 'pointer-events-none h-full justify-between pt-28 pb-10' : 'gap-10 py-24'
          )}
        >
          <div className="pointer-events-auto max-w-md">
            <Eyebrow>Chương 01 · Phả hệ sự sống</Eyebrow>
            {/* Cụm nhấn xuống dòng riêng: để tự ngắt thì chữ "Chi" rơi lẻ một mình xuống dòng dưới */}
            <h2 id="helix-title" className="mt-4 text-[30px] leading-[1.05] font-semibold tracking-[-0.04em] text-fg md:text-[44px]">
              Sáu cấp, từ Giới{' '}
              <em className="block font-serif text-[1.08em] font-medium tracking-[-0.01em] text-accent">tới từng Chi</em>
            </h2>
            <p className="mt-5 text-base leading-relaxed text-fg-2 md:text-lg">
              {use3d
                ? 'Mỗi ảnh trên chuỗi là một loài thật trong bách khoa. Cuộn để đi dọc chuỗi: loài ở phía trước hiện màu, kèm nhánh Giới, Ngành, Lớp, Bộ, Họ, Chi của nó.'
                : 'Giới, Ngành, Lớp, Bộ, Họ, Chi: mỗi loài trong bách khoa nằm ở cuối một nhánh như vậy. Vuốt để xem từng loài.'}
            </p>

            {use3d && (
              <div className="mt-6 flex items-center gap-4" aria-hidden="true">
                <span className="font-mono text-sm text-fg-2">
                  Bậc {String(activeRung + 1).padStart(2, '0')} / {HELIX_LEVELS}
                </span>
                <span className="relative h-px w-40 bg-line">
                  <motion.span
                    className="absolute inset-0 origin-left bg-accent"
                    style={{ scaleX: scrollYProgress }}
                  />
                </span>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
              <ButtonLink to="/taxonomy" variant="secondary" pill>
                <span>Mở cây phân loại</span>
                <ArrowRight className="size-4" aria-hidden="true" />
              </ButtonLink>
              {speciesList && (
                <span className="text-sm text-fg-3">
                  <span className="font-mono text-fg">{speciesList.length}</span> loài trong bách khoa
                </span>
              )}
            </div>
          </div>

          {use3d ? (
            <div className="pointer-events-auto w-[380px]" aria-live="polite">
              <AnimatePresence mode="wait">
                {activeSpecies && (
                  <motion.aside
                    key={activeSpecies.id}
                    aria-label="Loài đang xem trên chuỗi xoắn"
                    initial={{ opacity: 0, x: -24, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, x: -12, filter: 'blur(8px)' }}
                    transition={{ duration: 0.35, ease: ease.out }}
                    className="rounded-3xl border border-white/10 bg-black/50 p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,.9)] backdrop-blur-xl"
                  >
                    <HelixSpeciesPanel species={activeSpecies} />
                  </motion.aside>
                )}
              </AnimatePresence>
            </div>
          ) : (
            featured.length > 0 && <HelixCarousel species={featured} />
          )}
        </div>
      </div>
    </section>
  );
}
