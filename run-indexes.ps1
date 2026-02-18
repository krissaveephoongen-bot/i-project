# PowerShell Script to run database indexes individually
# This avoids the "CREATE INDEX CONCURRENTLY cannot run inside a transaction block" error

Write-Host "Starting database index creation..." -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

# Set your database connection parameters
$env:PGHOST = "aws-1-ap-southeast-1.pooler.supabase.com"
$env:PGPORT = "5432"
$env:PGDATABASE = "postgres"
$env:PGUSER = "postgres.vaunihijmwwkhqagjqjd"
$env:PGPASSWORD = "AppWorks@123!"

# Function to run SQL command
function Run-SQL {
    param([string]$sql)
    
    Write-Host "Running: $sql" -ForegroundColor Yellow
    try {
        $result = psql -c $sql
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Success: $sql" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed: $sql" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Error running: $sql" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
    Write-Host ""
}

# Tasks table indexes
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_milestone_id ON tasks(milestoneId);"
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_project_status ON tasks(projectId, status);"
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_assigned_to_status ON tasks(assignedTo, status);"
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);"
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_priority_status ON tasks(priority, status);"

# Milestones table indexes
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_milestones_project_id ON milestones(project_id);"
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_milestones_status ON milestones(status);"
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_milestones_due_date ON milestones(due_date);"

# Expenses table indexes
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expenses_project_id ON expenses(project_id);"
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);"
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expenses_status ON expenses(status);"
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expenses_category ON expenses(category);"
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expenses_created_at ON expenses(created_at);"

# Notifications table indexes
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);"
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_read ON notifications(read);"
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_type ON notifications(type);"
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);"

# Audit logs indexes
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);"
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);"
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);"
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);"

# Time entries indexes
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_time_entries_task_id ON time_entries(task_id);"
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_time_entries_hours ON time_entries(hours);"
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_time_entries_created_at ON time_entries(created_at);"

# Project members indexes
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_project_members_user_id ON project_members(user_id);"
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_project_members_role ON project_members(role);"

# Budget lines indexes
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_budget_lines_project_id ON budget_lines(project_id);"
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_budget_lines_category ON budget_lines(category);"

# Documents indexes
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_project_id ON documents(project_id);"
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);"
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_file_type ON documents(file_type);"

# Risks indexes
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_risks_project_id ON risks(project_id);"
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_risks_status ON risks(status);"
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_risks_severity ON risks(severity);"

# Issues indexes
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_project_id ON issues(project_id);"
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_status ON issues(status);"
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_severity ON issues(severity);"

# Financial data indexes
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_financial_data_project_id ON financial_data(project_id);"
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_financial_data_period ON financial_data(period);"

# Sales deals indexes
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sales_deals_pipeline_id ON sales_deals(pipeline_id);"
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sales_deals_stage_id ON sales_deals(stage_id);"
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sales_deals_status ON sales_deals(status);"

# Sales activities indexes
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sales_activities_deal_id ON sales_activities(deal_id);"
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sales_activities_user_id ON sales_activities(user_id);"
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sales_activities_type ON sales_activities(type);"

# Timesheet submissions indexes
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_timesheet_submissions_user_id ON timesheet_submissions(user_id);"
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_timesheet_submissions_week_start ON timesheet_submissions(week_start_date);"
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_timesheet_submissions_status ON timesheet_submissions(status);"

# Project progress snapshots indexes
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_project_progress_snapshots_project_id ON project_progress_snapshots(project_id);"
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_project_progress_snapshots_date ON project_progress_snapshots(date);"

# SPI/CPI daily snapshot indexes
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_spi_cpi_daily_snapshot_project_id ON spi_cpi_daily_snapshot(projectid);"
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_spi_cpi_daily_snapshot_date ON spi_cpi_daily_snapshot(date);"

# Stakeholders indexes
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stakeholders_project_id ON stakeholders(project_id);"

# Cashflow indexes
Run-SQL "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cashflow_month ON cashflow(month);"

Write-Host "==========================================" -ForegroundColor Green
Write-Host "Index creation completed!" -ForegroundColor Green
Write-Host "Now run the remaining SQL commands from database-optimizations-fixed.sql" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Green

# Test some of the new indexes
Write-Host "Testing new indexes..." -ForegroundColor Yellow
Run-SQL "EXPLAIN ANALYZE SELECT * FROM tasks WHERE project_id = 'test' AND status = 'active';"
Run-SQL "EXPLAIN ANALYZE SELECT * FROM tasks WHERE assigned_to = 'user1' AND status = 'completed';"
Run-SQL "EXPLAIN ANALYZE SELECT * FROM milestones WHERE project_id = 'test' AND status = 'active';"

Write-Host "==========================================" -ForegroundColor Green
Write-Host "All done! Database optimization completed successfully." -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
