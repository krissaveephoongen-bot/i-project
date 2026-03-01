-- ==========================================
-- Correct Schema Check Based on Actual Database
-- ตรวจสอบสถานะปัจจุบันของ database schema (ใช้ column names ที่ถูกต้อง)
-- ==========================================

-- ==========================================
-- 1. CHECK TABLES EXISTENCE
-- ==========================================

SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
    AND table_name IN ('projects', 'users', 'tasks', 'time_entries', 'expenses', 'timesheets', 'clients', 'milestones')
ORDER BY table_name;

-- ==========================================
-- 2. CHECK PROJECTS TABLE COLUMNS
-- ==========================================

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'projects' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- ==========================================
-- 3. CHECK USERS TABLE COLUMNS
-- ==========================================

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'users' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- ==========================================
-- 4. CHECK TASKS TABLE COLUMNS
-- ==========================================

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'tasks' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- ==========================================
-- 5. CHECK TIME ENTRIES TABLE COLUMNS
-- ==========================================

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'time_entries' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- ==========================================
-- 6. CHECK EXPENSES TABLE COLUMNS
-- ==========================================

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'expenses' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- ==========================================
-- 7. CHECK FOREIGN KEY CONSTRAINTS
-- ==========================================

SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
LEFT JOIN information_schema.referential_constraints rc
    ON tc.constraint_name = rc.constraint_name
    AND tc.constraint_schema = rc.constraint_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- ==========================================
-- 8. CHECK UNIQUE CONSTRAINTS
-- ==========================================

SELECT 
    tc.table_name,
    kcu.column_name,
    tc.constraint_name,
    tc.constraint_type
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type IN ('UNIQUE', 'PRIMARY KEY')
    AND tc.table_schema = 'public'
    AND tc.table_name IN ('projects', 'users', 'tasks', 'time_entries', 'expenses', 'timesheets')
ORDER BY tc.table_name, tc.constraint_type;

-- ==========================================
-- 9. CHECK INDEXES
-- ==========================================

SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN ('projects', 'users', 'tasks', 'time_entries', 'expenses', 'timesheets')
ORDER BY tablename, indexname;

-- ==========================================
-- 10. CHECK CURRENT DATA STATUS (Correct Column Names)
-- ==========================================

-- Projects data status
SELECT 
    'Projects' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN code IS NOT NULL AND code != '' THEN 1 END) as with_code,
    COUNT(CASE WHEN category IS NOT NULL AND category != '' THEN 1 END) as with_category,
    COUNT(CASE WHEN manager_id IS NOT NULL AND manager_id != '' THEN 1 END) as with_manager,
    COUNT(CASE WHEN client_id IS NOT NULL AND client_id != '' THEN 1 END) as with_client
FROM projects

UNION ALL

-- Users data status
SELECT 
    'Users' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN email IS NOT NULL AND email != '' THEN 1 END) as with_email,
    COUNT(CASE WHEN weekly_capacity IS NOT NULL THEN 1 END) as with_capacity,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
    COUNT(CASE WHEN role IS NOT NULL AND role != '' THEN 1 END) as with_role
FROM users

UNION ALL

-- Tasks data status (Correct: title instead of name, assigned_to instead of assignee_id)
SELECT 
    'Tasks' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN project_id IS NOT NULL AND project_id != '' THEN 1 END) as with_project,
    COUNT(CASE WHEN assigned_to IS NOT NULL AND assigned_to != '' THEN 1 END) as with_assignee,
    COUNT(CASE WHEN status IS NOT NULL AND status != '' THEN 1 END) as with_status,
    COUNT(CASE WHEN priority IS NOT NULL AND priority != '' THEN 1 END) as with_priority
FROM tasks

UNION ALL

-- Time entries data status
SELECT 
    'Time Entries' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN user_id IS NOT NULL AND user_id != '' THEN 1 END) as with_user,
    COUNT(CASE WHEN project_id IS NOT NULL AND project_id != '' THEN 1 END) as with_project,
    COUNT(CASE WHEN task_id IS NOT NULL AND task_id != '' THEN 1 END) as with_task,
    COUNT(CASE WHEN date IS NOT NULL THEN 1 END) as with_date
FROM time_entries

UNION ALL

-- Expenses data status
SELECT 
    'Expenses' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN user_id IS NOT NULL AND user_id != '' THEN 1 END) as with_user,
    COUNT(CASE WHEN project_id IS NOT NULL AND project_id != '' THEN 1 END) as with_project,
    COUNT(CASE WHEN task_id IS NOT NULL AND task_id != '' THEN 1 END) as with_task,
    COUNT(CASE WHEN status IS NOT NULL AND status != '' THEN 1 END) as with_status
FROM expenses;

-- ==========================================
-- 11. CHECK DUPLICATE CODES
-- ==========================================

SELECT 
    'Duplicate codes' as issue_type,
    COUNT(*) as count,
    STRING_AGG(code::text, ', ') as duplicate_values
FROM (
    SELECT code
    FROM projects
    WHERE code IS NOT NULL AND code != ''
    GROUP BY code
    HAVING COUNT(*) > 1
) as duplicates;

