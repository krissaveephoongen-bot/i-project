-- Migration: Add Team Management, Expenses & Dashboard Tables
-- Created: 2025-12-15

-- 1. Create project_members table for Team Management
CREATE TABLE IF NOT EXISTS project_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('lead', 'member', 'viewer')),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(project_id, user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members(user_id);

-- 2. Ensure expenses table exists with proper structure
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(15, 2) NOT NULL,
    category TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('travel', 'food', 'accommodation', 'equipment', 'software', 'service', 'other')),
    description TEXT,
    receipt_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approval_notes TEXT,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    expense_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_expenses_project_id ON expenses(project_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);

-- 3. Create dashboard_stats table for caching statistics
CREATE TABLE IF NOT EXISTS dashboard_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    total_tasks INTEGER DEFAULT 0,
    completed_tasks INTEGER DEFAULT 0,
    in_progress_tasks INTEGER DEFAULT 0,
    pending_expenses DECIMAL(15, 2) DEFAULT 0,
    approved_expenses DECIMAL(15, 2) DEFAULT 0,
    team_members INTEGER DEFAULT 0,
    task_completion_percentage DECIMAL(5, 2) DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dashboard_stats_project_id ON dashboard_stats(project_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_stats_user_id ON dashboard_stats(user_id);

-- 4. Ensure tasks table has proper enum type for status
-- (This assumes tasks table already exists; if not, create it)
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS labels TEXT,
ADD COLUMN IF NOT EXISTS subtasks INTEGER DEFAULT 0;

-- 5. Create audit log table for tracking changes
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type TEXT NOT NULL, -- 'project', 'task', 'expense', 'member'
    entity_id UUID NOT NULL,
    action TEXT NOT NULL, -- 'create', 'update', 'delete', 'approve'
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    old_value JSONB,
    new_value JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
