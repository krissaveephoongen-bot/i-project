import { pgTable, text, timestamp, boolean, integer, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================
// USERS TABLE (Extended for Authentication)
// ============================================================

export const users = pgTable('users', {
  id: text('id').primaryKey().defaultRandom().unique(),
  objectId: text('object_id').unique(),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  password: text('password'),
  
  // Role & Permissions
  role: text('role').default('employee'), // admin, manager, employee, vendor
  department: text('department'),
  position: text('position'),
  employeeCode: text('employee_code').unique(),
  
  // Contact
  phone: text('phone'),
  avatar: text('avatar_url'),
  
  // Status
  status: text('status').default('active'),
  isActive: boolean('is_active').default(true),
  isDeleted: boolean('is_deleted').default(false),
  
  // Security
  failedLoginAttempts: integer('failed_login_attempts').default(0),
  lastLogin: timestamp('last_login'),
  lockedUntil: timestamp('locked_until'),
  resetToken: text('reset_token'),
  resetTokenExpiry: timestamp('reset_token_expiry'),
  
  // Project Management
  isProjectManager: boolean('is_project_manager').default(false),
  isSupervisor: boolean('is_supervisor').default(false),
  
  // Preferences
  notificationPreferences: text('notification_preferences').$type('json'),
  timezone: text('timezone').default('Asia/Bangkok'),
  
  // Financial
  hourlyRate: decimal('hourly_rate', { precision: 10, scale: 2 }).default('0'),
  
  // Timesheet
  weeklyCapacity: decimal('weekly_capacity', { precision: 5, scale: 2 }).default('40.00'),
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  indexes: [
    {
      name: 'idx_users_email',
      columns: [table.email],
      unique: true,
    },
    {
      name: 'idx_users_role',
      columns: [table.role],
    },
    {
      name: 'idx_users_status',
      columns: [table.status],
    },
    {
      name: 'idx_users_active',
      columns: [table.isActive],
    },
  ],
}));

// ============================================================
// ROLES TABLE (RBAC System)
// ============================================================

export const roles = pgTable('roles', {
  id: text('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(), // admin, manager, employee, vendor
  displayName: text('display_name').notNull(),
  description: text('description'),
  permissions: text('permissions').$type('json').notNull(), // Array of permission strings
  
  isActive: boolean('is_active').default(true),
  isSystem: boolean('is_system').default(false), // System roles cannot be deleted
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  indexes: [
    {
      name: 'idx_roles_name',
      columns: [table.name],
      unique: true,
    },
  ],
}));

// ============================================================
// USER ROLES (Many-to-Many between Users and Roles)
// ============================================================

export const userRoles = pgTable('user_roles', {
  id: text('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  roleId: text('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  
  assignedBy: text('assigned_by').references(() => users.id),
  assignedAt: timestamp('assigned_at').defaultNow(),
  expiresAt: timestamp('expires_at'), // For temporary role assignments
  
  isActive: boolean('is_active').default(true),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  indexes: [
    {
      name: 'idx_user_roles_user',
      columns: [table.userId],
    },
    {
      name: 'idx_user_roles_role',
      columns: [table.roleId],
    },
    {
      name: 'idx_user_roles_active',
      columns: [table.isActive],
    },
  ],
}));

// ============================================================
// PERMISSIONS TABLE (System Permissions Registry)
// ============================================================

export const permissions = pgTable('permissions', {
  id: text('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(), // e.g., 'projects.create', 'users.read'
  displayName: text('display_name').notNull(),
  description: text('description'),
  category: text('category').notNull(), // e.g., 'projects', 'users', 'master_data'
  resource: text('resource').notNull(), // e.g., 'project', 'user', 'role'
  action: text('action').notNull(), // e.g., 'create', 'read', 'update', 'delete'
  
  isActive: boolean('is_active').default(true),
  isSystem: boolean('is_system').default(false),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  indexes: [
    {
      name: 'idx_permissions_name',
      columns: [table.name],
      unique: true,
    },
    {
      name: 'idx_permissions_category',
      columns: [table.category],
    },
    {
      name: 'idx_permissions_resource',
      columns: [table.resource],
    },
    {
      name: 'idx_permissions_action',
      columns: [table.action],
    },
  ],
}));

