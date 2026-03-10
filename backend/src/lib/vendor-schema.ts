import { pgTable, text, timestamp, boolean, integer, decimal, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users, projects, tasks } from './schema';

// ============================================================
// VENDOR CONTRACTS TABLE
// ============================================================

export const vendorContracts = pgTable('vendor_contracts', {
  id: text('id').primaryKey().defaultRandom(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  vendorId: text('vendor_id').references(() => users.id, { onDelete: 'set null' }), // Vendor as subcontractor
  
  // Contract Details
  contractNumber: text('contract_number').notNull(),
  contractName: text('contract_name').notNull(),
  description: text('description'),
  contractType: text('contract_type').notNull(), // software, hardware, consulting, materials, services
  
  // Financial Information
  totalValue: decimal('total_value', { precision: 15, scale: 2 }).notNull(),
  currency: text('currency').default('THB'),
  paymentTerms: text('payment_terms').notNull(), // e.g., 'net_30', 'net_60', 'milestone_based'
  
  // Timeline
  startDate: text('start_date').notNull(), // ISO date string
  endDate: text('end_date').notNull(), // ISO date string
  effectiveDate: text('effective_date').notNull(), // When contract becomes active
  
  // Status Tracking
  status: text('status').default('draft'), // draft, active, completed, terminated, suspended
  riskLevel: text('risk_level').default('low'), // low, medium, high, critical
  
  // Contract Documents
  contractFile: text('contract_file'), // Path to contract document
  attachments: text('attachments').$type('json'), // Array of file references
  
  // Approval Information
  approvedBy: text('approved_by').references(() => users.id, { onDelete: 'set null' }),
  approvedAt: timestamp('approved_at'),
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  indexes: [
    {
      name: 'idx_vendor_contracts_project',
      columns: [table.projectId],
    },
    {
      name: 'idx_vendor_contracts_vendor',
      columns: [table.vendorId],
    },
    {
      name: 'idx_vendor_contracts_status',
      columns: [table.status],
    },
    {
      name: 'idx_vendor_contracts_type',
      columns: [table.contractType],
    },
    {
      name: 'idx_vendor_contracts_dates',
      columns: [table.startDate, table.endDate],
    },
    {
      name: 'idx_vendor_contracts_risk',
      columns: [table.riskLevel],
    },
  ],
}));

// ============================================================
// VENDOR PAYMENT MILESTONES TABLE
// ============================================================

export const vendorPaymentMilestones = pgTable('vendor_payment_milestones', {
  id: text('id').primaryKey().defaultRandom(),
  contractId: text('contract_id').notNull().references(() => vendorContracts.id, { onDelete: 'cascade' }),
  
  // Milestone Details
  title: text('title').notNull(),
  description: text('description'),
  milestoneType: text('milestone_type').notNull(), // percentage, fixed_amount, deliverable_based
  
  // Payment Information
  paymentAmount: decimal('payment_amount', { precision: 15, scale: 2 }).notNull(),
  paymentPercentage: decimal('payment_percentage', { precision: 5, scale: 2 }).notNull(),
  currency: text('currency').default('THB'),
  
  // Payment Terms
  dueDate: text('due_date').notNull(), // ISO date string
  paymentTerms: text('payment_terms').notNull(), // e.g., 'on_completion', 'on_approval', 'fixed_date'
  gracePeriod: integer('grace_period').default(0), // Days after due date
  
  // Status Tracking
  status: text('status').default('pending'), // pending, due, paid, overdue, cancelled
  paidDate: timestamp('paid_date'),
  paidAmount: decimal('paid_amount', { precision: 15, scale: 2 }).default('0'),
  
  // Dependencies
  linkedProjectMilestones: text('linked_project_milestones').$type('json'), // Array of project milestone IDs
  linkedProjectTasks: text('linked_project_tasks').$type('json'), // Array of project task IDs
  
  // Approval Information
  approvedBy: text('approved_by').references(() => users.id, { onDelete: 'set null' }),
  approvedAt: timestamp('approved_at'),
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  indexes: [
    {
      name: 'idx_vendor_payment_milestones_contract',
      columns: [table.contractId],
    },
    {
      name: 'idx_vendor_payment_milestones_status',
      columns: [table.status],
    },
    {
      name: 'idx_vendor_payment_milestones_due_date',
      columns: [table.dueDate],
    },
    {
      name: 'idx_vendor_payment_milestones_type',
      columns: [table.milestoneType],
    },
  ],
}));

