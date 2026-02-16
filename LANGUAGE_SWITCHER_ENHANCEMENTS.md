# Language Switcher & Localization Enhancements

## Overview
Enhanced the LanguageSwitcher component and localization system to provide robust Thai language support with proper locale-aware date/time/number formatting, accessibility features, and comprehensive i18n integration.

## Changes Made

### 1. **Enhanced LanguageSwitcher Component**
**File:** `next-app/components/LanguageSwitcher.tsx`

**Improvements:**
- ✅ HTML lang attribute management for accessibility
- ✅ Thai-specific CSS class application (`lang-thai`, `lang-english`)
- ✅ Custom event dispatch for language changes
- ✅ ARIA labels and attributes for accessibility
- ✅ Optional label display (`showLabel` prop)
- ✅ Loading state with proper accessibility
- ✅ Locale detection for Intl API support

**Key Features:**
```tsx
// Language switching with accessibility
<LanguageSwitcher 
  variant="outline" 
  size="sm"
  showLabel={true} // Shows "English" / "ไทย" instead of "EN" / "TH"
/>

// Custom event listening
window.addEventListener('languageChange', (e) => {
  console.log(e.detail.language); // 'en' or 'th'
  console.log(e.detail.isThaiLanguage); // boolean
});
```

### 2. **Enhanced useLanguage Hook**
**File:** `next-app/lib/hooks/useLanguage.ts`

**New Capabilities:**
- ✅ Cross-tab localStorage synchronization (via `storage` event)
- ✅ Browser locale auto-detection on first load
- ✅ Input validation for language codes
- ✅ Session storage for locale information
- ✅ **New locale formatting helpers:**
  - `getLocale()` - returns locale string ('th-TH' | 'en-US')
  - `formatDate(date, options?)` - format dates in current locale
  - `formatNumber(num, options?)` - format numbers in current locale
  - `formatCurrency(amount, currency?)` - format currency with proper symbols

**Usage Example:**
```tsx
const { 
  language, 
  setLanguage, 
  isThaiLanguage,
  formatDate,      // NEW
  formatCurrency,  // NEW
} = useLanguage();

// Auto-formatted to Thai/English based on language
const today = formatDate(new Date(), { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
});

const cost = formatCurrency(5000, 'THB'); 
// Thai: "฿5,000.00" | English: "฿5,000.00"
```

### 3. **New useThaiLocale Hook**
**File:** `next-app/lib/hooks/useThaiLocale.ts`

**Features:**
- ✅ Thai Buddhist calendar support (year + 543)
- ✅ Thai month/day names with proper spelling
- ✅ Pre-translated work type labels (งาน, โครงการ, การฝึกอบรม, etc.)
- ✅ Pre-translated leave type labels
- ✅ Pre-translated status labels
- ✅ Thai-specific date formatting helpers
- ✅ Duration & cost formatting for timesheet use

**Built-in Constants:**
```tsx
thaiMonths.names    // ['มกราคม', 'กุมภาพันธ์', ...]
thaiMonths.short    // ['ม.ค.', 'ก.พ.', ...]
thaiDays.names      // ['อาทิตย์', 'จันทร์', ...]
thaiDays.short      // ['อา.', 'จ.', ...]
thaiWorkTypes       // { general, project, training, leave, overtime }
thaiLeaveTypes      // { annual, sick, personal, maternity, unpaid }
thaiStatuses        // { draft, submitted, approved, rejected, pending }
```

**Usage Example:**
```tsx
const { 
  formatThaiDate,           // "17 กุมภาพันธ์ 2567"
  formatThaiDateWithDay,    // "จันทร์ 17 กุมภาพันธ์ 2567"
  formatDuration,           // "8.5 ชั่วโมง"
  formatHoursWithCost,      // "8 ชั่วโมง (4,000 บาท)"
  getWorkTypeLabel,         // "โครงการ" or "Project"
  getStatusLabel,           // "อนุมัติแล้ว" or "Approved"
} = useThaiLocale();

// Example
const date = formatThaiDate(new Date()); 
// Returns: "17 กุมภาพันธ์ 2567"

const billable = formatHoursWithCost(8, 4000);
// Thai: "8 ชั่วโมง (4,000 บาท)"
// English: "8 hrs (฿4,000)"
```

### 4. **Enhanced i18n Configuration**
**File:** `next-app/app/lib/i18n.ts`

**Improvements:**
- ✅ Synchronization between i18n and useLanguage hook
- ✅ Storage event listeners for cross-tab sync
- ✅ Automatic HTML lang attribute updates
- ✅ Fallback language handling
- ✅ Session storage integration

### 5. **Enhanced Localization Files**
**Files:** 
- `next-app/app/lib/locales/th.json` (Thai translations)
- `next-app/app/lib/locales/en.json` (English translations)

**New Sections Added:**
- `timesheet` - All timesheet-related labels and messages
- `leave` - Leave management labels
- `workTypes` - Pre-translated work type names
- `leaveTypes` - Pre-translated leave type names

