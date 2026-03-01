-- Cost Code Catalog
create table if not exists public.cost_code_catalog (
  code text primary key,
  description text not null,
  category text null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_cost_code_catalog_active on public.cost_code_catalog(is_active);

-- Role Rate Catalog (มาตรฐานอัตราค่าจ้างตามระดับ/ตำแหน่ง)
create table if not exists public.role_rate_catalog (
  id uuid primary key default gen_random_uuid(),
  level text not null,
  position text null,
  project_role text null,
  daily_rate numeric(14,2) null,
  hourly_rate numeric(14,2) null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_role_rate_active on public.role_rate_catalog(is_active);

-- Project Cost Sheets (Header + Versioning)
create table if not exists public.project_cost_sheets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null,
  version int not null,
  status text not null default 'Draft',
  created_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, version)
);

create index if not exists idx_cost_sheets_project on public.project_cost_sheets(project_id);

-- Project Cost Items (Labor/Expense)
create table if not exists public.project_cost_items (
  id uuid primary key default gen_random_uuid(),
  cost_sheet_id uuid not null references public.project_cost_sheets(id) on delete cascade,
  type text not null check (type in ('labor','expense')),
  -- Labor fields
  level text null,
  position text null,
  project_role text null,
  daily_rate numeric(14,2) null,
  hourly_rate numeric(14,2) null,
  planned_project_mandays numeric(12,2) null,
  planned_project_manhours numeric(12,2) null,
  planned_warranty_mandays numeric(12,2) null,
  planned_warranty_manhours numeric(12,2) null,
  -- Expense fields
  cost_code text null,
  description text null,
  amount numeric(14,2) null,
  remark text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_cost_items_sheet on public.project_cost_items(cost_sheet_id);
create index if not exists idx_cost_items_type on public.project_cost_items(type);
create index if not exists idx_cost_items_code on public.project_cost_items(cost_code);

-- Minimal safe-alter for dashboard tables to ensure columns used in code exist
-- Milestones
alter table if exists public.milestones
  add column if not exists project_id uuid,
  add column if not exists projectId uuid,
  add column if not exists due_date date,
  add column if not exists dueDate date,
  add column if not exists status text,
  add column if not exists percentage numeric(5,2),
  add column if not exists progress numeric(5,2);

-- Risks
alter table if exists public.risks
  add column if not exists project_id uuid,
  add column if not exists projectId uuid,
  add column if not exists severity text,
  add column if not exists status text;

-- SPI/CPI daily snapshot (if not exists)
create table if not exists public.spi_cpi_daily_snapshot (
  id uuid primary key default gen_random_uuid(),
  projectId uuid not null,
  date date not null,
  spi numeric(6,3) not null default 1,
  created_at timestamptz not null default now(),
  unique(projectId, date)
);

-- Optional seed: Cost Codes (ไม่มี Amount เริ่มต้น)
insert into public.cost_code_catalog(code, description, category, is_active)
values
  ('G100010','เงินเดือน (Manday PM)','LABOR', true),
  ('G100020','ค่าล่วงเวลา','LABOR', true),
  ('G100140','ค่าที่พัก','TRAVEL', true),
  ('G100150','ค่าน้ำมัน (เดินทางภายในประเทศ)','TRAVEL', true),
  ('G100160','คชจ.ในการเดินทาง','TRAVEL', true),
  ('G700060','ค่าจ้างรับ-ส่งเอกสาร','OPS', true),
  ('G700070','ค่ารับรอง','OPS', true)
on conflict (code) do update set
  description = excluded.description,
  category = excluded.category,
  is_active = excluded.is_active,
  updated_at = now();

-- Optional seed: Role Rates (จากรูปแบบตัวอย่าง)
insert into public.role_rate_catalog(level, position, project_role, daily_rate, hourly_rate, is_active)
values
  ('Level 7 : Devision Head','Devision Head', null, 8000, 1000, true),
  ('Level 6 : Senior Manager','Senior Manager', null, 7000, 875, true),
  ('Level 5 : Manager','Manager','Project Manager', 6000, 750, true),
  ('Level 4 : Assistant Manager','Assistant Manager', null, 4240, 530, true),
  ('Level 3 : Senior Officer','Senior Officer', null, 3600, 450, true),
  ('Level 2 : Officer','Officer', null, 2200, 275, true)
on conflict do nothing;

