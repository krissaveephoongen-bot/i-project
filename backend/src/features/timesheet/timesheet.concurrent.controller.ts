/**
 * Concurrent Work Detection Controller
 * Handles checking for parallel work and returning warnings
 */

import { Request, Response } from 'express';
import { detectDuplicateOrParallelWork } from './timesheet.duplicate-detection';
import { AppError } from '../../shared/errors/AppError';

export class TimesheetConcurrentController {
  /**
   * Check if proposed entry has concurrent/parallel work
   * GET /api/timesheet/check-concurrent
   */
  async checkConcurrentWork(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, 'Unauthorized');
      }

      const { date, startTime, endTime, projectId, workType = 'project' } = req.body;

      if (!date || !startTime || !endTime) {
        throw new AppError(400, 'Missing required fields');
      }

      // Check for concurrent work
      const result = await detectDuplicateOrParallelWork({
        userId,
        date: new Date(date),
        startTime,
        endTime,
        projectId,
        workType,
      });

      res.json(result);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          error: error.code,
          message: error.message,
        });
      }

      console.error('Check concurrent error:', error);
      res.status(500).json({
        error: 'CONCURRENT_CHECK_FAILED',
        message: 'ไม่สามารถตรวจสอบการทำงานขนานได้',
      });
    }
  }
}

export default new TimesheetConcurrentController();
