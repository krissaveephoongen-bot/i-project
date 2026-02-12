-- Force RESTRICT by recreating constraints with new names
ALTER TABLE public.time_entries DROP CONSTRAINT IF EXISTS time_entries_projectId_fkey;
ALTER TABLE public.time_entries ADD CONSTRAINT time_entries_projectId_fkey_restrict FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON DELETE RESTRICT;

ALTER TABLE public.time_entries DROP CONSTRAINT IF EXISTS time_entries_userId_fkey;
ALTER TABLE public.time_entries ADD CONSTRAINT time_entries_userId_fkey_restrict FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE RESTRICT;

ALTER TABLE public.time_entries DROP CONSTRAINT IF EXISTS time_entries_taskId_fkey;
ALTER TABLE public.time_entries ADD CONSTRAINT time_entries_taskId_fkey_restrict FOREIGN KEY ("taskId") REFERENCES public.tasks(id) ON DELETE RESTRICT;

ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_projectId_fkey;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_projectId_fkey_restrict FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON DELETE RESTRICT;
