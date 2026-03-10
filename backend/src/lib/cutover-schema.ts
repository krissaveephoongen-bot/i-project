import { pgTable, text, timestamp, boolean, integer, decimal, index, json } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users, projects, tasks, vendorContracts, vendorPaymentMilestones } from './schema';

// ============================================================
// CUTOVER PHASES TABLE
// ============================================================

export const cutoverPhases = pgTable('cutover_phases', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  
  // Phase Details
  phaseName: text('phase_name').notNull(),
  phaseDescription: text('phase_description'),
  phaseType: text('phase_type').notNull(), // planning, preparation, execution, validation, post_cutover
  
  // Timeline
  scheduledStartDate: text('scheduled_start_date').notNull(), // ISO date-time string
  scheduledEndDate: text('scheduled_end_date').notNull(), // ISO date-time string
  actualStartDate: timestamp('actual_start_date'),
  actualEndDate: timestamp('actual_end_date'),
  estimatedDuration: integer('estimated_duration').notNull(), // in minutes
  
  // Status Tracking
  status: text('status').default('planned'), // planned, in_progress, completed, failed, rolled_back, cancelled
  completionPercentage: decimal('completion_percentage', { precision: 5, scale: 2 }).default('0'),
  
  // Dependencies
  prerequisitePhases: text('prerequisite_phases').$type('json'), // Array of phase IDs
  dependentPhases: text('dependent_phases').$type('json'), // Array of phase IDs
  
  // Risk Assessment
  riskLevel: text('risk_level').default('medium'), // low, medium, high, critical
  rollbackPlan: text('rollback_plan'),
  rollbackConditions: text('rollback_conditions').$type('json'), // Array of rollback triggers
  
  // Approval Information
  phaseLead: text('phase_lead').references(() => users.id, { onDelete: 'set null' }),
  approvedBy: text('approved_by').references(() => users.id, { onDelete: 'set null' }),
  approvedAt: timestamp('approved_at'),
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  indexes: [
    {
      name: 'idx_cutover_phases_project',
      columns: [table.projectId],
    },
    {
      name: 'idx_cutover_phases_status',
      columns: [table.status],
    },
    {
      name: 'idx_cutover_phases_type',
      columns: [table.phaseType],
    },
    {
      name: 'idx_cutover_phases_dates',
      columns: [table.scheduledStartDate, table.scheduledEndDate],
    },
    {
      name: 'idx_cutover_phases_lead',
      columns: [table.phaseLead],
    },
    {
      name: 'idx_cutover_phases_risk',
      columns: [table.riskLevel],
    },
  ],
}));

// ============================================================
// READINESS CHECKLISTS TABLE
// ============================================================

export const readinessChecklists = pgTable('readiness_checklists', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  phaseId: text('phase_id').references(() => cutoverPhases.id, { onDelete: 'cascade' }),
  
  // Checklist Details
  checklistName: text('checklist_name').notNull(),
  checklistType: text('checklist_type').notNull(), // system, operation, user, security, performance
  
  // Checklist Items
  checklistItems: text('checklist_items').$type('json').notNull(), // Array of checklist items
  
  // Status Tracking
  totalItems: integer('total_items').notNull(),
  completedItems: integer('completed_items').default(0),
  failedItems: integer('failed_items').default(0),
  blockedItems: integer('blocked_items').default(0),
  completionPercentage: decimal('completion_percentage', { precision: 5, scale: 2 }).default('0'),
  
  // Approval
  approvedBy: text('approved_by').references(() => users.id, { onDelete: 'set null' }),
  approvedAt: timestamp('approved_at'),
  approvalNotes: text('approval_notes'),
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  indexes: [
    {
      name: 'idx_readiness_checklists_project',
      columns: [table.projectId],
    },
    {
      name: 'idx_readiness_checklists_phase',
      columns: [table.phaseId],
    },
    {
      name: 'idx_readiness_checklists_type',
      columns: [table.checklistType],
    },
    {
      name: 'idx_readiness_checklists_approval',
      columns: [table.approvedBy],
    },
  ],
}));

// ============================================================
// CUTOVER RUNBOOK TASKS TABLE
// ============================================================