// ============================================================
// VENDOR DELIVERABLES TABLE
// ============================================================

export const vendorDeliverables = pgTable('vendor_deliverables', {
  id: text('id').primaryKey().defaultRandom(),
  contractId: text('contract_id').notNull().references(() => vendorContracts.id, { onDelete: 'cascade' }),
  paymentMilestoneId: text('payment_milestone_id').references(() => vendorPaymentMilestones.id, { onDelete: 'set null' }),
  
  // Deliverable Details
  title: text('title').notNull(),
  description: text('description'),
  deliverableType: text('deliverable_type').notNull(), // software, hardware, documentation, training, inspection, prototype
  
  // Software Implementation Tracking
  softwareType: text('software_type'), // api, frontend, backend, database, integration, testing, uat
  completionPercentage: decimal('completion_percentage', { precision: 5, scale: 2 }).default('0'),
  codeRepository: text('code_repository'), // Git repo URL
  testResults: text('test_results').$type('json'), // Test results and coverage
  deploymentStatus: text('deployment_status').default('not_deployed'), // not_deployed, deployed, tested, accepted
  
  // Hardware/Physical Goods Tracking
  hardwareType: text('hardware_type'), // equipment, prototype, materials, components
  procurementStatus: text('procurement_status').default('not_ordered'), // not_ordered, ordered, received, assembled, inspected, accepted
  trackingNumber: text('tracking_number'), // Shipping tracking number
  inspectionStatus: text('inspection_status').default('pending'), // pending, passed, failed, requires_rework
  
  // Quality Assurance
  qualityStatus: text('quality_status').default('pending'), // pending, in_review, approved, rejected
  qaApprover: text('qa_approver').references(() => users.id, { onDelete: 'set null' }),
  qaDate: timestamp('qa_date'),
  qaNotes: text('qa_notes'),
  
  // Timeline Tracking
  expectedDate: text('expected_date').notNull(), // Expected delivery date
  actualDate: timestamp('actual_date'),
  delayReason: text('delay_reason'),
  
  // Status Tracking
  status: text('status').default('pending'), // pending, in_progress, completed, delayed, cancelled, accepted, rejected
  blocked: boolean('blocked').default(false),
  blockedReason: text('blocked_reason'),
  
  // Dependencies
  linkedProjectTasks: text('linked_project_tasks').$type('json'), // Array of project task IDs this deliverable enables
  prerequisites: text('prerequisites').$type('json'), // Array of deliverable IDs that must be completed first
  
  // Risk Assessment
  riskLevel: text('risk_level').default('low'), // low, medium, high, critical
  riskFactors: text('risk_factors').$type('json'), // Array of identified risk factors
  
  // Acceptance
  acceptedBy: text('accepted_by').references(() => users.id, { onDelete: 'set null' }),
  acceptedAt: timestamp('accepted_at'),
  acceptanceNotes: text('acceptance_notes'),
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  indexes: [
    {
      name: 'idx_vendor_deliverables_contract',
      columns: [table.contractId],
    },
    {
      name: 'idx_vendor_deliverables_milestone',
      columns: [table.paymentMilestoneId],
    },
    {
      name: 'idx_vendor_deliverables_status',
      columns: [table.status],
    },
    {
      name: 'idx_vendor_deliverables_type',
      columns: [table.deliverableType],
    },
    {
      name: 'idx_vendor_deliverables_expected_date',
      columns: [table.expectedDate],
    },
    {
      name: 'idx_vendor_deliverables_risk',
      columns: [table.riskLevel],
    },
    {
      name: 'idx_vendor_deliverables_blocked',
      columns: [table.blocked],
    },
  ],
}));

// ============================================================
// VENDOR RISK ASSESSMENTS TABLE
// ============================================================

