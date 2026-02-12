-- Performance Optimization: Database Indexes (Fixed Version)
-- This file creates indexes to optimize database performance

-- First, let's check what columns actually exist in the tables
-- You can run this to see the actual structure:
-- \d users
-- \d projects
-- \d time_entries
-- \d tasks
-- \d expenses

-- Users table indexes (only create if columns exist)
-- Basic indexes that should work regardless of schema variations
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Conditional indexes - only create if columns exist
DO $$
BEGIN
    -- Check if status column exists before creating index
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
    END IF;
    
    -- Check if is_active column exists before creating index
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_active') THEN
        CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
    END IF;
    
    -- Check if department column exists before creating index
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'department') THEN
        CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);
    END IF;
END $$;

-- Projects table indexes
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);

-- Conditional indexes for projects table
DO $$
BEGIN
    -- Check if manager_id column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'manager_id') THEN
        CREATE INDEX IF NOT EXISTS idx_projects_manager_id ON projects(manager_id);
    END IF;
    
    -- Check if client_id column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'client_id') THEN
        CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
    END IF;
    
    -- Check if priority column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'priority') THEN
        CREATE INDEX IF NOT EXISTS idx_projects_priority ON projects(priority);
    END IF;
    
    -- Check if category column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'category') THEN
        CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
    END IF;
END $$;

-- Time entries table indexes (most critical for performance)
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries(date);
CREATE INDEX IF NOT EXISTS idx_time_entries_created_at ON time_entries(created_at);

-- Conditional indexes for time_entries table
DO $$
BEGIN
    -- Check if project_id column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'time_entries' AND column_name = 'project_id') THEN
        CREATE INDEX IF NOT EXISTS idx_time_entries_project_id ON time_entries(project_id);
    END IF;
    
    -- Check if work_type column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'time_entries' AND column_name = 'work_type') THEN
        CREATE INDEX IF NOT EXISTS idx_time_entries_work_type ON time_entries(work_type);
    END IF;
    
    -- Check if status column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'time_entries' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_time_entries_status ON time_entries(status);
    END IF;
END $$;

-- Composite indexes for common queries (only if columns exist)
DO $$
BEGIN
    -- Check if all required columns exist for composite indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'time_entries' AND column_name = 'user_id') AND
       EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'time_entries' AND column_name = 'date') THEN
        CREATE INDEX IF NOT EXISTS idx_time_entries_user_date ON time_entries(user_id, date);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'time_entries' AND column_name = 'project_id') AND
       EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'time_entries' AND column_name = 'date') THEN
        CREATE INDEX IF NOT EXISTS idx_time_entries_project_date ON time_entries(project_id, date);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'time_entries' AND column_name = 'user_id') AND
       EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'time_entries' AND column_name = 'project_id') AND
       EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'time_entries' AND column_name = 'date') THEN
        CREATE INDEX IF NOT EXISTS idx_time_entries_user_project_date ON time_entries(user_id, project_id, date);
    END IF;
END $$;

-- Tasks table indexes
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);

-- Conditional indexes for tasks table
DO $$
BEGIN
    -- Check if project_id column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'project_id') THEN
        CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
    END IF;
    
    -- Check if assigned_to column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'assigned_to') THEN
        CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
    END IF;
    
    -- Check if status column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    END IF;
    
    -- Check if priority column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'priority') THEN
        CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
    END IF;
    
    -- Check if due_date column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'due_date') THEN
        CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
    END IF;
END $$;

-- Expenses table indexes
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses(created_at);

-- Conditional indexes for expenses table
DO $$
BEGIN
    -- Check if project_id column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'project_id') THEN
        CREATE INDEX IF NOT EXISTS idx_expenses_project_id ON expenses(project_id);
    END IF;
    
    -- Check if user_id column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'user_id') THEN
        CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
    END IF;
    
    -- Check if category column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'category') THEN
        CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
    END IF;
    
    -- Check if status column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
    END IF;
    
    -- Check if date column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'date') THEN
        CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
    END IF;
END $$;

-- Analyze tables to update statistics (only if tables exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        ANALYZE users;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects') THEN
        ANALYZE projects;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'time_entries') THEN
        ANALYZE time_entries;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks') THEN
        ANALYZE tasks;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'expenses') THEN
        ANALYZE expenses;
    END IF;
END $$;

-- Performance monitoring queries (safe version)
-- Get table sizes and row counts
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.tablename) AS column_count
FROM pg_tables t 
WHERE schemaname = 'public' 
    AND tablename IN ('users', 'projects', 'time_entries', 'tasks', 'expenses')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Get index information (only for existing tables)
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND tablename IN ('users', 'projects', 'time_entries', 'tasks', 'expenses')
ORDER BY tablename, indexname;
