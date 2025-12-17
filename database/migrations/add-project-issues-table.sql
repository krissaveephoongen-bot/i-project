-- Project Issues Log Table Migration
-- Adds issue tracking capability for projects
-- Created: 2025-12-15

-- Create issue status enum
CREATE TYPE issue_status AS ENUM ('open', 'in-progress', 'resolved', 'closed', 'on-hold', 'cancelled');

-- Create issue priority enum (if not exists, reuse task_priority)
CREATE TYPE issue_priority AS ENUM ('low', 'medium', 'high', 'critical');

-- Create issue category enum
CREATE TYPE issue_category AS ENUM (
    'technical',
    'schedule',
    'budget',
    'resource',
    'quality',
    'communication',
    'other'
);

-- First ensure the projects table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'projects') THEN
        RAISE EXCEPTION 'Projects table does not exist. Please run the projects table migration first.';
    END IF;
END $$;

-- Project Issues table
CREATE TABLE IF NOT EXISTS project_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    object_id TEXT UNIQUE,
    
    -- Foreign Key (will be added after table creation if needed)
    project_id UUID NOT NULL,
    
    -- Issue Information
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category issue_category DEFAULT 'other',
    
    -- Status and Priority
    status issue_status DEFAULT 'open',
    priority issue_priority DEFAULT 'medium',
    
    -- Assignment
    assigned_to TEXT,
    reported_by TEXT,
    
    -- Timeline
    reported_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_date TIMESTAMP WITH TIME ZONE,
    resolved_date TIMESTAMP WITH TIME ZONE,
    
    -- Impact
    impact_on_schedule BOOLEAN DEFAULT FALSE,
    impact_on_budget BOOLEAN DEFAULT FALSE,
    estimated_cost DECIMAL(15,2),
    
    -- Resolution
    resolution_notes TEXT,
    root_cause TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT,
    updated_by TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    
    CONSTRAINT chk_issue_dates CHECK (resolved_date IS NULL OR resolved_date >= reported_date)
);

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM   information_schema.table_constraints 
        WHERE  constraint_name = 'project_issues_project_id_fkey'
    ) THEN
        ALTER TABLE project_issues
        ADD CONSTRAINT project_issues_project_id_fkey 
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX idx_project_issues_project_id ON project_issues(project_id);
CREATE INDEX idx_project_issues_status ON project_issues(status);
CREATE INDEX idx_project_issues_priority ON project_issues(priority);
CREATE INDEX idx_project_issues_assigned_to ON project_issues(assigned_to);
CREATE INDEX idx_project_issues_category ON project_issues(category);
CREATE INDEX idx_project_issues_created_at ON project_issues(created_at DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_project_issues_updated_at 
BEFORE UPDATE ON project_issues 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Create view for issue summary by project
CREATE VIEW project_issues_summary AS
SELECT 
    p.id AS project_id,
    p.code AS project_code,
    p.name AS project_name,
    COUNT(*) AS total_issues,
    SUM(CASE WHEN pi.status = 'open' THEN 1 ELSE 0 END) AS open_issues,
    SUM(CASE WHEN pi.status = 'in-progress' THEN 1 ELSE 0 END) AS in_progress_issues,
    SUM(CASE WHEN pi.status = 'resolved' THEN 1 ELSE 0 END) AS resolved_issues,
    SUM(CASE WHEN pi.status = 'closed' THEN 1 ELSE 0 END) AS closed_issues,
    SUM(CASE WHEN pi.priority = 'critical' THEN 1 ELSE 0 END) AS critical_issues,
    SUM(CASE WHEN pi.priority = 'high' THEN 1 ELSE 0 END) AS high_priority_issues,
    SUM(CASE WHEN pi.impact_on_schedule = TRUE THEN 1 ELSE 0 END) AS schedule_impact_count,
    SUM(CASE WHEN pi.impact_on_budget = TRUE THEN 1 ELSE 0 END) AS budget_impact_count,
    COALESCE(SUM(pi.estimated_cost), 0) AS total_issue_cost
FROM projects p
LEFT JOIN project_issues pi ON p.id = pi.project_id AND pi.is_deleted = FALSE
WHERE p.is_deleted = FALSE
GROUP BY p.id, p.code, p.name;

-- Create view for open/critical issues
CREATE VIEW critical_project_issues AS
SELECT 
    pi.*,
    p.name AS project_name,
    p.code AS project_code
FROM project_issues pi
JOIN projects p ON pi.project_id = p.id
WHERE pi.is_deleted = FALSE 
    AND (pi.status IN ('open', 'in-progress') OR pi.priority IN ('high', 'critical'))
ORDER BY 
    CASE pi.priority
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
    END,
    pi.created_at DESC;

-- Sample data insertion function
CREATE OR REPLACE FUNCTION insert_sample_project_issues()
RETURNS void AS $$
DECLARE
    project_id UUID;
BEGIN
    -- Get first active project
    SELECT id INTO project_id FROM projects WHERE status = 'active' LIMIT 1;
    
    IF project_id IS NOT NULL THEN
        -- Insert sample issues
        INSERT INTO project_issues (
            object_id, project_id, code, title, description, category, status, priority,
            assigned_to, reported_by, impact_on_schedule, impact_on_budget, estimated_cost,
            root_cause, resolution_notes
        ) VALUES
        (
            'issue-sample-001', project_id, 'ISS-001', 'Database Connection Timeout',
            'API endpoints experiencing timeout issues with database connections during peak hours',
            'technical', 'in-progress', 'high',
            'Project Manager', 'Somying Employee', TRUE, FALSE, 5000.00,
            'Insufficient connection pool size', 'Increasing pool size from 10 to 25 connections'
        ),
        (
            'issue-sample-002', project_id, 'ISS-002', 'Scope Creep Risk',
            'Additional feature requests beyond original scope from stakeholders',
            'schedule', 'open', 'critical',
            'Project Manager', 'Project Manager', TRUE, TRUE, 15000.00,
            'Unclear requirements definition', 'Awaiting formal change request approval'
        ),
        (
            'issue-sample-003', project_id, 'ISS-003', 'Team Resource Shortage',
            'Frontend developer unavailable for next 2 weeks due to other project commitment',
            'resource', 'open', 'high',
            'Project Manager', 'Project Manager', TRUE, FALSE, 8000.00,
            'Resource allocation conflict', 'Negotiating timeline adjustment'
        ),
        (
            'issue-sample-004', project_id, 'ISS-004', 'UI Responsive Issues',
            'Application not displaying correctly on mobile devices',
            'quality', 'in-progress', 'medium',
            'Somying Employee', 'Somying Employee', FALSE, FALSE, 2000.00,
            'CSS breakpoint configuration error', 'Fixing media queries for mobile viewport'
        );
    END IF;
END;
$$ LANGUAGE plpgsql;
