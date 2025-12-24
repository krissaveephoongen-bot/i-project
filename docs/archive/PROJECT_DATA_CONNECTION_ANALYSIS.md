# Project Data Connection Analysis
**วันที่:** December 23, 2025  
**สถานะ:** ✅ ตรวจสอบแล้ว

---

## 📊 Executive Summary
ระบบ Project Management ของคุณมี **ความเชื่อมโยงข้อมูล** ที่สมบูรณ์และถูกต้องตามสถาปัตยกรรม Prisma ORM กับ PostgreSQL  

ทั้งนี้มี **ประเด็นการออกแบบ** ที่ต้องพิจารณาดังนี้:

---

## 🔗 Project Data Relationships

### 1. **Project Model Relationships**
```
Project (Core Entity)
├── Client (Many-to-One)
│   └── clientId → clients.id
├── ProjectManagerAssignment (One-to-Many)
│   └── id → ProjectManagerAssignment.projectId
├── Task (One-to-Many)
│   └── id → tasks.projectId
├── Cost (One-to-Many)
│   └── id → Cost.projectId
├── Timesheet (One-to-Many)
│   └── id → timesheets.projectId
├── TimeLog (One-to-Many)
│   └── id → time_logs.projectId
└── Comment (One-to-Many)
    └── id → comments.projectId
```

### 2. **Current Implementation Status**

| Relationship | Database | API Handler | Status |
|---|---|---|---|
| Project → Client | ✅ `clientId` FK | ✅ included in GET | ✅ OK |
| Project → ProjectManagerAssignment | ✅ Junction Table | ✅ included via relation | ✅ OK |
| Project → Tasks | ✅ `projectId` FK | ✅ included in GET | ✅ OK |
| Project → Costs | ✅ `projectId` FK | ✅ relations defined | ⚠️ Not included in API |
| Project → Timesheets | ✅ `projectId` FK | ✅ included in GET | ✅ OK |
| Project → TimeLogs | ✅ `projectId` FK | ✅ included in GET | ✅ OK |

---

## 🔴 Issues Found

### Issue #1: Missing `projectManagerId` Direct Field
**Severity:** ⚠️ Medium

**ปัญหา:**
- Prisma schema ไม่มี `projectManagerId` field โดยตรงบน Project model
- API routes พยายามใช้ `projectManagerId` ในการ create/update
- จำเป็นต้องผ่าน `ProjectManagerAssignment` (junction table)

**ตำแหน่ง:**
```typescript
// src/pages/api/projects/index.ts (lines 90, 117)
// src/pages/api/projects/[id].ts (lines 108, 150)

// ❌ ไม่ได้อยู่ใน schema.prisma
projectManagerId: String?  // MISSING!
```

**แนวทางแก้ไข:**

**Option A: เพิ่ม direct field (Recommended)**
```prisma
model Project {
  // ... existing fields ...
  projectManagerId  String?     @db.Uuid
  projectManager    ProjectManager? @relation(fields: [projectManagerId], references: [id])
}
```

**Option B: ใช้ junction table เท่านั้น (Current)**
```typescript
// ต้องแก้ไข API routes เพื่อสร้าง ProjectManagerAssignment แทน
const assignment = await prisma.projectManagerAssignment.create({
  data: {
    projectManagerId,
    projectId,
    role: 'manager',
    status: 'active'
  }
});
```

---

### Issue #2: Inconsistent Field Naming
**Severity:** ⚠️ Medium

**ปัญหา:**
Task model:
```prisma
assigneeId      String?     @db.Uuid
assignee        User?       @relation("AssignedTasks", fields: [assigneeId], references: [id])
reporterId      String      @db.Uuid
reporter        User        @relation("ReportedTasks", fields: [reporterId], references: [id])
```

แต่ API `[id].ts` พยายามเข้าถึง:
```typescript
assignedTo: { ... }      // ❌ ไม่มี assignedTo relation
reportedBy: { ... }      // ❌ ไม่มี reportedBy relation
```

