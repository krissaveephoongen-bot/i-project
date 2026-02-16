# Phase 2 Continuation Guide

## 🚀 Quick Start for Next Developer

Welcome! This document will get you up to speed in 5 minutes.

---

## 📌 Current Status

**Phase:** 2 of 2 (In Progress)  
**Completion:** 25% (1 of 8 components done)  
**Quality:** ✅ High (No issues)  
**Next Steps:** 2-3 hours of work remaining  

---

## 🎯 What Was Done

### Phase 1 (Complete ✅)
- Created `useThaiLocale` hook for Thai-specific formatting
- Enhanced `useLanguage` hook with locale formatters
- Added 80+ translation keys to i18n
- Enhanced LanguageSwitcher component
- Set up cross-tab language synchronization

### Phase 2 (In Progress ⏳)
- Enhanced TimesheetModal (100% complete)
  - Thai date formatting
  - Translated all UI labels
  - Updated parallel work warnings
- Started MonthlyView (50% complete)
  - Hook imports added
  - Formatting integration pending

---

## 🔧 How to Continue

### Step 1: Understand the System (5 min)

**Key Files:**
```
next-app/lib/hooks/
├── useLanguage.ts        ← Base language management
└── useThaiLocale.ts      ← Thai-specific formatting

next-app/app/lib/
├── i18n.ts               ← i18n configuration
└── locales/
    ├── th.json           ← Thai translations (80+ keys)
    └── en.json           ← English translations (80+ keys)

next-app/components/
└── LanguageSwitcher.tsx  ← Language selector

next-app/app/timesheet/components/
├── TimesheetModal.tsx    ✅ DONE - Use as template
├── MonthlyView.tsx       ⏳ IN PROGRESS
├── WeeklyView.tsx        ⏳ NEXT
└── ActivityLog.tsx       ⏳ NEXT
```

**Key Pattern:**
```tsx
// 1. Import hooks
import { useThaiLocale } from '@/lib/hooks/useThaiLocale';
import { useTranslation } from 'react-i18next';

// 2. Use in component
const { formatThaiDate, formatNumber } = useThaiLocale();
const { t } = useTranslation();

// 3. Apply formatting
<span>{formatThaiDate(new Date())}</span>
<label>{t('timesheet.title')}</label>
```

### Step 2: Complete Remaining Components (2-3 hours)

**Quick Task List:**
1. [ ] MonthlyView - Apply `formatNumber` to hour displays
2. [ ] WeeklyView - Add Thai dates + i18n labels
3. [ ] ActivityLog - Format timestamps + translate labels
4. [ ] Timesheet Pages - Add currency formatting + titles
5. [ ] Approval Interface - Create with full Thai support
6. [ ] Testing - Browser test in Thai + English

### Step 3: Test Everything (30-45 min)

**Testing Checklist:**
```
□ Switch to Thai language → All text translates
□ Switch to English language → All text translates
□ Dates show as "DD MMM YYYY" in Thai (Buddhist calendar)
□ Numbers format with proper separators
□ Currency shows with ฿ symbol
□ Parallel work warnings display correctly
□ No console errors or warnings
□ All form submissions work
□ Mobile responsive (if applicable)
```

### Step 4: Commit and Deploy

Use template:
```
feat: Complete Thai language support for timesheet (Phase 2)

- Enhanced all timesheet components with Thai localization
- Implemented Thai Buddhist calendar dates (year + 543)
- Added i18n support for all UI labels
- Integrated locale-aware number and currency formatting
- Full cross-language testing completed
```

---

## 📚 Documentation Map

### For Reference
- **API Reference:** `THAI_LANGUAGE_QUICK_REFERENCE.md`
  - All available hooks
  - Common usage patterns
  - Translation key lists

- **Technical Details:** `LANGUAGE_SWITCHER_ENHANCEMENTS.md`
  - Complete architecture
  - Integration checklist
  - Testing recommendations

- **Implementation Plan:** `IMPLEMENTATION_NEXT_STEPS.md`
  - Priority breakdown
  - Code examples
  - Timelines

### For Tracking Progress
- **Session Summary:** `PHASE2_SESSION_SUMMARY.md`
  - What was completed
  - What's pending
  - Quality metrics

- **Quick Checklist:** `PHASE2_CHECKLIST.md`
  - Immediate next tasks
  - Common code patterns
  - Troubleshooting tips

- **Progress Log:** `PHASE2_PROGRESS.md`
  - Component-by-component status
  - Translation keys used
  - Testing notes

---

## 💡 Copy-Paste Templates

### Template 1: Enhance a Component
```tsx
'use client';

// Add these imports
import { useThaiLocale } from '@/lib/hooks/useThaiLocale';
import { useTranslation } from 'react-i18next';

// In component function
const { formatThaiDate, formatNumber } = useThaiLocale();
const { t } = useTranslation();

// Use in JSX
<span>{formatThaiDate(new Date(date))}</span>
<label>{t('timesheet.project')}</label>
<span>{formatNumber(amount, { maximumFractionDigits: 1 })}</span>
```

### Template 2: Format Currency
```tsx
const { formatCurrency } = useLanguage();

<span>{formatCurrency(5000, 'THB')}</span>
// Thai: "฿5,000.00"
// English: "฿5,000.00"
```

### Template 3: Conditional Thai/English
```tsx
const { isThaiLanguage } = useThaiLocale();

{isThaiLanguage ? (
  <span>{formatThaiDate(date)}</span>
) : (
  <span>{formatDate(date)}</span>
)}
```

---

## 🚨 Common Mistakes to Avoid

