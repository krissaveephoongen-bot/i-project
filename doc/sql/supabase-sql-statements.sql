-- ==========================================
-- Supabase SQL Statements for Database Updates
-- คัดลอกและวางบน Supabase SQL Editor
-- ==========================================

-- 1. เพิ่มคอลัมน์ category ในตาราง projects (ถ้ายังไม่มี)
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS category TEXT;

-- 2. เพิ่มคอลัมน์ code ในตาราง projects (ถ้ายังไม่มี)
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS code TEXT;

-- 3. อัปเดตข้อมูลเริ่มต้นสำหรับคอลัมน์ category
UPDATE projects 
SET category = 'General' 
WHERE category IS NULL OR category = '';

-- 4. อัปเดตข้อมูลเริ่มต้นสำหรับคอลัมน์ code (ใช้ unique codes)
UPDATE projects 
SET code = 'PROJ-' || LPAD(id::text, 6, '0')
WHERE code IS NULL OR code = '';

-- 5. สร้าง indexes สำหรับ performance
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_code ON projects(code);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_priority ON projects(priority);

-- 6. เพิ่ม unique constraint สำหรับ code (ถ้าต้องการ)
-- หมายเหตุ: อาจจะต้องตรวจสอบว่าไม่มีข้อมูลซ้ำกันก่อน
-- ALTER TABLE projects ADD CONSTRAINT projects_code_unique UNIQUE (code);

-- 7. ตรวจสอบผลลัพธ์
SELECT 
    'category' as column_name,
    column_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'projects' 
    AND table_schema = 'public'
    AND column_name = 'category'

UNION ALL

SELECT 
    'code' as column_name,
    column_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'projects' 
    AND table_schema = 'public'
    AND column_name = 'code';

-- 8. ตรวจสอบข้อมูลตัวอย่าง
SELECT 
    id,
    name,
    code,
    category,
    status,
    created_at
FROM projects 
ORDER BY created_at DESC 
LIMIT 5;

-- 9. ตรวจสอบสถิติ
SELECT 
    COUNT(*) as total_projects,
    COUNT(code) as projects_with_code,
    COUNT(category) as projects_with_category,
    COUNT(*) - COUNT(code) as projects_without_code,
    COUNT(*) - COUNT(category) as projects_without_category
FROM projects;

-- ==========================================
-- คำแนะนำ:
-- 1. คัดลอก SQL statements ข้างบนทั้งหมด
-- 2. ไปที่ Supabase Dashboard -> Database -> SQL Editor
-- 3. วาง SQL statements และรัน
-- 4. ตรวจสอบผลลัพธ์จาก query ท้ายสุด
-- ==========================================
