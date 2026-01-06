-- Add two-tier approval system to timesheets
-- Add approval status tracking for both project manager and supervisor

-- Add new columns to time_entries table
ALTER TABLE "time_entries" 
ADD COLUMN "project_manager_approval_status" "approval_status" DEFAULT 'pending',
ADD COLUMN "project_manager_id" uuid REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE no action,
ADD COLUMN "project_manager_approval_date" timestamp,
ADD COLUMN "supervisor_approval_status" "approval_status" DEFAULT 'pending',
ADD COLUMN "supervisor_id" uuid REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE no action,
ADD COLUMN "supervisor_approval_date" timestamp;

-- Add new columns to users table for role tracking
ALTER TABLE "users" 
ADD COLUMN "is_project_manager" boolean DEFAULT false,
ADD COLUMN "is_supervisor" boolean DEFAULT false;

-- Create approval actions table for audit trail
CREATE TABLE "timesheet_approval_actions" (
  "id" serial PRIMARY KEY,
  "timesheet_id" uuid NOT NULL REFERENCES "time_entries"("id") ON DELETE CASCADE,
  "action_type" "approval_status" NOT NULL,
  "previous_status" "approval_status" NOT NULL,
  "new_status" "approval_status" NOT NULL,
  "changed_by" uuid NOT NULL REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE no action,
  "changed_at" timestamp DEFAULT now() NOT NULL,
  "reason" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes for performance
CREATE INDEX "idx_time_entries_approval_status" ON "time_entries"("project_manager_approval_status");
CREATE INDEX "idx_time_entries_supervisor_approval_status" ON "time_entries"("supervisor_approval_status");
CREATE INDEX "idx_time_entries_user_id" ON "time_entries"("user_id");
CREATE INDEX "idx_time_entries_project_id" ON "time_entries"("project_id");
