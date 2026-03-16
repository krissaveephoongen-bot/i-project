-- Enhance existing tables for Ant Design components

-- Projects table enhancements
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS status_color VARCHAR(10) DEFAULT '#1890ff',
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
ADD COLUMN IF NOT EXISTS created_by VARCHAR(50),
ADD COLUMN IF NOT EXISTS updated_by VARCHAR(50),
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE,
ADD COLUMN IF NOT EXISTS actual_start_date DATE,
ADD COLUMN IF NOT EXISTS actual_end_date DATE,
ADD COLUMN IF NOT EXISTS budget_allocated DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS budget_spent DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'THB',
ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMP;

-- Users table enhancements
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS date_format VARCHAR(20) DEFAULT 'YYYY-MM-DD',
ADD COLUMN IF NOT EXISTS time_format VARCHAR(10) DEFAULT 'HH:mm',
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS department VARCHAR(100),
ADD COLUMN IF NOT EXISTS position VARCHAR(100),
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Tasks table enhancements (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tasks') THEN
        ALTER TABLE tasks 
        ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
        ADD COLUMN IF NOT EXISTS estimated_hours DECIMAL(5,2),
        ADD COLUMN IF NOT EXISTS actual_hours DECIMAL(5,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS start_date DATE,
        ADD COLUMN IF NOT EXISTS due_date DATE,
        ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP,
        ADD COLUMN IF NOT EXISTS assigned_by VARCHAR(50),
        ADD COLUMN IF NOT EXISTS created_by VARCHAR(50),
        ADD COLUMN IF NOT EXISTS updated_by VARCHAR(50);
    END IF;
END $$;

-- Create foreign key constraints
ALTER TABLE projects 
ADD CONSTRAINT fk_projects_created_by 
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE projects 
ADD CONSTRAINT fk_projects_updated_by 
FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_priority ON projects(priority);
CREATE INDEX IF NOT EXISTS idx_projects_progress ON projects(progress_percentage);
CREATE INDEX IF NOT EXISTS idx_projects_start_date ON projects(start_date);
CREATE INDEX IF NOT EXISTS idx_projects_end_date ON projects(end_date);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_updated_by ON projects(updated_by);

CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login_at);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);
CREATE INDEX IF NOT EXISTS idx_users_position ON users(position);

-- Update existing projects with default values
UPDATE projects SET 
    status_color = CASE 
        WHEN status = 'completed' THEN '#52c41a'
        WHEN status = 'in_progress' THEN '#1890ff'
        WHEN status = 'on_hold' THEN '#faad14'
        WHEN status = 'cancelled' THEN '#ff4d4f'
        ELSE '#1890ff'
    END,
    priority = CASE 
        WHEN status = 'completed' THEN 3
        WHEN status = 'in_progress' THEN 2
        ELSE 1
    END
WHERE status_color IS NULL OR priority IS NULL;
