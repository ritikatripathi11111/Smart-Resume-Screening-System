'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type Props = {
  value: number;
  max?: number;
  size?: number;
  label?: React.ReactNode;
  sublabel?: string;
  className?: string;
  colorVar?: string;
};

export function ScoreRing({
  value,
  max = 100,
  size = 80,
  label,
  sublabel,
  className,
  colorVar = 'var(--primary)',
}: Props) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(1, Math.max(0, value / max));
  const offset = circumference * (1 - pct);
  const color = value >= 85 ? 'var(--success)' : value >= 70 ? colorVar : value >= 50 ? 'var(--warning)' : 'var(--destructive)';

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth="5"
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label ?? (
          <span className="font-display text-lg font-bold leading-none" style={{ color }}>
            {Math.round(value)}
          </span>
        )}
        {sublabel ? <span className="text-[9px] text-muted-foreground">{sublabel}</span> : null}
      </div>
    </div>
  );
}
