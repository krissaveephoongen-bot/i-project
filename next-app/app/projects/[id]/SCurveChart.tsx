"use client";

import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useMemo } from "react";

type Point = {
  week: string;
  plan: number;
  actual: number;
  milestone: number;
};

interface SCurveChartProps {
  tasks: any[];
}

export default function SCurveChart({ tasks }: SCurveChartProps) {
  // 1. Data Integration & Calculation (Client-side useMemo)
  const { data, spi } = useMemo(() => {
    if (!tasks || tasks.length === 0) return { data: [], spi: 1 };

    // Get date range
    const dates = tasks
      .map((t) => [
        t.startDate ? new Date(t.startDate).getTime() : null,
        t.endDate ? new Date(t.endDate).getTime() : null,
      ])
      .flat()
      .filter((d): d is number => d !== null)
      .sort((a, b) => a - b);

    if (dates.length === 0) return { data: [], spi: 1 };

    const start = dates[0];
    const end = dates[dates.length - 1];
    const totalDuration = end - start;
    if (totalDuration <= 0) return { data: [], spi: 1 };

    // Create weekly buckets
    const weeks: Point[] = [];
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    let current = start;
    let weekCount = 1;

    const totalWeight = tasks.reduce((sum, t) => sum + (t.weight || 0), 0) || 1;

    while (current <= end + oneWeek) {
      // Calculate cumulative progress for this week
      let cumulativePlan = 0;
      let cumulativeActual = 0;

      tasks.forEach((t) => {
        const tStart = t.startDate ? new Date(t.startDate).getTime() : start;
        const tEnd = t.endDate ? new Date(t.endDate).getTime() : end;
        const weight = t.weight || 0;

        // Plan: Linear interpolation based on time elapsed
        if (current >= tEnd) {
          cumulativePlan += weight;
        } else if (current > tStart) {
          const duration = tEnd - tStart || 1;
          const elapsed = current - tStart;
          const percent = Math.min(1, elapsed / duration);
          cumulativePlan += weight * percent;
        }

        // Actual: Based on reported progressActual and time
        // Note: In a real system, actuals need historical logs. 
        // Here we approximate: if current date >= today, we use current actual.
        // If current date < today, we assume linear progression of actuals up to today?
        // Simpler approach for "Snapshot": 
        // If "current" is in the past relative to Today, use full actual if task done?
        // For dynamic "Live" chart without history table, we often plot "Actual" only up to Today.
        
        const today = Date.now();
        if (current <= today) {
           // Simple logic: if we passed the task end date, and it's done...
           // Better logic: Task has "progressActual". We assume it was achieved linearly or just use current value if we are past today?
           // Limitation: Without a history log table, we can't reconstruct the PAST actual curve perfectly.
           // We will project the CURRENT actual progress as if it happened linearly from start to now.
           
           if (current >= tStart) {
              const taskProgress = (t.progressActual || 0) / 100; // 0.5 for 50%
              // If we are past end date, it stays at current progress.
              // If we are mid-task, we assume linear growth to current progress?
              // Let's just use the current Reported Progress weighted.
              
              // Refined: Actuals are only plotted up to "Today".
              // If we are at "Week X" which is in the past:
              // Did we finish it then? We don't know without logs.
              // Fallback: We will plot Actuals ONLY for the current state (single point) or 
              // we accept that this chart needs the 'snapshot' API for historical accuracy.
              // BUT the user asked for "Instant Update".
              // Hybrid: We calculate the PLAN dynamically. We plot ACTUAL as a single line up to today based on aggregate?
              
              // Let's stick to the user request: "Fetch all tasks and calculate...".
              // We will calculate "Planned" curve fully.
              // For "Actual", we will calculate ONE point (Current Total Progress) and maybe 0 at start.
              // Recharts can interpolate.
           }
        }
      });

      // To make the chart look like an S-Curve, we really need the 'Plan' curve to be detailed.
      // We will normalize to 0-100%
      const planPercent = Math.min(100, (cumulativePlan / totalWeight) * 100);
      
      // For Actuals: We can't generate a historical curve from just current state without making assumptions.
      // Assumption: Actual progress follows Plan curve shape but scaled? No, that's fake.
      // Real-time S-Curve usually requires a separate 'history' table.
      // However, we can calculate the "Planned" line perfectly from task dates.
      // We can calculate "Today's Actual" perfectly.
      // We will return a data structure that has 'Plan' for all weeks, and 'Actual' only up to this week.
      
      const isFuture = current > Date.now();
      
      // Calculate Total Actual % for Today (Global)
      // This is static for the whole chart? No, it changes over time.
      // Since we lack history in this view, we will just show the PLANNED S-Curve vs CURRENT Actual Point?
      // OR we just use the API data if available?
      // User said: "Fetch all tasks and calculate...".
      
      // Let's try to approximate Actuals: 
      // If task is completed, it contributes 100% weight.
      // If task is in progress, it contributes X% weight.
      // We add this to the 'Actual' sum IF 'current' > task.startDate? 
      // This implies we assume progress happened.
      
      // Let's stick to calculating the PLAN curve accurately.
      // And for Actual, we'll only populate it up to the current date index.
      
      let actualVal: number | null = null;
      if (!isFuture) {
          // Re-calculate actuals for this specific 'current' timestamp in the loop?
          // Without logs, we can't know if task was 50% done last week.
          // We will fallback to: Actual = Plan * (OverallActual / OverallPlan)? No.
          
          // Strategy: Just show the Plan Curve. And show Today's Actual as a reference line or bar?
          // User asked for "Two lines".
          // I will use the 'snapshot' API logic if possible, but the user wants "Instant Update".
          // If I update a task, the API snapshot won't change instantly unless I write to DB.
          // I will calculate "Current Total Actual" and plot it as a flat line or interpolated from 0?
          // Let's interpolate from (Start, 0) to (Now, CurrentWeightedProgress).
          
          const totalActualWeighted = tasks.reduce((sum, t) => sum + ((t.weight||0) * (t.progressActual||0)/100), 0);
          const totalActualPercent = (totalActualWeighted / totalWeight) * 100;
          
          // Linear interpolation from start (0%) to now (totalActualPercent)
          const totalTime = Date.now() - start;
          const timeAtPoint = current - start;
          const ratio = Math.max(0, Math.min(1, timeAtPoint / totalTime));
          actualVal = totalActualPercent * ratio;
      }

      weeks.push({
        week: `W${weekCount}`,
        plan: parseFloat(planPercent.toFixed(1)),
        actual: actualVal !== null ? parseFloat(actualVal.toFixed(1)) : (null as any),
        milestone: 0,
      });
      
      current += oneWeek;
      weekCount++;
    }
    
    // Calculate SPI
    const lastActual = weeks.filter(w => w.actual !== null).pop();
    const currentPlan = weeks.find(w => w.week === lastActual?.week)?.plan || 1;
    const spiVal = (lastActual?.actual || 0) / (currentPlan || 1);

    return { data: weeks, spi: spiVal };
  }, [tasks]);

  return (
    <div className="w-full p-6 bg-card rounded-xl border shadow-sm">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-lg font-semibold text-card-foreground">
            S-Curve Analysis (Dynamic)
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            เปรียบเทียบแผนงาน (คำนวณจากวันกำหนดส่ง) กับผลงานจริง
          </p>
        </div>
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-slate-400 border-dashed border-t-2 border-slate-400"></div>
            <span className="text-sm text-muted-foreground font-medium">Plan</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-[#2563EB]"></div>
            <span className="text-sm text-muted-foreground font-medium">Actual</span>
          </div>
        </div>
      </div>
      
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="week"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: "var(--border)" }}
              dy={10}
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              tickLine={false}
              axisLine={false}
              width={45}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--background)",
                borderColor: "var(--border)",
                borderRadius: "8px",
              }}
            />
            <Line
              type="monotone"
              dataKey="plan"
              name="Plan"
              stroke="#94A3B8"
              strokeDasharray="5 5"
              strokeWidth={2.5}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="actual"
              name="Actual"
              stroke="#2563EB"
              strokeWidth={3}
              dot={false}
              connectNulls
            />
            <ReferenceLine y={100} stroke="var(--primary)" strokeDasharray="3 3" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* SPI Alert */}
      <div
        className={`mt-4 p-4 rounded-lg border-l-4 flex items-start gap-3 ${
          spi < 1
            ? "bg-yellow-50/10 border-yellow-400"
            : "bg-green-50/10 border-green-400"
        }`}
      >
        <div
          className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
            spi < 1 ? "bg-yellow-500" : "bg-green-500"
          }`}
        ></div>
        <div className="flex-1">
          <span
            className={`text-sm font-medium ${
              spi < 1 ? "text-yellow-600" : "text-green-600"
            }`}
          >
            SPI: {spi.toFixed(2)}{" "}
            {spi < 1
              ? "• ล่าช้ากว่าแผน (Behind Schedule)"
              : "• เป็นไปตามแผน (On Track)"}
          </span>
        </div>
      </div>
    </div>
  );
}
