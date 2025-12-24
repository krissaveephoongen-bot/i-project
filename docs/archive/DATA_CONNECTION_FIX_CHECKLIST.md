# Data Connection Fixes - Implementation Checklist
**Date:** December 23, 2025  
**Status:** 🔄 In Progress

---

## ✅ Completed Changes

### 1. Prisma Schema Updates
- [x] Added `projectManagerId` field to Project model
- [x] Added `projectManager` relation to Project model
- [x] Added `assignedProjects` relation to ProjectManager model
- [x] Added index on `projectManagerId` field
- [x] Created migration file: `20251223000001_add_projectManagerId_to_project`

**Files Modified:**
- `prisma/schema.prisma`
- `prisma/migrations/20251223000001_add_projectManagerId_to_project/migration.sql`

---

### 2. API Route Fixes - GET `/api/projects/[id]`
- [x] Fixed Task relation names: `assignedTo` → `assignee`
- [x] Fixed Task relation names: `reportedBy` → `reporter`
- [x] Added S-Curve fields to Task select:
  - `plannedStartDate`
  - `plannedEndDate`
  - `plannedProgressWeight`
  - `actualProgress`
- [x] Changed Task `include` to `select` for better performance
- [x] Updated projectManager include to match new relations

**Changes:**
```typescript
// BEFORE: assignedTo, reportedBy (incorrect relation names)
// AFTER: assignee, reporter (correct relation names)

// ADDED: S-Curve fields for project progress tracking
// Changed: include → select for explicit field selection
```

**File Modified:**
- `src/pages/api/projects/[id].ts`

---

### 3. API Route Fixes - POST `/api/projects`
- [x] Updated projectManager include in response
- [x] Ensured consistent structure with GET handler

**File Modified:**
- `src/pages/api/projects/index.ts`

---

### 4. Support Scripts Created
- [x] Migration helper: `scripts/apply-migration.js`
- [x] Verification script: `scripts/verify-data-connections.js`

---

## 📋 Next Steps (DO THIS IN ORDER)

### Step 1: Apply Database Migration
```bash
# Option A: Using Prisma (recommended)
npx prisma migrate dev

# Option B: Manual verification
node scripts/apply-migration.js
```

**Expected Output:**
```
✅ Migration applied successfully!
Next steps:
1. Run: npm run dev
2. Test the API endpoints
```

---

### Step 2: Verify All Changes
```bash
node scripts/verify-data-connections.js
```

**Expected Output:**
```
✅ SUCCESS projectManagerId field is accessible
✅ SUCCESS All S-Curve fields are accessible on Task
✅ SUCCESS Project relations load correctly
✅ SUCCESS No orphaned tasks found
✅ SUCCESS All project relationships are properly configured
```

---

### Step 3: Test API Endpoints
```bash
# Start development server
npm run dev
```

**Test Checklist:**

#### Test GET /api/projects (List all projects)
```bash
curl http://localhost:5000/api/projects
```

Expected response includes:
- ✅ `projectManager` object with `user` nested
- ✅ `client` object (if assigned)
- ✅ `_count` for related records

---

#### Test GET /api/projects/{id} (Get single project)
```bash
curl http://localhost:5000/api/projects/{projectId}
```

Expected response includes:
- ✅ `projectManager` with full user details
- ✅ `tasks` with:
  - `plannedStartDate` and `plannedEndDate` fields
  - `plannedProgressWeight` field
  - `actualProgress` field
  - `assignee` relation (not `assignedTo`)
  - `reporter` relation (not `reportedBy`)

---

#### Test POST /api/projects (Create new project)
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Project",
    "code": "TEST001",
    "startDate": "2025-01-01",
    "projectManagerId": "uuid-of-project-manager"
  }'
```

Expected:
- ✅ Project created with projectManagerId
- ✅ Response includes full projectManager details

---

#### Test PUT /api/projects/{id} (Update project)
```bash
curl -X PUT http://localhost:5000/api/projects/{projectId} \
  -H "Content-Type: application/json" \
  -d '{
    "projectManagerId": "new-uuid"
  }'
```

Expected:
- ✅ Project updated with new projectManagerId
- ✅ Response includes updated projectManager

---

### Step 4: Update Frontend (If Needed)

Check if any components need updates:

```typescript
// BEFORE (OLD - Will fail)
project.projectManager.name

