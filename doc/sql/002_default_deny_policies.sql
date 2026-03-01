-- This script creates a default-deny RLS policy on tables where RLS has been enabled.
-- This is a security measure to ensure that no data is accessible until explicit access policies are created.
-- You will need to create additional policies to grant specific permissions to roles for your application to function.

CREATE POLICY "Default Deny" ON public.financial_data FOR ALL USING (false);
CREATE POLICY "Default Deny" ON public.project_members FOR ALL USING (false);
CREATE POLICY "Default Deny" ON public._ProjectAssignee FOR ALL USING (false);
CREATE POLICY "Default Deny" ON public.projects FOR ALL USING (false);
CREATE POLICY "Default Deny" ON public.clients FOR ALL USING (false);
CREATE POLICY "Default Deny" ON public.tasks FOR ALL USING (false);
CREATE POLICY "Default Deny" ON public.time_entries FOR ALL USING (false);
CREATE POLICY "Default Deny" ON public.expenses FOR ALL USING (false);
CREATE POLICY "Default Deny" ON public.budget_revisions FOR ALL USING (false);
CREATE POLICY "Default Deny" ON public.activity_log FOR ALL USING (false);
CREATE POLICY "Default Deny" ON public.comments FOR ALL USING (false);
CREATE POLICY "Default Deny" ON public.project_progress_history FOR ALL USING (false);
CREATE POLICY "Default Deny" ON public.milestones FOR ALL USING (false);
CREATE POLICY "Default Deny" ON public.risks FOR ALL USING (false);
CREATE POLICY "Default Deny" ON public.documents FOR ALL USING (false);
