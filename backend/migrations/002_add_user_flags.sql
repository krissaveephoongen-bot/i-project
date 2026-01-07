-- Migration: Add user flags (is_project_manager, is_supervisor, notification_preferences)
-- Generated at: 2026-01-07

-- Add missing columns to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_project_manager" boolean DEFAULT false NOT NULL;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_supervisor" boolean DEFAULT false NOT NULL;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "notification_preferences" jsonb;

-- Add timezone column if not exists
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "timezone" text DEFAULT 'Asia/Bangkok';

-- Add missing approval columns to time_entries table
ALTER TABLE "time_entries" ADD COLUMN IF NOT EXISTS "project_manager_approval_status" "approval_status" DEFAULT 'pending';
ALTER TABLE "time_entries" ADD COLUMN IF NOT EXISTS "project_manager_id" uuid;
ALTER TABLE "time_entries" ADD COLUMN IF NOT EXISTS "project_manager_approval_date" timestamp;
ALTER TABLE "time_entries" ADD COLUMN IF NOT EXISTS "supervisor_approval_status" "approval_status" DEFAULT 'pending';
ALTER TABLE "time_entries" ADD COLUMN IF NOT EXISTS "supervisor_id" uuid;
ALTER TABLE "time_entries" ADD COLUMN IF NOT EXISTS "supervisor_approval_date" timestamp;

-- Create approval action type enum if not exists
DO $$ BEGIN
    CREATE TYPE "approval_action_type" AS ENUM('project_manager_approval', 'supervisor_approval');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create approval status enum if not exists
DO $$ BEGIN
    CREATE TYPE "approval_status" AS ENUM('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create timesheet_approval_actions table if not exists
CREATE TABLE IF NOT EXISTS "timesheet_approval_actions" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "timesheet_id" uuid NOT NULL,
    "action_type" "approval_action_type" NOT NULL,
    "previous_status" "approval_status" NOT NULL,
    "new_status" "approval_status" NOT NULL,
    "changed_by" uuid,
    "reason" text,
    "created_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraint for timesheet_approval_actions
DO $$ BEGIN
    ALTER TABLE "timesheet_approval_actions" ADD CONSTRAINT "timesheet_approval_actions_timesheet_id_time_entries_id_fk"
        FOREIGN KEY ("timesheet_id") REFERENCES "public"."time_entries"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "timesheet_approval_actions" ADD CONSTRAINT "timesheet_approval_actions_changed_by_users_id_fk"
        FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
