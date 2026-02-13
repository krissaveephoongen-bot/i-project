import { BarChart as BarChartIcon } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface FinancialChartCardProps {
  data: any[];
}

export default function FinancialChartCard({ data }: FinancialChartCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">ภาพรวมการเงิน (Financial)</h3>
          <p className="text-sm text-slate-500">เปรียบเทียบ ยอดผูกพัน (Committed) vs จ่ายจริง (Paid)</p>
        </div>
        <div className="p-2 bg-slate-50 rounded-lg">
          <BarChartIcon className="w-5 h-5 text-slate-400" />
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v)=>`฿${(v/1000000).toFixed(1)}M`} tickLine={false} axisLine={false} />
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(v: number)=>`฿${v.toLocaleString()}`}
          />
          <Legend iconType="circle" />
          <Bar dataKey="committed" name="Committed" fill="#8b5cf6" radius={[4, 4, 0, 0]} animationDuration={1500} />
          <Bar dataKey="paid" name="Paid" fill="#10b981" radius={[4, 4, 0, 0]} animationDuration={1500} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
