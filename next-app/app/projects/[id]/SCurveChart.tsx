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
    ReferenceLine,
    Area
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
        <div className="w-full p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">S-Curve Analysis</h2>
                    <p className="text-sm text-slate-500 mt-1">เปรียบเทียบแผนงานกับผลงานจริงตามเวลา</p>
                </div>
                <div className="flex items-center gap-6 flex-wrap">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-0.5 bg-slate-400 border-dashed border-t-2 border-slate-400"></div>
                        <span className="text-sm text-slate-600 font-medium">Plan</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-0.5 bg-[#2563EB]"></div>
                        <span className="text-sm text-slate-600 font-medium">Actual</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-purple-500 rounded-sm"></div>
                        <span className="text-sm text-slate-600 font-medium">Milestone</span>
                    </div>
                </div>
            </div>
            <div className="bg-gradient-to-br from-slate-50/50 to-white rounded-lg p-4 mb-4">
                <ResponsiveContainer width="100%" height={350}>
                    <ComposedChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis
                            dataKey="week"
                            stroke="#64748b"
                            fontSize={12}
                            tickLine={false}
                            axisLine={{ stroke: '#e2e8f0' }}
                            dy={10}
                            label={{ value: 'Week', position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 12 }}
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
                            formatter={(value, name) => {
                                if (value === undefined) return ['N/A', ''];
                                if (name === 'milestone' && value === 0) return ['', ''];
                                return [`${value}%`, name === 'milestone' ? 'Financial Milestone' : name];
                            }}
                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            cursor={{ fill: '#f1f5f9' }}
                        />
                        <Line
                            type="natural"
                            dataKey="plan"
                            name="Plan"
                            stroke="#94A3B8"
                            strokeDasharray="5 5"
                            strokeWidth={2.5}
                            dot={false}
                            activeDot={{ r: 7, fill: '#94A3B8' }}
                            isAnimationActive={true}
                        />
                        <Line
                            type="natural"
                            dataKey="actual"
                            name="Actual"
                            stroke="#2563EB"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 7, fill: '#2563EB' }}
                            isAnimationActive={true}
                        />
                        <Bar
                            dataKey="milestone"
                            name="Financial Milestone"
                            fill="#A855F7"
                            fillOpacity={0.8}
                            radius={[6, 6, 0, 0]}
                            barSize={24}
                        />
                        <ReferenceLine y={50} stroke="#22c55e" strokeDasharray="3 3" label={{ value: '50% Milestone', fill: '#22c55e', fontSize: 12, position: 'insideTopLeft' }} />
                        <ReferenceLine y={100} stroke="#2563EB" strokeDasharray="3 3" label={{ value: '100% Complete', fill: '#2563EB', fontSize: 12, position: 'insideTopLeft' }} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {/* SPI Alert */}
            <div className={`mt-4 p-4 rounded-lg border-l-4 flex items-start gap-3 ${spi < 1
                    ? 'bg-yellow-50/80 border-yellow-400'
                    : 'bg-green-50/80 border-green-400'
                }`}>
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${spi < 1 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                <div className="flex-1">
                    <span className={`text-sm font-medium ${spi < 1 ? 'text-yellow-900' : 'text-green-900'
                        }`}>
                        SPI: {spi.toFixed(2)} {spi < 1 ? '• Actual progress lagging behind plan' : '• On track or ahead of schedule'}
                    </span>
                    <p className={`text-xs mt-1 ${spi < 1 ? 'text-yellow-700' : 'text-green-700'
                        }`}>
                        {spi < 1
                            ? 'โครงการกำลังด้อยกว่าแผนงาน ต้องติดตามอย่างใกล้ชิด'
                            : 'โครงการไปตามแผนงานหรือลำดับล่วงหน้า'
                        }
                    </p>
                </div>
            </div>
        </div>
    );
}
