import type { ReactNode } from 'react';

export type QualityTier = 'high' | 'medium' | 'low' | 'static';

export type UserQualityPreference = QualityTier | 'auto';

export interface DeviceCapabilities {
  hasWebGL: boolean;
  hasWebGL2: boolean;
  unmaskedRenderer: string;
  unmaskedVendor: string;
  isSoftwareRenderer: boolean;
  concurrency: number;
  memoryGb: number;
  isMobile: boolean;
  saveData: boolean;
}

export interface QualityConfig {
  tier: QualityTier;
  dpr: [number, number];
  particles: number;
  earthParticles: number;
  bloom: boolean;
  vignette: boolean;
  antialias: boolean;
  shadows: boolean;
  helixBands: number;
  helixCards: number;
  enableAtmosphere: boolean;
}

export interface QualityContextValue {
  tier: QualityTier;
  userTier: UserQualityPreference;
  setUserTier: (tier: UserQualityPreference) => void;
  config: QualityConfig;
  isMobile: boolean;
  prefersReducedMotion: boolean;
  capabilities: DeviceCapabilities;
  reportFpsDrop: () => void;
}

export interface SceneShellProps {
  id: string;
  posterSrc: string;
  posterAlt: string;
  minTier?: QualityTier;
  className?: string;
  /** Thêm class cho ảnh poster, ví dụ object-position để giữ chủ thể trong khung ở màn dọc */
  posterClassName?: string;
  children: (tier: QualityTier, onFirstFrame: () => void) => ReactNode;
  srDescription?: string;
}
