/**
 * Migration: Create additional tables for file management, templates, and customization
 * Created: December 2025
 */

-- First ensure the users table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'users') THEN
        RAISE EXCEPTION 'Users table does not exist. Please run the users table migration first.';
    END IF;
END $$;

-- Files Table
CREATE TABLE IF NOT EXISTS files (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  size BIGINT DEFAULT 0,
  type VARCHAR(100),
  url TEXT NOT NULL,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  entity_type VARCHAR(50) DEFAULT 'general', -- project, task, general
  entity_id VARCHAR(100),
  uploader_id VARCHAR(100) NOT NULL,
  uploader_name VARCHAR(255),
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint after table creation
ALTER TABLE files 
ADD CONSTRAINT fk_files_uploader 
FOREIGN KEY (uploader_id) REFERENCES users(id) 
ON DELETE CASCADE;

-- Create indexes for files table
CREATE INDEX IF NOT EXISTS idx_files_uploader_id ON files(uploader_id);
CREATE INDEX IF NOT EXISTS idx_files_entity ON files(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_files_upload_date ON files(upload_date);

-- Templates Table
CREATE TABLE IF NOT EXISTS templates (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL, -- software-development, marketing-campaign, etc.
  type VARCHAR(50) DEFAULT 'project', -- project, task
  is_active BOOLEAN DEFAULT TRUE,
  created_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint after table creation
ALTER TABLE templates 
ADD CONSTRAINT fk_templates_created_by 
FOREIGN KEY (created_by) REFERENCES users(id) 
ON DELETE SET NULL;

-- Create indexes for templates table
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_is_active ON templates(is_active);

-- Template Tasks Table
CREATE TABLE IF NOT EXISTS template_tasks (
  id VARCHAR(100) PRIMARY KEY,
  template_id VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(50) DEFAULT 'medium', -- low, medium, high, urgent
  estimated_hours INT DEFAULT 0,
  order_index INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint after table creation
ALTER TABLE template_tasks 
ADD CONSTRAINT fk_template_tasks_template 
FOREIGN KEY (template_id) REFERENCES templates(id) 
ON DELETE CASCADE;

-- Team Customization Table
CREATE TABLE IF NOT EXISTS team_customization (
  id VARCHAR(100) PRIMARY KEY DEFAULT (UUID()),
  team_id VARCHAR(100) NOT NULL,
  workflows JSON, -- Array of workflow names
  statuses JSON, -- Array of status values
  priorities JSON, -- Array of priority levels
  custom_fields JSON, -- Array of custom field definitions
  automation_rules JSON, -- Array of automation rule references
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  UNIQUE KEY unique_team (team_id),
  INDEX idx_team (team_id)
);

-- Custom Workflows Table
CREATE TABLE IF NOT EXISTS custom_workflows (
  id VARCHAR(100) PRIMARY KEY,
  team_id VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  stages JSON NOT NULL, -- Array of stage names
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  INDEX idx_team (team_id)
);

-- Automation Rules Table
CREATE TABLE IF NOT EXISTS automation_rules (
  id VARCHAR(100) PRIMARY KEY,
  team_id VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  trigger JSON NOT NULL, -- { event: string, conditions: {} }
  action JSON NOT NULL, -- { type: string, params: {} }
  is_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  INDEX idx_team (team_id),
  INDEX idx_is_enabled (is_enabled)
);

-- Activity Log Table (Enhanced)
CREATE TABLE IF NOT EXISTS activity_log (
  id VARCHAR(100) PRIMARY KEY,
  user_id VARCHAR(100),
  user_name VARCHAR(255),
  action VARCHAR(255) NOT NULL, -- create, update, delete, approve, etc.
  entity_type VARCHAR(100), -- project, task, timesheet, cost, etc.
  entity_id VARCHAR(100),
  entity_name VARCHAR(255),
  description TEXT,
  changes JSON, -- Before/after values
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user (user_id),
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_action (action),
  INDEX idx_timestamp (timestamp)
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(100) PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  title VARCHAR(255),
  message TEXT,
  type VARCHAR(100), -- info, warning, error, success
  priority VARCHAR(50) DEFAULT 'normal', -- low, normal, high
  read BOOLEAN DEFAULT FALSE,
  related_entity_type VARCHAR(100),
  related_entity_id VARCHAR(100),
  action_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_read (read),
  INDEX idx_created (created_at)
);

-- Audit Log Table
CREATE TABLE IF NOT EXISTS audit_log (
  id VARCHAR(100) PRIMARY KEY,
  user_id VARCHAR(100),
  user_name VARCHAR(255),
  action VARCHAR(255) NOT NULL,
  resource_type VARCHAR(100),
  resource_id VARCHAR(100),
  status VARCHAR(50), -- success, failure
  status_code INT,
  error_message TEXT,
  request_data JSON,
  response_data JSON,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user (user_id),
  INDEX idx_timestamp (timestamp),
  INDEX idx_status (status)
);

-- Create indexes for files table
CREATE INDEX IF NOT EXISTS idx_files_entity ON files(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_files_uploader_id ON files(uploader_id);

-- Create indexes for templates table
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_is_active ON templates(is_active);

-- Create indexes for template_tasks table
CREATE INDEX IF NOT EXISTS idx_template_tasks_template_id ON template_tasks(template_id);
CREATE INDEX IF NOT EXISTS idx_template_tasks_order ON template_tasks(order_index);

-- Skip team_customization and teams table modifications for now
-- as they might depend on other tables that don't exist yet
