import React from 'react';
import { Link } from 'react-router';
import { MapPin, ArrowRight } from 'lucide-react';
import type { SpeciesViewModel } from '@/api/adapters';
import { SceneShell } from '@/components/3d/SceneShell';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { BioEarth } from '@/components/3d/BioEarth/BioEarth';
import { IucnBadge } from '@/components/ui/IucnBadge';
import { cn } from '@/lib/cn';

export interface SpeciesMapViewProps {
  speciesList: SpeciesViewModel[];
  selectedSpeciesId: number | null;
  onSelectSpecies: (id: number) => void;
  productCounts?: Record<number, number>;
  className?: string;
}

export const SpeciesMapView: React.FC<SpeciesMapViewProps> = ({
  speciesList,
  selectedSpeciesId,
  onSelectSpecies,
  productCounts = {},
  className = '',
}) => {
  return (
    <div
      className={cn(
        'relative flex flex-col lg:flex-row h-[680px] w-full overflow-hidden rounded-2xl border border-line bg-bg-deep shadow-2xl',
        className
      )}
    >
      {/* Cột danh sách 9 loài đồng bộ bên trái */}
      <div className="w-full lg:w-80 shrink-0 border-b lg:border-b-0 lg:border-r border-line bg-surface-1/80 backdrop-blur-xl flex flex-col z-10">
        <div className="p-4 border-b border-line bg-surface-2/40">
          <h3 className="text-xs font-bold uppercase tracking-wider text-fg">
            Sinh cảnh & Cung đường bay ({speciesList.length})
          </h3>
          <p className="text-[11px] text-fg-3">Nhấp vào loài để xoay địa cầu tới tọa độ bản địa</p>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin scrollbar-thumb-line">
          {speciesList.map((sp) => {
            const isSelected = sp.id === selectedSpeciesId;

            return (
              <div
                key={sp.id}
                onClick={() => onSelectSpecies(sp.id)}
                className={cn(
                  'group flex items-center justify-between gap-3 rounded-xl p-2.5 cursor-pointer border transition-all text-left',
                  isSelected
                    ? 'border-accent bg-accent/15 shadow-sm'
                    : 'border-transparent bg-surface/40 hover:border-line hover:bg-surface'
                )}
              >
                <img
                  src={sp.heroPhoto}
                  alt={sp.displayName}
                  className="size-11 rounded-lg object-cover border border-line shrink-0"
                  style={{ objectPosition: sp.focus || 'center' }}
                  loading="lazy"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className={cn('text-xs font-semibold truncate', isSelected ? 'text-accent' : 'text-fg')}>
                      {sp.displayName}
                    </p>
                    <IucnBadge code={sp.conservationStatus} size="sm" />
                  </div>

                  <p className="font-serif italic text-[11px] text-accent-2 truncate">
                    {sp.scientificName}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-fg-3 mt-0.5">
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="size-2.5 text-accent shrink-0" />
                      <span className="truncate">{sp.origin.place}</span>
                    </span>
                    {productCounts[sp.id] ? (
                      <span className="text-emerald-400 font-mono text-[9px] shrink-0">
                        {productCounts[sp.id]} cá thể
                      </span>
                    ) : null}
                  </div>
                </div>

                <Link
                  to={`/species/${sp.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 rounded-md text-fg-3 hover:text-accent hover:bg-surface-hover shrink-0"
                  aria-label={`Xem chi tiết ${sp.displayName}`}
                >
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Canvas 3D BioEarth */}
      <div className="flex-1 relative h-full">
        <SceneShell
          id="species-catalog-earth"
          posterSrc="posters/home-earth.webp"
          posterAlt="Bản đồ sinh quyển BioEarth"
          className="h-full w-full"
          srDescription="Bản đồ quả địa cầu BioEarth 3D tương tác hiển thị phân bố 9 loài sinh cảnh bản địa."
        >
          {(_tier, handleFirstFrame) => (
            <Canvas
              camera={{ position: [0, 0.5, 6.2], fov: 42 }}
              onCreated={() => handleFirstFrame?.()}
            >
              <ambientLight intensity={0.4} />
              <directionalLight position={[5, 3, 5]} intensity={1.2} />
              <BioEarth
                selectedSpeciesId={selectedSpeciesId || undefined}
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
      </div>
    </div>
  );
};
