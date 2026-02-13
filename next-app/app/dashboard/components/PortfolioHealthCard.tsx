import { Activity } from 'lucide-react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ReferenceLine, ReferenceArea, Cell } from 'recharts';

interface PortfolioHealthCardProps {
  data: any[];
}

export default function PortfolioHealthCard({ data }: PortfolioHealthCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">เมทริกซ์สุขภาพพอร์ตโฟลิโอ (Portfolio Health)</h3>
            <p className="text-sm text-slate-500">วิเคราะห์ประสิทธิภาพ: ต้นทุน (CPI) vs เวลา (SPI)</p>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg">
            <Activity className="w-5 h-5 text-slate-400" />
          </div>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" dataKey="cpi" name="CPI" domain={[0, 2]} label={{ value: 'ประสิทธิภาพต้นทุน (CPI)', position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 12 }} tick={{fontSize: 12, fill: '#94a3b8'}} />
            <YAxis type="number" dataKey="spi" name="SPI" domain={[0, 2]} label={{ value: 'ประสิทธิภาพเวลา (SPI)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 12 }} tick={{fontSize: 12, fill: '#94a3b8'}} />
            <ZAxis type="number" dataKey="budget" range={[60, 400]} name="Budget" />
            
            {/* Quadrant Backgrounds */}
            <ReferenceLine x={1} stroke="#94a3b8" strokeWidth={2} />
            <ReferenceLine y={1} stroke="#94a3b8" strokeWidth={2} />
            
            {/* Quadrant Labels */}
            <ReferenceArea x1={1} x2={2} y1={1} y2={2} fill="#dcfce7" fillOpacity={0.3} stroke="none" />
            <ReferenceArea x1={0} x2={1} y1={0} y2={1} fill="#fee2e2" fillOpacity={0.3} stroke="none" />
            <ReferenceArea x1={0} x2={1} y1={1} y2={2} fill="#ffedd5" fillOpacity={0.3} stroke="none" />
            <ReferenceArea x1={1} x2={2} y1={0} y2={1} fill="#ffedd5" fillOpacity={0.3} stroke="none" />

            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                        <div className="bg-white p-3 border border-slate-100 shadow-lg rounded-xl z-50">
                            <p className="font-bold text-slate-900 mb-1">{d.name}</p>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                                <span className="text-slate-500">SPI:</span>
                                <span className={`font-medium ${d.spi < 0.9 ? 'text-red-600' : 'text-slate-700'}`}>{d.spi.toFixed(2)}</span>
                                <span className="text-slate-500">CPI:</span>
                                <span className={`font-medium ${d.cpi < 0.9 ? 'text-red-600' : 'text-slate-700'}`}>{d.cpi.toFixed(2)}</span>
                                <span className="text-slate-500">Budget:</span>
                                <span className="text-slate-700">฿{d.budget.toLocaleString()}</span>
                                <span className="text-slate-500">Status:</span>
                                <span className="capitalize text-slate-700">{d.status}</span>
                                <span className="text-slate-500">Manager:</span>
                                <span className="text-slate-700">{d.managerName || '-'}</span>
                                <span className="text-slate-500">Client:</span>
                                <span className="text-slate-700">{d.clientName || '-'}</span>
                            </div>
                        </div>
                    );
                }
                return null;
            }} />
            
            <Scatter name="Projects" data={data} fill="#8884d8" animationDuration={1500}>
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.spi < 0.9 || entry.cpi < 0.9 ? '#ef4444' : (entry.spi >= 1 && entry.cpi >= 1 ? '#10b981' : '#f59e0b')} stroke="#fff" strokeWidth={2} />
                ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
    </div>
  );
}
