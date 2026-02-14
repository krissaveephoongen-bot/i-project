# Timesheet System Enhancement - Detailed Design

**Version:** 1.0  
**Status:** Design Phase  
**Target Timeline:** 5-6 weeks  

---

## 🎯 Overview

Enhanced timesheet system with:
- Timer/stopwatch functionality
- Time picker (start/end times)
- Work type classification
- Leave management
- Billable hours tracking
- Enhanced approvals workflow
- Reports & analytics

---

## 📐 Data Model (Enhanced)

### Time Entry Schema

```typescript
interface TimeEntry {
  // Identity
  id: string;
  userId: string;
  
  // Work Details
  projectId?: string;          // For project work
  taskId?: string;
  workType: WorkType;          // project | office | training | leave | ot
  
  // Time Tracking
  date: string;                // YYYY-MM-DD
  startTime?: string;          // HH:MM (24-hour)
  endTime?: string;            // HH:MM (24-hour)
  breakMinutes?: number;       // Default: 0
  hours: number;               // Calculated or manual
  
  // Work Classification
  isBillable: boolean;
  billableRate?: number;       // Amount per hour
  billableAmount?: number;     // hours * rate
  
  // Details
  description?: string;
  notes?: string;
  
  // Status & Approval
  status: EntryStatus;         // draft | submitted | approved | rejected
  approvedBy?: string;         // Manager ID
  approvedAt?: string;
  rejectionReason?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

type WorkType = 'project' | 'office' | 'training' | 'leave' | 'ot';

type EntryStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

interface LeaveAllocation {
  userId: string;
  year: number;
  vacation: number;            // days
  sick: number;                // days
  other: number;               // days
  used: number;
  remaining: number;
}

interface WorkTypeConfig {
  id: string;
  name: string;                // "Project Work", "Training", etc.
  description: string;
  isBillable: boolean;
  requiresProject: boolean;    // Some work types need project
  color: string;               // For UI
  icon: string;                // Lucide icon name
}
```

### Database Migration

```sql
-- Enhance time_entries table
ALTER TABLE time_entries ADD COLUMN (
  start_time TIME,
  end_time TIME,
  break_minutes INT DEFAULT 0,
  work_type VARCHAR(50) DEFAULT 'project',
  is_billable BOOLEAN DEFAULT true,
  billable_rate DECIMAL(10,2),
  billable_amount DECIMAL(12,2),
  notes TEXT,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  rejection_reason TEXT,
  status VARCHAR(50) DEFAULT 'draft'
);

-- Create work types table
CREATE TABLE work_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_billable BOOLEAN DEFAULT false,
  requires_project BOOLEAN DEFAULT false,
  color VARCHAR(10),
  icon VARCHAR(50),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create leave allocations table
CREATE TABLE leave_allocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  year INT,
  vacation_days INT,
  sick_days INT,
  other_days INT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, year)
);

-- Create approval comments table
CREATE TABLE approval_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_id UUID REFERENCES time_entries(id) ON DELETE CASCADE,
  approver_id UUID REFERENCES users(id),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🎨 UI Components Design

### 1. Enhanced TimesheetModal

```typescript
interface TimesheetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  entry?: TimeEntry;           // For editing
  onSave: (entry: TimeEntry) => void;
}

// Layout
┌─────────────────────────────────────┐
│ Edit Time Entry                     │
│ Monday, February 17, 2026           │
├─────────────────────────────────────┤
│                                     │
│ Work Type    [Project ▼]            │
│                                     │
│ Project      [My Project ▼]         │
│ Task         [Feature Dev ▼]        │
│                                     │
│ Time Entry                          │
│ ┌─────────────┬────────────────┐   │
│ │ Start 09:00 │ End 17:00      │   │
│ └─────────────┴────────────────┘   │
│ Break: 60 minutes                   │
│                                     │
│ Hours: 8.0 hours  [Calculate]       │
│                                     │
│ [ ] Billable  Rate: $50/hr          │
│ Billable: $400.00                   │
│                                     │
│ Description                         │
│ ┌──────────────────────────────┐   │
│ │ Feature implementation...     │   │
│ └──────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│ [Cancel]              [Save] [X]    │
└─────────────────────────────────────┘
```

### 2. Timer Component

```typescript
interface TimerProps {
  projectId?: string;
  onSave: (hours: number, startTime: string, endTime: string) => void;
}

