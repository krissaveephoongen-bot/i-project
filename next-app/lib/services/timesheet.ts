/**
 * Timesheet API Client Service
 * Handles all timesheet-related API calls to the backend
 */

import { API_BASE_URL } from "@/lib/config";
import {
  TimeEntryDTO,
  CreateTimeEntryDTO,
  UpdateTimeEntryDTO,
  TimeEntryComment,
  TimeSheetSummaryDTO,
  ApprovalStatusDTO,
  BulkApproveDTO,
  ExportRequestDTO,
  ExportResponseDTO,
} from "@/app/timesheet/dtos";

const TIMESHEET_ENDPOINT = `${API_BASE_URL}/api/timesheet`;

/**
 * Get time entries for a user in a specific month
 */
export async function getTimeEntries(
  userId: string,
  year: number,
  month: number,
): Promise<TimeEntryDTO[]> {
  const response = await fetch(
    `${TIMESHEET_ENDPOINT}/user/${userId}/month/${year}/${month}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch time entries: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get time entries for a specific date
 */
export async function getTimeEntriesByDate(
  userId: string,
  date: string,
): Promise<TimeEntryDTO[]> {
  const response = await fetch(
    `${TIMESHEET_ENDPOINT}/user/${userId}/date/${date}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch time entries: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get a single time entry
 */
export async function getTimeEntry(entryId: string): Promise<TimeEntryDTO> {
  const response = await fetch(`${TIMESHEET_ENDPOINT}/${entryId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch time entry: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Create a new time entry
 */
export async function createTimeEntry(
  data: CreateTimeEntryDTO,
): Promise<TimeEntryDTO> {
  const response = await fetch(TIMESHEET_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create time entry");
  }

  return response.json();
}

/**
 * Update an existing time entry
 */
export async function updateTimeEntry(
  entryId: string,
  data: UpdateTimeEntryDTO,
): Promise<TimeEntryDTO> {
  const response = await fetch(`${TIMESHEET_ENDPOINT}/${entryId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update time entry");
  }

  return response.json();
}

/**
 * Delete a time entry
 */
export async function deleteTimeEntry(entryId: string): Promise<void> {
  const response = await fetch(`${TIMESHEET_ENDPOINT}/${entryId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete time entry: ${response.statusText}`);
  }
}

/**
 * Get monthly summary for a user
 */
export async function getMonthlyTimesheet(
  userId: string,
  year: number,
  month: number,
): Promise<TimeSheetSummaryDTO> {
  const response = await fetch(
    `${TIMESHEET_ENDPOINT}/user/${userId}/summary/${year}/${month}`,
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
      `Failed to fetch timesheet summary: ${response.statusText}`,
    );
  }

  return response.json();
}

/**
 * Get project hours summary
 */
export async function getProjectHours(
  userId: string,
  projectId: string,
  year: number,
  month: number,
): Promise<{ totalHours: number; entriesCount: number }> {
  const response = await fetch(
    `${TIMESHEET_ENDPOINT}/user/${userId}/project/${projectId}/${year}/${month}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch project hours: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Add a comment to a time entry
 */
export async function addTimeEntryComment(
  entryId: string,
  comment: string,
): Promise<TimeEntryComment> {
  const response = await fetch(`${TIMESHEET_ENDPOINT}/${entryId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ comment }),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to add comment: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get comments for a time entry
 */
export async function getTimeEntryComments(
  entryId: string,
): Promise<TimeEntryComment[]> {
  const response = await fetch(`${TIMESHEET_ENDPOINT}/${entryId}/comments`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch comments: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Submit time entries for approval
 */
export async function submitForApproval(
  entryIds: string[],
): Promise<ApprovalStatusDTO> {
  const response = await fetch(`${TIMESHEET_ENDPOINT}/submit-approval`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ entryIds }),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to submit for approval: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Approve time entries (manager only)
 */
export async function approveTimeEntries(
  data: BulkApproveDTO,
): Promise<ApprovalStatusDTO> {
  const response = await fetch(`${TIMESHEET_ENDPOINT}/approve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to approve time entries: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Reject time entries (manager only)
 */
export async function rejectTimeEntries(
  entryIds: string[],
  reason: string,
): Promise<ApprovalStatusDTO> {
  const response = await fetch(`${TIMESHEET_ENDPOINT}/reject`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ entryIds, reason }),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to reject time entries: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get pending approvals for a manager
 */
export async function getPendingApprovals(
  managerId: string,
): Promise<TimeEntryDTO[]> {
  const response = await fetch(
    `${TIMESHEET_ENDPOINT}/pending-approvals/${managerId}`,
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
      `Failed to fetch pending approvals: ${response.statusText}`,
    );
  }

  return response.json();
}

/**
 * Export timesheet data (PDF/Excel)
 */
export async function exportTimesheet(
  data: ExportRequestDTO,
): Promise<ExportResponseDTO> {
  const response = await fetch(`${TIMESHEET_ENDPOINT}/export`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to export timesheet: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get timesheet by ID
 */
export async function getTimesheetById(
  timesheetId: string,
): Promise<TimeSheetSummaryDTO> {
  const response = await fetch(`${TIMESHEET_ENDPOINT}/summary/${timesheetId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch timesheet: ${response.statusText}`);
  }

  return response.json();
}
