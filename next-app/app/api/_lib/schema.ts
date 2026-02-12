 import { poolDirect } from './db';
 
export async function runSchemaSync() {
  const queries: Array<string | undefined> = [
     `DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
          CREATE TYPE user_role AS ENUM ('admin','manager','employee');
        END IF;
      END $$;`,
     `CREATE TABLE IF NOT EXISTS users (
        id text PRIMARY KEY,
        object_id text,
        name text NOT NULL,
        email text NOT NULL,
        password text,
        role user_role NOT NULL DEFAULT 'employee',
        avatar text,
        department text,
        position text,
        employee_code text,
        hourly_rate numeric NOT NULL DEFAULT 0.00,
        phone text,
        status text NOT NULL DEFAULT 'active',
        is_active boolean NOT NULL DEFAULT true,
        is_deleted boolean NOT NULL DEFAULT false,
        failed_login_attempts integer NOT NULL DEFAULT 0,
        last_login timestamp without time zone,
        locked_until timestamp without time zone,
        reset_token text,
        reset_token_expiry timestamp without time zone,
        is_project_manager boolean NOT NULL DEFAULT false,
        is_supervisor boolean NOT NULL DEFAULT false,
        notification_preferences jsonb,
        timezone text NOT NULL DEFAULT 'Asia/Bangkok',
        created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp without time zone NOT NULL
      );`,
     `CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);`,
     `CREATE TABLE IF NOT EXISTS clients (
        id text PRIMARY KEY,
        name text NOT NULL,
        email text,
        phone text,
        address text,
        taxId text,
        notes text,
        createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt timestamp without time zone NOT NULL
      );`,
     `CREATE TABLE IF NOT EXISTS projects (
        id text PRIMARY KEY,
        name text NOT NULL,
        code text,
        description text,
        status text NOT NULL DEFAULT 'todo',
        progress integer NOT NULL DEFAULT 0,
        progressPlan integer NOT NULL DEFAULT 0,
        spi numeric NOT NULL DEFAULT 1.00,
        riskLevel text NOT NULL DEFAULT 'low',
        startDate timestamp without time zone,
        endDate timestamp without time zone,
        budget numeric,
        spent numeric NOT NULL DEFAULT 0.00,
        remaining numeric NOT NULL DEFAULT 0.00,
        managerId text,
        clientId text,
        hourlyRate numeric NOT NULL DEFAULT 0.00,
        priority text NOT NULL DEFAULT 'medium',
        category text,
        isArchived boolean NOT NULL DEFAULT false,
        createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt timestamp without time zone NOT NULL
      );`,
     `DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='manager_id') THEN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'projects_manager_id_fkey') THEN
            ALTER TABLE projects ADD CONSTRAINT projects_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES users(id);
          END IF;
        ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='managerid') THEN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'projects_managerid_fkey') THEN
            ALTER TABLE projects ADD CONSTRAINT projects_managerid_fkey FOREIGN KEY (managerid) REFERENCES users(id);
          END IF;
        ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='managerId') THEN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'projects_managerId_fkey') THEN
            ALTER TABLE projects ADD CONSTRAINT projects_managerId_fkey FOREIGN KEY ("managerId") REFERENCES users(id);
          END IF;
        END IF;
      END $$;`,
     `DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='client_id') THEN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'projects_client_id_fkey') THEN
            ALTER TABLE projects ADD CONSTRAINT projects_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id);
          END IF;
        ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='clientid') THEN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'projects_clientid_fkey') THEN
            ALTER TABLE projects ADD CONSTRAINT projects_clientid_fkey FOREIGN KEY (clientid) REFERENCES clients(id);
          END IF;
        ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='clientId') THEN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'projects_clientId_fkey') THEN
            ALTER TABLE projects ADD CONSTRAINT projects_clientId_fkey FOREIGN KEY ("clientId") REFERENCES clients(id);
          END IF;
        END IF;
      END $$;`,
     `CREATE TABLE IF NOT EXISTS tasks (
        id text PRIMARY KEY,
        title text NOT NULL,
        description text,
        status text NOT NULL DEFAULT 'todo',
        priority text NOT NULL DEFAULT 'medium',
        dueDate timestamp without time zone,
        estimatedHours numeric,
        actualHours numeric NOT NULL DEFAULT 0.00,
        weight numeric NOT NULL DEFAULT 1.00,
        completedAt timestamp without time zone,
        projectId text NOT NULL,
        assignedTo text,
        createdBy text NOT NULL,
        parentTaskId text,
        category text,
        storyPoints integer,
        sprintId text,
        blockedBy text,
        blockedReason text,
        createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt timestamp without time zone NOT NULL
      );`,
     `DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='project_id') THEN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tasks_project_id_fkey') THEN
            ALTER TABLE tasks ADD CONSTRAINT tasks_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id);
          END IF;
        ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='projectid') THEN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tasks_projectid_fkey') THEN
            ALTER TABLE tasks ADD CONSTRAINT tasks_projectid_fkey FOREIGN KEY (projectid) REFERENCES projects(id);
          END IF;
        ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='projectId') THEN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tasks_projectId_fkey') THEN
            ALTER TABLE tasks ADD CONSTRAINT tasks_projectId_fkey FOREIGN KEY ("projectId") REFERENCES projects(id);
          END IF;
        END IF;
      END $$;`,
     `CREATE TABLE IF NOT EXISTS risks (
        id text PRIMARY KEY,
        title text NOT NULL,
        description text,
        impact text NOT NULL,
        probability text NOT NULL,
        riskScore integer,
        mitigationPlan text,
        status text NOT NULL DEFAULT 'open',
        projectId text,
        assignedTo text,
        createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt timestamp without time zone NOT NULL
      );`,
     `DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='risks' AND column_name='project_id') THEN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'risks_project_id_fkey') THEN
            ALTER TABLE risks ADD CONSTRAINT risks_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id);
          END IF;
        ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='risks' AND column_name='projectid') THEN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'risks_projectid_fkey') THEN
            ALTER TABLE risks ADD CONSTRAINT risks_projectid_fkey FOREIGN KEY (projectid) REFERENCES projects(id);
          END IF;
        ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='risks' AND column_name='projectId') THEN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'risks_projectId_fkey') THEN
            ALTER TABLE risks ADD CONSTRAINT risks_projectId_fkey FOREIGN KEY ("projectId") REFERENCES projects(id);
          END IF;
        END IF;
      END $$;`,
     `CREATE TABLE IF NOT EXISTS documents (
        id text PRIMARY KEY,
        name text NOT NULL,
        type text,
        size text,
        url text,
        projectId text,
        taskId text,
        uploadedBy text,
        milestone text,
        createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt timestamp without time zone NOT NULL
      );`,
     `DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='project_id') THEN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'documents_project_id_fkey') THEN
            ALTER TABLE documents ADD CONSTRAINT documents_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id);
          END IF;
        ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='projectid') THEN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'documents_projectid_fkey') THEN
            ALTER TABLE documents ADD CONSTRAINT documents_projectid_fkey FOREIGN KEY (projectid) REFERENCES projects(id);
          END IF;
        ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='projectId') THEN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'documents_projectId_fkey') THEN
            ALTER TABLE documents ADD CONSTRAINT documents_projectId_fkey FOREIGN KEY ("projectId") REFERENCES projects(id);
          END IF;
        END IF;
      END $$;`,
     `CREATE TABLE IF NOT EXISTS contacts (
        id text PRIMARY KEY,
        project_id text NOT NULL,
        name text,
        position text,
        email text,
        phone text,
        type text,
        is_key_person boolean DEFAULT false
      );`,
     `DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contacts_project_id_fkey') THEN
          ALTER TABLE contacts ADD CONSTRAINT contacts_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id);
        END IF;
      END $$;`,
     `CREATE TABLE IF NOT EXISTS timesheets (
        id text PRIMARY KEY,
        user_id text NOT NULL,
        project_id text NOT NULL,
        task_id text,
        date date NOT NULL,
        hours numeric DEFAULT 0,
        start_time timestamp without time zone,
        end_time timestamp without time zone
      );`,
     `CREATE TABLE IF NOT EXISTS timesheet_submissions (
        id text PRIMARY KEY,
        user_id text NOT NULL,
        period_start_date date NOT NULL,
        period_end_date date,
        total_hours numeric DEFAULT 0,
        status text DEFAULT 'Draft',
        submitted_at timestamp without time zone
      );`,
     `CREATE UNIQUE INDEX IF NOT EXISTS idx_timesheet_submissions_user_period ON timesheet_submissions (user_id, period_start_date);`
    ,
     `CREATE TABLE IF NOT EXISTS financial_data (
        month date PRIMARY KEY,
        revenue numeric NOT NULL DEFAULT 0,
        cost numeric NOT NULL DEFAULT 0
      );`
    ,
     `CREATE TABLE IF NOT EXISTS audit_logs (
        id text PRIMARY KEY,
        project_id text,
        user_id text,
        event_type text NOT NULL,
        severity text NOT NULL,
        details text,
        ip_address text,
        user_agent text,
        created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
      );`,
     `DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'audit_logs_project_id_fkey') THEN
          ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id);
        END IF;
      END $$;`,
     `DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'audit_logs_user_id_fkey') THEN
          ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);
        END IF;
      END $$;`,
    ,
     `CREATE TABLE IF NOT EXISTS sales_pipelines (
        id text PRIMARY KEY,
        name text NOT NULL,
        createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt timestamp without time zone NOT NULL
      );`,
     `CREATE TABLE IF NOT EXISTS sales_stages (
        id text PRIMARY KEY,
        pipeline_id text NOT NULL,
        name text NOT NULL,
        order_index int NOT NULL DEFAULT 0,
        probability int NOT NULL DEFAULT 0,
        createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt timestamp without time zone NOT NULL
      );`,
     `CREATE TABLE IF NOT EXISTS sales_deals (
        id text PRIMARY KEY,
        pipeline_id text NOT NULL,
        stage_id text,
        name text NOT NULL,
        amount numeric NOT NULL DEFAULT 0,
        currency text NOT NULL DEFAULT 'THB',
        owner_id text,
        client_id text,
        client_org text,
        status text NOT NULL DEFAULT 'open',
        expected_close_date date,
        probability int NOT NULL DEFAULT 0,
        createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt timestamp without time zone NOT NULL
      );`,
     `CREATE TABLE IF NOT EXISTS sales_activities (
        id text PRIMARY KEY,
        deal_id text NOT NULL,
        type text NOT NULL,
        note text,
        user_id text,
        createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
      );`,
     `DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sales_stages_pipeline_id_fkey') THEN
          ALTER TABLE sales_stages ADD CONSTRAINT sales_stages_pipeline_id_fkey FOREIGN KEY (pipeline_id) REFERENCES sales_pipelines(id);
        END IF;
      END $$;`,
     `DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sales_deals_pipeline_id_fkey') THEN
          ALTER TABLE sales_deals ADD CONSTRAINT sales_deals_pipeline_id_fkey FOREIGN KEY (pipeline_id) REFERENCES sales_pipelines(id);
        END IF;
      END $$;`,
     `DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sales_deals_stage_id_fkey') THEN
          ALTER TABLE sales_deals ADD CONSTRAINT sales_deals_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES sales_stages(id);
        END IF;
      END $$;`,
     `DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sales_deals_owner_id_fkey') THEN
          ALTER TABLE sales_deals ADD CONSTRAINT sales_deals_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES users(id);
        END IF;
      END $$;`,
    `DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sales_deals_client_id_fkey') THEN
          ALTER TABLE sales_deals DROP CONSTRAINT sales_deals_client_id_fkey;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sales_deals_client_id_fkey') THEN
          ALTER TABLE sales_deals ADD CONSTRAINT sales_deals_client_id_fkey FOREIGN KEY (client_id) REFERENCES contacts(id);
        END IF;
      END $$;`,
     `DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sales_activities_deal_id_fkey') THEN
          ALTER TABLE sales_activities ADD CONSTRAINT sales_activities_deal_id_fkey FOREIGN KEY (deal_id) REFERENCES sales_deals(id);
        END IF;
      END $$;`,
    `DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sales_activities_user_id_fkey') THEN
          ALTER TABLE sales_activities ADD CONSTRAINT sales_activities_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);
        END IF;
      END $$;`,
    `CREATE INDEX IF NOT EXISTS idx_contacts_project ON contacts(project_id);`,
    `CREATE INDEX IF NOT EXISTS idx_contacts_type ON contacts(type);`,
    `CREATE INDEX IF NOT EXISTS idx_sales_deals_client ON sales_deals(client_id);`,
    `CREATE INDEX IF NOT EXISTS idx_sales_deals_stage ON sales_deals(stage_id);`,
    `CREATE INDEX IF NOT EXISTS idx_sales_deals_pipeline ON sales_deals(pipeline_id);`,
    `CREATE TABLE IF NOT EXISTS milestones (
        id text PRIMARY KEY,
        project_id text NOT NULL,
        name text NOT NULL,
        percentage numeric NOT NULL DEFAULT 0,
        amount numeric NOT NULL DEFAULT 0,
        due_date timestamp without time zone,
        status text NOT NULL DEFAULT 'Pending',
        note text,
        createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt timestamp without time zone NOT NULL
      );`,
     `DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'milestones_project_id_fkey') THEN
          ALTER TABLE milestones ADD CONSTRAINT milestones_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id);
        END IF;
      END $$;`,
    `DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='milestone_id') THEN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tasks_milestone_id_fkey') THEN
            ALTER TABLE tasks ADD CONSTRAINT tasks_milestone_id_fkey FOREIGN KEY (milestone_id) REFERENCES milestones(id);
          END IF;
        END IF;
      END $$;`,
    `DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='task_plan_points') THEN
          CREATE TABLE task_plan_points (
            id text PRIMARY KEY,
            task_id text NOT NULL,
            date date NOT NULL,
            plan_percent numeric NOT NULL DEFAULT 0
          );
        END IF;
      END $$;`,
    `DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'task_plan_points_task_id_fkey') THEN
          ALTER TABLE task_plan_points ADD CONSTRAINT task_plan_points_task_id_fkey FOREIGN KEY (task_id) REFERENCES tasks(id);
        END IF;
        CREATE INDEX IF NOT EXISTS idx_task_plan_points_task_date ON task_plan_points(task_id, date);
      END $$;`,
    `DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='task_actual_logs') THEN
          CREATE TABLE task_actual_logs (
            id text PRIMARY KEY,
            task_id text NOT NULL,
            date date NOT NULL,
            progress_percent numeric NOT NULL DEFAULT 0
          );
        END IF;
      END $$;`,
    `DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'task_actual_logs_task_id_fkey') THEN
          ALTER TABLE task_actual_logs ADD CONSTRAINT task_actual_logs_task_id_fkey FOREIGN KEY (task_id) REFERENCES tasks(id);
        END IF;
        CREATE INDEX IF NOT EXISTS idx_task_actual_logs_task_date ON task_actual_logs(task_id, date);
      END $$;`,
    `DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='project_progress_snapshots') THEN
          CREATE TABLE project_progress_snapshots (
            id text PRIMARY KEY,
            project_id text NOT NULL,
            date date NOT NULL,
            plan_percent numeric NOT NULL DEFAULT 0,
            actual_percent numeric NOT NULL DEFAULT 0,
            spi numeric
          );
        END IF;
      END $$;`,
    `DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'project_progress_snapshots_project_id_fkey') THEN
          ALTER TABLE project_progress_snapshots ADD CONSTRAINT project_progress_snapshots_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id);
        END IF;
        CREATE INDEX IF NOT EXISTS idx_project_progress_snapshots_project_date ON project_progress_snapshots(project_id, date);
      END $$;`,
    `DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='budget_lines') THEN
          CREATE TABLE budget_lines (
            id text PRIMARY KEY,
            project_id text NOT NULL,
            type text NOT NULL,
            amount numeric NOT NULL DEFAULT 0,
            date date,
            related_milestone_id text
          );
        END IF;
      END $$;`,
    `DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'budget_lines_project_id_fkey') THEN
          ALTER TABLE budget_lines ADD CONSTRAINT budget_lines_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id);
        END IF;
        CREATE INDEX IF NOT EXISTS idx_budget_lines_project_date ON budget_lines(project_id, date);
      END $$;`
    `CREATE TABLE IF NOT EXISTS stakeholders (
        id text PRIMARY KEY,
        name text NOT NULL,
        role text,
        organization text,
        email text,
        phone text,
        created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp without time zone NOT NULL
      );`
   ];
   const errors: Array<{ sql: string; error: string }> = [];
  for (const sql of queries) {
    if (!sql) continue;
     try {
       await poolDirect.query(sql);
     } catch (e: any) {
       errors.push({ sql, error: e?.message || String(e) });
     }
   }
   return { ok: errors.length === 0, errors };
 }
