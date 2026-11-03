import React from 'react';
import { Canvas } from '@react-three/fiber';
import type { SpeciesViewModel } from '@/api/adapters';
import { SceneShell } from '@/components/3d/SceneShell';
import { BioEarth } from '@/components/3d/BioEarth/BioEarth';
import { toBioMarker } from '@/components/3d/BioEarth/coordinates';
import { useQuality } from '@/components/3d/QualityProvider';

/** Địa cầu mini một điểm: nơi bản địa của loài đang xem (tách file để trang tải three.js muộn) */
export function SpeciesOriginGlobe({ species }: { species: SpeciesViewModel }): React.JSX.Element {
  const { config } = useQuality();
  const marker = React.useMemo(() => toBioMarker(species, true), [species]);

  return (
    <SceneShell
      id={`species-origin-earth-${species.id}`}
      posterSrc="posters/home-earth.webp"
      posterAlt={`Địa cầu đánh dấu nơi bản địa của ${species.displayName}`}
      className="h-full w-full"
      srDescription={`Quả địa cầu 3D đánh dấu nơi bản địa của ${species.displayName}: ${species.origin.place}.`}
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
          <BioEarth variant="mini" speciesList={[marker]} selectedScientificName={species.scientificName} />
        </Canvas>
      )}
    </SceneShell>
  );
}

export default SpeciesOriginGlobe;
