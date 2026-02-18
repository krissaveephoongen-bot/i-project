# Design Review Results: Dashboard Page

**Review Date**: 2026-02-18
**Last Updated**: 2026-02-18 (Fixes Applied)
**Route**: `/dashboard`
**Focus Areas**: Visual Design, UX/Usability, Responsive/Mobile, Accessibility, Micro-interactions/Motion, Consistency, Performance

> **Note**: This review was conducted through static code analysis combined with a browser session that was blocked by authentication. The loading-state inspection revealed FCP ~47s, page size ~2.2MB. Visual inspection of the authenticated dashboard was not possible.

## Summary

The dashboard is feature-rich with KPIs, charts, status cards, and data tables. ~~However, it has **critical accessibility gaps** (zero ARIA attributes across all components), a **completely broken mobile experience** (fixed 260px sidebar with no responsive collapse), and **significant performance concerns** (no lazy loading, no memoization, not using TanStack Query despite it being in the stack).~~

### ✅ Fixes Applied (2026-02-18)

Many issues have been addressed:
- **Accessibility**: ARIA labels added to interactive elements, charts have `role="img"` and `aria-label`, loading states have `role="status"`, error states have `role="alert"`
- **Responsive Layout**: Mobile sidebar with hamburger menu implemented via `SidebarProvider` and `Sheet` component, responsive header with mobile menu button
- **Performance**: Chart components lazy-loaded with `React.lazy()` and `Suspense`, `AbortController` for fetch cancellation, `React.memo` on child components
- **Design Tokens**: Cards use `bg-card` and `text-card-foreground` for dark mode support
- **UX**: Clear cache button now has confirmation dialog, CSV export shows success toast
- **Code Quality**: Descriptive variable names in KPIs, centralized status colors constant

## Issues

