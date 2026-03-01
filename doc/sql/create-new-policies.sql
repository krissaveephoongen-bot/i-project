-- Query to export existing RLS policies from Supabase/PostgreSQL
-- Run this query to get CREATE POLICY statements for all existing policies:
/*
SELECT
  'CREATE POLICY "' || policyname || '" ON ' || schemaname || '.' || tablename ||
  CASE WHEN permissive THEN ' AS PERMISSIVE' ELSE ' AS RESTRICTIVE' END ||
  ' FOR ' || cmd ||
  CASE WHEN roles IS NOT NULL THEN ' TO ' || array_to_string(roles, ', ') ELSE '' END ||
  CASE WHEN qual IS NOT NULL THEN ' USING (' || qual || ')' ELSE '' END ||
  CASE WHEN with_check IS NOT NULL THEN ' WITH CHECK (' || with_check || ')' ELSE '' END ||
  ';' AS policy_sql
FROM pg_policies
ORDER BY schemaname, tablename, policyname;
*/

-- Create new RLS Policies with JWT claims
-- Run this AFTER dropping all existing policies

-- 1. Create helper functions for JWT claim checks
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT auth.jwt()->>'role' = 'admin';
$$;

CREATE OR REPLACE FUNCTION is_manager()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT auth.jwt()->>'role' IN ('admin', 'manager');
$$;

CREATE OR REPLACE FUNCTION is_active_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT (auth.jwt()->>'isActive')::boolean = true;
$$;

CREATE OR REPLACE FUNCTION can_access_user(target_user_id text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    auth.uid()::text = target_user_id::text OR 
    is_admin();
$$;

CREATE OR REPLACE FUNCTION is_project_member(project_id text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM project_members 
    WHERE "projectId" = project_id AND "userId" = auth.uid()::text
  ) OR is_manager();
$$;

-- 2. Users table policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (
    is_active_user() AND 
    can_access_user(id::text)
  );

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (
    is_active_user() AND 
    auth.uid()::text = id::text
  );

CREATE POLICY "Admins can manage all users" ON users
  FOR ALL USING (is_admin());

-- 3. Projects table policies
CREATE POLICY "Users can view involved projects" ON projects
  FOR SELECT USING (
    auth.uid()::text = "managerId"::text OR
    is_project_member(id)
  );

CREATE POLICY "Managers can create projects" ON projects
  FOR INSERT WITH CHECK (is_manager());

CREATE POLICY "Project managers can update projects" ON projects
  FOR UPDATE USING (
    auth.uid()::text = "managerId"::text OR
    is_admin()
  );

-- 4. Tasks table policies
CREATE POLICY "Project members can view tasks" ON tasks
  FOR SELECT USING (
    is_project_member("projectId") OR
    auth.uid()::text = "assignedTo"::text OR
    auth.uid()::text = "createdBy"::text
  );

CREATE POLICY "Project members can create tasks" ON tasks
  FOR INSERT WITH CHECK (
    is_project_member("projectId") OR
    is_manager()
  );

CREATE POLICY "Assignee can update tasks" ON tasks
  FOR UPDATE USING (
    auth.uid()::text = "assignedTo"::text OR
    auth.uid()::text = "createdBy"::text OR
    is_manager()
  );

CREATE POLICY "Creator can delete tasks" ON tasks
  FOR DELETE USING (
    auth.uid()::text = "createdBy"::text OR
    is_manager()
  );

-- 5. Time entries table policies
CREATE POLICY "Users can view own time entries" ON time_entries
  FOR SELECT USING (
    auth.uid()::text = "userId"::text OR
    is_project_member("projectId")
  );

CREATE POLICY "Users can create own time entries" ON time_entries
  FOR INSERT WITH CHECK (auth.uid()::text = "userId"::text);

CREATE POLICY "Users can update own pending time entries" ON time_entries
  FOR UPDATE USING (
    (auth.uid()::text = "userId"::text AND status = 'pending') OR
    is_manager()
  );

CREATE POLICY "Users can delete own pending time entries" ON time_entries
  FOR DELETE USING (
    auth.uid()::text = "userId"::text AND status = 'pending'
  );

-- 6. Expenses table policies
CREATE POLICY "Users can view own expenses" ON expenses
  FOR SELECT USING (
    auth.uid()::text = "userId"::text OR
    auth.uid()::text = "approvedBy"::text OR
    is_project_member("projectId")
  );

CREATE POLICY "Users can create own expenses" ON expenses
  FOR INSERT WITH CHECK (auth.uid()::text = "userId"::text);

CREATE POLICY "Users can update own pending expenses" ON expenses
  FOR UPDATE USING (
    (auth.uid()::text = "userId"::text AND status = 'pending') OR
    is_manager()
  );

CREATE POLICY "Users can delete own pending expenses" ON expenses
  FOR DELETE USING (
    auth.uid()::text = "userId"::text AND status = 'pending'
  );

-- 7. Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
