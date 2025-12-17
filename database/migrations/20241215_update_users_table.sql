-- Migration: 20241215_update_users_table.sql
-- Description: Add new columns to users table for enhanced team member management
-- Author: Development Team
-- Date: 2024-12-15

BEGIN;

-- Add new columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS role VARCHAR(50),
ADD COLUMN IF NOT EXISTS department VARCHAR(100),
ADD COLUMN IF NOT EXISTS position VARCHAR(100),
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Create indexes for better performance on common queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);

-- Create or replace function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists (to avoid conflicts)
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Set default values for existing records where columns are NULL
UPDATE users SET 
    status = COALESCE(status, 'active'),
    created_at = COALESCE(created_at, CURRENT_TIMESTAMP),
    updated_at = COALESCE(updated_at, CURRENT_TIMESTAMP)
WHERE status IS NULL OR created_at IS NULL OR updated_at IS NULL;

-- Add comments to document the new columns
COMMENT ON COLUMN users.role IS 'User role (e.g., Project Manager, Team Lead, Developer)';
COMMENT ON COLUMN users.department IS 'User department assignment';
COMMENT ON COLUMN users.position IS 'User job position/title';
COMMENT ON COLUMN users.status IS 'User status (active or inactive)';
COMMENT ON COLUMN users.created_at IS 'Timestamp when user was created';
COMMENT ON COLUMN users.updated_at IS 'Timestamp when user was last updated';

COMMIT;
