-- Fix user schema - add missing columns for authentication
-- Migration 006: Fix user schema for authentication system

-- Add missing columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP,
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS two_factor_secret TEXT,
ADD COLUMN IF NOT EXISTS reset_token TEXT,
ADD COLUMN IF NOT EXISTS reset_token_expires_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS email_verification_token TEXT,
ADD COLUMN IF NOT EXISTS email_verification_expires_at TIMESTAMP;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_locked_until ON users(locked_until);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);
CREATE INDEX IF NOT EXISTS idx_users_two_factor_enabled ON users(two_factor_enabled);
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);
CREATE INDEX IF NOT EXISTS idx_users_email_verification_token ON users(email_verification_token);

-- Update existing users to have default values
UPDATE users 
SET 
  locked_until = NULL,
  failed_login_attempts = 0,
  email_verified = true,
  phone_verified = false,
  two_factor_enabled = false
WHERE locked_until IS NULL;

-- Add comments
COMMENT ON COLUMN users.locked_until IS 'Timestamp until which user is locked out';
COMMENT ON COLUMN users.failed_login_attempts IS 'Number of consecutive failed login attempts';
COMMENT ON COLUMN users.last_login_at IS 'Timestamp of last successful login';
COMMENT ON COLUMN users.email_verified IS 'Whether user email has been verified';
COMMENT ON COLUMN users.phone_verified IS 'Whether user phone has been verified';
COMMENT ON COLUMN users.two_factor_enabled IS 'Whether 2FA is enabled for user';
COMMENT ON COLUMN users.two_factor_secret IS 'Secret key for 2FA';
COMMENT ON COLUMN users.reset_token IS 'Token for password reset';
COMMENT ON COLUMN users.reset_token_expires_at IS 'Expiry time for reset token';
COMMENT ON COLUMN users.email_verification_token IS 'Token for email verification';
COMMENT ON COLUMN users.email_verification_expires_at IS 'Expiry time for email verification token';
