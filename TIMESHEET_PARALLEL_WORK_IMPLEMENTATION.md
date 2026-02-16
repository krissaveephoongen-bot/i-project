# Timesheet Parallel Work Implementation Guide

## Option 3: Hybrid Approach - ✅ IMPLEMENTED

Allows up to 2 projects in parallel with a required reason comment, blocks 3+ concurrent tasks.

---

## Quick Setup

### 1. Database Migration

```bash
# Apply the migration
cd c:/Users/Jakgrits/project-mgnt
npm run db:migrate

# Or manually:
psql -f prisma/migrations/20260216_add_concurrent_work_fields/migration.sql
```

### 2. Environment Variables (if needed)

```env
# Backend URL for NextApp API calls
BACKEND_URL=http://localhost:3001

# Auth tokens (handled by existing session)
```

### 3. Start Services

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend  
cd next-app
npm run dev

# Terminal 3: Database (Docker)
docker-compose up -d postgres
```

---

## File Changes Summary

### Backend Files

| File | Changes |
|------|---------|
| `prisma/schema.prisma` | Added 7 new fields to `time_entries` model |
| `backend/src/features/timesheet/timesheet.duplicate-detection.ts` | NEW: Core duplicate/parallel work detection logic |
| `backend/src/features/timesheet/TimesheetService.ts` | Enhanced `createTimeEntry()` with duplicate checks |
| `backend/src/features/timesheet/timesheet.concurrent.controller.ts` | NEW: API controller for concurrent work checks |
| `prisma/migrations/20260216_add_concurrent_work_fields/migration.sql` | NEW: Database schema update |

### Frontend Files

| File | Changes |
|------|---------|
| `next-app/app/timesheet/components/TimesheetModal.tsx` | Enhanced with concurrent work warnings & reason field |
| `next-app/app/api/timesheet/check-concurrent/route.ts` | NEW: Frontend API endpoint for concurrent checks |

---

## How It Works

### User Journey

```
1. User opens timesheet modal
2. Fills: Date, Project, Start Time, End Time
3. Clicks "End Time" field
   ↓
4. Component calls checkParallelWork()
   ↓
5. POST /api/timesheet/check-concurrent
   ├─ Validates against existing entries
   ├─ Checks for leave conflicts
   └─ Returns warnings if applicable
   ↓
6. No conflicts? Entry form stays clean ✓
7. 2 projects parallel? Show yellow warning ⚠️
   ├─ Display overlapping entry details
   ├─ Show "Reason" input field (required)
   └─ Show confirmation checkbox
8. 3+ projects? Block with error ❌
9. User enters reason: "Code review on A, bug fix on B"
10. User checks: "I know I'm working on 2 tasks simultaneously"
11. User clicks "Save"
12. Frontend validates: All reasons filled? ✓
13. Backend creates entry with concurrent metadata
    └─ isConcurrent=true
    └─ concurrentReason="..."
    └─ concurrentEntryIds=[...]
```

---

## Validation Rules

### ✅ ALLOW

| Scenario | Reason | Example |
|----------|--------|---------|
| Sequential work | No time overlap | 09:00-12:00, then 12:00-17:00 |
| Project + Meeting | Different types | Project work + team meeting in middle |
| 2 projects parallel | With reason comment | Project-A & Project-B, 14:00-17:00 |
| Break/gap between entries | Small gap OK | 09:00-11:50, then 12:00-17:00 |

### ⚠️ WARN (Requires Confirmation)

| Scenario | Action | Example |
|----------|--------|---------|
| 2 projects overlapping | Require reason comment + checkbox | Project-A & Project-B same time |

### ❌ BLOCK

| Scenario | Error Code | Message |
|----------|-----------|---------|
| Exact duplicate | `EXACT_DUPLICATE` | "บันทึกนี้มีอยู่แล้ว" |
| Same project overlap | `SAME_PROJECT_OVERLAP` | "ไม่สามารถทำงานโครงการเดียวกันในเวลาเดียวกัน" |
| 3+ projects parallel | `TOO_MANY_PARALLEL_PROJECTS` | "ไม่สามารถทำ 3 งานขนานพร้อมกัน" |
| Work on leave day | `LEAVE_CONFLICT` | "ไม่สามารถบันทึกเวลาทำงานในวันลา" |
| Missing reason (concurrent) | `CONCURRENT_REASON_REQUIRED` | "โปรดระบุเหตุผลการทำงานขนาน" |
| >24 hours per day | `EXCEEDS_DAILY_LIMIT` | "วันนี้บันทึก X ชั่วโมง (>24h)" |

---

## Database Fields Explained

### New Fields in `time_entries`

```typescript
isConcurrent: Boolean
  └─ true = overlaps with another entry
  └─ Used for filtering/reporting concurrent work

