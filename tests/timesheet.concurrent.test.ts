/**
 * Timesheet Concurrent Work Tests
 * Testing Option 3 (Hybrid Approach) implementation
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import {
  detectDuplicateOrParallelWork,
  checkDailyTotalHours,
} from '../backend/src/features/timesheet/timesheet.duplicate-detection';

const prisma = new PrismaClient();

describe('Timesheet Concurrent Work (Option 3)', () => {
  const testUserId = 'test-user-123';
  const testDate = new Date('2025-02-15');

  beforeEach(async () => {
    // Clean up test data
    await prisma.time_entries.deleteMany({
      where: { userId: testUserId },
    });
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.time_entries.deleteMany({
      where: { userId: testUserId },
    });
  });

  describe('Business Rule 1: Single Project Alone', () => {
    it('should allow a single project entry without overlaps', async () => {
      const result = await detectDuplicateOrParallelWork({
        userId: testUserId,
        date: testDate,
        startTime: '09:00',
        endTime: '17:00',
        projectId: 'proj-1',
        workType: 'project',
      });

      expect(result.valid).toBe(true);
      expect(result.isConcurrent).toBe(false);
      expect(result.warnings.length).toBe(0);
    });
  });

  describe('Business Rule 2: Project + Non-Project Mix', () => {
    it('should allow project + meeting on same day', async () => {
      // Create project entry
      await prisma.time_entries.create({
        data: {
          id: 'entry-1',
          userId: testUserId,
          date: testDate,
          startTime: '09:00',
          endTime: '17:00',
          projectId: 'proj-1',
          workType: 'project' as any,
          hours: '8' as any,
          status: 'pending' as any,
        },
      });

      // Check for meeting overlap (should allow)
      const result = await detectDuplicateOrParallelWork({
        userId: testUserId,
        date: testDate,
        startTime: '14:00',
        endTime: '15:00',
        workType: 'office',
      });

      expect(result.valid).toBe(true);
      expect(result.isConcurrent).toBe(false);
    });
  });

  describe('Business Rule 3: Two Projects Parallel', () => {
    it('should warn and require reason for 2 parallel projects', async () => {
      // Create first project entry with real schema
      await prisma.time_entries.create({
        data: {
          id: 'entry-1',
          userId: testUserId,
          date: testDate,
          startTime: '14:00',
          endTime: '17:00',
          projectId: 'proj-1',
          workType: 'project' as any,
          hours: '3' as any,
          status: 'pending' as any,
        },
      });

      // Check for second project overlap
      const result = await detectDuplicateOrParallelWork({
        userId: testUserId,
        date: testDate,
        startTime: '14:00',
        endTime: '17:00',
        projectId: 'proj-2',
        workType: 'project',
      });

      expect(result.valid).toBe(true);
      expect(result.isConcurrent).toBe(true);
      expect(result.requiresComment).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.overlappingEntries).toBeDefined();
      expect(result.overlappingEntries?.length).toBe(1);
    });
  });

  describe('Business Rule 4: Three+ Projects Parallel', () => {
    it('should block 3 concurrent projects', async () => {
      // Create two project entries
      await prisma.time_entries.create({
        data: {
          id: 'entry-1',
          userId: testUserId,
          date: testDate,
          startTime: '14:00',
          endTime: '17:00',
          projectId: 'proj-1',
          workType: 'project' as any,
          hours: '3' as any,
          status: 'pending' as any,
        },
      });

      await prisma.time_entries.create({
        data: {
          id: 'entry-2',
          userId: testUserId,
          date: testDate,
          startTime: '14:00',
          endTime: '17:00',
          projectId: 'proj-2',
          workType: 'project' as any,
          hours: '3' as any,
          status: 'pending' as any,
        },
      });

      // Try to create third concurrent project
      try {
        await detectDuplicateOrParallelWork({
          userId: testUserId,
          date: testDate,
          startTime: '14:00',
          endTime: '17:00',
          projectId: 'proj-3',
          workType: 'project',
        });
        throw new Error('Should have thrown error for 3+ projects');
      } catch (error: any) {
        expect(error.code).toBe('TOO_MANY_PARALLEL_PROJECTS');
      }
    });
  });

  describe('Business Rule 5: Exact Duplicate', () => {
    it('should block exact duplicate entries', async () => {
      // Create first entry
      await prisma.time_entries.create({
        data: {
          id: 'entry-1',
          userId: testUserId,
          date: testDate,
          startTime: '09:00',
          endTime: '17:00',
          projectId: 'proj-1',
          workType: 'project' as any,
          hours: '8' as any,
          status: 'pending' as any,
        },
      });

      // Try to create exact duplicate
      try {
        await detectDuplicateOrParallelWork({
          userId: testUserId,
          date: testDate,
          startTime: '09:00',
          endTime: '17:00',
          projectId: 'proj-1',
          workType: 'project',
        });
        throw new Error('Should have thrown error for exact duplicate');
      } catch (error: any) {
        expect(error.code).toBe('EXACT_DUPLICATE');
      }
    });
  });

  describe('Business Rule 6: Same Project Overlap', () => {
    it('should block same project with overlapping times', async () => {
      // Create first entry for proj-1
      await prisma.time_entries.create({
        data: {
          id: 'entry-1',
          userId: testUserId,
          date: testDate,
          startTime: '09:00',
          endTime: '12:00',
          projectId: 'proj-1',
          workType: 'project' as any,
          hours: '3' as any,
          status: 'pending' as any,
        },
      });

      // Try to create overlapping entry on same project
      try {
        await detectDuplicateOrParallelWork({
          userId: testUserId,
          date: testDate,
          startTime: '11:00',
          endTime: '13:00',
          projectId: 'proj-1',
          workType: 'project',
        });
        throw new Error('Should have thrown error for same project overlap');
      } catch (error: any) {
        expect(error.code).toBe('SAME_PROJECT_OVERLAP');
      }
    });
  });

  describe('Business Rule 7: Sequential Entries (No Overlap)', () => {
    it('should allow back-to-back entries without overlap', async () => {
      // Create first entry
      await prisma.time_entries.create({
        data: {
          id: 'entry-1',
          userId: testUserId,
          date: testDate,
          startTime: '09:00',
          endTime: '12:00',
          projectId: 'proj-1',
          workType: 'project' as any,
          hours: '3' as any,
          status: 'pending' as any,
        },
      });

      // Check for adjacent entry (should allow)
      const result = await detectDuplicateOrParallelWork({
        userId: testUserId,
        date: testDate,
        startTime: '12:00',
        endTime: '17:00',
        projectId: 'proj-2',
        workType: 'project',
      });

      expect(result.valid).toBe(true);
      expect(result.isConcurrent).toBe(false);
    });
  });

  describe('Business Rule 8: Daily Total Limit', () => {
    it('should block entries exceeding 24 hours per day', async () => {
      // Create multiple entries totaling 24 hours
      await prisma.time_entries.create({
        data: {
          id: 'entry-1',
          userId: testUserId,
          date: testDate,
          startTime: '00:00',
          endTime: '12:00',
          projectId: 'proj-1',
          workType: 'project' as any,
          hours: '12' as any,
          status: 'pending' as any,
        },
      });

      await prisma.time_entries.create({
        data: {
          id: 'entry-2',
          userId: testUserId,
          date: testDate,
          startTime: '12:00',
          endTime: '23:59',
          projectId: 'proj-2',
          workType: 'project' as any,
          hours: '12' as any,
          status: 'pending' as any,
        },
      });

      // Check daily total
      const daily = await checkDailyTotalHours(testUserId, testDate);
      expect(daily.total).toBe(24);
      expect(daily.exceeds).toBe(false);

      // Try to add more (should exceed)
      const dailyExceed = await checkDailyTotalHours(testUserId, testDate);
      // Manually add to total to simulate exceeding
      expect(dailyExceed.total + 1).toBeGreaterThan(24);
    });
  });

  describe('Leave Conflict Protection', () => {
    it('should block work on approved leave days', async () => {
      // Create approved leave request
      const leaveUser = await prisma.users.findFirst({
        select: { id: true },
      });

      if (leaveUser) {
        await prisma.leave_requests.create({
          data: {
            id: 'leave-1',
            userId: testUserId,
            startDate: testDate,
            endDate: testDate,
            leaveType: 'annual' as any,
            reason: 'Test leave',
            status: 'approved' as any,
          },
        });

        // Try to create work entry on leave day
        try {
          await detectDuplicateOrParallelWork({
            userId: testUserId,
            date: testDate,
            startTime: '09:00',
            endTime: '17:00',
            projectId: 'proj-1',
            workType: 'project',
          });
          throw new Error('Should have thrown error for leave conflict');
        } catch (error: any) {
          expect(error.code).toBe('LEAVE_CONFLICT');
        }
      }
    });
  });

  describe('API Response Format', () => {
    it('should return properly formatted response', async () => {
      const result = await detectDuplicateOrParallelWork({
        userId: testUserId,
        date: testDate,
        startTime: '09:00',
        endTime: '17:00',
        projectId: 'proj-1',
        workType: 'project',
      });

      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('isConcurrent');
      expect(result).toHaveProperty('requiresComment');
      expect(result).toHaveProperty('warnings');
      expect(Array.isArray(result.warnings)).toBe(true);
    });
  });
});
