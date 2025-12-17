function QuickStats({ projects }) {
  try {
    const [animatedValues, setAnimatedValues] = React.useState({ total: 0, active: 0, avg: 0, budget: 0 });
    const [expenses, setExpenses] = React.useState([]);
    
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const avgProgress = projects.length > 0 
      ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length) 
      : 0;
    
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);

    React.useEffect(() => {
      loadExpenses();
    }, []);

    React.useEffect(() => {
      const duration = 1000;
      const steps = 50;
      const stepTime = duration / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        
        setAnimatedValues({
          total: Math.floor(totalProjects * progress),
          active: Math.floor(activeProjects * progress),
          avg: Math.floor(avgProgress * progress),
          budget: Math.floor(totalBudget * progress)
        });

        if (currentStep >= steps) {
          clearInterval(timer);
          setAnimatedValues({ total: totalProjects, active: activeProjects, avg: avgProgress, budget: totalBudget });
        }
      }, stepTime);

      return () => clearInterval(timer);
    }, [projects, expenses]);

    const loadExpenses = async () => {
      try {
        if (typeof trickleListObjects !== 'function') {
          console.log('Database API not available');
          setExpenses([]);
          return;
        }
        const result = await trickleListObjects('expense', 100, true).catch(err => {
          console.log('Expense fetch failed:', err.message);
          return { items: [] };
        });
        setExpenses(result?.items || []);
      } catch (error) {
        console.log('Error in loadExpenses:', error.message);
        setExpenses([]);
      }
    };

    React.useEffect(() => {
      loadExpenses();
    }, []);

    React.useEffect(() => {
      const duration = 1000;
      const steps = 50;
      const stepTime = duration / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        
        setAnimatedValues({
          total: Math.floor(totalProjects * progress),
          active: Math.floor(activeProjects * progress),
          avg: Math.floor(avgProgress * progress),
          budget: Math.floor(totalBudget * progress)
        });

        if (currentStep >= steps) {
          clearInterval(timer);
          setAnimatedValues({ total: totalProjects, active: activeProjects, avg: avgProgress, budget: totalBudget });
        }
      }, stepTime);

      return () => clearInterval(timer);
    }, [projects, expenses]);

    const totalExpenses = expenses.reduce((sum, e) => sum + (e.objectData?.Amount || 0), 0);
    
    const stats = [
      {
        title: 'โครงการทั้งหมด',
        value: animatedValues.total,
        subtitle: `${completedProjects} เสร็จแล้ว`,
        icon: 'folder',
        bgColor: 'from-blue-50 to-blue-100',
        iconColor: 'text-blue-600',
        link: 'projects.html'
      },
      {
        title: 'โครงการที่กำลังดำเนินการ',
        value: animatedValues.active,
        subtitle: `${totalProjects - activeProjects - completedProjects} อื่นๆ`,
        icon: 'play-circle',
        bgColor: 'from-emerald-50 to-emerald-100',
        iconColor: 'text-emerald-600',
        link: 'projects.html'
      },
      {
        title: 'ความคืบหน้าเฉลี่ย',
        value: `${animatedValues.avg}%`,
        subtitle: 'ทุกโครงการ',
        icon: 'trending-up',
        bgColor: 'from-purple-50 to-purple-100',
        iconColor: 'text-purple-600',
        link: 'projects.html'
      },
      {
        title: 'งบประมาณรวม',
        value: `฿${(animatedValues.budget || 0).toLocaleString()}`,
        subtitle: `ใช้ไปแล้ว ฿${totalExpenses.toLocaleString()}`,
        icon: 'wallet',
        bgColor: 'from-amber-50 to-amber-100',
        iconColor: 'text-amber-600',
        link: 'expenses.html'
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-name="quick-stats" data-file="components/QuickStats.js">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            onClick={() => window.location.href = stat.link}
            className="card hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)] mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-[var(--text-primary)] mb-1">{stat.value}</p>
                <p className="text-xs text-[var(--text-secondary)]">{stat.subtitle}</p>
              </div>
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-md bg-gradient-to-br ${stat.bgColor} group-hover:scale-110 transition-transform`}>
                <div className={`icon-${stat.icon} text-2xl ${stat.iconColor}`}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  } catch (error) {
    console.error('QuickStats component error:', error);
    return null;
  }
}
