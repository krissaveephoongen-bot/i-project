-- Complete Schema for i-Projects Application
-- Execute with: psql "postgresql://postgres.vaunihijmwwkhqagjqjd:AppWorks@123!@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres" -f create-schema-with-psql.sql

-- Drop existing tables if they exist (clean start)
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.saved_views CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.project_members CASCADE;
DROP TABLE IF EXISTS public.stakeholders CASCADE;
DROP TABLE IF EXISTS public.project_progress_history CASCADE;
DROP TABLE IF EXISTS public.project_progress_snapshots CASCADE;
DROP TABLE IF EXISTS public.spi_cpi_daily_snapshot CASCADE;
DROP TABLE IF EXISTS public.sales_activities CASCADE;
DROP TABLE IF EXISTS public.sales_deals CASCADE;
DROP TABLE IF EXISTS public.sales_stages CASCADE;
DROP TABLE IF EXISTS public.sales_pipelines CASCADE;
DROP TABLE IF EXISTS public.financial_data CASCADE;
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.cashflow CASCADE;
DROP TABLE IF EXISTS public.timesheet_submissions CASCADE;
DROP TABLE IF EXISTS public.time_entries CASCADE;
DROP TABLE IF EXISTS public.task_actual_logs CASCADE;
DROP TABLE IF EXISTS public.task_plan_points CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.documents CASCADE;
DROP TABLE IF EXISTS public.risks CASCADE;
DROP TABLE IF EXISTS public.issues CASCADE;
DROP TABLE IF EXISTS public.budget_lines CASCADE;
DROP TABLE IF EXISTS public.milestones CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 1. Core Tables
CREATE TABLE public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'employee',
  status TEXT DEFAULT 'active',
  employee_code TEXT UNIQUE,
  is_active BOOLEAN DEFAULT true,
  is_deleted BOOLEAN DEFAULT false,
  failed_login_attempts INTEGER DEFAULT 0,
  timezone TEXT DEFAULT 'UTC',
  hourly_rate DECIMAL(10,2),
  department TEXT,
  position TEXT,
  avatar TEXT,
  phone TEXT,
  name_th TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  contact_person TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  client_id TEXT REFERENCES public.clients(id),
  status TEXT NOT NULL DEFAULT 'pending',
  progress INTEGER DEFAULT 0,
  progress_plan INTEGER DEFAULT 0,
  budget DECIMAL(12,2) DEFAULT 0,
  spent DECIMAL(12,2) DEFAULT 0,
  spi DECIMAL(5,2) DEFAULT 1.0,
  cpi DECIMAL(5,2) DEFAULT 1.0,
  start_date DATE,
  end_date DATE,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Project Management Tables
