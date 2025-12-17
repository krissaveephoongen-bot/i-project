/**
 * Migration: Create expenses table
 * Created: December 2025
 */

CREATE TABLE IF NOT EXISTS expenses (
  id VARCHAR(100) PRIMARY KEY DEFAULT (UUID()),
  date DATE NOT NULL,
  project_id VARCHAR(100),
  category VARCHAR(50) NOT NULL, -- travel, food, accommodation, equipment, software, service, other
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  user_id VARCHAR(100),
  user_name VARCHAR(255) DEFAULT 'System User',
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_date (date),
  INDEX idx_project_id (project_id),
  INDEX idx_category (category),
  INDEX idx_status (status),
  INDEX idx_user_id (user_id),
  INDEX idx_is_deleted (is_deleted)
);
