# Timesheet Page Redesign Architecture

## Overview

Professional redesign of the `/timesheet` page to support 3 primary work record types with proper data relationships and cost tracking integration.

---

## 1. Work Record Types (3 Categories)

### 1.1 Project Work (การทำงานในโครงการ)
**Purpose**: Track hours spent on specific projects with task-level granularity

**Data Model**:
```typescript
interface ProjectWorkEntry {
  id: string;
  userId: string;
  projectId: string;              // Required
  taskId?: string;                // Optional - from project's task list
  date: string;                   // YYYY-MM-DD
  startTime: string;              // HH:mm
  endTime: string;                // HH:mm
  hours: number;                  // Calculated
  breakDuration: number;          // Minutes
  description?: string;
  chargeable: boolean;            // ⭐ Cost checkbox
  chargeAmount?: number;          // If chargeable, deducted from costsheet
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}
```

**Task Selection Logic**:
- Dropdown populated from `/api/projects/:id/tasks` (incomplete status only)
- Filtered by project selection
- Optional (can have general project work without specific task)

**Cost Integration**:
- When `chargeable=true`, hours/amount deducted from project's `costsheet`
- Requires `tasks.billableRate` or `projects.hourlyRate`
- Tracked in `expense_entries` with type='timesheet_cost'

**Database Tables**:
- `time_entries` (existing)
- `expense_entries` (new relation for cost tracking)

---

### 1.2 Non-Project Work (การทำงานนอกโครงการ)
**Purpose**: Track activities outside project scope

**Categories**:
- ประชุมภายใน (Internal Meeting)
- อบรม (Training)
- สัมมนา (Seminar)
- อื่น ๆ (Other)

**Data Model**:
```typescript
interface NonProjectWorkEntry {
  id: string;
  userId: string;
  workCategory: 'meeting' | 'training' | 'seminar' | 'other';
  date: string;                   // YYYY-MM-DD
  startTime: string;              // HH:mm
  endTime: string;                // HH:mm
  hours: number;                  // Calculated
  breakDuration: number;          // Minutes
  description: string;            // Required
  relatedUsers?: string[];        // For meetings: participants
  relatedProjects?: string[];     // Optional: projects it impacts
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}
```

**Data Relationships**:
- Optional project reference (for reporting: "Meeting about Project X")
- Optional attendees list (for meeting tracking)
- Must have description (what was the activity about)

**Reporting Impact**:
- Separate from billable hours
- Tracked in monthly summary under "Non-billable"
- Can be included in resource utilization reports

**Database Tables**:
- New: `non_project_entries`

---

### 1.3 Leave Category (หมวดหมู่การลา)
**Purpose**: Track time-off requests

**Supported Leave Types**:
- ลาประจำปี (Annual Leave)
- ลาป่วย (Sick Leave)
- ลากิจ (Personal Leave)
- ลาคลอด (Maternity Leave)
- ลาไม่ได้ค่าจ้าง (Unpaid Leave)

**Data Model**:
```typescript
interface LeaveEntry {
  id: string;
  userId: string;
  leaveType: 'annual' | 'sick' | 'personal' | 'maternity' | 'unpaid';
  startDate: string;              // YYYY-MM-DD
  endDate: string;                // YYYY-MM-DD
  hours?: number;                 // Half-day support
  reason: string;                 // Required
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  approvedBy?: string;            // Manager ID
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

**Leave Balance Integration**:
- Check `leave_allocations` for annual leave balance
- Calculate pending hours from draft/submitted entries
- Block overlapping leave dates (same user)
- Display remaining balance on timesheet page

**Database Tables**:
- `leave_requests` (existing)
- `leave_allocations` (existing)

---

## 2. Data Relationships & Integration

### 2.1 Relationship Diagram

```
User
├── TimeEntry (Project Work)
│   ├── Project (required)
│   │   └── Task (optional)
│   │       └── BillableRate (for cost calculation)
│   ├── ExpenseEntry (if chargeable=true)
│   │   └── Costsheet (deducted from project budget)
│   └── Approval Status
│
├── NonProjectEntry (Non-Project Work)
│   ├── WorkCategory (meeting/training/seminar/other)
│   ├── Related Projects (optional - for reporting)
│   └── Approval Status
│
└── LeaveEntry (Leave)
    ├── LeaveAllocation (balance tracking)
    ├── Leave Balance Calculation
    └── Approval Status
```

### 2.2 Cost Tracking Flow

```
Project Work Entry (chargeable=true)
  ↓
Calculate Cost = hours × billableRate
  ↓
Create ExpenseEntry {
  type: 'timesheet_cost',
  amount: cost,
  linkedTimeEntryId: entry.id,
  projectId: project.id
}
  ↓
Deduct from Project Costsheet
  ↓
Update Project Budget Remaining
  ↓
Trigger Budget Alert (if threshold exceeded)
```

### 2.3 Monthly Reporting Integration

```
Monthly Summary for User
├── Project Work Total Hours
│   ├── Billable Hours (chargeable=true)
│   │   └── Cost Impact
│   └── Non-billable Hours (chargeable=false)
├── Non-Project Work Total Hours
│   ├── By Category
│   │   ├── Meetings (hours)
│   │   ├── Training (hours)
│   │   ├── Seminars (hours)
│   │   └── Other (hours)
│   └── Related Project Count
├── Leave Summary
│   ├── Annual Leave Used
│   ├── Sick Leave Used
│   ├── Personal Leave Used
│   └── Remaining Balance
└── Total Billable Hours (for cost reporting)
```

---

## 3. UI/UX Design Specifications

### 3.1 Page Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    TIMESHEET HEADER                          │
│  ◄ Month/Year ►  | Status Badge | Total Hours | Leave Balance │
│  [Edit] [Add Entry] [Submit]     [Reports]     [Settings]    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  TABS:  [📅 Monthly] [📊 Summary] [📝 Activity] [📋 Leave]   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     TAB CONTENT (Variant)                    │
│                                                               │
│  [Calendar Grid / Summary Stats / Activity Log / Leave Info] │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Tab Specifications

#### Tab 1: Monthly View (📅 Monthly)
**Purpose**: Daily entry overview with inline editing

**Grid Structure**:
```
Date | Project | Task | Work Type | Hours | Cost (if ✓) | Status
─────┼─────────┼──────┼───────────┼───────┼─────────────┼────────
01   | Proj-A  | T-1  | Project   | 8.0   | $400 ✓      | ✓ Approved
     | Project | Mtg  | Non-Proj  | 1.0   | -           | ✓ Approved
