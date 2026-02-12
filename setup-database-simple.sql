-- Simple database setup - just create user and basic permissions
-- Run this in your Supabase SQL editor

-- 1. Disable RLS temporarily
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. Create test user if it doesn't exist
INSERT INTO users (
  id,
  email,
  password,
  name,
  role,
  "isActive",
  "isDeleted",
  "failedLoginAttempts",
  "hourlyRate",
  timezone,
  "createdAt",
  "updatedAt"
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

-- 3. Enable RLS with simple policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 4. Simple policies - allow everything for now (you can tighten this later)
DROP POLICY IF EXISTS "Enable all access" ON users;
CREATE POLICY "Enable all access" ON users USING (true);

-- 5. Grant permissions
GRANT ALL ON users TO anon;
GRANT ALL ON users TO authenticated;

-- 6. Test query to verify user creation
SELECT id, email, name, role, "isActive" FROM users WHERE email = 'jakgrits.ph@appworks.co.th';