CREATE TABLE public.milestones (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  due_date DATE,
  completed_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
  assigned_to TEXT REFERENCES public.users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.task_plan_points (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  planned_progress INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.task_actual_logs (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  actual_progress INTEGER DEFAULT 0,
  logged_by TEXT REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.budget_lines (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  planned_amount DECIMAL(12,2) DEFAULT 0,
  actual_amount DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.documents (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_path TEXT,
  file_type TEXT,
  uploaded_by TEXT REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.risks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  probability TEXT DEFAULT 'medium',
  impact TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  identified_by TEXT REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.issues (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  reported_by TEXT REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Time Tracking Tables
CREATE TABLE public.time_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id),
  project_id TEXT REFERENCES public.projects(id),
  task_id TEXT REFERENCES public.tasks(id),
  date DATE NOT NULL,
  hours DECIMAL(4,2) NOT NULL,
  start_time TIME,
  end_time TIME,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.timesheet_submissions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.users(id),
  week_start_date DATE NOT NULL,
  total_hours DECIMAL(6,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  submitted_at TIMESTAMPTZ,
  approved_by TEXT REFERENCES public.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Financial Tables
CREATE TABLE public.cashflow (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  month TEXT NOT NULL,
  committed DECIMAL(12,2) DEFAULT 0,
  paid DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.expenses (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES public.projects(id),
  user_id TEXT REFERENCES public.users(id),
  amount DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  receipt_url TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.financial_data (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES public.projects(id),
  revenue DECIMAL(12,2) DEFAULT 0,
  costs DECIMAL(12,2) DEFAULT 0,
  profit DECIMAL(12,2) DEFAULT 0,
  period TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Sales Tables
CREATE TABLE public.sales_pipelines (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.sales_stages (
  id TEXT PRIMARY KEY,
  pipeline_id TEXT NOT NULL REFERENCES public.sales_pipelines(id),
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  probability INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.sales_deals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  pipeline_id TEXT REFERENCES public.sales_pipelines(id),
  stage_id TEXT REFERENCES public.sales_stages(id),
  value DECIMAL(12,2) DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.sales_activities (
  id TEXT PRIMARY KEY,
  deal_id TEXT REFERENCES public.sales_deals(id),
  type TEXT NOT NULL,
  note TEXT,
  user_id TEXT REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Reporting & Analytics Tables
CREATE TABLE public.spi_cpi_daily_snapshot (
  id TEXT PRIMARY KEY,
  projectId TEXT NOT NULL REFERENCES public.projects(id),
  date TEXT NOT NULL,
  spi DECIMAL(5,2) DEFAULT 1.0,
  cpi DECIMAL(5,2) DEFAULT 1.0,
  budget DECIMAL(12,2) DEFAULT 0,
  spent DECIMAL(12,2) DEFAULT 0,
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.project_progress_snapshots (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES public.projects(id),
  date DATE NOT NULL,
  progress INTEGER DEFAULT 0,
  budget_used DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.project_progress_history (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES public.projects(id),
  progress INTEGER DEFAULT 0,
  changed_by TEXT REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. System Tables
CREATE TABLE public.audit_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES public.users(id),
  action TEXT NOT NULL,
  table_name TEXT,
  record_id TEXT,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.notifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.users(id),
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.saved_views (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.users(id),
  name TEXT NOT NULL,
  filters JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.stakeholders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  role TEXT,
  project_id TEXT REFERENCES public.projects(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.project_members (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL REFERENCES public.projects(id),
  user_id TEXT NOT NULL REFERENCES public.users(id),
  role TEXT DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Create Indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_projects_client_id ON public.projects(client_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_time_entries_user_id ON public.time_entries(user_id);
CREATE INDEX idx_time_entries_project_id ON public.time_entries(project_id);
CREATE INDEX idx_time_entries_date ON public.time_entries(date);
CREATE INDEX idx_spi_cpi_daily_snapshot_project_id ON public.spi_cpi_daily_snapshot(projectId);
CREATE INDEX idx_spi_cpi_daily_snapshot_date ON public.spi_cpi_daily_snapshot(date);

-- 9. Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_cashflow_updated_at BEFORE UPDATE ON public.cashflow FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 10. Insert sample data
INSERT INTO public.users (id, name, email, role, employee_code, department, position, created_at, updated_at) VALUES
  ('admin-001', 'Administrator', 'admin@example.com', 'admin', 'EMP001', 'IT', 'System Admin', NOW(), NOW()),
  ('user-001', 'Project Manager', 'manager@example.com', 'manager', 'EMP002', 'PM', 'Project Manager', NOW(), NOW()),
  ('user-002', 'Team Member', 'employee@example.com', 'employee', 'EMP003', 'DEV', 'Developer', NOW(), NOW());

INSERT INTO public.clients (id, name, email, phone, address, created_at, updated_at) VALUES
  ('client-001', 'ABC Corporation', 'contact@abc.com', '+66-2-123-4567', 'Bangkok, Thailand', NOW(), NOW()),
  ('client-002', 'XYZ Company', 'info@xyz.com', '+66-2-987-6543', 'Chiang Mai, Thailand', NOW(), NOW());

INSERT INTO public.projects (id, name, description, client_id, status, progress, budget, spent, spi, cpi, start_date, end_date, created_at, updated_at) VALUES
  ('proj-001', 'เว็บไซต์บริษัท ABC', 'พัฒนาเว็บไซต์สำหรับบริษัท ABC', 'client-001', 'active', 75, 500000, 350000, 1.1, 1.05, '2026-01-01', '2026-06-30', NOW(), NOW()),
  ('proj-002', 'ระบบ Mobile App', 'พัฒนาแอปพลิเคชันสำหรับ iOS และ Android', 'client-001', 'active', 45, 750000, 400000, 0.9, 0.95, '2026-02-01', '2026-08-31', NOW(), NOW()),
  ('proj-003', 'โครงการ Cloud Migration', 'ย้ายข้อมูลไปยังระบบคลาวด์', 'client-002', 'active', 90, 300000, 280000, 1.05, 1.02, '2025-12-01', '2026-03-31', NOW(), NOW()),
  ('proj-004', 'ระบบวิเคราะห์ข้อมูล', 'พัฒนาระบบวิเคราะห์และรายงานประจอบ', 'client-002', 'pending', 15, 600000, 80000, 0.95, 0.85, '2026-03-01', '2026-12-31', NOW(), NOW());

INSERT INTO public.milestones (id, project_id, title, description, status, due_date, completed_date, created_at, updated_at) VALUES
  ('mile-001', 'proj-001', 'Design Phase', 'ออกแบบ UI/UX และโครงสร้าง', 'completed', '2026-02-15', '2026-02-10', NOW(), NOW()),
  ('mile-002', 'proj-001', 'Development Phase', 'พัฒนา Frontend และ Backend', 'in_progress', '2026-04-30', NULL, NOW(), NOW()),
  ('mile-003', 'proj-002', 'UI Design', 'ออกแบบหน้าจอแอปพลิเคชัน', 'completed', '2026-03-15', '2026-03-12', NOW(), NOW());

INSERT INTO public.cashflow (id, month, committed, paid, created_at, updated_at) VALUES
  ('cash-001', '2026-01', 200000, 150000, NOW(), NOW()),
  ('cash-002', '2026-02', 250000, 200000, NOW(), NOW()),
  ('cash-003', '2026-03', 300000, 180000, NOW(), NOW());

-- Create SPI/CPI snapshots for last 30 days
INSERT INTO public.spi_cpi_daily_snapshot (id, projectId, date, spi, cpi, budget, spent, progress, created_at)
SELECT 
  project.id || '-' || date_series.date_str as id,
  project.id as projectId,
  date_series.date_str as date,
  project.spi + (random() * 0.2 - 0.1) as spi,
  project.cpi + (random() * 0.2 - 0.1) as cpi,
  project.budget,
  project.spent,
  project.progress,
  NOW() as created_at
FROM 
  public.projects project,
  (SELECT generate_series(
    current_date - interval '29 days',
    current_date,
    interval '1 day'
  )::date as date_str) as date_series;

-- Show results
SELECT 'Users' as table_name, COUNT(*) as record_count FROM public.users
UNION ALL
SELECT 'Clients', COUNT(*) FROM public.clients
UNION ALL
SELECT 'Projects', COUNT(*) FROM public.projects
UNION ALL
SELECT 'Milestones', COUNT(*) FROM public.milestones
UNION ALL
SELECT 'Cashflow', COUNT(*) FROM public.cashflow
UNION ALL
SELECT 'SPI/CPI Snapshots', COUNT(*) FROM public.spi_cpi_daily_snapshot
ORDER BY table_name;