// UI
┌──────────────────────────────────┐
│  Project: My Project [↔]         │
│  Task: Feature Dev [↔]           │
├──────────────────────────────────┤
│                                  │
│        09:45:30                  │
│                                  │
│     [⏸ Pause]  [⏹ Stop]         │
│     [🔔 Notify at 8h]            │
│                                  │
├──────────────────────────────────┤
│ [Clear]           [Save & New]   │
└──────────────────────────────────┘
```

### 3. Floating Timer Widget

```typescript
// Minimized (collapsed)
┌─────────────────────┐
│ ⏱ 01:23:45 [▲]      │  ← Always visible
└─────────────────────┘    at bottom right

// Expanded
┌─────────────────────┐
│ My Project          │
│ Feature Dev         │
├─────────────────────┤
│  01:23:45           │
│                     │
│  [⏸]  [⏹]  [▼]     │
└─────────────────────┘
```

### 4. Work Type Selector

```typescript
// In main form - radio buttons or tabs

○ Project Work     (billable, requires project)
○ Office Work      (non-billable, no project)
○ Training/PD      (billable/non-billable)
○ Leave Request    (uses allocation)
○ Overtime         (time-and-a-half)
```

### 5. Leave Request Form

```typescript
interface LeaveRequest {
  startDate: string;
  endDate: string;
  leaveType: 'vacation' | 'sick' | 'other';
  reason?: string;
}

// UI
┌───────────────────────────┐
│ Request Leave             │
├───────────────────────────┤
│                           │
│ Leave Type                │
│ ○ Vacation  ○ Sick  ○ Other
│                           │
│ From: [17 Feb 2026] [↔]   │
│ To:   [20 Feb 2026] [↔]   │
│ Days: 4 days              │
│                           │
│ Available: 16 days        │
│ After: 12 days            │
│                           │
│ Reason                    │
│ ┌─────────────────────┐   │
│ │ Personal matters... │   │
│ └─────────────────────┘   │
│                           │
├───────────────────────────┤
│ [Cancel]      [Submit]    │
└───────────────────────────┘
```

### 6. Enhanced Approval View (for Managers)

```typescript
// Approval List
┌──────────────────────────────────────────┐
│ Pending Approvals (3)                    │
├──────────────────────────────────────────┤
│                                          │
│ John Doe - Feb 15, 2026                  │
│ Total: 40 hours (38 billable)            │
│ Status: Submitted                        │
│ [View Details] [Approve] [More ▼]       │
│                                          │
│ Jane Smith - Feb 8-14, 2026              │
│ Total: 42 hours (40 billable)            │
│ Status: Needs Review                     │
│ [View Details] [Approve] [More ▼]       │
│                                          │
│ Bob Johnson - Feb 1-7, 2026              │
│ Total: 39 hours (37 billable)            │
│ Status: Submitted                        │
│ [View Details] [Approve] [More ▼]       │
│                                          │
└──────────────────────────────────────────┘

// Approval Detail
┌────────────────────────────────────┐
│ John Doe - Timesheet Approval      │
│ Period: Feb 15, 2026               │
├────────────────────────────────────┤
│                                    │
│ Daily Summary:                     │
│ ┌────────────────────────────────┐│
│ │ Mon 15: 8.0h (8.0 billable)    ││
│ │ Tue 16: 0.0h                   ││
│ │ Wed 17: 8.0h (8.0 billable)    ││
│ │ ...                            ││
│ └────────────────────────────────┘│
│                                    │
│ Comments from Employee:            │
│ ┌────────────────────────────────┐│
│ │ "Feature dev completed"        ││
│ └────────────────────────────────┘│
│                                    │
│ Your Notes:                        │
│ ┌────────────────────────────────┐│
│ │ [Add approval comments...]     ││
│ └────────────────────────────────┘│
│                                    │
├────────────────────────────────────┤
│ [Reject]      [Approve]            │
└────────────────────────────────────┘
```

### 7. Reports Page

```typescript
// Monthly Summary
┌──────────────────────────────────────┐
│ My Timesheet - February 2026         │
├──────────────────────────────────────┤
│                                      │
│ Total Hours: 160h  |  Billable: 150h │
│ Billable Amount: $7,500              │
│ Status: Approved                     │
│                                      │
│ By Project:                          │
│ ┌────────────────────────────────┐   │
│ │ Project A     80h   (50%)       │   │
│ │ Project B     60h   (37%)       │   │
│ │ Internal      20h   (13%)       │   │
│ └────────────────────────────────┘   │
│                                      │
│ By Work Type:                        │
│ ┌────────────────────────────────┐   │
│ │ Project Work   150h (94%)       │   │
│ │ Training       10h  (6%)        │   │
│ └────────────────────────────────┘   │
│                                      │
│ [Export PDF] [Export Excel]          │
│                                      │
└──────────────────────────────────────┘
```

---

## 🔄 User Workflows

### Workflow 1: Daily Time Entry (with Timer)

```
START
  ↓
