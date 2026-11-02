import React, { useId } from 'react';
import { cn } from '@/lib/cn';

export interface StampMarkProps {
  n: string;
  where: string;
  className?: string;
}

// Con dấu tròn đóng xuống góc sổ tay khi gặp xong một loài
export function StampMark({ n, where, className }: StampMarkProps): React.JSX.Element {
  const rawId = useId();
  const id = `stamp-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  return (
    <svg
      viewBox="0 0 132 132"
      aria-hidden="true"
      className={cn(
        'stamp pointer-events-none absolute size-28 text-[#6ee7b7] drop-shadow-[0_10px_28px_rgba(110,231,183,.35)] md:size-32',
        className
      )}
    >
      <defs>
        <path id={id} d="M66,66 m-48,0 a48,48 0 1,1 96,0 a48,48 0 1,1 -96,0" />
      </defs>
      <circle cx="66" cy="66" r="61" fill="rgba(6,24,18,.82)" stroke="currentColor" strokeWidth="2.5" />
      <circle
        cx="66"
        cy="66"
        r="55"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <circle cx="66" cy="66" r="37" fill="none" stroke="currentColor" strokeWidth="1" />
      <text fill="currentColor" fontSize="9.5" fontWeight="700" letterSpacing="2.1">
        <textPath href={`#${id}`}>ĐÃ GẶP · TRẠM {n} · {where} ·</textPath>
      </text>
      <text
        x="66"
        y="72"
        textAnchor="middle"
        fill="currentColor"
        fontSize="22"
        fontWeight="700"
      >
        {n}
      </text>
    </svg>
  );
}
