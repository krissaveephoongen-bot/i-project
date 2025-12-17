function DashboardStats({ projects, tasks }) {
  try {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = tasks.filter(t => t.status === 'todo' || t.status === 'progress').length;

    const stats = [
      {
        title: 'โปรเจกต์ทั้งหมด',
        value: totalProjects,
        change: '+12%',
        changeType: 'positive',
        icon: 'folder',
        color: 'blue'
      },
      {
        title: 'โปรเจกต์ที่กำลังดำเนินการ',
        value: activeProjects,
        change: '+8%',
        changeType: 'positive',
        icon: 'play-circle',
        color: 'green'
      },
      {
        title: 'งานที่เสร็จแล้ว',
        value: completedTasks,
        change: `${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%`,
        changeType: 'positive',
        icon: 'check-circle',
        color: 'emerald'
      },
      {
        title: 'งานค้างอยู่',
        value: pendingTasks,
        change: '-5%',
        changeType: 'negative',
        icon: 'clock',
        color: 'orange'
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-name="dashboard-stats" data-file="components/DashboardStats.js">
        {stats.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)] mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{stat.value}</p>
                <div className="flex items-center mt-2">
                  <span className={`text-xs font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)] ml-1">จากเดือนที่แล้ว</span>
                </div>
              </div>
              <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${
                stat.color === 'blue' ? 'bg-blue-50 border border-blue-100' :
                stat.color === 'green' ? 'bg-emerald-50 border border-emerald-100' :
                stat.color === 'emerald' ? 'bg-teal-50 border border-teal-100' :
                'bg-amber-50 border border-amber-100'
              }`}>
                <div className={`icon-${stat.icon} text-xl ${
                  stat.color === 'blue' ? 'text-blue-600' :
                  stat.color === 'green' ? 'text-emerald-600' :
                  stat.color === 'emerald' ? 'text-teal-600' :
                  'text-amber-600'
                }`}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  } catch (error) {
    console.error('DashboardStats component error:', error);
    return null;
  }
}