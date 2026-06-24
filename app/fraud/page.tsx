'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, ShieldCheck, Loader2, AlertTriangle, Search } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { MotionCard, CardSheen } from '@/components/ui/motion-card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useTalentPool } from '@/hooks/use-talent-pool';
import { cn } from '@/lib/utils';
import type { Candidate } from '@/lib/supabase';

function riskLevel(score: number) {
  if (score >= 30) return { label: 'High', color: 'bg-destructive/15 text-destructive', bar: 'bg-destructive' };
  if (score >= 15) return { label: 'Medium', color: 'bg-warning/15 text-warning', bar: 'bg-warning' };
  return { label: 'Low', color: 'bg-success/15 text-success', bar: 'bg-success' };
}

export default function FraudPage() {
  const { candidates, loading } = useTalentPool();
  const [search, setSearch] = React.useState('');

  const flagged = candidates.filter(c => (c.fraud_risk_score || 0) >= 15).sort((a, b) => (b.fraud_risk_score || 0) - (a.fraud_risk_score || 0));
  const filtered = candidates.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.risk_indicators || []).some((r: any) => r.detail.toLowerCase().includes(search.toLowerCase()))
  ).sort((a, b) => (b.fraud_risk_score || 0) - (a.fraud_risk_score || 0));

  const stats = {
    high: candidates.filter(c => (c.fraud_risk_score || 0) >= 30).length,
    medium: candidates.filter(c => (c.fraud_risk_score || 0) >= 15 && (c.fraud_risk_score || 0) < 30).length,
    low: candidates.filter(c => (c.fraud_risk_score || 0) < 15).length,
  };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="AI Fraud Detection"
        description="Detect fake experience, skill inflation, and resume inconsistencies."
        icon={<ShieldAlert className="h-5 w-5" />}
        actions={<Badge variant="secondary" className="gap-1"><AlertTriangle className="h-3 w-3" /> {flagged.length} flagged</Badge>}
      />

      <div className="mb-5 grid grid-cols-3 gap-4">
        {[
          { label: 'High Risk', value: stats.high, color: 'text-destructive', bg: 'bg-destructive/10', icon: <AlertTriangle className="h-4 w-4" /> },
          { label: 'Medium Risk', value: stats.medium, color: 'text-warning', bg: 'bg-warning/10', icon: <ShieldAlert className="h-4 w-4" /> },
          { label: 'Low Risk', value: stats.low, color: 'text-success', bg: 'bg-success/10', icon: <ShieldCheck className="h-4 w-4" /> },
        ].map(s => (
          <MotionCard key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4">
            <div className={cn('mb-2 flex h-9 w-9 items-center justify-center rounded-lg', s.bg, s.color)}>{s.icon}</div>
            <p className={cn('font-display text-2xl font-bold', s.color)}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </MotionCard>
        ))}
      </div>

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search candidates or risk details..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {loading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-muted/40" />) :
            filtered.map(c => {
              const lvl = riskLevel(c.fraud_risk_score || 0);
              return (
                <motion.div key={c.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                  <MotionCard className="p-4">
                    <CardSheen />
                    <div className="flex items-start gap-3">
                      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', lvl.color)}>
                        {c.fraud_risk_score >= 15 ? <ShieldAlert className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold">{c.name}</p>
                          <Badge className={cn('text-[10px]', lvl.color)}>{lvl.label} Risk · {c.fraud_risk_score}/100</Badge>
                          <span className="text-xs text-muted-foreground">{c.job_title}</span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"><motion.div className={cn('h-full', lvl.bar)} initial={{ width: 0 }} animate={{ width: `${c.fraud_risk_score}%` }} transition={{ duration: 0.6 }} /></div>
                        {c.risk_indicators && c.risk_indicators.length > 0 ? (
                          <div className="mt-3 space-y-1.5">
                            {c.risk_indicators.map((r: any, i: number) => (
                              <div key={i} className="flex items-start gap-2 rounded-lg bg-destructive/5 p-2">
                                <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-destructive" />
                                <div>
                                  <p className="text-xs font-medium capitalize">{r.type.replace(/_/g, ' ')}</p>
                                  <p className="text-[11px] text-muted-foreground">{r.detail}</p>
                                </div>
                                <Badge variant="outline" className={cn('ml-auto text-[9px]', r.severity === 'high' ? 'border-destructive text-destructive' : 'border-warning text-warning')}>{r.severity}</Badge>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-2 text-xs text-muted-foreground">No risk indicators detected. Resume appears consistent.</p>
                        )}
                      </div>
                    </div>
                  </MotionCard>
                </motion.div>
              );
            })}
        </AnimatePresence>
      </div>
    </div>
  );
}