User opens timesheet app
  ↓
Sees floating timer widget
  ↓
Clicks "Start" → Timer starts
  ↓
Works for 2 hours
  ↓
Timer shows 02:00:00
  ↓
User clicks "Stop"
  ↓
Modal opens with:
  - Project: [from timer]
  - Start: 09:00
  - End: 11:00
  - Break: 0 min
  - Hours: 2.0 (calculated)
  ↓
User confirms → Entry saved
  ↓
END
```

### Workflow 2: Manual Entry with Time Picker

```
START
  ↓
User clicks on day in calendar
  ↓
Modal opens with:
  - Empty fields
  - Current date
  ↓
User selects:
  - Work Type: Project
  - Project: My Project
  - Task: Feature Dev
  - Start: [picker] 09:00
  - End: [picker] 17:00
  - Break: 60 minutes
  - Hours: 8.0 (auto-calculated)
  ↓
User adds description
  ↓
Clicks Save → Entry saved
  ↓
END
```

### Workflow 3: Leave Request

```
START
  ↓
User in timesheet app
  ↓
Clicks "Request Leave"
  ↓
Form opens:
  - Leave Type: Vacation
  - From: Feb 17
  - To: Feb 21
  - Days: 5
  - Shows available: 20 days
  ↓
User adds reason
  ↓
Clicks Submit → Sent for approval
  ↓
Manager sees in approval queue
  ↓
Manager approves → Leave blocked on calendar
  ↓
END
```

### Workflow 4: Submission & Approval

```
User:
  Monthly entries complete
  ↓
  Clicks "Submit for Approval"
  ↓
  Confirms: "Submit Feb timesheet?"
  ↓
  Status → "Submitted"
  ↓
  Notification to manager

Manager:
  Gets notification: "John's timesheet pending"
  ↓
  Opens Approvals page
  ↓
  Reviews John's entries (40 hours)
  ↓
  Adds comment: "Looks good"
  ↓
  Clicks "Approve"
  ↓
  Status → "Approved"
  ↓
  John gets notification: "Approved"
```

---

## 🔌 API Endpoints (Enhanced)

### Create/Update Entry
```
POST /api/timesheet/entries
PUT /api/timesheet/entries/:id

Body:
{
  "projectId": "proj-123",
  "taskId": "task-456",
  "workType": "project",
  "date": "2026-02-17",
  "startTime": "09:00",
  "endTime": "17:00",
  "breakMinutes": 60,
  "hours": 8.0,
  "isBillable": true,
  "billableRate": 50,
  "description": "Feature implementation"
}
```

### Get Work Types
```
GET /api/timesheet/work-types

Response:
[
  {
    "id": "wt-1",
    "name": "Project Work",
    "isBillable": true,
    "requiresProject": true,
    "color": "#3b82f6",
    "icon": "briefcase"
  },
  ...
]
```

### Leave Request
```
POST /api/timesheet/leave-requests

Body:
{
  "leaveType": "vacation",
  "startDate": "2026-02-17",
  "endDate": "2026-02-21",
  "reason": "Personal matters"
}
```

### Get Approval Queue
```
GET /api/timesheet/approvals?status=pending

Response:
[
  {
    "id": "entry-123",
    "userId": "user-456",
    "userName": "John Doe",
    "startDate": "2026-02-15",
    "endDate": "2026-02-15",
    "totalHours": 40,
    "totalBillable": 38,
    "status": "submitted",
    "submittedAt": "2026-02-16T10:00:00Z"
  }
]
```

### Approve Entry
```
POST /api/timesheet/entries/:id/approve

Body:
{
  "approved": true,
  "comment": "Looks good",
  "approverNotes": "On track"
}
```

---

## 🧪 Component Breakdown

### Phase 1 Components
```
├── TimesheetModal (enhanced)
│   ├── TimePickerInput (new)
│   ├── DurationDisplay (new)
│   └── BillableSection (new)
│
├── WorkTypeSelector (new)
│
└── MonthlyView (enhanced)
    └── Shows work types with colors
```

### Phase 2 Components
```
├── TimesheetTimer (new)
│   ├── TimerDisplay
│   ├── TimerControls
│   └── NotificationSettings
│
└── TimerWidget (new)
    ├── Minimized state
    └── Expanded state
```

### Phase 3 Components
```
├── LeaveRequestForm (new)
│   ├── DateRangeSelect
│   ├── LeaveTypeRadio
│   └── LeaveAllocationDisplay
│
└── LeaveCalendarView (new)
    └── Shows blocked days
