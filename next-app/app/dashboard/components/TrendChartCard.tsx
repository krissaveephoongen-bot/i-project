import React from 'react';
import { TrendingUp } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/app/components/ui/Select';
import type { SpiTrendEntry, ProjectRow } from '../types';

interface TrendChartCardProps {
  data: SpiTrendEntry[];
  projects: ProjectRow[];
  selectedProject: string;
  onSelectProject: (id: string) => void;
}

function TrendChartCard({ data, projects, selectedProject, onSelectProject }: TrendChartCardProps) {
  return (
    <div className="bg-card text-card-foreground rounded-2xl shadow-sm border border-border p-6 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-lg font-bold">แนวโน้มประสิทธิภาพ (Performance Trend)</h3>
          <p className="text-sm text-muted-foreground">การติดตามค่า SPI ย้อนหลัง 30 วัน</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedProject} onValueChange={onSelectProject}>
            <SelectTrigger className="w-[150px] text-xs bg-muted border-border rounded-lg" aria-label="เลือกโครงการสำหรับกราฟ SPI">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด (Average)</SelectItem>
              {projects.map(p => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name.length > 20 ? p.name.slice(0, 20) + '...' : p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="p-2 bg-muted rounded-lg" aria-hidden="true">
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm" role="status">
          ไม่มีข้อมูล SPI ในช่วงเวลาที่เลือก
        </div>
      ) : (
        <div role="img" aria-label={`กราฟเส้นแสดงแนวโน้ม SPI ${data.length} จุดข้อมูล`}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis dataKey="date" className="text-muted-foreground" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => v.slice(5)} />
              <YAxis className="text-muted-foreground" fontSize={12} domain={[0, 'dataMax + 0.2']} tickLine={false} axisLine={false} />
              <ReferenceLine y={1} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" label={{ value: 'Threshold 1.0', position: 'right', fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'hsl(var(--card))' }}
                labelStyle={{ color: 'hsl(var(--card-foreground))' }}
                formatter={(v: number) => v.toFixed(2)}
              />
              <Legend iconType="circle" />
              <Line
                type="monotone"
                dataKey="spi"
                name={selectedProject === 'all' ? 'Avg SPI' : 'Project SPI'}
                stroke="#2563EB"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default React.memo(TrendChartCard);
