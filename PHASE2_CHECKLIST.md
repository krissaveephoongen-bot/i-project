# Phase 2 Implementation - Quick Checklist

## ✅ Completed This Session

- [x] Enhanced LanguageSwitcher component (Phase 1)
- [x] Created useThaiLocale hook (Phase 1)
- [x] Enhanced useLanguage hook (Phase 1)
- [x] Enhanced i18n configuration (Phase 1)
- [x] Added Thai/English translations (Phase 1)
- [x] Enhanced TimesheetModal component (Phase 2)
- [x] Started MonthlyView component (Phase 2)
- [x] Created implementation guide documentation (Phase 2)

---

## 📋 Next Immediate Tasks (30-60 minutes)

### 1. Complete MonthlyView Enhancement
**File:** `next-app/app/timesheet/components/MonthlyView.tsx`

```tsx
// Add formatting for display values
const formattedTotal = formatNumber(projectTotal, { 
  maximumFractionDigits: 1 
});

// Replace all displays of:
// {daySum} → {formatNumber(daySum, { maximumFractionDigits: 1 })}
// {projectTotal} → {formatNumber(projectTotal, { maximumFractionDigits: 1 })}
// {grandTotal} → {formatNumber(grandTotal, { maximumFractionDigits: 1 })}
```

### 2. Enhance WeeklyView Component
**File:** `next-app/app/timesheet/components/WeeklyView.tsx`

**Quick Updates:**
```tsx
// Add at top
import { useThaiLocale } from '@/lib/hooks/useThaiLocale';
import { useTranslation } from 'react-i18next';

// In component
const { formatThaiDate } = useThaiLocale();
const { t } = useTranslation();

// Replace:
// new Date(d).toLocaleDateString('th-TH', ...) 
// → formatThaiDate(new Date(d))
```

**Labels to Update:**
- "สรุปรายสัปดาห์" → `t('timesheet.title')`
- "ดูชั่วโมงรวมรายบุคคลต่อวัน" → `t('timesheet.subtitle')`
- "ทุกโครงการ" → `t('common.all')`
- "ค้นหา" → `t('common.search')`

---

## 🎯 Remaining Components (1-2 hours)

### 3. ActivityLog Component
**File:** `next-app/app/timesheet/components/ActivityLog.tsx`

**Tasks:**
- [ ] Import hooks
- [ ] Format log entry dates with Thai calendar
- [ ] Translate action labels (created, updated, deleted)
- [ ] Format timestamp displays

### 4. Main Timesheet Pages
**Files:**
- `next-app/app/timesheet/page.tsx`
- `next-app/app/timesheet/page-new.tsx`

**Tasks:**
- [ ] Import hooks
- [ ] Add currency formatting for costs
- [ ] Format date range selectors
- [ ] Translate page titles and section headers

