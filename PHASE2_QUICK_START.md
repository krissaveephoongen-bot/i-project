# Phase 2 Quick Start Guide

**Phase:** 2 - Enhanced UI Components  
**Duration:** 30 hours (estimated)  
**Start Date:** Ready Now  
**Predecessor:** Phase 1 ✅ Complete

---

## What You Have Ready

### From Phase 1 ✅

**Backend API (20 Endpoints)**
- All timesheet CRUD operations
- All leave request operations
- Approval workflows
- Export functionality

**Frontend Services**
- 70+ utility functions
- Complete type definitions
- Validation functions
- Configuration constants

**React Hooks (35+)**
- Data fetching hooks
- Mutation hooks
- Timer hooks
- All with React Query integration

---

## Phase 2 Overview

Build the user interface components for timesheet and leave management.

| Task | Hours | Components |
|------|-------|-----------|
| Time Picker Component | 8 | Input, validations, UI |
| Timer Widget | 6 | Display, controls, formatting |
| Enhanced Entry Forms | 8 | Form, validation, submission |
| Leave Request Interface | 4 | Form, calendar, balance display |
| Approval Management UI | 4 | Queue, approval/rejection |
| **PHASE 2 TOTAL** | **30** | **5 Major Components** |

---

## Task 1: Time Picker Component (8 hours)

### What to Build
A reusable time picker component for selecting start/end times.

### Files to Create
```
next-app/app/components/
├── TimePicker.tsx
├── TimePickerInput.tsx
├── TimePickerClock.tsx
└── __tests__/TimePicker.test.tsx
```

### Features to Implement
- [x] Hour/minute selection
- [x] 15-minute intervals (configurable)
- [x] 12/24-hour format toggle
- [x] Keyboard input support
- [x] Validation against business hours
- [x] Clear error messages

### Use Services From Phase 1
```typescript
import {
  isValidTime,
  roundToNearestQuarter,
  clampTime,
  addMinutesToTime,
  compareTime
} from '@/lib/services/timesheet.utils'

import { TIMESHEET_DEFAULTS } from '@/lib/config'
```

### Hook Integration
```typescript
import { useTimer } from '@/hooks'

// For live time setting
const { formattedTime, setTime } = useTimer()
```

### Example Usage
```typescript
<TimePicker
  value="09:00"
  onChange={(time) => handleTimeChange(time)}
  min={TIMESHEET_DEFAULTS.WORKING_HOURS_START}
  max={TIMESHEET_DEFAULTS.WORKING_HOURS_END}
  interval={15}
/>
```

---

## Task 2: Timer Widget (6 hours)

### What to Build
A floating/inline timer widget for live time tracking.

### Files to Create
```
next-app/app/components/
├── TimerWidget.tsx
├── TimerDisplay.tsx
├── TimerControls.tsx
└── __tests__/TimerWidget.test.tsx
```

### Features to Implement
- [x] Start/pause/resume controls
- [x] Formatted time display (HH:MM:SS)
- [x] Running status indicator
- [x] Quick actions (add 15/30 mins)
- [x] Save to entry button
- [x] Floating position

### Use Hooks From Phase 1
```typescript
import { useTimer, useStopwatch } from '@/hooks'

const timer = useTimer()
// timer.start(), timer.pause(), timer.formattedTime, etc.
```

### Integration with Forms
```typescript
const handleSaveTime = () => {
  const startTime = "09:00"
  const endTime = timer.formattedTime // "12:30:45"
  
  const hours = calculateHoursBetween(startTime, endTime)
  updateFormField('hours', hours)
}
```

### Example Usage
```typescript
<TimerWidget
  onSave={(seconds) => handleTimerSave(seconds)}
  floatingPosition="bottom-right"
/>
```

---

## Task 3: Enhanced Entry Forms (8 hours)

### What to Build
Comprehensive form for creating/editing timesheet entries.

### Files to Create
```
next-app/app/components/
├── TimesheetEntryForm.tsx
├── EntryFormFields.tsx
├── EntryFormValidation.tsx
├── EntryFormSubmit.tsx
└── __tests__/TimesheetEntryForm.test.tsx
```

### Form Fields
```typescript
{
  date: Date              // Date picker
  startTime: string       // Time picker
  endTime: string         // Time picker
  projectId: string       // Project select
  workType: string        // Work type select
  breakDuration: number   // Break minutes
  comment?: string        // Optional comment
}
```

### Features to Implement
- [x] Time picker integration
- [x] Project dropdown (from API)
- [x] Work type selection with colors
- [x] Break duration input
- [x] Hours calculation (auto)
- [x] Validation messages
- [x] Submit button with loading
- [x] Error handling

### Use Services From Phase 1
```typescript
import {
  validateTimeEntry,
  calculateHoursBetween,
  exceedsDailyLimit,
  meetsMinimum
} from '@/lib/services'

import { useCreateTimeEntry, useUpdateTimeEntry } from '@/hooks'
```

