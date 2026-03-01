-- Triggers to enforce RESTRICT semantics at DB-level even if FK actions are CASCADE/SET NULL

CREATE OR REPLACE FUNCTION public.check_project_delete() RETURNS trigger AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.tasks WHERE "projectId" = OLD.id) THEN
    RAISE EXCEPTION 'RESTRICT: Project % has dependent tasks', OLD.id;
  END IF;
  IF EXISTS (SELECT 1 FROM public.time_entries WHERE "projectId" = OLD.id) THEN
    RAISE EXCEPTION 'RESTRICT: Project % has dependent time entries', OLD.id;
  END IF;
  IF EXISTS (SELECT 1 FROM public.expenses WHERE "projectId" = OLD.id) THEN
    RAISE EXCEPTION 'RESTRICT: Project % has dependent expenses', OLD.id;
  END IF;
  IF EXISTS (SELECT 1 FROM public.documents WHERE "projectId" = OLD.id) THEN
    RAISE EXCEPTION 'RESTRICT: Project % has dependent documents', OLD.id;
  END IF;
  IF EXISTS (SELECT 1 FROM public.project_members WHERE "projectId" = OLD.id) THEN
    RAISE EXCEPTION 'RESTRICT: Project % has dependent members', OLD.id;
  END IF;
  IF EXISTS (SELECT 1 FROM public.risks WHERE "projectId" = OLD.id) THEN
    RAISE EXCEPTION 'RESTRICT: Project % has dependent risks', OLD.id;
  END IF;
  IF EXISTS (SELECT 1 FROM public.milestones WHERE "projectId" = OLD.id) THEN
    RAISE EXCEPTION 'RESTRICT: Project % has dependent milestones', OLD.id;
  END IF;
  RETURN OLD;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_project_restrict_delete ON public.projects;
CREATE TRIGGER trg_project_restrict_delete
BEFORE DELETE ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.check_project_delete();

CREATE OR REPLACE FUNCTION public.check_task_delete() RETURNS trigger AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.time_entries WHERE "taskId" = OLD.id) THEN
    RAISE EXCEPTION 'RESTRICT: Task % has dependent time entries', OLD.id;
  END IF;
  IF EXISTS (SELECT 1 FROM public.expenses WHERE "taskId" = OLD.id) THEN
    RAISE EXCEPTION 'RESTRICT: Task % has dependent expenses', OLD.id;
  END IF;
  IF EXISTS (SELECT 1 FROM public.comments WHERE "taskId" = OLD.id) THEN
    RAISE EXCEPTION 'RESTRICT: Task % has dependent comments', OLD.id;
  END IF;
  IF EXISTS (SELECT 1 FROM public.documents WHERE "taskId" = OLD.id) THEN
    RAISE EXCEPTION 'RESTRICT: Task % has dependent documents', OLD.id;
  END IF;
  RETURN OLD;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_task_restrict_delete ON public.tasks;
CREATE TRIGGER trg_task_restrict_delete
BEFORE DELETE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.check_task_delete();

CREATE OR REPLACE FUNCTION public.check_user_delete() RETURNS trigger AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.time_entries WHERE "userId" = OLD.id) THEN
    RAISE EXCEPTION 'RESTRICT: User % has dependent time entries', OLD.id;
  END IF;
  IF EXISTS (SELECT 1 FROM public.expenses WHERE "userId" = OLD.id) THEN
    RAISE EXCEPTION 'RESTRICT: User % has dependent expenses', OLD.id;
  END IF;
  IF EXISTS (SELECT 1 FROM public.tasks WHERE "assignedTo" = OLD.id OR "createdBy" = OLD.id) THEN
    RAISE EXCEPTION 'RESTRICT: User % has dependent tasks', OLD.id;
  END IF;
  IF EXISTS (SELECT 1 FROM public.project_members WHERE "userId" = OLD.id) THEN
    RAISE EXCEPTION 'RESTRICT: User % has dependent project memberships', OLD.id;
  END IF;
  IF EXISTS (SELECT 1 FROM public.risks WHERE "assignedTo" = OLD.id) THEN
    RAISE EXCEPTION 'RESTRICT: User % has dependent risks', OLD.id;
  END IF;
  RETURN OLD;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_restrict_delete ON public.users;
CREATE TRIGGER trg_user_restrict_delete
BEFORE DELETE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.check_user_delete();
