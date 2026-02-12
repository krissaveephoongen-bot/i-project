-- Fix RLS Policies to use JWT claims instead of recursive queries
-- Run this in Supabase SQL Editor

-- 1. Drop existing problematic policies (check existence first)
DO $$ 
BEGIN
    -- Drop users table policies
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can view own profile') THEN
        DROP POLICY "Users can view own profile" ON users;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can update own profile') THEN
        DROP POLICY "Users can update own profile" ON users;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Admins can insert users') THEN
        DROP POLICY "Admins can insert users" ON users;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Admins can delete users') THEN
        DROP POLICY "Admins can delete users" ON users;
    END IF;
    
    -- Drop projects table policies
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Users can view assigned projects') THEN
        DROP POLICY "Users can view assigned projects" ON projects;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Managers can manage projects') THEN
        DROP POLICY "Managers can manage projects" ON projects;
    END IF;
    
    -- Drop time_entries table policies
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'time_entries' AND policyname = 'Users can view own time entries') THEN
        DROP POLICY "Users can view own time entries" ON time_entries;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'time_entries' AND policyname = 'Users can manage own time entries') THEN
        DROP POLICY "Users can manage own time entries" ON time_entries;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'time_entries' AND policyname = 'Users can update own time entries') THEN
        DROP POLICY "Users can update own time entries" ON time_entries;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'time_entries' AND policyname = 'Users can delete own time entries') THEN
        DROP POLICY "Users can delete own time entries" ON time_entries;
    END IF;
    
    -- Drop expenses table policies
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'expenses' AND policyname = 'Users can view own expenses') THEN
        DROP POLICY "Users can view own expenses" ON expenses;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'expenses' AND policyname = 'Users can create expenses') THEN
        DROP POLICY "Users can create expenses" ON expenses;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'expenses' AND policyname = 'Users can update own expenses') THEN
        DROP POLICY "Users can update own expenses" ON expenses;
    END IF;
    
    -- Drop tasks table policies
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Users can view assigned tasks') THEN
        DROP POLICY "Users can view assigned tasks" ON tasks;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Users can manage assigned tasks') THEN
        DROP POLICY "Users can manage assigned tasks" ON tasks;
    END IF;
END $$;

-- 2. Create helper functions for JWT claim checks
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

-- 3. Create new policies using JWT claims
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

CREATE POLICY "Admins can insert users" ON users
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can delete users" ON users
  FOR DELETE USING (is_admin());

-- 4. Fix policies for related tables to avoid recursion
DROP POLICY IF EXISTS EXISTS ON projects;
DROP POLICY IF EXISTS EXISTS ON time_entries;
DROP POLICY IF EXISTS EXISTS ON expenses;
DROP POLICY IF EXISTS EXISTS ON tasks;

-- Projects policies
CREATE POLICY "Users can view assigned projects" ON projects
  FOR SELECT USING (
    auth.uid()::text = managerId::text OR
    auth.uid() IN (SELECT userId FROM project_members WHERE projectId = id)
  );

CREATE POLICY "Managers can manage projects" ON projects
  FOR ALL USING (
    is_manager() OR 
    auth.uid()::text = managerId::text
  );

-- Time entries policies
CREATE POLICY "Users can view own time entries" ON time_entries
  FOR SELECT USING (
    auth.uid()::text = userId::text OR
    is_manager()
  );

CREATE POLICY "Users can manage own time entries" ON time_entries
  FOR INSERT WITH CHECK (auth.uid()::text = userId::text);

CREATE POLICY "Users can update own time entries" ON time_entries
  FOR UPDATE USING (auth.uid()::text = userId::text);

CREATE POLICY "Users can delete own time entries" ON time_entries
  FOR DELETE USING (auth.uid()::text = userId::text);

-- Expenses policies
CREATE POLICY "Users can view own expenses" ON expenses
  FOR SELECT USING (
    auth.uid()::text = userId::text OR
    auth.uid()::text = approvedBy::text OR
    is_manager()
  );

CREATE POLICY "Users can create expenses" ON expenses
  FOR INSERT WITH CHECK (auth.uid()::text = userId::text);

CREATE POLICY "Users can update own expenses" ON expenses
  FOR UPDATE USING (
    auth.uid()::text = userId::text
  );

-- Tasks policies
CREATE POLICY "Users can view assigned tasks" ON tasks
  FOR SELECT USING (
    auth.uid()::text = assignedTo::text OR
    auth.uid()::text = createdBy::text OR
    is_manager()
  );

CREATE POLICY "Users can manage assigned tasks" ON tasks
  FOR ALL USING (
    auth.uid()::text = assignedTo::text OR
    auth.uid()::text = createdBy::text OR
    is_manager()
  );

-- 5. Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
