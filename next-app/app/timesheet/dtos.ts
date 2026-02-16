/**
 * Data Transfer Objects (DTOs)
 * Request and response data structures for API communication
 */

import { WorkType, LeaveType, EntryStatus } from './types';

// ============================================================================
// TIME ENTRY DTOs
// ============================================================================

/**
 * Create Time Entry Request
 * Used when user creates a new time entry
 */
export interface CreateTimeEntryRequest {
  date: string; // YYYY-MM-DD (required)
  startTime: string; // HH:mm (required)
  endTime: string; // HH:mm (required)
  breakDuration?: number; // minutes (default 60)
  workType: WorkType; // required
  projectId?: string;
  taskId?: string;
  description?: string;
}

/**
 * Update Time Entry Request
 * Used when user updates an existing time entry
 */
export interface UpdateTimeEntryRequest {
  date?: string;
  startTime?: string;
  endTime?: string;
  breakDuration?: number;
  workType?: WorkType;
  projectId?: string;
  taskId?: string;
  description?: string;
}

/**
 * Approve Time Entry Request
 */
export interface ApproveTimeEntryRequest {
  action: 'approve';
}

/**
 * Reject Time Entry Request
 */
export interface RejectTimeEntryRequest {
  action: 'reject';
  reason: string; // required when rejecting
}

export type ApprovalAction = ApproveTimeEntryRequest | RejectTimeEntryRequest;

/**
 * Add Comment Request
 */
export interface AddCommentRequest {
  text: string; // required
}

// ============================================================================
// LEAVE DTOs
// ============================================================================

/**
 * Create Leave Request
 */
export interface CreateLeaveRequestPayload {
  startDate: string; // YYYY-MM-DD (required)
  endDate: string; // YYYY-MM-DD (required)
  leaveType: LeaveType; // required
  reason: string; // required
}

/**
 * Approve Leave Request
 */
export interface ApproveLeaveRequestPayload {
  action: 'approve';
}

/**
 * Reject Leave Request
 */
export interface RejectLeaveRequestPayload {
  action: 'reject';
}

/**
 * Update Leave Allocation (admin only)
 */
export interface UpdateLeaveAllocationRequest {
  userId: string; // required (admin only)
  annualLeaveHours?: number;
  usedLeaveHours?: number;
}

// ============================================================================
// API REQUEST PAYLOADS
// ============================================================================

export type TimeEntryCreatePayload = CreateTimeEntryRequest;
export type TimeEntryUpdatePayload = UpdateTimeEntryRequest;
export type TimeEntryApprovalPayload = ApprovalAction;
export type CommentPayload = AddCommentRequest;

export type LeaveRequestCreatePayload = CreateLeaveRequestPayload;
export type LeaveRequestApprovalPayload = ApproveLeaveRequestPayload | RejectLeaveRequestPayload;
export type LeaveAllocationUpdatePayload = UpdateLeaveAllocationRequest;

// ============================================================================
// API RESPONSE PAYLOADS
// ============================================================================

/**
 * Generic API Response
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponsePayload {
  success: false;
  message: string;
  details?: Record<string, string>;
}

/**
 * List Response
 */
export interface ApiListSuccessResponse<T> {
  success: true;
  data: T[];
  count: number;
  total?: number;
  page?: number;
  limit?: number;
  month?: number;
  year?: number;
  filter?: Record<string, any>;
}

// ============================================================================
// QUERY PARAMETER DTOs
// ============================================================================

/**
 * Time Entry List Query Parameters
 */
export interface TimeEntryListQuery {
  month?: number | string; // 1-12
  year?: number | string;
  userId?: string;
  status?: EntryStatus;
  limit?: number | string;
  offset?: number | string;
}

/**
 * Leave Request List Query Parameters
 */
export interface LeaveRequestListQuery {
  status?: EntryStatus;
  userId?: string;
  leaveType?: LeaveType;
  limit?: number | string;
  offset?: number | string;
}

/**
 * Monthly Hours Query Parameters
 */
