function InvoiceStatus() {
  try {
    const chartRef = React.useRef(null);
    const chartInstance = React.useRef(null);

    React.useEffect(() => {
      if (chartRef.current) {
        const ctx = chartRef.current.getContext("2d");
        if (chartInstance.current) chartInstance.current.destroy();

        chartInstance.current = new ChartJS(ctx, {
          type: "doughnut",
          data: {
            labels: ["Invoice", "Remining"],
            datasets: [
              {
                data: [55, 45],
                backgroundColor: ["#1E40AF", "#F97316"],
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
            },
          },
        });
      }
      return () => {
        if (chartInstance.current) chartInstance.current.destroy();
      };
    }, []);

    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-[var(--slate-200)]">
        <h3 className="font-bold text-[var(--navy-900)] mb-4">
          Status Invoice
        </h3>
        <div className="h-48 relative">
          <canvas ref={chartRef}></canvas>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-xs text-[var(--slate-600)]">55%</div>
              <div className="text-xs text-[var(--slate-600)]">45%</div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("InvoiceStatus error:", error);
    return null;
  }
}