// ============================================================
// ROLE PERMISSIONS (Many-to-Many between Roles and Permissions)
// ============================================================

export const rolePermissions = pgTable('role_permissions', {
  id: text('id').primaryKey().defaultRandom(),
  roleId: text('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  permissionId: text('permission_id').notNull().references(() => permissions.id, { onDelete: 'cascade' }),
  
  assignedBy: text('assigned_by').references(() => users.id),
  assignedAt: timestamp('assigned_at').defaultNow(),
  
  isActive: boolean('is_active').default(true),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  indexes: [
    {
      name: 'idx_role_permissions_role',
      columns: [table.roleId],
    },
    {
      name: 'idx_role_permissions_permission',
      columns: [table.permissionId],
    },
    {
      name: 'idx_role_permissions_active',
      columns: [table.isActive],
    },
  ],
}));

// ============================================================
// SESSIONS TABLE (JWT Token Management)
// ============================================================

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Token Information
  token: text('token').notNull().unique(),
  refreshToken: text('refresh_token').unique(),
  
  // Device Information
  deviceInfo: text('device_info').$type('json'), // { userAgent, ip, platform, etc. }
  ipAddress: text('ip_address'),
  
  // Session Management
  isActive: boolean('is_active').default(true),
  lastActivity: timestamp('last_activity').defaultNow(),
  expiresAt: timestamp('expires_at').notNull(),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  indexes: [
    {
      name: 'idx_sessions_user',
      columns: [table.userId],
    },
    {
      name: 'idx_sessions_token',
      columns: [table.token],
      unique: true,
    },
    {
      name: 'idx_sessions_refresh',
      columns: [table.refreshToken],
      unique: true,
    },
    {
      name: 'idx_sessions_active',
      columns: [table.isActive],
    },
    {
      name: 'idx_sessions_expires',
      columns: [table.expiresAt],
    },
  ],
}));

// ============================================================
// AUDIT LOG TABLE (Activity Tracking)
// ============================================================

export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey().defaultRandom(),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  
  // Action Details
  action: text('action').notNull(), // e.g., 'login', 'logout', 'create', 'update', 'delete'
  resource: text('resource').notNull(), // e.g., 'project', 'user', 'role'
  resourceId: text('resource_id'), // ID of the affected resource
  
  // Request Details
  method: text('method'), // HTTP method
  endpoint: text('endpoint'), // API endpoint
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  
  // Changes
  oldValues: text('old_values').$type('json'), // Previous state
  newValues: text('new_values').$type('json'), // New state
  
  // Status
  status: text('status').default('success'), // success, error, warning
  errorMessage: text('error_message'),
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  indexes: [
    {
      name: 'idx_audit_logs_user',
      columns: [table.userId],
    },
    {
      name: 'idx_audit_logs_action',
      columns: [table.action],
    },
    {
      name: 'idx_audit_logs_resource',
      columns: [table.resource],
    },
    {
      name: 'idx_audit_logs_created',
      columns: [table.createdAt],
    },
    {
      name: 'idx_audit_logs_status',
      columns: [table.status],
    },
  ],
}));

// ============================================================
// RELATIONSHIPS
// ============================================================

