// UI Related Types

export type Theme = 'light' | 'dark' | 'system';

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  badge?: string | number;
  children?: NavigationItem[];
  permissions?: string[];
  hidden?: boolean;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

export interface ModalState {
  isOpen: boolean;
  component?: React.ComponentType<any>;
  props?: Record<string, any>;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface SidebarState {
  isCollapsed: boolean;
  width: number;
}

export interface TableColumn<T = any> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableAction<T = any> {
  label: string;
  icon?: string;
  onClick: (row: T) => void;
  disabled?: (row: T) => boolean;
  variant?: 'default' | 'destructive';
}