concurrentEntryIds: String[]
  └─ Array of related entry IDs
  └─ Bidirectional: all concurrent entries link to each other
  └─ Example: ["entry-456", "entry-789"]

concurrentReason: String?
  └─ User's explanation for parallel work
  └─ Example: "Code review on A, bug fix on B"
  └─ Required if isConcurrent=true (for 2 projects)

breakDuration: Int (default: 60)
  └─ Minutes of break/lunch during work period
  └─ Used in hours calculation
  └─ Supports: 0 (no break) to 480 (8 hours)

chargeable: Boolean (default: false)
  └─ true = deduct from project budget
  └─ false = internal work
  └─ Used with chargeAmount for cost tracking

chargeAmount: Decimal?
  └─ Cost amount if chargeable=true
  └─ Example: $2,600 for 40 hours @ $65/hr

billableHours: Decimal?
  └─ Hours that are billable to client
  └─ Separate from total hours
  └─ Null for non-billable work types
```

---

## API Endpoint

### Check Concurrent Work

**Endpoint**: `POST /api/timesheet/check-concurrent`

**Request**:
```json
{
  "date": "2025-02-15",
  "startTime": "14:00",
  "endTime": "17:00",
  "projectId": "proj-abc123",
  "workType": "project"
}
```

**Response - No Issues**:
```json
{
  "valid": true,
  "isConcurrent": false,
  "requiresComment": false,
  "warnings": []
}
```

**Response - Concurrent (2 projects)**:
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

**Response - Error (Blocked)**:
```json
{
  "error": "TOO_MANY_PARALLEL_PROJECTS",
  "message": "ไม่สามารถทำ 3 งานขนานพร้อมกัน"
}
```

---

## Testing Checklist

### Basic Tests

- [ ] Sequential entries (no overlap) - Should ALLOW
- [ ] Back-to-back entries (12:00-12:00) - Should ALLOW
- [ ] Project + Meeting overlap - Should ALLOW
- [ ] Exact duplicate entry - Should BLOCK
- [ ] Same project, overlapping times - Should BLOCK
- [ ] 2 projects parallel - Should WARN + require reason
- [ ] 3 projects parallel - Should BLOCK
- [ ] Work on leave day - Should BLOCK
- [ ] Daily total >24 hours - Should BLOCK

### UI Tests

- [ ] Modal warning appears after time entry
- [ ] Warning shows overlapping entry details
- [ ] Reason field appears only for concurrent entries
- [ ] Confirmation checkbox appears for concurrent entries
- [ ] Save blocks if reason not filled
- [ ] Save blocks if checkbox not confirmed
- [ ] Yellow dot appears on concurrent row number
- [ ] Concurrent badge visible in monthly grid

### Data Tests

- [ ] Concurrent entry stored with `isConcurrent=true`
- [ ] `concurrentReason` saved in database
- [ ] `concurrentEntryIds` links both ways
- [ ] Daily total calculated correctly
- [ ] Leave conflict prevents entry creation
- [ ] Billable hours calculated separate from total

---

## Common Scenarios

### Scenario 1: Developer Context Switching

```
Morning: Project-A | 09:00-12:00 | 3h
Lunch:   Break     | 12:00-13:00 | 1h (no entry)
Afternoon: Project-B | 13:00-17:00 | 4h

✓ Result: ALLOW (no overlap)
Total for day: 7h billable
```

### Scenario 2: Team Meeting During Work

```
Morning: Project-A | 09:00-17:00 | 8h
Meeting: Team Sync | 14:00-15:00 | 1h (Non-Project Work)

✓ Result: ALLOW (different entry types)
Options:
  A) Two entries: 5h + 1h meeting + 2h = 8h total
  B) One entry: Project-A 09:00-17:00 with breakDuration=60
