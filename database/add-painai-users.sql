-- Painai Application Users
-- Adding specific users with roles for the project management system
-- Generated: 2025-11-28

-- Clear existing sample data to avoid conflicts
DELETE FROM users WHERE email IN ('admin@example.com', 'manager@example.com', 'employee@example.com');

-- Insert Painai-specific users
INSERT INTO users (
    object_id, 
    name, 
    email, 
    password, 
    department, 
    position, 
    role, 
    hourly_rate,
    status
) VALUES
(
    'admin-user-painai', 
    'System Administrator', 
    'admin@painai.com', 
    'admin123', 
    'IT', 
    'System Administrator', 
    'admin', 
    800.00,
    'active'
),
(
    'manager-user-painai', 
    'Project Manager', 
    'jakgrits.ph@appworks.co.th', 
    'manager123', 
    'PM', 
    'Project Manager', 
    'manager', 
    600.00,
    'active'
),
(
    'employee-user-painai', 
    'Somying Employee', 
    'somying@painai.com', 
    'employee123', 
    'Development', 
    'Software Developer', 
    'employee', 
    400.00,
    'active'
);

-- Add some additional test customers
DELETE FROM customers WHERE object_id IN ('customer-1', 'customer-2');

INSERT INTO customers (
    object_id, 
    name, 
    contact_person, 
    email, 
    phone, 
    type,
    status
) VALUES
(
    'customer-painai-1', 
    'บริษัท Painai จำกัด', 
    'คุณสมชาย ใจดี', 
    'contact@painai.com', 
    '02-123-4567', 
    'private',
    'active'
),
(
    'customer-painai-2', 
    'กรมเทคโนโลยีสารสนเทศ', 
    'นางสาวมาลี รักดี', 
    'info@ict.go.th', 
    '02-987-6543', 
    'government',
    'active'
);

-- Add sample projects for these users
DELETE FROM projects WHERE object_id IN ('project-1', 'project-2');

INSERT INTO projects (
    object_id, 
    code, 
    name, 
    description, 
    customer, 
    project_manager, 
    team_members,
    start_date, 
    end_date, 
    budget, 
    contract_amount, 
    status, 
    progress,
    priority,
    department
) VALUES
(
    'project-painai-1', 
    'PAIN-001', 
    'Painai Project Management System', 
    'Development of comprehensive project management system with Neon PostgreSQL integration', 
    'บริษัท Painai จำกัด', 
    'Project Manager', 
    'Somying Employee,System Administrator',
    '2025-11-01', 
    '2026-02-28', 
    500000.00, 
    550000.00, 
    'active', 
    75,
    'high',
    'Development'
),
(
    'project-painai-2', 
    'PAIN-002', 
    'Database Migration Project', 
    'Complete migration from Trickle Database to Neon PostgreSQL with data integrity validation', 
    'กรมเทคโนโลยีสารสนเทศ', 
    'Project Manager', 
    'Somying Employee',
    '2025-10-15', 
    '2025-12-31', 
    300000.00, 
    350000.00, 
    'active', 
    90,
    'critical',
    'Database'
);

-- Get project IDs for tasks
WITH project_data AS (
    SELECT id as project_id, object_id FROM projects WHERE object_id IN ('project-painai-1', 'project-painai-2')
)
-- Add sample tasks
INSERT INTO tasks (
    object_id,
    project_id,
    name,
    description,
    assignee,
    status,
    weight,
    progress,
    due_date,
    priority
)
SELECT
    task_data.object_id,
    pd.project_id,
    task_data.name,
    task_data.description,
    task_data.assignee,
    task_data.status,
    task_data.weight,
    task_data.progress,
    task_data.due_date,
    task_data.priority
FROM (
    VALUES
    ('task-painai-1', 'project-painai-1', 'Database Schema Design', 'Design and implement PostgreSQL schema with proper indexing', 'Somying Employee', 'completed', 25.00, 100, '2025-11-15', 'high'),
    ('task-painai-2', 'project-painai-1', 'Frontend Development', 'Build responsive user interface with modern frameworks', 'Somying Employee', 'progress', 35.00, 80, '2025-12-30', 'high'),
    ('task-painai-3', 'project-painai-1', 'Backend API Development', 'Develop RESTful API endpoints with authentication', 'System Administrator', 'progress', 25.00, 60, '2025-12-15', 'medium'),
    ('task-painai-4', 'project-painai-1', 'Testing & QA', 'Comprehensive testing and quality assurance', 'Project Manager', 'todo', 15.00, 0, '2026-01-15', 'medium'),
    ('task-painai-5', 'project-painai-2', 'Data Migration Script', 'Create automated migration scripts with rollback capability', 'Somying Employee', 'completed', 40.00, 100, '2025-11-20', 'critical'),
    ('task-painai-6', 'project-painai-2', 'Query Optimization', 'Optimize database queries for better performance', 'System Administrator', 'completed', 30.00, 100, '2025-11-25', 'high'),
    ('task-painai-7', 'project-painai-2', 'Data Validation', 'Validate migrated data integrity and consistency', 'Project Manager', 'progress', 30.00, 75, '2025-12-05', 'high')
) AS task_data(object_id, project_object_id, name, description, assignee, status, weight, progress, due_date, priority)
JOIN project_data pd ON pd.object_id = task_data.project_object_id;

