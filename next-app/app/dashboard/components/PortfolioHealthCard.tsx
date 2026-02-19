import React from 'react';
import { Activity } from 'lucide-react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ReferenceLine, ReferenceArea, Cell } from 'recharts';
import type { ProjectRow } from '../types';

interface PortfolioHealthCardProps {
  data: ProjectRow[];
}

function PortfolioHealthCard({ data }: PortfolioHealthCardProps) {
  console.log('PortfolioHealthCard received data:', data.length, 'projects');
  console.log('Sample project data:', data[0]);
  
  return (
    <div className="bg-card text-card-foreground rounded-2xl shadow-sm border border-border p-6 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold">เมทริกซ์สุขภาพพอร์ตโฟลิโอ (Portfolio Health)</h3>
          <p className="text-sm text-muted-foreground">วิเคราะห์ประสิทธิภาพ: ต้นทุน (CPI) vs เวลา (SPI)</p>
        </div>
        <div className="p-2 bg-muted rounded-lg" aria-hidden="true">
          <Activity className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-[400px] text-muted-foreground text-sm" role="status">
          ไม่มีข้อมูลโครงการสำหรับวิเคราะห์
        </div>
      ) : (
        <div role="img" aria-label={`เมทริกซ์แสดงสุขภาพ ${data.length} โครงการตามค่า CPI และ SPI`}>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="cpi" name="CPI" domain={[0, 2]} label={{ value: 'ประสิทธิภาพต้นทุน (CPI)', position: 'insideBottom', offset: -10, fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis type="number" dataKey="spi" name="SPI" domain={[0, 2]} label={{ value: 'ประสิทธิภาพเวลา (SPI)', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <ZAxis type="number" dataKey="budget" range={[60, 400]} name="Budget" />

              <ReferenceLine x={1} stroke="hsl(var(--muted-foreground))" strokeWidth={2} />
              <ReferenceLine y={1} stroke="hsl(var(--muted-foreground))" strokeWidth={2} />

              <ReferenceArea x1={1} x2={2} y1={1} y2={2} fill="#dcfce7" fillOpacity={0.3} stroke="none" />
              <ReferenceArea x1={0} x2={1} y1={0} y2={1} fill="#fee2e2" fillOpacity={0.3} stroke="none" />
              <ReferenceArea x1={0} x2={1} y1={1} y2={2} fill="#ffedd5" fillOpacity={0.3} stroke="none" />
              <ReferenceArea x1={1} x2={2} y1={0} y2={1} fill="#ffedd5" fillOpacity={0.3} stroke="none" />

              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-card text-card-foreground p-3 border border-border shadow-lg rounded-xl z-50">
                      <p className="font-bold mb-1">{d.name}</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                        <span className="text-muted-foreground">SPI:</span>
                        <span className={`font-medium ${d.spi < 0.9 ? 'text-red-600' : ''}`}>{d.spi.toFixed(2)}</span>
                        <span className="text-muted-foreground">CPI:</span>
                        <span className={`font-medium ${d.cpi < 0.9 ? 'text-red-600' : ''}`}>{d.cpi.toFixed(2)}</span>
                        <span className="text-muted-foreground">Budget:</span>
                        <span>฿{d.budget.toLocaleString()}</span>
                        <span className="text-muted-foreground">Status:</span>
                        <span className="capitalize">{d.status}</span>
                        <span className="text-muted-foreground">Manager:</span>
                        <span>{d.managerName || '-'}</span>
                        <span className="text-muted-foreground">Client:</span>
                        <span>{d.clientName || '-'}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }} />

              <Scatter name="Projects" data={data} fill="#8884d8" animationDuration={1500}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.spi < 0.9 || entry.cpi < 0.9 ? '#ef4444' : (entry.spi >= 1 && entry.cpi >= 1 ? '#10b981' : '#f59e0b')} stroke="hsl(var(--background))" strokeWidth={2} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default React.memo(PortfolioHealthCard);