02   | Proj-B  | T-2  | Project   | 7.5   | -           | ⏳ Draft
     | Annual  | -    | Leave     | 4.0   | -           | ⏳ Submitted
```

**Features**:
- Click row to edit
- Color coding by work type
- Hover to show full details
- Sortable columns
- Filter by: Project, Work Type, Status
- Group by Date option

#### Tab 2: Summary (📊 Summary)
**Purpose**: Monthly overview with cost impact

**Cards**:
```
┌─────────────────┬─────────────────┬─────────────────┐
│  Total Hours    │  Billable Hours │  Leave Used     │
│      160        │      140        │      8h (Ann)   │
│  (8h remaining) │   (@ $65/hr)    │  (12h remaining)│
└─────────────────┴─────────────────┴─────────────────┘

Breakdown by Work Type:
┌──────────────────────────────────────────────────┐
│ Project Work          │   120h (75%)              │
│   - Project A         │   40h (billable)          │
│   - Project B         │   60h (billable)          │
│   - Project C         │   20h (non-billable)      │
├──────────────────────────────────────────────────┤
│ Non-Project Work      │   32h (20%)               │
│   - Meetings          │   16h                     │
│   - Training          │   12h                     │
│   - Seminars          │   4h                      │
├──────────────────────────────────────────────────┤
│ Leave                 │   8h (5%)                 │
│   - Annual            │   8h                      │
│   - Sick              │   0h                      │
└──────────────────────────────────────────────────┘

Cost Summary:
┌──────────────────────────────────────────────────┐
│ Timesheet Cost (Chargeable Hours)                │
│ Project A: 40h × $65 = $2,600                   │
│ Project B: 60h × $55 = $3,300                   │
│ ─────────────────────────────────               │
│ Total Cost Impact: $5,900                       │
│ Budget Impact: Deducted from Project Costsheets │
└──────────────────────────────────────────────────┘
```

#### Tab 3: Activity Log (📝 Activity)
**Purpose**: Chronological record of all changes

**Columns**:
```
Timestamp        | Action               | Work Type       | Hours | Status
─────────────────┼──────────────────────┼─────────────────┼───────┼──────
2025-02-15 10:30 | Created             | Project - A     | 8.0   | Draft
2025-02-15 11:45 | Updated             | Project - A     | 7.5   | Draft
2025-02-15 14:20 | Status: Submitted   | -               | -     | Submit
2025-02-15 16:00 | Approved by Manager | -               | -     | ✓ Appr
```

#### Tab 4: Leave (📋 Leave)
**Purpose**: Leave balance and requests

**Content**:
```
Leave Balance (2025)
┌─────────────────┬──────┬────────┬───────────┐
│ Leave Type      │ Alloc│ Used   │ Remaining │
├─────────────────┼──────┼────────┼───────────┤
│ Annual Leave    │  18  │   8    │    10     │
│ Sick Leave      │   5  │   0    │     5     │
│ Personal Leave  │   3  │   0    │     3     │
│ Maternity Leave │   0  │   0    │     0     │
└─────────────────┴──────┴────────┴───────────┘

Recent Leave Requests
[Draft/Submitted/Approved entries with dates]
```

### 3.3 Modal: Add/Edit Entry

**Entry Type Selection** (Primary):
```
┌─ Select Entry Type ──────────────────┐
│  ○ Project Work                      │
│  ○ Non-Project Work                  │
│  ○ Leave                             │
└──────────────────────────────────────┘
```

#### Form Variant A: Project Work

```
Date              [Date Picker - Default: Today]
Project *         [Dropdown - Required]
Task              [Dropdown - Optional, filtered by project]
                  └─ ⚠️ Show only incomplete tasks
Work Type         [Hidden: Project]
Hours             [Auto-calculated from times]
├─ Start Time *   [Time Input]
└─ End Time *     [Time Input]
├─ Break Duration [Minutes - Default: 60]
Description       [Textarea]

Cost Tracking:
├─ ☐ Chargeable (deducted from project budget)
│   └─ Amount: [Auto: hours × rate] (Read-only)
└─ Currency: [Auto: Project currency]

Status            [Draft] (Auto)
```

#### Form Variant B: Non-Project Work

```
Date              [Date Picker - Default: Today]
Work Category *   [Select: Meeting/Training/Seminar/Other]
Related Project   [Dropdown - Optional]
                  └─ For reporting purposes
Hours             [Auto-calculated from times]
├─ Start Time *   [Time Input]
└─ End Time *     [Time Input]
├─ Break Duration [Minutes - Default: 60]
Description *     [Textarea - Required]
Participants      [Multi-select - Optional]
                  └─ For meeting tracking

Status            [Draft] (Auto)
```

#### Form Variant C: Leave

```
Leave Type *      [Select: Annual/Sick/Personal/Maternity/Unpaid]
Start Date *      [Date Picker]
End Date *        [Date Picker]
Duration          [Read-only - Auto-calculated]
                  └─ Alerts if exceeds balance
Half Day Option   [Checkbox] if start date = end date
Time (if half-day)[Time Range - 13:00-17:00 OR 09:00-13:00]
Reason *          [Textarea - Required]

