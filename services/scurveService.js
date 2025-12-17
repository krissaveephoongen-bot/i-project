// S-Curve Service with Linear Interpolation
const SCurveService = {
  // Helper: Calculate planned progress for a single task at a specific date
  getPlannedTaskProgress: (task, checkDate) => {
    const taskStart = new Date(task.PlannedStartDate);
    const taskEnd = new Date(task.PlannedEndDate);
    const check = new Date(checkDate);
    
    taskStart.setHours(0, 0, 0, 0);
    taskEnd.setHours(0, 0, 0, 0);
    check.setHours(0, 0, 0, 0);
    
    // Before task start -> 0%
    if (check < taskStart) return 0;
    
    // After task end -> Full weight
    if (check > taskEnd) return task.Weight || 0;
    
    // Within task duration -> Linear interpolation
    const totalDuration = Math.max(1, Math.floor((taskEnd - taskStart) / (1000 * 60 * 60 * 24)) + 1);
    const daysPassed = Math.max(0, Math.floor((check - taskStart) / (1000 * 60 * 60 * 24)) + 1);
    
    const progressRatio = daysPassed / totalDuration;
    return progressRatio * (task.Weight || 0);
  },

  // Calculate actual progress from tasks
  calculateActualProgress: (tasks) => {
    if (!tasks || tasks.length === 0) return 0;
    
    return tasks.reduce((acc, task) => {
      const taskWeight = task.Weight || 0;
      const taskProgress = task.Progress || 0;
      const contribution = (taskProgress / 100) * taskWeight;
      return acc + contribution;
    }, 0);
  },

  // Validate task weights sum to 100%
  validateTaskWeights: (tasks) => {
    const totalWeight = tasks.reduce((sum, task) => sum + (task.Weight || 0), 0);
    return Math.abs(totalWeight - 100) < 0.01;
  },

  // Generate S-Curve data with daily granularity
  generateSCurveData: (project, tasks) => {
    try {
      if (!project || !project.objectData || !tasks || tasks.length === 0) {
        return [];
      }
      
      const projectStart = new Date(project.objectData.StartDate);
      const projectEnd = new Date(project.objectData.EndDate);
      const today = new Date();
      
      projectStart.setHours(0, 0, 0, 0);
      projectEnd.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      if (isNaN(projectStart.getTime()) || isNaN(projectEnd.getTime())) {
        return [];
      }

      const data = [];
      const currentDate = new Date(projectStart);
      
      // Generate daily data points
      while (currentDate <= projectEnd) {
        const dateString = currentDate.toISOString().split('T')[0];
        
        // Calculate cumulative planned progress using Linear Interpolation
        let dailyPlanned = 0;
        tasks.forEach(task => {
          dailyPlanned += SCurveService.getPlannedTaskProgress(task.objectData || task, currentDate);
        });
        
        // Calculate cumulative actual progress (only for past/present)
        let dailyActual = null;
        if (currentDate <= today) {
          dailyActual = SCurveService.calculateActualProgress(
            tasks.map(t => t.objectData || t)
          );
        }
        
        data.push({
          date: dateString,
          dateLabel: currentDate.toLocaleDateString('th-TH', { 
            month: 'short', 
            year: 'numeric' 
          }),
          planned: parseFloat(dailyPlanned.toFixed(2)),
          actual: dailyActual !== null ? parseFloat(dailyActual.toFixed(2)) : null
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return data;
    } catch (error) {
      console.error('Error generating S-Curve data:', error);
      return [];
    }
  },

  // Calculate Schedule Performance Index (SPI)
  calculateSPI: (plannedProgress, actualProgress) => {
    if (!plannedProgress || plannedProgress === 0) return 1;
    return actualProgress / plannedProgress;
  }
};