export const cutoverRunbookTasks = pgTable('cutover_runbook_tasks', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  phaseId: text('phase_id').references(() => cutoverPhases.id, { onDelete: 'cascade' }),
  
  // Task Details
  taskName: text('task_name').notNull(),
  taskDescription: text('task_description'),
  taskType: text('task_type').notNull(), // technical, business, communication, validation, rollback
  
  // Scheduling
  scheduledStartTime: text('scheduled_start_time').notNull(), // ISO date-time string
  scheduledEndTime: text('scheduled_end_time').notNull(), // ISO date-time string
  estimatedDuration: integer('estimated_duration').notNull(), // in minutes
  
  // Assignment
  assignedTo: text('assigned_to').references(() => users.id, { onDelete: 'set null' }),
  backupAssignee: text('backup_assignee').references(() => users.id, { onDelete: 'set null' }),
  
  // Dependencies
  prerequisiteTasks: text('prerequisite_tasks').$type('json'), // Array of task IDs
  dependentTasks: text('dependent_tasks').$type('json'), // Array of task IDs
  
  // Status Tracking
  status: text('status').default('planned'), // planned, in_progress, completed, failed, rolled_back, cancelled, on_hold
  actualStartTime: timestamp('actual_start_time'),
  actualEndTime: timestamp('actual_end_time'),
  actualDuration: integer('actual_duration'), // in minutes
  
  // Rollback Conditions
  rollbackConditions: text('rollback_conditions').$type('json'), // Array of rollback triggers
  rollbackAction: text('rollback_action'),
  rollbackDeadline: text('rollback_deadline'), // ISO date-time string
  
  // Validation
  validationCriteria: text('validation_criteria').$type('json'), // Array of validation checks
  validationResults: text('validation_results').$type('json'), // Array of validation results
  
  // Communication
  notificationRecipients: text('notification_recipients').$type('json'), // Array of user IDs
  escalationContacts: text('escalation_contacts').$type('json'), // Array of contact details
  
  // Documentation
  taskDocumentation: text('task_documentation').$type('json'), // Array of document references
  screenshots: text('screenshots').$type('json'), // Array of screenshot references
  
  // Risk Assessment
  riskLevel: text('risk_level').default('medium'), // low, medium, high, critical
  riskMitigation: text('risk_mitigation'),
  
  // Approval
  approvedBy: text('approved_by').references(() => users.id, { onDelete: 'set null' }),
  approvedAt: timestamp('approved_at'),
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  indexes: [
    {
      name: 'idx_cutover_runbook_tasks_project',
      columns: [table.projectId],
    },
    {
      name: 'idx_cutover_runbook_tasks_phase',
      columns: [table.phaseId],
    },
    {
      name: 'idx_cutover_runbook_tasks_status',
      columns: [table.status],
    },
    {
      name: 'idx_cutover_runbook_tasks_assigned',
      columns: [table.assignedTo],
    },
    {
      name: 'idx_cutover_runbook_tasks_schedule',
      columns: [table.scheduledStartTime, table.scheduledEndTime],
    },
    {
      name: 'idx_cutover_runbook_tasks_type',
      columns: [table.taskType],
    },
    {
      name: 'idx_cutover_runbook_tasks_risk',
      columns: [table.riskLevel],
    },
  ],
}));

// ============================================================
// ACCEPTANCE SIGN-OFFS TABLE
// ============================================================

