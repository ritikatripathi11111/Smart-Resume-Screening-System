'use client';

import { ShieldCheck } from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { useRole, ROLES } from '@/components/providers/role-provider';

export function RoleSwitcher() {
  const { role, setRole } = useRole();
  return (
    <Select value={role} onValueChange={(v) => setRole(v as any)}>
      <SelectTrigger
        className="hidden h-10 w-[150px] gap-2 border-glass-border bg-background/50 font-medium sm:flex"
        aria-label="Switch role"
      >
        <ShieldCheck className="h-4 w-4 text-primary" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ROLES.map((r) => (
          <SelectItem key={r.id} value={r.id}>
            <div className="flex flex-col">
              <span className="font-medium">{r.label}</span>
              <span className="text-[10px] text-muted-foreground">{r.description}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
