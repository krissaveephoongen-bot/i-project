import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight, LucideIcon } from "lucide-react";
import { clsx } from "clsx";

interface KpiCardProps {
  title: string;
  value: string;
  change?: string;
  positive?: boolean;
  subtext?: string;
  icon: LucideIcon;
  alert?: boolean;
}

export function KpiCard({
  title,
  value,
  change,
  positive,
  subtext,
  icon: Icon,
  alert,
}: KpiCardProps) {
  return (
    <Card
      className={clsx(
        "transition-all hover:shadow-md",
        alert ? "border-red-300 bg-red-50/50 dark:bg-red-900/10 dark:border-red-900/50" : ""
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div
          className={clsx(
            "w-8 h-8 rounded-full flex items-center justify-center bg-background/50",
            alert
              ? "text-red-600 dark:text-red-400"
              : "text-muted-foreground"
          )}
        >
          <Icon className="w-4 h-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div
            className={clsx(
              "text-2xl font-bold",
              alert ? "text-red-600 dark:text-red-400" : "text-foreground"
            )}
          >
            {value}
          </div>
          {change && (
            <div
              className={clsx(
                "flex items-center text-xs font-medium",
                positive
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              )}
            >
              {positive ? (
                <ArrowUpRight className="w-3 h-3 mr-1" />
              ) : (
                <ArrowDownRight className="w-3 h-3 mr-1" />
              )}
              {change}
            </div>
          )}
        </div>
        {subtext && (
          <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
        )}
      </CardContent>
    </Card>
  );
}
