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
      <div className="flex h-[600px] flex-col items-center justify-center rounded-2xl border border-line bg-surface p-8 text-center text-xs text-fg-3">
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
        'relative h-[650px] w-full overflow-hidden rounded-2xl border border-line bg-bg-deep focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2',
        className
      )}
    >
      {/* Cảnh 3D chuỗi xoắn kép ADN bọc trong SceneShell */}
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
            camera={{ position: [0, 0, 7.5], fov: 42 }}
            onCreated={() => handleFirstFrame?.()}
          >
            <ambientLight intensity={0.5} />
            <pointLight position={[5, 5, 5]} intensity={1.5} color="#5eead4" />
            <HelixScene progress={progressRef} />
          </Canvas>
        )}
      </SceneShell>

      {/* Thẻ kính nổi: loài đang chọn trên chuỗi (DOM thật nên trình đọc màn hình đọc được) */}
      {currentSpecies && currentNames && (
        <div
          aria-live="polite"
          className="absolute bottom-6 left-6 z-20 w-80 rounded-2xl border border-white/15 bg-black/75 p-5 shadow-2xl backdrop-blur-xl text-white"
        >
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-semibold">
              Loài đang chọn trên chuỗi
            </span>
            <IucnBadge code={currentSpecies.conservationStatus} size="sm" />
          </div>

          <div className="mt-3 flex gap-3 items-center">
            {currentExtra && (
              <img
                src={`photos/${currentExtra.slug}/hero-960.webp`}
                alt={currentNames.displayName}
                className="size-14 rounded-xl object-cover border border-white/15 shrink-0"
              />
            )}
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold truncate text-white">{currentNames.displayName}</h4>
              <p className="font-serif italic text-xs text-emerald-300 truncate">
                {currentSpecies.scientificName}
              </p>
              {currentExtra?.origin?.place && (
                <p className="text-[11px] text-white/70 truncate mt-0.5">
                  {currentExtra.origin.place}
                </p>
              )}
            </div>
          </div>

          {/* Nhiệt độ & Cá thể bán */}
          <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="rounded-lg bg-white/5 p-2 flex items-center gap-1.5 border border-white/5">
              <Thermometer className="size-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
              <span className="truncate">
                {currentSpecs?.tempMin != null ? `${currentSpecs.tempMin}–${currentSpecs.tempMax}°C` : 'Chưa rõ'}
              </span>
            </div>

            <div className="rounded-lg bg-white/5 p-2 flex items-center gap-1.5 border border-white/5">
              <ShoppingBag className="size-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
              <span className="truncate">
                {currentProdCount > 0 ? `${currentProdCount} cá thể` : 'Chưa có cá thể bán'}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-1">
            <Link
              to={`/species/${currentSpecies.id}`}
              className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-lg bg-accent px-3 text-xs font-semibold text-accent-ink shadow-[var(--glow-accent-btn)] transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
            >
              Xem hồ sơ loài chi tiết
              <ExternalLink className="size-3" aria-hidden="true" />
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
