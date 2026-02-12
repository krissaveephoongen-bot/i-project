"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface KpiCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  subtext?: string;
  icon: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

const variantStyles = {
  default: {
    card: "bg-white border-slate-200",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
    valueColor: "text-slate-900",
  },
  success: {
    card: "bg-white border-emerald-200",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    valueColor: "text-emerald-700",
  },
  warning: {
    card: "bg-white border-amber-200",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    valueColor: "text-amber-700",
  },
  danger: {
    card: "bg-white border-red-200 bg-red-50/30",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    valueColor: "text-red-700",
  },
  info: {
    card: "bg-white border-blue-200",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    valueColor: "text-blue-700",
  },
};

export function KpiCard({
  title,
  value,
  change,
  changeType = "neutral",
  subtext,
  icon,
  variant = "default",
  className,
}: KpiCardProps) {
  const styles = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn("overflow-hidden hover:shadow-md transition-shadow", styles.card, className)}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", styles.iconBg)}>
              <div className={cn("w-6 h-6", styles.iconColor)}>{icon}</div>
            </div>
            {change && (
              <div className={cn(
                "flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full",
                changeType === "positive" && "bg-emerald-100 text-emerald-700",
                changeType === "negative" && "bg-red-100 text-red-700",
                changeType === "neutral" && "bg-slate-100 text-slate-600"
              )}>
                {changeType === "positive" && <ArrowUpRight className="w-3.5 h-3.5" />}
                {changeType === "negative" && <ArrowDownRight className="w-3.5 h-3.5" />}
                {changeType === "neutral" && <TrendingUp className="w-3.5 h-3.5" />}
                <span>{change}</span>
              </div>
            )}
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <p className={cn("text-3xl font-bold tracking-tight", styles.valueColor)}>{value}</p>
            {subtext && <p className="text-xs text-slate-500 mt-2">{subtext}</p>}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default KpiCard;
