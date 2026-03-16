-- Add sample data for testing
-- Migration 008: Insert sample projects and tasks

-- Insert sample projects
INSERT INTO projects (
  id, name, description, status, priority, start_date, end_date, 
  budget_allocated, budget_spent, currency, created_at, updated_at, is_deleted
) VALUES 
  (
    gen_random_uuid(), 
    'Website Redesign', 
    'Complete redesign of company website with modern UI/UX', 
    'in_progress', 
    'high', 
    '2024-01-01', 
    '2024-06-30', 
    50000, 
    25000, 
    'THB', 
    NOW(), 
    NOW(), 
    false
  ),
  (
    gen_random_uuid(), 
    'Mobile App Development', 
    'Native mobile app for iOS and Android platforms', 
    'planning', 
    'medium', 
    '2024-02-01', 
    '2024-12-31', 
    100000, 
    5000, 
    'THB', 
    NOW(), 
    NOW(), 
    false
  ),
  (
    gen_random_uuid(), 
    'Database Migration', 
    'Migrate legacy database to new PostgreSQL system', 
    'completed', 
    'low', 
    '2023-11-01', 
    '2024-01-31', 
    25000, 
    22000, 
    'THB', 
    NOW(), 
    NOW(), 
    false
  ),
  (
    gen_random_uuid(), 
    'API Development', 
    'RESTful API development for microservices architecture', 
    'in_progress', 
    'high', 
    '2024-01-15', 
    '2024-08-15', 
    75000, 
    35000, 
    'THB', 
    NOW(), 
    NOW(), 
    false
  ),
  (
    gen_random_uuid(), 
    'Security Audit', 
    'Comprehensive security audit and vulnerability assessment', 
    'planning', 
    'high', 
    '2024-03-01', 
    '2024-04-30', 
    30000, 
    0, 
    'THB', 
    NOW(), 
    NOW(), 
    false
  );

-- Insert sample tasks
INSERT INTO tasks (
  id, title, description, project_id, status, priority, due_date, 
  assigned_to, created_at, updated_at, is_deleted
) VALUES 
  (
    gen_random_uuid(), 
    'Design Homepage', 
    'Create mockups and wireframes for new homepage', 
    (SELECT id FROM projects WHERE name = 'Website Redesign' LIMIT 1), 
    'in_progress', 
    'high', 
    '2024-02-15', 
    (SELECT id FROM users WHERE email = 'jakgrits.ph@appworks.co.th' LIMIT 1), 
    NOW(), 
    NOW(), 
    false
  ),
  (
    gen_random_uuid(), 
    'Implement Authentication', 
    'Add user authentication and authorization system', 
    (SELECT id FROM projects WHERE name = 'Mobile App Development' LIMIT 1), 
    'todo', 
    'high', 
    '2024-03-01', 
    (SELECT id FROM users WHERE email = 'jakgrits.ph@appworks.co.th' LIMIT 1), 
    NOW(), 
    NOW(), 
    false
  ),
  (
    gen_random_uuid(), 
    'Database Schema Design', 
    'Design new database schema for migration', 
    (SELECT id FROM projects WHERE name = 'Database Migration' LIMIT 1), 
    'completed', 
    'medium', 
    '2023-11-15', 
    (SELECT id FROM users WHERE email = 'jakgrits.ph@appworks.co.th' LIMIT 1), 
    NOW(), 
    NOW(), 
    false
  ),
  (
    gen_random_uuid(), 
    'API Documentation', 
    'Create comprehensive API documentation', 
    (SELECT id FROM projects WHERE name = 'API Development' LIMIT 1), 
    'in_progress', 
    'medium', 
    '2024-02-28', 
    (SELECT id FROM users WHERE email = 'jakgrits.ph@appworks.co.th' LIMIT 1), 
    NOW(), 
    NOW(), 
    false
  ),
  (
    gen_random_uuid(), 
    'Security Testing', 
    'Perform penetration testing and vulnerability assessment', 
    (SELECT id FROM projects WHERE name = 'Security Audit' LIMIT 1), 
    'todo', 
    'high', 
    '2024-03-15', 
    (SELECT id FROM users WHERE email = 'jakgrits.ph@appworks.co.th' LIMIT 1), 
    NOW(), 
    NOW(), 
    false
  );

-- Insert sample activity logs
INSERT INTO activity_logs (
  id, user_id, action, entity_type, entity_id, old_values, new_values, 
  ip_address, user_agent, created_at
) VALUES 
  (
    gen_random_uuid(), 
    (SELECT id FROM users WHERE email = 'jakgrits.ph@appworks.co.th' LIMIT 1), 
    'created', 
    'project', 
    (SELECT id FROM projects WHERE name = 'Website Redesign' LIMIT 1), 
    NULL, 
    '{"name": "Website Redesign", "status": "in_progress"}', 
    '127.0.0.1', 
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 
    NOW()
  ),
  (
    gen_random_uuid(), 
    (SELECT id FROM users WHERE email = 'jakgrits.ph@appworks.co.th' LIMIT 1), 
    'updated', 
    'task', 
    (SELECT id FROM tasks WHERE title = 'Design Homepage' LIMIT 1), 
    '{"status": "todo"}', 
    '{"status": "in_progress"}', 
    '127.0.0.1', 
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 
    NOW()
  );

-- Add comments
COMMENT ON TABLE projects IS 'Projects table with sample data for testing';
COMMENT ON TABLE tasks IS 'Tasks table with sample data for testing';
COMMENT ON TABLE activity_logs IS 'Activity logs table with sample data for testing';
