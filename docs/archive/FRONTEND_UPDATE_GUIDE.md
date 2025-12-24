# Frontend Update Guide - Data Connection Changes
**Date:** December 23, 2025

---

## 🎯 Overview
The project data structure has been updated. Frontend components need to reflect these changes.

---

## 🔄 Breaking Changes

### Change 1: ProjectManager Access Pattern

**BEFORE (OLD):**
```typescript
// ❌ This will NOT work anymore
const managerName = project.projectManager?.name;
const managerEmail = project.projectManager?.email;
```

**AFTER (NEW):**
```typescript
// ✅ This is the correct pattern
const managerName = project.projectManager?.user?.name;
const managerEmail = project.projectManager?.user?.email;
const managerRole = project.projectManager?.managerRole;
const managerStatus = project.projectManager?.status;
```

**Reason:** projectManager is now a ProjectManager object, not a User. User details are nested.

---

### Change 2: Task Relation Names

**BEFORE (OLD):**
```typescript
// ❌ These relations don't exist
task.assignedTo?.name
task.reportedBy?.name
```

**AFTER (NEW):**
```typescript
// ✅ Use correct relation names
task.assignee?.name
task.reporter?.name
```

---

### Change 3: S-Curve Fields Now Available

**NEW FIELDS (Now available on Task):**
```typescript
task.plannedStartDate      // Date
task.plannedEndDate        // Date
task.plannedProgressWeight // number (0-100)
task.actualProgress        // number (0-100)
```

These were added for S-Curve progress charts.

---

## 🔍 Find and Replace

Use your editor's find/replace to update:

### Find/Replace 1: ProjectManager.name
```
Find:    project\.projectManager\?\.name
Replace: project.projectManager?.user?.name
```

### Find/Replace 2: ProjectManager.email
```
Find:    project\.projectManager\?\.email
Replace: project.projectManager?.user?.email
```

### Find/Replace 3: Task.assignedTo
```
Find:    task\.assignedTo
Replace: task.assignee
```

### Find/Replace 4: Task.reportedBy
```
Find:    task\.reportedBy
Replace: task.reporter
```

---

## 📝 Files to Update

### High Priority
- [ ] `src/components/projects/ProjectForm.tsx` - If displays manager
- [ ] `src/components/projects/ProjectList.tsx` - If displays manager
- [ ] `src/pages/Projects.tsx` - If displays manager
- [ ] `src/pages/MyProjects.tsx` - If displays manager
- [ ] `src/pages/dashboard/ProjectTableView.tsx` - If displays manager

### Medium Priority
- [ ] `src/components/tasks/TaskCard.tsx` - If displays assignee/reporter
- [ ] `src/components/tasks/TaskManagement.tsx` - If displays assignee/reporter
- [ ] `src/components/tasks/TaskList.tsx` - If displays assignee/reporter

### Low Priority
- [ ] TypeScript types in `src/types/` - If using strict types
- [ ] Service files in `src/services/` - If using strict types

---

## 🧪 Testing Update Pattern

### Before Testing
```bash
# 1. Apply migration
npx prisma migrate dev

# 2. Start dev server
npm run dev

# 3. Run verification
node scripts/verify-data-connections.js
```

### Component Testing
```typescript
// Test component receives correct data structure
const project = {
  id: '123',
  name: 'Test Project',
  projectManager: {
    id: 'pm-123',
    managerRole: 'Project Manager',
    status: 'active',
    user: {
      id: 'user-123',
      name: 'John Doe',
      email: 'john@example.com',
      avatar: 'https://...'
    }
  },
  tasks: [
    {
      id: 'task-1',
      title: 'Task 1',
      assignee: { id: 'user-2', name: 'Jane' },
      reporter: { id: 'user-1', name: 'John' },
      plannedStartDate: new Date('2025-01-01'),
      plannedEndDate: new Date('2025-01-15'),
      plannedProgressWeight: 25,
      actualProgress: 20
    }
  ]
};

// Component should handle this structure
<ProjectComponent project={project} />
```

---

## 💡 TypeScript Type Updates

### Old Project Type
```typescript
interface Project {
  // ...
  projectManager?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  // ...
}
```

### New Project Type
```typescript
interface Project {
  // ...
  projectManagerId?: string;
  projectManager?: {
    id: string;
    managerRole: string;
    status: string;
    user: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
    };
  };
  // ...
}

interface Task {
  // ...
  assigneeId?: string;
  assignee?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  reporterId: string;
  reporter: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  plannedStartDate?: Date;
  plannedEndDate?: Date;
  plannedProgressWeight?: number;
  actualProgress: number;
  // ...
}
```

---

## 🎨 Component Examples

### Example 1: Displaying Project Manager

**BEFORE (OLD):**
```tsx
export function ProjectHeader({ project }: { project: Project }) {
  return (
    <div>
      <h1>{project.name}</h1>
      {project.projectManager && (
        <p>Manager: {project.projectManager.name}</p>
      )}
    </div>
  );
}
```

