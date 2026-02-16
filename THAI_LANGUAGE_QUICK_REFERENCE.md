# Thai Language Support - Quick Reference Guide

## 🇹🇭 Thai Language Features Summary

### Core Improvements
1. **Enhanced Language Switcher** - Accessibility, i18n sync, custom events
2. **Locale-Aware Formatting** - Dates, numbers, currency with native Intl API
3. **Thai Buddhist Calendar** - Automatic year conversion (current year + 543)
4. **Comprehensive i18n** - All timesheet/leave labels in Thai & English
5. **Cross-Tab Synchronization** - Language preference syncs across browser tabs

---

## 📚 Hook Reference

### useLanguage()
**Purpose:** Manage language preference and get formatting helpers

```tsx
import { useLanguage } from '@/lib/hooks';

const {
  language,          // 'en' | 'th'
  setLanguage,       // (lang: 'en' | 'th') => void
  isThaiLanguage,    // boolean
  isEnglish,         // boolean
  toggleLanguage,    // () => void
  getLocale,         // () => 'th-TH' | 'en-US'
  formatDate,        // (date, options?) => string
  formatNumber,      // (num, options?) => string
  formatCurrency,    // (amount, currency?) => string
  isLoading,         // boolean
} = useLanguage();
```

### useThaiLocale()
**Purpose:** Thai-specific formatting and pre-translated labels

```tsx
import { useThaiLocale } from '@/lib/hooks';

const {
  isThaiLanguage,              // boolean
  thaiMonths,                  // { names, short }
  thaiDays,                    // { names, short }
  thaiWorkTypes,               // { general, project, training, leave, overtime }
  thaiLeaveTypes,              // { annual, sick, personal, maternity, unpaid }
  thaiStatuses,                // { draft, submitted, approved, rejected, pending }
  formatThaiDate,              // (date) => "17 กุมภาพันธ์ 2567"
  formatThaiDateWithDay,       // (date) => "จันทร์ 17 กุมภาพันธ์ 2567"
  formatTimeRange,             // (start, end) => "08:00 - 17:00"
  formatDuration,              // (hours) => "8.5 ชั่วโมง"
  formatHoursWithCost,         // (hours, cost) => "8 ชั่วโมง (4,000 บาท)"
  getWorkTypeLabel,            // (type) => "โครงการ" | "Project"
  getLeaveTypeLabel,           // (type) => "วันลาประจำปี" | "Annual Leave"
  getStatusLabel,              // (status) => "อนุมัติแล้ว" | "Approved"
} = useThaiLocale();
```

---

## 💻 Common Usage Patterns

### Pattern 1: Display Date in Thai Calendar
```tsx
import { useThaiLocale } from '@/lib/hooks';

export function TimesheetDate({ date }) {
  const { formatThaiDate, isThaiLanguage } = useThaiLocale();
  
  return (
    <span>
      {isThaiLanguage 
        ? formatThaiDate(date)                    // "17 กุมภาพันธ์ 2567"
        : formatDate(date, { 
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })                                      // "Feb 17, 2025"
      }
    </span>
  );
}
```

### Pattern 2: Show Hours & Cost
```tsx
import { useThaiLocale } from '@/lib/hooks';

export function HoursCost({ hours, cost }) {
  const { formatHoursWithCost } = useThaiLocale();
  
  return <span>{formatHoursWithCost(hours, cost)}</span>;
  // Thai: "8 ชั่วโมง (4,000 บาท)"
  // English: "8 hrs (฿4,000)"
}
```

### Pattern 3: Translate Work Type
```tsx
import { useThaiLocale } from '@/lib/hooks';

export function WorkTypeLabel({ type }) {
  const { getWorkTypeLabel, isThaiLanguage } = useThaiLocale();
  
  return <span>{getWorkTypeLabel(type)}</span>;
  // Thai: "โครงการ"
  // English: "project"
}
```

### Pattern 4: Format Currency
```tsx
import { useLanguage } from '@/lib/hooks';

export function CostCell({ amount }) {
  const { formatCurrency, isThaiLanguage } = useLanguage();
  
  return <span>{formatCurrency(amount, 'THB')}</span>;
  // Thai: "฿5,000.00"
  // English: "฿5,000.00"
}
```

### Pattern 5: i18n Translation Keys
```tsx
import { useTranslation } from 'react-i18next';

export function Button() {
  const { t } = useTranslation();
  
  return <button>{t('timesheet.parallelWorkDetected')}</button>;
  // Thai: "พบการทำงานขนาน"
  // English: "Parallel Work Detected"
}
```

---

## 🗂️ i18n Keys Available

### Timesheet Keys
```
timesheet.title
timesheet.parallelWorkDetected
timesheet.parallelWorkReason
timesheet.maxConcurrentProjects
timesheet.successCreated
timesheet.warningParallelWork
// ... and many more
```

### Work Type Keys
```
workTypes.general          // "งานทั่วไป" / "General Work"
workTypes.project          // "โครงการ" / "Project"
workTypes.training         // "การฝึกอบรม" / "Training"
workTypes.leave            // "วันลา" / "Leave"
workTypes.overtime         // "ชั่วโมงพิเศษ" / "Overtime"
```

### Leave Type Keys
```
leaveTypes.annual          // "วันลาประจำปี" / "Annual Leave"
leaveTypes.sick            // "วันลาป่วย" / "Sick Leave"
leaveTypes.personal        // "วันลาส่วนบุคคล" / "Personal Leave"
leaveTypes.maternity       // "วันลาคลอด" / "Maternity Leave"
leaveTypes.unpaid          // "วันลาไม่จ่ายเงิน" / "Unpaid Leave"
```