| # | Issue | Criticality | Category | Status | Location |
|---|-------|-------------|----------|--------|----------|
| 1 | **Zero ARIA attributes** across all dashboard components — no `aria-label`, `aria-describedby`, `role`, or `aria-live` on any interactive element (search input, dropdowns, buttons, tables, charts). Screen readers cannot interpret the page. | 🔴 Critical | Accessibility | ✅ Fixed | `next-app/app/dashboard/components/*.tsx` (all files) |
| 2 | **No mobile/responsive layout** — Sidebar is fixed at 260px with no hamburger/drawer toggle. Header uses `fixed left-[260px]`. Main content uses `ml-[260px]`. On screens < 768px the UI is completely unusable. | 🔴 Critical | Responsive | ✅ Fixed | `next-app/app/components/ProtectedLayout.tsx:51`, `next-app/app/components/Header.tsx:22`, `next-app/app/components/Sidebar.tsx:224` |
| 3 | **`<html lang="en">` but content is primarily Thai** — screen readers will announce Thai text with English pronunciation rules, making it incomprehensible for assistive technology users. | 🔴 Critical | Accessibility | ✅ Fixed | `next-app/app/layout.tsx:25` |
| 4 | **Destructive "Clear Cache" button has no confirmation** — `clearCache()` calls `localStorage.clear()` and `sessionStorage.clear()`, wiping ALL stored data (auth tokens, preferences, i18n settings) without any dialog. This could log users out or corrupt app state. | 🔴 Critical | UX/Usability | ✅ Fixed | `next-app/app/dashboard/page.tsx:39-59` |
| 5 | **"Details →" link only visible on hover** (`opacity-0 group-hover:opacity-100`) — completely inaccessible via keyboard navigation. Keyboard users can never see or reach this action. | 🔴 Critical | Accessibility | ✅ Fixed | `next-app/app/dashboard/components/ActiveProjectsTable.tsx:92-93` |
| 6 | **Focus indicators use `focus:outline-none`** on multiple inputs — removes the browser's default focus ring. The replacement `focus:ring-2 focus:ring-blue-500/20` is only 20% opacity, far too subtle and likely fails WCAG 2.4.7 (Focus Visible). | 🟠 High | Accessibility | ✅ Fixed | `next-app/app/dashboard/components/DashboardFilters.tsx:51,61,75,82` |
| 7 | **Month range inputs have no visible labels** — the `<input type="month">` fields have no `<label>`, no `aria-label`, and no placeholder. Users cannot tell what these fields control. | 🟠 High | Accessibility | ✅ Fixed | `next-app/app/dashboard/components/DashboardFilters.tsx:71-84` |
| 8 | **Charts have zero accessibility** — all Recharts components (`BarChart`, `LineChart`, `ScatterChart`) lack `role="img"`, `aria-label`, or any text alternative. Chart data is invisible to screen readers. | 🟠 High | Accessibility | ✅ Fixed | `next-app/app/dashboard/components/FinancialChartCard.tsx:20-34`, `TrendChartCard.tsx:35-57`, `PortfolioHealthCard.tsx:20-69` |
| 9 | **No memoization on child components** — every filter keystroke or state change re-renders all 8+ dashboard sub-components including heavy chart components. `DashboardKPIs`, `DashboardStatus`, chart cards, and `ActiveProjectsTable` are not wrapped in `React.memo` and receive new object references on each render. | 🟠 High | Performance | ✅ Fixed | `next-app/app/dashboard/page.tsx:242-276` |
| 10 | **Not using TanStack Query** despite it being in the tech stack — data fetching is done with raw `fetch()` in `useEffect` with manual loading/error/refresh state. This misses automatic caching, background refetching, retry logic, deduplication, and stale-while-revalidate patterns. | 🟠 High | Performance | ⏳ Deferred | `next-app/app/dashboard/page.tsx:61-102` |
| 11 | **No lazy loading for chart components** — `FinancialChartCard`, `TrendChartCard`, `PortfolioHealthCard` (using Recharts) are all eagerly imported. These are heavy components that should use `React.lazy()` or `next/dynamic` to reduce initial bundle size (page measured 2.2MB). | 🟠 High | Performance | ✅ Fixed | `next-app/app/dashboard/page.tsx:13-18` |
| 12 | **`useEffect` missing cleanup/abort controller** — if the component unmounts during fetch, state updates on unmounted component. No `AbortController` to cancel in-flight requests. | 🟠 High | Performance | ✅ Fixed | `next-app/app/dashboard/page.tsx:104-106` |
| 13 | **Table not responsive on mobile** — `ActiveProjectsTable` has 7 columns with horizontal scroll but no visual scroll indicator, no priority column hiding, and no card-based mobile alternative. | 🟠 High | Responsive | ✅ Fixed | `next-app/app/dashboard/components/ActiveProjectsTable.tsx:16-101` |
| 14 | **Filter bar breaks on medium screens** — `flex-wrap` is used but action buttons `ml-auto` causes orphaned rows. No distinct mobile layout (e.g., collapsible filter panel). | 🟠 High | Responsive | ✅ Fixed | `next-app/app/dashboard/components/DashboardFilters.tsx:44` |
| 15 | **Cards use `bg-white` instead of `bg-card` token** — all dashboard cards hard-code `bg-white`, making them unreadable in dark mode (white cards on dark background with dark text). | 🟡 Medium | Visual Design | ✅ Fixed | `next-app/app/dashboard/components/DashboardKPIs.tsx:16,26,39,52,62`, `DashboardStatus.tsx:15,25,35,45`, `FinancialChartCard.tsx:10`, etc. |
| 16 | **Hard-coded colors instead of design tokens** — colors like `#0F172A`, `#2563EB`, `#8b5cf6`, `#10b981`, `#ef4444` are used directly instead of CSS variables or Tailwind theme tokens (e.g., `text-primary`, `text-destructive`). | 🟡 Medium | Consistency | ⏳ Deferred | Multiple files across `next-app/app/dashboard/components/` |
| 17 | **Mixed import path patterns** — `@/app/components/ui/Button` vs `@/components/ui/dropdown-menu` vs `@/app/components/ui/Skeleton`. No consistent convention for UI component imports. | 🟡 Medium | Consistency | ⏳ Deferred | `next-app/app/components/LanguageSwitcher.tsx:6,12`, `next-app/app/components/NotificationCenter.tsx:5-11` |
| 18 | **Not using shadcn Card component** — all cards are custom `<div>` elements with repeated border/shadow/rounded classes instead of reusing the installed `Card`, `CardHeader`, `CardContent` components. | 🟡 Medium | Consistency | ⏳ Deferred | All dashboard card components |
| 19 | **Native `<select>` instead of shadcn Select** — dashboard filters use raw `<select>` elements while `ProfessionalDashboardFilters.tsx` uses shadcn Select. Inconsistent component usage. | 🟡 Medium | Consistency | ✅ Fixed | `next-app/app/dashboard/components/DashboardFilters.tsx:58-67`, `TrendChartCard.tsx:21-29` |
| 20 | **`text-[10px]` font size** in recent activities timestamp — this is below the recommended minimum of 12px for readability and fails accessibility standards for minimum text size. | 🟡 Medium | Accessibility | ✅ Fixed | `next-app/app/dashboard/components/RecentActivitiesCard.tsx:29` |
| 21 | **`animate-pulse-slow` class not defined** — used in `DashboardStatus.tsx` on icon containers but not configured in `tailwind.config.js`. This animation likely does nothing (or falls back to browser default). | 🟡 Medium | Micro-interactions | ✅ Fixed | `next-app/app/dashboard/components/DashboardStatus.tsx:16,26,36,46` |
| 22 | **`animate-bounce` on error icon** — continuous bouncing animation on the error state icon can trigger vestibular/motion sensitivity issues. No `prefers-reduced-motion` check. | 🟡 Medium | Micro-interactions | ⏳ Deferred | `next-app/app/dashboard/page.tsx:197` |
| 23 | **PageTransition doesn't respect `prefers-reduced-motion`** — framer-motion animations play regardless of user's motion preference settings. Should use `useReducedMotion()` hook. | 🟡 Medium | Micro-interactions | ✅ Fixed | `next-app/app/components/PageTransition.tsx:9-11` |
| 24 | **CSV export has no user feedback** — clicking "ส่งออก CSV" triggers a download but provides no toast/notification on success or failure. | 🟡 Medium | UX/Usability | ✅ Fixed | `next-app/app/dashboard/components/DashboardFilters.tsx:29-41` |
| 25 | **KPI variable names are cryptic** — `b`, `c`, `a`, `rm` instead of `budget`, `committed`, `actual`, `remaining`. Reduces code readability and maintainability. | 🟡 Medium | Consistency | ✅ Fixed | `next-app/app/dashboard/page.tsx:110-116` |
| 26 | **Excessive use of `any` types** — `rows: any[]`, `activities: any[]`, `execReport: any`, `filteredRows: any[]`. Violates the project's `noImplicitAny: true` TypeScript strict mode. | 🟡 Medium | Consistency | ✅ Fixed | `next-app/app/dashboard/page.tsx:25-36` |
| 27 | **Sidebar dashboard link points to `/`** but dashboard page is at `/dashboard` — navigation mismatch could cause confusion or redirect loops depending on auth flow. | 🟡 Medium | UX/Usability | ✅ Fixed | `next-app/app/components/Sidebar.tsx:113` |
| 28 | **Inconsistent border-radius usage** — mix of `rounded-2xl` (16px), `rounded-xl` (12px), `rounded-lg` (8px), and `rounded` across cards, buttons, and inputs with no clear hierarchy. | ⚪ Low | Visual Design | ⏳ Deferred | Multiple files |
| 29 | **No empty state for charts** — when `filteredCashflow` or `filteredSpiTrend` arrays are empty, charts render as blank white boxes with titles but no helpful "No data available" message. | ⚪ Low | UX/Usability | ✅ Fixed | `next-app/app/dashboard/components/FinancialChartCard.tsx`, `TrendChartCard.tsx` |
| 30 | **`cn()` utility duplicated** — defined inside `Skeleton.tsx` instead of imported from a shared utility. Likely duplicated across the codebase. | ⚪ Low | Consistency | ⏳ Deferred | `next-app/app/components/ui/Skeleton.tsx:4-6` |
| 31 | **Status colors not centralized** — status-to-color mappings (`active` → green, `completed` → blue, etc.) are repeated inline in `ActiveProjectsTable.tsx` and other components rather than defined in a shared constant. | ⚪ Low | Consistency | ✅ Fixed | `next-app/app/dashboard/components/ActiveProjectsTable.tsx:37-42` |
| 32 | **Refresh button animate-spin applied to entire button** — when `refreshing` is true, the entire button (including text) spins, not just the icon. | ⚪ Low | Micro-interactions | ✅ Fixed | `next-app/app/dashboard/components/DashboardFilters.tsx:100` |

