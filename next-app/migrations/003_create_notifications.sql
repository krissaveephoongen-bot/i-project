-- Create notifications table for Ant Design Notification component
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50),
  title VARCHAR(200) NOT NULL,
  message TEXT,
  type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('success', 'info', 'warning', 'error')),
  read BOOLEAN DEFAULT false,
  action_url VARCHAR(200),
  action_text VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Create table for notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  project_updates BOOLEAN DEFAULT true,
  task_assignments BOOLEAN DEFAULT true,
  deadline_reminders BOOLEAN DEFAULT true,
  system_alerts BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Insert default notification preferences for existing users
INSERT INTO notification_preferences (user_id)
SELECT id FROM users 
WHERE id IS NOT NULL 
ON CONFLICT (user_id) DO NOTHING;
