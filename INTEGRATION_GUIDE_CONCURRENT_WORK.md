# Integration Guide: Timesheet Concurrent Work (Option 3)

## Complete Integration Steps

This guide walks through the complete setup and testing of the concurrent work feature.

---

## Phase 1: Database Setup

### Step 1.1: Verify Prisma Schema
```bash
cd c:/Users/Jakgrits/project-mgnt

# Check schema was updated
cat prisma/schema.prisma | grep -A 20 "model time_entries"
```

**Expected**: Should see 7 new fields in `time_entries` model

### Step 1.2: Create and Run Migration
```bash
# Generate migration (if not already created)
npx prisma migrate dev --name add_concurrent_work_fields

# Or directly apply existing migration
npx prisma migrate deploy

# Verify migration applied
npx prisma db push --force-reset  # WARNING: Only in dev!
```

### Step 1.3: Verify Database Schema
```bash
# Connect to database
psql -U postgres timesheet_db

# Check new columns
\d time_entries

# Expected output should include:
#  isConcurrent       | boolean
#  concurrentEntryIds | text[]
#  concurrentReason   | text
#  breakDuration      | integer
#  chargeable         | boolean
#  chargeAmount       | numeric
#  billableHours      | numeric
```

---

## Phase 2: Backend Integration

### Step 2.1: Verify Service Imports
```typescript
// File: backend/src/features/timesheet/TimesheetService.ts
// Should have this import at top:
import {
  detectDuplicateOrParallelWork,
  updateConcurrentRelationships,
  checkDailyTotalHours,
} from './timesheet.duplicate-detection';
```

### Step 2.2: Verify Route Handler
```typescript
// File: backend/src/routes/timesheet.routes.ts
// Should have:
import TimesheetConcurrentController from '../features/timesheet/timesheet.concurrent.controller';

// And this endpoint:
router.post('/check-concurrent', requireAuth, async (req, res, next) => {
  // ... concurrent work check logic
});
```

### Step 2.3: Test Backend Routes
```bash
cd backend

# Start backend server
npm run dev

# In another terminal, test the concurrent check endpoint:
curl -X POST http://localhost:3001/api/timesheet/check-concurrent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "userId": "user-123",
    "date": "2025-02-15",
    "startTime": "14:00",
    "endTime": "17:00",
    "projectId": "proj-abc",
    "workType": "project"
  }'

# Expected response:
# {
#   "valid": true,
#   "isConcurrent": false,
#   "requiresComment": false,
#   "warnings": []
# }
```

### Step 2.4: Verify TimesheetService Integration
```typescript
// Test that createTimeEntry accepts new fields:
const entry = await TimesheetService.createTimeEntry({
  date: new Date('2025-02-15'),
  startTime: '14:00',
  endTime: '17:00',
  projectId: 'proj-1',
  workType: 'project',
  userId: 'user-123',
  isConcurrent: true,           // NEW
  concurrentReason: 'explanation', // NEW
  chargeable: false,            // NEW
  chargeAmount: null,           // NEW
});
```

---

## Phase 3: Frontend Integration

### Step 3.1: Verify Modal Component Updated
```bash
cd next-app

# Check modal has concurrent work state:
grep "concurrentWarnings" app/timesheet/components/TimesheetModal.tsx
grep "checkParallelWork" app/timesheet/components/TimesheetModal.tsx

# Expected: Both should be found
```

### Step 3.2: Verify API Route
```bash
# Check frontend API endpoint exists:
ls -la app/api/timesheet/check-concurrent/

# Expected: route.ts file should exist
```

### Step 3.3: Test Frontend UI
```bash
# Start frontend
npm run dev

# Navigate to: http://localhost:3000/timesheet

# Test:
# 1. Create timesheet entry
# 2. Fill: Date, Project, Start Time
# 3. Fill: End Time
# 4. Expected: If concurrent, yellow warning appears
#    - Shows overlapping entries
#    - Shows reason input field
#    - Shows confirmation checkbox
```

---

## Phase 4: End-to-End Testing

### Test 1: Sequential Entries (No Warning)
```
Steps:
1. Create Entry 1: Project-A, 09:00-12:00
2. Save Entry 1 ✅
3. Create Entry 2: Project-B, 12:00-17:00
4. Save Entry 2 ✅

Expected Result:
- No warnings
- Both entries saved
- Total hours: 8h
```