Status            [Draft] (Auto)
```

---

## 4. Implementation Data Models

### 4.1 Database Schema (Prisma)

```prisma
// Project Work Entry
model time_entries {
  id                String    @id @default(cuid())
  userId            String
  projectId         String
  taskId            String?   // Optional
  date              DateTime
  startTime         String    // HH:mm
  endTime           String    // HH:mm
  breakDuration     Int       @default(60) // minutes
  hours             Decimal   @db.Numeric(10, 2)
  
  // NEW: Cost tracking
  chargeable        Boolean   @default(false)
  chargeAmount      Decimal?  @db.Numeric(12, 2)
  
  description       String?
  status            String    @default("draft") // draft, submitted, approved, rejected
  approvedBy        String?
  approvedAt        DateTime?
  rejectedReason    String?
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relations
  user              users     @relation("time_entries_user", fields: [userId], references: [id])
  project           projects  @relation(fields: [projectId], references: [id])
  task              tasks?    @relation(fields: [taskId], references: [id])
  comments          time_entry_comments[]
  expenseEntry      expense_entries?  // NEW: Cost link
  
  @@index([userId, date])
  @@index([projectId])
  @@index([status])
}

// NEW: Non-Project Work Entry
model non_project_entries {
  id                String    @id @default(cuid())
  userId            String
  workCategory      String    // meeting, training, seminar, other
  relatedProjectId  String?   // Optional reference
  date              DateTime
  startTime         String    // HH:mm
  endTime           String    // HH:mm
  breakDuration     Int       @default(60) // minutes
  hours             Decimal   @db.Numeric(10, 2)
  description       String    // Required
  participants      String[]  @default([]) // User IDs for meetings
  
  status            String    @default("draft")
  approvedBy        String?
  approvedAt        DateTime?
  rejectedReason    String?
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relations
  user              users     @relation("non_project_entries_user", fields: [userId], references: [id])
  project           projects? @relation(fields: [relatedProjectId], references: [id])
  
  @@index([userId, date])
  @@index([workCategory])
}

// Leave Entry
model leave_requests {
  id                String    @id @default(cuid())
  userId            String
  leaveType         String    // annual, sick, personal, maternity, unpaid
  startDate         DateTime
  endDate           DateTime
  hours             Decimal?  @db.Numeric(10, 2) // For half-days
  reason            String
  status            String    @default("draft")
  approvedBy        String?
  approvedAt        DateTime?
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relations
  user              users     @relation("leave_requests_user", fields: [userId], references: [id])
  allocation        leave_allocations? @relation(fields: [leaveAllocationId], references: [id])
  leaveAllocationId String?
  
  @@index([userId, startDate, endDate])
  @@index([status])
}

// NEW: Cost/Expense Link
model expense_entries {
  id                String    @id @default(cuid())
  projectId         String
  timeEntryId       String    @unique // Link to timesheet cost
  amount            Decimal   @db.Numeric(12, 2)
  type              String    @default("timesheet_cost")
  description       String?
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relations
  timeEntry         time_entries @relation(fields: [timeEntryId], references: [id], onDelete: Cascade)
  project           projects  @relation(fields: [projectId], references: [id])
  
  @@index([projectId])
  @@index([timeEntryId])
}
```

### 4.2 API Endpoints

```
// Project Work
POST   /api/timesheet/entries              Create entry
GET    /api/timesheet/entries              List (month/user filters)
PATCH  /api/timesheet/entries/:id          Update entry
DELETE /api/timesheet/entries/:id          Delete entry
POST   /api/timesheet/entries/:id/approve  Approve (manager/admin)

// Non-Project Work
POST   /api/timesheet/non-project          Create entry
GET    /api/timesheet/non-project          List
PATCH  /api/timesheet/non-project/:id      Update
DELETE /api/timesheet/non-project/:id      Delete
POST   /api/timesheet/non-project/:id/approve

// Leave
POST   /api/timesheet/leave                Create request
GET    /api/timesheet/leave                List
GET    /api/timesheet/leave/balance        Get current balance
PATCH  /api/timesheet/leave/:id            Update
DELETE /api/timesheet/leave/:id            Delete
POST   /api/timesheet/leave/:id/approve    Approve

// Monthly Summary & Reports
GET    /api/timesheet/summary              Monthly breakdown
GET    /api/timesheet/cost-summary         Cost impact report
GET    /api/timesheet/activity             Activity log

// Submission
POST   /api/timesheet/submit               Submit month for approval
GET    /api/timesheet/submission-status    Check submission status

// Project Tasks (filtered)
GET    /api/projects/:id/tasks?status=incomplete  Get project tasks
```

---

## 5. Workflow & Status Management

### 5.1 Entry Status Flow

```
                    ┌──────────┐
                    │  Draft   │
                    └────┬─────┘
                         │
                    [Submit for Approval]
                         │
                    ┌────▼─────┐
                    │ Submitted │
                    └────┬─────┘
                         │
                  ┌──────┴──────┐
                  │             │
            [Approve]      [Reject]
                  │             │
            ┌─────▼─┐     ┌─────▼──┐
            │Approved│     │Rejected│
            └─────────┘     └────────┘
                             │
                        [Re-submit]
                             │
                        [Draft] ↻
```

**Rules**:
- Only `draft` or `rejected` entries can be edited
- Approved entries locked for editing
- Bulk submit (entire month at once)
- Once submitted, individual entry editing blocked until rejected

### 5.2 Monthly Submission Flow

```
┌─ Monthly Timesheet ─────────────────────┐
│ ┌─ Draft Entries ─────┐                 │
│ │ - Project Work (5)  │                 │
│ │ - Non-Project (2)   │                 │
│ │ - Leave (1)         │                 │
│ │ Total: 8 entries    │                 │
│ └─────────────────────┘                 │
│                                          │
│ ┌─ Summary ──────────────────────────┐  │
│ │ Total Hours: 160h                  │  │
│ │ Billable: 140h @ $65/hr = $9,100  │  │
│ │ Cost Impact: $9,100               │  │
│ └────────────────────────────────────┘  │
│                                          │
│ [Submit for Approval] → Sets status to   │
│ 'submitted' for all entries this month   │
└──────────────────────────────────────────┘
```

---

## 6. Approval & Management Features

### 6.1 Manager/Admin Approval Interface

**Page**: `/admin/timesheet-approvals`

```
Filter & Sort:
├─ User: [Dropdown]
├─ Month: [Date Picker]
├─ Status: [All/Submitted/Approved/Rejected]
└─ Project: [Dropdown - Optional]

