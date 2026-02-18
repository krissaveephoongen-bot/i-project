-- ==========================================
-- Check and Fix Database Schema Issues
-- ตรวจสอบและแก้ไขปัญหา schema ที่ไม่ตรงกัน
-- ==========================================

-- ==========================================
-- 1. CHECK EXISTING COLUMNS FIRST
-- ==========================================

-- Check projects table columns
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'projects' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check users table columns
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check tasks table columns
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'tasks' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- ==========================================
-- 2. ADD MISSING COLUMNS (Safe approach)
-- ==========================================

-- Add missing columns to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS code TEXT;

-- Add manager_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' 
            AND column_name = 'manager_id'
            AND table_schema = 'public'
    ) THEN
        ALTER TABLE projects ADD COLUMN manager_id TEXT;
    END IF;
END $$;

-- Add client_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' 
            AND column_name = 'client_id'
            AND table_schema = 'public'
    ) THEN
        ALTER TABLE projects ADD COLUMN client_id TEXT;
    END IF;
END $$;

-- Add missing columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS weekly_capacity DECIMAL(5,2) DEFAULT 40.00;

-- Add missing columns to time_entries table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'time_entries' 
            AND column_name = 'project_id'
            AND table_schema = 'public'
    ) THEN
        ALTER TABLE time_entries ADD COLUMN project_id TEXT;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'time_entries' 
            AND column_name = 'task_id'
            AND table_schema = 'public'
    ) THEN
        ALTER TABLE time_entries ADD COLUMN task_id TEXT;
    END IF;
END $$;

-- Add missing columns to expenses table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'expenses' 
            AND column_name = 'project_id'
            AND table_schema = 'public'
    ) THEN
        ALTER TABLE expenses ADD COLUMN project_id TEXT;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'expenses' 
            AND column_name = 'task_id'
            AND table_schema = 'public'
    ) THEN
        ALTER TABLE expenses ADD COLUMN task_id TEXT;
    END IF;
END $$;

-- ==========================================
-- 3. DATA MIGRATION & DEFAULT VALUES
-- ==========================================

-- Update projects with default values
UPDATE projects 
SET category = 'General' 
WHERE category IS NULL OR category = '';

UPDATE projects 
SET code = 'PROJ-' || LPAD(id::text, 6, '0')
WHERE code IS NULL OR code = '';

-- Update users with default weekly capacity
UPDATE users 
SET weekly_capacity = 40.00 
WHERE weekly_capacity IS NULL;

-- ==========================================
-- 4. SAFE FOREIGN KEY CONSTRAINTS CREATION
-- ==========================================

-- Only create constraints if both columns exist
DO $$
BEGIN
    -- Projects manager_id constraint
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' 
            AND column_name = 'manager_id'
            AND table_schema = 'public'
    ) THEN
        
        -- Drop constraint first if exists
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_projects_manager_id' 
                   AND table_name = 'projects') THEN
            ALTER TABLE projects DROP CONSTRAINT fk_projects_manager_id;
        END IF;
        
        -- Add constraint
        ALTER TABLE projects 
        ADD CONSTRAINT fk_projects_manager_id 
        FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
    
    -- Projects client_id constraint
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' 
            AND column_name = 'client_id'
            AND table_schema = 'public'
    ) THEN
        
        -- Drop constraint first if exists
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_projects_client_id' 
                   AND table_name = 'projects') THEN
            ALTER TABLE projects DROP CONSTRAINT fk_projects_client_id;
        END IF;
        
        -- Add constraint
        ALTER TABLE projects 
        ADD CONSTRAINT fk_projects_client_id 
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;
    END IF;
    
    -- Tasks project_id constraint
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' 
            AND column_name = 'project_id'
            AND table_schema = 'public'
    ) THEN
        
        -- Drop constraint first if exists
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_tasks_project_id' 
                   AND table_name = 'tasks') THEN
            ALTER TABLE tasks DROP CONSTRAINT fk_tasks_project_id;
        END IF;
        
        -- Add constraint
        ALTER TABLE tasks 
        ADD CONSTRAINT fk_tasks_project_id 
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
    END IF;
    
    -- Tasks assignee_id constraint
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' 
            AND column_name = 'assignee_id'
            AND table_schema = 'public'
    ) THEN
        
        -- Drop constraint first if exists
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_tasks_assignee_id' 
                   AND table_name = 'tasks') THEN
            ALTER TABLE tasks DROP CONSTRAINT fk_tasks_assignee_id;
        END IF;
        
        -- Add constraint
        ALTER TABLE tasks 
        ADD CONSTRAINT fk_tasks_assignee_id 
        FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
    
    -- Tasks creator_id constraint
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' 
            AND column_name = 'creator_id'
            AND table_schema = 'public'
    ) THEN
        
        -- Drop constraint first if exists
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_tasks_creator_id' 
                   AND table_name = 'tasks') THEN
            ALTER TABLE tasks DROP CONSTRAINT fk_tasks_creator_id;
        END IF;
        
        -- Add constraint
        ALTER TABLE tasks 
        ADD CONSTRAINT fk_tasks_creator_id 
        FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
    
    -- Time entries user_id constraint
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'time_entries' 
            AND column_name = 'user_id'
            AND table_schema = 'public'
    ) THEN
        
        -- Drop constraint first if exists
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_time_entries_user_id' 
                   AND table_name = 'time_entries') THEN
            ALTER TABLE time_entries DROP CONSTRAINT fk_time_entries_user_id;
        END IF;
        
        -- Add constraint
        ALTER TABLE time_entries 
        ADD CONSTRAINT fk_time_entries_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
    
    -- Time entries task_id constraint
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'time_entries' 
            AND column_name = 'task_id'
            AND table_schema = 'public'
    ) THEN
        
        -- Drop constraint first if exists
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_time_entries_task_id' 
                   AND table_name = 'time_entries') THEN
            ALTER TABLE time_entries DROP CONSTRAINT fk_time_entries_task_id;
        END IF;
        
        -- Add constraint
        ALTER TABLE time_entries 
        ADD CONSTRAINT fk_time_entries_task_id 
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE;
    END IF;
    
    -- Expenses user_id constraint
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'expenses' 
            AND column_name = 'user_id'
            AND table_schema = 'public'
    ) THEN
        
        -- Drop constraint first if exists
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_expenses_user_id' 
                   AND table_name = 'expenses') THEN
            ALTER TABLE expenses DROP CONSTRAINT fk_expenses_user_id;
        END IF;
        
        -- Add constraint
        ALTER TABLE expenses 
        ADD CONSTRAINT fk_expenses_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- ==========================================
