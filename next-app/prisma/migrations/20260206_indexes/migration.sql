 DO $$
 BEGIN
   IF to_regclass('public.contacts') IS NOT NULL THEN
     IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='idx_contacts_project') THEN
       CREATE INDEX idx_contacts_project ON contacts(project_id);
     END IF;
     IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='idx_contacts_type') THEN
       CREATE INDEX idx_contacts_type ON contacts(type);
     END IF;
   END IF;
 
   IF to_regclass('public.projects') IS NOT NULL THEN
     IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='idx_projects_manager')
        AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='manager_id') THEN
       CREATE INDEX idx_projects_manager ON projects(manager_id);
     END IF;
     IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='idx_projects_client')
        AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='client_id') THEN
       CREATE INDEX idx_projects_client ON projects(client_id);
     END IF;
   END IF;
 
   IF to_regclass('public.sales_deals') IS NOT NULL THEN
     IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='idx_sales_deals_client')
        AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sales_deals' AND column_name='client_id') THEN
       CREATE INDEX idx_sales_deals_client ON sales_deals(client_id);
     END IF;
     IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='idx_sales_deals_stage')
        AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sales_deals' AND column_name='stage_id') THEN
       CREATE INDEX idx_sales_deals_stage ON sales_deals(stage_id);
     END IF;
     IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='idx_sales_deals_pipeline')
        AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sales_deals' AND column_name='pipeline_id') THEN
       CREATE INDEX idx_sales_deals_pipeline ON sales_deals(pipeline_id);
     END IF;
   END IF;
 
   IF to_regclass('public.milestones') IS NOT NULL THEN
     IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='idx_milestones_project')
        AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='milestones' AND column_name='project_id') THEN
       CREATE INDEX idx_milestones_project ON milestones(project_id);
     END IF;
   END IF;
 
   IF to_regclass('public.timesheets') IS NOT NULL THEN
     IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='idx_timesheets_user')
        AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='timesheets' AND column_name='user_id') THEN
       CREATE INDEX idx_timesheets_user ON timesheets(user_id);
     END IF;
     IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='idx_timesheets_project')
        AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='timesheets' AND column_name='project_id') THEN
       CREATE INDEX idx_timesheets_project ON timesheets(project_id);
     END IF;
   END IF;
 
   IF to_regclass('public.tasks') IS NOT NULL THEN
     IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='idx_tasks_project')
        AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='project_id') THEN
       CREATE INDEX idx_tasks_project ON tasks(project_id);
     END IF;
     IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='idx_tasks_assigned')
        AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='assigned_to') THEN
       CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
     END IF;
   END IF;
 END $$;
