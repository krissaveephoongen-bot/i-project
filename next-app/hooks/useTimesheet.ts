/**
 * useTimesheet Hook
 * Custom React hook for managing timesheet data and operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTimeEntries,
  getTimeEntriesByDate,
  getTimeEntry,
  createTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
  getMonthlyTimesheet,
  getProjectHours,
  addTimeEntryComment,
  getTimeEntryComments,
  submitForApproval,
  approveTimeEntries,
  rejectTimeEntries,
  getPendingApprovals,
  exportTimesheet,
} from "@/lib/services/timesheet";
import type {
  TimeEntryDTO,
  CreateTimeEntryDTO,
  UpdateTimeEntryDTO,
  TimeSheetSummaryDTO,
  ApprovalStatusDTO,
  BulkApproveDTO,
} from "@/app/timesheet/dtos";

/**
 * Fetch time entries for a specific month
 */
export function useMonthlyTimesheet(
  userId: string,
  year: number,
  month: number,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["timesheet", userId, year, month],
    queryFn: () => getTimeEntries(userId, year, month),
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch time entries for a specific date
 */
export function useTimesheetByDate(
  userId: string,
  date: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["timesheet", userId, "date", date],
    queryFn: () => getTimeEntriesByDate(userId, date),
    enabled: enabled && !!userId && !!date,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch a single time entry
 */
export function useTimeEntry(entryId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["timesheet", entryId],
    queryFn: () => getTimeEntry(entryId),
    enabled: enabled && !!entryId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch monthly timesheet summary
 */
export function useMonthlyTimeSheetSummary(
  userId: string,
  year: number,
  month: number,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["timesheet-summary", userId, year, month],
    queryFn: () => getMonthlyTimesheet(userId, year, month),
    enabled: enabled && !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Fetch project hours summary
 */
export function useProjectHours(
  userId: string,
  projectId: string,
  year: number,
  month: number,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["project-hours", userId, projectId, year, month],
    queryFn: () => getProjectHours(userId, projectId, year, month),
    enabled: enabled && !!userId && !!projectId,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Create a new time entry
 */
export function useCreateTimeEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTimeEntryDTO) => createTimeEntry(data),
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ["timesheet"],
      });
      queryClient.invalidateQueries({
        queryKey: ["timesheet-summary"],
      });
      queryClient.invalidateQueries({
        queryKey: ["project-hours"],
      });
    },
  });
}

/**
 * Update a time entry
 */
export function useUpdateTimeEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      entryId,
      data,
    }: {
      entryId: string;
      data: UpdateTimeEntryDTO;
    }) => updateTimeEntry(entryId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["timesheet"],
      });
      queryClient.invalidateQueries({
        queryKey: ["timesheet-summary"],
      });
      queryClient.invalidateQueries({
        queryKey: ["project-hours"],
      });
      queryClient.setQueryData(["timesheet", data.id], data);
    },
  });
}

/**
 * Delete a time entry
 */
export function useDeleteTimeEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (entryId: string) => deleteTimeEntry(entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["timesheet"],
      });
      queryClient.invalidateQueries({
        queryKey: ["timesheet-summary"],
      });
      queryClient.invalidateQueries({
        queryKey: ["project-hours"],
      });
    },
  });
}

/**
 * Add comment to time entry
 */
export function useAddTimeEntryComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      entryId,
      comment,
    }: {
      entryId: string;
      comment: string;
    }) => addTimeEntryComment(entryId, comment),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["timesheet-comments", variables.entryId],
      });
    },
  });
}

/**
 * Fetch comments for a time entry
 */
export function useTimeEntryComments(
  entryId: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["timesheet-comments", entryId],
    queryFn: () => getTimeEntryComments(entryId),
    enabled: enabled && !!entryId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Submit time entries for approval
 */
export function useSubmitForApproval() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (entryIds: string[]) => submitForApproval(entryIds),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["timesheet"],
      });
      queryClient.invalidateQueries({
        queryKey: ["pending-approvals"],
      });
    },
  });
}

/**
 * Approve time entries (manager only)
 */
export function useApproveTimeEntries() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkApproveDTO) => approveTimeEntries(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["pending-approvals"],
      });
      queryClient.invalidateQueries({
        queryKey: ["timesheet"],
      });
    },
  });
}

/**
 * Reject time entries (manager only)
 */
export function useRejectTimeEntries() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      entryIds,
      reason,
    }: {
      entryIds: string[];
      reason: string;
    }) => rejectTimeEntries(entryIds, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["pending-approvals"],
      });
      queryClient.invalidateQueries({
        queryKey: ["timesheet"],
      });
    },
  });
}

/**
 * Fetch pending approvals for manager
 */
export function usePendingApprovals(managerId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["pending-approvals", managerId],
    queryFn: () => getPendingApprovals(managerId),
    enabled: enabled && !!managerId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Export timesheet data
 */
export function useExportTimesheet() {
  return useMutation({
    mutationFn: (data: Parameters<typeof exportTimesheet>[0]) =>
      exportTimesheet(data),
  });
}