Table:
┌─────────┬──────────────────┬────────┬──────────┬──────────┬─────────┐
│ User    │ Month            │ Hours  │ Cost Imp │ Status   │ Actions │
├─────────┼──────────────────┼────────┼──────────┼──────────┼─────────┤
│ John    │ Feb 2025         │ 160h   │ $9,100   │ ⏳ Subm  │ [View] [Approve] [Reject]
│ Sarah   │ Feb 2025         │ 152h   │ $7,800   │ ✓ Appr   │ [View]
└─────────┴──────────────────┴────────┴──────────┴──────────┴─────────┘

Approval Actions:
└─ View Details
   ├─ All entries (breakdown by type)
   ├─ Cost impact preview
   ├─ Add approval comment
   └─ [Approve] [Reject with Reason]
```

---

## 7. Validation Rules

### 7.1 Project Work Entry

```typescript
Validations:
✓ Date: Must be within last 3 months or next 30 days
✓ Start Time < End Time
✓ Hours > 0
✓ Project: Must be selected
✓ Task: If selected, must exist and be incomplete
✓ Break Duration: 0 to 180 minutes
✓ Status: Must be one of [draft, submitted, approved, rejected]

If chargeable=true:
✓ Project must have billable rate configured
✓ Billable hours > 0
✓ Cost calculation = hours × rate
```

### 7.2 Non-Project Work Entry

```typescript
Validations:
✓ Date: Within last 3 months or next 30 days
✓ Start Time < End Time
✓ Hours > 0
✓ Work Category: Required (meeting/training/seminar/other)
✓ Description: Required, min 10 characters
✓ Participants: Optional but if provided, must be valid user IDs
✓ Related Project: Optional, if provided must exist
```

### 7.3 Leave Entry

```typescript
Validations:
✓ Leave Type: Required
✓ Start Date ≤ End Date
✓ No overlapping leave dates (same user)
✓ Duration: Check against leave balance
  └─ If balance < requested: Block or show warning
✓ Reason: Required, min 5 characters
✓ If half-day: Time range must be valid
✓ Annual leave can only be taken on weekdays (optional)
```

---

## 8. Cost & Budget Integration

### 8.1 Cost Calculation Flow

```
Project Work Entry {
  chargeable: true,
  hours: 40,
  taskId: "task-123"  // Has billableRate: $65
}

↓ Calculate Cost ↓

chargeAmount = 40 × $65 = $2,600

↓ Create Expense ↓

expense_entries {
  projectId,
  timeEntryId,
  amount: $2,600,
  type: "timesheet_cost",
  description: "John - Feb 2025 - Task: Database Setup"
}

↓ Update Budget ↓

project.budget.spent += $2,600
project.budget.remaining -= $2,600

↓ Check Budget ↓

if (remaining < threshold):
  → Send notification to Project Manager
  → Log warning in audit
```

### 8.2 Reporting: Cost by Project

```
Cost Summary Report:
┌─────────────────────────────────────────────┐
│ Project A                                   │
│ ├─ Task: Database Setup         40h @ $65/h = $2,600 ✓
│ ├─ Task: API Integration        30h @ $65/h = $1,950 ✓
│ └─ General Project Work (no task) 5h @ $50/h = $250
│ ─────────────────────────────────────────── 
│ Project Total: 75h = $4,800                │
├─────────────────────────────────────────────┤
│ Project B                                   │
│ ├─ Task: Frontend Development  60h @ $55/h = $3,300 ✓
│ └─ General Project Work        10h (non-billable) = $0
│ ─────────────────────────────────────────── 
│ Project Total: 70h = $3,300                │
├─────────────────────────────────────────────┤
│ GRAND TOTAL: 145h = $8,100                 │
└─────────────────────────────────────────────┘
```

---

## 9. Data Integrity & Constraints

### 9.1 Integrity Rules

```
✓ One entry per day per category per user
  └─ Exception: Multiple projects on same day = allowed

✓ Overlapping times check
  └─ Cannot have time conflicts (project + non-project same time)

✓ Leave priority
  └─ Leave days block all other entries (hard constraint)

✓ Edit restrictions
  └─ Approved entries: No editing (admin override only)
  └─ Submitted entries: No editing (must reject first)

✓ Delete restrictions
  └─ Only draft/rejected entries can be deleted
  └─ Deletion cascades to expense entries

✓ Cost calculation immutability
  └─ Once approved, cost cannot change
  └─ Re-submission creates new expense entry (old one archived)
```

### 9.2 Audit Trail

```
Track all changes:
├─ Field: [old_value] → [new_value]
├─ Changed by: [user_id]
├─ Changed at: [timestamp]
├─ Reason: [if status change]
└─ Approval info: [approver, timestamp, comment]

Examples:
- "hours: 8.0 → 7.5 (by John at 2025-02-15 10:30)"
- "status: draft → submitted (by John at 2025-02-15 15:00)"
- "status: submitted → approved (by Manager at 2025-02-16 09:00) - OK"
- "status: approved → rejected (by Admin at 2025-02-16 14:00) - Billing error"
```

---

## 9.3 Duplicate Detection & Parallel Work Handling

### ✅ Duplicate Entry Detection (เช็คการซ้ำ)

**What is "Duplicate"?**

```
Type A: EXACT DUPLICATE (ห้ามปล่อย)
└─ Same user + same date + same time range + same project
   Example:
   Entry 1: John | Feb 15 | 09:00-17:00 | Project-A
   Entry 2: John | Feb 15 | 09:00-17:00 | Project-A
   ❌ BLOCK: "บันทึกนี้มีอยู่แล้วในวันเดียวกัน"

Type B: OVERLAPPING TIME (ตรวจเช็ค)
└─ Same user + overlapping times (but different project or category)
   Example:
   Entry 1: John | Feb 15 | 09:00-12:00 | Project-A (project)
   Entry 2: John | Feb 15 | 11:00-13:00 | Project-B (project)
   ⚠️  WARN: "เวลาทำงานซ้ำกัน 1 ชั่วโมง"
   
   But ALLOW if:
   ├─ Entry 1: Project Work
   └─ Entry 2: Non-Project Work (meeting, training) = CAN COEXIST
   
