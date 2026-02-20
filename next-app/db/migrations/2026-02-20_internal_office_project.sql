-- Mark internal projects and seed a default \"Internal Office\" project (Department Cost)

-- Safe, non-destructive schema changes
alter table if exists public.projects
  add column if not exists is_internal boolean not null default false,
  add column if not exists internal_category text null;

-- Seed default internal project if it does not exist
insert into public.projects (id, code, name, description, status, progress, budget, spent, start_date, end_date, manager_id, created_at, updated_at, is_internal, internal_category)
select gen_random_uuid(), 'INT-OFFICE', 'Internal Office', 'ค่าใช้จ่ายโครงการภายใน (Department Cost)', 'Active', 0, 0, 0, null, null, null, now(), now(), true, 'Department'
where not exists (
  select 1 from public.projects
  where (code = 'INT-OFFICE' or lower(name) = lower('Internal Office'))
);

-- Ensure the internal flag on any existing Internal Office record
update public.projects
set is_internal = true,
    internal_category = coalesce(internal_category, 'Department')
where (code = 'INT-OFFICE' or lower(name) = lower('Internal Office'));