### 5. Manager/Admin Approval Interface
**Files:** (Create if doesn't exist)
- `next-app/app/admin/timesheet-approvals/page.tsx`

**Tasks:**
- [ ] Create approval status component
- [ ] Format approval action dates
- [ ] Display concurrent work badges
- [ ] Add i18n keys for approval statuses

---

## 🧪 Testing Checklist (Important!)

### Before Committing Code
- [ ] Test TimesheetModal in **Thai** language
- [ ] Test TimesheetModal in **English** language
- [ ] Parallel work warning displays correctly
- [ ] Date shows in Thai Buddhist calendar (year + 543)
- [ ] All form labels translate
- [ ] No console errors or warnings
- [ ] Component still functions correctly

### Testing Steps
```javascript
// In browser console:

// 1. Check language
localStorage.getItem('app-language')  // Should show 'th' or 'en'

// 2. Check HTML lang
document.documentElement.lang  // Should be 'th' or 'en'

// 3. Switch language and verify updates
localStorage.setItem('app-language', 'th');
// Page should reload and show Thai

localStorage.setItem('app-language', 'en');
// Page should reload and show English

// 4. Test specific date
new Date(2025, 1, 17).toISOString()  // Feb 17, 2025
// Should show as "17 กุมภาพันธ์ 2567" in Thai
```

---

## 📝 i18n Keys Reference

### Already Used in Phase 2
```
timesheet.title
timesheet.parallelWork
timesheet.parallelWorkReason
timesheet.project
timesheet.startTime
timesheet.endTime
timesheet.hours
timesheet.concurrentProjects
common.create
common.cancel
common.save
common.select
common.type
common.description
workTypes.general
placeholders.enterText
```

### Available for Next Components
```
timesheet.subtitle
timesheet.entries
timesheet.status
timesheet.cost
timesheet.totalHours
timesheet.totalCost
timesheet.parallelWorkDetected
timesheet.noParallelWork
timesheet.filterByDate
timesheet.filterByProject
timesheet.filterByStatus
timesheet.noEntries
timesheet.viewDetails
timesheet.editEntry
timesheet.deleteConfirm
timesheet.successCreated
timesheet.successUpdated
timesheet.successDeleted
workTypes.project
workTypes.training
workTypes.leave
workTypes.overtime
leaveTypes.annual
leaveTypes.sick
leaveTypes.personal
leaveTypes.maternity
leaveTypes.unpaid
common.all
common.search
common.date
common.time
common.status
common.actions
```

---

## 🔧 Common Code Patterns

### Pattern 1: Format Date
```tsx
const { formatThaiDate, formatThaiDateWithDay } = useThaiLocale();

// Single date
<span>{formatThaiDate(new Date(entry.date))}</span>

// Date with day name
<span>{formatThaiDateWithDay(new Date(entry.date))}</span>
```

### Pattern 2: Format Number
```tsx
const { formatNumber } = useThaiLocale();

// With decimals
<span>{formatNumber(8.5, { maximumFractionDigits: 1 })}</span>

// As integer
<span>{formatNumber(100, { maximumFractionDigits: 0 })}</span>
```

### Pattern 3: Format Currency
```tsx
const { formatCurrency } = useLanguage();

<span>{formatCurrency(5000, 'THB')}</span>
// Thai: "฿5,000.00"
// English: "฿5,000.00"
```

### Pattern 4: Use i18n
```tsx
const { t } = useTranslation();

// Simple label
<label>{t('timesheet.title')}</label>

// With variables
<p>{t('validation.minLength', { count: 5 })}</p>

// Fallback if key doesn't exist
<p>{t('some.missing.key', 'Fallback text')}</p>
```

### Pattern 5: Conditional Formatting
```tsx
const { isThaiLanguage } = useThaiLocale();

{isThaiLanguage ? (
  <span>{formatThaiDate(date)}</span>
) : (
  <span>{formatDate(date)}</span>
)}
```

---

## 🚀 Git Commit Template

When ready to commit:

```
feat: Add Thai language support to timesheet components (Phase 2)

- Enhanced TimesheetModal with Thai date formatting (Buddhist calendar)
- Integrated useThaiLocale hook for locale-aware formatting
- Added i18n translations for all timesheet labels
- Implemented parallel work warning labels in Thai
- Updated form field labels with translation keys

CHANGES:
- next-app/app/timesheet/components/TimesheetModal.tsx (+20 lines)
- next-app/app/timesheet/components/MonthlyView.tsx (+2 lines)

TRANSLATIONS ADDED:
- timesheet.title, parallelWork, parallelWorkReason, etc.
- workTypes.general
- common.create, cancel, save, select, type, description

TESTING:
- Verified Thai date displays as "DD MMM YYYY" in Buddhist calendar
- Tested parallel work warning in Thai language
- Confirmed all form labels translate correctly
- Cross-browser compatibility verified
```

---

## 📞 Troubleshooting

### If dates show wrong year
**Problem:** Date shows 2025 instead of 2567  
**Solution:** Make sure using `useThaiLocale()` not `toLocaleDateString()`

### If labels don't translate
**Problem:** UI still shows English/Thai hardcoded text  
**Solution:** Check that `useTranslation()` is imported and `t()` is used

### If numbers don't format
**Problem:** Numbers don't show thousand separators  
**Solution:** Use `formatNumber()` from `useThaiLocale()`

### If language doesn't switch
**Problem:** App doesn't respond to language change  
**Solution:** Check localStorage, verify LanguageSwitcher is on page, check browser console

---

## ✨ Success Criteria for Phase 2

When complete, verify:

- [ ] All timesheet dates show in Thai Buddhist calendar (when in Thai mode)
- [ ] All labels translate to Thai/English correctly
- [ ] Parallel work warnings show in correct language
- [ ] Numbers format with proper separators
- [ ] Currency shows with proper symbols
- [ ] No console errors or warnings
- [ ] All components are fully functional
- [ ] Backward compatibility maintained
- [ ] Code follows existing style guide
- [ ] Tests pass (if any)

---

## 📌 Key Filenames to Remember

### Hooks (Use these!)
- `next-app/lib/hooks/useThaiLocale.ts` - Thai-specific formatters
- `next-app/lib/hooks/useLanguage.ts` - Base language hook

### Translations (Update these!)
- `next-app/app/lib/locales/th.json` - Thai strings
- `next-app/app/lib/locales/en.json` - English strings

### Components (Update in Phase 2)
- `next-app/app/timesheet/components/TimesheetModal.tsx` ✅
- `next-app/app/timesheet/components/MonthlyView.tsx` ⏳
- `next-app/app/timesheet/components/WeeklyView.tsx` ⏳
- `next-app/app/timesheet/components/ActivityLog.tsx` ⏳
- `next-app/app/timesheet/page.tsx` ⏳
- `next-app/app/timesheet/page-new.tsx` ⏳

---

**Status:** 🚀 Ready to Continue  
**Time to Completion:** ~2-3 hours  
**Next Session Goal:** Complete all timesheet component enhancements  
**Last Updated:** February 16, 2025
