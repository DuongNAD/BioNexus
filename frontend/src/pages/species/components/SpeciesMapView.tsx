import React, { useMemo } from 'react';
import { Link } from 'react-router';
import { MapPin, ArrowRight } from 'lucide-react';
import type { SpeciesViewModel } from '@/api/adapters';
import { SceneShell } from '@/components/3d/SceneShell';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { BioEarth } from '@/components/3d/BioEarth/BioEarth';
import { toBioMarker } from '@/components/3d/BioEarth/coordinates';
import { useQuality } from '@/components/3d/QualityProvider';
import { IucnBadge } from '@/components/ui/IucnBadge';
import { cn } from '@/lib/cn';

export interface SpeciesMapViewProps {
  speciesList: SpeciesViewModel[];
  /** Loài đang chọn, nhận diện bằng scientificName (id trong DB có thể khác seed) */
  selectedScientificName: string | null;
  onSelectSpecies: (scientificName: string) => void;
  productCounts?: Record<number, number>;
  className?: string;
}

export const SpeciesMapView: React.FC<SpeciesMapViewProps> = ({
  speciesList,
  selectedScientificName,
  onSelectSpecies,
  productCounts = {},
  className = '',
}) => {
  const { config } = useQuality();

  // Địa cầu chỉ vẽ các loài đang qua bộ lọc
  const markers = useMemo(
    () => speciesList.map((sp) => toBioMarker(sp, (productCounts[sp.id] || 0) > 0)),
    [speciesList, productCounts]
  );
  const selectedSpecies = speciesList.find((sp) => sp.scientificName === selectedScientificName);

  return (
    <div
      className={cn(
        'relative flex flex-col lg:flex-row h-[680px] w-full overflow-hidden rounded-2xl border border-line bg-bg-deep shadow-2xl',
        className
      )}
    >
      {/* Cột danh sách loài đồng bộ bên trái */}
      <div className="w-full lg:w-80 shrink-0 border-b lg:border-b-0 lg:border-r border-line bg-surface-1/80 backdrop-blur-xl flex flex-col z-10 max-h-[45%] lg:max-h-none">
        <div className="p-4 border-b border-line bg-surface-2/40">
          <h3 className="text-xs font-bold uppercase tracking-wider text-fg">
            Sinh cảnh & Cung đường bay ({speciesList.length})
          </h3>
          <p className="text-[11px] text-fg-3">Chọn một loài để xoay địa cầu tới tọa độ bản địa</p>
        </div>

        <ul className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin scrollbar-thumb-line">
          {speciesList.map((sp) => {
            const isSelected = sp.scientificName === selectedScientificName;

            return (
              <li
                key={sp.id}
                className={cn(
                  'flex items-center gap-1 rounded-xl border transition-all',
                  isSelected
                    ? 'border-accent bg-accent/15 shadow-sm'
                    : 'border-transparent bg-surface/40 hover:border-line hover:bg-surface'
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelectSpecies(sp.scientificName)}
                  aria-pressed={isSelected}
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-xl p-2.5 text-left focus-visible:outline-2 focus-visible:outline-accent"
                >
                  <img
                    src={sp.heroPhoto}
                    alt=""
                    className="size-11 rounded-lg object-cover border border-line shrink-0"
                    style={{ objectPosition: sp.focus || 'center' }}
                    loading="lazy"
                  />

                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className={cn('text-xs font-semibold truncate', isSelected ? 'text-accent' : 'text-fg')}>
                        {sp.displayName}
                      </span>
                      <IucnBadge code={sp.conservationStatus} size="sm" />
                    </span>

                    <span className="block font-serif italic text-[11px] text-accent-2 truncate">
                      {sp.scientificName}
                    </span>

                    <span className="flex items-center justify-between text-[10px] text-fg-3 mt-0.5">
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="size-2.5 text-accent shrink-0" aria-hidden="true" />
                        <span className="truncate">{sp.origin.place}</span>
                      </span>
                      {productCounts[sp.id] ? (
                        <span className="text-emerald-400 font-mono text-[9px] shrink-0">
                          {productCounts[sp.id]} cá thể
                        </span>
                      ) : null}
                    </span>
                  </span>
                </button>

                <Link
                  to={`/species/${sp.id}`}
                  className="mr-1.5 rounded-md p-1.5 text-fg-3 hover:text-accent hover:bg-surface-hover shrink-0 focus-visible:outline-2 focus-visible:outline-accent"
                  aria-label={`Xem hồ sơ ${sp.displayName}`}
                >
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Canvas 3D BioEarth */}
      <div className="flex-1 relative h-full min-h-0">
        <SceneShell
          id="species-catalog-earth"
          posterSrc="posters/home-earth.webp"
          posterAlt="Bản đồ sinh quyển BioEarth"
          className="h-full w-full"
          srDescription={`Quả địa cầu 3D hiển thị nơi bản địa của ${speciesList.length} loài đang lọc và cung bay về các trại nhân giống tại Việt Nam.`}
        >
          {(_tier, handleFirstFrame) => (
            <Canvas
              dpr={config.dpr}
              gl={{ antialias: config.antialias }}
              camera={{ position: [0, 0.5, 6.2], fov: 42 }}
              onCreated={() => handleFirstFrame?.()}
            >
              <ambientLight intensity={0.4} />
              <directionalLight position={[5, 3, 5]} intensity={1.2} />
              <BioEarth
                speciesList={markers}
                selectedScientificName={selectedScientificName ?? undefined}
                onSelectSpecies={onSelectSpecies}
              />
              <OrbitControls
                enableZoom={false}
                minPolarAngle={Math.PI / 4}
                maxPolarAngle={(3 * Math.PI) / 4}
              />
            </Canvas>
          )}
        </SceneShell>

        {/* Thông tin loài đang chọn bằng DOM thật (tooltip trong canvas bị ẩn với trình đọc màn hình) */}
        {selectedSpecies && (
          <p
            aria-live="polite"
            className="absolute bottom-3 left-3 right-3 z-20 rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-[11px] text-white/90 backdrop-blur-md"
          >
            <strong className="text-white">{selectedSpecies.displayName}</strong>
            <span className="text-white/70"> · {selectedSpecies.origin.place}</span>
          </p>
        )}
      </div>
    </div>
  );
};
