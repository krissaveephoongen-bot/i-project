import { CheckCircle, Clock, AlertTriangle, Calendar } from 'lucide-react';

interface DashboardStatusProps {
  summary: {
    completedProjects: number;
    inProgressProjects: number;
    highRisks: number;
    overdueMilestones: number;
  };
}

export default function DashboardStatus({ summary }: DashboardStatusProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 gap-y-6">
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center animate-pulse-slow">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">{summary.completedProjects}</p>
          <p className="text-sm text-slate-500">โครงการเสร็จสิ้น</p>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center animate-pulse-slow">
          <Clock className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">{summary.inProgressProjects}</p>
          <p className="text-sm text-slate-500">กำลังดำเนินการ</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center animate-pulse-slow">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">{summary.highRisks}</p>
          <p className="text-sm text-slate-500">ความเสี่ยงสูง</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
        <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center animate-pulse-slow">
          <Calendar className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">{summary.overdueMilestones}</p>
          <p className="text-sm text-slate-500">งวดงานล่าช้า</p>
        </div>
      </div>
    </div>
  );
}
