import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import type {
  QualityTier,
  UserQualityPreference,
  DeviceCapabilities,
  QualityConfig,
  QualityContextValue,
} from './types';

const STORAGE_KEY = 'bionexus.quality_tier';

const TIER_CONFIGS: Record<QualityTier, QualityConfig> = {
  high: {
    tier: 'high',
    dpr: [1, typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 2],
    particles: 24000,
    earthParticles: 24000,
    bloom: true,
    vignette: true,
    antialias: true,
    shadows: true,
    helixBands: 14,
    helixCards: 28,
    enableAtmosphere: true,
  },
  medium: {
    tier: 'medium',
    dpr: [1, 1.5],
    particles: 14000,
    earthParticles: 14000,
    bloom: false,
    vignette: false,
    antialias: false,
    shadows: false,
    helixBands: 10,
    helixCards: 20,
    enableAtmosphere: true,
  },
  low: {
    tier: 'low',
    dpr: [1, 1],
    particles: 6000,
    earthParticles: 6000,
    bloom: false,
    vignette: false,
    antialias: false,
    shadows: false,
    helixBands: 0,
    helixCards: 0,
    enableAtmosphere: false,
  },
  static: {
    tier: 'static',
    dpr: [1, 1],
    particles: 0,
    earthParticles: 0,
    bloom: false,
    vignette: false,
    antialias: false,
    shadows: false,
    helixBands: 0,
    helixCards: 0,
    enableAtmosphere: false,
  },
};

function detectCapabilities(): DeviceCapabilities {
  if (typeof window === 'undefined') {
    return {
      hasWebGL: false,
      hasWebGL2: false,
      unmaskedRenderer: '',
      unmaskedVendor: '',
      isSoftwareRenderer: false,
      concurrency: 4,
      memoryGb: 4,
      isMobile: false,
      saveData: false,
    };
  }

  let hasWebGL = false;
  let hasWebGL2 = false;
  let unmaskedRenderer = '';
  let unmaskedVendor = '';
  let isSoftwareRenderer = false;

  try {
    const canvas = document.createElement('canvas');
    const gl2 = canvas.getContext('webgl2');
    hasWebGL2 = !!gl2;
    const gl = gl2 || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    hasWebGL = !!gl;

    if (gl) {
      const ext = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
      if (ext) {
        unmaskedRenderer = (gl as WebGLRenderingContext).getParameter(ext.UNMASKED_RENDERER_WEBGL) || '';
        unmaskedVendor = (gl as WebGLRenderingContext).getParameter(ext.UNMASKED_VENDOR_WEBGL) || '';
      }
      const lower = (unmaskedRenderer + ' ' + unmaskedVendor).toLowerCase();
      isSoftwareRenderer =
        lower.includes('swiftshader') ||
        lower.includes('llvmpipe') ||
        lower.includes('softpipe') ||
        lower.includes('software rasterizer') ||
        lower.includes('microsoft basic render');
    }
  } catch {
    hasWebGL = false;
    hasWebGL2 = false;
  }

  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const concurrency = nav.hardwareConcurrency || 4;
  const memoryGb = nav.deviceMemory || 4;
  const isMobile =
    (typeof window.matchMedia === 'function' ? window.matchMedia('(max-width: 768px)').matches : false) ||
    ('ontouchstart' in window && nav.maxTouchPoints > 1);
  const saveData = !!nav.connection?.saveData;

  return {
    hasWebGL,
    hasWebGL2,
    unmaskedRenderer,
    unmaskedVendor,
    isSoftwareRenderer,
    concurrency,
    memoryGb,
    isMobile,
    saveData,
  };
}

function computeAutoTier(caps: DeviceCapabilities, reducedMotion: boolean): QualityTier {
  if (reducedMotion || !caps.hasWebGL || caps.isSoftwareRenderer) {
    return 'static';
  }
  if (caps.saveData) {
    return 'low';
  }

  const rend = (caps.unmaskedRenderer + ' ' + caps.unmaskedVendor).toLowerCase();
  const isAppleSilicon = rend.includes('apple') || rend.includes('m1') || rend.includes('m2') || rend.includes('m3') || rend.includes('m4');
  const isDiscrete = rend.includes('nvidia') || rend.includes('geforce') || rend.includes('rtx') || rend.includes('gtx') || rend.includes('radeon') || rend.includes('amd');

  if ((isAppleSilicon || isDiscrete) && caps.concurrency >= 6 && !caps.isMobile) {
    return 'high';
  }

  if (caps.concurrency >= 6 && caps.memoryGb >= 6 && !caps.isMobile) {
    return 'high';
  }

  if (caps.isMobile && caps.concurrency >= 8 && caps.memoryGb >= 6) {
    return 'medium';
  }

  if (caps.concurrency <= 4 || caps.memoryGb < 4 || caps.isMobile) {
    return 'low';
  }

  return 'medium';
}

const QualityContext = createContext<QualityContextValue | null>(null);

export function QualityProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const capabilities = useMemo(() => detectCapabilities(), []);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mql.addEventListener?.('change', handler);
    return () => mql.removeEventListener?.('change', handler);
  }, []);

  const [userTier, setUserTierState] = useState<UserQualityPreference>(() => {
    if (typeof window === 'undefined') return 'auto';
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'high' || saved === 'medium' || saved === 'low' || saved === 'static') {
        return saved;
      }
    } catch {
      // Bỏ qua lỗi truy cập localStorage
    }
    return 'auto';
  });

  const setUserTier = useCallback((tier: UserQualityPreference) => {
    setUserTierState(tier);
    if (typeof window !== 'undefined') {
      try {
        if (tier === 'auto') {
          localStorage.removeItem(STORAGE_KEY);
        } else {
          localStorage.setItem(STORAGE_KEY, tier);
        }
      } catch {
        // Bỏ qua lỗi ghi localStorage
      }
    }
  }, []);

  const [downgradedTier, setDowngradedTier] = useState<QualityTier | null>(null);

  const activeTier: QualityTier = useMemo(() => {
    if (prefersReducedMotion) return 'static';
    if (userTier !== 'auto') return userTier;
    if (downgradedTier) return downgradedTier;
    return computeAutoTier(capabilities, prefersReducedMotion);
  }, [prefersReducedMotion, userTier, downgradedTier, capabilities]);

  const reportFpsDrop = useCallback(() => {
    setDowngradedTier((current) => {
      const base = current || computeAutoTier(capabilities, prefersReducedMotion);
      if (base === 'high') return 'medium';
      if (base === 'medium') return 'low';
      if (base === 'low') return 'static';
      return 'static';
    });
  }, [capabilities, prefersReducedMotion]);

  const config = useMemo(() => TIER_CONFIGS[activeTier], [activeTier]);

  const contextValue: QualityContextValue = useMemo(
    () => ({
      tier: activeTier,
      userTier,
      setUserTier,
      config,
      isMobile: capabilities.isMobile,
      prefersReducedMotion,
      capabilities,
      reportFpsDrop,
    }),
    [activeTier, userTier, setUserTier, config, capabilities, prefersReducedMotion, reportFpsDrop]
  );

  return <QualityContext.Provider value={contextValue}>{children}</QualityContext.Provider>;
}

export function useQuality(): QualityContextValue {
  const ctx = useContext(QualityContext);
  if (!ctx) {
    throw new Error('useQuality must be used within a QualityProvider');
  }
  return ctx;
}
