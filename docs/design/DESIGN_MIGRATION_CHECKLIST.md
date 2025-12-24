# Design System Migration Checklist

## Overview
This checklist tracks the migration of components to the new design system with proper color palettes, soft shadows, and traffic light status indicators.

---

## ✅ Completed Components

### Phase 1: Core Dashboard Components
- [x] **TaskProgressIndicator** - Progress bars with green primary color
- [x] **ActiveProjects** - Card styling with soft shadows and proper text hierarchy
- [x] **ProjectChart** - Traffic light status colors (Blue/Green/Yellow/Red)
- [x] **TaskList** - Status badges and priority colors
- [x] **TodayOverview** - Stat cards with colored backgrounds

---

## 📋 Components to Update

### Phase 2: Forms & Input Components
- [ ] **TaskForm** - Update input styling, button colors
- [ ] **ProjectForm** - Form fields with primary color focus states
- [ ] **TaskFormDialog** - Modal with white background, soft shadows
- [ ] **TeamMemberForm** - Form styling consistency
- [ ] **CustomerForm** - Input fields and buttons

### Phase 3: Table & List Components
- [ ] **TasksDataTable** - Headers with `bg-neutral-50`, rows with proper borders
- [ ] **ProjectDetailTable** - Table styling with traffic light status
- [ ] **TimesheetList** - List items with proper spacing and shadows
- [ ] **DeliveryScheduleTable** - Header styling and status colors
- [ ] **InvoiceTable** - Invoice status with traffic light colors
- [ ] **WorkLogList** - Work log list items
- [ ] **CustomerList** - Customer list styling

### Phase 4: Dashboard Sections
- [ ] **AnalyticsDashboard** - Main dashboard cards and layout
- [ ] **AnalyticsEnhanced** - Enhanced analytics with proper colors
- [ ] **MenuEnhanced** - Menu styling
- [ ] **CostManagement** - Cost display cards
- [ ] **Expenses** - Expense list and summary cards
- [ ] **AdminUsers** - User list with action buttons
- [ ] **AdminRoleManagement** - Role cards and status
- [ ] **AdminPINManagement** - PIN management interface

### Phase 5: Sidebar & Navigation
- [ ] **Sidebar** - Sidebar items with primary color active state
- [ ] **AdminSidebar** - Admin sidebar styling
- [ ] **EnterpriseNav** - Navigation bar styling
- [ ] **MobileMenu** - Mobile menu styling

### Phase 6: Widgets & Utility Components
- [ ] **QuickActionButtons** - Button styling and layout
- [ ] **NotificationBell** - Notification badge styling
- [ ] **HelpCenter** - Help section cards
- [ ] **ValidationHelper** - Error message styling
- [ ] **GreetingWidget** - Widget styling
- [ ] **TutorialModal** - Modal styling
- [ ] **PendingApprovals** - Approval cards and status

### Phase 7: Charts & Visualizations
- [ ] **ProjectChart** - *(Already updated)*
- [ ] **TaskProgressIndicator** - *(Already updated)*
- [ ] **SCurveChart** - Chart styling
- [ ] **SCurveAnalysis** - Analysis cards
- [ ] **ProjectBudgetChart** - Budget visualization
- [ ] **ProjectIssueChart** - Issue chart styling
- [ ] **PMWorkloadChart** - Workload chart
- [ ] **DataVisualization** - General data viz styling
- [ ] **TeamCollaboration** - Collaboration chart

### Phase 8: Complex Components
- [ ] **ProjectOverviewHeader** - Header styling
- [ ] **ProjectDetails** - Details layout and cards
- [ ] **ProjectDetailHeader** - Header styling
- [ ] **ProjectProgress** - Progress indicators
- [ ] **RiskProjectStatus** - Risk status with colors
- [ ] **ProgressProjectTable** - Table with status colors

### Phase 9: Activity & History
- [ ] **ActivityFeed** - Activity items with timestamps
- [ ] **Activity** - Activity page styling
- [ ] **TimesheetTimer** - Timer widget

### Phase 10: Invoice & Financial
- [ ] **InvoiceStatus** - Invoice status badges
- [ ] **TotalInvoiceAmount** - Amount display cards
- [ ] **WeeklySummary** - Weekly summary cards

---

## Update Template

For each component, follow this template:

```jsx
// BEFORE
<div className="card"> {/* Old styling */}
  <h3 className="text-gray-800">Title</h3>
  <p className="text-gray-600">Content</p>
</div>

// AFTER
<div className="bg-background-base rounded-lg border border-neutral-200 p-6 shadow-sm">
  <h3 className="text-lg font-semibold text-neutral-900">Title</h3>
  <p className="text-sm text-neutral-600">Content</p>
</div>
```

---

## Color Mapping Guide

When updating components, use this mapping:

### Text Colors
| Old | New | Value |
|-----|-----|-------|
| `text-gray-800` | `text-neutral-900` | #111827 |
| `text-gray-700` | `text-neutral-700` | #374151 |
| `text-gray-600` | `text-neutral-600` | #6b7280 |
| `text-gray-500` | `text-neutral-500` | #6b7280 |
| `text-blue-600` | `text-accent-600` | #0284c7 |
| `text-green-600` | `text-primary-600` | #16a34a |
| `text-red-600` | `text-error-600` | #dc2626 |
| `text-yellow-600` | `text-warning-600` | #d97706 |

