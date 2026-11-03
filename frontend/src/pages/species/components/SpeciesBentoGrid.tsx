import React from 'react';
import { ExternalLink, Database, Globe } from 'lucide-react';
import type { SpeciesViewModel } from '@/api/adapters';
import { ClimateBar } from '@/components/domain/ClimateBar';
import { HumidityGauge } from '@/components/domain/HumidityGauge';
import { HabitatCard } from '@/components/domain/HabitatCard';
import { IucnScale } from './IucnScale';
import { SceneShell } from '@/components/3d/SceneShell';
import { Canvas } from '@react-three/fiber';
import { BioEarth } from '@/components/3d/BioEarth/BioEarth';
import { toBioMarker } from '@/components/3d/BioEarth/coordinates';
import { useQuality } from '@/components/3d/QualityProvider';
import { cn } from '@/lib/cn';

export interface SpeciesBentoGridProps {
  species: SpeciesViewModel;
  className?: string;
}

export const SpeciesBentoGrid: React.FC<SpeciesBentoGridProps> = ({ species, className = '' }) => {
  const { config } = useQuality();
  // Loài thuỷ sinh có chuỗi "Nhiệt độ nước" (đọc từ dữ liệu, không dựa vào id)
  const isWaterTemp = species.parsedSpecs.waterTempMin != null;
  // Bản mini chỉ cần một marker: loài đang xem
  const marker = React.useMemo(() => toBioMarker(species, true), [species]);

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between pb-2">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-accent font-semibold">
            Hồ sơ khoa học
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-fg font-sans">
            Thông số Sinh học & Sinh cảnh
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Module 1: ClimateBar (Nhiệt độ) — 4 cột */}
        <div className="md:col-span-4">
          <ClimateBar
            specs={species.parsedSpecs}
            isWaterTemp={isWaterTemp}
            className="h-full"
          />
        </div>

        {/* Module 2: HumidityGauge (Độ ẩm) — 3 cột */}
        <div className="md:col-span-3">
          <HumidityGauge
            humidMin={species.parsedSpecs.humidMin}
            humidMax={species.parsedSpecs.humidMax}
            className="h-full"
          />
        </div>

        {/* Module 3: BioEarth Mini (Nơi bản địa & Cung bay) — 5 cột */}
        <div className="md:col-span-5 h-[260px] md:h-auto rounded-2xl border border-line bg-surface-1 overflow-hidden relative shadow-md">
          <SceneShell
            id={`species-bento-earth-${species.id}`}
            posterSrc="posters/home-earth.webp"
            posterAlt={`Bản đồ sinh cảnh 3D · ${species.displayName}`}
            className="h-full w-full"
            srDescription={`Quả địa cầu BioEarth 3D hiển thị tọa độ bản địa của ${species.displayName}`}
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
                  variant="mini"
                  speciesList={[marker]}
                  selectedScientificName={species.scientificName}
                />
              </Canvas>
            )}
          </SceneShell>

          <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between rounded-xl bg-black/60 px-3 py-1.5 backdrop-blur-md text-[11px] text-white/90 border border-white/10 pointer-events-none">
            <span className="flex items-center gap-1.5 truncate">
              <Globe className="size-3 text-emerald-400 shrink-0" aria-hidden="true" />
              {species.origin.place}
            </span>
            <span className="font-mono text-emerald-300 text-[10px] shrink-0">
              Cung bay về Việt Nam
            </span>
          </div>
        </div>

        {/* Module 4: HabitatCard (Sinh cảnh tự nhiên) — 4 cột */}
        <div className="md:col-span-4">
          <HabitatCard species={species} className="h-full" />
        </div>

        {/* Module 5: IucnScale (Thang bậc bảo tồn 7 mức) — 8 cột */}
        <div className="md:col-span-8">
          <IucnScale
            currentStatus={species.conservationStatus}
            explanation={species.conservationNote}
            className="h-full"
          />
        </div>

        {/* Module 6: Tham chiếu GBIF quốc tế — Toàn bộ chiều rộng (12 cột) */}
        {species.gbifUrl && (
          <div className="md:col-span-12 rounded-xl border border-line bg-surface-2/40 px-4 py-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-fg-3">
              <Database className="size-4 text-accent" aria-hidden="true" />
              <span>Dữ liệu đa dạng sinh học toàn cầu (Global Biodiversity Information Facility):</span>
              <strong className="text-fg-2 font-mono">{species.scientificName}</strong>
            </div>

            <a
              href={species.gbifUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-accent hover:underline font-semibold text-xs"
            >
              <span>Xem hồ sơ GBIF</span>
              <ExternalLink className="size-3" aria-hidden="true" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
