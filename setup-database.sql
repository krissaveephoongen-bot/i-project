-- Setup database permissions and create test user
-- Run this in your Supabase SQL editor

-- 1. Disable RLS temporarily to set up initial data
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. Create test user if it doesn't exist
INSERT INTO users (
  id,
  email,
  password,
  name,
  role,
  isActive,
  isDeleted,
  failedLoginAttempts,
  hourlyRate,
  timezone,
  createdAt,
  updatedAt
) VALUES (
  gen_random_uuid(),
  'jakgrits.ph@appworks.co.th',
  '$2b$10$ixQFzTS2VrnpSci54s2VSuGTXbWFpC3DTF7wG7aOysxZXFTkbxYei',
  'Jakgrits Ph',
  'admin',
  true,
  false,
  0,
  0.00,
  'Asia/Bangkok',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- 3. Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for users table
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;

CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()::text 
      AND u.role = 'admin'
      AND u.isActive = true
    )
  );

CREATE POLICY "Admins can manage all users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()::text 
      AND u.role = 'admin'
      AND u.isActive = true
    )
  );

-- 5. Allow anonymous access for authentication (login/signup)
DROP POLICY IF EXISTS "Allow anonymous access for auth" ON users;

CREATE POLICY "Allow anonymous access for auth" ON users
  FOR SELECT USING (true);

CREATE POLICY "Allow insert for signup" ON users
  FOR INSERT WITH CHECK (true);

-- 6. Grant necessary permissions
GRANT ALL ON users TO anon;
GRANT ALL ON users TO authenticated;

-- Test query to verify user creation
SELECT id, email, name, role, isActive FROM users WHERE email = 'jakgrits.ph@appworks.co.th';
