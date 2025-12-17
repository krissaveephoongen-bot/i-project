function SummaryCards({ selectedProject }) {
  const [stats, setStats] = React.useState({
    totalProjects: 0,
    totalMandays: 0,
    budgetBurn: 0,
    overallHealth: 'loading'
  });

  React.useEffect(() => {
    loadStats();
  }, [selectedProject]);

  const loadStats = async () => {
    try {
      const [projectsRes, worklogsRes, expensesRes] = await Promise.all([
        trickleListObjects('project', 100, true).catch(() => ({ items: [] })),
        trickleListObjects('worklog', 500, true).catch(() => ({ items: [] })),
        trickleListObjects('expense', 500, true).catch(() => ({ items: [] }))
      ]);

      const projects = projectsRes.items || [];
      const worklogs = worklogsRes.items || [];
      const expenses = expensesRes.items || [];

      const activeProjects = projects.filter(p => 
        p.objectData && p.objectData.Status === 'active'
      );

      const approvedLogs = worklogs.filter(w => 
        w.objectData && w.objectData.Status === 'approved'
      );
      
      const totalHours = approvedLogs.reduce((sum, w) => sum + (w.objectData.Hours || 0), 0);
      const totalMandays = totalHours / 8;

      let budgetBurn = 0;
      if (selectedProject && selectedProject.objectData) {
        const projectExpenses = expenses.filter(e =>
          e.objectData && 
          e.objectData.ProjectId === selectedProject.objectId &&
          e.objectData.Status === 'approved'
        );
        const totalExpense = projectExpenses.reduce((sum, e) => 
          sum + (e.objectData.Amount || 0), 0
        );
        budgetBurn = (totalExpense / (selectedProject.objectData.Budget || 1)) * 100;
      }

      setStats({
        totalProjects: activeProjects.length,
        totalMandays: totalMandays.toFixed(1),
        budgetBurn: budgetBurn.toFixed(1),
        overallHealth: budgetBurn > 90 ? 'at-risk' : budgetBurn > 75 ? 'warning' : 'on-track'
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats({
        totalProjects: 0,
        totalMandays: '0.0',
        budgetBurn: '0.0',
        overallHealth: 'on-track'
      });
    }
  };

  const getHealthBadge = () => {
    const badges = {
      'on-track': { text: 'On Track', color: 'bg-green-100 text-green-700' },
      'warning': { text: 'At Risk', color: 'bg-amber-100 text-amber-700' },
      'at-risk': { text: 'Delayed', color: 'bg-red-100 text-red-700' }
    };
    return badges[stats.overallHealth] || badges['on-track'];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-slate-600">Total Projects</span>
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <div className="icon-briefcase text-lg text-blue-600"></div>
          </div>
        </div>
        <div className="text-3xl font-bold text-slate-900">{stats.totalProjects}</div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-slate-600">Total Mandays</span>
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <div className="icon-calendar text-lg text-indigo-600"></div>
          </div>
        </div>
        <div className="text-3xl font-bold text-slate-900">{stats.totalMandays}</div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-slate-600">Budget Burn</span>
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <div className="icon-trending-up text-lg text-amber-600"></div>
          </div>
        </div>
        <div className="text-3xl font-bold text-slate-900">{stats.budgetBurn}%</div>
        <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
          <div 
            className="bg-amber-500 h-2 rounded-full transition-all"
            style={{ width: `${Math.min(100, stats.budgetBurn)}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-slate-600">Overall Health</span>
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <div className="icon-activity text-lg text-green-600"></div>
          </div>
        </div>
        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getHealthBadge().color}`}>
          {getHealthBadge().text}
        </span>
      </div>
    </div>
  );
}