**Sample Translations:**
```json
{
  "timesheet": {
    "parallelWorkDetected": "พบการทำงานขนาน",
    "parallelWorkReason": "โปรดอธิบายเหตุผลการทำงานขนาน",
    "maxConcurrentProjects": "สามารถทำงานพร้อมกันได้สูงสุด 2 โครงการ"
  }
}
```

## Best Practices

### 1. **Use useThaiLocale for Date/Time Display**
```tsx
// ✅ Good - Thai-formatted date
const { formatThaiDate } = useThaiLocale();
<span>{formatThaiDate(entry.date)}</span>

// ❌ Avoid - Browser default formatting
<span>{entry.date.toLocaleDateString()}</span>
```

### 2. **Use formatNumber/formatCurrency for Monetary Values**
```tsx
// ✅ Good - Locale-aware formatting
const { formatCurrency } = useLanguage();
<span>{formatCurrency(5000, 'THB')}</span>

// ❌ Avoid - Hardcoded formatting
<span>{5000} บาท</span>
```

### 3. **Translate Dynamic Labels**
```tsx
// ✅ Good - Using i18n
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();
<Button>{t('timesheet.approve')}</Button>

// Or use hook helpers
const { getWorkTypeLabel } = useThaiLocale();
<span>{getWorkTypeLabel(entry.workType)}</span>
```

### 4. **Listen to Language Changes for Dynamic Content**
```tsx
useEffect(() => {
  const handleLanguageChange = (e: CustomEvent) => {
    // Refetch or re-render data with new language
    setLanguage(e.detail.language);
  };

  window.addEventListener('languageChange', handleLanguageChange);
  return () => window.removeEventListener('languageChange', handleLanguageChange);
}, []);
```

## Integration Checklist

- [ ] Update timesheet entry display to use `useThaiLocale`
- [ ] Use `formatCurrency` for all cost/expense fields
- [ ] Replace hardcoded Thai labels with i18n keys
- [ ] Add `lang-thai`/`lang-english` CSS classes for styling overrides
- [ ] Test concurrent work badges in Thai language
- [ ] Test date formatting in Thai (Buddhist calendar year + 543)
- [ ] Verify number formatting (Thai uses different separators)
- [ ] Test LanguageSwitcher accessibility with screen readers
- [ ] Test language persistence across browser tabs
- [ ] Test approval interface with Thai translations

## Next Steps

1. **Apply to Timesheet Components:**
   - Update entry display components to use hooks
   - Add Thai labels for parallel work warnings
   - Implement Thai date range formatting

2. **Apply to Leave Management:**
   - Use `useThaiLocale` for leave date display
   - Add Thai translations for leave types
   - Format leave balance with proper locale

3. **Manager/Admin Approval Interface:**
   - Use Thai-localized labels for approval status
   - Display concurrent work reasons with proper Thai formatting
   - Format approval timestamps in Thai

4. **Testing & QA:**
   - Test all date displays with Thai calendar
   - Verify currency formatting for different locales
   - Test cross-tab language persistence
   - Accessibility audit with Thai language

## Files Modified/Created

```
✅ CREATED: next-app/lib/hooks/useThaiLocale.ts (165 lines)
✅ CREATED: next-app/lib/hooks/index.ts (barrel export)
✅ MODIFIED: next-app/components/LanguageSwitcher.tsx (enhanced)
✅ MODIFIED: next-app/lib/hooks/useLanguage.ts (enhanced)
✅ MODIFIED: next-app/app/lib/i18n.ts (enhanced)
✅ MODIFIED: next-app/app/lib/locales/th.json (added timesheet/leave/workTypes/leaveTypes)
✅ MODIFIED: next-app/app/lib/locales/en.json (added timesheet/leave/workTypes/leaveTypes)
```

## Testing Recommendations

### Manual Testing:
1. Switch languages and verify HTML lang attribute updates
2. Switch languages and check localStorage persistence
3. Open in multiple tabs and change language in one tab
4. Verify dates display with Thai Buddhist calendar (year + 543)
5. Check number/currency formatting for thousands separators
6. Test accessibility with screen reader

### Browser Console:
```js
// Check current language
localStorage.getItem('app-language')

// Check HTML lang attribute
document.documentElement.lang

// Test custom event
window.addEventListener('languageChange', (e) => console.log(e.detail))
```

## Accessibility Features

- ✅ `role="group"` on language button container
- ✅ `aria-label` on language buttons (both EN and Thai)
- ✅ `aria-pressed` for active language state
- ✅ `title` attribute for tooltip on hover
- ✅ HTML `lang` attribute for screen reader language switching
- ✅ CSS classes for styling overrides per language

## Performance Notes

- Formatting helpers use native `Intl` API (no external dependencies)
- Language preference cached in localStorage
- Cross-tab sync uses standard web APIs
- No additional bundle size impact
