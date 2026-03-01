-- ==========================================
-- Fix Duplicate Codes in Projects Table
-- แก้ไขปัญหา duplicate codes ในตาราง projects
-- ==========================================

-- ==========================================
-- 1. CHECK DUPLICATE CODES
-- ==========================================

-- ดูว่ามี codes ซ้ำกันอย่างไร
SELECT 
    code,
    COUNT(*) as duplicate_count,
    STRING_AGG(id::text, ', ') as project_ids
FROM projects 
WHERE code IS NOT NULL AND code != ''
GROUP BY code
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- ดูข้อมูล projects ที่มี code ซ้ำกัน
SELECT 
    id,
    name,
    code,
    created_at
FROM projects 
WHERE code IN (
    SELECT code 
    FROM projects 
    WHERE code IS NOT NULL AND code != ''
    GROUP BY code 
    HAVING COUNT(*) > 1
)
ORDER BY code, created_at;

-- ==========================================
-- 2. FIX DUPLICATE CODES
-- ==========================================

-- ลบ unique constraint ก่อน (ถ้ามี)
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_code_unique;

-- แก้ไข duplicate codes โดยใช้ timestamp + row number
UPDATE projects 
SET code = 
    CASE 
        WHEN code = 'PROJ-proj-0' THEN 
            'PROJ-' || LPAD(EXTRACT(EPOCH FROM created_at)::text, 10, '0') || '-' || 
            ROW_NUMBER() OVER (PARTITION BY code ORDER BY created_at, id)
        ELSE code
    END
WHERE code = 'PROJ-proj-0';

-- ถ้ายังมี duplicate อื่นๆ ให้แก้ไขแบบทั่วไป
WITH ranked_projects AS (
    SELECT 
        id,
        code,
        created_at,
        ROW_NUMBER() OVER (PARTITION BY code ORDER BY created_at, id) as rn
    FROM projects 
    WHERE code IS NOT NULL AND code != ''
)
UPDATE projects 
SET code = code || '-' || rn
FROM ranked_projects 
WHERE projects.id = ranked_projects.id 
    AND ranked_projects.rn > 1;

-- ==========================================
-- 3. CREATE UNIQUE CONSTRAINT
-- ==========================================

-- ตรวจสอบอีกครั้งว่ายังมี duplicate หรือไม่
SELECT 
    code,
    COUNT(*) as duplicate_count
FROM projects 
WHERE code IS NOT NULL AND code != ''
GROUP BY code
HAVING COUNT(*) > 1;

-- ถ้าไม่มี duplicate แล้วค่อยสร้าง unique constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM projects 
        WHERE code IN (
            SELECT code 
            FROM projects 
            WHERE code IS NOT NULL AND code != ''
            GROUP BY code 
            HAVING COUNT(*) > 1
        )
    ) THEN
        ALTER TABLE projects 
        ADD CONSTRAINT projects_code_unique UNIQUE (code);
    END IF;
END $$;

-- ==========================================
-- 4. VERIFICATION
-- ==========================================

-- ตรวจสอบผลลัพธ์สุดท้าย
SELECT 
    id,
    name,
    code,
    created_at
FROM projects 
ORDER BY created_at DESC 
LIMIT 10;

-- ตรวจสอบว่าทุก project มี code หรือไม่
SELECT 
    COUNT(*) as total_projects,
    COUNT(code) as projects_with_code,
    COUNT(*) - COUNT(code) as projects_without_code
FROM projects;

-- ตรวจสอบว่าไม่มี duplicate codes
SELECT 
    'Duplicate codes remaining: ' || 
    (SELECT COUNT(*) 
     FROM (
         SELECT code 
         FROM projects 
         WHERE code IS NOT NULL AND code != ''
         GROUP BY code 
         HAVING COUNT(*) > 1
     ) as duplicates
    ) as status;

-- ==========================================
-- 5. ALTERNATIVE: RESET ALL CODES (ถ้ายังมีปัญหา)
-- ==========================================

-- ถ้ายังมีปัญหา ให้รัน query นี้เพื่อสร้าง codes ใหม่ทั้งหมด
/*
-- ลบ constraint ก่อน
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_code_unique;

-- สร้าง codes ใหม่ทั้งหมดโดยใช้ ID และ timestamp
UPDATE projects 
SET code = 'PROJ-' || LPAD(id::text, 6, '0') || '-' || 
           LPAD(EXTRACT(EPOCH FROM created_at)::text, 10, '0');

-- สร้าง unique constraint
ALTER TABLE projects 
ADD CONSTRAINT projects_code_unique UNIQUE (code);
*/

-- ==========================================
-- คำแนะนำ:
-- 1. รัน queries ที่ 1 เพื่อดู duplicate codes
-- 2. รัน queries ที่ 2 เพื่อแก้ไข duplicates
-- 3. รัน queries ที่ 3 เพื่อสร้าง unique constraint
-- 4. รัน queries ที่ 4 เพื่อตรวจสอบผลลัพธ์
-- 5. ถ้ายังมีปัญหา ให้รัน queries ที่ 5 (alternative solution)
-- ==========================================
