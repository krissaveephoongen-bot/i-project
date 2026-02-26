function SCurveChart({ projectId }) {
  try {
    const chartRef = React.useRef(null);
    const chartInstance = React.useRef(null);
    const { scurveData, loading } = useProjectAnalytics(projectId);

    React.useEffect(() => {
      if (chartRef.current && scurveData.length > 0) {
        const ctx = chartRef.current.getContext("2d");

        if (chartInstance.current) {
          chartInstance.current.destroy();
        }

        chartInstance.current = new window.Chart(ctx, {
          type: "line",
          data: {
            labels: scurveData.map((d) => d.dateLabel),
            datasets: [
              {
                label: "Planned Progress (%)",
                data: scurveData.map((d) => d.planned),
                borderColor: "#94A3B8",
                backgroundColor: "rgba(148, 163, 184, 0.1)",
                borderWidth: 2,
                tension: 0.4,
                fill: true,
              },
              {
                label: "Actual Progress (%)",
                data: scurveData.map((d) => d.actual),
                borderColor: "#0EA5E9",
                backgroundColor: "rgba(14, 165, 233, 0.1)",
                borderWidth: 3,
                tension: 0.4,
                fill: true,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: "top",
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                  callback: function (value) {
                    return value + "%";
                  },
                },
              },
            },
          },
        });
      }

      return () => {
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }
      };
    }, [scurveData]);

    if (loading) {
      return (
        <div
          className="card"
          data-name="scurve-chart"
          data-file="components/SCurveChart.js"
        >
          <div className="text-center py-8">Loading S-Curve data...</div>
        </div>
      );
    }

    return (
      <div
        className="card"
        data-name="scurve-chart"
        data-file="components/SCurveChart.js"
      >
        <h3 className="text-lg font-semibold mb-4">
          S-Curve: Plan vs Actual (Worklog-based)
        </h3>
        <div className="h-80">
          <canvas ref={chartRef}></canvas>
        </div>
      </div>
    );
  } catch (error) {
    console.error("SCurveChart component error:", error);
    return null;
  }
}
