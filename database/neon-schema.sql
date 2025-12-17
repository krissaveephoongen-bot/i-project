-- Painai Database Schema for Neon PostgreSQL
-- Migration from Trickle Database to Neon PostgreSQL
-- Created: 2025-11-28

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE project_status AS ENUM ('planning', 'active', 'completed', 'on-hold', 'cancelled');
CREATE TYPE task_status AS ENUM ('todo', 'progress', 'review', 'completed');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE expense_category AS ENUM ('travel', 'food', 'accommodation', 'equipment', 'software', 'service', 'other');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'employee');
CREATE TYPE customer_type AS ENUM ('government', 'private', 'individual');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'leave', 'late');
CREATE TYPE invoice_status AS ENUM ('pending', 'invoiced', 'received');
CREATE TYPE work_type AS ENUM ('project', 'office', 'other');

-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    object_id TEXT UNIQUE, -- To maintain compatibility with Trickle objectId
    code TEXT,
    name TEXT NOT NULL,
    description TEXT,
    objective TEXT, -- Rich text field
    scope TEXT, -- Rich text field
    stakeholders TEXT,
    customer TEXT,
    project_manager TEXT,
    team_members TEXT, -- Comma-separated list
    department TEXT,
    priority task_priority DEFAULT 'medium',
    risk_level task_priority DEFAULT 'medium',
    project_type TEXT DEFAULT 'external',
    project_value TEXT,
    project_action TEXT,
    project_co TEXT,
    
    -- Timeline
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    duration_days INTEGER,
    remaining_days INTEGER,
    
    -- Financial
    budget DECIMAL(15,2),
    contract_amount DECIMAL(15,2),
    
    -- Progress tracking
    progress DECIMAL(5,2) DEFAULT 0,
    actual_progress DECIMAL(5,2) DEFAULT 0,
    planned_progress DECIMAL(5,2) DEFAULT 0,
    
    -- Status
    status project_status DEFAULT 'planning',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT,
    updated_by TEXT,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    object_id TEXT UNIQUE, -- To maintain compatibility with Trickle objectId
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    assignee TEXT,
    status task_status DEFAULT 'todo',
    priority task_priority DEFAULT 'medium',
    
    -- Weight and Progress
    weight DECIMAL(5,2) DEFAULT 0, -- Percentage, must sum to 100% per project
    progress DECIMAL(5,2) DEFAULT 0,
    
    -- Timeline
    planned_start_date TIMESTAMP WITH TIME ZONE,
    planned_end_date TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    
    -- Estimation
    estimated_hours DECIMAL(8,2),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT,
    updated_by TEXT,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    object_id TEXT UNIQUE, -- To maintain compatibility with Trickle objectId
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    department TEXT,
    position TEXT,
    role user_role DEFAULT 'employee',
    hourly_rate DECIMAL(10,2) DEFAULT 0,
    phone TEXT,
    status TEXT DEFAULT 'active',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    object_id TEXT UNIQUE, -- To maintain compatibility with Trickle objectId
    name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    type customer_type DEFAULT 'private',
    status TEXT DEFAULT 'active',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Time entries table (Timesheets) - Primary timesheet table
CREATE TABLE time_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    object_id TEXT UNIQUE, -- To maintain compatibility with Trickle objectId
    date DATE NOT NULL,
    work_type work_type DEFAULT 'project',
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_time TIME,
    end_time TIME,
    hours DECIMAL(5,2) DEFAULT 0,
    description TEXT,
    status approval_status DEFAULT 'pending',
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT,
    updated_by TEXT,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Worklogs table (Timesheets) - Legacy compatibility
CREATE TABLE worklogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    object_id TEXT UNIQUE, -- To maintain compatibility with Trickle objectId
    date DATE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user_name TEXT,
    work_type work_type DEFAULT 'project',
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    description TEXT,
    start_time TIME,
    end_time TIME,
    hours DECIMAL(5,2) DEFAULT 0,
    manday DECIMAL(5,2) DEFAULT 0, -- hours / 8
    status approval_status DEFAULT 'pending',

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT,
    updated_by TEXT,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Expenses table
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    object_id TEXT UNIQUE, -- To maintain compatibility with Trickle objectId
    date DATE NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    category expense_category,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_name TEXT,
    status approval_status DEFAULT 'pending',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT,
    updated_by TEXT,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- S-Curve table
