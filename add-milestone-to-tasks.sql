-- Add milestone_id column to tasks table
-- Fix foreign key constraint issue by ensuring both columns are TEXT type

-- First, check if milestone_id column already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'tasks' 
        AND column_name = 'milestone_id'
    ) THEN
        -- Add milestone_id column as TEXT type to match milestones.id
        ALTER TABLE tasks 
        ADD COLUMN milestone_id TEXT;
        
        RAISE NOTICE 'Added milestone_id column to tasks table';
    ELSE
        RAISE NOTICE 'milestone_id column already exists in tasks table';
    END IF;
END $$;

-- Check milestones table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'milestones' 
    AND table_schema = 'public'
    AND column_name = 'id'
ORDER BY ordinal_position;

-- Check tasks table structure for milestone_id
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'tasks' 
    AND table_schema = 'public'
    AND column_name = 'milestone_id'
ORDER BY ordinal_position;

-- Add foreign key constraint if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'tasks_milestone_id_fkey'
        AND table_name = 'tasks'
    ) THEN
        -- Add foreign key constraint
        ALTER TABLE tasks 
        ADD CONSTRAINT tasks_milestone_id_fkey 
        FOREIGN KEY (milestone_id) 
        REFERENCES milestones(id) 
        ON DELETE SET NULL;
        
        RAISE NOTICE 'Added foreign key constraint tasks_milestone_id_fkey';
    ELSE
        RAISE NOTICE 'Foreign key constraint tasks_milestone_id_fkey already exists';
    END IF;
END $$;

-- Verify the constraint was added
SELECT 
    tc.constraint_name,
    tc.constraint_type,
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
    AND tc.table_name = 'tasks'
    AND kcu.column_name = 'milestone_id';

-- Test the structure with sample data
SELECT 
    t.id as task_id,
    t.title as task_title,
    t.milestone_id,
    m.id as milestone_id,
    m.title as milestone_title
FROM tasks t
LEFT JOIN milestones m ON t.milestone_id = m.id
LIMIT 3;
