import React, { useMemo } from 'react';
import { Link } from 'react-router';
import { MapPin, ArrowRight } from 'lucide-react';
import type { SpeciesViewModel } from '@/api/adapters';
import { SceneShell } from '@/components/3d/SceneShell';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { BioEarth } from '@/components/3d/BioEarth/BioEarth';
import { toBioMarker, ALL_BREEDING_HUBS } from '@/components/3d/BioEarth/coordinates';
import { useQuality } from '@/components/3d/QualityProvider';
import { IucnBadge } from '@/components/ui/IucnBadge';
import { cn } from '@/lib/cn';

export interface SpeciesMapViewProps {
  speciesList: SpeciesViewModel[];
  /** Loài đang chọn, nhận diện bằng scientificName (id trong DB có thể khác seed) */
  selectedScientificName: string | null;
  onSelectSpecies: (scientificName: string) => void;
  productCounts?: Record<number, number>;
  /** Shop đang bán từng loài (theo id loài): cung bay nối nơi bản địa với trại của shop đó */
  shopBySpecies?: Record<number, string>;
  className?: string;
}

export const SpeciesMapView: React.FC<SpeciesMapViewProps> = ({
  speciesList,
  selectedScientificName,
  onSelectSpecies,
  productCounts = {},
  shopBySpecies = {},
  className = '',
}) => {
  const { config } = useQuality();

  // Địa cầu chỉ vẽ các loài đang qua bộ lọc
  const markers = useMemo(
    () => speciesList.map((sp) => toBioMarker(sp, (productCounts[sp.id] || 0) > 0, shopBySpecies[sp.id])),
    [speciesList, productCounts, shopBySpecies]
  );
  const selectedSpecies = speciesList.find((sp) => sp.scientificName === selectedScientificName);

  return (
    <div className={cn('grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]', className)}>
      {/* Danh sách loài: một khung duy nhất, các dòng ngăn bằng đường kẻ mảnh */}
      <div className="flex max-h-[420px] flex-col overflow-hidden rounded-[20px] border border-line bg-surface lg:max-h-[640px]">
        <div className="border-b border-line px-5 py-4">
          <p className="text-sm font-medium text-fg">Nơi bản địa của {speciesList.length} loài</p>
          <p className="mt-0.5 text-sm text-fg-3">Chọn một loài để xoay địa cầu tới đó</p>
        </div>
        <ul className="flex-1 divide-y divide-line overflow-y-auto">
          {speciesList.map((sp) => {
            const isSelected = sp.scientificName === selectedScientificName;
            const onSale = productCounts[sp.id] || 0;
            return (
              <li key={sp.id} className={cn('flex items-center gap-2 pr-3 transition-colors', isSelected && 'bg-accent/10')}>
                <button
                  type="button"
                  onClick={() => onSelectSpecies(sp.scientificName)}
                  aria-pressed={isSelected}
                  className="flex min-w-0 flex-1 items-center gap-3 py-3 pl-5 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
                >
                  <img
                    src={sp.cardPhoto}
                    alt=""
                    className="size-12 shrink-0 rounded-xl object-cover"
                    style={{ objectPosition: sp.focus || 'center' }}
                    loading="lazy"
                  />
                  <span className="min-w-0 flex-1">
                    <span className={cn('block truncate text-sm font-medium', isSelected ? 'text-accent' : 'text-fg')}>
                      {sp.displayName}
                    </span>
                    <span className="flex items-center gap-1.5 truncate text-sm text-fg-3">
                      <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                      <span className="truncate">{sp.origin.place}</span>
                    </span>
                    {onSale > 0 && <span className="block text-xs text-accent">{onSale} cá thể đang bán</span>}
                  </span>
                  <IucnBadge code={sp.conservationStatus} size="sm" showLabel={false} />
                </button>
                <Link
                  to={`/species/${sp.id}`}
                  className="shrink-0 rounded-full p-2 text-fg-3 transition-colors hover:bg-surface-2 hover:text-fg focus-visible:outline-2 focus-visible:outline-accent"
                  aria-label={`Xem hồ sơ ${sp.displayName}`}
                >
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div data-theme="dark" className="relative h-[420px] overflow-hidden rounded-[20px] border border-line bg-bg-deep lg:h-[640px]">
        <SceneShell
          id="species-catalog-earth"
          posterSrc="posters/home-earth.webp"
          posterAlt="Bản đồ nơi bản địa của các loài"
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
                breedingHubs={ALL_BREEDING_HUBS}
                selectedScientificName={selectedScientificName ?? undefined}
                onSelectSpecies={onSelectSpecies}
              />
              <OrbitControls enableZoom={false} minPolarAngle={Math.PI / 4} maxPolarAngle={(3 * Math.PI) / 4} />
            </Canvas>
          )}
        </SceneShell>

        {/* Thông tin loài đang chọn bằng DOM thật (tooltip trong canvas bị ẩn với trình đọc màn hình) */}
        {selectedSpecies && (
          <p
            aria-live="polite"
            className="absolute right-4 bottom-4 left-4 z-20 rounded-xl bg-black/70 px-4 py-3 text-sm text-white/85 backdrop-blur-md"
          >
            <span className="font-semibold text-white">{selectedSpecies.displayName}</span>
            <span> · {selectedSpecies.origin.place}</span>
          </p>
        )}
      </div>
    </div>
  );
};
