-- Seed data for new Supabase project
-- สร้างข้อมูลตัวอย่างสำหรับระบบจัดการโปรเจค

-- 1. Insert Users
INSERT INTO public.users (id, email, name, role, created_at, updated_at) VALUES
  ('admin-001', 'admin@example.com', 'Administrator', 'admin', NOW(), NOW()),
  ('user-001', 'manager@example.com', 'Project Manager', 'manager', NOW(), NOW()),
  ('user-002', 'employee@example.com', 'Team Member', 'employee', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Clients
INSERT INTO public.clients (id, name, email, phone, address, created_at, updated_at) VALUES
  ('client-001', 'ABC Corporation', 'contact@abc.com', '+66-2-123-4567', 'Bangkok, Thailand', NOW(), NOW()),
  ('client-002', 'XYZ Company', 'info@xyz.com', '+66-2-987-6543', 'Chiang Mai, Thailand', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Projects
INSERT INTO public.projects (id, name, description, client_id, status, progress, budget, spent, spi, cpi, start_date, end_date, created_at, updated_at) VALUES
  ('proj-001', 'เว็บไซต์บริษัท ABC', 'พัฒนาเว็บไซต์สำหรับบริษัท ABC', 'client-001', 'active', 75, 500000, 350000, 1.1, 1.05, '2026-01-01', '2026-06-30', NOW(), NOW()),
  ('proj-002', 'ระบบ Mobile App', 'พัฒนาแอปพลิเคชันสำหรับ iOS และ Android', 'client-001', 'active', 45, 750000, 400000, 0.9, 0.95, '2026-02-01', '2026-08-31', NOW(), NOW()),
  ('proj-003', 'โครงการ Cloud Migration', 'ย้ายข้อมูลไปยังระบบคลาวด์', 'client-002', 'active', 90, 300000, 280000, 1.05, 1.02, '2025-12-01', '2026-03-31', NOW(), NOW()),
  ('proj-004', 'ระบบวิเคราะห์ข้อมูล', 'พัฒนาระบบวิเคราะห์และรายงานประจอบ', 'client-002', 'pending', 15, 600000, 80000, 0.95, 0.85, '2026-03-01', '2026-12-31', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Milestones
INSERT INTO public.milestones (id, project_id, title, description, status, due_date, completed_date, created_at, updated_at) VALUES
  ('mile-001', 'proj-001', 'Design Phase', 'ออกแบบ UI/UX และโครงสร้าง', 'completed', '2026-02-15', '2026-02-10', NOW(), NOW()),
  ('mile-002', 'proj-001', 'Development Phase', 'พัฒนา Frontend และ Backend', 'in_progress', '2026-04-30', NULL, NOW(), NOW()),
  ('mile-003', 'proj-002', 'UI Design', 'ออกแบบหน้าจอแอปพลิเคชัน', 'completed', '2026-03-15', '2026-03-12', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Cashflow
INSERT INTO public.cashflow (id, month, committed, paid, created_at, updated_at) VALUES
  ('cash-001', '2026-01', 200000, 150000, NOW(), NOW()),
  ('cash-002', '2026-02', 250000, 200000, NOW(), NOW()),
  ('cash-003', '2026-03', 300000, 180000, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 6. Insert SPI/CPI Snapshots (last 30 days)
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
  )::date as date_str) as date_series
ON CONFLICT (id) DO NOTHING;
