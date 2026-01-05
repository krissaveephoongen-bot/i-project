import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as timesheetService from './timesheetService';

describe('timesheetService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock fetch globally
    global.fetch = vi.fn();
  });

  describe('fetchWorklogs', () => {
    it('should fetch worklogs successfully', async () => {
      const mockData = [
        {
          id: '1',
          date: '2024-01-01',
          description: 'Task 1',
          hours: 8,
          start_time: '09:00',
          end_time: '17:00',
          status: 'pending',
        },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await timesheetService.fetchWorklogs('2024-01-01', '2024-01-07');
      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should handle fetch errors gracefully', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));
      
      await expect(timesheetService.fetchWorklogs('2024-01-01', '2024-01-07')).rejects.toThrow();
    });
  });

  describe('createWorklog', () => {
    it('should create a new worklog entry', async () => {
      const mockEntry = {
        id: '1',
        date: '2024-01-01',
        description: 'Task 1',
        hours: 8,
        start_time: '09:00',
        end_time: '17:00',
        status: 'pending',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockEntry,
      });

      const result = await timesheetService.createWorklog({
        date: '2024-01-01',
        description: 'Task 1',
        hours: 8,
        start_time: '09:00',
        end_time: '17:00',
        project_id: 'proj1',
      });

      expect(result).toEqual(mockEntry);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/worklogs'),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  describe('updateWorklog', () => {
    it('should update an existing worklog entry', async () => {
      const mockEntry = {
        id: '1',
        date: '2024-01-01',
        description: 'Updated Task',
        hours: 8,
        start_time: '09:00',
        end_time: '17:00',
        status: 'approved',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockEntry,
      });

      const result = await timesheetService.updateWorklog('1', {
        status: 'approved',
      });

      expect(result).toEqual(mockEntry);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/worklogs/1'),
        expect.objectContaining({ method: 'PUT' })
      );
    });
  });

  describe('deleteWorklog', () => {
    it('should delete a worklog entry', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
      });

      await timesheetService.deleteWorklog('1');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/worklogs/1'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('calculateHours', () => {
    it('should calculate hours between two times correctly', () => {
      const hours = timesheetService.calculateHours('09:00', '17:00');
      expect(hours).toBe(8);
    });

    it('should handle same start and end time', () => {
      const hours = timesheetService.calculateHours('09:00', '09:00');
      expect(hours).toBe(0);
    });

    it('should handle end time before start time', () => {
      const hours = timesheetService.calculateHours('17:00', '09:00');
      expect(hours).toBeLessThanOrEqual(0);
    });

    it('should handle partial hours correctly', () => {
      const hours = timesheetService.calculateHours('09:00', '09:30');
      expect(hours).toBe(0.5);
    });
  });

  describe('getWeeklyStats', () => {
    it('should calculate weekly statistics correctly', () => {
      const entries = [
        { hours: 8, status: 'approved' },
        { hours: 7, status: 'approved' },
        { hours: 6, status: 'pending' },
      ];

      const stats = timesheetService.getWeeklyStats(entries as any);

      expect(stats.totalHours).toBe(21);
      expect(stats.billableHours).toBe(15);
      expect(stats.pendingApproval).toBe(1);
    });

    it('should handle empty entries array', () => {
      const stats = timesheetService.getWeeklyStats([]);
      expect(stats.totalHours).toBe(0);
      expect(stats.billableHours).toBe(0);
    });
  });
});
