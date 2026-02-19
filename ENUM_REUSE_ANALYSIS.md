# Enum Values Reuse Analysis

## 📊 สรุปผล

จากการสแกน Enum values ที่ซ้ำกัน ผลลัพธ์ดังนี้:

### 🔴 Enum Values ที่ใช้ซ้ำมากที่สุด (8 ตัว)

| Value | ใช้ใน Enums | ประเภท |
|-------|-----------|--------|
| `low` | AuditSeverity, InvolvementLevel, Priority, ProjectPriority, RiskImpact, RiskLevel, RiskProbability, TaskPriority | ระดับ/ความสำคัญ |
| `high` | AuditSeverity, InvolvementLevel, Priority, ProjectPriority, RiskImpact, RiskLevel, RiskProbability, TaskPriority | ระดับ/ความสำคัญ |
| `medium` | AuditSeverity, InvolvementLevel, Priority, ProjectPriority, RiskImpact, RiskLevel, RiskProbability, TaskPriority | ระดับ/ความสำคัญ |

---

## 📈 Reuse Patterns

### 1. **Level/Priority Values** (8 occurrences each)
```
low, high, medium - ระดับ 3 ขั้น
critical, urgent - ระดับสูงสุด
very_high - ความน่าจะเป็นสูงสุด
```

**ใช้ใน:**
- Risk Management: `RiskImpact`, `RiskLevel`, `RiskProbability`
- Project Management: `ProjectPriority`
- Task Management: `TaskPriority`
- Audit: `AuditSeverity`
- Stakeholder: `InvolvementLevel`
- Generic: `Priority`

**ข้อดี:** มาตรฐานกว่า ผู้ใช้เข้าใจง่าย

---

### 2. **Approval Status** (6 occurrences)
```
approved, pending, rejected
```

**ใช้ใน:**
- `AllocationStatus`
- `ExpenseStatus`
- `LeaveStatus`
- `TimeEntryStatus`
- `Status` (generic)
- `oauth_authorization_status` (external)

**ข้อดี:** ความสัมพันธ์กับการอนุมัติชัดเจน

---

### 3. **Common Categories** (6 occurrences)
```
other
```

**ใช้ใน:**
- `ExpenseCategory`
- `PaymentMethod`
- `ResourceType`
- `StakeholderRole`
- `TaskCategory`
- `WorkType`

**ข้อดี:** Option ทั่วไปสำหรับข้อมูลที่ไม่จำแนก

---

### 4. **Status/State Values** (4-5 occurrences)
```
active, inactive, cancelled
```

**ใช้ใน (active/inactive):**
- `ClientStatus`
- `ProjectStatus`
- `Status` (generic)
- `user_status`

**ใช้ใน (cancelled):**
- `LeaveStatus`
- `MilestoneStatus`
- `ProjectStatus`
- `TaskStatus`

---

## 🎯 Best Practices สำหรับ Enum Reuse

### ✅ ควรใช้เดิม:
1. **Level-based values**: `low`, `medium`, `high`, `critical`
2. **Status patterns**: `active`, `inactive`, `pending`, `approved`, `rejected`
3. **Generic categories**: `other`, `training`, `equipment`

### ❌ ควรหลีกเลี่ยง:
1. ห้ามสร้าง enum value ใหม่ที่มีความหมายเหมือนกับค่าที่มีอยู่
2. ห้ามใช้ชื่อที่ใกล้เคียงกัน (เช่น `approved` vs `accept`)

---

## 📋 Enum Family Groups

### Group 1: Level/Severity (8 enums)
```typescript
// All use: low, medium, high, critical/urgent/very_high
- AuditSeverity
- InvolvementLevel
- Priority (generic)
- ProjectPriority
- RiskImpact
- RiskLevel
- RiskProbability
- TaskPriority
```

**Recommendation:** อาจรวมเป็น Generic Enum

---

### Group 2: Approval/Status (6 enums)
```typescript
// All use: pending, approved, rejected
- AllocationStatus
- ExpenseStatus
- LeaveStatus
- Status (generic)
- TimeEntryStatus
- oauth_authorization_status (external)
```

**Recommendation:** ใช้ Generic `Status` เพื่อลดความซ้ำซ้อน

---

### Group 3: Lifecycle States (4 enums)
```typescript
// Mixed: active, inactive, cancelled, completed
- ClientStatus
- MilestoneStatus
- ProjectStatus
- TaskStatus
```

**Recommendation:** สร้าง Generic `LifecycleStatus` สำหรับ `active, inactive, cancelled, completed`

---

## 🔍 Current Enum Distribution

```
Total Enums: 37
Unique Values: ~80
Reused Values: 23+
Reuse Ratio: 28.75%
```

---

## 💡 Optimization Suggestions

### Option 1: ยังคงเดิม (Current)
**ข้อดี:**
- ชัดเจน explicit
- แต่ละ enum อิสระ
- ง่ายต่อการบำรุงรักษา

**ข้อเสีย:**
- Redundancy
- SQL constraint ยุ่งซ้อน

---

### Option 2: รวม Enums ที่เกี่ยวข้อง
```sql
-- ลด 37 enums เหลือ ~20
- Merge Level enums → "Level"
- Merge Status enums → "Status"
- Merge Approval enums → "ApprovalStatus"
```

**ข้อดี:**
- DRY principle
- ปะหนวดน้อย

**ข้อเสีย:**
- ต้อง refactor code
- ต้อง migration

---

## 📊 Detailed Enum Usage

### High Reuse (3+ occurrences)
| Value | Count | Used In |
|-------|-------|---------|
| low | 8 | Level-based enums |
| high | 8 | Level-based enums |
| medium | 8 | Level-based enums |
| approved | 6 | Status/Approval enums |
| pending | 6 | Status/Approval enums |
| other | 6 | Category enums |
| rejected | 5 | Status/Approval enums |
| active | 4 | State enums |
| cancelled | 4 | Lifecycle enums |
| inactive | 4 | State enums |
| in_progress | 3 | Task/Milestone |
| urgent | 3 | Priority |
| critical | 3 | Severity/Risk |

---

## 🚀 Next Steps

1. **ยืนยัน:** วิธีการปัจจุบันเหมาะสม
2. **Document:** เพิ่มหมายเหตุในไฟล์ enum
3. **Monitor:** ติดตามการเพิ่ม enum ใหม่
4. **Refactor (ถ้าต้อง):** รวม enums ที่ซ้ำกัน

---

## ✅ Quality Checklist

- [x] ไม่มี typo ใน enum values
- [x] Enum names มี consistency
- [x] Level-based enums ใช้ `low/medium/high/critical`
- [x] Status enums ใช้ `pending/approved/rejected`
- [x] ไม่มี conflicting values
- [x] Reuse pattern สมควร

---

**สรุป:** โครงสร้าง Enum ปัจจุบันสมสมควร มีการ reuse ที่เหมาะสม และไม่ก่อให้เกิด conflict
