# Phase 1 Task 2: Backend API Routes - Implementation Guide

**Status:** Starting Now  
**Duration:** 12 hours  
**Priority:** CRITICAL - Blocks Phase 2 UI

---

## 📋 Task Overview

Build the backend API layer to handle:
- Time entry CRUD operations
- Leave request management
- Time calculations
- Approval workflows
- Data validation

---

## 🏗️ Architecture

```
backend/src/features/
├── timesheet/
│   ├── timesheet.service.ts      (Business logic)
│   ├── timesheet.validation.ts   (Input validation)
│   └── timesheet.utils.ts        (Time calculations)
├── leave/
│   ├── leave.service.ts          (Business logic)
│   └── leave.validation.ts       (Input validation)
└── routes/
    ├── timesheet.routes.ts       (API endpoints)
    └── leave.routes.ts           (API endpoints)
```

---

## 🎯 Implementation Steps

### Step 1: Create Timesheet Service (2 hours)

**File:** `backend/src/features/timesheet/timesheet.service.ts`

Core methods:
```typescript
class TimesheetService {
  // CREATE
  async createTimeEntry(data: CreateTimeEntryDTO): Promise<TimeEntry>
  
  // READ
  async getTimeEntry(id: string): Promise<TimeEntry | null>
  async getUserTimeEntries(userId: string, month: number, year: number): Promise<TimeEntry[]>
  async getMonthlyHours(userId: string, month: number, year: number): Promise<Decimal>
  async getProjectHours(projectId: string, month?: number, year?: number): Promise<Decimal>
  
  // UPDATE
  async updateTimeEntry(id: string, data: UpdateTimeEntryDTO): Promise<TimeEntry>
  async approveTimeEntry(id: string, approvedBy: string): Promise<TimeEntry>
  async rejectTimeEntry(id: string, reason: string): Promise<TimeEntry>
  
  // DELETE
  async deleteTimeEntry(id: string): Promise<void>
}
```

**Key Logic:**
- Calculate hours from startTime + endTime - breakDuration
- Validate time ranges
- Handle approvals
- Track audit trail

---

### Step 2: Create Leave Service (2 hours)

**File:** `backend/src/features/leave/leave.service.ts`

Core methods:
```typescript
class LeaveService {
  // ALLOCATION
  async getOrCreateAllocation(userId: string, year: number): Promise<LeaveAllocation>
  async updateAllocation(userId: string, year: number, data: UpdateAllocationDTO): Promise<LeaveAllocation>
  
  // REQUESTS
  async createLeaveRequest(data: CreateLeaveRequestDTO): Promise<LeaveRequest>
  async getLeaveRequest(id: string): Promise<LeaveRequest | null>
  async getUserLeaveRequests(userId: string): Promise<LeaveRequest[]>
  async getLeaveRequestsForApproval(managerId: string): Promise<LeaveRequest[]>
  
  // APPROVALS
  async approveLeaveRequest(id: string, approvedBy: string): Promise<LeaveRequest>
  async rejectLeaveRequest(id: string): Promise<LeaveRequest>
  
  // CALCULATIONS
  async calculateLeaveHours(startDate: Date, endDate: Date): Promise<number>
}
```

**Key Logic:**
- Calculate business days (exclude weekends, holidays)
- Check allocation balance before approval
- Update used hours when approved
- Prevent double-booking

---

### Step 3: Create Validation Layer (2 hours)

**File:** `backend/src/features/timesheet/timesheet.validation.ts`

Validations needed:
```typescript
// Time Entry Validation
- validateTimeEntry(entry: TimeEntry): ValidationError[]
- validateTimeRange(startTime: string, endTime: string): boolean
- validateBreakDuration(duration: number): boolean
- validateHours(hours: number): boolean

// Leave Validation
- validateLeaveRequest(request: CreateLeaveRequestDTO): ValidationError[]
- validateLeaveBalance(userId: string, year: number, hours: number): Promise<boolean>
- validateDateRange(startDate: Date, endDate: Date): boolean
```

**Validation Rules:**
- Time: HH:mm format (00:00-23:59)
- startTime must be < endTime
- breakDuration 0-480 minutes (0-8 hours)
- hours must be positive
- dates must be in future or today

---

### Step 4: Create Utility Functions (1 hour)

**File:** `backend/src/features/timesheet/timesheet.utils.ts`

```typescript
export const TimesheetUtils = {
  // Time calculations
  calculateHours(startTime: string, endTime: string, breakMin: number): number
  formatTime(time: string): string
  parseTime(time: string): { hours: number; minutes: number }
  timeToMinutes(time: string): number
  minutesToTime(minutes: number): string
  
  // Date calculations
  getMonthRange(month: number, year: number): { start: Date; end: Date }
  isBusinessDay(date: Date): boolean
  getBusinessDaysBetween(startDate: Date, endDate: Date): number
  
  // Status helpers
  canApprove(status: Status): boolean
  canEdit(status: Status): boolean
}
```

---

### Step 5: Create API Routes (3 hours)

**File:** `backend/src/routes/timesheet.routes.ts`

Endpoints:
```
POST   /api/timesheet/entries
GET    /api/timesheet/entries/:id
PUT    /api/timesheet/entries/:id
DELETE /api/timesheet/entries/:id
GET    /api/timesheet/entries?month=MM&year=YYYY&userId=USER_ID
GET    /api/timesheet/hours/monthly?month=MM&year=YYYY&userId=USER_ID
GET    /api/timesheet/hours/project/:projectId?month=MM&year=YYYY

POST   /api/timesheet/entries/:id/approve
POST   /api/timesheet/entries/:id/reject
POST   /api/timesheet/entries/:id/comments
GET    /api/timesheet/entries/:id/comments
```