-- 5. SAFE UNIQUE CONSTRAINTS CREATION
-- ==========================================

DO $$
BEGIN
    -- Projects code unique constraint
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' 
            AND column_name = 'code'
            AND table_schema = 'public'
    ) THEN
        
        -- Drop constraint first if exists
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'projects_code_unique' 
                   AND table_name = 'projects') THEN
            ALTER TABLE projects DROP CONSTRAINT projects_code_unique;
        END IF;
        
        -- Add constraint
        ALTER TABLE projects 
        ADD CONSTRAINT projects_code_unique UNIQUE (code);
    END IF;
    
    -- Users email unique constraint
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
            AND column_name = 'email'
            AND table_schema = 'public'
    ) THEN
        
        -- Drop constraint first if exists
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'users_email_unique' 
                   AND table_name = 'users') THEN
            ALTER TABLE users DROP CONSTRAINT users_email_unique;
        END IF;
        
        -- Add constraint
        ALTER TABLE users 
        ADD CONSTRAINT users_email_unique UNIQUE (email);
    END IF;
END $$;

-- ==========================================
-- 6. PERFORMANCE INDEXES (Safe creation)
-- ==========================================

-- Only create indexes if columns exist
DO $$
BEGIN
    -- Projects table indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'projects' AND column_name = 'status' AND table_schema = 'public') THEN
        CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'projects' AND column_name = 'priority' AND table_schema = 'public') THEN
        CREATE INDEX IF NOT EXISTS idx_projects_priority ON projects(priority);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'projects' AND column_name = 'category' AND table_schema = 'public') THEN
        CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'projects' AND column_name = 'code' AND table_schema = 'public') THEN
        CREATE INDEX IF NOT EXISTS idx_projects_code ON projects(code);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'projects' AND column_name = 'manager_id' AND table_schema = 'public') THEN
        CREATE INDEX IF NOT EXISTS idx_projects_manager_id ON projects(manager_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'projects' AND column_name = 'client_id' AND table_schema = 'public') THEN
        CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
    END IF;
    
    -- Users table indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' AND column_name = 'role' AND table_schema = 'public') THEN
        CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' AND column_name = 'department' AND table_schema = 'public') THEN
        CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' AND column_name = 'is_active' AND table_schema = 'public') THEN
        CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
    END IF;
    
    -- Tasks table indexes
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'tasks' AND column_name = 'project_id' AND table_schema = 'public') THEN
        CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'tasks' AND column_name = 'assignee_id' AND table_schema = 'public') THEN
        CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks(assignee_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'tasks' AND column_name = 'status' AND table_schema = 'public') THEN
        CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'tasks' AND column_name = 'priority' AND table_schema = 'public') THEN
        CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
    END IF;
END $$;

-- ==========================================
-- 7. VERIFICATION QUERIES
-- ==========================================

-- Check final schema
SELECT 'projects' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'projects' AND table_schema = 'public'
    AND column_name IN ('category', 'code', 'manager_id', 'client_id')

UNION ALL

SELECT 'users' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
    AND column_name IN ('weekly_capacity', 'is_active', 'role')

UNION ALL

SELECT 'tasks' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'tasks' AND table_schema = 'public'
    AND column_name IN ('project_id', 'assignee_id', 'status', 'priority')

ORDER BY table_name, column_name;

-- Check constraints
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
    AND tc.table_name IN ('projects', 'users', 'tasks', 'time_entries', 'expenses', 'timesheets')
ORDER BY tc.table_name, kcu.column_name;

-- Sample data verification
SELECT 'Projects with codes and categories:' as info;
SELECT id, name, code, category, status FROM projects ORDER BY created_at DESC LIMIT 3;

SELECT 'Users with weekly capacity:' as info;
SELECT id, name, email, weekly_capacity, is_active FROM users WHERE is_active = true LIMIT 3;

-- ==========================================
-- คำแนะนำ:
-- 1. รัน queries ที่ 1-3 ก่อนเพื่อตรวจสอบ schema
-- 2. รัน queries ที่ 4-6 เพื่อสร้าง constraints และ indexes
-- 3. รัน queries ที่ 7 เพื่อตรวจสอบผลลัพธ์
-- ==========================================
