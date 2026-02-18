-- ==========================================
-- Fixed Check Current Database Schema Status
-- ตรวจสอบสถานะปัจจุบันของ database schema (แก้ไข error)
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
-- 5. CHECK FOREIGN KEY CONSTRAINTS (Fixed)
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
-- 6. CHECK UNIQUE CONSTRAINTS
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
-- 7. CHECK INDEXES
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
-- 8. CHECK CURRENT DATA STATUS
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

-- Tasks data status
SELECT 
    'Tasks' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN project_id IS NOT NULL AND project_id != '' THEN 1 END) as with_project,
    COUNT(CASE WHEN assignee_id IS NOT NULL AND assignee_id != '' THEN 1 END) as with_assignee,
    COUNT(CASE WHEN status IS NOT NULL AND status != '' THEN 1 END) as with_status,
    COUNT(CASE WHEN priority IS NOT NULL AND priority != '' THEN 1 END) as with_priority
FROM tasks;

-- ==========================================
-- 9. CHECK DUPLICATE CODES
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
-- 10. SAMPLE DATA VERIFICATION
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

-- Sample tasks
SELECT 
    'Sample Tasks:' as info;
SELECT 
    id,
    name,
    project_id,
    assignee_id,
    status,
    priority,
    created_at
FROM tasks
ORDER BY created_at DESC
LIMIT 5;

-- ==========================================
-- 11. ADDITIONAL CHECKS
-- ==========================================

-- Check if required columns exist
SELECT 
    'Required Columns Check' as check_type,
    table_name,
    column_name,
    'EXISTS' as status
FROM information_schema.columns 
WHERE table_schema = 'public'
    AND table_name IN ('projects', 'users', 'tasks')
    AND column_name IN ('code', 'category', 'manager_id', 'client_id', 'weekly_capacity', 'project_id', 'assignee_id', 'status', 'priority')
ORDER BY table_name, column_name;

-- Check missing columns
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
    ('tasks', 'assignee_id')
) as required(table_name, column_name)
WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
        AND table_name = required.table_name
        AND column_name = required.column_name
);

-- ==========================================
-- สรุปสิ่งที่ตรวจสอบ:
-- 1. Tables ที่มีอยู่จริง
-- 2. Columns ทั้งหมดในแต่ละตาราง
-- 3. Foreign key constraints ทั้งหมด (แก้ไขแล้ว)
-- 4. Unique constraints ทั้งหมด
-- 5. Indexes ทั้งหมด
-- 6. สถานะข้อมูลปัจจุบัน
-- 7. ปัญหา duplicate codes
-- 8. ข้อมูลตัวอย่างจากแต่ละตาราง
-- 9. ตรวจสอบคอลัมน์ที่จำเป็น
-- 10. ตรวจสอบคอลัมน์ที่หายไป
-- ==========================================
