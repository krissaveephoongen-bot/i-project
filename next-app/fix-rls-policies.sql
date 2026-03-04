-- Fix RLS policies for projects and tasks tables
-- This will allow the timesheet to fetch projects and tasks

-- 1. Drop existing policies if they exist
DROP POLICY IF EXISTS "projects_select_policy" ON public.projects;
DROP POLICY IF EXISTS "tasks_select_policy" ON public.tasks;

-- 2. Enable RLS on tables (if not already enabled)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for projects table - allow authenticated users to read active projects
CREATE POLICY "projects_select_policy" ON public.projects
    FOR SELECT USING (
        auth.role() = 'authenticated' AND 
        status NOT IN ('Completed', 'completed', 'Cancelled', 'cancelled', 'archived')
    );

-- 4. Create policies for tasks table - allow authenticated users to read active tasks
CREATE POLICY "tasks_select_policy" ON public.tasks
    FOR SELECT USING (
        auth.role() = 'authenticated' AND 
        status NOT IN ('Completed', 'completed', 'Cancelled', 'cancelled')
    );

-- 5. Also create policies for time_entries if needed
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "time_entries_select_policy" ON public.time_entries;
DROP POLICY IF EXISTS "time_entries_insert_policy" ON public.time_entries;
DROP POLICY IF EXISTS "time_entries_update_policy" ON public.time_entries;
DROP POLICY IF EXISTS "time_entries_delete_policy" ON public.time_entries;

-- Allow users to see their own time entries
CREATE POLICY "time_entries_select_policy" ON public.time_entries
    FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own time entries
CREATE POLICY "time_entries_insert_policy" ON public.time_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own time entries
CREATE POLICY "time_entries_update_policy" ON public.time_entries
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own time entries
CREATE POLICY "time_entries_delete_policy" ON public.time_entries
    FOR DELETE USING (auth.uid() = user_id);

-- 6. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- 7. Specifically grant permissions for the tables we need
GRANT SELECT ON public.projects TO authenticated;
GRANT SELECT ON public.tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.time_entries TO authenticated;