### Background Colors
| Old | New | Value |
|-----|-----|-------|
| `bg-white` | `bg-background-base` | #FFFFFF |
| `bg-gray-50` | `bg-neutral-50` | #f9fafb |
| `bg-gray-100` | `bg-neutral-100` | #f3f4f6 |
| `bg-gray-200` | `bg-neutral-200` | #e5e7eb |
| `bg-blue-50` | `bg-accent-50` | #f0f9ff |
| `bg-green-50` | `bg-success-50` | #f0fdf4 |
| `bg-red-50` | `bg-error-50` | #fef2f2 |
| `bg-yellow-50` | `bg-warning-50` | #fffbeb |

### Border Colors
| Old | New | Usage |
|-----|-----|-------|
| `border-gray-300` | `border-neutral-200` | Default borders |
| `border-gray-200` | `border-neutral-100` | Light borders |
| `border-blue-200` | `border-accent-200` | Accent borders |

---

## Component Update Steps

For each component update:

1. **Identify style classes** - List all color, background, shadow classes
2. **Map to new system** - Use the color mapping guide above
3. **Update shadows** - Change to `shadow-xs` or `shadow-sm`
4. **Update borders** - Use `border-neutral-200` as default
5. **Update text hierarchy**:
   - Headings: `text-neutral-900`
   - Body: `text-neutral-700`
   - Secondary: `text-neutral-600`
6. **Test on real data** - Verify colors render correctly
7. **Check accessibility** - Use WCAG checker
8. **Get review** - Have design team approve

---

## Status Badge Updates

When updating status badges, follow this pattern:

```jsx
// Status: Completed/Approved (Green)
<span className="bg-success-50 text-success-600 px-3 py-1 rounded border border-success-200">
  Completed
</span>

// Status: Pending/In Progress (Blue)
<span className="bg-accent-50 text-accent-600 px-3 py-1 rounded border border-accent-200">
  In Progress
</span>

// Status: Warning/Review (Yellow)
<span className="bg-warning-50 text-warning-600 px-3 py-1 rounded border border-warning-200">
  Pending Review
</span>

// Status: Rejected/Error (Red)
<span className="bg-error-50 text-error-600 px-3 py-1 rounded border border-error-200">
  Rejected
</span>

// Status: Default (Gray)
<span className="bg-neutral-100 text-neutral-700 px-3 py-1 rounded border border-neutral-300">
  To Do
</span>
```

---

## Button Updates

Replace old button styles with new system:

```jsx
// Primary Button (Green - Main action)
<button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
  Create
</button>

// Secondary Button
<button className="bg-neutral-100 hover:bg-neutral-200 text-neutral-900 px-4 py-2 rounded-lg font-medium border border-neutral-200 transition-colors">
  Cancel
</button>

// Danger Button
<button className="bg-error-500 hover:bg-error-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
  Delete
</button>
```

---

## Card & Container Updates

```jsx
// Standard Card
<div className="bg-background-base rounded-lg border border-neutral-200 p-6 shadow-sm hover:shadow-md transition-shadow">
  {/* Content */}
</div>

// Light Background Container
<div className="bg-background-light rounded-lg p-4">
  {/* Content */}
</div>

// Table Header
<thead className="bg-neutral-50">
  <tr>
    <th className="text-neutral-700 font-semibold text-sm">Column</th>
  </tr>
</thead>

// Table Row
<tbody>
  <tr className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
    <td className="text-neutral-700 py-3">{data}</td>
  </tr>
</tbody>
```

---

## Testing Checklist

For each updated component:

- [ ] Colors render correctly on desktop
- [ ] Colors render correctly on mobile
- [ ] Shadows appear subtle and professional
- [ ] Borders are visible but not heavy
- [ ] Text contrast is sufficient (WCAG AA)
- [ ] Hover states work smoothly
- [ ] Active states are clear
- [ ] Disabled states are distinguishable
- [ ] Status badges are immediately recognizable
- [ ] No arbitrary color values remain

---

## Accessibility Checks

Run these checks after updates:

1. **Color Contrast** (using WebAIM Contrast Checker)
   - `text-neutral-900` on `bg-background-base`: 18:1 ✓
   - `text-neutral-600` on `bg-background-base`: 8.5:1 ✓
   - `text-white` on `bg-primary-500`: 6.8:1 ✓

2. **Keyboard Navigation**
   - All interactive elements accessible via Tab
   - Focus indicators visible

3. **Color Independence**
   - Status not conveyed by color alone
   - Text/icons supplement colors

---

## Progress Tracking

| Phase | Status | Completion % | Notes |
|-------|--------|-------------|-------|
| 1 | ✅ Complete | 100% | Dashboard components done |
| 2 | ⏳ Not Started | 0% | Forms & inputs |
| 3 | ⏳ Not Started | 0% | Tables & lists |
| 4 | ⏳ Not Started | 0% | Dashboard sections |
| 5 | ⏳ Not Started | 0% | Navigation |
| 6 | ⏳ Not Started | 0% | Widgets |
| 7 | ⏳ Not Started | 0% | Charts |
| 8 | ⏳ Not Started | 0% | Complex components |
| 9 | ⏳ Not Started | 0% | Activity |
| 10 | ⏳ Not Started | 0% | Financial |

---

## Quick References

- **Color Palette**: See DESIGN_QUICK_START.md
- **Full System**: See DESIGN_SYSTEM.md
- **Applied Changes**: See DESIGN_TOKENS_APPLIED.md
- **Tailwind Config**: tailwind.config.js
- **Global Styles**: style.css

---

## Questions?

Refer to:
1. DESIGN_QUICK_START.md for quick answers
2. DESIGN_SYSTEM.md for comprehensive details
3. Component examples in DESIGN_TOKENS_APPLIED.md