## Criticality Legend
- 🔴 **Critical** (5 issues): Breaks functionality, violates accessibility standards, or makes the app unusable for a segment of users
- 🟠 **High** (9 issues): Significantly impacts user experience, design quality, or application performance
- 🟡 **Medium** (13 issues): Noticeable issues that should be addressed for polish and maintainability
- ⚪ **Low** (5 issues): Nice-to-have improvements for overall code quality and consistency

## Status Legend
- ✅ **Fixed**: Issue has been resolved
- ⏳ **Deferred**: Issue acknowledged but deferred for future iteration
- ❌ **Open**: Issue still needs to be addressed

## Resolution Summary

### ✅ Completed (25 issues)

**Critical Issues (5/5):**
- All 5 critical issues have been fixed including ARIA attributes, responsive layout, HTML lang attribute, clear cache confirmation, and keyboard-accessible links.

**High Issues (8/9):**
- 8 of 9 high issues fixed. TanStack Query migration deferred as it requires significant refactoring.

**Medium Issues (9/13):**
- 9 of 13 medium issues fixed. Deferred items: hard-coded colors, import patterns, shadcn Card usage, and animate-bounce motion preference.

**Low Issues (3/5):**
- 3 of 5 low issues fixed. Deferred items: border-radius consistency and cn() utility duplication.

