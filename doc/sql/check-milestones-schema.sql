-- Check milestones table schema
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'milestones' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check sample data
SELECT 
    id,
    title,
    description,
    status,
    due_date,
    created_at
FROM milestones 
LIMIT 3;