**แนวทางแก้ไข:**
```typescript
// ต้องใช้ชื่อ relation ที่ถูกต้อง
assignee: {
  select: { id: true, name: true, email: true, avatar: true }
}
reporter: {
  select: { id: true, name: true, email: true, avatar: true }
}
```

---

### Issue #3: Missing `plannedStartDate` and `plannedEndDate` Fields
**Severity:** ⚠️ Medium

**ปัญหา:**
- Task model มี `plannedStartDate` และ `plannedEndDate` สำหรับ S-Curve
- ไม่ได้ถูก map ในการ fetch tasks

**ตำแหน่ง:**
```prisma
// schema.prisma (lines 312-313) - มี fields นี้
plannedStartDate    DateTime?   @db.Timestamptz(6)
plannedEndDate      DateTime?   @db.Timestamptz(6)
```

**แนวทางแก้ไข:**
```typescript
// API include statement ต้องรวม fields เหล่านี้
tasks: {
  select: {
    id: true,
    title: true,
    plannedStartDate: true,    // ✅ เพิ่ม
    plannedEndDate: true,       // ✅ เพิ่ม
    plannedProgressWeight: true, // ✅ เพิ่ม
    actualProgress: true,
    // ... other fields
  }
}
```

---

## ✅ Data Flow Verification

### Frontend Components
```
TaskManagement.tsx
├── fetchProjects()
│   └── GET /api/projects/my-projects?userId={id}
│       └── Returns: Project[]
└── fetchTasks()
    └── GET /api/projects/{projectId}/tasks
        └── Returns: Task[]
```

### API Endpoints
```
GET  /api/projects           ✅ Lists all projects
POST /api/projects           ✅ Creates project
GET  /api/projects/{id}      ✅ Gets single project with related data
PUT  /api/projects/{id}      ⚠️  Uses non-existent projectManagerId field
DELETE /api/projects/{id}    ✅ Deletes project with cascade checks
```

---

## 🔍 Detailed Schema Analysis

### Project Table Schema
```sql
CREATE TABLE "public"."Project" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "budget" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "actualCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estimatedHours" INTEGER DEFAULT 0,
    "startDate" TIMESTAMPTZ(6) NOT NULL,
    "endDate" TIMESTAMPTZ(6),
    "status" "public"."ProjectStatus" NOT NULL DEFAULT 'PLANNING',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "clientId" UUID,                    -- ✅ Foreign Key
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "progress" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);
-- ⚠️ NOTE: ไม่มี projectManagerId field
```

### ProjectManagerAssignment Table Schema
```sql
CREATE TABLE "public"."ProjectManagerAssignment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "projectManagerId" UUID NOT NULL,   -- FK to ProjectManager
    "projectId" UUID NOT NULL,           -- FK to Project
    "role" TEXT NOT NULL DEFAULT 'manager',
    "startDate" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "ProjectManagerAssignment_pkey" PRIMARY KEY ("id"),
    UNIQUE("projectManagerId", "projectId")  -- One PM per project
);
```

---

## 📋 Relationships Summary

### Many-to-One (Project side)
| Relation | Local Field | Foreign Table | Remote Field | Status |
|---|---|---|---|---|
| Client | clientId | clients | id | ✅ OK |
| ProjectManager (via Assignment) | - | ProjectManagerAssignment | projectId | ✅ OK but indirect |

### One-to-Many (Project side)
| Child Table | Foreign Key | Relations Used | Status |
|---|---|---|---|
| Task | projectId | tasks | ✅ OK |
| Cost | projectId | costs | ✅ OK |
| Timesheet | projectId | timesheets | ✅ OK |
| TimeLog | projectId | timeLogs | ✅ OK |
| Comment | projectId | comments | ✅ OK |
| ProjectManagerAssignment | projectId | projectManagerAssignments | ✅ OK |

---

## 🛠️ Recommended Fixes

### Priority 1: Fix Task Include Statement
**File:** `src/pages/api/projects/[id].ts`

