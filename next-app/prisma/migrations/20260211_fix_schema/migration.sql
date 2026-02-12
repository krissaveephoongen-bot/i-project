-- Fix 1: Remove duplicate foreign key constraints
-- Documents table - remove duplicate constraints
ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS documents_projectid_fkey;
ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS documents_taskid_fkey;
ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS documents_uploadedby_fkey;

-- Rename remaining constraints to consistent naming
ALTER TABLE public.documents RENAME CONSTRAINT documents_projectId_fkey TO documents_project_id_fkey;
ALTER TABLE public.documents RENAME CONSTRAINT documents_uploadedBy_fkey TO documents_uploaded_by_fkey;
ALTER TABLE public.documents RENAME CONSTRAINT documents_taskId_fkey TO documents_task_id_fkey;

-- Comments table
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_taskid_fkey;
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_userid_fkey;
ALTER TABLE public.comments RENAME CONSTRAINT comments_taskId_fkey TO comments_task_id_fkey;
ALTER TABLE public.comments RENAME CONSTRAINT comments_userId_fkey TO comments_user_id_fkey;

-- Expenses table
ALTER TABLE public.expenses DROP CONSTRAINT IF EXISTS expenses_projectid_fkey;
ALTER TABLE public.expenses DROP CONSTRAINT IF EXISTS expenses_taskid_fkey;
ALTER TABLE public.expenses DROP CONSTRAINT IF EXISTS expenses_userid_fkey;
ALTER TABLE public.expenses DROP CONSTRAINT IF EXISTS expenses_approvedby_fkey;
ALTER TABLE public.expenses RENAME CONSTRAINT expenses_projectId_fkey TO expenses_project_id_fkey;
ALTER TABLE public.expenses RENAME CONSTRAINT expenses_taskId_fkey TO expenses_task_id_fkey;
ALTER TABLE public.expenses RENAME CONSTRAINT expenses_userId_fkey TO expenses_user_id_fkey;
ALTER TABLE public.expenses RENAME CONSTRAINT expenses_approvedBy_fkey TO expenses_approved_by_fkey;

-- Tasks table
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_projectid_fkey;
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_assignedto_fkey;
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_createdby_fkey;
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_parenttaskid_fkey;
-- Handle the special case with _restrict versions
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_projectid_fkey_restrict;
ALTER TABLE public.tasks RENAME CONSTRAINT tasks_projectId_fkey TO tasks_project_id_fkey;
ALTER TABLE public.tasks RENAME CONSTRAINT tasks_assignedTo_fkey TO tasks_assigned_to_fkey;
ALTER TABLE public.tasks RENAME CONSTRAINT tasks_createdBy_fkey TO tasks_created_by_fkey;
ALTER TABLE public.tasks RENAME CONSTRAINT tasks_parentTaskId_fkey TO tasks_parent_task_id_fkey;

-- Time entries table
ALTER TABLE public.time_entries DROP CONSTRAINT IF EXISTS time_entries_projectid_fkey;
ALTER TABLE public.time_entries DROP CONSTRAINT IF EXISTS time_entries_taskid_fkey;
ALTER TABLE public.time_entries DROP CONSTRAINT IF EXISTS time_entries_userid_fkey;
ALTER TABLE public.time_entries DROP CONSTRAINT IF EXISTS time_entries_approvedby_fkey;
ALTER TABLE public.time_entries DROP CONSTRAINT IF EXISTS time_entries_projectid_fkey_restrict;
ALTER TABLE public.time_entries DROP CONSTRAINT IF EXISTS time_entries_userid_fkey_restrict;
ALTER TABLE public.time_entries DROP CONSTRAINT IF EXISTS time_entries_taskid_fkey_restrict;
ALTER TABLE public.time_entries RENAME CONSTRAINT time_entries_projectId_fkey TO time_entries_project_id_fkey;
ALTER TABLE public.time_entries RENAME CONSTRAINT time_entries_taskId_fkey TO time_entries_task_id_fkey;
ALTER TABLE public.time_entries RENAME CONSTRAINT time_entries_userId_fkey TO time_entries_user_id_fkey;
ALTER TABLE public.time_entries RENAME CONSTRAINT time_entries_approvedBy_fkey TO time_entries_approved_by_fkey;

-- Risks table
ALTER TABLE public.risks DROP CONSTRAINT IF EXISTS risks_projectid_fkey;
ALTER TABLE public.risks DROP CONSTRAINT IF EXISTS risks_assignedto_fkey;
ALTER TABLE public.risks RENAME CONSTRAINT risks_projectId_fkey TO risks_project_id_fkey;
ALTER TABLE public.risks RENAME CONSTRAINT risks_assignedTo_fkey TO risks_assigned_to_fkey;

-- Milestones table
ALTER TABLE public.milestones DROP CONSTRAINT IF EXISTS milestones_projectid_fkey;
ALTER TABLE public.milestones RENAME CONSTRAINT milestones_projectId_fkey TO milestones_project_id_fkey;

