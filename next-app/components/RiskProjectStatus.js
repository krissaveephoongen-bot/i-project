function RiskProjectStatus({ projects = [] }) {
  try {
    const chartRef = React.useRef(null);
    const chartInstance = React.useRef(null);

    const riskData = React.useMemo(() => {
      const risks = { อันตราย: 0, สูง: 0, ปานกลาง: 0, ต่ำ: 0 };
      if (!Array.isArray(projects)) return risks;
      projects.forEach((p) => {
        if (!p) return;
        const progress = p.actualProgress || 0;
        if (progress < 25) risks.อันตราย++;
        else if (progress < 50) risks.สูง++;
        else if (progress < 75) risks.ปานกลาง++;
        else risks.ต่ำ++;
      });
      return risks;
    }, [projects]);

    React.useEffect(() => {
      if (chartRef.current) {
        const ctx = chartRef.current.getContext("2d");
        if (chartInstance.current) chartInstance.current.destroy();

        chartInstance.current = new window.Chart(ctx, {
          type: "doughnut",
          data: {
            labels: ["อันตราย", "สูง", "ปานกลาง", "ต่ำ"],
            datasets: [
              {
                data: [
                  riskData.อันตราย,
                  riskData.สูง,
                  riskData.ปานกลาง,
                  riskData.ต่ำ,
                ],
                backgroundColor: ["#EF4444", "#F97316", "#FBBF24", "#10B981"],
                borderWidth: 0,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "65%",
            plugins: {
              legend: { display: true, position: "bottom" },
            },
          },
        });
      }
      return () => {
        if (chartInstance.current) chartInstance.current.destroy();
      };
    }, [riskData]);

    return (
      <div className="card">
        <h3 className="text-lg font-bold text-blue-600 mb-4 text-center">
          Risk Project Status
        </h3>
        <div className="h-64 relative">
          <canvas ref={chartRef}></canvas>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {projects.length}
              </div>
              <div className="text-xs text-gray-500">Projects</div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("RiskProjectStatus error:", error);
    return null;
  }
}
