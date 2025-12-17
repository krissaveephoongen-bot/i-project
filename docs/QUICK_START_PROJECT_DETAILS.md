# Quick Start Guide - Integrated Project Detail Page

## Overview

The new ProjectDetailIntegrated page provides a unified view of all project information with three easy-to-navigate tabs:
- **Overview** - Project summary and details
- **Billing** - Payment phases and invoice tracking
- **Issues** - Problem tracking and management

---

## Getting Started

### 1. Navigate to Project Detail

```
1. Click "Projects" in the main menu
2. View all projects in grid/card format
3. Click on any project card
4. Opens the integrated project detail page
```

### 2. Understanding the Page Layout

```
┌─────────────────────────────────────────────────┐
│ ← Back to Projects | Project Name | Status Badge
├─────────────────────────────────────────────────┤
│ [Quick Stats: Progress | Budget | Tasks | Team] │
├─────────────────────────────────────────────────┤
│ [Overview] [Billing] [Issues]                   │
├─────────────────────────────────────────────────┤
│ Tab Content Area                                │
│ (Changes based on selected tab)                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Tab Guide

### Overview Tab

**What You'll See**:
- Full project description
- Timeline information
- Budget tracking
- Client and manager details
- Team members list
- Progress indicators

**Use Cases**:
- Get project summary at a glance
- Review budget status
- Check team composition
- Understand timeline

### Billing Tab

**What You'll See**:
- Summary cards (Phases, Paid, Invoiced, Balance, Overdue)
- List of billing phases
- Phase details (expandable)

**Common Tasks**:

#### Create New Billing Phase
```
1. Click "New Phase" button
2. Fill in phase details:
   - Phase Number: e.g., 1, 2, 3
   - Description: Brief description of phase
   - Currency: Select THB, USD, or EUR
   - Amount: Payment amount for this phase
   - % of Total: Auto-calculated or manual
   - Planned Delivery Date: When work should be done
   - Actual Delivery Date: When work was completed
   - Planned Payment Date: When payment should be received
   - Actual Payment Date: When payment was received
   - Status: pending, in-progress, delivered, invoiced, paid, overdue, or cancelled
   - Deliverables: What is delivered in this phase
   - Notes: Additional information
3. Click "Create Phase"
```

#### Edit Billing Phase
```
1. Click on phase to expand details
2. Click "Edit" button
3. Modify the details
4. Click "Update Phase"
```

#### Delete Billing Phase
```
1. Click on phase to expand details
2. Click "Delete" button
3. Confirm deletion
```

**Key Metrics**:
- **Total Phases**: Number of billing phases
- **Paid Amount**: Total paid so far
- **Invoiced**: Total invoiced but not paid
- **Balance Due**: Amount still owed
- **Overdue**: Amount past due date

### Issues Tab

**What You'll See**:
- Summary cards (Total, Open, In Progress, Critical, Resolved)
- Filter options (Status, Priority)
- List of issues
- Issue details (expandable)

**Common Tasks**:

#### Create New Issue
```
1. Click "New Issue" button
2. Fill in issue details:
   - Issue Code: Unique identifier (e.g., BUG-001)
   - Title: Brief issue title
   - Category: technical, schedule, budget, resource, quality, communication, or other
   - Description: Full issue description
   - Priority: low, medium, high, or critical
   - Due Date: When issue should be resolved
   - Assigned To: Team member name
   - Reported By: Who reported the issue
   - Impact on Schedule: Check if affects timeline
   - Impact on Budget: Check if affects budget
   - Estimated Cost: Cost to fix this issue
   - Root Cause: Why did this happen?
3. Click "Create Issue"
```

#### Change Issue Status
```
1. Find the issue in the list
2. Click to expand details
3. Use Status dropdown to change:
   - open → in-progress → resolved → closed
   - Or mark as on-hold or cancelled
4. Status updates immediately
```

#### Edit Issue
```
1. Click on issue to expand
2. Click "Edit" button
3. Modify the issue details
4. Click "Update Issue"
```

#### Delete Issue
```
1. Click on issue to expand
2. Click "Delete" button
3. Confirm deletion
```

**Filtering Issues**:
```
1. Use Status filter dropdown to show:
   - All Statuses (default)
   - Open
   - In Progress
   - Resolved
   - Closed

2. Use Priority filter dropdown to show:
   - All Priorities (default)
   - Low
   - Medium
   - High
   - Critical

