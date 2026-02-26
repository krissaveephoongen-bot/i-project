import React from "react";
import { BarChart as BarChartIcon } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { CashflowEntry } from "../types";

interface FinancialChartCardProps {
  data: CashflowEntry[];
}

function FinancialChartCard({ data }: FinancialChartCardProps) {
  return (
    <div className="bg-card text-card-foreground rounded-2xl shadow-sm border border-border p-6 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold">ภาพรวมการเงิน (Financial)</h3>
          <p className="text-sm text-muted-foreground">
            เปรียบเทียบ ยอดผูกพัน (Committed) vs จ่ายจริง (Paid)
          </p>
        </div>
        <div className="p-2 bg-muted rounded-lg" aria-hidden="true">
          <BarChartIcon className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>

      {data.length === 0 ? (
        <div
          className="flex items-center justify-center h-[300px] text-muted-foreground text-sm"
          role="status"
        >
          ไม่มีข้อมูลการเงินในช่วงเวลาที่เลือก
        </div>
      ) : (
        <div
          role="img"
          aria-label={`กราฟแท่งแสดงข้อมูลการเงิน ${data.length} เดือน`}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-border"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                className="text-muted-foreground"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                className="text-muted-foreground"
                fontSize={12}
                tickFormatter={(v) => `฿${(v / 1000000).toFixed(1)}M`}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted))" }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  backgroundColor: "hsl(var(--card))",
                }}
                labelStyle={{ color: "hsl(var(--card-foreground))" }}
                formatter={(v: number) => `฿${v.toLocaleString()}`}
              />
              <Legend iconType="circle" />
              <Bar
                dataKey="committed"
                name="Committed"
                fill="#8b5cf6"
                radius={[4, 4, 0, 0]}
                animationDuration={1500}
              />
              <Bar
                dataKey="paid"
                name="Paid"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default React.memo(FinancialChartCard);
