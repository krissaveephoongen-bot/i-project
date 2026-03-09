import React from "react";
import { LucideIcon, ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/card";
import { clsx } from "clsx";

interface KpiCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  subtext?: string;
  alert?: boolean;
  trend?: number; // percentage
  trendLabel?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  icon: Icon,
  subtext,
  alert,
  trend,
  trendLabel,
}) => {
  return (
    <Card className={clsx("border-slate-200 shadow-sm transition-all hover:shadow-md", alert && "border-red-200 bg-red-50/50")}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={clsx("p-3 rounded-full", alert ? "bg-red-100 text-red-600" : "bg-blue-50 text-blue-600")}>
            <Icon className="w-6 h-6" />
          </div>
          {trend !== undefined && (
            <div className={clsx("flex items-center text-xs font-medium px-2 py-1 rounded-full", 
              trend > 0 ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"
            )}>
              {trend > 0 ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
          {(subtext || trendLabel) && (
            <p className="text-xs text-slate-400 mt-1">
              {subtext} {trendLabel && <span className="ml-1">{trendLabel}</span>}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
