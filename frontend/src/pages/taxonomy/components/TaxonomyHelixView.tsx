import React, { useState, useRef, useMemo } from 'react';
import { Link } from 'react-router';
import { ExternalLink, ShoppingBag, Thermometer } from 'lucide-react';
import type { TaxonomyNodeDto, SpeciesDto } from '@/types/api';
import { SceneShell } from '@/components/3d/SceneShell';
import { Canvas } from '@react-three/fiber';
import { HelixScene } from '@/components/3d/HelixScene';
import { IucnBadge } from '@/components/ui/IucnBadge';
import { Button } from '@/components/ui/Button';
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
  const [activeTaxonIndex, setActiveTaxonIndex] = useState(0);
  const progressRef = useRef(0);

  // Thuật toán tuần hoàn Modulo lấp đầy 14 bậc chuỗi xoắn kép
  const helixSpecies = useMemo(() => {
    if (branchSpecies.length === 0) return [];
    return Array.from({ length: 14 }, (_, index) => {
      const sp = branchSpecies[index % branchSpecies.length]!;
      return {
        rungIndex: index,
        species: sp,
        isVirtualRepeat: index >= branchSpecies.length,
      };
    });
  }, [branchSpecies]);

  // Loài đang hiển thị ở thẻ nổi góc màn hình
  const currentItem = helixSpecies[activeTaxonIndex] || helixSpecies[0];
  const currentSpecies = currentItem?.species;
  const currentNames = currentSpecies ? extractNames(currentSpecies.commonName) : null;
  const currentExtra = currentSpecies ? SPECIES_EXTRAS[currentSpecies.scientificName] : undefined;
  const currentSpecs = currentSpecies ? parseEnvironmentSpecs(currentSpecies.environmentSpecs) : null;
  const currentProdCount = currentSpecies ? (productCounts[currentSpecies.id] || 0) : 0;

  if (branchSpecies.length === 0) {
    return (
      <div className="flex h-[600px] flex-col items-center justify-center rounded-2xl border border-line bg-surface p-8 text-center text-xs text-fg-3">
        Nhánh này chưa có loài nào để hiển thị trên Chuỗi xoắn 3D.
      </div>
    );
  }

  return (
    <div className={cn('relative h-[650px] w-full overflow-hidden rounded-2xl border border-line bg-bg-deep', className)}>
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
            camera={{ position: [0, 0, 7.5], fov: 42 }}
            onCreated={() => handleFirstFrame?.()}
          >
            <ambientLight intensity={0.5} />
            <pointLight position={[5, 5, 5]} intensity={1.5} color="#5eead4" />
            <HelixScene
              progress={progressRef}
              onActiveTaxon={(idx) => setActiveTaxonIndex(idx % Math.max(1, branchSpecies.length))}
            />
          </Canvas>
        )}
      </SceneShell>

      {/* Thẻ Kính Nổi Tương tác (Interactive Floating Glass Card) */}
      {currentSpecies && currentNames && (
        <div className="absolute bottom-6 left-6 z-20 w-80 rounded-2xl border border-white/15 bg-black/75 p-5 shadow-2xl backdrop-blur-xl text-white">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
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
                <p className="text-[11px] text-white/60 truncate mt-0.5">
                  {currentExtra.origin.place}
                </p>
              )}
            </div>
          </div>

          {/* Nhiệt độ & Cá thể bán */}
          <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="rounded-lg bg-white/5 p-2 flex items-center gap-1.5 border border-white/5">
              <Thermometer className="size-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">
                {currentSpecs?.tempMin ? `${currentSpecs.tempMin}–${currentSpecs.tempMax}°C` : 'N/A'}
              </span>
            </div>

            <div className="rounded-lg bg-white/5 p-2 flex items-center gap-1.5 border border-white/5">
              <ShoppingBag className="size-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">
                {currentProdCount > 0 ? `${currentProdCount} cá thể` : 'Hết hàng'}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-1">
            <Link to={`/species/${currentSpecies.id}`} className="w-full block">
              <Button variant="primary" size="sm" className="w-full text-xs gap-1.5">
                Xem hồ sơ loài chi tiết
                <ExternalLink className="size-3" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Điều khiển lật loài nhanh trên chuỗi */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3 py-1.5 text-xs text-white/80 backdrop-blur-md">
        <span>Loài {activeTaxonIndex + 1} / {branchSpecies.length}</span>
      </div>
    </div>
  );
};