```

### Phase 4 Components
```
├── ApprovalList (enhanced)
│   ├── ApprovalCard
│   └── FilterBar
│
├── ApprovalDetail (enhanced)
│   ├── EntryDetails
│   ├── CommentSection (new)
│   └── ApprovalActions
│
└── NotificationCenter (enhanced)
```

### Phase 5 Components
```
├── ReportPage (new)
│   ├── MonthlyReport
│   ├── ProjectReport
│   ├── BillableReport
│   └── TeamReport
│
├── ChartSection (new)
│   ├── BarChart (hours)
│   ├── PieChart (distribution)
│   └── TimelineChart
│
└── ExportDialog (new)
    ├── Format selector
    ├── Preview
    └── Send options
```

---

## 📊 State Management

### Using React Hooks/Context

```typescript
// useTimesheetStore.ts
interface TimesheetState {
  entries: TimeEntry[];
  selectedDate: Date;
  selectedProject: string;
  filterWorkType: WorkType | 'all';
  isLoading: boolean;
  error: Error | null;
}

interface TimerState {
  isRunning: boolean;
  elapsedSeconds: number;
  startTime: string;
  endTime?: string;
  project?: string;
  task?: string;
}

// useLeaveStore.ts
interface LeaveState {
  allocations: LeaveAllocation[];
  requests: LeaveRequest[];
  isLoading: boolean;
}

// useApprovalStore.ts
interface ApprovalState {
  pending: ApprovalItem[];
  approved: ApprovalItem[];
  rejected: ApprovalItem[];
  filter: {
    status: 'pending' | 'approved' | 'rejected' | 'all';
    userId?: string;
    dateRange?: [Date, Date];
  };
}
```

---

## 🎯 Validation Rules

### Time Entry
```
✓ startTime < endTime
✓ breakMinutes ≤ (hours * 60)
✓ hours > 0
✓ date ≤ today
✓ projectId required if workType = 'project'
✓ billableRate ≥ 0
```

### Leave Request
```
✓ startDate ≤ endDate
✓ leaveType is valid
✓ available days ≥ requested days
✓ startDate > today (or >= today)
```

### Approval
```
✓ Can't approve own entries
✓ Must have manager+ role
✓ Can't approve past submission deadline
```

---

## 🔐 Permissions

| Action | Employee | Manager | Admin |
|--------|----------|---------|-------|
| Create own entry | ✅ | ✅ | ✅ |
| Edit own entry | ✅ Draft | ✅ Submitted | ✅ All |
| View own entries | ✅ | ✅ | ✅ |
| View team entries | ❌ | ✅ | ✅ |
| Approve own | ❌ | ❌ | ✅ |
| Approve team | ❌ | ✅ | ✅ |
| View reports | ✅ Personal | ✅ Team | ✅ All |
| Export | ✅ | ✅ | ✅ |

---

## 🔄 Integration Points

### Existing Systems
- **Projects:** Link entries to projects
- **Users:** Filter by employee
- **Managers:** Approval routing
- **Notifications:** Status updates

### Future Integration
- **Billing:** Generate invoices from billable hours
- **Payroll:** Export hours for salary calculation
- **Calendar:** Block vacation days
- **CRM:** Link to client projects
- **Email:** Send reports/confirmations

---

## 📋 Testing Strategy

### Unit Tests
- Time calculation (start/end → hours)
- Break deduction
- Billable amount calculation
- Validation rules

### Integration Tests
- Create/update/delete entries
- Approval workflow
- Leave request processing
- Report generation

### E2E Tests
- Complete timesheet submission
- Approval as manager
- Timer functionality
- Leave request flow

---

## 🎬 Migration Plan

### Backward Compatibility
```
Phase 1: Deploy enhanced schema (with migration)
  - Add new columns
  - Default existing values
  - No data loss

Phase 2: Update UI (gradual rollout)
  - New modal with old data
  - Timer optional
  - Leave optional feature flag

Phase 3: Deprecate old workflow
  - Phase out weekly entries
  - Consolidate tables (if needed)
  - Archive old data

Phase 4: Optimize & clean up
  - Remove redundant columns
  - Archive historical data
  - Final migration
```

---

## ✅ Summary

**Enhanced Timesheet System with:**
- ✅ Timer/stopwatch
- ✅ Time pickers
- ✅ Work type classification
- ✅ Leave management
- ✅ Billable tracking
- ✅ Enhanced approvals
- ✅ Reports & export

**Timeline:** 5-6 weeks  
**Effort:** ~175 hours  
**Team:** 1 full-stack dev + 1 QA  

---

**Ready for:** Implementation Sprint Planning
