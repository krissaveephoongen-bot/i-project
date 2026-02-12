 'use client';

 import { useState } from 'react';

 export const dynamic = 'force-dynamic';

 export default function AdminPage() {
   const [log, setLog] = useState<string>('');
   const call = async (url: string) => {
     try {
       const res = await fetch(url, { method: 'POST', cache: 'no-store' });
       const json = await res.json();
       setLog(`${url}\n${JSON.stringify(json)}`);
     } catch (e: any) {
       setLog(`${url}\nerror: ${e?.message || String(e)}`);
     }
   };

   return (
     <div className="p-6 space-y-6">
       <h1 className="text-2xl font-semibold">Admin Tools</h1>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="p-4 rounded-lg border border-slate-200">
           <h2 className="font-medium mb-2">Schema</h2>
           <button
             className="px-3 py-2 bg-blue-600 text-white rounded"
             onClick={() => call('/api/migrations/schema-sync')}
           >
             Sync Schema
           </button>
         </div>
         <div className="p-4 rounded-lg border border-slate-200">
           <h2 className="font-medium mb-2">Seed Financial</h2>
           <button
             className="px-3 py-2 bg-blue-600 text-white rounded"
             onClick={() => call('/api/migrations/seed-financial')}
           >
             Seed Financial Data
           </button>
         </div>
         <div className="p-4 rounded-lg border border-slate-200">
           <h2 className="font-medium mb-2">Seed Project</h2>
           <button
             className="px-3 py-2 bg-blue-600 text-white rounded"
             onClick={() => call('/api/migrations/seed-project-flex')}
           >
             Seed Demo Project
           </button>
         </div>
       </div>
       <div className="p-4 rounded-lg border border-slate-200">
         <h2 className="font-medium mb-2">Log</h2>
         <pre className="text-xs whitespace-pre-wrap">{log}</pre>
       </div>
     </div>
   );
 }
