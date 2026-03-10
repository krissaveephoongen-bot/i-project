import { z } from 'zod';

// ============================================================
// PRODUCTION-READY FORM VALIDATION SCHEMAS
// ============================================================

// User Management Validation
export const userValidationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[+]?[\d\s\-\(\)]+$/, 'Invalid phone number').optional(),
  department: z.enum(['engineering', 'design', 'product', 'marketing', 'sales', 'hr', 'finance', 'operations', 'admin'], {
    errorMap: () => ({ message: 'Please select a valid department' })
  }),
  position: z.string().min(2, 'Position must be at least 2 characters').max(100, 'Position must be less than 100 characters'),
  isActive: z.boolean().default(true)
});

// Project Management Validation
export const projectValidationSchema = z.object({
  projectCode: z.string().min(3, 'Project code must be at least 3 characters').max(20, 'Project code must be less than 20 characters'),
  name: z.string().min(3, 'Project name must be at least 3 characters').max(200, 'Project name must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  clientId: z.string().uuid('Invalid client ID'),
  managerId: z.string().uuid('Invalid manager ID'),
  status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled'], {
    errorMap: () => ({ message: 'Please select a valid project status' })
  }),
  priority: z.enum(['low', 'medium', 'high', 'urgent'], {
    errorMap: () => ({ message: 'Please select a valid priority level' })
  }),
  category: z.enum(['software', 'hardware', 'consulting', 'infrastructure', 'research'], {
    errorMap: () => ({ message: 'Please select a valid project category' })
  }),
  torSummary: z.string().max(2000, 'TOR summary must be less than 2000 characters').optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),
  budget: z.number().min(0, 'Budget must be a positive number').max(999999999.99, 'Budget is too large'),
  currency: z.enum(['THB', 'USD', 'EUR', 'GBP', 'JPY'], {
    errorMap: () => ({ message: 'Please select a valid currency' })
  })
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
  message: 'End date must be after start date',
  path: ['endDate']
});

// Task Management Validation
export const taskValidationSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  parentId: z.string().uuid('Invalid parent task ID').optional(),
  milestoneId: z.string().uuid('Invalid milestone ID').optional(),
  wbsCode: z.string().min(1, 'WBS code is required').max(50, 'WBS code must be less than 50 characters'),
  title: z.string().min(3, 'Task title must be at least 3 characters').max(200, 'Task title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  assignedTo: z.string().uuid('Invalid assignee ID').optional(),
  status: z.enum(['todo', 'in_progress', 'review', 'completed', 'cancelled'], {
    errorMap: () => ({ message: 'Please select a valid task status' })
  }),
  priority: z.enum(['low', 'medium', 'high', 'urgent'], {
    errorMap: () => ({ message: 'Please select a valid priority level' })
  }),
  estimatedHours: z.number().min(0, 'Estimated hours must be positive').max(9999, 'Estimated hours must be less than 10000'),
  actualHours: z.number().min(0, 'Actual hours must be positive').max(9999, 'Actual hours must be less than 10000'),
  progress: z.number().min(0, 'Progress must be between 0 and 100').max(100, 'Progress must be between 0 and 100'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format').optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be in YYYY-MM-DD format').optional(),
  tags: z.array(z.string().max(50, 'Tag must be less than 50 characters')).max(10, 'Maximum 10 tags allowed').optional(),
  dependencies: z.array(z.string().uuid('Invalid dependency ID')).max(20, 'Maximum 20 dependencies allowed').optional()
}).refine((data) => {
  if (data.startDate && data.dueDate) {
    return new Date(data.dueDate) >= new Date(data.startDate);
  }
  return true;
}, {
  message: 'Due date must be after or equal to start date',
  path: ['dueDate']
}).refine((data) => {
  if (data.status === 'completed' && !data.actualHours) {
    return false;
  }
  return true;
}, {
  message: 'Actual hours are required for completed tasks',
  path: ['actualHours']
});

