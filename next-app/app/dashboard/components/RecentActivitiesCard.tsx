import { Activity } from 'lucide-react';

interface RecentActivitiesCardProps {
  activities: any[];
}

export default function RecentActivitiesCard({ activities }: RecentActivitiesCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">กิจกรรมล่าสุด</h3>
            <Activity className="w-5 h-5 text-slate-400" />
        </div>
        <div className="flex-1 overflow-y-auto space-y-6 pr-2 max-h-[400px] custom-scrollbar">
            {activities.map((act) => (
                <div key={act.id} className="flex gap-4 group">
                    <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                        act.type === 'audit' ? 'bg-purple-500' : 
                        act.type === 'timesheet' ? 'bg-blue-500' : 
                        'bg-green-500'
                    }`} />
                    <div>
                        <p className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {act.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                            {act.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                            <span className="font-medium text-slate-600">{act.user}</span>
                            <span>•</span>
                            <span>{new Date(act.date).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            ))}
            {activities.length === 0 && (
                <div className="text-center text-slate-400 py-8 text-sm">ไม่มีกิจกรรมล่าสุด</div>
            )}
        </div>
    </div>
  );
}
