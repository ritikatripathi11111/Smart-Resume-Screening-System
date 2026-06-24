-- For this demo platform (no real auth required), open policies to anon+authenticated.
-- Frontend uses anon key with a mock role-switcher (RBAC simulated client-side).

-- Jobs
drop policy if exists "select_jobs" on jobs;
create policy "select_jobs" on jobs for select to anon, authenticated using (true);
drop policy if exists "insert_jobs" on jobs;
create policy "insert_jobs" on jobs for insert to anon, authenticated with check (true);
drop policy if exists "update_jobs" on jobs;
create policy "update_jobs" on jobs for update to anon, authenticated using (true) with check (true);
drop policy if exists "delete_jobs" on jobs;
create policy "delete_jobs" on jobs for delete to anon, authenticated using (true);

-- Candidates
drop policy if exists "select_candidates" on candidates;
create policy "select_candidates" on candidates for select to anon, authenticated using (true);
drop policy if exists "insert_candidates" on candidates;
create policy "insert_candidates" on candidates for insert to anon, authenticated with check (true);
drop policy if exists "update_candidates" on candidates;
create policy "update_candidates" on candidates for update to anon, authenticated using (true) with check (true);
drop policy if exists "delete_candidates" on candidates;
create policy "delete_candidates" on candidates for delete to anon, authenticated using (true);

-- Interview questions
drop policy if exists "select_interview_questions" on interview_questions;
create policy "select_interview_questions" on interview_questions for select to anon, authenticated using (true);
drop policy if exists "insert_interview_questions" on interview_questions;
create policy "insert_interview_questions" on interview_questions for insert to anon, authenticated with check (true);

-- Skill gaps
drop policy if exists "select_skill_gaps" on skill_gaps;
create policy "select_skill_gaps" on skill_gaps for select to anon, authenticated using (true);
drop policy if exists "insert_skill_gaps" on skill_gaps;
create policy "insert_skill_gaps" on skill_gaps for insert to anon, authenticated with check (true);

-- Hiring decisions
drop policy if exists "select_hiring_decisions" on hiring_decisions;
create policy "select_hiring_decisions" on hiring_decisions for select to anon, authenticated using (true);
drop policy if exists "insert_hiring_decisions" on hiring_decisions;
create policy "insert_hiring_decisions" on hiring_decisions for insert to anon, authenticated with check (true);
drop policy if exists "update_hiring_decisions" on hiring_decisions;
create policy "update_hiring_decisions" on hiring_decisions for update to anon, authenticated using (true) with check (true);

-- Activity log
drop policy if exists "select_activity_log" on activity_log;
create policy "select_activity_log" on activity_log for select to anon, authenticated using (true);
drop policy if exists "insert_activity_log" on activity_log;
create policy "insert_activity_log" on activity_log for insert to anon, authenticated with check (true);
