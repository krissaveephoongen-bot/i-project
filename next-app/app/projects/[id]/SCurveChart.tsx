'use client';

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
  ReferenceLine
} from 'recharts';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

type Point = { week: string; plan: number; actual: number; milestone: number };

export default function SCurveChart() {
  const params = useParams() as { id?: string };
  const [data, setData] = useState<Point[]>([]);
  const [spi, setSpi] = useState<number>(1);

  useEffect(() => {
    const load = async () => {
      try {
        const id = params?.id || '';
        if (!id) return;
        const res = await fetch(`/api/projects/progress/snapshot?projectId=${id}`, { cache: 'no-store' });
        const json = await res.json();
        const points = (json?.points || []).map((p: any, idx: number) => ({
          week: String(idx + 1),
          plan: Number(p.plan || 0),
          actual: Number(p.actual || 0),
          milestone: Number(p.milestone || 0)
        }));
        setData(points);
        const last = (json?.points || []).slice(-1)[0];
        const spi = last?.spi ?? 1;
        setSpi(Number(spi || 1));
      } catch {
        setData([]);
        setSpi(1);
      }
    };
    load();
  }, [params?.id]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-900">S-Curve Analysis</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-slate-400 border-dashed border-t-2 border-slate-400"></div>
            <span className="text-sm text-slate-600">Plan</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-[#2563EB]"></div>
            <span className="text-sm text-slate-600">Actual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span className="text-sm text-slate-600">Milestone</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="week" stroke="#64748b" fontSize={12} />
          <YAxis 
            stroke="#64748b" 
            fontSize={12} 
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip
            formatter={(value, name) => {
              if (value === undefined) return ['N/A', ''];
              if (name === 'milestone' && value === 0) return ['', ''];
              return [`${value}%`, name === 'milestone' ? 'Financial Milestone' : name];
            }}
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="plan" 
            name="Plan" 
            stroke="#94A3B8" 
            strokeDasharray="5 5" 
            strokeWidth={2}
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="actual" 
            name="Actual" 
            stroke="#2563EB" 
            strokeWidth={2}
            dot={false}
          />
          <Bar 
            dataKey="milestone" 
            name="Financial Milestone" 
            fill="#A855F7" 
            radius={[4, 4, 0, 0]}
          />
          <ReferenceLine y={50} stroke="#22c55e" strokeDasharray="3 3" label="50% Milestone" />
          <ReferenceLine y={100} stroke="#2563EB" strokeDasharray="3 3" label="100% Complete" />
        </ComposedChart>
      </ResponsiveContainer>
      {/* SPI Alert */}
      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <span className="text-sm font-medium text-yellow-800">
            SPI Alert: Current SPI is {spi.toFixed(2)} {spi < 1 ? '(Below 1.0). Actual progress is lagging behind plan.' : '(>= 1.0). On track or ahead.'}
          </span>
        </div>
      </div>
    </div>
  );
}
