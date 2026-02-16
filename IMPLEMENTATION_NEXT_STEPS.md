# Language Switcher Enhancement - Implementation Next Steps

## Summary of Changes ✅

All foundational work for Thai language support has been completed:

### Files Created:
1. ✅ `next-app/lib/hooks/useThaiLocale.ts` - Thai-specific formatting and labels
2. ✅ `next-app/lib/hooks/index.ts` - Barrel export for hooks
3. ✅ `LANGUAGE_SWITCHER_ENHANCEMENTS.md` - Comprehensive documentation
4. ✅ `THAI_LANGUAGE_QUICK_REFERENCE.md` - Quick reference guide
5. ✅ `IMPLEMENTATION_NEXT_STEPS.md` - This file

### Files Enhanced:
1. ✅ `next-app/components/LanguageSwitcher.tsx` - Added accessibility, events, CSS classes
2. ✅ `next-app/lib/hooks/useLanguage.ts` - Added formatters, cross-tab sync, validation
3. ✅ `next-app/app/lib/i18n.ts` - Added sync with useLanguage, storage listeners
4. ✅ `next-app/app/lib/locales/th.json` - Added timesheet, leave, work types, leave types
5. ✅ `next-app/app/lib/locales/en.json` - Added timesheet, leave, work types, leave types

---

## Immediate Next Steps (Priority: HIGH)

### 1. Update Timesheet Entry Display Component
**Priority:** HIGH  
**Time Estimate:** 30-45 minutes  
**Files to Update:** `next-app/features/timesheet/components/TimesheetEntry.tsx` (or similar)

**Changes:**
```tsx
// BEFORE
<div className="date">{entry.date}</div>

// AFTER
import { useThaiLocale } from '@/lib/hooks';

function TimesheetEntry({ entry }) {
  const { formatThaiDate } = useThaiLocale();
  return <div className="date">{formatThaiDate(new Date(entry.date))}</div>;
}
```

**All date fields to update:**
- Entry date
- Date range in filters
- Approval dates
- Submission dates

### 2. Update Cost/Budget Display
**Priority:** HIGH  
**Time Estimate:** 20-30 minutes  
**Files to Update:** Any component showing costs/amounts

**Changes:**
```tsx
// BEFORE
<span>{entry.cost} ฿</span>

// AFTER
import { useLanguage } from '@/lib/hooks';

function CostDisplay({ cost }) {
  const { formatCurrency } = useLanguage();
  return <span>{formatCurrency(cost, 'THB')}</span>;
}
```

### 3. Update Parallel Work Badge/Warning
**Priority:** HIGH  
**Time Estimate:** 20-30 minutes  
**Files to Update:** `next-app/features/timesheet/components/ParallelWorkBadge.tsx` (or similar)

**Changes:**
```tsx
// BEFORE
{isConcurrent && <span>Parallel Work - {reason}</span>}

// AFTER
import { useTranslation } from 'react-i18next';
import { useThaiLocale } from '@/lib/hooks';

function ParallelWorkBadge({ isConcurrent, reason }) {
  const { t } = useTranslation();
  const { isThaiLanguage } = useThaiLocale();
  
  return (
    isConcurrent && (
      <div className="alert alert-warning">
        <p>{t('timesheet.warningParallelWork')}</p>
        <p><strong>{t('timesheet.parallelWorkReason')}:</strong></p>
        <p>{reason}</p>
      </div>
    )
  );
}
```

### 4. Update Work Type Labels
**Priority:** MEDIUM  
**Time Estimate:** 15-20 minutes  
**Files to Update:** Components displaying work types

**Changes:**
```tsx
// BEFORE
<span>{entry.workType}</span>

// AFTER
import { useThaiLocale } from '@/lib/hooks';

function WorkTypeDisplay({ type }) {
  const { getWorkTypeLabel } = useThaiLocale();
  return <span>{getWorkTypeLabel(type)}</span>;
}
```

---

## Secondary Implementation (Priority: MEDIUM)

### 5. Update Leave Type Labels
**Priority:** MEDIUM  
**Time Estimate:** 15-20 minutes  

**Apply similar pattern to work types:**
```tsx
const { getLeaveTypeLabel } = useThaiLocale();
<span>{getLeaveTypeLabel(leaveType)}</span>
```

### 6. Update Status Labels
**Priority:** MEDIUM  
**Time Estimate:** 15-20 minutes  

**Changes:**
```tsx
const { getStatusLabel } = useThaiLocale();
<span>{getStatusLabel(status)}</span>
// Or use i18n:
const { t } = useTranslation();
<span>{t(`common.${status}`)}</span>
```

