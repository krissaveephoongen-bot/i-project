-- Add timezone field to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Asia/Bangkok';

-- Update existing records to have default timezone
UPDATE users SET timezone = 'Asia/Bangkok' WHERE timezone IS NULL;
