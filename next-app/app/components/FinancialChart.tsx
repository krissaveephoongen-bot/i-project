'use client';

import {
  ComposedChart,
  Bar,
  Line,
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
  // Calculate profit for the chart
  const chartData = data.map(d => ({
    ...d,
    profit: d.revenue - d.cost
  }));

  return (
    <div>
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(value) => `฿${(Number(value) / 1000).toFixed(0)}k`} tickLine={false} axisLine={false} />
          <Tooltip
            formatter={(value, name) => [`฿${Number(value).toLocaleString()}`, name]}
            contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
          <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
          <Bar dataKey="cost" name="Cost" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
          <Line type="monotone" dataKey="profit" name="Net Profit" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
