function TaskProgressIndicator({ task, worklogs }) {
  const [actualProgress, setActualProgress] = React.useState(0);

  React.useEffect(() => {
    calculateActualProgress();
  }, [task, worklogs]);

  const calculateActualProgress = () => {
    if (!task.objectData.EstimatedHours || task.objectData.EstimatedHours === 0) {
      setActualProgress(task.objectData.Progress || 0);
      return;
    }

    const taskLogs = worklogs.filter(log => 
      log.objectData.TaskId === task.objectId && 
      log.objectData.Status === 'approved'
    );

    const totalLoggedHours = taskLogs.reduce((sum, log) => sum + (log.objectData.Hours || 0), 0);
    const progress = Math.min(100, (totalLoggedHours / task.objectData.EstimatedHours) * 100);
    setActualProgress(progress);
  };

  const manualProgress = task.objectData.Progress || 0;
  const estimatedHours = task.objectData.EstimatedHours || 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600">
          {estimatedHours > 0 ? 'Worklog-based Progress' : 'Manual Progress'}
        </span>
        <span className="font-semibold">{actualProgress.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${actualProgress}%` }}
        ></div>
      </div>
      {estimatedHours > 0 && Math.abs(actualProgress - manualProgress) > 5 && (
        <div className="text-xs text-amber-600 flex items-center gap-1">
          <div className="icon-alert-circle text-sm"></div>
          <span>Manual: {manualProgress}%, Worklog: {actualProgress.toFixed(1)}%</span>
        </div>
      )}
    </div>
  );
}