-- Project members
ALTER TABLE public.project_members DROP CONSTRAINT IF EXISTS project_members_projectid_fkey;
ALTER TABLE public.project_members DROP CONSTRAINT IF EXISTS project_members_userid_fkey;
ALTER TABLE public.project_members RENAME CONSTRAINT project_members_projectId_fkey TO project_members_project_id_fkey;
ALTER TABLE public.project_members RENAME CONSTRAINT project_members_userId_fkey TO project_members_user_id_fkey;

-- Projects table
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_managerid_fkey;
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_clientid_fkey;
ALTER TABLE public.projects RENAME CONSTRAINT projects_managerId_fkey TO projects_manager_id_fkey;
ALTER TABLE public.projects RENAME CONSTRAINT projects_clientId_fkey TO projects_client_id_fkey;

-- Budget revisions
ALTER TABLE public.budget_revisions RENAME CONSTRAINT budget_revisions_projectId_fkey TO budget_revisions_project_id_fkey;
ALTER TABLE public.budget_revisions RENAME CONSTRAINT budget_revisions_changedBy_fkey TO budget_revisions_changed_by_fkey;

-- Activity log
ALTER TABLE public.activity_log RENAME CONSTRAINT activity_log_userId_fkey TO activity_log_user_id_fkey;

-- Fix 2: Standardize column naming in sales tables
-- Add new snake_case columns and migrate data
ALTER TABLE public.sales_pipelines ADD COLUMN IF NOT EXISTS created_at timestamp with time zone;
ALTER TABLE public.sales_pipelines ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone;
UPDATE public.sales_pipelines SET created_at = "createdAt", updated_at = "updatedAt" WHERE "createdAt" IS NOT NULL;
ALTER TABLE public.sales_pipelines ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE public.sales_pipelines ALTER COLUMN updated_at SET DEFAULT now();

ALTER TABLE public.sales_stages ADD COLUMN IF NOT EXISTS created_at timestamp with time zone;
ALTER TABLE public.sales_stages ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone;
UPDATE public.sales_stages SET created_at = "createdAt", updated_at = "updatedAt" WHERE "createdAt" IS NOT NULL;
ALTER TABLE public.sales_stages ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE public.sales_stages ALTER COLUMN updated_at SET DEFAULT now();

ALTER TABLE public.sales_deals ADD COLUMN IF NOT EXISTS created_at timestamp with time zone;
ALTER TABLE public.sales_deals ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone;
UPDATE public.sales_deals SET created_at = "createdAt", updated_at = "updatedAt" WHERE "createdAt" IS NOT NULL;
ALTER TABLE public.sales_deals ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE public.sales_deals ALTER COLUMN updated_at SET DEFAULT now();

-- Fix 3: Remove redundant columns in users table
-- Keep isActive and status, but ensure consistency
ALTER TABLE public.users DROP COLUMN IF EXISTS is_active;
ALTER TABLE public.users DROP COLUMN IF EXISTS is_deleted;
-- Now rename camelCase to snake_case for consistency with schema
ALTER TABLE public.users RENAME COLUMN isActive TO is_active;
ALTER TABLE public.users RENAME COLUMN isDeleted TO is_deleted;

-- Fix 4: Remove duplicate columns in milestones
ALTER TABLE public.milestones DROP COLUMN IF EXISTS name;
-- percentage is the source of truth

-- Fix 5: Create proper authentication token table
CREATE TABLE IF NOT EXISTS public.auth_tokens (
  id text NOT NULL PRIMARY KEY,
  user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  token_type text NOT NULL DEFAULT 'access' CHECK (token_type IN ('access', 'refresh')),
  expires_at timestamp with time zone NOT NULL,
  revoked_at timestamp with time zone,
  revoked_reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT auth_tokens_user_id_token_type_key UNIQUE(user_id, token_type)
);

CREATE INDEX IF NOT EXISTS auth_tokens_user_id_idx ON public.auth_tokens(user_id);
CREATE INDEX IF NOT EXISTS auth_tokens_token_idx ON public.auth_tokens(token);
CREATE INDEX IF NOT EXISTS auth_tokens_expires_at_idx ON public.auth_tokens(expires_at);

-- Fix 6: Create sessions table for tracking active sessions
CREATE TABLE IF NOT EXISTS public.sessions (
  id text NOT NULL PRIMARY KEY,
  user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  ip_address inet,
  user_agent text,
  last_activity timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT sessions_user_id_id_key UNIQUE(user_id, id)
);

CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON public.sessions(expires_at);

-- Fix 7: Add audit trail enhancement
ALTER TABLE public.activity_log ADD COLUMN IF NOT EXISTS ip_address inet;
ALTER TABLE public.activity_log ADD COLUMN IF NOT EXISTS user_agent text;

-- Fix 8: Update projects table - remove unused progressPlan
-- Note: Keep the column for now, just documenting it's unused
COMMENT ON COLUMN public.projects.progress_plan IS 'DEPRECATED: Use progress for actual project progress tracking';
