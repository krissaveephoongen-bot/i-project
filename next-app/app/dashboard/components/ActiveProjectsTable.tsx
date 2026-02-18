import React from 'react';
import Link from 'next/link';
import type { ProjectRow } from '../types';

interface ActiveProjectsTableProps {
  projects: ProjectRow[];
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400',
  completed: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
};

function ActiveProjectsTable({ projects }: ActiveProjectsTableProps) {
  return (
    <div className="bg-card text-card-foreground rounded-2xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-all">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <h3 className="text-lg font-bold">โครงการที่ดำเนินการอยู่ (Active Projects)</h3>
        <div className="text-sm text-muted-foreground">
          แสดง {projects.length} โครงการ
        </div>
      </div>

      {/* Mobile card layout */}
      <div className="block lg:hidden divide-y divide-border">
        {projects.map((r) => (
          <div key={r.id} className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <Link href={`/projects/${r.id}/overview`} className="font-semibold hover:text-blue-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
                  {r.name}
                </Link>
                <span className={`text-xs mt-1 block w-fit px-2 py-0.5 rounded-full ${STATUS_COLORS[r.status?.toLowerCase()] || 'bg-muted text-muted-foreground'}`}>
                  {r.status || 'Active'}
                </span>
              </div>
              <Link
                href={`/projects/${r.id}/overview`}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                aria-label={`ดูรายละเอียดโครงการ ${r.name}`}
              >
                รายละเอียด &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-muted-foreground">ความคืบหน้า:</span> <span className="font-medium">{r.progress?.toFixed(0)}%</span></div>
              <div><span className="text-muted-foreground">SPI:</span> <span className="font-medium">{(r.spi || 1).toFixed(2)}</span></div>
              <div><span className="text-muted-foreground">งบประมาณ:</span> <span className="font-medium">฿{Number(r.budget || 0).toLocaleString()}</span></div>
              <div><span className="text-muted-foreground">จ่ายจริง:</span> <span className="font-medium text-blue-600">฿{Number(r.actual || 0).toLocaleString()}</span></div>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm">ไม่มีโครงการ</div>
        )}
      </div>

      {/* Desktop table layout */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full" aria-label="ตารางโครงการที่ดำเนินการอยู่">
          <thead className="bg-muted/50">
            <tr>
              <th scope="col" className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">ชื่อโครงการ</th>
              <th scope="col" className="text-center py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">ความคืบหน้า</th>
              <th scope="col" className="text-center py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">SPI</th>
              <th scope="col" className="text-right py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">งบประมาณ</th>
              <th scope="col" className="text-right py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">จ่ายจริง</th>
              <th scope="col" className="text-center py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">ความเสี่ยง</th>
              <th scope="col" className="text-right py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {projects.map((r) => (
              <tr key={r.id} className="hover:bg-muted/50 transition-all group">
                <td className="py-4 px-6">
                  <div className="flex flex-col">
                    <Link href={`/projects/${r.id}/overview`} className="font-semibold hover:text-blue-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
                      {r.name}
                    </Link>
                    <span className={`text-xs mt-1 w-fit px-2 py-0.5 rounded-full ${STATUS_COLORS[r.status?.toLowerCase()] || 'bg-muted text-muted-foreground'}`}>
                      {r.status || 'Active'}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-sm font-bold">{r.progress?.toFixed(0)}%</span>
                    <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.round(r.progress || 0)} aria-valuemin={0} aria-valuemax={100} aria-label={`ความคืบหน้า ${r.name}`}>
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${Math.min(r.progress || 0, 100)}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-center">
                  <span className={`font-bold px-2 py-1 rounded text-sm ${
                    (r.spi || 1) < 0.9 ? 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400' :
                    (r.spi || 1) > 1.1 ? 'bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {(r.spi || 1).toFixed(2)}
                  </span>
                </td>
                <td className="py-4 px-6 text-right font-medium text-muted-foreground">
                  ฿{Number(r.budget || 0).toLocaleString()}
                </td>
                <td className="py-4 px-6 text-right font-medium text-blue-600">
                  ฿{Number(r.actual || 0).toLocaleString()}
                </td>
                <td className="py-4 px-6">
                  <div className="flex justify-center gap-2">
                    {r.risks?.high > 0 && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 text-xs font-bold rounded flex items-center gap-1" aria-label={`ความเสี่ยงสูง ${r.risks.high} รายการ`}>
                        H:{r.risks.high}
                      </span>
                    )}
                    {r.risks?.medium > 0 && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400 text-xs font-bold rounded flex items-center gap-1" aria-label={`ความเสี่ยงปานกลาง ${r.risks.medium} รายการ`}>
                        M:{r.risks.medium}
                      </span>
                    )}
                    {r.risks?.high === 0 && r.risks?.medium === 0 && (
                      <span className="text-muted-foreground text-xs" aria-label="ไม่มีความเสี่ยง">-</span>
                    )}
                  </div>
                </td>
                <td className="py-4 px-6 text-right">
                  <Link
                    href={`/projects/${r.id}/overview`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded transition-colors"
                    aria-label={`ดูรายละเอียดโครงการ ${r.name}`}
                  >
                    รายละเอียด &rarr;
                  </Link>
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-muted-foreground text-sm">ไม่มีโครงการ</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default React.memo(ActiveProjectsTable);
