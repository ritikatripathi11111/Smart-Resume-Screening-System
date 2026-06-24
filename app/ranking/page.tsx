'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Filter, ArrowUpDown, ChevronRight, MapPin, Briefcase } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { MotionCard, CardSheen } from '@/components/ui/motion-card';
import { ScoreRing } from '@/components/ui/score-ring';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useTalentPool } from '@/hooks/use-talent-pool';
import { cn } from '@/lib/utils';
import type { Candidate } from '@/lib/supabase';

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-muted text-muted-foreground',
  reviewing: 'bg-electric/15 text-electric',
  shortlisted: 'bg-primary/15 text-primary',
  interview: 'bg-accent/15 text-accent',
  offer: 'bg-success/15 text-success',
  rejected: 'bg-destructive/15 text-destructive',
};

function MatchBreakdownBar({ label, value }: { label: string; value: number }) {
  const color = value >= 85 ? 'bg-success' : value >= 70 ? 'bg-primary' : value >= 50 ? 'bg-warning' : 'bg-destructive';
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 shrink-0 text-[11px] text-muted-foreground">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <motion.div className={cn('h-full rounded-full', color)} initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
      </div>
      <span className="w-7 text-right text-xs font-medium">{value}</span>
    </div>
  );
}

export default function RankingPage() {
  const { candidates, loading } = useTalentPool();
  const [search, setSearch] = React.useState('');
  const [expFilter, setExpFilter] = React.useState('all');
  const [scoreFilter, setScoreFilter] = React.useState('all');
  const [sort, setSort] = React.useState<'score' | 'exp' | 'name'>('score');
  const [expanded, setExpanded] = React.useState<string | null>(null);

  const allSkills = React.useMemo(() => Array.from(new Set(candidates.flatMap(c => c.skills))).sort(), [candidates]);

  const filtered = React.useMemo(() => {
    let list = candidates.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))
    );
    if (expFilter !== 'all') {
      const [min, max] = expFilter.split('-').map(Number);
      list = list.filter(c => {
        const y = c.years_experience || 0;
        return max ? y >= min && y <= max : y >= min;
      });
    }
    if (scoreFilter !== 'all') {
      const [min] = scoreFilter.split('-').map(Number);
      list = list.filter(c => c.match_score >= min);
    }
    list = [...list].sort((a, b) => {
      if (sort === 'score') return b.match_score - a.match_score;
      if (sort === 'exp') return (b.years_experience || 0) - (a.years_experience || 0);
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [candidates, search, expFilter, scoreFilter, sort]);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="AI Candidate Ranking Engine"
        description={`${filtered.length} candidates ranked by AI semantic match score.`}
        icon={<Trophy className="h-5 w-5" />}
      />

      {/* Filters */}
      <MotionCard initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by name or skill..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={expFilter} onValueChange={setExpFilter}>
            <SelectTrigger className="w-full lg:w-[150px]"><SelectValue placeholder="Experience" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All experience</SelectItem>
              <SelectItem value="0-3">0-3 years</SelectItem>
              <SelectItem value="4-6">4-6 years</SelectItem>
              <SelectItem value="7-10">7-10 years</SelectItem>
              <SelectItem value="10-50">10+ years</SelectItem>
            </SelectContent>
          </Select>
          <Select value={scoreFilter} onValueChange={setScoreFilter}>
            <SelectTrigger className="w-full lg:w-[150px]"><SelectValue placeholder="Min score" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any score</SelectItem>
              <SelectItem value="90-100">90+ (Elite)</SelectItem>
              <SelectItem value="80-100">80+ (Strong)</SelectItem>
              <SelectItem value="70-100">70+ (Good)</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as any)}>
            <SelectTrigger className="w-full lg:w-[150px]"><ArrowUpDown className="h-4 w-4" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="score">Sort: Match score</SelectItem>
              <SelectItem value="exp">Sort: Experience</SelectItem>
              <SelectItem value="name">Sort: Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </MotionCard>

      {/* Ranking table */}
      <div className="space-y-2">
        <AnimatePresence>
          {loading ? Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-muted/40" />
          )) : filtered.map((c, i) => (
            <motion.div key={c.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <MotionCard className="p-3 sm:p-4" whileHover={{ y: -1 }}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-display text-sm font-bold',
                    i === 0 ? 'bg-warning/15 text-warning' : i === 1 ? 'bg-muted text-muted-foreground' : i === 2 ? 'bg-orange-500/15 text-orange-500' : 'bg-muted/50 text-muted-foreground'
                  )}>
                    {i + 1}
                  </div>
                  <Avatar className="h-11 w-11 border border-glass-border">
                    <AvatarImage src={c.avatar_url || undefined} alt={c.name} />
                    <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">{c.name.split(' ').map(s=>s[0]).slice(0,2).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">{c.name}</p>
                      <Badge className={cn('text-[10px]', STATUS_COLORS[c.status] || 'bg-muted')}>{c.status}</Badge>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      <Briefcase className="mr-1 inline h-3 w-3" />{c.job_title} · {c.current_company} · {c.years_experience}y
                      <MapPin className="ml-2 mr-1 inline h-3 w-3" />{c.location}
                    </p>
                  </div>
                  <div className="hidden items-center gap-1 sm:flex">
                    {(c.skills || []).slice(0, 3).map(s => <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>)}
                    {c.skills.length > 3 && <span className="text-[10px] text-muted-foreground">+{c.skills.length - 3}</span>}
                  </div>
                  <ScoreRing value={c.match_score} size={48} sublabel="match" />
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setExpanded(expanded === c.id ? null : c.id)}>
                    <ChevronRight className={cn('h-4 w-4 transition-transform', expanded === c.id && 'rotate-90')} />
                  </Button>
                </div>

                <AnimatePresence>
                  {expanded === c.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="mt-4 grid gap-4 border-t border-glass-border pt-4 lg:grid-cols-2">
                        <div className="space-y-2">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Match Breakdown</p>
                          {Object.entries(c.match_breakdown || {}).map(([k, v]: [string, any]) => (
                            <MatchBreakdownBar key={k} label={k.charAt(0).toUpperCase() + k.slice(1)} value={Number(v)} />
                          ))}
                        </div>
                        <div>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Strengths</p>
                          <ul className="space-y-1">
                            {(c.strengths || []).slice(0, 3).map((s, i) => <li key={i} className="flex gap-1.5 text-xs"><span className="text-success">+</span><span className="text-muted-foreground">{s}</span></li>)}
                          </ul>
                          <Link href={`/candidates/${c.id}`}>
                            <Button variant="outline" size="sm" className="mt-3 w-full">View Full Intelligence →</Button>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </MotionCard>
            </motion.div>
          ))}
        </AnimatePresence>
        {!loading && filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-glass-border p-10 text-center text-sm text-muted-foreground">No candidates match these filters.</div>
        )}
      </div>
    </div>
  );
}
