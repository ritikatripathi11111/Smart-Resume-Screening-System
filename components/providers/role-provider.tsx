'use client';

import * as React from 'react';
import { Sparkles } from 'lucide-react';

export type Role = 'super_admin' | 'hr_recruiter' | 'hiring_manager' | 'interview_panel';

export const ROLES: { id: Role; label: string; description: string }[] = [
  { id: 'super_admin', label: 'Super Admin', description: 'Full platform access' },
  { id: 'hr_recruiter', label: 'HR Recruiter', description: 'Source & screen candidates' },
  { id: 'hiring_manager', label: 'Hiring Manager', description: 'Lead hiring decisions' },
  { id: 'interview_panel', label: 'Interview Panel', description: 'Interview & evaluate' },
];

export const ROLE_PERMISSIONS: Record<Role, { canHire: boolean; canManageUsers: boolean }> = {
  super_admin: { canHire: true, canManageUsers: true },
  hr_recruiter: { canHire: false, canManageUsers: false },
  hiring_manager: { canHire: true, canManageUsers: false },
  interview_panel: { canHire: false, canManageUsers: false },
};

type RoleContextValue = {
  role: Role;
  setRole: (r: Role) => void;
  user: { name: string; email: string; avatar: string };
};

const RoleContext = React.createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = React.useState<Role>('hr_recruiter');
  const roleMap: Record<Role, { name: string; email: string; avatar: string }> = {
    super_admin: {
      name: 'Alex Morgan',
      email: 'alex.admin@talentai.io',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=80',
    },
    hr_recruiter: {
      name: 'Jordan Reed',
      email: 'jordan.reed@talentai.io',
      avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=80',
    },
    hiring_manager: {
      name: 'Taylor Brooks',
      email: 'taylor.brooks@talentai.io',
      avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=80',
    },
    interview_panel: {
      name: 'Casey Liu',
      email: 'casey.liu@talentai.io',
      avatar: 'https://images.pexels.com/photos/3779448/pexels-photo-3779448.jpeg?auto=compress&cs=tinysrgb&w=80',
    },
  };
  return (
    <RoleContext.Provider value={{ role, setRole, user: roleMap[role] }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = React.useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
}

export const PLATFORM_BRAND = { name: 'TalentAI', icon: Sparkles };
