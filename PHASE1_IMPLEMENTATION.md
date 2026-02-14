# Phase 1: Timesheet Enhancement - Foundation
**Status:** Starting  
**Duration:** ~40 hours  
**Target:** Week 1

---

## 📊 Current State Assessment

### Database
✅ TimeEntry model exists
✅ WorkType enum exists (project, office, other)
✅ Status enum exists (todo, in_progress, in_review, done, pending)
⚠️ Missing fields: `start_time`, `end_time`, `break_duration`, `work_type_category`
⚠️ Missing models: `LeaveAllocation`, `LeaveRequest`, `TimeEntryComment`

### API
❌ No dedicated timesheet service
❌ No API routes for enhanced operations
❌ No leave management endpoints

### Frontend
✅ TimesheetModal exists
✅ Types defined in `next-app/app/timesheet/types.ts`
❌ No time picker components
❌ No timer functionality
❌ No leave request UI

---

## 🎯 Phase 1 Objectives

### 1. Enhance Database Schema
- [ ] Add missing fields to TimeEntry
- [ ] Create LeaveAllocation model
- [ ] Create LeaveRequest model
- [ ] Create TimeEntryComment model
- [ ] Add indexes for performance

### 2. Create/Update API
- [ ] Create timesheet service methods
- [ ] Add API routes for CRUD operations
- [ ] Add leave management endpoints
- [ ] Add validation logic
- [ ] Add error handling

### 3. Update Types
- [ ] Extend TimeEntry interface
- [ ] Create LeaveAllocation type
- [ ] Create LeaveRequest type
- [ ] Update response types

### 4. Backend Services
- [ ] TimeEntry CRUD service
- [ ] Leave management service
- [ ] Time calculation utilities
- [ ] Validation service

---

## 📝 Detailed Tasks

### Task 1: Database Migration (4 hours)

**1.1 Create migration file**
```bash
npx prisma migrate dev --name enhance_time_entries
```

**1.2 Schema updates needed**

In `prisma/schema.prisma`, update TimeEntry model:
```prisma
model TimeEntry {
  id                  String      @id @default(cuid())
  date                DateTime
  startTime           String      // HH:mm format
  endTime             String?     // HH:mm format  
  breakDuration       Int         @default(60) // minutes
  workType            WorkType    // project, office, training, leave, overtime
  projectId           String?
  taskId              String?
  userId              String
  hours               Decimal     @db.Decimal(5, 2)
  billableHours       Decimal?    @db.Decimal(5, 2)
  description         String?
  status              Status      @default(pending)
  approvedBy          String?
  approvedAt          DateTime?
  createdAt           DateTime    @default(now())
  updatedAt           DateTime    @updatedAt

  // Relations
  project             Project?    @relation(fields: [projectId], references: [id], onDelete: Cascade)
  task                Task?       @relation(fields: [taskId], references: [id], onDelete: SetNull)
  user                User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  approver            User?       @relation("TimeEntryApprover", fields: [approvedBy], references: [id])
  comments            TimeEntryComment[]

  @@map("time_entries")
  @@index([userId, date])
  @@index([status])
  @@index([projectId])
}

model LeaveAllocation {
  id                String      @id @default(cuid())
  userId            String
  year              Int
  annualLeaveHours  Decimal     @db.Decimal(8, 2)
  usedLeaveHours    Decimal     @db.Decimal(8, 2) @default(0)
  remainingHours    Decimal     @db.Decimal(8, 2)
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt

  // Relations
  user              User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  leaveRequests     LeaveRequest[]

  @@map("leave_allocations")
  @@unique([userId, year])
  @@index([userId])
}

model LeaveRequest {
  id                    String      @id @default(cuid())
  leaveAllocationId     String
  startDate             DateTime
  endDate               DateTime
  leaveType             LeaveType   // annual, sick, personal, maternity
  reason                String
  status                Status      @default(pending)
  approvedBy            String?
  approvedAt            DateTime?
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt

  // Relations
  leaveAllocation       LeaveAllocation @relation(fields: [leaveAllocationId], references: [id], onDelete: Cascade)
  approver              User?           @relation("LeaveRequestApprover", fields: [approvedBy], references: [id])

  @@map("leave_requests")
  @@index([leaveAllocationId])
  @@index([status])
}

model TimeEntryComment {
  id              String      @id @default(cuid())
  timeEntryId     String
  userId          String
  text            String
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  // Relations
  timeEntry       TimeEntry   @relation(fields: [timeEntryId], references: [id], onDelete: Cascade)
  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("time_entry_comments")
  @@index([timeEntryId])
}
```

**1.3 Enum updates needed**