// Timesheet Validation
export const timesheetValidationSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  projectId: z.string().uuid('Invalid project ID'),
  taskId: z.string().uuid('Invalid task ID').optional(),
  workDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Work date must be in YYYY-MM-DD format'),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:MM format'),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:MM format'),
  breakTime: z.number().min(0, 'Break time must be positive').max(480, 'Break time must be less than 8 hours'),
  totalHours: z.number().min(0.1, 'Total hours must be at least 0.1').max(24, 'Total hours must be less than 24'),
  billableHours: z.number().min(0, 'Billable hours must be positive').max(24, 'Billable hours must be less than 24'),
  workType: z.enum(['development', 'design', 'testing', 'documentation', 'meeting', 'planning', 'research', 'support', 'administration', 'training'], {
    errorMap: () => ({ message: 'Please select a valid work type' })
  }),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description must be less than 500 characters'),
  hourlyRate: z.number().min(0, 'Hourly rate must be positive').max(99999.99, 'Hourly rate is too large'),
  laborCost: z.number().min(0, 'Labor cost must be positive').max(999999.99, 'Labor cost is too large')
}).refine((data) => {
  const start = data.startTime.split(':').map(Number);
  const end = data.endTime.split(':').map(Number);
  const startMinutes = start[0] * 60 + start[1];
  const endMinutes = end[0] * 60 + end[1];
  return endMinutes > startMinutes;
}, {
  message: 'End time must be after start time',
  path: ['endTime']
}).refine((data) => {
  return data.billableHours <= data.totalHours;
}, {
  message: 'Billable hours cannot exceed total hours',
  path: ['billableHours']
}).refine((data) => {
  return Math.abs(data.laborCost - (data.billableHours * data.hourlyRate)) < 0.01;
}, {
  message: 'Labor cost must equal billable hours multiplied by hourly rate',
  path: ['laborCost']
});

// Milestone Validation
export const milestoneValidationSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  title: z.string().min(3, 'Milestone title must be at least 3 characters').max(200, 'Milestone title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Target date must be in YYYY-MM-DD format'),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled'], {
    errorMap: () => ({ message: 'Please select a valid milestone status' })
  }),
  priority: z.enum(['low', 'medium', 'high', 'urgent'], {
    errorMap: () => ({ message: 'Please select a valid priority level' })
  }),
  progress: z.number().min(0, 'Progress must be between 0 and 100').max(100, 'Progress must be between 0 and 100'),
  deliverables: z.array(z.object({
    title: z.string().min(1, 'Deliverable title is required').max(200, 'Deliverable title must be less than 200 characters'),
    description: z.string().max(500, 'Description must be less than 500 characters').optional(),
    status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
    dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be in YYYY-MM-DD format').optional()
  })).max(20, 'Maximum 20 deliverables allowed').optional(),
  dependencies: z.array(z.string().uuid('Invalid dependency ID')).max(10, 'Maximum 10 dependencies allowed').optional(),
  assignedTo: z.string().uuid('Invalid assignee ID').optional()
});

// Vendor Contract Validation
export const vendorContractValidationSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  contractNumber: z.string().min(3, 'Contract number must be at least 3 characters').max(50, 'Contract number must be less than 50 characters'),
  contractName: z.string().min(3, 'Contract name must be at least 3 characters').max(200, 'Contract name must be less than 200 characters'),
  contractType: z.enum(['software', 'hardware', 'consulting', 'materials', 'services', 'maintenance', 'support'], {
    errorMap: () => ({ message: 'Please select a valid contract type' })
  }),
  vendorName: z.string().min(2, 'Vendor name must be at least 2 characters').max(200, 'Vendor name must be less than 200 characters'),
  totalValue: z.number().min(0, 'Total value must be positive').max(999999999.99, 'Total value is too large'),
  currency: z.enum(['THB', 'USD', 'EUR', 'GBP', 'JPY'], {
    errorMap: () => ({ message: 'Please select a valid currency' })
  }),
  paymentTerms: z.enum(['net_15', 'net_30', 'net_45', 'net_60', 'net_90', 'upon_completion', 'milestone_based'], {
    errorMap: () => ({ message: 'Please select valid payment terms' })
  }),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),
  status: z.enum(['draft', 'pending_approval', 'active', 'completed', 'cancelled', 'expired'], {
    errorMap: () => ({ message: 'Please select a valid contract status' })
  }),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical'], {
    errorMap: () => ({ message: 'Please select a valid risk level' })
  })
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
  message: 'End date must be after start date',
  path: ['endDate']
});

