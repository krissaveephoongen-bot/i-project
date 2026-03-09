import React from "react";
import { ActivityEntry } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Clock } from "lucide-react";

interface RecentActivitiesCardProps {
  activities: ActivityEntry[];
}

const RecentActivitiesCard: React.FC<RecentActivitiesCardProps> = ({ activities }) => {
  return (
    <Card className="border-slate-200 shadow-sm h-full">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50">
        <CardTitle className="text-base font-semibold">กิจกรรมล่าสุด (Recent Activity)</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
          {activities.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">ไม่มีกิจกรรมล่าสุด</div>
          ) : (
            activities.map((act) => (
              <div key={act.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-full mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{act.title}</p>
                    <p className="text-xs text-slate-500 truncate">{act.description}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                      <span>{act.user}</span>
                      <span>•</span>
                      <span>{new Date(act.date).toLocaleString('th-TH')}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(RecentActivitiesCard);
