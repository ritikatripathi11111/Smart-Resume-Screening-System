'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FileUp, FileText, Trophy, UserSearch, GitCompare,
  MessageSquareCode, Target, BarChart3, Sparkles, Briefcase, ChevronLeft,
  ChevronRight, ShieldAlert, Mic, Bot, CheckSquare, Search, Bell,
  type LucideIcon, Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useRole, ROLES, type Role } from '@/components/providers/role-provider';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { RoleSwitcher } from '@/components/layout/role-switcher';
import { UserNav } from '@/components/layout/user-nav';

type NavItem = { href: string; label: string; icon: LucideIcon; group: string };

const NAV: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, group: 'Overview' },
  { href: '/upload', label: 'Resume Upload', icon: FileUp, group: 'Core' },
  { href: '/jobs', label: 'Job Builder', icon: FileText, group: 'Core' },
  { href: '/ranking', label: 'Candidate Ranking', icon: Trophy, group: 'Core' },
  { href: '/candidates', label: 'Candidates', icon: UserSearch, group: 'Core' },
  { href: '/compare', label: 'Comparison Matrix', icon: GitCompare, group: 'Core' },
  { href: '/copilot', label: 'Recruiter Copilot', icon: Bot, group: 'AI Tools' },
  { href: '/interviews', label: 'Interview Copilot', icon: MessageSquareCode, group: 'AI Tools' },
  { href: '/skill-gap', label: 'Skill Gap Analyzer', icon: Target, group: 'AI Tools' },
  { href: '/enhancer', label: 'Resume Enhancer', icon: Sparkles, group: 'AI Tools' },
  { href: '/analytics', label: 'Talent Analytics', icon: BarChart3, group: 'Insights' },
  { href: '/career-twin', label: 'AI Career Twin', icon: Sparkles, group: 'Innovation' },
  { href: '/fraud', label: 'Fraud Detection', icon: ShieldAlert, group: 'Innovation' },
  { href: '/voice', label: 'Voice Analyzer', icon: Mic, group: 'Innovation' },
  { href: '/decisions', label: 'Hiring Decisions', icon: CheckSquare, group: 'Workflow' },
  { href: '/jobs/manage', label: 'Jobs', icon: Briefcase, group: 'Workflow' },
];

function NavButton({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const pathname = usePathname();
  const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
  const Icon = item.icon;
  return (
    <Link href={item.href} className="block">
      <Button
        variant={active ? 'secondary' : 'ghost'}
        className={cn(
          'w-full justify-start gap-3 font-medium transition-all',
          active
            ? 'bg-primary/15 text-primary hover:bg-primary/20'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
          collapsed ? 'px-2' : 'px-3'
        )}
        title={collapsed ? item.label : undefined}
      >
        <Icon className="h-[18px] w-[18px] shrink-0" />
        {!collapsed && <span className="truncate">{item.label}</span>}
        {active && !collapsed && (
          <motion.span
            layoutId="nav-active"
            className="absolute right-2 h-1.5 w-1.5 rounded-full bg-primary"
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          />
        )}
      </Button>
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();

  const groups = React.useMemo(() => {
    const g: Record<string, NavItem[]> = {};
    NAV.forEach((n) => { (g[n.group] ||= []).push(n); });
    return g;
  }, []);

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className={cn('flex items-center gap-2.5 px-3 py-5', collapsed && 'justify-center px-2')}>
        <Link href="/" className="flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent glow-primary">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-none">
              <span className="font-display text-[15px] font-bold tracking-tight">TalentAI</span>
              <span className="text-[10px] text-muted-foreground">Talent Intelligence</span>
            </div>
          )}
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-2 pb-4">
        <nav className="flex flex-col gap-4">
          {Object.entries(groups).map(([group, items]) => (
            <div key={group} className="space-y-1">
              {!collapsed && (
                <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {group}
                </p>
              )}
              {items.map((item) => (
                <NavButton key={item.href} item={item} collapsed={collapsed} />
              ))}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );

  return (
    <div className="relative flex min-h-screen">
      <div className="pointer-events-none fixed left-[-10%] top-[-10%] -z-10 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
      <div className="pointer-events-none fixed right-[-10%] bottom-[-10%] -z-10 h-[500px] w-[500px] rounded-full bg-accent/10 blur-[120px]" />

      <aside
        className={cn(
          'sticky top-0 hidden h-screen shrink-0 flex-col border-r border-glass-border glass-strong transition-[width] duration-300 lg:flex',
          collapsed ? 'w-[68px]' : 'w-[252px]'
        )}
      >
        {sidebarContent}
        <div className="border-t border-glass-border p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(c => !c)}
            className="h-9 w-9 text-muted-foreground"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 z-50 h-screen w-[260px] border-r border-glass-border glass-strong lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-glass-border glass-strong px-4 md:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search candidates, jobs, skills..."
              className="h-10 w-full rounded-lg border border-glass-border bg-background/50 pl-9 pr-4 text-sm outline-none ring-primary/30 transition placeholder:text-muted-foreground focus:ring-2"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="relative text-muted-foreground">
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent" />
            </Button>
            <RoleSwitcher />
            <UserNav />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-6 lg:px-8">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
