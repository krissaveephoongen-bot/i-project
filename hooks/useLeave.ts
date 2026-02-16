/**
 * useLeave Hook
 * Custom React hook for managing leave requests and allocations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getLeaveAllocation,
  updateLeaveAllocation,
  getLeaveRequests,
  getLeaveRequest,
  createLeaveRequest,
  updateLeaveRequest,
  cancelLeaveRequest,
  getLeaveBalance,
  getLeaveHistory,
  getPendingLeaveApprovals,
  approveLeaveRequests,
  rejectLeaveRequests,
  getTeamLeaveStats,
  exportLeaveRecords,
} from "@/lib/services/leave";
import type {
  LeaveAllocationDTO,
  LeaveRequestDTO,
  CreateLeaveRequestDTO,
  UpdateLeaveRequestDTO,
  LeaveBalanceDTO,
  BulkLeaveApproveDTO,
} from "@/app/timesheet/dtos";

/**
 * Fetch leave allocation for a user and year
 */
export function useLeaveAllocation(
  userId: string,
  year: number,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["leave-allocation", userId, year],
    queryFn: () => getLeaveAllocation(userId, year),
    enabled: enabled && !!userId,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Update leave allocation (admin only)
 */
export function useUpdateLeaveAllocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      year,
      allocatedDays,
    }: {
      userId: string;
      year: number;
      allocatedDays: number;
    }) => updateLeaveAllocation(userId, year, allocatedDays),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        ["leave-allocation", variables.userId, variables.year],
        data
      );
      queryClient.invalidateQueries({
        queryKey: ["leave-balance"],
      });
    },
  });
}

/**
 * Fetch leave requests for a user
 */
export function useLeaveRequests(
  userId: string,
  filters?: { status?: string; year?: number; leaveType?: string },
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["leave-requests", userId, filters],
    queryFn: () => getLeaveRequests(userId, filters),
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch a single leave request
 */
export function useLeaveRequest(requestId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["leave-request", requestId],
    queryFn: () => getLeaveRequest(requestId),
    enabled: enabled && !!requestId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch leave balance
 */
export function useLeaveBalance(
  userId: string,
  year: number,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["leave-balance", userId, year],
    queryFn: () => getLeaveBalance(userId, year),
    enabled: enabled && !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Fetch leave history
 */
export function useLeaveHistory(
  userId: string,
  limit: number = 50,
  offset: number = 0,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["leave-history", userId, limit, offset],
    queryFn: () => getLeaveHistory(userId, limit, offset),
    enabled: enabled && !!userId,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Create a new leave request
 */
export function useCreateLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLeaveRequestDTO) => createLeaveRequest(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["leave-requests"],
      });
      queryClient.invalidateQueries({
        queryKey: ["leave-balance"],
      });
      queryClient.invalidateQueries({
        queryKey: ["leave-history"],
      });
    },
  });
}

/**
 * Update a leave request
 */
export function useUpdateLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      data,
    }: {
      requestId: string;
      data: UpdateLeaveRequestDTO;
    }) => updateLeaveRequest(requestId, data),
    onSuccess: (data) => {
      queryClient.setQueryData(["leave-request", data.id], data);
      queryClient.invalidateQueries({
        queryKey: ["leave-requests"],
      });
      queryClient.invalidateQueries({
        queryKey: ["leave-balance"],
      });
    },
  });
}

/**
 * Cancel a leave request
 */
export function useCancelLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      reason,
    }: {
      requestId: string;
      reason?: string;
    }) => cancelLeaveRequest(requestId, reason),
    onSuccess: (data) => {
      queryClient.setQueryData(["leave-request", data.id], data);
      queryClient.invalidateQueries({
        queryKey: ["leave-requests"],
      });
      queryClient.invalidateQueries({
        queryKey: ["leave-balance"],
      });
    },
  });
}

/**
 * Fetch pending leave approvals for manager
 */
export function usePendingLeaveApprovals(
  managerId: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["pending-leave-approvals", managerId],
    queryFn: () => getPendingLeaveApprovals(managerId),
    enabled: enabled && !!managerId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Approve leave requests (manager only)
 */
export function useApproveLeaveRequests() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkLeaveApproveDTO) => approveLeaveRequests(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["pending-leave-approvals"],
      });
      queryClient.invalidateQueries({
        queryKey: ["leave-requests"],
      });
      queryClient.invalidateQueries({
        queryKey: ["leave-balance"],
      });
    },
  });
}

/**
 * Reject leave requests (manager only)
 */
export function useRejectLeaveRequests() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestIds,
      reason,
    }: {
      requestIds: string[];
      reason: string;
    }) => rejectLeaveRequests(requestIds, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["pending-leave-approvals"],
      });
      queryClient.invalidateQueries({
        queryKey: ["leave-requests"],
      });
    },
  });
}

/**
 * Fetch team leave statistics
 */
export function useTeamLeaveStats(
  managerId: string,
  year: number,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["team-leave-stats", managerId, year],
    queryFn: () => getTeamLeaveStats(managerId, year),
    enabled: enabled && !!managerId,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

/**
 * Export leave records
 */
export function useExportLeaveRecords() {
  return useMutation({
    mutationFn: ({
      userId,
      year,
      format = "excel",
    }: {
      userId: string;
      year: number;
      format?: "pdf" | "excel";
    }) => exportLeaveRecords(userId, year, format),
  });
}