// Issue/SLA Ticket Validation
export const issueTicketValidationSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  ticketTitle: z.string().min(5, 'Ticket title must be at least 5 characters').max(200, 'Ticket title must be less than 200 characters'),
  ticketDescription: z.string().min(20, 'Description must be at least 20 characters').max(2000, 'Description must be less than 2000 characters'),
  ticketType: z.enum(['bug', 'enhancement', 'question', 'incident', 'request'], {
    errorMap: () => ({ message: 'Please select a valid ticket type' })
  }),
  ticketCategory: z.enum(['frontend', 'backend', 'database', 'infrastructure', 'security', 'performance', 'integration', 'testing', 'configuration', 'data', 'user_error', 'documentation', 'training', 'maintenance'], {
    errorMap: () => ({ message: 'Please select a valid ticket category' })
  }),
  ticketPriority: z.enum(['urgent', 'high', 'medium', 'low'], {
    errorMap: () => ({ message: 'Please select a valid priority level' })
  }),
  ticketSeverity: z.enum(['critical', 'high', 'medium', 'low'], {
    errorMap: () => ({ message: 'Please select a valid severity level' })
  }),
  clientId: z.string().uuid('Invalid client ID').optional(),
  clientName: z.string().min(2, 'Client name must be at least 2 characters').max(100, 'Client name must be less than 100 characters').optional(),
  clientEmail: z.string().email('Invalid client email').optional(),
  clientPhone: z.string().regex(/^[+]?[\d\s\-\(\)]+$/, 'Invalid client phone number').optional(),
  assignedTo: z.string().uuid('Invalid assignee ID').optional(),
  environment: z.enum(['production', 'staging', 'development', 'test', 'uat']).optional(),
  browser: z.string().max(50, 'Browser must be less than 50 characters').optional(),
  operatingSystem: z.string().max(50, 'Operating system must be less than 50 characters').optional(),
  application: z.string().max(50, 'Application must be less than 50 characters').optional(),
  version: z.string().max(20, 'Version must be less than 20 characters').optional(),
  errorCode: z.string().max(50, 'Error code must be less than 50 characters').optional(),
  businessImpact: z.enum(['high', 'medium', 'low', 'none']).optional(),
  userImpact: z.enum(['high', 'medium', 'low', 'none']).optional(),
  affectedUsers: z.number().min(0, 'Affected users must be positive').max(999999, 'Affected users count is too large').optional(),
  affectedSystems: z.array(z.string().max(100, 'System name must be less than 100 characters')).max(20, 'Maximum 20 systems allowed').optional(),
  affectedFeatures: z.array(z.string().max(100, 'Feature name must be less than 100 characters')).max(50, 'Maximum 50 features allowed').optional(),
  steps: z.array(z.string().max(200, 'Step must be less than 200 characters')).max(20, 'Maximum 20 steps allowed').optional(),
  expectedBehavior: z.string().max(1000, 'Expected behavior must be less than 1000 characters').optional(),
  actualBehavior: z.string().max(1000, 'Actual behavior must be less than 1000 characters').optional(),
  reproductionSteps: z.array(z.string().max(200, 'Step must be less than 200 characters')).max(10, 'Maximum 10 reproduction steps allowed').optional()
});

