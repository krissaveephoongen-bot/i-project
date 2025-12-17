# Enterprise Application - Quick Reference

## 🚀 Quick Start

### Import Components
```tsx
import { 
  ProjectManagementSuite,
  TaskManagement,
  TimesheetManagement,
  CostManagement,
  ResourceManagement,
  Reports,
  Settings
} from '@/pages';
```

### Use in Routing
```tsx
<Routes>
  <Route path="/projects" element={<ProjectManagementSuite />} />
  <Route path="/timesheets" element={<TimesheetManagement />} />
  <Route path="/costs" element={<CostManagement />} />
  <Route path="/resources" element={<ResourceManagement />} />
  <Route path="/reports" element={<Reports />} />
</Routes>
```

---

## 📊 Module Overview

| Module | File | Features | API Required |
|--------|------|----------|--------------|
| **Projects** | ProjectManagementSuite.tsx | Create/Edit/Delete, Budget, Tasks, S-Curve | GET/POST/PUT/DELETE |
| **Tasks** | TaskManagement.tsx | CRUD, Progress Tracking, Weight-based | GET/POST/PUT/DELETE |
| **Timesheet** | TimesheetManagement.tsx | Submit/Approve, Weekly, Work Types | GET/POST/PUT/DELETE |
| **Costs** | CostManagement.tsx | Submit/Approve, Categories, Budget | GET/POST/PUT/DELETE |
| **Resources** | ResourceManagement.tsx | Capacity, Allocation, Utilization | GET/POST/PUT/DELETE |
| **Reports** | Reports.tsx | Generation, Filtering, Export | Filtering framework |

---

## 🔌 Service Methods

### Project Service
```typescript
// Create project
await projectService.createProject({...})

// Update project
await projectService.updateProject(id, {...})

// Get project
await projectService.getProject(id)

// Delete project
await projectService.deleteProject(id)

// Add task
await projectService.addTask(projectId, {...})

// Update task
await projectService.updateTask(projectId, taskId, {...})

// Delete task
await projectService.deleteTask(projectId, taskId)

// Calculate S-Curve
const curveData = calculateSCurveData(tasks, startDate, endDate)
```

### Timesheet Service
```typescript
// Create entry
await timesheetService.createTimesheetEntry({...})

// Get timesheet week
await timesheetService.getTimesheetWeek(userId, date)

// Submit timesheet
await timesheetService.submitTimesheetWeek(id)

// Get pending approvals
await timesheetService.getPendingApprovals(managerId)

// Approve
await timesheetService.approveTimesheet(id, comment)

// Reject
await timesheetService.rejectTimesheet(id, reason)
```

### Cost Service
```typescript
// Create cost
await costService.createCost({...})

// Get costs
await costService.getCostsByProject(projectId)
await costService.getCostsByUser(userId)

// Get pending approvals
await costService.getPendingCostApprovals(approverId)

// Approve
await costService.approveCost(id, comment)

// Reject
await costService.rejectCost(id, reason)

// Get summary
await costService.getCostSummary(projectId, startDate, endDate)
```

### Resource Service
```typescript
// Get capacity
await resourceService.getResourceCapacity(userId)

// Allocate
await resourceService.allocateResource(userId, projectId, {...})

// Deallocate
await resourceService.deallocateResource(userId, projectId)

// Get utilization
await resourceService.getResourceUtilization(userId, start, end)

// Get team capacity
await resourceService.getTeamCapacity(projectId, start, end)

// Get all resources
await resourceService.getAllResources()
```

---

## 🎯 Common Patterns

### Adding Data
1. Create form state with `useState`
2. Validate required fields
3. Show loading state
4. Call service method
5. Handle error with toast
6. Refresh data
7. Close form and reset

### Approving Items
1. Load pending items
2. Show item details
3. Approve/Reject buttons
4. Call approval service
5. Show success toast
6. Refresh list

### Filtering
1. Create filter state
2. Show filter inputs
3. Generate report on change
4. Display filtered results
5. Provide clear filters button

---

## 🎨 Component Classes

### Cards
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

### Buttons
```tsx
// Default
<Button>Action</Button>

// Variants
<Button variant="outline">Outline</Button>
<Button variant="destructive">Delete</Button>
<Button variant="secondary">Secondary</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
```

### Status Badges
```tsx
// Approved (Green)
<span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
  Approved
</span>

// Pending (Yellow)
<span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-medium">
  Pending
</span>

// Rejected (Red)
<span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium">
  Rejected
</span>
```

### Progress Bar
```tsx
<div className="w-full bg-gray-200 rounded-full h-2">
  <div
    className="bg-blue-600 h-2 rounded-full"
    style={{ width: `${percentage}%` }}
  />
</div>
```

---

## 📝 Type Definitions Quick Lookup

### Task
```typescript
{
  id: string
  name: string
  plannedStartDate: Date
  plannedEndDate: Date
  plannedProgressWeight: number (0-100)
  actualProgress: number (0-100)
  status: 'pending' | 'in-progress' | 'completed' | 'on-hold'
  projectId: string
}
```

### TimesheetEntry
```typescript
{
  id: string
  userId: string
  date: Date
  workType: 'Onsite' | 'Office' | 'Leave' | 'Project-related' | 'General Office Work'
  hours: number
  description?: string
  projectId?: string
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
}
```

