'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitCompare, X, Plus, Trophy, TrendingUp, DollarSign, GraduationCap,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { MotionCard, CardSheen } from '@/components/ui/motion-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select';
import { ScoreRing } from '@/components/ui/score-ring';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend,
} from 'recharts';
import { useTalentPool } from '@/hooks/use-talent-pool';
import { supabase, type Candidate } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export default function ComparePage() {
  const { candidates } = useTalentPool();
  const searchParams = useSearchParams();
  const initialAdd = searchParams.get('add');
  const [selected, setSelected] = React.useState<Candidate[]>([]);
  const [picking, setPicking] = React.useState('');

  React.useEffect(() => {
    if (initialAdd) {
      supabase.from('candidates').select('*').eq('id', initialAdd).single().then(({ data }) => {
        if (data && !selected.find(s => s.id === data.id)) setSelected([data as Candidate]);
      });
    }
  }, [initialAdd]);

  function addCandidate(id: string) {
    const c = candidates.find(c => c.id === id);
    if (c && selected.length < 5 && !selected.find(s => s.id === id)) setSelected([...selected, c]);
    setPicking('');
  }
  function removeCandidate(id: string) { setSelected(selected.filter(s => s.id !== id)); }

  const radarData = ['skills', 'experience', 'education', 'domain', 'soft'].map(metric => {
    const row: any = { metric: metric.charAt(0).toUpperCase() + metric.slice(1) };
    selected.forEach(c => { row[c.name] = (c.match_breakdown as any)?.[metric] || 0; });
    return row;
  });

  const bestMatch = selected.length ? selected.reduce((a, b) => a.match_score > b.match_score ? a : b) : null;

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Candidate Comparison Matrix"
        description={`Compare up to 5 candidates side-by-side · ${selected.length}/5 selected`}
        icon={<GitCompare className="h-5 w-5" />}
        actions={selected.length < 5 ? (
          <div className="flex gap-2">
            <Select value={picking} onValueChange={(v) => addCandidate(v)}>
              <SelectTrigger className="w-[180px] gap-1"><Plus className="h-4 w-4" /><SelectValue placeholder="Add candidate" /></SelectTrigger>
              <SelectContent>
                {candidates.filter(c => !selected.find(s => s.id === c.id)).map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name} · {c.match_score}%</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : undefined}
      />

      {selected.length === 0 ? (
        <MotionCard initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center p-16 text-center">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10"><GitCompare className="h-8 w-8 text-primary" /></div>
          <p className="font-display text-lg font-semibold">No candidates selected</p>
          <p className="mt-1 text-sm text-muted-foreground">Add up to 5 candidates to compare them side-by-side.</p>
        </MotionCard>
      ) : (
        <div className="space-y-5">
          {/* Candidate cards row */}
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selected.length}, minmax(0, 1fr))` }}>
            <AnimatePresence>
              {selected.map(c => (
                <motion.div key={c.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                  <MotionCard className={cn('relative p-4', bestMatch?.id === c.id && 'ring-2 ring-success/40')} whileHover={{ y: -2 }}>
                    <CardSheen />
                    <Button variant="ghost" size="icon" className="absolute right-1 top-1 h-6 w-6" onClick={() => removeCandidate(c.id)}><X className="h-3.5 w-3.5" /></Button>
                    <div className="flex flex-col items-center text-center">
                      <Avatar className="h-14 w-14 border border-glass-border">
                        <AvatarImage src={c.avatar_url || undefined} alt={c.name} />
                        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">{c.name.split(' ').map(s=>s[0]).slice(0,2).join('')}</AvatarFallback>
                      </Avatar>
                      <p className="mt-2 text-sm font-semibold">{c.name}</p>
                      <p className="text-[11px] text-muted-foreground">{c.job_title}</p>
                      <div className="mt-2"><ScoreRing value={c.match_score} size={56} /></div>
                      {bestMatch?.id === c.id && <Badge className="mt-2 gap-1 bg-success/15 text-success"><Trophy className="h-3 w-3" /> Best match</Badge>}
                    </div>
                  </MotionCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Radar comparison */}
          {selected.length >= 2 && (
            <MotionCard initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5">
              <h2 className="mb-3 font-display text-sm font-bold">Match Profile Comparison</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }} />
                    {selected.map((c, i) => (
                      <Radar key={c.id} name={c.name} dataKey={c.name} stroke={`hsl(var(--chart-${(i % 5) + 1}))`} fill={`hsl(var(--chart-${(i % 5) + 1}))`} fillOpacity={0.15} strokeWidth={2} />
                    ))}
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </MotionCard>
          )}

          {/* Skills heatmap */}
          <MotionCard initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden">
            <div className="border-b border-glass-border p-4"><h2 className="font-display text-sm font-bold">Skills Heatmap</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-glass-border text-xs text-muted-foreground">
                    <th className="p-3 text-left font-medium">Skill</th>
                    {selected.map(c => <th key={c.id} className="p-3 text-center font-medium">{c.name.split(' ')[0]}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {Array.from(new Set(selected.flatMap(c => c.skills))).sort().map(skill => (
                    <tr key={skill} className="border-b border-glass-border/50">
                      <td className="p-3 text-xs font-medium">{skill}</td>
                      {selected.map(c => {
                        const has = c.skills.includes(skill);
                        return (
                          <td key={c.id} className="p-3 text-center">
                            <span className={cn('inline-block h-7 w-7 rounded-md text-[10px] font-bold leading-7', has ? 'bg-success/20 text-success' : 'bg-muted/40 text-muted-foreground/40')}>
                              {has ? '✓' : '—'}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </MotionCard>

          {/* Comparison metrics table */}
          <MotionCard initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden">
            <div className="border-b border-glass-border p-4"><h2 className="font-display text-sm font-bold">Detailed Comparison</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  {[
                    { icon: <TrendingUp className="h-3.5 w-3.5" />, label: 'Experience (years)', get: (c: Candidate) => `${c.years_experience}y` },
                    { icon: <Trophy className="h-3.5 w-3.5" />, label: 'Leadership', get: (c: Candidate) => `${c.leadership_potential}/100` },
                    { icon: <GraduationCap className="h-3.5 w-3.5" />, label: 'Education', get: (c: Candidate) => c.education || '—' },
                    { icon: <DollarSign className="h-3.5 w-3.5" />, label: 'Salary Expectation', get: (c: Candidate) => `$${(c.salary_expectation || 0).toLocaleString()}` },
                    { icon: <TrendingUp className="h-3.5 w-3.5" />, label: 'Job Switch Prob.', get: (c: Candidate) => `${c.job_switch_probability}%` },
                    { icon: <Trophy className="h-3.5 w-3.5" />, label: 'Risk Score', get: (c: Candidate) => `${c.fraud_risk_score}/100` },
                  ].map((row, ri) => (
                    <tr key={ri} className={cn('border-b border-glass-border/50', ri % 2 && 'bg-muted/20')}>
                      <td className="p-3 text-xs font-medium text-muted-foreground"><span className="flex items-center gap-1.5">{row.icon}{row.label}</span></td>
                      {selected.map(c => <td key={c.id} className="p-3 text-center text-xs">{row.get(c)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </MotionCard>

          {bestMatch && (
            <MotionCard initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="border-success/20 bg-success/5 p-5">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-success" />
                <div>
                  <p className="font-display text-sm font-bold">AI Recommendation</p>
                  <p className="text-xs text-muted-foreground">Based on overall match profile, <span className="font-semibold text-foreground">{bestMatch.name}</span> is the strongest candidate with a {bestMatch.match_score}% match score, strong leadership potential ({bestMatch.leadership_potential}), and the best skill alignment to the role.</p>
                </div>
              </div>
            </MotionCard>
          )}
        </div>
      )}
    </div>
  );
}