### 7. Update Time Range Display
**Priority:** MEDIUM  
**Time Estimate:** 10-15 minutes  

**Changes:**
```tsx
// BEFORE
<span>{entry.startTime} - {entry.endTime}</span>

// AFTER
import { useThaiLocale } from '@/lib/hooks';

function TimeRange({ startTime, endTime }) {
  const { formatTimeRange } = useThaiLocale();
  return <span>{formatTimeRange(startTime, endTime)}</span>;
}
```

### 8. Update Hours Duration Display
**Priority:** MEDIUM  
**Time Estimate:** 15-20 minutes  

**Changes:**
```tsx
// BEFORE
<span>{hours} ชั่วโมง</span>

// AFTER
import { useThaiLocale } from '@/lib/hooks';

function HoursDisplay({ hours }) {
  const { formatDuration } = useThaiLocale();
  return <span>{formatDuration(hours)}</span>;
}
```

### 9. Update Hours + Cost Display
**Priority:** MEDIUM  
**Time Estimate:** 10-15 minutes  

**Changes:**
```tsx
// BEFORE
<span>{hours} ชั่วโมง ({cost} บาท)</span>

// AFTER
import { useThaiLocale } from '@/lib/hooks';

function HoursCostDisplay({ hours, cost }) {
  const { formatHoursWithCost } = useThaiLocale();
  return <span>{formatHoursWithCost(hours, cost)}</span>;
}
```

---

## Manager/Admin Interface (Priority: MEDIUM-HIGH)

### 10. Update Approval Status Display
**Priority:** MEDIUM-HIGH  
**Time Estimate:** 25-35 minutes  
**Files:** `/admin/timesheet-approvals` page components

**Required updates:**
- Approval status labels (draft, submitted, approved, rejected)
- Concurrent work badge in approval list
- Approval timestamp formatting
- Action buttons (approve, reject)

**Sample Code:**
```tsx
import { useTranslation } from 'react-i18next';
import { useThaiLocale } from '@/lib/hooks';

function ApprovalStatus({ entry }) {
  const { t } = useTranslation();
  const { formatThaiDate, isThaiLanguage } = useThaiLocale();
  
  return (
    <div className="approval-row">
      <div className="date">{formatThaiDate(new Date(entry.date))}</div>
      <div className="status">{t(`timesheet.approval${entry.status}`)}</div>
      {entry.isConcurrent && (
        <div className="badge">{t('timesheet.parallelWorkDetected')}</div>
      )}
      <div className="actions">
        <button onClick={() => approve(entry)}>
          {t('timesheet.approve')}
        </button>
        <button onClick={() => reject(entry)}>
          {t('timesheet.reject')}
        </button>
      </div>
    </div>
  );
}
```

---

## Testing Checklist

### Date Formatting Testing
- [ ] Single entry displays date in Thai calendar (year + 543)
- [ ] Date range shows correct Thai dates
- [ ] Year formatting correct (e.g., 2567 for 2025)
- [ ] Month names in Thai spell correctly
- [ ] Day names display correctly with `formatThaiDateWithDay`
- [ ] English dates still format correctly

### Localization Testing
- [ ] All i18n keys render in Thai
- [ ] All i18n keys render in English
- [ ] Parallel work warning shows "พบการทำงานขนาน"
- [ ] Status labels translate correctly
- [ ] Work type labels translate correctly

### Number/Currency Testing
- [ ] Hours display with correct format (both languages)
- [ ] Currency shows with Thai currency symbol (฿)
- [ ] Thousands separator correct
- [ ] Decimal places correct (2 for currency, 1 for hours)

### Cross-Language Testing
- [ ] Switch language using LanguageSwitcher
- [ ] All dates update to correct language
- [ ] All labels update to correct language
- [ ] localStorage updates correctly
- [ ] HTML lang attribute updates
- [ ] CSS classes update (lang-thai/lang-english)

### Accessibility Testing
- [ ] LanguageSwitcher has aria-label attributes
- [ ] HTML lang attribute updates on switch
- [ ] Screen reader announces language change
- [ ] Keyboard navigation works
- [ ] Focus management correct

### Cross-Tab Testing
- [ ] Open 2 browser tabs
- [ ] Switch language in Tab 1
- [ ] Tab 2 automatically updates language
- [ ] Both tabs show same language
- [ ] localStorage syncs correctly

---

## File Discovery Guide

### To Find Components Using:

**Date Display:**
```bash
grep -r "toLocaleDateString\|new Date()\|entry.date" next-app/features/timesheet
```

**Cost/Amount Display:**
```bash
grep -r "formatCurrency\|cost\|amount\|price" next-app/features/timesheet
```

