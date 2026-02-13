import { TrendingUp } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';

interface TrendChartCardProps {
  data: any[];
  projects: any[];
  selectedProject: string;
  onSelectProject: (id: string) => void;
}

export default function TrendChartCard({ data, projects, selectedProject, onSelectProject }: TrendChartCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">แนวโน้มประสิทธิภาพ (Performance Trend)</h3>
          <p className="text-sm text-slate-500">การติดตามค่า SPI ย้อนหลัง 30 วัน</p>
        </div>
        <div className="flex items-center gap-2">
          <select 
              value={selectedProject}
              onChange={(e) => onSelectProject(e.target.value)}
              className="text-xs p-2 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 max-w-[150px]"
          >
              <option value="all">ทั้งหมด (Average)</option>
              {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name.length > 20 ? p.name.slice(0,20)+'...' : p.name}</option>
              ))}
          </select>
          <div className="p-2 bg-slate-50 rounded-lg">
            <TrendingUp className="w-5 h-5 text-slate-400" />
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => v.slice(5)} />
          <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 'dataMax + 0.2']} tickLine={false} axisLine={false} />
          <ReferenceLine y={1} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'Threshold 1.0', position: 'right', fill: '#64748b', fontSize: 12 }} />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(v: number)=>v.toFixed(2)} 
          />
          <Legend iconType="circle" />
          <Line 
            type="monotone" 
            dataKey="spi" 
            name={selectedProject === 'all' ? "Avg SPI" : "Project SPI"}
            stroke="#2563EB" 
            strokeWidth={3} 
            dot={false}
            activeDot={{ r: 6, strokeWidth: 0 }}
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