### Example Validation
```typescript
const validation = validateTimeEntry({
  date: formData.date,
  startTime: formData.startTime,
  endTime: formData.endTime,
  breakDuration: formData.breakDuration
})

if (!validation.valid) {
  setErrors(validation.errors)
}
```

### Example Submission
```typescript
const { mutate, isPending } = useCreateTimeEntry()

const handleSubmit = (data) => {
  mutate(data, {
    onSuccess: () => {
      toast.success('Entry created!')
      router.refresh()
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })
}
```

---

## Task 4: Leave Request Interface (4 hours)

### What to Build
Form for creating and managing leave requests.

### Files to Create
```
next-app/app/components/
├── LeaveRequestForm.tsx
├── LeaveTypeSelect.tsx
├── LeaveDateRange.tsx
├── LeaveBalanceDisplay.tsx
└── __tests__/LeaveRequestForm.test.tsx
```

### Form Fields
```typescript
{
  leaveType: string       // Leave type select
  startDate: Date         // Date picker
  endDate: Date           // Date picker
  reason: string          // Text area
}
```

### Features to Implement
- [x] Leave type dropdown with colors
- [x] Date range picker (calendar)
- [x] Calculated leave days (excluding weekends)
- [x] Leave balance display
- [x] Insufficient balance warning
- [x] Auto-approval indicator
- [x] Reason textarea
- [x] Submit button

### Use Services From Phase 1
```typescript
import {
  validateLeaveRequestInput,
  calculateLeaveDays,
  getLeaveTypeLabel,
  getLeaveTypeColor,
  requiresApproval,
  isAutoApproved
} from '@/lib/services'

import {
  useLeaveBalance,
  useCreateLeaveRequest
} from '@/hooks'
```

### Example Implementation
```typescript
export function LeaveRequestForm() {
  const { data: balance } = useLeaveBalance(userId, 2026)
  const { mutate, isPending } = useCreateLeaveRequest()
  
  const handleSubmit = (data) => {
    // Calculate days
    const days = calculateLeaveDays(
      data.startDate,
      data.endDate
    )
    
    // Validate balance
    if (days > balance?.remaining) {
      toast.error('Insufficient balance')
      return
    }
    
    // Submit
    mutate({
      ...data,
      leaveDays: days
    })
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <LeaveTypeSelect />
      <LeaveDateRange />
      <LeaveBalanceDisplay balance={balance} />
      <textarea placeholder="Reason..." />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Submitting...' : 'Request Leave'}
      </button>
    </form>
  )
}
```

---

## Task 5: Approval Management UI (4 hours)

### What to Build
Interface for managers to approve/reject requests.

### Files to Create
```
next-app/app/components/
├── ApprovalQueue.tsx
├── ApprovalCard.tsx
├── ApprovalModal.tsx
└── __tests__/ApprovalQueue.test.tsx
```

### Features to Implement
- [x] Pending items list
- [x] Quick preview
- [x] Approve button
- [x] Reject button with reason modal
- [x] Batch operations (select multiple)
- [x] Status badges
- [x] Loading states
- [x] Success/error messages

### Use Hooks From Phase 1
```typescript
import {
  usePendingApprovals,
  useApproveTimeEntries,
  useRejectTimeEntries
} from '@/hooks'
```

### Example Implementation
```typescript
export function ApprovalQueue({ managerId }) {
  const { data: pending, isLoading } = usePendingApprovals(managerId)
  const { mutate: approve } = useApproveTimeEntries()
  const { mutate: reject } = useRejectTimeEntries()
  
  const handleApprove = (entryIds) => {
    approve(
      { entryIds, comments: '' },
      {
        onSuccess: () => {
          toast.success('Approved!')
        }
      }
    )
  }
  
  const handleReject = (entryIds, reason) => {
    reject(
      { entryIds, reason },
      {
        onSuccess: () => {
          toast.success('Rejected')
        }
      }
    )
  }
  
  return (
    <div>
      {pending?.map(entry => (
        <ApprovalCard
          key={entry.id}
          entry={entry}
          onApprove={() => handleApprove([entry.id])}
          onReject={(reason) => handleReject([entry.id], reason)}
        />
      ))}
    </div>
  )
}
```

---

## Development Workflow

### Step 1: Create Component Structure
```bash
# Create component file
touch next-app/app/components/TimePicker.tsx

# Create test file
touch next-app/app/components/__tests__/TimePicker.test.tsx
```

### Step 2: Define Props Interface
```typescript
interface TimePickerProps {
  value: string
  onChange: (time: string) => void
  min?: string
  max?: string
  interval?: number
  disabled?: boolean
}
```

### Step 3: Implement Component
```typescript
import { isValidTime, roundToNearestQuarter } from '@/lib/services'

export function TimePicker({ value, onChange, ...props }: TimePickerProps) {
  // Implementation
}
```

### Step 4: Add Tests
```typescript
describe('TimePicker', () => {
  it('should accept valid time', () => {
    render(<TimePicker value="09:00" onChange={vi.fn()} />)
    expect(screen.getByDisplayValue('09:00')).toBeInTheDocument()
  })
})
```

### Step 5: Integration Test
```typescript
// Test with form
render(
  <TimesheetEntryForm onSubmit={handleSubmit} />
)
```

