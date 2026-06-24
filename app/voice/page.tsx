'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Loader2, Play, Volume2, MessageSquare, Star } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { MotionCard, CardSheen } from '@/components/ui/motion-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScoreRing } from '@/components/ui/score-ring';
import { useToast } from '@/hooks/use-toast';
import { analyzeVoiceInterview } from '@/lib/ai';

export default function VoicePage() {
  const { toast } = useToast();
  const [fileName, setFileName] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<Awaited<ReturnType<typeof analyzeVoiceInterview>> | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFile(f: File) {
    setFileName(f.name);
    setLoading(true); setResult(null);
    try {
      const r = await analyzeVoiceInterview(f.name);
      setResult(r);
      toast({ title: 'Voice analysis complete', description: `Confidence: ${r.confidence}%` });
    } finally { setLoading(false); }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="AI Voice Interview Analyzer"
        description="Upload interview audio to analyze confidence, fluency, communication, and leadership signals."
        icon={<Mic className="h-5 w-5" />}
        actions={<Badge variant="secondary" className="gap-1"><Volume2 className="h-3 w-3" /> Audio AI</Badge>}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <MotionCard initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-5">
          <CardSheen />
          <div onClick={() => inputRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }} className="cursor-pointer rounded-xl border-2 border-dashed border-glass-border p-10 text-center transition hover:border-primary/50 hover:bg-primary/5">
            <input ref={inputRef} type="file" accept="audio/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 relative">
              <Mic className="h-8 w-8 text-primary" />
              {!fileName && <span className="absolute inset-0 animate-ping rounded-2xl bg-primary/10" />}
            </div>
            <p className="font-display font-semibold">{fileName || 'Drop audio file here'}</p>
            <p className="mt-1 text-xs text-muted-foreground">or click to browse · MP3, WAV, M4A</p>
          </div>
          {fileName && <Button onClick={() => fileName && handleFile({ name: fileName } as File)} disabled={loading} className="mt-3 w-full gap-2 gradient-primary text-white">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Re-analyze</Button>}
        </MotionCard>

        <AnimatePresence mode="wait">
          {loading ? (
            <MotionCard key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center p-10">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                {[0, 0.15, 0.3].map((d, i) => <motion.span key={i} animate={{ scaleY: [0.5, 1, 0.5] }} transition={{ duration: 0.8, repeat: Infinity, delay: d }} className="mx-0.5 h-6 w-1 rounded-full bg-primary" />)}
              </div>
              <p className="text-sm text-muted-foreground">Analyzing voice signals...</p>
            </MotionCard>
          ) : result ? (
            <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <MotionCard className="p-5">
                <div className="mb-3 flex items-center gap-2"><Star className="h-4 w-4 text-warning" /><h2 className="font-display text-sm font-bold">Voice Metrics</h2></div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Confidence', value: result.confidence },
                    { label: 'Fluency', value: result.fluency },
                    { label: 'Clarity', value: result.clarity },
                    { label: 'Leadership', value: result.leadership_signals },
                  ].map(m => (
                    <div key={m.label} className="flex items-center gap-2 rounded-lg bg-muted/40 p-3">
                      <ScoreRing value={m.value} size={50} />
                      <div><p className="text-xs font-medium">{m.label}</p><p className="text-[10px] text-muted-foreground">{m.value}/100</p></div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-muted/40 p-2.5"><p className="text-muted-foreground">Speaking Pace</p><p className="font-semibold">{result.pace_wpm} wpm</p></div>
                  <div className="rounded-lg bg-muted/40 p-2.5"><p className="text-muted-foreground">Filler Words</p><p className="font-semibold">{result.filler_count}</p></div>
                </div>
              </MotionCard>
            </motion.div>
          ) : (
            <MotionCard key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center p-10 text-center">
              <Volume2 className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Upload audio to see analysis.</p>
            </MotionCard>
          )}
        </AnimatePresence>
      </div>

      {result && (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <MotionCard initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5">
            <div className="mb-2 flex items-center gap-2"><MessageSquare className="h-4 w-4 text-primary" /><h2 className="font-display text-sm font-bold">Analysis Summary</h2></div>
            <p className="text-sm leading-relaxed text-muted-foreground">{result.summary}</p>
          </MotionCard>
          <MotionCard initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5">
            <div className="mb-2 flex items-center gap-2"><Star className="h-4 w-4 text-accent" /><h2 className="font-display text-sm font-bold">Behavioral Insights</h2></div>
            <ul className="space-y-1.5">
              {result.insights.map((s, i) => <li key={i} className="flex gap-2 text-sm text-muted-foreground"><span className="text-accent">•</span>{s}</li>)}
            </ul>
          </MotionCard>
        </div>
      )}
    </div>
  );
}
