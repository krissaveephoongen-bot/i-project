-- ============================================
-- TEAMS AND PROJECT MEMBERS SCHEMA
-- ============================================

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    lead_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Team members junction table
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member', -- lead, manager, member
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- Project members junction table (replaces comma-separated team_members in projects)
CREATE TABLE IF NOT EXISTS project_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member', -- owner, manager, member, viewer
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_teams_lead_id ON teams(lead_id);
CREATE INDEX IF NOT EXISTS idx_teams_status ON teams(status);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members(user_id);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE TRIGGER IF NOT EXISTS update_teams_updated_at 
BEFORE UPDATE ON teams 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS FOR CONVENIENCE
-- ============================================

CREATE OR REPLACE VIEW team_summary AS
SELECT 
    t.id,
    t.name,
    t.description,
    u.name as lead_name,
    t.status,
    COUNT(tm.id) as member_count,
    t.created_at,
    t.updated_at
FROM teams t
LEFT JOIN users u ON t.lead_id = u.id
LEFT JOIN team_members tm ON t.id = tm.team_id
WHERE t.is_deleted = FALSE
GROUP BY t.id, u.name;

CREATE OR REPLACE VIEW project_team_summary AS
SELECT 
    p.id as project_id,
    p.name as project_name,
    u.id as user_id,
    u.name as user_name,
    u.email,
    pm.role,
    pm.assigned_at
FROM project_members pm
JOIN projects p ON pm.project_id = p.id
JOIN users u ON pm.user_id = u.id
WHERE p.is_deleted = FALSE;

-- ============================================
-- SAMPLE DATA (Optional)
-- ============================================

-- Uncomment to seed sample teams
/*
INSERT INTO teams (name, description, lead_id, status)
SELECT 
    'Development Team',
    'Core development team for projects',
    u.id,
    'active'
FROM users u
WHERE u.role = 'manager' AND u.status = 'active'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO teams (name, description, lead_id, status)
SELECT 
    'Management Team',
    'Project managers and team leads',
    u.id,
    'active'
FROM users u
WHERE u.role = 'manager' AND u.status = 'active'
LIMIT 1
ON CONFLICT DO NOTHING;
*/