// Cutover Phase Validation
export const cutoverPhaseValidationSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  phaseName: z.string().min(3, 'Phase name must be at least 3 characters').max(100, 'Phase name must be less than 100 characters'),
  phaseType: z.enum(['planning', 'preparation', 'execution', 'validation', 'post_cutover'], {
    errorMap: () => ({ message: 'Please select a valid phase type' })
  }),
  scheduledStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/, 'Scheduled start date must be in YYYY-MM-DD HH:MM:SS format'),
  scheduledEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/, 'Scheduled end date must be in YYYY-MM-DD HH:MM:SS format'),
  status: z.enum(['planned', 'in_progress', 'completed', 'failed', 'rolled_back', 'cancelled'], {
    errorMap: () => ({ message: 'Please select a valid phase status' })
  }),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical'], {
    errorMap: () => ({ message: 'Please select a valid risk level' })
  }),
  rollbackPlan: z.string().max(2000, 'Rollback plan must be less than 2000 characters').optional(),
  rollbackConditions: z.array(z.string().max(200, 'Condition must be less than 200 characters')).max(10, 'Maximum 10 rollback conditions allowed').optional(),
  prerequisitePhases: z.array(z.string().uuid('Invalid prerequisite phase ID')).max(10, 'Maximum 10 prerequisite phases allowed').optional(),
  dependentPhases: z.array(z.string().uuid('Invalid dependent phase ID')).max(10, 'Maximum 10 dependent phases allowed').optional()
}).refine((data) => new Date(data.scheduledEndDate) > new Date(data.scheduledStartDate), {
  message: 'Scheduled end date must be after scheduled start date',
  path: ['scheduledEndDate']
});

// Readiness Checklist Validation
export const readinessChecklistValidationSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  checklistName: z.string().min(3, 'Checklist name must be at least 3 characters').max(100, 'Checklist name must be less than 100 characters'),
  checklistType: z.enum(['system', 'operation', 'user', 'security', 'performance'], {
    errorMap: () => ({ message: 'Please select a valid checklist type' })
  }),
  checklistItems: z.array(z.object({
    id: z.string().uuid(),
    title: z.string().min(3, 'Item title must be at least 3 characters').max(200, 'Item title must be less than 200 characters'),
    description: z.string().max(500, 'Description must be less than 500 characters').optional(),
    status: z.enum(['pending', 'completed', 'failed', 'blocked'], {
      errorMap: () => ({ message: 'Please select a valid item status' })
    }),
    evidence: z.array(z.string().max(200, 'Evidence must be less than 200 characters')).max(10, 'Maximum 10 evidence items allowed').optional(),
    notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
    required: z.boolean().default(true),
    priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium')
  })).min(1, 'At least one checklist item is required').max(100, 'Maximum 100 checklist items allowed'),
  totalItems: z.number().min(1, 'Total items must be at least 1').max(100, 'Total items must be less than 100')
});

// Runbook Task Validation
export const runbookTaskValidationSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  phaseId: z.string().uuid('Invalid phase ID').optional(),
  taskName: z.string().min(3, 'Task name must be at least 3 characters').max(200, 'Task name must be less than 200 characters'),
  taskType: z.enum(['technical', 'business', 'communication', 'validation', 'rollback'], {
    errorMap: () => ({ message: 'Please select a valid task type' })
  }),
  scheduledStartTime: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/, 'Scheduled start time must be in YYYY-MM-DD HH:MM:SS format'),
  scheduledEndTime: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/, 'Scheduled end time must be in YYYY-MM-DD HH:MM:SS format'),
  estimatedDuration: z.number().min(1, 'Estimated duration must be at least 1 minute').max(1440, 'Estimated duration must be less than 24 hours'),
  assignedTo: z.string().uuid('Invalid assignee ID').optional(),
  backupAssignee: z.string().uuid('Invalid backup assignee ID').optional(),
  status: z.enum(['planned', 'in_progress', 'completed', 'failed', 'rolled_back', 'cancelled'], {
    errorMap: () => ({ message: 'Please select a valid task status' })
  }),
  priority: z.enum(['low', 'medium', 'high', 'urgent'], {
    errorMap: () => ({ message: 'Please select a valid priority level' })
  }),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical'], {
    errorMap: () => ({ message: 'Please select a valid risk level' })
  }),
  rollbackConditions: z.array(z.string().max(200, 'Condition must be less than 200 characters')).max(10, 'Maximum 10 rollback conditions allowed').optional(),
  rollbackAction: z.string().max(1000, 'Rollback action must be less than 1000 characters').optional(),
  rollbackDeadline: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/, 'Rollback deadline must be in YYYY-MM-DD HH:MM:SS format').optional(),
  validationCriteria: z.array(z.string().max(200, 'Criterion must be less than 200 characters')).max(10, 'Maximum 10 validation criteria allowed').optional(),
  dependencies: z.array(z.string().uuid('Invalid dependency ID')).max(20, 'Maximum 20 dependencies allowed').optional(),
  instructions: z.string().max(2000, 'Instructions must be less than 2000 characters').optional(),
  prerequisites: z.array(z.string().max(200, 'Prerequisite must be less than 200 characters')).max(10, 'Maximum 10 prerequisites allowed').optional()
}).refine((data) => new Date(data.scheduledEndTime) > new Date(data.scheduledStartTime), {
  message: 'Scheduled end time must be after scheduled start time',
  path: ['scheduledEndTime']
}).refine((data) => {
  const start = new Date(data.scheduledStartTime);
  const end = new Date(data.scheduledEndTime);
  const duration = (end.getTime() - start.getTime()) / (1000 * 60); // Convert to minutes
  return duration <= data.estimatedDuration;
}, {
  message: 'Estimated duration must be sufficient for the scheduled time range',
  path: ['estimatedDuration']
});

