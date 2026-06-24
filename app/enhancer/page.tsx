'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, FileCheck2, Type, Tag, Lightbulb, Upload, Gauge } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { MotionCard, CardSheen } from '@/components/ui/motion-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScoreRing } from '@/components/ui/score-ring';
import { useToast } from '@/hooks/use-toast';
import { analyzeResumeATS } from '@/lib/ai';
import { cn } from '@/lib/utils';

export default function EnhancerPage() {
  const { toast } = useToast();
  const [fileName, setFileName] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<Awaited<ReturnType<typeof analyzeResumeATS>> | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFile(f: File) {
    setFileName(f.name);
    setLoading(true); setResult(null);
    try {
      const r = await analyzeResumeATS(f.name);
      setResult(r);
      toast({ title: 'Analysis complete', description: `ATS score: ${r.ats_score}%` });
    } finally { setLoading(false); }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="AI Resume Enhancer"
        description="Upload a candidate resume to get ATS compatibility, formatting tips, and keyword recommendations."
        icon={<Sparkles className="h-5 w-5" />}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <MotionCard initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-5">
          <CardSheen />
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            className="cursor-pointer rounded-xl border-2 border-dashed border-glass-border p-8 text-center transition hover:border-primary/50 hover:bg-primary/5"
          >
            <input ref={inputRef} type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"><Upload className="h-7 w-7 text-primary" /></div>
            <p className="font-display font-semibold">{fileName || 'Drop resume here'}</p>
            <p className="mt-1 text-xs text-muted-foreground">or click to browse · PDF, DOCX, TXT</p>
          </div>
          {fileName && <Button onClick={() => fileName && handleFile({ name: fileName } as File)} disabled={loading} className="mt-3 w-full gap-2 gradient-primary text-white">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Re-analyze</Button>}
        </MotionCard>

        <AnimatePresence mode="wait">
          {loading ? (
            <MotionCard key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center p-10">
              <Loader2 className="mb-3 h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Analyzing ATS compatibility...</p>
            </MotionCard>
          ) : result ? (
            <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <MotionCard className="p-5">
                <div className="flex items-center gap-4">
                  <ScoreRing value={result.ats_score} size={80} />
                  <div>
                    <div className="mb-1 flex items-center gap-1.5"><Gauge className="h-4 w-4 text-primary" /><h2 className="font-display text-sm font-bold">ATS Compatibility Score</h2></div>
                    <p className="text-xs text-muted-foreground">{result.ats_score >= 80 ? 'Excellent — passes most ATS parsers.' : result.ats_score >= 65 ? 'Good — minor improvements recommended.' : 'Needs work — may fail ATS parsing.'}</p>
                  </div>
                </div>
              </MotionCard>
            </motion.div>
          ) : (
            <MotionCard key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center p-10 text-center">
              <FileCheck2 className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Upload a resume to see analysis.</p>
            </MotionCard>
          )}
        </AnimatePresence>
      </div>

      {result && (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <MotionCard initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-5">
            <div className="mb-3 flex items-center gap-2"><Type className="h-4 w-4 text-electric" /><h2 className="font-display text-sm font-bold">Formatting Suggestions</h2></div>
            <ul className="space-y-1.5">
              {result.formatting.map((f, i) => <li key={i} className="flex gap-2 text-xs text-muted-foreground"><span className="text-electric">•</span>{f}</li>)}
            </ul>
          </MotionCard>
          <MotionCard initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-5">
            <div className="mb-3 flex items-center gap-2"><Tag className="h-4 w-4 text-accent" /><h2 className="font-display text-sm font-bold">Keyword Recommendations</h2></div>
            <div className="mb-3">
              <p className="mb-1.5 text-xs text-muted-foreground">Missing keywords to add:</p>
              <div className="flex flex-wrap gap-1">{result.keywords.missing.map(k => <Badge key={k} variant="outline" className="border-destructive/40 text-destructive">{k}</Badge>)}</div>
            </div>
            <div>
              <p className="mb-1.5 text-xs text-muted-foreground">Present keywords:</p>
              <div className="flex flex-wrap gap-1">{result.keywords.present.map(k => <Badge key={k} variant="secondary" className="bg-success/15 text-success">{k}</Badge>)}</div>
            </div>
          </MotionCard>
          <MotionCard initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-5 lg:col-span-2">
            <div className="mb-3 flex items-center gap-2"><Lightbulb className="h-4 w-4 text-warning" /><h2 className="font-display text-sm font-bold">Improvement Suggestions</h2></div>
            <ul className="space-y-1.5">
              {result.suggestions.map((s, i) => <li key={i} className="flex gap-2 text-sm text-muted-foreground"><span className="text-warning">•</span>{s}</li>)}
            </ul>
          </MotionCard>
        </div>
      )}
    </div>
  );
}
