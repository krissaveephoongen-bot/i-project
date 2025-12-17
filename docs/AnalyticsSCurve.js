function AnalyticsSCurve() {
    const chartRef = React.useRef(null);
    const chartInstance = React.useRef(null);
    const [selectedProject, setSelectedProject] = React.useState('all');
    const [projects, setProjects] = React.useState([]);

    React.useEffect(() => {
        loadProjects();
    }, []);

    React.useEffect(() => {
        if (projects.length > 0) {
            renderChart();
        }
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [selectedProject, projects]);

    const loadProjects = async () => {
        try {
            const data = await trickleListObjects('project', 100, true);
            setProjects(data.items);
        } catch (error) {
            console.error('Load projects error:', error);
        }
    };

    const renderChart = () => {
        if (!chartRef.current) return;
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        const ChartJS = window.Chart;

        chartInstance.current = new ChartJS(ctx, {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                    label: 'Planned Progress',
                    data: [25, 50, 75, 100],
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4
                }, {
                    label: 'Actual Progress',
                    data: [20, 45, 70, 85],
                    borderColor: 'rgb(34, 197, 94)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, labels: { color: '#fff' } }
                },
                scales: {
                    y: { beginAtZero: true, max: 100, ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' } },
                    x: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' } }
                }
            }
        });
    };

    return (
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">S-Curve Analysis</h2>
                <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
                    <option value="all">All Projects</option>
                    {projects.map(p => (
                        <option key={p.objectId} value={p.objectId}>{p.objectData.Name}</option>
                    ))}
                </select>
            </div>
            <div className="h-80">
                <canvas ref={chartRef}></canvas>
            </div>
        </div>
    );
}