# ภาพรวมและเป้าหมาย
- ทำให้ข้อมูลภายใต้ /projects เชื่อมโยงกันเป็นชุดเดียวแบบ PM‑centric (Milestones ↔ Tasks, Risks, Team, Budget, Documents)
- ปรับการคำนวณ S‑curve (Plan vs Actual) ให้ถูกต้องและตรวจสอบได้ พร้อม SPI
- ปรับ API/Frontend ให้ดึงจากจุดศูนย์กลาง ลดปัญหา join/relationship ของ Supabase

## 1) อ่านโครงสร้างฐานข้อมูล และ relation ปัจจุบัน
### แหล่งอ้างอิงที่พบ
- types/database.types.ts: นิยามตาราง projects, tasks, milestones, risks, users, timesheets ฯลฯ
- prisma/schema.prisma: โมเดล Projects/Tasks/TeamStructure/Timesheets และคอลัมน์ key (manager_id, project_id ฯลฯ)
- app/api/_lib/schema.ts: สร้าง/ปรับ foreign keys แบบครอบคลุมหลายเคสชื่อคอลัมน์ (manager_id vs managerId ฯลฯ) และสร้างตารางพื้นฐาน (documents, contacts, audit_logs…)
### ภาพรวมความสัมพันธ์ปัจจุบัน
- projects(id) ← tasks(project_id)
- projects(id) ← contacts(project_id)
- users(id) ← projects(manager_id)
- ยังไม่พบคอลัมน์เชื่อมโยงตรง: tasks ↔ milestones, risks ↔ tasks, documents ↔ tasks/milestones (รองรับใน schema.ts แบบกว้าง ๆ แต่ยังไม่ใช้งานเป็นระบบ)

## 2) อ่าน Frontend ปัจจุบัน
- /projects/[id]/page.tsx: ใช้ Supabase ดึง projects + tasks + documents + project_members (มีการ join users ในบางจุด → เคยก่อปัญหาสัมพันธ์ schema)
- /projects/[id]/tasks/page.tsx: CRUD ผ่าน /api/projects/tasks, โครงสร้าง WBS เบื้องต้น
- /projects/[id]/milestones, /documents, /risks: มีหน้าแยกพร้อม CRUD และ modal เดิมบางส่วน
- /projects/[id]/SCurveChart.tsx: ดึงข้อมูล S‑curve ผ่าน endpoint ในระบบ (ต้องปรับให้มาจากจุดเดียว)

## 3) อ่าน API ปัจจุบัน
- /api/projects/tasks|documents|risks|milestones: มี GET/POST/PUT/DELETE แบบ fallback (Prisma/Supabase/pg pool)
- /api/projects/update: อัปเดตฟิลด์โครงการแบบ dynamic mapping
- ยังไม่มี API รวมภาพรวมโครงการ/สรุป budget/milestone cashflow แบบศูนย์กลาง และยังไม่มี snapshot series สำหรับ S‑curve

## 4) ออกแบบและปรับฐานข้อมูลให้พร้อม (Proposal)
### ตาราง/คอลัมน์ที่ต้องเพิ่ม
- tasks เพิ่ม milestone_id (FK → milestones.id)
- risks เพิ่ม task_id (optional) เพื่อผูกความเสี่ยงกับงานที่เกี่ยวข้อง
- documents เพิ่ม task_id, milestone_id (optional) เพื่อผูกไฟล์กับบริบทการทำงาน/งวดงาน
- สร้าง task_plan_points(task_id, date, plan_percent) สำหรับ baseline/แผนรายวัน/สัปดาห์
- สร้าง task_actual_logs(task_id, date, progress_percent) สำหรับผลจริงรายเวลา
- สร้าง project_progress_snapshots(project_id, date, plan_percent, actual_percent, spi) เพื่อ cache series S‑curve
- สร้าง budget_lines(project_id, type[approved/committed/actual/paid], amount, date, related_milestone_id?) สำหรับสรุปงบประมาณ/กระแสเงินสด
### Index/RLS
- Index: tasks(project_id), milestones(project_id), *_logs(task_id,date), budget_lines(project_id,date)
- RLS: ผู้จัดการ/สมาชิกโครงการเท่านั้นที่เห็นโครงการนั้น ๆ; audit logs สำหรับ CRUD สำคัญ

## 5) แก้ไขการดึงข้อมูล/แสดงผล (PM‑centric)
### API ศูนย์กลาง
- /api/projects/overview/{id}: รวมข้อมูลโครงการ, tasks, milestones, risks, documents, team, budget summary
- /api/projects/progress/snapshot?projectId=: สร้าง series plan/actual/spi รายวัน (อ่าน plan points + actual logs; ถ้าไม่มี plan points ใช้ linear fallback)
- /api/projects/budget/lines?projectId=: อ่าน budget_lines/milestones เพื่อสรุป committed/paid/remaining
### หน้าจอ
- Dashboard โครงการ: ใช้ overview + snapshot series เพื่อแสดง S‑curve, SPI, KPIs (Completed/In Progress/Pending, Risk heat map, Milestone cashflow)
- Tasks/WBS: หน้าแก้ไขงานพร้อมฟิลด์ weight/phase/วันที่ + บันทึก baseline (task_plan_points) และผลจริง (task_actual_logs)
- Milestones: เชื่อม tasks ผ่าน milestone_id และแสดงผลกระทบงบประมาณชัดเจน
- Risks: ผูกกับ task_id เพื่อ trace ความเสี่ยงตาม WBS
- Documents: แนบกับ task/milestone เพื่อเข้าถึงไฟล์ตามบริบท

## กระบวนการดำเนินงานเป็นลำดับ
1) สำรวจตารางจริงในฐานข้อมูล และสร้าง/ปรับ FK/Index ตามที่เสนอ (migration script/DDL)
2) สร้าง API overview + progress snapshot + budget lines
3) ปรับ Frontend ให้เรียก API ใหม่ (overview/snapshot/budget) และปรับหน้าจอ WBS ให้บันทึกแผน/ผลจริงได้
4) เพิ่ม unit/integration tests สำหรับ S‑curve, SPI, budget summary และ E2E flow สำหรับ PM
5) rollout แบบ incremental: เปิดใช้ overview/snapshot ก่อน แล้วค่อยเปิด baseline/actual logs

## ผลลัพธ์ที่ PM จะได้
- ภาพรวมโครงการครบถ้วนในหน้าเดียว (S‑curve, SPI, สถานะงาน, ความเสี่ยง, cashflow)
- WBS ที่แก้ไขรายละเอียดงานได้ พร้อมบันทึก baseline และผลจริง
- งวดงานผูกกับงาน ชี้ผลกระทบงบประมาณได้จริง
- เอกสารและทีมเชื่อมโยงตามบริบทการทำงาน

ยืนยันตามแผนนี้ได้ไหม หากตกลง ผมจะเริ่มจากการสำรวจฐานข้อมูลจริง/สร้าง migration สำหรับ FK + ตาราง plan/logs/snapshots/budget_lines จากนั้นพัฒนา API ใหม่ และเชื่อมต่อ UI ทีละส่วนให้ PM ใช้งานได้ทันที