Type C: ADJACENT ENTRIES (Allow)
└─ Same user + consecutive times
   Example:
   Entry 1: John | Feb 15 | 09:00-12:00 | Project-A
   Entry 2: John | Feb 15 | 12:00-17:00 | Project-B
   ✓ ALLOW: Back-to-back entries are normal

Type D: SAME TIME, DIFFERENT PROJECTS (Allow with Flag)
└─ User working on 2-3 parallel projects simultaneously
   Example:
   Entry 1: John | Feb 15 | 14:00-17:00 | Project-A | 3h
   Entry 2: John | Feb 15 | 14:00-17:00 | Project-B | 3h
   Entry 3: John | Feb 15 | 14:00-17:00 | Project-C | 3h
   
   ⚠️  WARN: "3 งานขนานพร้อมกัน (9 ชั่วโมง > 8 ชั่วโมง/วัน)"
   ✓ ALLOW BUT FLAG AS: "Concurrent Work"
```

### 🔧 Duplicate Detection Implementation

**Database Query Pattern**:

```typescript
// Check for exact duplicate
const exactDuplicate = await prisma.time_entries.findFirst({
  where: {
    userId,
    date: entry.date,
    startTime: entry.startTime,
    endTime: entry.endTime,
    projectId: entry.projectId,
    status: { in: ['draft', 'submitted', 'approved'] }
  }
});

if (exactDuplicate) {
  throw new Error('Duplicate entry detected');
}

// Check for time overlap (same user, same date, overlapping times)
const timeOverlap = await prisma.time_entries.findFirst({
  where: {
    userId,
    date: entry.date,
    status: { in: ['draft', 'submitted', 'approved'] },
    AND: [
      { startTime: { lt: entry.endTime } },      // Overlap check
      { endTime: { gt: entry.startTime } }       // Overlap check
    ]
  }
});

// Check for parallel work (concurrent multiple projects)
const concurrentCount = await prisma.time_entries.findMany({
  where: {
    userId,
    date: entry.date,
    startTime: { lt: entry.endTime },
    endTime: { gt: entry.startTime },
    status: { in: ['draft', 'submitted', 'approved'] }
  }
});

if (concurrentCount.length >= 3) {
  // 3+ concurrent entries = parallel work flag
}
```

### 📊 Business Rules for Duplicates

**BLOCK (ไม่ยอม)**:
```
1. Exact Duplicate
   └─ Same user, date, time, project
   
2. Leave Conflict (Hard Block)
   └─ Date falls within leave request (approved/submitted)
   └─ Cannot add work on leave day
   
3. Same Project, Overlapping Times
   └─ Cannot work same project at same time twice
```

**WARN (แจ้งเตือนแต่ให้บันทึกได้)**:
```
1. Overlapping Work (Different Projects)
   └─ Project-A: 09:00-12:00 + Project-B: 11:00-13:00
   └─ Show warning: "เวลาทำงานซ้ำกัน 1 ชั่วโมง"
   └─ Allow with checkbox: "ฉันกำลังทำงานแบบขนาน"
   
2. Parallel Work Detection (3+ concurrent)
   └─ 3 tasks same time = Flag as "concurrent"
   └─ Show warning: "บันทึก 3 งานพร้อมกัน (9 ชั่วโมง)"
   └─ Require approval comment: "เหตุผลการทำงานขนาน"
   
3. Exceeds 24h per Day
   └─ Warn if daily total > 24 hours
   └─ Example: 3 parallel 8-hour tasks = 24h (red flag)
```

**ALLOW (ให้บันทึกได้ตามปกติ)**:
```
1. Consecutive Entries (Back-to-back)
   └─ 09:00-12:00 + 12:00-17:00 = No overlap
   
2. Adjacent with Gap
   └─ 09:00-11:50 + 12:00-17:00 = 10-min break (normal)
   
3. Different Entry Types
   └─ Project (09:00-17:00) + Meeting (14:00-15:00)
   └─ Can coexist (meeting during project time)
   └─ Meeting "interrupts" project work
   
4. Parallel Work (Controlled)
   └─ 2-3 parallel tasks WITH comment/reason
   └─ Show "Concurrent Work" badge in UI
   └─ Track for manager review
```

---

### 💼 Parallel Work Handling (ทำงานแบบขนาน)

**Scenario 1: Developer Switches Between Projects**
```
Time     │ Project-A │ Project-B │ Meeting
─────────┼───────────┼───────────┼────────
09:00    │ Start     │           │
12:00    │ End       │           │
12:00    │           │ Start     │
14:00    │           │ ❌ PAUSE  │ Start (Meeting)
15:00    │           │ ▶️ RESUME │
17:00    │           │ End       │
─────────┴───────────┴───────────┴────────
Total: 3h (A) + 3h (B) + 1h (Meeting) = 7h ✓ Normal
```
✓ **ALLOW**: Sequential work (no time overlap)

---

**Scenario 2: Concurrent Project + Meeting**
```
Project-A:  09:00-17:00 = 8h
├─ Interrupted by meeting 14:00-15:00
├─ Net Project: 7h + 1h Meeting
└─ Total: 8h ✓
```

**Options for Recording**:

**Option A: Two Separate Entries (ขอแนะนำ)**
```
Entry 1: Project-A | 09:00-14:00 | 5h
Entry 2: Meeting   | 14:00-15:00 | 1h  [Non-Project]
Entry 3: Project-A | 15:00-17:00 | 2h
─────────────────────────────────────
Total Project-A: 7h
Total Meeting: 1h
```
✓ Clear, accurate, trackable

**Option B: Single Entry with Break Duration** (✓ Better)
```
Entry: Project-A | 09:00-17:00 | 8h
       breakDuration: 60 minutes (during meeting)
       description: "Team sync meeting 14:00-15:00"
─────────────────────────────────────
Calculated hours: 8h - 1h = 7h ✓
```
✓ Simpler, single record, still accurate

---

**Scenario 3: True Parallel Work (2 Projects Simultaneously)**
```
Project-A:  14:00-17:00 = 3h
Project-B:  14:00-17:00 = 3h  (same time!)
Total logged: 6h (parallel)

