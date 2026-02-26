"use client";

import { useState, useEffect } from "react";
import { startOfWeek, endOfWeek, format } from "date-fns";

export const useWeeklyActivities = (selectedDate = new Date()) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeeklyActivities = async (date = selectedDate) => {
    setLoading(true);
    setError(null);

    try {
      const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday start
      const weekEnd = endOfWeek(date, { weekStartsOn: 1 });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(
        `/api/projects/weekly-summary/daily/${weekStart.toISOString()}/${weekEnd.toISOString()}`,
        { signal: controller.signal },
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const dailyData = await response.json();

      // Transform daily data to employee-based structure
      const employeeMap = new Map();

      dailyData.forEach((day) => {
        // This would need to be adjusted based on actual API response structure
        // Assuming we have detailed entries with employee information
        if (day.entries && day.entries.length > 0) {
          day.entries.forEach((entry) => {
            if (!employeeMap.has(entry.userId)) {
              employeeMap.set(entry.userId, {
                employeeName: entry.employeeName || "Unknown",
                days: Array(7)
                  .fill(null)
                  .map((_, index) => ({
                    day: format(
                      new Date(
                        weekStart.getTime() + index * 24 * 60 * 60 * 1000,
                      ),
                      "EEE dd MMM",
                    ),
                    activities: [],
                  })),
              });
            }

            const dayIndex = Math.floor(
              (new Date(day.date) - weekStart) / (24 * 60 * 60 * 1000),
            );
            if (dayIndex >= 0 && dayIndex < 7) {
              const employee = employeeMap.get(entry.userId);
              const activityText = entry.projectName
                ? `• [${entry.projectName}] ${entry.description || entry.activity}`
                : `• [Non-Project] ${entry.description || entry.activity}`;

              employee.days[dayIndex].activities.push(activityText);
            }
          });
        }
      });

      // Convert Map to array and sort by employee name
      const transformedActivities = Array.from(employeeMap.values()).sort(
        (a, b) => a.employeeName.localeCompare(b.employeeName),
      );

      // Fill empty days with '-'
      transformedActivities.forEach((employee) => {
        employee.days.forEach((day) => {
          if (day.activities.length === 0) {
            day.activities = ["-"];
          }
        });
      });

      setActivities(transformedActivities);
    } catch (err) {
      console.error("Error fetching weekly activities:", err);
      setError(err.message);

      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeklyActivities();
  }, [selectedDate]);

  const refreshActivities = () => {
    fetchWeeklyActivities();
  };

  return {
    activities,
    loading,
    error,
    refreshActivities,
    refetch: fetchWeeklyActivities,
  };
};