```typescript
// ❌ CURRENT (lines 24-48)
tasks: {
  include: {
    assignedTo: { ... },      // WRONG: assignedTo
    reportedBy: { ... },      // WRONG: reportedBy
  }
}

// ✅ FIXED
tasks: {
  select: {
    id: true,
    title: true,
    name: true,
    description: true,
    status: true,
    priority: true,
    dueDate: true,
    estimatedHours: true,
    actualHours: true,
    plannedStartDate: true,        // ✅ ADD
    plannedEndDate: true,          // ✅ ADD
    plannedProgressWeight: true,   // ✅ ADD
    actualProgress: true,          // ✅ ADD
    assigneeId: true,
    assignee: {                    // USE CORRECT NAME
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true
      }
    },
    reporterId: true,
    reporter: {                    // USE CORRECT NAME
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true
      }
    },
    _count: {
      select: {
        comments: true,
        timeLogs: true
      }
    }
  }
}
```

### Priority 2: Add projectManagerId Field
**File:** `prisma/schema.prisma`

```prisma
model Project {
  id              String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  // ... existing fields ...
  clientId        String?       @db.Uuid
  client          Client?       @relation(fields: [clientId], references: [id])
  
  // ✅ ADD THIS DIRECT REFERENCE
  projectManagerId String?      @db.Uuid
  projectManager   ProjectManager? @relation(fields: [projectManagerId], references: [id])
  
  // KEEP EXISTING
  projectManagerAssignments ProjectManagerAssignment[]
  
  // ... rest of relations ...
}

model ProjectManager {
  // ... existing fields ...
  
  // ✅ ADD THIS INVERSE RELATION
  assignedProjects Project[]
  projectAssignments ProjectManagerAssignment[]
}
```

**Migration Steps:**
```bash
# 1. Add column to database
alter table "Project" add column "projectManagerId" UUID;

# 2. Update Prisma schema
# 3. Run migration
npx prisma migrate dev --name add_projectManagerId_to_project

# 4. Update existing ProjectManagerAssignment references (optional)
# Copy first active assignment to projectManagerId for backward compatibility
```

### Priority 3: Fix API Route Parameters
**File:** `src/pages/api/projects/[id].ts`

```typescript
// ❌ CURRENT (line 108)
if (req.method === 'PUT') {
  const { projectManagerId, ... } = req.body;  // Now valid!
  
  const updatedProject = await prisma.project.update({
    where: { id: id as string },
    data: {
      // ... other fields ...
      projectManagerId,  // ✅ Now works with schema
    }
  });
}
```

---

## 📊 Data Flow Diagram

```
┌─────────────────┐
│   Frontend      │
│  (React/TS)     │
└────────┬────────┘
         │
    GET /api/projects/{id}
         │
         ▼
┌─────────────────────────────┐
│   API Handler               │
│ ([id].ts - GET handler)     │
└────────┬────────────────────┘
         │
    Prisma Query
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                        │
├──────────────────────────────────────────────────────────────┤
│ Project (id, name, code, clientId, ...)                       │
│   ├── Client (via clientId)                                   │
│   ├── ProjectManagerAssignment (via id)                       │
│   │   └── ProjectManager (via projectManagerId)              │
│   ├── Task (via id)                                           │
│   │   ├── User assignee (via assigneeId)                     │
│   │   └── User reporter (via reporterId)                     │
│   ├── Cost (via id)                                           │
│   ├── Timesheet (via id)                                      │
│   ├── TimeLog (via id)                                        │
│   └── Comment (via id)                                        │
└──────────────────────────────────────────────────────────────┘
```

---

## 🧪 Data Consistency Checks

### Check 1: ProjectManagerAssignment Integrity
```sql
-- Verify all projects with managers
SELECT 
  p.id,
  p.name,
  p.code,
  pm.userId,
  u.name as manager_name
FROM "Project" p
LEFT JOIN "ProjectManagerAssignment" pma ON p.id = pma.projectId
LEFT JOIN "ProjectManager" pm ON pma.projectManagerId = pm.id
LEFT JOIN "User" u ON pm.userId = u.id
WHERE pma.status = 'active'
ORDER BY p.name;
```

### Check 2: Missing Project References
```sql
-- Find tasks without projects
SELECT * FROM tasks WHERE "projectId" IS NULL;

-- Find costs without projects
SELECT * FROM "Cost" WHERE "projectId" IS NULL;

-- Find timesheets without projects
SELECT * FROM timesheets WHERE "projectId" IS NULL;
```

