'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target, Sparkles, Loader2, XCircle, AlertTriangle, Award, GraduationCap,
  BookOpen, TrendingUp, Lightbulb,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { MotionCard, CardSheen } from '@/components/ui/motion-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select';
import { useTalentPool } from '@/hooks/use-talent-pool';
import { useToast } from '@/hooks/use-toast';
import { generateSkillGap } from '@/lib/ai';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export default function SkillGapPage() {
  const sp = useSearchParams();
  const { candidates, jobs } = useTalentPool();
  const { toast } = useToast();
  const [candidateId, setCandidateId] = React.useState(sp.get('candidate') || '');
  const [jobId, setJobId] = React.useState(jobs[0]?.id || '');
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<Awaited<ReturnType<typeof generateSkillGap>> | null>(null);

  React.useEffect(() => { if (!jobId && jobs[0]) setJobId(jobs[0].id); }, [jobs]);
  React.useEffect(() => {
    if (candidateId && jobId && candidates.find(c => c.id === candidateId) && jobs.find(j => j.id === jobId)) {
      analyze();
    }
  }, [candidateId, jobId]);

  async function analyze() {
    const candidate = candidates.find(c => c.id === candidateId);
    const job = jobs.find(j => j.id === jobId);
    if (!candidate || !job) return;
    setLoading(true); setResult(null);
    try {
      const r = await generateSkillGap(candidate, job);
      setResult(r);
      await supabase.from('skill_gaps').insert({
        candidate_id: candidate.id, job_id: job.id,
        missing_skills: r.missing_skills, weak_skills: r.weak_skills,
        suggested_certifications: r.suggested_certifications, learning_roadmap: r.learning_roadmap,
      });
      toast({ title: 'Analysis complete', description: `Found ${r.missing_skills.length} missing & ${r.weak_skills.length} weak skills.` });
    } finally { setLoading(false); }
  }

  const candidate = candidates.find(c => c.id === candidateId);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Skill Gap Analyzer"
        description="Compare a candidate's skills against a job's requirements to pinpoint gaps and build a roadmap."
        icon={<Target className="h-5 w-5" />}
      />

      <MotionCard initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Candidate</label>
            <Select value={candidateId} onValueChange={setCandidateId}>
              <SelectTrigger><SelectValue placeholder="Select candidate" /></SelectTrigger>
              <SelectContent>
                {candidates.map(c => <SelectItem key={c.id} value={c.id}>{c.name} · {c.match_score}%</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Job</label>
            <Select value={jobId} onValueChange={setJobId}>
              <SelectTrigger><SelectValue placeholder="Select job" /></SelectTrigger>
              <SelectContent>
                {jobs.map(j => <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={analyze} disabled={loading || !candidateId || !jobId} className="gap-2 gradient-primary text-white">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Analyze
          </Button>
        </div>
      </MotionCard>

      {candidate && (
        <MotionCard initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 p-4">
          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Candidate skills:</span>
            {candidate.skills.map(s => <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>)}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Job requires:</span>
            {jobs.find(j => j.id === jobId)?.skills.map(s => (
              <Badge key={s} className={cn('text-[10px]', candidate.skills.includes(s) ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive')}>
                {s} {candidate.skills.includes(s) ? '✓' : '✗'}
              </Badge>
            ))}
          </div>
        </MotionCard>
      )}

      <AnimatePresence mode="wait">
        {loading ? (
          <MotionCard key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-10 text-center">
            <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Analyzing skill gaps...</p>
          </MotionCard>
        ) : result ? (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4 lg:grid-cols-2">
            <MotionCard className="p-5">
              <CardSheen />
              <div className="mb-3 flex items-center gap-2"><XCircle className="h-4 w-4 text-destructive" /><h2 className="font-display text-sm font-bold">Missing Skills</h2></div>
              <div className="space-y-2">
                {result.missing_skills.map(s => (
                  <div key={s} className="flex items-center justify-between rounded-lg bg-destructive/5 p-2.5">
                    <span className="text-sm">{s}</span><Badge variant="outline" className="text-destructive">Missing</Badge>
                  </div>
                ))}
              </div>
            </MotionCard>

            <MotionCard className="p-5">
              <CardSheen />
              <div className="mb-3 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-warning" /><h2 className="font-display text-sm font-bold">Weak Skills</h2></div>
              <div className="space-y-2">
                {result.weak_skills.map(s => (
                  <div key={s} className="flex items-center justify-between rounded-lg bg-warning/5 p-2.5">
                    <span className="text-sm">{s}</span><Badge variant="outline" className="text-warning">Needs work</Badge>
                  </div>
                ))}
              </div>
            </MotionCard>

            <MotionCard className="p-5">
              <div className="mb-3 flex items-center gap-2"><Award className="h-4 w-4 text-electric" /><h2 className="font-display text-sm font-bold">Suggested Certifications</h2></div>
              <ul className="space-y-1.5">
                {result.suggested_certifications.map(s => <li key={s} className="flex gap-2 text-sm"><Award className="mt-0.5 h-3.5 w-3.5 shrink-0 text-electric" />{s}</li>)}
              </ul>
            </MotionCard>

            <MotionCard className="p-5">
              <div className="mb-3 flex items-center gap-2"><Lightbulb className="h-4 w-4 text-accent" /><h2 className="font-display text-sm font-bold">Recommendations</h2></div>
              <ul className="space-y-1.5">
                {result.recommendations.map((r, i) => <li key={i} className="flex gap-2 text-sm"><TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" /><span className="text-muted-foreground">{r}</span></li>)}
              </ul>
            </MotionCard>

            <MotionCard className="p-5 lg:col-span-2">
              <div className="mb-3 flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" /><h2 className="font-display text-sm font-bold">Learning Roadmap</h2></div>
              <div className="grid gap-3 sm:grid-cols-3">
                {result.learning_roadmap.map((p, i) => (
                  <div key={i} className="rounded-lg border border-glass-border p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <Badge className="bg-primary/15 text-primary">{p.phase.split(':')[0]}</Badge>
                      <span className="text-[10px] text-muted-foreground">{p.duration}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{p.focus}</p>
                  </div>
                ))}
              </div>
            </MotionCard>

            {candidate && (
              <div className="lg:col-span-2 flex gap-2">
                <Button asChild variant="outline" className="flex-1"><Link href={`/candidates/${candidate.id}`}>Back to candidate</Link></Button>
                <Button asChild className="flex-1 gradient-primary text-white"><Link href={`/interviews?candidate=${candidate.id}`}>Generate interview prep</Link></Button>
              </div>
            )}
          </motion.div>
        ) : (
          <MotionCard key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center p-16 text-center">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10"><Target className="h-8 w-8 text-primary" /></div>
            <p className="font-display text-lg font-semibold">Select a candidate & job</p>
            <p className="mt-1 text-sm text-muted-foreground">Choose both to run the skill gap analysis.</p>
          </MotionCard>
        )}
      </AnimatePresence>
    </div>
  );
}
