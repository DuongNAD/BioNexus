import React from 'react';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useQuality } from './QualityProvider';

/**
 * Hậu kỳ cho chuỗi xoắn ảnh loài (tài liệu 05 mục 4): chỉ ở mức có bloom.
 * Ngưỡng 0,9 vì sợi được tô sáng quá 1 còn ảnh đã tone map thì không, nên ảnh không bị loá.
 */
export function HelixPostFx(): React.JSX.Element | null {
  const { config } = useQuality();
  if (!config.bloom) return null;
  return (
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur intensity={0.9} luminanceThreshold={0.9} luminanceSmoothing={0.15} />
      <Vignette offset={0.25} darkness={0.7} />
    </EffectComposer>
  );
}
