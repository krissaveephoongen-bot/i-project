/**
 * Leave Management API Client Service
 * Handles all leave-related API calls to the backend
 */

import { API_BASE_URL } from "@/lib/config";
import {
  LeaveAllocationDTO,
  LeaveRequestDTO,
  CreateLeaveRequestDTO,
  UpdateLeaveRequestDTO,
  LeaveBalanceDTO,
  BulkLeaveApproveDTO,
  LeaveHistoryDTO,
} from "@/app/timesheet/dtos";

const LEAVE_ENDPOINT = `${API_BASE_URL}/api/leave`;

/**
 * Get leave allocation for a user and year
 */
export async function getLeaveAllocation(
  userId: string,
  year: number,
): Promise<LeaveAllocationDTO> {
  const response = await fetch(
    `${LEAVE_ENDPOINT}/allocation/${userId}/${year}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch leave allocation: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Update leave allocation (admin only)
 */
export async function updateLeaveAllocation(
  userId: string,
  year: number,
  allocatedDays: number,
): Promise<LeaveAllocationDTO> {
  const response = await fetch(
    `${LEAVE_ENDPOINT}/allocation/${userId}/${year}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ allocatedDays }),
      credentials: "include",
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update leave allocation");
  }

  return response.json();
}

/**
 * Get all leave requests for a user
 */
export async function getLeaveRequests(
  userId: string,
  filters?: {
    status?: string;
    year?: number;
    leaveType?: string;
  },
): Promise<LeaveRequestDTO[]> {
  const queryParams = new URLSearchParams();
  if (filters?.status) queryParams.append("status", filters.status);
  if (filters?.year) queryParams.append("year", filters.year.toString());
  if (filters?.leaveType) queryParams.append("leaveType", filters.leaveType);

  const url = new URL(`${LEAVE_ENDPOINT}/requests/${userId}`);
  url.search = queryParams.toString();

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch leave requests: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get a single leave request
 */
export async function getLeaveRequest(
  requestId: string,
): Promise<LeaveRequestDTO> {
  const response = await fetch(`${LEAVE_ENDPOINT}/requests/${requestId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch leave request: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Create a new leave request
 */
export async function createLeaveRequest(
  data: CreateLeaveRequestDTO,
): Promise<LeaveRequestDTO> {
  const response = await fetch(`${LEAVE_ENDPOINT}/requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create leave request");
  }

  return response.json();
}

/**
 * Update a leave request
 */
export async function updateLeaveRequest(
  requestId: string,
  data: UpdateLeaveRequestDTO,
): Promise<LeaveRequestDTO> {
  const response = await fetch(`${LEAVE_ENDPOINT}/requests/${requestId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update leave request");
  }

  return response.json();
}

/**
 * Cancel a leave request
 */
export async function cancelLeaveRequest(
  requestId: string,
  reason?: string,
): Promise<LeaveRequestDTO> {
  const response = await fetch(
    `${LEAVE_ENDPOINT}/requests/${requestId}/cancel`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason }),
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to cancel leave request: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get leave balance for a user
 */
export async function getLeaveBalance(
  userId: string,
  year: number,
): Promise<LeaveBalanceDTO> {
  const response = await fetch(`${LEAVE_ENDPOINT}/balance/${userId}/${year}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch leave balance: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get leave history for a user
 */
export async function getLeaveHistory(
  userId: string,
  limit: number = 50,
  offset: number = 0,
): Promise<LeaveHistoryDTO> {
  const response = await fetch(
    `${LEAVE_ENDPOINT}/history/${userId}?limit=${limit}&offset=${offset}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch leave history: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get pending leave approvals for a manager
 */
export async function getPendingLeaveApprovals(
  managerId: string,
): Promise<LeaveRequestDTO[]> {
  const response = await fetch(
    `${LEAVE_ENDPOINT}/pending-approvals/${managerId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch pending leave approvals: ${response.statusText}`,
    );
  }

  return response.json();
}

/**
 * Approve leave requests (manager only)
 */
export async function approveLeaveRequests(
  data: BulkLeaveApproveDTO,
): Promise<{ approved: string[]; failed: string[] }> {
  const response = await fetch(`${LEAVE_ENDPOINT}/approve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to approve leave requests: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Reject leave requests (manager only)
 */
export async function rejectLeaveRequests(
  requestIds: string[],
  reason: string,
): Promise<{ rejected: string[]; failed: string[] }> {
  const response = await fetch(`${LEAVE_ENDPOINT}/reject`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ requestIds, reason }),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to reject leave requests: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get leave statistics for a team (manager/admin only)
 */
export async function getTeamLeaveStats(
  managerId: string,
  year: number,
): Promise<{
  totalRequests: number;
  approved: number;
  pending: number;
  rejected: number;
  averageDaysUsed: number;
}> {
  const response = await fetch(
    `${LEAVE_ENDPOINT}/team-stats/${managerId}/${year}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch team leave statistics: ${response.statusText}`,
    );
  }

  return response.json();
}

/**
 * Export leave records
 */
export async function exportLeaveRecords(
  userId: string,
  year: number,
  format: "pdf" | "excel" = "excel",
): Promise<{ url: string; filename: string }> {
  const response = await fetch(`${LEAVE_ENDPOINT}/export`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, year, format }),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to export leave records: ${response.statusText}`);
  }

  return response.json();
}
