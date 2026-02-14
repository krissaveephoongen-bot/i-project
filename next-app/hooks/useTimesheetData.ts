/**
 * Safe Timesheet Data Hook
 * Handles all timesheet data fetching with proper race condition prevention
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import * as TimesheetService from '@/app/lib/timesheet-service';

export interface UseTimesheetDataReturn {
  projects: TimesheetService.Project[];
  entries: TimesheetService.TimesheetEntry[];
  submissionStatus: TimesheetService.SubmissionStatus | null;
  weekly: any;
  activities: any;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook for fetching all timesheet-related data safely
 * Prevents race conditions when currentMonth or user changes
 */
export function useTimesheetData(
  userId: string | undefined,
  currentMonth: Date,
  weekStart: Date,
  activityUser: string = 'all',
  activityTeam: string = ''
): UseTimesheetDataReturn {
  const [projects, setProjects] = useState<TimesheetService.Project[]>([]);
  const [entries, setEntries] = useState<TimesheetService.TimesheetEntry[]>([]);
  const [submissionStatus, setSubmissionStatus] = useState<TimesheetService.SubmissionStatus | null>(null);
  const [weekly, setWeekly] = useState<any>(null);
  const [activities, setActivities] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Create new AbortController for this fetch sequence
    controllerRef.current = new AbortController();
    const controller = controllerRef.current;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel (but with same AbortSignal for safety)
        const [projectsData, submissionData, weeklyData] = await Promise.all([
          TimesheetService.fetchProjects(userId, controller.signal),
          TimesheetService.fetchSubmissionStatus(userId, currentMonth, controller.signal),
          TimesheetService.fetchWeeklyData(weekStart, controller.signal),
        ]);

        // Check if request was aborted before updating state
        if (controller.signal.aborted) return;

        setProjects(projectsData);
        setSubmissionStatus(submissionData);
        setWeekly(weeklyData);

        // Fetch entries only if we have projects
        if (projectsData.length > 0) {
          const entriesData = await TimesheetService.fetchTimesheetEntries(
            userId,
            currentMonth,
            projectsData.map((p) => p.id),
            controller.signal
          );

          if (!controller.signal.aborted) {
            setEntries(entriesData);
          }
        }

        // Fetch activities
        const activitiesData = await TimesheetService.fetchActivities(
          activityUser === 'all' ? '' : activityUser,
          activityTeam,
          controller.signal
        );

        if (!controller.signal.aborted) {
          setActivities(activitiesData);
        }
      } catch (err) {
        // Ignore abort errors
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }

        // Set error only if component still mounted
        if (!controller.signal.aborted) {
          const error = err instanceof Error ? err : new Error(String(err));
          setError(error);
          console.error('Timesheet data fetch error:', error);
        }
      } finally {
        setLoading(false);
      }
    })();

    // Cleanup: abort ongoing requests if dependencies change or component unmounts
    return () => {
      controller.abort();
    };
  }, [userId, currentMonth, weekStart, activityUser, activityTeam]);

  return {
    projects,
    entries,
    submissionStatus,
    weekly,
    activities,
    loading,
    error,
  };
}
