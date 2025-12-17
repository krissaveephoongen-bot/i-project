-- First, create the user_role enum type if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'manager', 'member', 'viewer');
    END IF;
END$$;

-- Add missing fields to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS object_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS password TEXT,
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS position TEXT,
ADD COLUMN IF NOT EXISTS employee_code TEXT,
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP,
ADD COLUMN IF NOT EXISTS reset_token TEXT,
ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP;

-- First, add a temporary column with the new type
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role_temp user_role;

-- Set default value for the temporary column
UPDATE users SET role_temp = 'member'::user_role WHERE role IS NULL OR role = '' OR role NOT IN ('admin', 'manager', 'member', 'viewer');
UPDATE users SET role_temp = role::user_role WHERE role IN ('admin', 'manager', 'member', 'viewer');

-- Drop the old column and rename the new one
ALTER TABLE users DROP COLUMN IF EXISTS role;
ALTER TABLE users RENAME COLUMN role_temp TO role;

-- Add NOT NULL constraint if needed
ALTER TABLE users ALTER COLUMN role SET NOT NULL;
