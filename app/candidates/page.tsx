'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { UserSearch, Search } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { MotionCard, CardSheen } from '@/components/ui/motion-card';
import { ScoreRing } from '@/components/ui/score-ring';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useTalentPool } from '@/hooks/use-talent-pool';
import { cn } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-muted text-muted-foreground',
  reviewing: 'bg-electric/15 text-electric',
  shortlisted: 'bg-primary/15 text-primary',
  interview: 'bg-accent/15 text-accent',
  offer: 'bg-success/15 text-success',
  rejected: 'bg-destructive/15 text-destructive',
};

export default function CandidatesPage() {
  const { candidates, loading } = useTalentPool();
  const [search, setSearch] = React.useState('');

  const filtered = candidates.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.skills.some(s => s.toLowerCase().includes(search.toLowerCase())) ||
    (c.current_company || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Candidates"
        description={`${candidates.length} candidates in your talent pool`}
        icon={<UserSearch className="h-5 w-5" />}
      />

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search candidates..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-44 animate-pulse rounded-xl bg-muted/40" />
        )) : filtered.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Link href={`/candidates/${c.id}`}>
              <MotionCard className="p-5" whileHover={{ y: -3 }}>
                <CardSheen />
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12 border border-glass-border">
                    <AvatarImage src={c.avatar_url || undefined} alt={c.name} />
                    <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">{c.name.split(' ').map(s=>s[0]).slice(0,2).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{c.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{c.job_title}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{c.current_company} · {c.years_experience}y</p>
                  </div>
                  <Badge className={cn('text-[10px]', STATUS_COLORS[c.status])}>{c.status}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {(c.skills || []).slice(0, 4).map(s => <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>)}
                  {c.skills.length > 4 && <span className="text-[10px] text-muted-foreground">+{c.skills.length - 4}</span>}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-glass-border pt-3">
                  <span className="text-[11px] text-muted-foreground">{c.location}</span>
                  <ScoreRing value={c.match_score} size={40} />
                </div>
              </MotionCard>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
