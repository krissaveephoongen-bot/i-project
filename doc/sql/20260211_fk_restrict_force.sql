-- Force RESTRICT by recreating constraints with new names
ALTER TABLE public.time_entries DROP CONSTRAINT IF EXISTS time_entries_projectId_fkey;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'time_entries_projectid_fkey_restrict'
  ) THEN
    ALTER TABLE public.time_entries ADD CONSTRAINT time_entries_projectId_fkey_restrict FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON DELETE RESTRICT;
  END IF;
END $$;

ALTER TABLE public.time_entries DROP CONSTRAINT IF EXISTS time_entries_userId_fkey;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'time_entries_userid_fkey_restrict'
  ) THEN
    ALTER TABLE public.time_entries ADD CONSTRAINT time_entries_userId_fkey_restrict FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE RESTRICT;
  END IF;
END $$;

ALTER TABLE public.time_entries DROP CONSTRAINT IF EXISTS time_entries_taskId_fkey;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'time_entries_taskid_fkey_restrict'
  ) THEN
    ALTER TABLE public.time_entries ADD CONSTRAINT time_entries_taskId_fkey_restrict FOREIGN KEY ("taskId") REFERENCES public.tasks(id) ON DELETE RESTRICT;
  END IF;
END $$;

ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_projectId_fkey;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tasks_projectid_fkey_restrict'
  ) THEN
    ALTER TABLE public.tasks ADD CONSTRAINT tasks_projectId_fkey_restrict FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON DELETE RESTRICT;
  END IF;
END $$;
