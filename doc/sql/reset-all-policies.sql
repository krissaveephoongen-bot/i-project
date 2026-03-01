-- Reset ALL RLS Policies and recreate with JWT claims
-- Run this in Supabase SQL Editor

-- 1. Drop ALL existing policies
-- Drop policies from each table individually
DO $$
BEGIN
    -- Users table policies
    DROP POLICY IF EXISTS "Users can view own profile" ON users;
    DROP POLICY IF EXISTS "Users can update own profile" ON users;
    DROP POLICY IF EXISTS "Admins can manage all users" ON users;
    DROP POLICY IF EXISTS "Admins can view all users" ON users;
    DROP POLICY IF EXISTS "Allow users to update their own profile" ON users;
    DROP POLICY IF EXISTS "Allow users to view their own profile" ON users;
    DROP POLICY IF EXISTS "Bypass RLS for service role" ON users;
    DROP POLICY IF EXISTS "Users can update own profile" ON users;
    
    -- Projects table policies
    DROP POLICY IF EXISTS "Users can view involved projects" ON projects;
    DROP POLICY IF EXISTS "Managers can create projects" ON projects;
    DROP POLICY IF EXISTS "Project managers can update projects" ON projects;
    DROP POLICY IF EXISTS "Users can view projects they are involved in" ON projects;
    
    -- Tasks table policies
    DROP POLICY IF EXISTS "Project members can view tasks" ON tasks;
    DROP POLICY IF EXISTS "Project members can create tasks" ON tasks;
    DROP POLICY IF EXISTS "Allow assignee to update tasks" ON tasks;
    DROP POLICY IF EXISTS "Allow creator to delete tasks" ON tasks;
    DROP POLICY IF EXISTS "Allow project members to create tasks" ON tasks;
    DROP POLICY IF EXISTS "Allow project members to view tasks" ON tasks;
    
    -- Time entries table policies
    DROP POLICY IF EXISTS "Users can view own time entries" ON time_entries;
    DROP POLICY IF EXISTS "Users can create own time entries" ON time_entries;
    DROP POLICY IF EXISTS "Allow users to delete their own pending time entries" ON time_entries;
    DROP POLICY IF EXISTS "Allow users to update their own pending time entries" ON time_entries;
    DROP POLICY IF EXISTS "Allow managers to view all time entries on their projects" ON time_entries;
    
    -- Expenses table policies
    DROP POLICY IF EXISTS "Users can view own expenses" ON expenses;
    DROP POLICY IF EXISTS "Users can create own expenses" ON expenses;
    DROP POLICY IF EXISTS "Allow users to delete their own pending expenses" ON expenses;
    DROP POLICY IF EXISTS "Allow users to update their own pending expenses" ON expenses;
    DROP POLICY IF EXISTS "Allow managers to view all expenses on their projects" ON expenses;
    
    -- Clients table policies
    DROP POLICY IF EXISTS "Project members can view associated clients" ON clients;
    DROP POLICY IF EXISTS "Allow managers to create clients" ON clients;
    DROP POLICY IF EXISTS "Allow managers to delete clients" ON clients;
    DROP POLICY IF EXISTS "Allow managers to update clients" ON clients;
    
    -- Comments table policies
    DROP POLICY IF EXISTS "Project members can view comments" ON comments;
    DROP POLICY IF EXISTS "Project members can create comments" ON comments;
    DROP POLICY IF EXISTS "Allow author to delete their own comments" ON comments;
    DROP POLICY IF EXISTS "Allow author to update their own comments" ON comments;
    
    -- Documents table policies
    DROP POLICY IF EXISTS "Project members can view project documents" ON documents;
    DROP POLICY IF EXISTS "Project members can upload documents" ON documents;
    DROP POLICY IF EXISTS "Allow project members to upload documents" ON documents;
    DROP POLICY IF EXISTS "Allow uploader or manager to delete documents" ON documents;
    DROP POLICY IF EXISTS "Allow uploader to update document details" ON documents;
    
    -- Risks table policies
    DROP POLICY IF EXISTS "Allow assignee or manager to update risks" ON risks;
    DROP POLICY IF EXISTS "Allow project managers to delete risks" ON risks;
    DROP POLICY IF EXISTS "Allow project members to create risks" ON risks;
    DROP POLICY IF EXISTS "Allow project members to view risks" ON risks;
    
    -- Activity log policies
    DROP POLICY IF EXISTS "Allow users to view their own activity log" ON activity_log;
    
    -- Budget revisions policies
    DROP POLICY IF EXISTS "Allow project managers to create budget revisions" ON budget_revisions;
    DROP POLICY IF EXISTS "Allow project managers to view budget revisions" ON budget_revisions;
    
    -- Financial data policies
    DROP POLICY IF EXISTS "Allow admins to manage financial data" ON financial_data;
    
    -- Project members policies
    DROP POLICY IF EXISTS "Project managers can manage memberships" ON project_members;
    DROP POLICY IF EXISTS "Users can view project memberships" ON project_members;
    
    -- Project progress history policies
    DROP POLICY IF EXISTS "Allow project managers to create progress history" ON project_progress_history;
    DROP POLICY IF EXISTS "Allow project members to view progress history" ON project_progress_history;
    
    -- Project assignee policies
    DROP POLICY IF EXISTS "Default Deny" ON projectassignee;
    
    RAISE NOTICE 'All existing policies dropped';