export const acceptanceSignoffs = pgTable('acceptance_signoffs', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  vendorContractId: text('vendor_contract_id').references(() => vendorContracts.id, { onDelete: 'cascade' }),
  paymentMilestoneId: text('payment_milestone_id').references(() => vendorPaymentMilestones.id, { onDelete: 'cascade' }),
  phaseId: text('phase_id').references(() => cutoverPhases.id, { onDelete: 'cascade' }),
  
  // Sign-off Details
  signoffTitle: text('signoff_title').notNull(),
  signoffDescription: text('signoff_description'),
  signoffType: text('signoff_type').notNull(), // milestone_acceptance, phase_completion, project_acceptance, user_acceptance
  
  // Acceptance Criteria
  acceptanceCriteria: text('acceptance_criteria').$type('json').notNull(), // Array of acceptance criteria
  validationResults: text('validation_results').$type('json'), // Array of validation results
  
  // Status Tracking
  status: text('status').default('pending'), // pending, in_review, approved, rejected, requires_changes
  submittedAt: timestamp('submitted_at'),
  reviewedAt: timestamp('reviewed_at'),
  approvedAt: timestamp('approved_at'),
  
  // Documents
  acceptanceDocuments: text('acceptance_documents').$type('json'), // Array of document references
  supportingEvidence: text('supporting_evidence').$type('json'), // Array of evidence files
  
  // Signatories
  submittedBy: text('submitted_by').references(() => users.id, { onDelete: 'set null' }),
  reviewedBy: text('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
  approvedBy: text('approved_by').references(() => users.id, { onDelete: 'set null' }),
  
  // Approval Workflow
  approvalWorkflow: text('approval_workflow').$type('json'), // Array of approval steps
  currentApprovalStep: integer('current_approval_step').default(0),
  
  // Conditions & Expiry
  conditions: text('conditions'), // Special conditions for acceptance
  expiryDate: timestamp('expiry_date'),
  
  // Feedback
  feedback: text('feedback'), // Reviewer feedback
  changeRequests: text('change_requests').$type('json'), // Array of change requests
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  indexes: [
    {
      name: 'idx_acceptance_signoffs_project',
      columns: [table.projectId],
    },
    {
      name: 'idx_acceptance_signoffs_vendor_contract',
      columns: [table.vendorContractId],
    },
    {
      name: 'idx_acceptance_signoffs_payment_milestone',
      columns: [table.paymentMilestoneId],
    },
    {
      name: 'idx_acceptance_signoffs_phase',
      columns: [table.phaseId],
    },
    {
      name: 'idx_acceptance_signoffs_status',
      columns: [table.status],
    },
    {
      name: 'idx_acceptance_signoffs_type',
      columns: [table.signoffType],
    },
    {
      name: 'idx_acceptance_signoffs_submitted',
      columns: [table.submittedBy],
    },
    {
      name: 'idx_acceptance_signoffs_approved',
      columns: [table.approvedBy],
    },
    {
      name: 'idx_acceptance_signoffs_dates',
      columns: [table.submittedAt, table.approvedAt],
    },
  ],
}));

// ============================================================
// CUTOVER INCIDENTS TABLE
// ============================================================

export const cutoverIncidents = pgTable('cutover_incidents', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  phaseId: text('phase_id').references(() => cutoverPhases.id, { onDelete: 'cascade' }),
  taskId: text('task_id').references(() => cutoverRunbookTasks.id, { onDelete: 'cascade' }),
  
  // Incident Details
  incidentTitle: text('incident_title').notNull(),
  incidentDescription: text('incident_description').notNull(),
  incidentType: text('incident_type').notNull(), // technical, business, communication, security, performance
  
  // Severity & Impact
  severity: text('severity').notNull(), // low, medium, high, critical
  impact: text('impact').notNull(), // low, medium, high, critical
  priority: text('priority').notNull(), // low, medium, high, urgent
  
  // Timeline
  detectedAt: timestamp('detected_at').notNull(),
  resolvedAt: timestamp('resolved_at'),
  responseTime: integer('response_time'), // in minutes
  resolutionTime: integer('resolution_time'), // in minutes
  
  // Status
  status: text('status').default('open'), // open, investigating, resolved, closed, escalated
  
  // Categorization
  category: text('category'), // system_failure, data_issue, performance_issue, security_breach, user_error
  rootCause: text('root_cause'),
  
  // Impact Assessment
  affectedSystems: text('affected_systems').$type('json'), // Array of affected systems
  businessImpact: text('business_impact'),
  userImpact: text('user_impact'),
  
  // Resolution
  resolution: text('resolution'),
  resolutionActions: text('resolution_actions').$type('json'), // Array of resolution actions
  preventiveMeasures: text('preventive_measures'),
  
  // Escalation
  escalated: boolean('escalated').default(false),
  escalationLevel: integer('escalation_level').default(0),
  escalationContacts: text('escalation_contacts').$type('json'),
  
  // Communication
  notifiedUsers: text('notified_users').$type('json'), // Array of user IDs
  communicationLog: text('communication_log').$type('json'), // Array of communication entries
  
  // Documentation
  incidentEvidence: text('incident_evidence').$type('json'), // Array of evidence files
  screenshots: text('screenshots').$type('json'), // Array of screenshots
  logs: text('logs').$type('json'), // Array of log references
  
  // Assignment
  assignedTo: text('assigned_to').references(() => users.id, { onDelete: 'set null' }),
  resolvedBy: text('resolved_by').references(() => users.id, { onDelete: 'set null' }),
  
  // Follow-up
  followUpRequired: boolean('follow_up_required').default(false),
  followUpDate: timestamp('follow_up_date'),
  followUpActions: text('follow_up_actions').$type('json'),
  
  // Metadata
  createdBy: text('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  indexes: [
    {
      name: 'idx_cutover_incidents_project',
      columns: [table.projectId],
    },
    {
      name: 'idx_cutover_incidents_phase',
      columns: [table.phaseId],
    },
    {
      name: 'idx_cutover_incidents_task',
      columns: [table.taskId],
    },
    {
      name: 'idx_cutover_incidents_status',
      columns: [table.status],
    },
    {
      name: 'idx_cutover_incidents_severity',
      columns: [table.severity],
    },
    {
      name: 'idx_cutover_incidents_type',
      columns: [table.incidentType],
    },
    {
      name: 'idx_cutover_incidents_detected',
      columns: [table.detectedAt],
    },
    {
      name: 'idx_cutover_incidents_assigned',
      columns: [table.assignedTo],
    },
  ],
}));

