import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

// -------- Types --------
export type MatchBreakdown = {
  skills: number;
  experience: number;
  education: number;
  domain: number;
  soft: number;
};

export type RiskIndicator = {
  type: 'fake_experience' | 'skill_inflation' | 'inconsistency' | 'gap' | 'title_inflation';
  detail: string;
  severity: 'low' | 'medium' | 'high';
};

export type Candidate = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  job_title: string | null;
  current_company: string | null;
  years_experience: number | null;
  education: string | null;
  skills: string[];
  match_score: number;
  match_breakdown: MatchBreakdown | Record<string, number>;
  ai_summary: string | null;
  strengths: string[];
  weaknesses: string[];
  career_growth_prediction: string | null;
  leadership_potential: number;
  communication_score: number;
  learning_ability_score: number;
  culture_fit_score: number;
  job_switch_probability: number;
  risk_indicators: RiskIndicator[] | any[];
  fraud_risk_score: number;
  salary_expectation: number | null;
  source: string | null;
  resume_url: string | null;
  avatar_url: string | null;
  status: string;
  job_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Job = {
  id: string;
  title: string;
  role: string;
  experience: string | null;
  location: string | null;
  salary_min: number | null;
  salary_max: number | null;
  skills: string[];
  responsibilities: string[];
  preferred_skills: string[];
  description: string | null;
  status: string;
  department: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type HiringDecision = {
  id: string;
  candidate_id: string;
  job_id: string | null;
  decision: string;
  notes: string | null;
  ratings: Record<string, number> | any;
  created_by: string | null;
  created_at: string;
};

export type InterviewQuestion = {
  id: string;
  candidate_id: string | null;
  job_id: string | null;
  category: string;
  difficulty: string;
  question: string;
  ideal_answer: string | null;
  follow_ups: string[];
  created_at: string;
};

// fallback avatar pool
export const AVATAR_POOL = [
  'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=80',
  'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=80',
  'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=80',
  'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=80',
];
