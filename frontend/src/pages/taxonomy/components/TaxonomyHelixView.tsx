import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Link } from 'react-router';
import { ChevronLeft, ChevronRight, ExternalLink, ShoppingBag, Thermometer } from 'lucide-react';
import type { TaxonomyNodeDto, SpeciesDto } from '@/types/api';
import { SceneShell } from '@/components/3d/SceneShell';
import { Canvas } from '@react-three/fiber';
import { HelixScene, HELIX_LEVELS } from '@/components/3d/HelixScene';
import { useQuality } from '@/components/3d/QualityProvider';
import { IucnBadge } from '@/components/ui/IucnBadge';
import { extractNames, SPECIES_EXTRAS } from '@/api/adapters';
import { parseEnvironmentSpecs } from '@/lib/parseEnvironmentSpecs';
import { cn } from '@/lib/cn';

export interface TaxonomyHelixViewProps {
  activeNode: TaxonomyNodeDto;
  branchSpecies: SpeciesDto[];
  productCounts?: Record<number, number>;
  className?: string;
}

export const TaxonomyHelixView: React.FC<TaxonomyHelixViewProps> = ({
  activeNode,
  branchSpecies,
  productCounts = {},
  className = '',
}) => {
  const { config } = useQuality();
  const [activeIndex, setActiveIndex] = useState(0);
  const progressRef = useRef(0);
  const total = branchSpecies.length;

  // Đổi nhánh thì quay về loài đầu tiên
  useEffect(() => {
    setActiveIndex(0);
  }, [activeNode.id]);

  // Nút bấm là nguồn chọn loài; camera của chuỗi xoắn trượt tới bậc thang tương ứng
  useEffect(() => {
    const rung = total > 0 ? activeIndex % HELIX_LEVELS : 0;
    progressRef.current = rung / (HELIX_LEVELS - 1);
  }, [activeIndex, total]);

  const goTo = (delta: number) => {
    if (total === 0) return;
    setActiveIndex((prev) => (prev + delta + total) % total);
  };

  const currentSpecies = useMemo(
    () => (total > 0 ? branchSpecies[Math.min(activeIndex, total - 1)] : undefined),
    [branchSpecies, activeIndex, total]
  );
  const currentNames = currentSpecies ? extractNames(currentSpecies.commonName) : null;
  const currentExtra = currentSpecies ? SPECIES_EXTRAS[currentSpecies.scientificName] : undefined;
  const currentSpecs = currentSpecies ? parseEnvironmentSpecs(currentSpecies.environmentSpecs) : null;
  const currentProdCount = currentSpecies ? (productCounts[currentSpecies.id] || 0) : 0;

  if (total === 0) {
    return (
      <div className="flex h-[420px] flex-col items-center justify-center rounded-[20px] border border-line bg-surface p-8 text-center text-sm text-fg-3">
        Nhánh này chưa có loài nào để hiển thị trên Chuỗi xoắn 3D.
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-roledescription="trình duyệt chuỗi xoắn"
      aria-label={`Chuỗi xoắn loài thuộc ${activeNode.scientificName}. Dùng phím mũi tên trái phải để đổi loài.`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          goTo(1);
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          goTo(-1);
        }
      }}
      className={cn(
        'relative w-full overflow-hidden rounded-[20px] border border-line bg-bg-deep focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2',
        className
      )}
    >
      {/* Cảnh 3D chuỗi xoắn kép ADN bọc trong SceneShell */}
      <div className="relative h-[420px] md:h-[650px]">
        <SceneShell
          id="taxonomy-helix"
          posterSrc="posters/home-helix.webp"
          posterAlt={`Chuỗi xoắn 3D · ${activeNode.scientificName}`}
          srDescription="Chuỗi xoắn kép ADN phát quang ngọc bích mô phỏng các bậc phân loại học."
          className="h-full w-full"
        >
          {(_tier, handleFirstFrame) => (
            <Canvas
              dpr={config.dpr}
              gl={{ antialias: config.antialias }}
              camera={{ position: [0, 0, 14], fov: 42 }}
              onCreated={() => handleFirstFrame?.()}
            >
              <ambientLight intensity={0.5} />
              <pointLight position={[5, 5, 5]} intensity={1.5} color="#5eead4" />
              {/* Lệch phải để thẻ loài ở góc trái dưới không che chuỗi */}
              <HelixScene progress={progressRef} offsetX={1.4} />
            </Canvas>
          )}
        </SceneShell>
      </div>

      {/* Thẻ loài đang chọn (DOM thật nên trình đọc màn hình đọc được).
          Màn rộng: thẻ kính nổi góc trái dưới. Màn hẹp: nằm dưới khung 3D để không che nửa chuỗi */}
      {currentSpecies && currentNames && (
        <div
          aria-live="polite"
          className="z-20 border-t border-line bg-black/40 p-5 text-white md:absolute md:bottom-6 md:left-6 md:w-80 md:rounded-md md:border md:border-white/15 md:bg-black/75 md:shadow-2xl md:backdrop-blur-xl"
        >
          <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-2.5">
            <span className="text-xs font-semibold tracking-wider text-accent uppercase">Loài đang chọn</span>
            <IucnBadge code={currentSpecies.conservationStatus} size="sm" className="shrink-0" />
          </div>

          <div className="mt-3 flex items-center gap-3">
            {currentExtra && (
              <img
                src={`photos/${currentExtra.slug}/hero-960.webp`}
                alt={currentNames.displayName}
                className="size-14 shrink-0 rounded-xl border border-white/15 object-cover"
              />
            )}
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-base font-semibold text-white">{currentNames.displayName}</h4>
              <p className="truncate font-serif text-sm text-accent-2 italic">{currentSpecies.scientificName}</p>
              {currentExtra?.origin?.place && (
                <p className="mt-0.5 truncate text-xs text-white/70">{currentExtra.origin.place}</p>
              )}
            </div>
          </div>

          {/* Nhiệt độ & Cá thể bán */}
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 p-2">
              <Thermometer className="size-3.5 shrink-0 text-accent" aria-hidden="true" />
              <span className="truncate font-mono">
                {currentSpecs?.tempMin != null ? `${currentSpecs.tempMin}–${currentSpecs.tempMax}°C` : 'Chưa rõ'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 p-2">
              <ShoppingBag className="size-3.5 shrink-0 text-accent" aria-hidden="true" />
              <span className="truncate">
                {currentProdCount > 0 ? `${currentProdCount} cá thể` : 'Chưa có cá thể bán'}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <Link
              to={`/species/${currentSpecies.id}`}
              className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-full bg-accent px-4 text-sm font-semibold text-accent-ink shadow-[var(--glow-accent-btn)] transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
            >
              Xem hồ sơ loài
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}

      {/* Điều khiển lật loài trên chuỗi */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1 rounded-full border border-white/10 bg-black/60 p-1 text-xs text-white/90 backdrop-blur-md">
        <button
          type="button"
          onClick={() => goTo(-1)}
          aria-label="Loài trước trên chuỗi xoắn"
          className="flex size-8 items-center justify-center rounded-full hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-accent"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </button>
        <span className="px-1 font-mono tabular-nums">
          Loài {activeIndex + 1} / {total}
        </span>
        <button
          type="button"
          onClick={() => goTo(1)}
          aria-label="Loài tiếp theo trên chuỗi xoắn"
          className="flex size-8 items-center justify-center rounded-full hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-accent"
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