// AFTER (NEW - Correct)
project.projectManager?.user?.name
```

**Files to Check:**
- `src/components/projects/*`
- `src/pages/Projects.tsx`
- `src/pages/MyProjects.tsx`
- `src/pages/dashboard/ProjectTableView.tsx`

**Search for these patterns:**
- `projectManager` access
- `assignedTo` on tasks (should be `assignee`)
- `reportedBy` on tasks (should be `reporter`)

---

### Step 5: Run Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e
```

---

## 🔍 Verification Commands

### Check Migration Status
```bash
npx prisma migrate status
```

---

### Check Database Schema
```bash
# View Prisma schema
npx prisma db push --dry-run

# View PostgreSQL schema
psql $DATABASE_URL -c "\d \"Project\""
```

---

### Query Test Data
```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const projects = await prisma.project.findMany({
    include: {
      projectManager: { include: { user: true } },
      tasks: { take: 1 }
    },
    take: 1
  });
  console.log(JSON.stringify(projects, null, 2));
  await prisma.\$disconnect();
})();
"
```

---

## 📊 Data Structure Reference

### Project Response Structure (NEW)
```typescript
{
  id: string;
  name: string;
  code: string;
  projectManagerId?: string;  // NEW!
  projectManager?: {           // NEW! (now with user nesting)
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
  client?: { ... };
  tasks: Array<{
    id: string;
    title: string;
    plannedStartDate?: Date;    // NEW!
    plannedEndDate?: Date;      // NEW!
    plannedProgressWeight?: number; // NEW!
    actualProgress: number;     // NEW!
    assignee?: { ... };         // FIXED! (was assignedTo)
    reporter: { ... };          // FIXED! (was reportedBy)
  }>;
  // ... other fields
}
```

---

## 🚨 Common Issues & Solutions

### Issue 1: "projectManagerId is unknown field"
**Cause:** Migration not applied
**Solution:** 
```bash
npx prisma migrate dev
```

---

### Issue 2: Task relations returning null
**Cause:** Relation names still using old names
**Solution:** Check API includes `assignee` and `reporter` (not `assignedTo`/`reportedBy`)

---

### Issue 3: S-Curve fields undefined
**Cause:** Not selected in task query
**Solution:** Ensure task select includes all planned/actual progress fields

---

### Issue 4: ProjectManager object structure changed
**Cause:** Now includes nested `user` object
**Solution:** Update frontend code to access `projectManager.user.name` instead of `projectManager.name`

---

## 📝 Files Modified Summary

| File | Changes | Priority |
|------|---------|----------|
| `prisma/schema.prisma` | Added projectManagerId + relation | 🔴 HIGH |
| `src/pages/api/projects/[id].ts` | Fixed relations + S-Curve fields | 🔴 HIGH |
| `src/pages/api/projects/index.ts` | Updated projectManager include | 🟡 MEDIUM |
| `prisma/migrations/20251223000001_*` | Migration SQL | 🔴 HIGH |
| `scripts/apply-migration.js` | Helper script | 🟢 LOW |
| `scripts/verify-data-connections.js` | Verification script | 🟢 LOW |

---

## ✨ Benefits

✅ **Type Safety:** ProjectManagerId is now a proper field, not relying on junction table  
✅ **Performance:** Task select is explicit, no unnecessary data loading  
✅ **S-Curve Ready:** All fields needed for project progress charts are available  
✅ **Consistency:** Relation names match Prisma schema exactly  
✅ **Maintainability:** Clear data structure and relationships  

---

## 🎯 Success Criteria

- [ ] Migration applies without errors
- [ ] All API endpoints return proper structure
- [ ] GET /api/projects includes projectManager with user details
- [ ] Tasks include all S-Curve fields
- [ ] Task relations use correct names (assignee, reporter)
- [ ] No TypeScript errors in components
- [ ] All tests pass
- [ ] verify-data-connections.js shows all green ✅

---

## 📞 Support

If you encounter issues:

1. Check error messages in console
2. Run verification script: `node scripts/verify-data-connections.js`
3. Review the `PROJECT_DATA_CONNECTION_ANALYSIS.md` document
4. Check migration status: `npx prisma migrate status`

---

**Last Updated:** December 23, 2025  
**Status:** Implementation Ready  
**Next Action:** Apply migration and run verification