Add new enums:
```prisma
enum LeaveType {
  annual
  sick
  personal
  maternity
  unpaid
}

enum WorkType {
  project      // billable project work
  office       // office/admin work
  training     // professional development
  leave        // approved leave
  overtime     // overtime work
  other        // other work
}
```

**1.4 Commands to run**
```bash
# Validate schema
npx prisma validate

# Create migration
npx prisma migrate dev --name enhance_timesheet_system

# Generate Prisma client
npx prisma generate
```

---

### Task 2: Backend API Routes (12 hours)

**2.1 Create timesheet service**

File: `backend/src/features/timesheet/timesheet.service.ts`

Key methods needed:
```typescript
- createTimeEntry(data: CreateTimeEntryDTO): Promise<TimeEntry>
- updateTimeEntry(id: string, data: UpdateTimeEntryDTO): Promise<TimeEntry>
- deleteTimeEntry(id: string): Promise<void>
- getTimeEntry(id: string): Promise<TimeEntry>
- getUserTimeEntries(userId: string, date: Date): Promise<TimeEntry[]>
- calculateHours(startTime: string, endTime: string, breakMin: number): number
- getMonthlyHours(userId: string, month: number, year: number): Promise<number>
- getProjectHours(projectId: string, userId: string): Promise<number>
```

**2.2 Create leave service**

File: `backend/src/features/leave/leave.service.ts`

Key methods:
```typescript
- createLeaveRequest(data: CreateLeaveRequestDTO): Promise<LeaveRequest>
- approveLeaveRequest(id: string, approvedBy: string): Promise<LeaveRequest>
- rejectLeaveRequest(id: string): Promise<LeaveRequest>
- getLeaveAllocation(userId: string, year: number): Promise<LeaveAllocation>
- updateLeaveAllocation(userId: string, year: number, data: UpdateLeaveDTO): Promise<LeaveAllocation>
- getUserLeaveRequests(userId: string): Promise<LeaveRequest[]>
- getLeaveRequestsForApproval(managerId: string): Promise<LeaveRequest[]>
```

**2.3 Create API routes**

Files to create:
- `backend/src/routes/timesheet.ts` - Main timesheet routes
- `backend/src/routes/leave.ts` - Leave management routes

Endpoints needed:
```
POST   /api/timesheet/entries
GET    /api/timesheet/entries/:id
PUT    /api/timesheet/entries/:id
DELETE /api/timesheet/entries/:id
GET    /api/timesheet/entries?month=MM&year=YYYY
GET    /api/timesheet/hours/monthly?month=MM&year=YYYY
GET    /api/timesheet/hours/project/:projectId

POST   /api/leave/requests
GET    /api/leave/requests/:id
PUT    /api/leave/requests/:id
GET    /api/leave/requests
GET    /api/leave/allocations/:year
PUT    /api/leave/allocations/:year
```

**2.4 Add validation**

File: `backend/src/features/timesheet/timesheet.validation.ts`

Validators:
```typescript
- validateTimeEntry(entry: TimeEntry): ValidationError[]
- validateTimeRange(startTime: string, endTime: string): boolean
- validateLeaveRequest(request: LeaveRequest): ValidationError[]
- validateBreakDuration(duration: number): boolean
```

---

### Task 3: Update Frontend Types (4 hours)

**3.1 Update timesheet types**

File: `next-app/app/timesheet/types.ts`

Add/update:
```typescript
interface TimeEntry {
  id: string;
  date: string;
  startTime: string;        // HH:mm
  endTime?: string;         // HH:mm
  breakDuration: number;    // minutes
  workType: WorkType;
  projectId?: string;
  taskId?: string;
  userId: string;
  hours: number;
  billableHours?: number;
  description?: string;
  status: Status;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface LeaveAllocation {
  id: string;
  userId: string;
  year: number;
  annualLeaveHours: number;
  usedLeaveHours: number;
  remainingHours: number;
}

interface LeaveRequest {
  id: string;
  leaveAllocationId: string;
  startDate: string;
  endDate: string;
  leaveType: LeaveType;
  reason: string;
  status: Status;
  approvedBy?: string;
  approvedAt?: string;
}

enum WorkType {
  PROJECT = 'project',
  OFFICE = 'office',
  TRAINING = 'training',
  LEAVE = 'leave',
  OVERTIME = 'overtime',
  OTHER = 'other'
}

enum LeaveType {
  ANNUAL = 'annual',
  SICK = 'sick',
  PERSONAL = 'personal',
  MATERNITY = 'maternity',
  UNPAID = 'unpaid'
}

type Status = 'todo' | 'in_progress' | 'in_review' | 'done' | 'pending';
```