// Acceptance Sign-off Validation
export const acceptanceSignoffValidationSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  phaseId: z.string().uuid('Invalid phase ID').optional(),
  vendorContractId: z.string().uuid('Invalid vendor contract ID').optional(),
  paymentMilestoneId: z.string().uuid('Invalid payment milestone ID').optional(),
  signoffTitle: z.string().min(3, 'Sign-off title must be at least 3 characters').max(200, 'Sign-off title must be less than 200 characters'),
  signoffType: z.enum(['milestone_acceptance', 'phase_completion', 'project_acceptance', 'user_acceptance'], {
    errorMap: () => ({ message: 'Please select a valid sign-off type' })
  }),
  acceptanceCriteria: z.array(z.object({
    id: z.string().uuid(),
    title: z.string().min(3, 'Criterion title must be at least 3 characters').max(200, 'Criterion title must be less than 200 characters'),
    description: z.string().max(500, 'Description must be less than 500 characters').optional(),
    status: z.enum(['pending', 'passed', 'failed', 'requires_changes'], {
      errorMap: () => ({ message: 'Please select a valid criterion status' })
    }),
    evidence: z.array(z.string().max(200, 'Evidence must be less than 200 characters')).max(10, 'Maximum 10 evidence items allowed').optional(),
    notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
    required: z.boolean().default(true),
    priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium')
  })).min(1, 'At least one acceptance criterion is required').max(50, 'Maximum 50 acceptance criteria allowed'),
  status: z.enum(['pending', 'in_review', 'approved', 'rejected', 'requires_changes'], {
    errorMap: () => ({ message: 'Please select a valid sign-off status' })
  }),
  approvalWorkflow: z.array(z.object({
    step: z.number().min(1, 'Step must be at least 1').max(10, 'Step must be less than 10'),
    role: z.enum(['project_manager', 'client', 'technical_lead', 'quality_assurance', 'vendor_representative']),
    userId: z.string().uuid('Invalid user ID'),
    status: z.enum(['pending', 'approved', 'rejected']),
    approvedAt: z.string().datetime().optional(),
    notes: z.string().max(500, 'Notes must be less than 500 characters').optional()
  })).max(10, 'Maximum 10 workflow steps allowed').optional(),
  acceptanceDocuments: z.array(z.string().max(200, 'Document name must be less than 200 characters')).max(20, 'Maximum 20 documents allowed').optional(),
  supportingEvidence: z.array(z.string().max(200, 'Evidence must be less than 200 characters')).max(50, 'Maximum 50 evidence items allowed').optional()
});

