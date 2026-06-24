'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Sparkles, User, Loader2, Brain } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { MotionCard } from '@/components/ui/motion-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { recruiterCopilotQuery } from '@/lib/ai';
import { useTalentPool } from '@/hooks/use-talent-pool';
import { cn } from '@/lib/utils';

type Msg = { role: 'user' | 'ai'; content: string; id: string };

const SUGGESTIONS = [
  'Show top React candidates',
  'Who are the strongest matches?',
  'Find best candidate under $160k',
  'Any candidates with fraud risk?',
];

function formatAI(text: string) {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('•')) return <div key={i} className="ml-2 text-sm">{line}</div>;
    if (/^\d+\./.test(line.trim())) return <div key={i} className="text-sm">{line}</div>;
    if (!line.trim()) return <div key={i} className="h-2" />;
    return (
      <p key={i} className={cn('text-sm leading-relaxed', /\*\*/.test(line) && 'font-medium')}>
        {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
          part.startsWith('**') && part.endsWith('**') ? <span key={j} className="font-bold text-foreground">{part.slice(2, -2)}</span> : <span key={j}>{part}</span>
        )}
      </p>
    );
  });
}

export default function CopilotPage() {
  const { candidates } = useTalentPool();
  const [messages, setMessages] = React.useState<Msg[]>([
    { role: 'ai', id: 'init', content: `Hi! I'm your Recruiter Copilot. I can analyze your pool of ${candidates.length} candidates. Ask me anything — try one of the suggestions below.` },
  ]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }, [messages, loading]);

  async function send(query: string) {
    if (!query.trim() || loading) return;
    const userMsg: Msg = { role: 'user', id: crypto.randomUUID(), content: query };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    const res = await recruiterCopilotQuery(query, candidates);
    setLoading(false);
    setMessages(prev => [...prev, { role: 'ai', id: crypto.randomUUID(), content: res }]);
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-4xl flex-col">
      <PageHeader
        title="Recruiter AI Copilot"
        description="Ask natural-language questions about your candidate pool."
        icon={<Bot className="h-5 w-5" />}
        actions={<Badge variant="secondary" className="gap-1"><Sparkles className="h-3 w-3" /> Conversational AI</Badge>}
      />

      <MotionCard initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-1 flex-col overflow-hidden rounded-xl">
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto scrollbar-thin p-4">
          <AnimatePresence initial={false}>
            {messages.map(m => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cn('flex gap-3', m.role === 'user' && 'flex-row-reverse')}>
                <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', m.role === 'ai' ? 'bg-gradient-to-br from-primary to-accent' : 'bg-muted')}>
                  {m.role === 'ai' ? <Bot className="h-4 w-4 text-white" /> : <User className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div className={cn('max-w-[80%] rounded-2xl p-3', m.role === 'ai' ? 'glass' : 'bg-primary text-primary-foreground')}>
                  {m.role === 'ai' ? <div className="space-y-0.5 text-muted-foreground">{formatAI(m.content)}</div> : <p className="text-sm">{m.content}</p>}
                </div>
              </motion.div>
            ))}
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent"><Bot className="h-4 w-4 text-white" /></div>
                <div className="glass rounded-2xl p-3"><div className="flex gap-1"><span className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: '0ms' }} /><span className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: '150ms' }} /><span className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: '300ms' }} /></div></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 border-t border-glass-border p-3">
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => send(s)} className="rounded-full border border-glass-border px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/50 hover:bg-primary/5 hover:text-primary">
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2 border-t border-glass-border p-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send(input)}
            placeholder="Ask about your candidates..."
            className="flex-1 rounded-lg border border-glass-border bg-background/50 px-4 py-2.5 text-sm outline-none ring-primary/30 transition focus:ring-2"
          />
          <Button onClick={() => send(input)} disabled={loading || !input.trim()} className="gap-2 gradient-primary text-white">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </MotionCard>
    </div>
  );
}