⚠️ Question: How to record?
```

**Option 1: BLOCK (Strict Policy)**
```
❌ Do NOT allow overlapping project work
Rule: "ต้องทำงานโครงการแยกเวลากัน ห้ามทำพร้อมกัน"
└─ Time management discipline
└─ Clear cost allocation
└─ Simpler for billing
```

**Option 2: ALLOW with Concurrent Flag (Flexible Policy)**
```
✓ Allow parallel work with warnings
Entry 1: Project-A | 14:00-17:00 | 3h | concurrent: true
Entry 2: Project-B | 14:00-17:00 | 3h | concurrent: true
└─ Flag: "Concurrent work detected"
└─ Manager review required before approval
└─ Cost: 6h split across 2 projects (3h each)
└─ Report: Show as "Overlapping hours" in summary
```

**Option 3: HYBRID (Recommended)**
```
✓ Allow max 2 projects in parallel, require comment
✗ Block 3+ projects at same time
✗ Block Project + Leave at same time (hard block)

Rules:
├─ 1 project alone: Always allowed
├─ 1 project + 1 non-project: Allowed (meeting interrupts)
├─ 2 projects parallel: Allowed with comment
│  └─ Example: "Code review on A, bug fix on B"
└─ 3+ projects: BLOCK
   └─ Error: "ไม่สามารถทำ 3 งานพร้อมกัน"
```

---

### 🎯 Recommended Implementation

**ADD: New Field in time_entries Schema**
```typescript
model time_entries {
  // ... existing fields ...
  
  // NEW: Parallel Work Fields
  isConcurrent         Boolean   @default(false)  // True if overlaps other entry
  concurrentEntryIds   String[]  @default([])     // IDs of overlapping entries
  concurrentReason     String?                    // Why doing parallel work
  
  // ... rest ...
}
```

**Validation Logic**:
```typescript
async function validateTimeEntry(data) {
  // 1. Check exact duplicate
  const exactDuplicate = await checkExactDuplicate(data);
  if (exactDuplicate) throw new Error('EXACT_DUPLICATE');
  
  // 2. Check leave conflict (HARD BLOCK)
  const leaveConflict = await checkLeaveConflict(data);
  if (leaveConflict) throw new Error('LEAVE_CONFLICT');
  
  // 3. Check time overlap with other entries
  const overlappingEntries = await findOverlappingEntries(data);
  
  if (overlappingEntries.length > 0) {
    // 4. Determine overlap type
    const overlapType = analyzeOverlap(data, overlappingEntries);
    
    switch (overlapType) {
      case 'PROJECT_OVERLAP':
        // 2+ projects same time
        if (overlappingEntries.length >= 2) {
          throw new Error('TOO_MANY_PARALLEL_PROJECTS');
        }
        // 1 overlap allowed with warning
        return {
          valid: true,
          warnings: [`Found overlapping entry: ${overlappingEntries[0].name}`],
          requiresComment: true,
          isConcurrent: true
        };
        
      case 'PROJECT_NONPROJECT_MIX':
        // Project + Non-project (meeting) = normal
        return {
          valid: true,
          warnings: [],
          isConcurrent: false
        };
        
      case 'NONPROJECT_NONPROJECT':
        // Non-project + non-project (2 meetings)
        return {
          valid: true,
          warnings: ['Overlapping non-project activities'],
          isConcurrent: true
        };
    }
  }
  
  // 5. Check daily total
  const dailyTotal = await calculateDailyTotal(data);
  if (dailyTotal > 24) {
    return {
      valid: false,
      error: 'EXCEEDS_24_HOURS',
      message: `วันนี้บันทึก ${dailyTotal} ชั่วโมง (>24h)`
    };
  }
  
  return { valid: true, warnings: [] };
}
```

---

### 📋 UI: Duplicate/Parallel Detection

**When Creating Entry**:

```
┌─────────────────────────────────────────┐
│ 📋 บันทึกเวลาทำงาน                       │
│                                          │
│ Date: Feb 15, 2025                      │
│ Project: Project-A                      │
│ Time: 14:00 - 17:00                     │
│                                          │
│ ⚠️ WARNING:                              │
│ ├─ Found overlapping entry              │
│ │  └─ Project-B | 14:00-17:00 (3h)    │
│ │                                        │
│ ├─ You're creating parallel work        │
│ │  └─ Total concurrent: 6h              │
│ │                                        │
│ └─ ☐ ฉันรู้ว่ากำลังทำ 2 งานพร้อมกัน   │
│    └─ Reason (required): [________________]
│       └─ "Code review on A, fixing bug on B"
│                                          │
│ [Cancel] [Save]                          │
└─────────────────────────────────────────┘
```

**In Monthly View Grid**:

```
Date │ Project    │ Time        │ Hours │ Badge         │ Status
─────┼────────────┼─────────────┼───────┼───────────────┼────────
Feb15│ Project-A  │ 14:00-17:00 │ 3h    │ 🔗 Concurrent │ Draft
     │ Project-B  │ 14:00-17:00 │ 3h    │ 🔗 Concurrent │ Draft
     │ Meeting    │ 14:00-15:00 │ 1h    │ (no badge)    │ Draft