**File:** `backend/src/routes/leave.routes.ts`

Endpoints:
```
POST   /api/leave/requests
GET    /api/leave/requests/:id
PUT    /api/leave/requests/:id
DELETE /api/leave/requests/:id
GET    /api/leave/requests?status=pending&userId=USER_ID
GET    /api/leave/requests/for-approval?managerId=MANAGER_ID

POST   /api/leave/requests/:id/approve
POST   /api/leave/requests/:id/reject

GET    /api/leave/allocations/:year
PUT    /api/leave/allocations/:year
GET    /api/leave/allocations/:year/balance
```

---

## 📝 Implementation Order

1. **Create validation utilities** (fastest, no dependencies)
2. **Create time calculation utils** (needed by validation)
3. **Create timesheet service** (uses utils + validations)
4. **Create leave service** (uses utils + validations)
5. **Create API routes** (uses all services)

---

## 🔌 Integration Points

### Database (Prisma)
```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Use in services:
await prisma.timeEntry.create({ data: {...} })
await prisma.leaveRequest.findUnique({ where: { id } })
```

### DTOs
```typescript
// From frontend (next-app/app/timesheet/dtos.ts)
interface CreateTimeEntryDTO {
  date: string;
  startTime: string;
  endTime: string;
  workType: WorkType;
  projectId?: string;
}
```

### Error Handling
```typescript
class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: Record<string, string>
  ) {
    super(message);
  }
}
```

---

## 🧪 Testing Strategy

### Unit Tests
```typescript
// timesheet.service.test.ts
- createTimeEntry: valid data
- createTimeEntry: invalid time range
- calculateHours: various time ranges
- getMonthlyHours: multiple entries

// leave.service.test.ts
- createLeaveRequest: valid request
- createLeaveRequest: insufficient balance
- approveLeaveRequest: updates allocation
```

### Integration Tests
```typescript
// Test CRUD flow
- Create → Read → Update → Delete
- Create → Approve → Verify status change
- Create → Reject → Verify remains open
```

---

## 📊 Data Structures

### TimeEntry Input
```typescript
{
  date: "2024-02-15",
  startTime: "09:00",
  endTime: "17:00",
  breakDuration: 60,
  workType: "project",
  projectId: "proj-123",
  description: "Development work"
}
```

### TimeEntry Output
```typescript
{
  id: "entry-123",
  date: "2024-02-15",
  startTime: "09:00",
  endTime: "17:00",
  breakDuration: 60,
  workType: "project",
  hours: 7.0,
  billableHours: 7.0,
  status: "pending",
  userId: "user-123",
  projectId: "proj-123",
  createdAt: "2024-02-15T10:00:00Z",
  updatedAt: "2024-02-15T10:00:00Z"
}
```

### LeaveRequest Input
```typescript
{
  startDate: "2024-12-25",
  endDate: "2024-12-27",
  leaveType: "annual",
  reason: "Holiday break"
}
```

### LeaveRequest Output
```typescript
{
  id: "leave-123",
  userId: "user-123",
  leaveAllocationId: "alloc-123",
  startDate: "2024-12-25",
  endDate: "2024-12-27",
  leaveType: "annual",
  reason: "Holiday break",
  status: "pending",
  approvedBy: null,
  approvedAt: null,
  createdAt: "2024-02-15T10:00:00Z"
}
```

---

## ⚡ Performance Considerations

1. **Index Optimization**
   - Already created in migration
   - Queries will be fast

2. **Query Optimization**
   - Use `include` for relations
   - Don't fetch unnecessary fields

3. **Caching** (optional)
   - Cache allocation balances
   - Invalidate on approval/rejection

4. **Pagination**
   - Limit large result sets
   - Return 100 entries max

---

## 🛡️ Security Considerations

1. **Authorization**
   - Check user owns timesheet
   - Only managers can approve
   - Admins only for force actions

2. **Validation**
   - All inputs validated
   - SQL injection prevented (Prisma)
   - XSS prevented (no inline scripts)

3. **Audit Trail**
   - All changes logged
   - Timestamps on approvals
   - User IDs recorded

---

## 📚 Files to Create

```
✅ backend/src/features/timesheet/timesheet.service.ts
✅ backend/src/features/timesheet/timesheet.validation.ts
✅ backend/src/features/timesheet/timesheet.utils.ts
✅ backend/src/features/leave/leave.service.ts
✅ backend/src/features/leave/leave.validation.ts
✅ backend/src/routes/timesheet.routes.ts
✅ backend/src/routes/leave.routes.ts
✅ Tests (optional for now)
```

---

## ✅ Completion Criteria

- [x] All validation functions working
- [x] All CRUD operations working
- [x] All calculations accurate
- [x] All routes responding correctly
- [x] Error handling in place
- [x] Database integration tested
- [x] Types properly exported

---

## 🚀 Next After Task 2

Once this is complete:
- Task 3: Frontend types (1-2 hours)
- Task 4: Frontend services (2-3 hours)
- Task 5: React hooks (1-2 hours)
- Testing & QA (4-6 hours)

**Total Phase 1:** ~40 hours (on track!)

---

**Ready to build the backend? Let's go! 🚀**
