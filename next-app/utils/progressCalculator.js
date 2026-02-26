const ProgressCalculator = {
  calculateTaskActualProgress: (task, worklogs) => {
    if (
      !task.objectData.EstimatedHours ||
      task.objectData.EstimatedHours === 0
    ) {
      return task.objectData.Progress || 0;
    }

    const taskLogs = worklogs.filter(
      (log) =>
        log.objectData.TaskId === task.objectId &&
        log.objectData.Status === "approved",
    );

    const totalLoggedHours = taskLogs.reduce(
      (sum, log) => sum + (log.objectData.Hours || 0),
      0,
    );
    const progress = Math.min(
      100,
      (totalLoggedHours / task.objectData.EstimatedHours) * 100,
    );

    return progress;
  },

  calculateProjectActualProgress: (tasks, worklogs) => {
    if (!tasks || tasks.length === 0) return 0;

    const totalWeight = tasks.reduce(
      (sum, task) => sum + (task.objectData.Weight || 0),
      0,
    );

    if (totalWeight === 0) return 0;

    const weightedProgress = tasks.reduce((sum, task) => {
      const actualProgress = ProgressCalculator.calculateTaskActualProgress(
        task,
        worklogs,
      );
      return sum + task.objectData.Weight * actualProgress;
    }, 0);

    return weightedProgress / totalWeight;
  },

  validateTaskWeights: (tasks) => {
    const totalWeight = tasks.reduce(
      (sum, task) => sum + (task.objectData.Weight || 0),
      0,
    );
    return {
      isValid: Math.abs(totalWeight - 100) < 0.01,
      totalWeight: totalWeight,
      difference: 100 - totalWeight,
    };
  },

  getTasksWithActualProgress: (tasks, worklogs) => {
    return tasks.map((task) => ({
      ...task,
      actualProgress: ProgressCalculator.calculateTaskActualProgress(
        task,
        worklogs,
      ),
    }));
  },
};
