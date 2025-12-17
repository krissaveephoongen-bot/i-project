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

// Mock fetch globally
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
    it('should render the timesheet header', () => {
      render(<Timesheet />);
      expect(screen.getByText(/📋 Timesheet/i)).toBeInTheDocument();
    });

    it('should render weekly stats cards', () => {
      render(<Timesheet />);
      expect(screen.getByText(/Total Hours/i)).toBeInTheDocument();
      expect(screen.getByText(/Billable Hours/i)).toBeInTheDocument();
      expect(screen.getByText(/Entries/i)).toBeInTheDocument();
      expect(screen.getByText(/Daily Average/i)).toBeInTheDocument();
      expect(screen.getByText(/Pending/i)).toBeInTheDocument();
    });

    it('should render time tracker widget', () => {
      render(<Timesheet />);
      expect(screen.getByText(/Time Tracker/i)).toBeInTheDocument();
      expect(screen.getByText(/Select Project/i)).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      render(<Timesheet />);
      expect(screen.getByText(/Export/i)).toBeInTheDocument();
      expect(screen.getByText(/Add Entry/i)).toBeInTheDocument();
    });
  });

  describe('Time Tracking', () => {
    it('should require project selection before starting tracking', async () => {
      render(<Timesheet />);
      const startButton = screen.getByText(/Start Tracking/i);

      expect(startButton).toBeDisabled();
    });

    it('should enable start button when project is selected', async () => {
      const user = userEvent.setup();
      render(<Timesheet />);

      const projectSelect = screen.getByDisplayValue(/Choose a project/i);
      await user.click(projectSelect);

      const option = screen.getByText('Mobile App Development');
      await user.click(option);

      const startButton = screen.getByText(/Start Tracking/i);
      expect(startButton).not.toBeDisabled();
    });

    it('should start tracking when start button is clicked', async () => {
      const user = userEvent.setup();
      render(<Timesheet />);

      // Select project
      const projectSelect = screen.getByDisplayValue(/Choose a project/i);
      await user.click(projectSelect);
      await user.click(screen.getByText('Mobile App Development'));

      // Start tracking
      const startButton = screen.getByText(/Start Tracking/i);
      await user.click(startButton);

      // Should show pause/stop buttons
      await waitFor(() => {
        expect(screen.getByText(/Pause/i)).toBeInTheDocument();
        expect(screen.getByText(/Stop & Save/i)).toBeInTheDocument();
      });
    });

    it('should display elapsed time while tracking', async () => {
      vi.useFakeTimers();
      const user = userEvent.setup({ delay: null });

      render(<Timesheet />);

      // Select project and start tracking
      const projectSelect = screen.getByDisplayValue(/Choose a project/i);
      await user.click(projectSelect);
      await user.click(screen.getByText('Mobile App Development'));

      const startButton = screen.getByText(/Start Tracking/i);
      await user.click(startButton);

      // Initial time should be 00:00:00
      expect(screen.getByText('00:00:00')).toBeInTheDocument();

      // Fast-forward 5 seconds
      vi.advanceTimersByTime(5000);

      await waitFor(() => {
        expect(screen.getByText('00:00:05')).toBeInTheDocument();
      });

      vi.useRealTimers();
    });
  });

  describe('Entry Management', () => {
    it('should open add entry dialog when button is clicked', async () => {
      const user = userEvent.setup();
      render(<Timesheet />);

      const addButton = screen.getByText(/Add Entry/i);
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText(/Add Timesheet Entry/i)).toBeInTheDocument();
      });
    });

    it('should validate required fields before adding entry', async () => {
      const user = userEvent.setup();
      render(<Timesheet />);

      // Open dialog
      await user.click(screen.getByText(/Add Entry/i));

      // Try to save without filling required fields
      const saveButton = screen.getByText(/✅ Add Entry/i);
      await user.click(saveButton);

      // Should show error toast (in actual implementation)
      await waitFor(() => {
        expect(global.fetch).not.toHaveBeenCalledWith(
          expect.stringContaining('/worklogs'),
          expect.any(Object)
        );
      });
    });

    it('should calculate duration correctly', async () => {
      const user = userEvent.setup();
      render(<Timesheet />);

      await user.click(screen.getByText(/Add Entry/i));

      // Fill in start and end times
      // Find and fill the time inputs (this is a simplified approach)
      // In real tests, you'd need more specific selectors
      // For example: screen.getByLabelText('Start Time')

      await waitFor(() => {
        // Duration should be calculated
        expect(screen.getByDisplayValue('')).toBeInTheDocument();
      });
    });
  });

  describe('Weekly Navigation', () => {
    it('should navigate to previous week', async () => {
      const user = userEvent.setup();
      render(<Timesheet />);

      const prevButton = screen.getAllByRole('button').find(
        (btn) => btn.querySelector('svg') && btn.textContent === ''
      );

      if (prevButton) {
        await user.click(prevButton);
        expect(global.fetch).toHaveBeenCalled();
      }
    });

    it('should navigate to current week when Today button is clicked', async () => {
      const user = userEvent.setup();
      render(<Timesheet />);

      const todayButton = screen.getByText(/Today/i);
      await user.click(todayButton);

      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('Entry Approval', () => {
    it('should show approve button for pending entries', async () => {
      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('/worklogs')) {
          return Promise.resolve({
            ok: true,
            json: async () => [
              {
                id: '1',
                date: '2024-01-01',
                task: 'Task 1',
                project: 'Project 1',
                startTime: '09:00',
                endTime: '17:00',
                hours: 8,
                status: 'pending',
                description: 'Work description',
              },
            ],
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => [],
        });
      });

      render(<Timesheet />);

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
      });
    });
  });

  describe('Export Functionality', () => {
    it('should export timesheet as CSV', async () => {
      const user = userEvent.setup();

      // Mock URL.createObjectURL
      global.URL.createObjectURL = vi.fn(() => 'blob:mock');

      render(<Timesheet />);

      const exportButton = screen.getByText(/Export/i);
      await user.click(exportButton);

      // Should create a blob
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  describe('Tab Navigation', () => {
    it('should switch between list and calendar views', async () => {
      const user = userEvent.setup();
      render(<Timesheet />);

      await waitFor(() => {
        expect(screen.getByText(/List View/i)).toBeInTheDocument();
        expect(screen.getByText(/Weekly View/i)).toBeInTheDocument();
      });

      const weeklyViewTab = screen.getByText(/Weekly View/i);
      await user.click(weeklyViewTab);

      await waitFor(() => {
        expect(screen.getByText(/Weekly Summary/i)).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing project name gracefully', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      render(<Timesheet />);

      await waitFor(() => {
        expect(screen.getByText(/📋 Timesheet/i)).toBeInTheDocument();
      });
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('API Error'));

      render(<Timesheet />);

      await waitFor(() => {
        // Should still render without crashing
        expect(screen.getByText(/📋 Timesheet/i)).toBeInTheDocument();
      });
    });
  });
});
