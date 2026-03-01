-- ==========================================
-- Comprehensive Database Setup for Project Management System
-- คัดลอกและวางบน Supabase SQL Editor ทั้งหมด
-- ==========================================

-- ==========================================
-- 1. TABLE STRUCTURE UPDATES
-- ==========================================

-- Add missing columns to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS code TEXT;

-- Add missing columns to users table (if not exists)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS weekly_capacity DECIMAL(5,2) DEFAULT 40.00;

-- Add missing columns to time_entries table (if not exists)
ALTER TABLE time_entries 
ADD COLUMN IF NOT EXISTS project_id TEXT REFERENCES projects(id) ON DELETE CASCADE;

-- Add missing columns to expenses table (if not exists)
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE;

-- ==========================================
-- 2. DATA MIGRATION & DEFAULT VALUES
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
-- 3. FOREIGN KEY CONSTRAINTS & RELATIONS
-- ==========================================

-- Projects table relations
ALTER TABLE projects 
ADD CONSTRAINT IF NOT EXISTS fk_projects_manager_id 
FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE projects 
ADD CONSTRAINT IF NOT EXISTS fk_projects_client_id 
FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;

-- Tasks table relations
ALTER TABLE tasks 
ADD CONSTRAINT IF NOT EXISTS fk_tasks_project_id 
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

ALTER TABLE tasks 
ADD CONSTRAINT IF NOT EXISTS fk_tasks_assignee_id 
FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE tasks 
ADD CONSTRAINT IF NOT EXISTS fk_tasks_creator_id 
FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE SET NULL;

-- Milestones table relations
ALTER TABLE milestones 
ADD CONSTRAINT IF NOT EXISTS fk_milestones_project_id 
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

-- Time entries table relations
ALTER TABLE time_entries 
ADD CONSTRAINT IF NOT EXISTS fk_time_entries_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE time_entries 
ADD CONSTRAINT IF NOT EXISTS fk_time_entries_task_id 
FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE;

-- Expenses table relations
ALTER TABLE expenses 
ADD CONSTRAINT IF NOT EXISTS fk_expenses_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Timesheets table relations
ALTER TABLE timesheets 
ADD CONSTRAINT IF NOT EXISTS fk_timesheets_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- ==========================================
-- 4. UNIQUE CONSTRAINTS
-- ==========================================

-- Ensure unique project codes
ALTER TABLE projects 
ADD CONSTRAINT IF NOT EXISTS projects_code_unique UNIQUE (code);

-- Ensure unique user emails
ALTER TABLE users 
ADD CONSTRAINT IF NOT EXISTS users_email_unique UNIQUE (email);

-- Ensure unique task names within projects
ALTER TABLE tasks 
ADD CONSTRAINT IF NOT EXISTS tasks_project_name_unique UNIQUE (project_id, name);

-- ==========================================
-- 5. PERFORMANCE INDEXES
-- ==========================================

-- Projects table indexes
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_priority ON projects(priority);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_code ON projects(code);
CREATE INDEX IF NOT EXISTS idx_projects_manager_id ON projects(manager_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at);

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Tasks table indexes
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);

-- Time entries table indexes
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_task_id ON time_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_project_id ON time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries(date);
CREATE INDEX IF NOT EXISTS idx_time_entries_created_at ON time_entries(created_at);

-- Expenses table indexes
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_project_id ON expenses(project_id);
CREATE INDEX IF NOT EXISTS idx_expenses_task_id ON expenses(task_id);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);

-- Timesheets table indexes
CREATE INDEX IF NOT EXISTS idx_timesheets_user_id ON timesheets(user_id);
CREATE INDEX IF NOT EXISTS idx_timesheets_start_date ON timesheets(start_date);
CREATE INDEX IF NOT EXISTS idx_timesheets_end_date ON timesheets(end_date);
CREATE INDEX IF NOT EXISTS idx_timesheets_status ON timesheets(status);

-- Milestones table indexes
CREATE INDEX IF NOT EXISTS idx_milestones_project_id ON milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_milestones_status ON milestones(status);
CREATE INDEX IF NOT EXISTS idx_milestones_due_date ON milestones(due_date);