### Check 3: Orphaned Records
```sql
-- Find records pointing to deleted projects
SELECT * FROM tasks 
WHERE "projectId" NOT IN (SELECT id FROM "Project");
```

---

## 💡 Best Practices

### 1. **Always Load Related Data Explicitly**
```typescript
// ✅ GOOD: Explicit include
const project = await prisma.project.findUnique({
  where: { id },
  include: {
    client: true,
    tasks: {
      include: {
        assignee: true,
        reporter: true
      }
    }
  }
});

// ❌ AVOID: Relying on implicit relations
const project = await prisma.project.findUnique({
  where: { id }
});
// Missing related data!
```

### 2. **Use Select for Performance**
```typescript
// ✅ GOOD: Specify only needed fields
tasks: {
  select: {
    id: true,
    title: true,
    status: true,
    assignee: { select: { id: true, name: true } }
  }
}

// ⚠️ AVOID: Loading unnecessary data
tasks: {
  include: { /* loads all fields */ }
}
```

### 3. **Handle Null Relations**
```typescript
// ✅ GOOD: Check for null/undefined
const projectManagerName = project.projectManager?.user?.name || 'Unassigned';

// ❌ AVOID: Assuming relation exists
const name = project.projectManager.user.name;  // Will crash if null!
```

---

## 📝 Testing Checklist

- [ ] Test GET /api/projects with related data
- [ ] Test POST /api/projects with new project manager assignment
- [ ] Test PUT /api/projects/{id} with projectManagerId update
- [ ] Test cascade delete (project with tasks/costs)
- [ ] Test S-Curve calculation with plannedStartDate/plannedEndDate
- [ ] Verify task relations (assignee/reporter) return correct data
- [ ] Load test with projects that have many related records

---

## 🔄 Migration Path

### Step 1: Add projectManagerId Field (Non-Breaking)
1. Add column to database
2. Update Prisma schema
3. Deploy update
4. No breaking changes - still supports ProjectManagerAssignment

### Step 2: Update API Routes
1. Modify [id].ts to accept projectManagerId
2. Update create/update logic
3. Add tests

### Step 3: Update Frontend
1. Modify form submission to send projectManagerId
2. Update components to display new relation
3. Test end-to-end

### Step 4: (Optional) Deprecate Direct Assignment
1. Keep ProjectManagerAssignment for multiple managers
2. Use projectManagerId as primary manager field

---

## 📞 Questions to Consider

1. **Should a Project have ONE or MANY Project Managers?**
   - If ONE: Use direct `projectManagerId` field
   - If MANY: Keep `ProjectManagerAssignment` (current design)
   - If BOTH: Keep both (some primary, some secondary via assignments)

2. **What happens when a Project Manager is deleted?**
   - Cascade delete assignments?
   - Reassign to another manager?
   - Leave unassigned?

3. **Should task assignment validation include project membership?**
   - Can only assign tasks to team members on the project?
   - Or allow any user assignment?

---

## 📚 Related Files

- `prisma/schema.prisma` - Database schema
- `src/pages/api/projects/[id].ts` - Project API handler (needs fixes)
- `src/services/projectService.ts` - Frontend service layer
- `src/components/tasks/TaskManagement.tsx` - Task component
- `prisma/migrations/20251217105841_init_schema/migration.sql` - Initial schema

---

## ✨ Summary of Action Items

| Priority | Item | Status |
|---|---|---|
| 🔴 HIGH | Fix Task relation names (assignedTo → assignee) | TODO |
| 🔴 HIGH | Add plannedStartDate/EndDate to task select | TODO |
| 🟡 MEDIUM | Add projectManagerId to Project model | TODO |
| 🟡 MEDIUM | Update API routes to use projectManagerId | TODO |
| 🟢 LOW | Implement PM assignment via junction table | OPTIONAL |

---

**Last Updated:** December 23, 2025  
**Status:** ✅ Analysis Complete  
**Next Step:** Implement Priority 1 fixes
