'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare, ThumbsUp, ThumbsDown, Star, MessageSquare, Loader2,
  Send, CheckCheck, AlertCircle, Clock,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { MotionCard, CardSheen } from '@/components/ui/motion-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select';
import { useTalentPool } from '@/hooks/use-talent-pool';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useRole } from '@/components/providers/role-provider';
import { cn } from '@/lib/utils';

type Feedback = { id: string; author: string; avatar: string; role: string; decision: string; comment: string; rating: number; created_at: string };

const DECISIONS = [
  { value: 'strong_recommend', label: 'Strongly Recommend', icon: CheckCheck, color: 'bg-success/15 text-success' },
  { value: 'recommend', label: 'Recommend', icon: ThumbsUp, color: 'bg-primary/15 text-primary' },
  { value: 'neutral', label: 'Neutral', icon: AlertCircle, color: 'bg-muted text-muted-foreground' },
  { value: 'reject', label: 'Do Not Recommend', icon: ThumbsDown, color: 'bg-destructive/15 text-destructive' },
];

export default function DecisionsPage() {
  const sp = useSearchParams();
  const { candidates, jobs } = useTalentPool();
  const { toast } = useToast();
  const { user, role } = useRole();
  const [candidateId, setCandidateId] = React.useState(sp.get('candidate') || '');
  const [feedback, setFeedback] = React.useState<Feedback[]>([]);
  const [comment, setComment] = React.useState('');
  const [decision, setDecision] = React.useState('recommend');
  const [rating, setRating] = React.useState(4);
  const [loadingFb, setLoadingFb] = React.useState(false);

  React.useEffect(() => { if (candidateId) loadFeedback(); }, [candidateId]);

  async function loadFeedback() {
    const { data } = await supabase.from('hiring_decisions').select('*').eq('candidate_id', candidateId).order('created_at', { ascending: false });
    const fb = (data || []).map((d: any) => ({
      id: d.id, author: user.name, avatar: user.avatar, role: role, decision: d.decision, comment: d.notes || '', rating: d.ratings?.overall || 0, created_at: d.created_at,
    }));
    setFeedback(fb);
  }

  async function addFeedback() {
    if (!comment.trim() || !candidateId) return;
    setLoadingFb(true);
    try {
      const { error } = await supabase.from('hiring_decisions').insert({
        candidate_id: candidateId, decision, notes: comment, ratings: { overall: rating },
      });
      if (error) throw error;
      setFeedback(prev => [{ id: crypto.randomUUID(), author: user.name, avatar: user.avatar, role, decision, comment, rating, created_at: new Date().toISOString() }, ...prev]);
      setComment('');
      toast({ title: 'Feedback added', description: 'Your decision has been recorded.' });
    } catch (e: any) {
      toast({ title: 'Failed', description: e.message, variant: 'destructive' });
    } finally { setLoadingFb(false); }
  }

  const candidate = candidates.find(c => c.id === candidateId);
  const job = jobs.find(j => j.id === candidate?.job_id);

  const recommended = feedback.filter(f => f.decision === 'recommend' || f.decision === 'strong_recommend').length;
  const rejected = feedback.filter(f => f.decision === 'reject').length;
  const finalRec = recommended > rejected ? 'Recommended to hire' : recommended < rejected ? 'Not recommended' : 'Mixed feedback';

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Hiring Decision Workspace" description="Collaborative workspace for team feedback, ratings, and final decisions." icon={<CheckSquare className="h-5 w-5" />} />

      <MotionCard initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-4">
        <Select value={candidateId} onValueChange={setCandidateId}>
          <SelectTrigger className="w-full sm:w-[320px]"><SelectValue placeholder="Select candidate" /></SelectTrigger>
          <SelectContent>{candidates.map(c => <SelectItem key={c.id} value={c.id}>{c.name} · {c.match_score}%</SelectItem>)}</SelectContent>
        </Select>
      </MotionCard>

      {candidate ? (
        <div className="grid gap-5 lg:grid-cols-3">
          <MotionCard initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="p-5">
            <CardSheen />
            <div className="flex items-center gap-3">
              <Avatar className="h-14 w-14 border border-glass-border"><AvatarImage src={candidate.avatar_url || undefined} alt={candidate.name} /><AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">{candidate.name.split(' ').map(s=>s[0]).slice(0,2).join('')}</AvatarFallback></Avatar>
              <div><p className="font-semibold">{candidate.name}</p><p className="text-xs text-muted-foreground">{candidate.job_title}</p><p className="text-xs text-muted-foreground">Match: {candidate.match_score}%</p></div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between rounded-lg bg-muted/40 p-2.5"><span className="flex items-center gap-1.5 text-xs"><ThumbsUp className="h-3.5 w-3.5 text-success" />Recommendations</span><Badge className="bg-success/15 text-success">{recommended}</Badge></div>
              <div className="flex items-center justify-between rounded-lg bg-muted/40 p-2.5"><span className="flex items-center gap-1.5 text-xs"><ThumbsDown className="h-3.5 w-3.5 text-destructive" />Rejections</span><Badge className="bg-destructive/15 text-destructive">{rejected}</Badge></div>
            </div>
            <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
              <p className="text-xs font-medium text-muted-foreground">Final Recommendation</p>
              <p className="font-display font-bold text-primary">{finalRec}</p>
            </div>
            {job && <div className="mt-3 text-xs text-muted-foreground">For: <span className="font-medium text-foreground">{job.title}</span></div>}
          </MotionCard>

          <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 lg:col-span-2">
            <MotionCard className="p-5">
              <h2 className="mb-3 font-display text-sm font-bold">Add Your Feedback</h2>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {DECISIONS.map(d => {
                  const Icon = d.icon;
                  return (
                    <button key={d.value} onClick={() => setDecision(d.value)} className={cn('flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition', decision === d.value ? cn(d.color, 'border-transparent') : 'border-glass-border text-muted-foreground hover:bg-muted/40')}>
                      <Icon className="h-3.5 w-3.5" /> {d.label}
                    </button>
                  );
                })}
              </div>
              <div className="mb-3 flex items-center gap-1">
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setRating(n)}><Star className={cn('h-5 w-5 transition', n <= rating ? 'fill-warning text-warning' : 'text-muted-foreground/40')} /></button>
                ))}
                <span className="ml-2 text-xs text-muted-foreground">{rating}/5</span>
              </div>
              <Textarea placeholder="Share your assessment..." value={comment} onChange={e => setComment(e.target.value)} rows={3} className="mb-3" />
              <Button onClick={addFeedback} disabled={loadingFb || !comment.trim()} className="w-full gap-2 gradient-primary text-white">{loadingFb ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Submit Feedback</Button>
            </MotionCard>

            <div className="space-y-2">
              <AnimatePresence>
                {feedback.map(f => {
                  const dec = DECISIONS.find(d => d.value === f.decision);
                  const Icon = dec?.icon;
                  return (
                    <motion.div key={f.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      <MotionCard className="p-4">
                        <div className="flex gap-3">
                          <Avatar className="h-9 w-9"><AvatarImage src={f.avatar} alt={f.author} /><AvatarFallback className="text-[10px]">{f.author.split(' ').map(s=>s[0]).slice(0,2).join('')}</AvatarFallback></Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold">{f.author}</p>
                              <Badge className={cn('text-[10px] capitalize', dec?.color)}>{dec?.label}</Badge>
                              <span className="flex gap-0.5">{[1,2,3,4,5].map(n => <Star key={n} className={cn('h-3 w-3', n <= f.rating ? 'fill-warning text-warning' : 'text-muted-foreground/30')} />)}</span>
                              <span className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground"><Clock className="h-3 w-3" />{new Date(f.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">{f.comment}</p>
                          </div>
                        </div>
                      </MotionCard>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {feedback.length === 0 && <div className="rounded-xl border border-dashed border-glass-border p-8 text-center text-sm text-muted-foreground">No feedback yet. Be the first to evaluate.</div>}
            </div>
          </motion.div>
        </div>
      ) : (
        <MotionCard initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center p-16 text-center">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10"><CheckSquare className="h-8 w-8 text-primary" /></div>
          <p className="font-display text-lg font-semibold">Select a candidate</p>
          <p className="mt-1 text-sm text-muted-foreground">Choose a candidate to view collaborative feedback.</p>
        </MotionCard>
      )}
    </div>
  );
}
