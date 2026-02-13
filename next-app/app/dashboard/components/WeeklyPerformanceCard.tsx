import { Clock } from 'lucide-react';

interface WeeklyPerformanceCardProps {
  data: any[];
}

export default function WeeklyPerformanceCard({ data }: WeeklyPerformanceCardProps) {
  return (
    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900">ผลงานรายสัปดาห์</h3>
        <Clock className="w-5 h-5 text-slate-400" />
      </div>
      
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left py-3 px-2 font-medium text-slate-500">โครงการ</th>
              <th className="text-right py-3 px-2 font-medium text-slate-500">Actual</th>
              <th className="text-right py-3 px-2 font-medium text-slate-500">Plan</th>
              <th className="text-right py-3 px-2 font-medium text-slate-500">SPI</th>
              <th className="text-right py-3 px-2 font-medium text-slate-500">เปลี่ยนแปลง</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.slice(0, 6).map((w: any) => (
              <tr key={w.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3 px-2 font-medium text-slate-900">{w.name}</td>
                <td className="py-3 px-2 text-right text-slate-600">{Number(w.progress || 0).toFixed(1)}%</td>
                <td className="py-3 px-2 text-right text-slate-600">{Number((w.progress || 0) / (w.spi || 1)).toFixed(1)}%</td>
                <td className="py-3 px-2 text-right font-medium">{Number(w.spi || 1).toFixed(2)}</td>
                <td className="py-3 px-2 text-right">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    Number(w.weeklyDelta || 0) >= 0 
                      ? 'bg-green-50 text-green-700' 
                      : 'bg-red-50 text-red-700'
                  }`}>
                    {Number(w.weeklyDelta || 0) > 0 ? '+' : ''}{Number(w.weeklyDelta || 0).toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
