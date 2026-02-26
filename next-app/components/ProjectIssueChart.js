function ProjectIssueChart() {
  try {
    const chartRef = React.useRef(null);
    const chartInstance = React.useRef(null);

    React.useEffect(() => {
      if (chartRef.current) {
        const ctx = chartRef.current.getContext("2d");
        if (chartInstance.current) chartInstance.current.destroy();

        chartInstance.current = new window.Chart(ctx, {
          type: "doughnut",
          data: {
            labels: ["Inprogress", "Close Issue"],
            datasets: [
              {
                data: [5, 3],
                backgroundColor: ["#EF4444", "#22C55E"],
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
                text: "Project Issue",
                font: { size: 14, weight: "bold" },
              },
            },
          },
        });
      }
      return () => {
        if (chartInstance.current) chartInstance.current.destroy();
      };
    }, []);

    return (
      <div className="bg-white rounded-xl p-4 shadow-sm border border-[var(--slate-200)]">
        <div className="h-56 relative">
          <canvas ref={chartRef}></canvas>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-bold text-[var(--navy-900)]">
                8 Issue
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("ProjectIssueChart error:", error);
    return null;
  }
}
