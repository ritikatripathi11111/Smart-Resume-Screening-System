'use client';

import * as React from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { RoleProvider } from '@/components/providers/role-provider';
import { TalentPoolProvider } from '@/hooks/use-talent-pool';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      <TalentPoolProvider>
        <TooltipProvider delayDuration={200}>
          <AppShell>{children}</AppShell>
          <Toaster />
        </TooltipProvider>
      </TalentPoolProvider>
    </RoleProvider>
  );
}