-- ==========================================
-- 12. SAMPLE DATA VERIFICATION (Correct Column Names)
-- ==========================================

-- Sample projects
SELECT 
    'Sample Projects:' as info;
SELECT 
    id,
    name,
    code,
    category,
    status,
    manager_id,
    client_id,
    created_at
FROM projects
ORDER BY created_at DESC
LIMIT 5;

-- Sample users
SELECT 
    'Sample Users:' as info;
SELECT 
    id,
    name,
    email,
    role,
    weekly_capacity,
    is_active,
    created_at
FROM users
WHERE is_active = true
ORDER BY created_at DESC
LIMIT 5;

-- Sample tasks (Correct: title instead of name, assigned_to instead of assignee_id)
SELECT 
    'Sample Tasks:' as info;
SELECT 
    id,
    title,
    project_id,
    assigned_to,
    status,
    priority,
    created_at
FROM tasks
ORDER BY created_at DESC
LIMIT 5;

-- Sample time entries
SELECT 
    'Sample Time Entries:' as info;
SELECT 
    id,
    user_id,
    project_id,
    task_id,
    date,
    hours,
    created_at
FROM time_entries
ORDER BY created_at DESC
LIMIT 5;

-- Sample expenses
SELECT 
    'Sample Expenses:' as info;
SELECT 
    id,
    project_id,
    user_id,
    task_id,
    amount,
    category,
    status,
    created_at
FROM expenses
ORDER BY created_at DESC
LIMIT 5;

-- ==========================================
-- 13. CORRECTED REQUIRED COLUMNS CHECK
-- ==========================================

-- Check if required columns exist (Correct column names)
SELECT 
    'Required Columns Check' as check_type,
    table_name,
    column_name,
    'EXISTS' as status
FROM information_schema.columns 
WHERE table_schema = 'public'
    AND table_name IN ('projects', 'users', 'tasks', 'time_entries', 'expenses')
    AND column_name IN (
        'code', 'category', 'manager_id', 'client_id', 'weekly_capacity', 
        'project_id', 'assigned_to', 'status', 'priority', 'title',
        'user_id', 'task_id', 'date', 'hours', 'amount'
    )
ORDER BY table_name, column_name;

-- ==========================================
-- 14. MISSING COLUMNS CHECK
-- ==========================================

-- Check missing columns (Correct column names)
SELECT 
    'Missing Columns' as check_type,
    table_name,
    column_name,
    'MISSING' as status
FROM (VALUES 
    ('projects', 'code'),
    ('projects', 'category'),
    ('projects', 'manager_id'),
    ('projects', 'client_id'),
    ('users', 'weekly_capacity'),
    ('tasks', 'project_id'),
    ('tasks', 'assigned_to'),
    ('tasks', 'title'),
    ('time_entries', 'project_id'),
    ('time_entries', 'task_id'),
    ('expenses', 'project_id'),
    ('expenses', 'task_id')
) as required(table_name, column_name)
WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
        AND table_name = required.table_name
        AND column_name = required.column_name
);

-- ==========================================
-- 15. COLUMN NAME MAPPING SUMMARY
-- ==========================================

-- Show correct column names for each table
SELECT 
    'Column Mapping Summary' as check_type,
    table_name,
    column_name,
    CASE 
        WHEN table_name = 'tasks' AND column_name = 'title' THEN 'title (correct - not name)'
        WHEN table_name = 'tasks' AND column_name = 'assigned_to' THEN 'assigned_to (correct - not assignee_id)'
        WHEN table_name = 'projects' AND column_name = 'name' THEN 'name (correct)'
        WHEN table_name = 'users' AND column_name = 'name' THEN 'name (correct)'
        ELSE column_name
    END as notes
FROM information_schema.columns 
WHERE table_schema = 'public'
    AND table_name IN ('projects', 'users', 'tasks', 'time_entries', 'expenses')
    AND column_name IN ('name', 'title', 'assigned_to', 'assignee_id')
ORDER BY table_name, column_name;

-- ==========================================
-- สรุปสิ่งที่ตรวจสอบ:
-- 1. Tables ที่มีอยู่จริง
-- 2. Columns ทั้งหมดในแต่ละตาราง (ใช้ชื่อที่ถูกต้อง)
-- 3. Foreign key constraints ทั้งหมด
-- 4. Unique constraints ทั้งหมด
-- 5. Indexes ทั้งหมด
-- 6. สถานะข้อมูลปัจจุบัน (ใช้ column names ที่ถูกต้อง)
-- 7. ปัญหา duplicate codes
-- 8. ข้อมูลตัวอย่างจากแต่ละตาราง (ใช้ column names ที่ถูกต้อง)
-- 9. ตรวจสอบคอลัมน์ที่จำเป็น (ใช้ column names ที่ถูกต้อง)
-- 10. ตรวจสอบคอลัมน์ที่หายไป (ใช้ column names ที่ถูกต้อง)
-- 11. สรุปการ mapping ของ column names ที่ถูกต้อง
-- ==========================================
