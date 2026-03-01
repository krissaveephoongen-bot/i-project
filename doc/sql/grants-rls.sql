GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO service_role;
CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$ SELECT auth.jwt()->>'role' = 'admin' $$;
CREATE OR REPLACE FUNCTION is_manager() RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$ SELECT auth.jwt()->>'role' IN ('admin','manager') $$;
CREATE OR REPLACE FUNCTION is_active_user() RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$ SELECT COALESCE((auth.jwt()->>'isActive')::boolean, true) $$;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_select_own ON users FOR SELECT USING (is_active_user() AND (auth.uid()::text = id OR is_admin()));
CREATE POLICY users_update_own ON users FOR UPDATE USING (auth.uid()::text = id);
CREATE POLICY users_insert_admin ON users FOR INSERT WITH CHECK (is_admin());
CREATE POLICY users_delete_admin ON users FOR DELETE USING (is_admin());
CREATE POLICY projects_select_assigned ON projects FOR SELECT USING (
  (auth.uid()::text = "managerId")
  OR EXISTS (SELECT 1 FROM project_members pm WHERE pm."projectId" = id AND pm."userId" = auth.uid()::text)
);
CREATE POLICY projects_manage_manager ON projects FOR ALL USING (is_manager() OR auth.uid()::text = "managerId");
CREATE POLICY time_entries_select_own ON time_entries FOR SELECT USING (auth.uid()::text = "userId" OR is_manager());
CREATE POLICY time_entries_insert_own ON time_entries FOR INSERT WITH CHECK (auth.uid()::text = "userId");
CREATE POLICY time_entries_update_own ON time_entries FOR UPDATE USING (auth.uid()::text = "userId");
CREATE POLICY time_entries_delete_own ON time_entries FOR DELETE USING (auth.uid()::text = "userId");
CREATE POLICY expenses_select_scope ON expenses FOR SELECT USING (auth.uid()::text = "userId" OR auth.uid()::text = "approvedBy" OR is_manager());
CREATE POLICY expenses_insert_own ON expenses FOR INSERT WITH CHECK (auth.uid()::text = "userId");
CREATE POLICY expenses_update_own ON expenses FOR UPDATE USING (auth.uid()::text = "userId");
CREATE POLICY tasks_select_scope ON tasks FOR SELECT USING (auth.uid()::text = "assignedTo" OR auth.uid()::text = "createdBy" OR is_manager());
CREATE POLICY tasks_manage_scope ON tasks FOR ALL USING (auth.uid()::text = "assignedTo" OR auth.uid()::text = "createdBy" OR is_manager());
