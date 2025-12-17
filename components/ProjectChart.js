function ProjectChart({ projects }) {
  try {
    const chartRef = React.useRef(null);
    const chartInstance = React.useRef(null);

    React.useEffect(() => {
      if (chartRef.current && projects.length > 0) {
        const ctx = chartRef.current.getContext('2d');
        
        // Destroy existing chart
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }

        // Prepare data
        const statusCounts = {
          'active': 0,
          'completed': 0,
          'planning': 0,
          'on-hold': 0
        };

        projects.forEach(project => {
          if (statusCounts.hasOwnProperty(project.status)) {
            statusCounts[project.status]++;
          }
        });

        // Create new chart
        chartInstance.current = new ChartJS(ctx, {
          type: 'doughnut',
          data: {
            labels: ['กำลังดำเนินการ', 'เสร็จแล้ว', 'วางแผน', 'หยุดชั่วคราว'],
            datasets: [{
              data: [
                statusCounts.active,
                statusCounts.completed,
                statusCounts.planning,
                statusCounts['on-hold']
              ],
              backgroundColor: [
                '#3B82F6',
                '#10B981',
                '#F59E0B',
                '#EF4444'
              ],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              }
            },
            cutout: '70%'
          }
        });
      }

      return () => {
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }
      };
    }, [projects]);

    return (
      <div className="card" data-name="project-chart" data-file="components/ProjectChart.js">
        <h2 className="text-lg font-semibold mb-4">สถานะโปรเจกต์</h2>
        
        <div className="relative h-48 mb-4">
          <canvas ref={chartRef}></canvas>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-sm text-[var(--text-secondary)]">กำลังดำเนินการ</span>
            </div>
            <span className="text-sm font-medium">{projects.filter(p => p.status === 'active').length}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-[var(--text-secondary)]">เสร็จแล้ว</span>
            </div>
            <span className="text-sm font-medium">{projects.filter(p => p.status === 'completed').length}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <span className="text-sm text-[var(--text-secondary)]">วางแผน</span>
            </div>
            <span className="text-sm font-medium">{projects.filter(p => p.status === 'planning').length}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-sm text-[var(--text-secondary)]">หยุดชั่วคราว</span>
            </div>
            <span className="text-sm font-medium">{projects.filter(p => p.status === 'on-hold').length}</span>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('ProjectChart component error:', error);
    return null;
  }
}