export const usersRelations = relations(users, ({ many }) => ({
  userRoles: many(userRoles, {
    relationName: 'user_roles',
  }),
  sessions: many(sessions, {
    relationName: 'user_sessions',
  }),
  auditLogs: many(auditLogs, {
    relationName: 'user_audit_logs',
  }),
  assignedRoles: many(userRoles, {
    fields: [userRoles.assignedBy],
    references: [users.id],
  }),
  assignedPermissions: many(rolePermissions, {
    fields: [rolePermissions.assignedBy],
    references: [users.id],
  }),
  assignedAuditLogs: many(auditLogs, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRoles, {
    relationName: 'role_users',
  }),
  rolePermissions: many(rolePermissions, {
    relationName: 'role_permissions',
  }),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
  assignedBy: one(users, {
    fields: [userRoles.assignedBy],
    references: [users.id],
  }),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions, {
    relationName: 'permission_roles',
  }),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id],
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
  }),
  assignedBy: one(users, {
    fields: [rolePermissions.assignedBy],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

// ============================================================
// TYPE DEFINITIONS
// ============================================================

export type User = typeof users.$inferSelect;
export type Role = typeof roles.$inferSelect;
export type UserRole = typeof userRoles.$inferSelect;
export type Permission = typeof permissions.$inferSelect;
export type RolePermission = typeof rolePermissions.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;

export type UserWithRoles = User & {
  userRoles: (UserRole & {
    role: Role;
  })[];
};

export type RoleWithPermissions = Role & {
  rolePermissions: (RolePermission & {
    permission: Permission;
  })[];
};

export type SessionWithUser = Session & {
  user: User;
};

export type CurrentUser = User & {
  roles: Role[];
  permissions: Permission[];
  activeProjectId?: string;
  preferences: {
    timezone: string;
    language: string;
    theme: 'light' | 'dark';
  };
};

export type LoginRequest = {
  email: string;
  password: string;
  deviceInfo?: {
    userAgent: string;
    ip: string;
    platform: string;
  };
};

export type LoginResponse = {
  user: CurrentUser;
  token: string;
  refreshToken: string;
  expiresIn: number;
};

export type RefreshTokenRequest = {
  refreshToken: string;
};

export type RefreshTokenResponse = {
  token: string;
  refreshToken: string;
  expiresIn: number;
};

export type LogoutRequest = {
  token: string;
  refreshToken?: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type ResetPasswordRequest = {
  token: string;
  newPassword: string;
};

export type CreateRoleInput = Omit<Role, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateRoleInput = Partial<CreateRoleInput>;

export type CreatePermissionInput = Omit<Permission, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdatePermissionInput = Partial<CreatePermissionInput>;

export type AssignRoleInput = {
  userId: string;
  roleId: string;
  expiresAt?: string;
};

export type AssignPermissionInput = {
  roleId: string;
  permissionId: string;
};

// ============================================================
// PERMISSION CONSTANTS
// ============================================================

export const PERMISSION_CATEGORIES = {
  PROJECTS: 'projects',
  USERS: 'users',
  ROLES: 'roles',
  MASTER_DATA: 'master_data',
  SYSTEM: 'system',
} as const;

export const PERMISSION_ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  APPROVE: 'approve',
  MANAGE: 'manage',
} as const;

export const SYSTEM_PERMISSIONS = {
  // Project Permissions
  'projects.create': {
    name: 'projects.create',
    displayName: 'Create Projects',
    description: 'Create new projects',
    category: PERMISSION_CATEGORIES.PROJECTS,
    resource: 'project',
    action: PERMISSION_ACTIONS.CREATE,
  },
  'projects.read': {
    name: 'projects.read',
    displayName: 'View Projects',
    description: 'View project details and lists',
    category: PERMISSION_CATEGORIES.PROJECTS,
    resource: 'project',
    action: PERMISSION_ACTIONS.READ,
  },
  'projects.update': {
    name: 'projects.update',
    displayName: 'Update Projects',
    description: 'Update project information',
    category: PERMISSION_CATEGORIES.PROJECTS,
    resource: 'project',
    action: PERMISSION_ACTIONS.UPDATE,
  },
  'projects.delete': {
    name: 'projects.delete',
    displayName: 'Delete Projects',
    description: 'Delete projects',
    category: PERMISSION_CATEGORIES.PROJECTS,
    resource: 'project',
    action: PERMISSION_ACTIONS.DELETE,
  },
  'projects.approve': {
    name: 'projects.approve',
    displayName: 'Approve Projects',
    description: 'Approve project changes and milestones',
    category: PERMISSION_CATEGORIES.PROJECTS,
    resource: 'project',
    action: PERMISSION_ACTIONS.APPROVE,
  },

  // User Permissions
  'users.create': {
    name: 'users.create',
    displayName: 'Create Users',
    description: 'Create new user accounts',
    category: PERMISSION_CATEGORIES.USERS,
    resource: 'user',
    action: PERMISSION_ACTIONS.CREATE,
  },
  'users.read': {
    name: 'users.read',
    displayName: 'View Users',
    description: 'View user profiles and lists',
    category: PERMISSION_CATEGORIES.USERS,
    resource: 'user',
    action: PERMISSION_ACTIONS.READ,
  },
  'users.update': {
    name: 'users.update',
    displayName: 'Update Users',
    description: 'Update user information',
    category: PERMISSION_CATEGORIES.USERS,
    resource: 'user',
    action: PERMISSION_ACTIONS.UPDATE,
  },
  'users.delete': {
    name: 'users.delete',
    displayName: 'Delete Users',
    description: 'Delete user accounts',
    category: PERMISSION_CATEGORIES.USERS,
    resource: 'user',
    action: PERMISSION_ACTIONS.DELETE,
  },

  // Role Permissions
  'roles.create': {
    name: 'roles.create',
    displayName: 'Create Roles',
    description: 'Create new roles',
    category: PERMISSION_CATEGORIES.ROLES,
    resource: 'role',
    action: PERMISSION_ACTIONS.CREATE,
  },
  'roles.read': {
    name: 'roles.read',
    displayName: 'View Roles',
    description: 'View role definitions and assignments',
    category: PERMISSION_CATEGORIES.ROLES,
    resource: 'role',
    action: PERMISSION_ACTIONS.READ,
  },
  'roles.update': {
    name: 'roles.update',
    displayName: 'Update Roles',
    description: 'Update role definitions and permissions',
    category: PERMISSION_CATEGORIES.ROLES,
    resource: 'role',
    action: PERMISSION_ACTIONS.UPDATE,
  },
  'roles.delete': {
    name: 'roles.delete',
    displayName: 'Delete Roles',
    description: 'Delete roles',
    category: PERMISSION_CATEGORIES.ROLES,
    resource: 'role',
    action: PERMISSION_ACTIONS.DELETE,
  },

  // Master Data Permissions
  'master_data.manage': {
    name: 'master_data.manage',
    displayName: 'Manage Master Data',
    description: 'Manage system master data (rates, vendors, holidays)',
    category: PERMISSION_CATEGORIES.MASTER_DATA,
    resource: 'master_data',
    action: PERMISSION_ACTIONS.MANAGE,
  },

  // System Permissions
  'system.admin': {
    name: 'system.admin',
    displayName: 'System Administration',
    description: 'Full system administration access',
    category: PERMISSION_CATEGORIES.SYSTEM,
    resource: 'system',
    action: PERMISSION_ACTIONS.MANAGE,
  },
} as const;

export const SYSTEM_ROLES = {
  ADMIN: {
    name: 'admin',
    displayName: 'System Administrator',
    description: 'Full system access with all permissions',
    permissions: Object.keys(SYSTEM_PERMISSIONS),
  },
  MANAGER: {
    name: 'manager',
    displayName: 'Project Manager',
    description: 'Can manage projects and team members',
    permissions: [
      'projects.create',
      'projects.read',
      'projects.update',
      'projects.approve',
      'users.read',
      'users.update',
      'master_data.manage',
    ],
  },
  EMPLOYEE: {
    name: 'employee',
    displayName: 'Employee',
    description: 'Can view assigned projects and submit timesheets',
    permissions: [
      'projects.read',
      'users.read',
    ],
  },
  VENDOR: {
    name: 'vendor',
    displayName: 'Vendor/Contractor',
    description: 'Limited access to assigned projects',
    permissions: [
      'projects.read',
    ],
  },
} as const;
