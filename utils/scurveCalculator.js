// S-Curve Calculator with Linear Interpolation
// Calculates planned and actual progress based on task timeline and weight

// Helper: Calculate planned task progress at a specific date using Linear Interpolation
function getPlannedTaskProgress(task, checkDate) {
  const taskStart = new Date(task.PlannedStartDate);
  const taskEnd = new Date(task.PlannedEndDate);
  const check = new Date(checkDate);
  
  // Reset time to start of day for accurate comparison
  taskStart.setHours(0, 0, 0, 0);
  taskEnd.setHours(0, 0, 0, 0);
  check.setHours(0, 0, 0, 0);
  
  // 1. Before task start date -> 0%
  if (check < taskStart) {
    return 0;
  }
  
  // 2. After task end date -> Full weight
  if (check > taskEnd) {
    return task.Weight || 0;
  }
  
  // 3. Within task duration -> Linear interpolation
  const totalDuration = Math.max(1, Math.floor((taskEnd - taskStart) / (1000 * 60 * 60 * 24)) + 1);
  const daysPassed = Math.max(0, Math.floor((check - taskStart) / (1000 * 60 * 60 * 24)) + 1);
  
  const progressRatio = daysPassed / totalDuration;
  return progressRatio * (task.Weight || 0);
}

// Helper: Get date range for project
function getDateRange(startDate, endDate) {
  const dates = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  
  current.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

// Main function: Generate S-Curve data points
window.generateSCurveData = function(project, tasks) {
  if (!project || !tasks || tasks.length === 0) {
    return [];
  }
  
  const projectStart = new Date(project.StartDate);
  const projectEnd = new Date(project.EndDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dateRange = getDateRange(projectStart, projectEnd);
  const dataPoints = [];
  
  dateRange.forEach(currentDate => {
    const dateString = currentDate.toISOString().split('T')[0];
    
    // Calculate cumulative planned progress
    let dailyPlanned = 0;
    tasks.forEach(task => {
      dailyPlanned += getPlannedTaskProgress(task, currentDate);
    });
    
    // Calculate cumulative actual progress
    // Only show actual for past dates and today
    let dailyActual = null;
    if (currentDate <= today) {
      dailyActual = tasks.reduce((acc, task) => {
        const taskWeight = task.Weight || 0;
        const taskProgress = task.Progress || 0;
        const contribution = (taskProgress / 100) * taskWeight;
        return acc + contribution;
      }, 0);
    }
    
    dataPoints.push({
      date: dateString,
      planned: parseFloat(dailyPlanned.toFixed(2)),
      actual: dailyActual !== null ? parseFloat(dailyActual.toFixed(2)) : null
    });
  });
  
  return dataPoints;
};

// Validation: Check if total task weights equal 100%
window.validateTaskWeights = function(tasks) {
  const totalWeight = tasks.reduce((sum, task) => sum + (task.Weight || 0), 0);
  return Math.abs(totalWeight - 100) < 0.01; // Allow small floating point errors
};

// Calculate Schedule Performance Index (SPI)
window.calculateSPI = function(plannedProgress, actualProgress) {
  if (!plannedProgress || plannedProgress === 0) return 1;
  return actualProgress / plannedProgress;
};