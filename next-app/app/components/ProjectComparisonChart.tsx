"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ProjectComparisonChartProps {
  data: {
    name: string;
    progress_plan: number;
    progress: number; // This is progress_actual
  }[];
}

export default function ProjectComparisonChart({
  data,
}: ProjectComparisonChartProps) {
  const chartData = data.map((item) => ({
    name: item.name,
    Planned: item.progress_plan,
    Actual: item.progress,
  }));

  return (
    <div>
      <h3 className="text-lg font-semibold text-slate-900 mb-4">
        Planned vs. Actual Progress
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="name"
            stroke="#64748b"
            fontSize={12}
            angle={-20}
            textAnchor="end"
            height={70}
            interval={0}
          />
          <YAxis
            stroke="#64748b"
            fontSize={12}
            tickFormatter={(value) => `${value}%`}
            domain={[0, 100]}
          />
          <Tooltip
            formatter={(value) => [`${value}%`, ""]}
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Bar dataKey="Planned" fill="#a5b4fc" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Actual" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