**AFTER (NEW):**
```tsx
export function ProjectHeader({ project }: { project: Project }) {
  return (
    <div>
      <h1>{project.name}</h1>
      {project.projectManager && (
        <div>
          <p>Manager: {project.projectManager.user.name}</p>
          <p>Role: {project.projectManager.managerRole}</p>
          <p>Status: {project.projectManager.status}</p>
        </div>
      )}
    </div>
  );
}
```

---

### Example 2: Displaying Task Assignments

**BEFORE (OLD):**
```tsx
export function TaskRow({ task }: { task: Task }) {
  return (
    <tr>
      <td>{task.title}</td>
      <td>{task.assignedTo?.name || 'Unassigned'}</td>
      <td>{task.reportedBy?.name}</td>
    </tr>
  );
}
```

**AFTER (NEW):**
```tsx
export function TaskRow({ task }: { task: Task }) {
  return (
    <tr>
      <td>{task.title}</td>
      <td>{task.assignee?.name || 'Unassigned'}</td>
      <td>{task.reporter?.name}</td>
    </tr>
  );
}
```

---

### Example 3: S-Curve Chart Component

**NEW CAPABILITY (Now possible):**
```tsx
import { LineChart, Line, XAxis, YAxis } from 'recharts';

export function SCurveChart({ 
  project, 
  tasks 
}: { 
  project: Project; 
  tasks: Task[] 
}) {
  // Calculate S-Curve data
  const startDate = project.startDate;
  const endDate = project.endDate;
  
  const scurveData = calculateSCurveData(tasks, startDate, endDate);
  
  return (
    <LineChart width={800} height={400} data={scurveData}>
      <XAxis dataKey="week" />
      <YAxis />
      <Line 
        type="monotone" 
        dataKey="plannedProgress" 
        stroke="#8884d8" 
        name="Planned"
      />
      <Line 
        type="monotone" 
        dataKey="actualProgress" 
        stroke="#82ca9d" 
        name="Actual"
      />
    </LineChart>
  );
}

function calculateSCurveData(
  tasks: Task[], 
  startDate: Date, 
  endDate: Date
) {
  // Use new fields: plannedStartDate, plannedEndDate, plannedProgressWeight, actualProgress
  const totalWeight = tasks.reduce(
    (sum, t) => sum + (t.plannedProgressWeight || 0), 
    0
  );
  
  // ... calculate weekly progress ...
  
  return chartData;
}
```

---

## ✅ Verification Checklist

After updating frontend code:

- [ ] No TypeScript errors (strict mode)
- [ ] ProjectManager access uses `.user` nesting
- [ ] Task relations use `assignee`/`reporter` (not `assignedTo`/`reportedBy`)
- [ ] S-Curve fields are available on tasks
- [ ] All components render without errors
- [ ] API responses match expected structure
- [ ] Tests pass (if any)

---

## 🚀 Quick Update Steps

1. **Update ProjectManager references** (highest priority)
   ```bash
   # In VS Code, use Find and Replace (Ctrl+H)
   # Replace projectManager?.name with projectManager?.user?.name
   # Replace projectManager?.email with projectManager?.user?.email
   ```

2. **Update Task relations** (high priority)
   ```bash
   # Replace assignedTo with assignee
   # Replace reportedBy with reporter
   ```

3. **Update Type definitions** (medium priority)
   - Check `src/types/project.ts`
   - Check `src/types/task.ts`
   - Ensure types match new structure

4. **Test components** (high priority)
   ```bash
   npm run test
   npm run dev  # Test in browser
   ```

---

## 📊 Before/After Summary

| Aspect | Before | After |
|--------|--------|-------|
| **ProjectManager Access** | `project.projectManager.name` | `project.projectManager.user.name` |
| **Task Assignee** | `task.assignedTo` | `task.assignee` |
| **Task Reporter** | `task.reportedBy` | `task.reporter` |
| **S-Curve Fields** | Not available | Available on Task |
| **Manager Role** | Not available | `projectManager.managerRole` |
| **Manager Status** | Not available | `projectManager.status` |
| **ProjectManagerId** | Via junction table | Direct field |

---

## 🆘 Troubleshooting

### Error: "Cannot read property 'name' of undefined"
**Cause:** Accessing `projectManager.name` instead of `projectManager.user.name`
**Fix:** Add `.user` in the chain

---

### Error: "assignedTo is undefined"
**Cause:** Using old relation name instead of `assignee`
**Fix:** Replace `assignedTo` with `assignee`

---

### Error: "plannedStartDate is undefined"
**Cause:** S-Curve fields not fetched from API
**Fix:** Ensure migration is applied and API is restarted

---

### TypeScript Error: "property 'user' does not exist"
**Cause:** Types not updated
**Fix:** Update type definitions to match new structure

---

## 📚 Related Documentation

- `PROJECT_DATA_CONNECTION_ANALYSIS.md` - Detailed analysis
- `DATA_CONNECTION_FIX_CHECKLIST.md` - Implementation checklist
- `src/pages/api/projects/[id].ts` - Updated API response

---

**Last Updated:** December 23, 2025  
**Status:** Ready for Implementation  
**Estimated Update Time:** 30-45 minutes