// ============================================================
// RELATIONSHIPS
// ============================================================

export const cutoverPhasesRelations = relations(cutoverPhases, ({ one, many }) => ({
  project: one(projects, {
    fields: [cutoverPhases.projectId],
    references: [projects.id],
  }),
  phaseLead: one(users, {
    fields: [cutoverPhases.phaseLead],
    references: [users.id],
  }),
  approvedByUser: one(users, {
    fields: [cutoverPhases.approvedBy],
    references: [users.id],
  }),
  readinessChecklists: many(readinessChecklists, {
    relationName: 'phase_readiness_checklists',
  }),
  runbookTasks: many(cutoverRunbookTasks, {
    relationName: 'phase_runbook_tasks',
  }),
  acceptanceSignoffs: many(acceptanceSignoffs, {
    relationName: 'phase_acceptance_signoffs',
  }),
  incidents: many(cutoverIncidents, {
    relationName: 'phase_incidents',
  }),
}));

export const readinessChecklistsRelations = relations(readinessChecklists, ({ one, many }) => ({
  project: one(projects, {
    fields: [readinessChecklists.projectId],
    references: [projects.id],
  }),
  phase: one(cutoverPhases, {
    fields: [readinessChecklists.phaseId],
    references: [cutoverPhases.id],
  }),
  approvedByUser: one(users, {
    fields: [readinessChecklists.approvedBy],
    references: [users.id],
  }),
}));

export const cutoverRunbookTasksRelations = relations(cutoverRunbookTasks, ({ one, many }) => ({
  project: one(projects, {
    fields: [cutoverRunbookTasks.projectId],
    references: [projects.id],
  }),
  phase: one(cutoverPhases, {
    fields: [cutoverRunbookTasks.phaseId],
    references: [cutoverPhases.id],
  }),
  assignedToUser: one(users, {
    fields: [cutoverRunbookTasks.assignedTo],
    references: [users.id],
  }),
  backupAssigneeUser: one(users, {
    fields: [cutoverRunbookTasks.backupAssignee],
    references: [users.id],
  }),
  approvedByUser: one(users, {
    fields: [cutoverRunbookTasks.approvedBy],
    references: [users.id],
  }),
  incidents: many(cutoverIncidents, {
    relationName: 'task_incidents',
  }),
}));

export const acceptanceSignoffsRelations = relations(acceptanceSignoffs, ({ one, many }) => ({
  project: one(projects, {
    fields: [acceptanceSignoffs.projectId],
    references: [projects.id],
  }),
  vendorContract: one(vendorContracts, {
    fields: [acceptanceSignoffs.vendorContractId],
    references: [vendorContracts.id],
  }),
  paymentMilestone: one(vendorPaymentMilestones, {
    fields: [acceptanceSignoffs.paymentMilestoneId],
    references: [vendorPaymentMilestones.id],
  }),
  phase: one(cutoverPhases, {
    fields: [acceptanceSignoffs.phaseId],
    references: [cutoverPhases.id],
  }),
  submittedByUser: one(users, {
    fields: [acceptanceSignoffs.submittedBy],
    references: [users.id],
  }),
  reviewedByUser: one(users, {
    fields: [acceptanceSignoffs.reviewedBy],
    references: [users.id],
  }),
  approvedByUser: one(users, {
    fields: [acceptanceSignoffs.approvedBy],
    references: [users.id],
  }),
}));

