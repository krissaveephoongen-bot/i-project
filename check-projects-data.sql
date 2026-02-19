-- Check projects data
SELECT 
    id,
    name,
    status,
    progress,
    budget,
    spent,
    spi,
    manager_id,
    client_id,
    created_at,
    updated_at
FROM projects 
ORDER BY created_at DESC
LIMIT 10;

-- Check users data for managers
SELECT 
    id,
    name,
    email,
    role
FROM users 
WHERE role IN ('admin', 'manager', 'project_manager')
ORDER BY name;

-- Check clients data
SELECT 
    id,
    name,
    email
FROM clients 
ORDER BY name;

-- Check if projects have valid manager_id and client_id
SELECT 
    p.id,
    p.name,
    p.manager_id,
    p.client_id,
    CASE WHEN u.id IS NOT NULL THEN 'Valid' ELSE 'Invalid' END as manager_valid,
    CASE WHEN c.id IS NOT NULL THEN 'Valid' ELSE 'Invalid' END as client_valid
FROM projects p
LEFT JOIN users u ON p.manager_id = u.id
LEFT JOIN clients c ON p.client_id = c.id
ORDER BY p.created_at DESC
LIMIT 10;
