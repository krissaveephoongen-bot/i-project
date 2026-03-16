-- Create menu_items table for Ant Design Menu component
CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  key VARCHAR(50) UNIQUE NOT NULL,
  label VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  path VARCHAR(200),
  parent_key VARCHAR(50),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (parent_key) REFERENCES menu_items(key) ON DELETE SET NULL
);

-- Insert default menu items
INSERT INTO menu_items (key, label, icon, path, sort_order) VALUES
('dashboard', 'Dashboard', 'DashboardOutlined', '/', 1),
('projects', 'Projects', 'ProjectOutlined', '/projects', 2),
('tasks', 'Tasks', 'CheckSquareOutlined', '/tasks', 3),
('reports', 'Reports', 'BarChartOutlined', '/reports', 4),
('team', 'Team', 'TeamOutlined', '/team', 5),
('settings', 'Settings', 'SettingOutlined', '/settings', 6)
ON CONFLICT (key) DO NOTHING;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_menu_items_parent_key ON menu_items(parent_key);
CREATE INDEX IF NOT EXISTS idx_menu_items_is_active ON menu_items(is_active);
CREATE INDEX IF NOT EXISTS idx_menu_items_sort_order ON menu_items(sort_order);