export const cutoverIncidentsRelations = relations(cutoverIncidents, ({ one, many }) => ({
  project: one(projects, {
    fields: [cutoverIncidents.projectId],
    references: [projects.id],
  }),
  phase: one(cutoverPhases, {
    fields: [cutoverIncidents.phaseId],
    references: [cutoverPhases.id],
  }),
  task: one(cutoverRunbookTasks, {
    fields: [cutoverIncidents.taskId],
    references: [cutoverRunbookTasks.id],
  }),
  assignedToUser: one(users, {
    fields: [cutoverIncidents.assignedTo],
    references: [users.id],
  }),
  resolvedByUser: one(users, {
    fields: [cutoverIncidents.resolvedBy],
    references: [users.id],
  }),
  createdByUser: one(users, {
    fields: [cutoverIncidents.createdBy],
    references: [users.id],
  }),
}));

// ============================================================
// TYPE DEFINITIONS
// ============================================================

export type CutoverPhase = typeof cutoverPhases.$inferSelect;
export type ReadinessChecklist = typeof readinessChecklists.$inferSelect;
export type CutoverRunbookTask = typeof cutoverRunbookTasks.$inferSelect;
export type AcceptanceSignoff = typeof acceptanceSignoffs.$inferSelect;
export type CutoverIncident = typeof cutoverIncidents.$inferSelect;

export type CutoverPhaseWithRelations = CutoverPhase & {
  project?: any;
  phaseLead?: any;
  approvedByUser?: any;
  readinessChecklists?: ReadinessChecklist[];
  runbookTasks?: (CutoverRunbookTask & { 
    assignedToUser?: any; 
    backupAssigneeUser?: any;
    incidents?: CutoverIncident[];
  })[];
  acceptanceSignoffs?: AcceptanceSignoff[];
  incidents?: CutoverIncident[];
};

export type CreateCutoverPhaseInput = Omit<CutoverPhase, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateCutoverPhaseInput = Partial<CreateCutoverPhaseInput>;

export type CreateReadinessChecklistInput = Omit<ReadinessChecklist, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateReadinessChecklistInput = Partial<CreateReadinessChecklistInput>;

export type CreateCutoverRunbookTaskInput = Omit<CutoverRunbookTask, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateCutoverRunbookTaskInput = Partial<CreateCutoverRunbookTaskInput>;

export type CreateAcceptanceSignoffInput = Omit<AcceptanceSignoff, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateAcceptanceSignoffInput = Partial<CreateAcceptanceSignoffInput>;

export type CreateCutoverIncidentInput = Omit<CutoverIncident, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateCutoverIncidentInput = Partial<CreateCutoverIncidentInput>;

// ============================================================
// CONSTANTS
// ============================================================

export const PHASE_TYPES = {
  PLANNING: 'planning',
  PREPARATION: 'preparation',
  EXECUTION: 'execution',
  VALIDATION: 'validation',
  POST_CUTOVER: 'post_cutover',
} as const;

export const PHASE_STATUSES = {
  PLANNED: 'planned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
  ROLLED_BACK: 'rolled_back',
  CANCELLED: 'cancelled',
} as const;

export const CHECKLIST_TYPES = {
  SYSTEM: 'system',
  OPERATION: 'operation',
  USER: 'user',
  SECURITY: 'security',
  PERFORMANCE: 'performance',
} as const;

export const TASK_TYPES = {
  TECHNICAL: 'technical',
  BUSINESS: 'business',
  COMMUNICATION: 'communication',
  VALIDATION: 'validation',
  ROLLBACK: 'rollback',
} as const;

export const TASK_STATUSES = {
  PLANNED: 'planned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
  ROLLED_BACK: 'rolled_back',
  CANCELLED: 'cancelled',
  ON_HOLD: 'on_hold',
} as const;

export const SIGNOFF_TYPES = {
  MILESTONE_ACCEPTANCE: 'milestone_acceptance',
  PHASE_COMPLETION: 'phase_completion',
  PROJECT_ACCEPTANCE: 'project_acceptance',
  USER_ACCEPTANCE: 'user_acceptance',
} as const;

