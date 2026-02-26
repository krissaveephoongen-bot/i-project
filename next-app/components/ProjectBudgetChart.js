function ProjectBudgetChart({ project, projectData }) {
  try {
    const chartRef = React.useRef(null);
    const chartInstance = React.useRef(null);

    React.useEffect(() => {
      if (chartRef.current && project && projectData) {
        const ctx = chartRef.current.getContext("2d");
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }

        const budget = parseFloat(project.objectData.Budget) || 0;
        const actualCost = projectData.totalExpenses || 0;
        const remaining = Math.max(0, budget - actualCost);

        chartInstance.current = new window.Chart(ctx, {
          type: "doughnut",
          data: {
            labels: ["ใช้จ่ายแล้ว", "คงเหลือ"],
            datasets: [
              {
                data: [actualCost, remaining],
                backgroundColor: ["#F97316", "#3B82F6"],
                borderWidth: 0,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "70%",
            plugins: {
              legend: { display: true, position: "bottom" },
              title: {
                display: true,
                text: "งบประมาณโครงการ",
                font: { size: 14, weight: "bold" },
              },
            },
          },
        });
      }
      return () => {
        if (chartInstance.current) chartInstance.current.destroy();
      };
    }, [project, projectData]);

    return (
      <div className="bg-white rounded-xl p-4 shadow-sm border border-[var(--slate-200)]">
        <div className="h-56 relative">
          <canvas ref={chartRef}></canvas>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-xs text-gray-500">งบประมาณ</div>
              <div className="text-sm font-bold text-[var(--navy-900)]">
                ฿{(project?.objectData?.Budget || 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("ProjectBudgetChart error:", error);
    return null;
  }
}
