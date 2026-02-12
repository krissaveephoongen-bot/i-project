ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_taskId_fkey;
ALTER TABLE public.comments ADD CONSTRAINT comments_taskId_fkey FOREIGN KEY ("taskId") REFERENCES public.tasks(id) ON DELETE RESTRICT;
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_userId_fkey;
ALTER TABLE public.comments ADD CONSTRAINT comments_userId_fkey FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE RESTRICT;

ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS documents_projectId_fkey;
ALTER TABLE public.documents ADD CONSTRAINT documents_projectId_fkey FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON DELETE SET NULL;
ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS documents_taskId_fkey;
ALTER TABLE public.documents ADD CONSTRAINT documents_taskId_fkey FOREIGN KEY ("taskId") REFERENCES public.tasks(id) ON DELETE SET NULL;
ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS documents_uploadedBy_fkey;
ALTER TABLE public.documents ADD CONSTRAINT documents_uploadedBy_fkey FOREIGN KEY ("uploadedBy") REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE public.expenses DROP CONSTRAINT IF EXISTS expenses_projectId_fkey;
ALTER TABLE public.expenses ADD CONSTRAINT expenses_projectId_fkey FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON DELETE RESTRICT;
ALTER TABLE public.expenses DROP CONSTRAINT IF EXISTS expenses_taskId_fkey;
ALTER TABLE public.expenses ADD CONSTRAINT expenses_taskId_fkey FOREIGN KEY ("taskId") REFERENCES public.tasks(id) ON DELETE SET NULL;
ALTER TABLE public.expenses DROP CONSTRAINT IF EXISTS expenses_userId_fkey;
ALTER TABLE public.expenses ADD CONSTRAINT expenses_userId_fkey FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE RESTRICT;
ALTER TABLE public.expenses DROP CONSTRAINT IF EXISTS expenses_approvedBy_fkey;
ALTER TABLE public.expenses ADD CONSTRAINT expenses_approvedBy_fkey FOREIGN KEY ("approvedBy") REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE public.milestones DROP CONSTRAINT IF EXISTS milestones_projectId_fkey;
ALTER TABLE public.milestones ADD CONSTRAINT milestones_projectId_fkey FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON DELETE SET NULL;

ALTER TABLE public.project_members DROP CONSTRAINT IF EXISTS project_members_projectId_fkey;
ALTER TABLE public.project_members ADD CONSTRAINT project_members_projectId_fkey FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON DELETE RESTRICT;
ALTER TABLE public.project_members DROP CONSTRAINT IF EXISTS project_members_userId_fkey;
ALTER TABLE public.project_members ADD CONSTRAINT project_members_userId_fkey FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE RESTRICT;

ALTER TABLE public.project_progress_history DROP CONSTRAINT IF EXISTS project_progress_history_projectId_fkey;
ALTER TABLE public.project_progress_history ADD CONSTRAINT project_progress_history_projectId_fkey FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON DELETE RESTRICT;

ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_managerId_fkey;
ALTER TABLE public.projects ADD CONSTRAINT projects_managerId_fkey FOREIGN KEY ("managerId") REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_clientId_fkey;
ALTER TABLE public.projects ADD CONSTRAINT projects_clientId_fkey FOREIGN KEY ("clientId") REFERENCES public.clients(id) ON DELETE SET NULL;

ALTER TABLE public.risks DROP CONSTRAINT IF EXISTS risks_projectId_fkey;
ALTER TABLE public.risks ADD CONSTRAINT risks_projectId_fkey FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON DELETE SET NULL;
ALTER TABLE public.risks DROP CONSTRAINT IF EXISTS risks_assignedTo_fkey;
ALTER TABLE public.risks ADD CONSTRAINT risks_assignedTo_fkey FOREIGN KEY ("assignedTo") REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_projectId_fkey;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_projectId_fkey FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON DELETE RESTRICT;
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_assignedTo_fkey;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_assignedTo_fkey FOREIGN KEY ("assignedTo") REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_createdBy_fkey;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_createdBy_fkey FOREIGN KEY ("createdBy") REFERENCES public.users(id) ON DELETE RESTRICT;
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_parentTaskId_fkey;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_parentTaskId_fkey FOREIGN KEY ("parentTaskId") REFERENCES public.tasks(id) ON DELETE SET NULL;

ALTER TABLE public.time_entries DROP CONSTRAINT IF EXISTS time_entries_projectId_fkey;
ALTER TABLE public.time_entries ADD CONSTRAINT time_entries_projectId_fkey FOREIGN KEY ("projectId") REFERENCES public.projects(id) ON DELETE RESTRICT;
ALTER TABLE public.time_entries DROP CONSTRAINT IF EXISTS time_entries_taskId_fkey;
ALTER TABLE public.time_entries ADD CONSTRAINT time_entries_taskId_fkey FOREIGN KEY ("taskId") REFERENCES public.tasks(id) ON DELETE RESTRICT;
ALTER TABLE public.time_entries DROP CONSTRAINT IF EXISTS time_entries_userId_fkey;
ALTER TABLE public.time_entries ADD CONSTRAINT time_entries_userId_fkey FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE RESTRICT;
ALTER TABLE public.time_entries DROP CONSTRAINT IF EXISTS time_entries_approvedBy_fkey;
ALTER TABLE public.time_entries ADD CONSTRAINT time_entries_approvedBy_fkey FOREIGN KEY ("approvedBy") REFERENCES public.users(id) ON DELETE SET NULL;