export const SIGNOFF_STATUSES = {
  PENDING: 'pending',
  IN_REVIEW: 'in_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  REQUIRES_CHANGES: 'requires_changes',
} as const;

export const INCIDENT_TYPES = {
  TECHNICAL: 'technical',
  BUSINESS: 'business',
  COMMUNICATION: 'communication',
  SECURITY: 'security',
  PERFORMANCE: 'performance',
} as const;

export const INCIDENT_SEVERITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export const INCIDENT_STATUSES = {
  OPEN: 'open',
  INVESTIGATING: 'investigating',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  ESCALATED: 'escalated',
} as const;

export const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

// ============================================================
// CALCULATION HELPERS
// ============================================================

export const calculatePhaseProgress = (phase: CutoverPhaseWithRelations): number => {
  if (!phase.runbookTasks || phase.runbookTasks.length === 0) return 0;
  
  const completedTasks = phase.runbookTasks.filter(task => task.status === 'completed').length;
  return (completedTasks / phase.runbookTasks.length) * 100;
};

export const calculateChecklistProgress = (checklist: ReadinessChecklist): number => {
  if (checklist.totalItems === 0) return 0;
  return (checklist.completedItems / checklist.totalItems) * 100;
};

export const calculateOverallReadiness = (checklists: ReadinessChecklist[]): number => {
  if (checklists.length === 0) return 0;
  const totalProgress = checklists.reduce((sum, checklist) => sum + calculateChecklistProgress(checklist), 0);
  return totalProgress / checklists.length;
};

export const calculateRunbookProgress = (tasks: CutoverRunbookTask[]): number => {
  if (tasks.length === 0) return 0;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  return (completedTasks / tasks.length) * 100;
};

export const calculateIncidentImpact = (incidents: CutoverIncident[]): {
  totalIncidents: number;
  criticalIncidents: number;
  highIncidents: number;
  mediumIncidents: number;
  lowIncidents: number;
  averageResolutionTime: number;
  openIncidents: number;
} => {
  const totalIncidents = incidents.length;
  const criticalIncidents = incidents.filter(i => i.severity === 'critical').length;
  const highIncidents = incidents.filter(i => i.severity === 'high').length;
  const mediumIncidents = incidents.filter(i => i.severity === 'medium').length;
  const lowIncidents = incidents.filter(i => i.severity === 'low').length;
  const openIncidents = incidents.filter(i => i.status === 'open' || i.status === 'investigating').length;
  
  const resolvedIncidents = incidents.filter(i => i.resolutionTime);
  const averageResolutionTime = resolvedIncidents.length > 0 
    ? resolvedIncidents.reduce((sum, i) => sum + (i.resolutionTime || 0), 0) / resolvedIncidents.length 
    : 0;

  return {
    totalIncidents,
    criticalIncidents,
    highIncidents,
    mediumIncidents,
    lowIncidents,
    averageResolutionTime,
    openIncidents
  };
};

export const assessRollbackRisk = (phase: CutoverPhaseWithRelations): {
  rollbackRisk: 'low' | 'medium' | 'high' | 'critical';
  rollbackTriggers: string[];
  estimatedRollbackTime: number;
} => {
  const failedTasks = phase.runbookTasks?.filter(task => task.status === 'failed') || [];
  const criticalTasks = phase.runbookTasks?.filter(task => task.riskLevel === 'critical') || [];
  const incidents = phase.incidents?.filter(i => i.severity === 'critical' || i.severity === 'high') || [];
  
  const rollbackTriggers = [
    ...failedTasks.map(task => `Failed task: ${task.taskName}`),
    ...incidents.map(incident => `Critical incident: ${incident.incidentTitle}`),
    ...(phase.rollbackConditions || [])
  ];

  let rollbackRisk: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (failedTasks.length > 0 || incidents.length > 0) rollbackRisk = 'medium';
  if (criticalTasks.some(task => task.status === 'failed') || incidents.length > 2) rollbackRisk = 'high';
  if (criticalTasks.filter(task => task.status === 'failed').length > 1 || incidents.length > 5) rollbackRisk = 'critical';

  const estimatedRollbackTime = phase.estimatedDuration * 1.5; // 150% of original duration

  return {
    rollbackRisk,
    rollbackTriggers,
    estimatedRollbackTime
  };
};
