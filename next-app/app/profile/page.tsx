 'use client';
  
 import { useEffect, useState } from 'react';
 import Header from '@/app/components/Header';
 import { useAuth } from '@/app/components/AuthProvider';
  
 export const dynamic = 'force-dynamic';
  
 export default function ProfilePage() {
   const { user } = useAuth() || {};
   const [loading, setLoading] = useState(true);
   const [profile, setProfile] = useState<any>(null);
   const [stats, setStats] = useState<any>(null);
   
   useEffect(() => {
     const load = async () => {
       try {
        const id = user?.id || '';
        const email = (user as any)?.email || '';
        const param = id ? `userId=${encodeURIComponent(id)}` : (email ? `email=${encodeURIComponent(email)}` : '');
        if (!param) return setLoading(false);
        const res = await fetch(`/api/users/profile?${param}`, { cache: 'no-store' });
         const json = await res.json();
         setProfile(json?.profile || null);
         setStats(json?.stats || null);
       } finally {
         setLoading(false);
       }
     };
     load();
  }, [user?.id, (user as any)?.email]);
   
   return (
     <div className="min-h-screen">
       <Header title="Profile Information" breadcrumbs={[{ label: 'Profile' }]} />
       <div className="pt-20 px-6 pb-6">
         {loading ? (
           <div className="text-sm text-slate-500">Loading...</div>
         ) : (
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
               <div className="flex items-center gap-4">
                 <img
                   src={profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'User')}&background=0284c7&color=fff`}
                   className="w-16 h-16 rounded-full"
                   alt="Avatar"
                 />
                 <div>
                   <div className="text-lg font-semibold text-slate-900">{profile?.name || '-'}</div>
                   <div className="text-sm text-slate-600">{profile?.name_th || ''}</div>
                   <div className="text-xs text-slate-500">{profile?.email || '-'}</div>
                 </div>
               </div>
               <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                 <div>
                   <div className="text-slate-500">Department</div>
                   <div className="text-slate-900">{profile?.department || '-'}</div>
                 </div>
                 <div>
                   <div className="text-slate-500">Position</div>
                   <div className="text-slate-900">{profile?.position || '-'}</div>
                 </div>
                 <div>
                   <div className="text-slate-500">Role</div>
                   <div className="text-slate-900">{profile?.role || '-'}</div>
                 </div>
                 <div>
                   <div className="text-slate-500">Employee Code</div>
                   <div className="text-slate-900">{profile?.employeeCode || '-'}</div>
                 </div>
                 <div>
                   <div className="text-slate-500">Phone</div>
                   <div className="text-slate-900">{profile?.phone || '-'}</div>
                 </div>
                 <div>
                   <div className="text-slate-500">Timezone</div>
                   <div className="text-slate-900">{profile?.timezone || '-'}</div>
                 </div>
               </div>
             </div>
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 lg:col-span-2">
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div className="p-4 border rounded-lg">
                   <div className="text-xs text-slate-500">Total Projects</div>
                   <div className="text-xl font-semibold text-slate-900">{stats?.totalProjects || 0}</div>
                 </div>
                 <div className="p-4 border rounded-lg">
                   <div className="text-xs text-slate-500">Active Projects</div>
                   <div className="text-xl font-semibold text-slate-900">{stats?.activeProjects || 0}</div>
                 </div>
                 <div className="p-4 border rounded-lg">
                   <div className="text-xs text-slate-500">Total Tasks</div>
                   <div className="text-xl font-semibold text-slate-900">{stats?.totalTasks || 0}</div>
                 </div>
                 <div className="p-4 border rounded-lg">
                   <div className="text-xs text-slate-500">Completed Tasks</div>
                   <div className="text-xl font-semibold text-slate-900">{stats?.completedTasks || 0}</div>
                 </div>
               </div>
               <div className="mt-6 grid grid-cols-2 gap-4">
                 <div className="p-4 border rounded-lg">
                   <div className="text-xs text-slate-500">Total Hours</div>
                   <div className="text-xl font-semibold text-slate-900">{stats?.totalHours || 0}</div>
                 </div>
                 <div className="p-4 border rounded-lg">
                   <div className="text-xs text-slate-500">Total Earnings</div>
                   <div className="text-xl font-semibold text-slate-900">฿{Number(stats?.totalEarnings || 0).toLocaleString()}</div>
                 </div>
               </div>
             </div>
           </div>
         )}
       </div>
     </div>
   );
 }
