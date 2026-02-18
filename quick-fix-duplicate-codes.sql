-- ==========================================
-- Quick Fix for Duplicate Codes
-- แก้ไขปัญหา duplicate codes อย่างรวดเร็ว
-- ==========================================

-- 1. ลบ unique constraint ก่อน
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_code_unique;

-- 2. แก้ไข duplicate codes โดยใช้ project ID
UPDATE projects 
SET code = 'PROJ-' || id
WHERE code = 'PROJ-proj-0';

-- 3. ตรวจสอบผลลัพธ์
SELECT 
    id,
    name,
    code,
    created_at
FROM projects 
WHERE id IN ('proj-001', 'proj-002', 'proj-003', 'proj-004')
ORDER BY id;

-- 4. สร้าง unique constraint ใหม่
ALTER TABLE projects 
ADD CONSTRAINT projects_code_unique UNIQUE (code);

-- 5. ตรวจสอบว่าไม่มี duplicate แล้ว
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

-- 6. ตรวจสอบทุก projects
SELECT 
    id,
    name,
    code,
    status
FROM projects 
ORDER BY created_at DESC;

-- ==========================================
-- ผลลัพธ์ที่ควรได้:
-- proj-001 -> PROJ-proj-001
-- proj-002 -> PROJ-proj-002  
-- proj-003 -> PROJ-proj-003
-- proj-004 -> PROJ-proj-004
-- ==========================================
