function SCurveAnalysis() {
  const chartRef = React.useRef(null);
  const chartInstance = React.useRef(null);
  const [projects, setProjects] = React.useState([]);
  const [selectedProject, setSelectedProject] = React.useState(null);

  React.useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    if (typeof trickleListObjects !== 'function') {
      console.log('trickleListObjects not available');
      return;
    }
    
    try {
      const result = await trickleListObjects('project', 50, true);
      if (!result || !result.items) {
        console.log('No project data returned');
        return;
      }
      const activeProjects = result.items.filter(p => p.objectData?.Status === 'active');
      setProjects(activeProjects);
      if (activeProjects.length > 0) {
        setSelectedProject(activeProjects[0]);
      }
    } catch (error) {
      console.error('SCurveAnalysis loadProjects error:', error);
      setProjects([]);
    }
  };

  const generateMonthlyLabels = (startDate, endDate) => {
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const labels = [];
    
    let current = new Date(start.getFullYear(), start.getMonth(), 1);
    const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
    
    while (current <= endMonth) {
      labels.push(`${months[current.getMonth()]}`);
      current.setMonth(current.getMonth() + 1);
    }
    
    return labels;
  };

  React.useEffect(() => {
    if (chartRef.current && selectedProject) {
      const ctx = chartRef.current.getContext('2d');
      
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const monthLabels = generateMonthlyLabels(
        selectedProject.objectData.StartDate, 
        selectedProject.objectData.EndDate
      );
      const monthCount = monthLabels.length - 1;
      const planData = [];
      for (let i = 0; i <= monthCount; i++) {
        planData.push(Math.round((i / monthCount) * 100));
      }

      const actualProgress = parseFloat(selectedProject.objectData.Progress || 0);
      const currentMonth = Math.floor(monthCount * actualProgress / 100);
      const actualData = planData.map((val, idx) => 
        idx <= currentMonth ? Math.min(val, actualProgress) : null
      );

      chartInstance.current = new window.Chart(ctx, {
        type: 'line',
        data: {
          labels: monthLabels,
          datasets: [
            {
              label: 'แผนความคืบหน้า',
              data: planData,
              borderColor: '#94A3B8',
              backgroundColor: 'rgba(148, 163, 184, 0.1)',
              borderWidth: 2,
              tension: 0.4,
              fill: true
            },
            {
              label: 'ความคืบหน้าจริง',
              data: actualData,
              borderColor: '#0EA5E9',
              backgroundColor: 'rgba(14, 165, 233, 0.1)',
              borderWidth: 3,
              tension: 0.4,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: {
                callback: (value) => value + '%'
              }
            }
          }
        }
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [selectedProject]);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">S-Curve Analysis</h3>
        <select 
          value={selectedProject?.objectId || ''} 
          onChange={(e) => setSelectedProject(projects.find(p => p.objectId === e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          {projects.map(p => (
            <option key={p.objectId} value={p.objectId}>{p.objectData.Name}</option>
          ))}
        </select>
      </div>
      <div style={{ height: '300px' }}>
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
}
