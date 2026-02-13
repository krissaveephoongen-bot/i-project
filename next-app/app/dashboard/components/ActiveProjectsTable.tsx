import Link from 'next/link';

interface ActiveProjectsTableProps {
  projects: any[];
}

export default function ActiveProjectsTable({ projects }: ActiveProjectsTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">โครงการที่ดำเนินการอยู่ (Active Projects)</h3>
        <div className="text-sm text-slate-500">
          แสดง {projects.length} โครงการ
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">ชื่อโครงการ</th>
              <th className="text-center py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">ความคืบหน้า</th>
              <th className="text-center py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">SPI</th>
              <th className="text-right py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">งบประมาณ</th>
              <th className="text-right py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">จ่ายจริง</th>
              <th className="text-center py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">ความเสี่ยง</th>
              <th className="text-right py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {projects.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50 transition-all group">
                <td className="py-4 px-6">
                  <div className="flex flex-col">
                    <Link href={`/projects/${r.id}/overview`} className="font-semibold text-slate-900 hover:text-blue-600 transition-colors">
                      {r.name}
                    </Link>
                    <span className={`text-xs mt-1 w-fit px-2 py-0.5 rounded-full ${
                      r.status?.toLowerCase() === 'active' ? 'bg-green-100 text-green-700' :
                      r.status?.toLowerCase() === 'completed' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {r.status || 'Active'}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-sm font-bold text-slate-700">{r.progress?.toFixed(0)}%</span>
                    <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${Math.min(r.progress || 0, 100)}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-center">
                  <span className={`font-bold px-2 py-1 rounded text-sm ${
                    (r.spi || 1) < 0.9 ? 'bg-red-50 text-red-600' :
                    (r.spi || 1) > 1.1 ? 'bg-green-50 text-green-600' :
                    'bg-slate-50 text-slate-700'
                  }`}>
                    {(r.spi || 1).toFixed(2)}
                  </span>
                </td>
                <td className="py-4 px-6 text-right font-medium text-slate-600">
                  ฿{Number(r.budget || 0).toLocaleString()}
                </td>
                <td className="py-4 px-6 text-right font-medium text-blue-600">
                  ฿{Number(r.actual || 0).toLocaleString()}
                </td>
                <td className="py-4 px-6">
                  <div className="flex justify-center gap-2">
                    {r.risks.high > 0 && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded flex items-center gap-1">
                        H:{r.risks.high}
                      </span>
                    )}
                    {r.risks.medium > 0 && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded flex items-center gap-1">
                        M:{r.risks.medium}
                      </span>
                    )}
                    {r.risks.high === 0 && r.risks.medium === 0 && (
                      <span className="text-slate-400 text-xs">-</span>
                    )}
                  </div>
                </td>
                <td className="py-4 px-6 text-right">
                  <Link 
                    href={`/projects/${r.id}/overview`} 
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    รายละเอียด &rarr;
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
