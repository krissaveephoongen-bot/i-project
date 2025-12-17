-- Add is_deleted column to projects table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'projects' AND column_name = 'is_deleted') THEN
        ALTER TABLE projects 
        ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT FALSE;
        
        -- Update existing rows to have is_deleted = false
        UPDATE projects SET is_deleted = false WHERE is_deleted IS NULL;
    END IF;
END $$;

-- Create an index for better performance on soft delete queries if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_projects_is_deleted' AND tablename = 'projects'
    ) THEN
        CREATE INDEX idx_projects_is_deleted ON projects(is_deleted);
    END IF;
END $$;