// Cutover Incident Validation
export const cutoverIncidentValidationSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  phaseId: z.string().uuid('Invalid phase ID').optional(),
  incidentTitle: z.string().min(5, 'Incident title must be at least 5 characters').max(200, 'Incident title must be less than 200 characters'),
  incidentDescription: z.string().min(20, 'Description must be at least 20 characters').max(2000, 'Description must be less than 2000 characters'),
  incidentType: z.enum(['technical', 'business', 'communication', 'security', 'performance', 'financial', 'compliance', 'data', 'infrastructure', 'user_error', 'testing'], {
    errorMap: () => ({ message: 'Please select a valid incident type' })
  }),
  severity: z.enum(['critical', 'high', 'medium', 'low'], {
    errorMap: () => ({ message: 'Please select a valid severity level' })
  }),
  impact: z.enum(['critical', 'high', 'medium', 'low', 'none'], {
    errorMap: () => ({ message: 'Please select a valid impact level' })
  }),
  status: z.enum(['open', 'investigating', 'in_progress', 'resolved', 'closed', 'escalated'], {
    errorMap: () => ({ message: 'Please select a valid incident status' })
  }),
  priority: z.enum(['urgent', 'high', 'medium', 'low'], {
    errorMap: () => ({ message: 'Please select a valid priority level' })
  }),
  assignedTo: z.string().uuid('Invalid assignee ID').optional(),
  detectedAt: z.string().datetime('Detection time must be a valid datetime'),
  resolvedAt: z.string().datetime('Resolution time must be a valid datetime').optional(),
  affectedSystems: z.array(z.string().max(100, 'System name must be less than 100 characters')).max(20, 'Maximum 20 systems allowed').optional(),
  affectedUsers: z.number().min(0, 'Affected users must be positive').max(999999, 'Affected users count is too large').optional(),
  rootCause: z.string().max(1000, 'Root cause must be less than 1000 characters').optional(),
  resolution: z.string().max(1000, 'Resolution must be less than 1000 characters').optional(),
  resolutionActions: z.array(z.string().max(200, 'Action must be less than 200 characters')).max(20, 'Maximum 20 resolution actions allowed').optional(),
  preventiveActions: z.array(z.string().max(200, 'Action must be less than 200 characters')).max(20, 'Maximum 20 preventive actions allowed').optional(),
  incidentEvidence: z.array(z.string().max(200, 'Evidence must be less than 200 characters')).max(50, 'Maximum 50 evidence items allowed').optional(),
  communicationLog: z.array(z.object({
    timestamp: z.string().datetime(),
    type: z.enum(['note', 'status_update', 'escalation', 'notification']),
    message: z.string().max(500, 'Message must be less than 500 characters'),
    userId: z.string().uuid('Invalid user ID'),
    recipients: z.array(z.string().max(100, 'Recipient must be less than 100 characters')).max(20, 'Maximum 20 recipients allowed').optional()
  })).max(100, 'Maximum 100 communication log entries allowed').optional()
});

// ============================================================
// SEARCH AND FILTER VALIDATION
// ============================================================

export const searchValidationSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(100, 'Search query must be less than 100 characters'),
  filters: z.object({
    status: z.array(z.string()).optional(),
    priority: z.array(z.string()).optional(),
    category: z.array(z.string()).optional(),
    dateRange: z.object({
      startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
      endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
    }).optional(),
    assignedTo: z.array(z.string().uuid()).optional(),
    projectId: z.array(z.string().uuid()).optional()
  }).optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt', 'priority', 'status', 'dueDate']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().min(1, 'Page must be at least 1').max(1000, 'Page must be less than 1000').default(1),
  limit: z.number().min(1, 'Limit must be at least 1').max(100, 'Limit must be less than 100').default(20)
});

// ============================================================
// BULK OPERATIONS VALIDATION
// ============================================================

export const bulkOperationValidationSchema = z.object({
  operation: z.enum(['delete', 'update', 'archive', 'restore'], {
    errorMap: () => ({ message: 'Please select a valid operation' })
  }),
  entityType: z.enum(['project', 'task', 'timesheet', 'milestone', 'vendor_contract', 'issue_ticket'], {
    errorMap: () => ({ message: 'Please select a valid entity type' })
  }),
  entityIds: z.array(z.string().uuid('Invalid entity ID')).min(1, 'At least one entity ID is required').max(100, 'Maximum 100 entities allowed per operation'),
  updateData: z.record(z.any()).optional(),
  reason: z.string().min(5, 'Reason must be at least 5 characters').max(500, 'Reason must be less than 500 characters').optional()
});

