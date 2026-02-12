 'use client';
 
 import { useMemo, useState } from 'react';
 import { PieChart, Pie, Sector, Tooltip, Cell } from 'recharts';
 
 interface Node {
   name: string;
   value: number;
   children?: Node[];
   meta?: { start?: string; end?: string; date?: string };
 }
 
 function aggregateMeta(nodes: Node[]) {
   const dates = nodes.map(n => n.meta?.date).filter(Boolean) as string[];
   const starts = nodes.map(n => n.meta?.start).filter(Boolean) as string[];
   const ends = nodes.map(n => n.meta?.end).filter(Boolean) as string[];
   const start = starts.sort()[0];
   const end = ends.sort().slice(-1)[0];
   return { start, end, dates };
 }
 
 export default function ReportsSunburst({ data }: { data: Node }) {
   const [path, setPath] = useState<string[]>([]);
   const current = useMemo(() => {
     let node: Node | undefined = data;
     for (const p of path) {
       node = node?.children?.find(c => c.name === p);
     }
     return node || data;
   }, [data, path]);
 
   const levels = useMemo(() => {
     const l0 = (current.children || []).map(c => ({ name: c.name, value: c.value, children: c.children }));
     const l1 = (l0[0]?.children || []).map(c => ({ name: c.name, value: c.value, children: c.children }));
     const l2 = (l1[0]?.children || []).map(c => ({ name: c.name, value: c.value, meta: (c as any).meta }));
     return [l0, l1, l2];
   }, [current]);
 
   const colors = ['#1e3a8a', '#2563eb', '#60a5fa', '#93c5fd', '#d1d5db', '#f87171', '#f59e0b', '#34d399', '#22c55e'];
   const renderLabel = (d: any) => d.name;
 
   const onSliceClick = (levelIndex: number, entry: any) => {
     if (levelIndex === 0) setPath([entry.name]);
     else if (levelIndex === 1) setPath([current.children?.[0]?.name || '', entry.name]);
     else setPath([...path]);
   };
 
   const onZoomOut = () => {
     if (path.length === 0) return;
     setPath(path.slice(0, path.length - 1));
   };
 
   const metaInfo = useMemo(() => aggregateMeta(levels[2] as any), [levels]);
 
   return (
     <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
       <div className="flex items-center justify-between mb-3">
         <h3 className="text-lg font-semibold text-slate-900">Project Insight Analytics (Sunburst)</h3>
         <button onClick={onZoomOut} className="px-3 py-1 text-sm rounded bg-slate-100 hover:bg-slate-200">Zoom Out</button>
       </div>
       <div className="w-full flex justify-center">
         <PieChart width={800} height={480}>
           <Pie data={levels[0]} dataKey="value" nameKey="name" innerRadius={100} outerRadius={160} onClick={(_, i) => onSliceClick(0, levels[0][i])}>
             {(levels[0] || []).map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
           </Pie>
           <Pie data={levels[1]} dataKey="value" nameKey="name" innerRadius={170} outerRadius={230} onClick={(_, i) => onSliceClick(1, levels[1][i])}>
             {(levels[1] || []).map((_, i) => <Cell key={i} fill={colors[(i + 3) % colors.length]} />)}
           </Pie>
           <Pie data={levels[2]} dataKey="value" nameKey="name" innerRadius={240} outerRadius={300} label={renderLabel}>
             {(levels[2] || []).map((_, i) => <Cell key={i} fill={colors[(i + 6) % colors.length]} />)}
           </Pie>
           <Tooltip formatter={(value: any, name: any, p: any) => {
             const n = (levels[2] || [])[p?.index || 0] as any;
             const start = n?.meta?.start ? new Date(n.meta.start).toLocaleString() : '-';
             const end = n?.meta?.end ? new Date(n.meta.end).toLocaleString() : '-';
             return [`${value} hrs`, `${name} | ${start} - ${end}`];
           }} />
         </PieChart>
       </div>
       <div className="mt-3 text-xs text-slate-600">
         เลื่อนหรือใช้เมาส์คลิกที่ส่วนเพื่อ Zoom In / Zoom Out และเอาเมาส์ไปชี้เพื่อดูเวลาเริ่ม-สิ้นสุด
       </div>
     </div>
   );
 }
