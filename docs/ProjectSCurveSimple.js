const { useState, useEffect, useRef } = React;

function ProjectSCurveSimple({ projectId }) {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        renderChart();
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [projectId]);

    const renderChart = () => {
        if (!chartRef.current) return;
        if (chartInstance.current) chartInstance.current.destroy();

        const ctx = chartRef.current.getContext('2d');
        const ChartJS = window.Chart;

        chartInstance.current = new ChartJS(ctx, {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                    label: 'Planned',
                    data: [25, 50, 75, 100],
                    borderColor: 'rgb(59, 130, 246)',
                    tension: 0.4
                }, {
                    label: 'Actual',
                    data: [20, 45, 70, 85],
                    borderColor: 'rgb(34, 197, 94)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: true } }
            }
        });
    };

    return (
        <div className="bg-white/70 backdrop-blur-md rounded-xl p-6 border border-white/30">
            <h2 className="text-xl font-semibold mb-4">S-Curve Progress</h2>
            <div className="h-80"><canvas ref={chartRef}></canvas></div>
        </div>
    );
}