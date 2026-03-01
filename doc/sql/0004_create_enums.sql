-- ============================================================
-- Database Enumerated Types Migration
-- ============================================================
-- This migration creates all PostgreSQL enum types used in the application.
-- Run this migration before creating tables that use these enums.
-- ============================================================

-- ============================================================
-- USER RELATED ENUMS
-- ============================================================

-- User roles for access control
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'manager', 'employee');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- User account status
DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('active', 'inactive');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- PROJECT RELATED ENUMS
-- ============================================================

-- Project status lifecycle
DO $$ BEGIN
    CREATE TYPE project_status AS ENUM ('planning', 'active', 'on_hold', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Project priority levels
DO $$ BEGIN
    CREATE TYPE project_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Project risk levels
DO $$ BEGIN
    CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- TASK RELATED ENUMS
-- ============================================================

-- Task status workflow
DO $$ BEGIN
    CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'in_review', 'done', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Task priority levels
DO $$ BEGIN
    CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Task categories for classification
DO $$ BEGIN
    CREATE TYPE task_category AS ENUM ('development', 'design', 'testing', 'documentation', 'maintenance', 'other');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- TIMESHEET & TIME ENTRY ENUMS
-- ============================================================

-- Work type for time entries
DO $$ BEGIN
    CREATE TYPE work_type AS ENUM ('project', 'office', 'training', 'leave', 'overtime', 'other');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Time entry approval status
DO $$ BEGIN
    CREATE TYPE time_entry_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- LEAVE MANAGEMENT ENUMS
-- ============================================================

-- Leave types available for employees
DO $$ BEGIN
    CREATE TYPE leave_type AS ENUM ('annual', 'sick', 'personal', 'maternity', 'unpaid');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Leave request status
DO $$ BEGIN
    CREATE TYPE leave_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- EXPENSE ENUMS
-- ============================================================

-- Expense categories
DO $$ BEGIN
    CREATE TYPE expense_category AS ENUM ('travel', 'supplies', 'equipment', 'training', 'other');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Expense approval status
DO $$ BEGIN
    CREATE TYPE expense_status AS ENUM ('pending', 'approved', 'rejected', 'reimbursed');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Payment methods for expenses
DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('cash', 'credit_card', 'bank_transfer', 'check', 'other');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- CLIENT ENUMS
-- ============================================================

-- Client status
DO $$ BEGIN
    CREATE TYPE client_status AS ENUM ('active', 'inactive', 'archived');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Client types
DO $$ BEGIN
    CREATE TYPE client_type AS ENUM ('individual', 'company', 'government');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- SALES ENUMS
-- ============================================================

-- Sales deal status
DO $$ BEGIN
    CREATE TYPE sales_status AS ENUM ('prospect', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Sales pipeline stages
DO $$ BEGIN
    CREATE TYPE sales_stage AS ENUM ('lead', 'contact', 'meeting', 'demo', 'proposal', 'contract', 'won', 'lost');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- STAKEHOLDER ENUMS
-- ============================================================

-- Stakeholder roles
DO $$ BEGIN
    CREATE TYPE stakeholder_role AS ENUM ('executive', 'manager', 'team_member', 'client', 'vendor', 'consultant', 'other');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Stakeholder types
DO $$ BEGIN
    CREATE TYPE stakeholder_type AS ENUM ('internal', 'external', 'partner');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Stakeholder involvement levels
DO $$ BEGIN
    CREATE TYPE involvement_level AS ENUM ('high', 'medium', 'low', 'minimal');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- RESOURCE ENUMS
-- ============================================================

-- Resource types
DO $$ BEGIN
    CREATE TYPE resource_type AS ENUM ('human', 'equipment', 'material', 'software', 'facility', 'other');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Resource status
DO $$ BEGIN
    CREATE TYPE resource_status AS ENUM ('available', 'in_use', 'maintenance', 'retired', 'archived');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Resource allocation status
DO $$ BEGIN
    CREATE TYPE allocation_status AS ENUM ('requested', 'approved', 'allocated', 'deallocated', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- AUDIT & ACTIVITY ENUMS
-- ============================================================

-- Activity log types
DO $$ BEGIN
    CREATE TYPE activity_type AS ENUM ('create', 'update', 'delete', 'comment', 'assign', 'status_change');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Audit event types
DO $$ BEGIN
    CREATE TYPE audit_event_type AS ENUM (
        'login', 'logout', 'login_failed', 'password_reset', 'password_change',
        'user_create', 'user_update', 'user_delete', 'user_role_change',
        'project_create', 'project_update', 'project_delete', 'project_status_change',
        'task_create', 'task_update', 'task_delete', 'task_assign',
        'data_export', 'data_import', 'data_bulk_delete',
        'system_config_change', 'system_backup', 'system_restore'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Audit severity levels
DO $$ BEGIN
    CREATE TYPE audit_severity AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- MILESTONE ENUMS
-- ============================================================

-- Milestone status
DO $$ BEGIN
    CREATE TYPE milestone_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- RISK ENUMS
-- ============================================================

-- Risk impact levels
DO $$ BEGIN
    CREATE TYPE risk_impact AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Risk probability levels
DO $$ BEGIN
    CREATE TYPE risk_probability AS ENUM ('low', 'medium', 'high', 'very_high');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Risk status
DO $$ BEGIN
    CREATE TYPE risk_status AS ENUM ('open', 'mitigated', 'closed', 'accepted');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- GENERIC STATUS ENUM (for backward compatibility)
-- ============================================================

-- Generic status enum used across multiple entities
-- This is a superset of statuses for backward compatibility
DO $$ BEGIN
    CREATE TYPE status AS ENUM ('todo', 'in_progress', 'in_review', 'done', 'pending', 'approved', 'rejected', 'active', 'inactive');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- ADD MISSING VALUES TO EXISTING ENUMS (if needed)
-- ============================================================

-- Add 'urgent' to priority enum if it exists and doesn't have it
DO $$ BEGIN
    -- Check if priority enum exists and doesn't have 'urgent'
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'priority') THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumlabel = 'urgent' 
            AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'priority')
        ) THEN
            ALTER TYPE priority ADD VALUE 'urgent';
        END IF;
    END IF;
END $$;

-- Add 'training', 'leave', 'overtime' to work_type enum if needed
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'work_type') THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumlabel = 'training' 
            AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'work_type')
        ) THEN
            ALTER TYPE work_type ADD VALUE 'training';
        END IF;
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumlabel = 'leave' 
            AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'work_type')
        ) THEN
            ALTER TYPE work_type ADD VALUE 'leave';
        END IF;
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumlabel = 'overtime' 
            AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'work_type')
        ) THEN
            ALTER TYPE work_type ADD VALUE 'overtime';
        END IF;
    END IF;
END $$;

-- ============================================================
-- VERIFICATION QUERIES (can be run separately to verify)
-- ============================================================

-- Run this query to list all enum types:
-- SELECT t.typname as enum_name, 
--        array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
-- FROM pg_type t 
-- JOIN pg_enum e ON t.oid = e.enumtypid  
-- JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
-- WHERE n.nspname = 'public'
-- GROUP BY t.typname
-- ORDER BY t.typname;