### Cost
```typescript
{
  id: string
  projectId: string
  description: string
  amount: number
  category: 'labor' | 'materials' | 'equipment' | 'other'
  date: Date
  submittedBy: string
  status: 'pending' | 'approved' | 'rejected'
  invoiceNumber?: string
}
```

### ResourceAllocation
```typescript
{
  projectId: string
  projectName: string
  allocatedHours: number
  startDate: Date
  endDate: Date
  role: string
  status: 'active' | 'completed' | 'on-hold'
}
```

---

## 🛠️ Debugging Tips

### Check Current User
```tsx
const { user } = useAuthContext();
console.log('User:', user.id, user.name, user.role);
```

### Verify API Calls
```tsx
// Check in browser DevTools Network tab
// Look for: /api/projects, /api/timesheets, etc.
// Check response status and data
```

### Toast Notifications
```tsx
import { toast } from 'react-hot-toast';

toast.success('Action successful')
toast.error('Error message')
toast.loading('Loading...')
```

### Loading States
```tsx
{loading ? (
  <div className="text-center py-8">Loading...</div>
) : (
  <div>Content</div>
)}
```

---

## 🔑 Authorization Patterns

### Manager-Only Features
```tsx
{(user?.role === 'manager' || user?.role === 'admin') && (
  <TabsTrigger value="approve">Approve</TabsTrigger>
)}
```

### Admin-Only Features
```tsx
{user?.role === 'admin' && (
  <Button>Admin Action</Button>
)}
```

---

## 📱 Responsive Grid Classes

```tsx
// 1 column on mobile, 2 on tablet, 4 on desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

// Stack vertically on mobile, horizontal on tablet+
<div className="flex flex-col sm:flex-row gap-4">

// Hide on mobile, show on tablet+
<div className="hidden md:block">
```

---

## 🎯 Form Patterns

### Single Input
```tsx
<Input
  value={value}
  onChange={(e) => setValue(e.target.value)}
  placeholder="Enter value"
/>
```

### Select Dropdown
```tsx
<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

### Date Input
```tsx
<Input
  type="date"
  value={date}
  onChange={(e) => setDate(e.target.value)}
/>
```

### Form Submission
```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  // Validate
  if (!isValid) {
    toast.error('Validation error')
    return
  }
  
  try {
    setLoading(true)
    // API call
    await service.create({...})
    toast.success('Created successfully')
    resetForm()
  } catch (error) {
    toast.error('Failed to create')
  } finally {
    setLoading(false)
  }
}
```

---

## 🎨 Color Reference

| Use Case | Class | Color |
|----------|-------|-------|
| Success/Approved | `bg-green-100 text-green-700` | Green |
| Warning/Pending | `bg-yellow-100 text-yellow-700` | Yellow |
| Error/Rejected | `bg-red-100 text-red-700` | Red |
| Info/Active | `bg-blue-100 text-blue-700` | Blue |
| Neutral | `bg-gray-100 text-gray-700` | Gray |

---

## 💡 Pro Tips

1. **Always show current user** for transparency
2. **Use consistent spacing** - spacing: 4px (via gap-4, p-4)
3. **Load data on mount** - use useEffect with empty dependency
4. **Handle loading states** - prevent duplicate submissions
5. **Show toast notifications** - user feedback is critical
6. **Validate before submit** - catch errors early
7. **Use role-based UI** - hide features for unauthorized users
8. **Responsive first** - test on mobile
9. **Color code status** - red for bad, green for good
10. **Clear form after submit** - better UX

---

## 🚨 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Bearer token undefined" | Check localStorage.getItem('accessToken') |
| "Type not found" | Import from `@/types/...` |
| "Service not defined" | Import from `@/services/...` |
| "Icon not showing" | Import from 'lucide-react' |
| "Tailwind not working" | Verify class name format |
| "Form not submitting" | Check e.preventDefault() |
| "Empty list showing" | Check loading state |
| "No data after API call" | Check network response |

---

## 📖 File Reference

| File | Purpose |
|------|---------|
| `src/types/project.ts` | Project/Task types |
| `src/types/timesheet.ts` | Timesheet types |
| `src/types/cost.ts` | Cost types |
| `src/types/resource.ts` | Resource types |
| `src/services/projectService.ts` | Project API calls |
| `src/services/timesheetService.ts` | Timesheet API calls |
| `src/services/costService.ts` | Cost API calls |
| `src/services/resourceService.ts` | Resource API calls |
| `src/pages/ProjectManagementSuite.tsx` | Project UI |
| `src/pages/TimesheetManagement.tsx` | Timesheet UI |
| `src/pages/CostManagement.tsx` | Cost UI |
| `src/pages/ResourceManagement.tsx` | Resource UI |
| `src/components/SCurveChart.tsx` | S-Curve visualization |

---

**Quick Links:**
- [Full Guide](./ENTERPRISE_APP_GUIDE.md)
- [Implementation Summary](./IMPLEMENTATION_SUMMARY_ENTERPRISE.md)
- [Type Definitions](./src/types/)
- [Services](./src/services/)

---

**Last Updated:** December 2025