export const vendorRiskAssessments = pgTable('vendor_risk_assessments', {
  id: text('id').primaryKey().defaultRandom(),
  contractId: text('contract_id').notNull().references(() => vendorContracts.id, { onDelete: 'cascade' }),
  deliverableId: text('deliverable_id').references(() => vendorDeliverables.id, { onDelete: 'cascade' }),
  
  // Risk Details
  riskCategory: text('risk_category').notNull(), // timeline, quality, financial, technical, operational
  riskTitle: text('risk_title').notNull(),
  riskDescription: text('risk_description').notNull(),
  probability: text('probability').notNull(), // low, medium, high, critical
  impact: text('impact').notNull(), // low, medium, high, critical
  
  // Risk Assessment
  riskScore: decimal('risk_score', { precision: 3, scale: 2 }).notNull(), // Probability x Impact score
  riskLevel: text('risk_level').notNull(), // low, medium, high, critical
  
  // Impact Analysis
  timelineImpact: text('timeline_impact'), // days, weeks, months, critical
  budgetImpact: decimal('budget_impact', { precision: 15, scale: 2 }).default('0'),
  qualityImpact: text('quality_impact'), // low, medium, high, critical
  
  // Mitigation
  mitigationPlan: text('mitigation_plan'),
  contingencyPlan: text('contingency_plan'),
  owner: text('owner').references(() => users.id, { onDelete: 'set null' }),
  
  // Status
  status: text('status').default('open'), // open, mitigated, accepted, closed
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  indexes: [
    {
      name: 'idx_vendor_risk_assessments_contract',
      columns: [table.contractId],
    },
    {
      name: 'idx_vendor_risk_assessments_deliverable',
      columns: [table.deliverableId],
    },
    {
      name: 'idx_vendor_risk_assessments_category',
      columns: [table.riskCategory],
    },
    {
      name: 'idx_vendor_risk_assessments_level',
      columns: [table.riskLevel],
    },
    {
      name: 'idx_vendor_risk_assessments_status',
      columns: [table.status],
    },
  ],
}));

// ============================================================
// VENDOR COMMUNICATION LOG TABLE
// ============================================================

export const vendorCommunicationLog = pgTable('vendor_communication_log', {
  id: text('id').primaryKey().defaultRandom(),
  contractId: text('contract_id').notNull().references(() => vendorContracts.id, { onDelete: 'cascade' }),
  deliverableId: text('deliverable_id').references(() => vendorDeliverables.id, { onDelete: 'set null' }),
  
  // Communication Details
  communicationType: text('communication_type').notNull(), // meeting, email, phone, report, issue, escalation
  subject: text('subject').notNull(),
  content: text('content').notNull(),
  
  // Participants
  attendees: text('attendees').$type('json'), // Array of user IDs
  vendorAttendees: text('vendor_attendees').$type('json'), // Array of vendor contact names
  
  // Timeline
  communicationDate: timestamp('communication_date').notNull(),
  followUpDate: timestamp('follow_up_date'),
  
  // Status
  status: text('status').default('open'), // open, resolved, escalated, closed
  priority: text('priority').default('medium'), // low, medium, high, urgent
  
  // Attachments
  attachments: text('attachments').$type('json'), // Array of file references
  
  // Metadata
  createdBy: text('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  indexes: [
    {
      name: 'idx_vendor_communication_log_contract',
      columns: [table.contractId],
    },
    {
      name: 'idx_vendor_communication_log_deliverable',
      columns: [table.deliverableId],
    },
    {
      name: 'idx_vendor_communication_log_type',
      columns: [table.communicationType],
    },
    {
      name: 'idx_vendor_communication_log_date',
      columns: [table.communicationDate],
    },
    {
      name: 'idx_vendor_communication_log_status',
      columns: [table.status],
    },
  ],
}));

// ============================================================
// RELATIONSHIPS
// ============================================================

export const vendorContractsRelations = relations(vendorContracts, ({ one, many }) => ({
  project: one(projects, {
    fields: [vendorContracts.projectId],
    references: [projects.id],
  }),
  vendor: one(users, {
    fields: [vendorContracts.vendorId],
    references: [users.id],
  }),
  approvedByUser: one(users, {
    fields: [vendorContracts.approvedBy],
    references: [users.id],
  }),
  paymentMilestones: many(vendorPaymentMilestones, {
    relationName: 'contract_payment_milestones',
  }),
  deliverables: many(vendorDeliverables, {
    relationName: 'contract_deliverables',
  }),
  riskAssessments: many(vendorRiskAssessments, {
    relationName: 'contract_risk_assessments',
  }),
  communications: many(vendorCommunicationLog, {
    relationName: 'contract_communications',
  }),
}));

