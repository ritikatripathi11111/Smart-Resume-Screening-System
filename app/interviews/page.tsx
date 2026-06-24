'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquareCode, Sparkles, Loader2, Code, User, Briefcase, GitBranch,
  ChevronDown, Lightbulb, Plus, FileText,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { MotionCard, CardSheen } from '@/components/ui/motion-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select';
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs';
import { generateInterviewQuestions, type InterviewQuestionResult } from '@/lib/ai';
import { useTalentPool } from '@/hooks/use-talent-pool';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { id: 'technical', label: 'Technical', icon: Code },
  { id: 'behavioral', label: 'Behavioral', icon: User },
  { id: 'hr', label: 'HR', icon: Briefcase },
  { id: 'scenario', label: 'Scenario', icon: GitBranch },
];
const DIFFICULTIES = [
  { id: 'easy', label: 'Easy', color: 'bg-success/15 text-success' },
  { id: 'medium', label: 'Medium', color: 'bg-primary/15 text-primary' },
  { id: 'hard', label: 'Hard', color: 'bg-destructive/15 text-destructive' },
];

const DIFF_COLORS: Record<string, string> = { easy: 'bg-success/15 text-success', medium: 'bg-primary/15 text-primary', hard: 'bg-destructive/15 text-destructive' };

export default function InterviewCopilotPage() {
  const sp = useSearchParams();
  const { candidates } = useTalentPool();
  const { toast } = useToast();
  const [category, setCategory] = React.useState('all');
  const [difficulty, setDifficulty] = React.useState('all');
  const [count, setCount] = React.useState('5');
  const [loading, setLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('technical');
  const [byCat, setByCat] = React.useState<Record<string, InterviewQuestionResult[]>>({});
  const [expanded, setExpanded] = React.useState<string | null>(null);

  function groupedQuestions(cat: string) {
    return byCat[cat] || [];
  }

  async function generate(cat = 'all', diff = 'all') {
    setLoading(true);
    try {
      const cats = cat === 'all' ? CATEGORIES.map(c => c.id) : [cat];
      const results: Record<string, InterviewQuestionResult[]> = {};
      for (const c of cats) {
        results[c] = await generateInterviewQuestions({ category: c, difficulty: diff, count: parseInt(count) });
      }
      setByCat(prev => ({ ...prev, ...results }));
      if (cat === 'all') setActiveTab('technical');
      else setActiveTab(cat);
      toast({ title: 'Questions generated', description: `${cats.length} categor${cats.length > 1 ? 'ies' : 'y'} × ${count} questions.` });
    } finally {
      setLoading(false);
    }
  }

  const initRef = React.useRef(false);
  React.useEffect(() => {
    if (!initRef.current && candidates.length) {
      initRef.current = true;
      generate('all', 'all');
    }
  }, [candidates.length]);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="AI Interview Copilot"
        description="Generate technical, behavioral, HR, and scenario questions with ideal answers and follow-ups."
        icon={<MessageSquareCode className="h-5 w-5" />}
        actions={<Badge variant="secondary" className="gap-1"><Sparkles className="h-3 w-3" /> AI Copilot</Badge>}
      />

      {/* Filters */}
      <MotionCard initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {CATEGORIES.map(c => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Difficulty</label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any difficulty</SelectItem>
                {DIFFICULTIES.map(d => <SelectItem key={d.id} value={d.id} className="capitalize">{d.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Count</label>
            <Select value={count} onValueChange={setCount}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[3, 5, 8, 10].map(n => <SelectItem key={n} value={String(n)}>{n} questions</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => generate(category, difficulty)} disabled={loading} className="gap-2 gradient-primary text-white">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Generate
          </Button>
        </div>
      </MotionCard>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 grid w-full grid-cols-4">
          {CATEGORIES.map(c => {
            const Icon = c.icon;
            return <TabsTrigger key={c.id} value={c.id} className="gap-1.5"><Icon className="h-3.5 w-3.5" /> {c.label}</TabsTrigger>;
          })}
        </TabsList>
        {CATEGORIES.map(c => (
          <TabsContent key={c.id} value={c.id} className="space-y-3">
            <AnimatePresence>
              {groupedQuestions(c.id).map((q, i) => {
                const key = `${c.id}-${i}`;
                const isOpen = expanded === key;
                return (
                  <motion.div key={key} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <MotionCard className="overflow-hidden" whileHover={{ y: -1 }}>
                      <CardSheen />
                      <button onClick={() => setExpanded(isOpen ? null : key)} className="flex w-full items-start gap-3 p-4 text-left">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">{i+1}</div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex flex-wrap items-center gap-1.5">
                            <Badge variant="outline" className={cn('capitalize text-[10px]', DIFF_COLORS[q.difficulty])}>{q.difficulty}</Badge>
                            <Badge variant="secondary" className="capitalize text-[10px]">{q.category}</Badge>
                          </div>
                          <p className="text-sm font-medium">{q.question}</p>
                        </div>
                        <ChevronDown className={cn('mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform', isOpen && 'rotate-180')} />
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="border-t border-glass-border p-4">
                              <div className="mb-3 rounded-lg border border-success/20 bg-success/5 p-3">
                                <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-success"><Lightbulb className="h-3 w-3" /> Ideal Answer</p>
                                <p className="text-xs leading-relaxed text-muted-foreground">{q.ideal_answer}</p>
                              </div>
                              {q.follow_ups?.length > 0 && (
                                <div>
                                  <p className="mb-1 text-xs font-semibold text-muted-foreground">Follow-up Questions</p>
                                  <ul className="space-y-1">
                                    {q.follow_ups.map((f, fi) => <li key={fi} className="flex gap-1.5 text-xs text-muted-foreground"><Plus className="text-accent" />{f}</li>)}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </MotionCard>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {groupedQuestions(c.id).length === 0 && (
              <div className="rounded-xl border border-dashed border-glass-border p-10 text-center text-sm text-muted-foreground">No questions generated yet. Click Generate.</div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