```

**Badge Color**:
- 🔗 Blue: Concurrent (parallel projects) - needs review
- ⚠️ Yellow: Overlapping non-project - informational
- 🟢 Green: Normal adjacent entries

---

### ✅ Final Recommendation

**Best Practice for Timesheet**:

```
┌─────────────────────────────────────────────────────┐
│ RULE 1: PREVENT EXACT DUPLICATES                    │
│ └─ Same user + date + time + project = BLOCK       │
│                                                      │
│ RULE 2: BLOCK LEAVE CONFLICTS                       │
│ └─ Cannot work on leave days                        │
│                                                      │
│ RULE 3: WARN OVERLAPPING WORK                       │
│ └─ Show overlapping entry                           │
│ └─ Require confirmation checkbox                    │
│                                                      │
│ RULE 4: FLAG CONCURRENT PROJECTS                    │
│ └─ 2 projects same time: Flag, allow with reason   │
│ └─ 3+ projects: BLOCK                              │
│                                                      │
│ RULE 5: ALLOW PROJECT + NON-PROJECT MIX             │
│ └─ Meeting during project time = normal             │
│ └─ Use break duration OR create separate entry      │
│                                                      │
│ RULE 6: LIMIT DAILY TOTAL                           │
│ └─ Block if daily total > 24 hours                  │
│ └─ Warn if > 12 hours                              │
└─────────────────────────────────────────────────────┘
```

**Flow Chart**:
```
User creates entry
    │
    ├─→ Exact duplicate? ─→ YES → BLOCK (ห้ามปล่อย)
    │
    ├─→ Leave conflict? ─→ YES → BLOCK (ห้ามปล่อย)
    │
    ├─→ Overlapping entry? 
    │   ├─ NO → Continue ✓
    │   │
    │   └─ YES:
    │       ├─→ Leave overlap? → BLOCK
    │       │
    │       ├─→ Same project? → BLOCK
    │       │
    │       ├─→ 3+ concurrent? → BLOCK
    │       │
    │       └─→ 2 projects? → WARN + require comment
    │           ├─→ Require: concurrentReason
    │           └─→ Flag: isConcurrent=true
    │
    ├─→ Daily total > 24h? → BLOCK
    │
    └─→ Save entry ✓
```


---

## 10. Implementation Summary: Option 3 (Hybrid Approach)

### ✅ Implemented Components

#### 1. Database Schema Changes ✓
**File**: `prisma/schema.prisma` (lines 469-505)
**Added Fields**:
```typescript
- isConcurrent: Boolean          // Flag concurrent work
- concurrentEntryIds: String[]   // Array of related entry IDs
- concurrentReason: String?      // Why working in parallel
- breakDuration: Int             // Minutes (default: 60)
- chargeable: Boolean            // Cost deduction flag
- chargeAmount: Decimal?         // Cost amount
- billableHours: Decimal?        // Billable hours separate from total
```

**Indexes**:
- `idx_time_entries_user_date_status` - For quick overlap detection
- `idx_time_entries_concurrent` - For querying concurrent entries

**Migration**: `prisma/migrations/20260216_add_concurrent_work_fields/migration.sql`

#### 2. Duplicate Detection Service ✓
**File**: `backend/src/features/timesheet/timesheet.duplicate-detection.ts`

**Core Functions**:
- `detectDuplicateOrParallelWork()` - Main validation logic
- `checkLeaveConflict()` - Block work on leave days
- `findOverlappingEntries()` - Query overlapping time entries
- `analyzeOverlapAndDecide()` - Apply Option 3 rules
- `updateConcurrentRelationships()` - Link concurrent entries
- `checkDailyTotalHours()` - Prevent >24h per day
- `formatConcurrentWarning()` - Format UI messages

**Option 3 Rules**:
```
1. Allow: 1 project alone ✓
2. Allow: 1 project + 1 non-project (meeting) ✓
3. Allow: 2 projects parallel WITH REASON ✓
4. Block: 3+ projects at same time ❌
5. Block: All work on leave days ❌
6. Block: Exact duplicates ❌
7. Block: Same project, overlapping times ❌
```

#### 3. TimesheetService Integration ✓
**File**: `backend/src/features/timesheet/TimesheetService.ts`

**Updated `createTimeEntry()` method**:
- Calls `detectDuplicateOrParallelWork()` before creating entry
- Validates concurrent reason if parallel work detected
- Checks daily total (max 24 hours)
- Stores concurrent metadata in database
- Updates related entries with backlinks

**Error Handling**:
- `EXACT_DUPLICATE` - Same user, date, time, project
- `SAME_PROJECT_OVERLAP` - Same project, overlapping times
- `TOO_MANY_PARALLEL_PROJECTS` - 3+ concurrent projects
- `LEAVE_CONFLICT` - Work on leave day
- `CONCURRENT_REASON_REQUIRED` - Missing reason for parallel work
- `EXCEEDS_DAILY_LIMIT` - >24 hours per day

#### 4. Frontend Modal Component ✓
**File**: `next-app/app/timesheet/components/TimesheetModal.tsx`

**New State Management**:
- `concurrentWarnings[rowIndex]` - Warning for each row
- `concurrentReasons[rowIndex]` - User-entered reason for parallel work
- `confirmedConcurrent` - Set of confirmed parallel entries

**Features**:
- Real-time concurrent work detection via `checkParallelWork()`
- Visual warning boxes (yellow for required action, blue for info)
- Shows overlapping entries with time overlap calculation
- Required reason field for 2-project parallel work
- Confirmation checkbox: "I know I'm working on 2 tasks simultaneously"
- Validation before save: blocks submission if reason missing

**UI Elements**:
- `AlertTriangle` icon for warnings
- Yellow border-left for critical warnings
- Details of overlapping entries
- Reason input field (required for concurrent)
- Confirmation checkbox with count of concurrent tasks

#### 5. Backend API Endpoint ✓
**File**: `next-app/app/api/timesheet/check-concurrent/route.ts`

**Request**:
```json
POST /api/timesheet/check-concurrent
{
  "date": "2025-02-15",
  "startTime": "14:00",
  "endTime": "17:00",
  "projectId": "proj-123"
}
```

**Response (Concurrent)**:
```json
{
  "valid": true,
  "isConcurrent": true,
  "requiresComment": true,
  "warnings": [
    "พบการทำงานขนาน: Project-B | 14:00-17:00 (ซ้อนกัน 3h)",
    "โปรดอธิบายเหตุผลการทำงานขนาน"
  ],
  "overlappingEntries": [
    {
      "id": "entry-456",
      "projectName": "Project-B",
      "startTime": "14:00",
      "endTime": "17:00",
      "hours": 3,
      "overlapMinutes": 180
    }
  ]
}
```

**Response (No Issues)**:
```json
{
  "valid": true,
  "isConcurrent": false,
  "requiresComment": false,
  "warnings": []
}
```

#### 6. Concurrent Work Controller ✓
**File**: `backend/src/features/timesheet/timesheet.concurrent.controller.ts`

**POST /api/timesheet/check-concurrent**
- Authenticates user
- Validates required fields
- Calls duplicate detection service
- Returns structured warnings and overlap details

### Validation Flow

```
User fills: Date, Project, Time Range
            ↓
