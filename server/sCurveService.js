/**
 * S-Curve Progress Calculation Service
 * Calculates cumulative planned vs actual progress based on task weights and dates
 */

const { executeQuery } = require('../database/neon-connection');

/**
 * Get all months between start and end dates
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {Array} Array of month objects {year, month, label}
 */
function getMonthsBetween(startDate, endDate) {
  const months = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    const year = current.getFullYear();
    const month = current.getMonth() + 1;
    const label = current.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });

    months.push({
      year,
      month,
      label,
      date: new Date(year, month - 1, 1)
    });

    // Move to next month
    current.setMonth(current.getMonth() + 1);
  }

  return months;
}

/**
 * Check if a date is in or before a given month
 * @param {Date} date
 * @param {number} year
 * @param {number} month
 * @returns {boolean}
 */
function isDateInOrBeforeMonth(date, year, month) {
  if (!date) return false;
  const dateObj = new Date(date);
  const targetDate = new Date(year, month - 1, 1);
  return dateObj <= targetDate;
}

/**
 * Check if a date falls in a specific month
 * @param {Date} date
 * @param {number} year
 * @param {number} month
 * @returns {boolean}
 */
function isDateInMonth(date, year, month) {
  if (!date) return false;
  const dateObj = new Date(date);
  return dateObj.getFullYear() === year && dateObj.getMonth() === month - 1;
}

/**
 * Calculate S-Curve data for a project
 * @param {number} projectId
 * @returns {Promise<Object>} S-Curve data with planned and actual percentages
 */
async function calculateSCurve(projectId) {
  try {
    // Fetch project
    const projectResult = await executeQuery(
      'SELECT * FROM projects WHERE id = $1',
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      throw new Error('Project not found');
    }

    const project = projectResult.rows[0];
    const projectStartDate = new Date(project.start_date);
    const projectEndDate = new Date(project.end_date);

    // Fetch all tasks for the project
    const tasksResult = await executeQuery(
      'SELECT id, name, title, status, planned_start_date, planned_end_date, planned_progress_weight, actual_progress, created_at, updated_at FROM tasks WHERE project_id = $1',
      [projectId]
    );

    const tasks = tasksResult.rows;

    // Calculate total project weight
    const totalWeight = tasks.reduce((sum, task) => {
      const weight = parseFloat(task.planned_progress_weight) || 0;
      return sum + weight;
    }, 0);

    if (totalWeight === 0) {
      return {
        projectId,
        projectName: project.name,
        startDate: projectStartDate,
        endDate: projectEndDate,
        totalWeight: 0,
        plannedPercentage: 0,
        actualPercentage: 0,
        data: [],
        message: 'No tasks with weight found'
      };
    }

    // Get all months in the project timeline
    const months = getMonthsBetween(projectStartDate, projectEndDate);

    // Calculate cumulative percentages for each month
    const scurveData = months.map((monthData) => {
      // Planned percentage: cumulative progress based on planned end dates
      let plannedCumulativeWeight = 0;
      tasks.forEach((task) => {
        const endDate = task.planned_end_date ? new Date(task.planned_end_date) : null;
        if (endDate && isDateInOrBeforeMonth(endDate, monthData.year, monthData.month)) {
          plannedCumulativeWeight += parseFloat(task.planned_progress_weight) || 0;
        }
      });
      const plannedPercentage = totalWeight > 0 ? (plannedCumulativeWeight / totalWeight) * 100 : 0;

      // Actual percentage: based on actual progress of tasks
      let actualCumulativeProgress = 0;
      tasks.forEach((task) => {
        const taskWeight = parseFloat(task.planned_progress_weight) || 0;
        const taskActualProgress = parseFloat(task.actual_progress) || 0;
        actualCumulativeProgress += (taskWeight * taskActualProgress / 100);
      });
      const actualPercentage = totalWeight > 0 ? (actualCumulativeProgress / totalWeight) * 100 : 0;

      return {
        month: monthData.label,
        date: monthData.date.toISOString().split('T')[0],
        plannedPercentage: Math.min(100, Math.round(plannedPercentage * 100) / 100),
        actualPercentage: Math.min(100, Math.round(actualPercentage * 100) / 100),
        plannedWeight: plannedCumulativeWeight,
        actualWeight: actualCumulativeProgress
      };
    });

    // Calculate current overall percentages
    const finalPlanned = scurveData[scurveData.length - 1]?.plannedPercentage || 0;
    const finalActual = scurveData[scurveData.length - 1]?.actualPercentage || 0;

    return {
      projectId,
      projectName: project.name,
      startDate: projectStartDate,
      endDate: projectEndDate,
      totalWeight,
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t) => t.status === 'completed').length,
      plannedPercentage: Math.round(finalPlanned * 100) / 100,
      actualPercentage: Math.round(finalActual * 100) / 100,
      variance: Math.round((finalActual - finalPlanned) * 100) / 100, // Negative means behind schedule
      data: scurveData,
      summary: {
        onTrack: finalActual >= finalPlanned,
        performanceStatus: finalActual >= finalPlanned ? 'On Track' : 'Behind Schedule',
        daysVariance: calculateDaysVariance(scurveData, finalPlanned)
      }
    };
  } catch (error) {
    console.error('❌ S-Curve calculation error:', error.message);
    throw error;
  }
}

/**
 * Calculate variance in days
 * @param {Array} data
 * @param {number} targetPercentage
 * @returns {number}
 */
function calculateDaysVariance(data, targetPercentage) {
  if (data.length === 0) return 0;

  // Find when planned reaches the target
  const plannedIndex = data.findIndex((d) => d.plannedPercentage >= targetPercentage);
  // Find when actual reaches the same target
  const actualIndex = data.findIndex((d) => d.actualPercentage >= targetPercentage);

  if (plannedIndex === -1 || actualIndex === -1) return 0;

  // Simple approximation: difference in months * 30 days
  return (actualIndex - plannedIndex) * 30;
}

/**
 * Batch calculate S-Curves for multiple projects
 * @param {Array} projectIds
 * @returns {Promise<Array>}
 */
async function calculateSCurveBatch(projectIds) {
  const results = await Promise.all(
    projectIds.map((id) =>
      calculateSCurve(id).catch((err) => ({
        projectId: id,
        error: err.message
      }))
    )
  );
  return results;
}

module.exports = {
  calculateSCurve,
  calculateSCurveBatch,
  getMonthsBetween,
  isDateInOrBeforeMonth,
  isDateInMonth
};
