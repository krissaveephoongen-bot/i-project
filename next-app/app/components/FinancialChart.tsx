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

interface FinancialChartProps {
  data: {
    month: string;
    revenue: number;
    cost: number;
  }[];
}

export default function FinancialChart({ data }: FinancialChartProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Financial Overview</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
          <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `฿${Number(value) / 1000000}M`} />
          <Tooltip
            formatter={(value) => [`฿${Number(value).toLocaleString()}`, '']}
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
          />
          <Legend />
          <Bar dataKey="revenue" name="Revenue" fill="#2563EB" radius={[4, 4, 0, 0]} />
          <Bar dataKey="cost" name="Cost (Sub-con + PM)" fill="#94A3B8" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