### Test 2: Parallel Projects (With Warning)
```
Steps:
1. Create Entry 1: Project-A, 14:00-17:00, 3h
2. Save Entry 1 ✅
3. Create Entry 2: Project-B, 14:00-17:00, 3h
4. Yellow warning appears ⚠️
   - Shows: "Project-A | 14:00-17:00 (ซ้อนกัน 3h)"
5. User fills reason: "Code review on A, bug fix on B"
6. User checks: "I know I'm working on 2 tasks simultaneously"
7. User clicks Save ✅

Expected Result:
- Entry saved with isConcurrent=true
- concurrentReason stored
- Entries linked via concurrentEntryIds
```

### Test 3: Three Projects (Blocked)
```
Steps:
1. Create Entry 1: Project-A, 14:00-17:00
2. Save ✅
3. Create Entry 2: Project-B, 14:00-17:00
4. Warning appears, fill reason, save ✅
5. Create Entry 3: Project-C, 14:00-17:00
6. Error appears: "ไม่สามารถทำ 3 งานขนานพร้อมกัน"

Expected Result:
- Entry 3 blocked (not saved)
- Error message displays
- User can adjust time or delete another entry
```

### Test 4: Work on Leave Day (Blocked)
```
Steps:
1. Create leave request: Feb 15, Annual Leave (approved)
2. Create timesheet entry: Feb 15, 09:00-17:00
3. Error appears: "ไม่สามารถบันทึกเวลาทำงานในวันลา"

Expected Result:
- Entry blocked
- Leave conflict message
- User must pick different day
```

### Test 5: Exact Duplicate (Blocked)
```
Steps:
1. Create Entry 1: Project-A, Feb 15, 09:00-17:00
2. Save ✅
3. Create Entry 2: Project-A, Feb 15, 09:00-17:00 (exact duplicate)
4. Error appears: "บันทึกนี้มีอยู่แล้ว"

Expected Result:
- Entry 2 blocked
- Duplicate error message
- User must adjust times
```

---

## Phase 5: Database Verification

### Check Data Integrity
```sql
-- Check concurrent entries were saved
SELECT id, userId, projectId, isConcurrent, concurrentReason, concurrentEntryIds
FROM time_entries
WHERE isConcurrent = true
ORDER BY createdAt DESC
LIMIT 5;

-- Check daily totals
SELECT userId, DATE(date) as day, SUM(CAST(hours AS DECIMAL)) as total_hours
FROM time_entries
GROUP BY userId, DATE(date)
ORDER BY day DESC;

-- Check for orphaned concurrent links
SELECT id, concurrentEntryIds
FROM time_entries
WHERE array_length(concurrentEntryIds, 1) > 0
AND status = 'approved';
```

---

## Phase 6: Performance Testing

### Check Query Performance
```sql
-- Time the concurrent check query (should be <10ms with indexes)
EXPLAIN ANALYZE
SELECT * FROM time_entries
WHERE userId = 'user-123'
  AND date::date = '2025-02-15'
  AND status IN ('draft', 'submitted', 'approved')
  AND startTime < '17:00'
  AND endTime > '14:00';
```

### Load Testing
```bash
# Optional: Load test with concurrent work checks
# Using Apache Bench or similar:
ab -n 100 -c 10 -H "Authorization: Bearer TOKEN" \
   http://localhost:3001/api/timesheet/check-concurrent

# Monitor response times
# Expected: Average response time <100ms
```

---

## Phase 7: Error Handling Verification

### Test All Error Codes
```bash
# 1. EXACT_DUPLICATE
curl -X POST http://localhost:3001/api/timesheet/entries \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"date":"2025-02-15","startTime":"09:00","endTime":"17:00","projectId":"proj-1","userId":"user-123"}'
# (after creating same entry again)

# 2. TOO_MANY_PARALLEL_PROJECTS
# Create 3 entries with same time range

# 3. LEAVE_CONFLICT
# Create leave request, then timesheet entry on same day

# 4. CONCURRENT_REASON_REQUIRED
# Create 2 parallel entries, try to save without reason

# 5. EXCEEDS_DAILY_LIMIT
# Create entries totaling >24 hours
```

---

## Phase 8: Monitoring & Logging