-- Add sample worklogs for the users
WITH user_data AS (
    SELECT id as user_id, object_id, name FROM users WHERE email IN ('admin@painai.com', 'jakgrits.ph@appworks.co.th', 'somying@painai.com')
),
project_data AS (
    SELECT id as project_id, object_id FROM projects WHERE object_id IN ('project-painai-1', 'project-painai-2')
)
INSERT INTO worklogs (
    object_id,
    date,
    user_id,
    user_name,
    work_type,
    project_id,
    description,
    hours,
    manday,
    status
)
SELECT
    wl_data.object_id,
    wl_data.date::date,
    ud.user_id,
    ud.name,
    wl_data.work_type,
    pd.project_id,
    wl_data.description,
    wl_data.hours,
    wl_data.manday,
    wl_data.status
FROM (
    VALUES
    ('worklog-painai-1', '2025-11-27', 'employee-user-painai', 'project', 'project-painai-1', 'Database schema implementation and testing', 6.5, 0.81, 'approved'),
    ('worklog-painai-2', '2025-11-26', 'employee-user-painai', 'project', 'project-painai-1', 'Frontend component development', 7.0, 0.88, 'approved'),
    ('worklog-painai-3', '2025-11-25', 'admin-user-painai', 'project', 'project-painai-1', 'API development and authentication setup', 8.0, 1.0, 'approved'),
    ('worklog-painai-4', '2025-11-24', 'manager-user-painai', 'project', 'project-painai-2', 'Migration planning and coordination', 4.0, 0.5, 'approved'),
    ('worklog-painai-5', '2025-11-23', 'employee-user-painai', 'project', 'project-painai-2', 'Data validation scripts development', 6.0, 0.75, 'approved'),
    ('worklog-painai-6', '2025-11-22', 'admin-user-painai', 'office', NULL, 'Team meeting and system review', 2.0, 0.25, 'approved'),
    ('worklog-painai-7', '2025-11-21', 'employee-user-painai', 'project', 'project-painai-1', 'Query optimization and performance tuning', 5.5, 0.69, 'pending')
) AS wl_data(object_id, date, user_object_id, work_type, project_object_id, description, hours, manday, status)
JOIN user_data ud ON ud.object_id = wl_data.user_object_id
JOIN project_data pd ON pd.object_id = wl_data.project_object_id;

-- Add sample expenses
WITH user_data AS (
    SELECT id as user_id, object_id, name FROM users WHERE email IN ('admin@painai.com', 'jakgrits.ph@appworks.co.th', 'somying@painai.com')
),
project_data AS (
    SELECT id as project_id, object_id FROM projects WHERE object_id IN ('project-painai-1', 'project-painai-2')
)
INSERT INTO expenses (
    object_id,
    date,
    project_id,
    category,
    amount,
    description,
    user_id,
    user_name,
    status
)
SELECT
    exp_data.object_id,
    exp_data.date::date,
    pd.project_id,
    exp_data.category,
    exp_data.amount,
    exp_data.description,
    ud.user_id,
    ud.name,
    exp_data.status
FROM (
    VALUES
    ('expense-painai-1', '2025-11-20', 'employee-user-painai', 'project-painai-1', 'travel', 1500.00, 'Client meeting transportation', 'approved'),
    ('expense-painai-2', '2025-11-18', 'admin-user-painai', 'project-painai-1', 'equipment', 25000.00, 'Development workstation upgrade', 'approved'),
    ('expense-painai-3', '2025-11-15', 'manager-user-painai', 'project-painai-2', 'service', 8000.00, 'Database consultation services', 'pending'),
    ('expense-painai-4', '2025-11-10', 'employee-user-painai', 'project-painai-1', 'software', 5000.00, 'Development tools and licenses', 'approved')
) AS exp_data(object_id, date, user_object_id, project_object_id, category, amount, description, status)
JOIN user_data ud ON ud.object_id = exp_data.user_object_id
JOIN project_data pd ON pd.object_id = exp_data.project_object_id;

-- Verify the inserted data
SELECT 
    'Users' as table_name, 
    COUNT(*) as record_count,
    STRING_AGG(name || ' (' || role || ')', ', ') as sample_data
FROM users 
WHERE email IN ('admin@painai.com', 'jakgrits.ph@appworks.co.th', 'somying@painai.com')

UNION ALL

SELECT 
    'Projects' as table_name, 
    COUNT(*) as record_count,
    STRING_AGG(name || ' (' || status || ')', ', ') as sample_data
FROM projects 
WHERE object_id LIKE 'project-painai-%'

UNION ALL

SELECT 
    'Tasks' as table_name, 
    COUNT(*) as record_count,
    STRING_AGG(name || ' (' || status || ')', ', ') as sample_data
FROM tasks 
WHERE object_id LIKE 'task-painai-%'

UNION ALL

SELECT 
    'Worklogs' as table_name, 
    COUNT(*) as record_count,
    'Recent work entries with hours and status' as sample_data
FROM worklogs 
WHERE object_id LIKE 'worklog-painai-%'

UNION ALL

SELECT 
    'Expenses' as table_name, 
    COUNT(*) as record_count,
    'Project-related expenses with categories' as sample_data
FROM expenses 
WHERE object_id LIKE 'expense-painai-%';

-- Summary message
SELECT 
    '✅ Painai users and sample data inserted successfully!' as result,
    5 as total_tables_populated,
    NOW() as inserted_at;