export const vendorPaymentMilestonesRelations = relations(vendorPaymentMilestones, ({ one, many }) => ({
  contract: one(vendorContracts, {
    fields: [vendorPaymentMilestones.contractId],
    references: [vendorContracts.id],
  }),
  approvedByUser: one(users, {
    fields: [vendorPaymentMilestones.approvedBy],
    references: [users.id],
  }),
  deliverables: many(vendorDeliverables, {
    relationName: 'milestone_deliverables',
  }),
}));

export const vendorDeliverablesRelations = relations(vendorDeliverables, ({ one, many }) => ({
  contract: one(vendorContracts, {
    fields: [vendorDeliverables.contractId],
    references: [vendorContracts.id],
  }),
  paymentMilestone: one(vendorPaymentMilestones, {
    fields: [vendorDeliverables.paymentMilestoneId],
    references: [vendorPaymentMilestones.id],
  }),
  qaApprover: one(users, {
    fields: [vendorDeliverables.qaApprover],
    references: [users.id],
  }),
  acceptedByUser: one(users, {
    fields: [vendorDeliverables.acceptedBy],
    references: [users.id],
  }),
  riskAssessments: many(vendorRiskAssessments, {
    relationName: 'deliverable_risk_assessments',
  }),
  communications: many(vendorCommunicationLog, {
    relationName: 'deliverable_communications',
  }),
}));

export const vendorRiskAssessmentsRelations = relations(vendorRiskAssessments, ({ one, many }) => ({
  contract: one(vendorContracts, {
    fields: [vendorRiskAssessments.contractId],
    references: [vendorContracts.id],
  }),
  deliverable: one(vendorDeliverables, {
    fields: [vendorRiskAssessments.deliverableId],
    references: [vendorDeliverables.id],
  }),
  owner: one(users, {
    fields: [vendorRiskAssessments.owner],
    references: [users.id],
  }),
}));

export const vendorCommunicationLogRelations = relations(vendorCommunicationLog, ({ one, many }) => ({
  contract: one(vendorContracts, {
    fields: [vendorCommunicationLog.contractId],
    references: [vendorContracts.id],
  }),
  deliverable: one(vendorDeliverables, {
    fields: [vendorCommunicationLog.deliverableId],
    references: [vendorDeliverables.id],
  }),
  createdByUser: one(users, {
    fields: [vendorCommunicationLog.createdBy],
    references: [users.id],
  }),
}));

// ============================================================
// TYPE DEFINITIONS
// ============================================================

export type VendorContract = typeof vendorContracts.$inferSelect;
export type VendorPaymentMilestone = typeof vendorPaymentMilestones.$inferSelect;
export type VendorDeliverable = typeof vendorDeliverables.$inferSelect;
export type VendorRiskAssessment = typeof vendorRiskAssessments.$inferSelect;
export type VendorCommunicationLog = typeof vendorCommunicationLog.$inferSelect;

export type VendorContractWithRelations = VendorContract & {
  project?: any;
  vendor?: any;
  approvedByUser?: any;
  paymentMilestones?: (VendorPaymentMilestone & { deliverables: VendorDeliverable[] })[];
  deliverables?: VendorDeliverable[];
  riskAssessments?: VendorRiskAssessment[];
  communications?: VendorCommunicationLog[];
};

export type CreateVendorContractInput = Omit<VendorContract, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateVendorContractInput = Partial<CreateVendorContractInput>;

export type CreateVendorPaymentMilestoneInput = Omit<VendorPaymentMilestone, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateVendorPaymentMilestoneInput = Partial<CreateVendorPaymentMilestoneInput>;

export type CreateVendorDeliverableInput = Omit<VendorDeliverable, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateVendorDeliverableInput = Partial<CreateVendorDeliverableInput>;

export type CreateVendorRiskAssessmentInput = Omit<VendorRiskAssessment, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateVendorRiskAssessmentInput = Partial<CreateVendorRiskAssessmentInput>;

export type CreateVendorCommunicationLogInput = Omit<VendorCommunicationLog, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateVendorCommunicationLogInput = Partial<CreateVendorCommunicationLogInput>;

// ============================================================
// CONSTANTS
// ============================================================

export const CONTRACT_TYPES = {
  SOFTWARE: 'software',
  HARDWARE: 'hardware',
  CONSULTING: 'consulting',
  MATERIALS: 'materials',
  SERVICES: 'services',
} as const;

export const CONTRACT_STATUSES = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  TERMINATED: 'terminated',
  SUSPENDED: 'suspended',
} as const;

