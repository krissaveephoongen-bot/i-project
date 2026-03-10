import { ReactNode } from 'react';

export type UserRole = 'admin' | 'manager' | 'member';

export interface NavChild {
  nameKey?: string;
  name?: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface NavItem {
  nameKey?: string;
  name?: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
  children?: NavChild[];
}

export interface NavSection {
  titleKey?: string;
  title?: string;
  items: NavItem[];
}

export interface AdminMenuItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}
