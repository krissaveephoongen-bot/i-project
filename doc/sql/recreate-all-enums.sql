-- ============================================================
-- DROP ALL EXISTING ENUMS (Use with caution!)
-- ============================================================
-- Run this only if you need to recreate enums from scratch
-- Make sure no tables are using these types first

-- Drop all enum types (if they exist)
DROP TYPE IF EXISTS "user_role" CASCADE;
DROP TYPE IF EXISTS "user_status" CASCADE;
DROP TYPE IF EXISTS "ProjectStatus" CASCADE;
DROP TYPE IF EXISTS "ProjectPriority" CASCADE;
DROP TYPE IF EXISTS "RiskLevel" CASCADE;
DROP TYPE IF EXISTS "TaskStatus" CASCADE;
DROP TYPE IF EXISTS "TaskPriority" CASCADE;
DROP TYPE IF EXISTS "TaskCategory" CASCADE;
DROP TYPE IF EXISTS "WorkType" CASCADE;
DROP TYPE IF EXISTS "TimeEntryStatus" CASCADE;
DROP TYPE IF EXISTS "LeaveType" CASCADE;
DROP TYPE IF EXISTS "LeaveStatus" CASCADE;
DROP TYPE IF EXISTS "ExpenseCategory" CASCADE;
DROP TYPE IF EXISTS "ExpenseStatus" CASCADE;
DROP TYPE IF EXISTS "PaymentMethod" CASCADE;
DROP TYPE IF EXISTS "ClientStatus" CASCADE;
DROP TYPE IF EXISTS "ClientType" CASCADE;
DROP TYPE IF EXISTS "SalesStatus" CASCADE;
DROP TYPE IF EXISTS "SalesStage" CASCADE;
DROP TYPE IF EXISTS "StakeholderRole" CASCADE;
DROP TYPE IF EXISTS "StakeholderType" CASCADE;
DROP TYPE IF EXISTS "InvolvementLevel" CASCADE;
DROP TYPE IF EXISTS "ResourceType" CASCADE;
DROP TYPE IF EXISTS "ResourceStatus" CASCADE;
DROP TYPE IF EXISTS "AllocationStatus" CASCADE;
DROP TYPE IF EXISTS "ActivityType" CASCADE;
DROP TYPE IF EXISTS "AuditSeverity" CASCADE;
DROP TYPE IF EXISTS "MilestoneStatus" CASCADE;
DROP TYPE IF EXISTS "RiskImpact" CASCADE;
DROP TYPE IF EXISTS "RiskProbability" CASCADE;
DROP TYPE IF EXISTS "RiskStatus" CASCADE;
DROP TYPE IF EXISTS "Status" CASCADE;
DROP TYPE IF EXISTS "Priority" CASCADE;

-- ============================================================
-- NOW CREATE ALL ENUMS FRESH
-- ============================================================

-- ============================================================
-- USER RELATED ENUMS
-- ============================================================

CREATE TYPE "user_role" AS ENUM (
  'admin',
  'manager',
  'employee'
);

CREATE TYPE "user_status" AS ENUM (
  'active',
  'inactive'
);

-- ============================================================
-- PROJECT RELATED ENUMS
-- ============================================================

CREATE TYPE "ProjectStatus" AS ENUM (
  'planning',
  'active',
  'onHold',
  'completed',
  'cancelled'
);

CREATE TYPE "ProjectPriority" AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

CREATE TYPE "RiskLevel" AS ENUM (
  'low',
  'medium',
  'high',
  'critical'
);

-- ============================================================
-- TASK RELATED ENUMS
-- ============================================================

CREATE TYPE "TaskStatus" AS ENUM (
  'todo',
  'in_progress',
  'in_review',
  'done',
  'cancelled',
  'inactive'
);

CREATE TYPE "TaskPriority" AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

CREATE TYPE "TaskCategory" AS ENUM (
  'development',
  'design',
  'testing',
  'documentation',
  'maintenance',
  'other'
);

-- ============================================================
-- TIMESHEET & TIME ENTRY ENUMS
-- ============================================================

CREATE TYPE "WorkType" AS ENUM (
  'project',
  'office',
  'training',
  'leave',
  'overtime',
  'other'
);

