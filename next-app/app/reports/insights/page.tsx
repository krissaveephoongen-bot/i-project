 import ReportsSunburst from '../../components/ReportsSunburst';
import { getSunburstData } from '@/app/lib/data-service';

export const dynamic = 'force-dynamic';

export default async function InsightsPage({ searchParams }: { searchParams?: Record<string, string> }) {
  const now = new Date();
  const year = Number(searchParams?.year || now.getFullYear());
  const month = Number(searchParams?.month || now.getMonth() + 1);
  const focus = (searchParams?.focus || 'project').toLowerCase();
  const mode = (searchParams?.mode || 'structure').toLowerCase();
  const { root } = await getSunburstData(year, month, focus, mode);

  return (
     <div className="min-h-screen">
       <div className="pt-20 px-6 pb-6">
         <div className="flex items-center gap-3 mb-4">
           <form className="flex items-center gap-2">
             <select name="year" defaultValue={year} className="border rounded px-3 py-2 text-sm">
               {Array.from({ length: 5 }).map((_, i) => {
                 const y = now.getFullYear() - i;
                 return <option key={y} value={y}>{y}</option>;
               })}
             </select>
             <select name="month" defaultValue={month} className="border rounded px-3 py-2 text-sm">
               {Array.from({ length: 12 }).map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
             </select>
             <select name="focus" defaultValue={focus} className="border rounded px-3 py-2 text-sm">
               <option value="project">โครงงาน</option>
               <option value="staff">พนักงาน</option>
             </select>
             <select name="mode" defaultValue={mode} className="border rounded px-3 py-2 text-sm">
               <option value="structure">โครงสร้างงาน</option>
               <option value="worktype">ประเภทงาน</option>
             </select>
             <button className="px-3 py-2 bg-blue-600 text-white rounded text-sm">Apply</button>
           </form>
         </div>
         <ReportsSunburst data={root} />
       </div>
     </div>
   );
 }
