'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TeamLoadData {
  name: string;
  currentLoad: number;
  capacity: number;
  utilization: number;
}

export function TeamLoadChart() {
  const [data, setData] = useState<TeamLoadData[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/dashboard/teamload', { cache: 'no-store' });
        const rows = await res.json();
        const mapped: TeamLoadData[] = (rows || []).map((r: any) => ({
          name: r.name || 'Unknown',
          currentLoad: Number(r.hours || 0),
          capacity: 100,
          utilization: Math.min(100, Math.round(Number(r.hours || 0)))
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
      <h3 className="text-lg font-semibold mb-4">Team Capacity Utilization</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="utilization" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
