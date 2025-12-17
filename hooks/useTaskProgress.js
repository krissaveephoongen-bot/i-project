function useTaskProgress(taskId) {
  const [progress, setProgress] = React.useState({
    manual: 0,
    actual: 0,
    estimatedHours: 0,
    loggedHours: 0,
    mandays: 0,
    loading: true
  });

  React.useEffect(() => {
    if (taskId) {
      loadProgress();
    }
  }, [taskId]);

  const loadProgress = async () => {
    try {
      const [task, timesheetsResponse] = await Promise.all([
        trickleGetObject('task', taskId),
        trickleListObjects('worklog', 500, true)
      ]);

      const taskTimesheets = timesheetsResponse.items.filter(ts =>
        ts.objectData.TaskId === taskId &&
        ts.objectData.Status === 'approved'
      );

      const loggedHours = taskTimesheets.reduce((sum, ts) => 
        sum + (ts.objectData.Hours || 0), 0
      );

      const estimatedHours = task.objectData.EstimatedHours || 0;
      const manualProgress = task.objectData.Progress || 0;

      let actualProgress = manualProgress;
      if (estimatedHours > 0) {
        actualProgress = Math.min(100, (loggedHours / estimatedHours) * 100);
      }

      setProgress({
        manual: manualProgress,
        actual: actualProgress,
        estimatedHours,
        loggedHours,
        mandays: MandayService.calculateManday(loggedHours),
        loading: false
      });
    } catch (error) {
      console.error('Error loading task progress:', error);
      setProgress(prev => ({ ...prev, loading: false }));
    }
  };

  return { ...progress, refresh: loadProgress };
}