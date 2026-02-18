# Database Enumerated Types Guide

This document provides a comprehensive guide to all enumerated types used in the project management application.

## Overview

Enumerated types (enums) are used throughout the application to ensure data consistency and type safety. They are defined in multiple layers:

1. **PostgreSQL Database** - Native enum types in the database
2. **Prisma Schema** - `prisma/schema.prisma`
3. **Drizzle ORM** - `backend/lib/schema.ts`
4. **TypeScript** - `backend/lib/enums.ts` and `next-app/lib/enums.ts`

## Enum Categories

### User Related Enums

#### UserRole
Defines user access levels in the system.

| Value | Description |
|-------|-------------|
| `admin` | Full system administrator access |
| `manager` | Project management access |
| `employee` | Standard employee access |

#### UserStatus
Defines the account status of a user.

| Value | Description |
|-------|-------------|
| `active` | User account is active |
| `inactive` | User account is deactivated |

---

### Project Related Enums

#### ProjectStatus
Defines the lifecycle stages of a project.

| Value | Description |
|-------|-------------|
| `planning` | Project is in planning phase |
| `active` | Project is actively being worked on |
| `on_hold` | Project is temporarily paused |
| `completed` | Project has been completed |
| `cancelled` | Project has been cancelled |

#### ProjectPriority
Defines the priority level of a project.

| Value | Description |
|-------|-------------|
| `low` | Low priority |
| `medium` | Medium priority (default) |
| `high` | High priority |
| `urgent` | Urgent priority |

#### RiskLevel
Defines the risk assessment level.

| Value | Description |
|-------|-------------|
| `low` | Low risk |
| `medium` | Medium risk |
| `high` | High risk |
| `critical` | Critical risk |

---

### Task Related Enums

#### TaskStatus
Defines the workflow status of a task.

| Value | Description |
|-------|-------------|
| `todo` | Task needs to be started |
| `in_progress` | Task is being worked on |
| `in_review` | Task is under review |
| `done` | Task is completed |
| `cancelled` | Task has been cancelled |

#### TaskPriority
Defines the priority level of a task.

| Value | Description |
|-------|-------------|
| `low` | Low priority |
| `medium` | Medium priority (default) |
| `high` | High priority |
| `urgent` | Urgent priority |

#### TaskCategory
Defines the category of a task.

| Value | Description |
|-------|-------------|
| `development` | Development work |
| `design` | Design work |
| `testing` | Testing work |
| `documentation` | Documentation work |
| `maintenance` | Maintenance work |
| `other` | Other work |

---

### Timesheet & Time Entry Enums

#### WorkType
Defines the type of work being logged.

| Value | Description |
|-------|-------------|
| `project` | Billable project work |
| `office` | Office/admin work |
| `training` | Professional development |
| `leave` | Approved leave |
| `overtime` | Overtime work |
| `other` | Other work |

#### TimeEntryStatus
Defines the approval status of a time entry.

| Value | Description |
|-------|-------------|
| `pending` | Awaiting approval |
| `approved` | Approved by manager |
| `rejected` | Rejected by manager |

---

### Leave Management Enums

#### LeaveType
Defines the types of leave available.

| Value | Description |
|-------|-------------|
| `annual` | Annual vacation leave |
| `sick` | Sick leave |
| `personal` | Personal leave |
| `maternity` | Maternity leave |
| `unpaid` | Unpaid leave |

#### LeaveStatus
Defines the status of a leave request.

| Value | Description |
|-------|-------------|
| `pending` | Awaiting approval |
| `approved` | Leave approved |
| `rejected` | Leave rejected |
| `cancelled` | Leave cancelled |

---

### Expense Enums

#### ExpenseCategory
Defines the category of an expense.

| Value | Description |
|-------|-------------|
| `travel` | Travel expenses |
| `supplies` | Office supplies |
| `equipment` | Equipment purchase |
| `training` | Training costs |
| `other` | Other expenses |