// ============================================================
// FILE UPLOAD VALIDATION
// ============================================================

export const fileUploadValidationSchema = z.object({
  fileName: z.string().min(1, 'File name is required').max(255, 'File name must be less than 255 characters'),
  fileSize: z.number().min(1, 'File size must be positive').max(50 * 1024 * 1024, 'File size must be less than 50MB'),
  mimeType: z.enum([
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain', 'text/csv', 'application/zip'
  ], {
    errorMap: () => ({ message: 'Invalid file type' })
  }),
  entityType: z.enum(['project', 'task', 'timesheet', 'milestone', 'vendor_contract', 'issue_ticket', 'user'], {
    errorMap: () => ({ message: 'Please select a valid entity type' })
  }),
  entityId: z.string().uuid('Invalid entity ID'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional()
});

// ============================================================
// EXPORT VALIDATION HELPERS
// ============================================================

export type UserValidationInput = z.infer<typeof userValidationSchema>;
export type ProjectValidationInput = z.infer<typeof projectValidationSchema>;
export type TaskValidationInput = z.infer<typeof taskValidationSchema>;
export type TimesheetValidationInput = z.infer<typeof timesheetValidationSchema>;
export type MilestoneValidationInput = z.infer<typeof milestoneValidationSchema>;
export type VendorContractValidationInput = z.infer<typeof vendorContractValidationSchema>;
export type IssueTicketValidationInput = z.infer<typeof issueTicketValidationSchema>;
export type CutoverPhaseValidationInput = z.infer<typeof cutoverPhaseValidationSchema>;
export type ReadinessChecklistValidationInput = z.infer<typeof readinessChecklistValidationSchema>;
export type RunbookTaskValidationInput = z.infer<typeof runbookTaskValidationSchema>;
export type AcceptanceSignoffValidationInput = z.infer<typeof acceptanceSignoffValidationSchema>;
export type CutoverIncidentValidationInput = z.infer<typeof cutoverIncidentValidationSchema>;
export type SearchValidationInput = z.infer<typeof searchValidationSchema>;
export type BulkOperationValidationInput = z.infer<typeof bulkOperationValidationSchema>;
export type FileUploadValidationInput = z.infer<typeof fileUploadValidationSchema>;

// ============================================================
// VALIDATION ERROR FORMATTERS
// ============================================================

export const formatValidationErrors = (error: z.ZodError): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });
  
  return errors;
};

export const validateFormData = <T>(schema: z.ZodSchema<T>, data: unknown): { data: T; errors: Record<string, string> } | { data: null; errors: Record<string, string> } => {
  try {
    const validatedData = schema.parse(data);
    return { data: validatedData, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { data: null, errors: formatValidationErrors(error) };
    }
    return { data: null, errors: { general: 'Validation failed' } };
  }
};

// ============================================================
// CLIENT-SIDE VALIDATION HOOKS
// ============================================================

export const useFormValidation = <T>(schema: z.ZodSchema<T>) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (data: unknown): data is T => {
    const result = validateFormData(schema, data);
    
    if (result.data) {
      setErrors({});
      return true;
    } else {
      setErrors(result.errors);
      return false;
    }
  };

  const resetErrors = () => {
    setErrors({});
  };

  return {
    errors,
    isSubmitting,
    setIsSubmitting,
    validate,
    resetErrors
  };
};

export default {
  userValidationSchema,
  projectValidationSchema,
  taskValidationSchema,
  timesheetValidationSchema,
  milestoneValidationSchema,
  vendorContractValidationSchema,
  issueTicketValidationSchema,
  cutoverPhaseValidationSchema,
  readinessChecklistValidationSchema,
  runbookTaskValidationSchema,
  acceptanceSignoffValidationSchema,
  cutoverIncidentValidationSchema,
  searchValidationSchema,
  bulkOperationValidationSchema,
  fileUploadValidationSchema,
  formatValidationErrors,
  validateFormData,
  useFormValidation
};
