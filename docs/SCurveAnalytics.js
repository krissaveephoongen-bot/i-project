function SCurveAnalytics({ selectedProject, onProjectSelect }) {
  const [projects, setProjects] = React.useState([]);
  const chartRef = React.useRef(null);
  const chartInstance = React.useRef(null);
  const { scurveData, loading } = useProjectAnalytics(selectedProject?.objectId);

  React.useEffect(() => {
    loadProjects();
  }, []);

  React.useEffect(() => {
    if (chartRef.current && scurveData.length > 0 && selectedProject) {
      renderChart();
    }
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [scurveData, selectedProject]);

  const loadProjects = async () => {
    try {
      const response = await trickleListObjects('project', 100, true);
      setProjects(response.items || []);
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
    }
  };

  const renderChart = () => {
    const ctx = chartRef.current.getContext('2d');
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ChartJS = window.Chart;
    chartInstance.current = new ChartJS(ctx, {
      type: 'line',
      data: {
        labels: scurveData.map(d => d.dateLabel),
        datasets: [
          {
            label: 'Planned',
            data: scurveData.map(d => d.planned),
            borderColor: '#94A3B8',
            backgroundColor: 'rgba(148, 163, 184, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true
          },
          {
            label: 'Actual',
            data: scurveData.map(d => d.actual),
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 3,
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: true, position: 'top' } },
        scales: {
          y: { beginAtZero: true, max: 100, ticks: { callback: (val) => val + '%' } }
        }
      }
    });
  };

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-white/30 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-900">S-Curve Analysis</h2>
        <select
          className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedProject?.objectId || ''}
          onChange={(e) => {
            const project = projects.find(p => p.objectId === e.target.value);
            onProjectSelect(project);
          }}
        >
          <option value="">Select Project</option>
          {projects.map(p => (
            <option key={p.objectId} value={p.objectId}>{p.objectData.Name}</option>
          ))}
        </select>
      </div>
      <div className="h-96">
        {!selectedProject ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="icon-folder-open text-5xl text-slate-300 mb-4"></div>
            <p className="text-slate-500">Select a project to view analytics</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-slate-500">Loading chart...</div>
          </div>
        ) : (
          <canvas ref={chartRef}></canvas>
        )}
      </div>
    </div>
  );
}