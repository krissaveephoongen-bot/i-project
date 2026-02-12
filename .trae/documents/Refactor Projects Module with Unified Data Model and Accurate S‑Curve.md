# เป้าหมาย
- Refactor โมดูล /projects ให้ทุกส่วนเชื่อมโยงกันเป็นข้อมูลเดียวกัน: Milestones → Tasks, Risks, Team, Budget, Documents
- ออกแบบตามหลักการบริหารโครงการ (WBS, Critical Path/Progress Tracking, Cash Flow)
- ทำให้การคำนวณ S‑curve (Plan vs Actual) ถูกต้อง เชื่อถือได้ และรองรับ SPI/Status

## สถาปัตยกรรมข้อมูล (Data Model)
### ตารางหลัก
- projects(id, name, status, start_date, end_date, budget, manager_id, priority, category, created_at, updated_at)
- tasks(id, project_id, milestone_id?, name, phase, weight, start_date, end_date, progress_plan_final%, progress_actual_latest%, status, created_at, updated_at)
- milestones(id, project_id, name, percentage, due_date, status, created_at, updated_at)
- risks(id, project_id, task_id?, title, severity, impact, likelihood, status, created_at, updated_at)
- project_members(id, project_id, user_id, role, is_active, created_at)
- documents(id, project_id, task_id?, milestone_id?, name, url, type, size, uploaded_by, uploaded_at)

### ตารางสนับสนุนการคำนวณ
- task_plan_points(id, task_id, date, plan_percent) — แผนรายวัน/รายสัปดาห์ของงาน รวมแล้วเป็น 100% สำหรับงานนั้น
- task_actual_logs(id, task_id, date, progress_percent) — บันทึกความคืบหน้าจริงตามวันที่
- project_progress_snapshots(id, project_id, date, plan_percent, actual_percent, spi) — snapshot รายวัน/สัปดาห์เพื่อการแสดงผลเร็ว

### ความสัมพันธ์สำคัญ
- milestones → tasks: tasks.milestone_id ชี้ไปยัง milestone ที่งานนั้นส่งผลให้ถึง/จัดส่ง
- risks → tasks (optional): risks.task_id ผูกความเสี่ยงกับงานที่เกี่ยวข้อง
- documents → tasks/milestones (optional): เอกสารแนบกับงาน/งวดงานเฉพาะ
- team: project_members.user_id เชื่อมผู้ใช้ที่มีบทบาทในโครงการ

## API Layer (Next.js App Router /api/projects/*)
- /projects/:id/overview — รวมสรุปรวม: progress, spi, budget summary, risk counts, milestones, tasks
- /projects/tasks CRUD — เพิ่ม/แก้/ลบงาน พร้อมอัปเดต progress logs
- /projects/milestones CRUD — เพิ่ม/แก้/ลบงวดงาน และกระทบ cashflow (ถ้ามี)
- /projects/risks CRUD — ผูกกับ task_id ได้
- /projects/documents CRUD — รองรับการแนบกับ task/milestone
- /projects/team CRUD — จัดการสมาชิก/บทบาท
- /projects/progress/plan — เขียน/อ่าน task_plan_points
- /projects/progress/actual — เขียน/อ่าน task_actual_logs
- /projects/progress/snapshot — job คำนวณและเก็บ project_progress_snapshots

## การคำนวณ S‑Curve
- นิยามน้ำหนักงาน w_i (รวมทุกงานของโครงการ = 100%)
- แผนรายเวลา P_i(t): จาก task_plan_points (หรือ linear ถ้าไม่ระบุ)
- ค่าจริงรายเวลา A_i(t): ใช้ค่าล่าสุดจาก task_actual_logs ที่วันที่ ≤ t
- Plan(t) = Σ_i w_i * P_i(t) / 100
- Actual(t) = Σ_i w_i * A_i(t) / 100
- SPI(t) = Actual(t) / Plan(t) (ป้องกันหารศูนย์ด้วยเงื่อนไข Plan(t) > 0)
- สร้าง snapshot รายวัน/สัปดาห์: เขียน project_progress_snapshots สำหรับการแสดงผลกราฟเร็ว

