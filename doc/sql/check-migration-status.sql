-- Check migration status and table existence
SELECT 
    schemaname,
    tablename,
    tableowner,
    tablespace
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('cashflow', 'spi_cpi_daily_snapshot')
ORDER BY tablename;

-- Check columns in spi_cpi_daily_snapshot
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'spi_cpi_daily_snapshot'
ORDER BY ordinal_position;

-- Check columns in cashflow
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'cashflow'
ORDER BY ordinal_position;
