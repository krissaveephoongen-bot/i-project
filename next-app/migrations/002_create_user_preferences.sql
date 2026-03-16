-- Create user_preferences table for Ant Design theming and settings
CREATE TABLE IF NOT EXISTS user_preferences (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  theme VARCHAR(20) DEFAULT 'light',
  language VARCHAR(10) DEFAULT 'en',
  sidebar_collapsed BOOLEAN DEFAULT false,
  table_page_size INTEGER DEFAULT 10,
  date_format VARCHAR(20) DEFAULT 'YYYY-MM-DD',
  time_format VARCHAR(10) DEFAULT 'HH:mm',
  timezone VARCHAR(50) DEFAULT 'UTC',
  notifications_enabled BOOLEAN DEFAULT true,
  auto_save_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Insert default preferences for existing users
INSERT INTO user_preferences (user_id, theme, language)
SELECT id, 'light', 'en' FROM users 
WHERE id IS NOT NULL 
ON CONFLICT (user_id) DO NOTHING;