---

## 🎯 Recommended Component Updates

### Timesheet Entry Display
```tsx
// Before
<div>
  <p>{entry.date.toLocaleDateString()}</p>
  <p>8.5 ชั่วโมง</p>
  <p>4000 บาท</p>
</div>

// After
import { useThaiLocale } from '@/lib/hooks';
import { useTranslation } from 'react-i18next';

function TimesheetEntry({ entry }) {
  const { formatThaiDate, formatHoursWithCost } = useThaiLocale();
  const { t } = useTranslation();
  
  return (
    <div>
      <p>{formatThaiDate(new Date(entry.date))}</p>
      <p>{formatHoursWithCost(entry.hours, entry.cost)}</p>
      <p>{t('timesheet.status')}: {t(`common.${entry.status}`)}</p>
    </div>
  );
}
```

### Parallel Work Warning
```tsx
// Before
{entry.isConcurrent && (
  <span>⚠️ Parallel work - explain why</span>
)}

// After
import { useTranslation } from 'react-i18next';
import { useThaiLocale } from '@/lib/hooks';

function ParallelWorkWarning({ entry, reason }) {
  const { t } = useTranslation();
  const { isThaiLanguage } = useThaiLocale();
  
  return (
    entry.isConcurrent && (
      <div className="alert alert-warning">
        <p>{t('timesheet.warningParallelWork')}</p>
        <p>{t('timesheet.parallelWorkReason')}:</p>
        <p>{reason}</p>
      </div>
    )
  );
}
```

---

## 🌍 Thai Calendar & Number Formatting

### Thai Buddhist Year
- **Current Year (Gregorian):** 2025
- **Thai Buddhist Year:** 2025 + 543 = **2568**
- **Automatic in:** `formatThaiDate()`, `formatThaiDateWithDay()`

### Thai Number Formatting
```jsx
const { formatNumber } = useLanguage();

formatNumber(1234567)  // Thai: "1,234,567" (Thai uses same separators)
formatNumber(1234.56)  // Thai: "1,234.56"
```

### Thai Currency
```jsx
const { formatCurrency } = useLanguage();

formatCurrency(5000, 'THB')  // "฿5,000.00" (both languages)
```

---

## 🔄 Language Sync & Events

### Cross-Tab Synchronization
Language preference automatically syncs across browser tabs via localStorage

### Custom Language Change Event
```jsx
// Listen for language changes
window.addEventListener('languageChange', (e) => {
  console.log('New language:', e.detail.language);        // 'en' or 'th'
  console.log('Is Thai:', e.detail.isThaiLanguage);       // boolean
});
```

### Manual Language Change
```jsx
const { setLanguage } = useLanguage();

// Set to Thai
setLanguage('th');

// Set to English
setLanguage('en');

// Toggle
useLanguage().toggleLanguage();
```

---

## ✅ Checklist for Thai Implementation

### Phase 1: Core Setup (✅ DONE)
- [x] Enhanced LanguageSwitcher component
- [x] Enhanced useLanguage hook with formatters
- [x] New useThaiLocale hook
- [x] Enhanced i18n configuration
- [x] Added Thai translations to locales

### Phase 2: Apply to Components (TODO)
- [ ] Timesheet entry display (use `useThaiLocale`)
- [ ] Parallel work warnings (use Thai labels)
- [ ] Leave balance display (use Thai formatting)
- [ ] Cost/expense fields (use `formatCurrency`)

### Phase 3: Manager/Admin Interface (TODO)
- [ ] Approval status labels (Thai translations)
- [ ] Concurrent work badge display
- [ ] Date range filters with Thai calendar

### Phase 4: Testing & QA (TODO)
- [ ] Test all date displays (Buddhist calendar)
- [ ] Test number/currency formatting
- [ ] Test cross-tab language sync
- [ ] Accessibility audit

---

## 🐛 Troubleshooting

### Issue: Date not showing in Thai calendar
```jsx
// ❌ Wrong
<span>{new Date().toLocaleDateString()}</span>

// ✅ Correct
const { formatThaiDate } = useThaiLocale();
<span>{formatThaiDate(new Date())}</span>
```

### Issue: Currency showing wrong symbol
```jsx
// ❌ Wrong
<span>{amount} บาท</span>

// ✅ Correct
const { formatCurrency } = useLanguage();
<span>{formatCurrency(amount, 'THB')}</span>
```

### Issue: Language not persisting across tabs
```jsx
// Should work automatically via useLanguage hook
// If not, check:
localStorage.getItem('app-language')  // Should be 'en' or 'th'
```

---

## 📞 Support & Resources

- **Localization Files:** `next-app/app/lib/locales/{en,th}.json`
- **Hooks:** `next-app/lib/hooks/{useLanguage,useThaiLocale}.ts`
- **Component:** `next-app/components/LanguageSwitcher.tsx`
- **Documentation:** `LANGUAGE_SWITCHER_ENHANCEMENTS.md`

---

## 🎨 CSS Classes for Language-Specific Styling

```css
/* Apply styles only when Thai is active */
html.lang-thai .timesheet-entry {
  font-family: 'Noto Sans Thai', sans-serif;
  letter-spacing: 0.5px;
}

/* Apply styles only when English is active */
html.lang-english .timesheet-entry {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

---

**Last Updated:** Feb 16, 2025  
**Version:** 1.0  
**Status:** ✅ Ready for Implementation