**3.2 Create DTOs**

File: `next-app/app/timesheet/dtos.ts`

```typescript
interface CreateTimeEntryDTO {
  date: string;
  startTime: string;
  endTime: string;
  breakDuration?: number;
  workType: WorkType;
  projectId?: string;
  taskId?: string;
  description?: string;
}

interface UpdateTimeEntryDTO extends Partial<CreateTimeEntryDTO> {}

interface CreateLeaveRequestDTO {
  startDate: string;
  endDate: string;
  leaveType: LeaveType;
  reason: string;
}
```

---

### Task 4: Create Frontend Service (8 hours)

**4.1 Create timesheet API client**

File: `next-app/lib/services/timesheet.ts`

```typescript
export class TimesheetService {
  static async createTimeEntry(data: CreateTimeEntryDTO): Promise<TimeEntry> {}
  static async updateTimeEntry(id: string, data: UpdateTimeEntryDTO): Promise<TimeEntry> {}
  static async deleteTimeEntry(id: string): Promise<void> {}
  static async getTimeEntry(id: string): Promise<TimeEntry> {}
  static async getUserTimeEntries(userId: string, month: number, year: number): Promise<TimeEntry[]> {}
  static async getMonthlyHours(month: number, year: number): Promise<number> {}
  static async getProjectHours(projectId: string): Promise<number> {}
}
```

**4.2 Create leave API client**

File: `next-app/lib/services/leave.ts`

```typescript
export class LeaveService {
  static async createLeaveRequest(data: CreateLeaveRequestDTO): Promise<LeaveRequest> {}
  static async approveLeaveRequest(id: string): Promise<LeaveRequest> {}
  static async rejectLeaveRequest(id: string): Promise<LeaveRequest> {}
  static async getLeaveAllocation(year: number): Promise<LeaveAllocation> {}
  static async getLeaveRequests(): Promise<LeaveRequest[]> {}
}
```

**4.3 Create utility functions**

File: `next-app/lib/utils/timesheet-utils.ts`

```typescript
export const TimesheetUtils = {
  calculateHours(startTime: string, endTime: string, breakMin: number = 0): number {},
  formatTime(time: string): string {},
  parseTime(time: string): { hours: number; minutes: number } {},
  isValidTimeRange(startTime: string, endTime: string): boolean {},
  formatDuration(minutes: number): string {},
};
```

---

### Task 5: Create React Hook (4 hours)

**5.1 Create useTimesheet hook**

File: `next-app/hooks/use-timesheet.ts`

```typescript
export function useTimesheet(month: number, year: number) {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load entries on mount
  useEffect(() => {
    fetchEntries();
  }, [month, year]);

  const fetchEntries = async () => {
    // Fetch from TimesheetService
  };

  const createEntry = async (data: CreateTimeEntryDTO) => {
    // Call TimesheetService.createTimeEntry
  };

  const updateEntry = async (id: string, data: UpdateTimeEntryDTO) => {
    // Call TimesheetService.updateTimeEntry
  };

  const deleteEntry = async (id: string) => {
    // Call TimesheetService.deleteTimeEntry
  };

  return { entries, loading, error, createEntry, updateEntry, deleteEntry };
}
```

**5.2 Create useLeave hook**

File: `next-app/hooks/use-leave.ts`

Similar structure for leave requests.

---

## ✅ Phase 1 Completion Criteria

- [x] Database schema enhanced and migrated
- [x] API routes created and tested
- [x] Types defined and exported
- [x] Backend services implemented
- [x] Frontend services created
- [x] React hooks working
- [x] Time calculation utilities working
- [x] Basic CRUD operations functional
- [x] Error handling in place
- [x] Code reviewed and tested

---

## 📊 Effort Breakdown

| Task | Hours | Notes |
|------|-------|-------|
| Database Migration | 4 | Schema + migration files |
| Backend API Routes | 12 | Services + routes + validation |
| Frontend Types | 4 | DTOs + interfaces + enums |
| Frontend Service | 8 | API client + utilities |
| React Hooks | 4 | useTimesheet + useLeave |
| Testing | 6 | Unit + integration tests |
| Code Review | 2 | Review + adjustments |
| **Total** | **40** | ~1 week |

---

## 🚀 Next Steps

After Phase 1 complete:
1. Phase 2: Enhanced UI (Time Pickers, Timer)
2. Phase 3: Work Types & Leave Management
3. Phase 4: Approvals Workflow
4. Phase 5: Reporting & Analytics

---

## 📝 Notes

- Keep commits small and focused
- Write tests as you go
- Update documentation incrementally
- Get code reviews on major changes
- Test database migrations in dev first
