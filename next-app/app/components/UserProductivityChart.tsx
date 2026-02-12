'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface UserProductivityChartProps {
  data: {
    name: string;
    total_hours: number;
  }[];
}

export default function UserProductivityChart({ data }: UserProductivityChartProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Hours Logged per Resource (Last 30 Days)</h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart 
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis type="number" stroke="#64748b" fontSize={12} />
          <YAxis 
            type="category" 
            dataKey="name" 
            stroke="#64748b" 
            fontSize={12}
            width={100}
            tick={{ textAnchor: 'end' }}
          />
          <Tooltip
            formatter={(value) => [`${Number(value).toLocaleString()} hours`, 'Total Logged']}
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
          />
          <Bar dataKey="total_hours" name="Hours Logged" fill="#3b82f6" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
