## สิ่งที่พบจากการวิเคราะห์
- มีหลาย endpoint เกี่ยวกับผู้ใช้ที่ไม่สอดคล้องกัน:
  - /api/users ใช้ pg Pool (บางส่วนแมป snake_case ↔ camelCase แล้ว)
  - /api/users/[id] และ /api/users/profile ใช้ supabase client/supabaseAdmin และ field naming ไม่ตรงสคีมาปัจจุบัน
- สคีมาจริงของตาราง users เป็น snake_case (เช่น is_active, is_deleted, hourly_rate, created_at) และ role เป็น enum ชื่อ user_role (หรือ text ในบางสภาพแวดล้อม)
- จึงเกิด error เช่น "column isActive does not exist" และปัญหา cast ระหว่าง enum ที่ชื่อแตกต่าง (user_role vs "UserRole").

## เป้าหมายการออกแบบ API ใหม่
- รวม API ผู้ใช้ให้เป็นชุดเดียวโดยใช้ pg Pool เชื่อมต่อ DATABASE_URL จริง
- แมปข้อมูล snake_case ↔ camelCase ในชั้น API เพื่อตรงกับฝั่ง UI
- บังคับค่า role ด้วย enum user_role (admin|manager|employee) พร้อม fallback
- รองรับการกรอง/แบ่งหน้า/ค้นหา

## สัญญา API ที่จะให้
- GET /api/users
  - query params: page, pageSize, search, role, status(active|inactive)
  - คืนรายการเป็น camelCase พร้อม total
- GET /api/users/[id]
  - คืนหนึ่งรายการ; 404 ถ้าไม่พบ
- POST /api/users
  - body (camelCase): { id?, name, email, role, department?, position?, phone?, hourlyRate?, timezone?, isActive?, isDeleted? }
  - validate role ∈ {admin,manager,employee}; แปลงเป็น ::user_role ก่อน insert
- PUT /api/users (หรือ /api/users/[id])
  - body: { id, updatedFields } ในรูปแบบ camelCase
  - แมปเป็น snake_case ทีละฟิลด์; role cast ::user_role
- DELETE /api/users?id=...
  - soft delete: set is_deleted=true, is_active=false, updated_at=NOW()

## การรองรับสคีมาและ Migration
- ตรวจชนิดคอลัมน์ users.role:
  - ถ้าไม่มี enum user_role: สร้าง enum user_role ('admin','manager','employee')
  - ปรับ users.role เป็น user_role ด้วย USING role::user_role; ตั้ง DEFAULT 'employee' และ NOT NULL
- บังคับ index/constraint ที่จำเป็น:
  - UNIQUE (email)
  - INDEX บน (name), (is_active), (role)
- ไม่เปลี่ยนชนิดคอลัมน์ id (text/uuid) ในรอบนี้ เพื่อคงความเข้ากันได้

## การแมปฟิลด์ snake_case ↔ camelCase
- ส่งออก: created_at→createdAt, updated_at→updatedAt, is_active→isActive, is_deleted→isDeleted, hourly_rate→hourlyRate
- รับเข้า: กลับด้านและ map ในชั้น API ก่อน query

## ความปลอดภัยและตรวจสอบข้อมูล
- ใช้ parameterized queries ทุกคำสั่ง
- validate email รูปแบบ, role เป็นชุดที่อนุญาต, hourlyRate เป็น number ≥ 0
- ไม่คืน password และข้อมูลอ่อนไหว (omit ใน SELECT/RETURNING)

## ปรับปรุง endpoint ที่ซ้ำซ้อน/ใช้ supabase
- /api/users/[id] และ /api/users/profile เปลี่ยนมาใช้ pg Pool
- ลบ/ปิดการใช้ supabaseAdmin ใน users API เพื่อลดความซับซ้อน

## การเชื่อมต่อกับหน้า UI
- lib/users.ts ใช้ fetch ไป /api/users ใหม่ทั้งหมด
- หน้า /users ยังคง camelCase และเพิ่มตัวกรอง/query string ให้ตรงสัญญา

## การทดสอบและตรวจสอบ
- เพิ่ม /api/debug/users (read-only) เพื่อตรวจ count/sample ก่อนทดสอบ API เต็มรูปแบบ
- เขียน integration tests สำหรับ:
  - สร้าง/แก้ไข/ลบ (soft) และอ่านกลับ
  - กรอง role/status และค้นหา
- ตรวจ error cases (enum cast, missing fields, duplicate email)

## ขั้นตอนดำเนินงาน
1. เขียนชั้นแมปและ validator (role, email, numbers)
2. เขียน /api/users (GET/POST/PUT/DELETE) ให้ครบตามสัญญา พร้อม pagination/filter
3. เขียน /api/users/[id] (GET/PUT/DELETE) ให้ตรง
4. ปรับ /api/users/profile ใช้ pg Pool และ omit fields อ่อนไหว
5. เพิ่ม migration ตรวจ/สร้าง enum user_role และปรับ column 
6. อัปเดต lib/users.ts ให้เรียก API ใหม่และรองรับ query params
7. ทดสอบด้วย debug endpoint และ e2e หน้า /users
8. เปิดใช้งาน พร้อม log และข้อความ error ที่ชัดเจน

โปรดยืนยันแผนนี้ ถ้าตกลง ผมจะลงมือปรับ Users API, migration, และ lib ให้ครบถ้วนตามรายการ แล้วทดสอบให้ผ่านก่อนส่งผล.