### Enable Debug Logging
```typescript
// In TimesheetService.ts
console.log('[CONCURRENT_WORK] Checking for parallel work:', {
  userId,
  date,
  startTime,
  endTime,
  projectId,
});
```

### Monitor API Logs
```bash
# Backend logs
tail -f backend/logs/app.log | grep "CONCURRENT\|ERROR"

# Frontend browser console
# Open DevTools → Network tab
# Filter: check-concurrent
# Watch for API response times
```

---

## Phase 9: Rollback Testing

### Test Rollback Procedure
```bash
# 1. Backup current database
pg_dump -U postgres timesheet_db > backup_before_rollback.sql

# 2. Drop new columns
psql -U postgres timesheet_db << SQL
  ALTER TABLE time_entries DROP COLUMN isConcurrent CASCADE;
  ALTER TABLE time_entries DROP COLUMN concurrentEntryIds CASCADE;
  ALTER TABLE time_entries DROP COLUMN concurrentReason CASCADE;
  ALTER TABLE time_entries DROP COLUMN breakDuration CASCADE;
  ALTER TABLE time_entries DROP COLUMN chargeable CASCADE;
  ALTER TABLE time_entries DROP COLUMN chargeAmount CASCADE;
  ALTER TABLE time_entries DROP COLUMN billableHours CASCADE;
  DROP INDEX idx_time_entries_user_date_status;
  DROP INDEX idx_time_entries_concurrent;
SQL

# 3. Verify rollback
\d time_entries
# Should not see new columns

# 4. Restore if needed
psql -U postgres timesheet_db < backup_before_rollback.sql
```

---

## Phase 10: User Acceptance Testing

### Checklist for UAT
- [ ] Users can create single project entries
- [ ] Users can create sequential entries
- [ ] Users see warning for 2 parallel projects
- [ ] Users can enter reason for parallel work
- [ ] Users cannot save without reason (concurrent)
- [ ] System blocks 3+ parallel projects
- [ ] System blocks work on leave days
- [ ] System blocks duplicate entries
- [ ] Manager sees concurrent badge in approvals
- [ ] Monthly reports show concurrent work flag
- [ ] No data loss during transitions
- [ ] Performance is acceptable (<500ms)

---

## Troubleshooting

### Issue: Warning not showing
```
Solution:
1. Check browser console for API errors
2. Verify /api/timesheet/check-concurrent returns 200
3. Check concurrentWarnings state in React DevTools
4. Ensure backend migration ran: npx prisma db execute migration
```

### Issue: Reason field not appearing
```
Solution:
1. Verify response has requiresComment: true
2. Check frontend state management
3. Debug: console.log('Warnings:', concurrentWarnings)
```

### Issue: Concurrent entries not linked
```
Solution:
1. Check concurrentEntryIds in database
2. Verify updateConcurrentRelationships() is called
3. Check for errors in backend logs
```

### Issue: Daily total calculation wrong
```
Solution:
1. Verify breakDuration is included
2. Check DECIMAL precision in database
3. Review calculateDailyTotal() logic
```

---

## Rollout Strategy

### Phase 1: Dev Environment (Immediate)
- [x] Code review
- [x] Database migration
- [x] Local testing

### Phase 2: Staging Environment (Day 1)
- [ ] Deploy to staging
- [ ] Run full test suite
- [ ] UAT with sample users
- [ ] Performance testing

### Phase 3: Production (Day 2)
- [ ] Backup production database
- [ ] Deploy code
- [ ] Run migration
- [ ] Monitor for errors
- [ ] Notify users

### Phase 4: Post-Launch (Week 1)
- [ ] Monitor metrics
- [ ] Gather user feedback
- [ ] Performance monitoring
- [ ] Bug fixes if needed

---

## Success Metrics

- ✅ Zero data loss during migration
- ✅ API response time <100ms
- ✅ All 8 business rules enforced
- ✅ Zero unhandled exceptions
- ✅ User feedback positive
- ✅ No rollbacks needed

---

## Support

**During Integration**:
- Tech Lead: [Contact info]
- DevOps: [Contact info]
- Database: [Contact info]

**Escalation Path**:
1. Check troubleshooting section
2. Review logs
3. Contact Tech Lead
4. Initiate rollback if critical

---

**Document Version**: 1.0
**Created**: February 16, 2025
**Status**: Ready for Integration Testing