export interface MonthlyHoursQuery {
  month?: number | string;
  year?: number | string;
  userId?: string;
}

/**
 * Project Hours Query Parameters
 */
export interface ProjectHoursQuery {
  month?: number | string;
  year?: number | string;
}

/**
 * Leave Balance Query Parameters (none needed, path params only)
 */
export interface LeaveBalanceQuery {
  userId?: string;
}

// ============================================================================
// FORM DATA DTOs
// ============================================================================

/**
 * Time Entry Form State
 * Used for managing form state in components
 */
export interface TimeEntryFormData {
  date: string;
  startTime: string;
  endTime: string;
  breakDuration: number;
  workType: WorkType;
  projectId?: string;
  taskId?: string;
  description?: string;
}

/**
 * Leave Request Form State
 */
export interface LeaveRequestFormData {
  startDate: string;
  endDate: string;
  leaveType: LeaveType;
  reason: string;
}

/**
 * Filter Form State
 */
export interface TimeEntryFilterFormData {
  month?: number;
  year?: number;
  status?: EntryStatus;
  workType?: WorkType;
  projectId?: string;
}

export interface LeaveRequestFilterFormData {
  status?: EntryStatus;
  leaveType?: LeaveType;
}

// ============================================================================
// VALIDATION DTOs
// ============================================================================

/**
 * Validation Result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Field Validation Error
 */
export interface FieldValidationError {
  field: string;
  message: string;
}

// ============================================================================
// UI STATE DTOs
// ============================================================================

/**
 * Modal State for Time Entry
 */
export interface TimeEntryModalState {
  isOpen: boolean;
  mode: 'create' | 'edit' | 'view';
  entryId?: string;
  formData?: TimeEntryFormData;
  isLoading?: boolean;
  error?: string;
}

/**
 * Modal State for Leave Request
 */
export interface LeaveRequestModalState {
  isOpen: boolean;
  mode: 'create' | 'view';
  requestId?: string;
  formData?: LeaveRequestFormData;
  isLoading?: boolean;
  error?: string;
}

/**
 * Approval Dialog State
 */
export interface ApprovalDialogState {
  isOpen: boolean;
  entryId: string;
  action: 'approve' | 'reject';
  reason?: string;
  isLoading?: boolean;
  error?: string;
}

/**
 * Comment Input State
 */
export interface CommentInputState {
  text: string;
  isLoading?: boolean;
  error?: string;
}

// ============================================================================
// BATCH OPERATION DTOs
// ============================================================================

/**
 * Bulk Approval Request
 */
export interface BulkApprovalRequest {
  entryIds: string[];
  action: 'approve' | 'reject';
  reason?: string;
}

/**
 * Bulk Approval Response
 */
export interface BulkApprovalResponse {
  success: number;
  failed: number;
  errors?: Record<string, string>;
}

// ============================================================================
// EXPORT DTOS
// ============================================================================

/**
 * Export Request Parameters
 */
export interface ExportRequest {
  format: 'pdf' | 'excel' | 'csv';
  month: number;
  year: number;
  userId?: string;
  includeDetails?: boolean;
}

/**
 * Export Response
 */
export interface ExportResponse {
  url: string;
  filename: string;
  format: 'pdf' | 'excel' | 'csv';
  generatedAt: string;
}

// ============================================================================
// NOTIFICATION DTOs
// ============================================================================

/**
 * Notification for Timesheet Events
 */
export interface TimesheetNotification {
  id: string;
  type: 'time_entry_approved' | 'time_entry_rejected' | 'leave_approved' | 'leave_rejected' | 'comment_added';
  title: string;
  message: string;
  relatedId: string; // entry ID or request ID
  read: boolean;
  createdAt: string;
}

// ============================================================================
// SEARCH/FILTER RESULT DTOs
// ============================================================================

/**
 * Grouped Time Entries (by date)
 */
export interface GroupedTimeEntries {
  date: string;
  entries: any[]; // TimeEntry[]
  totalHours: number;
  totalBillable: number;
}

/**
 * Time Entry Search Result
 */
