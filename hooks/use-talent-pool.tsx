'use client';

import * as React from 'react';
import { supabase, type Candidate, type Job } from '@/lib/supabase';

type PoolState = {
  candidates: Candidate[];
  jobs: Job[];
  loading: boolean;
  refresh: () => Promise<void>;
};

const PoolContext = React.createContext<PoolState | null>(null);

export function TalentPoolProvider({ children }: { children: React.ReactNode }) {
  const [candidates, setCandidates] = React.useState<Candidate[]>([]);
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, jRes] = await Promise.all([
        supabase.from('candidates').select('*').order('match_score', { ascending: false }),
        supabase.from('jobs').select('*').order('created_at', { ascending: false }),
      ]);
      setCandidates((cRes.data as Candidate[]) || []);
      setJobs((jRes.data as Job[]) || []);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <PoolContext.Provider value={{ candidates, jobs, loading, refresh }}>
      {children}
    </PoolContext.Provider>
  );
}

export function useTalentPool() {
  const ctx = React.useContext(PoolContext);
  if (!ctx) throw new Error('useTalentPool must be used within TalentPoolProvider');
  return ctx;
}