#### ExpenseStatus
Defines the approval status of an expense.

| Value | Description |
|-------|-------------|
| `pending` | Awaiting approval |
| `approved` | Expense approved |
| `rejected` | Expense rejected |
| `reimbursed` | Expense reimbursed |

#### PaymentMethod
Defines the payment method for expenses.

| Value | Description |
|-------|-------------|
| `cash` | Cash payment |
| `credit_card` | Credit card payment |
| `bank_transfer` | Bank transfer |
| `check` | Check payment |
| `other` | Other payment method |

---

### Client Enums

#### ClientStatus
Defines the status of a client.

| Value | Description |
|-------|-------------|
| `active` | Active client |
| `inactive` | Inactive client |
| `archived` | Archived client |

#### ClientType
Defines the type of client.

| Value | Description |
|-------|-------------|
| `individual` | Individual client |
| `company` | Company client |
| `government` | Government client |

---

### Sales Enums

#### SalesStatus
Defines the status of a sales deal.

| Value | Description |
|-------|-------------|
| `prospect` | Potential customer |
| `qualified` | Qualified lead |
| `proposal` | Proposal sent |
| `negotiation` | In negotiation |
| `closed_won` | Deal won |
| `closed_lost` | Deal lost |

#### SalesStage
Defines the pipeline stage of a sale.

| Value | Description |
|-------|-------------|
| `lead` | Initial lead |
| `contact` | Contact made |
| `meeting` | Meeting scheduled |
| `demo` | Demo scheduled |
| `proposal` | Proposal stage |
| `contract` | Contract stage |
| `won` | Deal won |
| `lost` | Deal lost |

---

### Stakeholder Enums

#### StakeholderRole
Defines the role of a stakeholder.

| Value | Description |
|-------|-------------|
| `executive` | Executive stakeholder |
| `manager` | Manager stakeholder |
| `team_member` | Team member |
| `client` | Client stakeholder |
| `vendor` | Vendor stakeholder |
| `consultant` | Consultant |
| `other` | Other stakeholder |

#### StakeholderType
Defines the type of stakeholder.

| Value | Description |
|-------|-------------|
| `internal` | Internal stakeholder |
| `external` | External stakeholder |
| `partner` | Partner stakeholder |

#### InvolvementLevel
Defines the involvement level of a stakeholder.

| Value | Description |
|-------|-------------|
| `high` | High involvement |
| `medium` | Medium involvement |
| `low` | Low involvement |
| `minimal` | Minimal involvement |

---

### Resource Enums

#### ResourceType
Defines the type of resource.

| Value | Description |
|-------|-------------|
| `human` | Human resource |
| `equipment` | Equipment |
| `material` | Material |
| `software` | Software |
| `facility` | Facility |
| `other` | Other resource |

#### ResourceStatus
Defines the status of a resource.

| Value | Description |
|-------|-------------|
| `available` | Available for use |
| `in_use` | Currently in use |
| `maintenance` | Under maintenance |
| `retired` | Retired |
| `archived` | Archived |

#### AllocationStatus
Defines the status of resource allocation.

| Value | Description |
|-------|-------------|
| `requested` | Allocation requested |
| `approved` | Allocation approved |
| `allocated` | Resource allocated |
| `deallocated` | Resource deallocated |
| `rejected` | Allocation rejected |

---

### Audit & Activity Enums

#### ActivityType
Defines the type of activity log entry.

| Value | Description |
|-------|-------------|
| `create` | Entity created |
| `update` | Entity updated |
| `delete` | Entity deleted |
| `comment` | Comment added |
| `assign` | Entity assigned |
| `status_change` | Status changed |

#### AuditSeverity
Defines the severity level of audit events.

| Value | Description |
|-------|-------------|
| `low` | Low severity |
| `medium` | Medium severity |
| `high` | High severity |
| `critical` | Critical severity |

---