### ❌ DON'T
```tsx
// Don't use hardcoded Thai
<span>โครงการ</span>

// Don't use toLocaleDateString
<span>{date.toLocaleDateString()}</span>

// Don't hardcode currency symbols
<span>{amount} บาท</span>
```

### ✅ DO
```tsx
// Use i18n
<span>{t('timesheet.project')}</span>

// Use formatThaiDate
<span>{formatThaiDate(date)}</span>

// Use formatCurrency
<span>{formatCurrency(amount, 'THB')}</span>
```

---

## 🧪 Quick Testing

### In Browser Console
```javascript
// 1. Check current language
localStorage.getItem('app-language')  // 'th' or 'en'

// 2. Switch language
localStorage.setItem('app-language', 'th');
// Page reloads - should show Thai

localStorage.setItem('app-language', 'en');
// Page reloads - should show English

// 3. Test date formatting
// Thai Buddhist year should be current + 543
// Feb 17, 2025 should show as "17 กุมภาพันธ์ 2567"
```

---

## 📋 Component Status Reference

```
✅ COMPLETE
- LanguageSwitcher       (Phase 1 - fully featured)
- useLanguage            (Phase 1 - all helpers)
- useThaiLocale          (Phase 1 - all formatters)
- TimesheetModal         (Phase 2 - 100% done)

⏳ IN PROGRESS
- MonthlyView            (Phase 2 - 50% done)

📋 TODO NEXT
- WeeklyView             (Phase 2 - 20-30 min)
- ActivityLog            (Phase 2 - 20-30 min)
- TimesheetPage          (Phase 2 - 30-45 min)
- PageNew                (Phase 2 - 15-20 min)
- Approval Interface     (Phase 2 - 45 min)
- Testing & QA           (Phase 2 - 45 min)
```

---

## 🎯 Remaining Work Breakdown

### Easy (5-10 min each)
1. MonthlyView - Apply formatNumber to hours
2. WeeklyView - Replace date formatting

### Medium (20-30 min each)
3. ActivityLog - Format timestamps
4. TimesheetPage - Add currency + i18n
5. PageNew - Add currency + i18n

### Moderate (30-45 min)
6. Approval Interface - Create component with full support

### QA (30-45 min)
7. Browser testing (Thai + English)
8. Cross-browser compatibility
9. Mobile testing

**Total:** 2-3 hours

---

## 🔗 Quick Links

### Key Files to Review
1. `next-app/app/timesheet/components/TimesheetModal.tsx` ← Template to follow
2. `next-app/lib/hooks/useThaiLocale.ts` ← Understand available formatters
3. `next-app/app/lib/locales/th.json` ← See available translation keys
4. `THAI_LANGUAGE_QUICK_REFERENCE.md` ← API reference

### Files to Edit Next
1. `next-app/app/timesheet/components/WeeklyView.tsx` ← Start here
2. `next-app/app/timesheet/components/ActivityLog.tsx` ← Then this
3. `next-app/app/timesheet/components/MonthlyView.tsx` ← Complete this
4. `next-app/app/timesheet/page.tsx` ← Main page
5. `/admin/timesheet-approvals` ← If it exists, create if needed

---

## 💬 Questions?

### "How do I format a date in Thai?"
```tsx
const { formatThaiDate } = useThaiLocale();
<span>{formatThaiDate(new Date(date))}</span>
// Output: "17 กุมภาพันธ์ 2567"
```

### "How do I translate a label?"
```tsx
const { t } = useTranslation();
<label>{t('timesheet.project')}</label>
// Automatically switches with language
```

### "How do I format numbers/currency?"
```tsx
const { formatNumber, formatCurrency } = useLanguage();
<span>{formatNumber(8.5)}</span>
<span>{formatCurrency(5000, 'THB')}</span>
```

### "What translation keys are available?"
See `THAI_LANGUAGE_QUICK_REFERENCE.md` for complete list

### "How do I test in Thai?"
In browser console: `localStorage.setItem('app-language', 'th');`

---

## 🏁 Success Checklist

When you're done with Phase 2:

- [ ] All 8 components enhanced with Thai support
- [ ] All dates show in Thai Buddhist calendar
- [ ] All labels translated to Thai/English
- [ ] All numbers formatted with proper locale
- [ ] All currency showing with proper symbols
- [ ] No console errors or warnings
- [ ] Tested in both Thai and English languages
- [ ] Tested on multiple browsers
- [ ] Code follows style guide
- [ ] Pull request created with proper description

---

## 📞 Support

- **Documentation:** See THAI_LANGUAGE_QUICK_REFERENCE.md
- **Examples:** See PHASE2_CHECKLIST.md (Code Patterns section)
- **Progress Tracking:** See PHASE2_PROGRESS.md
- **Implementation Plan:** See IMPLEMENTATION_NEXT_STEPS.md

---

## 🚀 Ready to Start?

1. Read this guide (✓ You're here)
2. Open `next-app/app/timesheet/components/TimesheetModal.tsx` - see what was done
3. Start with `WeeklyView.tsx` - it's the easiest
4. Follow the template from TimesheetModal
5. Test in browser (Thai + English)
6. Move to next component
7. Repeat until all 8 are done
8. Final QA and commit

**Estimated Time:** 2-3 hours  
**Difficulty:** Medium (but well documented)  
**Quality:** Maintain current standards  

---

**Last Updated:** February 16, 2025  
**Status:** Ready for Continuation  
**Next Milestone:** Complete WeeklyView  
**Estimated Completion:** Feb 16, 2025 EOD