Click "End Time" field → checkParallelWork() triggered
            ↓
POST /api/timesheet/check-concurrent
            ↓
detectDuplicateOrParallelWork() backend
            ↓
Check leave conflict? → HARD BLOCK
            ↓
Find overlapping entries
            ↓
No overlaps? → Show nothing ✓
            ↓
Overlapping found → analyzeOverlapAndDecide()
            ├─ Exact duplicate? → BLOCK ❌
            ├─ Same project? → BLOCK ❌
            ├─ 3+ projects? → BLOCK ❌
            ├─ Leave conflict? → BLOCK ❌
            ├─ 2 projects? → WARN, require reason ⚠️
            ├─ Project + non-project? → ALLOW ✓
            └─ Return: { isConcurrent, requiresComment, warnings, overlappingEntries }
            ↓
Display warning box (if applicable)
            ├─ Show overlapping entries
            ├─ Reason input field (if concurrent)
            └─ Confirmation checkbox (if concurrent)
            ↓
User clicks "Save"
            ├─ Validate all reasons filled? → If not, block save
            ├─ All concurrent items confirmed? → If not, block save
            └─ CREATE time entry with concurrent metadata
```

---

## 11. Testing Scenarios

### Scenario 1: No Conflicts (Sequential Work)
```
Entry 1: Project-A | 09:00-12:00
Entry 2: Project-B | 12:00-17:00
Result: ✓ ALLOW (no overlap, back-to-back)
```

### Scenario 2: Project + Meeting (Allowed)
```
Entry 1: Project-A | 09:00-17:00
Entry 2: Meeting   | 14:00-15:00 (non-project)
Result: ✓ ALLOW (meeting interrupts project work)
```

### Scenario 3: Two Parallel Projects (With Reason)
```
Entry 1: Project-A | 14:00-17:00 | 3h
Entry 2: Project-B | 14:00-17:00 | 3h
Reason: "Code review on A, bug fix on B"
Result: ⚠️ WARN + REQUIRE REASON ✓
```

### Scenario 4: Three Parallel Projects (Blocked)
```
Entry 1: Project-A | 14:00-17:00 | 3h
Entry 2: Project-B | 14:00-17:00 | 3h
Entry 3: Project-C | 14:00-17:00 | 3h
Result: ❌ BLOCK "ไม่สามารถทำ 3 งานขนานพร้อมกัน"
```

### Scenario 5: Exact Duplicate (Blocked)
```
Entry 1: Project-A | 09:00-17:00
Entry 2: Project-A | 09:00-17:00 (same everything)
Result: ❌ BLOCK "บันทึกนี้มีอยู่แล้ว"
```

### Scenario 6: Work on Leave Day (Blocked)
```
Leave Request: Annual Leave Feb 15-16 (approved)
Entry: Feb 15 | 09:00-17:00 | Any Project
Result: ❌ BLOCK "ไม่สามารถบันทึกเวลาทำงานในวันลา"
```

### Scenario 7: Exceeds 24 Hours (Blocked)
```
Total daily entries: 25 hours
Result: ❌ BLOCK "วันนี้บันทึก 25 ชั่วโมง (>24h)"
```

---

## 12. Implementation Priority & Phases

### Phase 1: Core Data Model (Week 1)
- [ ] Database schema updates (3 entry types)
- [ ] API endpoints (CRUD for all types)
- [ ] Validation rules implementation
- [ ] Cost tracking integration

### Phase 2: UI Components (Week 2)
- [ ] Modal variants (3 types)
- [ ] Entry type selector
- [ ] Form validation UI
- [ ] Status indicators

### Phase 3: Tabs & Views (Week 3)
- [ ] Monthly view grid
- [ ] Summary cards & charts
- [ ] Activity log
- [ ] Leave balance display

### Phase 4: Workflows (Week 4)
- [ ] Submission flow
- [ ] Manager approval interface
- [ ] Status transitions
- [ ] Cost impact visualization

### Phase 5: Polish & Reports (Week 5)
- [ ] Reporting endpoints
- [ ] Budget integration
- [ ] Audit trail
- [ ] Performance optimization
- [ ] Testing & QA

---

## 11. Success Criteria

✓ All 3 work types can be recorded with proper validation
✓ Cost tracking integrates with project budget
✓ Leave balance prevents over-allocation
✓ Monthly submission locks entries for editing
✓ Manager approval workflow functions correctly
✓ Reports show complete cost impact
✓ Audit trail captures all changes
✓ No overlapping time entries (hard constraint)
✓ Performance: Load timesheet page in <2s (160 entries)
✓ Mobile responsive design

---

## 12. Questions for Approval Before Implementation

1. **Cost Tracking**: Should non-billable project work also track cost for reporting, or strictly for billable entries?
2. **Leave Override**: Can HR/Admin add leave entries for users without user request (override)?
3. **Half-Day Leave**: Should system support 4-hour half-days, or only full 8-hour days?
4. **Non-Project Categories**: Are the 4 categories (Meeting/Training/Seminar/Other) correct, or add more?
5. **Overlapping Rules**: Allow overlapping times between project and non-project work, or strict no-overlap?
6. **Approval Levels**: Single manager approval or multi-level (manager → director → admin)?
7. **Budget Threshold**: What % of project budget should trigger warning (80%? 90%?)?
8. **Historical Edits**: Can users edit timesheets >1 month old? Or admin-only?
9. **Cost Calculation Rate**: Use task-level rate, project-level rate, or user-level rate as fallback?
10. **Report Distribution**: Should monthly cost summary auto-email to project managers?

---

**Status**: 🟡 **Pending Approval** - Ready for design review before implementation
**Created**: Feb 16, 2025
**Prepared for**: [User Name]