export interface TimeEntrySearchResult {
  query: string;
  results: any[]; // TimeEntry[]
  totalCount: number;
  searchFields: ('description' | 'workType' | 'status' | 'date')[];
}

/**
 * Leave Request Search Result
 */
export interface LeaveRequestSearchResult {
  query: string;
  results: any[]; // LeaveRequest[]
  totalCount: number;
}

// ============================================================================
// PAGINATION DTOs
// ============================================================================

/**
 * Pagination Options
 */
export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated Response Metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ============================================================================
// CHART DATA DTOs
// ============================================================================

/**
 * Hours Distribution Data
 */
export interface HoursDistributionData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string[];
  }>;
}

/**
 * Work Type Distribution
 */
export interface WorkTypeDistribution {
  workType: WorkType;
  hours: number;
  percentage: number;
  entryCount: number;
}

/**
 * Daily Hours Data (for charts)
 */
export interface DailyHoursData {
  date: string;
  hours: number;
  billableHours: number;
  entryCount: number;
}

// ============================================================================
// SYNCHRONIZATION DTOs
// ============================================================================

/**
 * Sync Request (for offline support)
 */
export interface SyncRequest {
  lastSyncTime: string; // ISO datetime
  operations: Array<{
    type: 'create' | 'update' | 'delete';
    resource: 'time_entry' | 'leave_request';
    data: any;
  }>;
}

/**
 * Sync Response
 */
export interface SyncResponse {
  success: boolean;
  syncTime: string;
  results: Array<{
    id: string;
    success: boolean;
    error?: string;
  }>;
}

// ============================================================================
// COMPARISON DTOS (for before/after changes)
// ============================================================================

export interface TimeEntryComparison {
  before: any; // TimeEntry
  after: any; // TimeEntry
  changes: Record<string, { before: any; after: any }>;
}

export interface LeaveRequestComparison {
  before: any; // LeaveRequest
  after: any; // LeaveRequest
  changes: Record<string, { before: any; after: any }>;
}

// ============================================================================
// ADDITIONAL DTO EXPORTS FOR COMPATIBILITY
// ============================================================================

export interface TimeEntryDTO {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  breakDuration: number;
  workType: WorkType;
  projectId?: string;
  taskId?: string;
  description?: string;
  hours: number;
  billableHours?: number;
  userId: string;
  status: EntryStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectedReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTimeEntryDTO extends CreateTimeEntryRequest {}

export interface UpdateTimeEntryDTO extends UpdateTimeEntryRequest {
  id: string;
}

export interface TimeSheetSummaryDTO {
  totalHours: number;
  billableHours: number;
  entries: TimeEntryDTO[];
  period: {
    start: string;
    end: string;
  };
}

export interface ApprovalStatusDTO {
  status: 'pending' | 'approved' | 'rejected';
  submittedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  comments?: string;
}

export interface BulkApproveDTO {
  entryIds: string[];
  status: 'approved' | 'rejected';
  comments?: string;
}

export interface TimeEntryComment {
  id: string;
  timeEntryId: string;
  userId: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

// ============================================================================
// LEAVE DTO EXPORTS FOR COMPATIBILITY
// ============================================================================

export interface LeaveAllocationDTO {
  id: string;
  userId: string;
  leaveType: LeaveType;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  year: number;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveRequestDTO {
  id: string;
  userId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  rejectedReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeaveRequestDTO {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface UpdateLeaveRequestDTO extends CreateLeaveRequestDTO {
  id: string;
}

export interface LeaveBalanceDTO {
  userId: string;
  leaveType: LeaveType;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  pendingDays: number;
  year: number;
}

export interface BulkLeaveApproveDTO {
  requestIds: string[];
  status: 'approved' | 'rejected';
  comments?: string;
}

export interface LeaveHistoryDTO {
  id: string;
  userId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  rejectedReason?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// EXPORT DTO ALIASES FOR COMPATIBILITY
// ============================================================================

export interface ExportRequestDTO extends ExportRequest {}

export interface ExportResponseDTO extends ExportResponse {}
