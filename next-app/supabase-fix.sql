-- Fix permissions for timesheet functionality
-- Run this in Supabase SQL Editor

-- 1. First, check if RLS is enabled and disable it temporarily to fix permissions
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;

-- 2. Grant basic permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.projects TO authenticated;
GRANT SELECT ON public.tasks TO authenticated;

-- 3. Re-enable RLS with proper policies
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 4. Create policies for projects
DROP POLICY IF EXISTS "projects_select_policy" ON public.projects;
CREATE POLICY "projects_select_policy" ON public.projects
    FOR SELECT USING (
        auth.role() = 'authenticated' AND 
        status NOT IN ('Completed', 'completed', 'Cancelled', 'cancelled', 'archived')
    );

-- 5. Create policies for tasks  
DROP POLICY IF EXISTS "tasks_select_policy" ON public.tasks;
CREATE POLICY "tasks_select_policy" ON public.tasks
    FOR SELECT USING (
        auth.role() = 'authenticated' AND 
        status NOT IN ('Completed', 'completed', 'Cancelled', 'cancelled')
    );

-- 6. Test the query
SELECT id, name, status FROM public.projects 
WHERE status NOT IN ('Completed', 'completed', 'Cancelled', 'cancelled') 
ORDER BY name;
