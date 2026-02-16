/**
 * useTimesheet Hook Test Suite
 * Tests for timesheet data management hooks
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  useMonthlyTimesheet,
  useTimesheetByDate,
  useTimeEntry,
  useCreateTimeEntry,
  useUpdateTimeEntry,
  useDeleteTimeEntry,
} from "../useTimesheet";
import * as timesheetService from "@/lib/services/timesheet";

// Mock the service
vi.mock("@/lib/services/timesheet");

// Create a wrapper with React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useMonthlyTimesheet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch monthly timesheet", async () => {
    const mockEntries = [
      {
        id: "1",
        date: "2026-02-01",
        startTime: "09:00",
        endTime: "17:00",
        hours: 8,
      },
    ];

    vi.mocked(timesheetService.getTimeEntries).mockResolvedValue(mockEntries);

    const { result } = renderHook(
      () => useMonthlyTimesheet("user-1", 2026, 2),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockEntries);
  });

  it("should handle fetch error", async () => {
    const error = new Error("Network error");
    vi.mocked(timesheetService.getTimeEntries).mockRejectedValue(error);

    const { result } = renderHook(
      () => useMonthlyTimesheet("user-1", 2026, 2),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
  });

  it("should not fetch if disabled", () => {
    const { result } = renderHook(
      () => useMonthlyTimesheet("user-1", 2026, 2, false),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(false);
    expect(
      vi.mocked(timesheetService.getTimeEntries).mock.calls.length
    ).toBe(0);
  });

  it("should not fetch if userId is missing", () => {
    const { result } = renderHook(
      () => useMonthlyTimesheet("", 2026, 2),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(false);
    expect(
      vi.mocked(timesheetService.getTimeEntries).mock.calls.length
    ).toBe(0);
  });
});

describe("useTimesheetByDate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch entries for specific date", async () => {
    const mockEntries = [
      {
        id: "1",
        date: "2026-02-01",
        startTime: "09:00",
        endTime: "17:00",
        hours: 8,
      },
    ];

    vi.mocked(timesheetService.getTimeEntriesByDate).mockResolvedValue(
      mockEntries
    );

    const { result } = renderHook(
      () => useTimesheetByDate("user-1", "2026-02-01"),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockEntries);
  });

  it("should handle missing date", () => {
    const { result } = renderHook(
      () => useTimesheetByDate("user-1", ""),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(false);
  });
});

describe("useTimeEntry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch single entry", async () => {
    const mockEntry = {
      id: "1",
      date: "2026-02-01",
      startTime: "09:00",
      endTime: "17:00",
      hours: 8,
    };

    vi.mocked(timesheetService.getTimeEntry).mockResolvedValue(mockEntry);

    const { result } = renderHook(() => useTimeEntry("1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockEntry);
  });

  it("should not fetch without entry ID", () => {
    const { result } = renderHook(() => useTimeEntry(""), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
  });
});

describe("useCreateTimeEntry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create time entry", async () => {
    const mockEntry = {
      id: "new",
      date: "2026-02-01",
      startTime: "09:00",
      endTime: "17:00",
      hours: 8,
    };

    vi.mocked(timesheetService.createTimeEntry).mockResolvedValue(mockEntry);

    const { result } = renderHook(() => useCreateTimeEntry(), {
      wrapper: createWrapper(),
    });

    const createData = {
      date: "2026-02-01",
      startTime: "09:00",
      endTime: "17:00",
      projectId: "proj-1",
      workType: "project",
    };

    result.current.mutate(createData);

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(result.current.data).toEqual(mockEntry);
  });

  it("should handle creation error", async () => {
    const error = new Error("Creation failed");
    vi.mocked(timesheetService.createTimeEntry).mockRejectedValue(error);

    const { result } = renderHook(() => useCreateTimeEntry(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      date: "2026-02-01",
      startTime: "09:00",
      endTime: "17:00",
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
  });
});

describe("useUpdateTimeEntry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update time entry", async () => {
    const mockEntry = {
      id: "1",
      date: "2026-02-01",
      startTime: "09:00",
      endTime: "18:00",
      hours: 9,
    };

    vi.mocked(timesheetService.updateTimeEntry).mockResolvedValue(mockEntry);

    const { result } = renderHook(() => useUpdateTimeEntry(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      entryId: "1",
      data: {
        endTime: "18:00",
      },
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(result.current.data).toEqual(mockEntry);
  });
});

describe("useDeleteTimeEntry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delete time entry", async () => {
    vi.mocked(timesheetService.deleteTimeEntry).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteTimeEntry(), {
      wrapper: createWrapper(),
    });

    result.current.mutate("1");

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(result.current.isSuccess).toBe(true);
  });

  it("should handle deletion error", async () => {
    const error = new Error("Deletion failed");
    vi.mocked(timesheetService.deleteTimeEntry).mockRejectedValue(error);

    const { result } = renderHook(() => useDeleteTimeEntry(), {
      wrapper: createWrapper(),
    });

    result.current.mutate("1");

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
  });
});