-- Resource allocations table indexes (if exists)
CREATE INDEX IF NOT EXISTS idx_resource_allocations_user_id ON resource_allocations(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_allocations_project_id ON resource_allocations(project_id);
CREATE INDEX IF NOT EXISTS idx_resource_allocations_start_date ON resource_allocations(start_date);
CREATE INDEX IF NOT EXISTS idx_resource_allocations_end_date ON resource_allocations(end_date);

-- ==========================================
-- 6. COMPOSITE INDEXES FOR COMMON QUERIES
-- ==========================================

-- Projects: Manager + Status + Priority
CREATE INDEX IF NOT EXISTS idx_projects_manager_status_priority ON projects(manager_id, status, priority);

-- Tasks: Project + Assignee + Status
CREATE INDEX IF NOT EXISTS idx_tasks_project_assignee_status ON tasks(project_id, assignee_id, status);

-- Time entries: User + Date Range
CREATE INDEX IF NOT EXISTS idx_time_entries_user_date ON time_entries(user_id, date);

-- Expenses: User + Status + Date
CREATE INDEX IF NOT EXISTS idx_expenses_user_status_date ON expenses(user_id, status, date);

-- Timesheets: User + Date Range + Status
CREATE INDEX IF NOT EXISTS idx_timesheets_user_dates_status ON timesheets(user_id, start_date, end_date, status);

-- ==========================================
-- 7. PARTIAL INDEXES FOR BETTER PERFORMANCE
-- ==========================================

-- Only index active users
CREATE INDEX IF NOT EXISTS idx_users_active ON users(id) WHERE is_active = true;

-- Only index active projects
CREATE INDEX IF NOT EXISTS idx_projects_active ON projects(id) WHERE status != 'Closed';

-- Only index pending tasks
CREATE INDEX IF NOT EXISTS idx_tasks_pending ON tasks(id) WHERE status IN ('Pending', 'In Progress');

-- Only index pending expenses
CREATE INDEX IF NOT EXISTS idx_expenses_pending ON expenses(id) WHERE status = 'Pending';

-- ==========================================
-- 8. TRIGGERS FOR AUTOMATIC UPDATES
-- ==========================================

-- Update updated_at timestamp for projects
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON tasks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 9. VIEWS FOR COMMON QUERIES
-- ==========================================

-- Active projects with manager info
CREATE OR REPLACE VIEW active_projects_view AS
SELECT 
    p.id,
    p.name,
    p.code,
    p.category,
    p.status,
    p.priority,
    p.start_date,
    p.end_date,
    p.created_at,
    p.updated_at,
    u.name as manager_name,
    u.email as manager_email,
    c.name as client_name
FROM projects p
LEFT JOIN users u ON p.manager_id = u.id
LEFT JOIN clients c ON p.client_id = c.id
WHERE p.status != 'Closed';

-- User workload view
CREATE OR REPLACE VIEW user_workload_view AS
SELECT 
    u.id,
    u.name,
    u.email,
    u.role,
    u.department,
    u.weekly_capacity,
    COUNT(t.id) as active_tasks,
    COUNT(te.id) as time_entries_this_week,
    COALESCE(SUM(te.hours), 0) as hours_this_week
FROM users u
LEFT JOIN tasks t ON u.id = t.assignee_id AND t.status IN ('Pending', 'In Progress')
LEFT JOIN time_entries te ON u.id = te.user_id 
    AND te.date >= CURRENT_DATE - INTERVAL '7 days'
    AND te.date <= CURRENT_DATE
WHERE u.is_active = true
GROUP BY u.id, u.name, u.email, u.role, u.department, u.weekly_capacity;

-- Project progress view
CREATE OR REPLACE VIEW project_progress_view AS
SELECT 
    p.id,
    p.name,
    p.code,
    p.status,
    COUNT(t.id) as total_tasks,
    COUNT(CASE WHEN t.status = 'Completed' THEN 1 END) as completed_tasks,
    ROUND(
        (COUNT(CASE WHEN t.status = 'Completed' THEN 1 END) * 100.0 / NULLIF(COUNT(t.id), 0)), 2
    ) as completion_percentage,
    p.start_date,
    p.end_date,
    CURRENT_DATE as today
FROM projects p
LEFT JOIN tasks t ON p.id = t.project_id
GROUP BY p.id, p.name, p.code, p.status, p.start_date, p.end_date;

-- ==========================================
-- 10. DATABASE STATISTICS & MONITORING
-- ==========================================

-- Table sizes
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats 
WHERE schemaname = 'public' 
    AND tablename IN ('projects', 'users', 'tasks', 'time_entries', 'expenses', 'timesheets')
ORDER BY tablename, attname;

-- Index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Table sizes
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
    AND tablename IN ('projects', 'users', 'tasks', 'time_entries', 'expenses', 'timesheets')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ==========================================
-- 11. VERIFICATION QUERIES
-- ==========================================

-- Check all tables have required columns
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

-- Check foreign key constraints
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

-- Check indexes
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
    AND tablename IN ('projects', 'users', 'tasks', 'time_entries', 'expenses', 'timesheets')
ORDER BY tablename, indexname;

-- Sample data verification
SELECT 'Projects with codes and categories:' as info;
SELECT id, name, code, category, status FROM projects ORDER BY created_at DESC LIMIT 3;

SELECT 'Users with weekly capacity:' as info;
SELECT id, name, email, weekly_capacity, is_active FROM users WHERE is_active = true LIMIT 3;

SELECT 'Tasks with relations:' as info;
SELECT t.id, t.name, t.status, p.name as project_name, u.name as assignee_name 
FROM tasks t 
LEFT JOIN projects p ON t.project_id = p.id 
LEFT JOIN users u ON t.assignee_id = u.id 
LIMIT 3;

-- ==========================================
-- 12. PERFORMANCE TUNING RECOMMENDATIONS
-- ==========================================

-- Update table statistics (run periodically)
ANALYZE projects;
ANALYZE users;
ANALYZE tasks;
ANALYZE time_entries;
ANALYZE expenses;
ANALYZE timesheets;

-- Set work_mem for complex queries (adjust based on available memory)
-- SET work_mem = '256MB';

-- Enable parallel query processing
-- SET max_parallel_workers_per_gather = 4;

-- ==========================================
-- คำแนะนำการใช้งาน:
-- 1. คัดลอก SQL statements ทั้งหมด
-- 2. ไปที่ Supabase Dashboard -> Database -> SQL Editor
-- 3. วางและรันทีละส่วน หรือทั้งหมดพร้อมกัน
-- 4. ตรวจสอบผลลัพธ์จาก verification queries
-- 5. ตรวจสอบว่า API ทำงานได้ถูกต้อง
-- ==========================================