-- Talent Intelligence Platform schema
-- Auth: rely on Supabase auth users. RLS enabled per table.

create extension if not exists "pgcrypto";

-- =======================
-- Jobs
-- =======================
create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  role text not null,
  experience text,
  location text,
  salary_min integer,
  salary_max integer,
  skills text[] default '{}'::text[],
  responsibilities text[] default '{}'::text[],
  preferred_skills text[] default '{}'::text[],
  description text,
  status text default 'open',
  department text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =======================
-- Candidates  (current_role renamed to job_title to avoid reserved keyword)
-- =======================
create table if not exists candidates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  location text,
  job_title text,
  current_company text,
  years_experience numeric,
  education text,
  skills text[] default '{}'::text[],
  match_score integer default 0,
  match_breakdown jsonb default '{}'::jsonb,
  ai_summary text,
  strengths text[] default '{}'::text[],
  weaknesses text[] default '{}'::text[],
  career_growth_prediction text,
  leadership_potential integer default 0,
  communication_score integer default 0,
  learning_ability_score integer default 0,
  culture_fit_score integer default 0,
  job_switch_probability integer default 0,
  risk_indicators jsonb default '[]'::jsonb,
  fraud_risk_score integer default 0,
  salary_expectation numeric,
  source text,
  resume_url text,
  avatar_url text,
  status text default 'new',
  job_id uuid references jobs(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists candidates_match_score_idx on candidates(match_score desc);
create index if not exists candidates_status_idx on candidates(status);
create index if not exists candidates_skills_idx on candidates using gin (skills);

-- =======================
-- Interview questions
-- =======================
create table if not exists interview_questions (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references candidates(id) on delete cascade,
  job_id uuid references jobs(id) on delete set null,
  category text not null,
  difficulty text not null,
  question text not null,
  ideal_answer text,
  follow_ups text[] default '{}'::text[],
  created_at timestamptz default now()
);

-- =======================
-- Skill gap analyses
-- =======================
create table if not exists skill_gaps (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references candidates(id) on delete cascade,
  job_id uuid references jobs(id) on delete set null,
  missing_skills text[] default '{}'::text[],
  weak_skills text[] default '{}'::text[],
  suggested_certifications text[] default '{}'::text[],
  learning_roadmap jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- =======================
-- Hiring decisions / collaborative feedback
-- =======================
create table if not exists hiring_decisions (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid references candidates(id) on delete cascade,
  job_id uuid references jobs(id) on delete set null,
  decision text default 'pending',
  notes text,
  ratings jsonb default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

-- =======================
-- Activity / audit log
-- =======================
create table if not exists activity_log (
  id uuid primary key default gen_random_uuid(),
  user_email text,
  action text not null,
  entity text,
  entity_id uuid,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- =======================
-- RLS
-- =======================
alter table jobs enable row level security;
alter table candidates enable row level security;
alter table interview_questions enable row level security;
alter table skill_gaps enable row level security;
alter table hiring_decisions enable row level security;
alter table activity_log enable row level security;

drop policy if exists "select_jobs" on jobs;
create policy "select_jobs" on jobs for select to authenticated using (true);
drop policy if exists "insert_jobs" on jobs;
create policy "insert_jobs" on jobs for insert to authenticated with check (true);
drop policy if exists "update_jobs" on jobs;
create policy "update_jobs" on jobs for update to authenticated using (true) with check (true);
drop policy if exists "delete_jobs" on jobs;
create policy "delete_jobs" on jobs for delete to authenticated using (true);

drop policy if exists "select_candidates" on candidates;
create policy "select_candidates" on candidates for select to authenticated using (true);
drop policy if exists "insert_candidates" on candidates;
create policy "insert_candidates" on candidates for insert to authenticated with check (true);
drop policy if exists "update_candidates" on candidates;
create policy "update_candidates" on candidates for update to authenticated using (true) with check (true);
drop policy if exists "delete_candidates" on candidates;
create policy "delete_candidates" on candidates for delete to authenticated using (true);

drop policy if exists "select_interview_questions" on interview_questions;
create policy "select_interview_questions" on interview_questions for select to authenticated using (true);
drop policy if exists "insert_interview_questions" on interview_questions;
create policy "insert_interview_questions" on interview_questions for insert to authenticated with check (true);

drop policy if exists "select_skill_gaps" on skill_gaps;
create policy "select_skill_gaps" on skill_gaps for select to authenticated using (true);
drop policy if exists "insert_skill_gaps" on skill_gaps;
create policy "insert_skill_gaps" on skill_gaps for insert to authenticated with check (true);

drop policy if exists "select_hiring_decisions" on hiring_decisions;
create policy "select_hiring_decisions" on hiring_decisions for select to authenticated using (true);
drop policy if exists "insert_hiring_decisions" on hiring_decisions;
create policy "insert_hiring_decisions" on hiring_decisions for insert to authenticated with check (true);
drop policy if exists "update_hiring_decisions" on hiring_decisions;
create policy "update_hiring_decisions" on hiring_decisions for update to authenticated using (true) with check (true);

drop policy if exists "select_activity_log" on activity_log;
create policy "select_activity_log" on activity_log for select to authenticated using (true);
drop policy if exists "insert_activity_log" on activity_log;
create policy "insert_activity_log" on activity_log for insert to authenticated with check (true);
