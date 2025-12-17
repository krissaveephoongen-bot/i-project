function TodayOverview() {
  const [stats, setStats] = React.useState({
    tasksToday: 0,
    hoursLogged: 0,
    projectsActive: 0,
    completionRate: 0
  });

  React.useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      if (typeof trickleListObjects !== 'function') {
        setStats({ tasksToday: 3, hoursLogged: 6.5, projectsActive: 2, completionRate: 75 });
        return;
      }
      
      const projects = await trickleListObjects('project', 50, true).catch(() => ({ items: [] }));
      const activeProjects = projects.items?.filter(p => p.objectData?.Status === 'active') || [];
      
      setStats({
        tasksToday: 3,
        hoursLogged: 6.5,
        projectsActive: activeProjects.length || 0,
        completionRate: 75
      });
    } catch (error) {
      console.error('TodayOverview error:', error);
      setStats({ tasksToday: 0, hoursLogged: 0, projectsActive: 0, completionRate: 0 });
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4">Today's Overview</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="icon-check-square text-2xl text-blue-600"></div>
            <div className="text-3xl font-bold text-blue-600">{stats.tasksToday}</div>
          </div>
          <div className="text-sm text-[var(--text-secondary)]">Tasks Today</div>
        </div>
        <div className="p-4 bg-purple-50 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="icon-clock text-2xl text-purple-600"></div>
            <div className="text-3xl font-bold text-purple-600">{stats.hoursLogged}h</div>
          </div>
          <div className="text-sm text-[var(--text-secondary)]">Hours Logged</div>
        </div>
        <div className="p-4 bg-green-50 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="icon-folder text-2xl text-green-600"></div>
            <div className="text-3xl font-bold text-green-600">{stats.projectsActive}</div>
          </div>
          <div className="text-sm text-[var(--text-secondary)]">Active Projects</div>
        </div>
        <div className="p-4 bg-orange-50 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="icon-trending-up text-2xl text-orange-600"></div>
            <div className="text-3xl font-bold text-orange-600">{stats.completionRate}%</div>
          </div>
          <div className="text-sm text-[var(--text-secondary)]">Completion Rate</div>
        </div>
      </div>
    </div>
  );
}