@echo off
setlocal enabledelayedexpansion

echo Starting database optimization...
echo ==========================================

REM Set database connection parameters
set PGHOST=aws-1-ap-southeast-1.pooler.supabase.com
set PGPORT=5432
set PGDATABASE=postgres
set PGUSER=postgres.vaunihijmwwkhqagjqjd
set PGPASSWORD=AppWorks@123!

REM Function to run SQL command
:RunSQL
set sql=%~1
echo Running: %sql%
psql -c "%sql%"
if %errorlevel% equ 0 (
    echo ✅ Success: %sql%
) else (
    echo ❌ Failed: %sql%
)
echo.
goto :eof

REM Tasks table indexes
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_milestone_id ON tasks(milestoneId);"
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_project_status ON tasks(projectId, status);"
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_assigned_to_status ON tasks(assignedTo, status);"
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);"
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_priority_status ON tasks(priority, status);"

REM Milestones table indexes
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_milestones_project_id ON milestones(project_id);"
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_milestones_status ON milestones(status);"
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_milestones_due_date ON milestones(due_date);"

REM Expenses table indexes
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expenses_project_id ON expenses(project_id);"
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);"
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expenses_status ON expenses(status);"
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expenses_category ON expenses(category);"
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expenses_created_at ON expenses(created_at);"

REM Notifications table indexes
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);"
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_read ON notifications(read);"
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_type ON notifications(type);"
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);"

REM Audit logs indexes
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);"
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);"
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);"
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);"

REM Time entries indexes
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_time_entries_task_id ON time_entries(task_id);"
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_time_entries_hours ON time_entries(hours);"
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_time_entries_created_at ON time_entries(created_at);"

REM Project members indexes
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_project_members_user_id ON project_members(user_id);"
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_project_members_role ON project_members(role);"

REM Budget lines indexes
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_budget_lines_project_id ON budget_lines(project_id);"
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_budget_lines_category ON budget_lines(category);"

REM Documents indexes
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_project_id ON documents(project_id);"
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);"
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_file_type ON documents(file_type);"

REM Risks indexes
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_risks_project_id ON risks(project_id);"
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_risks_status ON risks(status);"
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_risks_severity ON risks(severity);"

REM Issues indexes
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_project_id ON issues(project_id);"
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_status ON issues(status);"
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_severity ON issues(severity);"

REM Financial data indexes
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_financial_data_project_id ON financial_data(project_id);"
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_financial_data_period ON financial_data(period);"

REM Sales deals indexes
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sales_deals_pipeline_id ON sales_deals(pipeline_id);"
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sales_deals_stage_id ON sales_deals(stage_id);"
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sales_deals_status ON sales_deals(status);"

REM Sales activities indexes
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sales_activities_deal_id ON sales_activities(deal_id);"
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sales_activities_user_id ON sales_activities(user_id);"
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sales_activities_type ON sales_activities(type);"

REM Timesheet submissions indexes
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_timesheet_submissions_user_id ON timesheet_submissions(user_id);"
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_timesheet_submissions_week_start ON timesheet_submissions(week_start_date);"
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_timesheet_submissions_status ON timesheet_submissions(status);"

REM Project progress snapshots indexes
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_project_progress_snapshots_project_id ON project_progress_snapshots(project_id);"
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_project_progress_snapshots_date ON project_progress_snapshots(date);"

REM SPI/CPI daily snapshot indexes
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_spi_cpi_daily_snapshot_project_id ON spi_cpi_daily_snapshot(projectid);"
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_spi_cpi_daily_snapshot_date ON spi_cpi_daily_snapshot(date);"

REM Stakeholders indexes
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stakeholders_project_id ON stakeholders(project_id);"

REM Cashflow indexes
call :RunSQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cashflow_month ON cashflow(month);"

echo ==========================================
echo Index creation completed!
echo Now run the remaining SQL commands from database-optimizations-fixed.sql
echo ==========================================

REM Test some of the new indexes
echo Testing new indexes...
call :RunSQL "EXPLAIN ANALYZE SELECT * FROM tasks WHERE projectId = 'test' AND status = 'active';"
call :RunSQL "EXPLAIN ANALYZE SELECT * FROM tasks WHERE assignedTo = 'user1' AND status = 'completed';"
call :RunSQL "EXPLAIN ANALYZE SELECT * FROM milestones WHERE projectId = 'test' AND status = 'active';"

echo ==========================================
echo All done! Database optimization completed successfully.
echo ==========================================

pause
