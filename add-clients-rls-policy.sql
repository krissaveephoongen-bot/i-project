-- Add RLS Policy for Clients Table
-- Run this in Supabase SQL Editor

-- Drop existing policies if they exist
DROP POLICY IF EXISTS ON clients;

-- Create policy for users to manage their own clients
CREATE POLICY "Users can manage own clients" ON clients
FOR ALL USING (
    auth.uid()::text = userId::text OR 
    is_admin()
);

-- Enable RLS on clients table
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