## Budget/Cash Flow
- budget_lines(id, project_id, type[approved/committed/actual/paid], amount, date, related_milestone_id?)
- Summary API: approvedBudget, actualCost, committedCost, remainingBudget, paidAmount, pendingAmount โดย mapping กับ milestones เพื่อดู cash out/receive schedule

## Frontend Refactor (ภายใต้ /projects)
- Projects list/overview: ดึงจาก overview API แทนการ join ฝั่ง client
- Tasks
  - เพิ่มหน้าแก้ไขงาน (/projects/[id]/tasks/[taskId]/edit) พร้อมฟอร์มเต็ม (น้ำหนัก, แผน/ผลจริง, วันเริ่ม/สิ้นสุด, สถานะ)
  - เพิ่มการบันทึก plan points/actual logs
- Milestones
  - เชื่อม tasks ผ่าน milestone_id และปรับการมอง cashflow จาก milestones
- Risks
  - เลือก task ที่เกี่ยวข้องได้ และสรุป risk heatmap
- Team
  - จัดการสมาชิก บทบาท และสิทธิ์
- Documents
  - แนบกับ task/milestone และแสดงในรายการตามบริบท
- S‑Curve Chart
  - อ่าน snapshot series จาก /projects/progress/snapshot แล้ว plot plan vs actual + SPI

## สิทธิ์/ความปลอดภัย (RBAC/RLS)
- ใช้ Permission guard ที่มีอยู่ (manager/admin/employee)
- เข้มงวด RLS: user เห็นเฉพาะโครงการที่เป็นสมาชิกหรือผู้จัดการ
- Audit log สำหรับ CRUD สำคัญ (tasks/milestones/budget/risks)

## Migration Strategy
1) เพิ่มคอลัมน์/ตารางสนับสนุน: task_plan_points, task_actual_logs, project_progress_snapshots, budget_lines
2) Backfill: map milestones ↔ tasks (heuristic: จากชื่อ/dueDate/ช่วงเวลา)
3) สร้าง job (cron/route handler) สำหรับ generate snapshot รายวัน
4) ปรับ API endpoints ให้รองรับ schema ใหม่ (เก็บ backward‑compatible ชั่วคราว)
5) ปรับหน้าจอ UI ทีละส่วนให้อ่าน overview/snapshot แทนการ join ฝั่ง client

## การทดสอบ/ตรวจสอบ
- Unit tests: ฟังก์ชันคำนวณ S‑curve, SPI, summary budget
- Integration tests: CRUD tasks/milestones/risks/documents/team
- E2E: flow สร้างโครงการ → เพิ่มงาน/งวดงาน → บันทึก plan/actual → ดู S‑curve/สรุป → เอกสาร/ทีม/ความเสี่ยง

## Performance/Indexing
- Index: tasks(project_id), milestones(project_id), logs(task_id, date), plan(task_id, date), budget_lines(project_id, date)
- Snapshot caching: ลดโหลดการคำนวณซ้ำในการ render

## แผนการดำเนินงาน (เป็นลำดับงาน ไม่ใช่กำหนดการ)
1) เพิ่ม schema สนับสนุนและคอลัมน์เชื่อมโยง
2) สร้าง/ปรับ API ตามข้างต้น (รองรับ fallback แบบที่มี)
3) ปรับ UI แต่ละหน้าให้ใช้ overview/snapshot + เพิ่มหน้าแก้ไขที่จำเป็น
4) เขียน job snapshot + ทดสอบความถูกต้อง S‑curve
5) ทำ E2E และปรับปรุงตามผลทดสอบ

ยืนยันตามแผนนี้ได้เลยไหม หากตกลง ผมจะเริ่มด้วยการเพิ่มตาราง/คอลัมน์และปรับ API เพื่อให้ S‑curve และการเชื่อมโยงข้อมูลทำงานครบถ้วนก่อน แล้วตามด้วย UI.