export const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export const PAYMENT_MILESTONE_TYPES = {
  PERCENTAGE: 'percentage',
  FIXED_AMOUNT: 'fixed_amount',
  DELIVERABLE_BASED: 'deliverable_based',
} as const;

export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  DUE: 'due',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
} as const;

export const DELIVERABLE_TYPES = {
  SOFTWARE: 'software',
  HARDWARE: 'hardware',
  DOCUMENTATION: 'documentation',
  TRAINING: 'training',
  INSPECTION: 'inspection',
  PROTOTYPE: 'prototype',
} as const;

export const SOFTWARE_TYPES = {
  API: 'api',
  FRONTEND: 'frontend',
  BACKEND: 'backend',
  DATABASE: 'database',
  INTEGRATION: 'integration',
  TESTING: 'testing',
  UAT: 'uat',
} as const;

export const HARDWARE_TYPES = {
  EQUIPMENT: 'equipment',
  PROTOTYPE: 'prototype',
  MATERIALS: 'materials',
  COMPONENTS: 'components',
} as const;

export const PROCUREMENT_STATUSES = {
  NOT_ORDERED: 'not_ordered',
  ORDERED: 'ordered',
  RECEIVED: 'received',
  ASSEMBLED: 'assembled',
  INSPECTED: 'inspected',
  ACCEPTED: 'accepted',
} as const;

export const QUALITY_STATUSES = {
  PENDING: 'pending',
  IN_REVIEW: 'in_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  REQUIRES_REWORK: 'requires_rework',
} as const;

export const DELIVERABLE_STATUSES = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  DELAYED: 'delayed',
  CANCELLED: 'cancelled',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
} as const;

export const COMMUNICATION_TYPES = {
  MEETING: 'meeting',
  EMAIL: 'email',
  PHONE: 'phone',
  REPORT: 'report',
  ISSUE: 'issue',
  ESCALATION: 'escalation',
} as const;

export const RISK_CATEGORIES = {
  TIMELINE: 'timeline',
  QUALITY: 'quality',
  FINANCIAL: 'financial',
  TECHNICAL: 'technical',
  OPERATIONAL: 'operational',
} as const;

export const RISK_PROBABILITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export const RISK_IMPACTS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export const RISK_STATUSES = {
  OPEN: 'open',
  MITIGATED: 'mitigated',
  ACCEPTED: 'accepted',
  CLOSED: 'closed',
} as const;

// ============================================================
// CALCULATION HELPERS
// ============================================================

export const calculateRiskScore = (probability: string, impact: string): number => {
  const probabilityScores = { low: 1, medium: 2, high: 3, critical: 4 };
  const impactScores = { low: 1, medium: 2, high: 3, critical: 4 };
  
  return probabilityScores[probability as keyof typeof probabilityScores] * 
         impactScores[impact as keyof typeof impactScores];
};

export const calculateRiskLevel = (score: number): string => {
  if (score <= 4) return 'low';
  if (score <= 9) return 'medium';
  if (score <= 12) return 'high';
  return 'critical';
};

export const calculateContractRisk = (deliverables: VendorDeliverable[]): string => {
  const criticalDeliverables = deliverables.filter(d => d.riskLevel === 'critical' || d.status === 'delayed');
  const highRiskDeliverables = deliverables.filter(d => d.riskLevel === 'high');
  
  if (criticalDeliverables.length > 0) return 'critical';
  if (highRiskDeliverables.length > 2) return 'high';
  if (criticalDeliverables.length + highRiskDeliverables.length > 0) return 'medium';
  return 'low';
};

export const calculatePaymentProgress = (milestones: VendorPaymentMilestone[]): number => {
  const totalAmount = milestones.reduce((sum, m) => sum + Number(m.paymentAmount), 0);
  const paidAmount = milestones.reduce((sum, m) => sum + Number(m.paidAmount), 0);
  
  return totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;
};

export const calculateDeliverableProgress = (deliverable: VendorDeliverable): number => {
  return Number(deliverable.completionPercentage || 0);
};

export const calculateContractProgress = (contract: VendorContractWithRelations): number => {
  if (!contract.deliverables || contract.deliverables.length === 0) return 0;
  
  const totalProgress = contract.deliverables.reduce((sum, d) => sum + calculateDeliverableProgress(d), 0);
  return totalProgress / contract.deliverables.length;
};
