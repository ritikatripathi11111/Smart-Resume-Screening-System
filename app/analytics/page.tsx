'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Clock, DollarSign, Trophy, TrendingUp, Users } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { MotionCard, CardSheen } from '@/components/ui/motion-card';
import { Badge } from '@/components/ui/badge';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Funnel, FunnelChart, LabelList,
} from 'recharts';
import { useTalentPool } from '@/hooks/use-talent-pool';

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];
const CHART_STYLE = { fontSize: 11, fill: 'hsl(var(--muted-foreground))' } as const;
const GRID = 'hsl(var(--border))';

export default function AnalyticsPage() {
  const { candidates, jobs } = useTalentPool();

  const statusCounts = React.useMemo(() => {
    const m: Record<string, number> = {};
    candidates.forEach(c => { m[c.status] = (m[c.status] || 0) + 1; });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [candidates]);

  const sourceCounts = React.useMemo(() => {
    const m: Record<string, number> = {};
    candidates.forEach(c => { m[c.source || 'Unknown'] = (m[c.source || 'Unknown'] || 0) + 1; });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [candidates]);

  const skillTrends = React.useMemo(() => {
    const m: Record<string, number> = {};
    candidates.forEach(c => c.skills.forEach(s => { m[s] = (m[s] || 0) + 1; }));
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, demand: value * 15 + 20 }));
  }, [candidates]);

  const funnelData = React.useMemo(() => [
    { stage: 'Applied', value: candidates.length * 12, fill: COLORS[0] },
    { stage: 'Screened', value: candidates.length * 8, fill: COLORS[1] },
    { stage: 'Interviewed', value: candidates.filter(c => ['interview', 'offer'].includes(c.status)).length + 3, fill: COLORS[2] },
    { stage: 'Offered', value: candidates.filter(c => c.status === 'offer').length + 2, fill: COLORS[3] },
    { stage: 'Hired', value: Math.max(1, candidates.filter(c => c.status === 'offer').length), fill: COLORS[4] },
  ].filter(d => d.value > 0), [candidates]);

  const monthlyTrend = [
    { month: 'Jan', hires: 3, applications: 45 },
    { month: 'Feb', hires: 5, applications: 62 },
    { month: 'Mar', hires: 4, applications: 58 },
    { month: 'Apr', hires: 7, applications: 71 },
    { month: 'May', hires: 6, applications: 68 },
    { month: 'Jun', hires: 9, applications: 85 },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Talent Analytics Dashboard"
        description="Recruitment efficiency, pipeline, and skill demand insights."
        icon={<BarChart3 className="h-5 w-5" />}
      />

      {/* metric tiles */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { icon: <Clock className="h-4 w-4 text-primary" />, label: 'Time to Hire', value: '24', unit: 'days', delta: '-12%' },
          { icon: <DollarSign className="h-4 w-4 text-success" />, label: 'Cost per Hire', value: '$4.2', unit: 'k', delta: '-8%' },
          { icon: <Trophy className="h-4 w-4 text-electric" />, label: 'Offer Conversion', value: '68', unit: '%', delta: '+5%' },
          { icon: <Users className="h-4 w-4 text-accent" />, label: 'Active Pipeline', value: String(candidates.length), unit: '', delta: '+12' },
        ].map(m => (
          <MotionCard key={m.label} variants={fadeUp} className="p-5">
            <CardSheen />
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">{m.icon}</div>
              <Badge className="bg-success/15 text-success gap-1"><TrendingUp className="h-3 w-3" />{m.delta}</Badge>
            </div>
            <p className="mt-3 font-display text-2xl font-bold">{m.value}<span className="text-sm font-normal text-muted-foreground">{m.unit}</span></p>
            <p className="text-xs text-muted-foreground">{m.label}</p>
          </MotionCard>
        ))}
      </motion.div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-5 lg:grid-cols-3">
        <MotionCard variants={fadeUp} className="p-5 lg:col-span-2">
          <h2 className="mb-3 font-display text-sm font-bold">Recruitment Trend</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="cApp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.4} /><stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} /></linearGradient>
                  <linearGradient id="cHire" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.4} /><stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                <XAxis dataKey="month" tick={CHART_STYLE} axisLine={false} tickLine={false} />
                <YAxis tick={CHART_STYLE} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="applications" stroke="hsl(var(--chart-1))" fill="url(#cApp)" strokeWidth={2} />
                <Area type="monotone" dataKey="hires" stroke="hsl(var(--chart-4))" fill="url(#cHire)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </MotionCard>

        <MotionCard variants={fadeUp} className="p-5">
          <h2 className="mb-3 font-display text-sm font-bold">Candidate Sources</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sourceCounts} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {sourceCounts.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </MotionCard>

        <MotionCard variants={fadeUp} className="p-5 lg:col-span-2">
          <h2 className="mb-3 font-display text-sm font-bold">Skill Demand Trends</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillTrends} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
                <XAxis type="number" tick={CHART_STYLE} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={CHART_STYLE} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="demand" radius={[0, 4, 4, 0]}>
                  {skillTrends.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </MotionCard>

        <MotionCard variants={fadeUp} className="p-5">
          <h2 className="mb-3 font-display text-sm font-bold">Hiring Funnel</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Funnel data={funnelData} dataKey="value" isAnimationActive>
                  <LabelList position="right" fill="hsl(var(--muted-foreground))" stroke="none" fontSize={11} dataKey="stage" />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>
        </MotionCard>
      </motion.div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="mt-5 grid gap-5 lg:grid-cols-2">
        <MotionCard variants={fadeUp} className="p-5">
          <h2 className="mb-3 font-display text-sm font-bold">Candidate Pipeline by Stage</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusCounts}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                <XAxis dataKey="name" tick={CHART_STYLE} axisLine={false} tickLine={false} />
                <YAxis tick={CHART_STYLE} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {statusCounts.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </MotionCard>

        <MotionCard variants={fadeUp} className="p-5">
          <h2 className="mb-3 font-display text-sm font-bold">Match Score Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { range: '50-60', count: candidates.filter(c => c.match_score >= 50 && c.match_score < 60).length },
                { range: '60-70', count: candidates.filter(c => c.match_score >= 60 && c.match_score < 70).length },
                { range: '70-80', count: candidates.filter(c => c.match_score >= 70 && c.match_score < 80).length },
                { range: '80-90', count: candidates.filter(c => c.match_score >= 80 && c.match_score < 90).length },
                { range: '90+', count: candidates.filter(c => c.match_score >= 90).length },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
                <XAxis dataKey="range" tick={CHART_STYLE} axisLine={false} tickLine={false} />
                <YAxis tick={CHART_STYLE} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="hsl(var(--chart-2))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </MotionCard>
      </motion.div>
    </div>
  );
}
