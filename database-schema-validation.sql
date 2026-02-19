-- Database Schema Validation Script
-- ตรวจสอบโครงสร้างฐานข้อมูลก่อนการพัฒนา

-- 1. ตรวจสอบ Tables ที่มีอยู่
SELECT 
    table_name,
    table_type,
    is_insertable_into
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. ตรวจสอบ Columns ในแต่ละ Table
-- Clients Table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'clients' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Projects Table
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

-- Users Table
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

-- 3. ตรวจสอบ Foreign Keys
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- 4. ตรวจสอบ Indexes
SELECT 
    indexname AS index_name,
    indexdef AS index_definition
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY indexname, indexdef;

-- 5. ตรวจสอบ Data Samples
-- Clients Sample
SELECT COUNT(*) as client_count FROM clients;

-- Projects Sample  
SELECT COUNT(*) as project_count FROM projects;

-- Users Sample
SELECT COUNT(*) as user_count FROM users;

-- 6. ตรวจสอบ Relationships
-- ตรวจสอบว่า manager_id ใน projects อ้างอิงถึง users ถูกต้องหรือไม่
SELECT 
    p.id as project_id,
    p.name as project_name,
    p."managerId",
    u.id as user_id,
    u.name as user_name
FROM projects p
LEFT JOIN users u ON p."managerId" = u.id
LIMIT 5;

-- ตรวจสอบว่า client_id ใน projects อ้างอิงถึง clients ถูกต้องหรือไม่
SELECT 
    p.id as project_id,
    p.name as project_name,
    p."clientId",
    c.id as client_id_check,
    c.name as client_name
FROM projects p
LEFT JOIN clients c ON p."clientId" = c.id
LIMIT 5;
