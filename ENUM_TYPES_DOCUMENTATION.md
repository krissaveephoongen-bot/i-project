# Database Enumerated Types Documentation

สำหรับแอพพลิเคชัน Project Management ที่ครอบคลุมทั้งระบบ

---

## 📋 สารบัญ

1. [Overview](#overview)
2. [User Related Enums](#user-related-enums)
3. [Project Related Enums](#project-related-enums)
4. [Task Related Enums](#task-related-enums)
5. [Timesheet & Time Entry Enums](#timesheet--time-entry-enums)
6. [Leave Management Enums](#leave-management-enums)
7. [Expense Enums](#expense-enums)
8. [Client Enums](#client-enums)
9. [Sales Enums](#sales-enums)
10. [Stakeholder Enums](#stakeholder-enums)
11. [Resource Enums](#resource-enums)
12. [Audit & Activity Enums](#audit--activity-enums)
13. [Milestone Enums](#milestone-enums)
14. [Risk Enums](#risk-enums)
15. [Generic Enums (Backward Compatibility)](#generic-enums-backward-compatibility)
16. [SQL Files](#sql-files)

---

## Overview

**Total Enum Types:** 37
**Enum Values:** 150+

โครงการนี้ใช้ PostgreSQL ENUM types สำหรับการควบคุมข้อมูลและสร้าง constraint ที่แข็งแรง

### วิธีการใช้

```sql
-- ดูไฟล์ SQL ที่สร้างไว้:
1. create-all-enums.sql       -- สร้าง enum ใหม่
2. recreate-all-enums.sql     -- ลบและสร้างใหม่ (use with caution!)
3. verify-enums.sql           -- ตรวจสอบ enum
```

---

## User Related Enums

### 1. `user_role`
บทบาทของผู้ใช้สำหรับการควบคุมการเข้าถึง

| Value | คำอธิบาย |
|-------|---------|
| `admin` | ผู้ดูแลระบบ |
| `manager` | ผู้จัดการ |
| `employee` | พนักงาน |

```sql
CREATE TYPE "user_role" AS ENUM ('admin', 'manager', 'employee');
```

### 2. `user_status`
สถานะบัญชีผู้ใช้

| Value | คำอธิบาย |
|-------|---------|
| `active` | ใช้งาน |
| `inactive` | ไม่ใช้งาน |

```sql
CREATE TYPE "user_status" AS ENUM ('active', 'inactive');
```

---

## Project Related Enums

### 3. `ProjectStatus`
วัฏจักรสถานะของโครงการ

| Value | คำอธิบาย |
|-------|---------|
| `planning` | วางแผน |
| `active` | ดำเนินการอยู่ |
| `onHold` | ชะลอ |
| `completed` | เสร็จสิ้น |
| `cancelled` | ยกเลิก |

```sql
CREATE TYPE "ProjectStatus" AS ENUM ('planning', 'active', 'onHold', 'completed', 'cancelled');
```

### 4. `ProjectPriority`
ระดับความสำคัญของโครงการ

| Value | คำอธิบาย |
|-------|---------|
| `low` | ต่ำ |
| `medium` | ปานกลาง |
| `high` | สูง |
| `urgent` | เร่งด่วน |

```sql
CREATE TYPE "ProjectPriority" AS ENUM ('low', 'medium', 'high', 'urgent');
```

### 5. `RiskLevel`
ระดับความเสี่ยง

| Value | คำอธิบาย |
|-------|---------|
| `low` | ต่ำ |
| `medium` | ปานกลาง |
| `high` | สูง |
| `critical` | วิกฤต |

```sql
CREATE TYPE "RiskLevel" AS ENUM ('low', 'medium', 'high', 'critical');
```

---

## Task Related Enums

### 6. `TaskStatus`
สถานะของงาน

| Value | คำอธิบาย |
|-------|---------|
| `todo` | ต้องทำ |
| `in_progress` | กำลังทำ |
| `in_review` | ตรวจสอบ |
| `done` | เสร็จสิ้น |
| `cancelled` | ยกเลิก |
| `inactive` | ไม่ใช้งาน |

```sql
CREATE TYPE "TaskStatus" AS ENUM ('todo', 'in_progress', 'in_review', 'done', 'cancelled', 'inactive');
```

### 7. `TaskPriority`
ระดับความสำคัญของงาน

| Value | คำอธิบาย |
|-------|---------|
| `low` | ต่ำ |
| `medium` | ปานกลาง |
| `high` | สูง |
| `urgent` | เร่งด่วน |

```sql
CREATE TYPE "TaskPriority" AS ENUM ('low', 'medium', 'high', 'urgent');
```

### 8. `TaskCategory`
หมวดหมู่ของงาน

| Value | คำอธิบาย |
|-------|---------|
| `development` | พัฒนา |
| `design` | ออกแบบ |
| `testing` | ทดสอบ |
| `documentation` | เอกสาร |
| `maintenance` | บำรุงรักษา |
| `other` | อื่นๆ |

```sql
CREATE TYPE "TaskCategory" AS ENUM ('development', 'design', 'testing', 'documentation', 'maintenance', 'other');
```

---

## Timesheet & Time Entry Enums

### 9. `WorkType`
ประเภทของการทำงาน

| Value | คำอธิบาย |
|-------|---------|
| `project` | งานโครงการ (คิดค่า) |
| `office` | งานสำนัก/บริหาร |
| `training` | การฝึกอบรม |
| `leave` | ลา |
| `overtime` | ทำงานเกิน |
| `other` | อื่นๆ |

```sql
CREATE TYPE "WorkType" AS ENUM ('project', 'office', 'training', 'leave', 'overtime', 'other');
```

### 10. `TimeEntryStatus`
สถานะของการบันทึกเวลา

| Value | คำอธิบาย |
|-------|---------|
| `pending` | รอการอนุมัติ |
| `approved` | อนุมัติ |
| `rejected` | ปฏิเสธ |

```sql
CREATE TYPE "TimeEntryStatus" AS ENUM ('pending', 'approved', 'rejected');
```

---

## Leave Management Enums

### 11. `LeaveType`
ประเภทการลา

| Value | คำอธิบาย |
|-------|---------|
| `annual` | ลาประจำปี |
| `sick` | ลาป่วย |
| `personal` | ลาส่วนตัว |
| `maternity` | ลาคลอด |
| `unpaid` | ลาไม่ได้รับเงิน |

```sql
CREATE TYPE "LeaveType" AS ENUM ('annual', 'sick', 'personal', 'maternity', 'unpaid');
```

### 12. `LeaveStatus`
สถานะของการขอลา

| Value | คำอธิบาย |
|-------|---------|
| `pending` | รอการอนุมัติ |
| `approved` | อนุมัติ |
| `rejected` | ปฏิเสธ |
| `cancelled` | ยกเลิก |

```sql
CREATE TYPE "LeaveStatus" AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
```

---

## Expense Enums

### 13. `ExpenseCategory`
หมวดหมู่ของค่าใช้จ่าย

| Value | คำอธิบาย |
|-------|---------|
| `travel` | การเดินทาง |
| `supplies` | วัสดุสิ้นเปลือง |
| `equipment` | อุปกรณ์ |
| `training` | การฝึกอบรม |
| `other` | อื่นๆ |

```sql
CREATE TYPE "ExpenseCategory" AS ENUM ('travel', 'supplies', 'equipment', 'training', 'other');
```

### 14. `ExpenseStatus`
สถานะของค่าใช้จ่าย

| Value | คำอธิบาย |
|-------|---------|
| `pending` | รอการอนุมัติ |
| `approved` | อนุมัติ |
| `rejected` | ปฏิเสธ |
| `reimbursed` | คืนเงินแล้ว |

```sql
CREATE TYPE "ExpenseStatus" AS ENUM ('pending', 'approved', 'rejected', 'reimbursed');
```

### 15. `PaymentMethod`
วิธีการจ่ายเงิน

| Value | คำอธิบาย |
|-------|---------|
| `cash` | เงินสด |
| `credit_card` | บัตรเครดิต |
| `bank_transfer` | โอนธนาคาร |
| `check` | เช็ค |
| `other` | อื่นๆ |

```sql
CREATE TYPE "PaymentMethod" AS ENUM ('cash', 'credit_card', 'bank_transfer', 'check', 'other');
```

---

## Client Enums

### 16. `ClientStatus`
สถานะของลูกค้า

| Value | คำอธิบาย |
|-------|---------|
| `active` | ใช้งาน |
| `inactive` | ไม่ใช้งาน |
| `archived` | เก็บถาวร |

```sql
CREATE TYPE "ClientStatus" AS ENUM ('active', 'inactive', 'archived');
```

### 17. `ClientType`
ประเภทของลูกค้า

| Value | คำอธิบาย |
|-------|---------|
| `individual` | บุคคล |
| `company` | บริษัท |
| `government` | รัฐสถาบัน |

```sql
CREATE TYPE "ClientType" AS ENUM ('individual', 'company', 'government');
```

---

## Sales Enums

### 18. `SalesStatus`
สถานะของการขายข้อตกลง

| Value | คำอธิบาย |
|-------|---------|
| `prospect` | โอกาส |
| `qualified` | ผ่านการคัดกรอง |
| `proposal` | เสนอราคา |
| `negotiation` | เจรจา |
| `closed_won` | ปิดสำเร็จ |
| `closed_lost` | ปิดไม่สำเร็จ |

```sql
CREATE TYPE "SalesStatus" AS ENUM ('prospect', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost');
```

### 19. `SalesStage`
ขั้นตอนการขาย

| Value | คำอธิบาย |
|-------|---------|
| `lead` | ลีด |
| `contact` | ติดต่อ |
| `meeting` | ประชุม |
| `demo` | สาธิต |
| `proposal` | เสนอราคา |
| `contract` | สัญญา |
| `won` | ชนะ |
| `lost` | แพ้ |

```sql
CREATE TYPE "SalesStage" AS ENUM ('lead', 'contact', 'meeting', 'demo', 'proposal', 'contract', 'won', 'lost');
```

---

## Stakeholder Enums

### 20. `StakeholderRole`
บทบาทของผู้มีส่วนได้ส่วนเสีย

| Value | คำอธิบาย |
|-------|---------|
| `executive` | ผู้บริหาร |
| `manager` | ผู้จัดการ |
| `team_member` | สมาชิกทีม |
| `client` | ลูกค้า |
| `vendor` | ผู้จัดหา |
| `consultant` | ที่ปรึกษา |
| `other` | อื่นๆ |

### 21. `StakeholderType`
ประเภทของผู้มีส่วนได้ส่วนเสีย

| Value | คำอธิบาย |
|-------|---------|
| `internal` | ภายใน |
| `external` | ภายนอก |
| `partner` | พันธมิตร |

### 22. `InvolvementLevel`
ระดับการมีส่วนร่วม

| Value | คำอธิบาย |
|-------|---------|
| `high` | สูง |
| `medium` | ปานกลาง |
| `low` | ต่ำ |
| `minimal` | น้อยที่สุด |

---

## Resource Enums

### 23. `ResourceType`
ประเภทของทรัพยากร

| Value | คำอธิบาย |
|-------|---------|
| `human` | บุคลากร |
| `equipment` | อุปกรณ์ |
| `material` | วัสดุ |
| `software` | ซอฟต์แวร์ |
| `facility` | สิ่งอำนวยความสะดวก |
| `other` | อื่นๆ |

### 24. `ResourceStatus`
สถานะของทรัพยากร

| Value | คำอธิบาย |
|-------|---------|
| `available` | ว่างอยู่ |
| `in_use` | ใช้งานอยู่ |
| `maintenance` | บำรุงรักษา |
| `retired` | ถูกถอด |
| `archived` | เก็บถาวร |

### 25. `AllocationStatus`
สถานะของการจัดสรรทรัพยากร

| Value | คำอธิบาย |
|-------|---------|
| `requested` | ขอใช้ |
| `approved` | อนุมัติ |
| `allocated` | จัดสรรแล้ว |
| `deallocated` | ยกเลิกการจัดสรร |
| `rejected` | ปฏิเสธ |

---

## Audit & Activity Enums

### 26. `ActivityType`
ประเภทของกิจกรรมการบันทึก

| Value | คำอธิบาย |
|-------|---------|
| `create` | สร้าง |
| `update` | แก้ไข |
| `delete` | ลบ |
| `comment` | ความเห็น |
| `assign` | มอบหมาย |
| `status_change` | เปลี่ยนสถานะ |

### 27. `AuditSeverity`
ระดับความร้ายแรงของการตรวจสอบ

| Value | คำอธิบาย |
|-------|---------|
| `low` | ต่ำ |
| `medium` | ปานกลาง |
| `high` | สูง |
| `critical` | วิกฤต |

---

## Milestone Enums

### 28. `MilestoneStatus`
สถานะของจุดสำคัญ

| Value | คำอธิบาย |
|-------|---------|
| `pending` | รอดำเนินการ |
| `in_progress` | กำลังดำเนินการ |
| `completed` | เสร็จสิ้น |
| `cancelled` | ยกเลิก |

---

## Risk Enums

### 29. `RiskImpact`
ระดับผลกระทบของความเสี่ยง

| Value | คำอธิบาย |
|-------|---------|
| `low` | ต่ำ |
| `medium` | ปานกลาง |
| `high` | สูง |
| `critical` | วิกฤต |

### 30. `RiskProbability`
ความน่าจะเป็นของความเสี่ยง

| Value | คำอธิบาย |
|-------|---------|
| `low` | ต่ำ |
| `medium` | ปานกลาง |
| `high` | สูง |
| `very_high` | สูงมาก |

### 31. `RiskStatus`
สถานะของความเสี่ยง

| Value | คำอธิบาย |
|-------|---------|
| `open` | เปิด |
| `mitigated` | ลดน้อย |
| `closed` | ปิด |
| `accepted` | ยอมรับ |

---

## Generic Enums (Backward Compatibility)

### 32. `Status`
สถานะทั่วไป (เพื่อความเข้ากันได้)

| Value | คำอธิบาย |
|-------|---------|
| `todo` | ต้องทำ |
| `in_progress` | กำลังทำ |
| `in_review` | ตรวจสอบ |
| `done` | เสร็จสิ้น |
| `pending` | รอดำเนินการ |
| `approved` | อนุมัติ |
| `rejected` | ปฏิเสธ |
| `active` | ใช้งาน |
| `inactive` | ไม่ใช้งาน |

### 33. `Priority`
ระดับความสำคัญทั่วไป (เพื่อความเข้ากันได้)

| Value | คำอธิบาย |
|-------|---------|
| `low` | ต่ำ |
| `medium` | ปานกลาง |
| `high` | สูง |
| `urgent` | เร่งด่วน |

---

## SQL Files

### 1. `create-all-enums.sql`
**วัตถุประสงค์:** สร้าง enum types ใหม่สำหรับฐานข้อมูล

**ใช้เมื่อ:**
- ตั้งค่าโครงการเป็นครั้งแรก
- สร้างฐานข้อมูลใหม่

```bash
# วิธีใช้ใน psql
\i create-all-enums.sql

# หรือจากคำสั่ง
psql -U username -d database_name -f create-all-enums.sql
```

### 2. `recreate-all-enums.sql`
**วัตถุประสงค์:** ลบและสร้าง enum types ใหม่

**⚠️ ข้อเตือน:** ลบข้อมูลที่เกี่ยวข้อง!

**ใช้เมื่อ:**
- ต้องการรีเซตโครงสร้าง enum ทั้งหมด
- การแก้ไขปัญหาสำหรับ schema

```bash
# วิธีใช้
psql -U username -d database_name -f recreate-all-enums.sql
```

### 3. `verify-enums.sql`
**วัตถุประสงค์:** ตรวจสอบและแสดงข้อมูล enum ทั้งหมด

**ใช้เมื่อ:**
- ต้องการสอบถามประเภท enum
- ตรวจสอบว่า enum สร้างถูกต้องหรือไม่
- ดูค่า enum ทั้งหมด
- ตรวจสอบตารางที่ใช้ enum

```bash
# วิธีใช้
psql -U username -d database_name -f verify-enums.sql
```

---

## ตรวจสอบ Enum ด้วย Prisma

```typescript
// ในไฟล์ schema.prisma

enum user_role {
  admin
  manager
  employee
}

enum user_status {
  active
  inactive
}

// ใช้ใน model
model users {
  id       String    @id @default(cuid())
  role     user_role @default(employee)
  status   user_status @default(active)
  // ...
}
```

---

## ตรวจสอบ Enum ด้วย TypeScript

```typescript
// types/index.ts

type UserRole = 'admin' | 'manager' | 'employee';
type UserStatus = 'active' | 'inactive';
type ProjectStatus = 'planning' | 'active' | 'onHold' | 'completed' | 'cancelled';

// ใช้ใน API
interface User {
  id: string;
  role: UserRole;
  status: UserStatus;
}
```

---

## Best Practices

1. **ใช้ Enum ตัวอักษร**: ใช้ lowercase หรือ camelCase ตามลักษณะของ enum
2. **ไม่เปลี่ยนค่าที่มีอยู่**: เมื่อ enum ถูกใช้งานแล้ว ควรหลีกเลี่ยงการเปลี่ยนแปลง
3. **เพิ่มค่าใหม่**: ใช้ `ALTER TYPE` เพื่อเพิ่มค่าใหม่
4. **ใช้ String Values**: ในแอพพลิเคชั่น ใช้ string values ของ enum
5. **Validation**: ตรวจสอบค่า enum ก่อนบันทึกฐานข้อมูล

---

## เพิ่มค่า Enum ใหม่

```sql
-- เพิ่มค่าใหม่ให้กับ enum ที่มีอยู่
ALTER TYPE "ProjectStatus" ADD VALUE 'suspended' AFTER 'onHold';

-- หมายเหตุ: ต้องทำในเดี่ยว (single transaction)
```

---

## Migration Guide

หากต้องการอัพเดต enum:

```sql
-- 1. สร้าง enum ใหม่
CREATE TYPE "ProjectStatus_new" AS ENUM ('planning', 'active', 'onHold', 'completed', 'cancelled', 'suspended');

-- 2. อัพเดตคอลัมน์
ALTER TABLE projects 
  ALTER COLUMN status TYPE "ProjectStatus_new" USING status::text::"ProjectStatus_new";

-- 3. ลบ enum เก่า
DROP TYPE "ProjectStatus";

-- 4. เปลี่ยนชื่อ
ALTER TYPE "ProjectStatus_new" RENAME TO "ProjectStatus";
```

---

## Documentation สรุป

- **ไฟล์หลัก:** `create-all-enums.sql`, `recreate-all-enums.sql`, `verify-enums.sql`
- **ตำแหน่ง:** `c:/Users/Jakgrits/project-mgnt/`
- **อัปเดตล่าสุด:** 2026-02-19
- **ทั้งหมด:** 37 enum types, 150+ enum values