CREATE TABLE scurve (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    plan_progress DECIMAL(5,2) DEFAULT 0,
    actual_progress DECIMAL(5,2) DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Attendance table
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user_name TEXT,
    check_in_time TIME,
    check_out_time TIME,
    location TEXT,
    status attendance_status DEFAULT 'present',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Invoices table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    object_id TEXT UNIQUE, -- To maintain compatibility with Trickle objectId
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    phase INTEGER,
    description TEXT,
    amount DECIMAL(15,2),
    plan_date TIMESTAMP WITH TIME ZONE,
    actual_date TIMESTAMP WITH TIME ZONE,
    invoice_date TIMESTAMP WITH TIME ZONE,
    plan_received_date TIMESTAMP WITH TIME ZONE,
    receipt_date TIMESTAMP WITH TIME ZONE,
    status invoice_status DEFAULT 'pending',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Create indexes for better performance
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_manager ON projects(project_manager);
CREATE INDEX idx_projects_dates ON projects(start_date, end_date);

CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assignee ON tasks(assignee);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

CREATE INDEX idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX idx_time_entries_project_id ON time_entries(project_id);
CREATE INDEX idx_time_entries_task_id ON time_entries(task_id);
CREATE INDEX idx_time_entries_date ON time_entries(date);
CREATE INDEX idx_time_entries_status ON time_entries(status);
CREATE INDEX idx_time_entries_approved_by ON time_entries(approved_by);

CREATE INDEX idx_worklogs_user_id ON worklogs(user_id);
CREATE INDEX idx_worklogs_project_id ON worklogs(project_id);
CREATE INDEX idx_worklogs_date ON worklogs(date);
CREATE INDEX idx_worklogs_status ON worklogs(status);

CREATE INDEX idx_expenses_project_id ON expenses(project_id);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expenses_status ON expenses(status);

CREATE INDEX idx_scurve_project_id ON scurve(project_id);
CREATE INDEX idx_scurve_date ON scurve(date);

CREATE INDEX idx_attendance_user_id ON attendance(user_id);
CREATE INDEX idx_attendance_date ON attendance(date);

CREATE INDEX idx_invoices_project_id ON invoices(project_id);
CREATE INDEX idx_invoices_status ON invoices(status);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON time_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_worklogs_updated_at BEFORE UPDATE ON worklogs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scurve_updated_at BEFORE UPDATE ON scurve FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create views for easier querying
CREATE VIEW active_projects AS
SELECT * FROM projects 
WHERE status IN ('active', 'planning') AND is_deleted = FALSE;

CREATE VIEW user_worklogs_summary AS
SELECT 
    user_id,
    user_name,
    DATE_TRUNC('week', date) as week_start,
    SUM(hours) as total_hours,
    SUM(manday) as total_mandays,
    COUNT(*) as log_count
FROM worklogs 
WHERE is_deleted = FALSE
GROUP BY user_id, user_name, DATE_TRUNC('week', date);

CREATE VIEW project_expenses_summary AS
SELECT 
    project_id,
    category,
    SUM(amount) as total_amount,
    COUNT(*) as expense_count
FROM expenses 
WHERE is_deleted = FALSE
GROUP BY project_id, category;

-- Sample data insertion functions
CREATE OR REPLACE FUNCTION insert_sample_data()
RETURNS void AS $
DECLARE
    user_id UUID;
    project_id UUID;
    customer_id UUID;
BEGIN
    -- Clear existing sample data to avoid conflicts
    DELETE FROM worklogs WHERE object_id LIKE 'worklog-%';
    DELETE FROM expenses WHERE object_id LIKE 'expense-%';
    DELETE FROM tasks WHERE object_id LIKE 'task-%';
    DELETE FROM projects WHERE object_id LIKE 'project-%';
    DELETE FROM customers WHERE object_id LIKE 'customer-%';
    DELETE FROM users WHERE object_id LIKE 'admin-user' OR object_id LIKE 'manager-user' OR object_id LIKE 'employee-user';

    -- Insert Painai-specific users
    INSERT INTO users (object_id, name, email, password, department, position, role, hourly_rate, status) VALUES
    ('admin-user-painai', 'System Administrator', 'admin@painai.com', 'admin123', 'IT', 'System Administrator', 'admin', 800.00, 'active'),
    ('manager-user-painai', 'Project Manager', 'jakgrits.ph@appworks.co.th', 'manager123', 'PM', 'Project Manager', 'manager', 600.00, 'active'),
    ('employee-user-painai', 'Somying Employee', 'somying@painai.com', 'employee123', 'Development', 'Software Developer', 'employee', 400.00, 'active');

    -- Insert sample customers
    INSERT INTO customers (object_id, name, contact_person, email, phone, type, status) VALUES
    ('customer-painai-1', 'บริษัท Painai จำกัด', 'คุณสมชาย ใจดี', 'contact@painai.com', '02-123-4567', 'private', 'active'),
    ('customer-painai-2', 'กรมเทคโนโลยีสารสนเทศ', 'นางสาวมาลี รักดี', 'info@ict.go.th', '02-987-6543', 'government', 'active');

    -- Insert sample projects
    INSERT INTO projects (
        object_id, code, name, description, customer, project_manager, team_members,
        start_date, end_date, budget, contract_amount, status, progress, priority, department
    ) VALUES (
        'project-painai-1', 'PAIN-001', 'Painai Project Management System', 'Development of comprehensive project management system with Neon PostgreSQL integration', 
        'บริษัท Painai จำกัด', 'Project Manager', 'Somying Employee,System Administrator',
        '2025-11-01', '2026-02-28', 500000.00, 550000.00, 'active', 75, 'high', 'Development'
    ),
    (
        'project-painai-2', 'PAIN-002', 'Database Migration Project', 'Complete migration from Trickle Database to Neon PostgreSQL with data integrity validation',
        'กรมเทคโนโลยีสารสนเทศ', 'Project Manager', 'Somying Employee',
        '2025-10-15', '2025-12-31', 300000.00, 350000.00, 'active', 90, 'critical', 'Database'
    );

    -- Get IDs for further inserts
    SELECT id INTO project_id FROM projects WHERE object_id = 'project-painai-1';
    SELECT id INTO user_id FROM users WHERE object_id = 'employee-user-painai';

    -- Insert sample tasks
    INSERT INTO tasks (object_id, project_id, name, description, assignee, status, weight, progress, due_date, priority) VALUES
    ('task-painai-1', project_id, 'Database Schema Design', 'Design and implement PostgreSQL schema with proper indexing', 'Somying Employee', 'completed', 25.00, 100, '2025-11-15', 'high'),
    ('task-painai-2', project_id, 'Frontend Development', 'Build responsive user interface with modern frameworks', 'Somying Employee', 'progress', 35.00, 80, '2025-12-30', 'high'),
    ('task-painai-3', project_id, 'Backend API Development', 'Develop RESTful API endpoints with authentication', 'System Administrator', 'progress', 25.00, 60, '2025-12-15', 'medium'),
    ('task-painai-4', project_id, 'Testing & QA', 'Comprehensive testing and quality assurance', 'Project Manager', 'todo', 15.00, 0, '2026-01-15', 'medium');

    -- Insert sample worklogs
    INSERT INTO worklogs (object_id, date, user_id, user_name, work_type, project_id, description, hours, manday, status) VALUES
    ('worklog-painai-1', '2025-11-27', user_id, 'Somying Employee', 'project', project_id, 'Database schema implementation and testing', 6.5, 0.81, 'approved'),
    ('worklog-painai-2', '2025-11-26', user_id, 'Somying Employee', 'project', project_id, 'Frontend component development', 7.0, 0.88, 'approved'),
    ('worklog-painai-3', '2025-11-25', (SELECT id FROM users WHERE object_id = 'admin-user-painai'), 'System Administrator', 'project', project_id, 'API development and authentication setup', 8.0, 1.0, 'approved'),
    ('worklog-painai-4', '2025-11-24', (SELECT id FROM users WHERE object_id = 'manager-user-painai'), 'Project Manager', 'project', (SELECT id FROM projects WHERE object_id = 'project-painai-2'), 'Migration planning and coordination', 4.0, 0.5, 'approved'),
    ('worklog-painai-5', '2025-11-23', user_id, 'Somying Employee', 'project', (SELECT id FROM projects WHERE object_id = 'project-painai-2'), 'Data validation scripts development', 6.0, 0.75, 'approved'),
    ('worklog-painai-6', '2025-11-22', (SELECT id FROM users WHERE object_id = 'admin-user-painai'), 'System Administrator', 'office', NULL, 'Team meeting and system review', 2.0, 0.25, 'approved');

    -- Insert sample expenses
    INSERT INTO expenses (object_id, date, project_id, category, amount, description, user_id, user_name, status) VALUES
    ('expense-painai-1', '2025-11-20', project_id, 'travel', 1500.00, 'Client meeting transportation', user_id, 'Somying Employee', 'approved'),
    ('expense-painai-2', '2025-11-18', project_id, 'equipment', 25000.00, 'Development workstation upgrade', (SELECT id FROM users WHERE object_id = 'admin-user-painai'), 'System Administrator', 'approved'),
    ('expense-painai-3', '2025-11-15', (SELECT id FROM projects WHERE object_id = 'project-painai-2'), 'service', 8000.00, 'Database consultation services', (SELECT id FROM users WHERE object_id = 'manager-user-painai'), 'Project Manager', 'pending'),
    ('expense-painai-4', '2025-11-10', project_id, 'software', 5000.00, 'Development tools and licenses', user_id, 'Somying Employee', 'approved');

END;
$ LANGUAGE plpgsql;

-- Grant permissions (adjust as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_user;
