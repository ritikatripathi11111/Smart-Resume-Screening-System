'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Trophy, Users, FileText, TrendingUp, Target, Sparkles, ArrowRight,
  Clock, DollarSign, Activity, Zap, Brain,
} from 'lucide-react';
import { useTalentPool } from '@/hooks/use-talent-pool';
import { MotionCard, CardSheen } from '@/components/ui/motion-card';
import { ScoreRing } from '@/components/ui/score-ring';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as any } },
};

function StatCard({
  label, value, delta, icon, accent,
}: { label: string; value: string | number; delta: string; icon: React.ReactNode; accent: string }) {
  return (
    <MotionCard variants={fadeUp} className="p-5" whileHover={{ y: -3 }}>
      <CardSheen />
      <div className="flex items-start justify-between">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', accent)}>
          {icon}
        </div>
        <Badge variant="secondary" className="text-success gap-1 bg-success/10">
          <TrendingUp className="h-3 w-3" /> {delta}
        </Badge>
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold font-display tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </MotionCard>
  );
}

export default function DashboardPage() {
  const { candidates, jobs, loading } = useTalentPool();

  const stats = [
    { label: 'Active Candidates', value: String(candidates.length), delta: '+12%', icon: <Users className="h-5 w-5 text-primary" />, accent: 'bg-primary/10' },
    { label: 'Open Positions', value: String(jobs.length), delta: '+3', icon: <FileText className="h-5 w-5 text-accent" />, accent: 'bg-accent/10' },
    { label: 'Avg Match Score', value: Math.round(candidates.reduce((a, c) => a + (c.match_score || 0), 0) / Math.max(1, candidates.length)) || '0', delta: '+5%', icon: <Target className="h-5 w-5 text-electric" />, accent: 'bg-electric/10' },
    { label: 'Shortlisted', value: String(candidates.filter(c => c.status === 'shortlisted' || c.status === 'interview' || c.status === 'offer').length), delta: '+8', icon: <Trophy className="h-5 w-5 text-success" />, accent: 'bg-success/10' },
  ];

  const topCandidates = candidates.slice(0, 5);
  const avgTimeToHire = 24;
  const costPerHire = 4200;
  const offerRate = candidates.filter(c => c.status === 'offer').length;

  return (
    <div className="mx-auto max-w-[1500px]">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-6 overflow-hidden rounded-2xl border border-glass-border glass-strong p-6 md:p-8"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/20 blur-[80px]" />
        <div className="pointer-events-none absolute -bottom-16 right-32 h-48 w-48 rounded-full bg-accent/20 blur-[70px]" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <Badge className="mb-3 gap-1 bg-primary/10 text-primary hover:bg-primary/15">
              <Sparkles className="h-3 w-3" /> AI-Powered Talent Intelligence
            </Badge>
            <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              Welcome to <span className="gradient-text">TalentAI</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              Screen resumes, rank candidates, generate interviews, and make data-driven hiring decisions — all powered by AI.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/upload"><Button className="gap-2 gradient-primary text-white glow-primary"><Zap className="h-4 w-4" /> Upload Resume</Button></Link>
            <Link href="/copilot"><Button variant="outline" className="gap-2 border-glass-border"><Brain className="h-4 w-4" /> AI Copilot</Button></Link>
          </div>
        </div>
      </motion.div>

      {/* Stat cards */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top candidates */}
        <motion.div initial="hidden" animate="show" variants={stagger} className="lg:col-span-2">
          <MotionCard variants={fadeUp} className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold">Top Ranked Candidates</h2>
                <p className="text-xs text-muted-foreground">AI-matched against active roles</p>
              </div>
              <Link href="/ranking">
                <Button variant="ghost" size="sm" className="gap-1 text-primary">
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
            <div className="space-y-2">
              {loading ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-muted/40" />
              )) : topCandidates.map((c, i) => (
                <motion.div
                  key={c.id}
                  variants={fadeUp}
                  whileHover={{ x: 3 }}
                >
                  <Link href={`/candidates/${c.id}`} className="flex items-center gap-3 rounded-lg border border-transparent p-2.5 transition hover:border-glass-border hover:bg-muted/30">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-xs font-bold text-muted-foreground">
                      {i + 1}
                    </div>
                    <Avatar className="h-10 w-10 border border-glass-border">
                      <AvatarImage src={c.avatar_url || undefined} alt={c.name} />
                      <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                        {c.name.split(' ').map(s => s[0]).slice(0,2).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{c.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{c.job_title} · {c.years_experience}y exp</p>
                    </div>
                    <div className="hidden gap-1.5 sm:flex">
                      {(c.skills || []).slice(0, 3).map(s => (
                        <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <ScoreRing value={c.match_score} size={42} sublabel="" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </MotionCard>
        </motion.div>

        {/* Side metrics */}
        <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-4">
          <MotionCard variants={fadeUp} className="p-5">
            <CardSheen />
            <div className="mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4 text-accent" />
              <h2 className="font-display text-sm font-bold">Recruitment Efficiency</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted/40 p-3">
                <Clock className="mb-1 h-4 w-4 text-primary" />
                <p className="text-xl font-bold">{avgTimeToHire}<span className="text-xs font-normal text-muted-foreground">d</span></p>
                <p className="text-[10px] text-muted-foreground">Time to hire</p>
              </div>
              <div className="rounded-lg bg-muted/40 p-3">
                <DollarSign className="mb-1 h-4 w-4 text-success" />
                <p className="text-xl font-bold">${(costPerHire / 1000).toFixed(1)}<span className="text-xs font-normal text-muted-foreground">k</span></p>
                <p className="text-[10px] text-muted-foreground">Cost per hire</p>
              </div>
              <div className="rounded-lg bg-muted/40 p-3">
                <Trophy className="mb-1 h-4 w-4 text-warning" />
                <p className="text-xl font-bold">{offerRate}</p>
                <p className="text-[10px] text-muted-foreground">Offers extended</p>
              </div>
              <div className="rounded-lg bg-muted/40 p-3">
                <Target className="mb-1 h-4 w-4 text-electric" />
                <p className="text-xl font-bold">68<span className="text-xs font-normal text-muted-foreground">%</span></p>
                <p className="text-[10px] text-muted-foreground">Offer accept</p>
              </div>
            </div>
          </MotionCard>

          <MotionCard variants={fadeUp} className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" />
              <h2 className="font-display text-sm font-bold">AI Insights</h2>
            </div>
            <div className="space-y-2 text-xs">
              <div className="rounded-lg border border-glass-border p-2.5">
                <p className="font-medium text-foreground">High-potential candidate detected</p>
                <p className="text-muted-foreground">Aisha Okafor shows 96% match & strong leadership signals.</p>
              </div>
              <div className="rounded-lg border border-glass-border p-2.5">
                <p className="font-medium text-foreground">Fraud risk flagged</p>
                <p className="text-muted-foreground">1 candidate has elevated risk score — review recommended.</p>
              </div>
              <div className="rounded-lg border border-glass-border p-2.5">
                <p className="font-medium text-foreground">Skill demand rising</p>
                <p className="text-muted-foreground">GraphQL & Next.js demand up 32% this quarter.</p>
              </div>
            </div>
          </MotionCard>
        </motion.div>
      </div>
    </div>
  );
}
