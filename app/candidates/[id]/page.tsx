'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft, MapPin, Mail, Phone, Briefcase, GraduationCap,
  Sparkles, ShieldAlert, TrendingUp, MessageSquare, BookOpen,
  Users, DollarSign, AlertTriangle, Brain, Zap, Trophy,
  Target, GitCompare,
} from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/page-header';
import { MotionCard, CardSheen } from '@/components/ui/motion-card';
import { ScoreRing } from '@/components/ui/score-ring';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { supabase, type Candidate } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

function ScoreTile({ icon, label, value, sublabel }: { icon: React.ReactNode; label: string; value: number; sublabel: string }) {
  return (
    <MotionCard variants={fadeUp} className="flex flex-col items-center p-4" whileHover={{ y: -2 }}>
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</div>
      <ScoreRing value={value} size={64} />
      <p className="mt-1 text-[11px] font-medium">{label}</p>
      <p className="text-[10px] text-muted-foreground">{sublabel}</p>
    </MotionCard>
  );
}

export default function CandidateDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [candidate, setCandidate] = React.useState<Candidate | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      const { data } = await supabase.from('candidates').select('*').eq('id', id).single();
      setCandidate(data as Candidate);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return (
    <div className="mx-auto max-w-6xl space-y-4">
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
  if (!candidate) return (
    <div className="mx-auto max-w-6xl py-20 text-center">
      <p className="text-muted-foreground">Candidate not found.</p>
      <Button asChild variant="outline" className="mt-4"><Link href="/candidates">Back to candidates</Link></Button>
    </div>
  );

  const radarData = [
    { skill: 'Skills', score: (candidate.match_breakdown as any)?.skills || 0 },
    { skill: 'Experience', score: (candidate.match_breakdown as any)?.experience || 0 },
    { skill: 'Education', score: (candidate.match_breakdown as any)?.education || 0 },
    { skill: 'Domain', score: (candidate.match_breakdown as any)?.domain || 0 },
    { skill: 'Soft', score: (candidate.match_breakdown as any)?.soft || 0 },
  ];

  const scores = [
    { icon: <Trophy className="h-4 w-4" />, label: 'Leadership', value: candidate.leadership_potential, sublabel: 'potential' },
    { icon: <MessageSquare className="h-4 w-4" />, label: 'Communication', value: candidate.communication_score, sublabel: 'clarity' },
    { icon: <BookOpen className="h-4 w-4" />, label: 'Learning', value: candidate.learning_ability_score, sublabel: 'ability' },
    { icon: <Users className="h-4 w-4" />, label: 'Culture Fit', value: candidate.culture_fit_score, sublabel: 'alignment' },
    { icon: <TrendingUp className="h-4 w-4" />, label: 'Job Switch', value: candidate.job_switch_probability, sublabel: 'likelihood' },
    { icon: <ShieldAlert className="h-4 w-4" />, label: 'Fraud Risk', value: candidate.fraud_risk_score, sublabel: 'inverse' },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/candidates" className="mb-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" /> Back to candidates
      </Link>

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5">
        {/* Profile header */}
        <MotionCard variants={fadeUp} className="relative overflow-hidden p-6">
          <CardSheen />
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/15 blur-[60px]" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
            <Avatar className="h-20 w-20 border-2 border-glass-border">
              <AvatarImage src={candidate.avatar_url || undefined} alt={candidate.name} />
              <AvatarFallback className="bg-primary/15 text-lg font-bold text-primary">{candidate.name.split(' ').map(s=>s[0]).slice(0,2).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-bold">{candidate.name}</h1>
                <Badge className="capitalize bg-primary/15 text-primary">{candidate.status}</Badge>
                {candidate.fraud_risk_score > 20 && (
                  <Badge variant="destructive" className="gap-1"><ShieldAlert className="h-3 w-3" /> Risk flagged</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{candidate.job_title} at {candidate.current_company}</p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{candidate.location}</span>
                <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{candidate.years_experience} years</span>
                <span className="flex items-center gap-1"><GraduationCap className="h-3 w-3" />{candidate.education}</span>
                {candidate.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{candidate.email}</span>}
                {candidate.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{candidate.phone}</span>}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <ScoreRing value={candidate.match_score} size={88} sublabel="match" />
              <p className="mt-1 text-[10px] text-muted-foreground">Overall match</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {candidate.skills.map(s => <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>)}
          </div>
        </MotionCard>

        {/* AI Summary */}
        <MotionCard variants={fadeUp} className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent"><Sparkles className="h-4 w-4" /></div>
            <h2 className="font-display text-sm font-bold">AI Summary</h2>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{candidate.ai_summary}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-success/20 bg-success/5 p-3">
              <p className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-success"><Zap className="h-3 w-3" />Strengths</p>
              <ul className="space-y-1">
                {(candidate.strengths || []).map((s, i) => <li key={i} className="text-xs text-muted-foreground">• {s}</li>)}
              </ul>
            </div>
            <div className="rounded-lg border border-warning/20 bg-warning/5 p-3">
              <p className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-warning"><AlertTriangle className="h-3 w-3" />Weaknesses</p>
              <ul className="space-y-1">
                {(candidate.weaknesses || []).map((s, i) => <li key={i} className="text-xs text-muted-foreground">• {s}</li>)}
              </ul>
            </div>
          </div>
        </MotionCard>

        <div className="grid gap-5 lg:grid-cols-3">
          {/* Radar */}
          <MotionCard variants={fadeUp} className="p-5 lg:col-span-2">
            <div className="mb-3 flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              <h2 className="font-display text-sm font-bold">Match Breakdown</h2>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }} />
                  <Radar dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.35} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </MotionCard>

          {/* Career prediction */}
          <MotionCard variants={fadeUp} className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-electric" />
              <h2 className="font-display text-sm font-bold">Career Growth</h2>
            </div>
            <p className="text-xs text-muted-foreground">{candidate.career_growth_prediction}</p>
            <div className="mt-3 rounded-lg bg-muted/40 p-3">
              <p className="text-[11px] font-medium text-muted-foreground">Salary Expectation</p>
              <p className="font-display text-lg font-bold text-foreground">${(candidate.salary_expectation || 0).toLocaleString()}</p>
            </div>
            <div className="mt-2 rounded-lg bg-muted/40 p-3">
              <p className="text-[11px] font-medium text-muted-foreground">Source</p>
              <p className="text-sm font-medium">{candidate.source}</p>
            </div>
          </MotionCard>
        </div>

        {/* Intelligence scores grid */}
        <motion.div variants={stagger} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {scores.map(s => <ScoreTile key={s.label} {...s} />)}
        </motion.div>

        {/* Risk indicators */}
        {candidate.risk_indicators && candidate.risk_indicators.length > 0 && (
          <MotionCard variants={fadeUp} className="border-destructive/20 p-5">
            <div className="mb-3 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-destructive" />
              <h2 className="font-display text-sm font-bold">Risk Indicators</h2>
            </div>
            <div className="space-y-2">
              {candidate.risk_indicators.map((r: any, i: number) => (
                <div key={i} className="flex items-start gap-2 rounded-lg bg-destructive/5 p-2.5">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
                  <div>
                    <p className="text-xs font-medium capitalize">{r.type.replace(/_/g, ' ')}</p>
                    <p className="text-[11px] text-muted-foreground">{r.detail}</p>
                  </div>
                  <Badge variant="outline" className={cn('ml-auto text-[9px]', r.severity === 'high' ? 'border-destructive text-destructive' : 'border-warning text-warning')}>{r.severity}</Badge>
                </div>
              ))}
            </div>
          </MotionCard>
        )}

        {/* Quick actions */}
        <MotionCard variants={fadeUp} className="flex flex-wrap items-center gap-2 p-4">
          <span className="text-xs font-medium text-muted-foreground">AI actions:</span>
          <Button asChild size="sm" variant="outline"><Link href={`/interviews?candidate=${candidate.id}`}><MessageSquare className="mr-1 h-3.5 w-3.5" /> Generate Interview</Link></Button>
          <Button asChild size="sm" variant="outline"><Link href={`/skill-gap?candidate=${candidate.id}`}><Target className="mr-1 h-3.5 w-3.5" /> Skill Gap</Link></Button>
          <Button asChild size="sm" variant="outline"><Link href={`/career-twin?candidate=${candidate.id}`}><Sparkles className="mr-1 h-3.5 w-3.5" /> Career Twin</Link></Button>
          <Button asChild size="sm" variant="outline"><Link href={`/compare?add=${candidate.id}`}><GitCompare className="mr-1 h-3.5 w-3.5" /> Compare</Link></Button>
          <Button asChild size="sm" className="ml-auto gradient-primary text-white"><Link href={`/decisions?candidate=${candidate.id}`}>Hiring Decision</Link></Button>
        </MotionCard>
      </motion.div>
    </div>
  );
}