CREATE TYPE "TimeEntryStatus" AS ENUM (
  'pending',
  'approved',
  'rejected'
);

-- ============================================================
-- LEAVE MANAGEMENT ENUMS
-- ============================================================

CREATE TYPE "LeaveType" AS ENUM (
  'annual',
  'sick',
  'personal',
  'maternity',
  'unpaid'
);

CREATE TYPE "LeaveStatus" AS ENUM (
  'pending',
  'approved',
  'rejected',
  'cancelled'
);

-- ============================================================
-- EXPENSE ENUMS
-- ============================================================

CREATE TYPE "ExpenseCategory" AS ENUM (
  'travel',
  'supplies',
  'equipment',
  'training',
  'other'
);

CREATE TYPE "ExpenseStatus" AS ENUM (
  'pending',
  'approved',
  'rejected',
  'reimbursed'
);

CREATE TYPE "PaymentMethod" AS ENUM (
  'cash',
  'credit_card',
  'bank_transfer',
  'check',
  'other'
);

-- ============================================================
-- CLIENT ENUMS
-- ============================================================

CREATE TYPE "ClientStatus" AS ENUM (
  'active',
  'inactive',
  'archived'
);

CREATE TYPE "ClientType" AS ENUM (
  'individual',
  'company',
  'government'
);

-- ============================================================
-- SALES ENUMS
-- ============================================================

CREATE TYPE "SalesStatus" AS ENUM (
  'prospect',
  'qualified',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost'
);

CREATE TYPE "SalesStage" AS ENUM (
  'lead',
  'contact',
  'meeting',
  'demo',
  'proposal',
  'contract',
  'won',
  'lost'
);

-- ============================================================
-- STAKEHOLDER ENUMS
-- ============================================================

CREATE TYPE "StakeholderRole" AS ENUM (
  'executive',
  'manager',
  'team_member',
  'client',
  'vendor',
  'consultant',
  'other'
);

CREATE TYPE "StakeholderType" AS ENUM (
  'internal',
  'external',
  'partner'
);

CREATE TYPE "InvolvementLevel" AS ENUM (
  'high',
  'medium',
  'low',
  'minimal'
);

-- ============================================================
-- RESOURCE ENUMS
-- ============================================================

CREATE TYPE "ResourceType" AS ENUM (
  'human',
  'equipment',
  'material',
  'software',
  'facility',
  'other'
);

CREATE TYPE "ResourceStatus" AS ENUM (
  'available',
  'in_use',
  'maintenance',
  'retired',
  'archived'
);

CREATE TYPE "AllocationStatus" AS ENUM (
  'requested',
  'approved',
  'allocated',
  'deallocated',
  'rejected'
);

-- ============================================================
-- AUDIT & ACTIVITY ENUMS
-- ============================================================

CREATE TYPE "ActivityType" AS ENUM (
  'create',
  'update',
  'delete',
  'comment',
  'assign',
  'status_change'
);

CREATE TYPE "AuditSeverity" AS ENUM (
  'low',
  'medium',
  'high',
  'critical'
);

-- ============================================================
-- MILESTONE ENUMS
-- ============================================================

CREATE TYPE "MilestoneStatus" AS ENUM (
  'pending',
  'in_progress',
  'completed',
  'cancelled'
);

-- ============================================================
-- RISK ENUMS
-- ============================================================

CREATE TYPE "RiskImpact" AS ENUM (
  'low',
  'medium',
  'high',
  'critical'
);

CREATE TYPE "RiskProbability" AS ENUM (
  'low',
  'medium',
  'high',
  'very_high'
);

CREATE TYPE "RiskStatus" AS ENUM (
  'open',
  'mitigated',
  'closed',
  'accepted'
);

-- ============================================================
-- GENERIC STATUS ENUM (for backward compatibility)
-- ============================================================

CREATE TYPE "Status" AS ENUM (
  'todo',
  'in_progress',
  'in_review',
  'done',
  'pending',
  'approved',
  'rejected',
  'active',
  'inactive'
);

CREATE TYPE "Priority" AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

-- ============================================================
-- VERIFICATION
-- ============================================================

SELECT 
  typname,
  typtype,
  COUNT(*) OVER () as total_enums
FROM pg_type 
WHERE typtype = 'e' 
ORDER BY typname;
