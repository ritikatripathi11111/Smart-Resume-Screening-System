'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Sparkles, Loader2, Save, Copy, Check, Wand2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { MotionCard, CardSheen } from '@/components/ui/motion-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useTalentPool } from '@/hooks/use-talent-pool';
import { generateJobDescription, type JDInput } from '@/lib/ai';
import { supabase } from '@/lib/supabase';

const SKILL_SUGGESTIONS = ['React', 'TypeScript', 'Next.js', 'Node.js', 'GraphQL', 'PostgreSQL', 'AWS', 'Docker', 'Python', 'Go', 'Tailwind CSS', 'Kubernetes'];

export default function JobBuilderPage() {
  const [form, setForm] = React.useState<JDInput>({
    role: '', experience: '', skills: [], location: '', salary: '',
  });
  const [skillInput, setSkillInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<Awaited<ReturnType<typeof generateJobDescription>> | null>(null);
  const [copied, setCopied] = React.useState(false);
  const { toast } = useToast();
  const { refresh } = useTalentPool();

  function addSkill(skill?: string) {
    const s = (skill ?? skillInput).trim();
    if (!s || form.skills.includes(s)) return;
    setForm({ ...form, skills: [...form.skills, s] });
    setSkillInput('');
  }
  function removeSkill(s: string) {
    setForm({ ...form, skills: form.skills.filter(x => x !== s) });
  }

  async function handleGenerate() {
    setLoading(true);
    try {
      const jd = await generateJobDescription(form);
      setResult(jd);
      toast({ title: 'JD generated', description: 'AI has crafted a complete job description.' });
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!result) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('jobs').insert({
        title: result.title,
        role: form.role,
        experience: form.experience,
        location: form.location,
        salary_min: parseInt(form.salary.replace(/[^0-9]/g, '')) || null,
        salary_max: null,
        skills: result.required_skills,
        responsibilities: result.responsibilities,
        preferred_skills: result.preferred_skills,
        description: result.description,
        department: 'Engineering',
        status: 'open',
      });
      if (error) throw error;
      toast({ title: 'Job saved', description: 'Saved as a reusable template.' });
      refresh();
    } catch (e: any) {
      toast({ title: 'Save failed', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  function copyAll() {
    if (!result) return;
    const text = `${result.title}\n\n${result.description}\n\nResponsibilities:\n${result.responsibilities.map(r=>`• ${r}`).join('\n')}\n\nRequired Skills: ${result.required_skills.join(', ')}\nPreferred: ${result.preferred_skills.join(', ')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Smart Job Description Builder"
        description="Create complete, role-tailored job descriptions with AI."
        icon={<FileText className="h-5 w-5" />}
        actions={<Badge variant="secondary" className="gap-1"><Wand2 className="h-3 w-3" /> AI Generated</Badge>}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <MotionCard initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-5">
          <CardSheen />
          <h2 className="mb-4 font-display text-base font-bold">Requirements</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="role">Role / Title</Label>
                <Input id="role" placeholder="e.g. Senior Frontend Engineer" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="exp">Experience</Label>
                <Input id="exp" placeholder="e.g. 5+ years" value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="loc">Location</Label>
                <Input id="loc" placeholder="e.g. Remote (US)" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="sal">Salary Range</Label>
                <Input id="sal" placeholder="e.g. $130k - $180k" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} />
              </div>
            </div>
            <div>
              <Label htmlFor="skill">Required Skills</Label>
              <div className="flex gap-2">
                <Input id="skill" placeholder="Type a skill and press Enter" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} />
                <Button variant="outline" onClick={() => addSkill()}>Add</Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {form.skills.map(s => (
                  <Badge key={s} variant="secondary" className="gap-1 pr-1">
                    {s}
                    <button onClick={() => removeSkill(s)} className="rounded hover:bg-muted"><span className="px-1">×</span></button>
                  </Badge>
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {SKILL_SUGGESTIONS.filter(s => !form.skills.includes(s)).map(s => (
                  <button key={s} onClick={() => addSkill(s)} className="rounded border border-glass-border px-2 py-0.5 text-[11px] text-muted-foreground transition hover:border-primary/50 hover:text-primary">+ {s}</button>
                ))}
              </div>
            </div>
            <Button onClick={handleGenerate} disabled={loading || !form.role} className="w-full gap-2 gradient-primary text-white glow-primary">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? 'Generating...' : 'Generate Job Description'}
            </Button>
          </div>
        </MotionCard>

        <AnimatePresence mode="wait">
          {result ? (
            <MotionCard key="result" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="p-5">
              <CardSheen />
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-base font-bold">{result.title}</h2>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyAll}>
                    {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="max-h-[60vh] space-y-4 overflow-y-auto scrollbar-thin pr-1">
                <p className="text-sm leading-relaxed text-muted-foreground">{result.description}</p>
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Responsibilities</p>
                  <ul className="space-y-1.5">
                    {result.responsibilities.map((r, i) => (
                      <li key={i} className="flex gap-2 text-sm"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" /><span>{r}</span></li>
                    ))}
                  </ul>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Required Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {result.required_skills.map(s => <Badge key={s} className="bg-primary/15 text-primary">{s}</Badge>)}
                    </div>
                  </div>
                  <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Preferred Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {result.preferred_skills.map(s => <Badge key={s} variant="outline" className="border-glass-border">{s}</Badge>)}
                    </div>
                  </div>
                </div>
              </div>
              <Button onClick={handleSave} disabled={loading} className="mt-4 w-full gap-2" variant="outline">
                <Save className="h-4 w-4" /> Save as Template
              </Button>
            </MotionCard>
          ) : (
            <MotionCard key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center p-10 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
                <Sparkles className="h-7 w-7 text-accent" />
              </div>
              <p className="font-display font-semibold">AI will generate here</p>
              <p className="mt-1 text-sm text-muted-foreground">Fill the requirements and click generate.</p>
            </MotionCard>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
