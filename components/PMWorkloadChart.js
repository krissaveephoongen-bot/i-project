function PMWorkloadChart({ projects = [] }) {
  try {
    const chartRef = React.useRef(null);
    const chartInstance = React.useRef(null);

    const pmWorkload = React.useMemo(() => {
      if (!Array.isArray(projects) || projects.length === 0) {
        return { 'ไม่มีข้อมูล': 0 };
      }
      const workloadMap = {};
      projects.forEach(p => {
        if (!p || !p.objectData) return;
        const pm = p.objectData.Manager || 'ไม่ระบุ';
        if (!workloadMap[pm]) {
          workloadMap[pm] = 0;
        }
        workloadMap[pm]++;
      });
      return Object.keys(workloadMap).length > 0 ? workloadMap : { 'ไม่มีข้อมูล': 0 };
    }, [projects]);

    React.useEffect(() => {
      if (chartRef.current) {
        const ctx = chartRef.current.getContext('2d');
        if (chartInstance.current) chartInstance.current.destroy();

        const labels = Object.keys(pmWorkload);
        const data = Object.values(pmWorkload);

        chartInstance.current = new window.Chart(ctx, {
          type: 'bar',
          data: {
            labels,
            datasets: [{
              label: 'จำนวนโครงการ',
              data,
              backgroundColor: '#0056D2',
              borderRadius: 8
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              title: { display: false }
            },
            scales: {
              y: { beginAtZero: true, ticks: { stepSize: 1 } }
            }
          }
        });
      }
      return () => { if (chartInstance.current) chartInstance.current.destroy(); };
    }, [pmWorkload]);

    return (
      <div className="card">
        <h3 className="text-lg font-bold text-[var(--navy-900)] mb-4">Project Manager Workload</h3>
        <div className="h-64">
          <canvas ref={chartRef}></canvas>
        </div>
      </div>
    );
  } catch (error) {
    console.error('PMWorkloadChart error:', error);
    return null;
  }
}