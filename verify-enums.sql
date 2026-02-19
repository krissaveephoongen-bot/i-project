-- ============================================================
-- VERIFICATION AND INSPECTION QUERIES
-- ============================================================

-- 1. List all enum types in the database
SELECT 
  t.typname,
  t.typtype,
  ns.nspname as schema,
  obj_description(t.oid, 'pg_type') as comment
FROM pg_type t
JOIN pg_namespace ns ON ns.oid = t.typnamespace
WHERE t.typtype = 'e'
ORDER BY ns.nspname, t.typname;

-- 2. List all enum values for each enum type
SELECT 
  t.typname as enum_type,
  e.enumlabel as enum_value,
  e.enumsortorder as sort_order
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typtype = 'e'
ORDER BY t.typname, e.enumsortorder;

-- 3. Count of enum types by category (helper query)
-- This shows a summary of all enums
SELECT 
  COUNT(*) as total_enum_types
FROM pg_type 
WHERE typtype = 'e' 
AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- 4. List columns using each enum type
SELECT
  c.table_name,
  c.column_name,
  c.udt_name as enum_type,
  t.table_type
FROM information_schema.columns c
JOIN information_schema.tables t ON c.table_name = t.table_name AND c.table_schema = t.table_schema
WHERE c.data_type = 'USER-DEFINED'
AND c.udt_name IN (
  SELECT typname FROM pg_type WHERE typtype = 'e'
)
ORDER BY c.table_name, c.column_name;

-- 5. Check if all expected enums exist
SELECT
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN 'FOUND'
    ELSE 'MISSING'
  END as "user_role",
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN 'FOUND'
    ELSE 'MISSING'
  END as "user_status",
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProjectStatus') THEN 'FOUND'
    ELSE 'MISSING'
  END as "ProjectStatus",
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProjectPriority') THEN 'FOUND'
    ELSE 'MISSING'
  END as "ProjectPriority",
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TaskStatus') THEN 'FOUND'
    ELSE 'MISSING'
  END as "TaskStatus",
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TaskPriority') THEN 'FOUND'
    ELSE 'MISSING'
  END as "TaskPriority",
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'WorkType') THEN 'FOUND'
    ELSE 'MISSING'
  END as "WorkType",
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'LeaveType') THEN 'FOUND'
    ELSE 'MISSING'
  END as "LeaveType",
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ExpenseStatus') THEN 'FOUND'
    ELSE 'MISSING'
  END as "ExpenseStatus",
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ClientStatus') THEN 'FOUND'
    ELSE 'MISSING'
  END as "ClientStatus";

-- 6. Detailed enum values for User Roles
SELECT 
  'user_role' as enum_type,
  enumlabel as value
FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
ORDER BY enumsortorder;

-- 7. Detailed enum values for All Status Types
SELECT 
  t.typname as enum_type,
  e.enumlabel as value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname LIKE '%Status%'
ORDER BY t.typname, e.enumsortorder;

-- 8. Detailed enum values for All Priority Types
SELECT 
  t.typname as enum_type,
  e.enumlabel as value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname LIKE '%Priority%' OR t.typname = 'Priority'
ORDER BY t.typname, e.enumsortorder;

-- 9. Summary statistics
SELECT 
  (SELECT COUNT(*) FROM pg_type WHERE typtype = 'e') as total_enum_types,
  (SELECT COUNT(*) FROM pg_enum) as total_enum_values,
  (SELECT COUNT(DISTINCT enumtypid) FROM pg_enum) as distinct_enum_types;

-- 10. Find duplicate enum values (if any - for quality check)
SELECT 
  e.enumlabel,
  COUNT(*) as occurrence_count,
  STRING_AGG(DISTINCT t.typname, ', ') as used_in_enums
FROM pg_enum e
JOIN pg_type t ON t.oid = e.enumtypid
GROUP BY e.enumlabel
HAVING COUNT(*) > 1
ORDER BY occurrence_count DESC;
