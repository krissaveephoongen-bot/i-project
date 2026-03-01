-- This script addresses the permissive RLS policy on the `public.users` table.
-- The existing policy "Allow anonymous updates for authentication" is too open and presents a security risk.
-- This script will drop the unsafe policy and create a more restrictive one as a sane default.
--
-- This proposed policy allows:
--  - Any authenticated user to view all users' profiles.
--  - Authenticated users to update ONLY their own profile.
--
-- PLEASE REVIEW AND ADAPT these policies to your application's specific security requirements.
-- For example, you might not want all users to be able to see each other.

-- Drop the overly permissive UPDATE policy.
DROP POLICY "Allow anonymous updates for authentication" ON public.users;

-- Create a policy to allow authenticated users to SELECT all users.
-- If you don't want users to see each other, you can change this to `auth.uid() = id`.
CREATE POLICY "Allow users to view all users"
ON public.users
FOR SELECT
USING (auth.role() = 'authenticated');

-- Create a policy to allow users to update their own profile.
-- It checks that the user's ID matches the `id` of the row they are trying to update.
CREATE POLICY "Allow users to update their own profile"
ON public.users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Note: No policies for INSERT or DELETE are created here.
-- User creation is often handled by Supabase Auth, and allowing users to delete their own
-- or other's accounts should be a deliberate decision. If you need this functionality,
-- you must create appropriate policies.
