import { useRef, type RefObject } from 'react';
import { useScroll, useMotionValueEvent, type MotionValue } from 'motion/react';

export interface SectionProgressResult {
  /** Ref giữ giá trị số thực 0..1 để 3D useFrame đọc trực tiếp mỗi frame mà KHÔNG re-render React */
  progress: RefObject<number>;
  /** MotionValue phục vụ các biến đổi chuyển động của DOM (useTransform) */
  scrollYProgress: MotionValue<number>;
}

export function useSectionProgress(targetRef: RefObject<HTMLElement | null>): SectionProgressResult {
  const progress = useRef<number>(0);
  const { scrollYProgress } = useScroll({
    target: targetRef as RefObject<HTMLElement>,
    offset: ['start start', 'end end'],
  });

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    progress.current = Math.min(1, Math.max(0, latest));
  });

  return { progress, scrollYProgress };
}
