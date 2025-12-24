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
    <div className="bg-background-base rounded-lg border border-neutral-200 p-6 shadow-sm">
      <h2 className="text-xl font-bold text-neutral-900 mb-4">Today's Overview</h2>
      <div className="grid grid-cols-2 gap-4">
        {/* Tasks - Primary Color (Teal/Green) */}
        <div className="p-4 bg-primary-50 rounded-lg border border-primary-200 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="icon-check-square text-2xl text-primary-600"></div>
            <div className="text-3xl font-bold text-primary-600">{stats.tasksToday}</div>
          </div>
          <div className="text-sm text-neutral-600 font-medium">Tasks Today</div>
        </div>
        {/* Hours - Secondary/Accent Color (Blue) */}
        <div className="p-4 bg-accent-50 rounded-lg border border-accent-200 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="icon-clock text-2xl text-accent-600"></div>
            <div className="text-3xl font-bold text-accent-600">{stats.hoursLogged}h</div>
          </div>
          <div className="text-sm text-neutral-600 font-medium">Hours Logged</div>
        </div>
        {/* Projects - Success Color (Green, already Primary) */}
        <div className="p-4 bg-success-50 rounded-lg border border-success-200 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="icon-folder text-2xl text-success-600"></div>
            <div className="text-3xl font-bold text-success-600">{stats.projectsActive}</div>
          </div>
          <div className="text-sm text-neutral-600 font-medium">Active Projects</div>
        </div>
        {/* Completion Rate - Warning Color (Amber/Yellow) */}
        <div className="p-4 bg-warning-50 rounded-lg border border-warning-200 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="icon-trending-up text-2xl text-warning-600"></div>
            <div className="text-3xl font-bold text-warning-600">{stats.completionRate}%</div>
          </div>
          <div className="text-sm text-neutral-600 font-medium">Completion Rate</div>
        </div>
      </div>
    </div>
  );
}