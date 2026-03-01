-- Fix schema issues and disable RLS temporarily for data seeding

-- 1. Fix SPI/CPI snapshot column name
DO $$
BEGIN
    -- Check if column exists and rename if needed
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'spi_cpi_daily_snapshot' 
        AND column_name = 'project_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'spi_cpi_daily_snapshot' 
        AND column_name = 'projectId'
    ) THEN
        ALTER TABLE public.spi_cpi_daily_snapshot RENAME COLUMN project_id TO projectId;
    END IF;
END $$;

-- 2. Disable RLS temporarily for data seeding
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cashflow DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.spi_cpi_daily_snapshot DISABLE ROW LEVEL SECURITY;

-- 3. Re-enable RLS after data seeding
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cashflow ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spi_cpi_daily_snapshot ENABLE ROW LEVEL SECURITY;
