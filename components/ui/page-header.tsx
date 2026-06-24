'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type Props = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
};

export function PageHeader({ title, description, icon, actions, className }: Props) {
  return (
    <div className={cn('mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between', className)}>
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-start gap-3"
      >
        {icon ? (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
            {icon}
          </div>
        ) : null}
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-[28px]">{title}</h1>
          {description ? (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </motion.div>
      {actions ? (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex shrink-0 items-center gap-2"
        >
          {actions}
        </motion.div>
      ) : null}
    </div>
  );
}
