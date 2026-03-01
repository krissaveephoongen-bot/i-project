-- Drop ALL existing RLS Policies
-- Run this in Supabase SQL Editor

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