### Milestone Enums

#### MilestoneStatus
Defines the status of a milestone.

| Value | Description |
|-------|-------------|
| `pending` | Milestone pending |
| `in_progress` | Milestone in progress |
| `completed` | Milestone completed |
| `cancelled` | Milestone cancelled |

---

### Risk Enums

#### RiskImpact
Defines the impact level of a risk.

| Value | Description |
|-------|-------------|
| `low` | Low impact |
| `medium` | Medium impact |
| `high` | High impact |
| `critical` | Critical impact |

#### RiskProbability
Defines the probability level of a risk.

| Value | Description |
|-------|-------------|
| `low` | Low probability |
| `medium` | Medium probability |
| `high` | High probability |
| `very_high` | Very high probability |

#### RiskStatus
Defines the status of a risk.

| Value | Description |
|-------|-------------|
| `open` | Risk is open |
| `mitigated` | Risk has been mitigated |
| `closed` | Risk has been closed |
| `accepted` | Risk has been accepted |

---

## Usage Examples

### TypeScript/Backend

```typescript
import { TaskStatus, ProjectStatus, UserRole } from '@/lib/enums';

// Using enum values
const task = {
  status: TaskStatus.TODO,
  priority: TaskPriority.HIGH
};

// Type-safe function parameters
function canApproveExpense(userRole: UserRole): boolean {
  return userRole === UserRole.ADMIN || userRole === UserRole.MANAGER;
}

// Getting all enum values
const allStatuses = TASK_STATUSES; // ['todo', 'in_progress', ...]
```

### Drizzle ORM

```typescript
import { taskStatusEnum, userRoleEnum } from '@/lib/schema';

// Using in table definitions
export const tasks = pgTable('tasks', {
  status: taskStatusEnum('status').default('todo'),
  // ...
});
```

### Prisma

```prisma
model tasks {
  status TaskStatus @default(todo)
  // ...
}

enum TaskStatus {
  todo
  in_progress
  in_review
  done
  cancelled
}
```

### SQL Queries

```sql
-- Using enum in WHERE clause
SELECT * FROM tasks WHERE status = 'todo';

-- Casting to enum type
SELECT * FROM tasks WHERE status = 'todo'::task_status;

-- Creating enum in migration
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'in_review', 'done', 'cancelled');
```

---

## Migration Guide

When adding new enum values or modifying existing ones:

1. **Update TypeScript enums** in `backend/lib/enums.ts` and `next-app/lib/enums.ts`
2. **Update Drizzle schema** in `backend/lib/schema.ts`
3. **Update Prisma schema** in `prisma/schema.prisma`
4. **Create PostgreSQL migration** to add/modify the enum type
5. **Run migration** to apply changes to the database

### Adding a New Enum Value

```sql
-- Example: Adding 'urgent' to priority enum
ALTER TYPE priority ADD VALUE 'urgent';
```

### Creating a New Enum Type

```sql
-- Example: Creating a new enum type
CREATE TYPE new_status AS ENUM ('value1', 'value2', 'value3');
```

---

## Best Practices

1. **Always use enum types** instead of string literals for type safety
2. **Keep enums synchronized** across all layers (TypeScript, Prisma, Drizzle, PostgreSQL)
3. **Use descriptive names** that clearly indicate the purpose
4. **Document new enums** in this guide when adding them
5. **Consider backward compatibility** when modifying existing enums
6. **Use the generic Status enum** for simple status fields to maintain consistency

---

## Files Reference

| File | Purpose |
|------|---------|
| `backend/lib/enums.ts` | TypeScript enum definitions for backend |
| `backend/lib/schema.ts` | Drizzle ORM enum definitions |
| `next-app/lib/enums.ts` | TypeScript enum definitions for frontend |
| `prisma/schema.prisma` | Prisma schema enum definitions |
| `backend/db/migrations/0004_create_enums.sql` | PostgreSQL enum creation migration |
