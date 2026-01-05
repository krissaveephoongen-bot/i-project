import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Timesheet from './Timesheet';

// Mock toast notifications
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock timesheetService used by the component hooks
vi.mock('@/services/timesheetService', () => ({
  timesheetService: {
    getTimesheetEntries: vi.fn(async () => []),
    getReportsSummary: vi.fn(async () => ({
      projectBreakdown: [],
      typeBreakdown: [],
      totalHours: 0,
      daysWorked: 0,
      averageHoursPerDay: 0,
      overtimeHours: 0,
    })),
    getPendingApprovals: vi.fn(async () => []),
    createTimeEntry: vi.fn(),
  },
}));

// Mock fetch globally for projects and tasks
global.fetch = vi.fn();

describe('Timesheet Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockReset();

    // Default mock response for projects
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => [
        { id: '1', name: 'Mobile App Development' },
        { id: '2', name: 'API Integration' },
      ],
    });
  });

  describe('Rendering', () => {
    it('should render the log time header and primary action', () => {
      render(<Timesheet />);
      expect(screen.getByRole('heading', { name: /Log Time/i })).toBeInTheDocument();
      // There is a tab and an action button both labeled 'Log Time' — ensure at least one action button exists
      const buttons = screen.getAllByRole('button', { name: /Log Time/i });
      expect(buttons.length).toBeGreaterThanOrEqual(1);
    });

    it('should show recent time entries area', () => {
      render(<Timesheet />);
      expect(screen.getByText(/Recent Time Entries/i)).toBeInTheDocument();
      expect(screen.getByText(/No time entries yet/i)).toBeInTheDocument();
    });
  });

  describe('Entry Management', () => {
    it('should open the Log Time dialog when button is clicked', async () => {
      const user = userEvent.setup();
      render(<Timesheet />);

      // There are two elements labeled 'Log Time' (tab & button). Choose the one with an icon (action button).
      const buttons = screen.getAllByRole('button', { name: /Log Time/i });
      const actionButton = buttons.find((b) => b.querySelector('svg')) || buttons[0];
      if (!actionButton) throw new Error('Log Time action button not found');
      await user.click(actionButton);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Log Time/i })).toBeInTheDocument();
        // Check for form labels/texts (inputs are not associated with labels in this UI)
        expect(screen.getByText(/Date/i)).toBeInTheDocument();
        expect(screen.getByText(/Work Type/i)).toBeInTheDocument();
      });
    });

    it('should not call createTimeEntry when required fields are missing', async () => {
      const user = userEvent.setup();
      const { timesheetService } = await import('@/services/timesheetService');
      render(<Timesheet />);

      // Open dialog (pick the action button)
      const buttons = screen.getAllByRole('button', { name: /Log Time/i });
      const actionButton = buttons.find((b) => b.querySelector('svg')) || buttons[0];
      if (!actionButton) throw new Error('Log Time action button not found');
      await user.click(actionButton);

      // Submit empty form
      const submit = screen.getByRole('button', { name: /Submit/i });
      await user.click(submit);

      await waitFor(() => {
        // Should not have attempted to create a time entry
        expect(timesheetService.createTimeEntry).not.toHaveBeenCalled();
      });
    });
  });

  describe('Reports & Export', () => {
    it('should export a CSV when reports are available', async () => {
      const user = userEvent.setup();
      const { timesheetService } = await import('@/services/timesheetService');

      // Make reports return some data
      (timesheetService.getReportsSummary as any).mockResolvedValue({
        projectBreakdown: [{ projectId: 1, projectName: 'P', hours: 10, percentage: 100, taskCount: 1 }],
        typeBreakdown: [],
        totalHours: 10,
        daysWorked: 1,
        averageHoursPerDay: 10,
        overtimeHours: 0,
      });

      // Mock URL.createObjectURL
      global.URL.createObjectURL = vi.fn(() => 'blob:mock');

      render(<Timesheet />);

      // Click reports tab
      await user.click(screen.getByText(/📊 Reports/i));

      // Wait for export button and click
      const exportButton = await screen.findByRole('button', { name: /Export/i });
      await user.click(exportButton);

      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  describe('Approvals', () => {
    it('should show pending approvals when available', async () => {
      const user = userEvent.setup();
      const { timesheetService } = await import('@/services/timesheetService');
      (timesheetService.getPendingApprovals as any).mockResolvedValueOnce([
        { id: '1', userName: 'Jane Doe', submittedDate: new Date().toISOString(), status: 'pending', totalHours: 8, entries: [] },
      ]);

      render(<Timesheet />);

      // Click approvals tab
      await user.click(screen.getByText(/✅ Approvals/i));

      expect(await screen.findByText('Jane Doe')).toBeInTheDocument();
    });
  });
});
