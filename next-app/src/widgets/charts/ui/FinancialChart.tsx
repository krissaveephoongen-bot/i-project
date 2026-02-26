"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface FinancialData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export function FinancialChart() {
  const [data, setData] = useState<FinancialData[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/dashboard/financial", {
          cache: "no-store",
        });
        const rows = await res.json();
        const mapped: FinancialData[] = (rows || []).map((r: any) => ({
          month: r.month,
          revenue: Number(r.revenue || 0),
          expenses: Number(r.cost || 0),
          profit: Number(r.revenue || 0) - Number(r.cost || 0),
        }));
        setData(mapped);
      } catch {
        setData([]);
      }
    };
    load();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Financial Overview</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#10b981"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="expenses"
            stroke="#ef4444"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="profit"
            stroke="#3b82f6"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
