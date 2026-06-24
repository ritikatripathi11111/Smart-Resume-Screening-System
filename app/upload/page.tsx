'use client';

import { extractResumeData } from '@/lib/resume-parser';
import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileUp, FileText, CheckCircle2, Loader2, X, Sparkles,
  AlertCircle, FileCheck2, Brain,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { MotionCard, CardSheen } from '@/components/ui/motion-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useTalentPool } from '@/hooks/use-talent-pool';
import { generateCandidateIntelligence } from '@/lib/ai';import { supabase } from '@/lib/supabase';
import { useRole } from '@/components/providers/role-provider';
import { cn } from '@/lib/utils';

type Stage = 'queued' | 'uploading' | 'parsing' | 'analyzing' | 'done' | 'error';
type UploadItem = {
  id: string;
  name: string;
  size: string;
  stage: Stage;
  progress: number;
  confidence?: number;
  matchScore?: number;
  candidateId?: string;
};

const ACCEPTED = ['.pdf', '.docx', '.txt'];

export default function UploadPage() {
  const [items, setItems] = React.useState<UploadItem[]>([]);
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { refresh, jobs } = useTalentPool();
  const { user } = useRole();
  const job = jobs[0] || null;

  const update = (id: string, patch: Partial<UploadItem>) =>
    setItems(prev => prev.map(it => it.id === id ? { ...it, ...patch } : it));

  async function queueFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList).filter(f => {
      const ext = '.' + f.name.split('.').pop()?.toLowerCase();
      return ACCEPTED.includes(ext);
    });
    if (!files.length) {
      toast({ title: 'Unsupported file type', description: 'Please upload PDF, DOCX, or TXT files.', variant: 'destructive' });
      return;
    }
    const newItems: UploadItem[] = files.map(f => ({
      id: crypto.randomUUID(),
      name: f.name,
      size: (f.size / 1024).toFixed(0) + ' KB',
      stage: 'queued',
      progress: 0,
    }));
    setItems(prev => [...newItems, ...prev]);
    files.forEach((f, i) => processFile(newItems[i], f));
  }

  async function processFile(item: UploadItem, file: File){
    try {
      // Simulate upload
      update(item.id, { stage: 'uploading', progress: 18 });
      await new Promise(r => setTimeout(r, 700));
      update(item.id, { progress: 45, stage: 'parsing' });

      const parsed = await extractResumeData(file);
      update(item.id, { progress: 72, stage: 'analyzing' });

      const intel = await generateCandidateIntelligence(parsed, job);

      // persist to Supabase
      const { data, error } = await supabase.from('candidates').insert({
        name: parsed.name,
        email: parsed.email,
        phone: parsed.phone,
        location: parsed.location,
        job_title: parsed.job_title,
        current_company: parsed.current_company,
        years_experience: parsed.years_experience,
        education: parsed.education,
        skills: parsed.skills,
        match_score: intel.match_score,
        match_breakdown: intel.match_breakdown,
        ai_summary: intel.ai_summary,
        strengths: intel.strengths,
        weaknesses: intel.weaknesses,
        career_growth_prediction: intel.career_growth_prediction,
        leadership_potential: intel.leadership_potential,
        communication_score: intel.communication_score,
        learning_ability_score: intel.learning_ability_score,
        culture_fit_score: intel.culture_fit_score,
        job_switch_probability: intel.job_switch_probability,
        risk_indicators: intel.risk_indicators,
        fraud_risk_score: intel.fraud_risk_score,
        salary_expectation: intel.salary_expectation,
        source: intel.source,
        status: intel.status,
        job_id: job?.id || null,
        avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(parsed.name)}`,
      }).select().single();

      if (error) throw error;
      update(item.id, { stage: 'done', progress: 100, confidence: parsed.confidence, matchScore: intel.match_score, candidateId: data.id });
      toast({ title: 'Resume parsed', description: `${parsed.name} added with ${intel.match_score}% match score.` });
      refresh();
    } catch (e: any) {
      update(item.id, { stage: 'error', progress: 0 });
      toast({ title: 'Processing failed', description: e.message, variant: 'destructive' });
    }
  }

  const stageLabel: Record<Stage, string> = {
    queued: 'Queued', uploading: 'Uploading...', parsing: 'AI Parsing...', analyzing: 'Generating Intelligence...', done: 'Complete', error: 'Failed',
  };

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="AI Resume Upload Center"
        description="Bulk upload resumes — AI parses, extracts skills, and generates candidate intelligence automatically."
        icon={<FileUp className="h-5 w-5" />}
        actions={<Badge variant="secondary" className="gap-1"><Sparkles className="h-3 w-3" /> AI Powered</Badge>}
      />

      {/* Drop zone */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      >
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); queueFiles(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed p-10 text-center transition-all sm:p-14',
            dragging
              ? 'border-primary bg-primary/5 scale-[1.01]'
              : 'border-glass-border glass hover:border-primary/50 hover:bg-primary/5'
          )}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPTED.join(',')}
            className="hidden"
            onChange={(e) => e.target.files && queueFiles(e.target.files)}
          />
          {dragging && <div className="pointer-events-none absolute inset-0 animate-pulse bg-primary/5" />}
          <motion.div
            animate={{ y: dragging ? -4 : 0 }}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15"
          >
            <FileUp className="h-8 w-8 text-primary" />
          </motion.div>
          <p className="font-display text-lg font-semibold">
            {dragging ? 'Drop to upload' : 'Drag & drop resumes here'}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            or <span className="font-medium text-primary">browse files</span> · Supports PDF, DOCX, TXT · Bulk upload enabled
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {ACCEPTED.map(ext => (
              <Badge key={ext} variant="outline" className="border-glass-border">{ext.replace('.', '').toUpperCase()}</Badge>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Processing queue */}
      {items.length > 0 && (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-sm font-bold">Processing Queue ({items.length})</h2>
            <Button variant="ghost" size="sm" onClick={() => setItems([])}>Clear</Button>
          </div>
          <div className="space-y-3">
            <AnimatePresence>
              {items.map(item => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <MotionCard className="p-4">
                    <CardSheen />
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg',
                        item.stage === 'done' ? 'bg-success/10' : item.stage === 'error' ? 'bg-destructive/10' : 'bg-primary/10'
                      )}>
                        {item.stage === 'done' ? <CheckCircle2 className="h-5 w-5 text-success" />
                          : item.stage === 'error' ? <AlertCircle className="h-5 w-5 text-destructive" />
                          : item.stage === 'queued' ? <FileText className="h-5 w-5 text-muted-foreground" />
                          : <Loader2 className="h-5 w-5 animate-spin text-primary" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-medium">{item.name}</p>
                          <span className="shrink-0 text-xs text-muted-foreground">{item.size}</span>
                        </div>
                        <div className="mt-1.5 flex items-center gap-2">
                          <Progress value={item.progress} className="h-1.5" />
                          <span className="w-24 shrink-0 text-right text-[11px] font-medium text-muted-foreground">
                            {stageLabel[item.stage]}
                          </span>
                        </div>
                      </div>
                      {item.stage === 'done' && (
                        <div className="flex shrink-0 items-center gap-2">
                          {item.confidence !== undefined && (
                            <Badge variant="secondary" className="gap-1 bg-electric/10 text-electric">
                              <Brain className="h-3 w-3" /> {item.confidence}% AI
                            </Badge>
                          )}
                          {item.matchScore !== undefined && (
                            <Badge className={cn(
                              'gap-1',
                              item.matchScore >= 85 ? 'bg-success/15 text-success'
                                : item.matchScore >= 70 ? 'bg-primary/15 text-primary'
                                : 'bg-warning/15 text-warning'
                            )}>
                              <FileCheck2 className="h-3 w-3" /> {item.matchScore}% match
                            </Badge>
                          )}
                          <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                            <a href={`/candidates/${item.candidateId}`}>→</a>
                          </Button>
                        </div>
                      )}
                      {item.stage !== 'done' && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => setItems(prev => prev.filter(i => i.id !== item.id))}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </MotionCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* features list */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { icon: <FileText className="h-4 w-4" />, title: 'Resume Parsing', desc: 'OCR + structured extraction' },
          { icon: <Brain className="h-4 w-4" />, title: 'Skill Extraction', desc: 'Auto-detected from content' },
          { icon: <Sparkles className="h-4 w-4" />, title: 'AI Confidence', desc: 'Parsing accuracy scoring' },
        ].map(f => (
          <div key={f.title} className="rounded-xl glass p-4">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">{f.icon}</div>
            <p className="text-sm font-semibold">{f.title}</p>
            <p className="text-xs text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