---

## Common Imports You'll Need

```typescript
// Services & Utils
import {
  validateTimeEntry,
  calculateHoursBetween,
  isValidTime,
  calculateLeaveDays,
  validateLeaveRequestInput
} from '@/lib/services'

// Hooks
import {
  useMonthlyTimesheet,
  useCreateTimeEntry,
  useUpdateTimeEntry,
  useLeaveBalance,
  useCreateLeaveRequest,
  useApproveTimeEntries,
  usePendingApprovals,
  useTimer,
  useCountdownTimer,
  useStopwatch
} from '@/hooks'

// Types
import type {
  TimeEntryDTO,
  CreateTimeEntryDTO,
  LeaveRequestDTO,
  CreateLeaveRequestDTO
} from '@/app/timesheet/dtos'

// Config
import {
  TIMESHEET_DEFAULTS,
  LEAVE_DEFAULTS,
  WORK_TYPES,
  LEAVE_TYPES,
  ENTRY_STATUSES
} from '@/lib/config'
```

---

## Testing Each Component

### Component Test Template
```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TimePicker } from '../TimePicker'

describe('TimePicker', () => {
  it('should render time input', () => {
    render(<TimePicker value="09:00" onChange={vi.fn()} />)
    expect(screen.getByDisplayValue('09:00')).toBeInTheDocument()
  })

  it('should call onChange when time changes', async () => {
    const onChange = vi.fn()
    render(<TimePicker value="09:00" onChange={onChange} />)
    
    await userEvent.clear(screen.getByRole('textbox'))
    await userEvent.type(screen.getByRole('textbox'), '10:00')
    
    expect(onChange).toHaveBeenCalledWith('10:00')
  })

  it('should validate time input', async () => {
    const onChange = vi.fn()
    render(<TimePicker value="09:00" onChange={onChange} />)
    
    await userEvent.clear(screen.getByRole('textbox'))
    await userEvent.type(screen.getByRole('textbox'), 'invalid')
    
    // Should show error
    expect(screen.getByText(/invalid/i)).toBeInTheDocument()
  })
})
```

---

## Key Things to Remember

✅ **Use the services/hooks from Phase 1** - Don't rewrite functionality  
✅ **Follow existing TypeScript patterns** - Maintain consistency  
✅ **Write tests as you go** - 90%+ coverage target  
✅ **Use centralized config** - Reference `TIMESHEET_DEFAULTS`, etc.  
✅ **Handle errors gracefully** - Show meaningful messages  
✅ **Cache with React Query** - Leverage built-in optimization  

---

## Checklist for Phase 2

- [ ] Task 1: Time Picker Component (8h)
  - [ ] Component created
  - [ ] Tests written (90%+ coverage)
  - [ ] Integration tested
  - [ ] Documentation added

- [ ] Task 2: Timer Widget (6h)
  - [ ] Component created
  - [ ] Tests written
  - [ ] Floating position works
  - [ ] Time formatting correct

- [ ] Task 3: Enhanced Entry Forms (8h)
  - [ ] Form fields implemented
  - [ ] Validation working
  - [ ] Hook integration done
  - [ ] Error messages shown

- [ ] Task 4: Leave Request Interface (4h)
  - [ ] Leave types displaying
  - [ ] Date range picker working
  - [ ] Balance checking done
  - [ ] Submit working

- [ ] Task 5: Approval Management UI (4h)
  - [ ] Queue displaying
  - [ ] Approve/reject working
  - [ ] Status updates real-time
  - [ ] Batch operations working

---

## Expected Phase 2 Output

✅ 5 new React components  
✅ 20+ new test files  
✅ UI fully functional  
✅ Forms submitting to API  
✅ Real-time updates  
✅ 90%+ test coverage  
✅ Full documentation  

---

## Next Steps

1. **Review Phase 1 deliverables** - Understand services & hooks
2. **Check AGENTS.md** - Follow project conventions
3. **Create first component** - TimePicker (most independent)
4. **Test thoroughly** - Each component isolated
5. **Integrate with forms** - Chain components together

---

## Resources

**Phase 1 Documentation:**
- `PHASE1_COMPLETE_FINAL_REPORT.md` - Overview
- `PHASE1_TASK4_COMPLETE.md` - Services details
- `PHASE1_TASK5_COMPLETE.md` - Hooks details
- `PHASE1_TASK6_TESTING_COMPLETE.md` - Test details

**Code References:**
- `next-app/lib/services/` - Utility functions
- `next-app/hooks/` - React hooks
- `next-app/app/timesheet/` - Types & DTOs
- `next-app/lib/config.ts` - Configuration

---

## Questions?

Refer to:
1. **Type definitions** in `app/timesheet/dtos.ts`
2. **Service functions** in `lib/services/`
3. **Hook documentation** in `hooks/` files
4. **Test examples** in `__tests__/` folders

---

**Ready to Build Phase 2!** 🚀

Start with the **Time Picker Component** - it's the most independent and will be used by multiple other components.

Good luck! The foundation is solid.
