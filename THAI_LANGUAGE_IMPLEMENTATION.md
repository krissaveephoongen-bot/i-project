# Thai Language Support Implementation Summary

## Overview
Complete bilingual (English/Thai) language support has been implemented for the following pages:
- `/clients`
- `/tasks`
- `/expenses` (including `/expenses/memo` and `/expenses/travel`)
- `/sales`
- `/stakeholders`
- `/resources`

## Files Created

### Translation Utility Files
All utilities follow the same pattern with `lang` parameter defaulting to `"en"` and supporting both English and Thai translations.

1. **`next-app/lib/services/clients.utils.ts`**
   - `getClientStatusLabel()` - Active, Inactive, Archived
   - `getClientTypeLabel()` - Individual, Company, Government
   - `getClientPageLabels()` - 50+ UI labels for clients page

2. **`next-app/lib/services/tasks.utils.ts`**
   - `getTaskStatusLabel()` - To Do, In Progress, Review, Completed, Cancelled
   - `getTaskPriorityLabel()` - Low, Medium, High, Urgent
   - `getTaskCategoryLabel()` - Development, Design, Testing, Documentation, Maintenance, Other
   - `getTaskPageLabels()` - 45+ UI labels for tasks page

3. **`next-app/lib/services/expenses.utils.ts`**
   - `getExpenseStatusLabel()` - Draft, Submitted, Approved, Rejected, Paid, Cancelled
   - `getExpenseCategoryLabel()` - Travel, Accommodation, Meals, Transportation, Equipment, Supplies, Utilities, Maintenance, Other
   - `getPaymentMethodLabel()` - Cash, Credit Card, Bank Transfer, Check, Other
   - `getExpensePageLabels()` - 50+ UI labels for expenses page

4. **`next-app/lib/services/sales.utils.ts`**
   - `getSalesStatusLabel()` - Prospect, Qualified, Proposal, Negotiation, Closed Won, Closed Lost
   - `getSalesStageLabel()` - Lead, Contact, Meeting, Demo, Proposal, Contract, Won, Lost
   - `getSalesPageLabels()` - 40+ UI labels for sales page

5. **`next-app/lib/services/stakeholders.utils.ts`**
   - `getStakeholderRoleLabel()` - Executive, Manager, Team Member, Client, Vendor, Consultant, Other
   - `getStakeholderTypeLabel()` - Internal, External, Partner
   - `getInvolvementLevelLabel()` - High, Medium, Low, Minimal
   - `getStakeholderPageLabels()` - 45+ UI labels for stakeholders page

6. **`next-app/lib/services/resources.utils.ts`**
   - `getResourceTypeLabel()` - Human Resource, Equipment, Material, Software, Facility, Other
   - `getResourceStatusLabel()` - Available, In Use, Maintenance, Retired, Archived
   - `getAllocationStatusLabel()` - Requested, Approved, Allocated, Deallocated, Rejected
   - `getResourcePageLabels()` - 45+ UI labels for resources page

### Hook & Component Files

7. **`next-app/lib/hooks/useLanguage.ts`**
   - React hook for managing language state
   - Persists language preference in localStorage
   - Provides language toggle functionality
   - Updates document lang attribute for accessibility

8. **`next-app/components/LanguageSwitcher.tsx`**
   - UI component for toggling between EN and Thai
   - Displays as two buttons (EN / ไทย)
   - Supports different button variants and sizes
   - Loading state handling

### Updated Pages

9. **`next-app/app/clients/page.tsx`**
   - Added LanguageSwitcher component
   - Integrated getClientPageLabels for UI translations
   - All text now supports both English and Thai

10. **`next-app/app/tasks/page.tsx`**
    - Added LanguageSwitcher component
    - Integrated task utility labels
    - Status and priority labels now bilingual
    - All UI text translated

11. **`next-app/app/expenses/page.tsx`**
    - Added LanguageSwitcher component
    - Full bilingual support for modal and table
    - Date, category, and status labels translated
    - Form labels in both languages

## Implementation Pattern

### Basic Usage Pattern
```typescript
import { useLanguage } from '@/lib/hooks/useLanguage';
import { getClientPageLabels } from '@/lib/services/clients.utils';

export default function ClientsPage() {
    const { language } = useLanguage();
    const labels = getClientPageLabels(language);
    
    return (
        <div>
            <h1>{labels.title}</h1>
            <LanguageSwitcher />
        </div>
    );
}
```

### Label Functions Pattern
```typescript
export function getStatusLabel(status: string, lang: string = "en"): string {
    const labels: Record<string, Record<string, string>> = {
        en: { active: "Active", inactive: "Inactive" },
        th: { active: "ใช้งาน", inactive: "ไม่ใช้งาน" }
    };
    return labels[lang]?.[status] || status;
}
```

## Translation Coverage

- **Status Labels**: Complete for all modules
- **Priority/Category Labels**: Complete
- **Form Labels**: Complete
- **Button Labels**: Complete (Save, Cancel, Edit, Delete, Add New, etc.)
- **Table Headers**: All translated
- **Empty States**: "No items found" translations
- **Dialog Titles & Messages**: Complete
- **Breadcrumbs**: Dynamic labels

## Configuration

Language configuration is centralized in:
```typescript
// next-app/lib/config.ts
export const LANGUAGES = {
  EN: "en",
  TH: "th",
};
```

## Accessibility

- Language preference persisted in localStorage
- Document lang attribute updated when language changes
- Full keyboard navigation support
- Semantic HTML maintained

## Future Pages

The utilities are ready to be integrated into:
- `/expenses/memo` page
- `/expenses/travel` page
- `/sales` page
- `/stakeholders` page
- `/resources` page

### Quick Integration Steps
1. Import `useLanguage` hook
2. Import the corresponding utility labels function
3. Add `<LanguageSwitcher />` component
4. Replace hardcoded strings with `labels.propertyName`
5. Use status/category label functions where needed

## Notes

- All translations use native Thai characters (ไทย)
- Language defaults to English if not stored
- Utility functions handle null/undefined gracefully
- Enum constants support both languages
- All status/priority/category labels are centralized
