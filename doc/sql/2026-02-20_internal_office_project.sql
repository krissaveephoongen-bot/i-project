-- Mark internal projects and seed a default \"Internal Office\" project (Department Cost)

-- Safe, non-destructive schema changes
alter table if exists public.projects
  add column if not exists is_internal boolean not null default false,
  add column if not exists internal_category text null;

-- Seed default internal project if it does not exist (robust to schema variations: start_date vs "startDate", etc.)
DO $$
DECLARE
  has_start_date boolean := EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='projects' AND column_name='start_date'
  );
  has_end_date boolean := EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='projects' AND column_name='end_date'
  );
  has_startDate boolean := EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='projects' AND column_name='startDate'
  );
  has_endDate boolean := EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='projects' AND column_name='endDate'
  );
  has_manager_id boolean := EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='projects' AND column_name='manager_id'
  );
  has_managerId boolean := EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='projects' AND column_name='managerId'
  );
  has_status_col boolean := EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='projects' AND column_name='status'
  );
  status_label text := NULL;
  has_created_at boolean := EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='projects' AND column_name='created_at'
  );
  has_updated_at boolean := EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='projects' AND column_name='updated_at'
  );
  has_createdAt boolean := EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='projects' AND column_name='createdAt'
  );
  has_updatedAt boolean := EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema='public' AND table_name='projects' AND column_name='updatedAt'
  );
  cols text := 'id, code, name, description, progress, budget, spent';
  vals text := 'gen_random_uuid(), ''INT-OFFICE'', ''Internal Office'', ''ค่าใช้จ่ายโครงการภายใน (Department Cost)'', 0, 0, 0';
BEGIN
  SELECT CASE
    WHEN EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid=e.enumtypid WHERE t.typname='Status' AND e.enumlabel='active') THEN 'active'
    WHEN EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid=e.enumtypid WHERE t.typname='Status' AND e.enumlabel='pending') THEN 'pending'
    WHEN EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid=e.enumtypid WHERE t.typname='Status' AND e.enumlabel='approved') THEN 'approved'
    WHEN EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid=e.enumtypid WHERE t.typname='Status' AND e.enumlabel='in_progress') THEN 'in_progress'
    ELSE (SELECT enumlabel FROM pg_enum e JOIN pg_type t ON t.oid=e.enumtypid WHERE t.typname='Status' ORDER BY enumlabel LIMIT 1)
  END INTO status_label;

  IF has_status_col AND status_label IS NOT NULL THEN
    cols := 'id, code, name, description, status, progress, budget, spent';
    vals := 'gen_random_uuid(), ''INT-OFFICE'', ''Internal Office'', ''ค่าใช้จ่ายโครงการภายใน (Department Cost)'', ' || quote_literal(status_label) || '::"Status", 0, 0, 0';
  END IF;
  IF has_start_date THEN
    cols := cols || ', start_date';
    vals := vals || ', NULL';
  ELSIF has_startDate THEN
    cols := cols || ', "startDate"';
    vals := vals || ', NULL';
  END IF;

  IF has_end_date THEN
    cols := cols || ', end_date';
    vals := vals || ', NULL';
  ELSIF has_endDate THEN
    cols := cols || ', "endDate"';
    vals := vals || ', NULL';
  END IF;

  IF has_manager_id THEN
    cols := cols || ', manager_id';
    vals := vals || ', NULL';
  ELSIF has_managerId THEN
    cols := cols || ', "managerId"';
    vals := vals || ', NULL';
  END IF;

  IF has_created_at THEN
    cols := cols || ', created_at';
    vals := vals || ', now()';
  ELSIF has_createdAt THEN
    cols := cols || ', "createdAt"';
    vals := vals || ', now()';
  END IF;

  IF has_updated_at THEN
    cols := cols || ', updated_at';
    vals := vals || ', now()';
  ELSIF has_updatedAt THEN
    cols := cols || ', "updatedAt"';
    vals := vals || ', now()';
  END IF;

  cols := cols || ', is_internal, internal_category';
  vals := vals || ', true, ''Department''';

  EXECUTE format(
    'INSERT INTO public.projects (%s)
     SELECT %s
     WHERE NOT EXISTS (
       SELECT 1 FROM public.projects
       WHERE code = %L OR lower(name) = lower(%L)
     )',
    cols, vals, 'INT-OFFICE', 'Internal Office'
  );
END $$;

-- Ensure the internal flag on any existing Internal Office record
update public.projects
set is_internal = true,
    internal_category = coalesce(internal_category, 'Department')
where (code = 'INT-OFFICE' or lower(name) = lower('Internal Office'));
