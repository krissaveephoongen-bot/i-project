'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, differenceInDays, addDays, isAfter } from 'date-fns';
import { th } from 'date-fns/locale';

interface Task {
  id: string;
  weight: number;
  startDate?: string;
  endDate?: string;
  status: string;
  progressActual?: number;
}

interface BurndownChartProps {
  tasks: Task[];
  startDate?: string;
  endDate?: string;
}

export default function BurndownChart({ tasks, startDate, endDate }: BurndownChartProps) {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center border border-dashed border-slate-200 rounded-lg text-slate-400">
        ไม่มีข้อมูลสำหรับแสดงกราฟ
      </div>
    );
  }

  // 1. Determine Project Duration
  // If project start/end dates are not provided, infer from tasks
  const taskStartDates = tasks.map(t => t.startDate ? new Date(t.startDate).getTime() : Infinity).filter(d => d !== Infinity);
  const taskEndDates = tasks.map(t => t.endDate ? new Date(t.endDate).getTime() : -Infinity).filter(d => d !== -Infinity);

  const pStart = startDate ? new Date(startDate) : (taskStartDates.length > 0 ? new Date(Math.min(...taskStartDates)) : new Date());
  const pEnd = endDate ? new Date(endDate) : (taskEndDates.length > 0 ? new Date(Math.max(...taskEndDates)) : addDays(new Date(), 30));

  const totalDays = differenceInDays(pEnd, pStart) + 1;
  const totalWeight = tasks.reduce((sum, t) => sum + (t.weight || 0), 0);

  // 2. Generate Ideal Burn-down Line
  // Assuming linear burn-down for simplicity (or we could calculate based on task planned dates)
  const data = [];
  const idealDailyBurn = totalWeight / totalDays;

  // 3. Generate Actual Burn-down Line
  // We need to know when each task was completed or progress updated.
  // Since we don't have a history log here, we will approximate:
  // - If task is completed, we assume it was completed on its endDate (or today if overdue? tricky without logs).
  // - For a static view without history logs, a true "Actual" line over time is hard.
  // - HOWEVER, we can plot "Planned" vs "Actual" if we assume:
  //    - Planned: Cumulative weight of tasks that SHOULD be done by date X.
  //    - Actual: Cumulative weight of tasks that ARE done (but we don't know WHEN they were done).
  
  // Alternative Approach for "Actual" without history:
  // We can only show the "Current" status as a single point or a flat line if we don't have history.
  // BUT, usually Burndown is "Remaining Effort".
  
  // Let's build a "Planned Remaining" vs "Ideal Remaining".
  // "Actual Remaining" requires history. If we don't have history, we can't draw the past line accurately.
  // So we will assume linear ideal.
  // For Actual, we will try to infer from task end dates for "Planned" burn down (Scope).
  
  let remainingIdeal = totalWeight;
  let remainingPlanned = totalWeight;

  for (let i = 0; i <= totalDays; i++) {
    const currentDate = addDays(pStart, i);
    const dateStr = format(currentDate, 'd MMM', { locale: th });
    
    // Ideal: Linear
    remainingIdeal = Math.max(0, totalWeight - (idealDailyBurn * i));

    // Planned: Based on Task End Dates
    // How much weight should have been finished by `currentDate`?
    const plannedCompletedWeight = tasks
        .filter(t => t.endDate && !isAfter(new Date(t.endDate), currentDate))
        .reduce((sum, t) => sum + (t.weight || 0), 0);
    
    remainingPlanned = Math.max(0, totalWeight - plannedCompletedWeight);

    // Actual: We can't really plot historical actual without logs.
    // So we will plot "Ideal" vs "Planned Scope" for now.
    // If we want "Actual", we'd need to fetch ActivityLogs.
    
    // Let's just plot Ideal vs Planned for now as a "Baseline".
    
    data.push({
      date: dateStr,
      ideal: Number(remainingIdeal.toFixed(1)),
      planned: Number(remainingPlanned.toFixed(1)),
      // actual: ... (omitted due to lack of history data in props)
    });
  }

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12, fill: '#64748b' }} 
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={30}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#64748b' }} 
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            labelStyle={{ color: '#1e293b', fontWeight: 600, marginBottom: '4px' }}
          />
          <Legend wrapperStyle={{ paddingTop: '10px' }} />
          <Line
            type="monotone"
            dataKey="ideal"
            name="Ideal Burn-down (เส้นอุดมคติ)"
            stroke="#94a3b8"
            strokeDasharray="5 5"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
          <Line
            type="stepAfter"
            dataKey="planned"
            name="Planned Burn-down (แผนงาน)"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
