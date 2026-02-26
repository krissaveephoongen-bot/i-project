function DataVisualization() {
  try {
    const chartRef = React.useRef(null);
    const chartInstance = React.useRef(null);

    React.useEffect(() => {
      if (chartRef.current) {
        const ctx = chartRef.current.getContext("2d");

        if (chartInstance.current) {
          chartInstance.current.destroy();
        }

        chartInstance.current = new ChartJS(ctx, {
          type: "bar",
          data: {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            datasets: [
              {
                label: "Projects",
                data: [12, 19, 15, 25, 22, 30],
                backgroundColor: "rgba(0, 86, 210, 0.7)",
                borderRadius: 8,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
            },
            scales: {
              y: { beginAtZero: true },
            },
          },
        });
      }

      return () => {
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }
      };
    }, []);

    return (
      <div
        className="card"
        data-name="data-visualization"
        data-file="components/DataVisualization.js"
      >
        <h3 className="text-lg font-semibold mb-4">Monthly Project Overview</h3>
        <div className="h-64">
          <canvas ref={chartRef}></canvas>
        </div>
      </div>
    );
  } catch (error) {
    console.error("DataVisualization error:", error);
    return null;
  }
}
