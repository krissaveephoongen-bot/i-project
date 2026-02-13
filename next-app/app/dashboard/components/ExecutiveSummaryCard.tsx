import { Briefcase, Folder } from 'lucide-react';

interface ExecutiveSummaryCardProps {
  report: any;
}

export default function ExecutiveSummaryCard({ report }: ExecutiveSummaryCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900">สรุปผู้บริหาร (Brief)</h3>
        <Briefcase className="w-5 h-5 text-slate-400" />
      </div>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
          <div>
            <p className="text-sm text-slate-500 mb-1">โครงการทั้งหมด</p>
            <p className="text-2xl font-bold text-slate-900">{report?.summary?.totalProjects ?? '-'}</p>
          </div>
          <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center">
            <Folder className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border border-slate-100 rounded-xl">
            <p className="text-xs text-slate-500 mb-1">Avg SPI</p>
            <p className="text-xl font-bold text-blue-600">{Number(report?.summary?.avgSpi ?? 1).toFixed(2)}</p>
          </div>
          <div className="p-4 border border-slate-100 rounded-xl">
            <p className="text-xs text-slate-500 mb-1">ล่าช้า (Overdue)</p>
            <p className="text-xl font-bold text-orange-600">{report?.summary?.overdueMilestones ?? '-'}</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-slate-700 mb-3">โครงการเสี่ยงสูง (High Risk)</p>
          <div className="space-y-2">
            {(report?.summary?.highRiskProjects || []).slice(0, 3).map((h: any, i: number) => (
              <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {h.name}
              </div>
            ))}
            {(!report?.summary?.highRiskProjects?.length) && (
              <p className="text-sm text-slate-400 italic">ไม่มีโครงการเสี่ยงสูง</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
