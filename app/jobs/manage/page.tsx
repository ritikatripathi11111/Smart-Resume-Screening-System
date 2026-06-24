'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Briefcase, Plus, MapPin, DollarSign, Users, Clock } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { MotionCard, CardSheen } from '@/components/ui/motion-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTalentPool } from '@/hooks/use-talent-pool';
import { Skeleton } from '@/components/ui/skeleton';

export default function JobsPage() {
  const { jobs, candidates, loading } = useTalentPool();

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Jobs"
        description={`${jobs.length} active positions in your pipeline`}
        icon={<Briefcase className="h-5 w-5" />}
        actions={<Button asChild className="gap-2 gradient-primary text-white"><Link href="/jobs"><Plus className="h-4 w-4" /> New Job</Link></Button>}
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-xl" />)}</div>
      ) : jobs.length === 0 ? (
        <MotionCard initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center p-16 text-center">
          <Briefcase className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="font-display font-semibold">No jobs yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Create your first job description.</p>
          <Button asChild className="mt-4 gap-2 gradient-primary text-white"><Link href="/jobs"><Plus className="h-4 w-4" /> Create Job</Link></Button>
        </MotionCard>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {jobs.map((j, i) => {
            const jobCandidates = candidates.filter(c => c.job_id === j.id);
            return (
              <motion.div key={j.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <MotionCard className="p-5" whileHover={{ y: -2 }}>
                  <CardSheen />
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h2 className="font-display text-base font-bold">{j.title}</h2>
                      <p className="text-xs text-muted-foreground">{j.role} · {j.department}</p>
                    </div>
                    <Badge className="capitalize bg-success/15 text-success">{j.status}</Badge>
                  </div>
                  <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">{j.description}</p>
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {j.skills.slice(0, 5).map(s => <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>)}
                    {j.skills.length > 5 && <span className="text-[10px] text-muted-foreground">+{j.skills.length - 5}</span>}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-glass-border pt-3 text-xs text-muted-foreground">
                    {j.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{j.location}</span>}
                    {j.experience && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{j.experience}</span>}
                    {j.salary_min && <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />${(j.salary_min / 1000).toFixed(0)}k</span>}
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{jobCandidates.length} candidates</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button asChild variant="outline" size="sm" className="flex-1"><Link href={`/ranking`}>View candidates</Link></Button>
                    <Button asChild variant="ghost" size="sm" className="flex-1"><Link href={`/jobs`}>Edit template</Link></Button>
                  </div>
                </MotionCard>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
