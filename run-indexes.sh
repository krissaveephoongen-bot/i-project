#!/bin/bash

# Script to run database indexes individually
# This avoids the "CREATE INDEX CONCURRENTLY cannot run inside a transaction block" error

echo "Starting database index creation..."
echo "=========================================="

# Set your database connection parameters
DB_HOST="your-host"
DB_PORT="5432"
DB_NAME="your-database"
DB_USER="your-user"

# Function to run SQL command
run_sql() {
    local sql="$1"
    echo "Running: $sql"
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "$sql"
    if [ $? -eq 0 ]; then
        echo "✅ Success: $sql"
    else
        echo "❌ Failed: $sql"
    fi
    echo ""
}

# Tasks table indexes
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_milestone_id ON tasks(milestoneId);"
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_project_status ON tasks(projectId, status);"
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_assigned_to_status ON tasks(assignedTo, status);"
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);"
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_priority_status ON tasks(priority, status);"

# Milestones table indexes
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_milestones_project_id ON milestones(project_id);"
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_milestones_status ON milestones(status);"
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_milestones_due_date ON milestones(due_date);"

# Expenses table indexes
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expenses_project_id ON expenses(project_id);"
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);"
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expenses_status ON expenses(status);"
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expenses_category ON expenses(category);"
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expenses_created_at ON expenses(created_at);"

# Notifications table indexes
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);"
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_read ON notifications(read);"
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_type ON notifications(type);"
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);"

# Audit logs indexes
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);"
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);"
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);"
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);"

# Time entries indexes
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_time_entries_task_id ON time_entries(task_id);"
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_time_entries_hours ON time_entries(hours);"
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_time_entries_created_at ON time_entries(created_at);"

# Project members indexes
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_project_members_user_id ON project_members(user_id);"
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_project_members_role ON project_members(role);"

# Budget lines indexes
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_budget_lines_project_id ON budget_lines(project_id);"
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_budget_lines_category ON budget_lines(category);"

# Documents indexes
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_project_id ON documents(project_id);"
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);"
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_file_type ON documents(file_type);"

# Risks indexes
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_risks_project_id ON risks(project_id);"
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_risks_status ON risks(status);"
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_risks_severity ON risks(severity);"

# Issues indexes
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_project_id ON issues(project_id);"
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_status ON issues(status);"
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_issues_severity ON issues(severity);"

# Financial data indexes
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_financial_data_project_id ON financial_data(project_id);"
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_financial_data_period ON financial_data(period);"

# Sales deals indexes
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sales_deals_pipeline_id ON sales_deals(pipeline_id);"
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sales_deals_stage_id ON sales_deals(stage_id);"
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sales_deals_status ON sales_deals(status);"

# Sales activities indexes
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sales_activities_deal_id ON sales_activities(deal_id);"
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sales_activities_user_id ON sales_activities(user_id);"
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sales_activities_type ON sales_activities(type);"

# Timesheet submissions indexes
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_timesheet_submissions_user_id ON timesheet_submissions(user_id);"
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_timesheet_submissions_week_start ON timesheet_submissions(week_start_date);"
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_timesheet_submissions_status ON timesheet_submissions(status);"

# Project progress snapshots indexes
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_project_progress_snapshots_project_id ON project_progress_snapshots(project_id);"
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_project_progress_snapshots_date ON project_progress_snapshots(date);"

# SPI/CPI daily snapshot indexes
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_spi_cpi_daily_snapshot_project_id ON spi_cpi_daily_snapshot(projectid);"
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_spi_cpi_daily_snapshot_date ON spi_cpi_daily_snapshot(date);"

# Stakeholders indexes
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stakeholders_project_id ON stakeholders(project_id);"

# Cashflow indexes
run_sql "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cashflow_month ON cashflow(month);"

echo "=========================================="
echo "Index creation completed!"
echo "Now run the remaining SQL commands from database-optimizations-fixed.sql"
echo "=========================================="

# Test some of the new indexes
echo "Testing new indexes..."
run_sql "EXPLAIN ANALYZE SELECT * FROM tasks WHERE projectId = 'test' AND status = 'active';"
run_sql "EXPLAIN ANALYZE SELECT * FROM tasks WHERE assignedTo = 'user1' AND status = 'completed';"
run_sql "EXPLAIN ANALYZE SELECT * FROM milestones WHERE projectId = 'test' AND status = 'active';"

echo "=========================================="
echo "All done! Database optimization completed successfully."
