 'use client';
  
 import { useEffect, useState } from 'react';
 import { useSearchParams } from 'next/navigation';
 
 export const dynamic = 'force-dynamic';
  
 import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
  
 export default function HoursPage() {
   const sp = useSearchParams();
   const now = new Date();
   const startDefault = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0,10);
   const endDefault = new Date(now.getFullYear(), now.getMonth()+1, 0).toISOString().slice(0,10);
   const [data, setData] = useState<any[]>([]);
  const start = sp?.get('start') || startDefault;
  const end = sp?.get('end') || endDefault;
  const userId = sp?.get('userId') || undefined;
   
   useEffect(() => {
     const load = async () => {
       const u = new URL('/api/reports/hours/', window.location.origin);
       u.searchParams.set('start', start);
       u.searchParams.set('end', end);
       if (userId) u.searchParams.set('userId', userId);
       const res = await fetch(u, { cache: 'no-store' });
       const json = await res.json();
       setData(Array.isArray(json) ? json : []);
     };
     load();
   }, [start, end, userId]);
   
   return (
     <div className="min-h-screen">
       <div className="pt-20 px-6 pb-6">
         <h1 className="text-2xl font-semibold text-slate-900 mb-4">Hours per Project</h1>
         <ResponsiveContainer width="100%" height={420}>
           <BarChart data={data}>
             <CartesianGrid strokeDasharray="3 3" />
             <XAxis dataKey="project_name" />
             <YAxis />
             <Tooltip formatter={(v: any) => [`${v} hrs`, 'Hours']} />
             <Bar dataKey="total_hours" fill="#0ea5e9" />
           </BarChart>
         </ResponsiveContainer>
       </div>
     </div>
   );
 }