### ⏳ Deferred (7 issues)

| # | Issue | Reason |
|---|-------|--------|
| 10 | TanStack Query migration | Requires significant refactoring; current implementation with AbortController is functional |
| 16 | Hard-coded colors | Would require design system audit; current colors work well |
| 17 | Mixed import paths | Low impact; would require codemod or manual migration |
| 18 | shadcn Card component | Current custom cards work well with dark mode |
| 22 | animate-bounce motion | Minor UX issue; error state is functional |
| 28 | Border-radius consistency | Visual polish; no functional impact |
| 30 | cn() utility duplication | Minor code organization issue |

## Next Steps

### ✅ Completed — Accessibility (Critical)
1. ✅ Add `aria-label` to all interactive elements (inputs, buttons, selects)
2. ✅ Add `role="img"` and `aria-label` to chart containers with data summaries
3. ✅ Change `<html lang="en">` to `<html lang="th">` (or implement dynamic lang based on i18n)
4. ✅ Make the "Details →" link always visible (not hover-only) or add a separate keyboard-accessible action
5. ✅ Strengthen focus indicators (increase ring opacity to 100%, or use `focus-visible:ring-2`)

### ✅ Completed — Responsive Layout (Critical)
1. ✅ Implement a collapsible sidebar with hamburger menu for mobile
2. ✅ Make the Header responsive (hide search on mobile, use mobile nav)
3. ✅ Remove hard-coded `ml-[260px]` and use CSS variable or responsive logic
4. ✅ Create card-based mobile layouts for tables

### ✅ Completed — Performance (High)
1. ⏳ Migrate data fetching to TanStack Query hooks (Deferred)
2. ✅ Lazy-load chart components with `next/dynamic`
3. ✅ Wrap child components in `React.memo` with proper prop comparison
4. ✅ Add `AbortController` to fetch calls

### ✅ Completed — Design System Consistency (Medium)
1. ✅ Replace `bg-white` with `bg-card` across all dashboard cards for dark mode
2. ⏳ Replace hard-coded colors with Tailwind theme tokens (Deferred)
3. ⏳ Use shadcn `Card` component instead of custom divs (Deferred)
4. ✅ Use shadcn `Select` consistently instead of native `<select>`
5. ✅ Add confirmation dialog before destructive "Clear Cache" action