```

### Scenario 3: Code Review + Bug Fix Parallel

```
Entry 1: Project-A (Code Review) | 14:00-17:00 | 3h
Entry 2: Project-B (Bug Fix)     | 14:00-17:00 | 3h
Reason: "Reviewing A in parallel with B hotfix"

⚠️ Result: WARN (requires reason + checkbox)
Backend: Stores both with isConcurrent=true, concurrentReason="..."
Manager sees: Concurrent work badge in approvals
```

### Scenario 4: Not Allowed (3 Projects)

```
Entry 1: Project-A | 14:00-17:00 | 3h
Entry 2: Project-B | 14:00-17:00 | 3h
Entry 3: Project-C | 14:00-17:00 | 3h

❌ Result: BLOCK
Error: "ไม่สามารถทำ 3 งานขนานพร้อมกัน"
User must split times or remove entries
```

---

## Performance Considerations

### Database Queries

```typescript
// Fast overlap detection (indexed)
WHERE userId = X 
  AND date = DATE
  AND status IN ('draft', 'submitted', 'approved')
  AND startTime < entry.endTime
  AND endTime > entry.startTime

// Indexes used:
// - idx_time_entries_user_date_status (userId, date, status)
// - idx_time_entries_concurrent (isConcurrent)
```

### Expected Performance

- Single entry check: **<50ms** (with indexes)
- Monthly timesheet load (160 entries): **<500ms**
- Concurrent work detection: **<100ms**

---

## Monitoring & Debugging

### Log Level Markers

```
[DUPLICATE_CHECK] User X attempted 3 concurrent projects
[CONCURRENT_WORK] Entry Y marked concurrent with reason Z
[LEAVE_CONFLICT] Blocked entry on approved leave
```

### Database Queries for Analysis

```sql
-- Find all concurrent entries for a user
SELECT * FROM time_entries 
WHERE "userId" = 'user-123'
  AND "isConcurrent" = true
ORDER BY date DESC;

-- Find entries that exceeded daily 24-hour limit
SELECT date, SUM(hours) as daily_total
FROM time_entries
WHERE "userId" = 'user-123'
GROUP BY date
HAVING SUM(hours) > 24;

-- Find all entries with reasons
SELECT id, "concurrentReason", date, "startTime", "endTime"
FROM time_entries
WHERE "isConcurrent" = true
  AND "concurrentReason" IS NOT NULL
ORDER BY date DESC;
```

---

## Rollback Plan (if needed)

```sql
-- Remove concurrent work fields
ALTER TABLE "time_entries" DROP COLUMN "isConcurrent";
ALTER TABLE "time_entries" DROP COLUMN "concurrentEntryIds";
ALTER TABLE "time_entries" DROP COLUMN "concurrentReason";
ALTER TABLE "time_entries" DROP COLUMN "breakDuration";
ALTER TABLE "time_entries" DROP COLUMN "chargeable";
ALTER TABLE "time_entries" DROP COLUMN "chargeAmount";
ALTER TABLE "time_entries" DROP COLUMN "billableHours";

-- Remove indexes
DROP INDEX "idx_time_entries_user_date_status";
DROP INDEX "idx_time_entries_concurrent";
```

---

## Next Steps

### ✅ Completed

- [x] Database schema (7 new fields)
- [x] Duplicate detection service (7 functions)
- [x] TimesheetService integration
- [x] Frontend modal warnings
- [x] Reason input field
- [x] Confirmation checkbox
- [x] API endpoint
- [x] Validation logic

### 📋 To Do

1. **Integration Testing**
   - Test all 7 scenarios with real data
   - Test edge cases (exact midnight, same minute, etc.)

2. **Manager Approval Interface**
   - Show concurrent entries with badge
   - Display reason comment in approval view
   - Allow manager to approve/reject concurrent work

3. **Reporting**
   - Concurrent work summary in monthly reports
   - Reason audit trail
   - Concurrent work percentage per user

4. **Documentation**
   - User guide: "How to record parallel work"
   - Manager guide: "Reviewing concurrent entries"
   - Admin guide: "Monitoring concurrent work patterns"

5. **Analytics**
   - Track concurrent work frequency
   - Monitor 24-hour violations
   - Report on leave conflicts

---

**Status**: 🟢 **IMPLEMENTATION COMPLETE**
**Date**: Feb 16, 2025
**Option**: 3 (Hybrid Approach)
