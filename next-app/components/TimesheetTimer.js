function TimesheetTimer() {
  const [isRunning, setIsRunning] = React.useState(false);
  const [startTime, setStartTime] = React.useState(null);
  const [elapsed, setElapsed] = React.useState(0);

  React.useEffect(() => {
    let interval;
    if (isRunning && startTime) {
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  const handleStart = () => {
    setStartTime(Date.now());
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setStartTime(null);
    setElapsed(0);
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Quick Timer</h3>
      <div className="text-center mb-6">
        <div className="text-5xl font-mono font-bold text-[var(--primary-color)] mb-2">
          {formatTime(elapsed)}
        </div>
        <p className="text-sm text-[var(--text-secondary)]">Current Session</p>
      </div>
      <div className="flex gap-2">
        {!isRunning ? (
          <button onClick={handleStart} className="btn-primary flex-1">
            <div className="icon-play text-sm mr-2"></div>
            Start
          </button>
        ) : (
          <button onClick={handleStop} className="btn-secondary flex-1">
            <div className="icon-pause text-sm mr-2"></div>
            Pause
          </button>
        )}
        <button onClick={handleReset} className="btn-secondary">
          <div className="icon-refresh-cw text-sm"></div>
        </button>
      </div>
      {elapsed > 0 && (
        <button
          onClick={() => (window.location.href = "worklog.html")}
          className="w-full mt-3 text-sm text-[var(--primary-color)] hover:underline"
        >
          <div className="icon-save text-sm mr-1"></div>
          Save to Timesheet
        </button>
      )}
    </div>
  );
}
