function RealtimeDashboard() {
  const [stats, setStats] = React.useState({
    activeProjects: 0,
    totalTasks: 0,
    pendingApprovals: 0,
    todayLogs: 0
  });
  const [lastUpdate, setLastUpdate] = React.useState(new Date());
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadStats();
    const interval = setInterval(() => {
      loadStats();
      setLastUpdate(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      if (typeof trickleListObjects !== 'function') {
        console.log('trickleListObjects not available, using fallback data');
        setStats({ activeProjects: 0, totalTasks: 0, pendingApprovals: 0, todayLogs: 0 });
        setLoading(false);
        return;
      }

      const [projects, tasks, worklogs, expenses] = await Promise.all([
        trickleListObjects('project', 100, true).catch(err => {
          console.error('Failed to fetch projects:', err);
          return { items: [] };
        }),
        trickleListObjects('task', 100, true).catch(err => {
          console.error('Failed to fetch tasks:', err);
          return { items: [] };
        }),
        trickleListObjects('worklog', 100, true).catch(err => {
          console.error('Failed to fetch worklogs:', err);
          return { items: [] };
        }),
        trickleListObjects('expense', 100, true).catch(err => {
          console.error('Failed to fetch expenses:', err);
          return { items: [] };
        })
      ]);

      const today = new Date().toISOString().split('T')[0];
      
      setStats({
        activeProjects: projects.items?.filter(p => p.objectData?.status === 'active').length || 0,
        totalTasks: tasks.items?.filter(t => t.objectData?.status !== 'completed').length || 0,
        pendingApprovals: (worklogs.items?.filter(w => w.objectData?.status === 'pending').length || 0) + 
                         (expenses.items?.filter(e => e.objectData?.status === 'pending').length || 0),
        todayLogs: worklogs.items?.filter(w => w.objectData?.date === today).length || 0
      });
    } catch (error) {
      console.error('RealtimeDashboard loadStats error:', error);
      setStats({
        activeProjects: 0,
        totalTasks: 0,
        pendingApprovals: 0,
        todayLogs: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'โครงการที่กำลังดำเนินการ', value: stats.activeProjects, icon: 'folder', color: 'blue' },
    { label: 'งานที่ค้างอยู่', value: stats.totalTasks, icon: 'list-checks', color: 'orange' },
    { label: 'รออนุมัติ', value: stats.pendingApprovals, icon: 'clock', color: 'amber' },
    { label: 'บันทึกงานวันนี้', value: stats.todayLogs, icon: 'calendar-check', color: 'green' }
  ];

  if (loading && stats.activeProjects === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-center py-8">
          <div className="icon-loader text-2xl text-blue-600 animate-spin"></div>
          <span className="ml-3 text-gray-600">กำลังโหลดข้อมูล...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">ข้อมูลแบบ Real-time</h2>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className={`icon-refresh-cw text-base ${loading ? 'animate-spin' : ''}`}></div>
          <span>อัพเดทล่าสุด: {lastUpdate.toLocaleTimeString('th-TH')}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                <div className={`icon-${stat.icon} text-xl text-${stat.color}-600`}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}