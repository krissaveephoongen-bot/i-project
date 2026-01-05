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

        // Create new chart with traffic light status colors
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
              // Traffic light system: Blue (active) | Green (completed) | Yellow (planning) | Red (on-hold)
              backgroundColor: [
                '#0ea5e9',  // Accent Blue for active
                '#22c55e',  // Primary Green for completed
                '#f59e0b',  // Amber/Yellow for planning
                '#ef4444'   // Error Red for on-hold
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
      <div className="bg-background-base rounded-lg border border-neutral-200 p-6 shadow-sm" data-name="project-chart" data-file="components/ProjectChart.js">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">สถานะโปรเจกต์</h2>
        
        <div className="relative h-48 mb-4">
          <canvas ref={chartRef}></canvas>
        </div>
        
        {/* Status Legend - Traffic Light System */}
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 rounded-md hover:bg-background-light transition-colors">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-accent-500 rounded-full mr-2"></div>
              <span className="text-sm text-neutral-600 font-medium">กำลังดำเนินการ</span>
            </div>
            <span className="text-sm font-semibold text-neutral-900">{projects.filter(p => p.status === 'active').length}</span>
          </div>
          
          <div className="flex items-center justify-between p-2 rounded-md hover:bg-background-light transition-colors">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-primary-500 rounded-full mr-2"></div>
              <span className="text-sm text-neutral-600 font-medium">เสร็จแล้ว</span>
            </div>
            <span className="text-sm font-semibold text-neutral-900">{projects.filter(p => p.status === 'completed').length}</span>
          </div>
          
          <div className="flex items-center justify-between p-2 rounded-md hover:bg-background-light transition-colors">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-warning-500 rounded-full mr-2"></div>
              <span className="text-sm text-neutral-600 font-medium">วางแผน</span>
            </div>
            <span className="text-sm font-semibold text-neutral-900">{projects.filter(p => p.status === 'planning').length}</span>
          </div>
          
          <div className="flex items-center justify-between p-2 rounded-md hover:bg-background-light transition-colors">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-error-500 rounded-full mr-2"></div>
              <span className="text-sm text-neutral-600 font-medium">หยุดชั่วคราว</span>
            </div>
            <span className="text-sm font-semibold text-neutral-900">{projects.filter(p => p.status === 'on-hold').length}</span>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('ProjectChart component error:', error);
    return null;
  }
}