-- Database Migration for i-projects
-- แก้ไขปัญหา schema และทำให้ database พร้อมใช้งาน

-- 1. สร้าง cashflow table ถ้ายังไม่มี
CREATE TABLE IF NOT EXISTS public.cashflow (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  month TEXT NOT NULL,
  committed DECIMAL(12,2) DEFAULT 0,
  paid DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. สร้าง spi_cpi_daily_snapshot table ด้วย schema ที่ถูกต้อง
CREATE TABLE IF NOT EXISTS public.spi_cpi_daily_snapshot (
  id TEXT PRIMARY KEY,
  projectId TEXT NOT NULL,
  date TEXT NOT NULL,
  spi DECIMAL(5,2) DEFAULT 1.0,
  cpi DECIMAL(5,2) DEFAULT 1.0,
  budget DECIMAL(12,2) DEFAULT 0,
  spent DECIMAL(12,2) DEFAULT 0,
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. เพิ่ม indexes สำหรับ performance
CREATE INDEX IF NOT EXISTS idx_spi_cpi_daily_snapshot_project_id ON public.spi_cpi_daily_snapshot(projectId);
CREATE INDEX IF NOT EXISTS idx_spi_cpi_daily_snapshot_date ON public.spi_cpi_daily_snapshot(date);
CREATE INDEX IF NOT EXISTS idx_cashflow_month ON public.cashflow(month);

-- 4. Grant permissions
GRANT ALL ON public.cashflow TO authenticated;
GRANT ALL ON public.cashflow TO anon;
GRANT ALL ON public.spi_cpi_daily_snapshot TO authenticated;
GRANT ALL ON public.spi_cpi_daily_snapshot TO anon;

-- 5. สร้าง RLS policies ถ้าจำเป็น
ALTER TABLE public.cashflow ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spi_cpi_daily_snapshot ENABLE ROW LEVEL SECURITY;

-- 6. สร้าง policies สำหรับการอ่านข้อมูล
CREATE POLICY "Enable read access for all users" ON public.cashflow FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.spi_cpi_daily_snapshot FOR SELECT USING (true);

-- 7. สร้าง policies สำหรับการเขียนข้อมูล (authenticated users only)
CREATE POLICY "Enable insert for authenticated users" ON public.cashflow FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON public.spi_cpi_daily_snapshot FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON public.cashflow FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON public.spi_cpi_daily_snapshot FOR UPDATE USING (auth.role() = 'authenticated');

-- 8. สร้าง trigger สำหรับ updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_cashflow_updated_at
  BEFORE UPDATE ON public.cashflow
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
