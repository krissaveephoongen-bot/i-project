-- Fix password columns for authentication
-- Migration 007: Add missing password-related columns

-- Add missing password columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
ADD COLUMN IF NOT EXISTS hashed_password VARCHAR(255),
ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP;

-- Check which password column exists and update accordingly
-- First, try to update password_hash if it exists and password doesn't
UPDATE users 
SET password_hash = password 
WHERE password_hash IS NULL AND password IS NOT NULL;

-- Then, try to update hashed_password if it exists and password_hash doesn't
UPDATE users 
SET hashed_password = password 
WHERE hashed_password IS NULL AND password_hash IS NULL AND password IS NOT NULL;

-- Ensure at least one password column is populated
UPDATE users 
SET password_hash = COALESCE(password_hash, hashed_password, password)
WHERE password_hash IS NULL;

-- Set default values for existing users
UPDATE users 
SET 
  password_hash = COALESCE(password_hash, hashed_password, password),
  hashed_password = COALESCE(hashed_password, password_hash, password),
  reset_token_expiry = NULL
WHERE password_hash IS NULL OR hashed_password IS NULL;

-- Add indexes for password columns
CREATE INDEX IF NOT EXISTS idx_users_password_hash ON users(password_hash);
CREATE INDEX IF NOT EXISTS idx_users_hashed_password ON users(hashed_password);
CREATE INDEX IF NOT EXISTS idx_users_reset_token_expiry ON users(reset_token_expiry);

-- Add comments
COMMENT ON COLUMN users.password_hash IS 'Hashed password using bcrypt';
COMMENT ON COLUMN users.hashed_password IS 'Alternative hashed password field';
COMMENT ON COLUMN users.reset_token_expiry IS 'Expiry time for password reset token';
