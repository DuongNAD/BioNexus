import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

export const CelebrationConfetti: React.FC = () => {
  const reduceMotion = useReducedMotion();
  // 24 hạt phát quang màu ngọc lục bảo và cực quang rơi nhẹ; tạo một lần để render lại không làm hạt nhảy chỗ
  const [particles] = useState(() =>
    Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2.5 + Math.random() * 2,
      size: 4 + Math.random() * 6,
      color: i % 3 === 0 ? '#6ee7b7' : i % 3 === 1 ? '#5eead4' : '#fef08a',
      driftA: (Math.random() - 0.5) * 60,
      driftB: (Math.random() - 0.5) * 100,
    }))
  );

  if (reduceMotion) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full shadow-[0_0_8px_currentColor]"
          style={{
            left: `${p.x}%`,
            top: '-20px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            color: p.color,
          }}
          initial={{ y: 0, opacity: 1, rotate: 0 }}
          animate={{
            y: window.innerHeight + 50,
            opacity: [0, 1, 1, 0],
            rotate: 360,
            x: [0, p.driftA, p.driftB],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
};

export const AnimatedCheckmark: React.FC<{ size?: number; className?: string }> = ({
  size = 48,
  className = '',
}) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.circle
          cx="24"
          cy="24"
          r="22"
          stroke="#6ee7b7"
          strokeWidth="3"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        <motion.path
          d="M14 24L21 31L34 18"
          stroke="#6ee7b7"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, delay: 0.3, ease: 'easeOut' }}
        />
      </motion.svg>
    </div>
  );
};
