'use client';

import * as React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

const MotionCard = React.forwardRef<HTMLDivElement, HTMLMotionProps<'div'> & { ref?: React.Ref<HTMLDivElement> }>(
  ({ className, children, ...props }, ref) => (
    <motion.div
      ref={ref as any}
      className={cn(
        'relative overflow-hidden rounded-xl border border-glass-border glass shadow-lg',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
);
MotionCard.displayName = 'MotionCard';

// subtle top gradient bar present on premium cards
export function CardSheen() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
  );
}

export { MotionCard };
