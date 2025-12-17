import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface SCurveDataPoint {
  month: string;
  date: string;
  plannedPercentage: number;
  actualPercentage: number;
  plannedWeight: number;
  actualWeight: number;
}

interface SCurveChartProps {
  data: SCurveDataPoint[];
  projectName: string;
  isLoading?: boolean;
}

const SCurveChart: React.FC<SCurveChartProps> = ({ data, projectName, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-gray-500">Loading S-Curve chart...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-gray-500">No data available for S-Curve chart</div>
      </div>
    );
  }

  // Transform data for chart display
  const chartData = useMemo(() => {
    const labels = data.map((point) => point.month);
    const plannedData = data.map((point) => parseFloat(point.plannedPercentage.toFixed(2)));
    const actualData = data.map((point) => parseFloat(point.actualPercentage.toFixed(2)));

    return {
      labels,
      datasets: [
        {
          label: 'Planned Progress',
          data: plannedData,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.05)',
          borderWidth: 3,
          pointRadius: 5,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          fill: false,
          tension: 0.4
        },
        {
          label: 'Actual Progress',
          data: actualData,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.05)',
          borderWidth: 3,
          pointRadius: 5,
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          fill: false,
          tension: 0.4
        }
      ]
    };
  }, [data]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            weight: 'normal' as const
          }
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 4,
        titleFont: {
          size: 13,
          weight: 'bold' as const
        },
        bodyFont: {
          size: 12
        },
        callbacks: {
          label: function (context: any) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Progress (%)',
          font: {
            size: 12,
            weight: 'bold' as const
          }
        },
        ticks: {
          callback: function (value: any) {
            return value + '%';
          },
          font: {
            size: 11
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: true
        }
      },
      x: {
        ticks: {
          font: {
            size: 11
          }
        },
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="w-full">
      <div style={{ height: '400px', position: 'relative' }}>
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* Chart Legend */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-blue-500" style={{ width: '20px', height: '3px' }}></div>
          <span className="text-sm text-gray-600">
            Planned Progress - Target trajectory based on task due dates
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-green-500" style={{ width: '20px', height: '3px' }}></div>
          <span className="text-sm text-gray-600">
            Actual Progress - Real completion based on finished tasks
          </span>
        </div>
      </div>
    </div>
  );
};

export default SCurveChart;
