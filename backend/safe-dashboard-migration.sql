-- Safe migration to add missing dashboard columns and tables
-- This script only adds new columns and tables without dropping existing ones

-- Add missing columns to projects table if they don't exist
DO $$
BEGIN
    -- Add progress column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'progress'
    ) THEN
        ALTER TABLE projects ADD COLUMN progress INTEGER DEFAULT 0;
    END IF;

    -- Add progress_plan column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'progress_plan'
    ) THEN
        ALTER TABLE projects ADD COLUMN progress_plan INTEGER DEFAULT 0;
    END IF;

    -- Add spi column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'spi'
    ) THEN
        ALTER TABLE projects ADD COLUMN spi DECIMAL(5,2) DEFAULT 1.00;
    END IF;

    -- Add risk_level column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'risk_level'
    ) THEN
        ALTER TABLE projects ADD COLUMN risk_level VARCHAR(20) DEFAULT 'low';
    END IF;
END $$;

-- Create project_progress_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS project_progress_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    progress INTEGER NOT NULL,
    week_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    UNIQUE(project_id, week_date)
);

-- Create financial_data table if it doesn't exist
CREATE TABLE IF NOT EXISTS financial_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month TIMESTAMP NOT NULL UNIQUE,
    revenue DECIMAL(15,2) DEFAULT 0.00,
    cost DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL
);

-- Create milestones table if it doesn't exist (with amount column)
CREATE TABLE IF NOT EXISTS milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMP NOT NULL,
    amount DECIMAL(15,2),
    status TEXT DEFAULT 'pending' NOT NULL,
    progress INTEGER DEFAULT 0,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL
);

-- Add amount column to milestones table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'milestones' AND column_name = 'amount'
    ) THEN
        ALTER TABLE milestones ADD COLUMN amount DECIMAL(15,2);
    END IF;
END $$;

-- Create risks table if it doesn't exist
CREATE TABLE IF NOT EXISTS risks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    impact TEXT NOT NULL,
    probability TEXT NOT NULL,
    risk_score INTEGER,
    mitigation_plan TEXT,
    status TEXT DEFAULT 'open' NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_progress_history_project ON project_progress_history(project_id);
CREATE INDEX IF NOT EXISTS idx_project_progress_history_date ON project_progress_history(week_date);
CREATE INDEX IF NOT EXISTS idx_financial_data_month ON financial_data(month);
CREATE INDEX IF NOT EXISTS idx_milestones_project ON milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_risks_project ON risks(project_id);
CREATE INDEX IF NOT EXISTS idx_risks_status ON risks(status);

-- Insert sample financial data if table is empty
INSERT INTO financial_data (month, revenue, cost) VALUES
    ('2024-01-01'::timestamp, 2500000.00, 1800000.00),
    ('2024-02-01'::timestamp, 2750000.00, 1950000.00),
    ('2024-03-01'::timestamp, 2900000.00, 2100000.00),
    ('2024-04-01'::timestamp, 3100000.00, 2200000.00),
    ('2024-05-01'::timestamp, 3300000.00, 2350000.00),
    ('2024-06-01'::timestamp, 3450000.00, 2500000.00)
ON CONFLICT (month) DO NOTHING;

-- Update existing projects with default values for new columns
UPDATE projects SET 
    progress = COALESCE(progress, 0),
    progress_plan = COALESCE(progress_plan, 0),
    spi = COALESCE(spi, 1.00),
    risk_level = COALESCE(risk_level, 'low')
WHERE progress IS NULL OR progress_plan IS NULL OR spi IS NULL OR risk_level IS NULL;