3. Both filters work together
```

**Key Metrics**:
- **Total Issues**: Number of project issues
- **Open Issues**: Issues that haven't been started
- **In Progress**: Issues being worked on
- **Critical Issues**: High-priority issues needing attention
- **Resolved Issues**: Issues that have been fixed

---

## Common Workflows

### Workflow 1: Update Project Progress
```
1. Go to Projects > Click Project
2. See Overview tab
3. Check Current Progress %
4. Check Task Completion
5. Go to Billing tab if needed for payment progress
```

### Workflow 2: Add First Billing Phase
```
1. Navigate to Project > Billing Tab
2. Click "New Phase"
3. Enter Phase 1 details
4. Set Status to "pending"
5. Click "Create Phase"
6. Verify phase appears in list
```

### Workflow 3: Track Issue from Creation to Resolution
```
1. Navigate to Project > Issues Tab
2. Click "New Issue"
3. Create issue with "open" status
4. When work starts, expand and change to "in-progress"
5. When fixed, expand and change to "resolved"
6. Add resolution notes before closing
7. Mark as "closed" when complete
```

### Workflow 4: Monitor Budget Status
```
1. Overview Tab: See Total Budget vs. Spent
2. Billing Tab: See payment progress by phase
3. Issues Tab: Check estimated cost of open issues
4. Calculate: Budget - Spent - Open Issue Costs = Available Budget
```

### Workflow 5: Track Timeline
```
1. Overview Tab: See Timeline section
2. Check Days Remaining until project end
3. Check Task Completion percentage
4. Issues Tab: Check issues impacting schedule
5. Adjust if needed
```

---

## Tips & Tricks

### Navigation
- **Back Button**: Returns to Projects grid view
- **Tabs**: Click to switch between sections
- **Expand**: Click on cards to see more details
- **Filter**: Use dropdowns to find what you need

### Creating Forms
- **Red Asterisks**: Indicate required fields
- **Timestamps**: Dates use standard date picker
- **Numbers**: Only accept valid numeric values
- **Focus**: Blue border shows active field

### Data Entry
- **Phase Numbers**: Can be 1, 2, 3... etc (sequential)
- **Percentages**: Auto-calculated based on amount and contract value
- **Currencies**: Choose consistent currency for phases
- **Deliverables**: Optional but recommended for clarity
- **Notes**: Use for important context or blockers

### Dates
- **Planned vs Actual**: Track what was expected vs. what happened
- **Due Dates**: Use for issues to ensure timely resolution
- **Payment Dates**: Critical for billing phases
- **Format**: Uses local date format automatically

### Status Indicators
- **Color Coded**: Status badges show at a glance
- **Progress Bars**: Visual representation of completion
- **Badges**: Indicate status and priority
- **Metrics**: Summary cards at top of each tab

---

## Keyboard Shortcuts

| Action | Keyboard |
|--------|----------|
| Go Back | Backspace (some browsers) |
| Close Modal | ESC key |
| Submit Form | Enter (in last field) or Tab to Submit |
| Tab Navigation | Tab + Shift-Tab to navigate |

---

## Troubleshooting

### Issue: Page Won't Load
- Check internet connection
- Verify project ID is correct
- Clear browser cache
- Reload page

### Issue: Form Won't Submit
- Verify all required fields (marked with *) are filled
- Check dates are in correct format
- Ensure numbers are valid
- Look for error messages above form

### Issue: Data Won't Save
- Check browser console for errors
- Verify API server is running
- Check authentication is valid
- Try closing and reopening page

### Issue: Modal Not Visible
- Check modal is in front (z-index)
- Verify modal open state
- Try scrolling up if cut off
- Refresh page

---

## Data Validation Rules

### Billing Phases
- ✅ Phase number must be unique
- ✅ Amount must be greater than 0
- ✅ Percentage must be between 0-100
- ✅ Actual dates cannot be before planned dates
- ✅ Currency is required

### Issues
- ✅ Title is required (non-empty)
- ✅ Code should be unique
- ✅ Category must be selected
- ✅ Due date should be in future (recommended)
- ✅ Estimated cost must be non-negative

### Project
- ✅ Budget cannot be negative
- ✅ End date must be after start date
- ✅ Status must be valid
- ✅ Priority must be selected

---

## Best Practices

### For Project Managers
1. **Weekly Reviews**: Check progress and issues weekly
2. **Proactive Planning**: Create billing phases before project starts
3. **Issue Prevention**: Log issues early, even if minor
4. **Budget Tracking**: Monitor spending against budget monthly
5. **Team Communication**: Keep notes updated for team visibility

### For Finance Teams
1. **Phase Tracking**: Update phase status as work progresses
2. **Payment Recording**: Mark phases as paid when received
3. **Invoice Alignment**: Match billing phases to invoices
4. **Budget Monitoring**: Flag any overages immediately

### For Team Members
1. **Issue Reporting**: Log issues as soon as discovered
2. **Status Updates**: Change issue status as you progress
3. **Honesty**: Report realistic estimates and timelines
4. **Communication**: Add notes for clarity

---

## Getting Help

### Documentation
- See PROJECT_MANAGEMENT_COMPLETE_GUIDE.md for system overview
- Check UI_STYLING_STANDARDS.md for design questions
- Review API_ENDPOINTS.md for technical details

### Support
- Contact project manager for access issues
- Report bugs with screenshots and steps to reproduce
- Suggest improvements through feedback channels

---

## Summary

The Integrated Project Detail page provides:
✅ Complete project visibility
✅ Efficient billing management
✅ Effective issue tracking
✅ Easy navigation
✅ Real-time data management

**Start using it today for better project management!**

---

**Version**: 1.0
**Last Updated**: December 2024
**Status**: ✅ Ready to Use
