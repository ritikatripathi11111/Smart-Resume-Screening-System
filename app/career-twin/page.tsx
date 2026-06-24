'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, TrendingUp, Crown, Rocket, Target } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { MotionCard, CardSheen } from '@/components/ui/motion-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScoreRing } from '@/components/ui/score-ring';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useTalentPool } from '@/hooks/use-talent-pool';
import { useToast } from '@/hooks/use-toast';
import { generateCareerTwin } from '@/lib/ai';

export default function CareerTwinPage() {
  const sp = useSearchParams();
  const { candidates } = useTalentPool();
  const { toast } = useToast();
  const [candidateId, setCandidateId] = React.useState(sp.get('candidate') || '');
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<Awaited<ReturnType<typeof generateCareerTwin>> | null>(null);

  React.useEffect(() => { if (candidateId) analyze(); }, [candidateId]);

  async function analyze() {
    const c = candidates.find(x => x.id === candidateId);
    if (!c) return;
    setLoading(true); setResult(null);
    try {
      const r = await generateCareerTwin(c);
      setResult(r);
      toast({ title: 'Career Twin generated', description: 'Future trajectory projected.' });
    } finally { setLoading(false); }
  }

  const candidate = candidates.find(c => c.id === candidateId);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="AI Career Twin"
        description="Generate a future career projection — a digital twin of the candidate's growth path."
        icon={<Sparkles className="h-5 w-5" />}
        actions={<Badge variant="secondary" className="gap-1"><Crown className="h-3 w-3" /> Innovation</Badge>}
      />

      <MotionCard initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-4">
        <div className="flex gap-3">
          <Select value={candidateId} onValueChange={setCandidateId}>
            <SelectTrigger className="flex-1"><SelectValue placeholder="Select candidate" /></SelectTrigger>
            <SelectContent>{candidates.map(c => <SelectItem key={c.id} value={c.id}>{c.name} · {c.match_score}%</SelectItem>)}</SelectContent>
          </Select>
          <Button onClick={analyze} disabled={loading || !candidateId} className="gap-2 gradient-primary text-white">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Project</Button>
        </div>
      </MotionCard>

      <AnimatePresence mode="wait">
        {loading ? (
          <MotionCard key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-12 text-center">
            <div className="mx-auto mb-3 h-12 w-12 animate-pulse rounded-full bg-gradient-to-br from-primary to-accent" />
            <p className="text-sm text-muted-foreground">Building career twin simulation...</p>
          </MotionCard>
        ) : result ? (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4 lg:grid-cols-3">
            <MotionCard className="p-5">
              <CardSheen />
              <div className="mb-3 flex items-center gap-2"><Rocket className="h-4 w-4 text-primary" /><h2 className="font-display text-sm font-bold">1-Year Projection</h2></div>
              <p className="text-sm font-semibold">{result.one_year.role}</p>
              <p className="mt-1 text-xs text-muted-foreground">{result.one_year.focus}</p>
              <div className="mt-3"><ScoreRing value={result.one_year.probability} size={80} /><p className="mt-1 text-[10px] text-muted-foreground">Probability</p></div>
            </MotionCard>

            <MotionCard className="p-5">
              <CardSheen />
              <div className="mb-3 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-accent" /><h2 className="font-display text-sm font-bold">3-Year Projection</h2></div>
              <p className="text-sm font-semibold">{result.three_year.role}</p>
              <p className="mt-1 text-xs text-muted-foreground">{result.three_year.focus}</p>
              <div className="mt-3"><ScoreRing value={result.three_year.probability} size={80} colorVar="var(--accent)" /><p className="mt-1 text-[10px] text-muted-foreground">Probability</p></div>
            </MotionCard>

            <MotionCard className="p-5">
              <div className="mb-3 flex items-center gap-2"><Crown className="h-4 w-4 text-warning" /><h2 className="font-display text-sm font-bold">Leadership Readiness</h2></div>
              <p className="text-xs text-muted-foreground">{result.leadership.trajectory}</p>
              <div className="mt-3"><ScoreRing value={result.leadership.readiness} size={80} colorVar="var(--warning)" /><p className="mt-1 text-[10px] text-muted-foreground">Readiness</p></div>
            </MotionCard>

            <MotionCard className="p-5 lg:col-span-3">
              <div className="mb-3 flex items-center gap-2"><Target className="h-4 w-4 text-electric" /><h2 className="font-display text-sm font-bold">Twin Insights</h2></div>
              <ul className="space-y-2">
                {result.insights.map((s, i) => <li key={i} className="flex gap-2 text-sm text-muted-foreground"><span className="text-electric">•</span>{s}</li>)}
              </ul>
            </MotionCard>

            {candidate && <Button asChild className="lg:col-span-3 gradient-primary text-white" variant="default"><Link href={`/candidates/${candidate.id}`}>View full candidate profile</Link></Button>}
          </motion.div>
        ) : (
          <MotionCard key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center p-16 text-center">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10"><Sparkles className="h-8 w-8 text-primary" /></div>
            <p className="font-display text-lg font-semibold">Select a candidate</p>
            <p className="mt-1 text-sm text-muted-foreground">Generate their AI career twin projection.</p>
          </MotionCard>
        )}
      </AnimatePresence>
    </div>
  );
}