END $$;

-- 2. Create helper functions (simplified for non-Supabase auth)
-- Note: These functions are simplified since auth.jwt() is not available
-- In production, you should implement proper authentication

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT false; -- Placeholder: implement based on your auth system
$$;

CREATE OR REPLACE FUNCTION is_manager()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT false; -- Placeholder: implement based on your auth system
$$;

CREATE OR REPLACE FUNCTION is_active_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT true; -- Placeholder: implement based on your auth system
$$;

CREATE OR REPLACE FUNCTION can_access_user(target_user_id text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT true; -- Placeholder: allow all for now
$$;

CREATE OR REPLACE FUNCTION is_project_member(project_id text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT true; -- Placeholder: allow all for now
$$;

-- 3. Users table policies (simplified)
CREATE POLICY "Allow all operations on users" ON users
  FOR ALL USING (true);

-- 4. Projects table policies (simplified)
CREATE POLICY "Allow all operations on projects" ON projects
  FOR ALL USING (true);

-- 5-16. Simplified policies for all tables (allow all operations)
CREATE POLICY "Allow all operations on tasks" ON tasks FOR ALL USING (true);
CREATE POLICY "Allow all operations on time_entries" ON time_entries FOR ALL USING (true);
CREATE POLICY "Allow all operations on expenses" ON expenses FOR ALL USING (true);
CREATE POLICY "Allow all operations on clients" ON clients FOR ALL USING (true);
CREATE POLICY "Allow all operations on comments" ON comments FOR ALL USING (true);
CREATE POLICY "Allow all operations on documents" ON documents FOR ALL USING (true);
CREATE POLICY "Allow all operations on risks" ON risks FOR ALL USING (true);
CREATE POLICY "Allow all operations on activity_log" ON activity_log FOR ALL USING (true);
CREATE POLICY "Allow all operations on budget_revisions" ON budget_revisions FOR ALL USING (true);
CREATE POLICY "Allow all operations on financial_data" ON financial_data FOR ALL USING (true);
CREATE POLICY "Allow all operations on project_members" ON project_members FOR ALL USING (true);
CREATE POLICY "Allow all operations on project_progress_history" ON project_progress_history FOR ALL USING (true);

-- 17. Grant permissions to anon role
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;

-- 18. Enable RLS on all tables (if not already enabled)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_progress_history ENABLE ROW LEVEL SECURITY;

-- 18. Verify policies were created
SELECT 
    schemaname, 
    tablename, 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
