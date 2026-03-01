-- ============================================================
-- DATABASE ENUMERATED TYPES SETUP - COMPREHENSIVE
-- ============================================================
-- Created: 2026-02-19
-- Description: Creates all enum types needed for the entire application
-- Note: Run this before creating tables that use these enums

-- ============================================================
-- USER RELATED ENUMS
-- ============================================================

-- User roles for access control
CREATE TYPE "user_role" AS ENUM (
  'admin',
  'manager',
  'employee'
);

-- User account status
CREATE TYPE "user_status" AS ENUM (
  'active',
  'inactive'
);

-- ============================================================
-- PROJECT RELATED ENUMS
-- ============================================================

-- Project status lifecycle
CREATE TYPE "ProjectStatus" AS ENUM (
  'planning',
  'active',
  'onHold',
  'completed',
  'cancelled'
);

-- Project priority levels
CREATE TYPE "ProjectPriority" AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

-- Project risk levels
CREATE TYPE "RiskLevel" AS ENUM (
  'low',
  'medium',
  'high',
  'critical'
);

-- ============================================================
-- TASK RELATED ENUMS
-- ============================================================

-- Task status workflow
CREATE TYPE "TaskStatus" AS ENUM (
  'todo',
  'in_progress',
  'in_review',
  'done',
  'cancelled',
  'inactive'
);

-- Task priority levels
CREATE TYPE "TaskPriority" AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

-- Task categories for classification
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

-- Work type for time entries
CREATE TYPE "WorkType" AS ENUM (
  'project',
  'office',
  'training',
  'leave',
  'overtime',
  'other'
);

-- Time entry approval status
CREATE TYPE "TimeEntryStatus" AS ENUM (
  'pending',
  'approved',
  'rejected'
);

-- ============================================================
-- LEAVE MANAGEMENT ENUMS
-- ============================================================

-- Leave types available for employees
CREATE TYPE "LeaveType" AS ENUM (
  'annual',
  'sick',
  'personal',
  'maternity',
  'unpaid'
);

-- Leave request status
CREATE TYPE "LeaveStatus" AS ENUM (
  'pending',
  'approved',
  'rejected',
  'cancelled'
);

-- ============================================================
-- EXPENSE ENUMS
-- ============================================================

-- Expense categories
CREATE TYPE "ExpenseCategory" AS ENUM (
  'travel',
  'supplies',
  'equipment',
  'training',
  'other'
);

-- Expense approval status
CREATE TYPE "ExpenseStatus" AS ENUM (
  'pending',
  'approved',
  'rejected',
  'reimbursed'
);

-- Payment methods for expenses
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

-- Client status
CREATE TYPE "ClientStatus" AS ENUM (
  'active',
  'inactive',
  'archived'
);

-- Client types
CREATE TYPE "ClientType" AS ENUM (
  'individual',
  'company',
  'government'
);

-- ============================================================
-- SALES ENUMS
-- ============================================================

-- Sales deal status
CREATE TYPE "SalesStatus" AS ENUM (
  'prospect',
  'qualified',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost'
);

-- Sales pipeline stages
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

-- Stakeholder roles
CREATE TYPE "StakeholderRole" AS ENUM (
  'executive',
  'manager',
  'team_member',
  'client',
  'vendor',
  'consultant',
  'other'
);

-- Stakeholder types
CREATE TYPE "StakeholderType" AS ENUM (
  'internal',
  'external',
  'partner'
);

-- Stakeholder involvement levels
CREATE TYPE "InvolvementLevel" AS ENUM (
  'high',
  'medium',
  'low',
  'minimal'
);

-- ============================================================
-- RESOURCE ENUMS
-- ============================================================

-- Resource types
CREATE TYPE "ResourceType" AS ENUM (
  'human',
  'equipment',
  'material',
  'software',
  'facility',
  'other'
);

-- Resource status
CREATE TYPE "ResourceStatus" AS ENUM (
  'available',
  'in_use',
  'maintenance',
  'retired',
  'archived'
);

-- Resource allocation status
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

-- Activity log types
CREATE TYPE "ActivityType" AS ENUM (
  'create',
  'update',
  'delete',
  'comment',
  'assign',
  'status_change'
);

-- Audit severity levels
CREATE TYPE "AuditSeverity" AS ENUM (
  'low',
  'medium',
  'high',
  'critical'
);

-- ============================================================
-- MILESTONE ENUMS
-- ============================================================

-- Milestone status
CREATE TYPE "MilestoneStatus" AS ENUM (
  'pending',
  'in_progress',
  'completed',
  'cancelled'
);

-- ============================================================
-- RISK ENUMS
-- ============================================================

-- Risk impact levels
CREATE TYPE "RiskImpact" AS ENUM (
  'low',
  'medium',
  'high',
  'critical'
);

-- Risk probability levels
CREATE TYPE "RiskProbability" AS ENUM (
  'low',
  'medium',
  'high',
  'very_high'
);

-- Risk status
CREATE TYPE "RiskStatus" AS ENUM (
  'open',
  'mitigated',
  'closed',
  'accepted'
);

-- ============================================================
-- GENERIC STATUS ENUM (for backward compatibility)
-- ============================================================

-- Generic status enum used across multiple entities
-- This is a superset of statuses for backward compatibility
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

-- Priority levels (for backward compatibility)
CREATE TYPE "Priority" AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================
-- Run these to verify all enums were created successfully:

-- SELECT typname FROM pg_type WHERE typtype = 'e' ORDER BY typname;
-- \dT -- PostgreSQL specific command to list all types

-- ============================================================
-- NOTES
-- ============================================================
-- 1. This script creates all enum types for the project
-- 2. Order matters - no dependencies between these enums
-- 3. These enums are used across multiple features:
--    - Users: user_role, user_status
--    - Projects: ProjectStatus, ProjectPriority, RiskLevel
--    - Tasks: TaskStatus, TaskPriority, TaskCategory
--    - Timesheet: WorkType, TimeEntryStatus
--    - Leave: LeaveType, LeaveStatus
--    - Expenses: ExpenseCategory, ExpenseStatus, PaymentMethod
--    - Clients: ClientStatus, ClientType
--    - Sales: SalesStatus, SalesStage
--    - Stakeholders: StakeholderRole, StakeholderType, InvolvementLevel
--    - Resources: ResourceType, ResourceStatus, AllocationStatus
--    - Audit: ActivityType, AuditSeverity
--    - Milestones: MilestoneStatus
--    - Risks: RiskImpact, RiskProbability, RiskStatus
--    - Generic: Status, Priority (for backward compatibility)
-- 4. Total: 37 enum types covering all application features
