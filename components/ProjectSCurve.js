function ProjectSCurve({ project, projectData }) {
  try {
    const chartRef = React.useRef(null);
    const chartInstance = React.useRef(null);

    const generateMonthlyData = () => {
      if (!project || !projectData) return { labels: [], planData: [], actualData: [] };

      const start = new Date(project.objectData.StartDate);
      const end = new Date(project.objectData.EndDate);
      const now = new Date();
      
      const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
      const labels = [];
      const planData = [];
      const actualData = [];

      let current = new Date(start.getFullYear(), start.getMonth(), 1);
      const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
      
      let monthIndex = 0;
      while (current <= endMonth) {
        labels.push(`${months[current.getMonth()]} ${(current.getFullYear() + 543).toString().slice(-2)}`);
        
        const totalMonths = Math.ceil((endMonth - new Date(start.getFullYear(), start.getMonth(), 1)) / (1000 * 60 * 60 * 24 * 30));
        const planProgress = Math.round((monthIndex / totalMonths) * 100);
        planData.push(planProgress);
        
        if (current <= now) {
          actualData.push(Math.min(projectData.actualProgress, planProgress));
        } else {
          actualData.push(null);
        }
        
        current.setMonth(current.getMonth() + 1);
        monthIndex++;
      }

      return { labels, planData, actualData };
    };

    React.useEffect(() => {
      if (chartRef.current && project && projectData) {
        const ctx = chartRef.current.getContext('2d');
        if (chartInstance.current) chartInstance.current.destroy();

        const { labels, planData, actualData } = generateMonthlyData();

        chartInstance.current = new window.Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [{
              label: 'แผน',
              data: planData,
              borderColor: '#3B82F6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderWidth: 2,
              pointRadius: 3,
              tension: 0.4,
              fill: true
            }, {
              label: 'ผลงานจริง',
              data: actualData,
              borderColor: '#EF4444',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderWidth: 3,
              pointRadius: 3,
              tension: 0.4,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
              legend: { display: true, position: 'bottom' },
              title: { display: true, text: 'ความคืบหน้าโครงการ', font: { size: 14, weight: 'bold' } }
            },
            scales: {
              y: { 
                beginAtZero: true, 
                max: 100,
                ticks: { callback: v => v + '%' }
              }
            }
          }
        });
      }
      return () => { if (chartInstance.current) chartInstance.current.destroy(); };
    }, [project, projectData]);

    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-[var(--slate-200)]">
        <div className="h-80">
          <canvas ref={chartRef}></canvas>
        </div>
        <div className="text-xs text-[var(--slate-600)] mt-2">
          ข้อมูลคำนวณจากความคืบหน้าของงานทั้งหมดในโครงการ โดยเทียบกับแผนงานที่วางไว้
        </div>
      </div>
    );
  } catch (error) {
    console.error('ProjectSCurve error:', error);
    return null;
  }
}