**Work Type Display:**
```bash
grep -r "workType\|work_type\|WORK_TYPES" next-app/features/timesheet
```

**Status Display:**
```bash
grep -r "status\|STATUS\|approved\|rejected" next-app/features/timesheet
```

---

## Implementation Timeline

### Day 1 (Today)
- [x] Complete LanguageSwitcher enhancements
- [x] Create useThaiLocale hook
- [x] Update i18n configuration
- [x] Add Thai translations
- [x] Create documentation

### Day 2 (Next)
- [ ] Update timesheet entry display (HIGH priority)
- [ ] Update cost/budget display (HIGH priority)
- [ ] Update parallel work warning (HIGH priority)
- [ ] Test date formatting

### Day 3
- [ ] Update work/leave type labels (MEDIUM priority)
- [ ] Update status labels (MEDIUM priority)
- [ ] Test localization
- [ ] Test cross-language switching

### Day 4
- [ ] Update manager/admin approval interface (MEDIUM-HIGH priority)
- [ ] Test approval status displays
- [ ] Cross-tab sync testing

### Day 5
- [ ] QA & accessibility testing
- [ ] Performance testing
- [ ] Final adjustments

---

## Code Examples for Components

### Example 1: Timesheet Entry Card
```tsx
import { useThaiLocale } from '@/lib/hooks';
import { useTranslation } from 'react-i18next';

function TimesheetEntryCard({ entry }) {
  const { formatThaiDate, formatHoursWithCost, getWorkTypeLabel } = useThaiLocale();
  const { t } = useTranslation();
  
  return (
    <div className="card">
      <div className="header">
        <span className="date">{formatThaiDate(new Date(entry.date))}</span>
        <span className="type">{getWorkTypeLabel(entry.workType)}</span>
      </div>
      <div className="body">
        <p><strong>{t('timesheet.project')}:</strong> {entry.projectName}</p>
        <p><strong>{t('timesheet.duration')}:</strong> {formatHoursWithCost(entry.hours, entry.cost)}</p>
        <p><strong>{t('timesheet.description')}:</strong> {entry.description}</p>
      </div>
      {entry.isConcurrent && (
        <div className="warning">
          {t('timesheet.warningParallelWork')}
          <p>{entry.concurrentReason}</p>
        </div>
      )}
    </div>
  );
}
```

### Example 2: Approval Status Row
```tsx
import { useThaiLocale } from '@/lib/hooks';
import { useTranslation } from 'react-i18next';

function ApprovalRow({ entry }) {
  const { formatThaiDate, isThaiLanguage } = useThaiLocale();
  const { t } = useTranslation();
  
  return (
    <tr>
      <td>{formatThaiDate(new Date(entry.date))}</td>
      <td>{entry.employeeName}</td>
      <td>{entry.projectName}</td>
      <td>{t(`timesheet.approval${entry.status}`)}</td>
      <td>
        {entry.isConcurrent && (
          <span className="badge">{t('timesheet.parallelWorkDetected')}</span>
        )}
      </td>
      <td className="actions">
        <button onClick={() => approve(entry)}>
          {t('timesheet.approve')}
        </button>
        <button onClick={() => reject(entry)}>
          {t('timesheet.reject')}
        </button>
      </td>
    </tr>
  );
}
```

---

## Rollback Plan

If any issues occur:

1. **Revert LanguageSwitcher.tsx** - Language selection will work but without new features
2. **Revert useLanguage.ts** - Basic language preference still works
3. **Revert i18n.ts** - i18n will work with older config
4. **Remove useThaiLocale calls** - Use direct formatting instead
5. **Remove new translation keys** - Use fallback English

All changes are backward compatible and can be rolled back individually.

---

## Support & Questions

**Quick Reference Files:**
- `LANGUAGE_SWITCHER_ENHANCEMENTS.md` - Full documentation
- `THAI_LANGUAGE_QUICK_REFERENCE.md` - Quick lookup guide
- `next-app/lib/hooks/useThaiLocale.ts` - Implementation details

**Key API Reference:**
- `useLanguage()` - Base language hook
- `useThaiLocale()` - Thai-specific helpers
- `useTranslation()` from react-i18next - Translate strings

---

## Success Metrics

✅ All improvements complete when:
1. All date displays show Thai Buddhist calendar
2. All currency displays use proper formatting
3. All labels translate to Thai correctly
4. Language switching works with custom events
5. Cross-tab sync works
6. All tests pass
7. No console errors or warnings

---

**Generated:** Feb 16, 2025  
**Status:** Ready for Phase 2 Implementation  
**Estimated Effort:** 4-6 hours development + 2-3 hours testing
